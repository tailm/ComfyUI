import "./rolldown-runtime-w0pxe0c8.js";
import { tt as useToast } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Gt as toDisplayString, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, j as createBaseVNode, jt as ref, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as useTeamWorkspaceStore } from "./teamWorkspaceStore-CD0PAZYS.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as useDialogStore } from "./dialogStore-C0QSbgAQ.js";
//#region src/platform/workspace/components/dialogs/ChangeMemberRoleDialogContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex w-full max-w-90 flex-col rounded-2xl border border-border-default bg-base-background" };
var _hoisted_2 = { class: "flex h-12 items-center justify-between border-b border-border-default px-4" };
var _hoisted_3 = { class: "m-0 text-sm font-normal text-base-foreground" };
var _hoisted_4 = ["aria-label"];
var _hoisted_5 = { class: "p-4" };
var _hoisted_6 = { class: "m-0 text-sm text-muted-foreground" };
var _hoisted_7 = { class: "m-0 mt-1 list-disc ps-5 text-sm text-muted-foreground" };
var _hoisted_8 = {
	key: 1,
	class: "m-0 text-sm text-muted-foreground"
};
var _hoisted_9 = { class: "flex items-center justify-end gap-4 p-4" };
//#endregion
//#region src/platform/workspace/components/dialogs/ChangeMemberRoleDialogContent.vue
var ChangeMemberRoleDialogContent_default = /* @__PURE__ */ defineComponent({
	__name: "ChangeMemberRoleDialogContent",
	props: {
		memberId: {},
		memberName: {},
		targetRole: {}
	},
	setup(__props) {
		const dialogStore = useDialogStore();
		const workspaceStore = useTeamWorkspaceStore();
		const toast = useToast();
		const { t } = useI18n();
		const loading = ref(false);
		const isPromotion = computed(() => __props.targetRole === "owner");
		const promotePermissions = computed(() => [
			t("workspacePanel.changeRoleDialog.promotePermissionCredits"),
			t("workspacePanel.changeRoleDialog.promotePermissionManage"),
			t("workspacePanel.changeRoleDialog.promotePermissionRoles")
		]);
		function onCancel() {
			dialogStore.closeDialog({ key: "change-member-role" });
		}
		async function onConfirm() {
			loading.value = true;
			try {
				await workspaceStore.changeMemberRole(__props.memberId, __props.targetRole);
				toast.add({
					severity: "success",
					summary: t("workspacePanel.changeRoleDialog.success"),
					life: 2e3
				});
				dialogStore.closeDialog({ key: "change-member-role" });
			} catch {
				toast.add({
					severity: "error",
					summary: t("workspacePanel.changeRoleDialog.error")
				});
			} finally {
				loading.value = false;
			}
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("h2", _hoisted_3, toDisplayString(isPromotion.value ? _ctx.$t("workspacePanel.changeRoleDialog.promoteTitle", { name: __props.memberName }) : _ctx.$t("workspacePanel.changeRoleDialog.demoteTitle", { name: __props.memberName })), 1), createBaseVNode("button", {
					class: "focus-visible:ring-secondary-foreground -m-1 cursor-pointer rounded-sm border-none bg-transparent p-1 text-muted-foreground transition-colors hover:text-base-foreground focus-visible:ring-1 focus-visible:outline-none",
					"aria-label": _ctx.$t("g.close"),
					onClick: onCancel
				}, [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-times size-4" }, null, -1)])], 8, _hoisted_4)]),
				createBaseVNode("div", _hoisted_5, [isPromotion.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("p", _hoisted_6, toDisplayString(_ctx.$t("workspacePanel.changeRoleDialog.promoteIntro")), 1), createBaseVNode("ul", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(promotePermissions.value, (permission) => {
					return openBlock(), createElementBlock("li", { key: permission }, toDisplayString(permission), 1);
				}), 128))])], 64)) : (openBlock(), createElementBlock("p", _hoisted_8, toDisplayString(_ctx.$t("workspacePanel.changeRoleDialog.demoteMessage")), 1))]),
				createBaseVNode("div", _hoisted_9, [createVNode(Button_default, {
					variant: "muted-textonly",
					onClick: onCancel
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.cancel")), 1)]),
					_: 1
				}), createVNode(Button_default, {
					variant: "secondary",
					size: "lg",
					loading: loading.value,
					onClick: onConfirm
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(isPromotion.value ? _ctx.$t("workspacePanel.changeRoleDialog.promoteConfirm") : _ctx.$t("workspacePanel.changeRoleDialog.demoteConfirm")), 1)]),
					_: 1
				}, 8, ["loading"])])
			]);
		};
	}
});
//#endregion
export { ChangeMemberRoleDialogContent_default as default };

//# sourceMappingURL=ChangeMemberRoleDialogContent-CccK-PTO.js.map