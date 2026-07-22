import "./rolldown-runtime-w0pxe0c8.js";
import { p as script } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, J as mergeModels, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, et as onMounted, gt as watch, j as createBaseVNode, jt as ref, pt as useModel, rt as openBlock, x as vShow, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Fi as TIER_PRICING, Ii as TIER_TO_KEY, Mi as useBillingPlans, Oi as useBillingContext } from "./promotionUtils-BjUDpLi8.js";
import { r as useI18n, t as I18nT } from "./vendor-i18n-BitfRK9w.js";
import { L as usePreferredReducedMotion, W as useTransition, i as TransitionPresets, x as useEventListener } from "./vendor-vueuse-D8rwdKM0.js";
import { l as useFeatureFlags } from "./teamWorkspaceStore-Me5msqSA.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as Slider_default } from "./Slider-DrBXpOpg.js";
import { a as TEAM_PLAN_CREDIT_STOPS, i as useSubscriptionCheckout, n as SubscriptionSuccessWorkspace_default, o as getStopDiscountedMonthlyUsd, r as SubscriptionAddPaymentPreviewWorkspace_default, s as mapApiTeamCreditStops, t as SubscriptionTransitionPreviewWorkspace_default } from "./SubscriptionTransitionPreviewWorkspace-1IkMRfuZ.js";
//#region src/components/ui/credit-slider/CreditSlider.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "flex flex-col gap-2" };
var _hoisted_2$2 = { class: "flex flex-wrap items-center gap-x-2 gap-y-1" };
var _hoisted_3$2 = { class: "flex shrink-0 items-baseline gap-1.5 whitespace-nowrap" };
var _hoisted_4$2 = {
	class: "text-[2rem]/none font-semibold text-base-foreground tabular-nums",
	"data-testid": "credit-slider-price"
};
var _hoisted_5$2 = {
	key: 0,
	class: "text-base text-muted-foreground tabular-nums line-through",
	"data-testid": "credit-slider-original-price"
};
var _hoisted_6$1 = { class: "text-base text-muted-foreground" };
var _hoisted_7$1 = {
	key: 0,
	"data-testid": "credit-slider-save",
	class: "shrink-0 rounded-full border-2 border-primary-background px-2 py-1 text-sm font-bold whitespace-nowrap text-primary-background xl:ms-auto"
};
var _hoisted_8$1 = {
	class: "m-0 text-sm text-muted-foreground tabular-nums",
	"data-testid": "credit-slider-billed-yearly"
};
var _hoisted_9$1 = {
	"data-testid": "credit-slider-stops",
	class: "m-0 flex list-none justify-between p-0"
};
var _hoisted_10$1 = ["data-selected"];
//#endregion
//#region src/components/ui/credit-slider/CreditSlider.vue
var CreditSlider_default = /* @__PURE__ */ defineComponent({
	__name: "CreditSlider",
	props: /* @__PURE__ */ mergeModels({
		disabled: {
			type: Boolean,
			default: false
		},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		stops: { default: () => TEAM_PLAN_CREDIT_STOPS },
		defaultStopIndex: { default: () => 2 },
		cycle: { default: "yearly" }
	}, {
		"modelValue": { default: TEAM_PLAN_CREDIT_STOPS[2].usd },
		"modelModifiers": {}
	}),
	emits: /* @__PURE__ */ mergeModels(["change"], ["update:modelValue"]),
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		/**
		* v-model carries the selected USD value (one of the `stops`). The literal
		* default keeps `defineModel` statically analyzable; when custom `stops` are
		* passed without a matching v-model, `selectedIndex` falls back to
		* `defaultStopIndex`, so the displayed stop is still correct.
		*/
		const usd = useModel(__props, "modelValue");
		const selectedIndex = computed(() => {
			const i = __props.stops.findIndex((stop) => stop.usd === usd.value);
			if (i !== -1) return i;
			return Math.min(Math.max(__props.defaultStopIndex, 0), Math.max(__props.stops.length - 1, 0));
		});
		const current = computed(() => __props.stops[selectedIndex.value]);
		const effectiveDiscountPercent = computed(() => __props.cycle === "monthly" ? current.value.discountPercentYearly / 2 : current.value.discountPercentYearly);
		const discountedMonthly = computed(() => getStopDiscountedMonthlyUsd(current.value, __props.cycle));
		const saveAmount = computed(() => current.value.usd - discountedMonthly.value);
		const hasDiscount = computed(() => effectiveDiscountPercent.value > 0);
		/**
		* Smoothly count the price figures up/down as the slider moves between stops
		* instead of snapping. Honors the user's reduced-motion preference. The save
		* badge ("X% ($Y)") is intentionally left snapping — its percent is a discrete
		* tier, so animating the bracketed amount alone would read inconsistently.
		*/
		const prefersReducedMotion = usePreferredReducedMotion();
		const priceTween = {
			duration: 350,
			easing: TransitionPresets.easeOutCubic,
			disabled: computed(() => prefersReducedMotion.value === "reduce")
		};
		const animatedMonthly = useTransition(discountedMonthly, priceTween);
		const animatedOriginal = useTransition(() => current.value.usd, priceTween);
		const displayMonthly = computed(() => Math.round(animatedMonthly.value));
		const displayOriginal = computed(() => Math.round(animatedOriginal.value));
		const displayBilledYearly = computed(() => displayMonthly.value * 12);
		/**
		* Bridge the discrete stop index (0..n-1) to the reka-ui slider's `number[]`
		* model. Driving the slider in index space with `step = 1` guarantees the
		* thumb can only land on the fixed stops — never a value in between.
		*/
		const sliderModel = computed({
			get: () => [selectedIndex.value],
			set: ([index]) => {
				const stop = __props.stops[index];
				if (!stop) return;
				usd.value = stop.usd;
				emit("change", {
					index,
					usd: stop.usd,
					credits: stop.credits
				});
			}
		});
		const lastIndex = computed(() => Math.max(__props.stops.length - 1, 0));
		const formatUsd = (value) => `$${value.toLocaleString("en-US")}`;
		const formatCreditsCompact = (value) => new Intl.NumberFormat("en-US", {
			notation: "compact",
			maximumFractionDigits: 1
		}).format(value);
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(unref(cn)("flex w-full flex-col gap-3", __props.class)) }, [
				createBaseVNode("div", _hoisted_1$2, [createBaseVNode("div", _hoisted_2$2, [createBaseVNode("span", _hoisted_3$2, [
					createBaseVNode("span", _hoisted_4$2, toDisplayString(formatUsd(displayMonthly.value)), 1),
					hasDiscount.value ? (openBlock(), createElementBlock("span", _hoisted_5$2, toDisplayString(formatUsd(displayOriginal.value)), 1)) : createCommentVNode("", true),
					createBaseVNode("span", _hoisted_6$1, toDisplayString(unref(t)("subscription.usdPerMonth")), 1)
				]), hasDiscount.value ? (openBlock(), createElementBlock("span", _hoisted_7$1, toDisplayString(unref(t)("subscription.creditSliderSave", {
					percent: effectiveDiscountPercent.value,
					amount: formatUsd(saveAmount.value)
				})), 1)) : createCommentVNode("", true)]), createBaseVNode("p", _hoisted_8$1, toDisplayString(__props.cycle === "monthly" ? unref(t)("subscription.billedMonthly") : unref(t)("subscription.billedYearly", { total: formatUsd(displayBilledYearly.value) })), 1)]),
				createVNode(Slider_default, {
					modelValue: sliderModel.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => sliderModel.value = $event),
					min: 0,
					max: lastIndex.value,
					step: 1,
					disabled: __props.disabled,
					"range-class": "bg-base-foreground",
					"thumb-class": "bg-base-foreground"
				}, null, 8, [
					"modelValue",
					"max",
					"disabled"
				]),
				createBaseVNode("ol", _hoisted_9$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.stops, (stop, i) => {
					return openBlock(), createElementBlock("li", {
						key: stop.usd,
						"data-selected": i === selectedIndex.value ? "" : void 0,
						class: normalizeClass(unref(cn)("flex items-center gap-1 text-xs tabular-nums", i === selectedIndex.value ? "font-semibold text-base-foreground" : "text-muted-foreground"))
					}, [createBaseVNode("i", {
						class: normalizeClass(unref(cn)("icon-[comfy--credits] size-3 shrink-0", i === selectedIndex.value ? "bg-amber-400" : "bg-muted-foreground")),
						"aria-hidden": "true"
					}, null, 2), createTextVNode(" " + toDisplayString(formatCreditsCompact(stop.credits)), 1)], 10, _hoisted_10$1);
				}), 128))])
			], 2);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/UnifiedPricingTable.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex flex-col xl:h-full" };
