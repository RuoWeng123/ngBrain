import {events} from 'ngBrain/utils/events.js'
export const createDisplay = function() {
  const display = {
    panels: {
      xspace: {},
      yspace: {},
      zspace: {}
    },
    /**
     * @doc function
     * @name display.display:setPanel
     * @param {string} axis_name The axis the panel is to be used for.
     * @param {object} panel The panel used to display the given axis.
     * @description
     * Set the panel for a given axis.
     * ```js
     * display.setPanel("xspace", panel);
     * ```
     */
    setPanel: function(axis_name, panel) {
      panel.propagateEventTo("*", display);
      display.panels[axis_name] = panel;
    },

    /**
     * @doc function
     * @name display.display:getPanel
     * @param {string} axis_name The axis for which to retrieve the panel.
     * @description
     * Retrieve the panel for the given axis.
     * ```js
     * display.getPanel("xspace");
     * ```
     */
    getPanel: function(axis_name) {
      return display.panels[axis_name];
    },
    
    /**
     * @doc function
     * @name display.display:drawPanels
     * @description
     * Draw all panels.
     */
    drawPanels: function() {
      try{
        for(let key in display.panels) {
          display.panels[key].draw();
        }
      }catch (e) {
        console.log(e);
      }
     
    },

    /**
     * @doc function
     * @name display.display:refreshPanels
     * @description
     * Refresh slices on all panels.
     * ```js
     * display.refreshPanels();
     * ```
     */
    refreshPanels: function() {
      for(let key in display.panels) {
        display.panels[key].updateSlice();
      }
    },

    /**
     * @doc function
     * @name display.display:setClamp
     * @param {boolean} clamp The contrast value.
     * @description
     * Set clamp for all panels in the display.
     * ```js
     * display.setClamp(true);
     * ```
     */
    setClamp: function (clamp) {
      for(let key in display.panels) {
        display.panels[key].clamp = clamp;
      }
    },

    /**
     * @doc function
     * @name display.display:setContrast
     * @param {number} contrast The contrast value.
     * @description
     * Set contrast for all panels in the display.
     * ```js
     * display.setContrast(1.5);
     * ```
     */
    setContrast: function(contrast) {
      for(let key in display.panels) {
        display.panels[key].contrast = contrast;
      }
    },

    /**
     * @doc function
     * @name display.display:setBrightness
     * @param {number} brightness The brightness value.
     * @description
     * Set brightness for all panels in the display.
     * ```js
     * display.setBrightness(0.5);
     * ```
     */
    setBrightness: function(brightness) {
      for(let key in display.panels) {
        display.panels[key].brightness = brightness;
      }
    },

    /**
     * @doc function
     * @name display.display:forEach
     * @param {function} callback Function called for each panel.
     * The panel itself, the axis name and index are passed as
     * arguments.
     * @description
     * Iterate over the current panels.
     * ```js
     * display.forEach(function(panel, axis_name) {
     *   // Do something...
     * });
     * ```
     */
    forEach: (callback)=>{
      Object.keys(display.panels).forEach(function(axis_name, i) {
        callback(display.panels[axis_name], axis_name, i);
      });
    }
  };
  
  events.addEventModel(display);
  return display;
};
