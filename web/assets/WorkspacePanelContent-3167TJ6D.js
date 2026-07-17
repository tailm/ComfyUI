import "./rolldown-runtime-w0pxe0c8.js";
import { tt as useToast } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Et as isRef, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, ct as resolveDirective, d as storeToRefs, et as onMounted, j as createBaseVNode, jt as ref, rt as openBlock, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Ai as useSubscriptionDialog, Hi as SearchInput_default, Oi as useBillingContext, dt as DropdownMenu_default, ji as useWorkspaceUI, mr as MoreButton_default, pi as useDialogService } from "./promotionUtils-BlyjkT7V.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as useTeamWorkspaceStore } from "./teamWorkspaceStore-CsZZpFU0.js";
import { d as TabsTrigger_default, f as TabsList_default, m as TabsRoot_default, p as TabsContent_default } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useExternalLink } from "./useExternalLink-BniNQVDC.js";
import { t as UserAvatar_default } from "./UserAvatar-Cib7ZZ7y.js";
import { t as WorkspaceProfilePic_default } from "./WorkspaceProfilePic-DnYfi6zM.js";
import { t as useCurrentUser } from "./useCurrentUser-VR5ritSj.js";
import { t as SubscriptionPanelContentWorkspace_default } from "./SubscriptionPanelContentWorkspace-BV6i5a0T.js";
//#region src/platform/workspace/components/dialogs/settings/MemberListItem.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$4 = ["data-testid"];
var _hoisted_2$4 = { class: "flex items-center gap-3" };
var _hoisted_3$4 = { class: "flex min-w-0 flex-1 flex-col gap-1" };
var _hoisted_4$2 = { class: "text-sm text-base-foreground" };
var _hoisted_5$2 = {
	key: 0,
	class: "text-muted-foreground"
};
var _hoisted_6$2 = { class: "text-sm text-muted-foreground" };
var _hoisted_7$2 = {
	key: 0,
	class: "text-right text-sm text-muted-foreground"
};
var _hoisted_8$2 = {
	key: 1,
	class: "flex items-center justify-end"
};
//#endregion
//#region src/platform/workspace/components/dialogs/settings/MemberListItem.vue
var MemberListItem_default = /* @__PURE__ */ defineComponent({
	__name: "MemberListItem",
	props: {
		member: {},
		isCurrentUser: { type: Boolean },
		photoUrl: {},
		gridCols: {},
		showRoleColumn: {
			type: Boolean,
			default: false
		},
		canManageMembers: {
			type: Boolean,
			default: false
		},
		isSingleSeatPlan: {
			type: Boolean,
			default: false
		},
		isOriginalOwner: {
			type: Boolean,
			default: false
		},
		striped: {
			type: Boolean,
			default: false
		},
		menuItems: { default: () => [] }
	},
	setup(__props) {
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", {
				"data-testid": `member-row-${__props.member.id}`,
				class: normalizeClass(unref(cn)("grid w-full items-center rounded-lg p-2", __props.isSingleSeatPlan ? "grid-cols-1" : __props.gridCols, __props.striped && "bg-secondary-background/50"))
			}, [
				createBaseVNode("div", _hoisted_2$4, [createVNode(UserAvatar_default, {
					class: "size-8",
					"photo-url": __props.isCurrentUser ? __props.photoUrl : void 0,
					"pt:icon:class": { "text-xl!": !__props.isCurrentUser || !__props.photoUrl }
				}, null, 8, ["photo-url", "pt:icon:class"]), createBaseVNode("div", _hoisted_3$4, [createBaseVNode("span", _hoisted_4$2, [createTextVNode(toDisplayString(__props.member.name) + " ", 1), __props.isCurrentUser ? (openBlock(), createElementBlock("span", _hoisted_5$2, " (" + toDisplayString(_ctx.$t("g.you")) + ") ", 1)) : createCommentVNode("", true)]), createBaseVNode("span", _hoisted_6$2, toDisplayString(__props.member.email), 1)])]),
				__props.showRoleColumn && !__props.isSingleSeatPlan ? (openBlock(), createElementBlock("span", _hoisted_7$2, toDisplayString(__props.member.role === "owner" ? _ctx.$t("workspaceSwitcher.roleOwner") : _ctx.$t("workspaceSwitcher.roleMember")), 1)) : createCommentVNode("", true),
				__props.canManageMembers && !__props.isSingleSeatPlan ? (openBlock(), createElementBlock("div", _hoisted_8$2, [!__props.isCurrentUser && !__props.isOriginalOwner ? (openBlock(), createBlock(DropdownMenu_default, {
					key: 0,
					entries: __props.menuItems
				}, {
					button: withCtx(() => [withDirectives((openBlock(), createBlock(Button_default, {
						variant: "muted-textonly",
						size: "icon",
						"aria-label": _ctx.$t("g.moreOptions")
					}, {
						default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-ellipsis-h" }, null, -1)])]),
						_: 1
					}, 8, ["aria-label"])), [[_directive_tooltip, {
						value: _ctx.$t("g.moreOptions"),
						showDelay: 300
					}]])]),
					_: 1
				}, 8, ["entries"])) : createCommentVNode("", true)])) : createCommentVNode("", true)
			], 10, _hoisted_1$4);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/dialogs/settings/MemberUpsellBanner.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-interface-stroke bg-secondary-background p-6 max-sm:flex-col max-sm:items-stretch" };
var _hoisted_2$3 = { class: "flex items-center gap-2" };
var _hoisted_3$3 = { class: "m-0 text-sm text-muted-foreground" };
//#endregion
//#region src/platform/workspace/components/dialogs/settings/MemberUpsellBanner.vue
var MemberUpsellBanner_default = /* @__PURE__ */ defineComponent({
	__name: "MemberUpsellBanner",
	props: { reactivate: {
		type: Boolean,
		default: false
	} },
	emits: ["showPlans"],
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$3, [createBaseVNode("div", _hoisted_2$3, [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "icon-[lucide--info] size-4 shrink-0 text-muted-foreground" }, null, -1)), createBaseVNode("p", _hoisted_3$3, toDisplayString(__props.reactivate ? _ctx.$t("workspacePanel.members.upsellBannerReactivate") : _ctx.$t("workspacePanel.members.upsellBanner")), 1)]), createVNode(Button_default, {
				variant: "inverted",
				size: "lg",
				class: "max-sm:w-full",
				onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("showPlans"))
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(__props.reactivate ? _ctx.$t("workspacePanel.members.reactivateTeam") : _ctx.$t("workspacePanel.members.upgradeToTeam")), 1)]),
				_: 1
			})]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/dialogs/settings/PendingInvitesList.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "flex items-center gap-3" };
