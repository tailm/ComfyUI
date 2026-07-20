import "./rolldown-runtime-w0pxe0c8.js";
import { tt as useToast } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Gt as toDisplayString, P as createElementBlock, R as createTextVNode, V as defineComponent, bt as withCtx, et as onMounted, j as createBaseVNode, jt as ref, rt as openBlock, tt as onUnmounted, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Oi as useBillingContext } from "./promotionUtils-DLM4TsXW.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as useDialogStore } from "./dialogStore-C0QSbgAQ.js";
import { c as parseIsoDateSafe } from "./DialogHeader-DxFBxCYY.js";
import { t as getErrorMessage } from "./errorUtil-Cml8gpnk.js";
//#region src/components/dialog/content/subscription/CancelSubscriptionDialogContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex w-full max-w-[400px] flex-col rounded-2xl border border-border-default bg-base-background" };
var _hoisted_2 = { class: "flex h-12 items-center justify-between border-b border-border-default px-4" };
var _hoisted_3 = { class: "m-0 text-sm font-normal text-base-foreground" };
var _hoisted_4 = ["aria-label", "disabled"];
var _hoisted_5 = { class: "flex flex-col gap-4 p-4" };
var _hoisted_6 = { class: "m-0 text-sm text-muted-foreground" };
var _hoisted_7 = { class: "flex items-center justify-end gap-4 p-4" };
//#endregion
//#region src/components/dialog/content/subscription/CancelSubscriptionDialogContent.vue
var CancelSubscriptionDialogContent_default = /* @__PURE__ */ defineComponent({
	__name: "CancelSubscriptionDialogContent",
	props: { cancelAt: {} },
	setup(__props) {
		const props = __props;
		const { t } = useI18n();
		const dialogStore = useDialogStore();
		const toast = useToast();
		const { cancelSubscription, fetchStatus, subscription, tier } = useBillingContext();
		const telemetry = useTelemetry();
		const isLoading = ref(false);
		const didCancelSucceed = ref(false);
		function cancellationMetadata() {
			const endDate = props.cancelAt ?? subscription.value?.endDate;
			return {
				source: "cancel_plan_menu",
				current_tier: tier.value?.toLowerCase(),
				...subscription.value?.duration ? { cycle: subscription.value.duration === "ANNUAL" ? "yearly" : "monthly" } : {},
				...endDate ? { end_date: endDate } : {}
			};
		}
		onMounted(() => {
			telemetry?.trackSubscriptionCancellation("flow_opened", cancellationMetadata());
		});
		onUnmounted(() => {
			if (didCancelSucceed.value || isLoading.value) return;
			telemetry?.trackSubscriptionCancellation("abandoned", cancellationMetadata());
		});
		const formattedEndDate = computed(() => {
			const date = parseIsoDateSafe(props.cancelAt ?? subscription.value?.endDate);
			if (!date) return t("subscription.cancelDialog.endOfBillingPeriod");
			return date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric"
			});
		});
		const description = computed(() => t("subscription.cancelDialog.description", { date: formattedEndDate.value }));
		function onClose() {
			if (isLoading.value) return;
			dialogStore.closeDialog({ key: "cancel-subscription" });
		}
		async function onConfirmCancel() {
			telemetry?.trackSubscriptionCancellation("confirmed", cancellationMetadata());
			isLoading.value = true;
			try {
				await cancelSubscription();
			} catch (error) {
				const errorMessage = getErrorMessage(error);
				telemetry?.trackSubscriptionCancellation("failed", {
					...cancellationMetadata(),
					error_message: errorMessage ?? String(error)
				});
				toast.add({
					severity: "error",
					summary: t("subscription.cancelDialog.failed"),
					detail: errorMessage ?? t("g.unknownError")
				});
				isLoading.value = false;
				return;
			}
			didCancelSucceed.value = true;
			try {
				await fetchStatus();
			} catch {}
			dialogStore.closeDialog({ key: "cancel-subscription" });
			toast.add({
				severity: "success",
				summary: t("subscription.cancelSuccess"),
				life: 5e3
			});
			isLoading.value = false;
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("subscription.cancelDialog.title")), 1), createBaseVNode("button", {
					class: "focus-visible:ring-secondary-foreground cursor-pointer rounded-sm border-none bg-transparent p-0 text-muted-foreground transition-colors hover:text-base-foreground focus-visible:ring-1 focus-visible:outline-none",
					"aria-label": _ctx.$t("g.close"),
					disabled: isLoading.value,
					onClick: onClose
				}, [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-times size-4" }, null, -1)])], 8, _hoisted_4)]),
				createBaseVNode("div", _hoisted_5, [createBaseVNode("p", _hoisted_6, toDisplayString(description.value), 1)]),
				createBaseVNode("div", _hoisted_7, [createVNode(Button_default, {
					variant: "muted-textonly",
					disabled: isLoading.value,
					onClick: onClose
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.cancelDialog.keepSubscription")), 1)]),
					_: 1
				}, 8, ["disabled"]), createVNode(Button_default, {
					variant: "destructive",
					size: "lg",
					loading: isLoading.value,
					onClick: onConfirmCancel
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.cancelDialog.confirmCancel")), 1)]),
					_: 1
				}, 8, ["loading"])])
			]);
		};
	}
});
//#endregion
export { CancelSubscriptionDialogContent_default as default };

//# sourceMappingURL=CancelSubscriptionDialogContent-C0_h2iO1.js.map