import "./rolldown-runtime-w0pxe0c8.js";
import { X as nextTick } from "./vendor-vue-core-ywZ1En3W.js";
import { C as app, da as ComponentWidgetImpl, fo as getNodeByLocatorId, pa as addWidget, qn as useExtensionService } from "./promotionUtils-B4DSH7RT.js";
import { t as Load3D_default } from "./Load3D-BWSnz4jc.js";
import { t as useLoad3dService } from "./load3dService-Gi495ZKn.js";
import { n as isAssetPreviewSupported, r as persistThumbnail } from "./assetPreviewUtil-uR96jmCA.js";
import { o as useLoad3d } from "./useLoad3d-Ct9LrYKU.js";
import { n as createExportMenuItems, t as Load3DConfiguration } from "./Load3DConfiguration-Bo5w2iO8.js";
//#region src/extensions/core/saveMesh.ts
var inputSpec = {
	name: "image",
	type: "Preview3D",
	isPreview: true
};
function applySaveGLBOutput(node, fileInfo) {
	const filePath = (fileInfo.subfolder ?? "") + "/" + (fileInfo.filename ?? "");
	const loadFolder = fileInfo.type;
	const modelWidget = node.widgets?.find((w) => w.name === "image");
	if (!modelWidget) return;
	if (modelWidget.value === filePath && node.properties["Last Time Model File"] === filePath && node.properties["Last Time Model Folder"] === loadFolder) return;
	modelWidget.value = filePath;
	node.properties["Last Time Model File"] = filePath;
	node.properties["Last Time Model Folder"] = loadFolder;
	useLoad3d(node).waitForLoad3d((load3d) => {
		if (!load3d) return;
		new Load3DConfiguration(load3d, node.properties).configureForSaveMesh(loadFolder, filePath, { silentOnNotFound: true });
		if (isAssetPreviewSupported()) {
			const filename = fileInfo.filename ?? "";
			load3d.whenLoadIdle().then(() => load3d.captureThumbnail(256, 256)).then((dataUrl) => fetch(dataUrl).then((r) => r.blob())).then((blob) => persistThumbnail(filename, blob)).catch(() => {});
		}
	});
}
useExtensionService().registerExtension({
	name: "Comfy.SaveGLB",
	async beforeRegisterNodeDef(_nodeType, nodeData) {
		if ("SaveGLB" === nodeData.name) nodeData.input.required.image = ["PREVIEW_3D"];
	},
	onNodeOutputsUpdated(nodeOutputs) {
		for (const [locatorId, output] of Object.entries(nodeOutputs)) {
			const fileInfo = output["3d"]?.[0];
			if (!fileInfo) continue;
			const node = getNodeByLocatorId(app.rootGraph, locatorId);
			if (!node || node.constructor.comfyClass !== "SaveGLB") continue;
			applySaveGLBOutput(node, fileInfo);
		}
	},
	getCustomWidgets() {
		return { PREVIEW_3D(node) {
			const widget = new ComponentWidgetImpl({
				node,
				name: inputSpec.name,
				component: Load3D_default,
				inputSpec,
				options: { hideInPanel: true }
			});
			widget.type = "load3D";
			addWidget(node, widget);
			return { widget };
		} };
	},
	getNodeMenuItems(node) {
		if (node.constructor.comfyClass !== "SaveGLB") return [];
		const load3d = useLoad3dService().getLoad3d(node);
		if (!load3d) return [];
		if (load3d.isSplatModel()) return [];
		return createExportMenuItems(load3d);
	},
	async nodeCreated(node) {
		if (node.constructor.comfyClass !== "SaveGLB") return;
		const [oldWidth, oldHeight] = node.size;
		node.setSize([Math.max(oldWidth, 400), Math.max(oldHeight, 550)]);
		await nextTick();
		useLoad3d(node).onLoad3dReady((load3d) => {
			if (!load3d) return;
			const modelWidget = node.widgets?.find((w) => w.name === "image");
			if (!modelWidget) return;
			const lastTimeModelFile = node.properties["Last Time Model File"];
			const lastTimeModelFolder = node.properties["Last Time Model Folder"] ?? "output";
			if (!lastTimeModelFile) return;
			modelWidget.value = lastTimeModelFile;
			new Load3DConfiguration(load3d, node.properties).configureForSaveMesh(lastTimeModelFolder, lastTimeModelFile, { silentOnNotFound: true });
		});
		const onExecuted = node.onExecuted;
		node.onExecuted = function(output) {
			onExecuted?.call(this, output);
			const fileInfo = output["3d"]?.[0];
			if (!fileInfo) return;
			useLoad3d(node).waitForLoad3d((load3d) => {
				const modelWidget = node.widgets?.find((w) => w.name === "image");
				if (load3d && modelWidget) {
					const filePath = (fileInfo.subfolder ?? "") + "/" + (fileInfo.filename ?? "");
					modelWidget.value = filePath;
					const config = new Load3DConfiguration(load3d, node.properties);
					const loadFolder = fileInfo.type;
					node.properties["Last Time Model File"] = filePath;
					node.properties["Last Time Model Folder"] = loadFolder;
					config.configureForSaveMesh(loadFolder, filePath, { silentOnNotFound: true });
					if (isAssetPreviewSupported()) {
						const filename = fileInfo.filename ?? "";
						load3d.whenLoadIdle().then(() => load3d.captureThumbnail(256, 256)).then((dataUrl) => fetch(dataUrl).then((r) => r.blob())).then((blob) => persistThumbnail(filename, blob)).catch(() => {});
					}
				}
			});
		};
	}
});
//#endregion

//# sourceMappingURL=saveMesh-DQWhoehN.js.map