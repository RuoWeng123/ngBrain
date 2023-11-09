import type { VolumeDescriptionType } from 'ngBrain/volume/types'
import { transformToMinc } from 'ngBrain/volume/loader/common/header/transformToMinc'
import { swapn } from 'ngBrain/volume/loader/common/header/swapn'
import { scanDataRange } from 'ngBrain/volume/loader/common/header/scanDatRange'

const firstControlHeader = (header: any, raw_data: ArrayBuffer) => {
  let native_data = null

  if (header.must_swap_data) {
    swapn(new Uint8Array(raw_data, header.vox_offset), header.bytes_per_voxel)
  }

  switch (header.datatype) {
    case 2: // DT_UNSIGNED_CHAR
      // no translation necessary; could optimize this out.
      native_data = new Uint8Array(raw_data, header.vox_offset)
      break
    case 4: // DT_SIGNED_SHORT
      native_data = new Int16Array(raw_data, header.vox_offset)
      break
    case 8: // DT_SIGNED_INT
      native_data = new Int32Array(raw_data, header.vox_offset)
      break
    case 16: // DT_FLOAT
      native_data = new Float32Array(raw_data, header.vox_offset)
      break
    case 64: // DT_DOUBLE
      native_data = new Float64Array(raw_data, header.vox_offset)
      break
    // Values above 256 are NIfTI-specific, and rarely used.
    case 256: // DT_INT8
      native_data = new Int8Array(raw_data, header.vox_offset)
      break
    case 512: // DT_UINT16
      native_data = new Uint16Array(raw_data, header.vox_offset)
      break
    case 768: // DT_UINT32
      native_data = new Uint32Array(raw_data, header.vox_offset)
      break
    default:
      // We don't yet support 64-bit, complex, RGB, and float 128 types.
      // eslint-disable-next-line no-case-declarations
      const error_message = 'Unsupported data type: ' + header.datatype
      throw new Error(error_message)
  }

  let d = 0
  const slope = header.scl_slope
  const inter = header.scl_inter

  if (slope !== 0) {
    const float_data = new Float32Array(native_data.length)

    for (d = 0; d < native_data.length; d++) {
      float_data[d] = native_data[d] * slope + inter
    }
    native_data = float_data // Return the new float buffer.
  }

  const { voxel_max, voxel_min } = scanDataRange(native_data)
  header.voxel_min = voxel_min
  header.voxel_max = voxel_max

  if (header.order.length === 4) {
    header.order = header.order.slice(1)
  }

  // Incrementation offsets for each dimension of the volume.
  header[header.order[0]].offset = header[header.order[1]].space_length * header[header.order[2]].space_length
  header[header.order[1]].offset = header[header.order[2]].space_length
  header[header.order[2]].offset = 1

  return {
    header,
    native_data,
  }
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
  const startx = header.xspace.start;
  const starty = header.yspace.start;
  const startz = header.zspace.start;
  const cx = header.xspace.direction_cosines;
  const cy = header.yspace.direction_cosines;
  const cz = header.zspace.direction_cosines;
  const stepx = header.xspace.step;
  const stepy = header.yspace.step;
  const stepz = header.zspace.step;
  header.voxel_origin = {
    x: startx * cx[0] + starty * cy[0] + startz * cz[0],
    y: startx * cx[1] + starty * cy[1] + startz * cz[1],
    z: startx * cx[2] + starty * cy[2] + startz * cz[2]
  };
  const o = header.voxel_origin;

  const tx = (-o.x * cx[0] - o.y * cx[1] - o.z * cx[2]) / stepx;
  const ty = (-o.x * cy[0] - o.y * cy[1] - o.z * cy[2]) / stepy;
  const tz = (-o.x * cz[0] - o.y * cz[1] - o.z * cz[2]) / stepz;

  header.w2v = [
    [cx[0] / stepx, cx[1] / stepx, cx[2] / stepx, tx],
    [cy[0] / stepy, cy[1] / stepy, cy[2] / stepy, ty],
    [cz[0] / stepz, cz[1] / stepz, cz[2] / stepz, tz]
  ];

  return header
}

