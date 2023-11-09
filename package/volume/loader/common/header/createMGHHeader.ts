import type { VolumeDescriptionType, VolumeViewerView } from 'ngBrain/volume/types'
import { VolumeViewerVolumeFormat } from 'ngBrain/volume/types'
import { transformToMinc } from 'ngBrain/volume/loader/common/header/transformToMinc'
import { swapn } from 'ngBrain/volume/loader/common/header/swapn'
import { scanDataRange } from 'ngBrain/volume/loader/common/header/scanDatRange'

const firstControlHeader = (header: any, raw_data: ArrayBuffer) => {
  let native_data = null
  let bytes_per_voxel = 1

  switch (header.datatype) {
    case 0: // Unsigned characters.
      bytes_per_voxel = 1
      break
    case 1: // 4-byte signed integers.
    case 3: // 4-byte float.
      bytes_per_voxel = 4
      break
    case 4: // 2-byte signed integers.
      bytes_per_voxel = 2
      break
    default:
      // eslint-disable-next-line no-case-declarations
      const error_message = 'Unsupported data type: ' + header.datatype
      throw new Error(error_message)
  }

  const nbytes = header.nvoxels * bytes_per_voxel

  if (bytes_per_voxel > 1 && !header.little_endian) {
    swapn(new Uint8Array(raw_data, 284, nbytes), bytes_per_voxel)
  }

  switch (header.datatype) {
    case 0: // unsigned char
      native_data = new Uint8Array(raw_data, 284, header.nvoxels)
      break
    case 1: // signed int
      native_data = new Int32Array(raw_data, 284, header.nvoxels)
      break
    case 3:
      native_data = new Float32Array(raw_data, 284, header.nvoxels)
      break
    case 4: // signed short
      native_data = new Int16Array(raw_data, 284, header.nvoxels)
      break
  }

  const { voxel_max, voxel_min } = scanDataRange(native_data!)
  header.voxel_min = voxel_min
  header.voxel_max = voxel_max

  // Incrementation offsets for each dimension of the volume. MGH
  // files store the fastest-letying dimension _first_, so the
  // "first" dimension actually has the smallest offset. That is
  // why this calculation is different from that for NIfTI-1.
  //
  let d
  let offset = 1
  for (d = 0; d < header.order.length; d++) {
    header[header.order[d]].offset = offset
    offset *= header[header.order[d]].space_length
  }

  return { header, native_data }
}

const secondControlHeader = (header: any) => {
  header.xspace.name = 'xspace'
  header.yspace.name = 'yspace'
  header.zspace.name = 'zspace'

  header.xspace.width_space = header.yspace
  header.xspace.width = header.yspace.space_length
  header.xspace.height_space = header.zspace
  header.xspace.height = header.zspace.space_length

  header.yspace.width_space = header.xspace
  header.yspace.width = header.xspace.space_length
  header.yspace.height_space = header.zspace
  header.yspace.height = header.zspace.space_length

  header.zspace.width_space = header.xspace
  header.zspace.width = header.xspace.space_length
  header.zspace.height_space = header.yspace
  header.zspace.height = header.yspace.space_length

  if (header.voxel_min === undefined) header.voxel_min = 0
  if (header.voxel_max === undefined) header.voxel_max = 255

  return header
}

const threeControlHeader = (header: any) => {
  const startx = header.xspace.start
  const starty = header.yspace.start
  const startz = header.zspace.start
  const cx = header.xspace.direction_cosines
  const cy = header.yspace.direction_cosines
  const cz = header.zspace.direction_cosines
  const stepx = header.xspace.step
  const stepy = header.yspace.step
  const stepz = header.zspace.step
  header.voxel_origin = {
    x: startx * cx[0] + starty * cy[0] + startz * cz[0],
    y: startx * cx[1] + starty * cy[1] + startz * cz[1],
    z: startx * cx[2] + starty * cy[2] + startz * cz[2],
  }
  const o = header.voxel_origin
  const tx = (-o.x * cx[0] - o.y * cx[1] - o.z * cx[2]) / stepx
  const ty = (-o.x * cy[0] - o.y * cy[1] - o.z * cy[2]) / stepy
  const tz = (-o.x * cz[0] - o.y * cz[1] - o.z * cz[2]) / stepz

  header.w2v = [
    [cx[0] / stepx, cx[1] / stepx, cx[2] / stepx, tx],
    [cy[0] / stepy, cy[1] / stepy, cy[2] / stepy, ty],
    [cz[0] / stepz, cz[1] / stepz, cz[2] / stepz, tz],
  ]

  return header
}

