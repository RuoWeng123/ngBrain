<template>
  <div class="volume_container">
    <div id="ngVolume"></div>
    <div class="control">volume control</div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { VolumeViewer } from '../../package/volume/viewer'
import { mghT1Description } from '../../package/volume/constMap'

let volumeRef = reactive({})
onMounted(async () => {
  volumeRef = new VolumeViewer('ngVolume', { isLinkZoom: false })
  console.log('volumeRef', volumeRef)
  let volumeDescriptions = [mghT1Description]
  await volumeRef.loader(volumeDescriptions)
  volumeRef.setPanelSize(300, 300)
  console.log('this.viewer', volumeRef.viewer)
  volumeRef.render()
})
</script>

<style lang="less" scoped>
.volume_container{
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;

  #ngVolume{
    flex: 1;
    border-left: 1px solid #ccc;
  }
  .control{
    width: 200px;
    height: 100%;
    background: #ccc;
  }
}
</style>
