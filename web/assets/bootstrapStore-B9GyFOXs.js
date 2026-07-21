const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./i18n-C5uaAl1b.js","./i18n-BJjDt-Gn.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-CQFMRQbS.js","./vendor-vue-core-ywZ1En3W.js","./vendor-i18n-BitfRK9w.js","./commands-CXXLFVIe.js","./main-fVqRQcYa.js","./nodeDefs-DNc3psLh.js","./settings-CXXL4Tkc.js"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { Q as __vitePreload } from "./vendor-primevue-CQFMRQbS.js";
import { d as storeToRefs, l as defineStore } from "./vendor-vue-core-ywZ1En3W.js";
import { b as useWorkflowStore, ea as useSettingStore } from "./promotionUtils-bxMXJ_BT.js";
import { r as api } from "./api-vRWcNBJQ.js";
import { d as useAsyncState, tt as until } from "./vendor-vueuse-D8rwdKM0.js";
import { c as useUserStore } from "./teamWorkspaceStore-CD0PAZYS.js";
//#region src/stores/bootstrapStore.ts
var useBootstrapStore = defineStore("bootstrap", () => {
	const settingStore = useSettingStore();
	const workflowStore = useWorkflowStore();
	const { isReady: isI18nReady, error: i18nError, execute: loadI18n } = useAsyncState(async () => {
		const { mergeCustomNodesI18n } = await __vitePreload(async () => {
			const { mergeCustomNodesI18n } = await import("./i18n-C5uaAl1b.js");
			return { mergeCustomNodesI18n };
		}, __vite__mapDeps([0,1,2,3,4,5,6,7,8,9]), import.meta.url);
		mergeCustomNodesI18n(await api.getCustomNodesI18n());
	}, void 0, { immediate: false });
	let storesLoaded = false;
	function loadAuthenticatedStores() {
		if (storesLoaded) return;
		storesLoaded = true;
		settingStore.load();
		workflowStore.loadWorkflows();
	}
	/**
	* Reset the stores loaded flag so that loadAuthenticatedStores()
	* can be called again after login.
	*/
	function resetStoresLoaded() {
		storesLoaded = false;
	}
	async function startStoreBootstrap() {
		const userStore = useUserStore();
		await userStore.initialize();
		const { needsLogin } = storeToRefs(userStore);
		await until(needsLogin).toBe(false);
		loadI18n();
		loadAuthenticatedStores();
	}
	return {
		isI18nReady,
		i18nError,
		startStoreBootstrap,
		loadAuthenticatedStores,
		resetStoresLoaded
	};
});
//#endregion
export { useBootstrapStore as t };

//# sourceMappingURL=bootstrapStore-B9GyFOXs.js.map