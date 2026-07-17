import "./rolldown-runtime-w0pxe0c8.js";
import { R as script$1, b as script } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, V as defineComponent, bt as withCtx, ct as resolveDirective, j as createBaseVNode, jt as ref, rt as openBlock, s as useRouter, st as resolveComponent, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useUserStore } from "./userStore-DHnsYsi1.js";
import { t as UserAvatar_default } from "./UserAvatar-Cib7ZZ7y.js";
//#region src/components/dialog/content/setting/UserPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "user-settings-container h-full" };
var _hoisted_2 = { class: "flex h-full flex-col" };
var _hoisted_3 = { class: "mb-2 text-2xl font-bold" };
var _hoisted_4 = { class: "flex flex-col gap-2" };
var _hoisted_5 = { class: "flex flex-col gap-0.5" };
var _hoisted_6 = { class: "font-medium" };
var _hoisted_7 = { class: "text-muted" };
var _hoisted_8 = { class: "flex flex-col gap-0.5" };
var _hoisted_9 = { class: "font-medium" };
var _hoisted_10 = { class: "text-muted" };
var _hoisted_11 = { class: "flex flex-col gap-0.5" };
var _hoisted_12 = { class: "font-medium" };
var _hoisted_13 = { class: "flex items-center gap-1 text-muted" };
var _hoisted_14 = {
	key: 2,
	class: "mt-4 flex flex-col gap-2"
};
var _hoisted_15 = { class: "flex flex-col gap-4" };
var _hoisted_16 = { class: "text-smoke-600" };
//#endregion
//#region src/components/dialog/content/setting/UserPanel.vue
var UserPanel_default = /* @__PURE__ */ defineComponent({
	__name: "UserPanel",
	setup(__props) {
		const userStore = useUserStore();
		const router = useRouter();
		const loading = ref(false);
		computed(() => !!userStore.currentUserId);
		const isApiKeyLogin = ref(false);
		const isEmailProvider = ref(true);
		const userDisplayName = computed(() => userStore.currentUserId ?? "");
		const userEmail = computed(() => "");
		const userPhotoUrl = ref(null);
		const providerName = ref("Local");
		const providerIcon = ref("pi pi-key");
		async function handleSignOut() {
			await fetch("/api/logout", { method: "POST" });
			userStore.$reset();
			router.push("/#/login");
		}
		function handleSignIn() {
			router.push("/#/login");
		}
		return (_ctx, _cache) => {
			const _component_i18n_t = resolveComponent("i18n-t");
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("userSettings.title")), 1),
				createVNode(unref(script), { class: "mb-3" }),
				createBaseVNode("div", _hoisted_4, [
					userPhotoUrl.value ? (openBlock(), createBlock(UserAvatar_default, {
						key: 0,
						"photo-url": userPhotoUrl.value,
						shape: "circle",
						size: "large"
					}, null, 8, ["photo-url"])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("h3", _hoisted_6, toDisplayString(_ctx.$t("userSettings.name")), 1), createBaseVNode("div", _hoisted_7, toDisplayString(userDisplayName.value || _ctx.$t("userSettings.notSet")), 1)]),
					createBaseVNode("div", _hoisted_8, [createBaseVNode("h3", _hoisted_9, toDisplayString(_ctx.$t("userSettings.email")), 1), createBaseVNode("span", _hoisted_10, toDisplayString(userEmail.value), 1)]),
					createBaseVNode("div", _hoisted_11, [createBaseVNode("h3", _hoisted_12, toDisplayString(_ctx.$t("userSettings.provider")), 1), createBaseVNode("div", _hoisted_13, [
						createBaseVNode("i", { class: normalizeClass(providerIcon.value) }, null, 2),
						createTextVNode(" " + toDisplayString(providerName.value) + " ", 1),
						isEmailProvider.value ? withDirectives((openBlock(), createBlock(Button_default, {
							key: 0,
							variant: "muted-textonly",
							size: "icon-sm",
							onClick: _cache[0] || (_cache[0] = ($event) => _ctx.dialogService.showUpdatePasswordDialog())
						}, {
							default: withCtx(() => [..._cache[1] || (_cache[1] = [createBaseVNode("i", { class: "pi pi-pen-to-square" }, null, -1)])]),
							_: 1
						})), [[_directive_tooltip, {
							value: _ctx.$t("userSettings.updatePassword"),
							showDelay: 300
						}]]) : createCommentVNode("", true)
					])]),
					loading.value ? (openBlock(), createBlock(unref(script$1), {
						key: 1,
						class: "mt-4 size-8",
						style: { "--pc-spinner-color": "#000" }
					})) : (openBlock(), createElementBlock("div", _hoisted_14, [createVNode(Button_default, {
						class: "w-32",
						variant: "secondary",
						onClick: handleSignOut
					}, {
						default: withCtx(() => [_cache[2] || (_cache[2] = createBaseVNode("i", { class: "pi pi-sign-out" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("auth.signOut.signOut")), 1)]),
						_: 1
					}), !isApiKeyLogin.value ? (openBlock(), createBlock(_component_i18n_t, {
						key: 0,
						keypath: "auth.deleteAccount.contactSupport",
						tag: "p",
						class: "text-sm text-muted"
					}, {
						email: withCtx(() => [..._cache[3] || (_cache[3] = [createBaseVNode("a", {
							href: "mailto:support@comfy.org",
							class: "underline"
						}, "support@comfy.org", -1)])]),
						_: 1
					})) : createCommentVNode("", true)]))
				]),
				createBaseVNode("div", _hoisted_15, [createBaseVNode("p", _hoisted_16, toDisplayString(_ctx.$t("auth.login.title")), 1), createVNode(Button_default, {
					class: "w-52",
					variant: "primary",
					loading: loading.value,
					onClick: handleSignIn
				}, {
					default: withCtx(() => [_cache[4] || (_cache[4] = createBaseVNode("i", { class: "pi pi-user" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("auth.login.signInOrSignUp")), 1)]),
					_: 1
				}, 8, ["loading"])])
			])]);
		};
	}
});
//#endregion
export { UserPanel_default as default };

//# sourceMappingURL=UserPanel-BBx1DB6g.js.map