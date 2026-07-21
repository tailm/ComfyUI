import "./rolldown-runtime-w0pxe0c8.js";
//#region src/extensions/core/load3d/constants.ts
/**
* Load3D constants that don't require THREE.js
* This file can be imported without pulling in the entire THREE.js bundle
*/
var SUPPORTED_EXTENSIONS = new Set([
	".gltf",
	".glb",
	".obj",
	".fbx",
	".stl",
	".spz",
	".splat",
	".ply",
	".ksplat"
]);
var SUPPORTED_EXTENSIONS_ACCEPT = [...SUPPORTED_EXTENSIONS].join(",");
var SUPPORTED_HDRI_EXTENSIONS = new Set([".hdr", ".exr"]);
var SUPPORTED_HDRI_EXTENSIONS_ACCEPT = [...SUPPORTED_HDRI_EXTENSIONS].join(",");
var LOAD3D_NONE_MODEL = "none";
var DIRECT_EXPORT_FORMATS = new Set([
	"ply",
	"spz",
	"splat",
	"ksplat"
]);
var CONVERTIBLE_EXPORT_FORMAT_OPTIONS = [
	{
		label: "GLB",
		value: "glb"
	},
	{
		label: "OBJ",
		value: "obj"
	},
	{
		label: "STL",
		value: "stl"
	},
	{
		label: "FBX",
		value: "fbx"
	}
];
function getExportFormatOptions(sourceFormat) {
	const format = sourceFormat?.toLowerCase();
	if (format && DIRECT_EXPORT_FORMATS.has(format)) return [{
		label: format.toUpperCase(),
		value: format
	}];
	return CONVERTIBLE_EXPORT_FORMAT_OPTIONS;
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.constants = window.comfyAPI.constants || {};
window.comfyAPI.constants.SUPPORTED_EXTENSIONS = SUPPORTED_EXTENSIONS;
window.comfyAPI.constants.SUPPORTED_EXTENSIONS_ACCEPT = SUPPORTED_EXTENSIONS_ACCEPT;
window.comfyAPI.constants.SUPPORTED_HDRI_EXTENSIONS = SUPPORTED_HDRI_EXTENSIONS;
window.comfyAPI.constants.SUPPORTED_HDRI_EXTENSIONS_ACCEPT = SUPPORTED_HDRI_EXTENSIONS_ACCEPT;
window.comfyAPI.constants.LOAD3D_NONE_MODEL = LOAD3D_NONE_MODEL;
window.comfyAPI.constants.DIRECT_EXPORT_FORMATS = DIRECT_EXPORT_FORMATS;
window.comfyAPI.constants.getExportFormatOptions = getExportFormatOptions;
//#endregion
export { SUPPORTED_HDRI_EXTENSIONS as a, SUPPORTED_EXTENSIONS_ACCEPT as i, LOAD3D_NONE_MODEL as n, SUPPORTED_HDRI_EXTENSIONS_ACCEPT as o, SUPPORTED_EXTENSIONS as r, getExportFormatOptions as s, DIRECT_EXPORT_FORMATS as t };

//# sourceMappingURL=constants-oDCISK-q.js.map