import "./rolldown-runtime-w0pxe0c8.js";
//#region src/extensions/core/load3d/nodeTypes.ts
/**
* Canonical lists of node types backed by the Load3D viewer infrastructure.
* Adding a new node type that uses the viewer = one line change here.
*/
var LOAD3D_PREVIEW_NODES = new Set([
	"Preview3D",
	"PreviewGaussianSplat",
	"PreviewPointCloud"
]);
var LOAD3D_ALL_NODES = new Set([
	...LOAD3D_PREVIEW_NODES,
	"Load3D",
	"Load3DAdvanced",
	"SaveGLB"
]);
var isLoad3dPreviewNode = (nodeType) => LOAD3D_PREVIEW_NODES.has(nodeType);
var isLoad3dNode = (nodeType) => LOAD3D_ALL_NODES.has(nodeType);
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.nodeTypes = window.comfyAPI.nodeTypes || {};
window.comfyAPI.nodeTypes.isLoad3dPreviewNode = isLoad3dPreviewNode;
window.comfyAPI.nodeTypes.isLoad3dNode = isLoad3dNode;
//#endregion
export { isLoad3dPreviewNode as n, isLoad3dNode as t };

//# sourceMappingURL=nodeTypes-PFpwDDmN.js.map