export const createMGHHeader = (raw_data: ArrayBuffer, display_zindex: number, description: VolumeDescriptionType) => {
  const header = createBaseHeader(raw_data, display_zindex, description)
  const { header: firstHeader, native_data } = firstControlHeader(header, raw_data)
  const secondHeader = secondControlHeader(firstHeader)
  const threeHeader = threeControlHeader(secondHeader)
  return { header: threeHeader, native_data }
}
export const createBaseHeader = (raw_data: ArrayBuffer, display_zindex: number, description: VolumeDescriptionType) => {
  const header = {
    datatype: 0,
    little_endian: false,
    nvoxels: 0,
    display_zindex,
    order: ['xspace', 'yspace', 'zspace'] as VolumeViewerView[],
    voxel_min: 0,
    voxel_max: 255,
    voxel_origin: { x: 0, y: 0, z: 0 },
    w2v: [],
    xspace: {
      space_length: 1,
      offset: 1,
      width: 256,
      height: 256,
    },
    yspace: {
      space_length: 1,
      offset: 1,
      width: 256,
      height: 256,
    },
    zspace: {
      space_length: 1,
      offset: 1,
      width: 256,
      height: 256,
    },
  }

  let error_message
  const dview = new DataView(raw_data, 0, 284)
  let little_endian = true

  /* Read the header version, which should always have the value
   * 0x00000001. We use this to test the endian-ness of the data,
   * but it should always be big-endian.
   */
  const hdr_version = dview.getUint32(0, true)
  if (hdr_version === 0x00000001) {
    little_endian = true
  } else if (hdr_version === 0x01000000) {
    little_endian = false // Generally files are big-endian.
  } else {
    error_message = 'This does not look like an MGH file.'
  }

  /* Now read the dimension lengths. There are at most 4 dimensions
   * in the file. The lengths fields are always present, but they
   * unused dimensions may have the value 0 or 1.
   */
  const sizes = [0, 0, 0, 0]
  let header_offset = 4
  let nvoxels = 1
  let ndims = 0
  for (; ndims < 4; ndims++) {
    sizes[ndims] = dview.getUint32(header_offset, little_endian)
    if (sizes[ndims] <= 1) {
      break
    }
    nvoxels *= sizes[ndims]
    header_offset += 4
  }

  if (ndims < 3 || ndims > 4) {
    error_message = 'ndims error'
  }

  // IGNORED let dof = dview.getUint32(24, little_endian);
  const good_transform_flag = dview.getUint16(28, little_endian)
  const spacing = [1.0, 1.0, 1.0]
  let i, j
  const dircos = [
    [-1.0, 0.0, 0.0],
    [0.0, 0.0, -1.0],
    [0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0],
  ]
  if (good_transform_flag) {
    header_offset = 30
    for (i = 0; i < 3; i++) {
      spacing[i] = dview.getFloat32(header_offset, little_endian)
      header_offset += 4
    }
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 3; j++) {
        dircos[i][j] = dview.getFloat32(header_offset, little_endian)
        header_offset += 4
      }
    }
  }
  const axis_index_from_file = [0, 1, 2]

  for (let axis = 0; axis < 3; axis++) {
    let spatial_axis = 0
    const c_x = Math.abs(dircos[axis][0])
    const c_y = Math.abs(dircos[axis][1])
    const c_z = Math.abs(dircos[axis][2])

    header.order[axis] = 'xspace'
    if (c_y > c_x && c_y > c_z) {
      spatial_axis = 1
      header.order[axis] = 'yspace'
    }
    if (c_z > c_x && c_z > c_y) {
      spatial_axis = 2
      header.order[axis] = 'zspace'
    }
    axis_index_from_file[axis] = spatial_axis
  }

  const ignore_offsets = false
  const mgh_xform = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  for (i = 0; i < 3; i++) {
    for (j = 0; j < 3; j++) {
      mgh_xform[i][j] = dircos[j][i] * spacing[i]
    }
  }

  for (i = 0; i < 3; i++) {
    let temp = 0.0
    for (j = 0; j < 3; j++) {
      temp += mgh_xform[i][j] * (sizes[j] / 2.0)
    }

    if (ignore_offsets) {
      mgh_xform[i][4 - 1] = -temp
    } else {
      mgh_xform[i][4 - 1] = dircos[4 - 1][i] - temp
    }
  }

  const transform = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]

  for (i = 0; i < 3; i++) {
    for (j = 0; j < 4; j++) {
      let volume_axis = j
      if (j < 3) {
        volume_axis = axis_index_from_file[j]
      }
      transform[i][volume_axis] = mgh_xform[i][j]
    }
  }
  // Save the datatype so that we can refer to it later.
  header.little_endian = little_endian
  header.nvoxels = nvoxels

  // Now that we have the transform, need to convert it to MINC-like
  // steps and direction_cosines.

  let { xspace: newXSpace, yspace: newYSpace, zspace: newZSpace } = transformToMinc(transform)
  newXSpace = Object.assign({}, newXSpace, {
    space_length: sizes[0],
    width: sizes[1],
    height: sizes[2],
    name: 'xspace',
  })
  newYSpace = Object.assign({}, newYSpace, {
    space_length: sizes[1],
    width: sizes[0],
    height: sizes[2],
    name: 'yspace',
  })
  newZSpace = Object.assign({}, newZSpace, {
    space_length: sizes[2],
    width: sizes[0],
    height: sizes[1],
    name: 'zspace',
  })
  // @ts-ignore
  header.xspace = Object.assign({}, newXSpace, {
    width_space: newYSpace,
    height_space: newZSpace,
  })
  // @ts-ignore
  header.yspace = Object.assign({}, newYSpace, {
    width_space: newXSpace,
    height_space: newZSpace,
  })
  // @ts-ignore
  header.zspace = Object.assign({}, newZSpace, {
    width_space: newXSpace,
    height_space: newYSpace,
  })

  return header
}
