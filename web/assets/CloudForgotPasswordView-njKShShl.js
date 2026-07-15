import "./rolldown-runtime-w0pxe0c8.js";
import { $ as script$1, X as script } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, Vt as unref, c as useRouter, it as openBlock, w as withModifiers, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Ri as useAuthActions } from "./promotionUtils-vKoNYnM9.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BTZD_w11.js";
//#region src/platform/cloud/onboarding/CloudForgotPasswordView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex h-full items-center justify-center p-8" };
var _hoisted_2 = { class: "max-w-[100vw] p-2 lg:w-96" };
var _hoisted_3 = { class: "mb-8 flex flex-col gap-4" };
var _hoisted_4 = { class: "my-0 text-xl/normal font-medium" };
var _hoisted_5 = { class: "my-0 text-base text-muted" };
var _hoisted_6 = { class: "flex flex-col gap-2" };
var _hoisted_7 = {
	class: "mb-2 text-base font-medium opacity-80",
	for: "reset-email"
};
var _hoisted_8 = {
	key: 0,
	class: "text-red-500"
};
var _hoisted_9 = { class: "flex flex-col gap-4" };
var _hoisted_10 = { class: "mt-5 text-sm text-gray-600" };
//#endregion
//#region src/platform/cloud/onboarding/CloudForgotPasswordView.vue
var CloudForgotPasswordView_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "CloudForgotPasswordView",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const authActions = useAuthActions();
		const email = ref("");
		const loading = ref(false);
		const errorMessage = ref("");
		const successMessage = ref("");
		const navigateToLogin = () => {
			router.push({ name: "cloud-login" });
		};
		const handleSubmit = async () => {
			if (!email.value) {
				errorMessage.value = t("cloudForgotPassword_emailRequired");
				return;
			}
			loading.value = true;
			errorMessage.value = "";
			successMessage.value = "";
			try {
				await authActions.sendPasswordReset(email.value);
				successMessage.value = t("cloudForgotPassword_passwordResetSent");
				setTimeout(() => {
					navigateToLogin();
				}, 3e3);
			} catch (error) {
				console.error("Password reset error:", error);
				errorMessage.value = t("cloudForgotPassword_passwordResetError");
			} finally {
				loading.value = false;
			}
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("div", _hoisted_3, [createBaseVNode("h1", _hoisted_4, toDisplayString(unref(t)("cloudForgotPassword_title")), 1), createBaseVNode("p", _hoisted_5, toDisplayString(unref(t)("cloudForgotPassword_instructions")), 1)]),
				createBaseVNode("form", {
					class: "flex flex-col gap-6",
					onSubmit: withModifiers(handleSubmit, ["prevent"])
				}, [
					createBaseVNode("div", _hoisted_6, [
						createBaseVNode("label", _hoisted_7, toDisplayString(unref(t)("cloudForgotPassword_emailLabel")), 1),
						createVNode(unref(script), {
							id: "reset-email",
							modelValue: email.value,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => email.value = $event),
							type: "email",
							placeholder: unref(t)("cloudForgotPassword_emailPlaceholder"),
							class: "h-10",
							invalid: !!errorMessage.value && !email.value,
							autocomplete: "email",
							required: ""
						}, null, 8, [
							"modelValue",
							"placeholder",
							"invalid"
						]),
						errorMessage.value ? (openBlock(), createElementBlock("small", _hoisted_8, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
					]),
					successMessage.value ? (openBlock(), createBlock(unref(script$1), {
						key: 0,
						severity: "success"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(successMessage.value), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_9, [createVNode(Button_default, {
						type: "submit",
						loading: loading.value,
						disabled: !email.value || loading.value,
						class: "h-10 font-medium text-white"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("cloudForgotPassword_sendResetLink")), 1)]),
						_: 1
					}, 8, ["loading", "disabled"]), createVNode(Button_default, {
						type: "button",
						variant: "secondary",
						class: "h-10 bg-charcoal-500",
						onClick: navigateToLogin
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("cloudForgotPassword_backToLogin")), 1)]),
						_: 1
					})])
				], 32),
				createBaseVNode("p", _hoisted_10, toDisplayString(unref(t)("cloudForgotPassword_didntReceiveEmail")), 1)
			])]);
		};
	}
}), [["__scopeId", "data-v-14076991"]]);
//#endregion
export { CloudForgotPasswordView_default as default };

//# sourceMappingURL=CloudForgotPasswordView-njKShShl.js.map