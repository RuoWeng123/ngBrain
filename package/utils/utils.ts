// @ts-ignore
import type { CoordinateType } from "ngBrain/utils/types";
import * as THREE from "three";
const getScrollParent = (element: HTMLElement | null) => {
  if (!element) return document.body
  if (element.scrollHeight > element.clientHeight) {
    return element
  } else {
    return getScrollParent(element.parentElement)
  }
}
const getOffset = (element: HTMLElement) => {
  let [top, left, scrollTop] = [0, 0, 0]
  let scrollParent = getScrollParent(element)
  while (scrollParent && !scrollParent.isSameNode(document.body)) {
    scrollTop += scrollParent.scrollTop
    scrollParent = getScrollParent(scrollParent.parentElement)
  }

  while (element.offsetParent) {
    top += element.offsetTop
    left += element.offsetLeft
  }

  return { top: top - scrollTop, left: left }
}
const captureMouse = function(element: HTMLCanvasElement){
  const mouse = { x: 0, y: 0, left: false, middle: false, right: false }
  if (!element) return mouse

  document.addEventListener(
    'mousemove',
    function (event: MouseEvent) {
      const offset = getOffset(element)
      let x, y
      if (event.pageX !== undefined) {
        x = event.pageX
        y = event.pageY
      } else {
        x = event.clientX + window.scrollX
        y = event.clientY + window.scrollY
      }

      mouse.x = x - offset.left
      mouse.y = y - offset.top
    },
    false
  )

  document.addEventListener(
    'mousedown',
    function (event) {
      event.preventDefault()
      switch (event.button) {
        case 0:
          mouse.left = true
          break
        case 1:
          mouse.middle = true
          break
        case 2:
          mouse.right = true
          break
      }
    },
    false
  )

  document.addEventListener(
    'mouseup',
    function (event) {
      event.preventDefault()
      switch (event.button) {
        case 0:
          mouse.left = false
          break
        case 1:
          mouse.middle = false
          break
        case 2:
          mouse.right = false
          break
      }
    },
    false
  )

  document.addEventListener(
    'mouseleave',
    function (event) {
      event.preventDefault()
      mouse.left = mouse.middle = mouse.right = false
    },
    false
  )

  document.addEventListener(
    'contentmenu',
    function (event) {
      event.preventDefault()
    },
    false
  )

  return mouse
}

/**
 * @param object
 * @return {boolean}
 * @description test if the passed object is a function
 */
const isFunction = (object: any) => {
  return object instanceof Function || typeof object === 'function'
}

const checkCancel = (options: any) => {
  options = options || {}
  if (isFunction(options)) {
    options = { test: options }
  }
  const cancelTest = options.test
  const cancelCleanup = options.cleanup
  let cancelled = false
  if (cancelTest && cancelTest()) {
    cancelled = true
    if (cancelCleanup) cancelCleanup()
  }
  return cancelled
}

const reverseByVertexCoordsToPoint = (surface: any, coord: CoordinateType) => {
  const { x, y, z } = coord;
  const { viewer, camera } = surface;
  let p = new THREE.Vector3(x, y, z);
  p = p.applyMatrix4(viewer.model.matrixWorld);
  const vector = p.project(camera);
  const canvasX = (vector.x + 1) / 2 * viewer.dom_element.offsetWidth;
  const canvaxY = -(vector.y - 1) / 2 * viewer.dom_element.offsetHeight;
  return { x: canvasX, y: canvaxY };
};

export { getScrollParent, getOffset, captureMouse, isFunction, checkCancel, reverseByVertexCoordsToPoint }