var _hoisted_2$2 = { class: "flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-background" };
var _hoisted_3$2 = { class: "text-sm font-bold text-base-foreground" };
var _hoisted_4$1 = { class: "flex min-w-0 flex-1 flex-col gap-1" };
var _hoisted_5$1 = { class: "text-sm text-base-foreground" };
var _hoisted_6$1 = { class: "text-sm text-muted-foreground" };
var _hoisted_7$1 = { class: "text-sm text-muted-foreground" };
var _hoisted_8$1 = { class: "text-sm text-muted-foreground" };
var _hoisted_9$1 = { class: "flex items-center justify-end" };
var _hoisted_10$1 = {
	key: 0,
	class: "flex w-full items-center justify-center py-8 text-sm text-muted-foreground"
};
var menuItemClass = "w-full justify-start rounded-sm px-3 py-2";
//#endregion
//#region src/platform/workspace/components/dialogs/settings/PendingInvitesList.vue
var PendingInvitesList_default = /* @__PURE__ */ defineComponent({
	__name: "PendingInvitesList",
	props: {
		invites: {},
		gridCols: {}
	},
	emits: ["resend", "revoke"],
	setup(__props) {
		const { d } = useI18n();
		function getInviteDisplayName(email) {
			return email.split("@")[0];
		}
		function getInviteInitial(email) {
			return email.charAt(0).toUpperCase();
		}
		function formatDate(date) {
			return d(date, { dateStyle: "medium" });
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.invites, (invite, index) => {
				return openBlock(), createElementBlock("div", {
					key: invite.id,
					class: normalizeClass(unref(cn)("grid w-full items-center rounded-lg p-2", __props.gridCols, index % 2 === 1 && "bg-secondary-background/50"))
				}, [
					createBaseVNode("div", _hoisted_1$2, [createBaseVNode("div", _hoisted_2$2, [createBaseVNode("span", _hoisted_3$2, toDisplayString(getInviteInitial(invite.email)), 1)]), createBaseVNode("div", _hoisted_4$1, [createBaseVNode("span", _hoisted_5$1, toDisplayString(getInviteDisplayName(invite.email)), 1), createBaseVNode("span", _hoisted_6$1, toDisplayString(invite.email), 1)])]),
					createBaseVNode("span", _hoisted_7$1, toDisplayString(formatDate(invite.inviteDate)), 1),
					createBaseVNode("span", _hoisted_8$1, toDisplayString(formatDate(invite.expiryDate)), 1),
					createBaseVNode("div", _hoisted_9$1, [createVNode(MoreButton_default, { "aria-label": _ctx.$t("g.moreOptions") }, {
						default: withCtx(({ close }) => [createVNode(Button_default, {
							variant: "textonly",
							size: "unset",
							class: normalizeClass(menuItemClass),
							onClick: () => {
								close();
								_ctx.$emit("resend", invite);
							}
						}, {
							default: withCtx(() => [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "icon-[lucide--mail-plus] size-4" }, null, -1)), createBaseVNode("span", null, toDisplayString(_ctx.$t("workspacePanel.members.actions.resendInvite")), 1)]),
							_: 1
						}, 8, ["onClick"]), createVNode(Button_default, {
							variant: "textonly",
							size: "unset",
							class: normalizeClass(menuItemClass),
							onClick: () => {
								close();
								_ctx.$emit("revoke", invite);
							}
						}, {
							default: withCtx(() => [_cache[1] || (_cache[1] = createBaseVNode("i", { class: "icon-[lucide--mail-x] size-4" }, null, -1)), createBaseVNode("span", null, toDisplayString(_ctx.$t("workspacePanel.members.actions.cancelInvite")), 1)]),
							_: 1
						}, 8, ["onClick"])]),
						_: 2
					}, 1032, ["aria-label"])])
				], 2);
			}), 128)), __props.invites.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_10$1, toDisplayString(_ctx.$t("workspacePanel.members.noInvites")), 1)) : createCommentVNode("", true)]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/dialogs/settings/WorkspaceMenuButton.vue
