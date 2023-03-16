type BoundingBoxType = {
  min_x: number;
  min_y: number;
  min_z: number;
  max_x: number;
  max_y: number;
  max_z: number;
}
type CoordinateType = {
  x: number;
  y: number;
  z: number;
}
type ShapeType = {
  name?: string;
  bounding_box: BoundingBoxType;
  centroid: CoordinateType;
  indices: number[];
}

type PialModelDataType = {
  name?: string;
  bounding_box: BoundingBoxType;
  colors: number[];
  shapes: ShapeType[];
  size: CoordinateType;
  type: string;
  vertices: number[];

  normals: undefined;
}

type IDBModelDataType = {
  fileName: string
  data: PialModelDataType | ScalpModelDataType;
}


type ScalpModelDataType = {
  name?: string;
  bounding_box: BoundingBoxType;
  colors: number[];
  shapes: ShapeType[];
  size: CoordinateType;
  type: string;
  vertices: number[];
  normals: number[];
  surface_properties:{
    ambient: number;
    diffuse: number;
    transparency: number;
    specular_reflectance: number;
    specular_scattering: number;
  }
}

type ParcApracDataType = {
  filename: string;
  data:{
    max: number;  // 35
    min: number; // 0
    values:[number]; // Float32Array[]
  }
}

type ParcA2009sDataType = {
  filename: 'lhrh_anat_parc_a2009s.txt.gz';
  data:{
    max: number; // 75
    min: number; // 0
    values:[number], // Float32Array[]
  }
}
type FormatOptionType = 'gifti' | 'mniobj' | 'text';
type ModelNameType = 'pial_gii' | 'scalp_mask' | 'parc_aparc' | 'parc_a2009s';

type SurfaceOptionsType = {
  filename: string;
  format: FormatOptionType;
  model_name: ModelNameType;
  resultType: 'arraybuffer';

  content_type: 'text';
  opacity: number;

  complete?: (data: any) => void;
}
export type {
  BoundingBoxType,
  CoordinateType,
  ShapeType,
  PialModelDataType,
  ScalpModelDataType,
  ParcApracDataType,
  ParcA2009sDataType,
  SurfaceOptionsType,
  IDBModelDataType,
}
