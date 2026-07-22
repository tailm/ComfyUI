import "./rolldown-runtime-w0pxe0c8.js";
import { tt as useToast } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Dt as markRaw, jt as ref, l as defineStore } from "./vendor-vue-core-ywZ1En3W.js";
import { s as t } from "./i18n-JcytnyXX.js";
import { r as api } from "./api-Bz5NhLSR.js";
import { d as useAsyncState, p as useClipboard } from "./vendor-vueuse-D8rwdKM0.js";
import { n as isDesktop, t as isCloud } from "./types-4cVPtFn2.js";
//#region src/composables/useCopyToClipboard.ts
function legacyCopy(text) {
	const textarea = document.createElement("textarea");
	textarea.setAttribute("readonly", "");
	textarea.value = text;
	textarea.style.position = "fixed";
	textarea.style.left = "-9999px";
	textarea.style.top = "-9999px";
	document.body.appendChild(textarea);
	textarea.select();
	try {
		return document.execCommand("copy");
	} finally {
		textarea.remove();
	}
}
function useCopyToClipboard() {
	const { copy, isSupported } = useClipboard();
	const toast = useToast();
	async function copyToClipboard(text) {
		let success = false;
		try {
			if (isSupported.value) {
				await copy(text);
				success = true;
			}
		} catch {}
		if (!success) try {
			success = legacyCopy(text);
		} catch {}
		toast.add(success ? {
			severity: "success",
			summary: t("g.success"),
			detail: t("clipboard.successMessage"),
			life: 3e3
		} : {
			severity: "error",
			summary: t("g.error"),
			detail: t("clipboard.errorMessage")
		});
	}
	return { copyToClipboard };
}
//#endregion
//#region src/stores/systemStatsStore.ts
var useSystemStatsStore = defineStore("systemStats", () => {
	const fetchSystemStatsData = async () => {
		try {
			return await api.getSystemStats();
		} catch (err) {
			console.error("Error fetching system stats:", err);
			throw err;
		}
	};
	const { state: systemStats, isLoading, error, isReady: isInitialized, execute: refetchSystemStats } = useAsyncState(fetchSystemStatsData, null, { immediate: true });
	function getFormFactor() {
		if (isCloud) return "cloud";
		if (!systemStats.value?.system?.os) return "other";
		const os = systemStats.value.system.os.toLowerCase();
		if (isDesktop) {
			if (os.includes("windows")) return "desktop-windows";
			if (os.includes("darwin") || os.includes("mac")) return "desktop-mac";
		} else {
			if (os.includes("windows")) return "git-windows";
			if (os.includes("darwin") || os.includes("mac")) return "git-mac";
			if (os.includes("linux")) return "git-linux";
		}
		return "other";
	}
	return {
		systemStats,
		isLoading,
		error,
		isInitialized,
		refetchSystemStats,
		getFormFactor
	};
});
//#endregion
//#region src/stores/extensionStore.ts
/**
* These extensions are always active, even if they are disabled in the setting.
*/
var ALWAYS_ENABLED_EXTENSIONS = [];
var ALWAYS_DISABLED_EXTENSIONS = [
	"pysssss.Locking",
	"pysssss.SnapToGrid",
	"pysssss.FaviconStatus",
	"KJNodes.browserstatus"
];
var useExtensionStore = defineStore("extension", () => {
	const extensionByName = ref({});
	const extensions = computed(() => Object.values(extensionByName.value));
	const disabledExtensionNames = ref(/* @__PURE__ */ new Set());
	const inactiveDisabledExtensionNames = computed(() => {
		return Array.from(disabledExtensionNames.value).filter((name) => !(name in extensionByName.value));
	});
	const isExtensionInstalled = (name) => name in extensionByName.value;
	const isExtensionEnabled = (name) => !disabledExtensionNames.value.has(name);
	const enabledExtensions = computed(() => {
		return extensions.value.filter((ext) => isExtensionEnabled(ext.name));
	});
	function isExtensionReadOnly(name) {
		return ALWAYS_DISABLED_EXTENSIONS.includes(name) || ALWAYS_ENABLED_EXTENSIONS.includes(name);
	}
	function registerExtension(extension) {
		if (!extension.name) throw new Error("Extensions must have a 'name' property.");
		if (extensionByName.value[extension.name]) throw new Error(`Extension named '${extension.name}' already registered.`);
		if (disabledExtensionNames.value.has(extension.name)) console.warn(`Extension ${extension.name} is disabled.`);
		extensionByName.value[extension.name] = markRaw(extension);
	}
	function loadDisabledExtensionNames(names) {
		disabledExtensionNames.value = new Set(names);
		for (const name of ALWAYS_DISABLED_EXTENSIONS) disabledExtensionNames.value.add(name);
		for (const name of ALWAYS_ENABLED_EXTENSIONS) disabledExtensionNames.value.delete(name);
	}
	/**
	* Core extensions are extensions that are defined in the core package.
	* See /extensions/core/index.ts for the list.
	*/
	const coreExtensionNames = ref([]);
	function captureCoreExtensions() {
		coreExtensionNames.value = extensions.value.map((ext) => ext.name);
	}
	function isCoreExtension(name) {
		return coreExtensionNames.value.includes(name);
	}
	return {
		extensions,
		enabledExtensions,
		inactiveDisabledExtensionNames,
		isExtensionInstalled,
		isExtensionEnabled,
		isExtensionReadOnly,
		registerExtension,
		loadDisabledExtensionNames,
		captureCoreExtensions,
		isCoreExtension,
		hasThirdPartyExtensions: computed(() => {
			return extensions.value.some((ext) => !isCoreExtension(ext.name));
		})
	};
});
//#endregion
//#region src/utils/envUtil.ts
function electronAPI() {
	return window.electronAPI;
}
function showNativeSystemMenu() {
	electronAPI()?.showContextMenu();
}
function isNativeWindow() {
	return isDesktop && !!window.navigator.windowControlsOverlay?.visible;
}
//#endregion
export { useSystemStatsStore as a, useExtensionStore as i, isNativeWindow as n, useCopyToClipboard as o, showNativeSystemMenu as r, electronAPI as t };

//# sourceMappingURL=envUtil-DPwFgfSI.js.map