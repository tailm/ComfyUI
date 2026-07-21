import "./rolldown-runtime-w0pxe0c8.js";
import { Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, Q as onBeforeUnmount, R as createTextVNode, V as defineComponent, bt as withCtx, gt as watch, jt as ref, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
import { Oi as useBillingContext } from "./promotionUtils-B4DSH7RT.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
//#endregion
//#region src/platform/cloud/subscription/components/SubscribeButton.vue
var SubscribeButton_default = /* @__PURE__ */ defineComponent({
	__name: "SubscribeButton",
	props: {
		label: {},
		size: { default: "lg" },
		buttonVariant: { default: "default" },
		fluid: {
			type: Boolean,
			default: true
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["subscribed"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { isActiveSubscription, showSubscriptionDialog, tier } = useBillingContext();
		const isAwaitingStripeSubscription = ref(false);
		watch([isAwaitingStripeSubscription, isActiveSubscription], ([awaiting, isActive]) => {
			if (isCloud && awaiting && isActive) {
				emit("subscribed");
				isAwaitingStripeSubscription.value = false;
			}
		});
		const handleSubscribe = () => {
			useTelemetry()?.trackSubscription("subscribe_clicked", { current_tier: tier.value?.toLowerCase() });
			isAwaitingStripeSubscription.value = true;
			showSubscriptionDialog({ reason: "subscribe_now_button" });
		};
		onBeforeUnmount(() => {
			isAwaitingStripeSubscription.value = false;
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Button_default, {
				size: __props.size,
				disabled: __props.disabled,
				variant: __props.buttonVariant === "gradient" ? "gradient" : "primary",
				class: normalizeClass(unref(cn)("font-bold", __props.fluid && "w-full")),
				onClick: handleSubscribe
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(__props.label || _ctx.$t("subscription.required.subscribe")), 1)]),
				_: 1
			}, 8, [
				"size",
				"disabled",
				"variant",
				"class"
			]);
		};
	}
});
//#endregion
export { SubscribeButton_default as t };

//# sourceMappingURL=SubscribeButton-B8WQ8QPv.js.map