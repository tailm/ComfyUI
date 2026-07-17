import "./rolldown-runtime-w0pxe0c8.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
//#region src/platform/telemetry/topupTracker.ts
var STORAGE_KEY = "pending_topup_timestamp";
var MAX_AGE_MS = 1440 * 60 * 1e3;
/**
* Start tracking a credit top-up purchase.
* Call this before opening the Stripe checkout window.
*/
function startTopupTracking() {
	localStorage.setItem(STORAGE_KEY, Date.now().toString());
}
/**
* Check if a pending top-up has completed by looking for a credit_added event
* that occurred after the tracking started.
*
* @param events - Array of audit log events to check
* @returns true if a completed top-up was detected and telemetry was sent
*/
function checkForCompletedTopup(events) {
	const timestampStr = localStorage.getItem(STORAGE_KEY);
	if (!timestampStr) return false;
	const timestamp = parseInt(timestampStr, 10);
	if (Date.now() - timestamp > MAX_AGE_MS) {
		localStorage.removeItem(STORAGE_KEY);
		return false;
	}
	if (!events || events.length === 0) return false;
	if (events.find((e) => (e.event_type === "credit_added" || e.event_type === "topup_completed") && e.createdAt && new Date(e.createdAt).getTime() > timestamp)) {
		useTelemetry()?.trackApiCreditTopupSucceeded();
		localStorage.removeItem(STORAGE_KEY);
		return true;
	}
	return false;
}
/**
* Clear any pending top-up tracking.
* Useful for testing or manual cleanup.
*/
function clearTopupTracking() {
	localStorage.removeItem(STORAGE_KEY);
}
/**
* Consume a pending top-up marker on window focus. Clears the marker and
* reports whether a non-expired purchase was awaiting a balance refresh.
*/
function consumePendingTopup() {
	const timestampStr = localStorage.getItem(STORAGE_KEY);
	if (!timestampStr) return false;
	localStorage.removeItem(STORAGE_KEY);
	const timestamp = parseInt(timestampStr, 10);
	return Date.now() - timestamp <= MAX_AGE_MS;
}
//#endregion
export { startTopupTracking as i, clearTopupTracking as n, consumePendingTopup as r, checkForCompletedTopup as t };

//# sourceMappingURL=topupTracker-BHv_2BbS.js.map