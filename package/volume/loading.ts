import type { VolumeDescriptionType, VolumeType, VolumeViewerType, VolumeViewerView } from 'ngBrain/volume/types'
import { createMGHVolume } from 'ngBrain/volume/loader/mgh/createMghData'
import { VolumeViewerVolumeFormat } from 'ngBrain/volume/types'
import { prepareData } from 'ngBrain/volume/loader/prepareData/prepareData'
import { createMGHHeader } from 'ngBrain/volume/loader/common/header/createMGHHeader'
import { loadDefaultColorMapFromUrl } from 'ngBrain/volume/loader/colorMap/loadDefaultColorMapFromUrl'
import { createDisplay } from 'ngBrain/volume/lib/display'
import { createPanel } from 'ngBrain/volume/lib/panel'
import { createNifiHeader } from 'ngBrain/volume/loader/common/header/createNiftiHeader'
import { createNiftiVolume } from 'ngBrain/volume/loader/nifti/createNifti1Data'
import { events } from "../utils/events";
let default_panel_width = 260
let default_panel_height = 260

export const setDefaultPanelWidth = (width: number, height: number) => {
  default_panel_height = height
  default_panel_width = width
}
const createVolumeDisplay = (
  dom_element: HTMLElement,
  vol_id: number,
  volume_description: VolumeDescriptionType,
  volume: VolumeType,
  viewer: VolumeViewerType
) => {
  const display = createDisplay()
  display.propagateEventTo("*", volume);
  const container = document.createElement('div')
  const { views } = volume_description
  container.classList.add('volume-container')

  views.forEach((axis_name: VolumeViewerView) => {
    const canvas = document.createElement('canvas')
    canvas.width = default_panel_width
    canvas.height = default_panel_height
    canvas.classList.add('slice-display')
    canvas.classList.add(axis_name)
    canvas.style.backgroundColor = volume_description.backgroundColor || '#000000'
    container.appendChild(canvas)
    const options = {
      volume: volume,
      volume_id: vol_id,
      axis: axis_name,
      canvas: canvas,
      image_center: {
        x: canvas.width / 2,
        y: canvas.height / 2,
      },
    }
    const panel = createPanel(options)
    display.setPanel(axis_name, panel)

    let current_target: any = null
    function startDrag(pointer: { x: number; y: number }, shift_key: any, ctrl_key: any) {
      if (ctrl_key) {
        viewer.volumes.forEach(function (volume) {
          // @ts-ignore
          display.forEach(function (panel) {
            panel.anchor = null
          })
        })

        panel.anchor = {
          x: pointer.x,
          y: pointer.y,
        }
      }

      if (!shift_key) {
        panel.updateVolumePosition(pointer.x, pointer.y)
        // @ts-ignore
        display.forEach(function (other_panel) {
          if (panel !== other_panel) {
            other_panel.updateSlice()
          }
        })
      }
      panel.updated = true
    }

    function drag(pointer: { x: number; y: number }, shift_key: boolean) {
      let drag_delta: { dx: any; dy: any }

      if (shift_key) {
        drag_delta = panel.followPointer(pointer)
        if (viewer.synced) {
          viewer.volumes.forEach(function (synced_volume, synced_vol_id) {
            let synced_panel

            if (synced_vol_id !== vol_id) {
              synced_panel = synced_volume.display.getPanel(axis_name)
              synced_panel.translateImage(drag_delta.dx, drag_delta.dy)
            }
          })
        }
      } else {
        panel.updateVolumePosition(pointer.x, pointer.y)
        // @ts-ignore
        display.forEach(function (other_panel) {
          if (panel !== other_panel) {
            other_panel.updateSlice()
            other_panel.draw()
          }
        })
      }

      panel.updated = true
    }

    function mouseDrag(event: any) {
      if (event.target === current_target) {
        event.preventDefault()
        drag({ x: event.offsetX, y: event.offsetY }, event.shiftKey)
      }
    }
    function mouseDragEnd() {
      document.removeEventListener('mousemove', mouseDrag, false)
      document.removeEventListener('mouseup', mouseDragEnd, false)
      display.forEach(function (panel) {
        panel.anchor = null
      })
      current_target = null
    }
    function canvasMousedown(event: MouseEvent) {
      event.preventDefault()
      current_target = event.target

      if (viewer.active_panel) {
        viewer.active_panel.updated = true
      }
      viewer.active_panel = panel
      document.addEventListener('mousemove', mouseDrag, false)
      document.addEventListener('mouseup', mouseDragEnd, false)

      startDrag({ x: event.offsetX, y: event.offsetY }, event.shiftKey, event.ctrlKey)
    }
    function wheelHandler(event: any) {
      event.preventDefault()

      // @ts-ignore
      zoom(Math.max(-1, Math.min(1, event.wheelDelta || -event.detail)))
    }

    function zoom(delta: number) {
      panel.zoom *= delta < 0 ? 1 / 1.05 : 1.05
      panel.zoom = Math.max(panel.zoom, 0.25)
      panel.updateVolumePosition()
      panel.updateSlice()
    }

    canvas.addEventListener('mousedown', canvasMousedown, false)
    canvas.addEventListener('mousewheel', wheelHandler, false)
    canvas.addEventListener('DOMMouseScroll', wheelHandler, false) // Dammit Firefox
  })

  viewer.containers[vol_id] = container

  const lastContainers = viewer.containers
  let nextId = vol_id + 1
  for (; nextId < lastContainers.length; nextId++) {
    if (lastContainers[nextId]) {
      if (!volume_description.show_volume) {
        try {
          if (dom_element.contains(lastContainers[nextId])) {
            dom_element.insertBefore(container, lastContainers[nextId])
          }
        } catch (e) {
          console.error('volume viewer loading.js insertBefore error', e)
        }
      }
      break
    }
  }

  if (nextId === lastContainers.length) {
    if (volume_description.show_volume !== false) {
      try {
        setTimeout(() => {
          viewer.dom_element.innerHTML = ''
          dom_element.appendChild(container)
        }, 60)
      } catch (e) {
        console.error('Volume Viewer Loading.js appendChild Error', e)
      }
    }
  }

  return display
}
const setCommonVolume = async (volume: any, volume_description: VolumeDescriptionType, viewer: VolumeViewerType) => {
  events.addEventModel(volume)
  // @ts-ignore
  const color_map = await loadDefaultColorMapFromUrl(volume_description.colormap!)
  volume.color_map = color_map
  const domElement = document.getElementById(volume_description.dom_element)!
  const opacity = typeof volume_description.opacity === 'undefined' ? 1 : volume_description.opacity
  volume.opacity = opacity
  const display = createVolumeDisplay(domElement, volume_description.display_zindex, volume_description, volume, viewer)
  volume.display = display
  volume.propagateEventTo("*", viewer)
  volume_description.views.forEach((axis) => {
    volume.position[axis] = Math.floor(volume.header[axis].space_length / 2)
  })

  // if (isFly) {
  //   volume.position['yspace'] = 0;
  // }
  display.refreshPanels()

  return Object.assign({}, volume, { color_map, display, opacity })
}
export const loadVolumes = async (volumesDescription: VolumeDescriptionType[], viewer: VolumeViewerType) => {
  const volumes = []
  for (const description of volumesDescription) {
    const { type } = description
    const { data } = await prepareData(description.url, description.type)
    if (type === VolumeViewerVolumeFormat.mgh) {
      const { header, native_data } = createMGHHeader(data, description.display_zindex, description)
      // @ts-ignore
      viewer.header = header
      // @ts-ignore
      const volume = await createMGHVolume(header, native_data, description)
      // @ts-ignore
      const newVolume = await setCommonVolume(volume, description, viewer)
      volumes.push(newVolume)
    } else {
      const { header, native_data } = createNifiHeader(data, description.display_zindex, description)
      viewer.header = header
      const volume = await createNiftiVolume(header, native_data, description)
      const newVolume = await setCommonVolume(volume, description, viewer)
      volumes.push(newVolume)
    }
  }

  return volumes
}
