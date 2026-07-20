import { qn as useExtensionService } from "./promotionUtils-DLM4TsXW.js";
import { s as t } from "./i18n-BJjDt-Gn.js";
//#region src/extensions/core/nightlyBadges.ts
var badges = [{
	text: t("nightly.badge.label"),
	label: t("g.nightly"),
	variant: "warning",
	tooltip: t("nightly.badge.tooltip")
}];
useExtensionService().registerExtension({
	name: "Comfy.Nightly.Badges",
	topbarBadges: badges
});
//#endregion

//# sourceMappingURL=nightlyBadges-Slc-ag_0.js.map