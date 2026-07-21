import { qn as useExtensionService } from "./promotionUtils-B4DSH7RT.js";
import { s as t } from "./i18n-Ck8-Gum6.js";
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

//# sourceMappingURL=nightlyBadges-CIBbjNJ7.js.map