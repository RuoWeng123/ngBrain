import type { headerType, VolumeDescriptionType } from "ngBrain/volume/types";
import { createBaseVolume } from "ngBrain/volume/loader/common/volume/base";

export const createNiftiVolume = async function(header: headerType, raw_data:ArrayBuffer | undefined, description: VolumeDescriptionType){
  const volume = createBaseVolume(header, raw_data);
  volume.type = 'nifti';
  volume.intensity_min = header.voxel_min;
  volume.intensity_max = header.voxel_max;

  return volume;
}
