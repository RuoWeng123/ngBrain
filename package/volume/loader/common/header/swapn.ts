export const swapn = function (byte_data: Uint8Array, n_per_item: number) {
  for (let d = 0; d < byte_data.length; d += n_per_item) {
    let hi_offset = n_per_item - 1
    let lo_offset = 0
    while (hi_offset > lo_offset) {
      const tmp = byte_data[d + hi_offset]
      byte_data[d + hi_offset] = byte_data[d + lo_offset]
      byte_data[d + lo_offset] = tmp
      hi_offset--
      lo_offset++
    }
  }
}
