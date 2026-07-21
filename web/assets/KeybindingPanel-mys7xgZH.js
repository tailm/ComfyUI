import "./rolldown-runtime-w0pxe0c8.js";
import { C as script$2, W as script, rt as FilterMatchMode, tt as useToast, x as script$1 } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, C as withModifiers, D as Teleport, Ft as toRaw, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, Wt as normalizeStyle, at as renderList, bt as withCtx, ct as resolveDirective, et as onMounted, gt as watch, j as createBaseVNode, jt as ref, kt as reactive, rt as openBlock, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Di as useErrorHandling, Hi as SearchInput_default, U as uploadFile, _i as KeybindingImpl, dt as DropdownMenu_default, ea as useSettingStore, gi as useKeybindingStore, hi as useCommandStore, pi as useDialogService, si as usePrimeVueOverlayChildStyle, vi as KeyComboImpl } from "./promotionUtils-B4DSH7RT.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { s as t } from "./i18n-Ck8-Gum6.js";
import { F as zKeybindingPreset, r as api } from "./api-Bz5NhLSR.js";
import { t as fromZodError } from "./vendor-zod-BwmrqdWK.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import { E as normalizeI18nKey } from "./formatUtil-NyC-AHAf.js";
import { t as downloadBlob } from "./downloadUtil-DgK0pUDU.js";
import { $ as ContextMenuSeparator_default, Q as ContextMenuTrigger_default, et as ContextMenuPortal_default, nt as ContextMenuContent_default, rt as ContextMenuRoot_default, tt as ContextMenuItem_default } from "./vendor-reka-ui-BL45aHvm.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useDialogStore } from "./dialogStore-B5tjby6O.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BKp_-DiS.js";
import { a as Select_default, i as SelectContent_default, n as SelectTrigger_default, r as SelectItem_default, t as SelectValue_default } from "./SelectValue-CrSaS-Kt.js";
import { m as showConfirmDialog } from "./DialogHeader-D4JcQCFk.js";
import { t as useKeybindingService } from "./keybindingService-B8iKHpLQ.js";
//#region src/components/dialog/content/setting/keybinding/EditKeybindingContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$8 = { class: "flex w-96 flex-col border-t border-border-default px-4" };
var _hoisted_2$6 = { class: "mb-4 text-sm text-muted-foreground" };
var _hoisted_3$4 = { class: "mb-4 text-sm text-base-foreground" };
var _hoisted_4$3 = [
	"value",
	"placeholder",
	"aria-label"
];
var _hoisted_5$2 = { class: "min-h-12" };
var _hoisted_6$2 = {
	key: 0,
	class: "m-0 text-sm text-destructive-background"
};
var _hoisted_7$1 = {
	key: 1,
	class: "m-0 text-sm text-destructive-background"
};
//#endregion
//#region src/components/dialog/content/setting/keybinding/EditKeybindingContent.vue
var EditKeybindingContent_default = /* @__PURE__ */ defineComponent({
	__name: "EditKeybindingContent",
	props: {
		dialogState: {},
		commandLabel: {},
		onUpdateCombo: { type: Function },
		existingKeybindingOnCombo: {}
	},
	setup(__props) {
		function captureKeybinding(event) {
			if (!event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
				if (event.key === "Escape") return;
			}
			__props.onUpdateCombo(KeyComboImpl.fromEvent(event));
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$8, [
				createBaseVNode("p", _hoisted_2$6, toDisplayString(_ctx.$t("g.setAKeybindingForTheFollowing")), 1),
				createBaseVNode("div", _hoisted_3$4, toDisplayString(__props.commandLabel), 1),
				createBaseVNode("input", {
					class: "text-foreground mb-4 w-full rounded-sm border border-border-default bg-secondary-background px-3 py-2 text-center shadow-none focus:outline-none",
					value: __props.dialogState.newCombo?.toString() ?? "",
					placeholder: _ctx.$t("g.enterYourKeybind"),
					"aria-label": _ctx.$t("g.enterYourKeybind"),
					autocomplete: "off",
					autofocus: "",
					onKeydown: withModifiers(captureKeybinding, ["stop", "prevent"])
				}, null, 40, _hoisted_4$3),
				createBaseVNode("div", _hoisted_5$2, [__props.dialogState.newCombo?.isBrowserReserved ? (openBlock(), createElementBlock("p", _hoisted_6$2, toDisplayString(_ctx.$t("g.browserReservedKeybinding")), 1)) : __props.existingKeybindingOnCombo ? (openBlock(), createElementBlock("p", _hoisted_7$1, toDisplayString(_ctx.$t("g.keybindingAlreadyExists")) + " " + toDisplayString(__props.existingKeybindingOnCombo.commandId), 1)) : createCommentVNode("", true)])
			]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/setting/keybinding/EditKeybindingFooter.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$7 = { class: "flex w-full justify-end gap-2 px-4 py-2" };
//#endregion
//#region src/components/dialog/content/setting/keybinding/EditKeybindingFooter.vue
var EditKeybindingFooter_default = /* @__PURE__ */ defineComponent({
	__name: "EditKeybindingFooter",
	props: {
		dialogState: {},
		existingKeybindingOnCombo: {}
	},
	setup(__props) {
		const keybindingStore = useKeybindingStore();
		const keybindingService = useKeybindingService();
		const dialogStore = useDialogStore();
		function handleCancel() {
			dialogStore.closeDialog({ key: DIALOG_KEY });
		}
		async function handleSave() {
			const combo = __props.dialogState.newCombo;
			const commandId = __props.dialogState.commandId;
			if (!combo || !commandId) return;
			dialogStore.closeDialog({ key: DIALOG_KEY });
			if (__props.dialogState.mode === "add") keybindingStore.addUserKeybinding(new KeybindingImpl({
				commandId,
				combo
			}));
			else if (__props.dialogState.existingBinding) keybindingStore.updateSpecificKeybinding(__props.dialogState.existingBinding, new KeybindingImpl({
				commandId,
				combo
			}));
			else keybindingStore.updateKeybindingOnCommand(new KeybindingImpl({
				commandId,
				combo
			}));
			await keybindingService.persistUserKeybindings();
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$7, [createVNode(Button_default, {
				variant: "textonly",
				size: "md",
				class: "text-muted-foreground",
				onClick: handleCancel
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.cancel")), 1)]),
				_: 1
			}), createVNode(Button_default, {
				variant: __props.existingKeybindingOnCombo ? "destructive" : __props.dialogState.newCombo?.isBrowserReserved ? "secondary" : "primary",
				size: "md",
				disabled: !__props.dialogState.newCombo,
				class: "px-4 py-2",
				onClick: handleSave
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(__props.existingKeybindingOnCombo ? _ctx.$t("g.overwrite") : __props.dialogState.newCombo?.isBrowserReserved ? _ctx.$t("g.saveAnyway") : _ctx.$t("g.save")), 1)]),
				_: 1
			}, 8, ["variant", "disabled"])]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/setting/keybinding/EditKeybindingHeader.vue
var _sfc_main = {};
var _hoisted_1$6 = { class: "flex w-full items-center gap-2 p-4" };
var _hoisted_2$5 = { class: "m-0 font-semibold" };
function _sfc_render(_ctx, _cache) {
	return openBlock(), createElementBlock("div", _hoisted_1$6, [createBaseVNode("p", _hoisted_2$5, toDisplayString(_ctx.$t("g.modifyKeybinding")), 1)]);
}
var EditKeybindingHeader_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main, [["render", _sfc_render]]);
//#endregion
//#region src/composables/useEditKeybindingDialog.ts
var DIALOG_KEY = "edit-keybinding";
function useEditKeybindingDialog() {
	const { showSmallLayoutDialog } = useDialogService();
	const keybindingStore = useKeybindingStore();
	function show(options) {
		const dialogState = reactive({
			commandId: options.commandId,
			newCombo: options.currentCombo,
			currentCombo: options.currentCombo,
			mode: options.mode ?? "edit",
			existingBinding: options.existingBinding ?? null
		});
		const existingKeybindingOnCombo = computed(() => {
			if (!dialogState.newCombo) return null;
			if (dialogState.currentCombo?.equals(dialogState.newCombo)) return null;
			return keybindingStore.getKeybinding(dialogState.newCombo);
		});
		function onUpdateCombo(combo) {
			dialogState.newCombo = combo;
		}
		showSmallLayoutDialog({
			key: DIALOG_KEY,
			headerComponent: EditKeybindingHeader_default,
			footerComponent: EditKeybindingFooter_default,
			component: EditKeybindingContent_default,
			props: {
				dialogState,
				onUpdateCombo,
				commandLabel: options.commandLabel,
				existingKeybindingOnCombo
			},
			headerProps: {},
			footerProps: {
				dialogState,
				existingKeybindingOnCombo
			}
		});
	}
	return { show };
}
//#endregion
//#region src/components/dialog/content/setting/keybinding/UnsavedChangesContent.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$5 = { class: "flex w-full max-w-[420px] flex-col border-t border-border-default" };
var _hoisted_2$4 = { class: "flex flex-col gap-4 p-4" };
var _hoisted_3$3 = { class: "m-0 text-sm text-muted-foreground" };
var _hoisted_4$2 = { class: "flex justify-end gap-2" };
//#endregion
//#region src/components/dialog/content/setting/keybinding/UnsavedChangesContent.vue
var UnsavedChangesContent_default = /* @__PURE__ */ defineComponent({
	__name: "UnsavedChangesContent",
	props: { onResult: { type: Function } },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$5, [createBaseVNode("div", _hoisted_2$4, [createBaseVNode("p", _hoisted_3$3, toDisplayString(_ctx.$t("g.keybindingPresets.unsavedChangesMessage")), 1), createBaseVNode("div", _hoisted_4$2, [
				createVNode(Button_default, {
					variant: "textonly",
					class: "text-muted-foreground",
					onClick: _cache[0] || (_cache[0] = ($event) => __props.onResult(null))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.cancel")), 1)]),
					_: 1
				}),
				createVNode(Button_default, {
					variant: "secondary",
					class: "bg-secondary-background",
					onClick: _cache[1] || (_cache[1] = ($event) => __props.onResult(false))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.keybindingPresets.discardAndSwitch")), 1)]),
					_: 1
				}),
				createVNode(Button_default, {
					variant: "secondary",
					class: "bg-base-foreground text-base-background",
					onClick: _cache[2] || (_cache[2] = ($event) => __props.onResult(true))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.keybindingPresets.saveAndSwitch")), 1)]),
					_: 1
				})
			])])]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/setting/keybinding/UnsavedChangesHeader.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$4 = { class: "flex w-full items-center p-4" };
var _hoisted_2$3 = { class: "m-0 text-sm font-medium" };
//#endregion
//#region src/components/dialog/content/setting/keybinding/UnsavedChangesHeader.vue
var UnsavedChangesHeader_default = /* @__PURE__ */ defineComponent({
	__name: "UnsavedChangesHeader",
	props: { presetName: {} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$4, [createBaseVNode("p", _hoisted_2$3, toDisplayString(_ctx.$t("g.keybindingPresets.unsavedChangesTo", { name: __props.presetName })), 1)]);
		};
	}
});
//#endregion
//#region src/platform/keybindings/presetService.ts
var PRESETS_DIR = "keybindings";
function presetFilePath(name) {
	const trimmed = name.trim();
	if (!trimmed || trimmed === "default" || trimmed.toLowerCase().endsWith(".json") || trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("..") || trimmed.startsWith(".")) throw new Error(t("g.keybindingPresets.invalidPresetName"));
	return `${PRESETS_DIR}/${trimmed}.json`;
}
function buildPresetFromStore(name, keybindingStore) {
	return {
		name,
		newBindings: Object.values(toRaw(keybindingStore.getUserKeybindings())),
		unsetBindings: Object.values(toRaw(keybindingStore.getUserUnsetKeybindings()))
	};
}
function useKeybindingPresetService() {
	const keybindingStore = useKeybindingStore();
	const keybindingService = useKeybindingService();
	const settingStore = useSettingStore();
	const dialogService = useDialogService();
	const dialogStore = useDialogStore();
	const toast = useToastStore();
	const { wrapWithErrorHandlingAsync } = useErrorHandling();
	async function switchToDefaultPreset({ resetBindings = true } = {}) {
		if (resetBindings) keybindingStore.resetAllKeybindings();
		keybindingStore.currentPresetName = "default";
		keybindingStore.savedPresetData = null;
		await keybindingService.persistUserKeybindings();
		await settingStore.set("Comfy.Keybinding.CurrentPreset", "default");
	}
	const UNSAVED_DIALOG_KEY = "unsaved-keybinding-changes";
	function showUnsavedChangesDialog(presetName) {
		return new Promise((resolve) => {
			dialogService.showSmallLayoutDialog({
				key: UNSAVED_DIALOG_KEY,
				headerComponent: UnsavedChangesHeader_default,
				headerProps: { presetName },
				component: UnsavedChangesContent_default,
				props: { onResult: (result) => {
					resolve(result);
					dialogStore.closeDialog({ key: UNSAVED_DIALOG_KEY });
				} },
				dialogComponentProps: { onClose: () => resolve(null) }
			});
		});
	}
	async function listPresets() {
		return (await api.listUserDataFullInfo(PRESETS_DIR)).map((f) => f.path.replace(/\.json$/, "")).filter((name) => name.length > 0);
	}
	async function loadPreset(name) {
		const resp = await api.getUserData(presetFilePath(name));
		if (!resp.ok) throw new Error(t("g.keybindingPresets.loadPresetFailed", { name }));
		const data = await resp.json();
		const result = zKeybindingPreset.safeParse(data);
		if (!result.success) throw new Error(t("g.keybindingPresets.invalidPresetFile") + ": " + fromZodError(result.error).message);
		return {
			...result.data,
			name
		};
	}
	function applyPreset(preset) {
		keybindingStore.resetAllKeybindings();
		for (const binding of preset.unsetBindings) keybindingStore.unsetKeybinding(new KeybindingImpl(binding));
		for (const binding of preset.newBindings) keybindingStore.addUserKeybinding(new KeybindingImpl(binding));
		keybindingStore.savedPresetData = buildPresetFromStore(preset.name, keybindingStore);
		keybindingStore.currentPresetName = preset.name;
	}
	async function savePreset(name) {
		const preset = buildPresetFromStore(name, keybindingStore);
		await api.storeUserData(presetFilePath(name), JSON.stringify(preset), {
			overwrite: true,
			stringify: false
		});
		keybindingStore.savedPresetData = preset;
		keybindingStore.currentPresetName = name;
		await keybindingService.persistUserKeybindings();
		await settingStore.set("Comfy.Keybinding.CurrentPreset", name);
		toast.add({
			severity: "success",
			summary: t("g.keybindingPresets.presetSaved", { name }),
			life: 3e3
		});
	}
	async function deletePreset(name) {
		if (!await dialogService.confirm({
			title: t("g.keybindingPresets.deletePresetTitle"),
			message: t("g.keybindingPresets.deletePresetWarning"),
			type: "delete"
		})) return;
		if (!(await api.deleteUserData(presetFilePath(name))).ok) throw new Error(t("g.keybindingPresets.deletePresetFailed", { name }));
		if (keybindingStore.currentPresetName === name) await switchToDefaultPreset();
		toast.add({
			severity: "info",
			summary: t("g.keybindingPresets.presetDeleted", { name }),
			life: 3e3
		});
	}
	function exportPreset() {
		const preset = buildPresetFromStore(keybindingStore.currentPresetName, keybindingStore);
		downloadBlob(`${preset.name}.json`, new Blob([JSON.stringify(preset, null, 2)], { type: "application/json" }));
	}
	async function importPreset() {
		const text = await (await uploadFile("application/json")).text();
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			throw new Error(t("g.keybindingPresets.invalidPresetFile"));
		}
		const result = zKeybindingPreset.safeParse(data);
		if (!result.success) throw new Error(t("g.keybindingPresets.invalidPresetFile") + ": " + fromZodError(result.error).message);
		const preset = result.data;
		await api.storeUserData(presetFilePath(preset.name), JSON.stringify(preset), {
			overwrite: true,
			stringify: false
		});
		await switchPreset(preset.name);
		toast.add({
			severity: "success",
			summary: t("g.keybindingPresets.presetImported"),
			life: 3e3
		});
	}
	async function promptAndSaveNewPreset() {
		const name = await dialogService.prompt({
			title: t("g.keybindingPresets.saveAsNewPreset"),
			message: t("g.keybindingPresets.presetNamePrompt"),
			defaultValue: ""
		});
		if (!name) return false;
		const trimmedName = name.trim();
		if (!trimmedName) return false;
		if ((await listPresets()).includes(trimmedName)) {
			if (!await dialogService.confirm({
				title: t("g.keybindingPresets.overwritePresetTitle"),
				message: t("g.keybindingPresets.overwritePresetMessage", { name: trimmedName }),
				type: "overwrite"
			})) return false;
		}
		await savePreset(trimmedName);
		return true;
	}
	async function switchPreset(targetName) {
		if (keybindingStore.isCurrentPresetModified) {
			const result = await showUnsavedChangesDialog(keybindingStore.currentPresetName === "default" ? t("g.keybindingPresets.default") : keybindingStore.currentPresetName);
			if (result === null) return;
			if (result) {
				if (keybindingStore.currentPresetName !== "default") await savePreset(keybindingStore.currentPresetName);
				else if (!await promptAndSaveNewPreset()) return;
			}
		}
		if (targetName === "default") {
			await switchToDefaultPreset();
			return;
		}
		applyPreset(await loadPreset(targetName));
		await keybindingService.persistUserKeybindings();
		await settingStore.set("Comfy.Keybinding.CurrentPreset", targetName);
	}
	return {
		listPresets: wrapWithErrorHandlingAsync(listPresets),
		loadPreset: wrapWithErrorHandlingAsync(loadPreset),
		savePreset: wrapWithErrorHandlingAsync(savePreset),
		deletePreset: wrapWithErrorHandlingAsync(deletePreset),
		exportPreset,
		importPreset: wrapWithErrorHandlingAsync(importPreset),
		switchPreset: wrapWithErrorHandlingAsync(switchPreset),
		switchToDefaultPreset: wrapWithErrorHandlingAsync(switchToDefaultPreset),
		promptAndSaveNewPreset: wrapWithErrorHandlingAsync(promptAndSaveNewPreset),
		applyPreset
	};
}
//#endregion
//#region src/components/dialog/content/setting/keybinding/KeyComboDisplay.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "flex flex-row gap-0.5" };
//#endregion
//#region src/components/dialog/content/setting/keybinding/KeyComboDisplay.vue
var KeyComboDisplay_default = /* @__PURE__ */ defineComponent({
	__name: "KeyComboDisplay",
	props: {
		keyCombo: {},
		isModified: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const keySequences = computed(() => __props.keyCombo.getKeySequences());
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("span", _hoisted_1$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(keySequences.value, (sequence, index) => {
				return openBlock(), createBlock(unref(script), {
					key: index,
					class: "min-w-6 justify-center gap-1 bg-interface-menu-keybind-surface-default text-center font-normal text-base-foreground capitalize",
					severity: __props.isModified ? "info" : "secondary"
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(sequence), 1)]),
					_: 2
				}, 1032, ["severity"]);
			}), 128))]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/setting/keybinding/KeybindingList.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = {
	key: 0,
	class: "@container/keybindings flex w-full min-w-0 items-center gap-1 overflow-hidden",
	"data-testid": "keybinding-list"
};
var _hoisted_2$2 = {
	key: 1,
	class: "hidden rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground @[16rem]/keybindings:inline",
	"data-testid": "keybinding-list-more-wide"
};
var _hoisted_3$2 = {
	key: 2,
	class: "hidden rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground @[12rem]/keybindings:inline @[16rem]/keybindings:hidden",
	"data-testid": "keybinding-list-more-medium"
};
var _hoisted_4$1 = {
	key: 3,
	class: "hidden rounded-sm px-1.5 py-0.5 text-xs text-muted-foreground @[8rem]/keybindings:inline @[12rem]/keybindings:hidden",
	"data-testid": "keybinding-list-more-compact"
};
var _hoisted_5$1 = {
	class: "sr-only",
	"data-testid": "keybinding-list-aria"
};
var _hoisted_6$1 = { key: 1 };
//#endregion
//#region src/components/dialog/content/setting/keybinding/KeybindingList.vue
var KeybindingList_default = /* @__PURE__ */ defineComponent({
	__name: "KeybindingList",
	props: {
		keybindings: {},
		isModified: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const { t } = useI18n();
		const ariaLabel = computed(() => {
			if (__props.keybindings.length === 0) return "";
			return t("g.keybindingListAriaLabel", { combos: __props.keybindings.map((binding) => binding.combo.toString()).join(", ") });
		});
		return (_ctx, _cache) => {
			return __props.keybindings.length > 0 ? (openBlock(), createElementBlock("span", _hoisted_1$2, [
				createVNode(KeyComboDisplay_default, {
					"key-combo": __props.keybindings[0].combo,
					"is-modified": __props.isModified
				}, null, 8, ["key-combo", "is-modified"]),
				__props.keybindings.length >= 2 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [_cache[0] || (_cache[0] = createBaseVNode("span", {
					class: "hidden text-muted-foreground @[16rem]/keybindings:inline",
					"aria-hidden": "true"
				}, " , ", -1)), createVNode(KeyComboDisplay_default, {
					class: "hidden @[16rem]/keybindings:inline-flex",
					"key-combo": __props.keybindings[1].combo,
					"is-modified": __props.isModified
				}, null, 8, ["key-combo", "is-modified"])], 64)) : createCommentVNode("", true),
				__props.keybindings.length > 2 ? (openBlock(), createElementBlock("span", _hoisted_2$2, toDisplayString(_ctx.$t("g.nMoreKeybindings", { count: __props.keybindings.length - 2 })), 1)) : createCommentVNode("", true),
				__props.keybindings.length >= 2 ? (openBlock(), createElementBlock("span", _hoisted_3$2, toDisplayString(_ctx.$t("g.nMoreKeybindings", { count: __props.keybindings.length - 1 })), 1)) : createCommentVNode("", true),
				__props.keybindings.length >= 2 ? (openBlock(), createElementBlock("span", _hoisted_4$1, toDisplayString(_ctx.$t("g.nMoreKeybindingsCompact", { count: __props.keybindings.length - 1 })), 1)) : createCommentVNode("", true),
				createBaseVNode("span", _hoisted_5$1, toDisplayString(ariaLabel.value), 1)
			])) : (openBlock(), createElementBlock("span", _hoisted_6$1, "-"));
		};
	}
});
//#endregion
//#region src/components/dialog/content/setting/keybinding/KeybindingPresetToolbar.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex items-center gap-2" };
var _hoisted_2$1 = { class: "max-w-60" };
var _hoisted_3$1 = { class: "truncate" };
//#endregion
//#region src/components/dialog/content/setting/keybinding/KeybindingPresetToolbar.vue
var KeybindingPresetToolbar_default = /* @__PURE__ */ defineComponent({
	__name: "KeybindingPresetToolbar",
	props: {
		presetNames: {},
		contentStyle: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	emits: ["presets-changed"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t } = useI18n();
		const keybindingStore = useKeybindingStore();
		const presetService = useKeybindingPresetService();
		const selectedPreset = ref(keybindingStore.currentPresetName);
		const displayLabel = computed(() => {
			const name = selectedPreset.value === "default" ? t("g.keybindingPresets.default") : selectedPreset.value;
			return keybindingStore.isCurrentPresetModified ? `${name} *` : name;
		});
		watch(selectedPreset, async (newValue) => {
			if (newValue !== keybindingStore.currentPresetName) {
				await presetService.switchPreset(newValue);
				selectedPreset.value = keybindingStore.currentPresetName;
				emit("presets-changed");
			}
		});
		watch(() => keybindingStore.currentPresetName, (name) => {
			selectedPreset.value = name;
		});
		const showSaveButton = computed(() => keybindingStore.currentPresetName !== "default" && keybindingStore.isCurrentPresetModified);
		async function handleSavePreset() {
			await presetService.savePreset(keybindingStore.currentPresetName);
		}
		async function handleImportFromDropdown() {
			await presetService.importPreset();
			emit("presets-changed");
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [showSaveButton.value ? (openBlock(), createBlock(Button_default, {
				key: 0,
				size: "lg",
				onClick: handleSavePreset
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.keybindingPresets.saveChanges")), 1)]),
				_: 1
			})) : createCommentVNode("", true), createVNode(Select_default, {
				modelValue: selectedPreset.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedPreset.value = $event)
			}, {
				default: withCtx(() => [createVNode(SelectTrigger_default, { class: "w-64" }, {
					default: withCtx(() => [createVNode(SelectValue_default, { placeholder: _ctx.$t("g.keybindingPresets.default") }, {
						default: withCtx(() => [createTextVNode(toDisplayString(displayLabel.value), 1)]),
						_: 1
					}, 8, ["placeholder"])]),
					_: 1
				}), createVNode(SelectContent_default, {
					style: normalizeStyle(__props.contentStyle),
					class: "max-w-64 min-w-0 **:[[role=listbox]]:gap-1"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_2$1, [
						createVNode(SelectItem_default, {
							value: "default",
							class: "max-w-60 p-2 data-[state=checked]:bg-transparent"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.keybindingPresets.default")), 1)]),
							_: 1
						}),
						(openBlock(true), createElementBlock(Fragment, null, renderList(__props.presetNames, (name) => {
							return openBlock(), createBlock(SelectItem_default, {
								key: name,
								value: name,
								class: "max-w-60 p-2 data-[state=checked]:bg-transparent"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(name), 1)]),
								_: 2
							}, 1032, ["value"]);
						}), 128)),
						_cache[2] || (_cache[2] = createBaseVNode("hr", { class: "h-px max-w-60 border border-border-default" }, null, -1)),
						createBaseVNode("button", {
							class: "relative flex w-full max-w-60 cursor-pointer items-center justify-between gap-3 rounded-sm border-none bg-transparent p-2 text-sm outline-none select-none hover:bg-secondary-background-hover focus:bg-secondary-background-hover",
							onClick: withModifiers(handleImportFromDropdown, ["stop"])
						}, [createBaseVNode("span", _hoisted_3$1, toDisplayString(_ctx.$t("g.keybindingPresets.importKeybindingPreset")), 1), _cache[1] || (_cache[1] = createBaseVNode("i", {
							class: "icon-[lucide--file-input] shrink-0 text-base-foreground",
							"aria-hidden": "true"
						}, null, -1))])
					])]),
					_: 1
				}, 8, ["style"])]),
				_: 1
			}, 8, ["modelValue"])]);
		};
	}
});
//#endregion
//#region src/components/dialog/content/setting/KeybindingPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex items-center gap-2" };
var _hoisted_2 = ["title"];
var _hoisted_3 = {
	key: 1,
	class: "icon-[lucide--triangle-alert] shrink-0 text-warning-background"
};
var _hoisted_4 = ["title"];
var _hoisted_5 = { class: "actions flex flex-row justify-end whitespace-nowrap" };
var _hoisted_6 = {
	class: "pl-4",
	"data-testid": "keybinding-expansion-content"
};
var _hoisted_7 = { class: "flex items-center gap-4" };
var _hoisted_8 = { class: "text-muted-foreground" };
var _hoisted_9 = { class: "flex flex-row" };
//#endregion
//#region src/components/dialog/content/setting/KeybindingPanel.vue
var KeybindingPanel_default = /* @__PURE__ */ defineComponent({
	__name: "KeybindingPanel",
	setup(__props) {
		const filters = ref({ global: {
			value: "",
			matchMode: FilterMatchMode.CONTAINS
		} });
		const keybindingStore = useKeybindingStore();
		const keybindingService = useKeybindingService();
		const presetService = useKeybindingPresetService();
		const settingStore = useSettingStore();
		const commandStore = useCommandStore();
		const dialogStore = useDialogStore();
		const { t } = useI18n();
		const primeVueOverlay = usePrimeVueOverlayChildStyle();
		const keybindingOverlayContentStyle = primeVueOverlay.contentStyle;
		const presetNames = ref([]);
		async function refreshPresetList() {
			presetNames.value = await presetService.listPresets() ?? [];
		}
		async function initPresets() {
			await refreshPresetList();
			const currentName = settingStore.get("Comfy.Keybinding.CurrentPreset");
			if (currentName !== "default") {
				const preset = await presetService.loadPreset(currentName);
				if (preset) {
					keybindingStore.savedPresetData = preset;
					keybindingStore.currentPresetName = currentName;
				} else await presetService.switchToDefaultPreset();
			}
		}
		onMounted(() => initPresets());
		async function saveAsNewPreset() {
			await presetService.promptAndSaveNewPreset();
			refreshPresetList();
		}
		async function handleDeletePreset() {
			await presetService.deletePreset(keybindingStore.currentPresetName);
			refreshPresetList();
		}
		async function handleImportPreset() {
			await presetService.importPreset();
			refreshPresetList();
		}
		const showSaveAsNew = computed(() => keybindingStore.currentPresetName !== "default" || keybindingStore.isCurrentPresetModified);
		const menuEntries = computed(() => [
			...showSaveAsNew.value ? [{
				label: t("g.keybindingPresets.saveAsNewPreset"),
				icon: "icon-[lucide--save]",
				command: saveAsNewPreset
			}] : [],
			{
				label: t("g.keybindingPresets.resetToDefault"),
				icon: "icon-[lucide--rotate-cw]",
				command: () => presetService.switchPreset("default").then(() => refreshPresetList())
			},
			{
				label: t("g.keybindingPresets.deletePreset"),
				icon: "icon-[lucide--trash-2]",
				disabled: keybindingStore.currentPresetName === "default",
				command: handleDeletePreset
			},
			{
				label: t("g.keybindingPresets.importPreset"),
				icon: "icon-[lucide--file-input]",
				command: handleImportPreset
			},
			{
				label: t("g.keybindingPresets.exportPreset"),
				icon: "icon-[lucide--file-output]",
				command: () => presetService.exportPreset()
			}
		]);
		const commandsData = computed(() => {
			return Object.values(commandStore.commands).map((command) => ({
				id: command.id,
				label: t(`commands.${normalizeI18nKey(command.id)}.label`, command.label ?? ""),
				keybindings: keybindingStore.getKeybindingsByCommandId(command.id),
				source: command.source,
				isModified: keybindingStore.isCommandKeybindingModified(command.id)
			}));
		});
		const expandedCommandIds = ref(/* @__PURE__ */ new Set());
		const expandedRows = computed({
			get() {
				const result = {};
				for (const id of expandedCommandIds.value) result[id] = true;
				return result;
			},
			set(value) {
				expandedCommandIds.value = new Set(Object.keys(value));
			}
		});
		function toggleExpanded(commandId) {
			if (expandedCommandIds.value.has(commandId)) expandedCommandIds.value.delete(commandId);
			else expandedCommandIds.value.add(commandId);
		}
		watch(filters, () => expandedCommandIds.value.clear(), { deep: true });
		const selectedCommandData = ref(null);
		const editKeybindingDialog = useEditKeybindingDialog();
		const contextMenuTarget = ref(null);
		function editKeybinding(commandData, binding) {
			editKeybindingDialog.show({
				commandId: commandData.id,
				commandLabel: commandData.label,
				currentCombo: binding.combo,
				mode: "edit",
				existingBinding: binding
			});
		}
		function addKeybinding(commandData) {
			editKeybindingDialog.show({
				commandId: commandData.id,
				commandLabel: commandData.label,
				currentCombo: null,
				mode: "add"
			});
		}
		function handleRowClick(event) {
			if (event.originalEvent.target.closest(".actions")) return;
			const commandData = event.data;
			if (commandData.keybindings.length >= 2 || expandedCommandIds.value.has(commandData.id)) toggleExpanded(commandData.id);
		}
		function handleRowDblClick(commandData) {
			if (commandData.keybindings.length === 0) addKeybinding(commandData);
			else if (commandData.keybindings.length === 1) editKeybinding(commandData, commandData.keybindings[0]);
		}
		function handleRowContextMenu(event) {
			contextMenuTarget.value = event.data;
		}
		function clearContextMenuTarget() {
			contextMenuTarget.value = null;
		}
		async function removeSingleKeybinding(commandData, index) {
			const binding = commandData.keybindings[index];
			if (binding) {
				keybindingStore.unsetKeybinding(binding);
				if (commandData.keybindings.length <= 2) expandedCommandIds.value.delete(commandData.id);
				await keybindingService.persistUserKeybindings();
			}
		}
		function handleRemoveAllKeybindings(commandData) {
			const dialog = showConfirmDialog({
				headerProps: { title: t("g.removeAllKeybindingsTitle") },
				props: { promptText: t("g.removeAllKeybindingsMessage") },
				footerProps: {
					confirmText: t("g.removeAll"),
					confirmVariant: "destructive",
					onCancel: () => dialogStore.closeDialog(dialog),
					onConfirm: async () => {
						keybindingStore.removeAllKeybindingsForCommand(commandData.id);
						await keybindingService.persistUserKeybindings();
						dialogStore.closeDialog(dialog);
					}
				}
			});
		}
		function handleRemoveKeybindingFromMenu(commandData) {
			if (commandData.keybindings.length >= 2) handleRemoveAllKeybindings(commandData);
			else removeSingleKeybinding(commandData, 0);
		}
		function ctxChangeKeybinding() {
			if (!contextMenuTarget.value) return;
			const target = contextMenuTarget.value;
			if (target.keybindings.length === 1) editKeybinding(target, target.keybindings[0]);
			else if (target.keybindings.length >= 2) {
				if (!expandedCommandIds.value.has(target.id)) toggleExpanded(target.id);
			}
		}
		function ctxAddKeybinding() {
			if (contextMenuTarget.value) addKeybinding(contextMenuTarget.value);
		}
		function ctxResetToDefault() {
			if (contextMenuTarget.value) resetKeybinding(contextMenuTarget.value);
		}
		function ctxRemoveKeybinding() {
			if (contextMenuTarget.value && contextMenuTarget.value.keybindings.length > 0) handleRemoveKeybindingFromMenu(contextMenuTarget.value);
		}
		async function resetKeybinding(commandData) {
			if (keybindingStore.resetKeybindingForCommand(commandData.id)) {
				expandedCommandIds.value.delete(commandData.id);
				await keybindingService.persistUserKeybindings();
			} else console.warn(`No changes made when resetting keybinding for command: ${commandData.id}`);
		}
		const toast = useToast();
		function resetAllKeybindings() {
			const dialog = showConfirmDialog({
				headerProps: { title: t("g.resetAllKeybindingsTitle") },
				props: { promptText: t("g.resetAllKeybindingsMessage") },
				footerProps: {
					confirmText: t("g.resetAll"),
					confirmVariant: "destructive",
					onCancel: () => {
						dialogStore.closeDialog(dialog);
					},
					onConfirm: async () => {
						keybindingStore.resetAllKeybindings();
						await keybindingService.persistUserKeybindings();
						dialogStore.closeDialog(dialog);
						toast.add({
							severity: "info",
							summary: t("g.info"),
							detail: t("g.allKeybindingsReset"),
							life: 3e3
						});
					}
				}
			});
		}
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", {
				ref: unref(primeVueOverlay).overlayScopeRef,
				class: "keybinding-panel flex min-w-0 flex-col gap-2 overflow-x-hidden"
			}, [
				(openBlock(), createBlock(Teleport, {
					defer: "",
					to: "#keybinding-panel-header"
				}, [createVNode(SearchInput_default, {
					modelValue: filters.value["global"].value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filters.value["global"].value = $event),
					class: "max-w-96",
					size: "lg",
					autofocus: "",
					placeholder: _ctx.$t("g.searchPlaceholder", { subject: _ctx.$t("g.keybindings") })
				}, null, 8, ["modelValue", "placeholder"])])),
				(openBlock(), createBlock(Teleport, {
					defer: "",
					to: "#keybinding-panel-actions"
				}, [createBaseVNode("div", _hoisted_1, [createVNode(KeybindingPresetToolbar_default, {
					"preset-names": presetNames.value,
					"content-style": unref(keybindingOverlayContentStyle),
					onPresetsChanged: refreshPresetList
				}, null, 8, ["preset-names", "content-style"]), createVNode(DropdownMenu_default, {
					entries: menuEntries.value,
					style: normalizeStyle(unref(keybindingOverlayContentStyle)),
					icon: "icon-[lucide--ellipsis]",
					"item-class": "text-sm gap-2",
					"button-size": "unset",
					"button-class": "size-10",
					to: "#keybinding-panel-actions",
					align: "end"
				}, {
					button: withCtx(() => [createVNode(Button_default, {
						size: "unset",
						class: "size-10",
						"data-testid": "keybinding-preset-menu"
					}, {
						default: withCtx(() => [..._cache[6] || (_cache[6] = [createBaseVNode("i", { class: "icon-[lucide--ellipsis]" }, null, -1)])]),
						_: 1
					})]),
					_: 1
				}, 8, ["entries", "style"])])])),
				createVNode(unref(ContextMenuRoot_default), null, {
					default: withCtx(() => [createVNode(unref(ContextMenuTrigger_default), { "as-child": "" }, {
						default: withCtx(() => [createBaseVNode("div", {
							class: "min-w-0 overflow-x-hidden",
							onContextmenuCapture: clearContextMenuTarget
						}, [createVNode(unref(script$1), {
							selection: selectedCommandData.value,
							"onUpdate:selection": _cache[1] || (_cache[1] = ($event) => selectedCommandData.value = $event),
							"expanded-rows": expandedRows.value,
							"onUpdate:expandedRows": _cache[2] || (_cache[2] = ($event) => expandedRows.value = $event),
							value: commandsData.value,
							"data-key": "id",
							"global-filter-fields": ["id", "label"],
							filters: filters.value,
							paginator: true,
							rows: 50,
							"rows-per-page-options": [
								25,
								50,
								100
							],
							"selection-mode": "single",
							"context-menu": "",
							"striped-rows": "",
							"table-style": {
								tableLayout: "fixed",
								width: "100%"
							},
							pt: { header: "px-0" },
							onRowClick: _cache[3] || (_cache[3] = ($event) => handleRowClick($event)),
							onRowDblclick: _cache[4] || (_cache[4] = ($event) => handleRowDblClick($event.data)),
							onRowContextmenu: _cache[5] || (_cache[5] = ($event) => handleRowContextMenu($event))
						}, {
							expansion: withCtx((slotProps) => [createBaseVNode("div", _hoisted_6, [(openBlock(true), createElementBlock(Fragment, null, renderList(slotProps.data.keybindings, (binding, idx) => {
								return openBlock(), createElementBlock("div", {
									key: binding.combo.serialize(),
									"data-testid": "keybinding-expansion-binding",
									class: "flex items-center justify-between border-b border-border-subtle py-1.5 last:border-b-0"
								}, [createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, toDisplayString(slotProps.data.label), 1), createVNode(KeyComboDisplay_default, {
									"key-combo": binding.combo,
									"is-modified": slotProps.data.isModified
								}, null, 8, ["key-combo", "is-modified"])]), createBaseVNode("div", _hoisted_9, [withDirectives((openBlock(), createBlock(Button_default, {
									variant: "textonly",
									size: "icon",
									"aria-label": _ctx.$t("g.edit"),
									onClick: ($event) => editKeybinding(slotProps.data, binding)
								}, {
									default: withCtx(() => [..._cache[11] || (_cache[11] = [createBaseVNode("i", { class: "icon-[lucide--pencil]" }, null, -1)])]),
									_: 1
								}, 8, ["aria-label", "onClick"])), [[_directive_tooltip, _ctx.$t("g.edit")]]), withDirectives((openBlock(), createBlock(Button_default, {
									variant: "textonly",
									size: "icon",
									"aria-label": _ctx.$t("g.removeKeybinding"),
									onClick: ($event) => removeSingleKeybinding(slotProps.data, idx)
								}, {
									default: withCtx(() => [..._cache[12] || (_cache[12] = [createBaseVNode("i", { class: "icon-[lucide--trash-2]" }, null, -1)])]),
									_: 1
								}, 8, ["aria-label", "onClick"])), [[_directive_tooltip, _ctx.$t("g.removeKeybinding")]])])]);
							}), 128))])]),
							default: withCtx(() => [
								createVNode(unref(script$2), {
									field: "id",
									header: _ctx.$t("g.command"),
									sortable: "",
									pt: { bodyCell: "p-1 min-h-8" }
								}, {
									body: withCtx((slotProps) => [createBaseVNode("div", {
										class: normalizeClass(["flex min-w-0 items-center gap-1 truncate", slotProps.data.keybindings.length < 2 && "pl-5"]),
										title: slotProps.data.id
									}, [
										slotProps.data.keybindings.length >= 2 ? (openBlock(), createElementBlock("i", {
											key: 0,
											class: normalizeClass(["icon-[lucide--chevron-right] size-4 shrink-0 text-muted-foreground transition-transform", expandedCommandIds.value.has(slotProps.data.id) && "rotate-90"])
										}, null, 2)) : createCommentVNode("", true),
										slotProps.data.keybindings.some((b) => b.combo.isBrowserReserved) ? withDirectives((openBlock(), createElementBlock("i", _hoisted_3, null, 512)), [[_directive_tooltip, _ctx.$t("g.browserReservedKeybindingTooltip")]]) : createCommentVNode("", true),
										createTextVNode(" " + toDisplayString(slotProps.data.label), 1)
									], 10, _hoisted_2)]),
									_: 1
								}, 8, ["header"]),
								createVNode(unref(script$2), {
									field: "keybindings",
									header: _ctx.$t("g.keybinding"),
									style: { width: "30%" },
									pt: { bodyCell: "p-1 min-h-8" }
								}, {
									body: withCtx((slotProps) => [createVNode(KeybindingList_default, {
										keybindings: slotProps.data.keybindings,
										"is-modified": slotProps.data.isModified
									}, null, 8, ["keybindings", "is-modified"])]),
									_: 1
								}, 8, ["header"]),
								createVNode(unref(script$2), {
									field: "source",
									header: _ctx.$t("g.source"),
									style: { width: "16%" },
									pt: { bodyCell: "p-1 min-h-8" }
								}, {
									body: withCtx((slotProps) => [createBaseVNode("span", {
										class: "block truncate",
										title: slotProps.data.source
									}, toDisplayString(slotProps.data.source || "-"), 9, _hoisted_4)]),
									_: 1
								}, 8, ["header"]),
								createVNode(unref(script$2), {
									field: "actions",
									header: "",
									style: { width: "9rem" },
									pt: { bodyCell: "p-1 min-h-8 whitespace-nowrap" }
								}, {
									body: withCtx((slotProps) => [createBaseVNode("div", _hoisted_5, [
										slotProps.data.keybindings.length === 1 ? withDirectives((openBlock(), createBlock(Button_default, {
											key: 0,
											variant: "textonly",
											size: "icon",
											"aria-label": _ctx.$t("g.edit"),
											onClick: ($event) => editKeybinding(slotProps.data, slotProps.data.keybindings[0])
										}, {
											default: withCtx(() => [..._cache[7] || (_cache[7] = [createBaseVNode("i", { class: "icon-[lucide--pencil]" }, null, -1)])]),
											_: 1
										}, 8, ["aria-label", "onClick"])), [[_directive_tooltip, _ctx.$t("g.edit")]]) : createCommentVNode("", true),
										withDirectives((openBlock(), createBlock(Button_default, {
											variant: "textonly",
											size: "icon",
											"aria-label": _ctx.$t("g.addNewKeybinding"),
											onClick: ($event) => addKeybinding(slotProps.data)
										}, {
											default: withCtx(() => [..._cache[8] || (_cache[8] = [createBaseVNode("i", { class: "icon-[lucide--plus]" }, null, -1)])]),
											_: 1
										}, 8, ["aria-label", "onClick"])), [[_directive_tooltip, _ctx.$t("g.addNewKeybinding")]]),
										withDirectives((openBlock(), createBlock(Button_default, {
											variant: "textonly",
											size: "icon",
											"aria-label": _ctx.$t("g.reset"),
											disabled: !slotProps.data.isModified,
											onClick: ($event) => resetKeybinding(slotProps.data)
										}, {
											default: withCtx(() => [..._cache[9] || (_cache[9] = [createBaseVNode("i", { class: "icon-[lucide--rotate-ccw]" }, null, -1)])]),
											_: 1
										}, 8, [
											"aria-label",
											"disabled",
											"onClick"
										])), [[_directive_tooltip, _ctx.$t("g.reset")]]),
										withDirectives((openBlock(), createBlock(Button_default, {
											variant: "textonly",
											size: "icon",
											"aria-label": _ctx.$t("g.delete"),
											disabled: slotProps.data.keybindings.length === 0,
											onClick: ($event) => handleRemoveKeybindingFromMenu(slotProps.data)
										}, {
											default: withCtx(() => [..._cache[10] || (_cache[10] = [createBaseVNode("i", { class: "icon-[lucide--trash-2]" }, null, -1)])]),
											_: 1
										}, 8, [
											"aria-label",
											"disabled",
											"onClick"
										])), [[_directive_tooltip, _ctx.$t("g.delete")]])
									])]),
									_: 1
								})
							]),
							_: 1
						}, 8, [
							"selection",
							"expanded-rows",
							"value",
							"filters"
						])], 32)]),
						_: 1
					}), createVNode(unref(ContextMenuPortal_default), null, {
						default: withCtx(() => [createVNode(unref(ContextMenuContent_default), {
							style: normalizeStyle(unref(keybindingOverlayContentStyle)),
							class: "z-1800 min-w-56 rounded-lg border border-border-subtle bg-base-background px-2 py-3 shadow-interface"
						}, {
							default: withCtx(() => [
								createVNode(unref(ContextMenuItem_default), {
									class: "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-primary outline-none select-none hover:bg-node-component-surface-hovered focus:bg-node-component-surface-hovered data-disabled:cursor-default data-disabled:opacity-50",
									disabled: !contextMenuTarget.value || contextMenuTarget.value.keybindings.length === 0,
									onSelect: ctxChangeKeybinding
								}, {
									default: withCtx(() => [_cache[13] || (_cache[13] = createBaseVNode("i", { class: "icon-[lucide--pencil] size-4" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("g.changeKeybinding")), 1)]),
									_: 1
								}, 8, ["disabled"]),
								createVNode(unref(ContextMenuItem_default), {
									class: "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-primary outline-none select-none hover:bg-node-component-surface-hovered focus:bg-node-component-surface-hovered",
									onSelect: ctxAddKeybinding
								}, {
									default: withCtx(() => [_cache[14] || (_cache[14] = createBaseVNode("i", { class: "icon-[lucide--plus] size-4" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("g.addNewKeybinding")), 1)]),
									_: 1
								}),
								createVNode(unref(ContextMenuSeparator_default), { class: "my-1 h-px bg-border-subtle" }),
								createVNode(unref(ContextMenuItem_default), {
									class: "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-primary outline-none select-none hover:bg-node-component-surface-hovered focus:bg-node-component-surface-hovered data-disabled:cursor-default data-disabled:opacity-50",
									disabled: !contextMenuTarget.value?.isModified,
									onSelect: ctxResetToDefault
								}, {
									default: withCtx(() => [_cache[15] || (_cache[15] = createBaseVNode("i", { class: "icon-[lucide--rotate-ccw] size-4" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("g.resetToDefault")), 1)]),
									_: 1
								}, 8, ["disabled"]),
								createVNode(unref(ContextMenuItem_default), {
									class: "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-text-primary outline-none select-none hover:bg-node-component-surface-hovered focus:bg-node-component-surface-hovered data-disabled:cursor-default data-disabled:opacity-50",
									disabled: !contextMenuTarget.value || contextMenuTarget.value.keybindings.length === 0,
									onSelect: ctxRemoveKeybinding
								}, {
									default: withCtx(() => [_cache[16] || (_cache[16] = createBaseVNode("i", { class: "icon-[lucide--trash-2] size-4" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("g.removeKeybinding")), 1)]),
									_: 1
								}, 8, ["disabled"])
							]),
							_: 1
						}, 8, ["style"])]),
						_: 1
					})]),
					_: 1
				}),
				withDirectives((openBlock(), createBlock(Button_default, {
					class: "mt-4 w-full",
					variant: "destructive-textonly",
					onClick: resetAllKeybindings
				}, {
					default: withCtx(() => [_cache[17] || (_cache[17] = createBaseVNode("i", { class: "icon-[lucide--rotate-ccw]" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("g.resetAll")), 1)]),
					_: 1
				})), [[_directive_tooltip, _ctx.$t("g.resetAllKeybindingsTooltip")]])
			], 512);
		};
	}
});
//#endregion
export { KeybindingPanel_default as default };

//# sourceMappingURL=KeybindingPanel-mys7xgZH.js.map