// @ts-ignore
import { getFile } from '../utils/idbData';
// @ts-ignore
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { displayModel } from './rendering';
import type { CoordinateType, SurfaceOptionsType, PialModelDataType, ScalpModelDataType } from 'ngBrain/utils/types';
export const default_camera_distance = 500;
let current_frame: any; // 用户动画渲染时，记录当前帧
let last_frame: any; // 用户动画渲染时，记录上一帧
let old_zoom_level = 1;
export class Surface {
  public renderer: any;
  public scene: any;
  public camera: any;
  public light: any;
  public model_data_store: Map<any, any>;
  public viewer: any;
  public domElement: HTMLElement;

  constructor(element: string) {
    this.domElement = document.getElementById(element)!;
    this.model_data_store = new Map();
    this.viewer = {
      dom_element: this.domElement,
      model: new THREE.Object3D(),
      model_data: {
        add: (name: string, data: any) => {
          this.model_data_store.set(name, data);
          data.intensity_data = [];
        },
        get: (name: string) => {
          return this.model_data_store.get(name);
        },
        getDefaultIntensityData: (name: string) => {
          if (name) {
            const modelData = this.model_data_store.get(name);
            return modelData ? modelData.intensity_data[0] : null;
          } else {
            const modelData = Object.keys(this.model_data_store).map((key) => this.model_data_store.get(key));
            let intensity_data = null;
            for (let i = 0, count = modelData.length; i < count; i++) {
              intensity_data = modelData[i].intensity_data[0];
              if (intensity_data) {
                break;
              }
            }
            return intensity_data;
          }
        },
        count: () => {
          return this.model_data_store.size;
        },
        clear: () => {
          this.model_data_store?.clear();
        },
        forEach: (callback: Function) => {
          for (const item in this.model_data_store) {
            callback(this.model_data_store.get(item), item);
          }
        },
      },
      updated: true,
      zoom: 1,
      rotate_speed: 2,
      autoRotate: {
        x: false,
        y: false,
        z: false,
      },
    };
  }

  public init = () => {
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLight();
    this.initControl();
  };

  public initRenderer = () => {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.domElement.offsetWidth, this.domElement.offsetHeight);

    this.domElement.appendChild(this.renderer.domElement);
  };

  public initScene = () => {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x151426);
  };

  public initCamera = (centroid?: CoordinateType) => {
    this.camera = new THREE.PerspectiveCamera(30, this.domElement.offsetWidth / this.domElement.offsetHeight, 1, 1000);
    this.camera.position.set(0, 0, default_camera_distance);
    if (centroid) {
      this.camera.lookAt(centroid.x, centroid.y, default_camera_distance);
    }
  };

  public initLight = () => {
    this.light = new THREE.PointLight(0xFFFFFF, 1);
    this.light.position.set(0, 0, default_camera_distance);
    this.scene.add(this.light);
  };

  private initControl = () => {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.5;
    controls.enableDrag = true;
    controls.addEventListener('change', (e: any) => {
      this.render();
    });
  };

  public render = () => {
    this.renderer.render(this.scene, this.camera);
    this.viewer.updated = false;
  };
  public renderModelData = (model_data: PialModelDataType | ScalpModelDataType, filename: string, options: SurfaceOptionsType) => {
    const { shapes, model_data: modelData } = displayModel(model_data, options.filename, options);
    for (const shape of shapes) {
      this.scene.add(shape);
    }
    this.renderFrame();
  };

  public renderFrame = (timestamp = 1) => {
    try {
      const model = this.viewer.model;
      const position = this.camera.position;
      const new_z = default_camera_distance / this.viewer.zoom;

      // 告诉浏览器，下次重绘前，继续更新下一帧动画，默认1ms
      // link: https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame
      this.viewer.requestAnimationFrame = window.requestAnimationFrame(this.renderFrame);

      // 光源头追踪
      this.light.target = this.scene.children.find((item: any) => item.name === 'pial_gii_1');

      last_frame = current_frame || timestamp;
      current_frame = timestamp;

      const delta = current_frame - last_frame;
      const rotation = delta * 0.00015 * this.viewer.rotate_speed;
      if (this.viewer.autoRotate.x) {
        this.scene.children.find((item: any) => item.name === 'cube').rotation.x += rotation;
      }
      if (this.viewer.autoRotate.y) {
        this.scene.children.find((item: any) => item.name === 'cube').rotation.y += rotation;
        this.viewer.updated = true;
      }
      if (this.viewer.autoRotate.z) {
        this.scene.children.find((item: any) => item.name === 'cube').rotation._z += rotation;
        this.viewer.updated = true;
      }
      if (old_zoom_level !== this.viewer.zoom) {
        old_zoom_level = this.viewer.zoom;
        this.viewer.updated = true;
      }
      if (this.viewer.updated) {
        if (new_z > this.camera.near && new_z < 0.9 * this.camera.far) {
          position.z = new_z;
          this.light.position.z = new_z;
        }
        this.render();
        return;
      }
    } catch (e) {
      window.cancelAnimationFrame(this.viewer.requestAnimationFrame);
    }
  };
}
