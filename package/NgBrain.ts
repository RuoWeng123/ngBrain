type SurfaceViewer = {
  dom_element: Element;
  model: any;
  model_data: any;
  zoom: number;
  autoRotate: {
    x: boolean;
    y: boolean;
    z: boolean;
  },
  updated: boolean;
  mouse: any;
}
export class NgBrain{
  private CANVAS_ENABLED: boolean;
  private WEB_WORKERS_ENABLED: boolean;
  private WEBGL_ENABLED: boolean;
  private dom_element: HTMLElement | null;
  constructor(element: HTMLElement | string) {
    this.CANVAS_ENABLED = true;
    this.WEB_WORKERS_ENABLED = true;
    this.WEBGL_ENABLED = true;
    this.dom_element = typeof element === 'string' ? document.getElementById(element) : element;
  }
}
