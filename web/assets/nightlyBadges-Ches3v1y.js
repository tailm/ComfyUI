import { qn as useExtensionService } from "./promotionUtils-bxMXJ_BT.js";
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

//# sourceMappingURL=nightlyBadges-Ches3v1y.js.map