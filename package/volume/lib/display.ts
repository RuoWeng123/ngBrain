import type { VolumeViewerView } from "ngBrain/volume/types";
export const createDisplay = function () {
  const display = {
    panels: {
      xspace: {},
      yspace: {},
      zspace: {},
    },
    setPanel: function (axis_name: VolumeViewerView, panel) {
      display.panels[axis_name] = panel
    },


    getPanel: function (axis_name: VolumeViewerView) {
      return display.panels[axis_name]
    },


    drawPanels: function () {
      try {
        for (const key in display.panels) {
          display.panels[key].draw()
        }
      } catch (e) {
        console.log(e)
      }
    },

    refreshPanels: function () {
      for (const key in display.panels) {
        display.panels[key].updateSlice()
      }
    },

    setClamp: function (clamp) {
      for (const key in display.panels) {
        display.panels[key].clamp = clamp
      }
    },

    setContrast: function (contrast) {
      for (const key in display.panels) {
        display.panels[key].contrast = contrast
      }
    },

    setBrightness: function (brightness) {
      for (const key in display.panels) {
        display.panels[key].brightness = brightness
      }
    },

    forEach: (callback: Function) => {
      Object.keys(display.panels).forEach(function (axis_name, i) {
        callback(display.panels[axis_name], axis_name, i)
      })
    },
  }

  return display
}
