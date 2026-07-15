const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ValueControlPopover-BsD_F80f.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-rx7tKw03.js","./vendor-vue-core-D3WB7mNE.js","./promotionUtils-vKoNYnM9.js","./_plugin-vue_export-helper-BTZD_w11.js","./vendor-other-CcVI76zn.js","./vendor-firebase-C7k8AidI.js","./vendor-three-BgtZEsKh.js","./vendor-tiptap-Da8lvoX9.js","./vendor-zod-9ZYBvZOX.js","./vendor-reka-ui-3rzHRTLU.js","./vendor-i18n-BVGbvPvq.js","./vendor-sentry-CJqm_Nmo.js","./vendor-vueuse-BA2QXdyV.js","./vendor-axios-CCRjO_8I.js","./vendor-markdown-ZOM1KON6.js","./vendor-yjs-DF9PYGyQ.js","./api-DrovjuJk.js","./types-4cVPtFn2.js","./toastStore-BIphcVgz.js","./devFeatureFlagOverride-BkGrEGSd.js","./formatUtil-B15pKy0Z.js","./src-CDgHMYTj.js","./downloadUtil-DVwV9jPP.js","./i18n-DAE2CSwM.js","./commands-DD5bW_sz.js","./main-mdv62577.js","./nodeDefs-BSMa-osx.js","./settings-C20_o31_.js","./WaveAudioPlayer-B565XRpq.js","./Button-BDFBPNkK.js","./Slider-C_rx-g3O.js","./DialogHeader-DkWnDCOh.js","./dialogStore-DD1yBh6P.js","./Loader-BDNSi0qc.js","./Popover-CZfXPPLp.js","./useModalLiftedZIndex-CHOpgGKh.js","./ColorPicker-CzfjYyaP.js","./SelectValue-DqyfA2Es.js","./Input-DH6Bhvfp.js","./extensionStore-rc50enKT.js","./useErrorHandling-DNyo9FnY.js","./useExternalLink-lnTgXLgb.js","./envUtil-BjE8ep-x.js","./useFeatureFlags-DVgtsxbC.js","./remoteConfig-DjUkM6Dg.js","./useImageQuiet-Cr1HOQ5t.js","./VideoPlayOverlay-BHVjultu.js","./useFeatureUsageTracker-Dmo_jNxY.js","./telemetry-BQKS_Is7.js","./topupTracker-DNKc8Xp6.js","./userStore-BKADmpNR.js","./widgetTypes-oIdIlxxV.js","./markdownRendererUtil-B-BSW0UD.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { tt as __vitePreload } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, F as createElementBlock, H as defineComponent, Kt as toDisplayString, Mt as ref, N as createBlock, P as createCommentVNode, Ut as normalizeClass, V as defineAsyncComponent, Vt as unref, X as mergeProps, Y as mergeModels, _t as watch, it as openBlock, mt as useModel, ut as resolveDynamicComponent, xt as withCtx } from "./vendor-vue-core-D3WB7mNE.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as Popover_default } from "./Popover-CZfXPPLp.js";
import { t as cn } from "./src-CDgHMYTj.js";
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
		const ValueControlPopover = defineAsyncComponent(() => __vitePreload(() => import("./ValueControlPopover-BsD_F80f.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56]), import.meta.url));
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

//# sourceMappingURL=WidgetWithControl-CGMRNVTj.js.map