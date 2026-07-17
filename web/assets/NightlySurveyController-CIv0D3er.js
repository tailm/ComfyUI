import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Bt as unref, D as Teleport, Et as isRef, Gt as toDisplayString, Ht as normalizeClass, J as mergeModels, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, d as storeToRefs, gt as watch, ht as useTemplateRef, j as createBaseVNode, jt as ref, p as Transition, pt as useModel, rt as openBlock, tt as onUnmounted, x as vShow, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Wt as useExecutionErrorStore, pn as useSurveyFeatureTracking } from "./promotionUtils-D7bbpSd5.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { n as getFloatingSurveys, r as getSurveyConfig } from "./useFeatureUsageTracker-B-33shAP.js";
import { i as useErrorSurveyPopoverState, n as useTypeformEmbed, r as useSurveyEligibility } from "./useTypeformEmbed-Df7CRFRk.js";
//#region src/platform/surveys/NightlySurveyPopover.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	"data-testid": "nightly-survey-popover",
	class: "fixed right-4 bottom-4 z-10000 w-80 rounded-lg border border-border-subtle bg-base-background p-4 shadow-lg"
};
var _hoisted_2 = { class: "mb-2 flex items-center justify-end" };
var _hoisted_3 = {
	key: 0,
	class: "text-danger text-sm"
};
var _hoisted_4 = ["data-tf-widget"];
//#endregion
//#region src/platform/surveys/NightlySurveyPopover.vue
var NightlySurveyPopover_default = /* @__PURE__ */ defineComponent({
	__name: "NightlySurveyPopover",
	props: /* @__PURE__ */ mergeModels({
		config: {},
		mode: { default: "eligible" }
	}, {
		"open": {
			type: Boolean,
			default: false
		},
		"openModifiers": {}
	}),
	emits: /* @__PURE__ */ mergeModels([
		"shown",
		"dismissed",
		"optedOut"
	], ["update:open"]),
	setup(__props, { emit: __emit }) {
		const openModel = useModel(__props, "open");
		const emit = __emit;
		const { t } = useI18n();
		const { isEligible, delayMs, markSurveyShown, optOut } = useSurveyEligibility(() => __props.config);
		const hasOpenedOnce = ref(openModel.value);
		const typeformRef = useTemplateRef("typeformRef");
		const { typeformError, isValidTypeformId, typeformId } = useTypeformEmbed(typeformRef, () => __props.config.typeformId);
		watch(openModel, (open) => {
			if (open) hasOpenedOnce.value = true;
		});
		let showTimeout = null;
		watch(isEligible, (eligible) => {
			if (__props.mode !== "eligible") return;
			if (!eligible) {
				if (showTimeout) {
					clearTimeout(showTimeout);
					showTimeout = null;
				}
				return;
			}
			if (openModel.value || showTimeout) return;
			showTimeout = setTimeout(() => {
				showTimeout = null;
				if (!isValidTypeformId.value) return;
				if (openModel.value) return;
				openModel.value = true;
				markSurveyShown();
				emit("shown");
			}, delayMs.value);
		}, { immediate: true });
		onUnmounted(() => {
			if (showTimeout) clearTimeout(showTimeout);
		});
		function handleDismiss() {
			if (showTimeout) {
				clearTimeout(showTimeout);
				showTimeout = null;
			}
			openModel.value = false;
			emit("dismissed");
		}
		function handleOptOut() {
			optOut();
			if (showTimeout) {
				clearTimeout(showTimeout);
				showTimeout = null;
			}
			openModel.value = false;
			emit("optedOut");
		}
		return (_ctx, _cache) => {
			return hasOpenedOnce.value ? (openBlock(), createBlock(Teleport, {
				key: 0,
				to: "body"
			}, [createVNode(Transition, {
				appear: "",
				"enter-active-class": "transition duration-300 ease-out",
				"enter-from-class": "translate-x-full opacity-0",
				"enter-to-class": "translate-x-0 opacity-100",
				"leave-active-class": "transition duration-300 ease-in",
				"leave-from-class": "translate-x-0 opacity-100",
				"leave-to-class": "translate-x-full opacity-0"
			}, {
				default: withCtx(() => [withDirectives(createBaseVNode("div", _hoisted_1, [
					createBaseVNode("div", _hoisted_2, [createVNode(Button_default, {
						variant: "muted-textonly",
						size: "icon-sm",
						"aria-label": unref(t)("g.close"),
						onClick: handleDismiss
					}, {
						default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "icon-[lucide--x] size-4" }, null, -1)])]),
						_: 1
					}, 8, ["aria-label"])]),
					unref(typeformError) ? (openBlock(), createElementBlock("div", _hoisted_3, toDisplayString(unref(t)("nightlySurvey.loadError")), 1)) : createCommentVNode("", true),
					withDirectives(createBaseVNode("div", {
						ref_key: "typeformRef",
						ref: typeformRef,
						"data-tf-auto-resize": "",
						"data-tf-widget": unref(typeformId),
						class: "min-h-[300px]"
					}, null, 8, _hoisted_4), [[vShow, !unref(typeformError) && unref(isValidTypeformId)]]),
					createBaseVNode("div", { class: normalizeClass(["mt-3 flex items-center gap-2", __props.mode === "eligible" ? "justify-center" : "justify-end"]) }, [__props.mode === "eligible" ? (openBlock(), createBlock(Button_default, {
						key: 0,
						variant: "textonly",
						size: "sm",
						onClick: handleDismiss
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("nightlySurvey.notNow")), 1)]),
						_: 1
					})) : createCommentVNode("", true), createVNode(Button_default, {
						variant: "muted-textonly",
						size: "sm",
						onClick: handleOptOut
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("nightlySurvey.dontAskAgain")), 1)]),
						_: 1
					})], 2)
				], 512), [[vShow, openModel.value]])]),
				_: 1
			})])) : createCommentVNode("", true);
		};
	}
});
//#endregion
//#region src/platform/surveys/useErrorSurveyTracking.ts
var FEATURE_ID = "error-panel";
/**
* Counts error panel occurrences for nightly survey eligibility.
* Each transition into an error state (from "no errors anywhere" to
* "at least one error somewhere") increments the counter. This treats
* a workflow load with multiple simultaneous error types as one event.
* `immediate: true` ensures a workflow that loads already in an error
* state (e.g. missing nodes/models on startup) counts on initial mount.
*/
function useErrorSurveyTracking() {
	const { trackFeatureUsed } = useSurveyFeatureTracking(FEATURE_ID);
	const { hasAnyError } = storeToRefs(useExecutionErrorStore());
	watch(hasAnyError, (next, prev) => {
		if (!prev && next) trackFeatureUsed();
	}, { immediate: true });
}
//#endregion
//#region src/platform/surveys/NightlySurveyController.vue
var NightlySurveyController_default = /* @__PURE__ */ defineComponent({
	__name: "NightlySurveyController",
	setup(__props) {
		useErrorSurveyTracking();
		const { isPopoverOpen: isErrorPopoverOpen } = useErrorSurveyPopoverState();
		const enabledSurveys = computed(() => getFloatingSurveys());
		const errorPanelConfig = computed(() => {
			const config = getSurveyConfig("error-panel");
			if (!config || config.enabled === false) return void 0;
			if (config.presentation !== "inline-cta") return void 0;
			return config;
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [(openBlock(true), createElementBlock(Fragment, null, renderList(enabledSurveys.value, (config) => {
				return openBlock(), createBlock(NightlySurveyPopover_default, {
					key: config.featureId,
					config
				}, null, 8, ["config"]);
			}), 128)), errorPanelConfig.value ? (openBlock(), createBlock(NightlySurveyPopover_default, {
				key: 0,
				open: unref(isErrorPopoverOpen),
				"onUpdate:open": _cache[0] || (_cache[0] = ($event) => isRef(isErrorPopoverOpen) ? isErrorPopoverOpen.value = $event : null),
				config: errorPanelConfig.value,
				mode: "manual"
			}, null, 8, ["open", "config"])) : createCommentVNode("", true)], 64);
		};
	}
});
//#endregion
export { NightlySurveyController_default as default };

//# sourceMappingURL=NightlySurveyController-CIv0D3er.js.map