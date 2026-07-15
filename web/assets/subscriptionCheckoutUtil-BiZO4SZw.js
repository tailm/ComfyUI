import "./rolldown-runtime-w0pxe0c8.js";
import { f as storeToRefs } from "./vendor-vue-core-D3WB7mNE.js";
import { Fi as persistPendingSubscriptionCheckoutAttempt, Ji as AuthStoreError, Li as withPendingCheckoutAttemptId, Pi as createPendingSubscriptionCheckoutAttempt, Yi as useAuthStore, ra as getComfyApiBaseUrl } from "./promotionUtils-vKoNYnM9.js";
import { c as t } from "./i18n-DAE2CSwM.js";
import { H as fetchWithUnifiedRemint } from "./api-DrovjuJk.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
import { n as useFeatureFlags } from "./useFeatureFlags-DVgtsxbC.js";
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
	const authStore = useAuthStore();
	const { userId } = storeToRefs(authStore);
	const telemetry = useTelemetry();
	const authHeader = await authStore.getAuthHeader();
	if (!authHeader) throw new AuthStoreError(t("toastMessages.userNotAuthenticated"));
	const checkoutTier = getCheckoutTier(tierKey, currentBillingCycle);
	let checkoutAttribution = {};
	try {
		checkoutAttribution = await getCheckoutAttributionForCloud();
	} catch (error) {
		console.warn("[SubscriptionCheckout] Failed to collect checkout attribution", error);
	}
	const checkoutPayload = { ...checkoutAttribution };
	const response = await fetchWithUnifiedRemint(`${getComfyApiBaseUrl()}/customers/cloud-subscription-checkout/${checkoutTier}`, {
		method: "POST",
		headers: {
			...authHeader,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(checkoutPayload)
	}, isCloud && useFeatureFlags().flags.unifiedCloudAuthEnabled);
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
		throw new AuthStoreError(t("toastMessages.failedToInitiateSubscription", { error: errorMessage }));
	}
	const data = await response.json();
	if (data.checkout_url) {
		const pendingAttempt = createPendingSubscriptionCheckoutAttempt({
			tier: tierKey,
			cycle: currentBillingCycle,
			checkout_type: "new",
			payment_intent_source: paymentIntentSource
		});
		if (userId.value) telemetry?.trackBeginCheckout(withPendingCheckoutAttemptId({
			user_id: userId.value,
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
export { performSubscriptionCheckout as t };

//# sourceMappingURL=subscriptionCheckoutUtil-BiZO4SZw.js.map