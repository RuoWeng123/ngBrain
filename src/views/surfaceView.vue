<template>
  <div class="surface_container">
    <div id="ngSurface" @mouseup="handleSurfaceClick" @click="handleClick"></div>
    <div class="control">
      <div class="control-item">
        <el-radio-group v-model="singleDot">
          <el-radio label="single">单靶点</el-radio>
          <el-radio label="more">多靶点</el-radio>
        </el-radio-group>
      </div>
      <div class="control-item">
        <el-checkbox v-model="showOverlay" @change="handleViewerOverlay">显示蒙层</el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ngControl } from '../../package/surface/ngControl'
import { apracAsegModelData, asegColorUrl, pialLoadModelData } from "../../package/utils/file";
import { onMounted, reactive, onBeforeUnmount, ref } from 'vue'
import { loadColorMapFromUrl, loadModelFromUrl } from "ngBrain/surface/loading";
import { drawDot, getDotArr, removeAllDot } from 'ngBrain/surface/drawGeom'
import { colorToHex, updateViewerColorMap } from "ngBrain/utils/colors";

let surface = reactive({})
let singleDot = ref('single')
let showOverlay = ref(false)
onMounted(async () => {
  surface = new ngControl('ngSurface')
  surface.init()
  loadModelFromUrl(pialLoadModelData.url, pialLoadModelData.options, (model_data, filename, options) => {
    surface.renderModelData(model_data, filename, options)
  })
  // loadModelFromUrl(scalpLoadModelData.url, scalpLoadModelData.options, (model_data, filename, options) =>{
  //   surface.renderModelData(model_data, filename, options);
  // });
  setTimeout(() => {
    surface.initGui()
    if (pialLoadModelData.options.isDebug) {
      surface.debugMaterialGui(pialLoadModelData.options.material.name)
    }
  }, 1000)
})
onBeforeUnmount(() => {
  surface.destroyGui()
})

function handleClick(event) {
  console.log('event', event)
  const res = surface.pick(event.offsetX, event.offsetY)

  if (singleDot.value === 'single') {
    removeAllDot(surface)
  }
  const dotArr = getDotArr(surface.scene)

  drawDot(surface, {
    position: res.point,
    color: colorToHex(dotArr.length),
    size: 5,
    dotIndex: dotArr.length,
  })
  console.log('surface', surface)
  if (res) {
    console.log('顶角', res.index)
    console.log('坐标', res.point)
  }
}

function handleViewerOverlay(val) {
  console.log(val);
  if(val){
    const {result, filename, options: lastOptions} = await loadFromURL(apracAsegModelData.url, apracAsegModelData.options);
    loadModelFromUrl(apracAsegModelData.url, apracAsegModelData.options, async (model_data, filename, options) => {
      console.log('model_data', model_data);
      // surface.renderModelData(model_data, filename, options)
      let colors = await loadColorMapFromUrl(asegColorUrl)
      updateViewerColorMap(surface, colors)
    })
  }
}
</script>

<style scoped lang="less">
.surface_container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  flex-direction: row;

  #ngSurface {
    flex: 1;
  }
  .control {
    width: 260px;
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
  }
}
</style>
