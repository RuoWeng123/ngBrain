// @ts-ignore
import * as THREE from 'three'
import { NGArrowHelper } from './ngArrowHelper'

type vector = { x: number; y: number; z: number }
const colorAngle = 0x459ba8
const emissive = 0x042a1d
const colorLine = 0x7e50cd
const Degree = Math.PI / 180

const subAngles = [0, 135, 140, 150, 160]
const lastXZAngle = 160

const indicator = () => {
  // 做group 的角度调整
}
// eslint-disable-next-line no-warning-comments
// let arrowObj = arrowGroup(32, 135, 60);
// arrowObj.position.set(0, -10, 0);
// viewer.model.add(arrowObj);
// x 指向6点钟   y指向9点钟   z 指向表内側
// horizontalAngle 从九点钟方向，逆时针旋转
// angle: 相对于表盘，方向超上。构成的角度时正的。
const arrowGroup = (angle: number, horizontalAngle: number, distance: number = 0, flashOpacity: number = 1) => {
  const group = new THREE.Group()
  const { splinePath, dir, start } = basePath(angle, horizontalAngle, distance, flashOpacity)
  const arrowObj = arrow(dir, start, 18, 20, 16, angle)
  group.add(splinePath)
  group.add(arrowObj)
  if (angle > 0) {
    const { splineDashPath } = dashPath(angle, horizontalAngle)
    group.add(splineDashPath)
  }

  group.scale.set(0.6,0.6,0.6)

  return group
}

// x 指向9点钟   z指向6点钟   z 指向表内側
// horizontalAngle 从九点钟方向，逆时针旋转
// angle: 相对于表盘，方向超上。构成的角度时正的。
const basePath = (angle: number, horizontalAngle: number, distance: number = 0, flashOpacity: number = 1) => {
  const opacity = 1
  const params = {
    color: angle > 3 ? colorAngle : colorLine,
    transparent: true,
    opacity,
    emissive: emissive,
  }
  let material = new THREE.MeshLambertMaterial(params)
  if (angle === 0) {
    material = new THREE.MeshBasicMaterial(params)
  }
  // const curve = formatCurve(angle, horizontalAngle, distance);
  const curve = formatCircleCurve(angle, horizontalAngle, distance, -60)

  const points = curve.getPoints(50)
  // console.log(points);
  let dir = { x: points[48].x - points[47].x, y: points[48].y - points[47].y, z: points[48].z - points[47].z }
  let start = points[48]
  if (angle > 30) {
    start = points[50]
  } else if (angle > 10) {
    start = points[45]
  } else if (angle > 3) {
    start = points[40]
  }
  if (angle === 0) {
    dir = { x: points[50].x - points[10].x, y: points[50].y - points[10].y, z: points[50].z - points[10].z }
    start = points[50]
  }

  const tubeR = 1.5
  const geometrySpline = new THREE.TubeGeometry(curve, 40, tubeR, 10, false)

  const pathMesh = new THREE.Mesh(geometrySpline, material)

  return {
    splinePath: pathMesh,
    dir,
    start,
  }
}

const dashPath = (angle: number, horizontalAngle: number) => {
  const material = new THREE.LineDashedMaterial({
    color: colorAngle,
    linewidth: 1,
    scale: 1,
    dashSize: 2,
    gapSize: 1,
  })
  // const curve = formatCurve(angle, horizontalAngle);
  const curve = chordDash(angle, horizontalAngle)

  const points = curve.getPoints(50)
  // console.log(points);
  const dir = { x: points[47].x - points[46].x, y: points[47].y - points[46].y, z: points[47].z - points[46].z }
  const start = points[48]
  const geometrySpline = new THREE.BufferGeometry().setFromPoints(points)
  // geometrySpline.scale.set(2,2,2);
  const line = new THREE.Line(geometrySpline, material)
  line.computeLineDistances()

  return {
    splineDashPath: line,
    dirDash: dir,
    startDash: start,
  }
}

