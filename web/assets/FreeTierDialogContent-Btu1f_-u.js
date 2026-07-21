import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Gt as toDisplayString, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, bt as withCtx, j as createBaseVNode, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Li as getTierCredits, Oi as useBillingContext } from "./promotionUtils-bxMXJ_BT.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as SubscriptionBenefits_default } from "./SubscriptionBenefits-DNW1Letr.js";
//#region src/platform/cloud/subscription/components/FreeTierDialogContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "relative grid h-full grid-cols-5" };
var _hoisted_2 = { class: "col-span-3 flex flex-col justify-between p-8" };
var _hoisted_3 = { class: "flex flex-col gap-6" };
var _hoisted_4 = { class: "text-sm text-text-primary" };
var _hoisted_5 = {
	key: 0,
	class: "m-0 text-sm text-text-secondary"
};
var _hoisted_6 = {
	key: 1,
	class: "m-0 text-sm text-text-secondary"
};
var _hoisted_7 = {
	key: 2,
	class: "m-0 text-sm text-text-secondary"
};
var _hoisted_8 = { class: "flex flex-col pt-8" };
//#endregion
//#region src/platform/cloud/subscription/components/FreeTierDialogContent.vue
var FreeTierDialogContent_default = /* @__PURE__ */ defineComponent({
	__name: "FreeTierDialogContent",
	props: { reason: {} },
	emits: ["close", "upgrade"],
	setup(__props) {
		const { renewalDate } = useBillingContext();
		const formattedRenewalDate = computed(() => {
			if (!renewalDate.value) return "";
			return new Date(renewalDate.value).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		});
		const freeTierCredits = computed(() => getTierCredits("free"));
		const isCreditsBlockedVariant = computed(() => __props.reason === "out_of_credits" || __props.reason === "top_up_blocked");
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(Button_default, {
					size: "icon",
					variant: "muted-textonly",
					class: "absolute top-2.5 right-2.5 z-10 size-8 rounded-full p-0 text-white hover:bg-white/20",
					"aria-label": _ctx.$t("g.close"),
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close", false))
				}, {
					default: withCtx(() => [..._cache[2] || (_cache[2] = [createBaseVNode("i", { class: "pi pi-times" }, null, -1)])]),
					_: 1
				}, 8, ["aria-label"]),
				_cache[3] || (_cache[3] = createBaseVNode("div", { class: "relative col-span-2 flex items-center justify-center overflow-hidden rounded-sm" }, [createBaseVNode("video", {
					autoplay: "",
					loop: "",
					muted: "",
					playsinline: "",
					class: "h-full min-w-[125%] object-cover p-0",
					style: { "margin-left": "-20%" }
				}, [createBaseVNode("source", {
					src: "" + new URL("images/cloud-subscription.webm", import.meta.url).href,
					type: "video/webm"
				})])], -1)),
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [__props.reason === "out_of_credits" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(toDisplayString(_ctx.$t("subscription.freeTier.outOfCredits.title")), 1)], 64)) : __props.reason === "top_up_blocked" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(_ctx.$t("subscription.freeTier.topUpBlocked.title")), 1)], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [createTextVNode(toDisplayString(_ctx.$t("subscription.freeTier.title")), 1)], 64))]),
					__props.reason === "out_of_credits" ? (openBlock(), createElementBlock("p", _hoisted_5, toDisplayString(_ctx.$t("subscription.freeTier.outOfCredits.subtitle")), 1)) : createCommentVNode("", true),
					!isCreditsBlockedVariant.value ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(freeTierCredits.value ? _ctx.$t("subscription.freeTier.description", { credits: freeTierCredits.value.toLocaleString() }) : _ctx.$t("subscription.freeTier.descriptionGeneric")), 1)) : createCommentVNode("", true),
					!isCreditsBlockedVariant.value && formattedRenewalDate.value ? (openBlock(), createElementBlock("p", _hoisted_7, toDisplayString(_ctx.$t("subscription.freeTier.nextRefresh", { date: formattedRenewalDate.value })), 1)) : createCommentVNode("", true)
				]), createVNode(SubscriptionBenefits_default, {
					"is-free-tier": "",
					class: "mt-6 text-muted"
				})]), createBaseVNode("div", _hoisted_8, [createVNode(Button_default, {
					class: "w-full rounded-lg bg-(--color-accent-blue,#0B8CE9) px-4 py-2 font-inter text-sm font-bold text-white hover:bg-(--color-accent-blue,#0B8CE9)/90",
					onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("upgrade"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(isCreditsBlockedVariant.value ? _ctx.$t("subscription.freeTier.upgradeCta") : _ctx.$t("subscription.freeTier.subscribeCta")), 1)]),
					_: 1
				})])])
			]);
		};
	}
});
//#endregion
export { FreeTierDialogContent_default as default };

//# sourceMappingURL=FreeTierDialogContent-Btu1f_-u.js.map