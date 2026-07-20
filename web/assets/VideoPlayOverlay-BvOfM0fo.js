import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Bt as unref, Ht as normalizeClass, N as createCommentVNode, P as createElementBlock, T as Fragment, V as defineComponent, j as createBaseVNode, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
import { t as cn } from "./src-3J7AEIG_.js";
//#region src/platform/assets/components/VideoPlayOverlay.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "pointer-events-none absolute inset-0 flex items-center justify-center" };
//#endregion
//#region src/platform/assets/components/VideoPlayOverlay.vue
var VideoPlayOverlay_default = /* @__PURE__ */ defineComponent({
	__name: "VideoPlayOverlay",
	props: {
		visible: {
			type: Boolean,
			default: true
		},
		size: { default: "md" },
		overlayClass: { default: "bg-black/15" }
	},
	setup(__props) {
		const iconSizeClass = computed(() => __props.size === "sm" ? "size-3" : "size-6");
		return (_ctx, _cache) => {
			return __props.visible ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("div", { class: normalizeClass(unref(cn)("pointer-events-none absolute inset-0", __props.overlayClass)) }, null, 2), createBaseVNode("div", _hoisted_1, [createBaseVNode("i", {
				"aria-hidden": "true",
				class: normalizeClass(unref(cn)("icon-[lucide--play] text-white", iconSizeClass.value))
			}, null, 2)])], 64)) : createCommentVNode("", true);
		};
	}
});
//#endregion
export { VideoPlayOverlay_default as t };

//# sourceMappingURL=VideoPlayOverlay-BvOfM0fo.js.map