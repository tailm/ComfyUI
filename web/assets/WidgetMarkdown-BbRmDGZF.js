import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, C as withModifiers, Ht as normalizeClass, J as mergeModels, P as createElementBlock, V as defineComponent, X as nextTick, j as createBaseVNode, jt as ref, pt as useModel, rt as openBlock, x as vShow, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { t as renderMarkdownToHtml } from "./markdownRendererUtil-hoj49pSw.js";
import { t as Textarea_default } from "./Textarea-nbwLKx-3.js";
//#region src/renderer/extensions/vueNodes/widgets/components/WidgetMarkdown.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = ["aria-label", "innerHTML"];
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/WidgetMarkdown.vue
var WidgetMarkdown_default = /* @__PURE__ */ defineComponent({
	__name: "WidgetMarkdown",
	props: /* @__PURE__ */ mergeModels({ widget: {} }, {
		"modelValue": { default: "" },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		const isEditing = ref(false);
		const textareaRef = ref();
		const renderedHtml = computed(() => renderMarkdownToHtml(modelValue.value || ""));
		async function startEditing() {
			if (isEditing.value || __props.widget.options?.read_only) return;
			isEditing.value = true;
			await nextTick();
			textareaRef.value?.focus();
		}
		function handleBlur() {
			isEditing.value = false;
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				class: "widget-markdown relative w-full",
				onDblclick: startEditing
			}, [createBaseVNode("div", {
				class: normalizeClass(["comfy-markdown-content size-full min-h-[60px] overflow-y-auto rounded-lg", isEditing.value ? "invisible" : "visible"]),
				tabindex: "0",
				"data-capture-wheel": "true",
				role: "textarea",
				"aria-label": __props.widget.name || _ctx.$t("g.markdown"),
				"aria-readonly": "true",
				innerHTML: renderedHtml.value
			}, null, 10, _hoisted_1), withDirectives(createVNode(Textarea_default, {
				ref_key: "textareaRef",
				ref: textareaRef,
				modelValue: modelValue.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => modelValue.value = $event),
				"aria-label": `${_ctx.$t("g.edit")} ${__props.widget.name || _ctx.$t("g.markdown")} ${_ctx.$t("g.content")}`,
				class: "absolute inset-0 min-h-[60px] w-full resize-none text-(length:--comfy-textarea-font-size)",
				"data-capture-wheel": "true",
				onBlur: handleBlur,
				onPointerdownCapture: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"])),
				onPointermoveCapture: _cache[2] || (_cache[2] = withModifiers(() => {}, ["stop"])),
				onPointerupCapture: _cache[3] || (_cache[3] = withModifiers(() => {}, ["stop"])),
				onClick: _cache[4] || (_cache[4] = withModifiers(() => {}, ["stop"])),
				onKeydown: _cache[5] || (_cache[5] = withModifiers(() => {}, ["stop"]))
			}, null, 8, ["modelValue", "aria-label"]), [[vShow, isEditing.value]])], 32);
		};
	}
});
//#endregion
export { WidgetMarkdown_default as default };

//# sourceMappingURL=WidgetMarkdown-BbRmDGZF.js.map