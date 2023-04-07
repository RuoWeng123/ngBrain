import type { ColorMapType, PanelType, VolumeDescriptionType, VolumeViewerType } from 'ngBrain/volume/types'
import { loadVolumes } from 'ngBrain/volume/loading'
import {events} from '../utils/events'

export class VolumeViewer {
  public viewer: VolumeViewerType
  constructor(dom_element: string, options: any) {
    const DomElement = document.getElementById(dom_element)!
    this.viewer = {
      header: undefined,
      adjustWindowWidth: false,
      anchor: { x: 0, y: 0 },
      drawPoints: [],
      drawPolyline: false,
      isDrawPoints: false,
      lineWorldCoords: [],
      multi: false,
      multiHide: false,
      pointsWorldCoords: [],
      polylineWorldCoords: [],
      viewerWheelHandler: false,
      dom_element: DomElement,
      containers: [],
      volumes: [],
      isLinkZoom: options.isLinkZoom,
      synced: false
    }
    events.addEventModel(this.viewer);
  }
  public setVolumeColorMap = (volId: number, colorMap: ColorMapType) => {
    this.viewer.volumes[volId].color_map = colorMap
  }

  public draw = () => {
    if (!this.viewer.volumes.length) return
    this.viewer.volumes.forEach((volume: any) => {
      if (!volume.display) return
      volume.display.forEach((panel: PanelType) => {
        panel.draw('#ffffff', false)
      })
    })
  }
  public render = () => {
    const self = this;
    (function render() {
      requestAnimationFrame(render)
      self.draw()
    })()
  }

  public loader = async (descriptions: VolumeDescriptionType[]) => {
    const volumes = await loadVolumes(descriptions, this.viewer)
    this.viewer.volumes = volumes
  }

  public resetDisplay = () => {
    this.viewer.volumes.forEach((volume: any) => {
      if (!volume.display) return
      volume.display.forEach((panel: PanelType) => {
        panel.reset()
      })
    })
  }

  public setPanelSize = (width: number, height: number) => {
    this.viewer.volumes.forEach((volume: any) => {
      if (!volume.display) return
      volume.display.forEach((panel: PanelType) => {
        panel.setSize(width, height, {scale_image: true})
      })
    })
  }
}
