import "./rolldown-runtime-w0pxe0c8.js";
import { Bt as unref, Ht as normalizeClass, J as mergeModels, P as createElementBlock, V as defineComponent, b as vModelText, ht as useTemplateRef, pt as useModel, rt as openBlock, xt as withDirectives } from "./vendor-vue-core-ywZ1En3W.js";
import { t as cn } from "./src-3J7AEIG_.js";
//#endregion
//#region src/components/ui/textarea/Textarea.vue
var Textarea_default = /* @__PURE__ */ defineComponent({
	__name: "Textarea",
	props: /* @__PURE__ */ mergeModels({ class: { type: [
		Boolean,
		null,
		String,
		Object,
		Array
	] } }, {
		"modelValue": {},
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props, { expose: __expose }) {
		const modelValue = useModel(__props, "modelValue");
		const textareaEl = useTemplateRef("textareaEl");
		__expose({ focus: () => textareaEl.value?.focus() });
		return (_ctx, _cache) => {
			return withDirectives((openBlock(), createElementBlock("textarea", {
				ref_key: "textareaEl",
				ref: textareaEl,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => modelValue.value = $event),
				class: normalizeClass(unref(cn)("flex min-h-16 w-full scrollbar-gutter-stable rounded-lg border-none bg-secondary-background px-3 py-2 text-sm text-base-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border-default focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", __props.class))
			}, null, 2)), [[vModelText, modelValue.value]]);
		};
	}
});
//#endregion
export { Textarea_default as t };

//# sourceMappingURL=Textarea-nbwLKx-3.js.map