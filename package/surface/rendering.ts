import type { PialModelDataType, ScalpModelDataType, SurfaceOptionsType } from "../utils/types";
import * as THREE from 'three';

export const displayModel = (model_data: PialModelDataType | ScalpModelDataType, filename: string, options: SurfaceOptionsType) =>{
  const {shapes, model_data: new_model_data } = createModel(model_data, filename, options);
  return {
    shapes,
    model_data: new_model_data,
  }
}
const createModel = (model_data: PialModelDataType | ScalpModelDataType, filename: string, options: SurfaceOptionsType) =>{
  const shapes = model_data.shapes;
  const newShapes = [];
  const is_line = model_data.type === 'line';
  let object_description;
  let normal_buffer, color_buffer;

  // @ts-ignore
  const vertices = Array.isArray(model_data.vertices) ? model_data.vertices : Object.values(model_data.vertices);
  const position_buffer = new THREE.BufferAttribute(new Float32Array(vertices), 3);
  if(model_data.normals){
    // @ts-ignore
    const normals = Array.isArray(model_data.normals) ? model_data.normals : Object.values(model_data.normals);
    normal_buffer = new THREE.BufferAttribute(new Float32Array(normals), 3);
  }
  if(model_data.colors){
    // @ts-ignore
    const colors = Array.isArray(model_data.colors) ? model_data.colors : Object.values(model_data.colors);
    color_buffer = new THREE.BufferAttribute(new Float32Array(colors), 4);
  }

  model_data.name = model_data.name || options.model_name || filename;

  if(shapes){
    for(let i = 0, count = shapes.length; i < count; i++){
      const shape_data = shapes[i];
      if(shape_data.indices.length === 0){
        continue;
      }

      object_description = {
        position: position_buffer,
        normal: normal_buffer,
        color: color_buffer,
        // @ts-ignore
        index: new THREE.BufferAttribute(new Uint32Array(Array.isArray(shape_data.indices) ? shape_data.indices : Object.values(shape_data.indices)), 1),
        is_line,
        centroid: shape_data.centroid,
      }

      const shape = createShape(object_description, options);
      shape.name = shape_data.name || `${options.model_name}_${i+1}`;

      shape.userData = {
        model_name: model_data.name,
        original_data:{
          vertices: model_data.vertices,
          indices: shape_data.indices,
          normals: model_data.normals,
          colors: model_data.colors,
        }
      };

      newShapes.push(shape);
    }
  }

  return {
    shapes: newShapes,
    model_data,
  }
}

const createShape = (object_description: any, options: SurfaceOptionsType) =>{
  let shape;
  const geometry = new THREE.BufferGeometry();
  let material;
  const { position, normal, color, index, is_line, centroid } = object_description

  geometry.dynamic = true;
  if (index) {
    geometry.setIndex(index);
  }
  geometry.setAttribute('position', position)
  if (normal) {
    geometry.setAttribute('normal', object_description.normal)
  } else {
    geometry.computeVertexNormals();
  }
  if (color) {
    geometry.setAttribute('color', color)
  }

  if(is_line){
    material = new THREE.LineBasicMaterial({vertexColors: THREE.VertexColors});
    shape = new THREE.Line(geometry, material, THREE.LineSegments);
  } else {
    material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    });
    material.opacity = options.opacity / 100 || 1;

    console.log('material', material);
    console.log('geometry', geometry);
    shape = new THREE.Mesh(geometry, material);
    shape.userData.has_wireframe = true;
  }

  shape.userData.centroid = centroid;

  return shape;
}
