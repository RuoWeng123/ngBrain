import { SurfaceBase, default_camera_distance } from './base'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
// @ts-ignore
import * as THREE from 'three'
export class ngControl extends SurfaceBase {
  constructor(element: string) {
    super(element)
  }
  public gui: any

  public initGui = () => {
    this.gui = new GUI()
    const autoRotateFolder = this.gui.addFolder('autoRotate')
    autoRotateFolder.add(this.viewer.autoRotate, 'x').onChange((value: boolean) => {
      this.viewer.autoRotate.x = value
      this.renderFrame()
    })
    autoRotateFolder.add(this.viewer.autoRotate, 'y').onChange((value: boolean) => {
      this.viewer.autoRotate.y = value
      this.renderFrame()
    })
    autoRotateFolder.add(this.viewer.autoRotate, 'z').onChange((value: boolean) => {
      this.viewer.autoRotate.z = value
      this.renderFrame()
    })
    const zoomFolder = this.gui.addFolder('zoom')
    zoomFolder.add(this.viewer, 'zoom', 0.1, 2).onChange(() => {
      this.camera.position.set(0, 0, default_camera_distance * this.viewer.zoom)
      this.renderFrame()
    })

    this.ambientLight()

    this.debugMaterialGui('scalp_mask')
  }

  public ambientLight = () => {
    const ambientLight = this.scene.getObjectByName('ambientLight')
    if (!ambientLight) return
    const data = {
      background: '#000000',
      ambient_light: ambientLight.color.getHex(),
    }
    const LightFolder = this.gui.addFolder('scene')
    LightFolder.addColor(data, 'ambient_light').onChange((value: string | number) => {
      if (typeof value === 'string') {
        value = value.replace('#', '0x')
      }
      ambientLight.color.setHex(value)
      this.viewer.updated = true
      this.renderFrame()
    })
  }

  public debugMaterialGui = (modelName: string) => {
    const targetModelName = modelName.endsWith('_1') ? modelName : `${modelName}_1`
    const object3D = this.scene.getObjectByName(targetModelName)
    if (!object3D) return
    const data = {
      color: object3D.material.color.getHex(),
      emissive: object3D.material.emissive.getHex(),
      emissiveIntensity: object3D.material.emissiveIntensity,
      roughness: object3D.material.roughness,
      metainess: object3D.material.metalness,
    }
    const materialFolder = this.gui.addFolder('object3DMaterial')
    materialFolder.addColor(data, 'color').onChange((value: string | number) => {
      if (typeof value === 'string') {
        value = value.replace('#', '0x')
      }
      object3D.material.color.setHex(value)
      object3D.material.color.convertSRGBToLinear()
      this.viewer.updated = true
      this.renderFrame()
    })
    materialFolder.addColor(data, 'emissive').onChange((value: string | number) => {
      if (typeof value === 'string') {
        value = value.replace('#', '0x')
      }
      object3D.material.emissive.setHex(value)
      object3D.material.emissive.convertSRGBToLinear()
      this.viewer.updated = true
      this.renderFrame()
    })
    materialFolder.add(data, 'emissiveIntensity', 0, 1).onChange((value: number) => {
      object3D.material.emissiveIntensity = value
      this.viewer.updated = true
      this.renderFrame()
    })
    materialFolder.add(data, 'metainess', 0, 1).onChange((value: number) => {
      object3D.material.metainess = value
      this.viewer.updated = true
      this.renderFrame()
    })
    materialFolder.add(data, 'roughness', 0, 1).onChange((value: number) => {
      object3D.material.roughness = value
      this.viewer.updated = true
      this.renderFrame()
    })
  }
  private handleColorChange = (color: any, converSRGBToLinear: boolean) => {
    return function (value: string | number) {
      if (typeof value === 'string') {
        value = value.replace('#', '0x')
      }
      color.setHex(value)
      if (converSRGBToLinear) {
        color.convertSRGBToLinear()
      }
    }
  }

  public destroyGui = () => {
    this.gui.destroy()
  }
}
