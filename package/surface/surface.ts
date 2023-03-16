// @ts-ignore
import { getFile } from '../utils/idbData';
// @ts-ignore
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import {scalpUrl, pialUrl} from "ngBrain/utils/file";
// import {scalpModelData} from '../utils/scalpModelData';
// import {pialModelData} from '../utils/pialModelData';
import { displayModel } from './rendering'
import type { CoordinateType, SurfaceOptionsType } from "ngBrain/utils/types";
const default_camera_distance = 500;
let current_frame: any;  // 用户动画渲染时，记录当前帧
let last_frame: any; // 用户动画渲染时，记录上一帧
let old_zoom_level = 1;
export class Surface {
  private renderer: any
  private idb: any;
  private scene: any
  private camera: any
  private light: any
  private model_data: any
  private model_data_store: Map<any, any>
  private viewer: any
  private domElement: HTMLElement

  private gui: any;
  constructor(element: string) {
    this.domElement = document.getElementById(element)!
    this.model_data_store = new Map();
    this.viewer = {
      dom_element: this.domElement,
      model: new THREE.Object3D(),
      model_data: {
        add: (name: string, data: any) => {
          this.model_data_store.set(name, data)
          data.intensity_data = []
        },
        get: (name: string) => {
          return this.model_data_store.get(name)
        },
        getDefaultIntensityData: (name: string) => {
          if (name) {
            const modelData = this.model_data_store.get(name)
            return modelData ? modelData.intensity_data[0] : null
          } else {
            const modelData = Object.keys(this.model_data_store).map((key) => this.model_data_store.get(key))
            let intensity_data = null
            for (let i = 0, count = modelData.length; i < count; i++) {
              intensity_data = modelData[i].intensity_data[0]
              if (intensity_data) {
                break
              }
            }
            return intensity_data
          }
        },
        count: () => {
          return this.model_data_store.size
        },
        clear: () => {
          this.model_data_store?.clear()
        },
        forEach: (callback: Function) => {
          for (const item in this.model_data_store) {
            callback(this.model_data_store.get(item), item)
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
    }
  }

  public init = () => {
    this.initRenderer()
    this.initScene()
    this.initCamera()
    this.initLight()
    this.initControl();
    this.initGUI();
  }

  public initRenderer = () => {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.domElement.offsetWidth, this.domElement.offsetHeight)

    this.domElement.appendChild(this.renderer.domElement)
  }

  public initScene = () => {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x151426)
  }

  public initCamera = (centroid?: CoordinateType) => {
    this.camera = new THREE.PerspectiveCamera(30, this.domElement.offsetWidth / this.domElement.offsetHeight, 1, 1000)
    this.camera.position.set(0, 0, default_camera_distance)
    if (centroid) {
      this.camera.lookAt(centroid.x, centroid.y, default_camera_distance)
    }
  }

  public initLight = () => {
    this.light = new THREE.DirectionalLight(0xEFEDF5, 0.92);
    this.light.position.set(100, 0, default_camera_distance)
    this.scene.add(this.light)
  }

  private initControl = () => {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = true
    controls.enablePan = true
    controls.enableRotate = true
    controls.rotateSpeed = 0.5
    controls.zoomSpeed = 0.5
    controls.enableDrag = true
    controls.addEventListener('change', (e: any) => {
      console.log(e);
      this.render();
    });
  }

  private initGUI = () => {
    this.gui = new GUI();
    const autoRotateFolder = this.gui.addFolder('autoRotate');
    autoRotateFolder.add(this.viewer.autoRotate, 'x').onChange((value: boolean) => {
      this.viewer.autoRotate.x = value;
      this.renderFrame();
    });
    autoRotateFolder.add(this.viewer.autoRotate, 'y').onChange((value: boolean) => {
      this.viewer.autoRotate.y = value;
      this.renderFrame();
    });
    autoRotateFolder.add(this.viewer.autoRotate, 'z').onChange((value: boolean) => {
      this.viewer.autoRotate.z = value;
      this.renderFrame();
    });
    const zoomFolder = this.gui.addFolder('zoom');
    zoomFolder.add(this.viewer, 'zoom', 0.1, 2).onChange(() => {
      this.camera.position.set(0, 0, default_camera_distance * this.viewer.zoom);
      this.renderFrame();
    });
    const setLightFolder = this.gui.addFolder('setLight');
    setLightFolder.add(this.light, 'intensity', 0, 1).onChange((val: number) => {
      this.light.intensity = val;
      this.viewer.updated = true;
      this.renderFrame();
    });
    setLightFolder.add(this.light, 'type', ['DirectionalLight', 'AmbientLight', 'PointLight', 'SpotLight']).onChange((val: string) => {
      this.scene.remove(this.light);
      switch (val) {
        case 'AmbientLight':
          this.light = new THREE.AmbientLight(0xD1D0D7, 0.5);
          break;
        case 'DirectionalLight':
          this.light = new THREE.DirectionalLight(0xEFEDF5, 1);
          break;
        case 'PointLight':
          this.light = new THREE.PointLight(0xEFEDF5, 0.7);
          break;
        case 'SpotLight':
          this.light = new THREE.SpotLight(0xEFEDF5, 0.7);
          break;
        default:
          this.light = new THREE.PointLight(0xEFEDF5, 0.7);
          break;
      }
      this.light.position.set(0, 0, default_camera_distance)
      this.scene.add(this.light);
      this.viewer.updated = true;
      this.renderFrame();
    });

    const setPialMaterialFolder = this.gui.addFolder('setPialMaterial');
    setPialMaterialFolder.add(this.scene, 'type', ['MeshLambertMaterial', 'MeshPhongMaterial', 'MeshStandardMaterial', 'MeshPhysicalMaterial']).onChange((val: string) => {
      const pialObject3D = this.scene.getObjectByName('pial_gii_1');
      switch (val) {
        case 'MeshLambertMaterial':
          pialObject3D.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
          break;
        case 'MeshPhongMaterial':
          pialObject3D.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
          break;
        case 'MeshStandardMaterial':
          pialObject3D.material = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x262626, transparent: true });
          break;
        case 'MeshPhysicalMaterial':
          pialObject3D.material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, side: THREE.DoubleSide, metalness: 0.1, roughness: 1, reflectivity: 0.5 });
          break;
        default:
          pialObject3D.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
          break;
        }
      this.viewer.updated = true;
      this.renderFrame();
    });
  }

  public destroyGui = () => {
    this.gui.destroy();
  }
  public loadData = (url: string, options: any) => {
    // todo 修改model_data_store 对象
    // 加载完数据后，initObject
    this.initObject()
  }

  public initObject = () => {
    const geometry = new THREE.ConeGeometry(15, 20, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = 'cube';
    this.scene.add(cube);
    this.renderFrame()
  }

  public render = () => {
    this.renderer.render(this.scene, this.camera)
    this.viewer.updated = false;
  }
  public loadPialModelDataFromNative = async (url: string, options: SurfaceOptionsType) => {
    const res = await getFile(url);

    const { shapes, model_data: modelData } = displayModel(res.value.data, options.filename, options);
    for (const shape of shapes) {
      this.scene.add(shape);
    }
    this.renderFrame();
  }

  public loadScalpModelDataFromNative = async (url: string, options: SurfaceOptionsType) => {
    const res = await getFile(url);

    const { shapes, model_data: modelData } = displayModel(res.value.data, options.filename, options);
    for (const shape of shapes) {
      this.scene.add(shape);
    }
    this.renderFrame();
  }

  private renderFrame = (timestamp = 1) => {
    try {
      const model = this.viewer.model;
      const position = this.camera.position;
      const new_z = default_camera_distance / this.viewer.zoom;

      // 告诉浏览器，下次重绘前，继续更新下一帧动画，默认1ms
      // link: https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame
      this.viewer.requestAnimationFrame = window.requestAnimationFrame(this.renderFrame)

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

  private updateViewPort = () => {
    this.camera.aspect = this.domElement.offsetWidth / this.domElement.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.viewer.updated = true;
  }
}
