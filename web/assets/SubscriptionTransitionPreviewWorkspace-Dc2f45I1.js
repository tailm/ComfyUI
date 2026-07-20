import "./rolldown-runtime-w0pxe0c8.js";
import { tt as useToast } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, X as nextTick, at as renderList, bt as withCtx, ft as useId, j as createBaseVNode, jt as ref, rt as openBlock, st as resolveComponent, x as vShow, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Li as getTierCredits, Oi as useBillingContext, Ri as getTierFeatures, ki as useBillingOperationStore, zi as getTierPrice } from "./promotionUtils-DLM4TsXW.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { c as useUserStore, t as useTeamWorkspaceStore, u as useFeatureFlags } from "./teamWorkspaceStore-CfjV-n35.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-DD9yP8Gq.js";
import { a as TagsInput_default, i as TagsInputInput_default, n as TagsInputItemDelete_default, r as TagsInputItem_default, t as TagsInputItemText_default } from "./TagsInputItemText-vQdqei7O.js";
import { n as getComfyPlatformBaseUrl } from "./comfyApi-ChWHDqhE.js";
//#region src/platform/cloud/subscription/constants/teamPlanCreditStops.ts
/**
* Team-plan credit-subscription slider stops — OSS / pre-deploy fallback.
*
* The live set comes from `GET /api/billing/plans → team_credit_stops` (mapped
* via `mapApiTeamCreditStops`); these hardcoded DES-197 breakpoints render only
* when the API doesn't supply them. The slider snaps to exactly these 5 fixed
* breakpoints — the user cannot select a value in between. The `credits` figures
* equal `usdToCredits(usd)` at the current rate (`CREDITS_PER_USD = 211`); a unit
* test guards against rate drift silently changing the designed values.
*/
var TEAM_PLAN_CREDIT_STOPS = [
	{
		usd: 200,
		credits: 42200,
		discountPercentYearly: 0
	},
	{
		usd: 400,
		credits: 84400,
		discountPercentYearly: 5
	},
	{
		usd: 700,
		credits: 147700,
		discountPercentYearly: 10
	},
	{
		usd: 1400,
		credits: 295400,
		discountPercentYearly: 15
	},
	{
		usd: 2500,
		credits: 527500,
		discountPercentYearly: 20
	}
];
/**
* Per-credit Team plan slug for a billing cadence (cloud catalog). The slug
* encodes the cadence; `POST /api/billing/subscribe` reads `plan_slug` +
* `team_credit_stop_id` and resolves all amounts server-side from the stop.
*/
function getTeamPlanSlug(billingCycle) {
	return billingCycle === "yearly" ? "team_per_credit_annual" : "team_per_credit_monthly";
}
/**
* Map the backend `team_credit_stops` payload to the slider's `CreditStop[]`.
* The pre-discount monthly `usd` is the yearly list price; the yearly discount
* percent is derived from the struck (`list_price_cents`) vs discounted
* (`price_cents`) yearly figures. The backend `id` is carried so a selected stop
* can be sent on subscribe.
*/
function mapApiTeamCreditStops(stops) {
	return stops.map((stop) => {
		const listCents = stop.yearly.list_price_cents;
		const discountPercentYearly = listCents > 0 ? Math.round((listCents - stop.yearly.price_cents) / listCents * 100) : 0;
		return {
			id: stop.id,
			usd: Math.round(listCents / 100),
			credits: stop.credits,
			discountPercentYearly
		};
	});
}
/**
* Discounted monthly price for a credit stop, applying the billing-cycle
* discount (yearly = full `discountPercentYearly`; monthly halves it). Shared by
* the slider display and the checkout confirm step so the two never drift, and
* it reads the stop's own discount so backend-driven stops are honored.
*/
function getStopDiscountedMonthlyUsd(stop, cycle) {
	const percent = cycle === "monthly" ? stop.discountPercentYearly / 2 : stop.discountPercentYearly;
	return Math.round(stop.usd * (1 - percent / 100));
}
//#endregion
//#region src/platform/workspace/utils/workspaceCheckoutTelemetry.ts
function trackWorkspaceCheckoutStarted({ tier, cycle, checkoutType, billingOpId, paymentIntentSource }) {
	const userId = useUserStore().currentUserId;
	if (!userId) return;
	useTelemetry()?.trackBeginCheckout({
		user_id: userId,
		tier,
		cycle,
		checkout_type: checkoutType,
		billing_op_id: billingOpId,
		...paymentIntentSource ? { payment_intent_source: paymentIntentSource } : {}
	});
}
//#endregion
//#region src/platform/workspace/composables/useSubscriptionCheckout.ts
function findPlanSlug(plans, tierKey, billingCycle) {
	const apiDuration = billingCycle === "yearly" ? "ANNUAL" : "MONTHLY";
	const apiTier = tierKey.toUpperCase();
	return plans.find((p) => p.tier === apiTier && p.duration === apiDuration)?.slug ?? null;
}
function useSubscriptionCheckout(emit, paymentIntentSource) {
	const { t } = useI18n();
	const toast = useToast();
	const { subscribe, previewSubscribe, plans, fetchStatus, fetchBalance, resubscribe } = useBillingContext();
	const telemetry = useTelemetry();
	const billingOperationStore = useBillingOperationStore();
	const checkoutStep = ref("pricing");
	const isLoadingPreview = ref(false);
	const loadingTier = ref(null);
	const isSubscribing = ref(false);
	const isResubscribing = ref(false);
	const previewData = ref(null);
	const selectedTierKey = ref(null);
	const selectedTeamCheckout = ref(null);
	const selectedBillingCycle = ref("yearly");
	const isPolling = computed(() => billingOperationStore.hasPendingOperations);
	const selectedTeamStop = computed(() => selectedTeamCheckout.value?.stop ?? null);
	const isTeamCheckout = computed(() => selectedTeamCheckout.value !== null);
	const previewVariant = computed(() => {
		if (selectedTeamCheckout.value) return previewData.value ? "team-change" : "team-new";
		if (previewData.value) return previewData.value.transition_type === "new_subscription" ? "personal-new" : "personal-change";
		return null;
	});
	function getApiPlanSlug(tierKey, billingCycle) {
		return findPlanSlug(plans.value, tierKey, billingCycle);
	}
	async function handleSubscribeClick(payload) {
		const { tierKey, billingCycle } = payload;
		isLoadingPreview.value = true;
		loadingTier.value = tierKey;
		selectedTierKey.value = tierKey;
		selectedBillingCycle.value = billingCycle;
		try {
			const planSlug = getApiPlanSlug(tierKey, billingCycle);
			if (!planSlug) {
				toast.add({
					severity: "error",
					summary: "Unable to subscribe",
					detail: "This plan is not available"
				});
				return;
			}
			const response = await previewSubscribe(planSlug);
			if (!response || !response.allowed) {
				toast.add({
					severity: "error",
					summary: "Unable to subscribe",
					detail: response?.reason || "This plan is not available"
				});
				return;
			}
			previewData.value = response;
			checkoutStep.value = "preview";
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to load subscription preview";
			toast.add({
				severity: "error",
				summary: "Error",
				detail: message
			});
		} finally {
			isLoadingPreview.value = false;
			loadingTier.value = null;
		}
	}
	/**
	* Team-plan checkout entry. A fresh subscribe has nothing to prorate and shows
	* the display-only "Confirm your payment" step. An existing subscriber changing
	* their credit commitment gets a prorated transition preview when the backend
	* can describe it; until `preview-subscribe` accepts a team stop the attempt
	* falls back to the same display-only step.
	*/
	async function handleSubscribeTeamClick(payload) {
		selectedTeamCheckout.value = {
			stop: payload.stop,
			checkoutType: payload.isChange ? "change" : "new"
		};
		selectedBillingCycle.value = payload.billingCycle;
		selectedTierKey.value = null;
		previewData.value = null;
		checkoutStep.value = "preview";
		if (!payload.isChange || !payload.stop.id) return;
		try {
			const response = await previewSubscribe(getTeamPlanSlug(payload.billingCycle), {
				teamCreditStopId: payload.stop.id,
				billingCycle: payload.billingCycle
			});
			if (response?.allowed && response.is_immediate && response.transition_type !== "new_subscription") previewData.value = response;
		} catch {}
	}
	function handleBackToPricing() {
		checkoutStep.value = "pricing";
		previewData.value = null;
		selectedTeamCheckout.value = null;
	}
	function handleSuccessClose() {
		emit("close", true);
	}
	async function handleSubscription() {
		const tierKey = selectedTierKey.value;
		if (!tierKey) return;
		const billingCycle = selectedBillingCycle.value;
		const checkoutType = previewData.value && previewData.value.transition_type !== "new_subscription" ? "change" : "new";
		isSubscribing.value = true;
		try {
			const planSlug = getApiPlanSlug(tierKey, billingCycle);
			if (!planSlug) return;
			const response = await subscribe(planSlug, {
				returnUrl: `${getComfyPlatformBaseUrl()}/payment/success`,
				cancelUrl: `${getComfyPlatformBaseUrl()}/payment/failed`
			});
			if (response) trackWorkspaceCheckoutStarted({
				tier: tierKey,
				cycle: billingCycle,
				checkoutType,
				billingOpId: response.billing_op_id,
				paymentIntentSource
			});
			await handleSubscribeResponse(response);
		} catch (error) {
			showSubscribeError(error);
		} finally {
			isSubscribing.value = false;
		}
	}
	function showSubscribeError(error) {
		toast.add({
			severity: "error",
			summary: t("g.error"),
			detail: error instanceof Error ? error.message : t("subscription.subscribeFailed")
		});
	}
	async function handleSubscribeResponse(response) {
		if (!response) return;
		if (response.status === "subscribed") {
			telemetry?.trackMonthlySubscriptionSucceeded();
			await Promise.all([fetchStatus(), fetchBalance()]);
			checkoutStep.value = "success";
			return;
		}
		if (response.status === "needs_payment_method" && response.payment_method_url) {
			if (!window.open(response.payment_method_url, "_blank")) toast.add({
				severity: "warn",
				summary: t("g.warning"),
				detail: t("subscription.preview.paymentPopupBlocked")
			});
		}
		await advanceToSuccessOnOperation(response.billing_op_id);
	}
	async function advanceToSuccessOnOperation(opId) {
		if ((await billingOperationStore.startOperation(opId, "subscription")).status === "succeeded") checkoutStep.value = "success";
	}
	async function handleTeamSubscription() {
		const teamCheckout = selectedTeamCheckout.value;
		if (!teamCheckout?.stop.id) {
			toast.add({
				severity: "error",
				summary: t("subscription.teamPlan.name"),
				detail: t("subscription.teamPlan.unavailable")
			});
			return;
		}
		const { stop, checkoutType } = teamCheckout;
		const billingCycle = selectedBillingCycle.value;
		isSubscribing.value = true;
		try {
			const response = await subscribe(getTeamPlanSlug(billingCycle), {
				teamCreditStopId: stop.id,
				billingCycle,
				returnUrl: `${getComfyPlatformBaseUrl()}/payment/success`,
				cancelUrl: `${getComfyPlatformBaseUrl()}/payment/failed`
			});
			if (response) trackWorkspaceCheckoutStarted({
				tier: "team",
				cycle: billingCycle,
				checkoutType,
				billingOpId: response.billing_op_id,
				paymentIntentSource
			});
			await handleSubscribeResponse(response);
		} catch (error) {
			showSubscribeError(error);
		} finally {
			isSubscribing.value = false;
		}
	}
	async function handleResubscribe() {
		telemetry?.trackResubscribeClicked({
			source: "pricing_dialog",
			payment_intent_source: paymentIntentSource
		});
		isResubscribing.value = true;
		try {
			await resubscribe();
			toast.add({
				severity: "success",
				summary: t("subscription.resubscribeSuccess"),
				life: 5e3
			});
			emit("close", true);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to resubscribe";
			toast.add({
				severity: "error",
				summary: "Error",
				detail: message
			});
		} finally {
			isResubscribing.value = false;
		}
	}
	return {
		checkoutStep,
		isLoadingPreview,
		loadingTier,
		isSubscribing,
		isResubscribing,
		previewData,
		selectedTierKey,
		selectedTeamStop,
		selectedBillingCycle,
		isPolling,
		isTeamCheckout,
		previewVariant,
		handleSubscribeClick,
		handleSubscribeTeamClick,
		handleBackToPricing,
		handleSuccessClose,
		handleAddCreditCard: handleSubscription,
		handleConfirmTransition: handleSubscription,
		handleTeamSubscribe: handleTeamSubscription,
		handleResubscribe
	};
}
//#endregion
//#region src/platform/cloud/subscription/utils/planDuration.ts
/** Backend plan duration `'ANNUAL'` maps to the FE's yearly billing cycle. */
var isAnnualDuration = (duration) => duration === "ANNUAL";
/**
* Whether a checkout step renders as yearly. The preview's resolved plan
* duration wins; absent a preview (fresh subscribe with no proration) it falls
* back to the user's selected billing cycle.
*/
var isYearlyCheckout = (planDuration, billingCycle) => planDuration !== void 0 ? isAnnualDuration(planDuration) : billingCycle === "yearly";
//#endregion
//#region src/platform/workspace/components/SubscriptionTermsNote.vue
var _sfc_main = {};
var _hoisted_1$4 = { class: "m-0 text-center text-xs text-muted-foreground" };
var _hoisted_2$4 = {
	href: "https://www.comfy.org/terms",
	target: "_blank",
	rel: "noopener noreferrer",
	class: "underline hover:text-base-foreground"
};
var _hoisted_3$4 = {
	href: "https://www.comfy.org/privacy",
	target: "_blank",
	rel: "noopener noreferrer",
	class: "underline hover:text-base-foreground"
};
function _sfc_render(_ctx, _cache) {
	const _component_i18n_t = resolveComponent("i18n-t");
	return openBlock(), createElementBlock("p", _hoisted_1$4, [createVNode(_component_i18n_t, {
		keypath: "subscription.preview.termsAgreement",
		tag: "span"
	}, {
		terms: withCtx(() => [createBaseVNode("a", _hoisted_2$4, toDisplayString(_ctx.$t("subscription.preview.terms")), 1)]),
		privacy: withCtx(() => [createBaseVNode("a", _hoisted_3$4, toDisplayString(_ctx.$t("subscription.preview.privacyPolicy")), 1)]),
		_: 1
	})]);
}
var SubscriptionTermsNote_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main, [["render", _sfc_render]]);
//#endregion
//#region src/platform/workspace/components/SubscriptionAddPaymentPreviewWorkspace.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "m-0 mb-8 text-center text-xl text-muted-foreground lg:text-2xl" };
var _hoisted_2$3 = { class: "mx-auto flex h-full max-w-[400px] flex-col items-stretch justify-between text-sm" };
var _hoisted_3$3 = { class: "" };
var _hoisted_4$2 = { class: "flex flex-col gap-2" };
var _hoisted_5$2 = { class: "text-sm text-base-foreground" };
var _hoisted_6$2 = { class: "flex items-baseline gap-2" };
var _hoisted_7$2 = { class: "text-4xl font-semibold text-base-foreground" };
var _hoisted_8$2 = { class: "text-xl text-base-foreground" };
var _hoisted_9$2 = { class: "text-muted-foreground" };
var _hoisted_10$2 = { class: "text-muted-foreground" };
var _hoisted_11$2 = { class: "flex flex-col gap-3 pt-16 pb-8" };
var _hoisted_12$2 = { class: "flex items-center justify-between" };
var _hoisted_13$2 = { class: "text-base-foreground" };
var _hoisted_14$2 = { class: "flex items-center gap-1" };
var _hoisted_15$2 = { class: "font-bold text-base-foreground" };
var _hoisted_16$1 = { class: "flex flex-col gap-2 pt-2" };
var _hoisted_17$1 = { class: "text-sm text-base-foreground" };
var _hoisted_18$1 = { class: "flex items-center justify-between" };
var _hoisted_19$1 = { class: "text-sm text-base-foreground" };
var _hoisted_20$1 = { class: "text-sm font-bold text-base-foreground" };
var _hoisted_21$1 = { class: "flex items-center justify-between" };
var _hoisted_22$1 = { class: "text-sm text-base-foreground" };
var _hoisted_23$1 = { class: "flex items-center justify-between" };
var _hoisted_24$1 = { class: "text-sm text-base-foreground" };
var _hoisted_25$1 = { class: "flex items-center justify-between" };
var _hoisted_26$1 = { class: "text-sm text-base-foreground" };
var _hoisted_27$1 = {
	key: 0,
	class: "pi pi-check text-success-foreground text-xs"
};
var _hoisted_28$1 = {
	key: 1,
	class: "pi pi-times text-xs text-muted-foreground"
};
var _hoisted_29$1 = { class: "flex flex-col gap-2 border-t border-border-subtle pt-8" };
var _hoisted_30$1 = { class: "flex items-center justify-between text-base" };
var _hoisted_31$1 = { class: "text-base-foreground" };
var _hoisted_32$1 = { class: "font-bold text-base-foreground" };
var _hoisted_33 = { class: "text-sm text-muted-foreground" };
var _hoisted_34 = { class: "flex flex-col gap-2 pt-8" };
//#endregion
//#region src/platform/workspace/components/SubscriptionAddPaymentPreviewWorkspace.vue
var SubscriptionAddPaymentPreviewWorkspace_default = /* @__PURE__ */ defineComponent({
	__name: "SubscriptionAddPaymentPreviewWorkspace",
	props: {
		tierKey: {},
		billingCycle: { default: "monthly" },
		isLoading: {
			type: Boolean,
			default: false
		},
		previewData: { default: null },
		teamPlan: { default: null }
	},
	emits: ["addCreditCard", "back"],
	setup(__props) {
		const { t, n } = useI18n();
		const isFeaturesCollapsed = ref(true);
		const tierName = computed(() => __props.teamPlan ? t("subscription.teamPlan.name") : t(`subscription.tiers.${__props.tierKey}.name`));
		const isYearly = computed(() => isYearlyCheckout(__props.previewData?.new_plan.duration, __props.billingCycle));
		const displayPrice = computed(() => {
			if (__props.teamPlan) return __props.teamPlan.discountedUsd;
			if (__props.previewData?.new_plan) {
				const cents = __props.previewData.new_plan.price_cents;
				return ((isYearly.value ? cents / 12 : cents) / 100).toFixed(0);
			}
			return __props.tierKey ? getTierPrice(__props.tierKey, isYearly.value) : 0;
		});
		const annualTotalUsd = computed(() => {
			if (__props.teamPlan) return __props.teamPlan.discountedUsd * 12;
			if (__props.previewData?.new_plan) return __props.previewData.new_plan.price_cents / 100;
			return __props.tierKey ? getTierPrice(__props.tierKey, true) * 12 : 0;
		});
		const annualTotalFormatted = computed(() => `$${n(annualTotalUsd.value)}`);
		const monthlyCredits = computed(() => __props.teamPlan ? __props.teamPlan.credits : __props.tierKey ? getTierCredits(__props.tierKey) ?? 0 : 0);
		const refillCredits = computed(() => n(isYearly.value ? monthlyCredits.value * 12 : monthlyCredits.value));
		const creditsRefillLabelKey = computed(() => isYearly.value ? "subscription.preview.eachYearCreditsRefill" : "subscription.preview.eachMonthCreditsRefill");
		const teamPerks = computed(() => [
			t("subscription.teamPlan.perkInviteMembers"),
			t("subscription.teamPlan.perkConcurrentRuns"),
			t("subscription.teamPlan.perkSharedPool"),
			t("subscription.teamPlan.perkRolePermissions")
		]);
		const hasCustomLoRAs = computed(() => __props.tierKey ? getTierFeatures(__props.tierKey).customLoRAs : false);
		const maxDuration = computed(() => t(`subscription.maxDuration.${__props.tierKey}`));
		const totalDueToday = computed(() => {
			if (__props.teamPlan) return (isYearly.value ? __props.teamPlan.discountedUsd * 12 : __props.teamPlan.discountedUsd).toFixed(2);
			if (__props.previewData) return (__props.previewData.cost_today_cents / 100).toFixed(2);
			if (!__props.tierKey) return "0.00";
			const priceValue = getTierPrice(__props.tierKey, isYearly.value);
			return (isYearly.value ? priceValue * 12 : priceValue).toFixed(2);
		});
		const nextPaymentDate = computed(() => {
			if (__props.previewData?.new_plan?.period_end) return new Date(__props.previewData.new_plan.period_end).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
			const date = /* @__PURE__ */ new Date();
			if (__props.billingCycle === "yearly") date.setFullYear(date.getFullYear() + 1);
			else date.setMonth(date.getMonth() + 1);
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [createBaseVNode("h2", _hoisted_1$3, toDisplayString(_ctx.$t("subscription.preview.confirmPayment")), 1), createBaseVNode("div", _hoisted_2$3, [createBaseVNode("div", _hoisted_3$3, [
				createBaseVNode("div", _hoisted_4$2, [
					createBaseVNode("span", _hoisted_5$2, toDisplayString(tierName.value), 1),
					createBaseVNode("div", _hoisted_6$2, [createBaseVNode("span", _hoisted_7$2, " $" + toDisplayString(displayPrice.value), 1), createBaseVNode("span", _hoisted_8$2, toDisplayString(_ctx.$t("subscription.usdPerMonth")), 1)]),
					createBaseVNode("span", _hoisted_9$2, toDisplayString(isYearly.value ? _ctx.$t("subscription.billedYearly", { total: annualTotalFormatted.value }) : _ctx.$t("subscription.billedMonthly")), 1),
					createBaseVNode("span", _hoisted_10$2, toDisplayString(_ctx.$t("subscription.preview.startingToday")), 1)
				]),
				createBaseVNode("div", _hoisted_11$2, [
					createBaseVNode("div", _hoisted_12$2, [createBaseVNode("span", _hoisted_13$2, toDisplayString(_ctx.$t(creditsRefillLabelKey.value)), 1), createBaseVNode("div", _hoisted_14$2, [_cache[3] || (_cache[3] = createBaseVNode("i", { class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400" }, null, -1)), createBaseVNode("span", _hoisted_15$2, toDisplayString(refillCredits.value), 1)])]),
					createBaseVNode("button", {
						class: "flex cursor-pointer items-center justify-end gap-1 border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-base-foreground",
						onClick: _cache[0] || (_cache[0] = ($event) => isFeaturesCollapsed.value = !isFeaturesCollapsed.value)
					}, [createBaseVNode("span", null, toDisplayString(isFeaturesCollapsed.value ? _ctx.$t("subscription.preview.showMoreFeatures") : _ctx.$t("subscription.preview.hideFeatures")), 1), createBaseVNode("i", { class: normalizeClass(unref(cn)("pi text-xs", isFeaturesCollapsed.value ? "pi-chevron-down" : "pi-chevron-up")) }, null, 2)]),
					withDirectives(createBaseVNode("div", _hoisted_16$1, [__props.teamPlan ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(teamPerks.value, (perk) => {
						return openBlock(), createElementBlock("div", {
							key: perk,
							class: "flex items-center gap-2"
						}, [_cache[4] || (_cache[4] = createBaseVNode("i", { class: "pi pi-check text-success-foreground text-xs" }, null, -1)), createBaseVNode("span", _hoisted_17$1, toDisplayString(perk), 1)]);
					}), 128)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
						createBaseVNode("div", _hoisted_18$1, [createBaseVNode("span", _hoisted_19$1, toDisplayString(_ctx.$t("subscription.maxDurationLabel")), 1), createBaseVNode("span", _hoisted_20$1, toDisplayString(maxDuration.value), 1)]),
						createBaseVNode("div", _hoisted_21$1, [createBaseVNode("span", _hoisted_22$1, toDisplayString(_ctx.$t("subscription.gpuLabel")), 1), _cache[5] || (_cache[5] = createBaseVNode("i", { class: "pi pi-check text-success-foreground text-xs" }, null, -1))]),
						createBaseVNode("div", _hoisted_23$1, [createBaseVNode("span", _hoisted_24$1, toDisplayString(_ctx.$t("subscription.addCreditsLabel")), 1), _cache[6] || (_cache[6] = createBaseVNode("i", { class: "pi pi-check text-success-foreground text-xs" }, null, -1))]),
						createBaseVNode("div", _hoisted_25$1, [createBaseVNode("span", _hoisted_26$1, toDisplayString(_ctx.$t("subscription.customLoRAsLabel")), 1), hasCustomLoRAs.value ? (openBlock(), createElementBlock("i", _hoisted_27$1)) : (openBlock(), createElementBlock("i", _hoisted_28$1))])
					], 64))], 512), [[vShow, !isFeaturesCollapsed.value]])
				]),
				createBaseVNode("div", _hoisted_29$1, [createBaseVNode("div", _hoisted_30$1, [createBaseVNode("span", _hoisted_31$1, toDisplayString(_ctx.$t("subscription.preview.totalDueToday")), 1), createBaseVNode("span", _hoisted_32$1, " $" + toDisplayString(totalDueToday.value), 1)]), createBaseVNode("span", _hoisted_33, toDisplayString(_ctx.$t("subscription.preview.nextPaymentDue", { date: nextPaymentDate.value })), 1)])
			]), createBaseVNode("div", _hoisted_34, [
				createVNode(SubscriptionTermsNote_default),
				createVNode(Button_default, {
					variant: "tertiary",
					size: "lg",
					class: "w-full rounded-lg",
					loading: __props.isLoading,
					onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("addCreditCard"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.preview.subscribeToPlan", { plan: tierName.value })), 1)]),
					_: 1
				}, 8, ["loading"]),
				createVNode(Button_default, {
					variant: "textonly",
					class: "cursor-pointer text-center text-xs text-muted-foreground transition-colors hover:bg-none hover:text-base-foreground",
					onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("back"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.preview.backToAllPlans")), 1)]),
					_: 1
				})
			])])], 64);
		};
	}
});
//#endregion
//#region src/platform/workspace/utils/inviteEmails.ts
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Split pasted/typed input on commas and newlines only, so addresses with
*  surrounding whitespace (e.g. Outlook `"Alice B" <a@b.com>`) stay intact. */
var EMAIL_DELIMITER = /[,\n]+/;
function normalizeEmail(value) {
	return value.trim().toLowerCase();
}
function isValidEmail(email) {
	return EMAIL_REGEX.test(email);
}
/** Normalize, drop blanks, dedupe (case-insensitive), then clamp to `maxSeats`. */
function sanitizeInviteEmails(values, maxSeats) {
	const unique = [...new Set(values.map(normalizeEmail).filter(Boolean))];
	return unique.length > maxSeats ? unique.slice(0, maxSeats) : unique;
}
//#endregion
//#region src/platform/workspace/components/InviteMembersForm.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "flex flex-col gap-2" };
var _hoisted_2$2 = ["id"];
var _hoisted_3$2 = ["id"];
//#endregion
//#region src/platform/workspace/components/InviteMembersForm.vue
var InviteMembersForm_default = /* @__PURE__ */ defineComponent({
	__name: "InviteMembersForm",
	props: {
		submitLabel: {},
		placeholder: {},
		source: {},
		cancelLabel: {},
		maxSeats: { default: () => Number.POSITIVE_INFINITY },
		showSubmit: {
			type: Boolean,
			default: true
		},
		autoFocus: {
			type: Boolean,
			default: false
		}
	},
	emits: ["submitted", "cancel"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const emit = __emit;
		const { t } = useI18n();
		const toast = useToast();
		const telemetry = useTelemetry();
		const workspaceStore = useTeamWorkspaceStore();
		const emails = ref([]);
		const loading = ref(false);
		const invalidEmailsHintId = useId();
		const seatLimitHintId = useId();
		const invalidEmails = computed(() => emails.value.filter((email) => !isValidEmail(email)));
		const isAtSeatLimit = computed(() => emails.value.length >= __props.maxSeats);
		const canSubmit = computed(() => emails.value.length > 0 && emails.value.length <= __props.maxSeats && invalidEmails.value.length === 0);
		const describedBy = computed(() => [invalidEmails.value.length > 0 ? invalidEmailsHintId : void 0, isAtSeatLimit.value ? seatLimitHintId : void 0].filter(Boolean).join(" ") || void 0);
		function onEmailsUpdate(value) {
			emails.value = sanitizeInviteEmails(value, __props.maxSeats);
		}
		async function onSubmit() {
			if (loading.value) return;
			loading.value = true;
			if (!canSubmit.value) {
				loading.value = false;
				return;
			}
			try {
				const emailSnapshot = [...emails.value];
				const results = await Promise.allSettled(emailSnapshot.map((email) => workspaceStore.createInvite(email)));
				const failedEmails = emailSnapshot.filter((_, index) => results[index].status === "rejected");
				const invitedCount = emailSnapshot.length - failedEmails.length;
				if (invitedCount > 0) {
					telemetry?.trackWorkspaceInviteSent({
						source: __props.source,
						count: invitedCount
					});
					emit("submitted", emailSnapshot.filter((email) => !failedEmails.includes(email)));
				}
				if (failedEmails.length === 0) return;
				emails.value = failedEmails;
				toast.add({
					severity: "error",
					summary: t("workspacePanel.inviteMemberDialog.failedCount", failedEmails.length),
					life: 5e3
				});
			} finally {
				loading.value = false;
			}
		}
		__expose({
			submit: onSubmit,
			get canSubmit() {
				return canSubmit.value;
			},
			get loading() {
				return loading.value;
			}
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$2, [
				createVNode(TagsInput_default, {
					"always-editing": "",
					"add-on-paste": "",
					"add-on-blur": "",
					delimiter: unref(EMAIL_DELIMITER),
					"convert-value": unref(normalizeEmail),
					"model-value": emails.value,
					class: "min-h-10 w-full bg-tertiary-background px-3 focus-within:bg-tertiary-background hover:bg-tertiary-background-hover",
					"onUpdate:modelValue": onEmailsUpdate
				}, {
					default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(emails.value, (email) => {
						return openBlock(), createBlock(TagsInputItem_default, {
							key: email,
							value: email,
							class: normalizeClass(unref(cn)("rounded-full", !unref(isValidEmail)(email) && "bg-danger/20 text-danger"))
						}, {
							default: withCtx(() => [createVNode(TagsInputItemText_default), createVNode(TagsInputItemDelete_default)]),
							_: 1
						}, 8, ["value", "class"]);
					}), 128)), createVNode(TagsInputInput_default, {
						"auto-focus": __props.autoFocus,
						class: "min-w-0 text-sm",
						"aria-label": __props.placeholder,
						"aria-describedby": describedBy.value,
						placeholder: emails.value.length === 0 ? __props.placeholder : void 0
					}, null, 8, [
						"auto-focus",
						"aria-label",
						"aria-describedby",
						"placeholder"
					])]),
					_: 1
				}, 8, [
					"delimiter",
					"convert-value",
					"model-value"
				]),
				invalidEmails.value.length > 0 ? (openBlock(), createElementBlock("p", {
					key: 0,
					id: unref(invalidEmailsHintId),
					role: "alert",
					class: "text-danger m-0 text-xs"
				}, toDisplayString(_ctx.$t("workspacePanel.inviteMemberDialog.invalidEmailCount", invalidEmails.value.length)), 9, _hoisted_2$2)) : createCommentVNode("", true),
				isAtSeatLimit.value ? (openBlock(), createElementBlock("p", {
					key: 1,
					id: unref(seatLimitHintId),
					"aria-live": "polite",
					class: "m-0 text-xs text-muted-foreground"
				}, toDisplayString(_ctx.$t("workspacePanel.inviteMemberDialog.seatLimitReached", __props.maxSeats)), 9, _hoisted_3$2)) : createCommentVNode("", true),
				__props.showSubmit ? (openBlock(), createElementBlock("div", {
					key: 2,
					class: normalizeClass(unref(cn)("flex", __props.cancelLabel ? "items-center justify-end gap-4" : "flex-col"))
				}, [__props.cancelLabel ? (openBlock(), createBlock(Button_default, {
					key: 0,
					variant: "muted-textonly",
					size: "lg",
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("cancel"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(__props.cancelLabel), 1)]),
					_: 1
				})) : createCommentVNode("", true), createVNode(Button_default, {
					variant: "secondary",
					size: "lg",
					class: normalizeClass(unref(cn)(!__props.cancelLabel && "w-full rounded-lg")),
					loading: loading.value,
					disabled: !canSubmit.value,
					"aria-busy": loading.value,
					"aria-label": loading.value ? _ctx.$t("g.loading") : __props.submitLabel,
					onClick: onSubmit
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(__props.submitLabel), 1)]),
					_: 1
				}, 8, [
					"class",
					"loading",
					"disabled",
					"aria-busy",
					"aria-label"
				])], 2)) : createCommentVNode("", true)
			]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/SubscriptionSuccessWorkspace.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "mx-auto flex h-full max-w-[400px] flex-col items-stretch justify-between text-sm" };
