import "./rolldown-runtime-w0pxe0c8.js";
import { O as script$1, V as script } from "./vendor-primevue-rx7tKw03.js";
import { F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, Vt as unref, c as useRouter, it as openBlock, j as computed, s as useRoute, tt as onMounted } from "./vendor-vue-core-D3WB7mNE.js";
import { Oi as useBillingContext, Ri as useAuthActions, Vi as workspaceApi, ia as getComfyPlatformBaseUrl } from "./promotionUtils-vKoNYnM9.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { t as useErrorHandling } from "./useErrorHandling-DNyo9FnY.js";
import { t as comfy_logo_single_default } from "./comfy-logo-single-D0Vl2r_r.js";
import { t as performSubscriptionCheckout } from "./subscriptionCheckoutUtil-BiZO4SZw.js";
import { i as getTeamPlanSlug, t as trackWorkspaceCheckoutStarted } from "./workspaceCheckoutTelemetry-C-mPoQzr.js";
//#region src/platform/cloud/subscription/utils/teamSubscriptionCheckoutUtil.ts
/**
* Direct team-plan checkout for the marketing `/cloud/subscribe?tier=team` deep
* link: subscribes to the per-credit Team plan at the chosen slider stop and
* sends the user straight to the Stripe payment page.
*
* Mirrors `performSubscriptionCheckout` (personal) but routes through the
* workspace billing endpoint (`POST /api/billing/subscribe`), because the
* per-credit Team plan lives there and the backend lets any workspace — personal
* included — subscribe to it. The slug encodes the cadence; the stop id is
* validated and priced server-side.
*
* Caller guards on `isCloud`, owns loading state, and wraps error handling. A
* `needs_payment_method` response is a full-page redirect to Stripe; the other
* statuses land back in the app, which polls the billing op to completion.
*/
async function performTeamSubscriptionCheckout(teamCreditStopId, billingCycle, options = {}) {
	if (!isCloud) return;
	const planSlug = getTeamPlanSlug(billingCycle);
	const response = await workspaceApi.subscribe(planSlug, {
		returnUrl: `${getComfyPlatformBaseUrl()}/payment/success`,
		cancelUrl: `${getComfyPlatformBaseUrl()}/payment/failed`,
		teamCreditStopId
	});
	trackWorkspaceCheckoutStarted({
		tier: "team",
		cycle: billingCycle,
		checkoutType: "new",
		billingOpId: response.billing_op_id,
		paymentIntentSource: options.paymentIntentSource
	});
	if (response.status === "needs_payment_method") {
		if (!response.payment_method_url) throw new Error("Team subscription needs a payment method but no payment URL was returned");
		globalThis.location.href = response.payment_method_url;
		return;
	}
	globalThis.location.href = "/";
}
//#endregion
//#region src/platform/cloud/onboarding/CloudSubscriptionRedirectView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "bg-comfy-menu-secondary-bg flex size-full items-center justify-center" };
var _hoisted_2 = { class: "flex flex-col items-center gap-4" };
var _hoisted_3 = ["alt"];
var _hoisted_4 = {
	key: 0,
	class: "font-inter text-base/normal font-normal text-base-foreground"
};
//#endregion
//#region src/platform/cloud/onboarding/CloudSubscriptionRedirectView.vue
var CloudSubscriptionRedirectView_default = /* @__PURE__ */ defineComponent({
	__name: "CloudSubscriptionRedirectView",
	setup(__props) {
		function isBillingCycle(value) {
			return value === "monthly" || value === "yearly";
		}
		function isCheckoutTierKey(value) {
			return [
				"standard",
				"creator",
				"pro",
				"founder"
			].includes(value);
		}
		const { t } = useI18n();
		const route = useRoute();
		const router = useRouter();
		const { reportError, accessBillingPortal } = useAuthActions();
		const { wrapWithErrorHandlingAsync } = useErrorHandling();
		const { isActiveSubscription, isInitialized, initialize } = useBillingContext();
		const selectedTierKey = ref(null);
		const tierDisplayName = computed(() => {
			if (!selectedTierKey.value) return "";
			return {
				free: t("subscription.tiers.free.name"),
				standard: t("subscription.tiers.standard.name"),
				creator: t("subscription.tiers.creator.name"),
				pro: t("subscription.tiers.pro.name"),
				founder: t("subscription.tiers.founder.name")
			}[selectedTierKey.value];
		});
		const isTeamCheckout = ref(false);
		const planLabel = computed(() => isTeamCheckout.value ? t("subscription.teamPlan.name") : tierDisplayName.value);
		const runRedirect = wrapWithErrorHandlingAsync(async () => {
			const rawType = route.query.tier;
			const rawCycle = route.query.cycle;
			let tierKeyParam = null;
			let cycleParam = "monthly";
			if (typeof rawType === "string") tierKeyParam = rawType;
			else if (Array.isArray(rawType) && rawType[0]) tierKeyParam = rawType[0];
			if (typeof rawCycle === "string") cycleParam = rawCycle;
			else if (Array.isArray(rawCycle) && rawCycle[0]) cycleParam = rawCycle[0];
			if (!tierKeyParam) {
				await router.push("/");
				return;
			}
			const billingCycle = isBillingCycle(cycleParam) ? cycleParam : "monthly";
			if (tierKeyParam === "team") {
				const rawStop = route.query.stop;
				const stopId = typeof rawStop === "string" ? rawStop : Array.isArray(rawStop) ? rawStop[0] : null;
				if (!stopId) {
					await router.push("/");
					return;
				}
				isTeamCheckout.value = true;
				await performTeamSubscriptionCheckout(stopId, billingCycle, { paymentIntentSource: "deep_link" });
				return;
			}
			if (!isCheckoutTierKey(tierKeyParam)) {
				await router.push("/");
				return;
			}
			selectedTierKey.value = tierKeyParam;
			if (!isInitialized.value) await initialize();
			if (isActiveSubscription.value) await accessBillingPortal(void 0, false);
			else await performSubscriptionCheckout(tierKeyParam, billingCycle, {
				openInNewTab: false,
				paymentIntentSource: "deep_link"
			});
		}, reportError);
		onMounted(() => {
			runRedirect();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("img", {
					src: comfy_logo_single_default,
					alt: unref(t)("g.comfyOrgLogoAlt"),
					class: "size-16"
				}, null, 8, _hoisted_3),
				planLabel.value ? (openBlock(), createElementBlock("p", _hoisted_4, toDisplayString(unref(t)("subscription.subscribeTo", { plan: planLabel.value })), 1)) : createCommentVNode("", true),
				planLabel.value ? (openBlock(), createBlock(unref(script), {
					key: 1,
					class: "size-8",
					"stroke-width": "4"
				})) : createCommentVNode("", true),
				planLabel.value ? (openBlock(), createBlock(unref(script$1), {
					key: 2,
					as: "a",
					href: "/",
					link: "",
					label: unref(t)("cloudOnboarding.skipToCloudApp")
				}, null, 8, ["label"])) : createCommentVNode("", true)
			])]);
		};
	}
});
//#endregion
export { CloudSubscriptionRedirectView_default as default };

//# sourceMappingURL=CloudSubscriptionRedirectView-C3lUfJ8p.js.map