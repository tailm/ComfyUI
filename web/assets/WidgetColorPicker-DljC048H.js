import "./rolldown-runtime-w0pxe0c8.js";
import { J as mergeModels, M as createBlock, V as defineComponent, bt as withCtx, gt as watch, jt as ref, pt as useModel, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { a as isColorFormat, d as toHexFromFormat, t as ColorPicker_default } from "./ColorPicker-BdrSTTzc.js";
import { t as WidgetLayoutField_default } from "./WidgetLayoutField-B5-snI_e.js";
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/WidgetColorPicker.vue
var WidgetColorPicker_default = /* @__PURE__ */ defineComponent({
	__name: "WidgetColorPicker",
	props: /* @__PURE__ */ mergeModels({ widget: {} }, {
		"modelValue": { required: true },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		const format = isColorFormat(__props.widget.options?.format) ? __props.widget.options.format : "hex";
		const localValue = ref(toHexFromFormat(modelValue.value || "#000000", format));
		watch(modelValue, (newVal) => {
			localValue.value = toHexFromFormat(newVal || "#000000", format);
		});
		function onUpdate(val) {
			localValue.value = val;
			modelValue.value = val;
		}
		return (_ctx, _cache) => {
			return openBlock(), createBlock(WidgetLayoutField_default, { widget: __props.widget }, {
				default: withCtx(() => [createVNode(ColorPicker_default, {
					modelValue: localValue.value,
					"onUpdate:modelValue": [_cache[0] || (_cache[0] = ($event) => localValue.value = $event), onUpdate]
				}, null, 8, ["modelValue"])]),
				_: 1
			}, 8, ["widget"]);
		};
	}
});
//#endregion
export { WidgetColorPicker_default as default };

//# sourceMappingURL=WidgetColorPicker-DljC048H.js.map