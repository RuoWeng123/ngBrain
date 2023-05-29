import SurfaceView from '@/views/surfaceView.vue'
import * as THREE from 'three'
import type { CoordinateType } from 'ngBrain/utils/types'
type DotType = {
  position: CoordinateType
  color: number
  radius: number
}

export const drawDot = (viewer: SurfaceView, dot: DotType) => {
  const material = new THREE.MeshPhongMaterial({
    color: dot.color ? dot.color : 0x156289,
    specular: 0xffffff,
    shininess: 10,
  })
  const radius = dot.radius ? dot.radius : 2

  const geometry = new THREE.SphereGeometry(radius, 32, 32)
  const sphere = new THREE.Mesh(geometry, material)
  sphere.name = 'dot'
  sphere.position.set(dot.position.x, dot.position.y, dot.position.z)
  viewer.scene.add(sphere)
  viewer.updated = true
  viewer.render()
}
