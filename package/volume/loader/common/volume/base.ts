import type { headerType, SliceType, VolumeViewerView } from 'ngBrain/volume/types'

export const createBaseVolume = function (header: headerType, native_data: any) {
  const image_creation_canvas = document.createElement('canvas')

  const volume = {
    type: 'mgh',
    color_map: undefined,
    position: {
      xspace: 0,
      yspace: 0,
      zspace: 0,
    },
    current_time: 0,
    data: native_data,
    header: header,
    intensity_min: 0,
    intensity_max: 255,
    setVoxelCoords: (i: number, j: number, k: number) => {
      const ispace = header.order[0]
      const jspace = header.order[1]
      const kspace = header.order[2]

      volume.position[ispace] = header[ispace].step > 0 ? i : header[ispace].space_length - i
      volume.position[jspace] = header[jspace].step > 0 ? j : header[jspace].space_length - j
      volume.position[kspace] = header[kspace].step > 0 ? k : header[kspace].space_length - k
    },
    getVoxelCoords: () => {
      const position1 = {
        xspace: header.xspace.step > 0 ? volume.position.xspace : header.xspace.space_length - volume.position.xspace,
        yspace: header.yspace.step > 0 ? volume.position.yspace : header.yspace.space_length - volume.position.yspace,
        zspace: header.zspace.step > 0 ? volume.position.zspace : header.zspace.space_length - volume.position.zspace,
      }

      return {
        i: position1[header.order[0]],
        j: position1[header.order[1]],
        k: position1[header.order[2]],
      }
    },
    slice: (axis: VolumeViewerView, slice_num?: number, time?: number) => {
      slice_num = slice_num === undefined ? volume.position[axis] : slice_num

      if (header.order === undefined) {
        return null
      }
      const axis_space = header[axis]
      const width_space = axis_space.width_space
      const height_space = axis_space.height_space

      const width = axis_space.width
      const height = axis_space.height

      const axis_space_offset = axis_space.offset
      const width_space_offset = width_space.offset
      const height_space_offset = height_space.offset

      // Calling the volume data's constructor guarantees that the
      // slice data buffer has the same type as the volume.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice
      const slice_data = native_data.slice(0, width * height)

      // Indexes into the volume, relative to the slice.
      // NOT xspace, yspace, zspace coordinates!!!
      let x, y

      // Linear offsets into volume considering an
      // increasing number of axes: (t) time,
      // (z) z-axis, (y) y-axis, (x) x-axis.
      let tz_offset, tzy_offset, tzyx_offset

      // Whether the dimension steps positively or negatively.
      const x_positive = width_space.step > 0
      const y_positive = height_space.step > 0
      const z_positive = axis_space.step > 0

      // iterator for the result slice.
      let i = 0
      // const z = z_positive ? slice_num : axis_space.space_length - slice_num - 1
      const z = slice_num - 1
      if (z >= 0 && z < axis_space.space_length) {
        tz_offset = z * axis_space_offset

        for (let row = height - 1; row >= 0; row--) {
          y = y_positive ? row : height - row - 1
          tzy_offset = tz_offset + y * height_space_offset

          for (let col = 0; col < width; col++) {
            x = x_positive ? col : width - col - 1
            tzyx_offset = tzy_offset + x * width_space_offset

            slice_data[i++] = volume.data[tzyx_offset]
          }
        }
      }

      const slice = {
        axis: axis,
        data: slice_data,
        width_space: width_space,
        height_space: height_space,
        width: width,
        height: height,
      }

      return slice
    },
    getSliceImage: (slice: SliceType, zoom: number, contrast: any, brightness: number, clamp = false) => {
      zoom = zoom || 1

      const image_creation_context = image_creation_canvas.getContext('2d')
      const color_map = volume.color_map
      let error_message

      if (!color_map) {
        error_message = 'No color map set for this volume. Cannot render slice.'
        throw new Error(error_message)
      }

      const xstep = slice.width_space.step
      const ystep = slice.height_space.step
      const target_width = Math.abs(Math.floor(slice.width * xstep * zoom))
      const target_height = Math.abs(Math.floor(slice.height * ystep * zoom))
      const source_image = image_creation_context!.createImageData(slice.width, slice.height)
      const target_image = image_creation_context!.createImageData(target_width, target_height)

      // @ts-ignore
      color_map.mapColors(slice.data, {
        min: volume.intensity_min,
        max: volume.intensity_max,
        clamp: clamp,
        contrast: contrast,
        brightness: brightness,
        destination: source_image.data,
      })

      target_image.data.set(
        nearestNeighbor(
          source_image.data,
          source_image.width,
          source_image.height,
          target_width,
          target_height,
          { block_size: 4, }
        )
      )


      if (image_creation_context) {
        image_creation_context.clearRect(0, 0, image_creation_canvas.width, image_creation_canvas.height)
        image_creation_canvas.width = 0
        image_creation_canvas.height = 0
      }

      return target_image
    },
    getIntensityValue: function (i: number, j: number, k: number, time?: number) {
      const vc = volume.getVoxelCoords()
      i = i === undefined ? vc.i : i
      j = j === undefined ? vc.j : j
      k = k === undefined ? vc.k : k

      if (
        i < 0 ||
        i >= header[header.order[0]].space_length ||
        j < 0 ||
        j >= header[header.order[1]].space_length ||
        k < 0 ||
        k >= header[header.order[2]].space_length
      ) {
        return 0
      }
      const time_offset = 0
      const xyzt_offset =
        i * header[header.order[0]].offset + j * header[header.order[1]].offset + k * header[header.order[2]].offset + time_offset
      return volume.data[xyzt_offset]
    },
    getWorldCoords: function () {
      const voxel = volume.getVoxelCoords()

      return volume.voxelToWorld(voxel.i, voxel.j, voxel.k)
    },

    setWorldCoords: function (x: number, y: number, z: number) {
      const voxel = volume.worldToVoxel(x, y, z)

      volume.setVoxelCoords(voxel.i, voxel.j, voxel.k)
    },

    // Voxel to world matrix applied here is:
    // cxx * stepx | cyx * stepy | czx * stepz | ox
    // cxy * stepx | cyy * stepy | czy * stepz | oy
    // cxz * stepx | cyz * stepy | czz * stepz | oz
    // 0           | 0           | 0           | 1
    //
    // Taken from (http://www.bic.mni.mcgill.ca/software/minc/minc2_format/node4.html)
    voxelToWorld: function (i: number, j: number, k: number, stepRotio = 1) {
      const ordered = {
        xspace: i,
        yspace: j,
        zspace: k,
      }
      const header = volume.header

      const x = ordered.xspace
      const y = ordered.yspace
      const z = ordered.zspace

      const cx = header.xspace.direction_cosines
      const cy = header.yspace.direction_cosines
      const cz = header.zspace.direction_cosines
      const stepx = header.xspace.step * stepRotio
      const stepy = header.yspace.step * stepRotio
      const stepz = header.zspace.step * stepRotio
      const o = header.voxel_origin

      return {
        x: x * cx[0] * stepx + y * cy[0] * stepy + z * cz[0] * stepz + o.x,
        y: x * cx[1] * stepx + y * cy[1] * stepy + z * cz[1] * stepz + o.y,
        z: x * cx[2] * stepx + y * cy[2] * stepy + z * cz[2] * stepz + o.z,
      }
    },

    // Inverse of the voxel to world matrix.
    worldToVoxel: function (x: number, y: number, z: number) {
      const xfm = header.w2v // Get the world-to-voxel transform.
      if (!xfm) return { i: 0, j: 0, k: 0 }
      const result = {
        vx: x * xfm[0][0] + y * xfm[0][1] + z * xfm[0][2] + xfm[0][3],
        vy: x * xfm[1][0] + y * xfm[1][1] + z * xfm[1][2] + xfm[1][3],
        vz: x * xfm[2][0] + y * xfm[2][1] + z * xfm[2][2] + xfm[2][3],
      }

      const ordered = {
        xspace: Math.round(result.vx),
        yspace: Math.round(result.vy),
        zspace: Math.round(result.vz),
      }

      return {
        i: ordered.xspace,
        j: ordered.yspace,
        k: ordered.zspace,
      }
    },
    getVoxelMin: function () {
      return volume.header.voxel_min
    },
    getVoxelMax: function () {
      return volume.header.voxel_max
    },
    /* given a width and height (from the panel), this function returns the "best"
     * single zoom level that will guarantee that the image fits exactly into the
     * current panel.
     */
    getPreferredZoom: function (width: number, height: number) {
      const header = volume.header
      const x_fov = header.xspace.space_length * Math.abs(header.xspace.step)
      const y_fov = header.yspace.space_length * Math.abs(header.yspace.step)
      const z_fov = header.zspace.space_length * Math.abs(header.xspace.step)
      const xw = width / x_fov
      const yw = width / y_fov
      const yh = height / y_fov
      const zh = height / z_fov
      return Math.min(yw, xw, zh, yh)
    },
  }

  return volume
}

const nearestNeighbor = function (source: any, width: number, height: number, target_width: number, target_height: number, options: any) {
  options = options || {}

  const block_size = options.block_size || 1
  const ArrayType = options.array_type || Uint8ClampedArray

  let source_y_offset, source_block_offset
  let target_x, target_y
  let target_y_offset, target_block_offset

  //Do nothing if size is the same
  if (width === target_width && height === target_height) {
    return source
  }

  const target = new ArrayType(target_width * target_height * block_size)
  const x_ratio = width / target_width
  const y_ratio = height / target_height
  for (target_y = 0; target_y < target_height; target_y++) {
    source_y_offset = Math.floor(target_y * y_ratio) * width
    target_y_offset = target_y * target_width

    for (target_x = 0; target_x < target_width; target_x++) {
      source_block_offset = (source_y_offset + Math.floor(target_x * x_ratio)) * block_size
      target_block_offset = (target_y_offset + target_x) * block_size

      for (let k = 0; k < block_size; k++) {
        target[target_block_offset + k] = source[source_block_offset + k]
      }
    }
  }

  return target
}
