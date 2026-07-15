import "./rolldown-runtime-w0pxe0c8.js";
import { Mt as ref, j as computed, zt as toValue } from "./vendor-vue-core-D3WB7mNE.js";
import { H as useStorage, lt as whenever } from "./vendor-vueuse-BA2QXdyV.js";
import "./types-4cVPtFn2.js";
import { t as useFeatureUsageTracker } from "./useFeatureUsageTracker-Dmo_jNxY.js";
import { t as createScriptLoader } from "./loadExternalScript-DaB_1k_B.js";
//#region src/platform/surveys/useErrorSurveyPopoverState.ts
/**
* Singleton state for the error panel survey popover visibility.
* Kept at module scope so popover visibility survives the lifecycle of
* individual host components (e.g. the error tab being destroyed when no
* errors remain). Together with the popover component keeping its
* Teleport mounted after the first open, this is what preserves the
* Typeform iframe across workflow switches.
*/
var isPopoverOpen = ref(false);
function useErrorSurveyPopoverState() {
	function open() {
		isPopoverOpen.value = true;
	}
	return {
		isPopoverOpen,
		open
	};
}
//#endregion
//#region src/platform/surveys/useSurveyEligibility.ts
var STORAGE_KEY = "Comfy.SurveyState";
var GLOBAL_COOLDOWN_MS = 5760 * 60 * 1e3;
var DEFAULT_THRESHOLD = 3;
var DEFAULT_DELAY_MS = 5e3;
function useSurveyEligibility(config) {
	const state = useStorage(STORAGE_KEY, {
		optedOut: false,
		seenSurveys: {}
	});
	const resolvedConfig = computed(() => toValue(config));
	const { useCount } = useFeatureUsageTracker(resolvedConfig.value.featureId);
	const threshold = computed(() => resolvedConfig.value.triggerThreshold ?? DEFAULT_THRESHOLD);
	const delayMs = computed(() => resolvedConfig.value.delayMs ?? DEFAULT_DELAY_MS);
	const isSurveyEnabled = computed(() => resolvedConfig.value.enabled ?? true);
	const isNightlyLocalhost = computed(() => false);
	const hasReachedThreshold = computed(() => useCount.value >= threshold.value);
	const hasSeenSurvey = computed(() => !!state.value.seenSurveys[resolvedConfig.value.featureId]);
	const isInGlobalCooldown = computed(() => {
		const timestamps = Object.values(state.value.seenSurveys);
		if (timestamps.length === 0) return false;
		const lastShown = Math.max(...timestamps);
		return Date.now() - lastShown < GLOBAL_COOLDOWN_MS;
	});
	const hasOptedOut = computed(() => state.value.optedOut);
	const isEligible = computed(() => {
		if (!isSurveyEnabled.value) return false;
		if (!isNightlyLocalhost.value) return false;
		if (!hasReachedThreshold.value) return false;
		if (hasSeenSurvey.value) return false;
		if (isInGlobalCooldown.value) return false;
		if (hasOptedOut.value) return false;
		return true;
	});
	function markSurveyShown() {
		state.value.seenSurveys[resolvedConfig.value.featureId] = Date.now();
	}
	function optOut() {
		state.value.optedOut = true;
	}
	function resetState() {
		state.value = {
			optedOut: false,
			seenSurveys: {}
		};
	}
	return {
		isEligible,
		delayMs,
		markSurveyShown,
		optOut,
		resetState
	};
}
//#endregion
//#region src/platform/surveys/useTypeformEmbed.ts
var TYPEFORM_SRC = "https://embed.typeform.com/next/embed.js";
var VALID_ID_PATTERN = /^[A-Za-z0-9]+$/;
/** Pure validator for Typeform form IDs. Exported so feature sites can
*  gate rendering before mounting the embed container. */
function isTypeformIdValid(id) {
	return !!id && VALID_ID_PATTERN.test(id);
}
var loadTypeformScript = createScriptLoader(TYPEFORM_SRC, () => typeof window.tf?.load === "function" ? window.tf : null);
function ensureScriptLoaded() {
	return loadTypeformScript();
}
/**
* Loads the Typeform embed script on first consumer mount and exposes
* validation + error state for an inline form container. After the
* script is ready, `window.tf.load()` is called each time a new
* container appears so Typeform re-scans for the new `data-tf-widget`
* element — the embed's DOMContentLoaded auto-scan only runs once and
* its MutationObserver does not reliably catch elements added by later
* consumers (e.g. a second popover opening later in the session).
* `load()` with `forceReload: false` is idempotent for already-
* initialized elements.
*/
function useTypeformEmbed(typeformRef, typeformIdInput) {
	const typeformError = ref(false);
	const isValidTypeformId = computed(() => isTypeformIdValid(toValue(typeformIdInput)));
	const typeformId = computed(() => isValidTypeformId.value ? toValue(typeformIdInput) ?? "" : "");
	whenever(typeformRef, async () => {
		try {
			await ensureScriptLoaded();
			const tf = window.tf;
			if (typeof tf?.load !== "function") throw new Error("Typeform API unavailable after script load");
			tf.load();
		} catch (err) {
			console.error("[useTypeformEmbed]", err);
			typeformError.value = true;
		}
	});
	return {
		typeformError,
		isValidTypeformId,
		typeformId
	};
}
//#endregion
export { useErrorSurveyPopoverState as i, useTypeformEmbed as n, useSurveyEligibility as r, isTypeformIdValid as t };

//# sourceMappingURL=useTypeformEmbed-9tnadXWC.js.map