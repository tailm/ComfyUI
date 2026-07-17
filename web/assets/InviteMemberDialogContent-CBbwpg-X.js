import "./rolldown-runtime-w0pxe0c8.js";
import { tt as useToast } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, j as createBaseVNode, jt as ref, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as useTeamWorkspaceStore } from "./teamWorkspaceStore-CsZZpFU0.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useDialogStore } from "./dialogStore-B5tjby6O.js";
import { a as TagsInput_default, i as TagsInputInput_default, n as TagsInputItemDelete_default, r as TagsInputItem_default, t as TagsInputItemText_default } from "./TagsInputItemText-CszoEoLz.js";
//#region src/platform/workspace/components/dialogs/InviteMemberDialogContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex w-full max-w-lg flex-col rounded-2xl border border-border-default bg-base-background" };
var _hoisted_2 = { class: "flex h-12 items-center justify-between border-b border-border-default px-4" };
var _hoisted_3 = { class: "m-0 text-sm font-normal text-base-foreground" };
var _hoisted_4 = ["aria-label"];
var _hoisted_5 = { class: "flex flex-col gap-2 p-4" };
var _hoisted_6 = {
	key: 0,
	class: "text-danger m-0 text-xs"
};
var _hoisted_7 = { class: "flex items-center justify-end gap-4 p-4" };
var _hoisted_8 = { class: "p-4" };
var _hoisted_9 = { class: "m-0 text-sm/5 text-muted-foreground" };
var _hoisted_10 = { class: "flex items-center justify-end p-4" };
//#endregion
//#region src/platform/workspace/components/dialogs/InviteMemberDialogContent.vue
var InviteMemberDialogContent_default = /* @__PURE__ */ defineComponent({
	__name: "InviteMemberDialogContent",
	setup(__props) {
		const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const EMAIL_DELIMITER = /[,\s]+/;
		const dialogStore = useDialogStore();
		const toast = useToast();
		const { t } = useI18n();
		const workspaceStore = useTeamWorkspaceStore();
		const step = ref("form");
		const emails = ref([]);
		const invitedEmails = ref([]);
		const loading = ref(false);
		const invalidEmails = computed(() => emails.value.filter((email) => !EMAIL_REGEX.test(email)));
		const canSubmit = computed(() => emails.value.length > 0 && invalidEmails.value.length === 0);
		function trimEmail(value) {
			return value.trim();
		}
		function onEmailsUpdate(value) {
			emails.value = value.filter((email) => email.length > 0);
		}
		function onClose() {
			dialogStore.closeDialog({ key: "invite-member" });
		}
		async function onInvite() {
			if (!canSubmit.value || loading.value) return;
			loading.value = true;
			try {
				const submitted = [...emails.value];
				const results = await Promise.allSettled(submitted.map((email) => workspaceStore.createInvite(email)));
				const failedEmails = submitted.filter((_, index) => results[index].status === "rejected");
				if (failedEmails.length === 0) {
					invitedEmails.value = submitted;
					step.value = "invited";
					return;
				}
				emails.value = failedEmails;
				toast.add({
					severity: "error",
					summary: t("workspacePanel.inviteMemberDialog.failedCount", failedEmails.length)
				});
			} finally {
				loading.value = false;
			}
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("h2", _hoisted_3, toDisplayString(_ctx.$t("workspacePanel.inviteMemberDialog.title")), 1), createBaseVNode("button", {
				class: "focus-visible:ring-secondary-foreground cursor-pointer rounded-sm border-none bg-transparent p-0 text-muted-foreground transition-colors hover:text-base-foreground focus-visible:ring-1 focus-visible:outline-none",
				"aria-label": _ctx.$t("g.close"),
				onClick: onClose
			}, [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "pi pi-times size-4" }, null, -1)])], 8, _hoisted_4)]), step.value === "form" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("div", _hoisted_5, [createVNode(TagsInput_default, {
				"always-editing": "",
				"add-on-paste": "",
				"add-on-blur": "",
				delimiter: EMAIL_DELIMITER,
				"convert-value": trimEmail,
				"model-value": emails.value,
				class: "min-h-10 w-full bg-secondary-background",
				"onUpdate:modelValue": onEmailsUpdate
			}, {
				default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(emails.value, (email) => {
					return openBlock(), createBlock(TagsInputItem_default, {
						key: email,
						value: email,
						class: normalizeClass(unref(cn)("rounded-full", !EMAIL_REGEX.test(email) && "bg-danger/20 text-danger"))
					}, {
						default: withCtx(() => [createVNode(TagsInputItemText_default), createVNode(TagsInputItemDelete_default)]),
						_: 1
					}, 8, ["value", "class"]);
				}), 128)), createVNode(TagsInputInput_default, {
					"auto-focus": "",
					class: "text-sm",
					placeholder: emails.value.length === 0 ? _ctx.$t("workspacePanel.inviteMemberDialog.placeholder") : void 0
				}, null, 8, ["placeholder"])]),
				_: 1
			}, 8, ["model-value"]), invalidEmails.value.length > 0 ? (openBlock(), createElementBlock("p", _hoisted_6, toDisplayString(_ctx.$t("workspacePanel.inviteMemberDialog.invalidEmailCount", invalidEmails.value.length)), 1)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_7, [createVNode(Button_default, {
				variant: "muted-textonly",
				onClick: onClose
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.cancel")), 1)]),
				_: 1
			}), createVNode(Button_default, {
				variant: "secondary",
				size: "lg",
				loading: loading.value,
				disabled: !canSubmit.value,
				onClick: onInvite
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("workspacePanel.invite")), 1)]),
				_: 1
			}, 8, ["loading", "disabled"])])], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createBaseVNode("div", _hoisted_8, [createBaseVNode("p", _hoisted_9, toDisplayString(_ctx.$t("workspacePanel.inviteMemberDialog.invitedMessage", { emails: invitedEmails.value.join(", ") }, invitedEmails.value.length)), 1)]), createBaseVNode("div", _hoisted_10, [createVNode(Button_default, {
				variant: "secondary",
				size: "lg",
				onClick: onClose
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.close")), 1)]),
				_: 1
			})])], 64))]);
		};
	}
});
//#endregion
export { InviteMemberDialogContent_default as default };

//# sourceMappingURL=InviteMemberDialogContent-CBbwpg-X.js.map