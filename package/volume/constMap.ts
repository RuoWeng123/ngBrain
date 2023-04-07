import {
  VolumeViewerVolumeFormat,
  type ArtiDefVol,
  ColormapType,
  type VolumeDescriptionType,
  type VolumeViewerView,
} from "ngBrain/volume/types";
import type { VolumeFileType } from 'ngBrain/volume/types'
import { scalpMaskUrl, volumeT1Url } from "ngBrain/utils/file";
// 皮层
export const artiDefVolume: ArtiDefVol = {
  artiType: 'Volume',
  artiMessageId: 'subject.arti.Volume',
  descriptor: 't1-image',
  format: VolumeViewerVolumeFormat.mgh,
  colormap: ColormapType.GrayScale,
  intensity: {
    min: 0,
    max: 255,
  },
}

// 头皮
export const artiDefVolScalpMask: ArtiDefVol = {
  artiType: 'VolScalpMask',
  artiMessageId: '',
  descriptor: 'scalp-mask-volume',
  format: VolumeViewerVolumeFormat.nifti1,
  colormap: ColormapType.BlackWhite,
}

export const makeVolume = async (
  artifact: VolumeFileType,
  showVolume: boolean,
  displayZIndex: number,
  opacity: number = 100
): Promise<VolumeDescriptionType> => {
  opacity = opacity / 100
  const url = artifact.signedUrl!
  if (artifact.artiDef.format === VolumeViewerVolumeFormat.mgh) {
    return {
      dom_element: 'ngVolume',
      id: displayZIndex,
      show_volume: showVolume,
      colormap: artifact.artiDef.colormap,
      display_zindex: displayZIndex,
      intensity: artifact.artiDef.intensity,
      type: artifact.artiDef.format,
      views: ['xspace', 'yspace', 'zspace'],
      opacity,
      url,
      hideBorder: true,
    }
  } else {
    return {
      dom_element: 'ngVolume',
      id: displayZIndex,
      show_volume: showVolume,
      colormap: artifact.artiDef.colormap,
      display_zindex: displayZIndex,
      intensity: artifact.artiDef.intensity,
      type: artifact.artiDef.format,
      views: ['xspace', 'yspace', 'zspace'],
      opacity,
      url,
      hideBorder: true,
    }
  }
}

export const mghT1Description = {
  dom_element: 'ngVolume',
  show_volume: true,
  colormap: 'originalData/gray-scale.txt',
  display_zindex: 1,
  intensity: {
    min: 0,
    max: 255,
  },
  type: VolumeViewerVolumeFormat.mgh,
  views: ['xspace', 'yspace', 'zspace'] as VolumeViewerView[],
  opacity: 1,
  url: volumeT1Url,
  hideBorder: true,
  hideCursor: false,
  id: 1,
}

export const scalpMaskDescription = {
  dom_element: 'ngVolume',
  show_volume: true,
  colormap: 'originalData/black-white.txt',
  display_zindex: 0,
  intensity: {
    min: 0,
    max: 255,
  },
  type: VolumeViewerVolumeFormat.nifti1,
  views: ['xspace', 'yspace', 'zspace'] as VolumeViewerView[],
  opacity: 0.1,
  url: scalpMaskUrl,
  hideBorder: true,
  hideCursor: false,
  id: 0,
}
