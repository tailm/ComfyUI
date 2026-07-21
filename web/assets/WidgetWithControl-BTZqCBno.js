const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ValueControlPopover-njb5XibR.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-CQFMRQbS.js","./vendor-vue-core-ywZ1En3W.js","./promotionUtils-bxMXJ_BT.js","./_plugin-vue_export-helper-DD9yP8Gq.js","./vendor-other-qm2HQOWV.js","./vendor-three-IJGZadeJ.js","./vendor-tiptap-7OYaMc7U.js","./vendor-reka-ui-BL45aHvm.js","./vendor-i18n-BitfRK9w.js","./vendor-sentry-BeVhjky-.js","./vendor-vueuse-D8rwdKM0.js","./vendor-axios-BWFjRHOY.js","./vendor-markdown-dKTpR1HU.js","./vendor-yjs-Cmf7NGGj.js","./vendor-zod-BwmrqdWK.js","./api-vRWcNBJQ.js","./types-4cVPtFn2.js","./toastStore-Dafwoqcw.js","./devFeatureFlagOverride-C_h7DxV8.js","./formatUtil-NyC-AHAf.js","./src-3J7AEIG_.js","./downloadUtil-BbicD5Zl.js","./i18n-BJjDt-Gn.js","./commands-CXXLFVIe.js","./main-fVqRQcYa.js","./nodeDefs-DNc3psLh.js","./settings-CXXL4Tkc.js","./WaveAudioPlayer-DX4IY0F3.js","./Button-7CPgYufe.js","./Slider-CL_6pSFX.js","./DialogHeader-DxFBxCYY.js","./dialogStore-C0QSbgAQ.js","./Loader-CBQDO71A.js","./Popover-CmAR5fZH.js","./useModalLiftedZIndex-C8CdtEh7.js","./ColorPicker-B0SVVF51.js","./SelectValue-Hlwdcvit.js","./TagsInputItemText-vQdqei7O.js","./envUtil-BQXVeDTr.js","./teamWorkspaceStore-CD0PAZYS.js","./remoteConfig-0E2rLe-N.js","./useImageQuiet-CGqH69n-.js","./VideoPlayOverlay-BvOfM0fo.js","./useFeatureUsageTracker-C8GMfvGe.js","./telemetry-CLr022VN.js","./widgetTypes-_soADytj.js","./markdownRendererUtil-hoj49pSw.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { Q as __vitePreload } from "./vendor-primevue-CQFMRQbS.js";
import { B as defineAsyncComponent, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, J as mergeModels, M as createBlock, N as createCommentVNode, P as createElementBlock, V as defineComponent, Y as mergeProps, bt as withCtx, gt as watch, jt as ref, lt as resolveDynamicComponent, pt as useModel, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as Popover_default } from "./Popover-CmAR5fZH.js";
import { t as cn } from "./src-3J7AEIG_.js";
//#region src/renderer/extensions/vueNodes/widgets/components/ValueControlButton.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = ["aria-label"];
var _hoisted_2 = {
	key: 1,
	class: "text-xs font-normal text-primary-background"
};
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/ValueControlButton.vue
var ValueControlButton_default = /* @__PURE__ */ defineComponent({
	__name: "ValueControlButton",
	props: {
		mode: {},
		variant: { default: "badge" }
	},
	setup(__props) {
		const { t } = useI18n();
		const iconMap = {
			fixed: "icon-[lucide--pencil-off]",
			randomize: "icon-[lucide--shuffle]",
			increment: null,
			decrement: null
		};
		const textMap = {
			increment: "+1",
			decrement: "-1",
			fixed: null,
			randomize: null
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("button", {
				"data-testid": "value-control",
				type: "button",
				"aria-label": unref(t)("widgets.valueControl." + __props.mode),
				class: normalizeClass(unref(cn)("flex shrink-0 cursor-pointer items-center justify-center border-none focus-visible:ring-2 focus-visible:ring-primary-background focus-visible:ring-offset-1 focus-visible:outline-none", __props.variant === "badge" ? "h-4.5 w-8 rounded-full" : "size-6 rounded-sm", __props.mode !== "fixed" ? "bg-primary-background/30 hover:bg-primary-background-hover/30" : "bg-transparent"))
			}, [iconMap[__props.mode] ? (openBlock(), createElementBlock("i", {
				key: 0,
				"aria-hidden": "true",
				class: normalizeClass(unref(cn)(iconMap[__props.mode] ?? "", "text-xs", __props.mode === "fixed" ? "text-muted-foreground" : "text-primary-background"))
			}, null, 2)) : textMap[__props.mode] ? (openBlock(), createElementBlock("span", _hoisted_2, toDisplayString(textMap[__props.mode]), 1)) : createCommentVNode("", true)], 10, _hoisted_1$1);
		};
	}
});
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/WidgetWithControl.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "relative grid grid-cols-subgrid" };
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/WidgetWithControl.vue
var WidgetWithControl_default = /* @__PURE__ */ defineComponent({
	__name: "WidgetWithControl",
	props: /* @__PURE__ */ mergeModels({
		widget: {},
		component: {}
	}, {
		"modelValue": {},
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const ValueControlPopover = defineAsyncComponent(() => __vitePreload(() => import("./ValueControlPopover-njb5XibR.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50]), import.meta.url));
		const props = __props;
		const modelValue = useModel(__props, "modelValue");
		const controlModel = ref(props.widget.controlWidget.value);
		watch(controlModel, props.widget.controlWidget.update);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [(openBlock(), createBlock(resolveDynamicComponent(__props.component), mergeProps(_ctx.$attrs, {
				modelValue: modelValue.value,
				"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => modelValue.value = $event),
				widget: __props.widget
			}), {
				default: withCtx(() => [createVNode(Popover_default, null, {
					button: withCtx(() => [createVNode(ValueControlButton_default, {
						mode: controlModel.value,
						class: "mr-1 self-center"
					}, null, 8, ["mode"])]),
					default: withCtx(() => [createVNode(unref(ValueControlPopover), {
						modelValue: controlModel.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => controlModel.value = $event)
					}, null, 8, ["modelValue"])]),
					_: 1
				})]),
				_: 1
			}, 16, ["modelValue", "widget"]))]);
		};
	}
});
//#endregion
export { WidgetWithControl_default as t };

//# sourceMappingURL=WidgetWithControl-BTZqCBno.js.map