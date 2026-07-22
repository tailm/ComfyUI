import { qn as useExtensionService } from "./promotionUtils-BjUDpLi8.js";
import { s as t } from "./i18n-JcytnyXX.js";
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

//# sourceMappingURL=nightlyBadges-CEsxbZna.js.map