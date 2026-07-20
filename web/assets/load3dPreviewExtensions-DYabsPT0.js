import "./rolldown-runtime-w0pxe0c8.js";
import { X as nextTick } from "./vendor-vue-core-ywZ1En3W.js";
import { C as app, fo as getNodeByLocatorId, qn as useExtensionService } from "./promotionUtils-DLM4TsXW.js";
import { s as t } from "./i18n-BJjDt-Gn.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import { t as useLoad3dService } from "./load3dService-CW0nYsbE.js";
import { i as nodeToLoad3dMap, o as useLoad3d } from "./useLoad3d-ClwUXeOu.js";
import { n as createExportMenuItems, t as Load3DConfiguration } from "./Load3DConfiguration-B7wfoa8r.js";
//#region src/extensions/core/load3dPreviewExtensions.ts
function applyResultToLoad3d(node, load3d, filePath, cameraState) {
	const normalizedPath = filePath.replaceAll("\\", "/");
	node.properties["Last Time Model File"] = normalizedPath;
	if (cameraState) {
		const existing = node.properties["Camera Config"];
		node.properties["Camera Config"] = {
			cameraType: load3d.getCurrentCameraType(),
			fov: 75,
			...existing,
			state: cameraState
		};
	}
	new Load3DConfiguration(load3d, node.properties).configureForSaveMesh("temp", normalizedPath, { silentOnNotFound: true });
	const targetGeneration = load3d.currentLoadGeneration;
	load3d.whenLoadIdle().then(() => {
		if (load3d.currentLoadGeneration !== targetGeneration) return;
		if (cameraState) load3d.setCameraState(cameraState);
		load3d.forceRender();
	});
}
function createPreview3DExtension(comfyClass, extensionName) {
	const applyPreviewOutput = (node, result) => {
		const filePath = result[0];
		const cameraState = result[1];
		if (!filePath) return;
		useLoad3d(node).waitForLoad3d((load3d) => {
			applyResultToLoad3d(node, load3d, filePath, cameraState);
		});
	};
	return {
		name: extensionName,
		onNodeOutputsUpdated(nodeOutputs) {
			for (const [locatorId, output] of Object.entries(nodeOutputs)) {
				const result = output.result;
				if (!result?.[0]) continue;
				const node = getNodeByLocatorId(app.rootGraph, locatorId);
				if (!node || node.constructor.comfyClass !== comfyClass) continue;
				applyPreviewOutput(node, result);
			}
		},
		getNodeMenuItems(node) {
			if (node.constructor.comfyClass !== comfyClass) return [];
			const load3d = useLoad3dService().getLoad3d(node);
			if (!load3d) return [];
			if (load3d.isSplatModel()) return [];
			return createExportMenuItems(load3d);
		},
		async nodeCreated(node) {
			if (node.constructor.comfyClass !== comfyClass) return;
			const [oldWidth, oldHeight] = node.size;
			node.setSize([Math.max(oldWidth, 400), Math.max(oldHeight, 550)]);
			await nextTick();
			const onExecuted = node.onExecuted;
			const { onLoad3dReady, waitForLoad3d } = useLoad3d(node);
			onLoad3dReady((load3d) => {
				const lastTimeModelFile = node.properties["Last Time Model File"];
				if (!lastTimeModelFile) return;
				new Load3DConfiguration(load3d, node.properties).configureForSaveMesh("temp", lastTimeModelFile, { silentOnNotFound: true });
				const cameraState = node.properties["Camera Config"]?.state;
				const targetGeneration = load3d.currentLoadGeneration;
				load3d.whenLoadIdle().then(() => {
					if (load3d.currentLoadGeneration !== targetGeneration) return;
					if (cameraState) load3d.setCameraState(cameraState);
					load3d.forceRender();
				});
			});
			waitForLoad3d((load3d) => {
				const sceneWidget = node.widgets?.find((w) => w.name === "viewport_state");
				const widthWidget = node.widgets?.find((w) => w.name === "width");
				const heightWidget = node.widgets?.find((w) => w.name === "height");
				if (widthWidget && heightWidget) {
					load3d.setTargetSize(widthWidget.value, heightWidget.value);
					widthWidget.callback = (value) => {
						load3d.setTargetSize(value, heightWidget.value);
					};
					heightWidget.callback = (value) => {
						load3d.setTargetSize(widthWidget.value, value);
					};
				}
				if (sceneWidget) sceneWidget.serializeValue = async () => {
					const currentLoad3d = nodeToLoad3dMap.get(node);
					if (!currentLoad3d) {
						console.error("No load3d instance found for node");
						return null;
					}
					const cameraConfig = node.properties["Camera Config"] || {
						cameraType: currentLoad3d.getCurrentCameraType(),
						fov: currentLoad3d.cameraManager.perspectiveCamera.fov
					};
					cameraConfig.state = currentLoad3d.getCameraState();
					node.properties["Camera Config"] = cameraConfig;
					const modelInfo = currentLoad3d.getModelInfo();
					const model_3d_info = modelInfo ? [modelInfo] : [];
					return {
						image: "",
						mask: "",
						normal: "",
						camera_info: cameraConfig.state || null,
						recording: "",
						model_3d_info
					};
				};
				node.onExecuted = function(output) {
					onExecuted?.call(this, output);
					const result = output.result;
					const filePath = result?.[0];
					if (!filePath) {
						const msg = t("toastMessages.unableToGetModelFilePath");
						console.error(msg);
						useToastStore().addAlert(msg);
						return;
					}
					applyResultToLoad3d(node, load3d, filePath, result?.[1]);
				};
			});
		}
	};
}
useExtensionService().registerExtension(createPreview3DExtension("PreviewGaussianSplat", "Comfy.PreviewGaussianSplat"));
useExtensionService().registerExtension(createPreview3DExtension("PreviewPointCloud", "Comfy.PreviewPointCloud"));
//#endregion

//# sourceMappingURL=load3dPreviewExtensions-DYabsPT0.js.map