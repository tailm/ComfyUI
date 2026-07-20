import "./rolldown-runtime-w0pxe0c8.js";
import { Z as script, b as script$1 } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, ct as resolveDirective, d as storeToRefs, ht as useTemplateRef, j as createBaseVNode, jt as ref, rt as openBlock, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Ai as useSubscriptionDialog, Oi as useBillingContext, ji as useWorkspaceUI, pi as useDialogService, ut as formatCreditsFromCents, yi as useSettingsDialog } from "./promotionUtils-DLM4TsXW.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { l as onClickOutside } from "./vendor-vueuse-D8rwdKM0.js";
import { t as useTeamWorkspaceStore } from "./teamWorkspaceStore-CfjV-n35.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { n as useTelemetry } from "./telemetry-CLr022VN.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as useExternalLink } from "./useExternalLink-XiNci0r9.js";
import { t as SubscribeButton_default } from "./SubscribeButton-BH-cSkVL.js";
import { n as UserAvatar_default, t as useCurrentUser } from "./useCurrentUser-BnKX4LyG.js";
import { t as WorkspaceProfilePic_default } from "./WorkspaceProfilePic-a-WCzdJ7.js";
import { n as useWorkspaceSwitch, t as useWorkspaceTierLabel } from "./useWorkspaceTierLabel-DBxu_rFX.js";
//#region src/platform/workspace/components/WorkspaceSwitcherPopover.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex w-80 flex-col overflow-hidden rounded-lg" };
var _hoisted_2$1 = { class: "flex flex-col overflow-y-auto" };
var _hoisted_3$1 = {
	key: 0,
	class: "flex flex-col gap-2 p-2"
};
var _hoisted_4$1 = ["onClick"];
var _hoisted_5$1 = { class: "flex min-w-0 flex-1 flex-col items-start gap-1" };
var _hoisted_6$1 = { class: "flex max-w-full min-w-0 items-center gap-1.5" };
var _hoisted_7$1 = ["title"];
var _hoisted_8$1 = {
	key: 0,
	class: "shrink-0 rounded-full bg-base-foreground px-1 py-0.5 text-2xs font-bold text-base-background uppercase"
};
var _hoisted_9$1 = { class: "text-xs text-muted-foreground" };
var _hoisted_10$1 = {
	key: 0,
	class: "pi pi-check shrink-0 text-sm text-base-foreground"
};
var _hoisted_11$1 = { class: "p-2" };
var _hoisted_12$1 = { class: "flex min-w-0 flex-1 flex-col" };
var _hoisted_13$1 = {
	key: 0,
	class: "text-sm text-muted-foreground"
};
var _hoisted_14$1 = {
	key: 1,
	class: "text-sm text-muted-foreground"
};
//#endregion
//#region src/platform/workspace/components/WorkspaceSwitcherPopover.vue
var WorkspaceSwitcherPopover_default = /* @__PURE__ */ defineComponent({
	__name: "WorkspaceSwitcherPopover",
	emits: ["select", "create"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t } = useI18n();
		const { switchWorkspace } = useWorkspaceSwitch();
		const { subscription } = useBillingContext();
		const { formatTierName, getTierLabel } = useWorkspaceTierLabel();
		const currentSubscriptionTierName = computed(() => {
			const tier = subscription.value?.tier;
			if (!tier) return "";
			return formatTierName(tier, subscription.value?.duration === "ANNUAL");
		});
		const { workspaceId, workspaces, canCreateWorkspace, isFetchingWorkspaces } = storeToRefs(useTeamWorkspaceStore());
		const availableWorkspaces = computed(() => workspaces.value.map((w) => ({
			id: w.id,
			name: w.name,
			type: w.type,
			role: w.role,
			isSubscribed: w.isSubscribed,
			subscriptionPlan: w.subscriptionPlan,
			subscriptionTier: w.subscriptionTier
		})));
		function isCurrentWorkspace(workspace) {
			return workspace.id === workspaceId.value;
		}
		function getDisplayName(workspace) {
			return workspace.type === "personal" ? t("workspaceSwitcher.personal") : workspace.name;
		}
		function getRoleLabel(role) {
			if (role === "owner") return t("workspaceSwitcher.roleOwner");
			if (role === "member") return t("workspaceSwitcher.roleMember");
			return "";
		}
		function resolveTierLabel(workspace) {
			if (workspace.type !== "personal") return null;
			if (isCurrentWorkspace(workspace)) return currentSubscriptionTierName.value || null;
			return getTierLabel(workspace);
		}
		async function handleSelectWorkspace(workspace) {
			if (await switchWorkspace(workspace.id)) emit("select", workspace);
		}
		function handleCreateWorkspace() {
			emit("create");
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [unref(isFetchingWorkspaces) ? (openBlock(), createElementBlock("div", _hoisted_3$1, [(openBlock(), createElementBlock(Fragment, null, renderList(2, (i) => {
				return createBaseVNode("div", {
					key: i,
					class: "flex h-[54px] animate-pulse items-center gap-2 rounded-sm px-2 py-4"
				}, [..._cache[1] || (_cache[1] = [createBaseVNode("div", { class: "size-8 rounded-full bg-secondary-background" }, null, -1), createBaseVNode("div", { class: "flex flex-1 flex-col gap-1" }, [createBaseVNode("div", { class: "h-4 w-24 rounded-sm bg-secondary-background" }), createBaseVNode("div", { class: "h-3 w-16 rounded-sm bg-secondary-background" })], -1)])]);
			}), 64))])) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(availableWorkspaces.value, (workspace) => {
				return openBlock(), createElementBlock("div", {
					key: workspace.id,
					class: "border-b border-border-default p-2"
				}, [createBaseVNode("div", { class: normalizeClass(unref(cn)("group flex h-[54px] w-full items-center gap-2 rounded-sm px-2 py-4", "hover:bg-secondary-background-hover", isCurrentWorkspace(workspace) && "bg-secondary-background")) }, [createBaseVNode("button", {
					class: "flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0",
					onClick: ($event) => handleSelectWorkspace(workspace)
				}, [
					createVNode(WorkspaceProfilePic_default, {
						class: "size-8 shrink-0 text-sm",
						"workspace-name": workspace.name
					}, null, 8, ["workspace-name"]),
					createBaseVNode("div", _hoisted_5$1, [createBaseVNode("div", _hoisted_6$1, [createBaseVNode("span", {
						title: getDisplayName(workspace),
						class: "min-w-0 truncate text-sm text-base-foreground"
					}, toDisplayString(getDisplayName(workspace)), 9, _hoisted_7$1), resolveTierLabel(workspace) ? (openBlock(), createElementBlock("span", _hoisted_8$1, toDisplayString(resolveTierLabel(workspace)), 1)) : createCommentVNode("", true)]), createBaseVNode("span", _hoisted_9$1, toDisplayString(getRoleLabel(workspace.role)), 1)]),
					isCurrentWorkspace(workspace) ? (openBlock(), createElementBlock("i", _hoisted_10$1)) : createCommentVNode("", true)
				], 8, _hoisted_4$1)], 2)]);
			}), 128)), createBaseVNode("div", _hoisted_11$1, [createBaseVNode("div", {
				class: normalizeClass(unref(cn)("flex h-12 w-full items-center gap-2 rounded-sm p-2", unref(canCreateWorkspace) ? "cursor-pointer hover:bg-secondary-background-hover" : "cursor-default")),
				onClick: _cache[0] || (_cache[0] = ($event) => unref(canCreateWorkspace) && handleCreateWorkspace())
			}, [createBaseVNode("div", { class: normalizeClass(unref(cn)("flex size-8 items-center justify-center rounded-full bg-secondary-background", !unref(canCreateWorkspace) && "opacity-50")) }, [..._cache[2] || (_cache[2] = [createBaseVNode("i", { class: "pi pi-plus text-sm text-muted-foreground" }, null, -1)])], 2), createBaseVNode("div", _hoisted_12$1, [unref(canCreateWorkspace) ? (openBlock(), createElementBlock("span", _hoisted_13$1, toDisplayString(_ctx.$t("workspaceSwitcher.createWorkspace")), 1)) : (openBlock(), createElementBlock("span", _hoisted_14$1, toDisplayString(_ctx.$t("workspaceSwitcher.maxWorkspacesReached")), 1))])], 2)])])]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/CurrentUserPopoverWorkspace.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "current-user-popover -m-3 w-fit max-w-96 min-w-80 rounded-lg border border-border-default bg-base-background p-2 shadow-[1px_1px_8px_0_rgba(0,0,0,0.4)]" };
