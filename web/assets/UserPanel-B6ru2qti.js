import "./rolldown-runtime-w0pxe0c8.js";
import { b as script } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, V as defineComponent, bt as withCtx, ct as resolveDirective, et as onMounted, j as createBaseVNode, jt as ref, rt as openBlock, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { pi as useDialogService } from "./promotionUtils-DLM4TsXW.js";
import { r as api } from "./api-DIYghw4R.js";
import { c as useUserStore } from "./teamWorkspaceStore-CfjV-n35.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
//#region src/components/dialog/content/setting/UserPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "user-settings-container h-full" };
var _hoisted_2 = { class: "flex h-full flex-col" };
var _hoisted_3 = { class: "mb-2 text-2xl font-bold" };
var _hoisted_4 = {
	key: 0,
	class: "flex items-center justify-center py-8"
};
var _hoisted_5 = {
	key: 1,
	class: "flex flex-col gap-4"
};
var _hoisted_6 = { class: "flex items-center gap-4" };
var _hoisted_7 = { class: "flex flex-col" };
var _hoisted_8 = { class: "flex items-center gap-2" };
var _hoisted_9 = { class: "text-lg font-semibold" };
var _hoisted_10 = {
	key: 0,
	class: "rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700"
};
var _hoisted_11 = { class: "text-sm text-muted" };
var _hoisted_12 = { class: "flex flex-col gap-3" };
var _hoisted_13 = { class: "flex flex-col gap-0.5" };
var _hoisted_14 = { class: "font-medium" };
var _hoisted_15 = { class: "text-muted" };
var _hoisted_16 = { class: "flex flex-col gap-0.5" };
var _hoisted_17 = { class: "font-medium" };
var _hoisted_18 = { class: "flex items-center gap-1 text-muted" };
var _hoisted_19 = { class: "flex flex-col gap-0.5" };
var _hoisted_20 = { class: "text-muted" };
var _hoisted_21 = { class: "flex flex-col gap-0.5" };
var _hoisted_22 = { class: "flex items-center gap-1.5" };
var _hoisted_23 = { class: "text-muted" };
var _hoisted_24 = { class: "flex flex-col gap-0.5" };
var _hoisted_25 = { class: "text-muted" };
var _hoisted_26 = { class: "flex flex-col gap-0.5" };
var _hoisted_27 = { class: "text-muted" };
var _hoisted_28 = { class: "mt-4 flex flex-col gap-2" };
var _hoisted_29 = {
	key: 2,
	class: "flex flex-col items-center gap-4 py-8"
};
var _hoisted_30 = { class: "text-muted" };
//#endregion
//#region src/components/dialog/content/setting/UserPanel.vue
var UserPanel_default = /* @__PURE__ */ defineComponent({
	__name: "UserPanel",
	setup(__props) {
		const userStore = useUserStore();
		const dialogService = useDialogService();
		const loading = ref(true);
		const userInfo = ref(null);
		const userInitial = computed(() => userInfo.value?.username?.charAt(0).toUpperCase() ?? "?");
		const levelLabel = computed(() => {
			const level = userInfo.value?.level;
			if (level === 3) return "Administrator";
			if (level === 2) return "Advanced";
			return "Standard";
		});
		function formatDate(dateStr) {
			if (!dateStr) return "N/A";
			try {
				return new Date(dateStr).toLocaleDateString(void 0, {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit"
				});
			} catch {
				return dateStr;
			}
		}
		async function fetchUserInfo() {
			loading.value = true;
			try {
				const config = await api.getUserConfig();
				if (config?.users?.length) {
					const apiUser = config.users[0];
					userInfo.value = {
						userId: apiUser.userId,
						username: apiUser.username,
						level: apiUser.level,
						isAdmin: apiUser.isAdmin,
						isActive: apiUser.isActive,
						createdAt: apiUser.createdAt,
						lastLogin: apiUser.lastLogin
					};
					if (!userStore.currentUserId) userStore.login({
						userId: apiUser.userId,
						username: apiUser.username
					});
				} else userInfo.value = null;
			} catch (err) {
				console.error("Failed to fetch user info:", err);
				userInfo.value = null;
			} finally {
				loading.value = false;
			}
		}
		onMounted(() => {
			fetchUserInfo();
		});
		async function handleSignOut() {
			await fetch("/api/logout", { method: "POST" });
			await userStore.logout();
			userInfo.value = null;
			window.location.href = "/login";
		}
		function handleSignIn() {
			window.location.href = "/login";
		}
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("userSettings.title")), 1),
				createVNode(unref(script), { class: "mb-3" }),
				loading.value ? (openBlock(), createElementBlock("div", _hoisted_4, [..._cache[1] || (_cache[1] = [createBaseVNode("i", { class: "pi pi-spin pi-spinner text-2xl text-muted" }, null, -1)])])) : userInfo.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
					createBaseVNode("div", _hoisted_6, [createBaseVNode("div", { class: normalizeClass(["flex size-14 items-center justify-center rounded-full text-xl font-bold text-white", userInfo.value.isAdmin ? "bg-orange-600" : "bg-blue-600"]) }, toDisplayString(userInitial.value), 3), createBaseVNode("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, [createBaseVNode("span", _hoisted_9, toDisplayString(userInfo.value.username), 1), userInfo.value.isAdmin ? (openBlock(), createElementBlock("span", _hoisted_10, " Admin ")) : createCommentVNode("", true)]), createBaseVNode("span", _hoisted_11, "ID: " + toDisplayString(userInfo.value.userId), 1)])]),
					createVNode(unref(script)),
					createBaseVNode("div", _hoisted_12, [
						createBaseVNode("div", _hoisted_13, [createBaseVNode("h3", _hoisted_14, toDisplayString(_ctx.$t("userSettings.name")), 1), createBaseVNode("div", _hoisted_15, toDisplayString(userInfo.value.username || _ctx.$t("userSettings.notSet")), 1)]),
						createBaseVNode("div", _hoisted_16, [createBaseVNode("h3", _hoisted_17, toDisplayString(_ctx.$t("userSettings.provider")), 1), createBaseVNode("div", _hoisted_18, [
							_cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-key" }, null, -1)),
							_cache[4] || (_cache[4] = createTextVNode(" Local ", -1)),
							withDirectives((openBlock(), createBlock(Button_default, {
								variant: "muted-textonly",
								size: "icon-sm",
								onClick: _cache[0] || (_cache[0] = ($event) => unref(dialogService).showUpdatePasswordDialog())
							}, {
								default: withCtx(() => [..._cache[2] || (_cache[2] = [createBaseVNode("i", { class: "pi pi-pen-to-square" }, null, -1)])]),
								_: 1
							})), [[_directive_tooltip, {
								value: _ctx.$t("userSettings.updatePassword"),
								showDelay: 300
							}]])
						])]),
						createBaseVNode("div", _hoisted_19, [_cache[5] || (_cache[5] = createBaseVNode("h3", { class: "font-medium" }, "Level", -1)), createBaseVNode("div", _hoisted_20, toDisplayString(levelLabel.value), 1)]),
						createBaseVNode("div", _hoisted_21, [_cache[6] || (_cache[6] = createBaseVNode("h3", { class: "font-medium" }, "Status", -1)), createBaseVNode("div", _hoisted_22, [createBaseVNode("span", { class: normalizeClass(["inline-block size-2 rounded-full", userInfo.value.isActive ? "bg-green-500" : "bg-red-500"]) }, null, 2), createBaseVNode("span", _hoisted_23, toDisplayString(userInfo.value.isActive ? "Active" : "Inactive"), 1)])]),
						createBaseVNode("div", _hoisted_24, [_cache[7] || (_cache[7] = createBaseVNode("h3", { class: "font-medium" }, "Registered", -1)), createBaseVNode("div", _hoisted_25, toDisplayString(formatDate(userInfo.value.createdAt)), 1)]),
						createBaseVNode("div", _hoisted_26, [_cache[8] || (_cache[8] = createBaseVNode("h3", { class: "font-medium" }, "Last Login", -1)), createBaseVNode("div", _hoisted_27, toDisplayString(formatDate(userInfo.value.lastLogin)), 1)])
					]),
					createBaseVNode("div", _hoisted_28, [createVNode(Button_default, {
						class: "w-32",
						variant: "secondary",
						onClick: handleSignOut
					}, {
						default: withCtx(() => [_cache[9] || (_cache[9] = createBaseVNode("i", { class: "pi pi-sign-out" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("auth.signOut.signOut")), 1)]),
						_: 1
					})])
				])) : (openBlock(), createElementBlock("div", _hoisted_29, [
					_cache[11] || (_cache[11] = createBaseVNode("i", { class: "pi pi-user text-4xl text-muted" }, null, -1)),
					createBaseVNode("p", _hoisted_30, toDisplayString(_ctx.$t("g.notLoggedIn")), 1),
					createVNode(Button_default, { onClick: handleSignIn }, {
						default: withCtx(() => [_cache[10] || (_cache[10] = createBaseVNode("i", { class: "pi pi-sign-in" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("login.login")), 1)]),
						_: 1
					})
				]))
			])]);
		};
	}
});
//#endregion
export { UserPanel_default as default };

//# sourceMappingURL=UserPanel-B6ru2qti.js.map