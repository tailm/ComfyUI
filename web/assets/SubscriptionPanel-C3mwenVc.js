const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./SubscriptionPanelContentWorkspace-Cmk0zzh-.js","./SubscriptionPanelContentWorkspace-BXr2YCRX.js","./_plugin-vue_export-helper-BTZD_w11.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-rx7tKw03.js","./vendor-vue-core-D3WB7mNE.js","./promotionUtils-vKoNYnM9.js","./vendor-other-CcVI76zn.js","./vendor-firebase-C7k8AidI.js","./vendor-three-BgtZEsKh.js","./vendor-tiptap-Da8lvoX9.js","./vendor-zod-9ZYBvZOX.js","./vendor-reka-ui-3rzHRTLU.js","./vendor-i18n-BVGbvPvq.js","./vendor-sentry-CJqm_Nmo.js","./vendor-vueuse-BA2QXdyV.js","./vendor-axios-CCRjO_8I.js","./vendor-markdown-ZOM1KON6.js","./vendor-yjs-DF9PYGyQ.js","./api-DrovjuJk.js","./types-4cVPtFn2.js","./toastStore-BIphcVgz.js","./devFeatureFlagOverride-BkGrEGSd.js","./formatUtil-B15pKy0Z.js","./src-CDgHMYTj.js","./downloadUtil-DVwV9jPP.js","./i18n-DAE2CSwM.js","./commands-DD5bW_sz.js","./main-mdv62577.js","./nodeDefs-BSMa-osx.js","./settings-C20_o31_.js","./WaveAudioPlayer-B565XRpq.js","./Button-BDFBPNkK.js","./Slider-C_rx-g3O.js","./DialogHeader-DkWnDCOh.js","./dialogStore-DD1yBh6P.js","./Loader-BDNSi0qc.js","./Popover-CZfXPPLp.js","./useModalLiftedZIndex-CHOpgGKh.js","./ColorPicker-CzfjYyaP.js","./SelectValue-DqyfA2Es.js","./Input-DH6Bhvfp.js","./extensionStore-rc50enKT.js","./useErrorHandling-DNyo9FnY.js","./useExternalLink-lnTgXLgb.js","./envUtil-BjE8ep-x.js","./useFeatureFlags-DVgtsxbC.js","./remoteConfig-DjUkM6Dg.js","./useImageQuiet-Cr1HOQ5t.js","./VideoPlayOverlay-BHVjultu.js","./useFeatureUsageTracker-Dmo_jNxY.js","./telemetry-BQKS_Is7.js","./topupTracker-DNKc8Xp6.js","./userStore-BKADmpNR.js","./widgetTypes-oIdIlxxV.js","./markdownRendererUtil-B-BSW0UD.js","./CreditsTile-BJ9sdWOk.js","./tierBenefits-srsfeZj-.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css","./SubscriptionPanelContentWorkspace-y1DHY7tg.css"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { tt as __vitePreload } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, E as Fragment, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, N as createBlock, P as createCommentVNode, V as defineAsyncComponent, Vt as unref, it as openBlock, j as computed, ot as renderList, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Ai as useSubscriptionDialog, Ni as useSubscription, Oi as useBillingContext, Ri as useAuthActions, aa as DEFAULT_TIER_KEY, sa as TIER_TO_KEY, ua as getTierPrice, zi as useBillingRouting } from "./promotionUtils-vKoNYnM9.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BTZD_w11.js";
import { t as CreditsTile_default } from "./CreditsTile-BJ9sdWOk.js";
import { t as CloudBadge_default } from "./CloudBadge-CdweN2BG.js";
import { n as SubscriptionFooterLinks_default, r as useSubscriptionActions, t as getCommonTierBenefits } from "./tierBenefits-srsfeZj-.js";
import { t as SubscribeButton_default } from "./SubscribeButton-Cz0Hx2AO.js";
//#region src/platform/cloud/subscription/components/SubscriptionPanelContentLegacy.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "grow overflow-auto" };
var _hoisted_2$1 = { class: "rounded-2xl border border-interface-stroke p-6" };
var _hoisted_3$1 = { class: "flex items-center justify-between gap-2" };
var _hoisted_4$1 = { class: "flex flex-col gap-2" };
var _hoisted_5$1 = { class: "text-sm font-bold text-text-primary" };
var _hoisted_6 = { class: "flex items-baseline gap-1 font-inter font-semibold" };
var _hoisted_7 = { class: "text-2xl" };
var _hoisted_8 = { class: "text-base" };
var _hoisted_9 = {
	key: 0,
	class: "text-sm text-text-secondary"
};
var _hoisted_10 = { class: "flex flex-col gap-6 pt-9 lg:flex-row" };
var _hoisted_11 = { class: "w-full lg:max-w-md" };
var _hoisted_12 = { class: "flex flex-col gap-2" };
var _hoisted_13 = { class: "text-sm text-text-primary" };
var _hoisted_14 = { class: "flex flex-col gap-0" };
var _hoisted_15 = {
	key: 0,
	class: "pi pi-check text-xs text-text-primary"
};
var _hoisted_16 = {
	key: 1,
	class: "text-sm font-normal whitespace-nowrap text-text-primary"
};
var _hoisted_17 = { class: "text-sm text-muted" };
var _hoisted_18 = { class: "flex items-center gap-2 py-4" };
var _hoisted_19 = {
	href: "https://www.comfy.org/cloud/pricing",
	target: "_blank",
	rel: "noopener noreferrer",
	class: "text-sm text-muted underline hover:opacity-80"
};
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionPanelContentLegacy.vue
var SubscriptionPanelContentLegacy_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SubscriptionPanelContentLegacy",
	setup(__props) {
		const authActions = useAuthActions();
		const { t, n } = useI18n();
		const { isActiveSubscription, isCancelled, isFreeTier, formattedRenewalDate, formattedEndDate, subscriptionTier, subscriptionTierName, isYearlySubscription } = useSubscription();
		const { show: showSubscriptionDialog } = useSubscriptionDialog();
		const tierKey = computed(() => {
			const tier = subscriptionTier.value;
			if (!tier) return DEFAULT_TIER_KEY;
			return TIER_TO_KEY[tier] ?? "standard";
		});
		const tierPrice = computed(() => getTierPrice(tierKey.value, isYearlySubscription.value));
		async function handleManageSubscription() {
			useTelemetry()?.trackSubscriptionCancellation("flow_opened", {
				source: "manage_subscription_button",
				current_tier: subscriptionTier.value?.toLowerCase(),
				cycle: isYearlySubscription.value ? "yearly" : "monthly"
			});
			await authActions.accessBillingPortal();
		}
		const tierBenefits = computed(() => getCommonTierBenefits(tierKey.value, t, n));
		const { handleRefresh } = useSubscriptionActions();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_3$1, [
				createBaseVNode("div", _hoisted_4$1, [
					createBaseVNode("div", _hoisted_5$1, toDisplayString(unref(subscriptionTierName)), 1),
					createBaseVNode("div", _hoisted_6, [createBaseVNode("span", _hoisted_7, "$" + toDisplayString(tierPrice.value), 1), createBaseVNode("span", _hoisted_8, toDisplayString(_ctx.$t("subscription.perMonth")), 1)]),
					unref(isActiveSubscription) ? (openBlock(), createElementBlock("div", _hoisted_9, [unref(isCancelled) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(toDisplayString(_ctx.$t("subscription.expiresDate", { date: unref(formattedEndDate) })), 1)], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(_ctx.$t("subscription.renewsDate", { date: unref(formattedRenewalDate) })), 1)], 64))])) : createCommentVNode("", true)
				]),
				unref(isActiveSubscription) && !unref(isFreeTier) ? (openBlock(), createBlock(Button_default, {
					key: 0,
					variant: "secondary",
					class: "ml-auto rounded-lg bg-interface-menu-component-surface-selected px-4 py-2 text-sm font-normal text-text-primary",
					onClick: handleManageSubscription
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.manageSubscription")), 1)]),
					_: 1
				})) : createCommentVNode("", true),
				unref(isActiveSubscription) ? (openBlock(), createBlock(Button_default, {
					key: 1,
					variant: "primary",
					class: "rounded-lg px-4 py-2 text-sm font-normal text-text-primary",
					onClick: _cache[0] || (_cache[0] = ($event) => unref(showSubscriptionDialog)({ reason: "settings_billing_panel" }))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.upgradePlan")), 1)]),
					_: 1
				})) : createCommentVNode("", true),
				!unref(isActiveSubscription) ? (openBlock(), createBlock(SubscribeButton_default, {
					key: 2,
					label: _ctx.$t("subscription.subscribeNow"),
					size: "sm",
					fluid: false,
					class: "text-xs",
					onSubscribed: unref(handleRefresh)
				}, null, 8, ["label", "onSubscribed"])) : createCommentVNode("", true)
			])]), createBaseVNode("div", _hoisted_10, [createBaseVNode("div", _hoisted_11, [createVNode(CreditsTile_default)]), createBaseVNode("div", _hoisted_12, [createBaseVNode("div", _hoisted_13, toDisplayString(_ctx.$t("subscription.yourPlanIncludes")), 1), createBaseVNode("div", _hoisted_14, [(openBlock(true), createElementBlock(Fragment, null, renderList(tierBenefits.value, (benefit) => {
				return openBlock(), createElementBlock("div", {
					key: benefit.key,
					class: "flex items-center gap-2 py-2"
				}, [benefit.type === "feature" ? (openBlock(), createElementBlock("i", _hoisted_15)) : benefit.type === "metric" && benefit.value ? (openBlock(), createElementBlock("span", _hoisted_16, toDisplayString(benefit.value), 1)) : createCommentVNode("", true), createBaseVNode("span", _hoisted_17, toDisplayString(benefit.label), 1)]);
			}), 128))])])])]), createBaseVNode("div", _hoisted_18, [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "pi pi-external-link text-muted" }, null, -1)), createBaseVNode("a", _hoisted_19, toDisplayString(_ctx.$t("subscription.viewMoreDetailsPlans")), 1)])]);
		};
	}
}), [["__scopeId", "data-v-e89a43a2"]]);
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "subscription-container h-full" };
var _hoisted_2 = { class: "flex h-full flex-col gap-6" };
var _hoisted_3 = { class: "flex items-center gap-2" };
var _hoisted_4 = { class: "font-inter text-2xl/tight font-semibold" };
var _hoisted_5 = { class: "pt-1" };
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionPanel.vue
var SubscriptionPanel_default = /* @__PURE__ */ defineComponent({
	__name: "SubscriptionPanel",
	setup(__props) {
		const SubscriptionPanelContentWorkspace = defineAsyncComponent(() => __vitePreload(() => import("./SubscriptionPanelContentWorkspace-Cmk0zzh-.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60]), import.meta.url));
		const { shouldUseWorkspaceBilling } = useBillingRouting();
		const { isActiveSubscription } = useBillingContext();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("span", _hoisted_4, toDisplayString(unref(isActiveSubscription) ? _ctx.$t("subscription.title") : _ctx.$t("subscription.titleUnsubscribed")), 1), createBaseVNode("div", _hoisted_5, [createVNode(CloudBadge_default, {
				"reverse-order": "",
				"background-color": "var(--p-dialog-background)"
			})])]), unref(shouldUseWorkspaceBilling) ? (openBlock(), createBlock(unref(SubscriptionPanelContentWorkspace), { key: 0 })) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(SubscriptionPanelContentLegacy_default), createVNode(SubscriptionFooterLinks_default)], 64))])]);
		};
	}
});
//#endregion
export { SubscriptionPanel_default as default };

//# sourceMappingURL=SubscriptionPanel-C3mwenVc.js.map