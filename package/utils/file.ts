const pialUrl = "originalData/pial.gii.gz";
const pialLoadModelData = {
  url: pialUrl,
  options: {
    filename: 'pial.gii.gz',
    resultType: "arraybuffer",
    format: "gifti",
    model_name: "pial_gii",
    content_type: "text",
    isDebug: true,
    material: {
      name:'pial_gii',
      color: 0XB7B7B7,
      emissive: 0xc9c9c9,
      emissiveIntensity: 0.6,
      roughness: 1,
      transparent: true,
      opacity: 1,
    }
  }
};
const scalpUrl = "originalData/scalp_mask.obj.gz";

const scalpLoadModelData = {
  url: scalpUrl,
  options: {
    filename:'scalp_mask.obj.gz',
    result_type: "arraybuffer",
    format: "mniobj",
    model_name: "scalp_mask",
    content_type: "text",
    opacity: 80,
    isDebug: true,
    material: {
      name: 'scalp_mask',
      color: 0XBAB9BE,
      roughness: 1,
      transparent: true,
      opacity: 1,
    }
  },
}
const parcUrl = "originalData/parc_aparc.txt.gz";
export {
  pialUrl,
  pialLoadModelData,
  scalpUrl,
  scalpLoadModelData,
  parcUrl,
}
