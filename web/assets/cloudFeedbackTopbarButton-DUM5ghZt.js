import "./rolldown-runtime-w0pxe0c8.js";
import { ea as useSettingStore, qn as useExtensionService } from "./promotionUtils-BjUDpLi8.js";
import { s as t } from "./i18n-JcytnyXX.js";
import { t as buildFeedbackTypeformUrl } from "./config-BF-zp50h.js";
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

//# sourceMappingURL=cloudFeedbackTopbarButton-DUM5ghZt.js.map