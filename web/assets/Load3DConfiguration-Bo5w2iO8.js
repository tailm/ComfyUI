import "./rolldown-runtime-w0pxe0c8.js";
import { Ma as LiteGraph, ea as useSettingStore } from "./promotionUtils-B4DSH7RT.js";
import { s as t } from "./i18n-Ck8-Gum6.js";
import { r as api } from "./api-Bz5NhLSR.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import "./constants-oDCISK-q.js";
import { r as Load3dUtils } from "./load3dService-Gi495ZKn.js";
//#region src/extensions/core/load3d/exportMenuHelper.ts
var EXPORT_FORMATS = [
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
/**
* Creates export menu items for a 3D node using the new extension API.
* Returns an array of context menu items including a separator and export submenu.
*/
function createExportMenuItems(load3d) {
	return [null, {
		content: "Save",
		has_submenu: true,
		callback: (_value, _options, event, prev_menu) => {
			const submenuOptions = EXPORT_FORMATS.map((format) => ({
				content: format.label,
				callback: () => {
					(async () => {
						try {
							await load3d.exportModel(format.value);
							useToastStore().add({
								severity: "success",
								summary: t("toastMessages.exportSuccess", { format: format.label })
							});
						} catch (error) {
							console.error("Export failed:", error);
							useToastStore().addAlert(t("toastMessages.failedToExportModel", { format: format.label }));
						}
					})();
				}
			}));
			new LiteGraph.ContextMenu(submenuOptions, {
				event,
				parentMenu: prev_menu
			});
		}
	}];
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.exportMenuHelper = window.comfyAPI.exportMenuHelper || {};
window.comfyAPI.exportMenuHelper.createExportMenuItems = createExportMenuItems;
//#endregion
//#region src/extensions/core/load3d/Load3DConfiguration.ts
var ANNOTATED_FILENAME_PATTERN = / \[(input|output|temp)\]$/;
function parseAnnotatedFilename(rawValue, fallbackFolder) {
	const match = ANNOTATED_FILENAME_PATTERN.exec(rawValue);
	if (!match) return {
		filename: rawValue,
		folder: fallbackFolder
	};
	return {
		filename: rawValue.slice(0, match.index),
		folder: match[1]
	};
}
var Load3DConfiguration = class {
	load3d;
	properties;
	constructor(load3d, properties) {
		this.load3d = load3d;
		this.properties = properties;
	}
	configureForSaveMesh(loadFolder, filePath, options) {
		this.setupModelHandlingForSaveMesh(filePath, loadFolder, options?.silentOnNotFound ?? false);
		this.setupDefaultProperties();
	}
	configure(setting) {
		this.setupModelHandling(setting.modelWidget, setting.loadFolder, setting.cameraState, setting.silentOnNotFound ?? false, setting.onSceneInvalidated);
		this.setupTargetSize(setting.width, setting.height, setting.onSceneInvalidated);
		this.setupDefaultProperties(setting.bgImagePath);
	}
	setupTargetSize(width, height, onSceneInvalidated) {
		if (width && height) {
			this.load3d.setTargetSize(width.value, height.value);
			width.callback = (value) => {
				this.load3d.setTargetSize(value, height.value);
				onSceneInvalidated?.();
			};
			height.callback = (value) => {
				this.load3d.setTargetSize(width.value, value);
				onSceneInvalidated?.();
			};
		}
	}
	setupModelHandlingForSaveMesh(filePath, loadFolder, silentOnNotFound) {
		const onModelWidgetUpdate = this.createModelUpdateHandler(loadFolder, void 0, silentOnNotFound);
		if (filePath) onModelWidgetUpdate(filePath);
	}
	setupModelHandling(modelWidget, loadFolder, cameraState, silentOnNotFound = false, onSceneInvalidated) {
		const onModelWidgetUpdate = this.createModelUpdateHandler(loadFolder, cameraState, silentOnNotFound);
		if (modelWidget.value && modelWidget.value !== "none") onModelWidgetUpdate(modelWidget.value);
		const originalCallback = modelWidget.callback;
		let currentValue = modelWidget.value;
		Object.defineProperty(modelWidget, "value", {
			get() {
				return currentValue;
			},
			set(newValue) {
				currentValue = newValue;
				if (modelWidget.callback && newValue !== void 0 && newValue !== "") modelWidget.callback(newValue);
			},
			enumerable: true,
			configurable: true
		});
		modelWidget.callback = (value) => {
			onModelWidgetUpdate(value);
			if (originalCallback) originalCallback(value);
			onSceneInvalidated?.();
		};
	}
	setupDefaultProperties(bgImagePath) {
		const sceneConfig = this.loadSceneConfig();
		this.applySceneConfig(sceneConfig, bgImagePath);
		const cameraConfig = this.loadCameraConfig();
		this.applyCameraConfig(cameraConfig);
		const lightConfig = this.loadLightConfig();
		this.applyLightConfig(lightConfig);
		if (lightConfig.hdri) this.applyHDRISettings(lightConfig.hdri);
	}
	loadSceneConfig() {
		if (this.properties && "Scene Config" in this.properties) return this.properties["Scene Config"];
		return {
			showGrid: useSettingStore().get("Comfy.Load3D.ShowGrid"),
			backgroundColor: "#" + useSettingStore().get("Comfy.Load3D.BackgroundColor"),
			backgroundImage: ""
		};
	}
	loadCameraConfig() {
		if (this.properties && "Camera Config" in this.properties) return this.properties["Camera Config"];
		return {
			cameraType: useSettingStore().get("Comfy.Load3D.CameraType"),
			fov: 35
		};
	}
	loadLightConfig() {
		const hdriDefaults = {
			enabled: false,
			hdriPath: "",
			showAsBackground: false,
			intensity: 1
		};
		if (this.properties && "Light Config" in this.properties) {
			const saved = this.properties["Light Config"];
			return {
				intensity: saved.intensity ?? useSettingStore().get("Comfy.Load3D.LightIntensity"),
				hdri: {
					...hdriDefaults,
					...saved.hdri ?? {}
				}
			};
		}
		return {
			intensity: useSettingStore().get("Comfy.Load3D.LightIntensity"),
			hdri: hdriDefaults
		};
	}
	loadModelConfig() {
		if (this.properties && "Model Config" in this.properties) {
			const config = this.properties["Model Config"];
			if (!config.gizmo) config.gizmo = {
				enabled: false,
				mode: "translate",
				position: {
					x: 0,
					y: 0,
					z: 0
				},
				rotation: {
					x: 0,
					y: 0,
					z: 0
				},
				scale: {
					x: 1,
					y: 1,
					z: 1
				}
			};
			else if (!config.gizmo.scale) config.gizmo.scale = {
				x: 1,
				y: 1,
				z: 1
			};
			return config;
		}
		return {
			upDirection: "original",
			materialMode: "original",
			showSkeleton: false,
			gizmo: {
				enabled: false,
				mode: "translate",
				position: {
					x: 0,
					y: 0,
					z: 0
				},
				rotation: {
					x: 0,
					y: 0,
					z: 0
				},
				scale: {
					x: 1,
					y: 1,
					z: 1
				}
			}
		};
	}
	applySceneConfig(config, bgImagePath) {
		this.load3d.toggleGrid(config.showGrid);
		this.load3d.setBackgroundColor(config.backgroundColor);
		if (config.backgroundImage) {
			if (bgImagePath && bgImagePath != config.backgroundImage) return;
			this.load3d.setBackgroundImage(config.backgroundImage);
			if (config.backgroundRenderMode) this.load3d.setBackgroundRenderMode(config.backgroundRenderMode);
		}
	}
	applyCameraConfig(config) {
		this.load3d.toggleCamera(config.cameraType);
		this.load3d.setFOV(config.fov);
		if (config.state) this.load3d.setCameraState(config.state);
	}
	applyLightConfig(config) {
		this.load3d.setLightIntensity(config.intensity);
	}
	applyHDRISettings(config) {
		if (!config.hdriPath) return;
		this.load3d.setHDRIIntensity(config.intensity);
		this.load3d.setHDRIAsBackground(config.showAsBackground);
		if (config.enabled) this.load3d.setHDRIEnabled(true);
	}
	applyModelConfig(config) {
		this.load3d.setUpDirection(config.upDirection);
		this.load3d.setMaterialMode(config.materialMode);
	}
	createModelUpdateHandler(loadFolder, cameraState, silentOnNotFound = false) {
		let isFirstLoad = true;
		return async (value) => {
			if (!value || value === "none") {
				this.load3d.clearModel();
				return;
			}
			const { filename, folder } = parseAnnotatedFilename(value, loadFolder);
			this.setResourceFolder(filename);
			const modelUrl = api.apiURL(Load3dUtils.getResourceURL(...Load3dUtils.splitFilePath(filename), folder));
			await this.load3d.loadModel(modelUrl, filename, { silentOnNotFound });
			const modelConfig = this.loadModelConfig();
			this.applyModelConfig(modelConfig);
			if (isFirstLoad && cameraState) {
				try {
					this.load3d.setCameraState(cameraState);
				} catch (error) {
					console.warn("Failed to restore camera state:", error);
				}
				isFirstLoad = false;
			}
			this.load3d.emitModelReady();
		};
	}
	setResourceFolder(filename) {
		const pathParts = filename.split("/").filter((part) => part.trim());
		if (pathParts.length <= 2) return;
		const subfolder = pathParts.slice(1, -1).join("/");
		if (subfolder && this.properties) this.properties["Resource Folder"] = subfolder;
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.Load3DConfiguration = window.comfyAPI.Load3DConfiguration || {};
window.comfyAPI.Load3DConfiguration.parseAnnotatedFilename = parseAnnotatedFilename;
//#endregion
export { createExportMenuItems as n, Load3DConfiguration as t };

//# sourceMappingURL=Load3DConfiguration-Bo5w2iO8.js.map