import { pako } from 'pako'
import axios from 'axios'

export const loader = {
  cacheSurfaceXHRs: [],
  loadFromURL: function (url, callback, options) {
    options = options || {}
    const result_type = options.result_type
    const content_type = options.content_type
    const parts = url.split('/')
    const parts2 = parts[parts.length - 1].split('?')
    const filename = parts2[0]

    try {
      let responseType = 'json'
      if (result_type === 'arraybuffer') {
        responseType = 'arraybuffer'
      }
      let result = axios.get(url, { responseType })
      var unzipped = pako.inflate(result)
      result = unzipped.buffer
      if (content_type === 'text') {
        var dv = new DataView(result)
        var decoder = new TextDecoder()
        result = decoder.decode(dv)
      }

      return {
        result,
        filename,
        options,
      }
    } catch (e) {
      var error_message = 'error loading URL: ' + url + '\n'

      // todo events 抛出事件
      // events.triggerEvent("error", { message: error_message });
      throw new Error(error_message)
    }
  },
}
