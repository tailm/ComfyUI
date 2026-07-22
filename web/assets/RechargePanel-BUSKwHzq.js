import "./rolldown-runtime-w0pxe0c8.js";
import { b as script, tt as useToast } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, et as onMounted, j as createBaseVNode, jt as ref, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { r as api } from "./api-Bz5NhLSR.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useUserStore } from "./userStore-sNxhcspP.js";
import { n as pointsApi } from "./pointsApi-BtUVnmG2.js";
import { t as usePointsStats } from "./usePointsStats-DMd6O-zQ.js";
//#region src/components/dialog/content/setting/RechargePanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "recharge-panel-container h-full" };
var _hoisted_2 = { class: "flex h-full flex-col" };
var _hoisted_3 = { class: "mb-2 text-2xl font-bold" };
var _hoisted_4 = {
	key: 0,
	class: "flex items-center justify-center py-8"
};
var _hoisted_5 = {
	key: 1,
	class: "flex flex-col items-center gap-4 py-8"
};
var _hoisted_6 = { class: "text-muted" };
var _hoisted_7 = {
	key: 2,
	class: "flex flex-1 flex-col"
};
var _hoisted_8 = { class: "mb-6 rounded-lg border border-border-default bg-surface p-4" };
var _hoisted_9 = { class: "mb-1 text-sm text-muted" };
var _hoisted_10 = { class: "text-3xl font-bold text-primary" };
var _hoisted_11 = { class: "ml-1 text-sm font-normal text-muted" };
var _hoisted_12 = { class: "mb-6" };
var _hoisted_13 = { class: "mb-3 text-sm font-medium text-base-foreground" };
var _hoisted_14 = { class: "grid grid-cols-3 gap-3" };
var _hoisted_15 = ["onClick"];
var _hoisted_16 = { class: "text-lg font-bold text-base-foreground" };
var _hoisted_17 = { class: "mt-1 text-xs text-muted" };
var _hoisted_18 = { class: "mb-6" };
var _hoisted_19 = { class: "mb-3 text-sm font-medium text-base-foreground" };
var _hoisted_20 = { class: "flex gap-3" };
var _hoisted_21 = { class: "text-sm font-medium text-base-foreground" };
var _hoisted_22 = { class: "text-sm font-medium text-base-foreground" };
var _hoisted_23 = { class: "mt-3 text-center text-xs text-muted" };
//#endregion
//#region src/components/dialog/content/setting/RechargePanel.vue
var RechargePanel_default = /* @__PURE__ */ defineComponent({
	__name: "RechargePanel",
	setup(__props) {
		const { t } = useI18n();
		const toast = useToast();
		const userStore = useUserStore();
		const { stats, fetchStats } = usePointsStats();
		const isLoggedIn = ref(false);
		const loading = ref(true);
		const selectedAmount = ref(9.9);
		const selectedPayment = ref("wechat");
		const submitting = ref(false);
		const PRESET_AMOUNTS = [
			{
				amount: 9.9,
				points: 1e3
			},
			{
				amount: 19.9,
				points: 3e3
			},
			{
				amount: 49.9,
				points: 1e4
			},
			{
				amount: 99.9,
				points: 25e3
			},
			{
				amount: 199,
				points: 5e4
			},
			{
				amount: 1,
				points: 100
			}
		];
		const currentBalance = computed(() => stats.value.balance);
		const canRecharge = computed(() => selectedAmount.value > 0 && selectedPayment.value);
		function handleSelectAmount(amount) {
			selectedAmount.value = amount;
		}
		async function checkLoginStatus() {
			loading.value = true;
			try {
				const config = await api.getUserConfig();
				if (config?.users?.length) {
					isLoggedIn.value = true;
					if (!userStore.currentUserId) userStore.login({
						userId: config.users[0].userId,
						username: config.users[0].username
					});
					await fetchStats();
				} else isLoggedIn.value = false;
			} catch {
				isLoggedIn.value = false;
			} finally {
				loading.value = false;
			}
		}
		async function handleRecharge() {
			if (submitting.value || !canRecharge.value) return;
			submitting.value = true;
			try {
				const order = await pointsApi.createRechargeOrder(selectedAmount.value, selectedPayment.value);
				if (order.paymentUrl) window.open(order.paymentUrl, "_blank");
				toast.add({
					severity: "info",
					summary: t("recharge.paymentTitle"),
					detail: t("recharge.paymentProcessing"),
					life: 5e3
				});
				if (await pollOrderStatus(order.orderId) === "paid") {
					toast.add({
						severity: "success",
						summary: t("recharge.paymentSuccess"),
						detail: `+${order.points} ${t("recharge.pointsUnit")}`,
						life: 5e3
					});
					await fetchStats();
				} else toast.add({
					severity: "warn",
					summary: t("recharge.paymentFailed"),
					detail: t("recharge.paymentTimeout"),
					life: 5e3
				});
			} catch (e) {
				toast.add({
					severity: "error",
					summary: t("recharge.createOrderFailed"),
					detail: e.message || t("recharge.unknownError"),
					life: 5e3
				});
			} finally {
				submitting.value = false;
			}
		}
		async function pollOrderStatus(orderId) {
			const maxRetries = 60;
			const interval = 3e3;
			for (let i = 0; i < maxRetries; i++) {
				try {
					if ((await pointsApi.getOrderStatus(orderId)).status === "paid") return "paid";
				} catch {}
				await new Promise((resolve) => setTimeout(resolve, interval));
			}
			return "timeout";
		}
		function handleLogin() {
			window.location.href = "/login";
		}
		onMounted(() => {
			checkLoginStatus();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("recharge.title")), 1),
				createVNode(unref(script), { class: "mb-3" }),
				loading.value ? (openBlock(), createElementBlock("div", _hoisted_4, [..._cache[2] || (_cache[2] = [createBaseVNode("i", { class: "pi pi-spin pi-spinner text-2xl text-muted" }, null, -1)])])) : !isLoggedIn.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
					_cache[4] || (_cache[4] = createBaseVNode("i", { class: "pi pi-lock text-4xl text-muted" }, null, -1)),
					createBaseVNode("p", _hoisted_6, toDisplayString(_ctx.$t("recharge.pleaseLogin")), 1),
					createVNode(Button_default, { onClick: handleLogin }, {
						default: withCtx(() => [_cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-sign-in" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("login.login")), 1)]),
						_: 1
					})
				])) : (openBlock(), createElementBlock("div", _hoisted_7, [
					createBaseVNode("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, toDisplayString(_ctx.$t("recharge.currentBalance")), 1), createBaseVNode("div", _hoisted_10, [createTextVNode(toDisplayString(Math.floor(currentBalance.value)) + " ", 1), createBaseVNode("span", _hoisted_11, toDisplayString(_ctx.$t("recharge.pointsUnit")), 1)])]),
					createBaseVNode("div", _hoisted_12, [createBaseVNode("h3", _hoisted_13, toDisplayString(_ctx.$t("recharge.selectAmount")), 1), createBaseVNode("div", _hoisted_14, [(openBlock(), createElementBlock(Fragment, null, renderList(PRESET_AMOUNTS, (preset) => {
						return createBaseVNode("div", {
							key: preset.amount,
							class: normalizeClass(["cursor-pointer rounded-lg border-2 p-4 text-center transition-all", selectedAmount.value === preset.amount ? "border-primary bg-primary/5" : "border-border-default hover:border-primary/50"]),
							onClick: ($event) => handleSelectAmount(preset.amount)
						}, [createBaseVNode("div", _hoisted_16, " ¥ " + toDisplayString(preset.amount), 1), createBaseVNode("div", _hoisted_17, toDisplayString(preset.points) + " " + toDisplayString(_ctx.$t("recharge.pointsUnit")), 1)], 10, _hoisted_15);
					}), 64))])]),
					createBaseVNode("div", _hoisted_18, [createBaseVNode("h3", _hoisted_19, toDisplayString(_ctx.$t("recharge.selectPayment")), 1), createBaseVNode("div", _hoisted_20, [createBaseVNode("div", {
						class: normalizeClass(["flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all", selectedPayment.value === "wechat" ? "border-green-500 bg-green-500/5" : "border-border-default hover:border-green-500/50"]),
						onClick: _cache[0] || (_cache[0] = ($event) => selectedPayment.value = "wechat")
					}, [_cache[5] || (_cache[5] = createBaseVNode("svg", {
						class: "h-6 w-6",
						viewBox: "0 0 24 24",
						fill: "none",
						xmlns: "http://www.w3.org/2000/svg"
					}, [createBaseVNode("path", {
						d: "M9.5 4C5.36 4 2 6.69 2 10C2 11.89 3.08 13.56 4.78 14.66L4 17L6.81 15.5C7.64 15.8 8.55 16 9.5 16C9.67 16 9.83 16 10 15.99C9.69 15.39 9.5 14.72 9.5 14C9.5 10.69 12.47 8 16.15 8C16.38 8 16.61 8.01 16.84 8.04C16.04 5.69 13.04 4 9.5 4ZM7 9C6.45 9 6 8.55 6 8C6 7.45 6.45 7 7 7C7.55 7 8 7.45 8 8C8 8.55 7.55 9 7 9ZM12 9C11.45 9 11 8.55 11 8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8C13 8.55 12.55 9 12 9Z",
						fill: "#07C160"
					}), createBaseVNode("path", {
						d: "M22 14C22 11.24 19.31 9 16 9C12.69 9 10 11.24 10 14C10 16.76 12.69 19 16 19C16.67 19 17.31 18.92 17.91 18.75L20 20L19.38 17.81C20.95 16.89 22 15.55 22 14ZM14 13C13.45 13 13 12.55 13 12C13 11.45 13.45 11 14 11C14.55 11 15 11.45 15 12C15 12.55 14.55 13 14 13ZM18 13C17.45 13 17 12.55 17 12C17 11.45 17.45 11 18 11C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z",
						fill: "#07C160"
					})], -1)), createBaseVNode("span", _hoisted_21, toDisplayString(_ctx.$t("recharge.wechat")), 1)], 2), createBaseVNode("div", {
						class: normalizeClass(["flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all", selectedPayment.value === "alipay" ? "border-blue-500 bg-blue-500/5" : "border-border-default hover:border-blue-500/50"]),
						onClick: _cache[1] || (_cache[1] = ($event) => selectedPayment.value = "alipay")
					}, [_cache[6] || (_cache[6] = createBaseVNode("svg", {
						class: "h-6 w-6",
						viewBox: "0 0 24 24",
						fill: "none",
						xmlns: "http://www.w3.org/2000/svg"
					}, [createBaseVNode("path", {
						d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12.36 15.83C12.36 15.83 12.28 15.87 12.16 15.87C12.04 15.87 11.96 15.83 11.96 15.83L7.04 12.65C6.88 12.55 6.88 12.31 7.04 12.21L11.96 9.03C11.96 9.03 12.04 8.99 12.16 8.99C12.28 8.99 12.36 9.03 12.36 9.03L17.28 12.21C17.44 12.31 17.44 12.55 17.28 12.65L12.36 15.83Z",
						fill: "#1677FF"
					}), createBaseVNode("path", {
						d: "M12.36 18.17C12.36 18.17 12.28 18.21 12.16 18.21C12.04 18.21 11.96 18.17 11.96 18.17L7.04 14.99C6.88 14.89 6.88 14.65 7.04 14.55L11.96 11.37C11.96 11.37 12.04 11.33 12.16 11.33C12.28 11.33 12.36 11.37 12.36 11.37L17.28 14.55C17.44 14.65 17.44 14.89 17.28 14.99L12.36 18.17Z",
						fill: "#1677FF",
						opacity: "0.7"
					})], -1)), createBaseVNode("span", _hoisted_22, toDisplayString(_ctx.$t("recharge.alipay")), 1)], 2)])]),
					createVNode(Button_default, {
						disabled: !canRecharge.value || submitting.value,
						loading: submitting.value,
						variant: "primary",
						size: "lg",
						class: "h-12 w-full justify-center text-base",
						onClick: handleRecharge
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("recharge.payNow")) + " ¥ " + toDisplayString(selectedAmount.value), 1)]),
						_: 1
					}, 8, ["disabled", "loading"]),
					createBaseVNode("p", _hoisted_23, toDisplayString(_ctx.$t("recharge.paymentHint")), 1)
				]))
			])]);
		};
	}
});
//#endregion
export { RechargePanel_default as default };

//# sourceMappingURL=RechargePanel-BUSKwHzq.js.map