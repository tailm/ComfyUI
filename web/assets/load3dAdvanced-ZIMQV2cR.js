import "./rolldown-runtime-w0pxe0c8.js";
import { X as nextTick } from "./vendor-vue-core-ywZ1En3W.js";
import { da as ComponentWidgetImpl, pa as addWidget, qn as useExtensionService } from "./promotionUtils-B4DSH7RT.js";
import { t as useLoad3dService } from "./load3dService-Gi495ZKn.js";
import { i as nodeToLoad3dMap, o as useLoad3d } from "./useLoad3d-Ct9LrYKU.js";
import { t as Load3DAdvanced_default } from "./Load3DAdvanced-BRN-mVRb.js";
import { n as createExportMenuItems, t as Load3DConfiguration } from "./Load3DConfiguration-Bo5w2iO8.js";
import { t as snapshotLoad3dState } from "./load3dSerialize-Dk4OiyF_.js";
//#region src/extensions/core/load3dAdvanced.ts
var inputSpecLoad3DAdvanced = {
	name: "viewport_state",
	type: "LOAD_3D_ADVANCED",
	isPreview: false
};
useExtensionService().registerExtension({
	name: "Comfy.Load3DAdvanced",
	beforeRegisterNodeDef(_nodeType, nodeData) {
		if (nodeData.name !== "Load3DAdvanced") return;
		if (!nodeData.input?.required) return;
		nodeData.input.required.viewport_state = ["LOAD_3D_ADVANCED", {}];
	},
	getNodeMenuItems(node) {
		if (node.constructor.comfyClass !== "Load3DAdvanced") return [];
		const load3d = useLoad3dService().getLoad3d(node);
		if (!load3d) return [];
		return createExportMenuItems(load3d);
	},
	getCustomWidgets() {
		return { LOAD_3D_ADVANCED(node) {
			const widget = new ComponentWidgetImpl({
				node,
				name: "viewport_state",
				component: Load3DAdvanced_default,
				inputSpec: inputSpecLoad3DAdvanced,
				options: { hideInPanel: true }
			});
			widget.type = "load3DAdvanced";
			addWidget(node, widget);
			return { widget };
		} };
	},
	async nodeCreated(node) {
		if (node.constructor.comfyClass !== "Load3DAdvanced") return;
		const [oldWidth, oldHeight] = node.size;
		node.setSize([Math.max(oldWidth, 300), Math.max(oldHeight, 600)]);
		await nextTick();
		useLoad3d(node).onLoad3dReady((load3d) => {
			const modelWidget = node.widgets?.find((w) => w.name === "model_file");
			const width = node.widgets?.find((w) => w.name === "width");
			const height = node.widgets?.find((w) => w.name === "height");
			if (!modelWidget || !width || !height) return;
			const cameraState = node.properties["Camera Config"]?.state;
			new Load3DConfiguration(load3d, node.properties).configure({
				loadFolder: "input",
				modelWidget,
				cameraState,
				width,
				height
			});
		});
		useLoad3d(node).waitForLoad3d(() => {
			const sceneWidget = node.widgets?.find((w) => w.name === "viewport_state");
			if (!sceneWidget) return;
			sceneWidget.serializeValue = async () => {
				const currentLoad3d = nodeToLoad3dMap.get(node);
				if (!currentLoad3d) {
					console.error("No load3d instance found for node");
					return null;
				}
				return snapshotLoad3dState(node, currentLoad3d);
			};
		});
	}
});
//#endregion

//# sourceMappingURL=load3dAdvanced-ZIMQV2cR.js.map