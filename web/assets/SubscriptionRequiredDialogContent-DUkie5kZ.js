import "./rolldown-runtime-w0pxe0c8.js";
import { P as script$1, p as script } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, gt as watch, j as createBaseVNode, jt as ref, rt as openBlock, st as resolveComponent, x as vShow, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Di as useErrorHandling, Fi as TIER_PRICING, Ii as TIER_TO_KEY, Oi as useBillingContext, hi as useCommandStore } from "./promotionUtils-bxMXJ_BT.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { s as t } from "./i18n-BJjDt-Gn.js";
import { c as useUserStore } from "./teamWorkspaceStore-CD0PAZYS.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-DD9yP8Gq.js";
import { t as SubscriptionBenefits_default } from "./SubscriptionBenefits-DNW1Letr.js";
import { a as createPendingSubscriptionCheckoutAttempt, c as recordPendingSubscriptionCheckoutAttempt, l as withPendingCheckoutAttemptId, s as persistPendingSubscriptionCheckoutAttempt, u as CloudBadge_default } from "./subscriptionCheckoutTracker-DC_wa0rM.js";
import { t as SubscribeButton_default } from "./SubscribeButton-C9myfDWs.js";
import { t as getComfyApiBaseUrl } from "./comfyApi-ChWHDqhE.js";
//#region src/platform/cloud/subscription/utils/subscriptionCheckoutUtil.ts
var getCheckoutTier = (tierKey, billingCycle) => billingCycle === "yearly" ? `${tierKey}-yearly` : tierKey;
var getCheckoutAttributionForCloud = async () => {
	return {};
};
/**
* Core subscription checkout logic shared between PricingTable and
* SubscriptionRedirectView. Handles:
* - Ensuring the user is authenticated
* - Calling the backend checkout endpoint
* - Normalizing error responses
* - Opening the checkout URL in a new tab when available
*
* Callers are responsible for:
* - Guarding on cloud-only behavior (isCloud)
* - Managing loading state
* - Wrapping with error handling (e.g. useErrorHandling)
*/
async function performSubscriptionCheckout(tierKey, currentBillingCycle, options = {}) {
	if (!isCloud) return;
	const { openInNewTab = true, paymentIntentSource } = options;
	const userId = useUserStore().currentUserId;
	const telemetry = useTelemetry();
	if (!userId) throw new Error(t("toastMessages.userNotAuthenticated"));
	const checkoutTier = getCheckoutTier(tierKey, currentBillingCycle);
	let checkoutAttribution = {};
	try {
		checkoutAttribution = await getCheckoutAttributionForCloud();
	} catch (error) {
		console.warn("[SubscriptionCheckout] Failed to collect checkout attribution", error);
	}
	const checkoutPayload = { ...checkoutAttribution };
	const response = await fetch(`${getComfyApiBaseUrl()}/customers/cloud-subscription-checkout/${checkoutTier}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(checkoutPayload)
	});
	if (!response.ok) {
		let errorMessage = "Failed to initiate checkout";
		try {
			errorMessage = (await response.json()).message || errorMessage;
		} catch {
			try {
				errorMessage = await response.text() || `HTTP ${response.status} ${response.statusText}`;
			} catch {
				errorMessage = `HTTP ${response.status} ${response.statusText}`;
			}
		}
		throw new Error(t("toastMessages.failedToInitiateSubscription", { error: errorMessage }));
	}
	const data = await response.json();
	if (data.checkout_url) {
		const pendingAttempt = createPendingSubscriptionCheckoutAttempt({
			tier: tierKey,
			cycle: currentBillingCycle,
			checkout_type: "new",
			payment_intent_source: paymentIntentSource
		});
		if (userId) telemetry?.trackBeginCheckout(withPendingCheckoutAttemptId({
			user_id: userId,
			tier: tierKey,
			cycle: currentBillingCycle,
			checkout_type: "new",
			...paymentIntentSource ? { payment_intent_source: paymentIntentSource } : {},
			...checkoutAttribution
		}, pendingAttempt));
		if (openInNewTab) {
			if (!window.open(data.checkout_url, "_blank")) return;
			persistPendingSubscriptionCheckoutAttempt(pendingAttempt);
		} else {
			persistPendingSubscriptionCheckoutAttempt(pendingAttempt);
			globalThis.location.href = data.checkout_url;
		}
	}
}
//#endregion
//#region src/platform/cloud/subscription/utils/subscriptionTierRank.ts
var PLAN_RANK = [
	"yearly-pro",
	"yearly-creator",
	"yearly-standard",
	"monthly-pro",
	"monthly-creator",
	"monthly-standard"
].reduce((acc, plan, index) => acc.set(plan, index), /* @__PURE__ */ new Map());
var toRankedPlanKey = (tierKey, billingCycle) => {
	if (tierKey === "founder" || tierKey === "free") return null;
	return `${billingCycle}-${tierKey}`;
};
var getPlanRank = ({ tierKey, billingCycle }) => {
	const planKey = toRankedPlanKey(tierKey, billingCycle);
	if (!planKey) return Number.POSITIVE_INFINITY;
	return PLAN_RANK.get(planKey) ?? Number.POSITIVE_INFINITY;
};
var isPlanDowngrade = ({ current, target }) => {
	const currentRank = getPlanRank(current);
	return getPlanRank(target) > currentRank;
};
//#endregion
//#region src/platform/cloud/subscription/components/PricingTable.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex flex-col gap-6" };
var _hoisted_2$1 = { class: "flex justify-center" };
var _hoisted_3$1 = { class: "flex items-center gap-2" };
var _hoisted_4$1 = {
	key: 0,
	class: "flex items-center rounded-full bg-primary-background px-2 py-0.5 text-2xs font-bold whitespace-nowrap text-white"
};
var _hoisted_5$1 = { class: "flex flex-col items-stretch gap-4 xl:flex-row" };
var _hoisted_6$1 = { class: "flex flex-col gap-4 p-6 pb-0" };
var _hoisted_7$1 = { class: "flex flex-row items-center justify-between gap-2" };
var _hoisted_8$1 = { class: "font-inter text-base/normal font-bold text-base-foreground" };
var _hoisted_9$1 = {
	key: 0,
	class: "flex h-5 items-center rounded-full bg-base-foreground px-1.5 text-2xs font-bold tracking-tight text-base-background uppercase"
};
var _hoisted_10$1 = { class: "flex flex-col" };
var _hoisted_11$1 = { class: "flex flex-col gap-2" };
var _hoisted_12$1 = { class: "flex flex-row items-baseline gap-2" };
var _hoisted_13$1 = { class: "font-inter text-[28px] leading-normal font-semibold text-base-foreground tabular-nums" };
var _hoisted_14$1 = { class: "font-inter text-xl/normal text-base-foreground" };
var _hoisted_15$1 = { class: "flex items-center gap-2" };
var _hoisted_16$1 = { class: "text-sm text-muted-foreground" };
var _hoisted_17$1 = ["aria-label"];
var _hoisted_18 = { class: "flex flex-1 flex-col gap-3 pb-0" };
var _hoisted_19 = { class: "flex flex-row items-center justify-between" };
var _hoisted_20 = { class: "text-foreground font-inter text-sm/normal font-normal" };
var _hoisted_21 = { class: "flex flex-row items-center gap-1" };
var _hoisted_22 = { class: "font-inter text-sm/normal font-bold text-base-foreground tabular-nums" };
var _hoisted_23 = { class: "flex flex-row items-center justify-between" };
var _hoisted_24 = { class: "text-foreground text-sm font-normal" };
var _hoisted_25 = { class: "font-inter text-sm/normal font-bold text-base-foreground tabular-nums" };
var _hoisted_26 = { class: "flex flex-row items-center justify-between" };
var _hoisted_27 = { class: "text-foreground text-sm font-normal" };
var _hoisted_28 = { class: "flex flex-row items-center justify-between" };
var _hoisted_29 = { class: "text-foreground text-sm font-normal" };
var _hoisted_30 = { class: "flex flex-row items-center justify-between" };
var _hoisted_31 = { class: "text-foreground text-sm font-normal" };
var _hoisted_32 = {
	key: 0,
	class: "pi pi-check text-success-foreground text-xs"
};
var _hoisted_33 = {
	key: 1,
	class: "pi pi-times text-foreground text-xs"
};
var _hoisted_34 = { class: "flex flex-col gap-2" };
var _hoisted_35 = { class: "flex flex-row items-start justify-between" };
var _hoisted_36 = { class: "flex flex-col gap-2" };
var _hoisted_37 = { class: "text-foreground text-sm/relaxed font-normal" };
var _hoisted_38 = { class: "group flex flex-row items-center gap-2 pt-2" };
var _hoisted_39 = { class: "font-inter text-sm/normal font-bold text-base-foreground tabular-nums" };
var _hoisted_40 = { class: "flex flex-col p-6" };
var _hoisted_41 = { class: "flex flex-col gap-2" };
var _hoisted_42 = { class: "text-sm/normal text-base-foreground" };
var _hoisted_43 = {
	href: "https://cloud.comfy.org/?template=video_wan2_2_14B_i2v",
	target: "_blank",
	rel: "noopener noreferrer",
	class: "flex gap-1 text-sm text-azure-600 no-underline hover:text-azure-400"
};
var _hoisted_44 = { class: "underline" };
//#endregion
//#region src/platform/cloud/subscription/components/PricingTable.vue
var PricingTable_default = /* @__PURE__ */ defineComponent({
	__name: "PricingTable",
	props: { reason: {} },
	emits: ["chooseTeamWorkspace"],
	setup(__props, { emit: __emit }) {
		const getCheckoutTier = (tierKey, billingCycle) => billingCycle === "yearly" ? `${tierKey}-yearly` : tierKey;
		const getCheckoutAttributionForCloud = async () => {
			return {};
		};
		const emit = __emit;
		const { t, n } = useI18n();
		const billingCycleOptions = [{
			label: t("subscription.yearly"),
			value: "yearly"
		}, {
			label: t("subscription.monthly"),
			value: "monthly"
		}];
		const tiers = [
			{
				id: "STANDARD",
				key: "standard",
				name: t("subscription.tiers.standard.name"),
				pricing: TIER_PRICING.standard,
				maxDuration: t("subscription.maxDuration.standard"),
				customLoRAs: false,
				isPopular: false
			},
			{
				id: "CREATOR",
				key: "creator",
				name: t("subscription.tiers.creator.name"),
				pricing: TIER_PRICING.creator,
				maxDuration: t("subscription.maxDuration.creator"),
				customLoRAs: true,
				isPopular: true
			},
			{
				id: "PRO",
				key: "pro",
				name: t("subscription.tiers.pro.name"),
				pricing: TIER_PRICING.pro,
				maxDuration: t("subscription.maxDuration.pro"),
				customLoRAs: true,
				isPopular: false
			}
		];
		const { isActiveSubscription, isFreeTier, tier: subscriptionTier, subscription } = useBillingContext();
		const isYearlySubscription = computed(() => subscription.value?.duration === "ANNUAL");
		const telemetry = useTelemetry();
		const userId = computed(() => useUserStore().currentUserId);
		const { reportError } = useErrorHandling();
		const accessBillingPortal = async () => {
			console.warn("Billing portal not available - cloud auth removed");
		};
		const { wrapWithErrorHandlingAsync } = useErrorHandling();
		const isLoading = ref(false);
		const loadingTier = ref(null);
		const popover = ref();
		const currentBillingCycle = ref("yearly");
		const hasPaidSubscription = computed(() => isActiveSubscription.value && !isFreeTier.value);
		const currentTierKey = computed(() => subscriptionTier.value ? TIER_TO_KEY[subscriptionTier.value] : null);
		const currentPlanDescriptor = computed(() => {
			if (!currentTierKey.value) return null;
			return {
				tierKey: currentTierKey.value,
				billingCycle: isYearlySubscription.value ? "yearly" : "monthly"
			};
		});
		const isCurrentPlan = (tierKey) => {
			if (!currentTierKey.value) return false;
			const selectedIsYearly = currentBillingCycle.value === "yearly";
			return currentTierKey.value === tierKey && isYearlySubscription.value === selectedIsYearly;
		};
		const togglePopover = (event) => {
			popover.value.toggle(event);
		};
		const getButtonLabel = (tier) => {
			if (isCurrentPlan(tier.key)) return t("subscription.currentPlan");
			const planName = currentBillingCycle.value === "yearly" ? t("subscription.tierNameYearly", { name: tier.name }) : tier.name;
			return hasPaidSubscription.value ? t("subscription.changeTo", { plan: planName }) : t("subscription.subscribeTo", { plan: planName });
		};
		const getButtonSeverity = (tier) => {
			if (isCurrentPlan(tier.key)) return "secondary";
			if (tier.key === "creator") return "primary";
			return "secondary";
		};
		const getButtonTextClass = (tier) => tier.key === "creator" ? "font-inter text-sm font-bold leading-normal text-base-background" : "font-inter text-sm font-bold leading-normal text-primary-foreground";
		const getPrice = (tier) => tier.pricing[currentBillingCycle.value];
		const getAnnualTotal = (tier) => tier.pricing.yearly * 12;
		const getCreditsDisplay = (tier) => tier.pricing.credits * (currentBillingCycle.value === "yearly" ? 12 : 1);
		const handleSubscribe = wrapWithErrorHandlingAsync(async (tierKey) => {
			if (!isCloud || isLoading.value || isCurrentPlan(tierKey)) return;
			isLoading.value = true;
			loadingTier.value = tierKey;
			try {
				if (hasPaidSubscription.value) {
					const targetPlan = {
						tierKey,
						billingCycle: currentBillingCycle.value
					};
					const previousPlan = currentPlanDescriptor.value;
					const checkoutAttribution = await getCheckoutAttributionForCloud();
					const beginCheckoutMetadata = userId.value ? {
						user_id: userId.value,
						tier: targetPlan.tierKey,
						cycle: targetPlan.billingCycle,
						checkout_type: "change",
						...__props.reason ? { payment_intent_source: __props.reason } : {},
						...checkoutAttribution,
						...previousPlan ? { previous_tier: previousPlan.tierKey } : {}
					} : null;
					const checkoutTier = getCheckoutTier(targetPlan.tierKey, targetPlan.billingCycle);
					if (previousPlan && isPlanDowngrade({
						current: previousPlan,
						target: targetPlan
					})) {
						if (await accessBillingPortal() && beginCheckoutMetadata) telemetry?.trackBeginCheckout(beginCheckoutMetadata);
					} else {
						if (!await accessBillingPortal(checkoutTier)) return;
						const pendingAttempt = recordPendingSubscriptionCheckoutAttempt({
							tier: targetPlan.tierKey,
							cycle: targetPlan.billingCycle,
							checkout_type: "change",
							payment_intent_source: __props.reason,
							...previousPlan ? { previous_tier: previousPlan.tierKey } : {},
							...previousPlan ? { previous_cycle: previousPlan.billingCycle } : {}
						});
						if (beginCheckoutMetadata) telemetry?.trackBeginCheckout(withPendingCheckoutAttemptId(beginCheckoutMetadata, pendingAttempt));
					}
				} else await performSubscriptionCheckout(tierKey, currentBillingCycle.value, { paymentIntentSource: __props.reason });
			} finally {
				isLoading.value = false;
				loadingTier.value = null;
			}
		}, reportError);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				createBaseVNode("div", _hoisted_2$1, [createVNode(unref(script), {
					modelValue: currentBillingCycle.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => currentBillingCycle.value = $event),
					options: billingCycleOptions,
					"option-label": "label",
					"option-value": "value",
					"allow-empty": false,
					unstyled: "",
					pt: {
						root: { class: "flex gap-1 bg-secondary-background rounded-lg p-1.5" },
						pcToggleButton: {
							root: ({ context }) => ({ class: ["w-36  h-8 rounded-md transition-colors cursor-pointer border-none outline-none ring-0 text-sm font-medium flex items-center justify-center", context.active ? "bg-base-foreground text-base-background" : "bg-transparent text-muted-foreground hover:bg-secondary-background-hover"] }),
							label: { class: "flex items-center gap-2 " }
						}
					}
				}, {
					option: withCtx(({ option }) => [createBaseVNode("div", _hoisted_3$1, [createBaseVNode("span", null, toDisplayString(option.label), 1), option.value === "yearly" ? (openBlock(), createElementBlock("div", _hoisted_4$1, toDisplayString(unref(t)("subscription.saveYearly")), 1)) : createCommentVNode("", true)])]),
					_: 1
				}, 8, ["modelValue", "pt"])]),
				createBaseVNode("div", _hoisted_5$1, [(openBlock(), createElementBlock(Fragment, null, renderList(tiers, (tier) => {
					return createBaseVNode("div", {
						key: tier.id,
						class: normalizeClass(unref(cn)("flex flex-1 flex-col rounded-2xl border border-border-default bg-base-background shadow-[0_0_12px_rgba(0,0,0,0.1)]", tier.isPopular ? "border-muted-foreground" : ""))
					}, [createBaseVNode("div", _hoisted_6$1, [
						createBaseVNode("div", _hoisted_7$1, [createBaseVNode("span", _hoisted_8$1, toDisplayString(tier.name), 1), tier.isPopular ? (openBlock(), createElementBlock("div", _hoisted_9$1, toDisplayString(unref(t)("subscription.mostPopular")), 1)) : createCommentVNode("", true)]),
						createBaseVNode("div", _hoisted_10$1, [createBaseVNode("div", _hoisted_11$1, [createBaseVNode("div", _hoisted_12$1, [createBaseVNode("span", _hoisted_13$1, [createTextVNode(" $" + toDisplayString(getPrice(tier)) + " ", 1), withDirectives(createBaseVNode("span", { class: "text-2xl text-muted-foreground line-through" }, " $" + toDisplayString(tier.pricing.monthly), 513), [[vShow, currentBillingCycle.value === "yearly"]])]), createBaseVNode("span", _hoisted_14$1, toDisplayString(unref(t)("subscription.usdPerMonth")), 1)]), createBaseVNode("div", _hoisted_15$1, [createBaseVNode("span", _hoisted_16$1, toDisplayString(currentBillingCycle.value === "yearly" ? unref(t)("subscription.billedYearly", { total: `$${getAnnualTotal(tier)}` }) : unref(t)("subscription.billedMonthly")), 1)])])]),
						createBaseVNode("p", {
							role: "note",
							"aria-label": unref(t)("subscription.soloUseOnly"),
							class: "m-0 flex h-10 items-center rounded-lg bg-muted-foreground/30 px-3 text-sm text-muted-foreground"
						}, [
							createTextVNode(toDisplayString(unref(t)("subscription.soloUseOnly")) + " ", 1),
							_cache[2] || (_cache[2] = createBaseVNode("span", { class: "mx-1 text-muted-foreground" }, "–", -1)),
							createBaseVNode("button", {
								class: "text-primary-foreground cursor-pointer border-none bg-transparent p-0 text-sm font-medium underline hover:text-base-foreground focus-visible:ring-1 focus-visible:outline-none",
								onClick: _cache[1] || (_cache[1] = ($event) => emit("chooseTeamWorkspace"))
							}, toDisplayString(unref(t)("subscription.needTeamWorkspace")), 1)
						], 8, _hoisted_17$1),
						createBaseVNode("div", _hoisted_18, [
							createBaseVNode("div", _hoisted_19, [createBaseVNode("span", _hoisted_20, toDisplayString(currentBillingCycle.value === "yearly" ? unref(t)("subscription.yearlyCreditsLabel") : unref(t)("subscription.monthlyCreditsLabel")), 1), createBaseVNode("div", _hoisted_21, [_cache[3] || (_cache[3] = createBaseVNode("i", {
								class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400",
								"aria-hidden": "true"
							}, null, -1)), createBaseVNode("span", _hoisted_22, toDisplayString(unref(n)(getCreditsDisplay(tier))), 1)])]),
							createBaseVNode("div", _hoisted_23, [createBaseVNode("span", _hoisted_24, toDisplayString(unref(t)("subscription.maxDurationLabel")), 1), createBaseVNode("span", _hoisted_25, toDisplayString(tier.maxDuration), 1)]),
							createBaseVNode("div", _hoisted_26, [createBaseVNode("span", _hoisted_27, toDisplayString(unref(t)("subscription.gpuLabel")), 1), _cache[4] || (_cache[4] = createBaseVNode("i", { class: "pi pi-check text-success-foreground text-xs" }, null, -1))]),
							createBaseVNode("div", _hoisted_28, [createBaseVNode("span", _hoisted_29, toDisplayString(unref(t)("subscription.addCreditsLabel")), 1), _cache[5] || (_cache[5] = createBaseVNode("i", { class: "pi pi-check text-success-foreground text-xs" }, null, -1))]),
							createBaseVNode("div", _hoisted_30, [createBaseVNode("span", _hoisted_31, toDisplayString(unref(t)("subscription.customLoRAsLabel")), 1), tier.customLoRAs ? (openBlock(), createElementBlock("i", _hoisted_32)) : (openBlock(), createElementBlock("i", _hoisted_33))]),
							createBaseVNode("div", _hoisted_34, [createBaseVNode("div", _hoisted_35, [createBaseVNode("div", _hoisted_36, [createBaseVNode("span", _hoisted_37, toDisplayString(unref(t)("subscription.videoEstimateLabel")), 1), createBaseVNode("div", _hoisted_38, [_cache[6] || (_cache[6] = createBaseVNode("i", { class: "pi pi-question-circle text-xs text-muted-foreground group-hover:text-base-foreground" }, null, -1)), createBaseVNode("span", {
								class: "cursor-pointer text-sm font-normal text-muted-foreground group-hover:text-base-foreground",
								onClick: togglePopover
							}, toDisplayString(unref(t)("subscription.videoEstimateHelp")), 1)])]), createBaseVNode("span", _hoisted_39, " ~" + toDisplayString(unref(n)(tier.pricing.videoEstimate)), 1)])])
						])
					]), createBaseVNode("div", _hoisted_40, [createVNode(Button_default, {
						variant: getButtonSeverity(tier),
						disabled: isLoading.value || isCurrentPlan(tier.key),
						loading: loadingTier.value === tier.key,
						class: normalizeClass(unref(cn)("h-10 w-full", getButtonTextClass(tier), tier.key === "creator" ? "border-transparent bg-base-foreground hover:bg-inverted-background-hover" : "border-transparent bg-secondary-background hover:bg-secondary-background-hover focus:bg-secondary-background-selected")),
						onClick: () => unref(handleSubscribe)(tier.key)
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(getButtonLabel(tier)), 1)]),
						_: 2
					}, 1032, [
						"variant",
						"disabled",
						"loading",
						"class",
						"onClick"
					])])], 2);
				}), 64))]),
				createVNode(unref(script$1), {
					ref_key: "popover",
					ref: popover,
					"append-to": "body",
					"auto-z-index": true,
					"base-z-index": 1e3,
					dismissable: true,
					"close-on-escape": true,
					unstyled: "",
					pt: { root: { class: "rounded-lg border border-interface-stroke bg-interface-panel-surface shadow-lg p-4 max-w-xs" } }
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_41, [createBaseVNode("p", _hoisted_42, toDisplayString(unref(t)("subscription.videoEstimateExplanation")), 1), createBaseVNode("a", _hoisted_43, [createBaseVNode("span", _hoisted_44, toDisplayString(unref(t)("subscription.videoEstimateTryTemplate")), 1), _cache[7] || (_cache[7] = createBaseVNode("span", {
						class: "no-underline",
						innerHTML: "→"
					}, null, -1))])])]),
					_: 1
				}, 512)
			]);
		};
	}
});
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionRequiredDialogContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "relative flex h-full flex-col gap-6 overflow-y-auto p-4 pt-8 md:px-16 md:py-8"
};
var _hoisted_2 = { class: "flex flex-col items-center gap-3" };
var _hoisted_3 = { class: "text-muted-foreground" };
var _hoisted_4 = { class: "flex flex-col items-center gap-2" };
var _hoisted_5 = { class: "m-0 text-sm text-text-secondary" };
var _hoisted_6 = { class: "flex items-center gap-1.5" };
var _hoisted_7 = { class: "text-sm text-text-secondary" };
var _hoisted_8 = {
	key: 1,
	class: "legacy-dialog relative grid h-full grid-cols-5"
};
var _hoisted_9 = { class: "col-span-3 flex flex-col justify-between p-8" };
var _hoisted_10 = { class: "flex flex-col gap-6" };
var _hoisted_11 = { class: "inline-flex items-center gap-2" };
var _hoisted_12 = { class: "text-sm text-text-primary" };
var _hoisted_13 = {
	key: 0,
	class: "m-0 text-sm text-text-secondary"
};
var _hoisted_14 = { class: "flex items-baseline gap-2" };
var _hoisted_15 = { class: "text-4xl font-bold" };
var _hoisted_16 = { class: "text-xl" };
var _hoisted_17 = { class: "flex flex-col pt-8" };
//#endregion
//#region src/platform/cloud/subscription/components/SubscriptionRequiredDialogContent.vue
var SubscriptionRequiredDialogContent_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SubscriptionRequiredDialogContent",
	props: {
		onClose: { type: Function },
		reason: {},
		onChooseTeam: { type: Function }
	},
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { isActiveSubscription } = useBillingContext();
		const isSubscriptionEnabled = () => Boolean(isCloud && window.__CONFIG__?.subscription_required);
		const formattedMonthlyPrice = new Intl.NumberFormat(navigator.language || "en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(20);
		const commandStore = useCommandStore();
		const telemetry = useTelemetry();
		const showCustomPricingTable = computed(() => isSubscriptionEnabled());
		watch(() => isActiveSubscription.value, (isActive) => {
			if (isActive && showCustomPricingTable.value) emit("close", true);
		});
		const handleSubscribed = () => {
			emit("close", true);
		};
		const handleChooseTeam = () => {
			if (__props.onChooseTeam) __props.onChooseTeam();
			else __props.onClose();
		};
		const handleClose = () => {
			__props.onClose();
		};
		const handleContactUs = async () => {
			telemetry?.trackHelpResourceClicked({
				resource_type: "help_feedback",
				is_external: true,
				source: "subscription"
			});
			await commandStore.execute("Comfy.ContactSupport");
		};
		const handleViewEnterprise = () => {
			telemetry?.trackHelpResourceClicked({
				resource_type: "docs",
				is_external: true,
				source: "subscription"
			});
			window.open("https://www.comfy.org/cloud/enterprise", "_blank");
		};
		return (_ctx, _cache) => {
			const _component_i18n_t = resolveComponent("i18n-t");
			return showCustomPricingTable.value ? (openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(Button_default, {
					size: "icon",
					variant: "muted-textonly",
					class: "absolute top-2.5 right-2.5 shrink-0 rounded-full text-text-secondary hover:bg-white/10",
					"aria-label": _ctx.$t("g.close"),
					onClick: handleClose
				}, {
					default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", {
						class: "pi pi-times text-xl",
						"aria-hidden": "true"
					}, null, -1)])]),
					_: 1
				}, 8, ["aria-label"]),
				createBaseVNode("div", _hoisted_2, [_cache[1] || (_cache[1] = createBaseVNode("div", {
					class: "flex size-10 items-center justify-center rounded-xl bg-muted-foreground/30 text-lg font-semibold text-white",
					"aria-hidden": "true"
				}, " P ", -1)), createVNode(_component_i18n_t, {
					keypath: "subscription.plansForWorkspace",
					tag: "h2",
					class: "m-0 font-inter text-2xl font-semibold text-base-foreground"
				}, {
					workspace: withCtx(() => [createBaseVNode("span", _hoisted_3, toDisplayString(_ctx.$t("subscription.personalWorkspace")), 1)]),
					_: 1
				})]),
				createVNode(PricingTable_default, {
					reason: __props.reason,
					class: "flex-1",
					onChooseTeamWorkspace: handleChooseTeam
				}, null, 8, ["reason"]),
				createBaseVNode("div", _hoisted_4, [createBaseVNode("p", _hoisted_5, toDisplayString(_ctx.$t("subscription.haveQuestions")), 1), createBaseVNode("div", _hoisted_6, [
					createVNode(Button_default, {
						variant: "muted-textonly",
						class: "h-6 p-1 text-sm text-text-secondary hover:text-base-foreground",
						onClick: handleContactUs
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.contactUs")) + " ", 1), _cache[2] || (_cache[2] = createBaseVNode("i", { class: "pi pi-comments" }, null, -1))]),
						_: 1
					}),
					createBaseVNode("span", _hoisted_7, toDisplayString(_ctx.$t("g.or")), 1),
					createVNode(Button_default, {
						variant: "muted-textonly",
						class: "h-6 p-1 text-sm text-text-secondary hover:text-base-foreground",
						onClick: handleViewEnterprise
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.viewEnterprise")) + " ", 1), _cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-external-link" }, null, -1))]),
						_: 1
					})
				])])
			])) : (openBlock(), createElementBlock("div", _hoisted_8, [
				createVNode(Button_default, {
					size: "icon",
					variant: "muted-textonly",
					class: "absolute top-2.5 right-2.5 z-10 size-8 rounded-full p-0 text-white hover:bg-white/20",
					"aria-label": _ctx.$t("g.close"),
					onClick: handleClose
				}, {
					default: withCtx(() => [..._cache[4] || (_cache[4] = [createBaseVNode("i", {
						class: "pi pi-times",
						"aria-hidden": "true"
					}, null, -1)])]),
					_: 1
				}, 8, ["aria-label"]),
				_cache[5] || (_cache[5] = createBaseVNode("div", { class: "relative col-span-2 flex items-center justify-center overflow-hidden rounded-sm" }, [createBaseVNode("video", {
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
				createBaseVNode("div", _hoisted_9, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_10, [
					createBaseVNode("div", _hoisted_11, [createBaseVNode("div", _hoisted_12, toDisplayString(__props.reason === "out_of_credits" ? _ctx.$t("credits.topUp.insufficientTitle") : _ctx.$t("subscription.required.title")), 1), createVNode(CloudBadge_default, {
						"reverse-order": "",
						"no-padding": "",
						"background-color": "var(--p-dialog-background)",
						"use-subscription": ""
					})]),
					__props.reason === "out_of_credits" ? (openBlock(), createElementBlock("p", _hoisted_13, toDisplayString(_ctx.$t("credits.topUp.insufficientMessage")), 1)) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_14, [createBaseVNode("span", _hoisted_15, toDisplayString(unref(formattedMonthlyPrice)), 1), createBaseVNode("span", _hoisted_16, toDisplayString(_ctx.$t("subscription.perMonth")), 1)])
				]), createVNode(SubscriptionBenefits_default, { class: "mt-6 text-muted" })]), createBaseVNode("div", _hoisted_17, [createVNode(SubscribeButton_default, {
					class: "rounded-lg px-4 py-2",
					pt: {
						root: { style: "background: var(--color-accent-blue, #0B8CE9);" },
						label: { class: "font-inter font-[700] text-sm" }
					},
					onSubscribed: handleSubscribed
				})])])
			]));
		};
	}
}), [["__scopeId", "data-v-a55b1730"]]);
//#endregion
export { SubscriptionRequiredDialogContent_default as default };

//# sourceMappingURL=SubscriptionRequiredDialogContent-DUkie5kZ.js.map