var WorkspaceMenuButton_default = /* @__PURE__ */ defineComponent({
	__name: "WorkspaceMenuButton",
	setup(__props) {
		const { t } = useI18n();
		const { showLeaveWorkspaceDialog, showDeleteWorkspaceDialog, showEditWorkspaceDialog } = useDialogService();
		const { isWorkspaceSubscribed, isCurrentUserOriginalOwner } = storeToRefs(useTeamWorkspaceStore());
		const { uiConfig } = useWorkspaceUI();
		const isDeleteDisabled = computed(() => uiConfig.value.workspaceMenuAction === "delete" && isWorkspaceSubscribed.value);
		const deleteTooltip = computed(() => {
			if (!isDeleteDisabled.value) return void 0;
			const tooltipKey = uiConfig.value.workspaceMenuDisabledTooltip;
			return tooltipKey ? t(tooltipKey) : void 0;
		});
		const menuItems = computed(() => {
			const items = [];
			if (uiConfig.value.showEditWorkspaceMenuItem) items.push({
				label: t("workspacePanel.menu.editWorkspace"),
				icon: "pi pi-pencil",
				command: () => showEditWorkspaceDialog()
			});
			const action = uiConfig.value.workspaceMenuAction;
			if (action === "delete") items.push({
				label: t("workspacePanel.menu.deleteWorkspace"),
				icon: "pi pi-trash",
				class: isDeleteDisabled.value ? "text-danger/50" : "text-danger",
				disabled: isDeleteDisabled.value,
				tooltip: deleteTooltip.value,
				command: isDeleteDisabled.value ? void 0 : () => showDeleteWorkspaceDialog()
			});
			if (action === "leave" || action === "delete") items.push(isCurrentUserOriginalOwner.value ? {
				label: t("workspacePanel.menu.leaveWorkspace"),
				icon: "pi pi-sign-out",
				class: "opacity-50",
				disabled: true,
				tooltip: t("workspacePanel.menu.creatorCannotLeave")
			} : {
				label: t("workspacePanel.menu.leaveWorkspace"),
				icon: "pi pi-sign-out",
				command: () => showLeaveWorkspaceDialog()
			});
			return items;
		});
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createBlock(DropdownMenu_default, { entries: menuItems.value }, {
				button: withCtx(() => [withDirectives((openBlock(), createBlock(Button_default, {
					variant: "muted-textonly",
					size: "icon-lg",
					"aria-label": _ctx.$t("g.moreOptions")
				}, {
					default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-ellipsis-h" }, null, -1)])]),
					_: 1
				}, 8, ["aria-label"])), [[_directive_tooltip, {
					value: _ctx.$t("g.moreOptions"),
					showDelay: 300
				}]])]),
				_: 1
			}, 8, ["entries"]);
		};
	}
});
//#endregion
//#region src/platform/workspace/composables/useTeamPlan.ts
/**
* Team-plan state for the active workspace. The team plan is tier-independent
* (no standard/creator/pro): "on the team plan" simply means a team workspace
* that is subscribed to it.
*/
function useTeamPlan() {
	const { subscription, subscriptionStatus } = useBillingContext();
	const { isInPersonalWorkspace, isWorkspaceSubscribed } = storeToRefs(useTeamWorkspaceStore());
	const isTeamWorkspace = computed(() => !isInPersonalWorkspace.value);
	const isOnTeamPlan = computed(() => isTeamWorkspace.value && isWorkspaceSubscribed.value);
	const isCancelled = computed(() => subscription.value?.isCancelled ?? false);
	const isSubscriptionLapsed = computed(() => subscriptionStatus.value === "canceled" || subscriptionStatus.value === "ended");
	return {
		isOnTeamPlan,
		isCancelled,
		hasLapsedTeamPlan: computed(() => isTeamWorkspace.value && isSubscriptionLapsed.value)
	};
}
//#endregion
//#region src/platform/workspace/composables/useMembersPanel.ts
function sortMembers(members, currentUserEmail, sortDirection, originalOwnerId = null) {
	return [...members].sort((a, b) => {
		const aIsOriginalOwner = a.id === originalOwnerId;
		const bIsOriginalOwner = b.id === originalOwnerId;
		if (aIsOriginalOwner && !bIsOriginalOwner) return -1;
		if (!aIsOriginalOwner && bIsOriginalOwner) return 1;
		if (a.role !== b.role) {
			const ownerFirst = a.role === "owner" ? -1 : 1;
			return sortDirection === "desc" ? ownerFirst : -ownerFirst;
		}
		const aIsCurrent = a.email.toLowerCase() === currentUserEmail?.toLowerCase();
		const bIsCurrent = b.email.toLowerCase() === currentUserEmail?.toLowerCase();
		if (aIsCurrent && !bIsCurrent) return -1;
		if (!aIsCurrent && bIsCurrent) return 1;
		const aValue = a.joinDate.getTime();
		const bValue = b.joinDate.getTime();
		return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
	});
}
function filterBySearch(items, query) {
	if (!query) return items;
	const q = query.toLowerCase();
	return items.filter((item) => item.email.toLowerCase().includes(q) || "name" in item && item.name?.toLowerCase().includes(q));
}
function toInviteSortField(sortField) {
	return sortField === "expiryDate" ? "expiryDate" : "inviteDate";
}
function sortPendingInvites(invites, sortField, sortDirection) {
	const field = toInviteSortField(sortField);
	return [...invites].sort((a, b) => {
		const aDate = a[field];
		const bDate = b[field];
		if (!aDate || !bDate) return 0;
		const aValue = aDate.getTime();
		const bValue = bDate.getTime();
		return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
	});
}
function useMembersPanel() {
	const { t } = useI18n();
	const toast = useToast();
	const { userPhotoUrl, userEmail, userDisplayName } = useCurrentUser();
	const { showRemoveMemberDialog, showRevokeInviteDialog, showChangeMemberRoleDialog, showInviteMemberDialog, showInviteMemberUpsellDialog } = useDialogService();
	const workspaceStore = useTeamWorkspaceStore();
	const { members, pendingInvites, originalOwnerId, totalMemberSlots, isInviteLimitReached, isInPersonalWorkspace: isPersonalWorkspace } = storeToRefs(workspaceStore);
	const { resendInvite } = workspaceStore;
	const { permissions, uiConfig } = useWorkspaceUI();
	const { isOnTeamPlan, isCancelled, hasLapsedTeamPlan } = useTeamPlan();
	const subscriptionDialog = useSubscriptionDialog();
	const maxSeats = computed(() => 30);
	const hasMultipleMembers = computed(() => members.value.length > 1);
	const showSearch = computed(() => uiConfig.value.showSearch && hasMultipleMembers.value);
	const showViewTabs = computed(() => isOnTeamPlan.value && (hasMultipleMembers.value || pendingInvites.value.length > 0));
	const showInviteButton = computed(() => permissions.value.canInviteMembers || isPersonalWorkspace.value);
	const isMemberLimitReached = computed(() => isInviteLimitReached.value || totalMemberSlots.value >= maxSeats.value);
	const isInviteDisabled = computed(() => !isOnTeamPlan.value || isCancelled.value || isMemberLimitReached.value);
	const inviteTooltip = computed(() => {
		if (!isOnTeamPlan.value) return null;
		if (!isMemberLimitReached.value) return null;
		return t("workspacePanel.inviteLimitReached", { count: maxSeats.value });
	});
	function handleInviteMember() {
		if (!isOnTeamPlan.value) {
			showInviteMemberUpsellDialog();
			return;
		}
		if (isCancelled.value || isMemberLimitReached.value) return;
		showInviteMemberDialog();
	}
	const personalWorkspaceMember = computed(() => ({
		id: "self",
		name: userDisplayName.value ?? "",
		email: userEmail.value ?? "",
		role: "owner",
		joinDate: /* @__PURE__ */ new Date(0),
		isOriginalOwner: true
	}));
	const searchQuery = ref("");
	const activeView = ref("active");
	const sortField = ref("inviteDate");
	const sortDirection = ref("desc");
	function roleMenuItem(member, role, label) {
		return {
			label,
			checked: member.role === role,
			command: () => handleChangeRole(member, role)
		};
	}
	function memberMenuItems(member) {
		return [{
			label: t("workspacePanel.members.actions.changeRole"),
			items: [roleMenuItem(member, "owner", t("workspaceSwitcher.roleOwner")), roleMenuItem(member, "member", t("workspaceSwitcher.roleMember"))]
		}, {
			label: t("workspacePanel.members.actions.removeMember"),
			command: () => handleRemoveMember(member)
		}];
	}
	function isCurrentUser(member) {
		return member.email.toLowerCase() === userEmail.value?.toLowerCase();
	}
	function isOriginalOwner(member) {
		return member.id === originalOwnerId.value;
	}
	const filteredMembers = computed(() => {
		return sortMembers(filterBySearch(members.value, searchQuery.value), userEmail.value ?? null, sortDirection.value, originalOwnerId.value);
	});
	const memberMenus = computed(() => new Map(filteredMembers.value.map((m) => [m.id, memberMenuItems(m)])));
	const filteredPendingInvites = computed(() => {
		return sortPendingInvites(filterBySearch(pendingInvites.value, searchQuery.value), sortField.value, sortDirection.value);
	});
	function toggleSort(field) {
		if (sortField.value === field) sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
		else {
			sortField.value = field;
			sortDirection.value = "desc";
		}
	}
	async function handleResendInvite(invite) {
		try {
			await resendInvite(invite.id);
			toast.add({
				severity: "success",
				summary: t("workspacePanel.toast.inviteResent"),
				life: 2e3
			});
		} catch {
			toast.add({
				severity: "error",
				summary: t("workspacePanel.toast.inviteResendFailed")
			});
		}
	}
	function handleRevokeInvite(invite) {
		showRevokeInviteDialog(invite.id);
	}
	function handleRemoveMember(member) {
		showRemoveMemberDialog(member.id);
	}
	function handleChangeRole(member, targetRole) {
		if (member.role === targetRole) return;
		showChangeMemberRoleDialog({
			memberId: member.id,
			memberName: member.name,
			targetRole
		});
	}
	function showTeamPlans() {
		subscriptionDialog.show({
			planMode: "team",
			reason: "team_members_panel"
		});
	}
	return {
		searchQuery,
		activeView,
		sortField,
		sortDirection,
		maxSeats,
		isOnTeamPlan,
		hasLapsedTeamPlan,
		hasMultipleMembers,
		showSearch,
		showViewTabs,
		showInviteButton,
		isInviteDisabled,
		inviteTooltip,
		handleInviteMember,
		personalWorkspaceMember,
		filteredMembers,
		filteredPendingInvites,
		memberMenuItems,
		memberMenus,
		isPersonalWorkspace,
		members,
		pendingInvites,
		permissions,
		uiConfig,
		userPhotoUrl,
		isCurrentUser,
		isOriginalOwner,
		toggleSort,
		showTeamPlans,
		handleResendInvite,
		handleRevokeInvite,
		handleRemoveMember,
		handleChangeRole
	};
}
//#endregion
//#region src/platform/workspace/components/dialogs/settings/MembersPanelContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "grow overflow-auto pt-6" };
var _hoisted_2$1 = { class: "border-inter flex size-full flex-col gap-2 rounded-2xl border border-interface-stroke p-6" };
var _hoisted_3$1 = { class: "flex w-full items-center gap-9" };
var _hoisted_4 = { class: "flex min-w-0 flex-1 items-baseline gap-2" };
var _hoisted_5 = { class: "text-base font-semibold text-base-foreground" };
var _hoisted_6 = { class: "flex items-center gap-2" };
var _hoisted_7 = { class: "flex min-h-0 flex-1 flex-col" };
var _hoisted_8 = { class: "flex items-center gap-2" };
var _hoisted_9 = { key: 0 };
var _hoisted_10 = { class: "min-h-0 flex-1 overflow-y-auto" };
var _hoisted_11 = {
	key: 1,
	class: "flex items-center pt-2"
};
var _hoisted_12 = { class: "text-sm text-muted-foreground" };
//#endregion
//#region src/platform/workspace/components/dialogs/settings/MembersPanelContent.vue
var MembersPanelContent_default = /* @__PURE__ */ defineComponent({
	__name: "MembersPanelContent",
	setup(__props) {
		const { searchQuery, activeView, maxSeats, isOnTeamPlan, hasLapsedTeamPlan, hasMultipleMembers, showSearch, showViewTabs, showInviteButton, isInviteDisabled, inviteTooltip, handleInviteMember, personalWorkspaceMember, filteredMembers, filteredPendingInvites, memberMenus, isPersonalWorkspace, members, pendingInvites, permissions, uiConfig, userPhotoUrl, isCurrentUser, isOriginalOwner, toggleSort, showTeamPlans, handleResendInvite, handleRevokeInvite } = useMembersPanel();
		const { staticUrls } = useExternalLink();
		function handleContactUs() {
			window.open(staticUrls.discord, "_blank", "noopener,noreferrer");
		}
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				createBaseVNode("div", _hoisted_2$1, [createBaseVNode("div", _hoisted_3$1, [createBaseVNode("div", _hoisted_4, [createBaseVNode("span", _hoisted_5, [unref(activeView) === "active" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [unref(isOnTeamPlan) && !unref(isPersonalWorkspace) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.membersCount", {
					count: unref(members).length,
					maxSeats: unref(maxSeats)
				})), 1)], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.header")), 1)], 64))], 64)) : unref(permissions).canViewPendingInvites ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.pendingInvitesCount", unref(pendingInvites).length)), 1)], 64)) : createCommentVNode("", true)])]), createBaseVNode("div", _hoisted_6, [
					unref(showSearch) ? (openBlock(), createBlock(SearchInput_default, {
						key: 0,
						modelValue: unref(searchQuery),
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(searchQuery) ? searchQuery.value = $event : null),
						placeholder: _ctx.$t("workspacePanel.members.searchPlaceholder"),
						size: "lg",
						class: "w-64"
					}, null, 8, ["modelValue", "placeholder"])) : createCommentVNode("", true),
					unref(showInviteButton) ? withDirectives((openBlock(), createBlock(Button_default, {
						key: 1,
						variant: "secondary",
						size: "lg",
						disabled: unref(isInviteDisabled),
						"aria-label": _ctx.$t("workspacePanel.inviteMember"),
						onClick: unref(handleInviteMember)
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.invite")) + " ", 1), _cache[7] || (_cache[7] = createBaseVNode("i", { class: "pi pi-plus text-sm" }, null, -1))]),
						_: 1
					}, 8, [
						"disabled",
						"aria-label",
						"onClick"
					])), [[_directive_tooltip, unref(inviteTooltip) ? {
						value: unref(inviteTooltip),
						showDelay: 0
					} : {
						value: _ctx.$t("workspacePanel.inviteMember"),
						showDelay: 300
					}]]) : createCommentVNode("", true),
					unref(permissions).canAccessWorkspaceMenu ? (openBlock(), createBlock(WorkspaceMenuButton_default, { key: 2 })) : createCommentVNode("", true)
				])]), createBaseVNode("div", _hoisted_7, [unref(uiConfig).showMembersList && unref(showViewTabs) ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: normalizeClass(unref(cn)("grid w-full items-center py-2", unref(activeView) === "pending" ? unref(uiConfig).pendingGridCols : unref(uiConfig).headerGridCols))
				}, [createBaseVNode("div", _hoisted_8, [createVNode(Button_default, {
					variant: unref(activeView) === "active" ? "secondary" : "muted-textonly",
					size: "md",
					onClick: _cache[1] || (_cache[1] = ($event) => activeView.value = "active")
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.tabs.active")), 1)]),
					_: 1
				}, 8, ["variant"]), unref(uiConfig).showPendingTab ? (openBlock(), createBlock(Button_default, {
					key: 0,
					variant: unref(activeView) === "pending" ? "secondary" : "muted-textonly",
					size: "md",
					onClick: _cache[2] || (_cache[2] = ($event) => activeView.value = "pending")
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.tabs.pendingCount", unref(pendingInvites).length)), 1)]),
					_: 1
				}, 8, ["variant"])) : createCommentVNode("", true)]), unref(activeView) === "pending" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createVNode(Button_default, {
						variant: "muted-textonly",
						size: "sm",
						class: "justify-start",
						onClick: _cache[3] || (_cache[3] = ($event) => unref(toggleSort)("inviteDate"))
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.columns.inviteDate")) + " ", 1), _cache[8] || (_cache[8] = createBaseVNode("i", { class: "icon-[lucide--chevrons-up-down] size-4" }, null, -1))]),
						_: 1
					}),
					createVNode(Button_default, {
						variant: "muted-textonly",
						size: "sm",
						class: "justify-start",
						onClick: _cache[4] || (_cache[4] = ($event) => unref(toggleSort)("expiryDate"))
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.columns.expiryDate")) + " ", 1), _cache[9] || (_cache[9] = createBaseVNode("i", { class: "icon-[lucide--chevrons-up-down] size-4" }, null, -1))]),
						_: 1
					}),
					_cache[10] || (_cache[10] = createBaseVNode("div", null, null, -1))
				], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(Button_default, {
					variant: "muted-textonly",
					size: "sm",
					class: "justify-end",
					onClick: _cache[5] || (_cache[5] = ($event) => unref(toggleSort)("role"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.columns.role")) + " ", 1), _cache[11] || (_cache[11] = createBaseVNode("i", { class: "icon-[lucide--chevrons-up-down] size-4" }, null, -1))]),
					_: 1
				}), unref(permissions).canManageMembers ? (openBlock(), createElementBlock("div", _hoisted_9)) : createCommentVNode("", true)], 64))], 2)) : createCommentVNode("", true), createBaseVNode("div", _hoisted_10, [unref(activeView) === "active" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [unref(isPersonalWorkspace) ? (openBlock(), createBlock(MemberListItem_default, {
					key: 0,
					member: unref(personalWorkspaceMember),
					"is-current-user": true,
					"photo-url": unref(userPhotoUrl) ?? void 0,
					"grid-cols": unref(uiConfig).membersGridCols
				}, null, 8, [
					"member",
					"photo-url",
					"grid-cols"
				])) : (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(unref(filteredMembers), (member, index) => {
					return openBlock(), createBlock(MemberListItem_default, {
						key: member.id,
						member,
						"is-current-user": unref(isCurrentUser)(member),
						"photo-url": unref(isCurrentUser)(member) ? unref(userPhotoUrl) ?? void 0 : void 0,
						"grid-cols": unref(uiConfig).membersGridCols,
						"show-role-column": unref(uiConfig).showRoleColumn && unref(hasMultipleMembers),
						"can-manage-members": unref(permissions).canManageMembers,
						"is-single-seat-plan": !unref(isOnTeamPlan),
						"is-original-owner": unref(isOriginalOwner)(member),
						striped: index % 2 === 1,
						"menu-items": unref(memberMenus).get(member.id)
					}, null, 8, [
						"member",
						"is-current-user",
						"photo-url",
						"grid-cols",
						"show-role-column",
						"can-manage-members",
						"is-single-seat-plan",
						"is-original-owner",
						"striped",
						"menu-items"
					]);
				}), 128))], 64)) : createCommentVNode("", true), unref(activeView) === "pending" ? (openBlock(), createBlock(PendingInvitesList_default, {
					key: 1,
					invites: unref(filteredPendingInvites),
					"grid-cols": unref(uiConfig).pendingGridCols,
					onResend: unref(handleResendInvite),
					onRevoke: unref(handleRevokeInvite)
				}, null, 8, [
					"invites",
					"grid-cols",
					"onResend",
					"onRevoke"
				])) : createCommentVNode("", true)])])]),
				!unref(isOnTeamPlan) ? (openBlock(), createBlock(MemberUpsellBanner_default, {
					key: 0,
					reactivate: unref(hasLapsedTeamPlan),
					onShowPlans: _cache[6] || (_cache[6] = ($event) => unref(showTeamPlans)())
				}, null, 8, ["reactivate"])) : createCommentVNode("", true),
				unref(isOnTeamPlan) && !unref(isPersonalWorkspace) ? (openBlock(), createElementBlock("div", _hoisted_11, [createBaseVNode("p", _hoisted_12, toDisplayString(_ctx.$t("workspacePanel.members.needMoreMembers")), 1), createVNode(Button_default, {
					variant: "muted-textonly",
					size: "sm",
					class: "text-base-foreground",
					onClick: handleContactUs
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.members.contactUs")), 1)]),
					_: 1
				})])) : createCommentVNode("", true)
			]);
		};
	}
});
//#endregion
//#region src/platform/workspace/components/dialogs/settings/WorkspacePanelContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex size-full flex-col" };
var _hoisted_2 = { class: "mb-6 flex items-center gap-4" };
var _hoisted_3 = { class: "text-3xl font-semibold text-base-foreground" };
var tabTriggerBase = "flex items-center justify-center shrink-0 px-2.5 py-2 text-sm rounded-lg cursor-pointer transition-all duration-200 outline-hidden border-none";
var tabTriggerActive = "bg-interface-menu-component-surface-hovered text-text-primary font-bold";
var tabTriggerInactive = "bg-transparent text-text-secondary hover:bg-button-hover-surface focus:bg-button-hover-surface";
//#endregion
//#region src/platform/workspace/components/dialogs/settings/WorkspacePanelContent.vue
var WorkspacePanelContent_default = /* @__PURE__ */ defineComponent({
	__name: "WorkspacePanelContent",
	props: { defaultTab: { default: "plan" } },
	setup(__props) {
		const workspaceStore = useTeamWorkspaceStore();
		const { workspaceName, members } = storeToRefs(workspaceStore);
		const { fetchMembers, fetchPendingInvites } = workspaceStore;
		const { workspaceType, workspaceRole } = useWorkspaceUI();
		const isPersonalWorkspace = computed(() => workspaceType.value === "personal");
		const activeTab = ref(__props.defaultTab);
		const showMembersTabCount = computed(() => !isPersonalWorkspace.value && members.value.length > 1);
		onMounted(() => {
			fetchMembers();
			fetchPendingInvites();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("header", _hoisted_2, [createVNode(WorkspaceProfilePic_default, {
				class: "size-12 text-3xl!",
				"workspace-name": unref(workspaceName)
			}, null, 8, ["workspace-name"]), createBaseVNode("h1", _hoisted_3, toDisplayString(unref(workspaceName)), 1)]), createVNode(unref(TabsRoot_default), {
				modelValue: activeTab.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => activeTab.value = $event)
			}, {
				default: withCtx(() => [
					createVNode(unref(TabsList_default), { class: "flex items-center gap-2 pb-1" }, {
						default: withCtx(() => [createVNode(unref(TabsTrigger_default), {
							value: "plan",
							class: normalizeClass(unref(cn)(tabTriggerBase, activeTab.value === "plan" ? tabTriggerActive : tabTriggerInactive))
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.tabs.planCredits")), 1)]),
							_: 1
						}, 8, ["class"]), createVNode(unref(TabsTrigger_default), {
							value: "members",
							class: normalizeClass(unref(cn)(tabTriggerBase, activeTab.value === "members" ? tabTriggerActive : tabTriggerInactive))
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(showMembersTabCount.value ? _ctx.$t("workspacePanel.tabs.membersCount", { count: unref(members).length }) : _ctx.$t("workspacePanel.members.header")), 1)]),
							_: 1
						}, 8, ["class"])]),
						_: 1
					}),
					createVNode(unref(TabsContent_default), {
						value: "plan",
						class: "mt-4"
					}, {
						default: withCtx(() => [createVNode(SubscriptionPanelContentWorkspace_default)]),
						_: 1
					}),
					createVNode(unref(TabsContent_default), {
						value: "members",
						class: "mt-4"
					}, {
						default: withCtx(() => [(openBlock(), createBlock(MembersPanelContent_default, { key: unref(workspaceRole) }))]),
						_: 1
					})
				]),
				_: 1
			}, 8, ["modelValue"])]);
		};
	}
});
//#endregion
export { WorkspacePanelContent_default as default };

//# sourceMappingURL=WorkspacePanelContent-3167TJ6D.js.map