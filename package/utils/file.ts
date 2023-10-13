const pialUrl = 'originalData/305/pial.gii.gz'
const pialLoadModelData = {
  url: pialUrl,
  options: {
    filename: 'pial.gii.gz',
    resultType: 'arraybuffer',
    format: 'gifti',
    model_name: 'pial_gii',
    content_type: 'text',
    isDebug: true,
    material: {
      name: 'pial_gii',
      color: 0xb7b7b7,
      emissive: 0x404040,
      emissiveIntensity: 0.9,
      roughness: 0.9,
      transparent: true,
      opacity: 1,
    },
  },
}
const scalpUrl = 'originalData/305/scalp_mask.obj.gz'

const scalpLoadModelData = {
  url: scalpUrl,
  options: {
    filename: 'scalp_mask.obj.gz',
    result_type: 'arraybuffer',
    format: 'mniobj',
    model_name: 'scalp_mask',
    content_type: 'text',
    opacity: 80,
    isDebug: true,
    material: {
      name: 'scalp_mask',
      color: 0x8e897e,
      emissive: 0xa3a3a3,
      emissiveIntensity: 0.27,
      roughness: 1,
      transparent: true,
      opacity: 1,
    },
  },
}
const parcUrl = 'originalData/305/lhrh_anat_parc_aparc.txt.gz'
const parcColorMapUrl = 'originalData/surfAnatAparcAsegLH.txt'
const a2009sUrl = 'originalData/305/lhrh_anat_parc_a2009s.txt.gz'
const a2009sColorMapUrl = 'originalData/SurfAnatAparcA2009sAsefLH.txt'

const volumeT1Url = 'originalData/305/T1.mgz'
const scalpMaskUrl = 'originalData/305/scalp_mask.nii.gz'

export { pialUrl, pialLoadModelData, scalpUrl, scalpLoadModelData, parcUrl, volumeT1Url, scalpMaskUrl, parcColorMapUrl,
  a2009sUrl,
  a2009sColorMapUrl }
