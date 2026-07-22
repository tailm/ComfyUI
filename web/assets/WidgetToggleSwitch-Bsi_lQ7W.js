import "./rolldown-runtime-w0pxe0c8.js";
import { H as script } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, J as mergeModels, M as createBlock, P as createElementBlock, R as createTextVNode, V as defineComponent, Y as mergeProps, bt as withCtx, pt as useModel, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { i as useHideLayoutField } from "./widgetTypes-_soADytj.js";
import { n as ToggleGroup_default, t as ToggleGroupItem_default } from "./toggle-group-CAUywngo.js";
import { a as STANDARD_EXCLUDED_PROPS, o as filterWidgetProps } from "./widgetPropFilter-DWA_p-Uy.js";
import { t as WidgetLayoutField_default } from "./WidgetLayoutField-CPvt_3SD.js";
import { t as WidgetInputBaseClass } from "./layout-DGSAq4gO.js";
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/WidgetToggleSwitch.vue
var WidgetToggleSwitch_default = /* @__PURE__ */ defineComponent({
	__name: "WidgetToggleSwitch",
	props: /* @__PURE__ */ mergeModels({ widget: {} }, {
		"modelValue": { type: Boolean },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		const hideLayoutField = useHideLayoutField();
		const { t } = useI18n();
		const filteredProps = computed(() => filterWidgetProps(__props.widget.options, STANDARD_EXCLUDED_PROPS));
		const hasLabels = computed(() => {
			return __props.widget.options?.on != null || __props.widget.options?.off != null;
		});
		function handleOptionChange(value) {
			if (value) modelValue.value = value === "on";
		}
		return (_ctx, _cache) => {
			return openBlock(), createBlock(WidgetLayoutField_default, {
				widget: __props.widget,
				"no-border": !hasLabels.value
			}, {
				default: withCtx(({ borderStyle }) => [hasLabels.value ? (openBlock(), createBlock(unref(ToggleGroup_default), {
					key: 0,
					type: "single",
					"model-value": modelValue.value ? "on" : "off",
					disabled: Boolean(__props.widget.options?.read_only),
					class: normalizeClass(unref(cn)(unref(WidgetInputBaseClass), "flex w-full min-w-0 items-center justify-center gap-1 p-1")),
					"onUpdate:modelValue": _cache[0] || (_cache[0] = (v) => handleOptionChange(v))
				}, {
					default: withCtx(() => [createVNode(unref(ToggleGroupItem_default), {
						value: "off",
						size: "sm"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(__props.widget.options?.off ?? unref(t)("widgets.boolean.false")), 1)]),
						_: 1
					}), createVNode(unref(ToggleGroupItem_default), {
						value: "on",
						size: "sm"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(__props.widget.options?.on ?? unref(t)("widgets.boolean.true")), 1)]),
						_: 1
					})]),
					_: 1
				}, 8, [
					"model-value",
					"disabled",
					"class"
				])) : (openBlock(), createElementBlock("div", {
					key: 1,
					class: normalizeClass(unref(cn)("-m-1 flex w-fit items-center gap-2 rounded-full p-1", unref(hideLayoutField) || "ml-auto", borderStyle))
				}, [createVNode(unref(script), mergeProps({
					modelValue: modelValue.value,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => modelValue.value = $event)
				}, filteredProps.value, { "aria-label": __props.widget.name }), null, 16, ["modelValue", "aria-label"])], 2))]),
				_: 1
			}, 8, ["widget", "no-border"]);
		};
	}
});
//#endregion
export { WidgetToggleSwitch_default as default };

//# sourceMappingURL=WidgetToggleSwitch-Bsi_lQ7W.js.map