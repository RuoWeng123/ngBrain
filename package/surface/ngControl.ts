import { Surface, default_camera_distance } from "./surface";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
// @ts-ignore
import * as THREE from 'three';
export class ngControl extends Surface {
  constructor(element: string) {
    super(element);
  }
  public gui: any;

  public initGui = () => {
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
      console.log(this.light);
      console.log(this.scene.children[1]);
      console.log(this.scene);
      this.light.intensity = val;
      this.viewer.updated = true;
      this.renderFrame();
    });
    setLightFolder.add(this.light, 'type', ['DirectionalLight', 'AmbientLight', 'PointLight', 'SpotLight']).onChange((val: string) => {
      this.scene.remove(this.light);
      switch (val) {
        case 'AmbientLight':
          this.light = new THREE.AmbientLight(0xd1d0d7, 0.5);
          break;
        case 'DirectionalLight':
          this.light = new THREE.DirectionalLight(0xefedf5, 1);
          break;
        case 'PointLight':
          this.light = new THREE.PointLight(0xefedf5, 0.7);
          break;
        default:
          this.light = new THREE.PointLight(0xefedf5, 0.7);
          break;
      }
      this.light.position.set(0, 0, default_camera_distance);
      this.scene.add(this.light);
      this.viewer.updated = true;
      this.renderFrame();
    });

    const setPialMaterialFolder = this.gui.addFolder('setPialMaterial');
    setPialMaterialFolder
    .add(this.scene, 'type', ['MeshLambertMaterial', 'MeshPhongMaterial', 'MeshStandardMaterial', 'MeshPhysicalMaterial'])
    .onChange((val: string) => {
      const pialObject3D = this.scene.getObjectByName('pial_gii_1');
      switch (val) {
        case 'MeshLambertMaterial':
          pialObject3D.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
          break;
        case 'MeshPhongMaterial':
          pialObject3D.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
          break;
        case 'MeshStandardMaterial':
          pialObject3D.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x262626,
            transparent: true,
          });
          break;
        case 'MeshPhysicalMaterial':
          pialObject3D.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 1,
            reflectivity: 0.5,
          });
          break;
        default:
          pialObject3D.material = new THREE.MeshLambertMaterial({ color: 0xffffff });
          break;
      }
      this.viewer.updated = true;
      this.renderFrame();
    });
  };

  public destroyGui = () => {
    this.gui.destroy();
  };

}
