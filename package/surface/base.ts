// @ts-ignore
import { getFile } from '../utils/idbData'
// @ts-ignore
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { displayModel } from './rendering'
import type { CoordinateType, SurfaceOptionsType, PialModelDataType, ScalpModelDataType } from 'ngBrain/utils/types'
export const default_camera_distance = 500
let current_frame: any // 用户动画渲染时，记录当前帧
let last_frame: any // 用户动画渲染时，记录上一帧
let old_zoom_level = 1
export class SurfaceBase {
  public renderer: any
  public scene: any
  public camera: any
  public light: any
  public model_data_store: Map<any, any>
  public viewer: any
  public domElement: HTMLElement

  constructor(element: string) {
    this.domElement = document.getElementById(element)!
    this.model_data_store = new Map()
    this.viewer = {
      dom_element: this.domElement,
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
    this.initAxes()
    this.initCamera()
    this.initLight()
    this.initControl()
  }

  private initAxes = () => {
    const axesHelper = new THREE.AxesHelper(200)
    this.scene.add(axesHelper)
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
    const ambientLight = new THREE.AmbientLight(0x000000)
    ambientLight.name = 'ambientLight'
    this.scene.add(ambientLight)
    // x 红， y 绿色  z 蓝色
    this.light = new THREE.PointLight(0xf5f6f5, 0.7, 0)
    this.light.position.set(-default_camera_distance, 0, 0)
    this.light.lookAt(0, 0, 0)
    this.scene.add(this.light)

    const light1 = new THREE.PointLight(0xf5f6f5, 0.7, 0)
    light1.position.set(default_camera_distance, 0, 0)
    this.scene.add(light1)

    const light2 = new THREE.PointLight(0xf5f6f5, 0.7, 0)
    light2.position.set(0, 0, -default_camera_distance)
    this.scene.add(light2)
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
      this.render()
    })
  }

  public render = () => {
    this.renderer.render(this.scene, this.camera)
    this.viewer.updated = false
  }
  public renderModelData = (model_data: PialModelDataType | ScalpModelDataType, filename: string, options: SurfaceOptionsType) => {
    const { shapes, model_data: modelData } = displayModel(model_data, options.filename, options)
    this.viewer.model_data.add(options.model_name, modelData)
    for (const shape of shapes) {
      this.scene.add(shape)
    }
    this.renderFrame()
  }

  public renderFrame = (timestamp = 1) => {
    try {
      const model = this.viewer.model
      const position = this.camera.position
      const new_z = default_camera_distance / this.viewer.zoom

      // 告诉浏览器，下次重绘前，继续更新下一帧动画，默认1ms
      // link: https://developer.mozilla.org/zh-CN/docs/Web/API/window/requestAnimationFrame
      this.viewer.requestAnimationFrame = window.requestAnimationFrame(this.renderFrame)

      // 光源头追踪
      // this.light.target = this.scene.children.find((item: any) => item.name === 'pial_gii_1');

      last_frame = current_frame || timestamp
      current_frame = timestamp

      const delta = current_frame - last_frame
      const rotation = delta * 0.00015 * this.viewer.rotate_speed
      if (this.viewer.autoRotate.x) {
        this.scene.children.find((item: any) => item.name === 'cube').rotation.x += rotation
      }
      if (this.viewer.autoRotate.y) {
        this.scene.children.find((item: any) => item.name === 'cube').rotation.y += rotation
        this.viewer.updated = true
      }
      if (this.viewer.autoRotate.z) {
        this.scene.children.find((item: any) => item.name === 'cube').rotation._z += rotation
        this.viewer.updated = true
      }
      if (old_zoom_level !== this.viewer.zoom) {
        old_zoom_level = this.viewer.zoom
        this.viewer.updated = true
      }
      if (this.viewer.updated) {
        if (new_z > this.camera.near && new_z < 0.9 * this.camera.far) {
          position.z = new_z
          this.light.position.z = new_z
        }
        this.render()
        return
      }
    } catch (e) {
      window.cancelAnimationFrame(this.viewer.requestAnimationFrame)
    }
  }

  // 渲染方法处理完毕，下面的是工具方法
  public getVertex = (index: number, model_name = 'pial_gii') => {
    const model = this.viewer.model_data.get(model_name)
    const vertices = model.vertices
    const i = index * 3
    return new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2])
  }

  /**
   * @doc function
   * @name viewer.rendering:pick
   * @param {number} x The x coordinate on the canvas (defaults to current mouse position).
   * @param {number} y The y coordinate on the canvas (defaults to current mouse position).
   * @param {number} opacity_threshold ignore shape that have opacity lower than the opacity_threshold integer between 0 and 100,
   * @returns {object} If an intersection is detected, returns an object with the following information:
   *
   * * **object** The THREE.Object3D object with which the the click intersected.
   * * **point** A THREE.Vector3 object representing the point in 3D space at which the intersection occured.
   * * **index** The index of the intersection point in the list of vertices.
   *
   * Otherwise returns **null**.
   *
   * @description
   * Returns information about the displayed object
   * and a certain x and y on the canvas. Defaults to
   * the current mouse position.
   * ```js
   * viewer.pick();              // Pick at current mouse position.
   * viewer.pick(125, 250);      // Pick at given position.
   * viewer.pick(125, 250, 25);  // Pick at given position only if opacity of shape is >= to 25%.
   * ```
   */
  public pick = (x: number, y: number, opacity_threshold: number) => {
    opacity_threshold = opacity_threshold === undefined ? 0.25 : opacity_threshold
    if (!this.renderer || !this.domElement) return

    x = (x / this.domElement.offsetWidth) * 2 - 1
    y = (-y / this.domElement.offsetHeight) * 2 + 1

    const model = this.scene.getObjectByName('pial_gii_1') || this.scene.getObjectByName('scalp_gii')
    const vector = new THREE.Vector3(x, y, this.camera.near)
    vector.unproject(this.camera)
    const raycaster = new THREE.Raycaster()
    raycaster.set(this.camera.position, vector.sub(this.camera.position).normalize())
    const intersects = raycaster.intersectObject(model, true)
    let intersection = null
    for (let i = 0; i < intersects.length; i++) {
      intersects[0].object.userData.pick_ignore = intersects[i].object.material.opacity < opacity_threshold

      if (!intersects[i].object.userData.pick_ignore && intersects[i].face && intersects[i].object.userData.original_data) {
        intersection = intersects[i]
        break
      }
    }

    let vertex_data = null
    if (intersection && intersection.face) {
      const intersect_object = intersection.object
      const { x: cx, y: cy, z: cz } = intersect_object.userData.centroid ? intersect_object.userData.centroid : { x: 0, y: 0, z: 0 }
      const intersect_indices = intersection.face ? [intersection.face.a, intersection.face.b, intersection.face.c] : []
      const inv_matrix = new THREE.Matrix4()
      inv_matrix.getInverse(intersect_object.matrixWorld)
      const intersect_point = intersection.point.applyMatrix4(inv_matrix)

      const original_vertices = intersect_object.userData.original_data.vertices
      let index = intersect_indices[0]
      let intersect_vertex_index = index
      let intersect_vertex_coords = new THREE.Vector3(
        original_vertices[index * 3],
        original_vertices[index * 3 + 1],
        original_vertices[index * 3 + 2]
      )

      let min_distance = intersect_point.distanceTo(
        new THREE.Vector3(intersect_vertex_coords.x - cx, intersect_vertex_coords.y - cy, intersect_vertex_coords.z - cz)
      )

      for (let i = 0; i < intersect_indices.length; i++) {
        index = intersect_indices[i]
        const coords = new THREE.Vector3(original_vertices[index * 3], original_vertices[index * 3 + 1], original_vertices[index * 3 + 2])
        const distance = intersect_point.distanceTo(new THREE.Vector3(coords.x - cx, coords.y - cy, coords.z - cz))

        if (distance < min_distance) {
          intersect_vertex_index = index
          intersect_vertex_coords = coords
          min_distance = distance
        }
      }

      vertex_data = {
        index: intersect_vertex_index,
        point: intersect_vertex_coords,
        object: intersect_object,
      }
    } else {
      // fixme:  走到这里，说明没有交点，但是这里的逻辑有问题，需要修复; 应该需要在旋转后，调整一下相机的位置，使得交点在视野中
      // todo: 应该添加mouseDrag 方法，在方法最后
      console.log('no intersection')
    }

    return vertex_data
  }
}
