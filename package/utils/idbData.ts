import Dexie from 'dexie';
const ngDb = new Dexie('ng_brain');
const initDb = function(){
  ngDb.version(2).stores({
    file: 'id, value',
  })
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
