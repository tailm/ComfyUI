const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./GraphView-DtOnTCfZ.js","./_plugin-vue_export-helper-BKp_-DiS.js","./rolldown-runtime-w0pxe0c8.js","./vendor-primevue-Di5q1E0M.js","./vendor-vue-core-ywZ1En3W.js","./promotionUtils-D7bbpSd5.js","./vendor-other-DslE47pR.js","./vendor-three-JCi_5yX-.js","./vendor-tiptap-BOgG_8hl.js","./vendor-reka-ui-BL45aHvm.js","./vendor-i18n-BitfRK9w.js","./vendor-sentry-BeVhjky-.js","./vendor-vueuse-D8rwdKM0.js","./vendor-axios-BWFjRHOY.js","./vendor-markdown-dKTpR1HU.js","./vendor-yjs-Cmf7NGGj.js","./vendor-zod-BwmrqdWK.js","./api-DtOML0NT.js","./types-4cVPtFn2.js","./toastStore-Dafwoqcw.js","./devFeatureFlagOverride-C_h7DxV8.js","./formatUtil-NyC-AHAf.js","./src-CAuVu1U5.js","./downloadUtil-Cl0cF0EY.js","./i18n-DzSsN4Ea.js","./commands-CXXLFVIe.js","./main-BSJkLqvQ.js","./nodeDefs-DNc3psLh.js","./settings-CXXL4Tkc.js","./WaveAudioPlayer-Q5zYiDcc.js","./Button-BOAvjEOG.js","./Slider-DrBXpOpg.js","./DialogHeader-D4JcQCFk.js","./dialogStore-B5tjby6O.js","./Loader-Pq650Xlb.js","./Popover-D6A0rMur.js","./useModalLiftedZIndex-DKRRcl_q.js","./ColorPicker-BdrSTTzc.js","./SelectValue-CrSaS-Kt.js","./TagsInputItemText-CszoEoLz.js","./extensionStore-CveIbRwz.js","./teamWorkspaceStore-CsZZpFU0.js","./remoteConfig-0E2rLe-N.js","./userStore-DHnsYsi1.js","./useImageQuiet-BNuH5iCW.js","./VideoPlayOverlay-K_gXsBIz.js","./useFeatureUsageTracker-B-33shAP.js","./telemetry-CLr022VN.js","./widgetTypes-DKb0MXCf.js","./envUtil-pF8O5Ge5.js","./markdownRendererUtil-0yaajO2y.js","./useConflictDetection-DUski-H-.js","./useExternalLink-BniNQVDC.js","./errorUtil-DDkl_YIv.js","./ScrubableNumberInput-CPkyjVSU.js","./UserAvatar-Cib7ZZ7y.js","./curveUtils-CtOWBRZv.js","./TopbarBadge-DmBtDblb.js","./graphHasMissingNodes-CUqMy7eP.js","./useCurrentUser-VR5ritSj.js","./useClickDragGuard-qRfyQspx.js","./SubscribeButton-BEW7bxZZ.js","./SubscribeToRun-CfnI11OO.js","./keybindingService-CE5dGk09.js","./missingModelDownload-BF3_EnNC.js","./config-BHY3m-SY.js","./releaseStore-BAW4JHvX.js","./comfyApi-CqCmjmal.js","./workflowShareService-B0D6rqYz.js","./WorkspaceProfilePic-DnYfi6zM.js","./useWorkspaceTierLabel-DaKq5AG3.js","./useTransformState-DPB_nWDk.js","./layout-CyrlIkvO.js","./serverConfigStore-BWM_fAKg.js","./hdrFormatUtil-DCXrz_AP.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css","./useConflictDetection-BulFL8Bd.css","./GraphView-NNQKV9Ro.css","./LoginView-D0rdkVUB.js","./initHostTelemetry-DSP5Ln4m.js","./topupTracker-BHv_2BbS.js"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { $ as Tooltip, D as script$1, Q as __vitePreload, S as script, at as index, et as ToastService, nt as PrimeVue, ot as definePreset } from "./vendor-primevue-Di5q1E0M.js";
import { r as captureMessage, t as init } from "./vendor-sentry-BeVhjky-.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, I as createSlots, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, Y as mergeProps, at as renderList, bt as withCtx, c as createPinia, et as onMounted, gt as watch, h as createApp, i as createWebHistory, j as createBaseVNode, lt as resolveDynamicComponent, n as createRouter, r as createWebHashHistory, rt as openBlock, st as resolveComponent, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Z as isEqual } from "./vendor-other-DslE47pR.js";
import { Bo as resolveSubgraphInputTarget, C as app$1, Co as nextUniqueName, Ho as useWidgetValueStore, Ia as parseProxyWidgetErrorQuarantine, Jo as toNodeId, Ko as UNASSIGNED_NODE_ID, La as parseProxyWidgets, Lo as promotedInputWidget, Na as LGraph, Ra as resolveConcretePromotedWidget, So as usePreviewExposureStore, Xo as setAssertReporter, Yo as isWidgetValue, a as getPromotableWidgets, ft as DialogFooter_default, i as findHostInputForPromotion, l as isPreviewPseudoWidget, rt as useWorkspaceStore, t as autoExposeKnownPreviewNodes } from "./promotionUtils-D7bbpSd5.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as i18n } from "./i18n-DzSsN4Ea.js";
import { S as useFavicon } from "./vendor-vueuse-D8rwdKM0.js";
import "./toastStore-Dafwoqcw.js";
import { i as capturePreservedQuery, o as hydratePreservedQuery, r as PRESERVED_QUERY_NAMESPACES } from "./teamWorkspaceStore-CsZZpFU0.js";
import { n as isDesktop } from "./types-4cVPtFn2.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useDialogStore } from "./dialogStore-B5tjby6O.js";
import { t as useUserStore } from "./userStore-DHnsYsi1.js";
import { d as DialogOverlay_default, f as DialogContent_default, l as DialogTitle_default, n as DialogClose_default, p as Dialog_default, t as DialogHeader_default, u as DialogPortal_default } from "./DialogHeader-D4JcQCFk.js";
import { t as electronAPI } from "./envUtil-pF8O5Ge5.js";
import { m as useBootstrapStore, p as config_default, t as useConflictDetection } from "./useConflictDetection-DUski-H-.js";
import { t as vRekaZIndex } from "./vRekaZIndex-BdEwhY82.js";
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/core/graph/subgraph/migration/proxyWidgetMigration.ts
var LEGACY_PROXY_WIDGET_PREFIX_PATTERN = /^\s*(\d+)\s*:\s*(.+)$/;
function stripLegacyPrefixes(sourceWidgetName) {
	let remaining = sourceWidgetName;
	let deepestPrefixId;
	while (true) {
		const match = LEGACY_PROXY_WIDGET_PREFIX_PATTERN.exec(remaining);
		if (!match) return {
			sourceWidgetName: remaining,
			deepestPrefixId
		};
		deepestPrefixId = toNodeId(match[1]);
		remaining = match[2];
	}
}
function canResolveLegacyProxy(hostNode, sourceNodeId, widgetName) {
	return resolveConcretePromotedWidget(hostNode, sourceNodeId, widgetName).status === "resolved";
}
function normalizeLegacyProxyWidgetEntry(hostNode, sourceNodeId, sourceWidgetName, disambiguatingSourceNodeId) {
	const normalizedSourceNodeId = toNodeId(sourceNodeId);
	const normalizedDisambiguatingSourceNodeId = disambiguatingSourceNodeId === void 0 ? void 0 : toNodeId(disambiguatingSourceNodeId);
	if (canResolveLegacyProxy(hostNode, sourceNodeId, sourceWidgetName)) return {
		sourceNodeId: normalizedSourceNodeId,
		sourceWidgetName,
		...normalizedDisambiguatingSourceNodeId && { disambiguatingSourceNodeId: normalizedDisambiguatingSourceNodeId }
	};
	const stripped = stripLegacyPrefixes(sourceWidgetName);
	const patchDisambiguatingSourceNodeId = stripped.deepestPrefixId ?? normalizedDisambiguatingSourceNodeId;
	return {
		sourceNodeId: normalizedSourceNodeId,
		sourceWidgetName: stripped.sourceWidgetName,
		...patchDisambiguatingSourceNodeId && { disambiguatingSourceNodeId: patchDisambiguatingSourceNodeId }
	};
}
function resolveSourceWidget(sourceNode, sourceWidgetName, disambiguatingSourceNodeId) {
	if (sourceNode.isSubgraphNode()) {
		const input = sourceNode.inputs.find((input) => {
			const target = resolveSubgraphInputTarget(sourceNode, input.name);
			if (disambiguatingSourceNodeId) return target?.widgetName === sourceWidgetName && target.nodeId === disambiguatingSourceNodeId;
			if (input.name === sourceWidgetName) return true;
			return target?.widgetName === sourceWidgetName;
		});
		if (input?.widgetId) return promotedInputWidget(input) ?? void 0;
	}
	return sourceNode.widgets?.find((w) => w.name === sourceWidgetName) ?? getPromotableWidgets(sourceNode).find((w) => w.name === sourceWidgetName);
}
var PRIMITIVE_NODE_TYPE = "PrimitiveNode";
var QUARANTINE_PROPERTY = "proxyWidgetErrorQuarantine";
var QUARANTINE_VERSION = 1;
var PROXY_BYPASS_MARKER_PROPERTY = "proxyBypassedToSubgraphInput";
function flushProxyWidgetMigration(args) {
	const { hostNode, hostWidgetValues } = args;
	const tuples = parseProxyWidgets(hostNode.properties.proxyWidgets);
	if (tuples.length === 0) return;
	const normalizedEntries = tuples.map((originalEntry) => {
		const [sourceNodeId, sourceWidgetName, disambiguator] = originalEntry;
		return {
			originalEntry,
			normalized: normalizeLegacyProxyWidgetEntry(hostNode, sourceNodeId, sourceWidgetName, disambiguator)
		};
	});
	const cohort = normalizedEntries.map((entry) => entry.normalized);
	const pending = normalizedEntries.map((entry, index) => {
		const { value, isHole } = pickHostValue(hostWidgetValues, index);
		return {
			...entry,
			hostValue: value,
			isHole,
			plan: classify(hostNode, entry.normalized, cohort)
		};
	});
	const previewStore = usePreviewExposureStore();
	const quarantineToAppend = [];
	const primitiveCohorts = /* @__PURE__ */ new Map();
	for (const entry of pending) switch (entry.plan.kind) {
		case "primitiveBypass": {
			const c = primitiveCohorts.get(entry.plan.primitiveNodeId) ?? [];
			c.push(entry);
			primitiveCohorts.set(entry.plan.primitiveNodeId, c);
			break;
		}
		case "alreadyLinked": {
			const r = repairAlreadyLinked(hostNode, entry, entry.plan.subgraphInputName);
			if (!r.ok) quarantineToAppend.push(quarantineFor(entry, r.reason));
			break;
		}
		case "createSubgraphInput": {
			const r = repairCreateSubgraphInput(hostNode, entry, entry.plan.sourceWidgetName);
			if (!r.ok) quarantineToAppend.push(quarantineFor(entry, r.reason));
			break;
		}
		case "previewExposure": {
			const r = migratePreview(hostNode, entry, previewStore, entry.plan);
			if (!r.ok) quarantineToAppend.push(quarantineFor(entry, r.reason));
			break;
		}
		case "quarantine":
			quarantineToAppend.push(quarantineFor(entry, entry.plan.reason));
			break;
	}
	for (const c of primitiveCohorts.values()) {
		const r = repairPrimitive(hostNode, c);
		if (!r.ok) for (const e of c) quarantineToAppend.push(quarantineFor(e, r.reason));
	}
	if (quarantineToAppend.length > 0) appendQuarantine(hostNode, quarantineToAppend);
	delete hostNode.properties.proxyWidgets;
}
function pickHostValue(hostWidgetValues, index) {
	if (hostWidgetValues === void 0 || index < 0 || index >= hostWidgetValues.length || !Object.hasOwn(hostWidgetValues, index)) return {
		value: void 0,
		isHole: true
	};
	const raw = hostWidgetValues[index];
	if (!isWidgetValue(raw)) return {
		value: void 0,
		isHole: true
	};
	return {
		value: raw,
		isHole: false
	};
}
function collectTargetsStrict(hostNode, primitiveNode) {
	const subgraph = hostNode.subgraph;
	const linkIds = (primitiveNode.outputs?.[0])?.links ?? [];
	const targets = [];
	for (const linkId of linkIds) {
		const link = subgraph.links.get(linkId);
		if (!link) return void 0;
		if (link.target_id === UNASSIGNED_NODE_ID) return void 0;
		targets.push({
			targetNodeId: link.target_id,
			targetSlot: link.target_slot
		});
	}
	return targets;
}
function collectTargetsSkippingDangling(hostNode, primitiveNode) {
	const subgraph = hostNode.subgraph;
	return (primitiveNode.outputs?.[0]?.links ?? []).flatMap((linkId) => {
		const link = subgraph.links.get(linkId);
		return link && link.target_id !== UNASSIGNED_NODE_ID ? [{
			targetNodeId: link.target_id,
			targetSlot: link.target_slot
		}] : [];
	});
}
function cohortDuplicatesPrimitive(cohort, primitiveNodeId) {
	return cohort.filter((entry) => entry.sourceNodeId === primitiveNodeId).length >= 2;
}
function classify(hostNode, normalized, cohort) {
	const linkedInput = findHostInputForPromotion(hostNode, normalized.sourceNodeId, normalized.sourceWidgetName);
	if (linkedInput) return {
		kind: "alreadyLinked",
		subgraphInputName: linkedInput.name
	};
	const sourceNode = hostNode.subgraph.getNodeById(normalized.sourceNodeId);
	if (!sourceNode) return {
		kind: "quarantine",
		reason: "missingSourceNode"
	};
	if (sourceNode.type === PRIMITIVE_NODE_TYPE) {
		const bypassedTo = sourceNode.properties?.[PROXY_BYPASS_MARKER_PROPERTY];
		if (typeof bypassedTo === "string") {
			const existingInput = hostNode.inputs.find((input) => input.name === bypassedTo);
			if (existingInput) return {
				kind: "alreadyLinked",
				subgraphInputName: existingInput.name
			};
		}
		const targets = collectTargetsSkippingDangling(hostNode, sourceNode);
		const cohortDuplicated = cohortDuplicatesPrimitive(cohort, normalized.sourceNodeId);
		if (targets.length >= 1 || cohortDuplicated) return {
			kind: "primitiveBypass",
			primitiveNodeId: sourceNode.id,
			sourceWidgetName: normalized.sourceWidgetName,
			targets
		};
		return {
			kind: "quarantine",
			reason: "unlinkedSourceWidget"
		};
	}
	const sourceWidget = resolveSourceWidget(sourceNode, normalized.sourceWidgetName, normalized.disambiguatingSourceNodeId);
	if (!sourceWidget) return {
		kind: "quarantine",
		reason: "missingSourceWidget"
	};
	if (normalized.sourceWidgetName.startsWith("$$") || isPreviewPseudoWidget(sourceWidget)) return {
		kind: "previewExposure",
		sourcePreviewName: normalized.sourceWidgetName
	};
	return {
		kind: "createSubgraphInput",
		sourceWidgetName: normalized.sourceWidgetName
	};
}
function applyHostValueToInput(input, entry) {
	if (!input.widgetId || entry.isHole) return Boolean(input.widgetId);
	return useWidgetValueStore().setValue(input.widgetId, entry.hostValue);
}
function applyHostLabelToInput(input, label) {
	if (label === void 0) return;
	input.label = label;
	if (!input.widgetId) return;
	const state = useWidgetValueStore().getWidget(input.widgetId);
	if (state) state.label = label;
}
function addUniqueSubgraphInput(subgraph, baseName, type) {
	const uniqueName = nextUniqueName(baseName, subgraph.inputs.map((input) => input.name));
	return subgraph.addInput(uniqueName, type);
}
function repairAlreadyLinked(hostNode, entry, subgraphInputName) {
	const matches = hostNode.inputs.filter((input) => input.name === subgraphInputName);
	if (matches.length === 0) return {
		ok: false,
		reason: "missingSubgraphInput"
	};
	if (matches.length > 1) return {
		ok: false,
		reason: "ambiguousSubgraphInput"
	};
	const hostInput = matches[0];
	if (!applyHostValueToInput(hostInput, entry)) return {
		ok: false,
		reason: "missingSubgraphInput"
	};
	return {
		ok: true,
		subgraphInputName: hostInput.name
	};
}
function repairCreateSubgraphInput(hostNode, entry, sourceWidgetName) {
	const subgraph = hostNode.subgraph;
	const sourceNode = subgraph.getNodeById(entry.normalized.sourceNodeId);
	if (!sourceNode) return {
		ok: false,
		reason: "missingSourceNode"
	};
	const sourceWidget = resolveSourceWidget(sourceNode, sourceWidgetName, entry.normalized.disambiguatingSourceNodeId);
	if (!sourceWidget) return {
		ok: false,
		reason: "missingSourceWidget"
	};
	const slot = sourceNode.getSlotFromWidget(sourceWidget);
	if (!slot) {
		console.warn("[proxyWidgetMigration] source widget has no backing input slot; quarantining", {
			sourceNodeId: entry.normalized.sourceNodeId,
			sourceWidgetName
		});
		return {
			ok: false,
			reason: "missingSubgraphInput"
		};
	}
	const newSubgraphInput = addUniqueSubgraphInput(subgraph, sourceWidgetName, String(slot.type ?? sourceWidget.type ?? "*"));
	if (slot.label !== void 0) newSubgraphInput.label = slot.label;
	if (!newSubgraphInput.connect(slot, sourceNode)) {
		subgraph.removeInput(newSubgraphInput);
		return {
			ok: false,
			reason: "missingSubgraphInput"
		};
	}
	const hostInput = hostNode.inputs.find((input) => input.name === newSubgraphInput.name);
	if (hostInput) {
		applyHostLabelToInput(hostInput, slot.label);
		applyHostValueToInput(hostInput, entry);
	}
	return {
		ok: true,
		subgraphInputName: newSubgraphInput.name
	};
}
var PRIMITIVE_FAILED = {
	ok: false,
	reason: "primitiveBypassFailed"
};
function failPrimitive(message, ctx) {
	console.warn(`[proxyWidgetMigration] ${message}`, ctx);
	return PRIMITIVE_FAILED;
}
function userRenamedTitle(primitiveNode) {
	const title = primitiveNode.title;
	return title && title !== PRIMITIVE_NODE_TYPE ? title : void 0;
}
function validateCohort(cohort) {
	const first = cohort[0];
	if (!first || first.plan.kind !== "primitiveBypass") return { ok: false };
	const { primitiveNodeId, sourceWidgetName } = first.plan;
	for (const entry of cohort) if (entry.plan.kind !== "primitiveBypass" || entry.plan.primitiveNodeId !== primitiveNodeId || entry.plan.sourceWidgetName !== sourceWidgetName) return { ok: false };
	const uniqueEntries = [];
	for (const entry of cohort) if (!uniqueEntries.some((k) => isEqual(k.normalized, entry.normalized))) uniqueEntries.push(entry);
	return {
		ok: true,
		primitiveNodeId,
		sourceWidgetName,
		uniqueEntries
	};
}
function rollback(hostNode, primitiveNode, newSubgraphInput, snapshot) {
	if (newSubgraphInput) try {
		hostNode.subgraph.removeInput(newSubgraphInput);
	} catch (e) {
		console.warn("[proxyWidgetMigration] rollback removeInput failed", e);
	}
	for (const link of snapshot) {
		const targetNode = hostNode.subgraph.getNodeById(link.targetNodeId);
		if (!targetNode) continue;
		primitiveNode.connect(link.primitiveSlot, targetNode, link.targetSlot);
	}
}
function repairPrimitive(hostNode, cohort) {
	const validated = validateCohort(cohort);
	if (!validated.ok) return failPrimitive("cohort validation failed", { cohort });
	const subgraph = hostNode.subgraph;
	const primitiveNode = subgraph.getNodeById(validated.primitiveNodeId);
	if (!primitiveNode) return failPrimitive("primitive node missing", validated);
	if (primitiveNode.type !== PRIMITIVE_NODE_TYPE) return failPrimitive("node is not a PrimitiveNode", primitiveNode.type);
	const targets = collectTargetsStrict(hostNode, primitiveNode);
	if (!targets?.length) return failPrimitive("no targets to reconnect", validated);
	const primitiveOutput = primitiveNode.outputs?.[0];
	if (!primitiveOutput) return failPrimitive("primitive has no output");
	const primitiveOutputType = String(primitiveOutput.type ?? "*");
	for (const target of targets) {
		const targetNode = subgraph.getNodeById(target.targetNodeId);
		if (!targetNode) return failPrimitive("target node missing", target);
		const targetSlot = targetNode.inputs?.[target.targetSlot];
		if (!targetSlot) return failPrimitive("target slot missing", target);
		const targetType = String(targetSlot.type ?? "*");
		if (targetType !== primitiveOutputType && targetType !== "*" && primitiveOutputType !== "*") return failPrimitive("target slot type incompatible", {
			target,
			targetType,
			primitiveOutputType
		});
	}
	const baseName = userRenamedTitle(primitiveNode) ?? validated.sourceWidgetName;
	const snapshot = (primitiveOutput.links ?? []).map((id) => subgraph.links.get(id)).filter((l) => l !== void 0 && l.target_id !== UNASSIGNED_NODE_ID).map((l) => ({
		primitiveSlot: l.origin_slot,
		targetNodeId: l.target_id,
		targetSlot: l.target_slot
	}));
	let newSubgraphInput;
	try {
		newSubgraphInput = addUniqueSubgraphInput(subgraph, baseName, primitiveOutputType);
		for (const snap of snapshot) {
			const targetNode = subgraph.getNodeById(snap.targetNodeId);
			if (!targetNode) throw new Error(`target node ${snap.targetNodeId} disappeared mid-mutation`);
			targetNode.disconnectInput(snap.targetSlot, false);
		}
		for (const target of targets) {
			const targetNode = subgraph.getNodeById(target.targetNodeId);
			if (!targetNode) throw new Error(`target node ${target.targetNodeId} disappeared`);
			const targetSlot = targetNode.inputs?.[target.targetSlot];
			if (!targetSlot) throw new Error(`target slot ${target.targetSlot} disappeared`);
			if (!newSubgraphInput.connect(targetSlot, targetNode)) throw new Error("SubgraphInput.connect returned no link");
		}
	} catch (e) {
		rollback(hostNode, primitiveNode, newSubgraphInput, snapshot);
		return failPrimitive("mutation failed; rolled back", { error: e });
	}
	const hostInput = hostNode.inputs.find((input) => input.name === newSubgraphInput.name);
	if (hostInput) {
		const valueEntry = validated.uniqueEntries.find((e) => !e.isHole);
		if (valueEntry) applyHostValueToInput(hostInput, valueEntry);
		else {
			const primitiveValue = primitiveNode.widgets?.find((w) => w.name === validated.sourceWidgetName)?.value;
			if (primitiveValue !== void 0) applyHostValueToInput(hostInput, {
				...validated.uniqueEntries[0],
				hostValue: primitiveValue,
				isHole: false
			});
		}
	}
	primitiveNode.properties ??= {};
	primitiveNode.properties[PROXY_BYPASS_MARKER_PROPERTY] = newSubgraphInput.name;
	return {
		ok: true,
		subgraphInputName: newSubgraphInput.name,
		reconnectCount: targets.length
	};
}
function migratePreview(hostNode, entry, store, plan) {
	const sourceNode = hostNode.subgraph.getNodeById(entry.normalized.sourceNodeId);
	if (!sourceNode) return {
		ok: false,
		reason: "missingSourceNode"
	};
	if (!plan.sourcePreviewName.startsWith("$$")) {
		if (!sourceNode.widgets?.find((w) => w.name === plan.sourcePreviewName)) return {
			ok: false,
			reason: "missingSourceWidget"
		};
	}
	const hostNodeLocator = String(hostNode.id);
	const existing = store.getExposures(hostNode.rootGraph.id, hostNodeLocator).find((exposure) => exposure.sourceNodeId === entry.normalized.sourceNodeId && exposure.sourcePreviewName === plan.sourcePreviewName);
	if (existing) return {
		ok: true,
		previewName: existing.name
	};
	return {
		ok: true,
		previewName: store.addExposure(hostNode.rootGraph.id, hostNodeLocator, {
			sourceNodeId: entry.normalized.sourceNodeId,
			sourcePreviewName: plan.sourcePreviewName
		}).name
	};
}
function quarantineFor(entry, reason) {
	return makeQuarantineEntry({
		originalEntry: entry.originalEntry,
		reason,
		hostValue: entry.isHole ? void 0 : entry.hostValue
	});
}
function appendQuarantine(hostNode, entries) {
	if (entries.length === 0) return;
	const merged = [...parseProxyWidgetErrorQuarantine(hostNode.properties[QUARANTINE_PROPERTY])];
	for (const candidate of entries) if (!merged.some((e) => isEqual(e.originalEntry, candidate.originalEntry))) merged.push(candidate);
	if (merged.length === 0) delete hostNode.properties[QUARANTINE_PROPERTY];
	else hostNode.properties[QUARANTINE_PROPERTY] = merged;
}
function makeQuarantineEntry(args) {
	const entry = {
		originalEntry: args.originalEntry,
		reason: args.reason,
		attemptedAtVersion: QUARANTINE_VERSION
	};
	if (args.hostValue !== void 0) entry.hostValue = args.hostValue;
	return entry;
}
//#endregion
//#region src/views/layouts/LayoutDefault.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "relative size-full overflow-hidden" };
//#endregion
//#region src/views/layouts/LayoutDefault.vue
var LayoutDefault_default = /* @__PURE__ */ defineComponent({
	__name: "LayoutDefault",
	setup(__props) {
		useFavicon("/assets/favicon.ico");
		return (_ctx, _cache) => {
			const _component_router_view = resolveComponent("router-view");
			return openBlock(), createElementBlock("main", _hoisted_1$1, [createVNode(_component_router_view)]);
		};
	}
});
//#endregion
//#region src/platform/navigation/preservedQueryTracker.ts
var installPreservedQueryTracker = (router, definitions) => {
	router.beforeEach((to, _from, next) => {
		const queryKeys = new Set(Object.keys(to.query));
		const keysToStrip = /* @__PURE__ */ new Set();
		definitions.forEach(({ namespace, keys, stripAfterCapture }) => {
			hydratePreservedQuery(namespace);
			const presentKeys = keys.filter((key) => queryKeys.has(key));
			if (presentKeys.length === 0) return;
			capturePreservedQuery(namespace, to.query, keys, { merge: stripAfterCapture });
			if (stripAfterCapture) presentKeys.forEach((key) => keysToStrip.add(key));
		});
		if (keysToStrip.size === 0) {
			next();
			return;
		}
		const cleanedQuery = { ...to.query };
		keysToStrip.forEach((key) => delete cleanedQuery[key]);
		next({
			path: to.path,
			query: cleanedQuery,
			hash: to.hash
		});
	});
};
//#endregion
//#region src/router.ts
var isFileProtocol = window.location.protocol === "file:";
/**
* Determine base path for the router.
* - Electron: always root
* - Standard web (including reverse proxy subpaths): use root path '/'
*/
function getBasePath() {
	return "/";
}
var basePath = getBasePath();
var router = createRouter({
	history: isFileProtocol ? createWebHashHistory() : createWebHistory(basePath),
	routes: [{
		path: "/",
		component: LayoutDefault_default,
		children: [{
			path: "",
			name: "GraphView",
			component: () => __vitePreload(() => import("./GraphView-DtOnTCfZ.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78]), import.meta.url),
			beforeEnter: async (_to, _from, next) => {
				const userStore = useUserStore();
				await userStore.initialize();
				if (userStore.needsLogin) next({ name: "LoginView" });
				else next();
			}
		}, {
			path: "login",
			name: "LoginView",
			component: () => __vitePreload(() => import("./LoginView-D0rdkVUB.js"), __vite__mapDeps([79,2,3,4,30,6,7,8,9,22,18,43,17,13,16,19,20,49,75]), import.meta.url)
		}]
	}],
	scrollBehavior(_to, _from, savedPosition) {
		if (savedPosition) return savedPosition;
		else return { top: 0 };
	}
});
installPreservedQueryTracker(router, [{
	namespace: PRESERVED_QUERY_NAMESPACES.TEMPLATE,
	keys: [
		"template",
		"source",
		"mode"
	]
}, {
	namespace: PRESERVED_QUERY_NAMESPACES.SHARE,
	keys: ["share"]
}]);
//#endregion
//#region src/components/ui/dialog/DialogMaximize.vue
var DialogMaximize_default = /* @__PURE__ */ defineComponent({
	__name: "DialogMaximize",
	props: { maximized: {
		type: Boolean,
		default: false
	} },
	emits: ["toggle"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createBlock(Button_default, {
				"aria-label": __props.maximized ? unref(t)("g.restoreDialog") : unref(t)("g.maximizeDialog"),
				size: "icon",
				variant: "muted-textonly",
				onClick: _cache[0] || (_cache[0] = ($event) => emit("toggle"))
			}, {
				default: withCtx(() => [createBaseVNode("i", { class: normalizeClass(__props.maximized ? "icon-[lucide--minimize-2]" : "icon-[lucide--maximize-2]") }, null, 2)]),
				_: 1
			}, 8, ["aria-label"]);
		};
	}
});
//#endregion
//#region src/components/dialog/rekaPrimeVueBridge.ts
var OUTSIDE_LAYER_SELECTORS = `.p-select-overlay, .p-colorpicker-panel, .p-popover, .p-autocomplete-overlay, .p-overlay, .p-overlay-mask, .p-dialog, [data-reka-popper-content-wrapper], [data-reka-dialog-content], [data-reka-menu-content], [data-reka-context-menu-content], [role="dialog"], [role="menu"], [role="listbox"], [role="tooltip"]`;
function isInsideOverlay(target) {
	return target instanceof Element && target.closest(OUTSIDE_LAYER_SELECTORS) !== null;
}
function onRekaPointerDownOutside(options, event, isActive = true) {
	if (!isActive) {
		event.preventDefault();
		return;
	}
	if (isInsideOverlay(event.detail.originalEvent.target)) {
		event.preventDefault();
		return;
	}
	if (options.dismissableMask === false) event.preventDefault();
}
function onRekaFocusOutside(event) {
	if (isInsideOverlay(event.detail.originalEvent.target)) event.preventDefault();
}
//#endregion
//#region src/components/dialog/GlobalDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex items-center gap-1" };
var _hoisted_2 = { key: 0 };
var _hoisted_3 = ["id"];
//#endregion
//#region src/components/dialog/GlobalDialog.vue
var GlobalDialog_default = /* @__PURE__ */ defineComponent({
	__name: "GlobalDialog",
	setup(__props) {
		const dialogStore = useDialogStore();
		function isRekaItem(item) {
			return item.dialogComponentProps.renderer === "reka";
		}
		function onRekaOpenChange(key, open) {
			if (!open) dialogStore.closeDialog({ key });
		}
		function onRekaOpenAutoFocus(event, key) {
			const autofocusEl = document.querySelector(`[aria-labelledby="${CSS.escape(key)}"]`)?.querySelector("[autofocus]");
			if (autofocusEl) {
				event.preventDefault();
				autofocusEl.focus();
			}
		}
		function toggleMaximize(item) {
			item.dialogComponentProps.maximized = !item.dialogComponentProps.maximized;
		}
		return (_ctx, _cache) => {
			return openBlock(true), createElementBlock(Fragment, null, renderList(unref(dialogStore).dialogStack, (item) => {
				return openBlock(), createElementBlock(Fragment, { key: item.key }, [isRekaItem(item) ? (openBlock(), createBlock(Dialog_default, {
					key: 0,
					open: item.visible,
					modal: item.dialogComponentProps.modal ?? true,
					"onUpdate:open": (open) => onRekaOpenChange(item.key, open)
				}, {
					default: withCtx(() => [createVNode(DialogPortal_default, null, {
						default: withCtx(() => [withDirectives(createVNode(DialogOverlay_default, { class: normalizeClass(item.dialogComponentProps.overlayClass) }, null, 8, ["class"]), [[unref(vRekaZIndex)]]), withDirectives((openBlock(), createBlock(DialogContent_default, {
							size: item.dialogComponentProps.size ?? "md",
							maximized: !!item.dialogComponentProps.maximized,
							class: normalizeClass(item.dialogComponentProps.contentClass),
							"aria-labelledby": item.key,
							onOpenAutoFocus: (e) => onRekaOpenAutoFocus(e, item.key),
							onEscapeKeyDown: (e) => item.dialogComponentProps.closeOnEscape === false && e.preventDefault(),
							onPointerDownOutside: (e) => unref(onRekaPointerDownOutside)(item.dialogComponentProps, e, unref(dialogStore).activeKey === item.key),
							onFocusOutside: unref(onRekaFocusOutside),
							onMousedown: () => unref(dialogStore).riseDialog({ key: item.key })
						}, {
							default: withCtx(() => [item.dialogComponentProps.headless ? (openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({
								key: 0,
								ref_for: true
							}, item.contentProps, { maximized: item.dialogComponentProps.maximized }), null, 16, ["maximized"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
								createVNode(DialogHeader_default, { class: normalizeClass(item.dialogComponentProps.headerClass) }, {
									default: withCtx(() => [item.headerComponent ? (openBlock(), createBlock(resolveDynamicComponent(item.headerComponent), mergeProps({
										key: 0,
										ref_for: true
									}, item.headerProps, { id: item.key }), null, 16, ["id"])) : (openBlock(), createBlock(DialogTitle_default, {
										key: 1,
										id: item.key
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(item.title || " "), 1)]),
										_: 2
									}, 1032, ["id"])), createBaseVNode("div", _hoisted_1, [item.dialogComponentProps.maximizable ? (openBlock(), createBlock(DialogMaximize_default, {
										key: 0,
										maximized: !!item.dialogComponentProps.maximized,
										onToggle: ($event) => toggleMaximize(item)
									}, null, 8, ["maximized", "onToggle"])) : createCommentVNode("", true), item.dialogComponentProps.closable !== false ? (openBlock(), createBlock(DialogClose_default, { key: 1 })) : createCommentVNode("", true)])]),
									_: 2
								}, 1032, ["class"]),
								createBaseVNode("div", { class: normalizeClass(unref(cn)("flex-1 overflow-auto px-4 py-2", item.dialogComponentProps.bodyClass)) }, [(openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.contentProps, { maximized: item.dialogComponentProps.maximized }), null, 16, ["maximized"]))], 2),
								item.footerComponent ? (openBlock(), createBlock(DialogFooter_default, {
									key: 0,
									class: normalizeClass(item.dialogComponentProps.footerClass)
								}, {
									default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(item.footerComponent), mergeProps({ ref_for: true }, item.footerProps), null, 16))]),
									_: 2
								}, 1032, ["class"])) : createCommentVNode("", true)
							], 64))]),
							_: 2
						}, 1032, [
							"size",
							"maximized",
							"class",
							"aria-labelledby",
							"onOpenAutoFocus",
							"onEscapeKeyDown",
							"onPointerDownOutside",
							"onFocusOutside",
							"onMousedown"
						])), [[unref(vRekaZIndex)]])]),
						_: 2
					}, 1024)]),
					_: 2
				}, 1032, [
					"open",
					"modal",
					"onUpdate:open"
				])) : (openBlock(), createBlock(unref(script), mergeProps({
					key: 1,
					visible: item.visible,
					"onUpdate:visible": ($event) => item.visible = $event,
					class: "global-dialog"
				}, { ref_for: true }, item.dialogComponentProps, { "aria-labelledby": item.key }), createSlots({
					header: withCtx(() => [!item.dialogComponentProps?.headless ? (openBlock(), createElementBlock("div", _hoisted_2, [item.headerComponent ? (openBlock(), createBlock(resolveDynamicComponent(item.headerComponent), mergeProps({
						key: 0,
						ref_for: true
					}, item.headerProps, { id: item.key }), null, 16, ["id"])) : (openBlock(), createElementBlock("h3", {
						key: 1,
						id: item.key
					}, toDisplayString(item.title || " "), 9, _hoisted_3))])) : createCommentVNode("", true)]),
					default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(item.component), mergeProps({ ref_for: true }, item.contentProps, { maximized: item.dialogComponentProps.maximized }), null, 16, ["maximized"]))]),
					_: 2
				}, [item.footerComponent ? {
					name: "footer",
					fn: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(item.footerComponent), mergeProps({ ref_for: true }, item.footerProps), null, 16))]),
					key: "0"
				} : void 0]), 1040, [
					"visible",
					"onUpdate:visible",
					"aria-labelledby"
				]))], 64);
			}), 128);
		};
	}
});
//#endregion
//#region src/utils/preloadErrorUtil.ts
var CSS_PRELOAD_RE = /Unable to preload CSS for (.+)/;
var JS_DYNAMIC_IMPORT_RE = /Failed to fetch dynamically imported module:\s*(.+)/;
var URL_FALLBACK_RE = /https?:\/\/[^\s"')]+/;
var FONT_EXTENSIONS = new Set([
	"woff",
	"woff2",
	"ttf",
	"otf",
	"eot"
]);
var IMAGE_EXTENSIONS = new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"svg",
	"webp",
	"avif",
	"ico"
]);
function extractUrl(message) {
	const cssMatch = message.match(CSS_PRELOAD_RE);
	if (cssMatch) return cssMatch[1].trim();
	const jsMatch = message.match(JS_DYNAMIC_IMPORT_RE);
	if (jsMatch) return jsMatch[1].trim();
	const fallbackMatch = message.match(URL_FALLBACK_RE);
	if (fallbackMatch) return fallbackMatch[0];
	return null;
}
function detectFileType(url) {
	const ext = new URL(url, "https://cloud.comfy.org").pathname.split(".").pop()?.toLowerCase();
	if (!ext) return "unknown";
	const cleanExt = ext.split("?")[0];
	if (cleanExt === "js" || cleanExt === "mjs") return "js";
	if (cleanExt === "css") return "css";
	if (FONT_EXTENSIONS.has(cleanExt)) return "font";
	if (IMAGE_EXTENSIONS.has(cleanExt)) return "image";
	return "unknown";
}
function extractChunkName(url) {
	const filename = new URL(url, "https://cloud.comfy.org").pathname.split("/").pop();
	if (!filename) return null;
	return filename.replace(/\.[^.]+$/, "").replace(/-[a-f0-9]{6,}$/, "") || null;
}
function parsePreloadError(error) {
	const message = error.message || String(error);
	const url = extractUrl(message);
	return {
		url,
		fileType: url ? detectFileType(url) : "unknown",
		chunkName: url ? extractChunkName(url) : null,
		message
	};
}
//#endregion
//#region src/App.vue
var App_default = /* @__PURE__ */ defineComponent({
	__name: "App",
	setup(__props) {
		const workspaceStore = useWorkspaceStore();
		app$1.extensionManager = useWorkspaceStore();
		const conflictDetection = useConflictDetection();
		const isLoading = computed(() => workspaceStore.spinner);
		watch(isLoading, (loading, prevLoading) => {
			if (prevLoading && !loading) document.getElementById("splash-loader")?.remove();
		}, { flush: "post" });
		const showContextMenu = (event) => {
			const { target } = event;
			switch (true) {
				case target instanceof HTMLTextAreaElement:
				case target instanceof HTMLInputElement && target.type === "text":
					electronAPI()?.showContextMenu({ type: "text" });
					return;
			}
		};
		onMounted(() => {
			window["__COMFYUI_FRONTEND_VERSION__"] = config_default.app_version;
			if (isDesktop) document.addEventListener("contextmenu", showContextMenu);
			window.addEventListener("vite:preloadError", (event) => {
				event.preventDefault();
				const info = parsePreloadError(event.payload);
				console.error("[vite:preloadError]", {
					url: info.url,
					fileType: info.fileType,
					chunkName: info.chunkName,
					message: info.message
				});
			});
			conflictDetection.initializeConflictDetection();
		});
		return (_ctx, _cache) => {
			const _component_router_view = resolveComponent("router-view");
			return openBlock(), createElementBlock(Fragment, null, [
				createVNode(_component_router_view),
				createVNode(GlobalDialog_default),
				createVNode(unref(script$1), {
					"full-screen": "",
					blocked: isLoading.value
				}, null, 8, ["blocked"])
			], 64);
		};
	}
});
//#endregion
//#region src/main.ts
if (Boolean(window.__comfyDesktop2?.Telemetry)) {
	const { initHostTelemetry } = await __vitePreload(async () => {
		const { initHostTelemetry } = await import("./initHostTelemetry-DSP5Ln4m.js");
		return { initHostTelemetry };
	}, __vite__mapDeps([80,2,12,4,42,47,81,20]), import.meta.url);
	initHostTelemetry();
}
var ComfyUIPreset = definePreset(index, { semantic: { primary: index["primitive"].blue } });
var app = createApp(App_default);
var pinia = createPinia();
init({
	app,
	dsn: "",
	enabled: false,
	release: "1.47.6",
	normalizeDepth: 8,
	integrations: [],
	autoSessionTracking: false,
	defaultIntegrations: false
});
setAssertReporter((message) => {
	if (isDesktop) captureMessage(message, { level: "warning" });
});
app.directive("tooltip", Tooltip);
app.use(router).use(PrimeVue, {
	zIndex: {
		modal: 1800,
		overlay: 1800,
		menu: 1800,
		tooltip: 2e3
	},
	theme: {
		preset: ComfyUIPreset,
		options: {
			prefix: "p",
			cssLayer: {
				name: "primevue",
				order: "theme, base, primevue"
			},
			darkModeSelector: ".dark-theme, :root:has(.dark-theme)"
		}
	}
}).use(ToastService).use(pinia).use(i18n);
LGraph.proxyWidgetMigrationFlush = (hostNode, nodeData) => flushProxyWidgetMigration({
	hostNode,
	hostWidgetValues: nodeData?.widgets_values
});
LGraph.autoExposePreviewNodes = (hostNode) => autoExposeKnownPreviewNodes(hostNode);
useBootstrapStore(pinia).startStoreBootstrap();
app.mount("#vue-app");
//#endregion

//# sourceMappingURL=index-DiPtueSz.js.map