import "./rolldown-runtime-w0pxe0c8.js";
import { V as script } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, j as createBaseVNode, pt as useModel, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { ea as useSettingStore } from "./promotionUtils-B4DSH7RT.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
//#region src/renderer/extensions/vueNodes/widgets/components/ValueControlPopover.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "w-113 max-w-md space-y-4 p-4" };
var _hoisted_2 = { class: "text-sm/tight text-muted-foreground" };
var _hoisted_3 = { class: "font-medium text-base-foreground" };
var _hoisted_4 = { class: "space-y-2" };
var _hoisted_5 = { class: "flex min-w-0 flex-1 items-center gap-2 text-wrap" };
var _hoisted_6 = { class: "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-secondary-background" };
var _hoisted_7 = {
	key: 1,
	class: "text-xs font-normal text-base-foreground"
};
var _hoisted_8 = { class: "flex min-w-0 flex-1 flex-col gap-0.5" };
var _hoisted_9 = { class: "text-sm/tight font-normal text-base-foreground" };
var _hoisted_10 = { class: "text-sm/tight font-normal text-muted-foreground" };
//#endregion
//#region src/renderer/extensions/vueNodes/widgets/components/ValueControlPopover.vue
var ValueControlPopover_default = /* @__PURE__ */ defineComponent({
	__name: "ValueControlPopover",
	props: {
		"modelValue": {},
		"modelModifiers": {}
	},
	emits: ["update:modelValue"],
	setup(__props) {
		const settingStore = useSettingStore();
		const controlOptions = [
			{
				mode: "fixed",
				icon: "icon-[lucide--pencil-off]",
				title: "fixed",
				description: "fixedDesc"
			},
			{
				mode: "increment",
				text: "+1",
				title: "increment",
				description: "incrementDesc"
			},
			{
				mode: "decrement",
				text: "-1",
				title: "decrement",
				description: "decrementDesc"
			},
			{
				mode: "randomize",
				icon: "icon-[lucide--shuffle]",
				title: "randomize",
				description: "randomizeDesc"
			}
		];
		const widgetControlMode = computed(() => settingStore.get("Comfy.WidgetControlMode"));
		const controlMode = useModel(__props, "modelValue");
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createTextVNode(toDisplayString(_ctx.$t("widgets.valueControl.header.prefix")) + " ", 1),
				createBaseVNode("span", _hoisted_3, toDisplayString(widgetControlMode.value === "before" ? _ctx.$t("widgets.valueControl.header.before") : _ctx.$t("widgets.valueControl.header.after")), 1),
				createTextVNode(" " + toDisplayString(_ctx.$t("widgets.valueControl.header.postfix")), 1)
			]), createBaseVNode("div", _hoisted_4, [(openBlock(), createElementBlock(Fragment, null, renderList(controlOptions, (option) => {
				return createVNode(Button_default, {
					key: option.mode,
					as: "label",
					variant: "textonly",
					size: "lg",
					class: "flex h-[unset] w-full items-center justify-between gap-7 py-2 text-left",
					for: option.mode
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, [option.icon ? (openBlock(), createElementBlock("i", {
						key: 0,
						class: normalizeClass([option.icon, "text-base text-base-foreground"])
					}, null, 2)) : createCommentVNode("", true), option.text ? (openBlock(), createElementBlock("span", _hoisted_7, toDisplayString(option.text), 1)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, [createBaseVNode("span", null, toDisplayString(_ctx.$t(`widgets.valueControl.${option.title}`)), 1)]), createBaseVNode("div", _hoisted_10, toDisplayString(_ctx.$t(`widgets.valueControl.${option.description}`)), 1)])]), createVNode(unref(script), {
						modelValue: controlMode.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => controlMode.value = $event),
						class: "shrink",
						"input-id": option.mode,
						value: option.mode
					}, null, 8, [
						"modelValue",
						"input-id",
						"value"
					])]),
					_: 2
				}, 1032, ["for"]);
			}), 64))])]);
		};
	}
});
//#endregion
export { ValueControlPopover_default as default };

//# sourceMappingURL=ValueControlPopover-B6rN3Cyv.js.map