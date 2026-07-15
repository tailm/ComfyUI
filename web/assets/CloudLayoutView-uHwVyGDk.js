import "./rolldown-runtime-w0pxe0c8.js";
import { B as createVNode, E as Fragment, F as createElementBlock, Gt as normalizeStyle, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, P as createCommentVNode, Vt as unref, it as openBlock, n as RouterView, st as renderSlot, tt as onMounted, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { t as GlobalToast_default } from "./GlobalToast-D8zwEjjb.js";
//#region src/platform/cloud/onboarding/assets/hero/bottom-left.jpg
var bottom_left_default = "" + new URL("bottom-left-7AaP7qX3.jpg", import.meta.url).href;
//#endregion
//#region src/platform/cloud/onboarding/assets/hero/bottom-right.jpg
var bottom_right_default = "" + new URL("bottom-right-CGlX7nRp.jpg", import.meta.url).href;
//#endregion
//#region src/platform/cloud/onboarding/assets/hero/center-image.jpg
var center_image_default = "" + new URL("center-image-CZzY8vHx.jpg", import.meta.url).href;
//#endregion
//#region src/platform/cloud/onboarding/assets/hero/top-left.jpg
var top_left_default = "" + new URL("top-left-C4YR3tU1.jpg", import.meta.url).href;
//#endregion
//#region src/platform/cloud/onboarding/components/CloudHeroCarousel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "relative flex size-full flex-col items-center overflow-hidden rounded-lg bg-primary-comfy-canvas/4 pt-10 pb-4" };
var _hoisted_2$2 = { class: "flex w-full flex-1 flex-col items-center justify-center gap-6 md:gap-8 lg:gap-10" };
var _hoisted_3$2 = { class: "relative aspect-5/4 w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg" };
var _hoisted_4$2 = { class: "absolute inset-0" };
var _hoisted_5 = { class: "absolute top-1/2 left-1/2 aspect-3/2 w-3/4 -translate-1/2" };
var _hoisted_6 = { class: "absolute inset-0 rounded-3xl border border-white/20 bg-white/10 p-3.5 shadow-2xl" };
var _hoisted_7 = { class: "absolute top-3/20 left-1/20 aspect-5/3 w-7/20" };
var _hoisted_8 = { class: "relative flex w-full max-w-md flex-col items-center gap-1 text-center" };
var _hoisted_9 = { class: "m-0 font-inter text-base font-semibold text-primary-comfy-canvas" };
var _hoisted_10 = { class: "m-0 font-inter text-sm text-primary-comfy-canvas/70" };
var _hoisted_11 = {
	key: 0,
	class: "flex w-full items-center justify-center gap-3 pt-6"
};
var _hoisted_12 = { class: "m-0 hidden text-sm text-primary-comfy-canvas/90 md:block" };
var _hoisted_13 = {
	href: "https://www.comfy.org/download",
	target: "_blank",
	rel: "noopener noreferrer",
	class: "inline-flex h-8 items-center gap-2 rounded-lg border border-primary-comfy-canvas/20 bg-charcoal-500 p-2 text-xs font-medium text-primary-comfy-canvas no-underline hover:bg-charcoal-500/80"
};
//#endregion
//#region src/platform/cloud/onboarding/components/CloudHeroCarousel.vue
var CloudHeroCarousel_default = /* @__PURE__ */ defineComponent({
	__name: "CloudHeroCarousel",
	setup(__props) {
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$2, [createBaseVNode("div", _hoisted_2$2, [createBaseVNode("div", _hoisted_3$2, [createBaseVNode("div", _hoisted_4$2, [
				createBaseVNode("div", _hoisted_5, [
					createBaseVNode("div", _hoisted_6, [createBaseVNode("div", {
						class: "size-full overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat",
						style: normalizeStyle({ backgroundImage: `url(${unref(center_image_default)})` })
					}, null, 4)]),
					_cache[0] || (_cache[0] = createBaseVNode("div", { class: "absolute -top-1/20 -right-1/50 flex aspect-square w-7 items-center justify-center rounded-lg border border-primary-comfy-canvas/30 bg-white/20 text-primary-comfy-canvas shadow-xl backdrop-blur-sm" }, [createBaseVNode("i", { class: "icon-mask-[comfy--gemini] size-3.5" })], -1)),
					_cache[1] || (_cache[1] = createBaseVNode("div", { class: "absolute -bottom-2/25 left-1/2 flex aspect-square w-10 -translate-x-1/2 items-center justify-center rounded-xl border border-primary-comfy-canvas/30 bg-white/20 text-primary-comfy-canvas shadow-xl backdrop-blur-sm" }, [createBaseVNode("i", { class: "icon-[comfy--grok] size-6" })], -1))
				]),
				createBaseVNode("div", _hoisted_7, [createBaseVNode("div", {
					class: "absolute inset-0 overflow-hidden rounded-2xl border border-primary-comfy-canvas/50 bg-cover bg-center bg-no-repeat shadow-2xl",
					style: normalizeStyle({ backgroundImage: `url(${unref(top_left_default)})` })
				}, null, 4), _cache[2] || (_cache[2] = createBaseVNode("div", { class: "absolute -top-1/10 right-1/10 flex aspect-square w-7 items-center justify-center rounded-lg border border-primary-comfy-canvas/30 bg-white/20 text-primary-comfy-canvas shadow-xl backdrop-blur-sm" }, [createBaseVNode("i", { class: "icon-mask-[comfy--bytedance] size-3.5" })], -1))]),
				createBaseVNode("div", {
					class: "absolute bottom-3/20 left-1/10 aspect-4/3 w-1/4 overflow-hidden rounded-lg bg-cover bg-center bg-no-repeat shadow-2xl",
					style: normalizeStyle({ backgroundImage: `url(${unref(bottom_left_default)})` })
				}, null, 4),
				createBaseVNode("div", {
					class: "absolute right-2/25 bottom-1/10 aspect-4/3 w-3/10 overflow-hidden rounded-lg border border-primary-comfy-canvas/50 bg-cover bg-center bg-no-repeat shadow-2xl",
					style: normalizeStyle({ backgroundImage: `url(${unref(bottom_right_default)})` })
				}, null, 4)
			])]), createBaseVNode("div", _hoisted_8, [createBaseVNode("p", _hoisted_9, toDisplayString(unref(t)("cloudHero.slides.cloud.title")), 1), createBaseVNode("p", _hoisted_10, toDisplayString(unref(t)("cloudHero.slides.cloud.description")), 1)])]), unref(isCloud) ? (openBlock(), createElementBlock("div", _hoisted_11, [createBaseVNode("p", _hoisted_12, toDisplayString(unref(t)("cloudStart_wantToRun")), 1), createBaseVNode("a", _hoisted_13, [_cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-download text-xs text-primary-comfy-canvas/90" }, null, -1)), createTextVNode(" " + toDisplayString(unref(t)("cloudStart_download")), 1)])])) : createCommentVNode("", true)]);
		};
	}
});
//#endregion
//#region src/platform/cloud/onboarding/components/CloudTemplateFooter.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "mx-auto flex h-[5%] max-h-[60px] w-5/6 items-start justify-center gap-2.5" };
var _hoisted_2$1 = {
	href: "https://www.comfy.org/terms-of-service",
	target: "_blank",
	class: "cursor-pointer text-sm text-gray-600 no-underline"
};
var _hoisted_3$1 = {
	href: "https://www.comfy.org/privacy-policy",
	target: "_blank",
	class: "cursor-pointer text-sm text-gray-600 no-underline"
};
var _hoisted_4$1 = {
	href: "https://support.comfy.org",
	class: "cursor-pointer text-sm text-gray-600 no-underline",
	target: "_blank",
	rel: "noopener noreferrer"
};
//#endregion
//#region src/platform/cloud/onboarding/components/CloudTemplateFooter.vue
var CloudTemplateFooter_default = /* @__PURE__ */ defineComponent({
	__name: "CloudTemplateFooter",
	setup(__props) {
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("footer", _hoisted_1$1, [
				createBaseVNode("a", _hoisted_2$1, toDisplayString(unref(t)("auth.login.termsLink")), 1),
				createBaseVNode("a", _hoisted_3$1, toDisplayString(unref(t)("auth.login.privacyLink")), 1),
				createBaseVNode("a", _hoisted_4$1, toDisplayString(unref(t)("cloudFooter_needHelp")), 1)
			]);
		};
	}
});
//#endregion
//#region src/platform/cloud/onboarding/components/CloudTemplate.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex h-svh w-screen bg-primary-comfy-ink font-sans text-primary-comfy-canvas" };
var _hoisted_2 = { class: "relative flex flex-1 flex-col" };
var _hoisted_3 = { class: "flex flex-1 items-center justify-center overflow-auto" };
var _hoisted_4 = { class: "relative hidden flex-1 overflow-hidden py-2 pr-2 lg:block" };
//#endregion
//#region src/platform/cloud/onboarding/components/CloudTemplate.vue
var CloudTemplate_default = /* @__PURE__ */ defineComponent({
	__name: "CloudTemplate",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				_cache[0] || (_cache[0] = createBaseVNode("div", { class: "flex h-16 shrink-0 items-center px-6" }, [createBaseVNode("i", { class: "icon-[comfy--comfy-logo] h-5 w-22 text-brand-yellow md:h-6 md:w-26" })], -1)),
				createBaseVNode("div", _hoisted_3, [renderSlot(_ctx.$slots, "default")]),
				createVNode(CloudTemplateFooter_default)
			]), createBaseVNode("div", _hoisted_4, [createVNode(CloudHeroCarousel_default)])]);
		};
	}
});
//#endregion
//#region src/platform/cloud/onboarding/components/CloudLayoutView.vue
var CloudLayoutView_default = /* @__PURE__ */ defineComponent({
	__name: "CloudLayoutView",
	setup(__props) {
		onMounted(() => {
			document.getElementById("splash-loader")?.remove();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [createVNode(CloudTemplate_default, null, {
				default: withCtx(() => [createVNode(unref(RouterView))]),
				_: 1
			}), createVNode(GlobalToast_default)], 64);
		};
	}
});
//#endregion
export { CloudLayoutView_default as default };

//# sourceMappingURL=CloudLayoutView-uHwVyGDk.js.map