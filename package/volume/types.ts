import type { CoordinateType, VoxelCoordinateType } from 'ngBrain/utils/types'

export enum VolumeViewerVolumeFormat {
  mgh = 'mgh',
  nifti1 = 'nifti1',
}

export enum ColormapType {
  StandardParcSurf = '18networks-surface.txt',
  StandardParcSurf92 = '92networks-surface.txt',
  StandardParcSurf152 = '152networks-surface.txt',
  StandardParcSurf213 = '213networks-surface.txt',
  StandardParcVol = '18networks-volume.txt',
  StandardParcVol92 = '92networks-volume.txt',
  StandardParcVol152 = '152networks-volume.txt',
  StandardParcVol213 = '213networks-volume.txt',
  HighResParc = 'color-table-108.txt',
  GrayScale = 'gray-scale.txt',
  BlackWhite = 'black-white.txt',
  Spectral = 'spectral-brainview.txt',
  Thermal = 'thermal.txt',
  TaskfMRI = 'contrast-2.96-1.96-volume.txt',
  surfAnatAparcAsegLH = 'surfAnatAparcAsegLH.txt',
  surfAnatAparcAsegRH = 'surfAnatAparcAsegRH.txt',
  SurfAnatAparcA2009sAsegLH = 'SurfAnatAparcA2009sAsegLH.txt',
  SurfAnatAparcA2009sAsegRH = 'SurfAnatAparcA2009sAsegRH.txt',
  FreeSurferAseg = 'free-surfer-aseg.txt',
  FreeSurferA2009sAseg = 'free-surfer-a2009s-aseg.txt',
  AllVolumeColor = 'FreeSurferColorLUT.txt',
  // connectivity-0.2-0.6-surface.txt
  ConnectivityColorSurface = 'connectivity-0.2-0.6-1-surface.txt',
  ConnectivityColorVolume = 'connectivity-0.2-0.6-volume.txt',
  TaskfSurface = 'contrast-5-1.96-surface.txt',
  TaskfVolume = 'contrast-5-1.96-volume.txt',
  GroupSurface = 'contrast-4-0-surface.txt',
  GroupVolume = 'contrast-4-0-volume.txt',
  FunctionalColor = 'connectivity-0.25-1-volume.txt',
  BlackRed = 'black-red.txt',
  RiskRedYellowVolume = 'contrast-0-1-volume.txt',
  Test = 'volume-test.txt',
  SurfaceRiskMap = 'surface-risk-map.txt',
  RiskGreenYellowVolume = 'contrast-0-1-volume-green-yellow.txt',
  RiskGreenYellowSurface = 'contrast-0-1-surface-green-yellow.txt',
  White = 'white.txt',
  Black = 'black.txt',
}

export type volumeArtiType = 'Volume' | 'VolScalpMask'
export type volumeDescriptor = 't1-image' | 'scalp-mask-volume'
export type ArtiDefSimple = {
  artiType: volumeArtiType
  artiMessageId: string
  descriptor: volumeDescriptor
  baseArtiType?: volumeArtiType | volumeArtiType[]
  overlayArtiType?: volumeArtiType | volumeArtiType[]
  displaySeq?: number
  axJobId?: number
}
export type ArtiDefVol = ArtiDefSimple & {
  format: VolumeViewerVolumeFormat
  showColorMap?: boolean
  colormap: ColormapType
  intensity?: {
    min: number
    max: number
  }
  min?: number
  overlayNumber?: number | string
  clamp?: boolean
}

export interface OutputFile {
  /** 文件描述符 */
  descriptor: string

  /** 文件ID */
  fileId: number

  /** 文件逻辑名 */
  logicalName?: string

  /** 文件key */
  s3MainKey: string
}

export interface FileDownloadModel {
  /**  */
  signedUrl?: string

  /**  */
  storagePath: string
}

export type VolumeFileType = OutputFile &
  FileDownloadModel & {
    artiDef: ArtiDefVol
  }
export type VolumeViewerIntensity = {
  min: number
  max: number
}

export type VolumeViewerView = 'xspace' | 'yspace' | 'zspace'
export type VolumeDescriptionType = {
  dom_element: string // eslint-disable-line camelcase
  id: number
  show_volume?: boolean // eslint-disable-line camelcase
  display_zindex: number // eslint-disable-line camelcase
  colormap?: string
  intensity?: VolumeViewerIntensity
  views: VolumeViewerView[]
  opacity?: number
  formatDataFun?: any
  hideBorder?: boolean
  hideCursor?: boolean

  // 设置volume 背景颜色，一般不要用
  backgroundColor?: string

  overlayId?: number
  overlayType?: string

  type: VolumeViewerVolumeFormat.nifti1 | VolumeViewerVolumeFormat.mgh
  url: string
}

