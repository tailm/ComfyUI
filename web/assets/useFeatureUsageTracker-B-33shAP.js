import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed } from "./vendor-vue-core-ywZ1En3W.js";
import { H as useStorage } from "./vendor-vueuse-D8rwdKM0.js";
//#region src/platform/surveys/surveyRegistry.ts
/**
* Registry of all feature surveys.
* Add new surveys here when targeting specific features for feedback.
*/
var FEATURE_SURVEYS = {
	"node-search": {
		featureId: "node-search",
		typeformId: "goZLqjKL",
		triggerThreshold: 3,
		delayMs: 5e3
	},
	"queue-progress-overlay": {
		featureId: "queue-progress-overlay",
		typeformId: "HZ5saxry",
		triggerThreshold: 16,
		delayMs: 5e3
	},
	"error-panel": {
		featureId: "error-panel",
		typeformId: "iFp4p4mV",
		triggerThreshold: 3,
		presentation: "inline-cta"
	}
};
function getSurveyConfig(featureId) {
	return FEATURE_SURVEYS[featureId];
}
function getEnabledSurveys() {
	return Object.values(FEATURE_SURVEYS).filter((config) => config.enabled !== false);
}
/**
* Surveys that should auto-popup via the global controller.
* Inline-CTA surveys are excluded because their feature-site renders them.
*/
function getFloatingSurveys() {
	return getEnabledSurveys().filter((config) => (config.presentation ?? "floating") === "floating");
}
//#endregion
//#region src/platform/surveys/useFeatureUsageTracker.ts
var STORAGE_KEY = "Comfy.FeatureUsage";
/**
* Tracks feature usage for survey eligibility.
* Persists to localStorage.
*/
function useFeatureUsageTracker(featureId) {
	const usageData = useStorage(STORAGE_KEY, {});
	const usage = computed(() => usageData.value[featureId]);
	const useCount = computed(() => usage.value?.useCount ?? 0);
	function trackUsage() {
		const now = Date.now();
		const existing = usageData.value[featureId];
		usageData.value[featureId] = {
			useCount: (existing?.useCount ?? 0) + 1,
			firstUsed: existing?.firstUsed ?? now,
			lastUsed: now
		};
	}
	function reset() {
		delete usageData.value[featureId];
	}
	return {
		usage,
		useCount,
		trackUsage,
		reset
	};
}
//#endregion
export { getFloatingSurveys as n, getSurveyConfig as r, useFeatureUsageTracker as t };

//# sourceMappingURL=useFeatureUsageTracker-B-33shAP.js.map