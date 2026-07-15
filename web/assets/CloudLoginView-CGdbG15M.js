import "./rolldown-runtime-w0pxe0c8.js";
import { $ as script$3, V as script$4, X as script$1, _ as script$2, i as script, n as zodResolver } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, E as Fragment, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, Ut as normalizeClass, Vt as unref, c as useRouter, ct as resolveComponent, it as openBlock, j as computed, s as useRoute, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Ri as useAuthActions, Yi as useAuthStore } from "./promotionUtils-vKoNYnM9.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BTZD_w11.js";
import { t as getGoogleSsoBlockedReason } from "./webviewDetection-BEN5stoL.js";
import { n as signInSchema } from "./signInSchema-BJiZQeas.js";
import { t as usePostAuthRedirect } from "./usePostAuthRedirect-CVNmGSM8.js";
//#region src/platform/cloud/onboarding/components/CloudSignInForm.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex flex-col gap-2" };
var _hoisted_2$1 = {
	key: 0,
	class: "text-red-500"
};
var _hoisted_3$1 = { class: "flex flex-col gap-2" };
var _hoisted_4$1 = { class: "mb-2 flex items-center justify-between" };
var _hoisted_5$1 = {
	class: "text-base font-medium opacity-80",
	for: "cloud-sign-in-password"
};
var _hoisted_6$1 = {
	key: 0,
	class: "text-red-500"
};
var emailInputId = "cloud-sign-in-email";
//#endregion
//#region src/platform/cloud/onboarding/components/CloudSignInForm.vue
var CloudSignInForm_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "CloudSignInForm",
	props: { authError: {} },
	emits: ["submit"],
	setup(__props, { emit: __emit }) {
		const authStore = useAuthStore();
		const loading = computed(() => authStore.loading);
		const { t } = useI18n();
		const emit = __emit;
		const onSubmit = (event) => {
			if (event.valid) emit("submit", event.values);
		};
		return (_ctx, _cache) => {
			const _component_router_link = resolveComponent("router-link");
			return openBlock(), createBlock(unref(script), {
				class: "flex flex-col gap-6",
				resolver: unref(zodResolver)(unref(signInSchema)),
				onSubmit
			}, {
				default: withCtx(($form) => [
					createBaseVNode("div", _hoisted_1$1, [
						createBaseVNode("label", {
							class: "mb-2 text-base font-medium opacity-80",
							for: emailInputId
						}, toDisplayString(unref(t)("auth.login.emailLabel")), 1),
						createVNode(unref(script$1), {
							id: emailInputId,
							autocomplete: "email",
							class: "h-10",
							name: "email",
							type: "text",
							placeholder: unref(t)("auth.login.emailPlaceholder"),
							invalid: $form.email?.invalid
						}, null, 8, ["placeholder", "invalid"]),
						$form.email?.invalid ? (openBlock(), createElementBlock("small", _hoisted_2$1, toDisplayString($form.email.error.message), 1)) : createCommentVNode("", true)
					]),
					createBaseVNode("div", _hoisted_3$1, [
						createBaseVNode("div", _hoisted_4$1, [createBaseVNode("label", _hoisted_5$1, toDisplayString(unref(t)("auth.login.passwordLabel")), 1)]),
						createVNode(unref(script$2), {
							"input-id": "cloud-sign-in-password",
							"pt:pc-input-text:root:autocomplete": "current-password",
							name: "password",
							feedback: false,
							"toggle-mask": "",
							placeholder: unref(t)("auth.login.passwordPlaceholder"),
							class: normalizeClass([{ "p-invalid": $form.password?.invalid }, "h-10"]),
							fluid: ""
						}, null, 8, ["placeholder", "class"]),
						$form.password?.invalid ? (openBlock(), createElementBlock("small", _hoisted_6$1, toDisplayString($form.password.error.message), 1)) : createCommentVNode("", true),
						createVNode(_component_router_link, {
							to: { name: "cloud-forgot-password" },
							class: "text-sm font-medium text-muted no-underline"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("auth.login.forgotPassword")), 1)]),
							_: 1
						})
					]),
					__props.authError ? (openBlock(), createBlock(unref(script$3), {
						key: 0,
						severity: "error"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(__props.authError), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					loading.value ? (openBlock(), createBlock(unref(script$4), {
						key: 1,
						class: "size-8"
					})) : (openBlock(), createBlock(Button_default, {
						key: 2,
						type: "submit",
						variant: "secondary",
						class: "relative mt-4 h-10 w-full gap-4 rounded-md border border-solid border-smoke-800/10 bg-smoke-800/10 text-sm/4 font-medium text-primary-comfy-canvas shadow-inset-highlight hover:bg-sand-300/20",
						disabled: !$form.valid
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("auth.login.loginButton")), 1)]),
						_: 1
					}, 8, ["disabled"]))
				]),
				_: 1
			}, 8, ["resolver"]);
		};
	}
}), [["__scopeId", "data-v-1dd2a328"]]);
//#endregion
//#region src/platform/cloud/onboarding/CloudLoginView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex size-full items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:py-12" };
var _hoisted_2 = { class: "flex w-full max-w-md flex-col items-start" };
var _hoisted_3 = { class: "flex w-full flex-col gap-4" };
var _hoisted_4 = { class: "my-0 font-inter text-xl/8 font-extrabold tracking-wide text-primary-comfy-canvas sm:text-2xl/8" };
var _hoisted_5 = { class: "my-0 text-base/6 tracking-[-0.02em] text-primary-comfy-canvas" };
var _hoisted_6 = { class: "flex w-full flex-col gap-4 pt-5 pb-2" };
var _hoisted_7 = { class: "mx-auto my-0 flex w-full max-w-10/12 flex-wrap items-center justify-center gap-x-1 py-4 text-center text-sm/5 tracking-[-0.011em] text-primary-comfy-canvas" };
var _hoisted_8 = {
	href: "https://www.comfy.org/terms-of-service",
	target: "_blank",
	class: "cursor-pointer text-azure-600 no-underline"
};
var _hoisted_9 = {
	href: "https://www.comfy.org/privacy-policy",
	target: "_blank",
	class: "cursor-pointer text-azure-600 no-underline"
};
//#endregion
//#region src/platform/cloud/onboarding/CloudLoginView.vue
var CloudLoginView_default = /* @__PURE__ */ defineComponent({
	__name: "CloudLoginView",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const route = useRoute();
		const authActions = useAuthActions();
		const isSecureContext = globalThis.isSecureContext;
		const authError = ref("");
		const showEmailForm = ref(false);
		const googleSsoBlockedReason = getGoogleSsoBlockedReason();
		const { onAuthSuccess } = usePostAuthRedirect({
			authError,
			successSummary: "Login Completed",
			defaultRedirect: () => ({ name: "cloud-user-check" })
		});
		function switchToEmailForm() {
			showEmailForm.value = true;
		}
		function switchToSocialLogin() {
			showEmailForm.value = false;
		}
		const navigateToSignup = async () => {
			await router.push({
				name: "cloud-signup",
				query: route.query
			});
		};
		const signInWithGoogle = async () => {
			authError.value = "";
			if (await authActions.signInWithGoogle()) await onAuthSuccess();
		};
		const signInWithGithub = async () => {
			authError.value = "";
			if (await authActions.signInWithGithub()) await onAuthSuccess();
		};
		const signInWithEmail = async (values) => {
			authError.value = "";
			if (await authActions.signInWithEmail(values.email, values.password)) await onAuthSuccess();
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("div", _hoisted_3, [createBaseVNode("h1", _hoisted_4, toDisplayString(unref(t)("auth.login.title")), 1), createBaseVNode("p", _hoisted_5, [createTextVNode(toDisplayString(unref(t)("auth.login.newUser")) + " ", 1), createBaseVNode("span", {
					class: "cursor-pointer text-azure-600",
					onClick: navigateToSignup
				}, toDisplayString(unref(t)("auth.login.signUp")), 1)])]),
				!unref(isSecureContext) ? (openBlock(), createBlock(unref(script$3), {
					key: 0,
					severity: "warn",
					class: "mt-4 w-full"
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("auth.login.insecureContextWarning")), 1)]),
					_: 1
				})) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_6, [!showEmailForm.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					!unref(googleSsoBlockedReason) ? (openBlock(), createBlock(Button_default, {
						key: 0,
						type: "button",
						variant: "secondary",
						class: "relative h-10 w-full gap-4 rounded-md border border-solid border-smoke-800/10 bg-smoke-800/10 text-sm/4 font-medium text-primary-comfy-canvas shadow-inset-highlight hover:bg-sand-300/20",
						onClick: signInWithGoogle
					}, {
						default: withCtx(() => [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "pi pi-google text-base" }, null, -1)), createTextVNode(" " + toDisplayString(unref(t)("auth.login.loginWithGoogle")), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					createVNode(Button_default, {
						type: "button",
						variant: "secondary",
						class: "relative h-10 w-full gap-4 rounded-md border border-solid border-smoke-800/10 bg-smoke-800/10 font-inter text-sm/4 font-medium text-primary-comfy-canvas shadow-inset-highlight hover:bg-sand-300/20",
						onClick: signInWithGithub
					}, {
						default: withCtx(() => [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "pi pi-github text-base" }, null, -1)), createTextVNode(" " + toDisplayString(unref(t)("auth.login.loginWithGithub")), 1)]),
						_: 1
					}),
					createVNode(Button_default, {
						variant: "link",
						class: "text-sm/4 text-primary-comfy-canvas/70 hover:text-primary-comfy-canvas",
						onClick: switchToEmailForm
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("auth.login.useEmailInstead")), 1)]),
						_: 1
					})
				], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(CloudSignInForm_default, {
					"auth-error": authError.value,
					onSubmit: signInWithEmail
				}, null, 8, ["auth-error"]), createVNode(Button_default, {
					variant: "secondary",
					class: "mt-1 h-10 w-full rounded-md border-none bg-smoke-800/5 text-sm/5 font-normal tracking-[-0.011em] text-primary-comfy-canvas/55 hover:bg-primary-comfy-canvas/10",
					onClick: switchToSocialLogin
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("auth.login.backToSocialLogin")), 1)]),
					_: 1
				})], 64))]),
				createBaseVNode("p", _hoisted_7, [
					createTextVNode(toDisplayString(unref(t)("auth.login.termsText")) + " ", 1),
					createBaseVNode("a", _hoisted_8, toDisplayString(unref(t)("auth.login.termsLink")), 1),
					createTextVNode(" " + toDisplayString(unref(t)("auth.login.andText")) + " ", 1),
					createBaseVNode("a", _hoisted_9, toDisplayString(unref(t)("auth.login.privacyLink")), 1),
					_cache[2] || (_cache[2] = createTextVNode(". ", -1))
				])
			])]);
		};
	}
});
//#endregion
export { CloudLoginView_default as default };

//# sourceMappingURL=CloudLoginView-CGdbG15M.js.map