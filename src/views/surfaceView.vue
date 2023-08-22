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
      <div class="control-item">
        <el-checkbox v-model="showBrain" @change="handleShowBrain">显示大脑</el-checkbox>
      </div>
      <div class="control-item">
        <el-checkbox v-model="showIndicator" @change="handleIndicator">显示指示器</el-checkbox>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ngControl } from '../../package/surface/ngControl'
import { pialLoadModelData } from '../../package/utils/file'
import { onMounted, reactive, onBeforeUnmount, ref } from 'vue'
import { loadModelFromUrl } from 'ngBrain/surface/loading'
import { drawDot, getDotArr, removeAllDot } from 'ngBrain/surface/drawGeom'
import { colorToHex } from 'ngBrain/utils/colors'
import { initBat } from "ngBrain/bat/loadBat";

let surface = reactive({})
let singleDot = ref('single')
let showOverlay = ref(false)
let showBrain = ref(true)
let showIndicator = ref(false)
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
    console.log('surface', surface)
    initBat(surface)
    surface.render()
  }, 1000)
})
onBeforeUnmount(() => {
  surface.destroyGui()
})

function handleClick(event) {
  // console.log('event', event)
  if(!surface.viewer.model.getObjectByName('pial_gii_1')) return
  const res = surface.pick(event.offsetX, event.offsetY)
  if (!res || !res.hasOwnProperty('point')) return

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

async function handleViewerOverlay(val) {
  console.log(val)
}

async function handleShowBrain(val) {
  showBrain.value = val
  if (val) {
    if (surface.viewer.model.getObjectByName('pial_gii_1')) {
      return
    }
    let brain = surface.viewer.model_data.get('pial_gii_1')
    surface.viewer.model.add(brain)
  } else {
    if (!surface.viewer.model.getObjectByName('pial_gii_1')) {
      return
    }
    let brain = surface.viewer.model_data.get('pial_gii_1')
    surface.viewer.model.remove(brain)
  }
  surface.render()
}

function handleIndicator(val) {
  if(val){
    surface.viewer.model.getObjectByName('batAngle').visible = true
    surface.viewer.model.getObjectByName('batTranslation').visible = true
  }else{
    surface.viewer.model.getObjectByName('batAngle').visible = false
    surface.viewer.model.getObjectByName('batTranslation').visible = false
  }
  surface.render()
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
    flex-direction: column;
    padding-top: 32px;
  }
}
</style>
