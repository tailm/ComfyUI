import "./rolldown-runtime-w0pxe0c8.js";
import { Hi as useCurrentUser, Oi as useBillingContext, Wn as useExtensionService } from "./promotionUtils-vKoNYnM9.js";
import { ct as watchDebounced } from "./vendor-vueuse-BA2QXdyV.js";
import { t as refreshRemoteConfig } from "./refreshRemoteConfig-B062BsUD.js";
//#region src/extensions/core/cloudRemoteConfig.ts
/**
* Cloud-only extension that polls for remote config updates
* Initial config load happens in main.ts before any other imports
*/
useExtensionService().registerExtension({
	name: "Comfy.Cloud.RemoteConfig",
	setup: async () => {
		const { isLoggedIn } = useCurrentUser();
		const { isActiveSubscription } = useBillingContext();
		watchDebounced([isLoggedIn, isActiveSubscription], () => {
			if (!isLoggedIn.value) return;
			refreshRemoteConfig();
		}, {
			debounce: 256,
			immediate: true
		});
		setInterval(() => void refreshRemoteConfig(), 6e5);
	}
});
//#endregion

//# sourceMappingURL=cloudRemoteConfig-BxlBFAUl.js.map