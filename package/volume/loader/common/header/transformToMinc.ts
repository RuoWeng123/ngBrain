export const transformToMinc = (transform: number[][]) => {
  const x_dir_cosines = []
  const y_dir_cosines = []
  const z_dir_cosines = []

  // A tiny helper function to calculate the magnitude of the rotational
  // part of the transform.
  //
  function magnitude(v: number[]) {
    let dotprod = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]
    if (dotprod <= 0) {
      dotprod = 1.0
    }
    return Math.sqrt(dotprod)
  }

  // Calculate the determinant of a 3x3 matrix, from:
  // http://www.mathworks.com/help/aeroblks/determinantof3x3matrix.html
  //
  // det(A) = A_{11} (A_{22}A_{33} - A_{23}A_{32}) -
  //          A_{12} (A_{21}A_{33} - A_{23}A_{31}) +
  //          A_{13} (A_{21}A_{32} - A_{22}A_{31})
  //
  // Of course, I had to change the indices from 1-based to 0-based.
  //
  function determinant(c0: number[], c1: number[], c2: number[]) {
    return c0[0] * (c1[1] * c2[2] - c1[2] * c2[1]) - c0[1] * (c1[0] * c2[2] - c1[2] * c2[0]) + c0[2] * (c1[0] * c2[1] - c1[1] * c2[0])
  }

  // Now that we have the transform, need to convert it to MINC-like
  // steps and direction_cosines.

  const xmag = magnitude(transform[0])
  const ymag = magnitude(transform[1])
  const zmag = magnitude(transform[2])

  const xstep = transform[0][0] < 0 ? -xmag : xmag
  const ystep = transform[1][1] < 0 ? -ymag : ymag
  const zstep = transform[2][2] < 0 ? -zmag : zmag

  for (let i = 0; i < 3; i++) {
    x_dir_cosines[i] = transform[i][0] / xstep
    y_dir_cosines[i] = transform[i][1] / ystep
    z_dir_cosines[i] = transform[i][2] / zstep
  }
  const starts = [transform[0][3], transform[1][3], transform[2][3]]

  // (bert): I believe that the determinant of the direction
  // cosines should always work out to 1, so the calculation of
  // this value should not be needed. But I have no idea if NIfTI
  // enforces this when sform transforms are written.
  const denom = determinant(x_dir_cosines, y_dir_cosines, z_dir_cosines)
  const xstart = determinant(starts, y_dir_cosines, z_dir_cosines)
  const ystart = determinant(x_dir_cosines, starts, z_dir_cosines)
  const zstart = determinant(x_dir_cosines, y_dir_cosines, starts)

  return {
    xspace: {
      step: xstep,
      start: xstart / denom,
      direction_cosines: x_dir_cosines,
      offset: 1,
    },
    yspace: {
      step:ystep,
      start: ystart / denom,
      direction_cosines: y_dir_cosines,
      offset: 1,
    },
    zspace: {
      step:zstep,
      start: zstart / denom,
      direction_cosines: z_dir_cosines,
      offset: 1,
    },
  }
}
