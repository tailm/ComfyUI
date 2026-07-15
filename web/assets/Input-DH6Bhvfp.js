import "./rolldown-runtime-w0pxe0c8.js";
import { F as createElementBlock, H as defineComponent, St as withDirectives, Ut as normalizeClass, Vt as unref, Y as mergeModels, gt as useTemplateRef, it as openBlock, mt as useModel, x as vModelText } from "./vendor-vue-core-D3WB7mNE.js";
import { t as cn } from "./src-CDgHMYTj.js";
//#endregion
//#region src/components/ui/input/Input.vue
var Input_default = /* @__PURE__ */ defineComponent({
	__name: "Input",
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
		const inputRef = useTemplateRef("inputEl");
		__expose({
			focus: () => inputRef.value?.focus(),
			select: () => inputRef.value?.select(),
			blur: () => inputRef.value?.blur(),
			setSelectionRange: (start, end) => inputRef.value?.setSelectionRange(start, end),
			selectAll: () => inputRef.value?.setSelectionRange(0, inputRef.value.value.length)
		});
		return (_ctx, _cache) => {
			return withDirectives((openBlock(), createElementBlock("input", {
				ref: "inputEl",
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => modelValue.value = $event),
				class: normalizeClass(unref(cn)("flex h-10 w-full min-w-0 appearance-none rounded-lg border-none bg-secondary-background px-4 py-2 text-sm text-base-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border-default focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", __props.class))
			}, null, 2)), [[vModelText, modelValue.value]]);
		};
	}
});
//#endregion
export { Input_default as t };

//# sourceMappingURL=Input-DH6Bhvfp.js.map