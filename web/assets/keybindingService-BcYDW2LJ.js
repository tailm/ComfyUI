import "./rolldown-runtime-w0pxe0c8.js";
import { _i as KeybindingImpl, ea as useSettingStore, gi as useKeybindingStore, hi as useCommandStore, vi as KeyComboImpl } from "./promotionUtils-CFmuY7Wj.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { t as useDialogStore } from "./dialogStore-C0QSbgAQ.js";
//#region src/platform/keybindings/defaults.ts
var CORE_KEYBINDINGS = [
	{
		combo: {
			ctrl: true,
			key: "Enter"
		},
		commandId: "Comfy.QueuePrompt"
	},
	{
		combo: {
			ctrl: true,
			shift: true,
			key: "Enter"
		},
		commandId: "Comfy.QueuePromptFront"
	},
	{
		combo: {
			ctrl: true,
			alt: true,
			key: "Enter"
		},
		commandId: "Comfy.Interrupt"
	},
	{
		combo: { key: "r" },
		commandId: "Comfy.RefreshNodeDefinitions"
	},
	{
		combo: { key: "w" },
		commandId: "Workspace.ToggleSidebarTab.workflows"
	},
	{
		combo: { key: "n" },
		commandId: "Workspace.ToggleSidebarTab.node-library"
	},
	{
		combo: { key: "m" },
		commandId: "Workspace.ToggleSidebarTab.model-library"
	},
	{
		combo: { key: "a" },
		commandId: "Workspace.ToggleSidebarTab.assets"
	},
	{
		combo: {
			alt: true,
			key: "m"
		},
		commandId: "Comfy.ToggleLinear"
	},
	{
		combo: {
			alt: true,
			key: "µ"
		},
		commandId: "Comfy.ToggleLinear"
	},
	{
		combo: {
			key: "s",
			ctrl: true
		},
		commandId: "Comfy.SaveWorkflow"
	},
	{
		combo: {
			key: "o",
			ctrl: true
		},
		commandId: "Comfy.OpenWorkflow"
	},
	{
		combo: {
			key: "g",
			ctrl: true
		},
		commandId: "Comfy.Graph.GroupSelectedNodes"
	},
	{
		combo: {
			key: ",",
			ctrl: true
		},
		commandId: "Comfy.ShowSettingsDialog"
	},
	{
		combo: {
			key: "=",
			alt: true
		},
		commandId: "Comfy.Canvas.ZoomIn",
		targetElementId: "graph-canvas"
	},
	{
		combo: {
			key: "+",
			alt: true,
			shift: true
		},
		commandId: "Comfy.Canvas.ZoomIn",
		targetElementId: "graph-canvas"
	},
	{
		combo: {
			key: "+",
			alt: true
		},
		commandId: "Comfy.Canvas.ZoomIn",
		targetElementId: "graph-canvas"
	},
	{
		combo: {
			key: "-",
			alt: true
		},
		commandId: "Comfy.Canvas.ZoomOut",
		targetElementId: "graph-canvas"
	},
	{
		combo: { key: "." },
		commandId: "Comfy.Canvas.FitView",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: { key: "p" },
		commandId: "Comfy.Canvas.ToggleSelected.Pin",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: {
			key: "c",
			alt: true
		},
		commandId: "Comfy.Canvas.ToggleSelectedNodes.Collapse",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: {
			key: "b",
			ctrl: true
		},
		commandId: "Comfy.Canvas.ToggleSelectedNodes.Bypass",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: {
			key: "m",
			ctrl: true
		},
		commandId: "Comfy.Canvas.ToggleSelectedNodes.Mute",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: {
			key: "`",
			ctrl: true
		},
		commandId: "Workspace.ToggleBottomPanelTab.logs-terminal"
	},
	{
		combo: {
			key: "e",
			ctrl: true,
			shift: true
		},
		commandId: "Comfy.Graph.ConvertToSubgraph"
	},
	{
		combo: {
			key: "m",
			alt: true,
			shift: true
		},
		commandId: "Comfy.Canvas.ToggleMinimap"
	},
	{
		combo: {
			ctrl: true,
			shift: true,
			key: "k"
		},
		commandId: "Workspace.ToggleBottomPanel.Shortcuts"
	},
	{
		combo: { key: "v" },
		commandId: "Comfy.Canvas.Unlock"
	},
	{
		combo: { key: "h" },
		commandId: "Comfy.Canvas.Lock"
	},
	{
		combo: { key: "Escape" },
		commandId: "Comfy.Graph.ExitSubgraph"
	},
	{
		combo: {
			ctrl: true,
			key: "a"
		},
		commandId: "Comfy.Canvas.SelectAll",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: {
			ctrl: true,
			shift: true,
			key: "v"
		},
		commandId: "Comfy.Canvas.PasteFromClipboardWithConnect",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: { key: "Delete" },
		commandId: "Comfy.Canvas.DeleteSelectedItems",
		targetElementId: "graph-canvas-container"
	},
	{
		combo: { key: "Backspace" },
		commandId: "Comfy.Canvas.DeleteSelectedItems",
		targetElementId: "graph-canvas-container"
	}
];
//#endregion
//#region src/platform/keybindings/keybindingService.ts
function useKeybindingService() {
	const keybindingStore = useKeybindingStore();
	const commandStore = useCommandStore();
	const settingStore = useSettingStore();
	const dialogStore = useDialogStore();
	async function keybindHandler(event) {
		const keyCombo = KeyComboImpl.fromEvent(event);
		if (keyCombo.isModifier) return;
		const target = event.composedPath()[0];
		if (keyCombo.isReservedByTextInput && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.contentEditable === "true" || target.tagName === "SPAN" && target.classList.contains("property_value"))) return;
		const keybinding = keybindingStore.getKeybinding(keyCombo);
		if (keybinding) {
			const targetElementId = keybinding.targetElementId === "graph-canvas" ? "graph-canvas-container" : keybinding.targetElementId;
			if (targetElementId) {
				if (!document.getElementById(targetElementId)?.contains(target)) return;
			}
			if (event.key === "Escape" && !event.ctrlKey && !event.altKey && !event.metaKey) {
				if (dialogStore.dialogStack.length > 0) return;
			}
			/**
			* Block global keybindings from triggering background actions while a
			* modal dialog is open. Keybindings whose event target lives inside an
			* open dialog still fire, so dialog-scoped shortcuts keep working.
			*/
			if (dialogStore.dialogStack.length > 0) {
				if (!(target.closest?.("[role=\"dialog\"]") != null)) return;
			}
			event.preventDefault();
			if (new Set([
				"Comfy.QueuePrompt",
				"Comfy.QueuePromptFront",
				"Comfy.QueueSelectedOutputNodes"
			]).has(keybinding.commandId)) await commandStore.execute(keybinding.commandId, { metadata: { trigger_source: "keybinding" } });
			else await commandStore.execute(keybinding.commandId);
			return;
		}
		if (event.ctrlKey || event.altKey || event.metaKey) return;
		if (event.key === "Escape") {
			const modals = document.querySelectorAll(".comfy-modal");
			for (const modal of modals) if (window.getComputedStyle(modal).getPropertyValue("display") !== "none") {
				modal.style.display = "none";
				break;
			}
			for (const d of document.querySelectorAll("dialog")) d.close();
		}
	}
	function registerCoreKeybindings() {
		for (const keybinding of CORE_KEYBINDINGS) {
			if (isCloud && keybinding.commandId === "Workspace.ToggleBottomPanelTab.logs-terminal") continue;
			keybindingStore.addDefaultKeybinding(new KeybindingImpl(keybinding));
		}
	}
	function registerUserKeybindings() {
		const unsetBindings = settingStore.get("Comfy.Keybinding.UnsetBindings");
		for (const keybinding of unsetBindings) keybindingStore.unsetKeybinding(new KeybindingImpl(keybinding));
		const newBindings = settingStore.get("Comfy.Keybinding.NewBindings");
		for (const keybinding of newBindings) {
			if (isCloud && keybinding.commandId === "Workspace.ToggleBottomPanelTab.logs-terminal") continue;
			keybindingStore.addUserKeybinding(new KeybindingImpl(keybinding));
		}
	}
	async function persistUserKeybindings() {
		await settingStore.setMany({
			"Comfy.Keybinding.NewBindings": Object.values(keybindingStore.getUserKeybindings()),
			"Comfy.Keybinding.UnsetBindings": Object.values(keybindingStore.getUserUnsetKeybindings())
		});
	}
	return {
		keybindHandler,
		registerCoreKeybindings,
		registerUserKeybindings,
		persistUserKeybindings
	};
}
//#endregion
export { useKeybindingService as t };

//# sourceMappingURL=keybindingService-BcYDW2LJ.js.map