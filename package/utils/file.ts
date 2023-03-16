const pialUrl = "http://192.168.11.138:30090/ng-main/UuEbzd57-/s/1/j/1/viz/recon/pial.gii.gz?X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJVQlhRQTAxMlZaWVNPV1FFSlhHNiIsImV4cCI6MTY3ODMyOTgwOSwicGFyZW50IjoibWluaW8iLCJzZXNzaW9uUG9saWN5IjoiZXdvZ0lDQWdJbFpsY25OcGIyNGlPaUFpTWpBeE1pMHhNQzB4TnlJc0lBb2dJQ0FnSWxOMFlYUmxiV1Z1ZENJNklGc0tJQ0FnSUNBZ0lDQjdDaUFnSUNBZ0lDQWdJQ0FnSUNKQlkzUnBiMjRpT2lCYkNpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBaWN6TTZSMlYwVDJKcVpXTjBJZ29nSUNBZ0lDQWdJQ0FnSUNCZExDQUtJQ0FnSUNBZ0lDQWdJQ0FnSWxKbGMyOTFjbU5sSWpvZ1d3b2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0ltRnlianBoZDNNNmN6TTZPanB1WnkxdFlXbHVMeW9pSUFvZ0lDQWdJQ0FnSUNBZ0lDQmRMQ0FLSUNBZ0lDQWdJQ0FnSUNBZ0lrVm1abVZqZENJNklDSkJiR3h2ZHlJS0lDQWdJQ0FnSUNCOUNpQWdJQ0JkQ24wPSJ9.yuZrAXOJlm3axZ2mf2Tf--RC2yriQHtewsD3a1ilI5XuogWABBP04ByDpq6-aXjXlbWvYOTa9_u8A3X0IFwNwA&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230309T014329Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=UBXQA012VZYSOWQEJXG6%2F20230309%2Fcn-northwest-1%2Fs3%2Faws4_request&X-Amz-Signature=55879ddd930eefd14d79a1de83d709d184eb868f041151264f6aeeb676bb508e";
const pialLoadModelData = {
  url: pialUrl,
  options: {
    filename: 'pial.gii.gz',
    result_type: "arraybuffer",
    format: "gifti",
    model_name: "pial_gii",
    content_type: "text",
    opacity: 99
  }
};
const scalpUrl = "http://192.168.11.138:30090/ng-main/UuEbzd57-/s/1/j/1/viz/prep/scalp_mask.obj.gz?X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJVQlhRQTAxMlZaWVNPV1FFSlhHNiIsImV4cCI6MTY3ODMyOTgwOSwicGFyZW50IjoibWluaW8iLCJzZXNzaW9uUG9saWN5IjoiZXdvZ0lDQWdJbFpsY25OcGIyNGlPaUFpTWpBeE1pMHhNQzB4TnlJc0lBb2dJQ0FnSWxOMFlYUmxiV1Z1ZENJNklGc0tJQ0FnSUNBZ0lDQjdDaUFnSUNBZ0lDQWdJQ0FnSUNKQlkzUnBiMjRpT2lCYkNpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBaWN6TTZSMlYwVDJKcVpXTjBJZ29nSUNBZ0lDQWdJQ0FnSUNCZExDQUtJQ0FnSUNBZ0lDQWdJQ0FnSWxKbGMyOTFjbU5sSWpvZ1d3b2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0ltRnlianBoZDNNNmN6TTZPanB1WnkxdFlXbHVMeW9pSUFvZ0lDQWdJQ0FnSUNBZ0lDQmRMQ0FLSUNBZ0lDQWdJQ0FnSUNBZ0lrVm1abVZqZENJNklDSkJiR3h2ZHlJS0lDQWdJQ0FnSUNCOUNpQWdJQ0JkQ24wPSJ9.yuZrAXOJlm3axZ2mf2Tf--RC2yriQHtewsD3a1ilI5XuogWABBP04ByDpq6-aXjXlbWvYOTa9_u8A3X0IFwNwA&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230309T014329Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=UBXQA012VZYSOWQEJXG6%2F20230309%2Fcn-northwest-1%2Fs3%2Faws4_request&X-Amz-Signature=6e5421ed9dc3a0ce1c7e541dc54f5865cbb734c2ef96f7cfd5d9dd13892214b1";

const scalpLoadModelData = {
  url: scalpUrl,
  options: {
    filename:'scalp_mask.obj.gz',
    result_type: "arraybuffer",
    format: "mniobj",
    model_name: "scalp_mask",
    content_type: "text",
    opacity: 10
  },
}
const parcUrl = "http://192.168.11.138:30090/ng-main/UuEbzd57-/s/1/j/1/viz/anat_parc/lhrh_anat_parc_aparc.txt.gz?X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJVQlhRQTAxMlZaWVNPV1FFSlhHNiIsImV4cCI6MTY3ODMyOTgwOSwicGFyZW50IjoibWluaW8iLCJzZXNzaW9uUG9saWN5IjoiZXdvZ0lDQWdJbFpsY25OcGIyNGlPaUFpTWpBeE1pMHhNQzB4TnlJc0lBb2dJQ0FnSWxOMFlYUmxiV1Z1ZENJNklGc0tJQ0FnSUNBZ0lDQjdDaUFnSUNBZ0lDQWdJQ0FnSUNKQlkzUnBiMjRpT2lCYkNpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBaWN6TTZSMlYwVDJKcVpXTjBJZ29nSUNBZ0lDQWdJQ0FnSUNCZExDQUtJQ0FnSUNBZ0lDQWdJQ0FnSWxKbGMyOTFjbU5sSWpvZ1d3b2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0ltRnlianBoZDNNNmN6TTZPanB1WnkxdFlXbHVMeW9pSUFvZ0lDQWdJQ0FnSUNBZ0lDQmRMQ0FLSUNBZ0lDQWdJQ0FnSUNBZ0lrVm1abVZqZENJNklDSkJiR3h2ZHlJS0lDQWdJQ0FnSUNCOUNpQWdJQ0JkQ24wPSJ9.yuZrAXOJlm3axZ2mf2Tf--RC2yriQHtewsD3a1ilI5XuogWABBP04ByDpq6-aXjXlbWvYOTa9_u8A3X0IFwNwA&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230309T014329Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=UBXQA012VZYSOWQEJXG6%2F20230309%2Fcn-northwest-1%2Fs3%2Faws4_request&X-Amz-Signature=ca94009e72f811b603a28c401181532dba9b898ebda8149c29a8a449c4ece7b3";
export {
  pialUrl,
  pialLoadModelData,
  scalpUrl,
  scalpLoadModelData,
  parcUrl,
}