const arrow = (direction: vector, start: vector, length: number, headerLength: number, headerWidth: number, angle: number) => {
  const dir = new THREE.Vector3(direction.x, direction.y, direction.z)

  dir.normalize()

  const origin = new THREE.Vector3(start.x, start.y, start.z)
  const hex = angle > 3 ? colorAngle : colorLine
  const params = {
    color: angle > 3 ? colorAngle : colorLine,
    transparent: true,
    opacity: 1,
    emissive: emissive,
  }
  let material = new THREE.MeshLambertMaterial(params)
  if (angle === 0) {
    material = new THREE.MeshBasicMaterial(params)
  }
  const coneMaterial = {
    isLambert: angle > 3,
    material: material,
  }

  const arrowObj = new NGArrowHelper(dir, origin, length, hex, headerLength, headerWidth, coneMaterial) as any
  // arrowObj.rotateX(15* Degree);
  const opacity = 1

  arrowObj.children[1].material.transparent = true
  arrowObj.children[1].material.opacity = opacity

  return arrowObj
}

const formatCircleCurve = (angle: number, horizontalAngle: number, distance: number, offsetAngle = -40) => {
  if (angle === 0) {
    return chordSolid(angle, horizontalAngle, distance)
  }
  const R = getRByAngle(angle, distance)

  return new THREE.CatmullRomCurve3(
    subAngles.map((subAngle: number) => countVector3(subAngle, horizontalAngle, R, offsetAngle)),
    false,
    'chordal'
  )
}

// 现画一个半圆，然后将这个半圆倾倒offsetAngle角度。
const countVector3 = (angle: number, horizontalAngle: number, R: number, offsetAngle = 40) => {
  const angleXZ = angle === subAngles[subAngles.length - 1] ? lastXZAngle : angle
  let x = columnX(angleXZ, horizontalAngle, R)
  let y = columnY(angleXZ, horizontalAngle, R)
  const z = columnZ(angle, horizontalAngle, R, angle)

  x = x + z * Math.sin(Degree * offsetAngle) * Math.sin(Degree * horizontalAngle)
  y = y - z * Math.sin(Degree * offsetAngle) * Math.cos(Degree * horizontalAngle)

  return new THREE.Vector3(x, y, -z)
}

// 用来生成虚弦路径
const chordDash = (angle: number, horizontalAngle: number, distance = 10) => {
  const R = getRByAngle(angle, distance)

  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(columnX(180, horizontalAngle, R), columnY(180, horizontalAngle, R), 0),
  ])
}

const chordSolid = (angle: number, horizontalAngle: number, distance = 10) => {
  const batCircleR = 5 // 拍子圆半径为5mm
  const R = getRByAngle(angle, distance) + batCircleR

  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(columnX(180, horizontalAngle, batCircleR), columnY(180, horizontalAngle, batCircleR), -23),
    new THREE.Vector3(columnX(180, horizontalAngle, R), columnY(180, horizontalAngle, R), -23),
  ])
}
// distance 毫米
// const getArrowLength = (angle: number, distance=0)=>{
//   if(angle > 15){
//     return 10;
//   }else if(angle > 8){
//     return 10;
//   }else if (angle >0){
//     return 4;
//   } else{
//     if (distance > 50) {
//       return 10;
//     } else {
//       return 10;
//     }
//   }
// };

const columnX = (tempAngle: number, horizontalAngle: number, R: number) => {
  if (tempAngle <= 90) {
    return (R - R * Math.cos(tempAngle * Degree)) * Math.cos(horizontalAngle * Degree)
  } else {
    return (R + R * Math.cos((180 - tempAngle) * Degree)) * Math.cos(horizontalAngle * Degree)
  }
}
const columnZ = (tempAngle: number, horizontalAngle: number, R: number, angle: number) => {
  const ratio = angle > 30 ? 2 / 3 : angle / 45

  return R * ratio * Math.sin(tempAngle * Degree)
}
const columnY = (tempAngle: number, horizontalAngle: number, R: number) => {
  if (tempAngle <= 90) {
    return (R - R * Math.cos(tempAngle * Degree)) * Math.sin(horizontalAngle * Degree)
  } else {
    return (R + R * Math.cos((180 - tempAngle) * Degree)) * Math.sin(horizontalAngle * Degree)
  }
}

const getRByAngle = (angle: number, distance = 10) => {
  angle = angle > 30 ? 30 : angle
  let R: number = 0
  if (angle === 0) {
    R = distance > 30 ? 30 : distance
  } else {
    R = (50 * (angle + 30)) / 60
  }

  return R
}
export { arrowGroup, indicator, dashPath }
