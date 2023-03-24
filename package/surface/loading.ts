import type { PialModelDataType, ScalpModelDataType, SurfaceOptionsType } from "ngBrain/utils/types";
import axios from "axios";
import { displayModel } from "ngBrain/surface/rendering";
import { getFile, setFile } from "ngBrain/utils/idbData";

const checkBinary = (options: SurfaceOptionsType) => {
  options.resultType = 'arraybuffer';
  return options;
}

const loadFromURL = async (url: string, options: SurfaceOptionsType) => {
  options = options || {};
  const parts = url.split("/");
  const parts2 = parts[parts.length - 1].split("?");
  const filename = parts2[0];

  const res = await axios.get(url);
  return {
    result: res.data,
    filename,
    options
  }
};

const unrollColors = (colors: number[], num_vertices: number) =>{
  const unrolledColors = new Float32Array(num_vertices * 4);
  const [dataColor1, dataColor2, dataColor3, dataColor4] = colors;
  for (let i = 0; i < unrolledColors.length; i += 4) {
    unrolledColors[i] = dataColor1;
    unrolledColors[i+1] = dataColor2;
    unrolledColors[i+2] = dataColor3;
    unrolledColors[i+3] = dataColor4;
  }
  return unrolledColors;
}
const loadIndexedModel = (model_data: PialModelDataType | ScalpModelDataType) => {
  if (model_data.colors.length === 4) {
    const verts = model_data.vertices;
    // @ts-ignore
    model_data.colors = unrollColors(model_data.colors, verts.length / 3);

    return model_data;
  } else {
    return model_data;
  }
};
const workerMap = new Map();
workerMap.set('gifti', 'gifti.worker.js');
workerMap.set('mniobj', 'mniobj.worker.js');
workerMap.set('text', 'text.intensity.worker.js');
workerMap.set('json','json.worker.js');
const parseModel = (result: any, type: string, options: SurfaceOptionsType, callback: (model_data: PialModelDataType | ScalpModelDataType) => void) => {
  const workerUrl = `../workers/${workerMap.get(type)}`;
  const workerInstance = new Worker(workerUrl);
  workerInstance.postMessage({ data: result, options, url: 'http://127.0.0.1:5173/' });
  workerInstance.addEventListener('message', (e) => {
    let model_data = e.data;
    if (model_data.error) {
      // todo events 抛出事件
      // events.triggerEvent("error", { message: model_data.error });
      throw new Error(model_data.error);
    }
    model_data.colors = model_data.colors || new Float32Array([0.7, 0.7, 0.7, 1.0]);
    // 颜色colors加工
    model_data = loadIndexedModel(model_data);
    callback(model_data);

    workerInstance.terminate();
  });
};
export const loadModelFromUrl = async (url: string, options: SurfaceOptionsType, callback: any) => {
  const res = await getFile(url);
  if (res) {
    callback(res.value.data, options.filename, options);

    return;
  }

  const newOptions = checkBinary(options);
  options.cachedUrl = url;

  const {result, filename, options: lastOptions} = await loadFromURL(url, newOptions);

  const type = options.format || 'mniobj';
  parseModel(result, type, lastOptions, (model_data: PialModelDataType | ScalpModelDataType) => {
    setFile( url, {data: model_data, filename: 'pial.gii.gz'});
    callback(model_data, filename, lastOptions);
  });
};