export type VolumeViewerType = {
  dom_element: HTMLElement
  containers: HTMLElement[]
  volumes: any[]
  header?: headerType
  isLinkZoom?: boolean
  synced: boolean
  active_panel?: PanelType
  anchor: {x: number, y: number}
  multi: boolean
  multiHide: boolean
  viewerWheelHandler: boolean
  adjustWindowWidth: boolean
  lineWorldCoords: CoordinateType[]
  drawPolyline: boolean
  polylineWorldCoords: CoordinateType[]
  isDrawPoints: boolean
  drawPoints: CoordinateType[]
  pointsWorldCoords: CoordinateType[]
}

type viewSpaceType = {
  space_length: number
  start: number
  step: number
  direction_cosines: number[]
  offset: number
  voxel_origin?: CoordinateType
  width_space: viewSpaceType
  height_space: viewSpaceType
  width: number
  height: number
  w2v?: number[][]
}
export type headerType = {
  datatype: number
  display_zindex: number
  little_endian: boolean
  nvoxels: number
  order: VolumeViewerView[]
  voxel_min: number
  voxel_max: number
  voxel_origin: { x: number; y: number; z: number }
  w2v?: number[][]
  xspace: viewSpaceType
  yspace: viewSpaceType
  zspace: viewSpaceType
}

export type PanelType = {
  name: VolumeViewerView;
  image_center: { x: number; y: number }
  zoom: number
  clamp: boolean
  contrast: number
  brightness: number
  updated: boolean
  hideBorder: boolean
  hideCursor: boolean
  frame_width: number
  activeBorder: boolean
  defaultBorder: boolean
  viewZoom: number
  setSize(width: number, height: number, options: any): void
  setSlice(panel: any, slice: any): void
  followPointer(pointer: any): void
  translateImage(dx: number, dy: number): void
  reset(): void
  getCursorPosition(): void
  updateVolumePosition(x: number, y: number): void
  updateSlice(callback?: any): void
  draw(cursor_color: string, active: boolean): void
}

export type DisplayType = {
  panels: PanelType[]
  setPanel(axis: VolumeViewerView, panel: PanelType): void
  getPanel(axis: VolumeViewerView): PanelType
  drawPanels(): void
  refreshPanels(): void
  setClamp(clamp: boolean): void
  setBrightness(brightness: number): void
  forEach(callback: Function): void
}

export type SliceType = {
  axis: VolumeViewerView
  data: ArrayBuffer
  width_space: viewSpaceType
  height_space: viewSpaceType
  width: number
  height: number
}

export type ColorMapType = {
  colors: any
  clamp: boolean
  flip: any
  scale: any
  contrast: any
  brightness: any
  mapColors(intensity_values: any, options: any, filterColorCb: Function): any
  formatNetworkBorderColor(value: any): any
  colorFromValue(value: any, options: any): any
  createElement(min: number, max: number, width: any, ticks: any, labelDecimal: any, fontStyle: any): any
  createLogPElement(min: number, max: number, width: any, isVolume: boolean): void
  createPercentElement(): any
  createSymmPosNegElement(): void
}

export type VolumeType = {
  color_map?: ColorMapType
  position: {
    xspace: number
    yspace: number
    zspace: number
  }
  current_time: number
  data: ArrayBuffer | Int32Array | Float32Array | Uint32Array
  header: headerType
  intensity_min: number
  intensity_max: number
  display: DisplayType
  opacity: number
  overlayId: number
  overlayType: number
  slice(axis: VolumeViewerView, slice_num: number, time: any): SliceType
  saveOriginAndTransform(header: headerType): any
  getSliceImage(slice: SliceType, zoom: number, contract: any, brightness: number, clamp: boolean): ImageData
  getIntensityValue(i: number, j: number, k: number): any
  getIntensityValueSimple(i: number, j: number, k: number): any
  getVoxelCoords(): VoxelCoordinateType
  setVoxelCoords(i: number, j: number, k: number): void
  getWorldCoords(): CoordinateType
  setWorldCoords(x: number, y: number, z: number): void
  voxelToWorld(i: number, j: number, k: number, stepRotio: number): CoordinateType
  worldToVoxel(x: number, y: number, z: number): VoxelCoordinateType
  getVoxelMin(): number
  getVoxelMax(): number
  getPreferredZoom(width: number, height: number): number
}
