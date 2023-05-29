
const createPanel = function (params) {
  const { volume, axis, canvas } = params
  let old_zoom_level = 0

  // Where the cursor used to be.
  let old_cursor_position = {
    x: 0,
    y: 0,
  }

  // Where the mouse or touch used to be.
  let old_pointer_position = {
    x: 0,
    y: 0,
  }

  let update_timeout = null

  // Because slice updates can be interrupted, keep
  // callbacks in an array to be executed at the end.
  let update_callbacks = []

  let panel = {
    image_center: {
      x: 0,
      y: 0,
    },
    canvas,
    axis: axis,
    slice: volume.slice,
    volume,
    zoom: 1,
    contrast: 1,
    brightness: 0,
    updated: true,
    context: canvas.getContext('2d'),
    /**
     * @doc function
     * @name panel.panel:setSize
     * @param {number} width Width of the panel canvas.
     * @param {number} height Height of the panel canvas.
     * @description
     * Set the size of the panel canvas.
     * ```js
     * panel.setSize(512, 512);
     * ```
     */
    setSize: function (width, height, options) {
      options = options || {}
      width = width > 0 ? width : 0
      height = height > 0 ? height : 0

      let scale_image = options.scale_image
      let old_width, old_height, ratio

      if (scale_image) {
        old_width = panel.canvas.width
        old_height = panel.canvas.width
        ratio = Math.min(width / old_width, height / old_height)
      }

      panel.canvas.width = width
      panel.canvas.height = height

      if (scale_image) {
        panel.zoom = panel.zoom * ratio
        panel.default_zoom = panel.default_zoom * ratio
        panel.image_center.x = width / 2
        panel.image_center.y = height / 2
        panel.updateVolumePosition()
        panel.updateSlice()
      }

      panel.updated = true
    },

    /**
     * @doc function
     * @name panel.panel:followPointer
     * @param {object} pointer The pointer to follow.
     * @returns {object} Object containing properties **dx** and **dy** indicating
     * how much the image moved.
     *
     * @description
     * Will translate the image by the same amount that the pointer has moved since
     * this method was last called.
     * ```js
     * panel.followPointer({
     *   x: 100,
     *   y: 125
     * });
     * ```
     */
    followPointer: function (pointer) {
      let dx = pointer.x - old_pointer_position.x
      let dy = pointer.y - old_pointer_position.y

      panel.translateImage(dx, dy)

      old_pointer_position.x = pointer.x
      old_pointer_position.y = pointer.y

      return {
        dx: dx,
        dy: dy,
      }
    },

    /**
     * @doc function
     * @name panel.panel:translateImage
     * @param {number} dx The **x** component of the translation vector.
     * @param {number} dy The **y** component of the translation vector.
     *
     * @description
     * Translates the slice image by **dx** and **dy**.
     * ```js
     * panel.translateImage(10, 40));
     * ```
     */
    translateImage: function (dx, dy) {
      panel.image_center.x += dx
      panel.image_center.y += dy

      panel.updated = true
    },

    /**
     * @doc function
     * @name panel.panel:reset
     * @description
     * Reset image to it's original position and zoom level.
     * ```js
     * panel.reset();
     * ```
     */
    reset: function () {
      panel.zoom = panel.default_zoom
      panel.image_center.x = panel.canvas.width / 2
      panel.image_center.y = panel.canvas.height / 2
      panel.updated = true
    },

    /**
     * @doc function
     * @name panel.panel:getCursorPosition
     * @description
     * Get the current position of the cursor.
     * ```js
     * panel.getCursorPosition();
     * ```
     */
    getCursorPosition: function () {
      let volume = panel.volume
      let slice = panel.slice
      let origin = getDrawingOrigin(panel)
      return {
        x: volume.position[slice.width_space.name] * Math.abs(slice.width_space.step) * panel.zoom + origin.x,
        y:
          (slice.height_space.space_length - volume.position[slice.height_space.name] - 1) *
            Math.abs(slice.height_space.step) *
            panel.zoom +
          origin.y,
      }
    },

    /**
     * @doc function
     * @name panel.panel:updateVolumePosition
     * @param {number} x The x coordinate of the canvas position.
     * @param {number} y The y coordinate of the canvas position.
     * @description
     * Update the volume position based on the given x and y
     * coordinates on the panel. Can be used without arguments
     * which will update based only on the zoom level.
     * ```js
     * panel.updateVolumePosition(x, y);
     * ```
     */
    updateVolumePosition: function (x, y) {
      let origin = getDrawingOrigin(panel)
      let zoom = panel.zoom
      let volume = panel.volume
      let slice = panel.slice
      let cursor
      let slice_x, slice_y

      if (x === undefined || y === undefined) {
        cursor = panel.getCursorPosition()
        x = cursor.x
        y = cursor.y
      }

      slice_x = Math.round((x - origin.x) / zoom / Math.abs(slice.width_space.step))
      slice_y = Math.round(slice.height_space.space_length - (y - origin.y) / zoom / Math.abs(slice.height_space.step) - 1)

      volume.position[panel.slice.width_space.name] = slice_x
      volume.position[panel.slice.height_space.name] = slice_y

      panel.updated = true
    },

    /**
     * @doc function
     * @name panel.panel:updateSlice
     * @param {function} callback A callback function to call after
     * the update is complete.
     * @description
     * Update the current slice being drawn based
     * on the current volume position. This function
     * is asynchronous.
     * ```js
     * panel.updateSlice();
     * ```
     */
    updateSlice: function () {
      clearTimeout(update_timeout)
      update_timeout = setTimeout(function () {
        let volume = panel.volume
        let slice

        slice = volume.slice(panel.axis)

        setSlice(panel, slice)

        panel.updated = true

        update_callbacks.forEach(function (callback) {
          callback(slice)
        })
        update_callbacks.length = 0
      }, 0)
    },

    /**
     * @doc function
     * @name panel.panel:draw
     * @param {string} cursor_color The color of the cursor.
     * @param {boolean} active Whether this panel is active or not (i.e.
     * highlighted in red).
     * @description
     * Draw the current slice to the canvas.
     * ```js
     * panel.draw();
     * ```
     */
    draw: function (cursor_color, active) {
      let cursor = panel.getCursorPosition()

      if (old_cursor_position.x !== cursor.x || old_cursor_position.y !== cursor.y) {
        old_cursor_position.x = cursor.x
        old_cursor_position.y = cursor.y
        panel.updated = true
        panel.triggerEvent('cursorupdate', {
          volume: panel.volume,
          cursor: cursor,
        })
      }

      if (old_zoom_level !== panel.zoom) {
        old_zoom_level = panel.zoom
        panel.updated = true
        panel.triggerEvent('zoom', {
          volume: panel.volume,
          zoom: panel.zoom,
        })
      }

      if (!panel.updated) {
        return
      }

      let canvas = panel.canvas
      let context = panel.context
      let frame_width = 4
      let half_frame_width = frame_width / 2

      context.globalAlpha = 255
      context.clearRect(0, 0, canvas.width, canvas.height)

      drawSlice(panel)

      drawCursor(panel, cursor_color)

      if (active) {
        context.save()
        context.strokeStyle = '#EC2121'
        context.lineWidth = frame_width
        context.strokeRect(half_frame_width, half_frame_width, canvas.width - frame_width, canvas.height - frame_width)
        context.restore()
      }

      panel.updated = false
    },
  }

  panel.mouse = { x: 126, y: 124, left: false, middle: false, right: false }

  if (panel.volume) {
    let volume = panel.volume
    setSlice(panel, volume.slice(panel.axis))
    panel.default_zoom = volume.getPreferredZoom(panel.canvas.width, panel.canvas.height)
    panel.zoom = panel.default_zoom
  }
  return panel
}
///////////////////////
// Private functions
///////////////////////

