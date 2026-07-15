import "./rolldown-runtime-w0pxe0c8.js";
import { Mt as ref, j as computed } from "./vendor-vue-core-D3WB7mNE.js";
import { H as useStorage } from "./vendor-vueuse-BA2QXdyV.js";
//#region src/platform/remoteConfig/remoteConfig.ts
/**
* Remote configuration service
*
* Fetches configuration from the server at runtime, enabling:
* - Feature flags without rebuilding
* - Server-side feature discovery
* - Version compatibility management
* - Avoiding vendor lock-in for native apps
*
* This module is tree-shaken in OSS builds.
*/
/**
* Current load state of remote configuration
*/
var remoteConfigState = ref("unloaded");
/**
* Whether the authenticated config has been loaded.
* Use this to gate access to user-specific feature flags like teamWorkspacesEnabled.
*/
var isAuthenticatedConfigLoaded = computed(() => remoteConfigState.value === "authenticated");
/**
* Reactive remote configuration
* Updated whenever config is loaded from the server
*/
var remoteConfig = ref({});
function configValueOrDefault(remoteConfig, key, defaultValue) {
	return remoteConfig[key] || defaultValue;
}
var cachedTeamWorkspacesEnabled = useStorage("team_workspaces_enabled", void 0);
var cachedConsolidatedBillingEnabled = useStorage("consolidated_billing_enabled", void 0);
//#endregion
export { remoteConfig as a, isAuthenticatedConfigLoaded as i, cachedTeamWorkspacesEnabled as n, remoteConfigState as o, configValueOrDefault as r, cachedConsolidatedBillingEnabled as t };

//# sourceMappingURL=remoteConfig-DjUkM6Dg.js.map