# ngBrain
ngBrain是为了构建3D脑图,替换brainBrowser引用方式。



## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 构建数据，数据构建后的格式 model_data
loadModelFromURL() =>loadFromUrl() =>loadModel() =>parseModel();
```javascript
type pialDataType = {
  filename: 'pial.gii.gz';
  data:{
    bounding_box: {
      min_x: number;
      min_y: number;
      min_z: number;
      max_x: number;
      max_y: number;
      max_z: number;
    }
    colors:[number], // Float32Array[]
    shapes:[
      {
        bounding_box: {
          min_x: number;
          min_y: number;
          min_z: number;
          max_x: number;
          max_y: number;
          max_z: number,
        },
        centroid: {
          x: number,
          y: number,
          z: number,
        },
        indices:[number], // Int32Array[]
      }
    ],
    size:{
      x: number,
      y: number,
      z: number,
    },
    type:'polygon',
    vertices:[number], // Float32Array[]
  }
}
```
## 渲染数据 将model_data 写入到model中
displayModel => createModel() => createShape() => renderFrame() =>this.renderer.render(scene, camera)


1. loadIntensityDataFromURL
    1. 解析options内容
2. loadFromURL 从url获取数据，
```javascript
 var unzipped = window.pako.inflate(result);
	result = unzipped.buffer;
	if (content_type === "text") {
		var dv = new DataView(result);
		var decoder = new TextDecoder();
		result = decoder.decode(dv);
	}

return result filename  options;
```

3. loadIntensityData

checkbinary  中
```javascript
format_config = {worker: 'gifti.worker.js'};
format_config = {worker: 'text.intensity.worker.js'};
format_config={worker: 'mniobj.worker.js'};  // scalp

optionns = {
	content_type:'text',
	format:'gifti',
	model_name:'pial_gii',
	opacity: 100,
	result_type: 'arraybuffer'
}

options = {
	content_type:'text',
	format:"mniobj",
	model_name:'scalp_mask',
	opacity:20,
	result_type:'arraybuffer'
}
```
model_data  对外仅暴露 add clear  count get forEach getDefaultIntensityData ;
数据存在 model_data_store 对象中


渲染倒序
function createShape
```javascript
geometry = new THREE.BufferGeometry();
geometry.setArrtibute('position',position);// position是点组
let material = new THREE.MeshLambertMaterial({
	color: 0xffffff,
	emissive: 0x262626,
	vertexColors: THREE.VertexColors,
});
shape = new THREE.Mesh(geometry, material)
```

function createModel(model_data, filename, options)
```javascript
for(let i = 0; i< shapes.length; i++){
	let shape_data= model_data.shapes[i];

	let position_buffer = new THREE.BufferAttribute(new Float32Array(model_data.vertices), 3);

		if (model_data.normals) {
	let normal_buffer = new THREE.BufferAttribute(new Float32Array(model_data.normals), 3);
		}

		if (model_data.colors) {
	let color_buffer = new THREE.BufferAttribute(new Float32Array(model_data.colors), 4);
		}
	setShapeColors(color_buffer.array, shape_data.color, shape_data.indices);

	object_description = {
		position: position_buffer,
		normal: normal_buffer,
		color: color_buffer,
		index: new THREE.BufferAttribute(new Uint32Array(shape_data.indices), 1)
	};

	object_description.is_line = is_line;
	object_description.centroid = shape_data.centroid;
	object_description.recenter = recenter;

	shape = createShape(object_description, options);
	shape.name = shape_data.name || options.model_name + '_' + (i + 1);

	shape.userData.model_name = model_data.name;

	shape.userData.original_data = {
		vertices: model_data.vertices,
		indices: shape_data.indices,
		normals: model_data.normals,
		colors: model_data.colors
	};

	shape.userData.pick_ignore = pick_ignore;

	if (render_depth) {
		shape.renderDepth = render_depth;
	}

	new_shapes.push(shape);
	model.add(shape);

	// todo renderer.render(scene, model)
}
```
function displayModel(model_data, filename, options)
```javascript
let complate = options.complate;
let newShape = createModel(model_data, filename, options);
if(complate) complate();
```

function loadModel(data, filename, option, url)
```javascript
let model_data = parseModel(data, type, options.parse);
// todo 存入数据库
displayModel(model_data, filename, options);
```

function loadModelFromURL (url, options) 或者 function loadModelFromFile
```javascript
let {model_data, filename, options} = loadFromUrl(url);
loadModel(model_data, filename, options);
```
```javascript
options = checkBinary('model_types', options);

loader.loadFromFile(file_input, loadModel, options);
```

function parseModel(data, type, options, callback)
```javascript
let parseWorker = new Worker('url');
parseWorker.addEventListener('message', function(event){
	let model_data = event.data;
	loadIndexedModel(model_data, callback)
})
parseWorker.postMessage({
	data: data,
	options: options, 
	url: import_url
})
```
worker  text.intensity.worker.js
```javascript
(function() {
  "use strict";
  
  self.addEventListener("message", function(e) {
    var result = parse(e.data.data);
    self.postMessage(result, [result.values.buffer]);
  });
  
  function parse(string) {
    var result = {};
    var i, count, min, max;
  
    result.values = new Float32Array(string.trim().split(/\s+/).map(parseFloat));
    min = result.values[0];
    max = result.values[0];

    for(i = 1, count = result.values.length; i < count; i++) {
      min = Math.min(min, result.values[i]);
      max = Math.max(max, result.values[i]);
    }

    result.min = min;
    result.max = max;

    return result;
  }
 
})();
```
pointSurfaceViewer.tsx
```javascript
brianbrowser.surfaceViewer.start(element, (viewer) =>{
	this.loadModel(viewer).then(() =>{
		
	})
})
```
function loadModel
```javascript
this.viewerLoadModelFromUrl().then(res =>{
	viewer.loadIntensityDataFromUrl(url,options);
})
```
worker: json.worker.js  该worker用于生成 model_data 的shapes


# 渲染皮层，加工后的格式
```javascript
{
	data:{
		bounding_box:{
			min_x: number,
			
		}
	},
	filename: 'pial.gii.gz'
}
```


### surface 对应的worker 流程
pialUrl => gifti.worker.js
scalpUrl => mniobj.worker.js
intensityURL(蒙层)=> text.intensity.worker.js
默认没传 options.format 时，使用 json.worker.js

deindex.worker.js 不会使用，因为 WEBGL_UINT_INDEX_ENABLED 百分百为真

### 适合scalp 的 材质涂色
```js
    material = new THREE.MeshLambertMaterial({
      color: 0x3e3a3a,
      emissive: 0xb6bdc1,
      emissiveIntensity: 0.7,
      transparent: true,
    });
```
