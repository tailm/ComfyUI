import "./rolldown-runtime-w0pxe0c8.js";
import { Ta as useSettingStore, Wn as useExtensionService } from "./promotionUtils-vKoNYnM9.js";
import { c as t } from "./i18n-DAE2CSwM.js";
import { t as buildFeedbackTypeformUrl } from "./config-B2VX_hK9.js";
//#region src/extensions/core/cloudFeedbackTopbarButton.ts
var buttons = [{
	icon: "icon-[lucide--message-square-text]",
	label: t("actionbar.feedback"),
	tooltip: t("actionbar.feedbackTooltip"),
	onClick: () => {
		window.open(buildFeedbackTypeformUrl("action-bar"), "_blank", "noopener,noreferrer");
	}
}];
useExtensionService().registerExtension({
	name: "Comfy.FeedbackButton",
	get actionBarButtons() {
		return useSettingStore().get("Comfy.UI.TabBarLayout") === "Legacy" ? buttons : [];
	}
});
//#endregion

//# sourceMappingURL=cloudFeedbackTopbarButton-D4Q6y3b6.js.map