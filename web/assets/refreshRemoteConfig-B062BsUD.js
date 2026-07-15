const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./api-DL7XHvwV.js","./api-DrovjuJk.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-rx7tKw03.js","./vendor-vue-core-D3WB7mNE.js","./vendor-other-CcVI76zn.js","./vendor-firebase-C7k8AidI.js","./vendor-three-BgtZEsKh.js","./vendor-tiptap-Da8lvoX9.js","./vendor-zod-9ZYBvZOX.js","./vendor-vueuse-BA2QXdyV.js","./vendor-axios-CCRjO_8I.js","./types-4cVPtFn2.js","./toastStore-BIphcVgz.js","./devFeatureFlagOverride-BkGrEGSd.js","./vendor-other-DODGPXtn.css"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { tt as __vitePreload } from "./vendor-primevue-rx7tKw03.js";
import { a as remoteConfig, n as cachedTeamWorkspacesEnabled, o as remoteConfigState, t as cachedConsolidatedBillingEnabled } from "./remoteConfig-DjUkM6Dg.js";
//#region src/platform/remoteConfig/refreshRemoteConfig.ts
var FEATURES_FETCH_TIMEOUT_MS = 5e3;
async function fetchRemoteConfig(useAuth, signal) {
	const { api } = await __vitePreload(async () => {
		const { api } = await import("./api-DL7XHvwV.js");
		return { api };
	}, __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]), import.meta.url);
	if (!useAuth) return fetch(api.apiURL("/features"), {
		cache: "no-store",
		signal
	});
	return api.fetchApi("/features", { cache: "no-store" });
}
/**
* Loads remote configuration from the backend /features endpoint
* and updates the reactive remoteConfig ref.
*
* Sets remoteConfigState to:
* - 'anonymous' when loaded without auth
* - 'authenticated' when loaded with auth
* - 'error' when load fails
*/
async function refreshRemoteConfig(options = {}) {
	const { useAuth = true } = options;
	const controller = useAuth ? null : new AbortController();
	const timeoutId = controller ? setTimeout(() => controller.abort(), FEATURES_FETCH_TIMEOUT_MS) : null;
	try {
		const response = await fetchRemoteConfig(useAuth, controller?.signal);
		if (response.ok) {
			const config = await response.json();
			window.__CONFIG__ = config;
			remoteConfig.value = config;
			remoteConfigState.value = useAuth ? "authenticated" : "anonymous";
			if (useAuth) {
				cachedTeamWorkspacesEnabled.value = Boolean(config.team_workspaces_enabled);
				cachedConsolidatedBillingEnabled.value = Boolean(config.consolidated_billing_enabled);
			}
			return;
		}
		console.warn("Failed to load remote config:", response.statusText);
		if (response.status === 401 || response.status === 403) {
			window.__CONFIG__ = {};
			remoteConfig.value = {};
			remoteConfigState.value = "error";
		}
	} catch (error) {
		console.error("Failed to fetch remote config:", error);
		window.__CONFIG__ = {};
		remoteConfig.value = {};
		remoteConfigState.value = "error";
	} finally {
		if (timeoutId !== null) clearTimeout(timeoutId);
	}
}
//#endregion
export { refreshRemoteConfig as t };

//# sourceMappingURL=refreshRemoteConfig-B062BsUD.js.map