export const createNifiHeader = (raw_data: ArrayBuffer, display_zindex: number, description: VolumeDescriptionType) => {
  const header = createHeader(raw_data, display_zindex, description)
  const { header: firstHeader, native_data } = firstControlHeader(header, raw_data)
  const secondHeader = secondControlHeader(firstHeader)
  const threeHeader = threeControlHeader(secondHeader)

  return { header: threeHeader, native_data }
}
const createHeader = (raw_data: ArrayBuffer, display_zindex: number, description: VolumeDescriptionType) => {
  let header = {
    order: [],
    xspace: {},
    yspace: {},
    zspace: {},
    bytes_per_voxel: 0,
    must_swap_data: false,
  }
  let error_message
  const dview = new DataView(raw_data, 0, 348)
  const bytes = new Uint8Array(raw_data, 0, 348)
  let littleEndian = true

  const sizeof_hdr = dview.getUint32(0, true)
  if (sizeof_hdr === 0x0000015c) {
    littleEndian = true
  } else if (sizeof_hdr === 0x5c010000) {
    littleEndian = false
  } else {
    error_message = 'This does not look like a NIfTI-1 file.'
  }

  const ndims = dview.getUint16(40, littleEndian)
  if (ndims < 3 || ndims > 4) {
    error_message = 'Cannot handle ' + ndims + '-dimensional images yet.'
  }

  // @ts-ignore
  const magic = String.fromCharCode.apply(null, bytes.subarray(344, 348))
  if (magic !== 'n+1\0') {
    error_message = "Bad magic number: '" + magic + "'"
  }

  if (error_message !== undefined) {
    throw new Error(error_message)
  }

  const tlength = dview.getUint16(48, littleEndian)

  const datatype = dview.getUint16(70, littleEndian)
  const bitpix = dview.getUint16(72, littleEndian)

  const xstep = dview.getFloat32(80, littleEndian)
  const ystep = dview.getFloat32(84, littleEndian)
  const zstep = dview.getFloat32(88, littleEndian)
  const tstep = dview.getFloat32(92, littleEndian)

  let vox_offset = dview.getFloat32(108, littleEndian)
  if (vox_offset < 352) {
    vox_offset = 352
  }

  const scl_slope = dview.getFloat32(112, littleEndian)
  const scl_inter = dview.getFloat32(116, littleEndian)

  const qform_code = dview.getUint16(252, littleEndian)
  const sform_code = dview.getUint16(254, littleEndian)

  let nifti_xfm = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
  /* Record the number of bytes per voxel, and note whether we need
   * to swap bytes in the voxel data.
   */
  header.bytes_per_voxel = bitpix / 8
  header.must_swap_data = !littleEndian && bitpix / 8 > 1

  if (sform_code > 0) {
    /* The "Sform", if present, defines an affine transform which is
     * generally assumed to correspond to some standard coordinate
     * space (e.g. Talairach).
     */
    nifti_xfm[0][0] = dview.getFloat32(280, littleEndian)
    nifti_xfm[0][1] = dview.getFloat32(284, littleEndian)
    nifti_xfm[0][2] = dview.getFloat32(288, littleEndian)
    nifti_xfm[0][3] = dview.getFloat32(292, littleEndian)
    nifti_xfm[1][0] = dview.getFloat32(296, littleEndian)
    nifti_xfm[1][1] = dview.getFloat32(300, littleEndian)
    nifti_xfm[1][2] = dview.getFloat32(304, littleEndian)
    nifti_xfm[1][3] = dview.getFloat32(308, littleEndian)
    nifti_xfm[2][0] = dview.getFloat32(312, littleEndian)
    nifti_xfm[2][1] = dview.getFloat32(316, littleEndian)
    nifti_xfm[2][2] = dview.getFloat32(320, littleEndian)
    nifti_xfm[2][3] = dview.getFloat32(324, littleEndian)
  } else if (qform_code > 0) {
    /* The "Qform", if present, defines a quaternion which specifies
     * a less general transformation, often to scanner space.
     */
    const quatern_b = dview.getFloat32(256, littleEndian)
    const quatern_c = dview.getFloat32(260, littleEndian)
    const quatern_d = dview.getFloat32(264, littleEndian)
    const qoffset_x = dview.getFloat32(268, littleEndian)
    const qoffset_y = dview.getFloat32(272, littleEndian)
    const qoffset_z = dview.getFloat32(276, littleEndian)
    const qfac = dview.getFloat32(76, littleEndian) < 0 ? -1.0 : 1.0

    nifti_xfm = niftiQuaternToMat44(quatern_b, quatern_c, quatern_d, qoffset_x, qoffset_y, qoffset_z, xstep, ystep, zstep, qfac)
  } else {
    nifti_xfm[0][0] = xstep
    nifti_xfm[1][1] = ystep
    nifti_xfm[2][2] = zstep
  }

  let i, j
  const axis_index_from_file = [0, 1, 2]
  const transform = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1],
  ]

  for (i = 0; i < 3; i++) {
    const c_x = Math.abs(nifti_xfm[0][i])
    const c_y = Math.abs(nifti_xfm[1][i])
    const c_z = Math.abs(nifti_xfm[2][i])

    if (c_x > c_y && c_x > c_z) {
      // @ts-ignore
      header.order[2 - i] = 'xspace'
      axis_index_from_file[i] = 0
    } else if (c_y > c_x && c_y > c_z) {
      // @ts-ignore
      header.order[2 - i] = 'yspace'
      axis_index_from_file[i] = 1
    } else {
      // @ts-ignore
      header.order[2 - i] = 'zspace'
      axis_index_from_file[i] = 2
    }
  }

  for (i = 0; i < 3; i++) {
    for (j = 0; j < 4; j++) {
      let volume_axis = j
      if (j < 3) {
        volume_axis = axis_index_from_file[j]
      }
      transform[i][volume_axis] = nifti_xfm[i][j]
    }
  }

  const { xspace, yspace, zspace } = transformToMinc(transform)
  header.xspace = Object.assign({}, header.xspace,  xspace )
  header.yspace = Object.assign({}, header.yspace,  yspace )
  header.zspace = Object.assign({}, header.zspace,  zspace )

  // @ts-ignore
  header[header.order[2]].space_length = dview.getUint16(42, littleEndian)
  // @ts-ignore
  header[header.order[1]].space_length = dview.getUint16(44, littleEndian)
  // @ts-ignore
  header[header.order[0]].space_length = dview.getUint16(46, littleEndian)

  header = Object.assign({}, header, { datatype, vox_offset, scl_slope, scl_inter })

  return header
}

