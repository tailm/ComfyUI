import "./rolldown-runtime-w0pxe0c8.js";
import { it as useToast } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, it as openBlock, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Bi as useTeamWorkspaceStore } from "./promotionUtils-vKoNYnM9.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as useDialogStore } from "./dialogStore-DD1yBh6P.js";
//#region src/platform/workspace/components/dialogs/DeleteWorkspaceDialogContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex w-full max-w-[360px] flex-col rounded-2xl border border-border-default bg-base-background" };
var _hoisted_2 = { class: "flex h-12 items-center justify-between border-b border-border-default px-4" };
var _hoisted_3 = { class: "m-0 text-sm font-normal text-base-foreground" };
var _hoisted_4 = ["aria-label"];
var _hoisted_5 = { class: "p-4" };
var _hoisted_6 = { class: "m-0 text-sm text-muted-foreground" };
var _hoisted_7 = { class: "flex items-center justify-end gap-4 p-4" };
//#endregion
//#region src/platform/workspace/components/dialogs/DeleteWorkspaceDialogContent.vue
var DeleteWorkspaceDialogContent_default = /* @__PURE__ */ defineComponent({
	__name: "DeleteWorkspaceDialogContent",
	props: {
		workspaceId: {},
		workspaceName: {}
	},
	setup(__props) {
		const { t } = useI18n();
		const toast = useToast();
		const dialogStore = useDialogStore();
		const workspaceStore = useTeamWorkspaceStore();
		const loading = ref(false);
		function onCancel() {
			dialogStore.closeDialog({ key: "delete-workspace" });
		}
		async function onDelete() {
			loading.value = true;
			try {
				await workspaceStore.deleteWorkspace(__props.workspaceId);
				dialogStore.closeDialog({ key: "delete-workspace" });
				window.location.reload();
			} catch (error) {
				console.error("[DeleteWorkspaceDialog] Failed to delete workspace:", error);
				toast.add({
					severity: "error",
					summary: t("workspacePanel.toast.failedToDeleteWorkspace"),
					detail: error instanceof Error ? error.message : t("g.unknownError")
				});
			} finally {
				loading.value = false;
			}
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("workspacePanel.deleteDialog.title")), 1), createBaseVNode("button", {
					class: "focus-visible:ring-secondary-foreground cursor-pointer rounded-sm border-none bg-transparent p-0 text-muted-foreground transition-colors hover:text-base-foreground focus-visible:ring-1 focus-visible:outline-none",
					"aria-label": _ctx.$t("g.close"),
					onClick: onCancel
				}, [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-times size-4" }, null, -1)])], 8, _hoisted_4)]),
				createBaseVNode("div", _hoisted_5, [createBaseVNode("p", _hoisted_6, toDisplayString(__props.workspaceName ? _ctx.$t("workspacePanel.deleteDialog.messageWithName", { name: __props.workspaceName }) : _ctx.$t("workspacePanel.deleteDialog.message")), 1)]),
				createBaseVNode("div", _hoisted_7, [createVNode(Button_default, {
					variant: "muted-textonly",
					onClick: onCancel
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.cancel")), 1)]),
					_: 1
				}), createVNode(Button_default, {
					variant: "destructive",
					size: "lg",
					loading: loading.value,
					onClick: onDelete
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.delete")), 1)]),
					_: 1
				}, 8, ["loading"])])
			]);
		};
	}
});
//#endregion
export { DeleteWorkspaceDialogContent_default as default };

//# sourceMappingURL=DeleteWorkspaceDialogContent-D9ZUoUHZ.js.map