// Set the volume slice to be rendered on the panel.
function setSlice(panel, slice) {
  panel.slice = slice
  panel.slice_image = panel.volume.getSliceImage(panel.slice, panel.zoom, panel.contrast, panel.brightness)
}

// Draw the cursor at its current position on the canvas.
function drawCursor(panel, color) {
  let context = panel.context
  let cursor = panel.getCursorPosition()
  let x, y, space
  color = color || '#FF0000'

  context.save()

  context.strokeStyle = color
  context.fillStyle = color

  space = 1
  x = cursor.x
  y = cursor.y
  let panelHeight = panel.canvas.height
  let panelWidth = panel.canvas.width
  context.lineWidth = space * 2
  context.beginPath()
  context.moveTo(x, 0)
  context.lineTo(x, y - space)
  context.moveTo(x, y + space)
  context.lineTo(x, panelHeight - space)
  context.moveTo(0, y)
  context.lineTo(x - space, y)
  context.moveTo(x + space, y)
  context.lineTo(panelWidth - space, y)
  context.stroke()
}

// Draw the current slice to the canvas.
function drawSlice(panel) {
  let image = panel.slice_image

  if (image) {
    const origin = {
      x: panel.image_center.x - panel.slice_image.width / 2,
      y: panel.image_center.y - panel.slice_image.height / 2,
    }
    panel.context.putImageData(image, origin.x, origin.y)
  }
}

// Get the origin at which slices should be drawn.
function getDrawingOrigin(panel) {
  let slice = panel.slice
  return {
    x: panel.image_center.x - Math.abs(slice.width_space.step * slice.width_space.space_length * panel.zoom) / 2,
    y: panel.image_center.y - Math.abs(slice.height_space.step * slice.height_space.space_length * panel.zoom) / 2,
  }
}

export { createPanel }
