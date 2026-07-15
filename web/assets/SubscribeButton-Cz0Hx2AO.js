import "./rolldown-runtime-w0pxe0c8.js";
import { $ as onBeforeUnmount, H as defineComponent, Kt as toDisplayString, Mt as ref, N as createBlock, Ut as normalizeClass, Vt as unref, _t as watch, it as openBlock, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Oi as useBillingContext } from "./promotionUtils-vKoNYnM9.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { n as useTelemetry } from "./telemetry-BQKS_Is7.js";
import { t as cn } from "./src-CDgHMYTj.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
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

//# sourceMappingURL=SubscribeButton-Cz0Hx2AO.js.map