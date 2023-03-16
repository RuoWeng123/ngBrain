// @ts-ignore
const getScrollParent = (element: HTMLElement | null) => {
  if (!element) return document.body;
  if (element.scrollHeight > element.clientHeight) {
    return element;
  } else {
    return getScrollParent(element.parentElement);
  }
};
const getOffset = (element: HTMLElement, view = "surface-viewer") => {
  let [ top, left, scrollTop ] = [ 0, 0, 0 ];
  let scrollParent = getScrollParent(element);
  // @ts-ignore
  while (scrollParent && !scrollParent.isSameNode($("html")[0])) {
    scrollTop += scrollParent.scrollTop;
    scrollParent = getScrollParent(scrollParent.parentElement);
  }

  while (element.offsetParent) {
    top += element.offsetTop;
    left += element.offsetLeft;
  }

  return { top: top - scrollTop, left: left };
};
const captureMouse = (element: HTMLElement, view = "surface-viewer") => {
  const mouse = { x: 0, y: 0, left: false, middle: false, right: false };
  if (!element) return mouse;

  document.addEventListener(
    "mousemove",
    function(event: MouseEvent) {
      const offset = getOffset(element, view);
      let x, y;
      if (event.pageX !== undefined) {
        x = event.pageX;
        y = event.pageY;
      } else {
        x = event.clientX + window.scrollX;
        y = event.clientY + window.scrollY;
      }

      mouse.x = x - offset.left;
      mouse.y = y - offset.top;
    },
    false
  );

  document.addEventListener(
    "mousedown",
    function(event) {
      event.preventDefault();
      switch (event.button) {
        case 0:
          mouse.left = true;
          break;
        case 1:
          mouse.middle = true;
          break;
        case 2:
          mouse.right = true;
          break;
      }
    },
    false
  );

  document.addEventListener(
    "mouseup",
    function(event) {
      event.preventDefault();
      switch (event.button) {
        case 0:
          mouse.left = false;
          break;
        case 1:
          mouse.middle = false;
          break;
        case 2:
          mouse.right = false;
          break;
      }
    },
    false
  );

  document.addEventListener(
    "mouseleave",
    function(event) {
      event.preventDefault();
      mouse.left = mouse.middle = mouse.right = false;
    },
    false
  );

  document.addEventListener(
    "contentmenu",
    function(event) {
      event.preventDefault();
    },
    false
  );
};

/**
 * @param object
 * @return {boolean}
 * @description test if the passed object is a function
 */
const isFunction = (object: any) => {
  return object instanceof Function || typeof object === "function";
};

const checkCancel = (options: any) => {
  options = options || {};
  if (isFunction(options)) {
    options = { test: options };
  }
  const cancelTest = options.test;
  const cancelCleanup = options.cleanup;
  let cancelled = false;
  if (cancelTest && cancelTest()) {
    cancelled = true;
    if (cancelCleanup) cancelCleanup();
  }
  return cancelled;
};

const unrollColors = (color: number[], num_verts: number) => {
  const [data_color_0, data_color_1, data_color_2, data_color_3] = [color[0], color[1], color[2], color[3]];
  const unrolled_colors = new Float32Array(num_verts * 4);
  for (let i = 0; i < unrolled_colors.length; i += 4) {
    unrolled_colors[i] = data_color_0;
    unrolled_colors[i + 1] = data_color_1;
    unrolled_colors[i + 2] = data_color_2;
    unrolled_colors[i + 3] = data_color_3;
  }

  return unrolled_colors;
};

const createModel = (model_data: any, model: any, options: any) => {

}

const findCentroid = (shape:) =>{

}
export { getScrollParent, getOffset, captureMouse, isFunction, checkCancel, unrollColors };
