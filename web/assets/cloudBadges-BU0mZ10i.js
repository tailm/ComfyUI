import "./rolldown-runtime-w0pxe0c8.js";
import { _t as watch, j as computed } from "./vendor-vue-core-D3WB7mNE.js";
import { Wn as useExtensionService, g as useCanvasStore } from "./promotionUtils-vKoNYnM9.js";
import { a as remoteConfig } from "./remoteConfig-DjUkM6Dg.js";
import { c as t } from "./i18n-DAE2CSwM.js";
//#region src/extensions/core/cloudBadges.ts
var badges = computed(() => {
	const result = [];
	const alert = remoteConfig.value.server_health_alert;
	if (alert) result.push({
		text: alert.message,
		label: alert.badge,
		variant: alert.severity ?? "error",
		tooltip: alert.tooltip
	});
	return result;
});
var canvasStore = useCanvasStore();
watch(() => canvasStore.canvas, (canvas) => {
	if (canvas) canvas.info_text = t("g.comfyCloud");
}, { immediate: true });
useExtensionService().registerExtension({
	name: "Comfy.Cloud.Badges",
	get topbarBadges() {
		return badges.value;
	}
});
//#endregion

//# sourceMappingURL=cloudBadges-BU0mZ10i.js.map