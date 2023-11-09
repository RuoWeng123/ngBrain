import type { headerType, VolumeDescriptionType } from 'ngBrain/volume/types'
import { getCachedDataOfNative, setCachedDataOfNativee } from 'ngBrain/volume/utils/nativeIndexDb'
import { VolumeViewerVolumeFormat } from 'ngBrain/volume/types'
import { createBaseVolume } from 'ngBrain/volume/loader/common/volume/base'
import { swapn } from 'ngBrain/volume/loader/common/header/swapn'
export const createMghData = function (header: headerType, raw_data: ArrayBuffer) {
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
  return native_data
}

export const createMGHVolume = async function (header: headerType, raw_data: ArrayBuffer | undefined, description: VolumeDescriptionType) {
  const volume = createBaseVolume(header, raw_data)
  volume.type = 'mgh'
  volume.intensity_min = header.voxel_min
  volume.intensity_max = header.voxel_max

  return volume
}
