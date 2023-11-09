/* eslint-disable no-underscore-dangle */
import * as THREE from 'three'

const _axis = /* @__PURE__*/ new THREE.Vector3()
let _lineGeometry
let _coneGeometry

class NGArrowHelper extends THREE.Object3D {
  // dir is assumed to be normalized

  constructor(
    dir = new THREE.Vector3(0, 0, 1),
    origin = new THREE.Vector3(0, 0, 0),
    length = 1,
    color = 0xffff00,
    headLength = length * 0.2,
    headWidth = headLength * 0.2,
    lambertMaterial = { isLambert: false, material: {} }
  ) {
    super()

    this.type = 'ArrowHelper'

    if (_lineGeometry === undefined) {
      _lineGeometry = new THREE.BufferGeometry()
      _lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3))

      _coneGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 20, 1)
      _coneGeometry.translate(0, -0.5, 0)
    }

    this.position.copy(origin)

    this.line = new THREE.Line(_lineGeometry, new THREE.LineBasicMaterial({ color: color, toneMapped: false }))
    this.line.matrixAutoUpdate = false
    this.add(this.line)

    let coneMaterial = new THREE.MeshBasicMaterial({ color: color, toneMapped: false })
    if (lambertMaterial.isLambert) {
      coneMaterial = lambertMaterial.material
    }

    this.cone = new THREE.Mesh(_coneGeometry, coneMaterial)
    this.cone.matrixAutoUpdate = false
    this.add(this.cone)

    this.setDirection(dir)
    this.setLength(length, headLength, headWidth)
  }

  setDirection(dir) {
    // dir is assumed to be normalized

    if (dir.y > 0.99999) {
      this.quaternion.set(0, 0, 0, 1)
    } else if (dir.y < -0.99999) {
      this.quaternion.set(1, 0, 0, 0)
    } else {
      _axis.set(dir.z, 0, -dir.x).normalize()

      const radians = Math.acos(dir.y)

      this.quaternion.setFromAxisAngle(_axis, radians)
    }
  }

  setLength(length, headLength = length * 0.2, headWidth = headLength * 0.2) {
    this.line.scale.set(1, Math.max(0.0001, length - headLength), 1) // see #17458
    this.line.updateMatrix()

    this.cone.scale.set(headWidth, headLength, headWidth)
    this.cone.position.y = length
    this.cone.updateMatrix()
  }

  setColor(color) {
    this.line.material.color.set(color)
    this.cone.material.color.set(color)
  }

  copy(source) {
    super.copy(source, false)

    this.line.copy(source.line)
    this.cone.copy(source.cone)

    return this
  }
}

export { NGArrowHelper }
