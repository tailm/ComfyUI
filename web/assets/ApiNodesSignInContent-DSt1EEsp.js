import "./rolldown-runtime-w0pxe0c8.js";
import { I as script } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, E as Fragment, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Vt as unref, it as openBlock, ot as renderList, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as useExternalLink } from "./useExternalLink-lnTgXLgb.js";
//#region src/components/common/ApiNodesList.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex h-full flex-col gap-3" };
var _hoisted_2$1 = { class: "flex text-xs" };
var _hoisted_3$1 = { class: "flex flex-col gap-2" };
var _hoisted_4$1 = { class: "flex items-center gap-2" };
var _hoisted_5$1 = { class: "text-base/tight font-medium" };
//#endregion
//#region src/components/common/ApiNodesList.vue
var ApiNodesList_default = /* @__PURE__ */ defineComponent({
	__name: "ApiNodesList",
	props: { nodeNames: {} },
	setup(__props) {
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [createBaseVNode("div", null, toDisplayString(unref(t)("apiNodesCostBreakdown.title")), 1)]), createVNode(unref(script), { class: "h-0 grow" }, {
				default: withCtx(() => [createBaseVNode("div", _hoisted_3$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.nodeNames, (nodeName) => {
					return openBlock(), createElementBlock("div", {
						key: nodeName,
						class: "flex items-center justify-between rounded-md bg-(--p-content-border-color) px-3 py-2"
					}, [createBaseVNode("div", _hoisted_4$1, [createBaseVNode("span", _hoisted_5$1, toDisplayString(nodeName), 1)])]);
				}), 128))])]),
				_: 1
			})]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/ApiNodesSignInContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	"data-testid": "api-signin-dialog",
	class: "flex h-110 max-w-96 flex-col gap-4 p-2"
};
var _hoisted_2 = { class: "mb-2 text-2xl font-medium" };
var _hoisted_3 = { class: "mb-4 text-base" };
var _hoisted_4 = { class: "flex items-center justify-between" };
var _hoisted_5 = { class: "flex gap-2" };
//#endregion
//#region src/components/dialog/content/ApiNodesSignInContent.vue
var ApiNodesSignInContent_default = /* @__PURE__ */ defineComponent({
	__name: "ApiNodesSignInContent",
	props: {
		apiNodeNames: {},
		onLogin: { type: Function },
		onCancel: { type: Function }
	},
	setup(__props) {
		const { t } = useI18n();
		const { buildDocsUrl } = useExternalLink();
		const handleLearnMoreClick = () => {
			window.open(buildDocsUrl("/tutorials/api-nodes/faq", { includeLocale: true }), "_blank");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, toDisplayString(unref(t)("apiNodesSignInDialog.title")), 1),
				createBaseVNode("div", _hoisted_3, toDisplayString(unref(t)("apiNodesSignInDialog.message")), 1),
				createVNode(ApiNodesList_default, { "node-names": __props.apiNodeNames }, null, 8, ["node-names"]),
				createBaseVNode("div", _hoisted_4, [createVNode(Button_default, {
					variant: "textonly",
					onClick: handleLearnMoreClick
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("g.learnMore")), 1)]),
					_: 1
				}), createBaseVNode("div", _hoisted_5, [createVNode(Button_default, {
					variant: "secondary",
					onClick: _cache[0] || (_cache[0] = ($event) => __props.onCancel?.())
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("g.cancel")), 1)]),
					_: 1
				}), createVNode(Button_default, { onClick: _cache[1] || (_cache[1] = ($event) => __props.onLogin?.()) }, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("g.login")), 1)]),
					_: 1
				})])])
			]);
		};
	}
});
//#endregion
export { ApiNodesSignInContent_default as default };

//# sourceMappingURL=ApiNodesSignInContent-DSt1EEsp.js.map