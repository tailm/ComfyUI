import "./rolldown-runtime-w0pxe0c8.js";
import { jt as ref, l as defineStore } from "./vendor-vue-core-ywZ1En3W.js";
//#region src/platform/updates/common/toastStore.ts
var useToastStore = defineStore("toast", () => {
	const messagesToAdd = ref([]);
	const messagesToRemove = ref([]);
	const removeAllRequested = ref(false);
	function add(message) {
		messagesToAdd.value = [...messagesToAdd.value, message];
	}
	function remove(message) {
		messagesToRemove.value = [...messagesToRemove.value, message];
	}
	function removeAll() {
		removeAllRequested.value = true;
	}
	function addAlert(message) {
		add({
			severity: "warn",
			summary: "Alert",
			detail: message
		});
	}
	return {
		messagesToAdd,
		messagesToRemove,
		removeAllRequested,
		add,
		remove,
		removeAll,
		addAlert
	};
});
//#endregion
export { useToastStore as t };

//# sourceMappingURL=toastStore-Dafwoqcw.js.map