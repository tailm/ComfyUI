const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./SubscriptionPanelContentWorkspace-Cd_XqoU7.js","./SubscriptionPanelContentWorkspace-BV6i5a0T.js","./_plugin-vue_export-helper-BKp_-DiS.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-Di5q1E0M.js","./vendor-vue-core-ywZ1En3W.js","./promotionUtils-BlyjkT7V.js","./vendor-other-DslE47pR.js","./vendor-three-JCi_5yX-.js","./vendor-tiptap-BOgG_8hl.js","./vendor-reka-ui-BL45aHvm.js","./vendor-i18n-BitfRK9w.js","./vendor-sentry-BeVhjky-.js","./vendor-vueuse-D8rwdKM0.js","./vendor-axios-BWFjRHOY.js","./vendor-markdown-dKTpR1HU.js","./vendor-yjs-Cmf7NGGj.js","./vendor-zod-BwmrqdWK.js","./api-DtOML0NT.js","./types-4cVPtFn2.js","./toastStore-Dafwoqcw.js","./devFeatureFlagOverride-C_h7DxV8.js","./formatUtil-NyC-AHAf.js","./src-CAuVu1U5.js","./downloadUtil-Cl0cF0EY.js","./i18n-DzSsN4Ea.js","./commands-CXXLFVIe.js","./main-BSJkLqvQ.js","./nodeDefs-DNc3psLh.js","./settings-CXXL4Tkc.js","./WaveAudioPlayer-Q5zYiDcc.js","./Button-BOAvjEOG.js","./Slider-DrBXpOpg.js","./DialogHeader-D4JcQCFk.js","./dialogStore-B5tjby6O.js","./Loader-Pq650Xlb.js","./Popover-D6A0rMur.js","./useModalLiftedZIndex-DKRRcl_q.js","./ColorPicker-BdrSTTzc.js","./SelectValue-CrSaS-Kt.js","./TagsInputItemText-CszoEoLz.js","./extensionStore-CveIbRwz.js","./teamWorkspaceStore-CsZZpFU0.js","./remoteConfig-0E2rLe-N.js","./userStore-DHnsYsi1.js","./useImageQuiet-BNuH5iCW.js","./VideoPlayOverlay-K_gXsBIz.js","./useFeatureUsageTracker-B-33shAP.js","./telemetry-CLr022VN.js","./widgetTypes-DKb0MXCf.js","./envUtil-pF8O5Ge5.js","./markdownRendererUtil-0yaajO2y.js","./tierBenefits-BQwHBif6.js","./useExternalLink-BniNQVDC.js","./topupTracker-BHv_2BbS.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css","./SubscriptionPanelContentWorkspace-y1DHY7tg.css"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { Q as __vitePreload } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, B as defineAsyncComponent, Bt as unref, Gt as toDisplayString, M as createBlock, N as createCommentVNode, Ot as onScopeDispose, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, gt as watch, j as createBaseVNode, jt as ref, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Ai as useSubscriptionDialog, Di as useErrorHandling, Ii as TIER_TO_KEY, Ni as useBillingRouting, Oi as useBillingContext, Pi as DEFAULT_TIER_KEY, pi as useDialogService, zi as getTierPrice } from "./promotionUtils-BlyjkT7V.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { s as t } from "./i18n-DzSsN4Ea.js";
import { c as defaultWindow, ot as useTimeoutFn, q as createSharedComposable, s as defaultDocument, x as useEventListener } from "./vendor-vueuse-D8rwdKM0.js";
import { l as useFeatureFlags } from "./teamWorkspaceStore-CsZZpFU0.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useUserStore } from "./userStore-DHnsYsi1.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BKp_-DiS.js";
import { c as recordPendingSubscriptionCheckoutAttempt, i as consumePendingSubscriptionCheckoutSuccess, o as hasPendingSubscriptionCheckoutAttempt, r as clearPendingSubscriptionCheckoutAttempt, t as PENDING_SUBSCRIPTION_CHECKOUT_EVENT, u as CloudBadge_default } from "./subscriptionCheckoutTracker-Bp3RZZCh.js";
import { i as useSubscriptionActions, n as CreditsTile_default, r as SubscriptionFooterLinks_default, t as getCommonTierBenefits } from "./tierBenefits-BQwHBif6.js";
import { t as SubscribeButton_default } from "./SubscribeButton-Bb5gRUUv.js";
import { n as getComfyPlatformBaseUrl, t as getComfyApiBaseUrl } from "./comfyApi-CqCmjmal.js";
//#region src/platform/cloud/subscription/composables/useSubscriptionCancellationWatcher.ts
var MAX_CANCELLATION_ATTEMPTS = 4;
var CANCELLATION_BASE_DELAY_MS = 5e3;
var CANCELLATION_BACKOFF_MULTIPLIER = 3;
function useSubscriptionCancellationWatcher({ fetchStatus, isActiveSubscription, subscriptionStatus, telemetry, shouldWatchCancellation }) {
	const watcherActive = ref(false);
	const cancellationAttempts = ref(0);
	const cancellationTracked = ref(false);
	const cancellationCheckInFlight = ref(false);
	const nextDelay = ref(CANCELLATION_BASE_DELAY_MS);
	let detachFocusListener = null;
	const { start: startTimer, stop: stopTimer } = useTimeoutFn(() => {
		checkForCancellation();
	}, nextDelay, { immediate: false });
	const stopCancellationWatcher = () => {
		watcherActive.value = false;
		stopTimer();
		cancellationAttempts.value = 0;
		cancellationCheckInFlight.value = false;
		if (detachFocusListener) {
			detachFocusListener();
			detachFocusListener = null;
		}
	};
	const scheduleNextCancellationCheck = () => {
		if (!watcherActive.value) return;
		if (cancellationAttempts.value >= MAX_CANCELLATION_ATTEMPTS) {
			stopCancellationWatcher();
			return;
		}
		nextDelay.value = CANCELLATION_BASE_DELAY_MS * CANCELLATION_BACKOFF_MULTIPLIER ** cancellationAttempts.value;
		cancellationAttempts.value += 1;
		startTimer();
	};
	const checkForCancellation = async (triggeredFromFocus = false) => {
		if (!watcherActive.value || cancellationCheckInFlight.value) return;
		cancellationCheckInFlight.value = true;
		try {
			await fetchStatus();
			if (!isActiveSubscription.value) {
				if (!cancellationTracked.value) {
					cancellationTracked.value = true;
					try {
						telemetry?.trackMonthlySubscriptionCancelled();
					} catch (telemetryError) {
						console.error("[Subscription] Failed to track cancellation telemetry:", telemetryError);
					}
				}
				stopCancellationWatcher();
				return;
			}
			if (!triggeredFromFocus) scheduleNextCancellationCheck();
		} catch (error) {
			console.error("[Subscription] Error checking cancellation status:", error);
			scheduleNextCancellationCheck();
		} finally {
			cancellationCheckInFlight.value = false;
		}
	};
	const startCancellationWatcher = () => {
		if (!shouldWatchCancellation() || !subscriptionStatus.value?.is_active) return;
		stopCancellationWatcher();
		watcherActive.value = true;
		cancellationTracked.value = false;
		cancellationAttempts.value = 0;
		if (!detachFocusListener && defaultWindow) detachFocusListener = useEventListener(defaultWindow, "focus", () => {
			if (!watcherActive.value) return;
			checkForCancellation(true);
		});
		scheduleNextCancellationCheck();
	};
	onScopeDispose(() => {
		stopCancellationWatcher();
	});
	return {
		startCancellationWatcher,
		stopCancellationWatcher
	};
}
//#endregion
//#region src/platform/cloud/subscription/composables/useSubscription.ts
var PENDING_SUBSCRIPTION_CHECKOUT_RETRY_DELAYS_MS = [
	3e3,
	1e4,
	3e4
];
function useSubscriptionInternal() {
	const subscriptionStatus = ref(null);
	const telemetry = useTelemetry();
	const isInitialized = ref(false);
	const userStore = useUserStore();
	const isSubscribedOrIsNotCloud = computed(() => {
		if (!isCloud || !window.__CONFIG__?.subscription_required) return true;
		return subscriptionStatus.value?.is_active ?? false;
	});
	const { showSubscriptionRequiredDialog } = useDialogService();
	const { flags } = useFeatureFlags();
	const { wrapWithErrorHandlingAsync, reportError } = useErrorHandling();
	const isLoggedIn = computed(() => !!userStore.currentUserId);
	const isCancelled = computed(() => {
		return !!subscriptionStatus.value?.end_date;
	});
	const formattedRenewalDate = computed(() => {
		if (!subscriptionStatus.value?.renewal_date) return "";
		return new Date(subscriptionStatus.value.renewal_date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	});
	const formattedEndDate = computed(() => {
		if (!subscriptionStatus.value?.end_date) return "";
		return new Date(subscriptionStatus.value.end_date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	});
	const subscriptionTier = computed(() => subscriptionStatus.value?.subscription_tier ?? null);
	const isFreeTier = computed(() => subscriptionTier.value === "FREE");
	const subscriptionDuration = computed(() => subscriptionStatus.value?.subscription_duration ?? null);
	const isYearlySubscription = computed(() => subscriptionDuration.value === "ANNUAL");
	const subscriptionTierName = computed(() => {
		const tier = subscriptionTier.value;
		if (!tier) return "";
		const baseName = t(`subscription.tiers.${TIER_TO_KEY[tier] ?? "standard"}.name`);
		return isYearlySubscription.value ? t("subscription.tierNameYearly", { name: baseName }) : baseName;
	});
	function buildApiUrl(path) {
		return `${getComfyApiBaseUrl()}${path}`;
	}
	const getCheckoutAttributionForCloud = async () => {
		return {};
	};
	let pendingCheckoutRecoveryTimeout = null;
	let pendingCheckoutRecoveryAttempt = 0;
	let isRecoveringPendingCheckout = false;
	const stopPendingCheckoutRecovery = () => {
		if (pendingCheckoutRecoveryTimeout !== null && defaultWindow) defaultWindow.clearTimeout(pendingCheckoutRecoveryTimeout);
		pendingCheckoutRecoveryTimeout = null;
		pendingCheckoutRecoveryAttempt = 0;
	};
	const schedulePendingCheckoutRecovery = () => {
		if (!defaultWindow || pendingCheckoutRecoveryTimeout !== null || !isLoggedIn.value || !hasPendingSubscriptionCheckoutAttempt()) return;
		const nextDelay = PENDING_SUBSCRIPTION_CHECKOUT_RETRY_DELAYS_MS[pendingCheckoutRecoveryAttempt];
		if (nextDelay === void 0) return;
		pendingCheckoutRecoveryTimeout = defaultWindow.setTimeout(() => {
			pendingCheckoutRecoveryTimeout = null;
			pendingCheckoutRecoveryAttempt += 1;
			recoverPendingSubscriptionCheckout("retry");
		}, nextDelay);
	};
	const syncPendingSubscriptionSuccess = (statusData) => {
		const metadata = consumePendingSubscriptionCheckoutSuccess(statusData);
		if (!metadata) {
			if (hasPendingSubscriptionCheckoutAttempt()) schedulePendingCheckoutRecovery();
			else stopPendingCheckoutRecovery();
			return;
		}
		telemetry?.trackMonthlySubscriptionSucceeded({
			...userStore.currentUserId ? { user_id: userStore.currentUserId } : {},
			...metadata
		});
		stopPendingCheckoutRecovery();
	};
	const buildAuthHeaders = async () => {
		return { "Content-Type": "application/json" };
	};
	const fetchStatus = wrapWithErrorHandlingAsync(fetchSubscriptionStatus, reportError);
	const subscribe = wrapWithErrorHandlingAsync(async () => {
		const response = await initiateSubscriptionCheckout();
		if (!response.checkout_url) throw new Error(t("toastMessages.failedToInitiateSubscription", { error: "No checkout URL returned" }));
		if (!window.open(response.checkout_url, "_blank")) return;
		recordPendingSubscriptionCheckoutAttempt({
			tier: "standard",
			cycle: "monthly",
			checkout_type: isSubscribedOrIsNotCloud.value ? "change" : "new",
			...subscriptionTier.value ? { previous_tier: TIER_TO_KEY[subscriptionTier.value] } : {},
			...subscriptionDuration.value === "ANNUAL" ? { previous_cycle: "yearly" } : subscriptionDuration.value === "MONTHLY" ? { previous_cycle: "monthly" } : {}
		});
	}, reportError);
	const showSubscriptionDialog = (options) => {
		showSubscriptionRequiredDialog(options);
	};
	/**
	* Whether cloud subscription mode is enabled (cloud distribution with subscription_required config).
	* Use to determine which UI to show (SubscriptionPanel vs CreditsPanel).
	*/
	const isSubscriptionEnabled = () => Boolean(isCloud && window.__CONFIG__?.subscription_required);
	const { startCancellationWatcher, stopCancellationWatcher } = useSubscriptionCancellationWatcher({
		fetchStatus,
		isActiveSubscription: isSubscribedOrIsNotCloud,
		subscriptionStatus,
		telemetry,
		shouldWatchCancellation: isSubscriptionEnabled
	});
	const manageSubscription = async () => {
		console.warn("Billing portal not available - cloud auth removed");
	};
	const requireActiveSubscription = async () => {
		await fetchSubscriptionStatus();
		if (!isSubscribedOrIsNotCloud.value) showSubscriptionDialog({ reason: "subscription_required" });
	};
	const handleViewUsageHistory = () => {
		window.open(`${getComfyPlatformBaseUrl()}/profile/usage`, "_blank");
	};
	const handleLearnMore = () => {
		window.open("https://docs.comfy.org", "_blank");
	};
	const handleInvoiceHistory = async () => {
		console.warn("Invoice history not available - cloud auth removed");
	};
	const recoverPendingSubscriptionCheckout = async (source) => {
		if (!isCloud || !isLoggedIn.value || !hasPendingSubscriptionCheckoutAttempt() || isRecoveringPendingCheckout) return;
		isRecoveringPendingCheckout = true;
		try {
			await fetchSubscriptionStatus();
		} catch (error) {
			console.error(`[Subscription] Failed to recover pending checkout on ${source}:`, error);
			schedulePendingCheckoutRecovery();
		} finally {
			isRecoveringPendingCheckout = false;
		}
	};
	/**
	* Fetch the current cloud subscription status for the authenticated user
	* @returns Subscription status or null if no subscription exists
	*/
	async function fetchSubscriptionStatus() {
		const headers = await buildAuthHeaders();
		const response = await fetch(buildApiUrl("/customers/cloud-subscription-status"), { headers });
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(t("toastMessages.failedToFetchSubscription", { error: errorData.message }));
		}
		const statusData = await response.json();
		subscriptionStatus.value = statusData;
		syncPendingSubscriptionSuccess(statusData);
		return statusData;
	}
	const handlePendingSubscriptionCheckoutChange = () => {
		if (!hasPendingSubscriptionCheckoutAttempt()) {
			stopPendingCheckoutRecovery();
			return;
		}
		stopPendingCheckoutRecovery();
		recoverPendingSubscriptionCheckout("retry");
	};
	useEventListener(defaultWindow, PENDING_SUBSCRIPTION_CHECKOUT_EVENT, () => {
		handlePendingSubscriptionCheckoutChange();
	});
	useEventListener(defaultWindow, "storage", (event) => {
		if (event.key === "comfy.subscription.pending_checkout_attempt") handlePendingSubscriptionCheckoutChange();
	});
	useEventListener(defaultWindow, "pageshow", () => {
		recoverPendingSubscriptionCheckout("pageshow");
	});
	useEventListener(defaultDocument, "visibilitychange", () => {
		if (defaultDocument?.visibilityState === "visible") recoverPendingSubscriptionCheckout("visibilitychange");
	});
	watch(() => isLoggedIn.value, async (loggedIn) => {
		if (loggedIn && isCloud) try {
			if (hasPendingSubscriptionCheckoutAttempt()) await recoverPendingSubscriptionCheckout("bootstrap");
			else await fetchSubscriptionStatus();
		} catch (error) {
			console.error("Failed to fetch subscription status:", error);
		} finally {
			isInitialized.value = true;
		}
		else {
			subscriptionStatus.value = null;
			clearPendingSubscriptionCheckoutAttempt();
			stopPendingCheckoutRecovery();
			stopCancellationWatcher();
			isInitialized.value = true;
		}
	}, { immediate: true });
	const initiateSubscriptionCheckout = async () => {
		const headers = await buildAuthHeaders();
		const checkoutAttribution = await getCheckoutAttributionForCloud();
		const response = await fetch(buildApiUrl("/customers/cloud-subscription-checkout"), {
			method: "POST",
			headers,
			body: JSON.stringify(checkoutAttribution)
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(t("toastMessages.failedToInitiateSubscription", { error: errorData.message }));
		}
		return response.json();
	};
	return {
		isActiveSubscription: isSubscribedOrIsNotCloud,
		isInitialized,
		isCancelled,
		formattedRenewalDate,
		formattedEndDate,
		subscriptionTier,
		isFreeTier,
		subscriptionDuration,
		isYearlySubscription,
		subscriptionTierName,
		subscriptionStatus,
		isSubscriptionEnabled,
		subscribe,
		fetchStatus,
		showSubscriptionDialog,
		manageSubscription,
		requireActiveSubscription,
		handleViewUsageHistory,
		handleLearnMore,
		handleInvoiceHistory
	};
}
var useSubscription = createSharedComposable(useSubscriptionInternal);
//#endregion
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
		const authActions = { accessBillingPortal: async () => {
			console.warn("Billing portal not available - cloud auth removed");
		} };
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
}), [["__scopeId", "data-v-a38a8d04"]]);
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
		const SubscriptionPanelContentWorkspace = defineAsyncComponent(() => __vitePreload(() => import("./SubscriptionPanelContentWorkspace-Cd_XqoU7.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]), import.meta.url));
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

//# sourceMappingURL=SubscriptionPanel-DTkPRCKJ.js.map