var _hoisted_2$1 = { class: "flex flex-col items-center gap-4 pt-8" };
var _hoisted_3$1 = { class: "m-0 text-center text-xl font-semibold text-base-foreground lg:text-2xl" };
var _hoisted_4$1 = { class: "m-0 text-center text-sm text-muted-foreground" };
var _hoisted_5$1 = { class: "mt-4 flex w-full flex-col gap-1 rounded-xl border border-border-default bg-base-background p-4" };
var _hoisted_6$1 = { class: "text-sm text-base-foreground" };
var _hoisted_7$1 = { class: "flex items-baseline gap-1" };
var _hoisted_8$1 = { class: "text-2xl font-semibold text-base-foreground" };
var _hoisted_9$1 = { class: "text-sm text-base-foreground" };
var _hoisted_10$1 = { class: "flex items-center gap-1 text-sm text-muted-foreground" };
var _hoisted_11$1 = {
	key: 0,
	class: "mt-4 flex w-full flex-col gap-2"
};
var _hoisted_12$1 = { class: "m-0 text-base font-semibold text-base-foreground" };
var _hoisted_13$1 = { class: "m-0 text-sm text-muted-foreground" };
var _hoisted_14$1 = { "aria-live": "polite" };
var _hoisted_15$1 = { class: "flex flex-col gap-2 pt-8" };
//#endregion
//#region src/platform/workspace/components/SubscriptionSuccessWorkspace.vue
var SubscriptionSuccessWorkspace_default = /* @__PURE__ */ defineComponent({
	__name: "SubscriptionSuccessWorkspace",
	props: {
		tierKey: {},
		previewData: { default: null },
		teamPlan: { default: null },
		isTeam: {
			type: Boolean,
			default: false
		}
	},
	emits: ["close"],
	setup(__props) {
		const { t, n } = useI18n();
		const { flags } = useFeatureFlags();
		const workspaceStore = useTeamWorkspaceStore();
		const tierName = computed(() => __props.teamPlan ? t("subscription.teamPlan.name") : t(`subscription.tiers.${__props.tierKey}.name`));
		const displayPrice = computed(() => {
			if (__props.teamPlan) return String(__props.teamPlan.discountedUsd);
			if (!__props.previewData?.new_plan) return "0";
			const cents = __props.previewData.new_plan.price_cents;
			return ((isAnnualDuration(__props.previewData.new_plan.duration) ? cents / 12 : cents) / 100).toFixed(0);
		});
		const displayCredits = computed(() => n(__props.teamPlan ? __props.teamPlan.credits : __props.tierKey ? getTierCredits(__props.tierKey) ?? 0 : 0));
		const occupiedSeats = computed(() => Math.max(1, workspaceStore.members.length + workspaceStore.pendingInvites.length));
		const invitableSeats = computed(() => Math.max(0, 30 - occupiedSeats.value));
		const showInviteBlock = computed(() => __props.isTeam && flags.teamWorkspacesEnabled);
		const invitedEmails = ref([]);
		const invitedMessage = ref();
		const inviteForm = ref();
		const canSendInvites = computed(() => inviteForm.value?.canSubmit ?? false);
		const isSendingInvites = computed(() => inviteForm.value?.loading ?? false);
		function handleSendInvites() {
			inviteForm.value?.submit()?.catch(console.error);
		}
		async function onInvited(emails) {
			invitedEmails.value = emails;
			await nextTick();
			invitedMessage.value?.focus();
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [
				_cache[2] || (_cache[2] = createBaseVNode("i", { class: "pi pi-check-circle text-5xl text-success-background" }, null, -1)),
				createBaseVNode("h2", _hoisted_3$1, toDisplayString(_ctx.$t("subscription.success.allSet")), 1),
				createBaseVNode("p", _hoisted_4$1, toDisplayString(_ctx.$t("subscription.success.planUpdated")) + " " + toDisplayString(_ctx.$t("subscription.success.receiptEmailed")), 1),
				createBaseVNode("div", _hoisted_5$1, [
					createBaseVNode("span", _hoisted_6$1, toDisplayString(tierName.value), 1),
					createBaseVNode("div", _hoisted_7$1, [createBaseVNode("span", _hoisted_8$1, " $" + toDisplayString(displayPrice.value), 1), createBaseVNode("span", _hoisted_9$1, toDisplayString(_ctx.$t("subscription.usdPerMonth")), 1)]),
					createBaseVNode("div", _hoisted_10$1, [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400" }, null, -1)), createBaseVNode("span", null, toDisplayString(displayCredits.value) + " " + toDisplayString(_ctx.$t("subscription.perMonth")), 1)])
				]),
				showInviteBlock.value ? (openBlock(), createElementBlock("div", _hoisted_11$1, [
					createBaseVNode("h3", _hoisted_12$1, toDisplayString(_ctx.$t("subscription.success.inviteTitle")), 1),
					createBaseVNode("p", _hoisted_13$1, toDisplayString(_ctx.$t("subscription.success.inviteSubtext")), 1),
					createBaseVNode("div", _hoisted_14$1, [invitedEmails.value.length > 0 ? (openBlock(), createElementBlock("p", {
						key: 0,
						ref_key: "invitedMessage",
						ref: invitedMessage,
						tabindex: "-1",
						class: "text-success-foreground m-0 text-sm"
					}, toDisplayString(_ctx.$t("workspacePanel.inviteMemberDialog.invitedMessage", { emails: invitedEmails.value.join(", ") }, invitedEmails.value.length)), 513)) : (openBlock(), createBlock(InviteMembersForm_default, {
						key: 1,
						ref_key: "inviteForm",
						ref: inviteForm,
						"show-submit": false,
						source: "post_upgrade_success",
						"submit-label": _ctx.$t("subscription.success.sendInvites"),
						placeholder: _ctx.$t("subscription.success.inviteEmailsPlaceholder"),
						"max-seats": invitableSeats.value,
						onSubmitted: onInvited
					}, null, 8, [
						"submit-label",
						"placeholder",
						"max-seats"
					]))])
				])) : createCommentVNode("", true)
			]), createBaseVNode("div", _hoisted_15$1, [showInviteBlock.value && invitedEmails.value.length === 0 ? (openBlock(), createBlock(Button_default, {
				key: 0,
				variant: "tertiary",
				size: "lg",
				class: "w-full rounded-lg",
				disabled: !canSendInvites.value,
				loading: isSendingInvites.value,
				onClick: handleSendInvites
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.success.sendInvites")), 1)]),
				_: 1
			}, 8, ["disabled", "loading"])) : createCommentVNode("", true), createVNode(Button_default, {
				variant: "secondary",
				size: "lg",
				class: "w-full rounded-lg",
				onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close"))
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.close")), 1)]),
				_: 1
			})])]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/SubscriptionTransitionPreviewWorkspace.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "m-0 mb-8 text-center text-xl text-muted-foreground lg:text-2xl" };
var _hoisted_2 = { class: "mx-auto flex h-full max-w-[400px] flex-col items-stretch justify-between text-sm" };
var _hoisted_3 = { class: "flex flex-col gap-2" };
var _hoisted_4 = { class: "text-sm font-semibold text-base-foreground" };
var _hoisted_5 = { class: "flex items-baseline gap-2" };
var _hoisted_6 = { class: "text-4xl font-semibold text-base-foreground" };
var _hoisted_7 = { class: "text-xl text-base-foreground" };
var _hoisted_8 = { class: "text-muted-foreground" };
var _hoisted_9 = { class: "text-muted-foreground" };
var _hoisted_10 = {
	key: 1,
	class: "text-muted-foreground"
};
var _hoisted_11 = {
	key: 0,
	class: "flex flex-col gap-2 pt-10"
};
var _hoisted_12 = { class: "flex items-center justify-between text-muted-foreground" };
var _hoisted_13 = {
	key: 0,
	class: "flex items-center justify-between text-muted-foreground"
};
var _hoisted_14 = {
	key: 1,
	class: "flex flex-col gap-2 pt-10"
};
var _hoisted_15 = { class: "flex items-center justify-between" };
var _hoisted_16 = { class: "text-base-foreground" };
var _hoisted_17 = { class: "flex items-center gap-1" };
var _hoisted_18 = { class: "font-bold text-base-foreground" };
var _hoisted_19 = {
	key: 0,
	class: "text-sm text-muted-foreground"
};
var _hoisted_20 = {
	key: 2,
	class: "flex flex-col gap-2 pt-10"
};
var _hoisted_21 = { class: "text-xs font-semibold tracking-wide text-muted-foreground uppercase" };
var _hoisted_22 = { class: "flex items-center justify-between" };
var _hoisted_23 = { class: "text-base-foreground" };
var _hoisted_24 = { class: "flex items-center gap-1" };
var _hoisted_25 = { class: "font-bold text-base-foreground" };
var _hoisted_26 = { class: "text-sm text-muted-foreground" };
var _hoisted_27 = { class: "mt-10 flex flex-col gap-2 border-t border-border-subtle pt-8" };
var _hoisted_28 = { class: "flex items-center justify-between text-base" };
var _hoisted_29 = { class: "text-base-foreground" };
var _hoisted_30 = { class: "font-bold text-base-foreground" };
var _hoisted_31 = { class: "text-sm text-muted-foreground" };
var _hoisted_32 = { class: "flex flex-col gap-2 pt-8" };
//#endregion
//#region src/platform/workspace/components/SubscriptionTransitionPreviewWorkspace.vue
var SubscriptionTransitionPreviewWorkspace_default = /* @__PURE__ */ defineComponent({
	__name: "SubscriptionTransitionPreviewWorkspace",
	props: {
		previewData: {},
		isLoading: {
			type: Boolean,
			default: false
		},
		teamPlan: { default: null }
	},
	emits: ["confirm", "back"],
	setup(__props) {
		const { t, n } = useI18n();
		function formatTierName(tier) {
			return t(`subscription.tiers.${tier.toLowerCase()}.name`);
		}
		function formatDate(dateStr) {
			return new Intl.DateTimeFormat("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				timeZone: "UTC"
			}).format(new Date(dateStr));
		}
		function money(usd) {
			return `$${usd.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
		}
		function moneyShort(usd) {
			return `$${n(usd)}`;
		}
		function tierMonthlyCredits(tier) {
			return getTierCredits(tier.toLowerCase()) ?? 0;
		}
		const isImmediate = computed(() => __props.previewData.is_immediate);
		const newIsYearly = computed(() => isAnnualDuration(__props.previewData.new_plan.duration));
		const currentIsYearly = computed(() => isAnnualDuration(__props.previewData.current_plan?.duration));
		const isCadenceChange = computed(() => !!__props.previewData.current_plan && __props.previewData.current_plan.duration !== __props.previewData.new_plan.duration);
		const newTierName = computed(() => __props.teamPlan ? t("subscription.teamPlan.name") : formatTierName(__props.previewData.new_plan.tier));
		const currentTierName = computed(() => __props.previewData.current_plan ? formatTierName(__props.previewData.current_plan.tier) : "");
		const currentPlanLabel = computed(() => currentIsYearly.value ? t("subscription.tierNameYearly", { name: currentTierName.value }) : currentTierName.value);
		const newMonthlyUsd = computed(() => {
			const cents = __props.previewData.new_plan.price_cents;
			return (newIsYearly.value ? cents / 12 : cents) / 100;
		});
		const heroPrice = computed(() => newMonthlyUsd.value.toFixed(0));
		const annualTotalFormatted = computed(() => `$${n(__props.previewData.new_plan.price_cents / 100)}`);
		const newPlanPriceUsd = computed(() => __props.previewData.new_plan.price_cents / 100);
		const prorationCreditUsd = computed(() => {
			const credit = __props.previewData.new_plan.price_cents - __props.previewData.cost_today_cents;
			return credit > 0 ? credit / 100 : 0;
		});
		const totalDueTodayUsd = computed(() => __props.previewData.cost_today_cents / 100);
		const newMonthlyChargeUsd = computed(() => newMonthlyUsd.value);
		const subscriptionLineLabel = computed(() => newIsYearly.value ? t("subscription.preview.yearlySubscription") : t("subscription.preview.newMonthlySubscription"));
		const creditFromPlanLabel = computed(() => {
			if (__props.teamPlan) return t("subscription.preview.commitment");
			return isCadenceChange.value ? t("subscription.preview.currentMonthly") : currentTierName.value;
		});
		const refillCredits = computed(() => {
			const monthly = __props.teamPlan ? __props.teamPlan.credits : tierMonthlyCredits(__props.previewData.new_plan.tier);
			return n(newIsYearly.value ? monthly * 12 : monthly);
		});
		const monthlyRefillCredits = computed(() => n(__props.teamPlan ? __props.teamPlan.credits : tierMonthlyCredits(__props.previewData.new_plan.tier)));
		const refillLabel = computed(() => newIsYearly.value ? t("subscription.preview.creditsYoullGetToday") : t("subscription.preview.eachMonthCreditsRefill"));
		const effectiveDateLabel = computed(() => formatDate(__props.previewData.effective_at));
		const nextPaymentDate = computed(() => __props.previewData.new_plan.period_end ? formatDate(__props.previewData.new_plan.period_end) : effectiveDateLabel.value);
		const currentPeriodEnd = computed(() => __props.previewData.current_plan?.period_end ? formatDate(__props.previewData.current_plan.period_end) : effectiveDateLabel.value);
		const confirmTitle = computed(() => isImmediate.value ? t("subscription.preview.confirmUpgradeTitle") : t("subscription.preview.confirmChangeTitle"));
		const confirmCta = computed(() => isImmediate.value ? t("subscription.preview.confirmUpgradeCta") : t("subscription.preview.confirmChange"));
		const totalNote = computed(() => isImmediate.value ? t("subscription.preview.nextPaymentDue", { date: nextPaymentDate.value }) : t("subscription.preview.stayOnUntil", {
			plan: currentPlanLabel.value,
			date: currentPeriodEnd.value
		}));
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [createBaseVNode("h2", _hoisted_1, toDisplayString(confirmTitle.value), 1), createBaseVNode("div", _hoisted_2, [createBaseVNode("div", null, [
				createBaseVNode("div", _hoisted_3, [
					createBaseVNode("span", _hoisted_4, toDisplayString(newTierName.value), 1),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, " $" + toDisplayString(heroPrice.value), 1), createBaseVNode("span", _hoisted_7, toDisplayString(_ctx.$t("subscription.usdPerMonth")), 1)]),
					isImmediate.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("span", _hoisted_8, toDisplayString(newIsYearly.value ? _ctx.$t("subscription.billedYearly", { total: annualTotalFormatted.value }) : _ctx.$t("subscription.billedMonthly")), 1), createBaseVNode("span", _hoisted_9, toDisplayString(_ctx.$t("subscription.preview.switchesToday")), 1)], 64)) : (openBlock(), createElementBlock("span", _hoisted_10, toDisplayString(_ctx.$t("subscription.preview.startsOn", { date: effectiveDateLabel.value })), 1))
				]),
				isImmediate.value ? (openBlock(), createElementBlock("div", _hoisted_11, [createBaseVNode("div", _hoisted_12, [createBaseVNode("span", null, toDisplayString(subscriptionLineLabel.value), 1), createBaseVNode("span", null, toDisplayString(money(newPlanPriceUsd.value)), 1)]), prorationCreditUsd.value > 0 ? (openBlock(), createElementBlock("div", _hoisted_13, [createBaseVNode("span", null, toDisplayString(_ctx.$t("subscription.preview.creditFromCurrent", { plan: creditFromPlanLabel.value })), 1), createBaseVNode("span", null, "− " + toDisplayString(money(prorationCreditUsd.value)), 1)])) : createCommentVNode("", true)])) : createCommentVNode("", true),
				isImmediate.value ? (openBlock(), createElementBlock("div", _hoisted_14, [createBaseVNode("div", _hoisted_15, [createBaseVNode("span", _hoisted_16, toDisplayString(refillLabel.value), 1), createBaseVNode("div", _hoisted_17, [_cache[2] || (_cache[2] = createBaseVNode("i", { class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400" }, null, -1)), createBaseVNode("span", _hoisted_18, toDisplayString(refillCredits.value), 1)])]), newIsYearly.value ? (openBlock(), createElementBlock("span", _hoisted_19, toDisplayString(_ctx.$t("subscription.preview.refillReplacesNote")), 1)) : createCommentVNode("", true)])) : (openBlock(), createElementBlock("div", _hoisted_20, [
					createBaseVNode("span", _hoisted_21, toDisplayString(_ctx.$t("subscription.preview.afterThat")), 1),
					createBaseVNode("div", _hoisted_22, [createBaseVNode("span", _hoisted_23, toDisplayString(_ctx.$t("subscription.preview.creditsRefillMonthlyTo")), 1), createBaseVNode("div", _hoisted_24, [_cache[3] || (_cache[3] = createBaseVNode("i", { class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400" }, null, -1)), createBaseVNode("span", _hoisted_25, toDisplayString(monthlyRefillCredits.value), 1)])]),
					createBaseVNode("span", _hoisted_26, toDisplayString(_ctx.$t("subscription.preview.billedEachMonth", { amount: moneyShort(newMonthlyChargeUsd.value) })), 1)
				])),
				createBaseVNode("div", _hoisted_27, [createBaseVNode("div", _hoisted_28, [createBaseVNode("span", _hoisted_29, toDisplayString(_ctx.$t("subscription.preview.totalDueToday")), 1), createBaseVNode("span", _hoisted_30, toDisplayString(money(totalDueTodayUsd.value)), 1)]), createBaseVNode("span", _hoisted_31, toDisplayString(totalNote.value), 1)])
			]), createBaseVNode("div", _hoisted_32, [
				createVNode(SubscriptionTermsNote_default),
				createVNode(Button_default, {
					variant: "tertiary",
					size: "lg",
					class: "w-full rounded-lg",
					loading: __props.isLoading,
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("confirm"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(confirmCta.value), 1)]),
					_: 1
				}, 8, ["loading"]),
				createVNode(Button_default, {
					variant: "textonly",
					class: "cursor-pointer text-center text-xs text-muted-foreground transition-colors hover:bg-none hover:text-base-foreground",
					onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("back"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.preview.backToAllPlans")), 1)]),
					_: 1
				})
			])])], 64);
		};
	}
});
//#endregion
export { TEAM_PLAN_CREDIT_STOPS as a, useSubscriptionCheckout as i, SubscriptionSuccessWorkspace_default as n, getStopDiscountedMonthlyUsd as o, SubscriptionAddPaymentPreviewWorkspace_default as r, mapApiTeamCreditStops as s, SubscriptionTransitionPreviewWorkspace_default as t };

//# sourceMappingURL=SubscriptionTransitionPreviewWorkspace-Dc2f45I1.js.map