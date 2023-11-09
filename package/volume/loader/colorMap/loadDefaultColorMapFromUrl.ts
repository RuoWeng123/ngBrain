import axios from "axios";
import type { VolumeViewerType } from "ngBrain/volume/types";
import type { VolumeViewer } from "ngBrain/volume/viewer";
import { ColormapType } from "ngBrain/volume/types";
import { createdColorMap } from './createColorMap';

const setDefaultColorMap = (data: any) =>{
  return createdColorMap(data, { scale: 255 });
}
export const loadDefaultColorMapFromUrl = async(url: string) => {
  const res = await axios.get(url);
  return setDefaultColorMap(res.data);
}
export const formatFreeSurferColorMap = (colormap: string = '') => {
  const lines = colormap.trim().split(/\n/);
  const colorMapColors = [];
  let ic = 0;
  const lineCount = lines.length;
  let lineLength;

  for (let i = 0; i < lineCount; i++) {
    let color = lines[i].trim().split(/\s+/).slice(0, 6);
    lineLength = color.length;

    if (lineLength === 6) {
      ic = parseInt(color[0], 10);
      ic *= 4;
      color = color.slice(2, 6);
    }

    for (let j = 0; j < 4; j++) {
      const val = parseFloat(color[j]);
      // correct opacity 0 to 1
      const colorVal = (j === 3 && val === 0) ? 1 : val;
      colorMapColors[ic + j] = colorVal;
    }

    ic += 4;
  }
  const retArr = [];
  for (let i = 0; i < colorMapColors.length; i++) {
    const isOpacity = (i + 1) % 4 === 0;
    const colorVal = (colorMapColors[i] === undefined || Number.isNaN(colorMapColors[i])) ? 0 : (isOpacity ? '1.0' : colorMapColors[i] / 255);
    retArr.push(colorVal);
    retArr.push(isOpacity ? '\n' : ' ');
  }

  return retArr.join('');
};
export const getColorsByPatchIds = (colormap: string, patchIds?: number[], isVolume?: boolean) => {
  let str = '';
  const colors = colormap.split(/\n/);
  if (!isVolume && patchIds) {
    patchIds = patchIds
    .filter((id: number) => id >= 1000)
    .map((id: number) => id % 100);
  }
  for (let i = 0; i < colors.length; i++) {
    const matchPatchId = patchIds ? patchIds.includes(i) : true;
    if (matchPatchId) {
      str += `${colors[i]}\n`;
    } else if (colors[i].trim() !== '') {
      str += isVolume ? '0 0 0 0\n' : '1 1 1 1\n';
    }
  }

  return str;
};
export const loadVolumeColorMapFromString = (viewer: any, volId: number, colormapData: string, spectrumRange?: any) => {
  const colormap = createdColorMap(colormapData, { scale: 255 });
  console.log('colorMap', colormap);
  viewer.setVolumeColorMap(volId, colormap);
  if (spectrumRange) {
    viewer.volumes[volId].intensity_min = - spectrumRange.max_value;
    viewer.volumes[volId].intensity_max = spectrumRange.max_value;
  }
};
const loadVolumeColorMapFromUrl = async(viewer: VolumeViewerType , volId: number, colormapUrl: string, isFreeSurfer: boolean) => {
  const response = await axios.get(colormapUrl);
  const resactionGap = 96;
  let colormap = response.data;
  console.log('colormap_1', colormap);
  if (isFreeSurfer) {
    colormap = formatFreeSurferColorMap(colormap);
  }
  let nextPatchIds: number[] | undefined;
  colormap = getColorsByPatchIds(colormap, nextPatchIds, true);
  loadVolumeColorMapFromString(viewer, volId, colormap);
}
export const getColorMapUrl = (colormap: string) => {
  return `static/vendors/brainbrowser/colormap/${colormap}`;
};
export const checkColormapIsFunc = (colormap: ColormapType) => {
  return colormap === ColormapType.StandardParcSurf ||
    colormap === ColormapType.StandardParcSurf92 ||
    colormap === ColormapType.StandardParcSurf152 ||
    colormap === ColormapType.StandardParcSurf213 ||
    colormap === ColormapType.StandardParcVol ||
    colormap === ColormapType.StandardParcVol92 ||
    colormap === ColormapType.StandardParcVol152 ||
    colormap === ColormapType.StandardParcVol213 ||
    colormap === ColormapType.Test;
};
const loadVolumesColorMap = async(viewer: VolumeViewerType) => {
  const {volumes} = viewer;
  volumes.map(async(propVolume: any, volId: number) => {
    if (propVolume.colormap) {
      const isFreeSurfer =
        propVolume.colormap === ColormapType.FreeSurferAseg ||
        propVolume.colormap === ColormapType.FreeSurferA2009sAseg ||
        propVolume.colormap === ColormapType.AllVolumeColor;
      const colormapUrl = getColorMapUrl(propVolume.colormap);
      await loadVolumeColorMapFromUrl(viewer, volId, colormapUrl, isFreeSurfer);
    }
    const selfVolume: any = viewer.volumes[volId];
    const intensity = propVolume.intensity;
    if (selfVolume && intensity) {
      selfVolume.intensity_min = intensity.min;
      selfVolume.intensity_max = intensity.max;
    }
    if (selfVolume) {
      selfVolume.isRiskMask = propVolume.isRiskMask;
      selfVolume.isRiskHeatMap = propVolume.isRiskHeatMap;
    }
    const clamp = propVolume.clamp;
    if (selfVolume && clamp) {
      selfVolume.display.setClamp(clamp);
    }
  });
}
export const updateColorMap = async(viewer: VolumeViewer) => {
  await loadVolumesColorMap(viewer.viewer);
  viewer.redraw();
}
