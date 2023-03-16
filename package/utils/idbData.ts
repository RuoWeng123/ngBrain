import Dexie from 'dexie';
import { pialUrl, scalpUrl } from './file';
import { pialModelData } from './pialModelData';
import { scalpModelData } from './scalpModelData';
const ngDb = new Dexie('ng_brain');
const initDb = function(){
  ngDb.version(2).stores({
    file: 'id, value',
  })
  ngDb.file.put({id: pialUrl, value: {data: pialModelData, filename: 'pial.gii.gz'}},[pialUrl]);
  ngDb.file.put({id: scalpUrl, value: {data: scalpModelData, filename: 'scalp_mask.obj.gz'}},[scalpUrl]);
}
const setFile = function(id: string, data: any) {
  // @ts-ignore
  ngDb.file.put({id: id, value: data }, [id]);
}

const getFile = async function(id: string) {
  // @ts-ignore
  return await ngDb.file.get(id);
}

export {
  initDb,
  setFile,
  getFile,
}