import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Gt as toDisplayString, M as createBlock, R as createTextVNode, V as defineComponent, bt as withCtx, ct as resolveDirective, j as createBaseVNode, rt as openBlock, xt as withDirectives } from "./vendor-vue-core-ywZ1En3W.js";
import { K as useRunButtonTelemetry, Oi as useBillingContext, ji as useWorkspaceUI } from "./promotionUtils-CFmuY7Wj.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { a as breakpointsTailwind, f as useBreakpoints } from "./vendor-vueuse-D8rwdKM0.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
//#endregion
//#region src/platform/cloud/subscription/components/SubscribeToRun.vue
var SubscribeToRun_default = /* @__PURE__ */ defineComponent({
	__name: "SubscribeToRun",
	setup(__props) {
		const { t } = useI18n();
		const isMdOrLarger = useBreakpoints(breakpointsTailwind).greaterOrEqual("md");
		const { permissions } = useWorkspaceUI();
		const { showSubscriptionDialog } = useBillingContext();
		const { trackRunButton } = useRunButtonTelemetry();
		const canResubscribe = computed(() => permissions.value.canManageSubscription);
		const buttonLabel = computed(() => {
			if (!canResubscribe.value) return t("subscription.inactive.runLabel");
			return isMdOrLarger.value ? t("subscription.subscribeToRunFull") : t("subscription.subscribeToRun");
		});
		const buttonTooltip = computed(() => canResubscribe.value ? t("subscription.subscribeToRunFull") : t("subscription.inactive.memberRunTooltip"));
		function handleSubscribeToRun() {
			if (isCloud) trackRunButton({ subscribe_to_run: true });
			showSubscriptionDialog({ reason: "subscribe_to_run" });
		}
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return withDirectives((openBlock(), createBlock(Button_default, {
				class: "subscribe-to-run-button h-8 gap-1.5 rounded-lg px-4 whitespace-nowrap",
				variant: "gradient",
				size: "unset",
				"data-testid": "subscribe-to-run-button",
				onClick: handleSubscribeToRun
			}, {
				default: withCtx(() => [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "pi pi-lock" }, null, -1)), createTextVNode(" " + toDisplayString(buttonLabel.value), 1)]),
				_: 1
			})), [[
				_directive_tooltip,
				{
					value: buttonTooltip.value,
					showDelay: 600
				},
				void 0,
				{ bottom: true }
			]]);
		};
	}
});
//#endregion
export { SubscribeToRun_default as t };

//# sourceMappingURL=SubscribeToRun-Pmw3ZwTB.js.map