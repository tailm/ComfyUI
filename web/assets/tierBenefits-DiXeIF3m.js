import "./rolldown-runtime-w0pxe0c8.js";
import { Z as script } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, Rt as toValue, T as Fragment, V as defineComponent, Wt as normalizeStyle, bt as withCtx, ct as resolveDirective, et as onMounted, j as createBaseVNode, jt as ref, rt as openBlock, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Ai as useSubscriptionDialog, Di as useErrorHandling, Ii as TIER_TO_KEY, Li as getTierCredits, Oi as useBillingContext, Pi as DEFAULT_TIER_KEY, Ri as getTierFeatures, ct as centsToCredits, hi as useCommandStore, ji as useWorkspaceUI, lt as formatCredits, pi as useDialogService, ut as formatCreditsFromCents } from "./promotionUtils-bxMXJ_BT.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { x as useEventListener } from "./vendor-vueuse-D8rwdKM0.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as useExternalLink } from "./useExternalLink-4pHXseP4.js";
import { r as consumePendingTopup } from "./topupTracker-DjokaHr0.js";
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
var _hoisted_1$1 = { class: "flex items-center justify-between border-t border-interface-stroke pt-3" };
var _hoisted_2$1 = { class: "flex gap-2" };
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
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [
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
//#region src/platform/cloud/subscription/composables/useSubscriptionCredits.ts
/**
* Composable for handling subscription credit calculations and formatting.
*
* Uses useBillingContext which automatically selects the correct billing source:
* - If team workspaces feature is disabled: uses legacy (/customers)
* - If team workspaces feature is enabled:
*   - Personal workspace: uses legacy (/customers)
*   - Team workspace: uses workspace (/billing)
*/
/**
* Formats a cent value to display credits.
* Backend returns cents despite the *_micros naming convention.
*/
function formatBalance(maybeCents, locale) {
	return formatCreditsFromCents({
		cents: maybeCents ?? 0,
		locale,
		numberOptions: {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}
	});
}
function useSubscriptionCredits() {
	const billingContext = useBillingContext();
	const { locale } = useI18n();
	const totalCredits = computed(() => {
		return formatBalance(toValue(billingContext.balance)?.amountMicros, locale.value);
	});
	const monthlyBonusCredits = computed(() => {
		return formatBalance(toValue(billingContext.balance)?.cloudCreditBalanceMicros, locale.value);
	});
	const prepaidCredits = computed(() => {
		return formatBalance(toValue(billingContext.balance)?.prepaidBalanceMicros, locale.value);
	});
	const isLoadingBalance = computed(() => toValue(billingContext.isLoading));
	const creditsFromMicros = (maybeCents) => centsToCredits(maybeCents ?? 0);
	return {
		totalCredits,
		monthlyBonusCredits,
		prepaidCredits,
		monthlyBonusCreditsValue: computed(() => creditsFromMicros(toValue(billingContext.balance)?.cloudCreditBalanceMicros)),
		prepaidCreditsValue: computed(() => creditsFromMicros(toValue(billingContext.balance)?.prepaidBalanceMicros)),
		isLoadingBalance
	};
}
//#endregion
//#region src/platform/cloud/subscription/utils/creditsProgress.ts
/**
* Computes monthly credit usage for the credits bar. The bar fills with the
* consumed portion of the monthly allowance; `used` clamps at zero so a balance
* that exceeds the nominal allowance (rolled-over credits) reads as nothing used.
*/
function computeMonthlyUsage(monthlyRemaining, monthlyTotal) {
	if (monthlyTotal <= 0) return {
		used: 0,
		usedFraction: 0
	};
	const used = Math.min(monthlyTotal, Math.max(0, monthlyTotal - monthlyRemaining));
	return {
		used,
		usedFraction: Math.min(1, used / monthlyTotal)
	};
}
//#endregion
//#region src/platform/cloud/subscription/components/CreditsTile.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "@container relative flex flex-col gap-6 rounded-2xl border border-interface-stroke bg-modal-panel-background px-6 py-5" };
var _hoisted_2 = { class: "flex flex-col gap-1" };
var _hoisted_3 = { class: "text-sm text-muted" };
var _hoisted_4 = {
	key: 1,
	class: "flex items-baseline gap-2"
};
var _hoisted_5 = { class: "text-2xl leading-none font-bold" };
var _hoisted_6 = { class: "text-sm text-muted @max-[300px]:hidden" };
var _hoisted_7 = {
	key: 0,
	class: "flex items-start gap-2 rounded-lg bg-base-background p-3 text-sm"
};
var _hoisted_8 = { class: "flex flex-col gap-1" };
var _hoisted_9 = { class: "text-base-foreground" };
var _hoisted_10 = { class: "text-muted" };
var _hoisted_11 = { class: "flex items-center justify-between text-sm" };
var _hoisted_12 = { class: "text-text-primary" };
var _hoisted_13 = { class: "text-muted" };
var _hoisted_14 = [
	"aria-valuenow",
	"aria-valuemax",
	"aria-valuetext"
];
var _hoisted_15 = { class: "flex items-center justify-between gap-2 text-sm" };
var _hoisted_16 = {
	key: 1,
	class: "text-muted @max-[300px]:hidden"
};
var _hoisted_17 = {
	key: 3,
	class: "flex items-center gap-1 font-bold text-text-primary"
};
var _hoisted_18 = { class: "@max-[180px]:hidden" };
var _hoisted_19 = { class: "hidden @max-[180px]:inline" };
var _hoisted_20 = { class: "flex flex-col gap-2" };
var _hoisted_21 = { class: "flex items-center justify-between gap-2 text-sm @max-[300px]:flex-col @max-[300px]:items-start" };
var _hoisted_22 = { class: "flex items-center gap-1 text-text-primary" };
var _hoisted_23 = {
	key: 0,
	class: "flex h-3.5 items-center rounded-full bg-base-foreground px-1 text-2xs/none font-semibold text-base-background uppercase"
};
var _hoisted_24 = {
	key: 1,
	class: "flex items-center gap-1 font-bold text-text-primary"
};
var _hoisted_25 = { class: "text-sm text-muted @max-[300px]:hidden" };
var _hoisted_26 = {
	key: 1,
	class: "flex flex-col gap-3"
};
//#endregion
//#region src/platform/cloud/subscription/components/CreditsTile.vue
var CreditsTile_default = /* @__PURE__ */ defineComponent({
	__name: "CreditsTile",
	props: { zeroState: {
		type: Boolean,
		default: false
	} },
	setup(__props) {
		const { locale, t } = useI18n();
		const { subscription, balance, isActiveSubscription, isFreeTier, currentTeamCreditStop, fetchBalance, fetchStatus } = useBillingContext();
		const { monthlyBonusCredits, prepaidCredits, totalCredits, monthlyBonusCreditsValue, prepaidCreditsValue, isLoadingBalance } = useSubscriptionCredits();
		const { permissions } = useWorkspaceUI();
		const { showPricingTable } = useSubscriptionDialog();
		const { wrapWithErrorHandlingAsync } = useErrorHandling();
		const dialogService = useDialogService();
		const telemetry = useTelemetry();
		const tierKey = computed(() => {
			const tier = subscription.value?.tier;
			if (!tier) return DEFAULT_TIER_KEY;
			return TIER_TO_KEY[tier] ?? "standard";
		});
		const monthlyTotalCredits = computed(() => {
			const teamStop = currentTeamCreditStop.value;
			if (teamStop) return teamStop.credits_monthly;
			return getTierCredits(tierKey.value);
		});
		const usage = computed(() => computeMonthlyUsage(monthlyBonusCreditsValue.value, monthlyTotalCredits.value ?? 0));
		const refillsDateShort = computed(() => {
			const raw = subscription.value?.renewalDate;
			if (!raw) return "";
			const date = new Date(raw);
			return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(locale.value, {
				month: "short",
				day: "numeric"
			});
		});
		const hasRefillsDate = computed(() => refillsDateShort.value !== "");
		const refillsLabel = computed(() => hasRefillsDate.value ? t("subscription.refillsDate", { date: refillsDateShort.value }) : t("subscription.refillsNextCycle"));
		const formatCreditCount = (value) => formatCredits({
			value,
			locale: locale.value,
			numberOptions: { maximumFractionDigits: 0 }
		});
		const monthlyTotalDisplay = computed(() => {
			const total = monthlyTotalCredits.value;
			return total === null ? "—" : formatCreditCount(total);
		});
		const usedDisplay = computed(() => formatCreditCount(usage.value.used));
		const compactNumber = computed(() => new Intl.NumberFormat(locale.value, { notation: "compact" }));
		const monthlyRemainingCompact = computed(() => compactNumber.value.format(monthlyBonusCreditsValue.value));
		const monthlyTotalCompact = computed(() => {
			const total = monthlyTotalCredits.value;
			return total === null ? "—" : compactNumber.value.format(total);
		});
		const displayTotal = computed(() => __props.zeroState ? "0" : totalCredits.value);
		const displayPrepaid = computed(() => __props.zeroState ? "0" : prepaidCredits.value);
		const usedBarWidth = computed(() => `${(usage.value.usedFraction * 100).toFixed(2)}%`);
		const monthlyUsageLabel = computed(() => t("subscription.monthlyUsageProgress", {
			used: usedDisplay.value,
			total: monthlyTotalDisplay.value
		}));
		const showBreakdown = computed(() => isActiveSubscription.value && !__props.zeroState);
		const showBar = computed(() => showBreakdown.value && monthlyTotalCredits.value !== null && monthlyTotalCredits.value > 0);
		const showActionButton = computed(() => isActiveSubscription.value && !__props.zeroState && permissions.value.canTopUp);
		const isMonthlyDepleted = computed(() => showBar.value && !isLoadingBalance.value && balance.value != null && monthlyBonusCreditsValue.value <= 0);
		const isOutOfCredits = computed(() => isMonthlyDepleted.value && prepaidCreditsValue.value <= 0);
		const isSpendingAdditional = computed(() => isMonthlyDepleted.value && prepaidCreditsValue.value > 0);
		const emptyStateNotice = computed(() => {
			if (isOutOfCredits.value) return {
				title: hasRefillsDate.value ? t("subscription.outOfCreditsTitle", { date: refillsDateShort.value }) : t("subscription.outOfCreditsTitleNoDate"),
				description: t("subscription.outOfCreditsDescription")
			};
			if (isMonthlyDepleted.value) return {
				title: hasRefillsDate.value ? t("subscription.monthlyCreditsUsedUpTitle", { date: refillsDateShort.value }) : t("subscription.monthlyCreditsUsedUpTitleNoDate"),
				description: t("subscription.monthlyCreditsUsedUpDescription")
			};
			return null;
		});
		const handleRefresh = wrapWithErrorHandlingAsync(async () => {
			await Promise.all([fetchBalance(), fetchStatus()]);
		});
		function handleAddCredits() {
			telemetry?.trackAddApiCreditButtonClicked({ source: "credits_panel" });
			dialogService.showTopUpCreditsDialog();
		}
		function handleUpgradeToAddCredits() {
			showPricingTable({ reason: "upgrade_to_add_credits" });
		}
		async function handleWindowFocus() {
			if (consumePendingTopup()) await handleRefresh();
		}
		useEventListener(window, "focus", () => void handleWindowFocus());
		onMounted(handleRefresh);
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(Button_default, {
					variant: "muted-textonly",
					size: "icon-sm",
					class: "absolute top-4 right-4",
					loading: unref(isLoadingBalance),
					"aria-label": _ctx.$t("subscription.refreshCredits"),
					onClick: unref(handleRefresh)
				}, {
					default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "icon-[lucide--refresh-cw] size-4 text-text-secondary" }, null, -1)])]),
					_: 1
				}, 8, [
					"loading",
					"aria-label",
					"onClick"
				]),
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, toDisplayString(_ctx.$t("subscription.totalCredits")), 1), unref(isLoadingBalance) ? (openBlock(), createBlock(unref(script), {
					key: 0,
					width: "8rem",
					height: "2rem"
				})) : (openBlock(), createElementBlock("div", _hoisted_4, [
					_cache[1] || (_cache[1] = createBaseVNode("i", { class: "icon-[lucide--component] size-4 self-center text-credit" }, null, -1)),
					createBaseVNode("span", _hoisted_5, toDisplayString(displayTotal.value), 1),
					createBaseVNode("span", _hoisted_6, toDisplayString(_ctx.$t("subscription.remaining")), 1)
				]))]),
				showBreakdown.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					emptyStateNotice.value ? (openBlock(), createElementBlock("div", _hoisted_7, [_cache[2] || (_cache[2] = createBaseVNode("i", { class: "mt-0.5 icon-[lucide--info] size-4 shrink-0 text-base-foreground" }, null, -1)), createBaseVNode("div", _hoisted_8, [createBaseVNode("span", _hoisted_9, toDisplayString(emptyStateNotice.value.title), 1), createBaseVNode("span", _hoisted_10, toDisplayString(emptyStateNotice.value.description), 1)])])) : createCommentVNode("", true),
					showBar.value ? (openBlock(), createElementBlock("div", {
						key: 1,
						class: normalizeClass(unref(cn)("flex flex-col gap-2", isMonthlyDepleted.value && "opacity-30"))
					}, [
						createBaseVNode("div", _hoisted_11, [createBaseVNode("span", _hoisted_12, toDisplayString(_ctx.$t("subscription.monthly")), 1), createBaseVNode("span", _hoisted_13, toDisplayString(refillsLabel.value), 1)]),
						createBaseVNode("div", {
							role: "progressbar",
							"aria-valuenow": usage.value.used,
							"aria-valuemin": 0,
							"aria-valuemax": monthlyTotalCredits.value ?? 0,
							"aria-valuetext": monthlyUsageLabel.value,
							class: "h-2 w-full overflow-hidden rounded-full bg-secondary-background-hover"
						}, [createBaseVNode("div", {
							class: "h-full rounded-full bg-credit",
							style: normalizeStyle({ width: usedBarWidth.value })
						}, null, 4)], 8, _hoisted_14),
						createBaseVNode("div", _hoisted_15, [unref(isLoadingBalance) ? (openBlock(), createBlock(unref(script), {
							key: 0,
							class: "@max-[300px]:hidden",
							width: "5rem",
							height: "1rem"
						})) : (openBlock(), createElementBlock("span", _hoisted_16, toDisplayString(_ctx.$t("subscription.creditsUsed", { used: usedDisplay.value })), 1)), unref(isLoadingBalance) ? (openBlock(), createBlock(unref(script), {
							key: 2,
							width: "9rem",
							height: "1rem"
						})) : (openBlock(), createElementBlock("span", _hoisted_17, [
							_cache[3] || (_cache[3] = createBaseVNode("i", { class: "icon-[lucide--component] size-4 text-credit" }, null, -1)),
							createBaseVNode("span", _hoisted_18, toDisplayString(_ctx.$t("subscription.creditsLeftOfTotal", {
								remaining: unref(monthlyBonusCredits),
								total: monthlyTotalDisplay.value
							})), 1),
							createBaseVNode("span", _hoisted_19, toDisplayString(_ctx.$t("subscription.creditsLeftOfTotal", {
								remaining: monthlyRemainingCompact.value,
								total: monthlyTotalCompact.value
							})), 1)
						]))])
					], 2)) : createCommentVNode("", true),
					_cache[6] || (_cache[6] = createBaseVNode("div", { class: "h-px w-full bg-interface-stroke" }, null, -1)),
					createBaseVNode("div", _hoisted_20, [createBaseVNode("div", _hoisted_21, [createBaseVNode("span", _hoisted_22, [
						createTextVNode(toDisplayString(_ctx.$t("subscription.additionalCredits")) + " ", 1),
						withDirectives((openBlock(), createBlock(Button_default, {
							variant: "muted-textonly",
							size: "icon-sm",
							"aria-label": _ctx.$t("subscription.additionalCreditsInfo"),
							class: "text-muted"
						}, {
							default: withCtx(() => [..._cache[4] || (_cache[4] = [createBaseVNode("i", { class: "icon-[lucide--info] size-4" }, null, -1)])]),
							_: 1
						}, 8, ["aria-label"])), [[_directive_tooltip, {
							value: _ctx.$t("subscription.additionalCreditsTooltip"),
							showDelay: 300
						}]]),
						isSpendingAdditional.value ? (openBlock(), createElementBlock("span", _hoisted_23, toDisplayString(_ctx.$t("subscription.additionalCreditsInUse")), 1)) : createCommentVNode("", true)
					]), unref(isLoadingBalance) ? (openBlock(), createBlock(unref(script), {
						key: 0,
						width: "3rem",
						height: "1rem"
					})) : (openBlock(), createElementBlock("span", _hoisted_24, [_cache[5] || (_cache[5] = createBaseVNode("i", { class: "icon-[lucide--component] size-4 text-credit" }, null, -1)), createTextVNode(" " + toDisplayString(displayPrepaid.value), 1)]))]), createBaseVNode("span", _hoisted_25, toDisplayString(_ctx.$t("subscription.usedAfterMonthly")), 1)])
				], 64)) : createCommentVNode("", true),
				showActionButton.value ? (openBlock(), createElementBlock("div", _hoisted_26, [unref(isFreeTier) ? (openBlock(), createBlock(Button_default, {
					key: 0,
					variant: "gradient",
					size: "lg",
					class: "w-full font-normal",
					onClick: handleUpgradeToAddCredits
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.upgradeToAddCredits")), 1)]),
					_: 1
				})) : (openBlock(), createBlock(Button_default, {
					key: 1,
					variant: isOutOfCredits.value ? "inverted" : "secondary",
					size: "lg",
					class: normalizeClass(unref(cn)("w-full font-normal", !isOutOfCredits.value && "bg-interface-menu-component-surface-selected text-text-primary")),
					onClick: handleAddCredits
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.addCredits")), 1)]),
					_: 1
				}, 8, ["variant", "class"]))])) : createCommentVNode("", true)
			]);
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
export { useSubscriptionActions as i, CreditsTile_default as n, SubscriptionFooterLinks_default as r, getCommonTierBenefits as t };

//# sourceMappingURL=tierBenefits-DiXeIF3m.js.map