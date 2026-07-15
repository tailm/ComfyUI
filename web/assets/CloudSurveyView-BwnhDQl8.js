import "./rolldown-runtime-w0pxe0c8.js";
import { B as script$1, W as script } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, E as Fragment, F as createElementBlock, Gt as normalizeStyle, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, Ut as normalizeClass, Vt as unref, _t as watch, c as useRouter, it as openBlock, j as computed, ot as renderList, pt as useId, tt as onMounted, w as withModifiers, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { lt as shuffle, n as toTypedSchema, r as useForm } from "./vendor-other-CcVI76zn.js";
import { a as remoteConfig } from "./remoteConfig-DjUkM6Dg.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { _ as objectType, b as stringType, s as arrayType } from "./vendor-zod-9ZYBvZOX.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
import { t as cn } from "./src-CDgHMYTj.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { n as useFeatureFlags } from "./useFeatureFlags-DVgtsxbC.js";
import { t as Input_default } from "./Input-DH6Bhvfp.js";
import { r as submitSurvey, t as getSurveyCompletedStatus } from "./auth-DbePuc5y.js";
//#region src/platform/cloud/onboarding/survey/DynamicSurveyField.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = ["aria-invalid"];
var _hoisted_2$1 = { class: "mb-2 block text-lg font-medium text-base-foreground" };
var _hoisted_3$1 = ["for"];
var _hoisted_4$1 = ["for"];
var _hoisted_5$1 = {
	key: 3,
	class: "text-danger text-xs"
};
var _hoisted_6 = {
	key: 1,
	class: "flex flex-col gap-3"
};
var _hoisted_7 = ["for"];
var _hoisted_8 = {
	key: 0,
	class: "text-danger text-xs"
};
//#endregion
//#region src/platform/cloud/onboarding/survey/DynamicSurveyField.vue
var DynamicSurveyField_default = /* @__PURE__ */ defineComponent({
	__name: "DynamicSurveyField",
	props: {
		field: {},
		modelValue: {},
		otherValue: {},
		errorMessage: { default: "" }
	},
	emits: ["update:modelValue", "update:otherValue"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t, te, locale } = useI18n();
		const controlId = useId();
		const resolveLocalized = (value) => {
			if (typeof value === "string") return value;
			return value[locale.value] ?? value.en ?? Object.values(value)[0] ?? "";
		};
		const checkedTokens = { checked: {
			background: "var(--color-electric-400)",
			borderColor: "var(--color-electric-400)",
			hoverBackground: "var(--color-electric-400)",
			hoverBorderColor: "var(--color-electric-400)"
		} };
		const resolvedLabel = (() => {
			if (__props.field.labelKey && te(__props.field.labelKey)) return t(__props.field.labelKey);
			if (__props.field.label != null) return resolveLocalized(__props.field.label);
			return __props.field.id;
		})();
		const resolveOptionLabel = (option) => {
			if (option.labelKey && te(option.labelKey)) return t(option.labelKey);
			if (option.label != null) return resolveLocalized(option.label);
			return option.value;
		};
		const onSingleChange = (value) => {
			emit("update:modelValue", typeof value === "string" ? value : "");
		};
		const onMultiChange = (value) => {
			if (!Array.isArray(value)) {
				emit("update:modelValue", []);
				return;
			}
			emit("update:modelValue", value.filter((v) => typeof v === "string"));
		};
		const onTextChange = (value) => {
			emit("update:modelValue", String(value ?? ""));
		};
		const onOtherChange = (value) => {
			emit("update:otherValue", String(value ?? ""));
		};
		return (_ctx, _cache) => {
			return __props.field.type !== "text" ? (openBlock(), createElementBlock("fieldset", {
				key: 0,
				"aria-invalid": Boolean(__props.errorMessage),
				class: "flex flex-col gap-4 border-0 p-0"
			}, [
				createBaseVNode("legend", _hoisted_2$1, toDisplayString(unref(resolvedLabel)), 1),
				__props.field.type === "single" ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(__props.field.options, (option) => {
					return openBlock(), createElementBlock("div", {
						key: option.value,
						class: "flex items-center gap-3"
					}, [createVNode(unref(script), {
						"model-value": __props.modelValue ?? "",
						"input-id": `${__props.field.id}-${option.value}`,
						name: __props.field.id,
						value: option.value,
						dt: checkedTokens,
						"onUpdate:modelValue": onSingleChange
					}, null, 8, [
						"model-value",
						"input-id",
						"name",
						"value"
					]), createBaseVNode("label", {
						for: `${__props.field.id}-${option.value}`,
						class: "cursor-pointer text-sm"
					}, toDisplayString(resolveOptionLabel(option)), 9, _hoisted_3$1)]);
				}), 128)) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(__props.field.options, (option) => {
					return openBlock(), createElementBlock("div", {
						key: option.value,
						class: "flex items-center gap-3"
					}, [createVNode(unref(script$1), {
						"model-value": __props.modelValue ?? [],
						"input-id": `${__props.field.id}-${option.value}`,
						value: option.value,
						dt: checkedTokens,
						"onUpdate:modelValue": onMultiChange
					}, null, 8, [
						"model-value",
						"input-id",
						"value"
					]), createBaseVNode("label", {
						for: `${__props.field.id}-${option.value}`,
						class: "cursor-pointer text-sm"
					}, toDisplayString(resolveOptionLabel(option)), 9, _hoisted_4$1)]);
				}), 128)),
				__props.field.allowOther && __props.field.otherFieldId && __props.modelValue === "other" ? (openBlock(), createBlock(Input_default, {
					key: 2,
					"model-value": __props.otherValue ?? "",
					placeholder: _ctx.$t(`cloudOnboarding.survey.options.${__props.field.id}.otherPlaceholder`, _ctx.$t("cloudOnboarding.survey.otherPlaceholder")),
					class: "ml-1",
					"onUpdate:modelValue": onOtherChange
				}, null, 8, ["model-value", "placeholder"])) : createCommentVNode("", true),
				__props.errorMessage ? (openBlock(), createElementBlock("p", _hoisted_5$1, toDisplayString(__props.errorMessage), 1)) : createCommentVNode("", true)
			], 8, _hoisted_1$2)) : (openBlock(), createElementBlock("div", _hoisted_6, [
				createBaseVNode("label", {
					for: unref(controlId),
					class: "block text-lg font-medium text-base-foreground"
				}, toDisplayString(unref(resolvedLabel)), 9, _hoisted_7),
				createVNode(Input_default, {
					id: unref(controlId),
					"model-value": __props.modelValue ?? "",
					placeholder: __props.field.placeholder,
					"aria-invalid": Boolean(__props.errorMessage),
					"onUpdate:modelValue": onTextChange
				}, null, 8, [
					"id",
					"model-value",
					"placeholder",
					"aria-invalid"
				]),
				__props.errorMessage ? (openBlock(), createElementBlock("p", _hoisted_8, toDisplayString(__props.errorMessage), 1)) : createCommentVNode("", true)
			]));
		};
	}
});
//#endregion
//#region src/platform/cloud/onboarding/survey/surveySchema.ts
var hasNonEmptyValue = (current) => {
	if (current === void 0 || current === "") return false;
	if (Array.isArray(current)) return current.length > 0;
	return true;
};
var conditionMatches = (condition, values) => {
	if (!condition) return true;
	const current = values[condition.field];
	if (!hasNonEmptyValue(current)) return false;
	const expected = condition.equals;
	if (expected === void 0) return true;
	const expectedSet = Array.isArray(expected) ? expected : [expected];
	if (Array.isArray(current)) return current.some((v) => expectedSet.includes(v));
	return typeof current === "string" && expectedSet.includes(current);
};
var visibleFields = (survey, values) => survey.fields.filter((field) => conditionMatches(field.showWhen, values));
var PIN_LAST_VALUES = new Set(["other", "not_sure"]);
var randomizeOptions = (field) => {
	if (!field.randomize || !field.options) return field;
	const pinned = field.options.filter((opt) => PIN_LAST_VALUES.has(opt.value));
	const rest = field.options.filter((opt) => !PIN_LAST_VALUES.has(opt.value));
	return {
		...field,
		options: [...shuffle(rest), ...pinned]
	};
};
var prepareSurvey = (survey) => ({
	...survey,
	fields: survey.fields.map(randomizeOptions)
});
var identityTranslator = (key) => key;
var fieldSchema = (field, t) => {
	if (field.type === "multi") {
		const arr = arrayType(stringType());
		return field.required ? arr.min(1, { message: t("cloudOnboarding.survey.errors.selectAtLeastOne") }) : arr.optional();
	}
	if (field.required) return stringType().min(1, { message: t("cloudOnboarding.survey.errors.chooseAnOption") });
	return stringType().optional();
};
var buildZodSchema = (survey, values, t = identityTranslator) => {
	const shape = {};
	for (const field of survey.fields) {
		if (!conditionMatches(field.showWhen, values)) continue;
		shape[field.id] = fieldSchema(field, t);
		if (field.allowOther && field.otherFieldId && values[field.id] === "other") shape[field.otherFieldId] = stringType().min(1, { message: t("cloudOnboarding.survey.errors.describeAnswer") });
		else if (field.otherFieldId) shape[field.otherFieldId] = stringType().optional();
	}
	return objectType(shape);
};
var buildInitialValues = (survey) => {
	const initial = {};
	for (const field of survey.fields) {
		initial[field.id] = field.type === "multi" ? [] : "";
		if (field.otherFieldId) initial[field.otherFieldId] = "";
	}
	return initial;
};
var buildSubmissionPayload = (survey, values) => {
	const payload = {};
	for (const field of survey.fields) {
		if (!conditionMatches(field.showWhen, values)) {
			payload[field.id] = field.type === "multi" ? [] : "";
			continue;
		}
		const value = values[field.id];
		const otherRaw = field.otherFieldId ? values[field.otherFieldId] : void 0;
		if (field.allowOther && field.otherFieldId && value === "other" && typeof otherRaw === "string") {
			const other = otherRaw.trim();
			payload[field.id] = other || "other";
		} else payload[field.id] = field.type === "multi" ? value ?? [] : value ?? "";
	}
	return payload;
};
//#endregion
//#region src/platform/cloud/onboarding/survey/DynamicSurveyForm.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = {
	key: 0,
	class: "mb-4 text-sm text-muted"
};
var _hoisted_2 = { class: "mb-8 h-2 w-full overflow-hidden rounded-full bg-secondary-background" };
var _hoisted_3 = { class: "flex flex-1 flex-col overflow-hidden" };
var _hoisted_4 = { class: "flex gap-6 pt-4" };
var _hoisted_5 = {
	key: 1,
	class: "flex-1"
};
//#endregion
//#region src/platform/cloud/onboarding/survey/DynamicSurveyForm.vue
var DynamicSurveyForm_default = /* @__PURE__ */ defineComponent({
	__name: "DynamicSurveyForm",
	props: {
		survey: {},
		isSubmitting: { type: Boolean }
	},
	emits: ["submit"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t, te } = useI18n();
		const preparedSurvey = computed(() => prepareSurvey(__props.survey));
		const introText = computed(() => {
			const key = preparedSurvey.value.introKey;
			if (!key) return "";
			return te(key) ? t(key) : "";
		});
		const liveValues = ref(buildInitialValues(preparedSurvey.value));
		const validationSchema = computed(() => toTypedSchema(buildZodSchema(preparedSurvey.value, liveValues.value, t)));
		const { values, errors, setFieldValue, validate, resetForm } = useForm({
			initialValues: liveValues.value,
			validationSchema
		});
		watch(() => __props.survey, () => {
			const fresh = buildInitialValues(preparedSurvey.value);
			liveValues.value = { ...fresh };
			resetForm({ values: fresh });
			stepIndex.value = 0;
		});
		const visible = computed(() => visibleFields(preparedSurvey.value, values));
		const stepIndex = ref(0);
		const currentField = computed(() => visible.value[stepIndex.value]);
		const isFirst = computed(() => stepIndex.value === 0);
		const isLast = computed(() => stepIndex.value === visible.value.length - 1);
		const totalSteps = computed(() => Math.max(visible.value.length, 1));
		const progressPercent = computed(() => Math.max(100 / totalSteps.value, (stepIndex.value + 1) / totalSteps.value * 100));
		const isCurrentValid = computed(() => {
			const field = currentField.value;
			if (!field) return false;
			const value = values[field.id];
			if (field.type === "multi" ? !Array.isArray(value) || value.length === 0 : typeof value !== "string" || value.length === 0) return !field.required;
			if (field.allowOther && field.otherFieldId && value === "other") {
				const other = values[field.otherFieldId];
				return typeof other === "string" && other.trim().length > 0;
			}
			return true;
		});
		const onFieldChange = (id, value) => {
			setFieldValue(id, value);
			liveValues.value = {
				...liveValues.value,
				[id]: value
			};
			if (stepIndex.value > visible.value.length - 1) stepIndex.value = Math.max(0, visible.value.length - 1);
		};
		const goNext = () => {
			if (stepIndex.value < visible.value.length - 1) stepIndex.value += 1;
		};
		const goPrevious = () => {
			if (stepIndex.value > 0) stepIndex.value -= 1;
		};
		const onSubmit = async () => {
			if (!(await validate()).valid) return;
			emit("submit", buildSubmissionPayload(preparedSurvey.value, values));
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("form", {
				class: "flex size-full flex-col",
				onSubmit: withModifiers(onSubmit, ["prevent"])
			}, [
				introText.value ? (openBlock(), createElementBlock("p", _hoisted_1$1, toDisplayString(introText.value), 1)) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", {
					class: "h-full bg-electric-400 transition-[width] duration-300 ease-out",
					style: normalizeStyle({ width: `${progressPercent.value}%` })
				}, null, 4)]),
				createBaseVNode("div", _hoisted_3, [currentField.value ? (openBlock(), createElementBlock("div", {
					key: currentField.value.id,
					class: "flex flex-1 flex-col gap-4 overflow-y-auto pr-1"
				}, [createVNode(DynamicSurveyField_default, {
					field: currentField.value,
					"model-value": unref(values)[currentField.value.id],
					"other-value": currentField.value.otherFieldId ? unref(values)[currentField.value.otherFieldId] : void 0,
					"error-message": unref(errors)[currentField.value.id] ?? (currentField.value.otherFieldId ? unref(errors)[currentField.value.otherFieldId] : void 0),
					"onUpdate:modelValue": _cache[0] || (_cache[0] = (value) => onFieldChange(currentField.value.id, value)),
					"onUpdate:otherValue": _cache[1] || (_cache[1] = (value) => currentField.value.otherFieldId && onFieldChange(currentField.value.otherFieldId, value))
				}, null, 8, [
					"field",
					"model-value",
					"other-value",
					"error-message"
				])])) : createCommentVNode("", true)]),
				createBaseVNode("div", _hoisted_4, [!isFirst.value ? (openBlock(), createBlock(Button_default, {
					key: 0,
					type: "button",
					variant: "secondary",
					class: "h-10 flex-1 text-white",
					onClick: goPrevious
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.back")), 1)]),
					_: 1
				})) : (openBlock(), createElementBlock("span", _hoisted_5)), !isLast.value ? (openBlock(), createBlock(Button_default, {
					key: 2,
					type: "button",
					disabled: !isCurrentValid.value,
					class: normalizeClass(unref(cn)("h-10 flex-1 border-none", isCurrentValid.value ? "bg-electric-400 text-black hover:bg-electric-400/85" : "bg-zinc-800 text-zinc-500")),
					onClick: goNext
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.next")), 1)]),
					_: 1
				}, 8, ["disabled", "class"])) : (openBlock(), createBlock(Button_default, {
					key: 3,
					type: "submit",
					disabled: !isCurrentValid.value || __props.isSubmitting,
					loading: __props.isSubmitting,
					class: normalizeClass(unref(cn)("h-10 flex-1 border-none", isCurrentValid.value && !__props.isSubmitting ? "bg-electric-400 text-black hover:bg-electric-400/85" : "bg-zinc-800 text-zinc-500"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.submit")), 1)]),
					_: 1
				}, 8, [
					"disabled",
					"loading",
					"class"
				]))])
			], 32);
		};
	}
});
//#endregion
//#region src/platform/cloud/onboarding/survey/defaultSurveySchema.ts
var optionsFor = (fieldId, values) => values.map((value) => ({
	value,
	labelKey: `cloudOnboarding.survey.options.${fieldId}.${value}`
}));
var defaultOnboardingSurvey = {
	version: 2,
	introKey: "cloudOnboarding.survey.intro",
	fields: [
		{
			id: "usage",
			type: "single",
			labelKey: "cloudSurvey_steps_usage",
			required: true,
			options: optionsFor("usage", [
				"personal",
				"work",
				"education"
			])
		},
		{
			id: "familiarity",
			type: "single",
			labelKey: "cloudSurvey_steps_familiarity",
			required: true,
			options: optionsFor("familiarity", [
				"new",
				"starting",
				"basics",
				"advanced",
				"expert"
			])
		},
		{
			id: "intent",
			type: "multi",
			labelKey: "cloudSurvey_steps_intent",
			required: true,
			randomize: true,
			options: optionsFor("intent", [
				"workflows",
				"custom_nodes",
				"videos",
				"images",
				"3d_game",
				"audio",
				"apps",
				"api",
				"not_sure"
			])
		},
		{
			id: "source",
			type: "single",
			labelKey: "cloudSurvey_steps_source",
			required: true,
			randomize: true,
			options: optionsFor("source", [
				"youtube",
				"reddit",
				"twitter",
				"instagram",
				"linkedin",
				"friend",
				"search",
				"newsletter",
				"conference",
				"discord",
				"github",
				"other"
			])
		}
	]
};
//#endregion
//#region src/platform/cloud/onboarding/CloudSurveyView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex h-[700px] max-h-[85vh] w-[320px] max-w-[90vw] flex-col" };
//#endregion
//#region src/platform/cloud/onboarding/CloudSurveyView.vue
var CloudSurveyView_default = /* @__PURE__ */ defineComponent({
	__name: "CloudSurveyView",
	setup(__props) {
		const router = useRouter();
		const { flags } = useFeatureFlags();
		const onboardingSurveyEnabled = computed(() => flags.onboardingSurveyEnabled);
		const activeSurvey = computed(() => remoteConfig.value.onboarding_survey ?? defaultOnboardingSurvey);
		const isSubmitting = ref(false);
		onMounted(async () => {
			if (!onboardingSurveyEnabled.value) {
				await router.replace({ name: "cloud-user-check" });
				return;
			}
			try {
				if (await getSurveyCompletedStatus()) {
					await router.replace({ name: "cloud-user-check" });
					return;
				}
				useTelemetry()?.trackSurvey("opened");
			} catch (error) {
				console.error("Failed to check survey status:", error);
			}
		});
		const onSubmitSurvey = async (payload) => {
			if (!onboardingSurveyEnabled.value) {
				await router.replace({ name: "cloud-user-check" });
				return;
			}
			isSubmitting.value = true;
			try {
				await submitSurvey(payload);
				useTelemetry()?.trackSurvey("submitted", payload);
				await router.push({ name: "cloud-user-check" });
			} finally {
				isSubmitting.value = false;
			}
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [(openBlock(), createBlock(DynamicSurveyForm_default, {
				key: activeSurvey.value.version,
				survey: activeSurvey.value,
				"is-submitting": isSubmitting.value,
				onSubmit: onSubmitSurvey
			}, null, 8, ["survey", "is-submitting"]))]);
		};
	}
});
//#endregion
export { CloudSurveyView_default as default };

//# sourceMappingURL=CloudSurveyView-BwnhDQl8.js.map