function niftiQuaternToMat44(
  qb: number,
  qc: number,
  qd: number,
  qx: number,
  qy: number,
  qz: number,
  dx: number,
  dy: number,
  dz: number,
  qfac: number
) {
  const m = [
    // 4x4 transform
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1],
  ]
  let b = qb
  let c = qc
  let d = qd

  // compute a parameter from b,c,d

  let a = 1.0 - (b * b + c * c + d * d)
  if (a < 1e-7) {
    // special case
    a = 1.0 / Math.sqrt(b * b + c * c + d * d)
    b *= a // normalize (b,c,d) vector
    c *= a
    d *= a
    a = 0.0 // a = 0 ==> 180 degree rotation
  } else {
    a = Math.sqrt(a) // angle = 2*arccos(a)
  }

  // load rotation matrix, including scaling factors for voxel sizes

  const xd = dx > 0.0 ? dx : 1.0 // make sure are positive
  const yd = dy > 0.0 ? dy : 1.0
  let zd = dz > 0.0 ? dz : 1.0

  if (qfac < 0.0)
    // left handedness?
    zd = -zd

  m[0][0] = (a * a + b * b - c * c - d * d) * xd
  m[0][1] = 2.0 * (b * c - a * d) * yd
  m[0][2] = 2.0 * (b * d + a * c) * zd
  m[1][0] = 2.0 * (b * c + a * d) * xd
  m[1][1] = (a * a + c * c - b * b - d * d) * yd
  m[1][2] = 2.0 * (c * d - a * b) * zd
  m[2][0] = 2.0 * (b * d - a * c) * xd
  m[2][1] = 2.0 * (c * d + a * b) * yd
  m[2][2] = (a * a + d * d - c * c - b * b) * zd

  // load offsets

  m[0][3] = qx
  m[1][3] = qy
  m[2][3] = qz

  return m
}
