<template>
  <div class="surface_container">
    <div id="ngSurface"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import {ngControl} from '../../package/surface/ngControl';
import { pialLoadModelData, scalpLoadModelData } from "../../package/utils/file";
import { onMounted, reactive, onBeforeUnmount } from "vue";
import { loadModelFromUrl } from "ngBrain/surface/loading";

export default {
  name: "surfaceView",
  setup() {
    let surface = reactive({});
    onMounted(async () => {
      surface = new ngControl("ngSurface");
      surface.init();
      loadModelFromUrl(pialLoadModelData.url, pialLoadModelData.options, (model_data, filename, options) =>{
        surface.renderModelData(model_data, filename, options);
      });
      // loadModelFromUrl(scalpLoadModelData.url, scalpLoadModelData.options, (model_data, filename, options) =>{
      //   surface.renderModelData(model_data, filename, options);
      // });
      setTimeout(() => {
        surface.initGui();
        if (pialLoadModelData.options.isDebug) {
          surface.debugMaterialGui(pialLoadModelData.options.material.name);
        }
      }, 1000);
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
