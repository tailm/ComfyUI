import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, M as createBlock, V as defineComponent, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
import { Ii as TIER_TO_KEY, zi as getTierPrice } from "./promotionUtils-BlyjkT7V.js";
import { t as TopbarBadge_default } from "./TopbarBadge-DmBtDblb.js";
//#endregion
//#region src/components/topbar/CloudBadge.vue
var CloudBadge_default = /* @__PURE__ */ defineComponent({
	__name: "CloudBadge",
	props: {
		displayMode: { default: "full" },
		reverseOrder: { type: Boolean },
		noPadding: { type: Boolean },
		backgroundColor: { default: "var(--comfy-menu-bg)" }
	},
	setup(__props) {
		const cloudBadge = computed(() => ({
			icon: "icon-[lucide--cloud]",
			text: "Comfy Cloud"
		}));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(TopbarBadge_default, {
				badge: cloudBadge.value,
				"display-mode": __props.displayMode,
				"reverse-order": __props.reverseOrder,
				"no-padding": __props.noPadding,
				"background-color": __props.backgroundColor
			}, null, 8, [
				"badge",
				"display-mode",
				"reverse-order",
				"no-padding",
				"background-color"
			]);
		};
	}
});
//#endregion
//#region src/platform/cloud/subscription/utils/subscriptionCheckoutTracker.ts
var PENDING_SUBSCRIPTION_CHECKOUT_MAX_AGE_MS = 360 * 60 * 1e3;
var VALID_TIER_KEYS = new Set([
	"free",
	"standard",
	"creator",
	"pro",
	"founder"
]);
var PENDING_SUBSCRIPTION_CHECKOUT_STORAGE_KEY = "comfy.subscription.pending_checkout_attempt";
var PENDING_SUBSCRIPTION_CHECKOUT_EVENT = "comfy:subscription-checkout-attempt-changed";
var dispatchPendingCheckoutChangeEvent = () => {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(PENDING_SUBSCRIPTION_CHECKOUT_EVENT));
};
var createAttemptId = () => {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return `attempt-${Date.now()}`;
};
var getStorage = () => {
	let storage;
	try {
		storage = globalThis.localStorage;
	} catch {
		return null;
	}
	if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function" || typeof storage.removeItem !== "function") return null;
	return storage;
};
var getAnnualCheckoutValue = (tier) => getTierPrice(tier, true) * 12;
var getCheckoutValue = (tier, cycle) => {
	if (tier === "free" || tier === "founder") return getTierPrice(tier, cycle === "yearly");
	return cycle === "yearly" ? getAnnualCheckoutValue(tier) : getTierPrice(tier, false);
};
var getTierFromStatus = (status) => {
	const subscriptionTier = status.subscription_tier;
	if (!subscriptionTier) return null;
	return TIER_TO_KEY[subscriptionTier] ?? null;
};
var getCycleFromStatus = (status) => {
	if (status.subscription_duration === "ANNUAL") return "yearly";
	if (status.subscription_duration === "MONTHLY") return "monthly";
	return null;
};
var isExpired = (attempt) => Date.now() - attempt.started_at_ms > PENDING_SUBSCRIPTION_CHECKOUT_MAX_AGE_MS;
var normalizeAttempt = (value) => {
	if (!value || typeof value !== "object") return null;
	const candidate = value;
	if (typeof candidate.attempt_id !== "string" || typeof candidate.started_at_ms !== "number" || typeof candidate.tier !== "string" || typeof candidate.cycle !== "string" || typeof candidate.checkout_type !== "string") return null;
	if (!VALID_TIER_KEYS.has(candidate.tier) || candidate.cycle !== "monthly" && candidate.cycle !== "yearly" || candidate.checkout_type !== "new" && candidate.checkout_type !== "change") return null;
	return {
		attempt_id: candidate.attempt_id,
		started_at_ms: candidate.started_at_ms,
		tier: candidate.tier,
		cycle: candidate.cycle,
		checkout_type: candidate.checkout_type,
		...candidate.previous_tier && VALID_TIER_KEYS.has(candidate.previous_tier) ? { previous_tier: candidate.previous_tier } : {},
		...candidate.previous_cycle === "monthly" || candidate.previous_cycle === "yearly" ? { previous_cycle: candidate.previous_cycle } : {},
		...typeof candidate.payment_intent_source === "string" ? { payment_intent_source: candidate.payment_intent_source } : {}
	};
};
var clearPendingSubscriptionCheckoutAttempt = () => {
	const storage = getStorage();
	if (!storage) return;
	try {
		storage.removeItem(PENDING_SUBSCRIPTION_CHECKOUT_STORAGE_KEY);
	} catch {
		return;
	}
	dispatchPendingCheckoutChangeEvent();
};
var getPendingSubscriptionCheckoutAttempt = () => {
	const storage = getStorage();
	if (!storage) return null;
	let rawAttempt;
	try {
		rawAttempt = storage.getItem(PENDING_SUBSCRIPTION_CHECKOUT_STORAGE_KEY);
	} catch {
		return null;
	}
	if (!rawAttempt) return null;
	try {
		const attempt = normalizeAttempt(JSON.parse(rawAttempt));
		if (!attempt || isExpired(attempt)) {
			clearPendingSubscriptionCheckoutAttempt();
			return null;
		}
		return attempt;
	} catch {
		clearPendingSubscriptionCheckoutAttempt();
		return null;
	}
};
var hasPendingSubscriptionCheckoutAttempt = () => getPendingSubscriptionCheckoutAttempt() !== null;
var createPendingSubscriptionCheckoutAttempt = (input) => {
	return {
		attempt_id: createAttemptId(),
		started_at_ms: Date.now(),
		tier: input.tier,
		cycle: input.cycle,
		checkout_type: input.checkout_type,
		...input.previous_tier ? { previous_tier: input.previous_tier } : {},
		...input.previous_cycle ? { previous_cycle: input.previous_cycle } : {},
		...input.payment_intent_source ? { payment_intent_source: input.payment_intent_source } : {}
	};
};
var persistPendingSubscriptionCheckoutAttempt = (attempt) => {
	const storage = getStorage();
	if (!storage) return attempt;
	try {
		storage.setItem(PENDING_SUBSCRIPTION_CHECKOUT_STORAGE_KEY, JSON.stringify(attempt));
	} catch {
		return attempt;
	}
	dispatchPendingCheckoutChangeEvent();
	return attempt;
};
var recordPendingSubscriptionCheckoutAttempt = (input) => persistPendingSubscriptionCheckoutAttempt(createPendingSubscriptionCheckoutAttempt(input));
var withPendingCheckoutAttemptId = (metadata, attempt) => ({
	...metadata,
	checkout_attempt_id: attempt.attempt_id
});
var didAttemptSucceed = (attempt, status) => {
	if (!status.is_active) return false;
	return getTierFromStatus(status) === attempt.tier && getCycleFromStatus(status) === attempt.cycle;
};
var consumePendingSubscriptionCheckoutSuccess = (status) => {
	const attempt = getPendingSubscriptionCheckoutAttempt();
	if (!attempt || !didAttemptSucceed(attempt, status)) return null;
	clearPendingSubscriptionCheckoutAttempt();
	const value = getCheckoutValue(attempt.tier, attempt.cycle);
	return {
		checkout_attempt_id: attempt.attempt_id,
		tier: attempt.tier,
		cycle: attempt.cycle,
		checkout_type: attempt.checkout_type,
		...attempt.previous_tier ? { previous_tier: attempt.previous_tier } : {},
		...attempt.payment_intent_source ? { payment_intent_source: attempt.payment_intent_source } : {},
		value,
		currency: "USD",
		ecommerce: {
			value,
			currency: "USD",
			items: [{
				item_name: attempt.tier,
				item_category: "subscription",
				item_variant: attempt.cycle,
				price: value,
				quantity: 1
			}]
		}
	};
};
//#endregion
export { createPendingSubscriptionCheckoutAttempt as a, recordPendingSubscriptionCheckoutAttempt as c, consumePendingSubscriptionCheckoutSuccess as i, withPendingCheckoutAttemptId as l, PENDING_SUBSCRIPTION_CHECKOUT_STORAGE_KEY as n, hasPendingSubscriptionCheckoutAttempt as o, clearPendingSubscriptionCheckoutAttempt as r, persistPendingSubscriptionCheckoutAttempt as s, PENDING_SUBSCRIPTION_CHECKOUT_EVENT as t, CloudBadge_default as u };

//# sourceMappingURL=subscriptionCheckoutTracker-Bp3RZZCh.js.map