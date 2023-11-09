import axios from 'axios'
// @ts-ignore
import pako from 'pako'
import { VolumeViewerVolumeFormat } from 'ngBrain/volume/types'

export const prepareData = async (url: string, type: VolumeViewerVolumeFormat) => {
  const res = await axios.get(url, { responseType: 'arraybuffer' })
  if (type === VolumeViewerVolumeFormat.mgh) {
    const unzipped = new pako.inflate(res.data)
    const result = unzipped.buffer
    return {
      fromNative: false,
      data: result,
    }
  } else {
    return {
      fromNative: false,
      data: res.data,
    }
  }
}
