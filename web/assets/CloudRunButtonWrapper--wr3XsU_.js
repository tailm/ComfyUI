import "./rolldown-runtime-w0pxe0c8.js";
import { H as defineComponent, N as createBlock, Vt as unref, it as openBlock, j as computed, ut as resolveDynamicComponent } from "./vendor-vue-core-D3WB7mNE.js";
import { Oi as useBillingContext } from "./promotionUtils-vKoNYnM9.js";
import { t as ComfyQueueButton_default } from "./ComfyQueueButton-C_7ymyj9.js";
import { t as SubscribeToRun_default } from "./SubscribeToRun-CCxqqNrR.js";
//#endregion
//#region src/components/actionbar/ComfyRunButton/CloudRunButtonWrapper.vue
var CloudRunButtonWrapper_default = /* @__PURE__ */ defineComponent({
	__name: "CloudRunButtonWrapper",
	setup(__props) {
		const { isActiveSubscription } = useBillingContext();
		const currentButton = computed(() => isActiveSubscription.value ? ComfyQueueButton_default : SubscribeToRun_default);
		return (_ctx, _cache) => {
			return openBlock(), createBlock(resolveDynamicComponent(currentButton.value), { key: unref(isActiveSubscription) ? "queue" : "subscribe" });
		};
	}
});
//#endregion
export { CloudRunButtonWrapper_default as default };

//# sourceMappingURL=CloudRunButtonWrapper--wr3XsU_.js.map