const ctx = self;
// eslint-disable-next-line no-undef
const gifti = importScripts('./gifti-reader.js');
ctx.onmessage = (res) =>{
  let input = res.data;
  /* Need to prepend the base url, which is transfered with the
   * message. This gets around issues with loading a script from
   * within a worker blob.
   */
  // eslint-disable-next-line no-undef
  
  let errorObj = {
    error: true,
    error_message: "Error parsing data."
  };
  
  let result = errorObj;
  
  if (input) {
    result = parse(input.data) || errorObj;
  }
  
  let transfer = [];
  if (result.vertices && result.shapes[0].indices) {
    transfer.push(result.vertices.buffer,
      result.shapes[0].indices.buffer);
    self.postMessage(result, transfer);
  }
  else {
    transfer.push(result.values.buffer);
    self.postMessage(result, transfer);
  }
}

function parse(data) {
  var result = {};
  var gii = this.gifti.parse(data);
  var n_vtx = gii.getNumPoints();
  var n_tri = gii.getNumTriangles();
  
  if (n_tri > 0 && n_vtx > 0) {
    /* It's a GIFTI surface.
     */
    result.type = 'polygon';
    result.vertices = gii.getPointsDataArray().getData();
    result.shapes = [{ indices: gii.getTrianglesDataArray().getData() }];
  }
  else if (gii.dataArrays.length > 0) {
    /* It's some other GIFTI file, treat it as vertex data.
     */
    var values = gii.dataArrays[0].getData();
    var min, max;
    var i;
    var n = values.length;
    min = +Number.MAX_VALUE;
    max = -Number.MAX_VALUE;
    for (i = 0; i < n; i++) {
      min = Math.min(min, values[i]);
      max = Math.max(max, values[i]);
    }
    result.values = values;
    result.min = min;
    result.max = max;
    /* Build a 5-item color table (index R G B A) as a string.  We
     * use this method because I can't find any other reasonable way
     * to return a sparse color table from the worker.
     */
    var text = '';
    Object.keys(gii.labelTable).forEach( function(name) {
      var lb = gii.labelTable[name];
      text += lb.key + ' ';
      text += lb.r + ' ';
      text += lb.g + ' ';
      text += lb.b + ' ';
      text += lb.a + '\n';
    });
    if (text.length > 0) {
      result.colors = text;
    }
  }
  return result;
}



