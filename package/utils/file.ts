const pialUrl = "originalData/pial.gii.gz";
const pialLoadModelData = {
  url: pialUrl,
  options: {
    filename: 'pial.gii.gz',
    resultType: "arraybuffer",
    format: "gifti",
    model_name: "pial_gii",
    content_type: "text",
    opacity: 99
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
    opacity: 80
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
