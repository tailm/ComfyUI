import "./rolldown-runtime-w0pxe0c8.js";
import { C as withModifiers, Gt as toDisplayString, J as mergeModels, N as createCommentVNode, P as createElementBlock, V as defineComponent, pt as useModel, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { t as PaletteSwatchRow_default } from "./PaletteSwatchRow-01o_PP5n.js";
//#region src/components/palette/WidgetColors.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "shrink-0 truncate text-node-component-slot-text"
};
var MAX_COLORS = 16;
//#endregion
//#region src/components/palette/WidgetColors.vue
var WidgetColors_default = /* @__PURE__ */ defineComponent({
	__name: "WidgetColors",
	props: /* @__PURE__ */ mergeModels({ widget: {} }, {
		"modelValue": { default: () => [] },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				class: "flex size-full items-center gap-2",
				"data-testid": "colors",
				onPointerdown: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"]))
			}, [__props.widget?.name ? (openBlock(), createElementBlock("span", _hoisted_1, toDisplayString(__props.widget.label || __props.widget.name), 1)) : createCommentVNode("", true), createVNode(PaletteSwatchRow_default, {
				modelValue: modelValue.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => modelValue.value = $event),
				max: MAX_COLORS
			}, null, 8, ["modelValue"])], 32);
		};
	}
});
//#endregion
export { WidgetColors_default as default };

//# sourceMappingURL=WidgetColors-DG46DYZZ.js.map