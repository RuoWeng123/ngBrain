import { AMFLoader } from 'three/examples/jsm/loaders/AMFLoader.js'
import * as THREE from 'three'
import { arrowGroup } from "ngBrain/bat/indicator";

const setOpacity = (batObj: any, opacity = 0.9, shininess = 0.3) => {
  batObj.children.forEach((item: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    item.children.length &&
      item.children.forEach((batMesh: any) => {
        batMesh.material.transparent = true
        batMesh.material.opacity = opacity
        batMesh.material.shininess = shininess
      })
  })

  return batObj
}

const setBatCenterPoint = (batObj: any) => {
  batObj.children = batObj.children.filter((item: any) => item.name !== 'batCenter')

  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    color: 0xd36f66,
  })

  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(0, 0, -12)
  sphere.name = 'batCenter'
  sphere.parent = batObj
  batObj.children.push(sphere)

  return batObj
}
const setBatCircle = (batObj: any) => {
  const batCircleObjs = batObj.children.filter((item: any) => item.name === 'batCircle')

  // this.freeBufferList(batCircleObjs);

  batObj.children = batObj.children.filter((item: any) => item.name !== 'batCircle')

  const geometry = new THREE.RingGeometry(10, 11, 30)
  // 灰色圆环
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  })

  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(0, 0, -12)
  sphere.name = 'batCircle'
  sphere.parent = batObj
  batObj.children.push(sphere)

  return batObj
}

const setBatCenterLine = (batObj: any) => {
  batObj.children = batObj.children.filter((item: any) => item.name !== 'batCenterLine')

  // const coilCenter = [0, 0, 0, 1];
  // const coilY = [0, 1, 0, 1];

  const material = new THREE.LineBasicMaterial({
    color: 0xff851b,
    linewidth: 2,
  })
  const points = []
  points.push(new THREE.Vector3(0, 0, -120))
  points.push(new THREE.Vector3(0, 0, 0))
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const line = new THREE.Line(geometry, material)

  line.name = 'batCenterLine'
  line.visible = false

  batObj.add(line)

  return batObj
}
export const initBat = (surface: any) => {
  const loader = new AMFLoader()
  loader.load('originalData/ngBat5.amf', (object: any) => {
    object.position.set(0,0,99);

    object.name = 'ngBat'
    object = setAngle(object, { angle: 20, horizontalAngle: 90 })
    object = setTranslation(object, {angle: 30, distance: 30, x: 0, y: 0})
    object.scale.set(0.7, 0.7, 0.7)
    object.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI);
    surface.viewer.model_data.add('ngBat', object)
  })
}

type angleType = {
  angle: number
  horizontalAngle: number
}
type translationType = {
  angle: number
  distance: number
  x: number
  y: number
}
export const setAngle = (batObj: any, angleParams:angleType) => {
  const batAngleName = 'batAngle';
  // 清空已有的对象内存
  const batAngleObjs = batObj.children.filter((obj: any) => obj.name === batAngleName);
  freeBufferList(batAngleObjs);

  batObj.children = batObj.children.filter((obj: any) => obj.name !== batAngleName);
  const { angle, horizontalAngle } = angleParams;
  if (angle > 5) { // 小于5度 不渲染
    const canFlash = angle <= 30;
    // const flashVisible = canFlash ? (this.countFlashVisible(angle <= 8)) : true;
    if (!canFlash) return batObj;

    const batAngleObj = arrowGroup(angle, horizontalAngle, 10);
    batAngleObj.name = batAngleName;
    batAngleObj.position.set(0, 0, -8.2);
    batAngleObj.parent = batObj;
    batObj.children.push(batAngleObj);
  }

  return batObj;
}

export const setTranslation = (batObj: any, translation: translationType) => {
  const safeDistance = 4;
  const batTranslationName = 'batTranslation';
  // 清空占用内存
  const translationObjs = batObj.children.filter((obj: any) => obj.name === batTranslationName);
  freeBufferList(translationObjs);

  batObj.children = batObj.children.filter((obj: any) => obj.name !== batTranslationName);
  const { distance, angle, x, y } = translation;

  // safeDistance - 30mm 闪烁
  const canFlashDistance = distance <= 40 && distance > safeDistance;
  if (distance > safeDistance) { // 小于3mm 不渲染
    // safeDistance-5mm 快闪 5-30 慢闪
    // const flashVisible = canFlashDistance ?
    //   (this.countFlashVisible(distance < 5)) : true;
    if (canFlashDistance) {
      // 闪烁影响效率，移出
      // const flashOpacity = this.countFlashOpacity(distance < 5);
      const batTranslationObj = arrowGroup(0, angle, distance);
      batTranslationObj.name = batTranslationName;
      batTranslationObj.position.set(0, 0, 5);
      batTranslationObj.parent = batObj;
      batObj.children.push(batTranslationObj);
    }
  }

  // 绘制法线的投射点 距离<=safeDistance 点变绿 闪烁

  // 判断闪烁条件 间隔的显示和隐藏点
  const flashVisible = true; // this.countFlashVisible();
  if (distance <= safeDistance && !flashVisible) return batObj;

  const color = distance > safeDistance ? 0xD36F66 : 0x8CAB39;
  const geometry = new THREE.SphereGeometry(4, 24, 24);
  const material = new THREE.MeshBasicMaterial({
    color,
  });

  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y , -7.2);
  sphere.name = batTranslationName;

  sphere.parent = batObj;
  batObj.children.push(sphere);

  return batObj;
}

// GPU释放
export const freeBufferList = (objList: any) => {
  objList.forEach((obj: any) => freeBuffer(obj));
}
const freeBuffer = (obj3d: any) => {
  if (!obj3d) return;

  if (obj3d.children && obj3d.children.length) {
    freeBufferList(obj3d.children);
  }

  if (obj3d.geometry) {
    obj3d.geometry.dispose();
  }
  if (obj3d.material) {
    obj3d.material.dispose();
  }
}
// 调整拍子位置和角度
export const setBatPosition = (surface: any, translation: translationType, angle: angleType) => {
  // 先绘制拍子上的指示器
  let obj3d = surface.viewer.model_data.get('ngBat')
  console.log('obj3d', obj3d);
  if (!obj3d) {
    return
  }
  obj3d = setAngle(obj3d, angle)
  obj3d = setTranslation(obj3d, translation)
  surface.render();
  // 再调整拍子位置和角度
}
