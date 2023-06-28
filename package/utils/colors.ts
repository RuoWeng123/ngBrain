import lodash from "lodash"

export const colors = [
  '#0074D9',
  '#FF851B',
  '#999E10',
  '#A11665',
  '#86B67C',
  '#FF4136',
  '#3D9970',
  '#F2BEEF',
  '#F7D777',
  '#00009C',
  '#A9A9F0',
  '#B10DC9',
  '#8D001E',
  '#39CCCC',
  '#C79B8A',
  '#CA8911',
  '#48878A',
  '#460078',
  '#29CAA8',
  '#C4E1E5',
  '#714A67',
  '#E7C077',
  '#FCB543',
  '#738223',
]

// 将colors[index]中的数据 转换成 16进制的数据
export const colorToHex = (index: number) => {
  return parseInt(colors[index].replace('#', ''), 16)
}

// 结构分区输出是 144 长度的数组
export const createColorMap = (data: any) => {
  let color_map_colors
  let lines, line_count, line_length
  let i, j, ic
  let color

  if (data) {
    lines = data.trim().split(/\n/)
    color_map_colors = []
    ic = 0

    for (i = 0, line_count = lines.length; i < line_count; i++) {
      color = lines[i].trim().split(/\s+/).slice(0, 5)
      line_length = color.length

      if (line_length < 3) continue

      if (line_length > 4) {
        /* Sparse colour map. The first column gives the
         * label to associate with the colour, the remaining
         * 4 columns give the RGBA values to associate with
         * the label.
         */
        ic = parseInt(color[0], 10)
        ic *= 4
        line_length = 4
        color = color.slice(1, 5)
      }

      for (j = 0; j < line_length; j++) {
        color_map_colors[ic + j] = parseFloat(color[j])
      }

      if (line_length < 4) {
        color_map_colors[ic + 3] = 1
      }

      ic += 4
    }
  }

  return {
    colors: color_map_colors,
  }
}

// 将 一维数组 切割为 2纬数组
const initColorMap = async (colorMap: any)=> {
  const { colors: tempColors } = colorMap;
  const rgbaColors: string[] = [];
  const arr: number[][] = [];
  for (let i = 0; i < tempColors.length; i += 4) {
    const color = `rgba(${tempColors[i] * 255}, ${tempColors[i + 1] * 255}, ${tempColors[i + 2] * 255}, ${tempColors[i + 3]})`;
    rgbaColors.push(color);
    arr.push([tempColors[i], tempColors[i + 1], tempColors[i + 2], tempColors[i + 3]]);
  }

  return { colors: arr };
};


// 将 一维数组 和 2纬数组中的目标对象 比对，用来拼接字符串，该字符串用于surfaceViewer.updateColor(str)方法
const getUpdateColors = (colorsParams: number[], selectedColor?: number[], isVolume?: boolean, patchId?: number) => {
  let str = '';
  const array = lodash.cloneDeep(colorsParams);
  if(patchId === -1){
    for (let i = 0; i < array.length; i += 4) {
      str += `${array[i]} ${array[i + 1]} ${array[i + 2]} ${array[i + 3]}\n`;
    }

    return str;
  }
  if (selectedColor) {
    for (let i = 0; i < array.length; i += 4) {
      const matchPatchId = patchId !== undefined ? patchId === Math.floor(i / 4) : true;
      if (
        array[i] === selectedColor[0] &&
        array[i + 1] === selectedColor[1] &&
        array[i + 2] === selectedColor[2] &&
        array[i + 3] === selectedColor[3] &&
        matchPatchId
      ) {
        str += `${selectedColor[0]} ${selectedColor[1]} ${selectedColor[2]} ${selectedColor[3]}\n`;
      } else {
        const isAllZero = array[i] === 0
          && array[i + 1] === 0
          && array[i + 2] === 0
          && array[i + 3] === 0;
        str += isVolume ? (isAllZero ? '0 0 0 0\n' : '0 0 0 1\n') : '1 1 1 1\n';
      }
    }

    return str;
  }

  for (let i = 0; i < array.length; i += 4) {
    str += `${array[i]} ${array[i + 1]} ${array[i + 2]} ${array[i + 3]}\n`;
  }

  return str;
};
export const updateViewerColorMap = (viewer: any, colorMap: any, patchId: number) => {
  console.log('updateViewerColorMap', colorMap);
  const { colors } = initColorMap(colorMap);
  let color = undefined;
  if(patchId > 0){
    color = colors[patchId];
  }
  const str = getUpdateColors(colors, color, false, patchId);

  console.log('str', str);
  console.log(viewer, 'viewer');
}
