import "./rolldown-runtime-w0pxe0c8.js";
import { $ as script$2, X as script, _ as script$1 } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, S as vShow, St as withDirectives, Ut as normalizeClass, Vt as unref, Z as nextTick, c as useRouter, it as openBlock, st as renderSlot, tt as onMounted, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { n as isDesktop } from "./types-4cVPtFn2.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as useUserStore } from "./userStore-BKADmpNR.js";
import { n as isNativeWindow, t as electronAPI } from "./envUtil-BjE8ep-x.js";
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
var _hoisted_3 = { class: "flex w-full flex-col gap-2" };
var _hoisted_4 = { for: "username-input" };
var _hoisted_5 = { class: "flex w-full flex-col gap-2 mt-4" };
var _hoisted_6 = { for: "password-input" };
var _hoisted_7 = { class: "flex w-full flex-col gap-2 mt-4" };
var _hoisted_8 = { for: "captcha-input" };
var _hoisted_9 = { class: "flex gap-2 items-center" };
var _hoisted_10 = ["src", "title"];
var _hoisted_11 = { class: "mt-5" };
//#endregion
//#region src/views/LoginView.vue
var LoginView_default = /* @__PURE__ */ defineComponent({
	__name: "LoginView",
	setup(__props) {
		const userStore = useUserStore();
		const router = useRouter();
		const username = ref("");
		const password = ref("");
		const captcha = ref("");
		const captchaImage = ref("");
		const captchaId = ref("");
		const error = ref("");
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
		const login = async () => {
			if (!username.value || !password.value || !captcha.value) {
				error.value = "Please fill in all fields";
				return;
			}
			loading.value = true;
			error.value = "";
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
		onMounted(async () => {
			document.getElementById("splash-loader")?.remove();
			await userStore.initialize();
			await refreshCaptcha();
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(BaseViewTemplate_default, { dark: "" }, {
				default: withCtx(() => [createBaseVNode("main", _hoisted_1, [_cache[3] || (_cache[3] = createBaseVNode("h1", { class: "my-2.5 mb-7 font-normal" }, "ComfyUI", -1)), createBaseVNode("div", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [createBaseVNode("label", _hoisted_4, toDisplayString(_ctx.$t("login.username")) + ":", 1), createVNode(unref(script), {
						id: "username-input",
						modelValue: username.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => username.value = $event),
						placeholder: _ctx.$t("login.enterUsername")
					}, null, 8, ["modelValue", "placeholder"])]),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("label", _hoisted_6, toDisplayString(_ctx.$t("login.password")) + ":", 1), createVNode(unref(script$1), {
						id: "password-input",
						modelValue: password.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => password.value = $event),
						placeholder: _ctx.$t("login.enterPassword"),
						feedback: false,
						"toggle-mask": "",
						fluid: ""
					}, null, 8, ["modelValue", "placeholder"])]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("label", _hoisted_8, toDisplayString(_ctx.$t("login.captcha")) + ":", 1), createBaseVNode("div", _hoisted_9, [createVNode(unref(script), {
						id: "captcha-input",
						modelValue: captcha.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => captcha.value = $event),
						placeholder: _ctx.$t("login.enterCaptcha"),
						class: "flex-1"
					}, null, 8, ["modelValue", "placeholder"]), captchaImage.value ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: captchaImage.value,
						alt: "Captcha",
						class: "h-10 w-28 cursor-pointer rounded border border-interface-stroke hover:border-interface-button-hover-surface",
						onClick: refreshCaptcha,
						title: _ctx.$t("login.clickToRefresh")
					}, null, 8, _hoisted_10)) : createCommentVNode("", true)])]),
					error.value ? (openBlock(), createBlock(unref(script$2), {
						key: 0,
						severity: "error",
						class: "mt-4 w-full"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(error.value), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					createBaseVNode("footer", _hoisted_11, [createVNode(Button_default, {
						onClick: login,
						loading: loading.value
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("login.login")), 1)]),
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

//# sourceMappingURL=LoginView-kUQEskZH.js.map