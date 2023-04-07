import { setFile, getFile } from "ngBrain/utils/idbData";

export const getCachedDataOfNative = async (url: string) =>{
  return await getFile(url);
}

export const setCachedDataOfNativee = (url: string, data: any) =>{
  setFile(url, data);
}
