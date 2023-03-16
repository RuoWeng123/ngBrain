<template>
  <div class="surface_container">
    <div id="ngSurface"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import {Surface} from '../../package/surface/surface';
import { pialLoadModelData, scalpLoadModelData } from "../../package/utils/file";
import { onMounted, reactive, onBeforeUnmount } from "vue";

export default {
  name: "surfaceView",
  setup() {
    let surface = reactive({});
    onMounted(async () => {
      surface = new Surface("ngSurface");
      surface.init();
      await surface.loadPialModelDataFromNative(pialLoadModelData.url, pialLoadModelData.options);
      // await surface.loadScalpModelDataFromNative(scalpLoadModelData.url, scalpLoadModelData.options);
    });
    onBeforeUnmount(() => {
      surface.destroyGui();
    });
  }
};
</script>

<style scoped lang="less">
.surface_container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  flex-direction: row;

  #ngSurface{
    flex: 1;
  }
  .control{
    width: 260px;
    height: 100%;
  }
}
</style>
