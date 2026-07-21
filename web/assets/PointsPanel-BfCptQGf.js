import "./rolldown-runtime-w0pxe0c8.js";
import { C as script$3, K as script$6, O as script$4, R as script, X as script$1, b as script$5, x as script$2 } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, bt as withCtx, et as onMounted, gt as watch, j as createBaseVNode, jt as ref, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { r as api } from "./api-Bz5NhLSR.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useUserStore } from "./userStore-sNxhcspP.js";
import { n as pointsApi } from "./pointsApi-BbgsLWFo.js";
//#region src/composables/points/usePointsTransactions.ts
function usePointsTransactions() {
	const transactions = ref([]);
	const loading = ref(false);
	const error = ref(null);
	const pagination = ref({
		page: 1,
		pageSize: 10,
		total: 0,
		totalPages: 0
	});
	async function fetchTransactions(page = 1, pageSize = 10, type = "all") {
		loading.value = true;
		error.value = null;
		try {
			const response = await pointsApi.getTransactions({
				page,
				pageSize,
				type
			});
			transactions.value = response.transactions;
			pagination.value = {
				page: response.page,
				pageSize: response.pageSize,
				total: response.total,
				totalPages: response.totalPages
			};
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to fetch transactions";
		} finally {
			loading.value = false;
		}
	}
	return {
		transactions,
		loading,
		error,
		pagination,
		fetchTransactions
	};
}
//#endregion
//#region src/components/dialog/content/setting/PointsTransactionsTable.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = {
	key: 0,
	class: "flex items-center justify-center p-8"
};
var _hoisted_2$1 = {
	key: 1,
	class: "p-4"
};
var _hoisted_3$1 = {
	key: 2,
	class: "flex flex-col items-center justify-center p-8"
};
var _hoisted_4$1 = { class: "text-muted" };
var _hoisted_5$1 = { class: "text-sm text-muted" };
//#endregion
//#region src/components/dialog/content/setting/PointsTransactionsTable.vue
var PointsTransactionsTable_default = /* @__PURE__ */ defineComponent({
	__name: "PointsTransactionsTable",
	props: { filterType: {} },
	setup(__props, { expose: __expose }) {
		const props = __props;
		const { t } = useI18n();
		const { transactions, loading, error, pagination, fetchTransactions } = usePointsTransactions();
		function formatDate(dateString) {
			return new Date(dateString).toLocaleString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		}
		function getTransactionTypeLabel(type) {
			return {
				"init": t("points.typeInit"),
				"recharge": t("points.typeRecharge"),
				"deduct": t("points.typeDeduct"),
				"daily_claim": t("points.typeDailyClaim")
			}[type] || type;
		}
		function getTransactionTypeSeverity(type) {
			return {
				"init": "info",
				"recharge": "success",
				"deduct": "warning",
				"daily_claim": "success"
			}[type] || "secondary";
		}
		function onPageChange(event) {
			fetchTransactions(event.page + 1, pagination.value.pageSize, props.filterType);
		}
		watch(() => props.filterType, () => {
			fetchTransactions(1, pagination.value.pageSize, props.filterType);
		});
		onMounted(() => {
			fetchTransactions();
		});
		__expose({ refresh: () => fetchTransactions(1, pagination.value.pageSize, props.filterType) });
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", null, [unref(loading) ? (openBlock(), createElementBlock("div", _hoisted_1$1, [createVNode(unref(script))])) : unref(error) ? (openBlock(), createElementBlock("div", _hoisted_2$1, [createVNode(unref(script$1), {
				severity: "error",
				closable: false
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(unref(error)), 1)]),
				_: 1
			})])) : unref(transactions).length === 0 ? (openBlock(), createElementBlock("div", _hoisted_3$1, [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "pi pi-inbox mb-4 text-4xl text-muted" }, null, -1)), createBaseVNode("p", _hoisted_4$1, toDisplayString(_ctx.$t("points.noRecords")), 1)])) : (openBlock(), createBlock(unref(script$2), {
				key: 3,
				value: unref(transactions),
				paginator: true,
				rows: unref(pagination).pageSize,
				"total-records": unref(pagination).total,
				first: (unref(pagination).page - 1) * unref(pagination).pageSize,
				lazy: true,
				class: "p-datatable-sm custom-datatable",
				onPage: onPageChange
			}, {
				default: withCtx(() => [
					createVNode(unref(script$3), {
						field: "transactionType",
						header: _ctx.$t("points.type")
					}, {
						body: withCtx(({ data }) => [createVNode(unref(script$4), {
							value: getTransactionTypeLabel(data.transactionType),
							severity: getTransactionTypeSeverity(data.transactionType)
						}, null, 8, ["value", "severity"])]),
						_: 1
					}, 8, ["header"]),
					createVNode(unref(script$3), {
						field: "amount",
						header: _ctx.$t("points.amount")
					}, {
						body: withCtx(({ data }) => [createBaseVNode("span", { class: normalizeClass(data.amount > 0 ? "font-semibold text-green-500" : "font-semibold text-red-500") }, toDisplayString(data.amount > 0 ? "+" : "") + toDisplayString(data.amount.toFixed(2)), 3)]),
						_: 1
					}, 8, ["header"]),
					createVNode(unref(script$3), {
						field: "createTime",
						header: _ctx.$t("points.time")
					}, {
						body: withCtx(({ data }) => [createTextVNode(toDisplayString(formatDate(data.createTime)), 1)]),
						_: 1
					}, 8, ["header"]),
					createVNode(unref(script$3), {
						field: "remark",
						header: _ctx.$t("points.remark")
					}, {
						body: withCtx(({ data }) => [createBaseVNode("span", _hoisted_5$1, toDisplayString(data.remark || "-"), 1)]),
						_: 1
					}, 8, ["header"])
				]),
				_: 1
			}, 8, [
				"value",
				"rows",
				"total-records",
				"first"
			]))]);
		};
	}
});
//#endregion
//#region src/composables/points/usePointsStats.ts
function usePointsStats() {
	const stats = ref({
		balance: 0,
		totalEarned: 0,
		totalConsumed: 0
	});
	const loading = ref(false);
	const error = ref(null);
	async function fetchStats() {
		loading.value = true;
		error.value = null;
		try {
			stats.value = await pointsApi.getStats();
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to fetch stats";
		} finally {
			loading.value = false;
		}
	}
	return {
		stats,
		loading,
		error,
		fetchStats
	};
}
//#endregion
//#region src/components/dialog/content/setting/PointsPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "points-panel-container h-full" };
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
var _hoisted_7 = { class: "mb-4 grid grid-cols-3 gap-4" };
var _hoisted_8 = { class: "border-border bg-surface rounded-lg border p-4" };
var _hoisted_9 = { class: "mb-2 text-sm text-muted" };
var _hoisted_10 = { class: "text-2xl font-bold text-primary" };
var _hoisted_11 = { class: "border-border bg-surface rounded-lg border p-4" };
var _hoisted_12 = { class: "mb-2 text-sm text-muted" };
var _hoisted_13 = { class: "text-2xl font-bold text-green-500" };
var _hoisted_14 = { class: "border-border bg-surface rounded-lg border p-4" };
var _hoisted_15 = { class: "mb-2 text-sm text-muted" };
var _hoisted_16 = { class: "text-2xl font-bold text-red-500" };
var _hoisted_17 = { class: "mb-3 flex justify-end" };
//#endregion
//#region src/components/dialog/content/setting/PointsPanel.vue
var PointsPanel_default = /* @__PURE__ */ defineComponent({
	__name: "PointsPanel",
	setup(__props) {
		const { t } = useI18n();
		const userStore = useUserStore();
		const { stats, loading, fetchStats } = usePointsStats();
		const isLoggedIn = ref(false);
		const filterType = ref("all");
		const transactionsTableRef = ref(null);
		const filterOptions = computed(() => [
			{
				label: t("points.filterAll"),
				value: "all"
			},
			{
				label: t("points.filterEarned"),
				value: "earned"
			},
			{
				label: t("points.filterConsumed"),
				value: "consumed"
			}
		]);
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
			} catch (err) {
				console.error("Failed to check login status:", err);
				isLoggedIn.value = false;
			} finally {
				loading.value = false;
			}
		}
		onMounted(() => {
			checkLoginStatus();
		});
		function handleLogin() {
			window.location.href = "/login";
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("points.title")), 1),
				createVNode(unref(script$5), { class: "mb-3" }),
				unref(loading) ? (openBlock(), createElementBlock("div", _hoisted_4, [..._cache[1] || (_cache[1] = [createBaseVNode("i", { class: "pi pi-spin pi-spinner text-2xl text-muted" }, null, -1)])])) : !isLoggedIn.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
					_cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-lock text-4xl text-muted" }, null, -1)),
					createBaseVNode("p", _hoisted_6, toDisplayString(_ctx.$t("points.pleaseLogin")), 1),
					createVNode(Button_default, { onClick: handleLogin }, {
						default: withCtx(() => [_cache[2] || (_cache[2] = createBaseVNode("i", { class: "pi pi-sign-in" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("login.login")), 1)]),
						_: 1
					})
				])) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
					createBaseVNode("div", _hoisted_7, [
						createBaseVNode("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, toDisplayString(_ctx.$t("points.currentBalance")), 1), createBaseVNode("div", _hoisted_10, toDisplayString(unref(stats).balance.toFixed(2)), 1)]),
						createBaseVNode("div", _hoisted_11, [createBaseVNode("div", _hoisted_12, toDisplayString(_ctx.$t("points.totalEarned")), 1), createBaseVNode("div", _hoisted_13, " +" + toDisplayString(unref(stats).totalEarned.toFixed(2)), 1)]),
						createBaseVNode("div", _hoisted_14, [createBaseVNode("div", _hoisted_15, toDisplayString(_ctx.$t("points.totalConsumed")), 1), createBaseVNode("div", _hoisted_16, " -" + toDisplayString(unref(stats).totalConsumed.toFixed(2)), 1)])
					]),
					createBaseVNode("div", _hoisted_17, [createVNode(unref(script$6), {
						modelValue: filterType.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filterType.value = $event),
						options: filterOptions.value,
						"option-label": "label",
						"option-value": "value",
						placeholder: _ctx.$t("points.filterAll")
					}, null, 8, [
						"modelValue",
						"options",
						"placeholder"
					])]),
					createVNode(unref(script$5), { class: "mb-3" }),
					createVNode(PointsTransactionsTable_default, {
						ref_key: "transactionsTableRef",
						ref: transactionsTableRef,
						"filter-type": filterType.value
					}, null, 8, ["filter-type"])
				], 64))
			])]);
		};
	}
});
//#endregion
export { PointsPanel_default as default };

//# sourceMappingURL=PointsPanel-BfCptQGf.js.map