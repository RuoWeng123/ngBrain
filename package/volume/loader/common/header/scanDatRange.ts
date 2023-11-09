export const scanDataRange = function (
  native_data: Uint8Array | Int16Array | Int32Array | Float32Array | Float64Array | Int8Array | Uint16Array | Uint32Array
) {
  let d = 0
  let n_min = +Infinity
  let n_max = -Infinity

  for (d = 0; d < native_data.length; d++) {
    const value = native_data[d]
    if (value > n_max) n_max = value
    if (value < n_min) n_min = value
  }
  return {
    voxel_min: n_min,
    voxel_max: n_max,
  }
}
