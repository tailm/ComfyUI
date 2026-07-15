import "./rolldown-runtime-w0pxe0c8.js";
import { V as script$3, X as script$2, i as script, n as zodResolver, r as script$1 } from "./vendor-primevue-rx7tKw03.js";
import { $ as onBeforeUnmount, B as createVNode, Dt as isRef, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, S as vShow, St as withDirectives, Vt as unref, _t as watch, gt as useTemplateRef, it as openBlock, j as computed, mt as useModel, tt as onMounted, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Yi as useAuthStore, ya as useColorPaletteStore } from "./promotionUtils-vKoNYnM9.js";
import { at as useThrottleFn, st as useTimeoutFn } from "./vendor-vueuse-BA2QXdyV.js";
import "./remoteConfig-DjUkM6Dg.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { n as useFeatureFlags } from "./useFeatureFlags-DVgtsxbC.js";
import { r as signUpSchema } from "./signInSchema-BJiZQeas.js";
import { t as PasswordFields_default } from "./PasswordFields-BTAZ3cEe.js";
import { t as createScriptLoader } from "./loadExternalScript-DaB_1k_B.js";
//#region src/config/turnstile.ts
/**
* Returns the Cloudflare Turnstile sitekey for the current environment.
* - OSS / localhost never renders the cloud widget (server-side loopback
*   exemption covers local signup); in dev it falls back to the always-pass test
*   key so the flow is exercisable locally, otherwise ''.
* - Cloud builds prefer the per-env sitekey delivered via remote config
*   (`turnstile_sitekey`) and fall back to the build-time constant, so the widget
*   still renders during a remote-config gap rather than silently disappearing.
*/
function getTurnstileSiteKey() {
	return "";
}
//#endregion
//#region src/composables/auth/useTurnstile.ts
/**
* Clamp an externally-sourced value to a known TurnstileMode. Unknown strings
* (typos, stale flag variants) resolve to 'off' so a bad value can never leave
* the widget rendered-but-unenforced — mirrors the server-side resolver.
*/
function normalizeTurnstileMode(raw) {
	return raw === "shadow" || raw === "enforce" ? raw : "off";
}
/**
* Whether the signup Turnstile widget should render. Purely config-driven: the
* flag must be shadow/enforce and a sitekey must be configured. OSS / local
* builds resolve no sitekey — the real per-env keys are tree-shaken out via the
* __DISTRIBUTION__ build define (see config/turnstile.ts) — so the widget never
* renders. The local-OSS exemption lives server-side (loopback-IP check in
* CreateCustomer).
*/
function isTurnstileEnabled(mode, siteKey) {
	return mode !== "off" && siteKey !== "";
}
/**
* Reactive Turnstile state for the signup form.
* - `enabled`: render the widget
* - `enforced`: block submit until the challenge is solved
*/
function useTurnstile() {
	const { flags } = useFeatureFlags();
	const mode = computed(() => normalizeTurnstileMode(flags.signupTurnstileMode));
	const siteKey = computed(getTurnstileSiteKey);
	const enabled = computed(() => isTurnstileEnabled(mode.value, siteKey.value));
	return {
		mode,
		siteKey,
		enabled,
		enforced: computed(() => enabled.value && mode.value === "enforce")
	};
}
/**
* Submit-gating state for the signup form's Turnstile widget: a token/
* unavailable pair, plus `waiting`, which is true while a real token is still
* needed. Waits in both shadow and enforce mode (`enabled`), not just
* `enforced`, so shadow mode's token can't race the async Cloudflare
* challenge; falls back open once the widget reports `unavailable` so a
* broken/slow load can never permanently block signup.
*
* `token`/`unavailable` reset on every `enabled` transition, in either
* direction, so state from a previous widget instance can never leak into a
* freshly (re-)rendered one.
*/
function useTurnstileGate(enabled) {
	const token = ref("");
	const unavailable = ref(false);
	const waiting = computed(() => enabled.value && !token.value && !unavailable.value);
	watch(enabled, () => {
		token.value = "";
		unavailable.value = false;
	});
	return {
		token,
		unavailable,
		waiting
	};
}
//#endregion
//#region src/composables/auth/turnstileScript.ts
var loadTurnstileScript = createScriptLoader("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", () => window.turnstile ?? null);
function loadTurnstile() {
	return loadTurnstileScript();
}
//#endregion
//#region src/components/dialog/content/signin/TurnstileWidget.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex flex-col gap-2" };
var _hoisted_2$1 = {
	key: 0,
	role: "alert",
	"aria-live": "assertive",
	class: "text-red-500"
};
var TURNSTILE_LOAD_TIMEOUT_MS = 9e3;
//#endregion
//#region src/components/dialog/content/signin/TurnstileWidget.vue
var TurnstileWidget_default = /* @__PURE__ */ defineComponent({
	__name: "TurnstileWidget",
	props: {
		"token": { default: "" },
		"tokenModifiers": {},
		"unavailable": {
			type: Boolean,
			default: false
		},
		"unavailableModifiers": {}
	},
	emits: ["update:token", "update:unavailable"],
	setup(__props, { expose: __expose }) {
		const token = useModel(__props, "token");
		/**
		* Set true whenever the widget cannot be relied on to ever produce a token:
		* the Cloudflare script failed to load, the rendered challenge errored out,
		* or it simply hasn't resolved within `TURNSTILE_LOAD_TIMEOUT_MS`. The parent
		* uses this to stop waiting on a token so a broken/slow widget (network
		* issue, ad-blocker, CDN outage) can never permanently block signup.
		*/
		const unavailable = useModel(__props, "unavailable");
		const { t } = useI18n();
		const colorPaletteStore = useColorPaletteStore();
		const containerRef = ref();
		const errorMessage = ref("");
		let widgetId;
		/** How long to wait for the widget to resolve before falling back. */
		const { start: armTimeout, stop: clearLoadTimeout } = useTimeoutFn(() => {
			unavailable.value = true;
		}, TURNSTILE_LOAD_TIMEOUT_MS, { immediate: false });
		const clearToken = () => {
			token.value = "";
		};
		/**
		* Fetch a fresh challenge and clear the current token.
		*
		* Turnstile tokens are single-use, so after a token is consumed by a submit
		* attempt that did not succeed, the spent token must be discarded and a new
		* challenge requested. Clearing the model re-blocks submission until the user
		* solves the fresh challenge; clearing the error drops any stale failure text
		* so it can't linger over the new challenge.
		*/
		const reset = () => {
			clearToken();
			errorMessage.value = "";
			if (widgetId && window.turnstile) {
				window.turnstile.reset(widgetId);
				unavailable.value = false;
				armTimeout();
			}
		};
		__expose({ reset });
		onMounted(async () => {
			armTimeout();
			try {
				const turnstile = await loadTurnstile();
				if (!containerRef.value) return;
				const theme = colorPaletteStore.completedActivePalette.light_theme ? "light" : "dark";
				widgetId = turnstile.render(containerRef.value, {
					sitekey: getTurnstileSiteKey(),
					theme,
					callback: (newToken) => {
						clearLoadTimeout();
						errorMessage.value = "";
						unavailable.value = false;
						token.value = newToken;
					},
					"expired-callback": () => {
						clearToken();
						errorMessage.value = t("auth.turnstile.expired");
						if (widgetId && window.turnstile) {
							window.turnstile.reset(widgetId);
							armTimeout();
						}
					},
					"error-callback": () => {
						clearToken();
						clearLoadTimeout();
						console.warn("Turnstile challenge failed");
						errorMessage.value = t("auth.turnstile.failed");
						unavailable.value = true;
						if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
					}
				});
			} catch (error) {
				clearLoadTimeout();
				console.warn("Turnstile failed to load", error);
				errorMessage.value = t("auth.turnstile.failed");
				unavailable.value = true;
			}
		});
		onBeforeUnmount(() => {
			if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", {
				ref_key: "containerRef",
				ref: containerRef
			}, null, 512), errorMessage.value ? (openBlock(), createElementBlock("small", _hoisted_2$1, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/signin/SignUpForm.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	class: "mb-2 text-base font-medium opacity-80",
	for: "comfy-org-sign-up-email"
};
var _hoisted_2 = {
	key: 0,
	class: "text-red-500"
};
//#endregion
//#region src/components/dialog/content/signin/SignUpForm.vue
var SignUpForm_default = /* @__PURE__ */ defineComponent({
	__name: "SignUpForm",
	emits: ["submit"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const { t } = useI18n();
		const authStore = useAuthStore();
		const loading = computed(() => authStore.loading);
		const { enabled: turnstileEnabled } = useTurnstile();
		const { token: turnstileToken, unavailable: turnstileUnavailable, waiting: waitingForTurnstile } = useTurnstileGate(turnstileEnabled);
		const turnstileWidget = useTemplateRef("turnstileWidget");
		const emit = __emit;
		const onSubmit = useThrottleFn((event) => {
			if (event.valid && !waitingForTurnstile.value) emit("submit", event.values, turnstileToken.value || void 0);
		}, 1500);
		function resetTurnstile() {
			turnstileWidget.value?.reset();
		}
		__expose({ resetTurnstile });
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(script), {
				class: "flex flex-col gap-6",
				resolver: unref(zodResolver)(unref(signUpSchema)),
				onSubmit: unref(onSubmit)
			}, {
				default: withCtx(($form) => [
					createVNode(unref(script$1), {
						name: "email",
						class: "flex flex-col gap-2"
					}, {
						default: withCtx(($field) => [
							createBaseVNode("label", _hoisted_1, toDisplayString(unref(t)("auth.signup.emailLabel")), 1),
							createVNode(unref(script$2), {
								"pt:root:id": "comfy-org-sign-up-email",
								"pt:root:name": "email",
								"pt:root:autocomplete": "email",
								class: "h-10",
								type: "email",
								placeholder: unref(t)("auth.signup.emailPlaceholder"),
								invalid: $field.invalid
							}, null, 8, ["placeholder", "invalid"]),
							$field.error ? (openBlock(), createElementBlock("small", _hoisted_2, toDisplayString($field.error.message), 1)) : createCommentVNode("", true)
						]),
						_: 1
					}),
					createVNode(PasswordFields_default),
					unref(turnstileEnabled) ? (openBlock(), createBlock(TurnstileWidget_default, {
						key: 0,
						ref_key: "turnstileWidget",
						ref: turnstileWidget,
						token: unref(turnstileToken),
						"onUpdate:token": _cache[0] || (_cache[0] = ($event) => isRef(turnstileToken) ? turnstileToken.value = $event : null),
						unavailable: unref(turnstileUnavailable),
						"onUpdate:unavailable": _cache[1] || (_cache[1] = ($event) => isRef(turnstileUnavailable) ? turnstileUnavailable.value = $event : null)
					}, null, 8, ["token", "unavailable"])) : createCommentVNode("", true),
					withDirectives(createBaseVNode("small", {
						id: "comfy-org-sign-up-turnstile-hint",
						role: "status",
						"aria-live": "polite",
						class: "opacity-80"
					}, toDisplayString(unref(t)("auth.turnstile.submitBlockedHint")), 513), [[vShow, unref(waitingForTurnstile)]]),
					loading.value ? (openBlock(), createBlock(unref(script$3), {
						key: 1,
						class: "mx-auto size-8"
					})) : (openBlock(), createBlock(Button_default, {
						key: 2,
						type: "submit",
						class: "mt-4 h-10 font-medium",
						disabled: !$form.valid || unref(waitingForTurnstile),
						"aria-describedby": unref(waitingForTurnstile) ? "comfy-org-sign-up-turnstile-hint" : void 0
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("auth.signup.signUpButton")), 1)]),
						_: 1
					}, 8, ["disabled", "aria-describedby"]))
				]),
				_: 1
			}, 8, ["resolver", "onSubmit"]);
		};
	}
});
//#endregion
export { SignUpForm_default as t };

//# sourceMappingURL=SignUpForm-BCKuoyRd.js.map