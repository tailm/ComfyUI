import "./rolldown-runtime-w0pxe0c8.js";
import { X as script$2, m as script$1, q as script } from "./vendor-primevue-Di5q1E0M.js";
import { Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, V as defineComponent, X as nextTick, bt as withCtx, et as onMounted, j as createBaseVNode, jt as ref, ot as renderSlot, rt as openBlock, s as useRouter, x as vShow, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { n as isDesktop } from "./types-4cVPtFn2.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useUserStore } from "./userStore-DHnsYsi1.js";
import { n as isNativeWindow, t as electronAPI } from "./envUtil-pF8O5Ge5.js";
//#region src/views/templates/BaseViewTemplate.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex w-full grow items-center justify-center overflow-auto" };
//#endregion
//#region src/views/templates/BaseViewTemplate.vue
var BaseViewTemplate_default = /* @__PURE__ */ defineComponent({
	__name: "BaseViewTemplate",
	props: { dark: {
		type: Boolean,
		default: false
	} },
	setup(__props) {
		const darkTheme = {
			color: "rgba(0, 0, 0, 0)",
			symbolColor: "#d4d4d4"
		};
		const lightTheme = {
			color: "rgba(0, 0, 0, 0)",
			symbolColor: "#171717"
		};
		const topMenuRef = ref(null);
		onMounted(async () => {
			if (isDesktop) {
				await nextTick();
				electronAPI().changeTheme({
					...__props.dark ? darkTheme : lightTheme,
					height: topMenuRef.value?.getBoundingClientRect().height ?? 0
				});
			}
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["flex h-svh w-screen flex-col font-sans", [__props.dark ? "dark-theme bg-neutral-900 text-neutral-300" : "bg-neutral-300 text-neutral-900"]]) }, [withDirectives(createBaseVNode("div", {
				ref_key: "topMenuRef",
				ref: topMenuRef,
				class: "app-drag h-(--comfy-topbar-height) w-full"
			}, null, 512), [[vShow, unref(isNativeWindow)()]]), createBaseVNode("div", _hoisted_1$1, [renderSlot(_ctx.$slots, "default")])], 2);
		};
	}
});
//#endregion
//#region src/views/LoginView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	id: "comfy-login",
	class: "relative min-w-84 rounded-lg bg-(--comfy-menu-bg) p-5 px-10 shadow-lg"
};
var _hoisted_2 = { class: "flex w-full flex-col items-center" };
var _hoisted_3 = { class: "flex w-full mb-6" };
var _hoisted_4 = { class: "flex w-full flex-col gap-2" };
var _hoisted_5 = { for: "username-input" };
var _hoisted_6 = { class: "flex w-full flex-col gap-2 mt-4" };
var _hoisted_7 = { for: "password-input" };
var _hoisted_8 = {
	key: 0,
	class: "flex w-full flex-col gap-2 mt-4"
};
var _hoisted_9 = { for: "confirm-password-input" };
var _hoisted_10 = { class: "flex w-full flex-col gap-2 mt-4" };
var _hoisted_11 = { for: "captcha-input" };
var _hoisted_12 = { class: "flex gap-2 items-center" };
var _hoisted_13 = ["src", "title"];
var _hoisted_14 = { class: "mt-5" };
//#endregion
//#region src/views/LoginView.vue
var LoginView_default = /* @__PURE__ */ defineComponent({
	__name: "LoginView",
	setup(__props) {
		const userStore = useUserStore();
		const router = useRouter();
		const isLogin = ref(true);
		const username = ref("");
		const password = ref("");
		const confirmPassword = ref("");
		const captcha = ref("");
		const captchaImage = ref("");
		const captchaId = ref("");
		const error = ref("");
		const successMsg = ref("");
		const loading = ref(false);
		const refreshCaptcha = async () => {
			try {
				const response = await fetch("/api/captcha");
				captchaId.value = response.headers.get("X-Captcha-Id") || "";
				const blob = await response.blob();
				captchaImage.value = URL.createObjectURL(blob);
			} catch (err) {
				error.value = "Failed to load captcha";
			}
		};
		const handleLogin = async () => {
			if (!username.value || !password.value || !captcha.value) {
				error.value = "Please fill in all fields";
				return;
			}
			loading.value = true;
			error.value = "";
			successMsg.value = "";
			try {
				const data = await (await fetch("/api/v2/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username: username.value,
						password: password.value,
						captcha: captcha.value,
						captcha_id: captchaId.value
					})
				})).json();
				if (data.success) {
					await userStore.login({
						userId: String(data.user_id),
						username: username.value
					});
					await fetch("/api/set_user", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"comfy-user": String(data.user_id)
						},
						body: JSON.stringify({ user_id: data.user_id })
					});
					await router.push("/");
				} else {
					error.value = data.message || "Login failed";
					await refreshCaptcha();
					captcha.value = "";
				}
			} catch (err) {
				error.value = err instanceof Error ? err.message : "Login failed";
				await refreshCaptcha();
				captcha.value = "";
			} finally {
				loading.value = false;
			}
		};
		const handleRegister = async () => {
			if (!username.value || !password.value || !confirmPassword.value || !captcha.value) {
				error.value = "Please fill in all fields";
				return;
			}
			if (password.value !== confirmPassword.value) {
				error.value = "Passwords do not match";
				return;
			}
			if (password.value.length < 6) {
				error.value = "Password must be at least 6 characters";
				return;
			}
			loading.value = true;
			error.value = "";
			successMsg.value = "";
			try {
				const data = await (await fetch("/api/v2/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						username: username.value,
						password: password.value,
						captcha: captcha.value,
						captcha_id: captchaId.value
					})
				})).json();
				if (data.success) {
					successMsg.value = "Registration successful! Please login with your credentials.";
					isLogin.value = true;
					password.value = "";
					confirmPassword.value = "";
					captcha.value = "";
					await refreshCaptcha();
				} else {
					error.value = data.message || "Registration failed";
					await refreshCaptcha();
					captcha.value = "";
				}
			} catch (err) {
				error.value = err instanceof Error ? err.message : "Registration failed";
				await refreshCaptcha();
				captcha.value = "";
			} finally {
				loading.value = false;
			}
		};
		onMounted(async () => {
			document.getElementById("splash-loader")?.remove();
			await userStore.initialize();
			await refreshCaptcha();
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(BaseViewTemplate_default, { dark: "" }, {
				default: withCtx(() => [createBaseVNode("main", _hoisted_1, [_cache[7] || (_cache[7] = createBaseVNode("h1", { class: "my-2.5 mb-7 font-normal" }, "ComfyUI", -1)), createBaseVNode("div", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [createBaseVNode("button", {
						class: normalizeClass(["flex-1 py-2 text-center text-base font-medium border-b-2 transition-colors", isLogin.value ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:text-gray-300"]),
						onClick: _cache[0] || (_cache[0] = ($event) => isLogin.value = true)
					}, toDisplayString(_ctx.$t("login.login")), 3), createBaseVNode("button", {
						class: normalizeClass(["flex-1 py-2 text-center text-base font-medium border-b-2 transition-colors", !isLogin.value ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:text-gray-300"]),
						onClick: _cache[1] || (_cache[1] = ($event) => isLogin.value = false)
					}, " Register ", 2)]),
					createBaseVNode("div", _hoisted_4, [createBaseVNode("label", _hoisted_5, toDisplayString(_ctx.$t("login.username")) + ":", 1), createVNode(unref(script), {
						id: "username-input",
						modelValue: username.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => username.value = $event),
						placeholder: _ctx.$t("login.enterUsername")
					}, null, 8, ["modelValue", "placeholder"])]),
					createBaseVNode("div", _hoisted_6, [createBaseVNode("label", _hoisted_7, toDisplayString(_ctx.$t("login.password")) + ":", 1), createVNode(unref(script$1), {
						id: "password-input",
						modelValue: password.value,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => password.value = $event),
						placeholder: _ctx.$t("login.enterPassword"),
						feedback: false,
						"toggle-mask": "",
						fluid: ""
					}, null, 8, ["modelValue", "placeholder"])]),
					!isLogin.value ? (openBlock(), createElementBlock("div", _hoisted_8, [createBaseVNode("label", _hoisted_9, toDisplayString(_ctx.$t("login.confirmPassword")) + ":", 1), createVNode(unref(script$1), {
						id: "confirm-password-input",
						modelValue: confirmPassword.value,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => confirmPassword.value = $event),
						placeholder: _ctx.$t("login.enterConfirmPassword"),
						feedback: false,
						"toggle-mask": "",
						fluid: ""
					}, null, 8, ["modelValue", "placeholder"])])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_10, [createBaseVNode("label", _hoisted_11, toDisplayString(_ctx.$t("login.captcha")) + ":", 1), createBaseVNode("div", _hoisted_12, [createVNode(unref(script), {
						id: "captcha-input",
						modelValue: captcha.value,
						"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => captcha.value = $event),
						placeholder: _ctx.$t("login.enterCaptcha"),
						class: "flex-1"
					}, null, 8, ["modelValue", "placeholder"]), captchaImage.value ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: captchaImage.value,
						alt: "Captcha",
						class: "h-10 w-28 cursor-pointer rounded border border-interface-stroke hover:border-interface-button-hover-surface",
						onClick: refreshCaptcha,
						title: _ctx.$t("login.clickToRefresh")
					}, null, 8, _hoisted_13)) : createCommentVNode("", true)])]),
					error.value ? (openBlock(), createBlock(unref(script$2), {
						key: 1,
						severity: "error",
						class: "mt-4 w-full"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(error.value), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					successMsg.value ? (openBlock(), createBlock(unref(script$2), {
						key: 2,
						severity: "success",
						class: "mt-4 w-full"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(successMsg.value), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					createBaseVNode("footer", _hoisted_14, [createVNode(Button_default, {
						onClick: _cache[6] || (_cache[6] = ($event) => isLogin.value ? handleLogin() : handleRegister()),
						loading: loading.value
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(isLogin.value ? _ctx.$t("login.login") : "Register"), 1)]),
						_: 1
					}, 8, ["loading"])])
				])])]),
				_: 1
			});
		};
	}
});
//#endregion
export { LoginView_default as default };

//# sourceMappingURL=LoginView-D0rdkVUB.js.map