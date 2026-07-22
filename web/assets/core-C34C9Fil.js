const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./load3d-a_dT0MXt.js","./rolldown-runtime-w0pxe0c8.js","./promotionUtils-BjUDpLi8.js","./_plugin-vue_export-helper-BKp_-DiS.js","./vendor-primevue-Di5q1E0M.js","./vendor-vue-core-ywZ1En3W.js","./vendor-other-DslE47pR.js","./vendor-three-JCi_5yX-.js","./vendor-tiptap-BOgG_8hl.js","./vendor-reka-ui-BL45aHvm.js","./vendor-i18n-BitfRK9w.js","./vendor-sentry-BeVhjky-.js","./vendor-vueuse-D8rwdKM0.js","./vendor-axios-BWFjRHOY.js","./vendor-markdown-dKTpR1HU.js","./vendor-yjs-Cmf7NGGj.js","./vendor-zod-BwmrqdWK.js","./api-Bz5NhLSR.js","./types-4cVPtFn2.js","./toastStore-Dafwoqcw.js","./devFeatureFlagOverride-C_h7DxV8.js","./formatUtil-NyC-AHAf.js","./src-CAuVu1U5.js","./downloadUtil-DoGBP6nq.js","./i18n-JcytnyXX.js","./commands-CXXLFVIe.js","./main-CZJQqPSe.js","./nodeDefs-DNc3psLh.js","./settings-CXXL4Tkc.js","./WaveAudioPlayer-DqhSqR-T.js","./Button-BOAvjEOG.js","./Slider-DrBXpOpg.js","./DialogHeader-D4JcQCFk.js","./dialogStore-B5tjby6O.js","./Loader-Pq650Xlb.js","./Popover-D6A0rMur.js","./useModalLiftedZIndex-DKRRcl_q.js","./ColorPicker-BdrSTTzc.js","./SelectValue-CrSaS-Kt.js","./TagsInputItemText-CszoEoLz.js","./envUtil-DPwFgfSI.js","./teamWorkspaceStore-Me5msqSA.js","./remoteConfig-0E2rLe-N.js","./userStore-sNxhcspP.js","./useImageQuiet-BNuH5iCW.js","./VideoPlayOverlay-K_gXsBIz.js","./useFeatureUsageTracker-B-33shAP.js","./telemetry-CLr022VN.js","./widgetTypes-_soADytj.js","./markdownRendererUtil-DI_d2JTX.js","./Load3D-CxIXBsO8.js","./Load3DControls-CN7VNbG6.js","./constants-DoEDz1eO.js","./Load3dViewerContent-CEeTjahP.js","./AnimationControls-D7QZP0on.js","./toggle-group-CAUywngo.js","./useLoad3dViewer-CNmNBWj7.js","./load3dService-Bb1Jnj-y.js","./useClickDragGuard-n6cTiMSw.js","./WebGLViewport-174hLWkp.js","./nodeTypes-NmcmANU-.js","./useLoad3d-GBwZPOAh.js","./assetPreviewUtil-B9eToKlF.js","./Load3DConfiguration-6aodASkZ.js","./load3dSerialize-D6Sm07bs.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css","./Load3dViewerContent-ChUqJAYk.css","./Load3D-Cjtb6wCf.css","./load3dAdvanced-DHpVuF8u.js","./Load3DAdvanced-XWdl0u94.js","./load3dPreviewExtensions-pk5nZ9Ke.js","./saveMesh-DWodkUMe.js","./nodeTemplates-SBbrTS0I.js"])))=>i.map(i=>d[i]);
import { a as __toESM } from "./rolldown-runtime-w0pxe0c8.js";
import { Q as __vitePreload } from "./vendor-primevue-Di5q1E0M.js";
import { Mt as shallowReactive } from "./vendor-vue-core-ywZ1En3W.js";
import { B as toolkit, M as require_loglevel, r as mediaRecorderConstructor } from "./vendor-other-DslE47pR.js";
import { Ba as LGraphGroup, C as app, Er as useMaskEditorStore, G as ComfyDialog, Go as widgetId, H as useNodeOutputStore, Ha as isComboWidget, Ho as useWidgetValueStore, J as useNodeDefStore, Jr as assetService, M as lcm, Ma as LiteGraph, No as createBounds, O as deserialiseAndCreate, Pa as LGraphCanvas, Qn as isValidWidgetType, S as ComfyApp, Tr as useCanvasTransform, Va as LGraphNode, W as $el, Wa as NodeSlot, Xn as ComfyWidgets, Yn as useWidgetStore, Zn as addValueControlWidgets, _a as useChainCallback, _r as CONFIG, aa as applyTextReplacements, b as useWorkflowStore, br as useMaskEditor, ea as useSettingStore, er as useNodePaste, fo as getNodeByLocatorId, nr as useNodeDragAndDrop, pi as useDialogService, qn as useExtensionService, qo as parseNodeId, rr as createAssetWidget, tr as useNodeFileInput, vr as GET_CONFIG } from "./promotionUtils-BjUDpLi8.js";
import { s as t } from "./i18n-JcytnyXX.js";
import { C as isIntInputSpec, S as isFloatInputSpec, _ as getComboSpecComboOptions, r as api, v as getInputSpecType, w as isMediaUploadComboInput, y as isComboInputSpec } from "./api-Bz5NhLSR.js";
import { i as resolveNodeRootGraphId } from "./Popover-D6A0rMur.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import { n as isDesktop, t as isCloud } from "./types-4cVPtFn2.js";
import { S as isValidUrl, k as processDynamicPrompt } from "./formatUtil-NyC-AHAf.js";
import { t as useDialogStore } from "./dialogStore-B5tjby6O.js";
import { i as useExtensionStore, t as electronAPI } from "./envUtil-DPwFgfSI.js";
import { t as useExternalLink } from "./useExternalLink-BB1QhkxL.js";
import { t as isLoad3dNode } from "./nodeTypes-NmcmANU-.js";
import { t as useAudioService } from "./audioService-Bg5Ox7hd.js";
//#region src/extensions/core/clipspace.ts
var ClipspaceDialog = class ClipspaceDialog extends ComfyDialog {
	static items = [];
	static instance = null;
	static registerButton(name, contextPredicate, callback) {
		const item = $el("button", {
			type: "button",
			textContent: name,
			contextPredicate,
			onclick: callback
		});
		ClipspaceDialog.items.push(item);
	}
	static invalidatePreview() {
		if (ComfyApp.clipspace && ComfyApp.clipspace.imgs && ComfyApp.clipspace.imgs.length > 0) {
			const img_preview = document.getElementById("clipspace_preview");
			if (img_preview) {
				img_preview.src = ComfyApp.clipspace.imgs[ComfyApp.clipspace["selectedIndex"]].src;
				img_preview.style.maxHeight = "100%";
				img_preview.style.maxWidth = "100%";
			}
		}
	}
	static invalidate() {
		if (ClipspaceDialog.instance) {
			const self = ClipspaceDialog.instance;
			const imgSettings = self.createImgSettings();
			const children = $el("div.comfy-modal-content", [...imgSettings ? [imgSettings] : [], ...self.createButtons()]);
			if (self.element) {
				if (self.element.firstChild) self.element.removeChild(self.element.firstChild);
				self.element.appendChild(children);
			} else self.element = $el("div.comfy-modal", { parent: document.body }, [children]);
			if (self.element.children[0].children.length <= 1) self.element.children[0].appendChild($el("p", {}, ["Unable to find the features to edit content of a format stored in the current Clipspace."]));
			ClipspaceDialog.invalidatePreview();
		}
	}
	constructor() {
		super();
	}
	createButtons() {
		const buttons = [];
		for (let idx in ClipspaceDialog.items) {
			const item = ClipspaceDialog.items[idx];
			if (!item.contextPredicate || item.contextPredicate()) buttons.push(ClipspaceDialog.items[idx]);
		}
		buttons.push($el("button", {
			type: "button",
			textContent: "Close",
			onclick: () => {
				this.close();
			}
		}));
		return buttons;
	}
	createImgSettings() {
		if (ComfyApp.clipspace?.imgs) {
			const combo_items = [];
			const imgs = ComfyApp.clipspace.imgs;
			for (let i = 0; i < imgs.length; i++) combo_items.push($el("option", { value: i }, [`${i}`]));
			const combo1 = $el("select", {
				id: "clipspace_img_selector",
				onchange: (event) => {
					if (event.target && ComfyApp.clipspace) {
						ComfyApp.clipspace["selectedIndex"] = event.target.selectedIndex;
						ClipspaceDialog.invalidatePreview();
					}
				}
			}, combo_items);
			const row1 = $el("tr", {}, [$el("td", {}, [$el("font", { color: "white" }, ["Select Image"])]), $el("td", {}, [combo1])]);
			const combo2 = $el("select", {
				id: "clipspace_img_paste_mode",
				onchange: (event) => {
					if (event.target && ComfyApp.clipspace) ComfyApp.clipspace["img_paste_mode"] = event.target.value;
				}
			}, [$el("option", { value: "selected" }, "selected"), $el("option", { value: "all" }, "all")]);
			combo2.value = ComfyApp.clipspace["img_paste_mode"];
			return $el("table", {}, [
				row1,
				$el("tr", {}, [$el("td", {}, [$el("font", { color: "white" }, ["Paste Mode"])]), $el("td", {}, [combo2])]),
				$el("tr", {}, [$el("td", {
					align: "center",
					width: "100px",
					height: "100px",
					colSpan: "2"
				}, [$el("img", {
					id: "clipspace_preview",
					ondragstart: () => false
				}, [])])])
			]);
		} else return null;
	}
	createImgPreview() {
		if (ComfyApp.clipspace?.imgs) return $el("img", {
			id: "clipspace_preview",
			ondragstart: () => false
		});
		else return null;
	}
	show() {
		ClipspaceDialog.invalidate();
		this.element.style.display = "block";
	}
};
app.registerExtension({
	name: "Comfy.Clipspace",
	init() {
		app.openClipspace = function() {
			if (!ClipspaceDialog.instance) {
				ClipspaceDialog.instance = new ClipspaceDialog();
				ComfyApp.clipspace_invalidate_handler = ClipspaceDialog.invalidate;
			}
			if (ComfyApp.clipspace) ClipspaceDialog.instance.show();
			else app.ui.dialog.show("Clipspace is Empty!");
		};
	}
});
//#endregion
//#region src/extensions/core/contextMenuFilter.ts
app.registerExtension({
	name: "Comfy.ContextMenuFilter",
	init() {
		const ctxMenu = LiteGraph.ContextMenu;
		LiteGraph.ContextMenu = function(values, options) {
			const ctx = new ctxMenu(values, options);
			if (options?.className === "dark" && values?.length > 4) {
				const filter = document.createElement("input");
				filter.classList.add("comfy-context-menu-filter");
				filter.placeholder = "Filter list";
				ctx.root.prepend(filter);
				const items = Array.from(ctx.root.querySelectorAll(".litemenu-entry"));
				let displayedItems = [...items];
				let itemCount = displayedItems.length;
				requestAnimationFrame(() => {
					const clickedComboValue = LGraphCanvas.active_canvas.current_node?.widgets?.filter((w) => isComboWidget(w) && w.options.values?.length === values.length).find((w) => w.options.values?.every((v, i) => v === values[i]))?.value;
					let selectedIndex = clickedComboValue ? values.findIndex((v) => v === clickedComboValue) : 0;
					if (selectedIndex < 0) selectedIndex = 0;
					let selectedItem = displayedItems[selectedIndex];
					updateSelected();
					function updateSelected() {
						selectedItem?.style.setProperty("background-color", "");
						selectedItem?.style.setProperty("color", "");
						selectedItem = displayedItems[selectedIndex];
						selectedItem?.style.setProperty("background-color", "#ccc", "important");
						selectedItem?.style.setProperty("color", "#000", "important");
					}
					const positionList = () => {
						if (ctx.root.getBoundingClientRect().top < 0) {
							const scale = 1 - ctx.root.getBoundingClientRect().height / ctx.root.clientHeight;
							const shift = ctx.root.clientHeight * scale / 2;
							ctx.root.style.top = -shift + "px";
						}
					};
					filter.addEventListener("keydown", (event) => {
						switch (event.key) {
							case "ArrowUp":
								event.preventDefault();
								if (selectedIndex === 0) selectedIndex = itemCount - 1;
								else selectedIndex--;
								updateSelected();
								break;
							case "ArrowRight":
								event.preventDefault();
								selectedIndex = itemCount - 1;
								updateSelected();
								break;
							case "ArrowDown":
								event.preventDefault();
								if (selectedIndex === itemCount - 1) selectedIndex = 0;
								else selectedIndex++;
								updateSelected();
								break;
							case "ArrowLeft":
								event.preventDefault();
								selectedIndex = 0;
								updateSelected();
								break;
							case "Enter":
								selectedItem?.click();
								break;
							case "Escape":
								ctx.close();
								break;
						}
					});
					filter.addEventListener("input", () => {
						const term = filter.value.toLocaleLowerCase();
						displayedItems = items.filter((item) => {
							const isVisible = !term || item.textContent?.toLocaleLowerCase().includes(term);
							item.style.display = isVisible ? "block" : "none";
							return isVisible;
						});
						selectedIndex = 0;
						if (displayedItems.includes(selectedItem)) selectedIndex = displayedItems.findIndex((d) => d === selectedItem);
						itemCount = displayedItems.length;
						updateSelected();
						if (options.event) {
							let top = options.event.clientY - 10;
							const bodyRect = document.body.getBoundingClientRect();
							const rootRect = ctx.root.getBoundingClientRect();
							if (bodyRect.height && top > bodyRect.height - rootRect.height - 10) top = Math.max(0, bodyRect.height - rootRect.height - 10);
							ctx.root.style.top = top + "px";
							positionList();
						}
					});
					requestAnimationFrame(() => {
						filter.focus();
						positionList();
					});
				});
			}
			return ctx;
		};
		LiteGraph.ContextMenu.prototype = ctxMenu.prototype;
	}
});
//#endregion
//#region src/extensions/core/createBoundingBoxes.ts
var DIMENSION_WIDGETS = new Set(["width", "height"]);
useExtensionService().registerExtension({
	name: "Comfy.CreateBoundingBoxes",
	nodeCreated(node) {
		if (node.constructor.comfyClass !== "CreateBoundingBoxes") return;
		const [oldWidth, oldHeight] = node.size;
		node.setSize([Math.max(oldWidth, 420), Math.max(oldHeight, 560)]);
		const widgetValueStore = useWidgetValueStore();
		const syncDimensionVisibility = () => {
			const slot = node.findInputSlot("background");
			const hidden = slot >= 0 && node.isInputConnected(slot);
			for (const widget of node.widgets ?? []) {
				if (!DIMENSION_WIDGETS.has(widget.name)) continue;
				widget.hidden = hidden;
				const state = widget.widgetId ? widgetValueStore.getWidget(widget.widgetId) : void 0;
				if (state?.options) state.options.hidden = hidden;
				else widget.options.hidden = hidden;
			}
		};
		syncDimensionVisibility();
		node.onConnectionsChange = useChainCallback(node.onConnectionsChange, syncDimensionVisibility);
	}
});
//#endregion
//#region src/extensions/core/widgetValuePropagation.ts
function applyFirstWidgetValueToGraph(node, extraLinks = [], transformValue) {
	const output = node.outputs[0];
	if (!output?.links?.length || !node.graph) return;
	const sourceWidget = node.widgets?.[0];
	if (!sourceWidget) return;
	let value = sourceWidget.value;
	if (transformValue) value = transformValue(value);
	const graphMouse = app.canvas?.graph_mouse ?? [0, 0];
	const links = [...output.links.map((linkId) => node.graph.links[linkId]), ...extraLinks];
	for (const linkInfo of links) {
		if (!linkInfo) continue;
		const targetNode = node.graph.getNodeById(linkInfo.target_id);
		const input = targetNode?.inputs[linkInfo.target_slot];
		if (!targetNode || !input) {
			console.warn("Unable to resolve node or input for link", linkInfo);
			continue;
		}
		const widgetName = input.widget?.name;
		if (!widgetName) {
			console.warn("Invalid widget or widget name", input.widget);
			continue;
		}
		const targetWidget = targetNode.widgets?.find((widget) => widget.name === widgetName);
		if (!targetWidget) {
			console.warn(`Unable to find widget "${widgetName}" on node [${targetNode.id}]`);
			continue;
		}
		targetWidget.value = value;
		targetWidget.callback?.(targetWidget.value, app.canvas, targetNode, graphMouse, {});
	}
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.widgetValuePropagation = window.comfyAPI.widgetValuePropagation || {};
window.comfyAPI.widgetValuePropagation.applyFirstWidgetValueToGraph = applyFirstWidgetValueToGraph;
//#endregion
//#region src/extensions/core/customWidgets.ts
function applyToGraph(extraLinks = []) {
	applyFirstWidgetValueToGraph(this, extraLinks);
}
function onCustomComboCreated() {
	this.applyToGraph = applyToGraph;
	const comboWidget = this.widgets[0];
	const values = shallowReactive([]);
	comboWidget.options.values = values;
	const updateCombo = () => {
		values.splice(0, values.length, ...this.widgets.filter((w) => w.name.startsWith("option") && w.value).map((w) => `${w.value}`));
		if (app.configuringGraph || !this.graph) return;
		if (values.includes(`${comboWidget.value}`)) return;
		comboWidget.value = values[0] ?? "";
		comboWidget.callback?.(comboWidget.value);
	};
	comboWidget.callback = useChainCallback(comboWidget.callback, () => this.applyToGraph());
	this.onAdded = useChainCallback(this.onAdded, function() {
		updateCombo();
	});
	function addOption(node) {
		if (!node.widgets) return;
		const widgetName = `option${node.widgets.length - 1}`;
		const widget = node.addWidget("string", widgetName, "", () => {});
		if (!widget) return;
		let localValue = `${widget.value ?? ""}`;
		Object.defineProperty(widget, "value", {
			get() {
				return useWidgetValueStore().getWidget(widgetId(app.rootGraph.id, node.id, widgetName))?.value ?? localValue;
			},
			set(v) {
				localValue = v;
				const state = useWidgetValueStore().getWidget(widgetId(app.rootGraph.id, node.id, widgetName));
				if (state) state.value = v;
				updateCombo();
				if (!node.widgets) return;
				const lastWidget = node.widgets.at(-1);
				if (lastWidget === this) {
					if (v) addOption(node);
					return;
				}
				if (v || node.widgets.at(-2) !== this || lastWidget?.value) return;
				node.widgets.pop();
				node.computeSize(node.size);
				this.callback(v);
			}
		});
	}
	const widgets = this.widgets;
	widgets.push({
		name: "index",
		type: "hidden",
		get value() {
			return widgets.slice(2).findIndex((w) => w.value === comboWidget.value);
		},
		set value(_) {},
		draw: () => void 0,
		computeSize: () => [0, -4],
		options: { hidden: true },
		y: 0
	});
	addOption(this);
}
function onCustomIntCreated() {
	const valueWidget = this.widgets?.[0];
	if (!valueWidget) return;
	Object.defineProperty(valueWidget.options, "min", {
		get: () => this.properties.min ?? -(2 ** 63),
		set: (v) => {
			this.properties.min = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
	Object.defineProperty(valueWidget.options, "max", {
		get: () => this.properties.max ?? 2 ** 63,
		set: (v) => {
			this.properties.max = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
	Object.defineProperty(valueWidget.options, "step2", {
		get: () => this.properties.step ?? 1,
		set: (v) => {
			this.properties.step = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
}
var DISPLAY_WIDGET_TYPES = new Set([
	"gradientslider",
	"slider",
	"knob"
]);
function onCustomFloatCreated() {
	const valueWidget = this.widgets?.[0];
	if (!valueWidget) return;
	let baseType = valueWidget.type;
	Object.defineProperty(valueWidget, "type", {
		get: () => {
			const display = this.properties.display;
			if (display && DISPLAY_WIDGET_TYPES.has(display)) return display;
			return baseType;
		},
		set: (v) => {
			baseType = v;
		}
	});
	Object.defineProperty(valueWidget.options, "gradient_stops", {
		enumerable: true,
		get: () => this.properties.gradient_stops,
		set: (v) => {
			this.properties.gradient_stops = v;
		}
	});
	Object.defineProperty(valueWidget.options, "min", {
		get: () => this.properties.min ?? -Infinity,
		set: (v) => {
			this.properties.min = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
	Object.defineProperty(valueWidget.options, "max", {
		get: () => this.properties.max ?? Infinity,
		set: (v) => {
			this.properties.max = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
	Object.defineProperty(valueWidget.options, "precision", {
		get: () => this.properties.precision ?? 1,
		set: (v) => {
			this.properties.precision = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
	Object.defineProperty(valueWidget.options, "step2", {
		get: () => {
			if (this.properties.step) return this.properties.step;
			const { precision } = this.properties;
			return typeof precision === "number" ? 5 * 10 ** -precision : 1;
		},
		set: (v) => this.properties.step = v
	});
	Object.defineProperty(valueWidget.options, "round", {
		get: () => {
			if (this.properties.round) return this.properties.round;
			const { precision } = this.properties;
			return typeof precision === "number" ? 10 ** -precision : .1;
		},
		set: (v) => {
			this.properties.round = v;
			valueWidget.callback?.(valueWidget.value);
		}
	});
}
app.registerExtension({
	name: "Comfy.CustomWidgets",
	beforeRegisterNodeDef(nodeType, nodeData) {
		if (nodeData?.name === "CustomCombo") nodeType.prototype.onNodeCreated = useChainCallback(nodeType.prototype.onNodeCreated, onCustomComboCreated);
		else if (nodeData?.name === "PrimitiveInt") nodeType.prototype.onNodeCreated = useChainCallback(nodeType.prototype.onNodeCreated, onCustomIntCreated);
		else if (nodeData?.name === "PrimitiveFloat") nodeType.prototype.onNodeCreated = useChainCallback(nodeType.prototype.onNodeCreated, onCustomFloatCreated);
	}
});
//#endregion
//#region src/extensions/core/dynamicPrompts.ts
useExtensionService().registerExtension({
	name: "Comfy.DynamicPrompts",
	nodeCreated(node) {
		if (node.widgets) {
			const widgets = node.widgets.filter((w) => w.dynamicPrompts);
			for (const widget of widgets) widget.serializeValue = (workflowNode, widgetIndex) => {
				if (typeof widget.value !== "string") return widget.value;
				const prompt = processDynamicPrompt(widget.value);
				if (workflowNode?.widgets_values) workflowNode.widgets_values[widgetIndex] = prompt;
				return prompt;
			};
		}
	}
});
//#endregion
//#region src/extensions/core/editAttention.ts
function incrementWeight(weight, delta) {
	const floatWeight = parseFloat(weight);
	if (isNaN(floatWeight)) return weight;
	const newWeight = floatWeight + delta;
	return String(Number(newWeight.toFixed(10)));
}
function findNearestEnclosure(text, cursorPos) {
	let start = cursorPos;
	let end = cursorPos;
	let openCount = 0;
	let closeCount = 0;
	if (text[cursorPos] === "(") end = cursorPos + 1;
	else {
		while (start >= 0) {
			start--;
			if (text[start] === "(" && openCount === closeCount) break;
			if (text[start] === "(") openCount++;
			if (text[start] === ")") closeCount++;
		}
		if (start < 0) return null;
		openCount = 0;
		closeCount = 0;
	}
	while (end < text.length) {
		if (text[end] === ")" && openCount === closeCount) break;
		if (text[end] === "(") openCount++;
		if (text[end] === ")") closeCount++;
		end++;
	}
	if (end === text.length) return null;
	return {
		start: start + 1,
		end
	};
}
function addWeightToParentheses(text) {
	const parenMatch = text.match(/^\((.*)\)$/);
	if (!parenMatch) return text;
	const innerText = parenMatch[1];
	return !/(?:^|\s)\d{1,2}:\d{2}$/.test(innerText) && /:[+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?$/.test(innerText) ? text : `(${innerText}:1.0)`;
}
app.registerExtension({
	name: "Comfy.EditAttention",
	init() {
		const editAttentionDelta = app.ui.settings.addSetting({
			id: "Comfy.EditAttention.Delta",
			category: [
				"Comfy",
				"EditTokenWeight",
				"Delta"
			],
			name: "Ctrl+up/down precision",
			type: "slider",
			attrs: {
				min: .01,
				max: .5,
				step: .01
			},
			defaultValue: .05
		});
		function editAttention(event) {
			const inputField = event.composedPath()[0];
			const delta = parseFloat(editAttentionDelta.value);
			if (inputField.tagName !== "TEXTAREA") return;
			if (!(event.key === "ArrowUp" || event.key === "ArrowDown")) return;
			if (!event.ctrlKey && !event.metaKey) return;
			event.preventDefault();
			let start = inputField.selectionStart;
			let end = inputField.selectionEnd;
			let selectedText = inputField.value.substring(start, end);
			if (!selectedText) {
				const nearestEnclosure = findNearestEnclosure(inputField.value, start);
				if (nearestEnclosure) {
					start = nearestEnclosure.start;
					end = nearestEnclosure.end;
					selectedText = inputField.value.substring(start, end);
				} else {
					const delimiters = " .,\\/!?%^*;:{}=-_`~()\r\n	";
					while (!delimiters.includes(inputField.value[start - 1]) && start > 0) start--;
					while (!delimiters.includes(inputField.value[end]) && end < inputField.value.length) end++;
					selectedText = inputField.value.substring(start, end);
					if (!selectedText) return;
				}
			}
			if (selectedText[selectedText.length - 1] === " ") {
				selectedText = selectedText.substring(0, selectedText.length - 1);
				end -= 1;
			}
			if (inputField.value[start - 1] === "(" && inputField.value[end] === ")") {
				start -= 1;
				end += 1;
				selectedText = inputField.value.substring(start, end);
			}
			if (selectedText[0] !== "(" || selectedText[selectedText.length - 1] !== ")") selectedText = `(${selectedText})`;
			selectedText = addWeightToParentheses(selectedText);
			const weightDelta = event.key === "ArrowUp" ? delta : -delta;
			const updatedText = selectedText.replace(/\((.*):([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)\)/, (_, text, weight) => {
				weight = incrementWeight(weight, weightDelta);
				if (weight == 1) return text;
				else return `(${text}:${weight})`;
			});
			inputField.setSelectionRange(start, end);
			document.execCommand("insertText", false, updatedText);
			inputField.setSelectionRange(start, start + updatedText.length);
		}
		window.addEventListener("keydown", editAttention);
	}
});
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.editAttention = window.comfyAPI.editAttention || {};
window.comfyAPI.editAttention.incrementWeight = incrementWeight;
window.comfyAPI.editAttention.findNearestEnclosure = findNearestEnclosure;
window.comfyAPI.editAttention.addWeightToParentheses = addWeightToParentheses;
//#endregion
//#region src/constants/uvMirrors.ts
var import_loglevel = /* @__PURE__ */ __toESM(require_loglevel(), 1);
var PYTHON_MIRROR = {
	settingId: "Comfy-Desktop.UV.PythonInstallMirror",
	mirror: "https://github.com/astral-sh/python-build-standalone/releases/download",
	fallbackMirror: "https://python-standalone.org/mirror/astral-sh/python-build-standalone",
	validationPathSuffix: "/20250115/cpython-3.10.16+20250115-aarch64-apple-darwin-debug-full.tar.zst.sha256"
};
//#endregion
//#region src/utils/electronMirrorCheck.ts
/**
* Check if a mirror is reachable from the electron App.
* @param mirror - The mirror to check.
* @returns True if the mirror is reachable, false otherwise.
*/
var checkMirrorReachable = async (mirror) => {
	return isValidUrl(mirror) && await electronAPI().NetWork.canAccessUrl(mirror);
};
//#endregion
//#region src/extensions/core/electronAdapter.ts
(async () => {
	if (!isDesktop) return;
	const electronAPI$1 = electronAPI();
	const desktopAppVersion = await electronAPI$1.getElectronVersion();
	const workflowStore = useWorkflowStore();
	const toastStore = useToastStore();
	const { staticUrls, buildDocsUrl } = useExternalLink();
	const onChangeRestartApp = (newValue, oldValue) => {
		if (oldValue !== void 0 && newValue !== oldValue) electronAPI$1.restartApp("Restart ComfyUI to apply changes.", 1500);
	};
	app.registerExtension({
		name: "Comfy.ElectronAdapter",
		settings: [
			{
				id: "Comfy-Desktop.AutoUpdate",
				category: [
					"Comfy-Desktop",
					"General",
					"AutoUpdate"
				],
				name: "Automatically check for updates",
				type: "boolean",
				defaultValue: true,
				onChange: onChangeRestartApp
			},
			{
				id: "Comfy-Desktop.SendStatistics",
				category: [
					"Comfy-Desktop",
					"General",
					"Send Statistics"
				],
				name: "Send anonymous usage metrics",
				type: "boolean",
				defaultValue: true,
				onChange: onChangeRestartApp
			},
			{
				id: "Comfy-Desktop.WindowStyle",
				category: [
					"Comfy-Desktop",
					"General",
					"Window Style"
				],
				name: "Window Style",
				tooltip: "Custom: Replace the system title bar with ComfyUI's Top menu",
				type: "combo",
				experimental: true,
				defaultValue: "default",
				options: ["default", "custom"],
				onChange: (newValue, oldValue) => {
					if (!oldValue) return;
					electronAPI$1.Config.setWindowStyle(newValue);
				}
			},
			{
				id: "Comfy-Desktop.UV.PythonInstallMirror",
				name: "Python Install Mirror",
				tooltip: `Managed Python installations are downloaded from the Astral python-build-standalone project. This variable can be set to a mirror URL to use a different source for Python installations. The provided URL will replace https://github.com/astral-sh/python-build-standalone/releases/download in, e.g., https://github.com/astral-sh/python-build-standalone/releases/download/20240713/cpython-3.12.4%2B20240713-aarch64-apple-darwin-install_only.tar.gz. Distributions can be read from a local directory by using the file:// URL scheme.`,
				type: "url",
				defaultValue: "",
				attrs: { validateUrlFn(mirror) {
					return checkMirrorReachable(mirror + PYTHON_MIRROR.validationPathSuffix);
				} }
			},
			{
				id: "Comfy-Desktop.UV.PypiInstallMirror",
				name: "Pypi Install Mirror",
				tooltip: `Default pip install mirror`,
				type: "url",
				defaultValue: "",
				attrs: { validateUrlFn: checkMirrorReachable }
			},
			{
				id: "Comfy-Desktop.UV.TorchInstallMirror",
				name: "Torch Install Mirror",
				tooltip: `Pip install mirror for pytorch`,
				type: "url",
				defaultValue: "",
				attrs: { validateUrlFn: checkMirrorReachable }
			}
		],
		commands: [
			{
				id: "Comfy-Desktop.Folders.OpenLogsFolder",
				label: "Open Logs Folder",
				icon: "pi pi-folder-open",
				function() {
					electronAPI$1.openLogsFolder();
				}
			},
			{
				id: "Comfy-Desktop.Folders.OpenModelsFolder",
				label: "Open Models Folder",
				icon: "pi pi-folder-open",
				function() {
					electronAPI$1.openModelsFolder();
				}
			},
			{
				id: "Comfy-Desktop.Folders.OpenOutputsFolder",
				label: "Open Outputs Folder",
				icon: "pi pi-folder-open",
				function() {
					electronAPI$1.openOutputsFolder();
				}
			},
			{
				id: "Comfy-Desktop.Folders.OpenInputsFolder",
				label: "Open Inputs Folder",
				icon: "pi pi-folder-open",
				function() {
					electronAPI$1.openInputsFolder();
				}
			},
			{
				id: "Comfy-Desktop.Folders.OpenCustomNodesFolder",
				label: "Open Custom Nodes Folder",
				icon: "pi pi-folder-open",
				function() {
					electronAPI$1.openCustomNodesFolder();
				}
			},
			{
				id: "Comfy-Desktop.Folders.OpenModelConfig",
				label: "Open extra_model_paths.yaml",
				icon: "pi pi-file",
				function() {
					electronAPI$1.openModelConfig();
				}
			},
			{
				id: "Comfy-Desktop.OpenDevTools",
				label: "Open DevTools",
				icon: "pi pi-code",
				function() {
					electronAPI$1.openDevTools();
				}
			},
			{
				id: "Comfy-Desktop.OpenUserGuide",
				label: "Desktop User Guide",
				icon: "pi pi-book",
				function() {
					window.open(buildDocsUrl("/installation/desktop", {
						includeLocale: true,
						platform: true
					}), "_blank");
				}
			},
			{
				id: "Comfy-Desktop.CheckForUpdates",
				label: "Check for Updates",
				icon: "pi pi-sync",
				async function() {
					try {
						const updateInfo = await electronAPI$1.checkForUpdates({ disableUpdateReadyAction: true });
						if (!updateInfo.isUpdateAvailable) {
							toastStore.add({
								severity: "info",
								summary: t("desktopUpdate.noUpdateFound"),
								life: 5e3
							});
							return;
						}
						if (await useDialogService().confirm({
							title: t("desktopUpdate.updateFoundTitle", { version: updateInfo.version }),
							message: t("desktopUpdate.updateAvailableMessage"),
							type: "default"
						})) try {
							electronAPI$1.restartAndInstall();
						} catch (error) {
							import_loglevel.default.error("Error installing update:", error);
							toastStore.add({
								severity: "error",
								summary: t("g.error"),
								detail: t("desktopUpdate.errorInstallingUpdate")
							});
						}
					} catch (error) {
						import_loglevel.default.error("Error checking for updates:", error);
						toastStore.add({
							severity: "error",
							summary: t("g.error"),
							detail: t("desktopUpdate.errorCheckingUpdate")
						});
					}
				}
			},
			{
				id: "Comfy-Desktop.Reinstall",
				label: "Reinstall",
				icon: "pi pi-refresh",
				async function() {
					if (await useDialogService().confirm({
						message: t("desktopMenu.confirmReinstall"),
						title: t("desktopMenu.reinstall"),
						type: "reinstall"
					})) electronAPI$1.reinstall();
				}
			},
			{
				id: "Comfy-Desktop.Restart",
				label: "Restart",
				icon: "pi pi-refresh",
				function() {
					electronAPI$1.restartApp();
				}
			},
			{
				id: "Comfy-Desktop.Quit",
				label: "Quit",
				icon: "pi pi-sign-out",
				async function() {
					if (workflowStore.modifiedWorkflows.length > 0) {
						if (!await useDialogService().confirm({
							message: t("desktopMenu.confirmQuit"),
							title: t("desktopMenu.quit"),
							type: "default"
						})) return;
					}
					electronAPI$1.quit();
				}
			}
		],
		menuCommands: [
			{
				path: ["Help"],
				commands: ["Comfy-Desktop.OpenUserGuide"]
			},
			{
				path: ["Help"],
				commands: ["Comfy-Desktop.OpenDevTools"]
			},
			{
				path: ["Help", "Open Folder"],
				commands: [
					"Comfy-Desktop.Folders.OpenLogsFolder",
					"Comfy-Desktop.Folders.OpenModelsFolder",
					"Comfy-Desktop.Folders.OpenOutputsFolder",
					"Comfy-Desktop.Folders.OpenInputsFolder",
					"Comfy-Desktop.Folders.OpenCustomNodesFolder",
					"Comfy-Desktop.Folders.OpenModelConfig"
				]
			},
			{
				path: ["Help"],
				commands: ["Comfy-Desktop.CheckForUpdates", "Comfy-Desktop.Reinstall"]
			}
		],
		keybindings: [{
			commandId: "Workspace.CloseWorkflow",
			combo: {
				key: "w",
				ctrl: true
			}
		}],
		aboutPageBadges: [{
			label: "ComfyUI_desktop v" + desktopAppVersion,
			url: staticUrls.githubElectron,
			icon: "pi pi-github"
		}]
	});
})();
//#endregion
//#region src/constants/groupNodeConstants.ts
/**
* Constants for group node type prefixes and separators
*
* v1 Prefix + Separator: workflow/
* v2 Prefix + Separator: workflow> (ComfyUI_frontend v1.2.63)
*/
var PREFIX = "workflow";
//#endregion
//#region src/renderer/utils/nodeTypeGuards.ts
var isPrimitiveNode = (node) => node.type === "PrimitiveNode";
//#endregion
//#region src/utils/nodeDefUtil.ts
var IGNORE_KEYS = new Set([
	"default",
	"forceInput",
	"defaultInput",
	"control_after_generate",
	"multiline",
	"tooltip",
	"dynamicPrompts"
]);
var getRange = (options) => {
	return {
		min: options.min ?? -Infinity,
		max: options.max ?? Infinity
	};
};
var mergeNumericInputSpec = (spec1, spec2) => {
	const type = spec1[0];
	const options1 = spec1[1] ?? {};
	const options2 = spec2[1] ?? {};
	const range1 = getRange(options1);
	const range2 = getRange(options2);
	if (range1.min > range2.max || range1.max < range2.min) return null;
	const step1 = options1.step ?? 1;
	const step2 = options2.step ?? 1;
	const mergedOptions = {
		min: Math.max(range1.min, range2.min),
		max: Math.min(range1.max, range2.max),
		step: lcm(step1, step2)
	};
	return mergeCommonInputSpec([type, {
		...options1,
		...mergedOptions
	}], [type, {
		...options2,
		...mergedOptions
	}]);
};
var mergeComboInputSpec = (spec1, spec2) => {
	const options1 = spec1[1] ?? {};
	const options2 = spec2[1] ?? {};
	const comboOptions1 = getComboSpecComboOptions(spec1);
	const comboOptions2 = getComboSpecComboOptions(spec2);
	const intersection = toolkit.intersection(comboOptions1, comboOptions2);
	if (intersection.length === 0) return null;
	return mergeCommonInputSpec(["COMBO", {
		...options1,
		options: intersection
	}], ["COMBO", {
		...options2,
		options: intersection
	}]);
};
var mergeCommonInputSpec = (spec1, spec2) => {
	const type = getInputSpecType(spec1);
	const options1 = spec1[1] ?? {};
	const options2 = spec2[1] ?? {};
	return toolkit.union(toolkit.keys(options1), toolkit.keys(options2)).filter((key) => !IGNORE_KEYS.has(key)).every((key) => {
		const value1 = options1[key];
		const value2 = options2[key];
		return value1 === value2 || toolkit.isNil(value1) && toolkit.isNil(value2);
	}) ? [type, {
		...options1,
		...options2
	}] : null;
};
/**
* Merges two input specs.
*
* @param spec1 - The first input spec.
* @param spec2 - The second input spec.
* @returns The merged input spec, or null if the specs are not mergeable.
*/
var mergeInputSpec = (spec1, spec2) => {
	if (getInputSpecType(spec1) !== getInputSpecType(spec2)) return null;
	if (isIntInputSpec(spec1) || isFloatInputSpec(spec1)) return mergeNumericInputSpec(spec1, spec2);
	if (isComboInputSpec(spec1)) return mergeComboInputSpec(spec1, spec2);
	return mergeCommonInputSpec(spec1, spec2);
};
//#endregion
//#region src/extensions/core/widgetInputs.ts
var replacePropertyName = "Run widget replace on values";
var PrimitiveNode = class extends LGraphNode {
	controlValues;
	lastType;
	static category;
	constructor(title) {
		super(title);
		this.addOutput("connect to widget input", "*");
		this.serialize_widgets = true;
		this.isVirtualNode = true;
		if (!this.properties || !(replacePropertyName in this.properties)) this.addProperty(replacePropertyName, false, "boolean");
	}
	applyToGraph(extraLinks = []) {
		const sourceWidget = this.widgets?.[0];
		const graph = this.graph;
		if (!sourceWidget || !graph) return;
		let v = sourceWidget.value;
		if (v && this.properties[replacePropertyName]) v = applyTextReplacements(graph, v);
		applyFirstWidgetValueToGraph(this, extraLinks, () => v);
	}
	refreshComboInNode() {
		const widget = this.widgets?.[0];
		if (widget?.type === "combo") {
			widget.options.values = this.outputs[0].widget[GET_CONFIG]()[0];
			if (!widget.options.values.includes(widget.value)) {
				widget.value = widget.options.values[0];
				widget.callback?.(widget.value);
			}
		}
	}
	onAfterGraphConfigured() {
		if (this.outputs[0].links?.length && !this.widgets?.length) {
			this._onFirstConnection();
			if (this.widgets && this.widgets_values) for (let i = 0; i < this.widgets_values.length; i++) {
				const w = this.widgets[i];
				if (w) w.value = this.widgets_values[i];
			}
			this._mergeWidgetConfig();
		}
	}
	onConnectionsChange(_type, _index, connected) {
		if (app.configuringGraph) return;
		const links = this.outputs[0].links;
		if (connected) {
			if (links?.length && !this.widgets?.length) this._onFirstConnection();
		} else {
			this._mergeWidgetConfig();
			if (!links?.length) this.onLastDisconnect();
		}
	}
	onConnectOutput(slot, _type, input, target_node, target_slot) {
		if (!input.widget && !(input.type in ComfyWidgets)) return false;
		if (this.outputs[slot].links?.length) {
			const valid = this._isValidConnection(input);
			if (valid) this.applyToGraph([{
				target_id: target_node.id,
				target_slot
			}]);
			return valid;
		}
		return true;
	}
	_onFirstConnection(recreating) {
		if (!this.outputs[0].links || !this.graph) {
			this.onLastDisconnect();
			return;
		}
		const linkId = this.outputs[0].links[0];
		const link = this.graph.links[linkId];
		if (!link) return;
		const theirNode = this.graph.getNodeById(link.target_id);
		if (!theirNode || !theirNode.inputs) return;
		const input = theirNode.inputs[link.target_slot];
		if (!input) return;
		let widget;
		if (!input.widget) {
			if (!(input.type in ComfyWidgets)) return;
			widget = {
				name: input.name,
				[GET_CONFIG]: () => [input.type, {}]
			};
		} else widget = input.widget;
		const config = widget[GET_CONFIG]?.();
		if (!config) return;
		const { type } = getWidgetType(config);
		this.outputs[0].type = type;
		this.outputs[0].name = type;
		this.outputs[0].widget = widget;
		this._createWidget(widget[CONFIG] ?? config, theirNode, widget.name, recreating);
	}
	_createWidget(inputData, node, widgetName, recreating) {
		let type = inputData[0];
		if (type instanceof Array) type = "COMBO";
		const [oldWidth, oldHeight] = this.size;
		let widget;
		if (type === "COMBO" && assetService.shouldUseAssetBrowser(node.comfyClass, widgetName)) {
			widget = this._createAssetWidget(node, widgetName, inputData);
			const theirWidget = node.widgets?.find((w) => w.name === widgetName);
			if (theirWidget) widget.value = theirWidget.value;
			this._finalizeWidget(widget, oldWidth, oldHeight, recreating);
			return;
		}
		if (isValidWidgetType(type)) widget = (ComfyWidgets[type](this, "value", inputData, app) || {}).widget;
		else widget = this.addWidget(type, "value", null, () => {}, {});
		if (node?.widgets && widget) {
			const theirWidget = node.widgets.find((w) => w.name === widgetName);
			if (theirWidget) widget.value = theirWidget.value;
		}
		if (!inputData?.[1]?.control_after_generate && (widget.type === "number" || widget.type === "combo")) {
			let control_value = this.widgets_values?.[1];
			if (!control_value) control_value = "fixed";
			addValueControlWidgets(this, widget, control_value, void 0, inputData);
			if (this.widgets?.[1]) widget.linkedWidgets = [this.widgets[1]];
			const filter = this.widgets_values?.[2];
			if (filter && this.widgets && this.widgets.length === 3) this.widgets[2].value = filter;
		}
		const controlValues = this.controlValues;
		if (this.widgets && this.lastType === this.widgets[0]?.type && controlValues?.length === this.widgets.length - 1) for (let i = 0; i < controlValues.length; i++) this.widgets[i + 1].value = controlValues[i];
		this._finalizeWidget(widget, oldWidth, oldHeight, recreating);
	}
	_createAssetWidget(targetNode, targetInputName, inputData) {
		const defaultValue = inputData[1]?.default;
		return createAssetWidget({
			node: this,
			widgetName: "value",
			nodeTypeForBrowser: targetNode.comfyClass ?? "",
			inputNameForBrowser: targetInputName,
			defaultValue
		});
	}
	_finalizeWidget(widget, oldWidth, oldHeight, recreating) {
		widget.callback = useChainCallback(widget.callback, () => {
			this.applyToGraph();
		});
		this.setSize([Math.max(this.size[0], oldWidth), Math.max(this.size[1], oldHeight)]);
		if (!recreating) {
			const sz = this.computeSize();
			if (this.size[0] < sz[0]) this.size[0] = sz[0];
			if (this.size[1] < sz[1]) this.size[1] = sz[1];
			requestAnimationFrame(() => {
				this.onResize?.(this.size);
			});
		}
	}
	recreateWidget() {
		const values = this.widgets?.map((w) => w.value);
		this._removeWidgets();
		this._onFirstConnection(true);
		if (values?.length && this.widgets) for (let i = 0; i < this.widgets.length; i++) this.widgets[i].value = values[i];
		return this.widgets?.[0];
	}
	_mergeWidgetConfig() {
		const output = this.outputs[0];
		const links = output.links ?? [];
		const hasConfig = !!output.widget?.[CONFIG];
		if (hasConfig) delete output.widget?.[CONFIG];
		if (links?.length < 2 && hasConfig) {
			if (links.length) this.recreateWidget();
			return;
		}
		const config1 = (output.widget?.[GET_CONFIG])?.();
		if (!config1) return;
		if (!(config1[0] === "INT" || config1[0] === "FLOAT") || !this.graph) return;
		for (const linkId of links) {
			const link = this.graph.links[linkId];
			if (!link) continue;
			const theirNode = this.graph.getNodeById(link.target_id);
			if (!theirNode) continue;
			const theirInput = theirNode.inputs[link.target_slot];
			this._isValidConnection(theirInput, hasConfig);
		}
	}
	_isValidConnection(input, forceUpdate) {
		const output = this.outputs?.[0];
		const config2 = (input.widget?.[GET_CONFIG])?.();
		if (!config2) return false;
		return !!mergeIfValid.call(this, output, config2, forceUpdate, this.recreateWidget);
	}
	_removeWidgets() {
		if (this.widgets) {
			for (const w of this.widgets) if (w.onRemove) w.onRemove();
			this.controlValues = [];
			this.lastType = this.widgets[0]?.type;
			for (let i = 1; i < this.widgets.length; i++) this.controlValues.push(this.widgets[i].value);
			setTimeout(() => {
				delete this.lastType;
				delete this.controlValues;
			}, 15);
			this.widgets.length = 0;
		}
	}
	onLastDisconnect() {
		this.outputs[0].type = "*";
		this.outputs[0].name = "connect to widget input";
		delete this.outputs[0].widget;
		this._removeWidgets();
	}
};
function getWidgetConfig(slot) {
	return slot.widget?.[CONFIG] ?? (slot.widget?.[GET_CONFIG])?.() ?? ["*", {}];
}
function getConfig(widgetName) {
	const { nodeData } = this.constructor;
	return nodeData?.input?.required?.[widgetName] ?? nodeData?.input?.optional?.[widgetName];
}
/**
* Convert a widget to an input slot.
* @deprecated Widget to socket conversion is no longer necessary, as they co-exist now.
* @param node The node to convert the widget to an input slot for.
* @param widget The widget to convert to an input slot.
* @returns The input slot that was converted from the widget or undefined if the widget is not found.
* @knipIgnoreUnusedButUsedByCustomNodes
*/
function convertToInput(node, widget) {
	console.warn("Please remove call to convertToInput. Widget to socket conversion is no longer necessary, as they co-exist now.");
	return node.inputs.find((slot) => slot.widget?.name === widget.name);
}
function getWidgetType(config) {
	let type = config[0];
	if (type instanceof Array) type = "COMBO";
	return { type };
}
function setWidgetConfig(slot, config) {
	if (!slot.widget) return;
	if (config) slot.widget[GET_CONFIG] = () => config;
	else delete slot.widget;
	if (!(slot instanceof NodeSlot)) return;
	const graph = slot.node.graph;
	if (!graph) return;
	const link = graph.getLink(slot.link);
	if (!link) return;
	const originNode = graph.getNodeById(link.origin_id);
	if (!originNode || !isPrimitiveNode(originNode)) return;
	if (config) originNode.recreateWidget();
	else if (!app.configuringGraph) {
		originNode.disconnectOutput(0);
		originNode.onLastDisconnect();
	}
}
function mergeIfValid(output, config2, forceUpdate, recreateWidget, config1) {
	if (!config1) config1 = getWidgetConfig(output);
	const customSpec = mergeInputSpec(config1, config2);
	if (customSpec || forceUpdate) {
		if (customSpec) output.widget[CONFIG] = customSpec;
		const widget = recreateWidget?.call(this);
		if (widget) {
			const min = widget.options.min;
			const max = widget.options.max;
			if (min != null && widget.value < min) widget.value = min;
			if (max != null && widget.value > max) widget.value = max;
			widget.callback(widget.value);
		}
	}
	return { customConfig: customSpec?.[1] ?? {} };
}
app.registerExtension({
	name: "Comfy.WidgetInputs",
	async beforeRegisterNodeDef(nodeType, _nodeData) {
		nodeType.prototype.convertWidgetToInput = function() {
			console.warn("Please remove call to convertWidgetToInput. Widget to socket conversion is no longer necessary, as they co-exist now.");
			return false;
		};
		nodeType.prototype.onGraphConfigured = useChainCallback(nodeType.prototype.onGraphConfigured, function() {
			if (!this.inputs) return;
			this.widgets ??= [];
			for (const input of this.inputs) if (input.widget) {
				const name = input.widget.name;
				if (!input.widget[GET_CONFIG]) input.widget[GET_CONFIG] = () => getConfig.call(this, name);
				if (!this.widgets?.find((w) => w.name === name)) this.removeInput(this.inputs.findIndex((i) => i === input));
			}
		});
		nodeType.prototype.onConfigure = useChainCallback(nodeType.prototype.onConfigure, function() {
			if (!app.configuringGraph && this.inputs) {
				for (const input of this.inputs) if (input.widget && !input.widget[GET_CONFIG]) {
					const name = input.widget.name;
					input.widget[GET_CONFIG] = () => getConfig.call(this, name);
				}
			}
		});
		const origOnInputDblClick = nodeType.prototype.onInputDblClick;
		nodeType.prototype.onInputDblClick = function(...[slot, ...args]) {
			const r = origOnInputDblClick?.apply(this, [slot, ...args]);
			const input = this.inputs[slot];
			if (!input.widget) {
				if (!(input.type in ComfyWidgets) && !((input.widget?.[GET_CONFIG])?.()?.[0] instanceof Array)) return r;
			}
			const node = LiteGraph.createNode("PrimitiveNode");
			const graph = app.canvas.graph;
			if (!node || !graph) return r;
			graph?.add(node);
			const pos = [this.pos[0] - node.size[0] - 30, this.pos[1]];
			while (graph.getNodeOnPos(pos[0], pos[1], graph.nodes)) pos[1] += LiteGraph.NODE_TITLE_HEIGHT;
			node.pos = pos;
			node.connect(0, this, slot);
			node.title = input.name;
			return r;
		};
	},
	registerCustomNodes() {
		LiteGraph.registerNodeType("PrimitiveNode", Object.assign(PrimitiveNode, { title: "Primitive" }));
		PrimitiveNode.category = "utilities/primitive";
	}
});
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.widgetInputs = window.comfyAPI.widgetInputs || {};
window.comfyAPI.widgetInputs.PrimitiveNode = PrimitiveNode;
window.comfyAPI.widgetInputs.getWidgetConfig = getWidgetConfig;
window.comfyAPI.widgetInputs.convertToInput = convertToInput;
window.comfyAPI.widgetInputs.setWidgetConfig = setWidgetConfig;
window.comfyAPI.widgetInputs.mergeIfValid = mergeIfValid;
//#endregion
//#region src/extensions/core/groupNode.ts
/**
* Marker symbol stamped on a synthesized group-node type's `nodeData` (via
* {@link markGroupNodeType}) so loaded group-node instances can be detected and
* migrated to subgraphs.
*/
var GROUP = Symbol();
/**
* Stamp the group-node marker onto the registered node type so instances created
* during load can be detected by {@link GroupNodeHandler.isGroupNode}. This is
* stamped directly on the constructor rather than copied through
* {@link ComfyNodeDefImpl} construction, keeping the migration self-contained.
*/
function markGroupNodeType(typeName, config) {
	const ctor = LiteGraph.registered_node_types[typeName];
	if (ctor?.nodeData) ctor.nodeData[GROUP] = config;
}
var GroupNodeConfig = class GroupNodeConfig {
	name;
	nodeData;
	inputCount;
	oldToNewOutputMap;
	newToOldOutputMap;
	oldToNewInputMap;
	oldToNewWidgetMap;
	newToOldWidgetMap;
	primitiveDefs;
	widgetToPrimitive;
	primitiveToWidget;
	nodeInputs;
	outputVisibility;
	nodeDef;
	inputs;
	linksFrom;
	linksTo;
	externalFrom;
	constructor(name, nodeData) {
		this.name = name;
		this.nodeData = nodeData;
		this.getLinks();
		this.inputCount = 0;
		this.oldToNewOutputMap = {};
		this.newToOldOutputMap = {};
		this.oldToNewInputMap = {};
		this.oldToNewWidgetMap = {};
		this.newToOldWidgetMap = {};
		this.primitiveDefs = {};
		this.widgetToPrimitive = {};
		this.primitiveToWidget = {};
		this.nodeInputs = {};
		this.outputVisibility = [];
	}
	async registerType(source = PREFIX) {
		this.nodeDef = {
			output: [],
			output_name: [],
			output_is_list: [],
			output_node: false,
			name: source + ">" + this.name,
			display_name: this.name,
			category: "group nodes" + (">" + source),
			input: { required: {} },
			description: `Group node combining ${this.nodeData.nodes.map((n) => n.type).join(", ")}`,
			python_module: "custom_nodes." + this.name
		};
		this.inputs = [];
		const seenInputs = {};
		const seenOutputs = {};
		for (let i = 0; i < this.nodeData.nodes.length; i++) {
			const node = this.nodeData.nodes[i];
			node.index = i;
			this.processNode(node, seenInputs, seenOutputs);
		}
		for (const p of this._convertedToProcess) p();
		this._convertedToProcess = [];
		if (!this.nodeDef) return;
		const typeName = `${PREFIX}>${this.name}`;
		await app.registerNodeDef(typeName, this.nodeDef);
		markGroupNodeType(typeName, this);
		useNodeDefStore().addNodeDef(this.nodeDef);
	}
	getLinks() {
		this.linksFrom = {};
		this.linksTo = {};
		this.externalFrom = {};
		for (const link of this.nodeData.links) {
			const [sourceNodeId, sourceNodeSlot, targetNodeId, targetNodeSlot] = link;
			if (sourceNodeId == null || sourceNodeSlot == null || targetNodeId == null || targetNodeSlot == null) continue;
			const srcId = Number(sourceNodeId);
			const srcSlot = Number(sourceNodeSlot);
			const tgtId = Number(targetNodeId);
			const tgtSlot = Number(targetNodeSlot);
			if (!this.linksFrom[srcId]) this.linksFrom[srcId] = {};
			if (!this.linksFrom[srcId][srcSlot]) this.linksFrom[srcId][srcSlot] = [];
			this.linksFrom[srcId][srcSlot].push(link);
			if (!this.linksTo[tgtId]) this.linksTo[tgtId] = {};
			this.linksTo[tgtId][tgtSlot] = link;
		}
		if (this.nodeData.external) for (const ext of this.nodeData.external) {
			const nodeIdx = Number(ext[0]);
			const slotIdx = Number(ext[1]);
			const typeVal = ext[2];
			if (typeVal == null) continue;
			if (!this.externalFrom[nodeIdx]) this.externalFrom[nodeIdx] = { [slotIdx]: typeVal };
			else this.externalFrom[nodeIdx][slotIdx] = typeVal;
		}
	}
	processNode(node, seenInputs, seenOutputs) {
		const def = this.getNodeDef(node);
		if (!def) return;
		const inputs = {
			...def.input?.required,
			...def.input?.optional
		};
		this.inputs.push(this.processNodeInputs(node, seenInputs, inputs));
		if (def.output?.length) this.processNodeOutputs(node, seenOutputs, def);
	}
	getNodeDef(node) {
		if (node.type) {
			const def = globalDefs[node.type];
			if (def) return def;
		}
		const nodeIndex = node.index;
		if (nodeIndex == null) return void 0;
		const linksFrom = this.linksFrom[nodeIndex];
		if (node.type === "PrimitiveNode") {
			if (!linksFrom) return;
			let type = linksFrom[0]?.[0]?.[5] ?? null;
			if (type === "COMBO") {
				const source = (node.outputs?.[0])?.widget?.name;
				const nodeIdx = linksFrom[0]?.[0]?.[2];
				if (source && nodeIdx != null) {
					const fromTypeName = this.nodeData.nodes[Number(nodeIdx)]?.type;
					if (fromTypeName) {
						const fromType = globalDefs[fromTypeName];
						const inputType = (fromType?.input?.required?.[source] ?? fromType?.input?.optional?.[source])?.[0];
						type = typeof inputType === "string" || typeof inputType === "number" ? inputType : null;
					}
				}
			}
			return this.primitiveDefs[nodeIndex] = {
				input: { required: { value: [type, {}] } },
				output: [type],
				output_name: [],
				output_is_list: []
			};
		} else if (node.type === "Reroute") {
			const linksTo = this.linksTo[nodeIndex];
			if (linksTo && linksFrom && !this.externalFrom[nodeIndex]?.[0]) return null;
			let config = {};
			let rerouteType = "*";
			if (linksFrom) {
				const links = linksFrom[0] ?? [];
				for (const link of links) {
					const id = link[2];
					const slot = link[3];
					if (id == null || slot == null) continue;
					const targetNode = this.nodeData.nodes[Number(id)];
					const input = targetNode?.inputs?.[Number(slot)];
					if (input?.type && rerouteType === "*") rerouteType = input.type;
					if (input?.widget && targetNode?.type) {
						const targetDef = globalDefs[targetNode.type];
						const targetWidget = targetDef?.input?.required?.[input.widget.name] ?? targetDef?.input?.optional?.[input.widget.name];
						if (targetWidget) {
							const widgetSpec = [targetWidget[0], config];
							config = mergeIfValid({ widget: widgetSpec }, targetWidget, false, void 0, widgetSpec)?.customConfig ?? config;
						}
					}
				}
			} else if (linksTo) {
				const link = linksTo[0];
				if (link) {
					const id = link[0];
					const slot = link[1];
					if (id != null && slot != null) {
						const outputType = this.nodeData.nodes[Number(id)]?.outputs?.[Number(slot)];
						if (outputType && typeof outputType === "object" && "type" in outputType) rerouteType = String(outputType.type ?? "*");
					}
				}
			} else {
				for (const l of this.nodeData.links) if (l[2] === node.index) {
					const linkType = l[5];
					if (linkType != null) rerouteType = String(linkType);
					break;
				}
				if (rerouteType === "*") {
					const t = this.externalFrom[nodeIndex]?.[0];
					if (t) rerouteType = String(t);
				}
			}
			config.forceInput = true;
			return {
				input: { required: { [rerouteType]: [rerouteType, config] } },
				output: [rerouteType],
				output_name: [],
				output_is_list: []
			};
		}
		console.warn("Skipping virtual node " + node.type + " when building group node " + this.name);
	}
	getInputConfig(node, inputName, seenInputs, config, extra) {
		const customConfig = (this.nodeData.config?.[node.index ?? -1])?.input?.[inputName];
		let name = customConfig?.name ?? node.inputs?.find((inp) => inp.name === inputName)?.label ?? inputName;
		let key = name;
		let prefix = "";
		if (node.type === "PrimitiveNode" && node.title || name in seenInputs) {
			prefix = `${node.title ?? node.type} `;
			key = name = `${prefix}${inputName}`;
			if (name in seenInputs) name = `${prefix}${seenInputs[name]} ${inputName}`;
		}
		seenInputs[key] = (seenInputs[key] ?? 1) + 1;
		if (inputName === "seed" || inputName === "noise_seed") {
			if (!extra) extra = {};
			extra.control_after_generate = `${prefix}control_after_generate`;
		}
		if (config[0] === "IMAGEUPLOAD") {
			if (!extra) extra = {};
			const nodeIndex = node.index ?? -1;
			const configOptions = typeof config[1] === "object" && config[1] !== null ? config[1] : {};
			const widgetKey = "widget" in configOptions && typeof configOptions.widget === "string" ? configOptions.widget : "image";
			extra.widget = this.oldToNewWidgetMap[nodeIndex]?.[widgetKey] ?? "image";
		}
		if (extra) {
			const configObj = typeof config[1] === "object" && config[1] ? config[1] : {};
			config = [config[0], {
				...configObj,
				...extra
			}];
		}
		return {
			name,
			config,
			customConfig
		};
	}
	processWidgetInputs(inputs, node, inputNames, seenInputs) {
		const slots = [];
		const converted = /* @__PURE__ */ new Map();
		const nodeIndex = node.index ?? -1;
		const widgetMap = this.oldToNewWidgetMap[nodeIndex] = {};
		for (const inputName of inputNames) {
			const inputSpec = inputs[inputName];
			if (Array.isArray(inputSpec) && inputSpec.length >= 1 && typeof inputSpec[0] === "string" && useWidgetStore().inputIsWidget(inputSpec)) {
				const convertedIndex = node.inputs?.findIndex((inp) => inp.name === inputName && inp.widget?.name === inputName) ?? -1;
				if (convertedIndex > -1) {
					converted.set(convertedIndex, inputName);
					widgetMap[inputName] = null;
				} else {
					const { name, config } = this.getInputConfig(node, inputName, seenInputs, inputs[inputName]);
					if (this.nodeDef?.input?.required) this.nodeDef.input.required[name] = config;
					widgetMap[inputName] = name;
					this.newToOldWidgetMap[name] = {
						node,
						inputName
					};
				}
			} else slots.push(inputName);
		}
		return {
			converted,
			slots
		};
	}
	checkPrimitiveConnection(link, inputName, inputs) {
		const linkSourceIdx = link[0];
		if (linkSourceIdx == null) return;
		if (this.nodeData.nodes[Number(linkSourceIdx)]?.type === "PrimitiveNode") {
			const sourceNodeId = Number(link[0]);
			const targetNodeId = Number(link[2]);
			const primitiveDef = this.primitiveDefs[sourceNodeId];
			if (!primitiveDef) return;
			const targetWidget = inputs[inputName];
			const primitiveConfig = primitiveDef.input.required.value;
			const config = mergeIfValid({ widget: primitiveConfig }, targetWidget, false, void 0, primitiveConfig);
			const inputConfig = inputs[inputName]?.[1];
			primitiveConfig[1] = config?.customConfig ?? inputConfig ? { ...typeof inputConfig === "object" ? inputConfig : {} } : {};
			const widgetName = this.oldToNewWidgetMap[sourceNodeId]?.["value"];
			if (widgetName) {
				const name = widgetName.substring(0, widgetName.length - 6);
				primitiveConfig[1].control_after_generate = true;
				primitiveConfig[1].control_prefix = name;
			}
			let toPrimitive = this.widgetToPrimitive[targetNodeId];
			if (!toPrimitive) toPrimitive = this.widgetToPrimitive[targetNodeId] = {};
			const existing = toPrimitive[inputName];
			if (Array.isArray(existing)) existing.push(sourceNodeId);
			else if (typeof existing === "number") toPrimitive[inputName] = [existing, sourceNodeId];
			else toPrimitive[inputName] = sourceNodeId;
			let toWidget = this.primitiveToWidget[sourceNodeId];
			if (!toWidget) toWidget = this.primitiveToWidget[sourceNodeId] = [];
			toWidget.push({
				nodeId: targetNodeId,
				inputName
			});
		}
	}
	processInputSlots(inputs, node, slots, linksTo, inputMap, seenInputs) {
		const nodeIdx = node.index ?? -1;
		this.nodeInputs[nodeIdx] = {};
		for (let i = 0; i < slots.length; i++) {
			const inputName = slots[i];
			if (linksTo[i]) {
				this.checkPrimitiveConnection(linksTo[i], inputName, inputs);
				continue;
			}
			const { name, config, customConfig } = this.getInputConfig(node, inputName, seenInputs, inputs[inputName]);
			this.nodeInputs[nodeIdx][inputName] = name;
			if (customConfig?.visible === false) continue;
			if (this.nodeDef?.input?.required) this.nodeDef.input.required[name] = config;
			inputMap[i] = this.inputCount++;
		}
	}
	processConvertedWidgets(inputs, node, slots, converted, linksTo, inputMap, seenInputs) {
		const convertedSlots = [...converted.keys()].sort().map((k) => converted.get(k));
		for (let i = 0; i < convertedSlots.length; i++) {
			const inputName = convertedSlots[i];
			if (!inputName) continue;
			if (linksTo[slots.length + i]) {
				this.checkPrimitiveConnection(linksTo[slots.length + i], inputName, inputs);
				continue;
			}
			const { name, config } = this.getInputConfig(node, inputName, seenInputs, inputs[inputName], { defaultInput: true });
			if (this.nodeDef?.input?.required) this.nodeDef.input.required[name] = config;
			this.newToOldWidgetMap[name] = {
				node,
				inputName
			};
			const nodeIndex = node.index ?? -1;
			if (!this.oldToNewWidgetMap[nodeIndex]) this.oldToNewWidgetMap[nodeIndex] = {};
			this.oldToNewWidgetMap[nodeIndex][inputName] = name;
			inputMap[slots.length + i] = this.inputCount++;
		}
	}
	_convertedToProcess = [];
	processNodeInputs(node, seenInputs, inputs) {
		const inputMapping = [];
		const inputNames = Object.keys(inputs);
		if (!inputNames.length) return;
		const { converted, slots } = this.processWidgetInputs(inputs, node, inputNames, seenInputs);
		const nodeIndex = node.index ?? -1;
		const linksTo = this.linksTo[nodeIndex] ?? {};
		const inputMap = this.oldToNewInputMap[nodeIndex] = {};
		this.processInputSlots(inputs, node, slots, linksTo, inputMap, seenInputs);
		this._convertedToProcess.push(() => this.processConvertedWidgets(inputs, node, slots, converted, linksTo, inputMap, seenInputs));
		return inputMapping;
	}
	processNodeOutputs(node, seenOutputs, def) {
		const nodeIndex = node.index ?? -1;
		const oldToNew = this.oldToNewOutputMap[nodeIndex] = {};
		const defOutput = def.output ?? [];
		for (let outputId = 0; outputId < defOutput.length; outputId++) {
			const hasLink = this.linksFrom[nodeIndex]?.[outputId] && !this.externalFrom[nodeIndex]?.[outputId];
			const customConfig = (this.nodeData.config?.[node.index ?? -1])?.output?.[outputId];
			const visible = customConfig?.visible ?? !hasLink;
			this.outputVisibility.push(visible);
			if (!visible) continue;
			if (this.nodeDef?.output) {
				oldToNew[outputId] = this.nodeDef.output.length;
				this.newToOldOutputMap[this.nodeDef.output.length] = {
					node,
					slot: outputId
				};
				this.nodeDef.output.push(defOutput[outputId]);
				this.nodeDef.output_is_list?.push(def.output_is_list?.[outputId] ?? false);
			}
			let label = customConfig?.name;
			if (!label) {
				const outputVal = defOutput[outputId];
				label = def.output_name?.[outputId] ?? (typeof outputVal === "string" ? outputVal : void 0);
				const output = node.outputs?.find((o) => o.name === label);
				if (output?.label) label = output.label;
			}
			let name = String(label ?? `output_${outputId}`);
			if (name in seenOutputs) {
				const prefix = `${node.title ?? node.type} `;
				name = `${prefix}${label ?? outputId}`;
				if (name in seenOutputs) name = `${prefix}${node.index} ${label ?? outputId}`;
			}
			seenOutputs[name] = 1;
			this.nodeDef?.output_name?.push(name);
		}
	}
	static async registerFromWorkflow(groupNodes, missingNodeTypes) {
		for (const g in groupNodes) {
			const groupData = groupNodes[g];
			let hasMissing = false;
			for (const n of groupData.nodes) if (!n.type || !(n.type in LiteGraph.registered_node_types)) {
				missingNodeTypes.push({
					type: n.type ?? "unknown",
					hint: ` (In group node '${PREFIX}>${g}')`
				});
				missingNodeTypes.push({
					type: `${PREFIX}>` + g,
					action: {
						text: "Remove from workflow",
						callback: (e) => {
							delete groupNodes[g];
							const target = e.target;
							target.textContent = "Removed";
							target.style.pointerEvents = "none";
							target.style.opacity = "0.7";
						}
					}
				});
				hasMissing = true;
			}
			if (hasMissing) continue;
			await new GroupNodeConfig(g, groupData).registerType();
		}
	}
};
/**
* Migration-only adapter for deprecated group nodes.
*
* Group nodes are no longer a supported feature. When a legacy workflow that
* contains group nodes is loaded, {@link GroupNodeConfig.registerFromWorkflow}
* synthesizes temporary node types so the instances can be created during
* `configure`. The load-time migration unpacks each instance via
* {@link convertToNodes} and {@link LGraph.convertToSubgraph} repackages the
* result as a subgraph.
*
* @knipIgnoreUnusedButUsedByCustomNodes
*/
var GroupNodeHandler = class GroupNodeHandler {
	node;
	groupData;
	constructor(node) {
		this.node = node;
		this.groupData = node.constructor?.nodeData?.[GROUP];
	}
	/**
	* Unpacks this group node into its constituent nodes within the root graph,
	* copying current widget values and reconnecting external links, then removes
	* the group node. Returns the newly created nodes.
	*
	* Lossiness is accepted: group nodes nested inside subgraphs are unpacked into
	* the root graph rather than their original container.
	*/
	convertToNodes() {
		const node = this.node;
		const { nodeData, oldToNewWidgetMap, oldToNewInputMap, newToOldOutputMap } = this.groupData;
		const addInnerNodes = () => {
			const c = { ...nodeData };
			c.nodes = c.nodes.map((n) => ({
				...n,
				id: void 0
			}));
			deserialiseAndCreate(JSON.stringify(c), app.canvas);
			const [x, y] = node.pos;
			let top;
			let left;
			const selectedIds = Object.keys(app.canvas.selected_nodes);
			const newNodes = [];
			for (let i = 0; i < selectedIds.length; i++) {
				const selectedId = parseNodeId(selectedIds[i]);
				const newNode = selectedId ? app.rootGraph.getNodeById(selectedId) : null;
				const innerNodeData = nodeData.nodes[i];
				if (!newNode) continue;
				newNodes.push(newNode);
				if (left == null || newNode.pos[0] < left) left = newNode.pos[0];
				if (top == null || newNode.pos[1] < top) top = newNode.pos[1];
				if (!newNode.widgets || !innerNodeData) continue;
				const map = oldToNewWidgetMap[i];
				if (!map) continue;
				for (const oldName of Object.keys(map)) {
					const newName = map[oldName];
					if (!newName) continue;
					const widgetIndex = node.widgets?.findIndex((w) => w.name === newName) ?? -1;
					if (widgetIndex === -1) continue;
					if (innerNodeData.type === "PrimitiveNode") for (let j = 0; j < newNode.widgets.length; j++) {
						const srcWidget = node.widgets?.[widgetIndex + j];
						if (srcWidget) newNode.widgets[j].value = srcWidget.value;
					}
					else {
						const outerWidget = node.widgets?.[widgetIndex];
						const newWidget = newNode.widgets.find((w) => w.name === oldName);
						if (!newWidget || !outerWidget) continue;
						newWidget.value = outerWidget.value;
						const linkedWidgets = outerWidget.linkedWidgets ?? [];
						for (let w = 0; w < linkedWidgets.length; w++) {
							const newLinked = newWidget.linkedWidgets?.[w];
							if (newLinked && linkedWidgets[w]) newLinked.value = linkedWidgets[w].value;
						}
					}
				}
			}
			for (const newNode of newNodes) {
				newNode.pos[0] -= (left ?? 0) - x;
				newNode.pos[1] -= (top ?? 0) - y;
			}
			return {
				newNodes,
				selectedIds
			};
		};
		const reconnectInputs = (selectedIds) => {
			for (const innerNodeIndex in oldToNewInputMap) {
				const selectedId = parseNodeId(selectedIds[Number(innerNodeIndex)]);
				const newNode = selectedId ? app.rootGraph.getNodeById(selectedId) : null;
				if (!newNode) continue;
				const map = oldToNewInputMap[Number(innerNodeIndex)];
				for (const innerInputId in map) {
					const groupSlotId = map[Number(innerInputId)];
					if (groupSlotId == null) continue;
					const slot = node.inputs[groupSlotId];
					if (slot.link == null) continue;
					const link = app.rootGraph.links[slot.link];
					if (!link) continue;
					app.rootGraph.getNodeById(link.origin_id)?.connect(link.origin_slot, newNode, +innerInputId);
				}
			}
		};
		const reconnectOutputs = (selectedIds) => {
			for (let groupOutputId = 0; groupOutputId < node.outputs?.length; groupOutputId++) {
				const output = node.outputs[groupOutputId];
				if (!output.links) continue;
				const links = [...output.links];
				for (const l of links) {
					const slot = newToOldOutputMap[groupOutputId];
					if (!slot) continue;
					const link = app.rootGraph.links[l];
					if (!link) continue;
					const targetNode = app.rootGraph.getNodeById(link.target_id);
					const selectedId = parseNodeId(selectedIds[slot.node.index ?? 0]);
					const newNode = selectedId ? app.rootGraph.getNodeById(selectedId) : null;
					if (targetNode) newNode?.connect(slot.slot, targetNode, link.target_slot);
				}
			}
		};
		app.canvas.emitBeforeChange();
		try {
			const { newNodes, selectedIds } = addInnerNodes();
			reconnectInputs(selectedIds);
			reconnectOutputs(selectedIds);
			app.rootGraph.remove(this.node);
			return newNodes;
		} finally {
			app.canvas.emitAfterChange();
		}
	}
	static getHandler(node) {
		let handler = node[GROUP];
		if (!handler && GroupNodeHandler.isGroupNode(node)) {
			handler = new GroupNodeHandler(node);
			node[GROUP] = handler;
		}
		return handler;
	}
	static isGroupNode(node) {
		return !!node.constructor?.nodeData?.[GROUP];
	}
};
var replaceLegacySeparators = (nodes) => {
	for (const node of nodes) if (typeof node.type === "string" && node.type.startsWith("workflow/")) node.type = node.type.replace(/^workflow\//, `${PREFIX}>`);
};
/**
* Converts every group node in the root graph to a subgraph. Re-scans until none
* remain so group nodes revealed by a previous conversion are also migrated. A
* failed conversion removes the offending node so loading can continue (accepted
* lossiness) and the scan cannot loop forever.
* @returns the number of group nodes converted
*/
function convertLoadedGroupNodes() {
	let converted = 0;
	const failed = /* @__PURE__ */ new Set();
	for (;;) {
		const node = app.rootGraph.nodes.find((n) => GroupNodeHandler.isGroupNode(n) && !failed.has(n));
		if (!node) return converted;
		try {
			const handler = GroupNodeHandler.getHandler(node);
			if (!handler) throw new Error("Missing handler for group node");
			const innerNodes = handler.convertToNodes();
			for (const inner of innerNodes) inner.updateArea();
			app.rootGraph.convertToSubgraph(new Set(innerNodes));
			converted++;
		} catch (error) {
			console.error("Failed to convert group node to subgraph", error);
			failed.add(node);
			try {
				app.rootGraph.remove(node);
			} catch (removeError) {
				console.error("Failed to remove group node after conversion failure", removeError);
			}
		}
	}
}
/** True while a workflow load is in progress, to defer stray paste conversions. */
var isLoadingWorkflow = false;
var id = "Comfy.GroupNode";
/**
* Global node definitions cache. Populated by `addCustomNodeDefs` during
* extension initialization and read by {@link GroupNodeConfig.getNodeDef} when
* synthesizing temporary group-node definitions during load.
*/
var globalDefs;
var ext = {
	name: id,
	addCustomNodeDefs(defs) {
		globalDefs = defs;
	},
	async beforeConfigureGraph(graphData, missingNodeTypes) {
		isLoadingWorkflow = true;
		const nodes = graphData?.extra?.groupNodes;
		if (nodes) {
			replaceLegacySeparators(graphData.nodes);
			await GroupNodeConfig.registerFromWorkflow(nodes, missingNodeTypes);
		}
	},
	afterConfigureGraph() {
		try {
			if (convertLoadedGroupNodes() > 0) delete app.rootGraph.extra?.groupNodes;
		} finally {
			isLoadingWorkflow = false;
		}
	},
	nodeCreated(node) {
		if (!GroupNodeHandler.isGroupNode(node)) return;
		const handler = GroupNodeHandler.getHandler(node);
		if (!isLoadingWorkflow) queueMicrotask(() => {
			const graph = node.graph;
			if (graph && handler && GroupNodeHandler.isGroupNode(node)) try {
				const innerNodes = handler.convertToNodes();
				for (const inner of innerNodes) inner.updateArea();
				graph.convertToSubgraph(new Set(innerNodes));
			} catch (error) {
				console.error("Failed to convert stray group node to subgraph", error);
			}
		});
	}
};
app.registerExtension(ext);
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.groupNode = window.comfyAPI.groupNode || {};
window.comfyAPI.groupNode.GroupNodeConfig = GroupNodeConfig;
window.comfyAPI.groupNode.GroupNodeHandler = GroupNodeHandler;
window.comfyAPI.groupNode.replaceLegacySeparators = replaceLegacySeparators;
//#endregion
//#region src/extensions/core/groupOptions.ts
function setNodeMode(node, mode) {
	node.mode = mode;
	node.graph?.change();
}
function addNodesToGroup(group, items) {
	const padding = useSettingStore().get("Comfy.GroupSelectedNodes.Padding");
	group.resizeTo([...group.children, ...items], padding);
}
app.registerExtension({
	name: "Comfy.GroupOptions",
	getCanvasMenuItems(canvas) {
		const items = [];
		const group = canvas.graph.getGroupOnPos(canvas.graph_mouse[0], canvas.graph_mouse[1]);
		if (!group) {
			if (canvas.selectedItems.size > 0) items.push({
				content: "Add Group For Selected Nodes",
				callback: () => {
					const group = new LGraphGroup();
					addNodesToGroup(group, canvas.selectedItems);
					canvas.graph.add(group);
					canvas.graph.change();
					group.recomputeInsideNodes();
				}
			});
			return items;
		}
		group.recomputeInsideNodes();
		const nodesInGroup = group.nodes;
		items.push({
			content: "Add Selected Nodes To Group",
			disabled: !canvas.selectedItems?.size,
			callback: () => {
				addNodesToGroup(group, canvas.selectedItems);
				canvas.graph.change();
			}
		});
		if (nodesInGroup.length === 0) return items;
		else items.push(null);
		let allNodesAreSameMode = true;
		for (let i = 1; i < nodesInGroup.length; i++) if (nodesInGroup[i].mode !== nodesInGroup[0].mode) {
			allNodesAreSameMode = false;
			break;
		}
		items.push({
			content: "Fit Group To Nodes",
			callback: () => {
				group.recomputeInsideNodes();
				const padding = useSettingStore().get("Comfy.GroupSelectedNodes.Padding");
				group.resizeTo(group.children, padding);
				canvas.graph.change();
			}
		});
		items.push({
			content: "Select Nodes",
			callback: () => {
				canvas.selectNodes(nodesInGroup);
				canvas.graph.change();
				canvas.canvas.focus();
			}
		});
		if (allNodesAreSameMode) switch (nodesInGroup[0].mode) {
			case 0:
				items.push({
					content: "Set Group Nodes to Never",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 2);
					}
				});
				items.push({
					content: "Bypass Group Nodes",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 4);
					}
				});
				break;
			case 2:
				items.push({
					content: "Set Group Nodes to Always",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 0);
					}
				});
				items.push({
					content: "Bypass Group Nodes",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 4);
					}
				});
				break;
			case 4:
				items.push({
					content: "Set Group Nodes to Always",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 0);
					}
				});
				items.push({
					content: "Set Group Nodes to Never",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 2);
					}
				});
				break;
			default:
				items.push({
					content: "Set Group Nodes to Always",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 0);
					}
				});
				items.push({
					content: "Set Group Nodes to Never",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 2);
					}
				});
				items.push({
					content: "Bypass Group Nodes",
					callback: () => {
						for (const node of nodesInGroup) setNodeMode(node, 4);
					}
				});
				break;
		}
		else {
			items.push({
				content: "Set Group Nodes to Always",
				callback: () => {
					for (const node of nodesInGroup) setNodeMode(node, 0);
				}
			});
			items.push({
				content: "Set Group Nodes to Never",
				callback: () => {
					for (const node of nodesInGroup) setNodeMode(node, 2);
				}
			});
			items.push({
				content: "Bypass Group Nodes",
				callback: () => {
					for (const node of nodesInGroup) setNodeMode(node, 4);
				}
			});
		}
		return items;
	}
});
//#endregion
//#region src/extensions/core/imageCompare.ts
useExtensionService().registerExtension({
	name: "Comfy.ImageCompare",
	async nodeCreated(node) {
		if (node.constructor.comfyClass !== "ImageCompare") return;
		const [oldWidth, oldHeight] = node.size;
		node.setSize([Math.max(oldWidth, 400), Math.max(oldHeight, 350)]);
		const onExecuted = node.onExecuted;
		node.onExecuted = function(output) {
			onExecuted?.call(this, output);
			const { a_images: aImages, b_images: bImages } = output;
			const rand = app.getRandParam();
			const toUrl = (record) => {
				const params = new URLSearchParams(record);
				return api.apiURL(`/view?${params}${rand}`);
			};
			const beforeImages = aImages && aImages.length > 0 ? aImages.map(toUrl) : [];
			const afterImages = bImages && bImages.length > 0 ? bImages.map(toUrl) : [];
			const widget = node.widgets?.find((w) => w.type === "imagecompare");
			if (widget) {
				widget.value = {
					beforeImages,
					afterImages
				};
				widget.callback?.(widget.value);
			}
		};
	}
});
//#endregion
//#region src/extensions/core/imageCrop.ts
useExtensionService().registerExtension({
	name: "Comfy.ImageCrop",
	async nodeCreated(node) {
		if (node.constructor.comfyClass !== "ImageCropV2") return;
		node.hideOutputImages = true;
		const [oldWidth, oldHeight] = node.size;
		node.setSize([Math.max(oldWidth, 300), Math.max(oldHeight, 450)]);
	}
});
//#endregion
//#region src/extensions/core/load3dLazy.ts
var load3dExtensionsLoaded = false;
var load3dExtensionsLoading = null;
/**
* Dynamically load the 3D extensions (and THREE.js) on demand.
* Returns the list of newly registered extensions so the caller can
* replay hooks that they missed.
*/
async function loadLoad3dExtensions() {
	if (load3dExtensionsLoaded) return [];
	if (load3dExtensionsLoading) return load3dExtensionsLoading;
	load3dExtensionsLoading = (async () => {
		const before = new Set(useExtensionStore().enabledExtensions);
		await Promise.all([
			__vitePreload(() => import("./load3d-a_dT0MXt.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68]), import.meta.url),
			__vitePreload(() => import("./load3dAdvanced-DHpVuF8u.js"), __vite__mapDeps([69,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,70,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68]), import.meta.url),
			__vitePreload(() => import("./load3dPreviewExtensions-pk5nZ9Ke.js"), __vite__mapDeps([71,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,61,57,58,52,59,62,63,65,66]), import.meta.url),
			__vitePreload(() => import("./saveMesh-DWodkUMe.js"), __vite__mapDeps([72,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,65,66,67,68]), import.meta.url)
		]);
		load3dExtensionsLoaded = true;
		return useExtensionStore().enabledExtensions.filter((ext) => !before.has(ext));
	})();
	return load3dExtensionsLoading;
}
useExtensionService().registerExtension({
	name: "Comfy.Load3DLazy",
	async beforeRegisterNodeDef(nodeType, nodeData) {
		if (isLoad3dNode(nodeData.name)) {
			if (nodeData.name === "Load3D" || nodeData.name === "Load3DAdvanced") {
				const modelFile = nodeData.input?.required?.model_file;
				if (modelFile?.[1]) {
					modelFile[1].mesh_upload = true;
					modelFile[1].upload_subfolder = "3d";
				}
			}
			const newExtensions = await loadLoad3dExtensions();
			for (const ext of newExtensions) await ext.beforeRegisterNodeDef?.(nodeType, nodeData, app);
		}
	}
});
//#endregion
//#region src/extensions/core/maskeditor.ts
function openMaskEditor(node) {
	if (!node) {
		console.error("[MaskEditor] No node provided");
		return;
	}
	if (!node.imgs?.length && node.previewMediaType !== "image") {
		console.error("[MaskEditor] Node has no images");
		return;
	}
	useMaskEditor().openMaskEditor(node);
}
function openMaskEditorFromClipspace() {
	const node = ComfyApp.clipspace_return_node;
	if (!node) {
		console.error("[MaskEditor] No clipspace_return_node found");
		return;
	}
	openMaskEditor(node);
}
function isOpened() {
	return useDialogStore().isDialogOpen("global-mask-editor");
}
var changeBrushSize = async (sizeChanger) => {
	if (!isOpened()) return;
	const store = useMaskEditorStore();
	const oldBrushSize = store.brushSettings.size;
	const newBrushSize = sizeChanger(oldBrushSize);
	store.setBrushSize(newBrushSize);
};
app.registerExtension({
	name: "Comfy.MaskEditor",
	settings: [{
		id: "Comfy.MaskEditor.BrushAdjustmentSpeed",
		category: [
			"Mask Editor",
			"BrushAdjustment",
			"Sensitivity"
		],
		name: "Brush adjustment speed multiplier",
		tooltip: "Controls how quickly the brush size and hardness change when adjusting. Higher values mean faster changes.",
		type: "slider",
		attrs: {
			min: .1,
			max: 2,
			step: .1
		},
		defaultValue: 1,
		versionAdded: "1.0.0"
	}, {
		id: "Comfy.MaskEditor.UseDominantAxis",
		category: [
			"Mask Editor",
			"BrushAdjustment",
			"UseDominantAxis"
		],
		name: "Lock brush adjustment to dominant axis",
		tooltip: "When enabled, brush adjustments will only affect size OR hardness based on which direction you move more",
		type: "boolean",
		defaultValue: true
	}],
	commands: [
		{
			id: "Comfy.MaskEditor.OpenMaskEditor",
			icon: "pi pi-pencil",
			label: "Open Mask Editor for Selected Node",
			function: () => {
				const selectedNodes = app.canvas.selected_nodes;
				if (!selectedNodes || Object.keys(selectedNodes).length !== 1) return;
				const selectedNode = selectedNodes[Object.keys(selectedNodes)[0]];
				openMaskEditor(selectedNode);
			}
		},
		{
			id: "Comfy.MaskEditor.BrushSize.Increase",
			icon: "pi pi-plus-circle",
			label: "Increase Brush Size in MaskEditor",
			function: () => changeBrushSize((old) => toolkit.clamp(old + 2, 1, 250))
		},
		{
			id: "Comfy.MaskEditor.BrushSize.Decrease",
			icon: "pi pi-minus-circle",
			label: "Decrease Brush Size in MaskEditor",
			function: () => changeBrushSize((old) => toolkit.clamp(old - 2, 1, 250))
		},
		{
			id: "Comfy.MaskEditor.ColorPicker",
			icon: "pi pi-palette",
			label: "Open Color Picker in MaskEditor",
			function: () => {
				if (!isOpened()) return;
				useMaskEditorStore().colorInput?.click();
			}
		},
		{
			id: "Comfy.MaskEditor.Rotate.Right",
			icon: "pi pi-refresh",
			label: "Rotate Right in MaskEditor",
			function: async () => {
				if (!isOpened()) return;
				await useCanvasTransform().rotateClockwise();
			}
		},
		{
			id: "Comfy.MaskEditor.Rotate.Left",
			icon: "pi pi-undo",
			label: "Rotate Left in MaskEditor",
			function: async () => {
				if (!isOpened()) return;
				await useCanvasTransform().rotateCounterclockwise();
			}
		},
		{
			id: "Comfy.MaskEditor.Mirror.Horizontal",
			icon: "pi pi-arrows-h",
			label: "Mirror Horizontal in MaskEditor",
			function: async () => {
				if (!isOpened()) return;
				await useCanvasTransform().mirrorHorizontal();
			}
		},
		{
			id: "Comfy.MaskEditor.Mirror.Vertical",
			icon: "pi pi-arrows-v",
			label: "Mirror Vertical in MaskEditor",
			function: async () => {
				if (!isOpened()) return;
				await useCanvasTransform().mirrorVertical();
			}
		}
	],
	init() {
		ComfyApp.open_maskeditor = openMaskEditorFromClipspace;
		console.warn("[MaskEditor] ComfyApp.open_maskeditor is deprecated. Plugins should migrate to using the command system or direct node context menu integration.");
	}
});
//#endregion
//#region src/extensions/core/noteNode.ts
app.registerExtension({
	name: "Comfy.NoteNode",
	registerCustomNodes() {
		class NoteNode extends LGraphNode {
			static category;
			static collapsable;
			static title_mode;
			groupcolor = LGraphCanvas.node_colors.yellow.groupcolor;
			isVirtualNode;
			constructor(title) {
				super(title);
				this.color = LGraphCanvas.node_colors.yellow.color;
				this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
				if (!this.properties) this.properties = { text: "" };
				ComfyWidgets.STRING(this, "text", ["STRING", {
					default: this.properties.text,
					multiline: true
				}], app);
				this.serialize_widgets = true;
				this.isVirtualNode = true;
			}
		}
		LiteGraph.registerNodeType("Note", Object.assign(NoteNode, {
			title_mode: LiteGraph.NORMAL_TITLE,
			title: "Note",
			collapsable: true
		}));
		NoteNode.category = "utilities";
		/** Markdown variant of NoteNode */
		class MarkdownNoteNode extends LGraphNode {
			static title = "Markdown Note";
			groupcolor = LGraphCanvas.node_colors.yellow.groupcolor;
			constructor(title) {
				super(title);
				this.color = LGraphCanvas.node_colors.yellow.color;
				this.bgcolor = LGraphCanvas.node_colors.yellow.bgcolor;
				if (!this.properties) this.properties = { text: "" };
				ComfyWidgets.MARKDOWN(this, "text", ["STRING", { default: this.properties.text }], app);
				this.serialize_widgets = true;
				this.isVirtualNode = true;
			}
		}
		LiteGraph.registerNodeType("MarkdownNote", MarkdownNoteNode);
		MarkdownNoteNode.category = "utilities";
	}
});
//#endregion
//#region src/extensions/core/painter.ts
var HIDDEN_WIDGETS = new Set([
	"width",
	"height",
	"bg_color"
]);
useExtensionService().registerExtension({
	name: "Comfy.Painter",
	nodeCreated(node) {
		if (node.constructor.comfyClass !== "Painter") return;
		const [oldWidth, oldHeight] = node.size;
		node.setSize([Math.max(oldWidth, 450), Math.max(oldHeight, 550)]);
		node.hideOutputImages = true;
		for (const widget of node.widgets ?? []) if (HIDDEN_WIDGETS.has(widget.name)) widget.options.hidden = true;
	}
});
//#endregion
//#region src/extensions/core/previewAny.ts
useExtensionService().registerExtension({
	name: "Comfy.PreviewAny",
	async beforeRegisterNodeDef(nodeType, nodeData) {
		if (nodeData.name === "PreviewAny") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function() {
				onNodeCreated && onNodeCreated.apply(this, []);
				const showValueWidget = ComfyWidgets["MARKDOWN"](this, "preview_markdown", ["MARKDOWN", {}], app).widget;
				const showValueWidgetPlain = ComfyWidgets["STRING"](this, "preview_text", ["STRING", { multiline: true }], app).widget;
				const showAsPlaintextWidget = ComfyWidgets["BOOLEAN"](this, "previewMode", ["BOOLEAN", {
					label_on: "Markdown",
					label_off: "Plaintext",
					default: false
				}], app);
				showAsPlaintextWidget.widget.callback = (value) => {
					showValueWidget.hidden = !value;
					showValueWidget.options.hidden = !value;
					showValueWidgetPlain.hidden = value;
					showValueWidgetPlain.options.hidden = value;
				};
				showValueWidget.label = "Preview";
				showValueWidget.hidden = true;
				showValueWidget.options.hidden = true;
				showValueWidget.options.read_only = true;
				showValueWidget.options.serialize = false;
				showValueWidget.element.readOnly = true;
				showValueWidget.serialize = false;
				showValueWidgetPlain.label = "Preview";
				showValueWidgetPlain.hidden = false;
				showValueWidgetPlain.options.hidden = false;
				showValueWidgetPlain.options.read_only = true;
				showValueWidgetPlain.options.serialize = false;
				showValueWidgetPlain.element.readOnly = true;
				showValueWidgetPlain.serialize = false;
				showAsPlaintextWidget.widget.options.serialize = false;
			};
			const onExecuted = nodeType.prototype.onExecuted;
			nodeType.prototype.onExecuted = function(message) {
				onExecuted === null || onExecuted === void 0 || onExecuted.apply(this, [message]);
				const previewWidgets = this.widgets?.filter((w) => w.name.startsWith("preview_")) ?? [];
				for (const previewWidget of previewWidgets) {
					const text = message.text ?? "";
					previewWidget.value = Array.isArray(text) ? text?.join("\n\n") ?? "" : text;
				}
			};
		}
	}
});
//#endregion
//#region src/extensions/core/rerouteNode.ts
app.registerExtension({
	name: "Comfy.RerouteNode",
	registerCustomNodes() {
		class RerouteNode extends LGraphNode {
			static category;
			static defaultVisibility = false;
			constructor(title) {
				super(title ?? "");
				if (!this.properties) this.properties = {};
				this.properties.showOutputText = RerouteNode.defaultVisibility;
				this.properties.horizontal = false;
				this.addInput("", "*");
				this.addOutput(this.properties.showOutputText ? "*" : "", "*");
				this.setSize(this.computeSize());
				this.isVirtualNode = true;
			}
			onAfterGraphConfigured() {
				requestAnimationFrame(() => {
					this.onConnectionsChange(LiteGraph.INPUT, void 0, true);
				});
			}
			clone() {
				const cloned = super.clone();
				if (!cloned) return cloned;
				cloned.removeOutput(0);
				cloned.addOutput(this.properties.showOutputText ? "*" : "", "*");
				cloned.setSize(cloned.computeSize());
				return cloned;
			}
			onConnectionsChange(type, _index, connected) {
				const { graph } = this;
				if (!graph) return;
				if (app.configuringGraph) return;
				if (connected && type === LiteGraph.OUTPUT) {
					if (new Set(this.outputs[0].links?.map((l) => graph.links[l]?.type)?.filter((t) => t && t !== "*") ?? []).size > 1) {
						const linksToDisconnect = [];
						for (const linkId of this.outputs[0].links ?? []) {
							const link = graph.links[linkId];
							linksToDisconnect.push(link);
						}
						linksToDisconnect.pop();
						for (const link of linksToDisconnect) graph.getNodeById(link.target_id)?.disconnectInput(link.target_slot);
					}
				}
				let currentNode = this;
				let updateNodes = [];
				let inputType = null;
				let inputNode = null;
				while (currentNode) {
					updateNodes.unshift(currentNode);
					const linkId = currentNode.inputs[0].link;
					if (linkId !== null) {
						const link = graph.links[linkId];
						if (!link) return;
						const node = graph.getNodeById(link.origin_id);
						if (!node) return;
						if (node instanceof RerouteNode) if (node === this) {
							currentNode.disconnectInput(link.target_slot);
							currentNode = null;
						} else currentNode = node;
						else {
							inputNode = currentNode;
							inputType = node.outputs[link.origin_slot]?.type ?? null;
							break;
						}
					} else {
						currentNode = null;
						break;
					}
				}
				const nodes = [this];
				let outputType = null;
				while (nodes.length) {
					currentNode = nodes.pop();
					const outputs = currentNode.outputs?.[0]?.links ?? [];
					for (const linkId of outputs) {
						const link = graph.links[linkId];
						if (!link) continue;
						const node = graph.getNodeById(link.target_id);
						if (!node) continue;
						if (node instanceof RerouteNode) {
							nodes.push(node);
							updateNodes.push(node);
						} else {
							const nodeInput = node.inputs[link.target_slot];
							const nodeOutType = nodeInput.type;
							const keep = !inputType || !nodeOutType || LiteGraph.isValidConnection(inputType, nodeOutType);
							if (!keep) {
								node.disconnectInput(link.target_slot);
								continue;
							}
							node.onConnectionsChange?.(LiteGraph.INPUT, link.target_slot, keep, link, nodeInput);
							outputType = node.inputs[link.target_slot].type;
						}
					}
				}
				const displayType = inputType || outputType || "*";
				const color = LGraphCanvas.link_type_colors[displayType];
				let widgetConfig;
				let widgetType;
				for (const node of updateNodes) {
					node.outputs[0].type = inputType || "*";
					node.__outputType = displayType;
					node.outputs[0].name = node.properties.showOutputText ? `${displayType}` : "";
					node.setSize(node.computeSize());
					for (const l of node.outputs[0].links || []) {
						const link = graph.links[l];
						if (!link) continue;
						link.color = color;
						if (app.configuringGraph) continue;
						const targetNode = graph.getNodeById(link.target_id);
						if (!targetNode) continue;
						const targetInput = targetNode.inputs?.[link.target_slot];
						if (targetInput?.widget) {
							const config = getWidgetConfig(targetInput);
							if (!widgetConfig) {
								widgetConfig = config[1] ?? {};
								widgetType = config[0];
							}
							const merged = mergeIfValid(targetInput, [config[0], widgetConfig]);
							if (merged.customConfig) widgetConfig = merged.customConfig;
						}
					}
				}
				for (const node of updateNodes) if (widgetConfig && outputType) {
					node.inputs[0].widget = { name: "value" };
					setWidgetConfig(node.inputs[0], [widgetType ?? `${displayType}`, widgetConfig]);
				} else setWidgetConfig(node.inputs[0], void 0);
				if (inputNode?.inputs?.[0]?.link) {
					const link = graph.links[inputNode.inputs[0].link];
					if (link) link.color = color;
				}
			}
			getExtraMenuOptions(_, options) {
				options.unshift({
					content: (this.properties.showOutputText ? "Hide" : "Show") + " Type",
					callback: () => {
						this.properties.showOutputText = !this.properties.showOutputText;
						if (this.properties.showOutputText) this.outputs[0].name = `${this.__outputType || this.outputs[0].type}`;
						else this.outputs[0].name = "";
						this.setSize(this.computeSize());
						app.canvas.setDirty(true, true);
					}
				}, {
					content: (RerouteNode.defaultVisibility ? "Hide" : "Show") + " Type By Default",
					callback: () => {
						RerouteNode.setDefaultTextVisibility(!RerouteNode.defaultVisibility);
					}
				});
				return [];
			}
			computeSize() {
				return [this.properties.showOutputText && this.outputs && this.outputs.length ? Math.max(75, LiteGraph.NODE_TEXT_SIZE * this.outputs[0].name.length * .6 + 40) : 75, 26];
			}
			static setDefaultTextVisibility(visible) {
				RerouteNode.defaultVisibility = visible;
				if (visible) localStorage["Comfy.RerouteNode.DefaultVisibility"] = "true";
				else delete localStorage["Comfy.RerouteNode.DefaultVisibility"];
			}
		}
		RerouteNode.setDefaultTextVisibility(!!localStorage["Comfy.RerouteNode.DefaultVisibility"]);
		LiteGraph.registerNodeType("Reroute", Object.assign(RerouteNode, {
			title_mode: LiteGraph.NO_TITLE,
			title: "Reroute",
			collapsable: false
		}));
		RerouteNode.category = "utilities";
	}
});
//#endregion
//#region src/extensions/core/saveImageExtraOutput.ts
var saveNodeTypes = new Set([
	"SaveImage",
	"SaveImageAdvanced",
	"SaveSVGNode",
	"SaveVideo",
	"SaveAnimatedWEBP",
	"SaveWEBM",
	"SaveAudio",
	"SaveAudioMP3",
	"SaveAudioOpus",
	"SaveAudioAdvanced",
	"SaveGLB",
	"SaveAnimatedPNG",
	"CLIPSave",
	"VAESave",
	"ModelSave",
	"LoraSave",
	"SaveLatent"
]);
app.registerExtension({
	name: "Comfy.SaveImageExtraOutput",
	async beforeRegisterNodeDef(nodeType, nodeData) {
		if (saveNodeTypes.has(nodeData.name)) {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function() {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : void 0;
				const widget = this.widgets.find((w) => w.name === "filename_prefix");
				widget.serializeValue = () => {
					return applyTextReplacements(app.graph, widget.value);
				};
				return r;
			};
		} else {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function() {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : void 0;
				if (!this.properties || !("Node name for S&R" in this.properties)) this.addProperty("Node name for S&R", this.constructor.type, "string");
				return r;
			};
		}
	}
});
//#endregion
//#region src/extensions/core/selectionBorder.ts
/**
* Draws a dashed border around selected items that maintains constant pixel size
* regardless of zoom level, similar to the DOM selection overlay.
*/
function drawSelectionBorder(ctx, canvas) {
	const selectedItems = canvas.selectedItems;
	if (selectedItems.size <= 1) return;
	const bounds = createBounds(selectedItems, 10);
	if (!bounds) return;
	const [x, y, width, height] = bounds;
	ctx.save();
	ctx.lineWidth = 2 / canvas.ds.scale;
	ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border-color").trim() || "#ffffff66";
	const dashSize = 5 / canvas.ds.scale;
	ctx.setLineDash([dashSize, dashSize]);
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, 8 / canvas.ds.scale);
	ctx.stroke();
	ctx.restore();
}
app.registerExtension({
	name: "Comfy.SelectionBorder",
	async init() {
		const originalDrawForeground = app.canvas.onDrawForeground;
		app.canvas.onDrawForeground = function(ctx, visibleArea) {
			originalDrawForeground?.call(this, ctx, visibleArea);
			drawSelectionBorder(ctx, app.canvas);
		};
	}
});
//#endregion
//#region src/extensions/core/simpleTouchSupport.ts
var touchZooming = false;
var touchCount = 0;
app.registerExtension({
	name: "Comfy.SimpleTouchSupport",
	setup() {
		let touchDist = null;
		let touchTime = null;
		let lastTouch = null;
		let lastScale = null;
		function getMultiTouchPos(e) {
			return Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
		}
		function getMultiTouchCenter(e) {
			return {
				clientX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
				clientY: (e.touches[0].clientY + e.touches[1].clientY) / 2
			};
		}
		app.canvasEl.parentElement?.addEventListener("touchstart", (e) => {
			touchCount += e.changedTouches.length;
			lastTouch = null;
			lastScale = null;
			if (e.touches?.length === 1) {
				touchTime = /* @__PURE__ */ new Date();
				lastTouch = e.touches[0];
			} else {
				touchTime = null;
				if (e.touches?.length === 2) {
					lastScale = app.canvas.ds.scale;
					lastTouch = getMultiTouchCenter(e);
					touchDist = getMultiTouchPos(e);
					app.canvas.pointer.isDown = false;
				}
			}
		}, true);
		app.canvasEl.parentElement?.addEventListener("touchend", (e) => {
			touchCount -= e.changedTouches.length;
			if (e.touches?.length !== 1) touchZooming = false;
			if (touchTime && !e.touches?.length) {
				if ((/* @__PURE__ */ new Date()).getTime() - touchTime.getTime() > 600) {
					if (e.target === app.canvasEl) {
						const touch = {
							button: 2,
							clientX: e.changedTouches[0].clientX,
							clientY: e.changedTouches[0].clientY,
							pointerId: 1,
							isPrimary: true
						};
						app.canvasEl.dispatchEvent(new PointerEvent("pointerdown", touch));
						setTimeout(() => {
							app.canvasEl.dispatchEvent(new PointerEvent("pointerup", touch));
						});
						e.preventDefault();
					}
				}
				touchTime = null;
			}
		});
		const resetTouchState = () => {
			touchCount = 0;
			touchZooming = false;
			touchTime = null;
			lastTouch = null;
			lastScale = null;
			touchDist = null;
		};
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) resetTouchState();
		});
		app.canvasEl.parentElement?.addEventListener("touchcancel", resetTouchState);
		app.canvasEl.parentElement?.addEventListener("touchmove", (e) => {
			if (touchTime && lastTouch && e.touches?.length === 1) {
				const onlyTouch = e.touches[0];
				const deltaX = onlyTouch.clientX - lastTouch.clientX;
				const deltaY = onlyTouch.clientY - lastTouch.clientY;
				if (deltaX * deltaX + deltaY * deltaY > 30) touchTime = null;
			}
			if (e.touches?.length === 2 && lastTouch && !e.ctrlKey && !e.shiftKey) {
				e.preventDefault();
				app.canvas.pointer.isDown = false;
				touchZooming = true;
				LiteGraph.closeAllContextMenus(window);
				app.canvas.search_box?.close();
				const newTouchDist = getMultiTouchPos(e);
				const center = getMultiTouchCenter(e);
				if (lastScale === null || touchDist === null) return;
				let scale = lastScale * newTouchDist / touchDist;
				const newX = (center.clientX - lastTouch.clientX) / scale;
				const newY = (center.clientY - lastTouch.clientY) / scale;
				if (scale < app.canvas.ds.min_scale) scale = app.canvas.ds.min_scale;
				else if (scale > app.canvas.ds.max_scale) scale = app.canvas.ds.max_scale;
				const oldScale = app.canvas.ds.scale;
				app.canvas.ds.scale = scale;
				if (Math.abs(app.canvas.ds.scale - 1) < .01) app.canvas.ds.scale = 1;
				const newScale = app.canvas.ds.scale;
				const convertScaleToOffset = (scale) => [center.clientX / scale - app.canvas.ds.offset[0], center.clientY / scale - app.canvas.ds.offset[1]];
				var oldCenter = convertScaleToOffset(oldScale);
				var newCenter = convertScaleToOffset(newScale);
				app.canvas.ds.offset[0] += newX + newCenter[0] - oldCenter[0];
				app.canvas.ds.offset[1] += newY + newCenter[1] - oldCenter[1];
				lastTouch.clientX = center.clientX;
				lastTouch.clientY = center.clientY;
				app.canvas.setDirty(true, true);
			}
		}, true);
	}
});
var processMouseDown = LGraphCanvas.prototype.processMouseDown;
LGraphCanvas.prototype.processMouseDown = function(e) {
	if (touchZooming || touchCount) return;
	app.canvas.pointer.isDown = false;
	return processMouseDown.apply(this, [e]);
};
var processMouseMove = LGraphCanvas.prototype.processMouseMove;
LGraphCanvas.prototype.processMouseMove = function(e) {
	if (touchZooming || touchCount > 1) return;
	return processMouseMove.apply(this, [e]);
};
//#endregion
//#region src/extensions/core/slotDefaults.ts
app.registerExtension({
	name: "Comfy.SlotDefaults",
	suggestionsNumber: null,
	init() {
		LiteGraph.search_filter_enabled = true;
		this.suggestionsNumber = app.ui.settings.addSetting({
			id: "Comfy.NodeSuggestions.number",
			category: [
				"Comfy",
				"Node Search Box",
				"NodeSuggestions"
			],
			name: "Number of nodes suggestions",
			tooltip: "Only for litegraph searchbox/context menu",
			type: "slider",
			attrs: {
				min: 1,
				max: 100,
				step: 1
			},
			defaultValue: 5,
			onChange: (newVal) => {
				this.setDefaults(newVal);
			}
		});
	},
	slot_types_default_out: {},
	slot_types_default_in: {},
	async beforeRegisterNodeDef(nodeType, nodeData) {
		var nodeId = nodeData.name;
		const inputs = nodeData["input"]?.["required"];
		for (const inputKey in inputs) {
			var input = inputs[inputKey];
			if (typeof input[0] !== "string") continue;
			var type = input[0];
			if (type in ComfyWidgets) {
				if (!input[1]?.forceInput) continue;
			}
			if (!(type in this.slot_types_default_out)) this.slot_types_default_out[type] = ["Reroute"];
			if (this.slot_types_default_out[type].includes(nodeId)) continue;
			this.slot_types_default_out[type].push(nodeId);
			const lowerType = type.toLocaleLowerCase();
			if (!(lowerType in LiteGraph.registered_slot_in_types)) LiteGraph.registered_slot_in_types[lowerType] = { nodes: [] };
			LiteGraph.registered_slot_in_types[lowerType].nodes.push(nodeType.comfyClass);
		}
		var outputs = nodeData["output"] ?? [];
		for (const el of outputs) {
			const type = el;
			if (!(type in this.slot_types_default_in)) this.slot_types_default_in[type] = ["Reroute"];
			if (this.slot_types_default_in[type].includes(nodeId)) continue;
			this.slot_types_default_in[type].push(nodeId);
			if (!(type in LiteGraph.registered_slot_out_types)) LiteGraph.registered_slot_out_types[type] = { nodes: [] };
			LiteGraph.registered_slot_out_types[type].nodes.push(nodeType.comfyClass);
			if (!LiteGraph.slot_types_out.includes(type)) LiteGraph.slot_types_out.push(type);
		}
		var maxNum = this.suggestionsNumber?.value;
		this.setDefaults(maxNum);
	},
	setDefaults(maxNum) {
		LiteGraph.slot_types_default_out = {};
		LiteGraph.slot_types_default_in = {};
		const max = maxNum ?? void 0;
		for (const type in this.slot_types_default_out) LiteGraph.slot_types_default_out[type] = this.slot_types_default_out[type].slice(0, max);
		for (const type in this.slot_types_default_in) LiteGraph.slot_types_default_in[type] = this.slot_types_default_in[type].slice(0, max);
	}
});
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/utils/audioUtils.ts
function getResourceURL(subfolder, filename, type = "input") {
	return `/view?${[
		"filename=" + encodeURIComponent(filename),
		"type=" + type,
		"subfolder=" + subfolder,
		app.getRandParam().substring(1)
	].join("&")}`;
}
function splitFilePath(path) {
	const folder_separator = path.lastIndexOf("/");
	if (folder_separator === -1) return ["", path];
	return [path.substring(0, folder_separator), path.substring(folder_separator + 1)];
}
//#endregion
//#region src/extensions/core/uploadAudio.ts
function updateUIWidget(audioUIWidget, url = "") {
	audioUIWidget.element.src = url;
	audioUIWidget.value = url;
	audioUIWidget.callback?.(url);
	if (url) audioUIWidget.element.classList.remove("empty-audio-widget");
	else audioUIWidget.element.classList.add("empty-audio-widget");
}
async function uploadFile(node, audioWidget, audioUIWidget, file, updateNode, pasted = false) {
	try {
		const body = new FormData();
		body.append("image", file);
		if (pasted) body.append("subfolder", "pasted");
		const resp = await api.fetchApi("/upload/image", {
			method: "POST",
			body
		});
		if (resp.status === 200) {
			const data = await resp.json();
			let path = data.name;
			if (data.subfolder) path = data.subfolder + "/" + path;
			if (!audioWidget.options.values.includes(path)) audioWidget.options.values.push(path);
			if (updateNode) {
				const oldValue = audioWidget.value;
				updateUIWidget(audioUIWidget, api.apiURL(getResourceURL(...splitFilePath(path))));
				audioWidget.value = path;
				audioWidget.callback?.(path);
				node.onWidgetChanged?.(audioWidget.name, path, oldValue, audioWidget);
			}
			return true;
		} else {
			useToastStore().addAlert(resp.status + " - " + resp.statusText);
			return false;
		}
	} catch (error) {
		useToastStore().addAlert(error);
		return false;
	}
}
app.registerExtension({
	name: "Comfy.AudioWidget",
	async beforeRegisterNodeDef(nodeType, nodeData) {
		if ([
			"LoadAudio",
			"SaveAudio",
			"PreviewAudio",
			"SaveAudioMP3",
			"SaveAudioOpus",
			"SaveAudioAdvanced"
		].includes(nodeType.prototype.comfyClass)) nodeData.input.required.audioUI = ["AUDIO_UI", {}];
	},
	getCustomWidgets() {
		return { AUDIO_UI(node, inputName) {
			const audio = document.createElement("audio");
			audio.controls = true;
			audio.classList.add("comfy-audio");
			audio.setAttribute("name", "media");
			const audioUIWidget = node.addDOMWidget(inputName, "audioUI", audio);
			audioUIWidget.serialize = false;
			audioUIWidget.options.serialize = false;
			const { nodeData } = node.constructor;
			if (nodeData == null) throw new TypeError("nodeData is null");
			if (nodeData.output_node) {
				audioUIWidget.element.classList.add("empty-audio-widget");
				const onExecuted = node.onExecuted;
				node.onExecuted = function(output) {
					onExecuted?.call(this, output);
					const audios = output.audio;
					if (!audios?.length) return;
					const audio = audios[0];
					const resourceUrl = getResourceURL(audio.subfolder ?? "", audio.filename ?? "", audio.type);
					updateUIWidget(audioUIWidget, api.apiURL(resourceUrl));
				};
			}
			audioUIWidget.options.getValue = () => useWidgetValueStore().getWidget(widgetId(resolveNodeRootGraphId(node, app.rootGraph.id), node.id, inputName))?.value ?? "";
			audioUIWidget.options.setValue = (v) => {
				const graphId = resolveNodeRootGraphId(node, app.rootGraph.id);
				const widgetState = useWidgetValueStore().getWidget(widgetId(graphId, node.id, inputName));
				if (widgetState) widgetState.value = v;
			};
			return { widget: audioUIWidget };
		} };
	},
	onNodeOutputsUpdated(nodeOutputs) {
		for (const [nodeLocatorId, output] of Object.entries(nodeOutputs)) {
			if (!output.audio?.length) continue;
			const node = getNodeByLocatorId(app.rootGraph, nodeLocatorId);
			if (!node) continue;
			const audioUIWidget = node.widgets?.find((w) => w.name === "audioUI");
			const audio = output.audio[0];
			const resourceUrl = getResourceURL(audio.subfolder ?? "", audio.filename ?? "", audio.type);
			updateUIWidget(audioUIWidget, api.apiURL(resourceUrl));
		}
	}
});
app.registerExtension({
	name: "Comfy.UploadAudio",
	async beforeRegisterNodeDef(_nodeType, nodeData) {
		if (nodeData?.input?.required?.audio?.[1]?.audio_upload === true) nodeData.input.required.upload = ["AUDIOUPLOAD", {}];
	},
	getCustomWidgets() {
		return { AUDIOUPLOAD(node, inputName) {
			const audioWidget = node.widgets.find((w) => w.name === "audio");
			const audioUIWidget = node.widgets.find((w) => w.name === "audioUI");
			const onAudioWidgetUpdate = () => {
				updateUIWidget(audioUIWidget, api.apiURL(getResourceURL(...splitFilePath(audioWidget.value ?? ""))));
			};
			onAudioWidgetUpdate();
			audioWidget.callback = onAudioWidgetUpdate;
			const onGraphConfigured = node.onGraphConfigured;
			node.onGraphConfigured = function() {
				onGraphConfigured?.apply(this, arguments);
				onAudioWidgetUpdate();
			};
			const handleUpload = async (files) => {
				if (!files?.length) return files;
				if (node.isUploading) {
					useToastStore().addAlert(t("g.uploadAlreadyInProgress"));
					return [];
				}
				node.isUploading = true;
				const previousValue = audioWidget.value;
				audioWidget.value = files[0].name;
				try {
					if (!await uploadFile(node, audioWidget, audioUIWidget, files[0], true)) audioWidget.value = previousValue;
				} finally {
					node.isUploading = false;
					node.graph?.setDirtyCanvas(true);
				}
				return files;
			};
			const isAudioFile = (file) => file.type.startsWith("audio/");
			const { openFileSelection } = useNodeFileInput(node, {
				accept: "audio/*",
				onSelect: handleUpload
			});
			const uploadWidget = node.addWidget("button", inputName, "", openFileSelection, {
				serialize: false,
				canvasOnly: true
			});
			uploadWidget.label = t("g.choose_file_to_upload");
			useNodeDragAndDrop(node, {
				fileFilter: isAudioFile,
				onDrop: handleUpload
			});
			useNodePaste(node, {
				fileFilter: isAudioFile,
				onPaste: handleUpload
			});
			node.previewMediaType = "audio";
			return { widget: uploadWidget };
		} };
	}
});
app.registerExtension({
	name: "Comfy.RecordAudio",
	getCustomWidgets() {
		return { AUDIO_RECORD(node, inputName) {
			const audio = document.createElement("audio");
			audio.controls = true;
			audio.classList.add("comfy-audio");
			audio.setAttribute("name", "media");
			const audioUIWidget = node.addDOMWidget(inputName, "audioUI", audio);
			audioUIWidget.options.canvasOnly = false;
			let mediaRecorder = null;
			let isRecording = false;
			let audioChunks = [];
			let currentStream = null;
			let recordWidget = null;
			let stopPromise = null;
			let stopResolve = null;
			audioUIWidget.serializeValue = async () => {
				if (isRecording && mediaRecorder) {
					stopPromise = new Promise((resolve) => {
						stopResolve = resolve;
					});
					mediaRecorder.stop();
					await stopPromise;
				}
				const audioSrc = audioUIWidget.element.src;
				if (!audioSrc) {
					useToastStore().addAlert(t("g.noAudioRecorded"));
					return "";
				}
				const blob = await fetch(audioSrc).then((r) => r.blob());
				return await useAudioService().convertBlobToFileAndSubmit(blob);
			};
			recordWidget = node.addWidget("button", inputName, "", async () => {
				if (!isRecording) try {
					currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
					mediaRecorder = new mediaRecorderConstructor(currentStream, { mimeType: "audio/wav" });
					audioChunks = [];
					mediaRecorder.ondataavailable = (event) => {
						audioChunks.push(event.data);
					};
					mediaRecorder.onstop = async () => {
						const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
						useAudioService().stopAllTracks(currentStream);
						if (audioUIWidget.element.src && audioUIWidget.element.src.startsWith("blob:")) URL.revokeObjectURL(audioUIWidget.element.src);
						updateUIWidget(audioUIWidget, URL.createObjectURL(audioBlob));
						isRecording = false;
						if (recordWidget) recordWidget.label = t("g.startRecording");
						if (stopResolve) {
							stopResolve();
							stopResolve = null;
							stopPromise = null;
						}
					};
					mediaRecorder.onerror = (event) => {
						console.error("MediaRecorder error:", event);
						useAudioService().stopAllTracks(currentStream);
						isRecording = false;
						if (recordWidget) recordWidget.label = t("g.startRecording");
						if (stopResolve) {
							stopResolve();
							stopResolve = null;
							stopPromise = null;
						}
					};
					mediaRecorder.start();
					isRecording = true;
					if (recordWidget) recordWidget.label = t("g.stopRecording");
				} catch (err) {
					console.error("Error accessing microphone:", err);
					useToastStore().addAlert(t("g.micPermissionDenied"));
					if (mediaRecorder) try {
						mediaRecorder.stop();
					} catch {}
					useAudioService().stopAllTracks(currentStream);
					currentStream = null;
					isRecording = false;
					if (recordWidget) recordWidget.label = t("g.startRecording");
				}
				else if (mediaRecorder && isRecording) mediaRecorder.stop();
			}, {
				serialize: false,
				canvasOnly: false
			});
			recordWidget.label = t("g.startRecording");
			recordWidget.type = "audiorecord";
			const originalOnRemoved = node.onRemoved;
			node.onRemoved = function() {
				if (isRecording && mediaRecorder) mediaRecorder.stop();
				useAudioService().stopAllTracks(currentStream);
				if (audioUIWidget.element.src?.startsWith("blob:")) URL.revokeObjectURL(audioUIWidget.element.src);
				originalOnRemoved?.call(this);
			};
			return { widget: recordWidget };
		} };
	},
	async nodeCreated(node) {
		if (node.constructor.comfyClass !== "RecordAudio") return;
		await useAudioService().registerWavEncoder();
	}
});
//#endregion
//#region src/extensions/core/uploadImage.ts
var createUploadInput = (imageInputName, imageInputOptions) => ["IMAGEUPLOAD", {
	...imageInputOptions[1],
	imageInputName
}];
app.registerExtension({
	name: "Comfy.UploadImage",
	beforeRegisterNodeDef(_nodeType, nodeData) {
		const { input } = nodeData ?? {};
		const { required } = input ?? {};
		if (!required) return;
		const found = Object.entries(required).find(([_, input]) => isMediaUploadComboInput(input));
		if (found) {
			const [inputName, inputSpec] = found;
			required.upload = createUploadInput(inputName, inputSpec);
		}
	}
});
//#endregion
//#region src/extensions/core/webcamCapture.ts
var WEBCAM_READY = Symbol();
app.registerExtension({
	name: "Comfy.WebcamCapture",
	getCustomWidgets() {
		return { WEBCAM(node, inputName) {
			let res;
			node[WEBCAM_READY] = new Promise((resolve) => res = resolve);
			const container = document.createElement("div");
			container.style.background = "rgba(0,0,0,0.25)";
			container.style.textAlign = "center";
			const video = document.createElement("video");
			video.style.height = video.style.width = "100%";
			const loadVideo = async () => {
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: true,
						audio: false
					});
					container.replaceChildren(video);
					setTimeout(() => res(video), 500);
					video.addEventListener("loadedmetadata", () => res(video), false);
					video.srcObject = stream;
					video.play();
				} catch (error) {
					const label = document.createElement("div");
					label.style.color = "red";
					label.style.overflow = "auto";
					label.style.maxHeight = "100%";
					label.style.whiteSpace = "pre-wrap";
					if (window.isSecureContext) label.textContent = "Unable to load webcam, please ensure access is granted:\n" + error.message;
					else label.textContent = "Unable to load webcam. A secure context is required, if you are not accessing ComfyUI on localhost (127.0.0.1) you will have to enable TLS (https)\n\n" + error.message;
					container.replaceChildren(label);
				}
			};
			loadVideo();
			return { widget: node.addDOMWidget(inputName, "WEBCAM", container) };
		} };
	},
	nodeCreated(node) {
		if (node.type, node.constructor.comfyClass !== "WebcamCapture") return;
		let video;
		const camera = node.widgets.find((w) => w.name === "image");
		const w = node.widgets.find((w) => w.name === "width");
		const h = node.widgets.find((w) => w.name === "height");
		const captureOnQueue = node.widgets.find((w) => w.name === "capture_on_queue");
		const canvas = document.createElement("canvas");
		const nodeOutputStore = useNodeOutputStore();
		const capture = () => {
			canvas.width = w.value;
			canvas.height = h.value;
			canvas.getContext("2d").drawImage(video, 0, 0, w.value, h.value);
			const data = canvas.toDataURL("image/png");
			const img = new Image();
			img.onload = () => {
				node.imgs = [img];
				nodeOutputStore.setNodePreviewsByNodeId(node.id, [data]);
				app.canvas.setDirty(true);
			};
			img.src = data;
		};
		const btn = node.addWidget("button", "waiting for camera...", "capture", capture, {});
		btn.disabled = true;
		btn.serializeValue = () => void 0;
		camera.serializeValue = async () => {
			if (captureOnQueue.value) capture();
			else if (!node.imgs?.length) {
				const err = `No webcam image captured`;
				useToastStore().addAlert(err);
				throw new Error(err);
			}
			const blob = await new Promise((r) => canvas.toBlob(r));
			const name = `${+/* @__PURE__ */ new Date()}.png`;
			const file = new File([blob], name);
			const body = new FormData();
			body.append("image", file);
			body.append("subfolder", "webcam");
			body.append("type", "temp");
			const resp = await api.fetchApi("/upload/image", {
				method: "POST",
				body
			});
			if (resp.status !== 200) {
				const err = `Error uploading camera image: ${resp.status} - ${resp.statusText}`;
				useToastStore().addAlert(err);
				throw new Error(err);
			}
			const data = await resp.json();
			const serverName = data.name || name;
			return `${data.subfolder || "webcam"}/${serverName} [${data.type || "temp"}]`;
		};
		node[WEBCAM_READY].then((v) => {
			video = v;
			if (!w.value) {
				w.value = video.videoWidth || 640;
				h.value = video.videoHeight || 480;
			}
			btn.disabled = false;
			btn.label = t("g.capture");
		});
	}
});
//#endregion
//#region src/extensions/core/index.ts
if (!isCloud) await __vitePreload(() => import("./nodeTemplates-SBbrTS0I.js"), __vite__mapDeps([73,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,65,66]), import.meta.url);
//#endregion

//# sourceMappingURL=core-C34C9Fil.js.map