var _hoisted_2 = { class: "mb-4 flex flex-col items-center px-0 py-3" };
var _hoisted_3 = { class: "my-0 mb-1 truncate text-base font-bold text-base-foreground" };
var _hoisted_4 = {
	key: 0,
	class: "my-0 truncate text-sm text-muted"
};
var _hoisted_5 = { class: "relative" };
var _hoisted_6 = { class: "flex min-w-0 flex-1 items-center gap-2" };
var _hoisted_7 = { class: "truncate text-sm text-base-foreground" };
var _hoisted_8 = { class: "flex items-center gap-2 px-4 py-2" };
var _hoisted_9 = {
	key: 1,
	class: "text-base font-semibold text-base-foreground"
};
var _hoisted_10 = { class: "flex-1 text-sm text-base-foreground" };
var _hoisted_11 = { class: "flex-1 text-sm text-base-foreground" };
var _hoisted_12 = { class: "flex-1 text-sm text-base-foreground" };
var _hoisted_13 = { class: "flex-1 text-sm text-base-foreground" };
var _hoisted_14 = { class: "flex-1 text-sm text-base-foreground" };
var _hoisted_15 = { class: "flex-1 text-sm text-base-foreground" };
//#endregion
//#region src/platform/workspace/components/CurrentUserPopoverWorkspace.vue
var CurrentUserPopoverWorkspace_default = /* @__PURE__ */ defineComponent({
	__name: "CurrentUserPopoverWorkspace",
	emits: ["close"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const { initState, workspaceName, isInPersonalWorkspace: isPersonalWorkspace } = storeToRefs(useTeamWorkspaceStore());
		const { permissions } = useWorkspaceUI();
		const isWorkspaceSwitcherOpen = ref(false);
		const workspaceSwitcherTrigger = useTemplateRef("workspaceSwitcherTrigger");
		const workspaceSwitcherPanel = useTemplateRef("workspaceSwitcherPanel");
		onClickOutside(workspaceSwitcherPanel, () => {
			isWorkspaceSwitcherOpen.value = false;
		}, { ignore: [workspaceSwitcherTrigger] });
		const emit = __emit;
		const { buildDocsUrl, docsPaths } = useExternalLink();
		const { userDisplayName, userEmail, userPhotoUrl, handleSignOut } = useCurrentUser();
		const settingsDialog = useSettingsDialog();
		const dialogService = useDialogService();
		const { isActiveSubscription, isFreeTier, subscription, balance, isLoading, fetchBalance } = useBillingContext();
		const isCancelled = computed(() => subscription.value?.isCancelled ?? false);
		const subscriptionDialog = useSubscriptionDialog();
		const { locale } = useI18n();
		const isLoadingBalance = isLoading;
		const displayedCredits = computed(() => {
			if (initState.value !== "ready") return "";
			return formatCreditsFromCents({
				cents: balance.value?.effectiveBalanceMicros ?? balance.value?.amountMicros ?? 0,
				locale: locale.value,
				numberOptions: {
					minimumFractionDigits: 0,
					maximumFractionDigits: 2
				}
			});
		});
		const showPlansAndPricing = computed(() => permissions.value.canManageSubscription);
		const showManagePlan = computed(() => permissions.value.canManageSubscription && isActiveSubscription.value);
		const showSubscribeAction = computed(() => permissions.value.canManageSubscription && (!isActiveSubscription.value || isCancelled.value));
		const handleOpenUserSettings = () => {
			settingsDialog.show("user");
			emit("close");
		};
		const handleOpenWorkspaceSettings = () => {
			settingsDialog.show("workspace");
			emit("close");
		};
		const handleOpenPlansAndPricing = () => {
			subscriptionDialog.showPricingTable({ reason: "avatar_menu_plans" });
			emit("close");
		};
		const handleOpenPlanAndCreditsSettings = () => {
			if (isCloud) settingsDialog.show("workspace");
			else settingsDialog.show("credits");
			emit("close");
		};
		const handleUpgradeToAddCredits = () => {
			subscriptionDialog.showPricingTable({ reason: "upgrade_to_add_credits" });
			emit("close");
		};
		const handleTopUp = () => {
			useTelemetry()?.trackAddApiCreditButtonClicked({ source: "avatar_menu" });
			dialogService.showTopUpCreditsDialog();
			emit("close");
		};
		const handleOpenPartnerNodesInfo = () => {
			window.open(buildDocsUrl(docsPaths.partnerNodesPricing, { includeLocale: true }), "_blank");
			emit("close");
		};
		const handleLogout = async () => {
			await handleSignOut();
			emit("close");
		};
		const handleCreateWorkspace = () => {
			isWorkspaceSwitcherOpen.value = false;
			dialogService.showCreateWorkspaceDialog();
			emit("close");
		};
		const toggleWorkspaceSwitcher = () => {
			isWorkspaceSwitcherOpen.value = !isWorkspaceSwitcherOpen.value;
		};
		const refreshBalance = () => {
			fetchBalance();
		};
		__expose({ refreshBalance });
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [
					createVNode(UserAvatar_default, {
						class: "mb-1",
						"photo-url": unref(userPhotoUrl),
						"pt:icon:class": { "text-2xl!": !unref(userPhotoUrl) },
						size: "large"
					}, null, 8, ["photo-url", "pt:icon:class"]),
					createBaseVNode("h3", _hoisted_3, toDisplayString(unref(userDisplayName) || _ctx.$t("g.user")), 1),
					unref(userEmail) ? (openBlock(), createElementBlock("p", _hoisted_4, toDisplayString(unref(userEmail)), 1)) : createCommentVNode("", true)
				]),
				createBaseVNode("div", _hoisted_5, [createBaseVNode("div", {
					ref_key: "workspaceSwitcherTrigger",
					ref: workspaceSwitcherTrigger,
					class: "flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "workspace-switcher-trigger",
					onClick: toggleWorkspaceSwitcher
				}, [createBaseVNode("div", _hoisted_6, [createVNode(WorkspaceProfilePic_default, {
					class: "size-6 shrink-0 text-xs",
					"workspace-name": unref(workspaceName)
				}, null, 8, ["workspace-name"]), createBaseVNode("span", _hoisted_7, toDisplayString(unref(workspaceName)), 1)]), _cache[1] || (_cache[1] = createBaseVNode("i", { class: "pi pi-chevron-down shrink-0 text-sm text-muted-foreground" }, null, -1))], 512), isWorkspaceSwitcherOpen.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					ref_key: "workspaceSwitcherPanel",
					ref: workspaceSwitcherPanel,
					class: "absolute top-0 right-full z-10 mr-4 rounded-lg border border-border-default bg-base-background shadow-[1px_1px_8px_0_rgba(0,0,0,0.4)]",
					"data-testid": "workspace-switcher-panel"
				}, [createVNode(WorkspaceSwitcherPopover_default, {
					onSelect: _cache[0] || (_cache[0] = ($event) => isWorkspaceSwitcherOpen.value = false),
					onCreate: handleCreateWorkspace
				})], 512)) : createCommentVNode("", true)]),
				createBaseVNode("div", _hoisted_8, [
					_cache[3] || (_cache[3] = createBaseVNode("i", { class: "icon-[lucide--component] text-sm text-amber-400" }, null, -1)),
					unref(isLoadingBalance) ? (openBlock(), createBlock(unref(script), {
						key: 0,
						width: "4rem",
						height: "1.25rem",
						class: "w-full"
					})) : (openBlock(), createElementBlock("span", _hoisted_9, toDisplayString(displayedCredits.value), 1)),
					withDirectives((openBlock(), createBlock(Button_default, {
						variant: "muted-textonly",
						size: "icon-sm",
						class: "mr-auto",
						"aria-label": _ctx.$t("credits.unified.tooltip"),
						"data-testid": "credits-info-button"
					}, {
						default: withCtx(() => [..._cache[2] || (_cache[2] = [createBaseVNode("i", { class: "icon-[lucide--circle-help]" }, null, -1)])]),
						_: 1
					}, 8, ["aria-label"])), [[_directive_tooltip, {
						value: _ctx.$t("credits.unified.tooltip"),
						showDelay: 300
					}]]),
					unref(isActiveSubscription) && unref(permissions).canTopUp && unref(isFreeTier) ? (openBlock(), createBlock(Button_default, {
						key: 2,
						variant: "gradient",
						size: "sm",
						"data-testid": "upgrade-to-add-credits-button",
						onClick: handleUpgradeToAddCredits
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.upgradeToAddCredits")), 1)]),
						_: 1
					})) : unref(isActiveSubscription) && unref(permissions).canTopUp ? (openBlock(), createBlock(Button_default, {
						key: 3,
						variant: "secondary",
						size: "sm",
						class: "text-base-foreground",
						"data-testid": "add-credits-button",
						onClick: handleTopUp
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("subscription.addCredits")), 1)]),
						_: 1
					})) : createCommentVNode("", true),
					showSubscribeAction.value && unref(isPersonalWorkspace) ? (openBlock(), createBlock(SubscribeButton_default, {
						key: 4,
						fluid: false,
						label: isCancelled.value ? _ctx.$t("subscription.resubscribe") : _ctx.$t("workspaceSwitcher.subscribe"),
						size: "sm",
						"button-variant": "gradient"
					}, null, 8, ["label"])) : createCommentVNode("", true),
					showSubscribeAction.value && !unref(isPersonalWorkspace) && (!isCancelled.value || unref(permissions).canManageSubscriptionLifecycle) ? (openBlock(), createBlock(Button_default, {
						key: 5,
						variant: "primary",
						size: "sm",
						onClick: handleOpenPlansAndPricing
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(isCancelled.value ? _ctx.$t("subscription.resubscribe") : _ctx.$t("workspaceSwitcher.subscribe")), 1)]),
						_: 1
					})) : createCommentVNode("", true)
				]),
				createVNode(unref(script$1), { class: "mx-0 my-2" }),
				showPlansAndPricing.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: "flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "plans-pricing-menu-item",
					onClick: handleOpenPlansAndPricing
				}, [_cache[4] || (_cache[4] = createBaseVNode("i", { class: "icon-[lucide--receipt-text] text-sm text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_10, toDisplayString(_ctx.$t("subscription.plansAndPricing")), 1)])) : createCommentVNode("", true),
				showManagePlan.value ? (openBlock(), createElementBlock("div", {
					key: 1,
					class: "flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "manage-plan-menu-item",
					onClick: handleOpenPlanAndCreditsSettings
				}, [_cache[5] || (_cache[5] = createBaseVNode("i", { class: "icon-[lucide--file-text] text-sm text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_11, toDisplayString(_ctx.$t("subscription.managePlan")), 1)])) : createCommentVNode("", true),
				createBaseVNode("div", {
					class: "flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "partner-nodes-menu-item",
					onClick: handleOpenPartnerNodesInfo
				}, [_cache[6] || (_cache[6] = createBaseVNode("i", { class: "icon-[lucide--tag] text-sm text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_12, toDisplayString(_ctx.$t("subscription.partnerNodesCredits")), 1)]),
				createVNode(unref(script$1), { class: "mx-0 my-2" }),
				createBaseVNode("div", {
					class: "flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "workspace-settings-menu-item",
					onClick: handleOpenWorkspaceSettings
				}, [_cache[7] || (_cache[7] = createBaseVNode("i", { class: "icon-[lucide--users] text-sm text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_13, toDisplayString(_ctx.$t("userSettings.workspaceSettings")), 1)]),
				createBaseVNode("div", {
					class: "flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "user-settings-menu-item",
					onClick: handleOpenUserSettings
				}, [_cache[8] || (_cache[8] = createBaseVNode("i", { class: "icon-[lucide--settings-2] text-sm text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_14, toDisplayString(_ctx.$t("userSettings.accountSettings")), 1)]),
				createVNode(unref(script$1), { class: "mx-0 my-2" }),
				createBaseVNode("div", {
					class: "flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-secondary-background-hover",
					"data-testid": "logout-menu-item",
					onClick: handleLogout
				}, [_cache[9] || (_cache[9] = createBaseVNode("i", { class: "icon-[lucide--log-out] text-sm text-muted-foreground" }, null, -1)), createBaseVNode("span", _hoisted_15, toDisplayString(_ctx.$t("auth.signOut.signOut")), 1)])
			]);
		};
	}
});
//#endregion
export { CurrentUserPopoverWorkspace_default as default };

//# sourceMappingURL=CurrentUserPopoverWorkspace-IwnhluH_.js.map