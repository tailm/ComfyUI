import "./rolldown-runtime-w0pxe0c8.js";
import { $ as script$1, C as script$5, E as script$3, V as script, j as script$4, w as script$2 } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, St as withDirectives, Vt as unref, _t as watch, it as openBlock, j as computed, lt as resolveDirective, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Ri as useAuthActions, Ui as useCommandStore, Vi as workspaceApi, Wo as isAbortError, Yi as useAuthStore, ra as getComfyApiBaseUrl, zi as useBillingRouting } from "./promotionUtils-vKoNYnM9.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { c as t, t as d } from "./i18n-DAE2CSwM.js";
import { V as attachUnifiedRemintInterceptor } from "./api-DrovjuJk.js";
import { n as axios } from "./vendor-axios-CCRjO_8I.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as useExternalLink } from "./useExternalLink-lnTgXLgb.js";
import { t as CreditsTile_default } from "./CreditsTile-BJ9sdWOk.js";
//#region src/services/customerEventsService.ts
var EventType = /* @__PURE__ */ function(EventType) {
	EventType["CREDIT_ADDED"] = "credit_added";
	EventType["ACCOUNT_CREATED"] = "account_created";
	EventType["API_USAGE_STARTED"] = "api_usage_started";
	EventType["API_USAGE_COMPLETED"] = "api_usage_completed";
	return EventType;
}({});
var customerApiClient = axios.create({
	baseURL: getComfyApiBaseUrl(),
	headers: { "Content-Type": "application/json" }
});
attachUnifiedRemintInterceptor(customerApiClient);
var useCustomerEventsService = () => {
	const isLoading = ref(false);
	const error = ref(null);
	watch(() => getComfyApiBaseUrl(), (url) => {
		customerApiClient.defaults.baseURL = url;
	});
	const handleRequestError = (err, context, routeSpecificErrors) => {
		if (isAbortError(err)) return;
		let message;
		if (!axios.isAxiosError(err)) message = `${context} failed: ${err instanceof Error ? err.message : String(err)}`;
		else {
			const axiosError = err;
			const status = axiosError.response?.status;
			if (status && routeSpecificErrors?.[status]) message = routeSpecificErrors[status];
			else message = axiosError.response?.data?.message ?? `${context} failed with status ${status}`;
		}
		error.value = message;
	};
	const executeRequest = async (requestCall, options) => {
		const { errorContext, routeSpecificErrors } = options;
		isLoading.value = true;
		error.value = null;
		try {
			return (await requestCall()).data;
		} catch (err) {
			handleRequestError(err, errorContext, routeSpecificErrors);
			return null;
		} finally {
			isLoading.value = false;
		}
	};
	function formatEventType(eventType) {
		switch (eventType) {
			case "credit_added":
			case "topup_completed": return t("credits.eventTypes.creditAdded");
			case "account_created": return t("credits.eventTypes.accountCreated");
			case "api_usage_completed": return t("credits.eventTypes.apiUsage");
			case "gpu_usage": return t("credits.eventTypes.gpuUsage");
			case "api_node_usage": return t("credits.eventTypes.apiNodeUsage");
			default: return eventType;
		}
	}
	function formatDate(dateString) {
		return d(new Date(dateString), {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function formatJsonKey(key) {
		return key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
	}
	function formatJsonValue(value) {
		if (typeof value === "number") return value.toLocaleString();
		if (typeof value === "string") {
			const date = new Date(value);
			if (!Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T/.test(value)) return d(date, {
				dateStyle: "medium",
				timeStyle: "short"
			});
		}
		return value;
	}
	function getEventSeverity(eventType) {
		switch (eventType) {
			case "credit_added":
			case "topup_completed": return "success";
			case "account_created": return "info";
			case "api_usage_completed":
			case "gpu_usage":
			case "api_node_usage": return "warning";
			default: return "info";
		}
	}
	function hasAdditionalInfo(event) {
		const { amount, api_name, model, ...otherParams } = event.params || {};
		return Object.keys(otherParams).length > 0;
	}
	function getTooltipContent(event) {
		const { ...params } = event.params || {};
		return Object.entries(params).map(([key, value]) => {
			return `<strong>${formatJsonKey(key)}:</strong> ${formatJsonValue(value)}`;
		}).join("<br>");
	}
	function formatAmount(amountMicros) {
		if (!amountMicros) return "0.00";
		return (amountMicros / 100).toFixed(2);
	}
	async function getMyEvents({ page = 1, limit = 10 } = {}) {
		const errorContext = "Fetching customer events";
		const routeSpecificErrors = {
			400: "Invalid input, object invalid",
			404: "Not found"
		};
		const authHeaders = await useAuthStore().getAuthHeader();
		if (!authHeaders) {
			error.value = "Authentication header is missing";
			return null;
		}
		return await executeRequest(() => customerApiClient.get("/customers/events", {
			params: {
				page,
				limit
			},
			headers: authHeaders
		}), {
			errorContext,
			routeSpecificErrors
		});
	}
	return {
		isLoading,
		error,
		getMyEvents,
		formatEventType,
		getEventSeverity,
		formatAmount,
		hasAdditionalInfo,
		formatDate,
		formatJsonKey,
		formatJsonValue,
		getTooltipContent
	};
};
//#endregion
//#region src/components/dialog/content/setting/UsageLogsTable.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = {
	key: 0,
	class: "flex items-center justify-center p-8"
};
var _hoisted_2$1 = {
	key: 1,
	class: "p-4"
};
var _hoisted_3$1 = { class: "event-details" };
var _hoisted_4$1 = {
	key: 0,
	class: "font-semibold text-green-500"
};
var _hoisted_5$1 = { key: 1 };
var _hoisted_6 = {
	key: 2,
	class: "flex flex-col gap-1"
};
var _hoisted_7 = { class: "font-semibold" };
var _hoisted_8 = { class: "text-sm text-smoke-400" };
//#endregion
//#region src/components/dialog/content/setting/UsageLogsTable.vue
var UsageLogsTable_default = /* @__PURE__ */ defineComponent({
	__name: "UsageLogsTable",
	setup(__props, { expose: __expose }) {
		const { t } = useI18n();
		const events = ref([]);
		const loading = ref(true);
		const error = ref(null);
		const customerEventService = useCustomerEventsService();
		const { shouldUseWorkspaceBilling } = useBillingRouting();
		const pagination = ref({
			page: 1,
			limit: 7,
			total: 0,
			totalPages: 0
		});
		const dataTableFirst = computed(() => (pagination.value.page - 1) * pagination.value.limit);
		const tooltipContentMap = computed(() => {
			const map = /* @__PURE__ */ new Map();
			events.value.forEach((event) => {
				if (customerEventService.hasAdditionalInfo(event) && event.event_id) map.set(event.event_id, customerEventService.getTooltipContent(event));
			});
			return map;
		});
		let latestLoadToken = 0;
		const loadEvents = async () => {
			const loadToken = ++latestLoadToken;
			loading.value = true;
			error.value = null;
			try {
				const params = {
					page: pagination.value.page,
					limit: pagination.value.limit
				};
				const response = shouldUseWorkspaceBilling.value ? await workspaceApi.getBillingEvents(params) : await customerEventService.getMyEvents(params);
				useTelemetry()?.checkForCompletedTopup(response?.events);
				if (loadToken !== latestLoadToken) return;
				if (response) {
					if (response.events) events.value = response.events;
					if (response.page) pagination.value.page = response.page;
					if (response.limit) pagination.value.limit = response.limit;
					if (response.total != null) pagination.value.total = response.total;
					if (response.totalPages != null) pagination.value.totalPages = response.totalPages;
				} else error.value = (shouldUseWorkspaceBilling.value ? null : customerEventService.error.value) || t("credits.loadEventsError");
			} catch (err) {
				if (loadToken !== latestLoadToken) return;
				error.value = t("credits.loadEventsUnknownError");
				console.error("Error loading events:", err);
			} finally {
				if (loadToken === latestLoadToken) loading.value = false;
			}
		};
		const onPageChange = (event) => {
			pagination.value.page = event.page + 1;
			loadEvents().catch((error) => {
				console.error("Error loading events:", error);
			});
		};
		const refresh = async () => {
			pagination.value.page = 1;
			await loadEvents();
		};
		watch(shouldUseWorkspaceBilling, () => {
			refresh().catch((error) => {
				console.error("Error loading events:", error);
			});
		});
		__expose({ refresh });
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", null, [loading.value ? (openBlock(), createElementBlock("div", _hoisted_1$1, [createVNode(unref(script))])) : error.value ? (openBlock(), createElementBlock("div", _hoisted_2$1, [createVNode(unref(script$1), {
				severity: "error",
				closable: false
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(error.value), 1)]),
				_: 1
			})])) : (openBlock(), createBlock(unref(script$2), {
				key: 2,
				value: events.value,
				paginator: true,
				rows: pagination.value.limit,
				"total-records": pagination.value.total,
				first: dataTableFirst.value,
				lazy: true,
				class: "p-datatable-sm custom-datatable",
				onPage: onPageChange
			}, {
				default: withCtx(() => [
					createVNode(unref(script$3), {
						field: "event_type",
						header: _ctx.$t("credits.eventType")
					}, {
						body: withCtx(({ data }) => [createVNode(unref(script$4), {
							value: unref(customerEventService).formatEventType(data.event_type),
							severity: unref(customerEventService).getEventSeverity(data.event_type)
						}, null, 8, ["value", "severity"])]),
						_: 1
					}, 8, ["header"]),
					createVNode(unref(script$3), {
						field: "details",
						header: _ctx.$t("credits.details")
					}, {
						body: withCtx(({ data }) => [createBaseVNode("div", _hoisted_3$1, [data.event_type === unref(EventType).CREDIT_ADDED ? (openBlock(), createElementBlock("div", _hoisted_4$1, toDisplayString(_ctx.$t("credits.added")) + " $" + toDisplayString(unref(customerEventService).formatAmount(data.params?.amount)), 1)) : data.event_type === unref(EventType).ACCOUNT_CREATED ? (openBlock(), createElementBlock("div", _hoisted_5$1, toDisplayString(_ctx.$t("credits.accountInitialized")), 1)) : data.event_type === unref(EventType).API_USAGE_COMPLETED ? (openBlock(), createElementBlock("div", _hoisted_6, [createBaseVNode("div", _hoisted_7, toDisplayString(data.params?.api_name || "API"), 1), createBaseVNode("div", _hoisted_8, toDisplayString(_ctx.$t("credits.model")) + ": " + toDisplayString(data.params?.model || "-"), 1)])) : createCommentVNode("", true)])]),
						_: 1
					}, 8, ["header"]),
					createVNode(unref(script$3), {
						field: "createdAt",
						header: _ctx.$t("credits.time")
					}, {
						body: withCtx(({ data }) => [createTextVNode(toDisplayString(unref(customerEventService).formatDate(data.createdAt)), 1)]),
						_: 1
					}, 8, ["header"]),
					createVNode(unref(script$3), {
						field: "params",
						header: _ctx.$t("credits.additionalInfo")
					}, {
						body: withCtx(({ data }) => [unref(customerEventService).hasAdditionalInfo(data) ? withDirectives((openBlock(), createBlock(Button_default, {
							key: 0,
							variant: "textonly",
							size: "icon-sm",
							"aria-label": _ctx.$t("credits.additionalInfo")
						}, {
							default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-info-circle" }, null, -1)])]),
							_: 1
						}, 8, ["aria-label"])), [[
							_directive_tooltip,
							{
								escape: false,
								value: tooltipContentMap.value.get(data.event_id) || "",
								pt: { text: { style: { width: "max-content !important" } } }
							},
							void 0,
							{ top: true }
						]]) : createCommentVNode("", true)]),
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
//#region src/components/dialog/content/setting/CreditsPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "credits-container flex h-full flex-col gap-4" };
var _hoisted_2 = { class: "mb-2 text-2xl font-bold" };
var _hoisted_3 = { class: "flex items-center justify-between" };
var _hoisted_4 = { class: "m-0" };
var _hoisted_5 = { class: "flex flex-row gap-2" };
//#endregion
//#region src/components/dialog/content/setting/CreditsPanel.vue
var CreditsPanel_default = /* @__PURE__ */ defineComponent({
	__name: "CreditsPanel",
	setup(__props) {
		const { buildDocsUrl, docsPaths } = useExternalLink();
		const authStore = useAuthStore();
		const authActions = useAuthActions();
		const commandStore = useCommandStore();
		const telemetry = useTelemetry();
		const usageLogsTableRef = ref(null);
		watch(() => authStore.lastBalanceUpdateTime, (newTime, oldTime) => {
			if (newTime && newTime !== oldTime && usageLogsTableRef.value) usageLogsTableRef.value.refresh();
		});
		const handleCreditsHistoryClick = async () => {
			await authActions.accessBillingPortal();
		};
		const handleMessageSupport = async () => {
			telemetry?.trackHelpResourceClicked({
				resource_type: "help_feedback",
				is_external: true,
				source: "credits_panel"
			});
			await commandStore.execute("Comfy.ContactSupport");
		};
		const handleFaqClick = () => {
			window.open(buildDocsUrl("/tutorials/api-nodes/faq", { includeLocale: true }), "_blank", "noopener,noreferrer");
		};
		const handleOpenPartnerNodesInfo = () => {
			window.open(buildDocsUrl(docsPaths.partnerNodesPricing, { includeLocale: true }), "_blank", "noopener,noreferrer");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", null, [createBaseVNode("h2", _hoisted_2, toDisplayString(_ctx.$t("credits.credits")), 1), createVNode(unref(script$5))]),
				createVNode(CreditsTile_default),
				createBaseVNode("div", _hoisted_3, [createBaseVNode("h3", _hoisted_4, toDisplayString(_ctx.$t("credits.activity")), 1), createVNode(Button_default, {
					variant: "muted-textonly",
					onClick: handleCreditsHistoryClick
				}, {
					default: withCtx(() => [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "pi pi-arrow-up-right" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("credits.invoiceHistory")), 1)]),
					_: 1
				})]),
				createVNode(UsageLogsTable_default, {
					ref_key: "usageLogsTableRef",
					ref: usageLogsTableRef
				}, null, 512),
				createBaseVNode("div", _hoisted_5, [
					createVNode(Button_default, {
						variant: "muted-textonly",
						onClick: handleFaqClick
					}, {
						default: withCtx(() => [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "pi pi-question-circle" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("credits.faqs")), 1)]),
						_: 1
					}),
					createVNode(Button_default, {
						variant: "muted-textonly",
						onClick: handleOpenPartnerNodesInfo
					}, {
						default: withCtx(() => [_cache[2] || (_cache[2] = createBaseVNode("i", { class: "pi pi-question-circle" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("subscription.partnerNodesCredits")), 1)]),
						_: 1
					}),
					createVNode(Button_default, {
						variant: "muted-textonly",
						onClick: handleMessageSupport
					}, {
						default: withCtx(() => [_cache[3] || (_cache[3] = createBaseVNode("i", { class: "pi pi-comments" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("credits.messageSupport")), 1)]),
						_: 1
					})
				])
			]);
		};
	}
});
//#endregion
export { CreditsPanel_default as default };

//# sourceMappingURL=CreditsPanel-BTfV5ikR.js.map