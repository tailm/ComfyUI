import "./rolldown-runtime-w0pxe0c8.js";
import { B as createVNode, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, Vt as unref, it as openBlock, tt as onMounted, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Oi as useBillingContext, Ui as useCommandStore, ca as getTierCredits, hi as useDialogService, la as getTierFeatures } from "./promotionUtils-vKoNYnM9.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as useExternalLink } from "./useExternalLink-lnTgXLgb.js";
//#region src/platform/cloud/subscription/composables/useSubscriptionActions.ts
/**
* Composable for handling subscription panel actions and loading states
*/
function useSubscriptionActions() {
	const dialogService = useDialogService();
	const commandStore = useCommandStore();
	const telemetry = useTelemetry();
	const { fetchBalance, fetchStatus } = useBillingContext();
	const isLoadingSupport = ref(false);
	onMounted(() => {
		handleRefresh();
	});
	const handleAddApiCredits = () => {
		telemetry?.trackAddApiCreditButtonClicked({ source: "settings_billing_panel" });
		dialogService.showTopUpCreditsDialog();
	};
	const handleMessageSupport = async () => {
		try {
			isLoadingSupport.value = true;
			telemetry?.trackHelpResourceClicked({
				resource_type: "help_feedback",
				is_external: true,
				source: "subscription"
			});
			await commandStore.execute("Comfy.ContactSupport");
		} catch (error) {
			console.error("[useSubscriptionActions] Error contacting support:", error);
		} finally {
			isLoadingSupport.value = false;
		}
	};
	const handleRefresh = async () => {
		try {
			await Promise.all([fetchBalance(), fetchStatus()]);
		} catch (error) {
			console.error("[useSubscriptionActions] Error refreshing data:", error);
		}
	};
	const handleLearnMoreClick = () => {
		window.open("https://docs.comfy.org/get_started/cloud", "_blank");
	};
	return {
		isLoadingSupport,
		handleAddApiCredits,
		handleMessageSupport,
		handleRefresh,
		handleLearnMoreClick
	};
}
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionFooterLinks.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex items-center justify-between border-t border-interface-stroke pt-3" };
var _hoisted_2 = { class: "flex gap-2" };
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionFooterLinks.vue
var SubscriptionFooterLinks_default = /* @__PURE__ */ defineComponent({
	__name: "SubscriptionFooterLinks",
	setup(__props) {
		const { buildDocsUrl, docsPaths } = useExternalLink();
		const { manageSubscription } = useBillingContext();
		const { isLoadingSupport, handleMessageSupport, handleLearnMoreClick } = useSubscriptionActions();
		async function handleInvoiceHistory() {
			await manageSubscription();
		}
		function handleOpenPartnerNodesInfo() {
			window.open(buildDocsUrl(docsPaths.partnerNodesPricing, { includeLocale: true }), "_blank");
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createVNode(Button_default, {
					variant: "muted-textonly",
					class: "text-xs text-text-secondary",
					onClick: unref(handleLearnMoreClick)
				}, {
					default: withCtx(() => [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "pi pi-question-circle text-xs text-text-secondary" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("subscription.learnMore")), 1)]),
					_: 1
				}, 8, ["onClick"]),
				createVNode(Button_default, {
					variant: "muted-textonly",
					class: "text-xs text-text-secondary",
					onClick: handleOpenPartnerNodesInfo
				}, {
					default: withCtx(() => [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "pi pi-question-circle text-xs text-text-secondary" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("subscription.partnerNodesPricingTable")), 1)]),
					_: 1
				}),
				createVNode(Button_default, {
					variant: "muted-textonly",
					class: "text-xs text-text-secondary",
					loading: unref(isLoadingSupport),
					onClick: unref(handleMessageSupport)
				}, {
					default: withCtx(() => [_cache[2] || (_cache[2] = createBaseVNode("i", { class: "pi pi-comment text-xs text-text-secondary" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("subscription.messageSupport")), 1)]),
					_: 1
				}, 8, ["loading", "onClick"])
			]), createVNode(Button_default, {
				variant: "muted-textonly",
				class: "text-xs text-text-secondary",
				onClick: handleInvoiceHistory
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.invoiceHistory")) + " ", 1), _cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-external-link text-xs text-text-secondary" }, null, -1))]),
				_: 1
			})]);
		};
	}
});
//#endregion
//#region src/platform/cloud/subscription/utils/tierBenefits.ts
function getCommonTierBenefits(key, t, n) {
	const benefits = [];
	const isFree = key === "free";
	if (isFree) {
		const credits = getTierCredits(key);
		if (credits !== null) benefits.push({
			key: "monthlyCredits",
			type: "metric",
			value: n(credits),
			label: t("subscription.monthlyCreditsLabel")
		});
	}
	benefits.push({
		key: "maxDuration",
		type: "metric",
		value: t(`subscription.maxDuration.${key}`),
		label: t("subscription.maxDurationLabel")
	});
	benefits.push({
		key: "gpu",
		type: "feature",
		label: t("subscription.gpuLabel")
	});
	if (!isFree) benefits.push({
		key: "addCredits",
		type: "feature",
		label: t("subscription.addCreditsLabel")
	});
	if (getTierFeatures(key).customLoRAs) benefits.push({
		key: "customLoRAs",
		type: "feature",
		label: t("subscription.customLoRAsLabel")
	});
	return benefits;
}
//#endregion
export { SubscriptionFooterLinks_default as n, useSubscriptionActions as r, getCommonTierBenefits as t };

//# sourceMappingURL=tierBenefits-srsfeZj-.js.map