var _hoisted_2$1 = {
	key: 0,
	class: "flex justify-center"
};
var _hoisted_3$1 = { class: "flex min-h-0 flex-col gap-6 rounded-2xl bg-base-background p-8 xl:flex-1" };
var _hoisted_4$1 = { class: "flex justify-center" };
var _hoisted_5$1 = { class: "flex items-center gap-2" };
var _hoisted_6 = {
	key: 0,
	class: "flex items-center rounded-full bg-primary-background px-2 py-0.5 text-2xs font-bold whitespace-nowrap text-white"
};
var _hoisted_7 = {
	key: 2,
	class: "flex flex-col items-stretch gap-6 xl:flex-1 xl:flex-row xl:justify-center"
};
var _hoisted_8 = { class: "flex flex-1 flex-col gap-4 p-6 pb-0" };
var _hoisted_9 = { class: "flex flex-row items-center justify-between gap-2" };
var _hoisted_10 = { class: "font-inter text-base/normal font-bold text-base-foreground" };
var _hoisted_11 = {
	key: 0,
	class: "flex h-5 items-center rounded-full bg-base-foreground px-1.5 text-2xs font-bold tracking-tight text-base-background uppercase"
};
var _hoisted_12 = { class: "flex flex-col gap-2" };
var _hoisted_13 = { class: "flex flex-row items-baseline gap-2" };
var _hoisted_14 = { class: "font-inter text-[28px] leading-normal font-semibold text-base-foreground tabular-nums" };
var _hoisted_15 = { class: "font-inter text-sm/normal text-base-foreground" };
var _hoisted_16 = { class: "text-sm text-muted-foreground" };
var _hoisted_17 = { class: "flex flex-col gap-3" };
var _hoisted_18 = { class: "text-sm text-muted-foreground" };
var _hoisted_19 = { class: "text-sm font-normal text-muted-foreground" };
var _hoisted_20 = { class: "mt-auto flex flex-col gap-1" };
var _hoisted_21 = { class: "flex flex-row items-center gap-2" };
var _hoisted_22 = { class: "font-inter text-sm/normal font-bold text-base-foreground tabular-nums" };
var _hoisted_23 = { class: "text-sm text-muted-foreground" };
var _hoisted_24 = { class: "text-sm text-muted-foreground" };
var _hoisted_25 = { class: "flex flex-col p-6" };
var _hoisted_26 = {
	key: 3,
	class: "flex min-h-0 flex-col gap-6 xl:flex-1"
};
var _hoisted_27 = { class: "flex flex-col items-stretch gap-6 xl:flex-1 xl:flex-row xl:justify-center" };
var _hoisted_28 = { class: "flex flex-[2.6] flex-col rounded-2xl border border-border-default bg-base-background shadow-[0_0_12px_rgba(0,0,0,0.1)] xl:flex-row xl:overflow-hidden" };
var _hoisted_29 = { class: "flex flex-[1.6] flex-col gap-6 p-6" };
var _hoisted_30 = { class: "flex flex-col gap-1" };
var _hoisted_31 = { class: "font-inter text-base/normal font-bold text-base-foreground" };
var _hoisted_32 = { class: "text-sm text-muted-foreground" };
var _hoisted_33 = { class: "flex flex-col gap-1" };
var _hoisted_34 = { class: "flex flex-row items-center gap-2" };
var _hoisted_35 = { class: "font-inter text-sm/normal font-bold text-base-foreground tabular-nums" };
var _hoisted_36 = { class: "text-sm text-muted-foreground" };
var _hoisted_37 = { class: "text-sm text-muted-foreground" };
var _hoisted_38 = { class: "flex flex-1 flex-col gap-4 p-6" };
var _hoisted_39 = { class: "font-inter text-base/normal font-bold text-base-foreground" };
var _hoisted_40 = { class: "flex flex-col gap-3" };
var _hoisted_41 = { class: "text-sm text-muted-foreground" };
var _hoisted_42 = { class: "text-sm font-normal text-muted-foreground" };
var _hoisted_43 = { class: "flex flex-col gap-3" };
var _hoisted_44 = { class: "text-sm text-muted-foreground" };
var _hoisted_45 = { class: "flex flex-row items-start gap-2" };
var _hoisted_46 = { class: "text-sm font-normal text-muted-foreground" };
var _hoisted_47 = { class: "flex flex-1 flex-col gap-4 rounded-2xl border border-border-default bg-base-background p-6 shadow-[0_0_12px_rgba(0,0,0,0.1)]" };
var _hoisted_48 = { class: "font-inter text-base/normal font-bold text-base-foreground" };
var _hoisted_49 = { class: "flex flex-col gap-3" };
var _hoisted_50 = { class: "text-sm/relaxed font-normal text-muted-foreground" };
var _hoisted_51 = { class: "text-sm/relaxed font-normal text-muted-foreground" };
var _hoisted_52 = { class: "text-sm/relaxed font-normal text-muted-foreground" };
var VIDEO_TEMPLATE_URL = "https://cloud.comfy.org/?template=video_wan2_2_14B_i2v";
/** External footnote destinations — rendered as real links (open in a new tab). */
var QUESTIONS_URL = "https://portal.usepylon.com/comfy-org/forms/question";
var ENTERPRISE_URL = "https://www.comfy.org/enterprise";
var PRICING_URL = "https://www.comfy.org/pricing";
//#endregion
//#region src/platform/workspace/components/UnifiedPricingTable.vue
var UnifiedPricingTable_default = /* @__PURE__ */ defineComponent({
	__name: "UnifiedPricingTable",
	props: {
		isLoading: { type: Boolean },
		loadingTier: { default: null },
		initialPlanMode: { default: "personal" }
	},
	emits: [
		"subscribe",
		"resubscribe",
		"subscribeTeam"
	],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t, n } = useI18n();
		const { flags } = useFeatureFlags();
		/** Team plans only exist behind the flag (mirrors useBillingContext type). */
		const showTeam = computed(() => flags.teamWorkspacesEnabled);
		const planMode = ref(__props.initialPlanMode);
		/** The Wan 2.2 i2v template the video estimates are based on. */
		const VIDEO_PER_CREDIT = TIER_PRICING.pro.videoEstimate / TIER_PRICING.pro.credits;
		const toggleButtonPt = {
			root: { class: "flex gap-1 bg-secondary-background rounded-lg p-1.5" },
			pcToggleButton: {
				root: ({ context }) => ({ class: ["h-8 min-w-44 px-5 rounded-md transition-colors cursor-pointer border-none outline-none ring-0 text-sm font-medium flex items-center justify-center", context.active ? "bg-base-foreground text-base-background" : "bg-transparent text-muted-foreground hover:bg-secondary-background-hover"] }),
				label: { class: "flex items-center gap-2 " }
			}
		};
		const planScopeButtonPt = {
			root: { class: "flex gap-1" },
			pcToggleButton: {
				root: ({ context }) => ({ class: ["h-8 px-4 rounded-t-md transition cursor-pointer border-none outline-none ring-0 text-sm font-medium flex items-center justify-center", context.active ? "bg-base-background text-base-foreground" : "bg-base-background text-base-foreground opacity-50 hover:opacity-100"] }),
				label: { class: "flex items-center gap-2" }
			}
		};
		const planScopeOptions = [{
			label: t("subscription.planScope.personal"),
			value: "personal"
		}, {
			label: t("subscription.planScope.team"),
			value: "team"
		}];
		const billingCycleOptions = [{
			label: t("subscription.yearly"),
			value: "yearly"
		}, {
			label: t("subscription.monthly"),
			value: "monthly"
		}];
		/** Team-plan "Details" column perks (DES-197), shown under "Everything in Pro". */
		const teamDetailPerks = [
			t("subscription.teamPlan.perkInviteMembers"),
			t("subscription.teamPlan.perkConcurrentRuns"),
			t("subscription.teamPlan.perkSharedPool"),
			t("subscription.teamPlan.perkRolePermissions")
		];
		const tiers = [
			{
				id: "STANDARD",
				key: "standard",
				name: t("subscription.tiers.standard.name"),
				pricing: TIER_PRICING.standard,
				featuresHeader: t("subscription.whatsIncluded"),
				features: [t("subscription.tiers.standard.feature1"), t("subscription.tiers.standard.feature2")],
				isPopular: false
			},
			{
				id: "CREATOR",
				key: "creator",
				name: t("subscription.tiers.creator.name"),
				pricing: TIER_PRICING.creator,
				featuresHeader: t("subscription.everythingInPlus", { plan: t("subscription.tiers.standard.name") }),
				features: [t("subscription.tiers.creator.feature1")],
				isPopular: true
			},
			{
				id: "PRO",
				key: "pro",
				name: t("subscription.tiers.pro.name"),
				pricing: TIER_PRICING.pro,
				featuresHeader: t("subscription.everythingInPlus", { plan: t("subscription.tiers.creator.name") }),
				features: [t("subscription.tiers.pro.feature1")],
				isPopular: false
			}
		];
		const { plans: apiPlans, currentPlanSlug, fetchPlans, subscription, currentTeamCreditStop } = useBillingContext();
		const { teamCreditStops } = useBillingPlans();
		const isCancelled = computed(() => subscription.value?.isCancelled ?? false);
		const currentBillingCycle = ref("yearly");
		const teamStops = computed(() => {
			const apiStops = teamCreditStops.value?.stops;
			return apiStops?.length ? mapApiTeamCreditStops(apiStops) : TEAM_PLAN_CREDIT_STOPS;
		});
		const teamDefaultStopIndex = computed(() => teamCreditStops.value?.default_stop_index ?? 2);
		const defaultTeamStop = computed(() => teamStops.value[teamDefaultStopIndex.value] ?? teamStops.value[0]);
		const teamUsd = ref(defaultTeamStop.value.usd);
		const selectedTeamStop = computed(() => teamStops.value.find((stop) => stop.usd === teamUsd.value) ?? defaultTeamStop.value);
		const teamCredits = computed(() => selectedTeamStop.value.credits);
		const teamVideoEstimate = computed(() => Math.round(teamCredits.value * VIDEO_PER_CREDIT));
		const isTeamSubscribed = computed(() => currentTeamCreditStop.value !== null);
		watch(defaultTeamStop, (stop) => {
			if (currentTeamCreditStop.value) return;
			if (teamStops.value.some((s) => s.usd === teamUsd.value)) return;
			teamUsd.value = stop.usd;
		});
		watch(currentTeamCreditStop, (stop) => {
			if (!stop) return;
			teamUsd.value = stop.stop_usd;
		}, { immediate: true });
		const isTeamCurrentStopSelected = computed(() => {
			const usd = currentTeamCreditStop.value?.stop_usd;
			return usd != null && usd === teamUsd.value && teamStops.value.some((stop) => stop.usd === usd);
		});
		const subscribedCycle = computed(() => subscription.value?.duration === "MONTHLY" ? "monthly" : "yearly");
		const isTeamCurrentPlanSelected = computed(() => isTeamCurrentStopSelected.value && currentBillingCycle.value === subscribedCycle.value);
		const teamButtonLabel = computed(() => {
			if (!isTeamSubscribed.value) return currentBillingCycle.value === "yearly" ? t("subscription.teamPlan.cta") : t("subscription.teamPlan.ctaMonthly");
			if (isTeamCurrentPlanSelected.value) return isCancelled.value ? t("subscription.resubscribe") : t("subscription.teamPlan.currentPlan");
			return t("subscription.teamPlan.changePlan");
		});
		const isTeamButtonDisabled = computed(() => __props.isLoading || isTeamSubscribed.value && isTeamCurrentPlanSelected.value && !isCancelled.value);
		const isTeamPlanChange = computed(() => isTeamSubscribed.value && !isTeamCurrentPlanSelected.value);
		onMounted(() => {
			fetchPlans();
		});
		function getApiPlanForTier(tierKey, duration) {
			const apiDuration = duration === "yearly" ? "ANNUAL" : "MONTHLY";
			const apiTier = tierKey.toUpperCase();
			return apiPlans.value.find((p) => p.tier === apiTier && p.duration === apiDuration);
		}
		function getPriceFromApi(tier) {
			const plan = getApiPlanForTier(tier.key, currentBillingCycle.value);
			if (!plan) return null;
			const price = plan.price_cents / 100;
			return currentBillingCycle.value === "yearly" ? price / 12 : price;
		}
		const currentTierKey = computed(() => subscription.value?.tier ? TIER_TO_KEY[subscription.value.tier] : null);
		const isYearlySubscription = computed(() => subscription.value?.duration === "ANNUAL");
		const isCurrentPlan = (tierKey) => {
			if (currentPlanSlug.value) return getApiPlanForTier(tierKey, currentBillingCycle.value)?.slug === currentPlanSlug.value;
			if (!currentTierKey.value) return false;
			const selectedIsYearly = currentBillingCycle.value === "yearly";
			return currentTierKey.value === tierKey && isYearlySubscription.value === selectedIsYearly;
		};
		const getButtonLabel = (tier) => {
			const planName = currentBillingCycle.value === "yearly" ? t("subscription.tierNameYearly", { name: tier.name }) : tier.name;
			if (isCurrentPlan(tier.key)) return isCancelled.value ? t("subscription.resubscribeTo", { plan: planName }) : t("subscription.currentPlan");
			return currentTierKey.value !== null && currentTierKey.value !== "free" ? t("subscription.changeTo", { plan: planName }) : t("subscription.subscribeTo", { plan: planName });
		};
		const getButtonSeverity = (tier) => {
			if (isCurrentPlan(tier.key)) return isCancelled.value ? "primary" : "secondary";
			if (tier.key === "creator") return "primary";
			return "secondary";
		};
		const isButtonDisabled = (tier) => {
			if (__props.isLoading) return true;
			if (isCurrentPlan(tier.key)) return !isCancelled.value;
			return false;
		};
		const getButtonTextClass = (tier) => tier.key === "creator" ? "font-inter text-sm font-bold leading-normal text-base-background" : "font-inter text-sm font-bold leading-normal text-primary-foreground";
		const getPrice = (tier) => getPriceFromApi(tier) ?? tier.pricing[currentBillingCycle.value];
		const getMonthlyPrice = (tier) => {
			const plan = getApiPlanForTier(tier.key, "monthly");
			return plan ? plan.price_cents / 100 : tier.pricing.monthly;
		};
		const getAnnualTotal = (tier) => {
			const plan = getApiPlanForTier(tier.key, "yearly");
			return plan ? plan.price_cents / 100 : tier.pricing.yearly * 12;
		};
		function handleSubscribe(tierKey) {
			if (__props.isLoading) return;
			if (isCurrentPlan(tierKey)) {
				if (isCancelled.value) emit("resubscribe");
				return;
			}
			emit("subscribe", {
				tierKey,
				billingCycle: currentBillingCycle.value
			});
		}
		function handleSubscribeTeam() {
			if (isTeamButtonDisabled.value) return;
			if (isCancelled.value && isTeamCurrentPlanSelected.value) {
				emit("resubscribe");
				return;
			}
			const stop = selectedTeamStop.value;
			emit("subscribeTeam", {
				stop: {
					id: stop.id,
					usd: stop.usd,
					credits: stop.credits,
					discountedUsd: getStopDiscountedMonthlyUsd(stop, currentBillingCycle.value)
				},
				billingCycle: currentBillingCycle.value,
				isChange: isTeamPlanChange.value
			});
		}
		function handleViewEnterprise() {
			window.open(ENTERPRISE_URL, "_blank");
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				showTeam.value ? (openBlock(), createElementBlock("div", _hoisted_2$1, [createVNode(unref(script), {
					modelValue: planMode.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => planMode.value = $event),
					options: planScopeOptions,
					"option-label": "label",
					"option-value": "value",
					"allow-empty": false,
					unstyled: "",
					pt: planScopeButtonPt
				}, null, 8, ["modelValue"])])) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_3$1, [
					planMode.value === "personal" ? (openBlock(), createBlock(unref(I18nT), {
						key: 0,
						keypath: "subscription.personalHeader",
						tag: "p",
						class: "m-0 text-center text-sm text-muted-foreground"
					}, {
						action: withCtx(() => [createBaseVNode("button", {
							type: "button",
							class: "cursor-pointer border-none bg-transparent p-0 text-sm text-base-foreground hover:text-muted-foreground",
							onClick: _cache[1] || (_cache[1] = ($event) => planMode.value = "team")
						}, toDisplayString(unref(t)("subscription.personalHeaderAction")), 1)]),
						_: 1
					})) : (openBlock(), createBlock(unref(I18nT), {
						key: 1,
						keypath: "subscription.teamHeader",
						tag: "p",
						class: "m-0 text-center text-sm text-muted-foreground"
					}, {
						learnMore: withCtx(() => [createBaseVNode("button", {
							type: "button",
							class: "cursor-pointer border-none bg-transparent p-0 text-sm text-base-foreground hover:text-muted-foreground",
							onClick: handleViewEnterprise
						}, toDisplayString(unref(t)("subscription.teamHeaderLearnMore")), 1)]),
						_: 1
					})),
					createBaseVNode("div", _hoisted_4$1, [createVNode(unref(script), {
						modelValue: currentBillingCycle.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => currentBillingCycle.value = $event),
						options: billingCycleOptions,
						"option-label": "label",
						"option-value": "value",
						"allow-empty": false,
						unstyled: "",
						pt: toggleButtonPt
					}, {
						option: withCtx(({ option }) => [createBaseVNode("div", _hoisted_5$1, [createBaseVNode("span", null, toDisplayString(option.label), 1), option.value === "yearly" ? (openBlock(), createElementBlock("div", _hoisted_6, toDisplayString(planMode.value === "team" ? unref(t)("subscription.saveYearlyUpTo") : unref(t)("subscription.saveYearly")), 1)) : createCommentVNode("", true)])]),
						_: 1
					}, 8, ["modelValue"])]),
					planMode.value === "personal" ? (openBlock(), createElementBlock("div", _hoisted_7, [(openBlock(), createElementBlock(Fragment, null, renderList(tiers, (tier) => {
						return createBaseVNode("div", {
							key: tier.id,
							class: "flex flex-col rounded-2xl border border-border-default bg-base-background shadow-[0_0_12px_rgba(0,0,0,0.1)] xl:w-80"
						}, [createBaseVNode("div", _hoisted_8, [
							createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, toDisplayString(tier.name), 1), tier.isPopular ? (openBlock(), createElementBlock("div", _hoisted_11, toDisplayString(unref(t)("subscription.mostPopular")), 1)) : createCommentVNode("", true)]),
							createBaseVNode("div", _hoisted_12, [createBaseVNode("div", _hoisted_13, [createBaseVNode("span", _hoisted_14, [createTextVNode(" $" + toDisplayString(getPrice(tier)) + " ", 1), withDirectives(createBaseVNode("span", { class: "text-2xl text-muted-foreground line-through" }, " $" + toDisplayString(getMonthlyPrice(tier)), 513), [[vShow, currentBillingCycle.value === "yearly"]])]), createBaseVNode("span", _hoisted_15, toDisplayString(unref(t)("subscription.usdPerMonth")), 1)]), createBaseVNode("span", _hoisted_16, toDisplayString(currentBillingCycle.value === "yearly" ? unref(t)("subscription.billedYearly", { total: `$${getAnnualTotal(tier)}` }) : unref(t)("subscription.billedMonthly")), 1)]),
							_cache[6] || (_cache[6] = createBaseVNode("div", { class: "h-px w-full bg-border-default" }, null, -1)),
							createBaseVNode("div", _hoisted_17, [createBaseVNode("span", _hoisted_18, toDisplayString(tier.featuresHeader), 1), (openBlock(true), createElementBlock(Fragment, null, renderList(tier.features, (feature) => {
								return openBlock(), createElementBlock("div", {
									key: feature,
									class: "flex flex-row items-start gap-2"
								}, [_cache[4] || (_cache[4] = createBaseVNode("i", { class: "pi pi-check mt-0.5 text-xs text-base-foreground" }, null, -1)), createBaseVNode("span", _hoisted_19, toDisplayString(feature), 1)]);
							}), 128))]),
							createBaseVNode("div", _hoisted_20, [createBaseVNode("div", _hoisted_21, [
								_cache[5] || (_cache[5] = createBaseVNode("i", {
									class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400",
									"aria-hidden": "true"
								}, null, -1)),
								createBaseVNode("span", _hoisted_22, toDisplayString(unref(n)(tier.pricing.credits)), 1),
								createBaseVNode("span", _hoisted_23, toDisplayString(unref(t)("subscription.monthlyCredits")), 1)
							]), createBaseVNode("span", _hoisted_24, toDisplayString(unref(t)("subscription.videoEstimate", { count: unref(n)(tier.pricing.videoEstimate) })), 1)])
						]), createBaseVNode("div", _hoisted_25, [createVNode(Button_default, {
							variant: getButtonSeverity(tier),
							disabled: isButtonDisabled(tier),
							loading: __props.loadingTier === tier.key,
							class: normalizeClass(unref(cn)("h-10 w-full", getButtonTextClass(tier), tier.key === "creator" ? "border-transparent bg-base-foreground hover:bg-inverted-background-hover" : "border-transparent bg-secondary-background hover:bg-secondary-background-hover focus:bg-secondary-background-selected")),
							onClick: () => handleSubscribe(tier.key)
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(getButtonLabel(tier)), 1)]),
							_: 2
						}, 1032, [
							"variant",
							"disabled",
							"loading",
							"class",
							"onClick"
						])])]);
					}), 64))])) : (openBlock(), createElementBlock("div", _hoisted_26, [createBaseVNode("div", _hoisted_27, [createBaseVNode("div", _hoisted_28, [
						createBaseVNode("div", _hoisted_29, [
							createBaseVNode("div", _hoisted_30, [createBaseVNode("span", _hoisted_31, toDisplayString(unref(t)("subscription.teamPlan.name")), 1), createBaseVNode("span", _hoisted_32, toDisplayString(unref(t)("subscription.teamPlan.tagline")), 1)]),
							createVNode(CreditSlider_default, {
								modelValue: teamUsd.value,
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => teamUsd.value = $event),
								stops: teamStops.value,
								"default-stop-index": teamDefaultStopIndex.value,
								cycle: currentBillingCycle.value
							}, null, 8, [
								"modelValue",
								"stops",
								"default-stop-index",
								"cycle"
							]),
							createBaseVNode("div", _hoisted_33, [createBaseVNode("div", _hoisted_34, [
								_cache[7] || (_cache[7] = createBaseVNode("i", {
									class: "icon-[comfy--credits] size-4 shrink-0 bg-amber-400",
									"aria-hidden": "true"
								}, null, -1)),
								createBaseVNode("span", _hoisted_35, toDisplayString(unref(n)(teamCredits.value)), 1),
								createBaseVNode("span", _hoisted_36, toDisplayString(unref(t)("subscription.monthlyCredits")), 1)
							]), createBaseVNode("span", _hoisted_37, toDisplayString(unref(t)("subscription.videoEstimate", { count: unref(n)(teamVideoEstimate.value) })), 1)]),
							createVNode(Button_default, {
								variant: "inverted",
								disabled: isTeamButtonDisabled.value,
								class: "mt-auto h-10 w-full font-inter text-sm/normal font-bold",
								onClick: handleSubscribeTeam
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(teamButtonLabel.value), 1)]),
								_: 1
							}, 8, ["disabled"])
						]),
						_cache[10] || (_cache[10] = createBaseVNode("div", { class: "h-px w-full shrink-0 self-stretch bg-border-default xl:h-auto xl:w-px" }, null, -1)),
						createBaseVNode("div", _hoisted_38, [
							createBaseVNode("span", _hoisted_39, toDisplayString(unref(t)("subscription.teamPlan.detailsTitle")), 1),
							createBaseVNode("div", _hoisted_40, [createBaseVNode("span", _hoisted_41, toDisplayString(unref(t)("subscription.everythingInPlus", { plan: unref(t)("subscription.tiers.pro.name") })), 1), (openBlock(), createElementBlock(Fragment, null, renderList(teamDetailPerks, (perk) => {
								return createBaseVNode("div", {
									key: perk,
									class: "flex flex-row items-start gap-2"
								}, [_cache[8] || (_cache[8] = createBaseVNode("i", { class: "pi pi-check mt-0.5 text-xs text-base-foreground" }, null, -1)), createBaseVNode("span", _hoisted_42, toDisplayString(perk), 1)]);
							}), 64))]),
							createBaseVNode("div", _hoisted_43, [createBaseVNode("span", _hoisted_44, toDisplayString(unref(t)("subscription.teamPlan.comingSoonLabel")), 1), createBaseVNode("div", _hoisted_45, [_cache[9] || (_cache[9] = createBaseVNode("i", { class: "pi pi-clock mt-0.5 text-xs text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_46, toDisplayString(unref(t)("subscription.teamPlan.perkProjectAssets")), 1)])])
						])
					]), createBaseVNode("div", _hoisted_47, [
						createBaseVNode("span", _hoisted_48, toDisplayString(unref(t)("subscription.enterprise.name")), 1),
						createBaseVNode("div", _hoisted_49, [createBaseVNode("span", _hoisted_50, toDisplayString(unref(t)("subscription.enterprise.needMoreMembers")), 1), createBaseVNode("span", _hoisted_51, toDisplayString(unref(t)("subscription.enterprise.flexibility")), 1)]),
						_cache[11] || (_cache[11] = createBaseVNode("div", { class: "h-px w-full bg-border-default" }, null, -1)),
						createBaseVNode("span", _hoisted_52, toDisplayString(unref(t)("subscription.enterprise.reachOut")), 1),
						createVNode(Button_default, {
							variant: "secondary",
							class: "mt-auto h-10 w-full border-transparent bg-secondary-background font-bold hover:bg-secondary-background-hover",
							onClick: handleViewEnterprise
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("subscription.enterprise.cta")), 1)]),
							_: 1
						})
					])])]))
				]),
				createVNode(unref(I18nT), {
					keypath: "subscription.pricingBlurb",
					tag: "p",
					class: "m-0 mt-auto pt-4 text-center text-sm text-text-secondary"
				}, {
					seeDetails: withCtx(() => [createBaseVNode("a", {
						href: VIDEO_TEMPLATE_URL,
						target: "_blank",
						rel: "noopener noreferrer",
						class: "cursor-pointer text-sm text-base-foreground no-underline hover:text-muted-foreground"
					}, toDisplayString(unref(t)("subscription.pricingBlurbSeeDetails")), 1)]),
					questions: withCtx(() => [createBaseVNode("a", {
						href: QUESTIONS_URL,
						target: "_blank",
						rel: "noopener noreferrer",
						class: "cursor-pointer text-sm text-base-foreground no-underline hover:text-muted-foreground"
					}, toDisplayString(unref(t)("subscription.pricingBlurbQuestions")), 1)]),
					enterpriseDiscussions: withCtx(() => [createBaseVNode("a", {
						href: ENTERPRISE_URL,
						target: "_blank",
						rel: "noopener noreferrer",
						class: "cursor-pointer text-sm text-base-foreground no-underline hover:text-muted-foreground"
					}, toDisplayString(unref(t)("subscription.pricingBlurbEnterprise")), 1)]),
					clickHere: withCtx(() => [createBaseVNode("a", {
						href: PRICING_URL,
						target: "_blank",
						rel: "noopener noreferrer",
						class: "cursor-pointer text-sm text-base-foreground no-underline hover:text-muted-foreground"
					}, toDisplayString(unref(t)("subscription.pricingBlurbClickHere")), 1)]),
					_: 1
				})
			]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/SubscriptionRequiredDialogContentUnified.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex flex-col items-center gap-3" };
