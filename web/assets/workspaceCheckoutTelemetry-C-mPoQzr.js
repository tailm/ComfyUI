import "./rolldown-runtime-w0pxe0c8.js";
import { Yi as useAuthStore } from "./promotionUtils-vKoNYnM9.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
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
	const { userId } = useAuthStore();
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
export { mapApiTeamCreditStops as a, getTeamPlanSlug as i, TEAM_PLAN_CREDIT_STOPS as n, getStopDiscountedMonthlyUsd as r, trackWorkspaceCheckoutStarted as t };

//# sourceMappingURL=workspaceCheckoutTelemetry-C-mPoQzr.js.map