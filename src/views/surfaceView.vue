<template>
  <div class="surface_container">
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
        <el-checkbox v-model="showScalp" @change="handleShowScalp">显示头皮</el-checkbox>
      </div>
      <div class="control-item">
        <el-checkbox v-model="showIndicator" @change="handleIndicator">显示拍子</el-checkbox>
      </div>
      <div class="control-item">
        <el-checkbox v-model="showTransform" @change="handleTransform">调整角度</el-checkbox>
      </div>
    </div>
    <div id="ngSurface" @click="handleClick"></div>
  </div>
</template>

<script setup>
import { ngControl } from '../../package/surface/ngControl'
import { parcColorMapUrl, pialLoadModelData, scalpLoadModelData } from "../../package/utils/file";
import { onMounted, reactive, onBeforeUnmount, ref } from 'vue'
import { loadColorMapFromUrl, loadModelFromUrl } from "ngBrain/surface/loading";
import { drawDot, getDotArr, removeAllDot } from 'ngBrain/surface/drawGeom'
import { colorToHex } from 'ngBrain/utils/colors'
import { initBat } from "ngBrain/bat/loadBat";
import { reverseByVertexCoordsToPoint } from "ngBrain/utils/utils";

let surface = reactive({})
let singleDot = ref('single')
let showOverlay = ref(false)
let showBrain = ref(true)
let showScalp = ref(true)
let showIndicator = ref(false)
let showTransform = ref(false)
onMounted(async () => {
  surface = new ngControl('ngSurface')
  surface.init()
  loadModelFromUrl(pialLoadModelData.url, pialLoadModelData.options, (model_data, filename, options) => {
    surface.renderModelData(model_data, filename, options)
  })
  loadModelFromUrl(scalpLoadModelData.url, scalpLoadModelData.options, (model_data, filename, options) =>{
    surface.renderModelData(model_data, filename, options);
  });
  setTimeout(() => {
    surface.initGui()
    // if (scalpLoadModelData.options.isDebug) {
    //   surface.debugMaterialGui(scalpLoadModelData.options.material.name)
    // }
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
  if (!res || !res.point) return

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
  let temp = reverseByVertexCoordsToPoint(surface, res.point);
  console.log('二维平面坐标', temp);
}

async function handleViewerOverlay(val) {
  console.log(val)
  // 加载colorMap
  const color = await loadColorMapFromUrl(parcColorMapUrl)
  console.log('color', color);
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
async function handleShowScalp(val) {
  showScalp.value = val
  if (val) {
    if (surface.viewer.model.getObjectByName('scalp_mask_1')) {
      return
    }
    let scalp = surface.viewer.model_data.get('scalp_mask_1')
    surface.viewer.model.add(scalp)
  } else {
    if (!surface.viewer.model.getObjectByName('scalp_mask_1')) {
      return
    }
    let scalp = surface.viewer.model_data.get('scalp_mask_1')
    surface.viewer.model.remove(scalp)
  }
  surface.render()
}

function handleIndicator(val) {
  if(val){
    surface.viewer.model.getObjectByName('ngBat').visible = true
    surface.viewer.model.getObjectByName('batAngle').visible = true
    surface.viewer.model.getObjectByName('batTranslation').visible = true
  }else{
    surface.viewer.model.getObjectByName('ngBat').visible = false
    surface.viewer.model.getObjectByName('batAngle').visible = false
    surface.viewer.model.getObjectByName('batTranslation').visible = false
  }
  surface.render()
}

function handleTransform(val) {
  if(val){
    showTransform.value = true
    surface.viewer.control.attach(surface.viewer.model)
    surface.viewer.control.setMode('rotate')
  }else{
    showTransform.value = false
    surface.viewer.control.detach()
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
  border-left: 1px solid #ccc;

  #ngSurface {
    flex: 1;
  }
  .control {
    width: 260px;
    height: 100%;
    display: inline-flex;
    flex-direction: column;
  }
}
</style>