var _hoisted_2 = { class: "m-0 font-inter text-2xl font-semibold text-base-foreground" };
var _hoisted_3 = {
	key: 1,
	class: "text-center"
};
var _hoisted_4 = { class: "m-0 text-xl text-muted-foreground lg:text-2xl" };
var _hoisted_5 = { class: "m-0 mt-2 text-sm text-text-secondary" };
//#endregion
//#region src/platform/workspace/components/SubscriptionRequiredDialogContentUnified.vue
var SubscriptionRequiredDialogContentUnified_default = /* @__PURE__ */ defineComponent({
	__name: "SubscriptionRequiredDialogContentUnified",
	props: {
		onClose: { type: Function },
		reason: {},
		initialPlanMode: {}
	},
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const { checkoutStep, isLoadingPreview, loadingTier, isSubscribing, isResubscribing, previewData, selectedTierKey, selectedTeamStop, selectedBillingCycle, isPolling, isTeamCheckout, previewVariant, handleSubscribeClick, handleSubscribeTeamClick, handleBackToPricing, handleSuccessClose, handleAddCreditCard, handleConfirmTransition, handleTeamSubscribe, handleResubscribe } = useSubscriptionCheckout(__emit, __props.reason);
		useEventListener(window, "keydown", (event) => {
			if (event.key !== "Backspace" || checkoutStep.value !== "preview") return;
			const target = event.target;
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target instanceof HTMLElement && target.isContentEditable) return;
			event.preventDefault();
			handleBackToPricing();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(unref(cn)("relative flex h-full flex-col gap-4 overflow-y-auto p-4 pt-6", unref(checkoutStep) === "pricing" && "xl:min-h-[min(740px,90vh)] xl:w-[min(1280px,95vw)]")) }, [
				unref(checkoutStep) === "preview" ? (openBlock(), createBlock(Button_default, {
					key: 0,
					size: "icon",
					variant: "muted-textonly",
					class: "absolute top-2.5 left-2.5 shrink-0 rounded-full text-text-secondary hover:bg-white/10",
					"aria-label": _ctx.$t("g.back"),
					onClick: unref(handleBackToPricing)
				}, {
					default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-arrow-left text-xl" }, null, -1)])]),
					_: 1
				}, 8, ["aria-label", "onClick"])) : createCommentVNode("", true),
				createVNode(Button_default, {
					size: "icon",
					variant: "muted-textonly",
					class: "absolute top-2.5 right-2.5 shrink-0 rounded-full text-text-secondary hover:bg-white/10",
					"aria-label": _ctx.$t("g.close"),
					onClick: __props.onClose
				}, {
					default: withCtx(() => [..._cache[1] || (_cache[1] = [createBaseVNode("i", { class: "pi pi-times text-xl" }, null, -1)])]),
					_: 1
				}, 8, ["aria-label", "onClick"]),
				createBaseVNode("div", _hoisted_1, [createBaseVNode("h2", _hoisted_2, toDisplayString(_ctx.$t("subscription.descriptionWorkspace")), 1)]),
				__props.reason === "out_of_credits" ? (openBlock(), createElementBlock("div", _hoisted_3, [createBaseVNode("h2", _hoisted_4, toDisplayString(_ctx.$t("credits.topUp.insufficientTitle")), 1), createBaseVNode("p", _hoisted_5, toDisplayString(_ctx.$t("credits.topUp.insufficientMessage")), 1)])) : createCommentVNode("", true),
				withDirectives(createVNode(UnifiedPricingTable_default, {
					class: "xl:flex-1",
					"initial-plan-mode": __props.initialPlanMode,
					"is-loading": unref(isLoadingPreview) || unref(isResubscribing),
					"loading-tier": unref(loadingTier),
					onSubscribe: unref(handleSubscribeClick),
					onResubscribe: unref(handleResubscribe),
					onSubscribeTeam: unref(handleSubscribeTeamClick)
				}, null, 8, [
					"initial-plan-mode",
					"is-loading",
					"loading-tier",
					"onSubscribe",
					"onResubscribe",
					"onSubscribeTeam"
				]), [[vShow, unref(checkoutStep) === "pricing"]]),
				unref(checkoutStep) === "preview" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [unref(previewVariant) === "team-change" ? (openBlock(), createBlock(SubscriptionTransitionPreviewWorkspace_default, {
					key: 0,
					"preview-data": unref(previewData),
					"team-plan": unref(selectedTeamStop),
					"is-loading": unref(isSubscribing) || unref(isPolling),
					onConfirm: unref(handleTeamSubscribe),
					onBack: unref(handleBackToPricing)
				}, null, 8, [
					"preview-data",
					"team-plan",
					"is-loading",
					"onConfirm",
					"onBack"
				])) : unref(previewVariant) === "team-new" ? (openBlock(), createBlock(SubscriptionAddPaymentPreviewWorkspace_default, {
					key: 1,
					"team-plan": unref(selectedTeamStop),
					"billing-cycle": unref(selectedBillingCycle),
					"is-loading": unref(isSubscribing) || unref(isPolling),
					onAddCreditCard: unref(handleTeamSubscribe),
					onBack: unref(handleBackToPricing)
				}, null, 8, [
					"team-plan",
					"billing-cycle",
					"is-loading",
					"onAddCreditCard",
					"onBack"
				])) : unref(previewVariant) === "personal-new" ? (openBlock(), createBlock(SubscriptionAddPaymentPreviewWorkspace_default, {
					key: 2,
					"preview-data": unref(previewData),
					"tier-key": unref(selectedTierKey),
					"billing-cycle": unref(selectedBillingCycle),
					"is-loading": unref(isSubscribing) || unref(isPolling),
					onAddCreditCard: unref(handleAddCreditCard),
					onBack: unref(handleBackToPricing)
				}, null, 8, [
					"preview-data",
					"tier-key",
					"billing-cycle",
					"is-loading",
					"onAddCreditCard",
					"onBack"
				])) : unref(previewVariant) === "personal-change" ? (openBlock(), createBlock(SubscriptionTransitionPreviewWorkspace_default, {
					key: 3,
					"preview-data": unref(previewData),
					"is-loading": unref(isSubscribing) || unref(isPolling),
					onConfirm: unref(handleConfirmTransition),
					onBack: unref(handleBackToPricing)
				}, null, 8, [
					"preview-data",
					"is-loading",
					"onConfirm",
					"onBack"
				])) : createCommentVNode("", true)], 64)) : createCommentVNode("", true),
				unref(checkoutStep) === "success" && (unref(selectedTierKey) || unref(isTeamCheckout)) ? (openBlock(), createBlock(SubscriptionSuccessWorkspace_default, {
					key: 3,
					"tier-key": unref(selectedTierKey),
					"team-plan": unref(selectedTeamStop),
					"preview-data": unref(previewData),
					"is-team": unref(isTeamCheckout),
					onClose: unref(handleSuccessClose)
				}, null, 8, [
					"tier-key",
					"team-plan",
					"preview-data",
					"is-team",
					"onClose"
				])) : createCommentVNode("", true)
			], 2);
		};
	}
});
//#endregion
export { SubscriptionRequiredDialogContentUnified_default as default };

//# sourceMappingURL=SubscriptionRequiredDialogContentUnified-DydjG9mh.js.map