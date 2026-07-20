import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, ct as resolveDirective, gt as watch, j as createBaseVNode, jt as ref, rt as openBlock, xt as withDirectives, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { L as partition } from "./vendor-other-qm2HQOWV.js";
import { C as app, Jr as assetService, kn as Skeleton_default, mn as buildTooltipConfig } from "./promotionUtils-DLM4TsXW.js";
import { o as zAssetInfo, r as api, s as zComfyHubProfile } from "./api-DIYghw4R.js";
import { _ as recordType, a as arrayType, g as preprocessType, h as objectType, l as enumType, o as booleanType, v as stringType, x as unknownType } from "./vendor-zod-BwmrqdWK.js";
import { Mt as CollapsibleTrigger_default, Nt as CollapsibleContent_default, Pt as CollapsibleRoot_default } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as useImageQuiet } from "./useImageQuiet-CGqH69n-.js";
//#region src/platform/workflow/sharing/schemas/shareSchemas.ts
var zPublishRecordResponse = objectType({
	workflow_id: stringType(),
	share_id: stringType().nullable(),
	listed: booleanType(),
	publish_time: stringType().nullable(),
	assets: arrayType(zAssetInfo).optional()
});
var zPrefillTagList = arrayType(objectType({
	name: stringType(),
	display_name: stringType()
}).transform((label) => label.display_name).or(stringType()).optional().catch(void 0)).transform((tags) => tags.filter((tag) => tag !== void 0));
var zHubWorkflowPrefillResponse = objectType({
	description: stringType().nullish(),
	tags: zPrefillTagList.nullish(),
	sample_image_urls: arrayType(stringType()).nullish(),
	thumbnail_type: enumType([
		"image",
		"video",
		"image_comparison"
	]).nullish(),
	thumbnail_url: stringType().nullish(),
	thumbnail_comparison_url: stringType().nullish()
});
/**
* Strips path separators and control characters from a workflow name to prevent
* path traversal when the name is later used as part of a file path.
*/
function sanitizeWorkflowName(name) {
	return name.replaceAll(/[/\\:]/g, "_").slice(0, 200).trim();
}
var zSharedWorkflowResponse = objectType({
	share_id: stringType(),
	workflow_id: stringType(),
	name: stringType().transform(sanitizeWorkflowName),
	listed: booleanType(),
	publish_time: stringType().nullable(),
	workflow_json: recordType(stringType(), unknownType()),
	assets: arrayType(zAssetInfo)
});
var zHubProfileResponse = preprocessType((data) => {
	if (!data || typeof data !== "object") return data;
	const d = data;
	return {
		username: d.username,
		name: d.name ?? d.display_name,
		description: d.description,
		coverImageUrl: d.coverImageUrl ?? d.cover_image_url,
		profilePictureUrl: d.profilePictureUrl ?? d.profile_picture_url ?? d.avatar_url
	};
}, zComfyHubProfile);
var zHubAssetUploadUrlResponse = objectType({
	upload_url: stringType(),
	public_url: stringType(),
	token: stringType()
}).transform((response) => ({
	uploadUrl: response.upload_url,
	publicUrl: response.public_url,
	token: response.token
}));
var zHubWorkflowPublishResponse = objectType({
	share_id: stringType(),
	workflow_id: stringType(),
	thumbnail_type: enumType([
		"image",
		"video",
		"image_comparison"
	]).optional()
});
var zHubLabelListResponse = objectType({ labels: arrayType(objectType({
	name: stringType(),
	display_name: stringType(),
	type: enumType([
		"tag",
		"model",
		"custom_node"
	])
})) });
//#endregion
//#region src/platform/workflow/sharing/components/ShareAssetThumbnail.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted" };
var _hoisted_2$1 = ["src", "alt"];
var _hoisted_3$1 = {
	key: 2,
	class: "icon-[lucide--image] size-4 text-muted-foreground"
};
//#endregion
//#region src/platform/workflow/sharing/components/ShareAssetThumbnail.vue
var ShareAssetThumbnail_default = /* @__PURE__ */ defineComponent({
	__name: "ShareAssetThumbnail",
	props: {
		name: {},
		previewUrl: {}
	},
	emits: ["thumbnailError"],
	setup(__props) {
		const normalizedPreviewUrl = computed(() => {
			if (typeof __props.previewUrl !== "string" || __props.previewUrl.length === 0) return null;
			try {
				const url = new URL(__props.previewUrl, window.location.origin);
				if (!url.origin.includes("googleapis") && url.searchParams.has("filename") && !url.searchParams.has("res")) url.searchParams.set("res", "256");
				return url.toString();
			} catch {
				return __props.previewUrl;
			}
		});
		const { isReady, isLoading, error } = useImageQuiet(computed(() => ({ src: normalizedPreviewUrl.value ?? "" })));
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				normalizedPreviewUrl.value && unref(isLoading) ? (openBlock(), createBlock(Skeleton_default, {
					key: 0,
					class: "absolute inset-0"
				})) : createCommentVNode("", true),
				normalizedPreviewUrl.value && !unref(error) ? (openBlock(), createElementBlock("img", {
					key: 1,
					src: normalizedPreviewUrl.value,
					alt: __props.name,
					class: normalizeClass(unref(cn)("size-full object-cover transition-opacity duration-200", unref(isReady) ? "opacity-100" : "opacity-0")),
					onError: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("thumbnailError", {
						name: __props.name,
						previewUrl: normalizedPreviewUrl.value
					}))
				}, null, 42, _hoisted_2$1)) : createCommentVNode("", true),
				!normalizedPreviewUrl.value || unref(error) ? (openBlock(), createElementBlock("i", _hoisted_3$1)) : createCommentVNode("", true)
			]);
		};
	}
});
//#endregion
//#region src/platform/workflow/sharing/composables/useAssetSections.ts
function useAssetSections(items) {
	const sections = computed(() => {
		const [models, media] = partition(items(), (a) => a.model);
		return [{
			id: "media",
			labelKey: "shareWorkflow.mediaLabel",
			items: media
		}, {
			id: "models",
			labelKey: "shareWorkflow.modelsLabel",
			items: models
		}].filter((s) => s.items.length > 0);
	});
	const expandedSectionId = ref(null);
	function getDefaultExpandedSection(availableSections) {
		if (availableSections.length === 0) return null;
		return availableSections.find((s) => s.id === "media")?.id ?? availableSections[0].id;
	}
	watch(sections, (availableSections) => {
		if (availableSections.some((s) => s.id === expandedSectionId.value)) return;
		expandedSectionId.value = getDefaultExpandedSection(availableSections);
	}, { immediate: true });
	function onSectionOpenChange(sectionId, open) {
		if (open) {
			expandedSectionId.value = sectionId;
			return;
		}
		if (expandedSectionId.value === sectionId) expandedSectionId.value = null;
	}
	return {
		sections,
		expandedSectionId,
		onSectionOpenChange
	};
}
//#endregion
//#region src/platform/workflow/sharing/components/AssetSectionList.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex flex-col gap-1" };
var _hoisted_2 = { class: "max-h-25 overflow-y-auto px-6 pt-0.5 pb-1" };
var _hoisted_3 = { class: "truncate text-xs text-base-foreground" };
var _hoisted_4 = {
	key: 0,
	class: "ml-auto shrink-0 text-xs text-muted-foreground"
};
//#endregion
//#region src/platform/workflow/sharing/components/AssetSectionList.vue
var AssetSectionList_default = /* @__PURE__ */ defineComponent({
	__name: "AssetSectionList",
	props: { items: {} },
	setup(__props) {
		const { sections, expandedSectionId, onSectionOpenChange } = useAssetSections(() => __props.items);
		function onThumbnailError(name, previewUrl) {
			console.warn("[share][assets][thumbnail-error]", {
				name,
				previewUrl: previewUrl ?? null
			});
		}
		return (_ctx, _cache) => {
			const _directive_tooltip = resolveDirective("tooltip");
			return openBlock(), createElementBlock("div", _hoisted_1, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(sections), (section) => {
				return openBlock(), createBlock(unref(CollapsibleRoot_default), {
					key: section.id,
					class: "overflow-hidden rounded-sm",
					open: unref(expandedSectionId) === section.id,
					"onUpdate:open": ($event) => unref(onSectionOpenChange)(section.id, $event)
				}, {
					default: withCtx(() => [createVNode(unref(CollapsibleTrigger_default), { "as-child": "" }, {
						default: withCtx(() => [createVNode(Button_default, {
							"data-testid": `section-header-${section.id}`,
							"aria-expanded": unref(expandedSectionId) === section.id,
							"aria-controls": `section-content-${section.id}`,
							variant: "secondary",
							class: "w-full justify-between px-6 py-1"
						}, {
							default: withCtx(() => [createBaseVNode("span", null, toDisplayString(_ctx.$t(section.labelKey, section.items.length)), 1), createBaseVNode("i", { class: normalizeClass(unref(cn)("icon-[lucide--chevron-right] size-4 text-muted-foreground transition-transform", unref(expandedSectionId) === section.id && "rotate-90")) }, null, 2)]),
							_: 2
						}, 1032, [
							"data-testid",
							"aria-expanded",
							"aria-controls"
						])]),
						_: 2
					}, 1024), createVNode(unref(CollapsibleContent_default), {
						id: `section-content-${section.id}`,
						"data-testid": `section-content-${section.id}`,
						class: "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
					}, {
						default: withCtx(() => [createBaseVNode("ul", _hoisted_2, [(openBlock(true), createElementBlock(Fragment, null, renderList(section.items, (item) => {
							return openBlock(), createElementBlock("li", {
								key: item.id,
								class: "flex items-center gap-2 rounded-sm py-1"
							}, [
								createVNode(ShareAssetThumbnail_default, {
									name: item.name,
									"preview-url": item.preview_url,
									onThumbnailError: _cache[0] || (_cache[0] = ($event) => onThumbnailError($event.name, $event.previewUrl))
								}, null, 8, ["name", "preview-url"]),
								withDirectives((openBlock(), createElementBlock("span", _hoisted_3, [createTextVNode(toDisplayString(item.name), 1)])), [[_directive_tooltip, unref(buildTooltipConfig)(item.name)]]),
								item.in_library ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(_ctx.$t("shareWorkflow.inLibrary")), 1)) : createCommentVNode("", true)
							]);
						}), 128))])]),
						_: 2
					}, 1032, ["id", "data-testid"])]),
					_: 2
				}, 1032, ["open", "onUpdate:open"]);
			}), 128))]);
		};
	}
});
//#endregion
//#region src/platform/workflow/sharing/services/workflowShareService.ts
var SharedWorkflowLoadError = class extends Error {
	status;
	constructor(status, message) {
		super(message ?? `Failed to load shared workflow: ${status ?? "unknown"}`);
		this.name = "SharedWorkflowLoadError";
		this.status = status;
	}
	get isRetryable() {
		if (this.status === null) return true;
		return this.status >= 500 || this.status === 408 || this.status === 429;
	}
};
function mapApiThumbnailType(value) {
	if (!value) return void 0;
	if (value === "image_comparison") return "imageComparison";
	return value;
}
function extractPrefill(fields) {
	const description = fields.description ?? void 0;
	const tags = fields.tags ?? void 0;
	const thumbnailType = mapApiThumbnailType(fields.thumbnail_type);
	const thumbnailUrl = fields.thumbnail_url ?? void 0;
	const thumbnailComparisonUrl = fields.thumbnail_comparison_url ?? void 0;
	const sampleImageUrls = fields.sample_image_urls ?? void 0;
	if (!description && !tags?.length && !thumbnailType && !thumbnailUrl && !thumbnailComparisonUrl && !sampleImageUrls?.length) return null;
	return {
		description,
		tags,
		thumbnailType,
		thumbnailUrl,
		thumbnailComparisonUrl,
		sampleImageUrls
	};
}
function decodeHubWorkflowPrefill(payload) {
	const result = zHubWorkflowPrefillResponse.safeParse(payload);
	if (!result.success) return null;
	return extractPrefill(result.data);
}
function decodePublishRecord(payload) {
	const result = zPublishRecordResponse.safeParse(payload);
	if (!result.success) return null;
	const r = result.data;
	return {
		workflowId: r.workflow_id,
		shareId: r.share_id ?? void 0,
		listed: r.listed,
		publishedAt: parsePublishedAt(r.publish_time),
		shareUrl: r.share_id ? normalizeShareUrl(r.share_id) : void 0,
		prefill: null
	};
}
function parsePublishedAt(value) {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function normalizeShareUrl(shareId) {
	const queryString = `share=${encodeURIComponent(shareId)}`;
	if (typeof window === "undefined" || !window.location?.origin) return `/?${queryString}`;
	const normalizedUrl = new URL(window.location.href);
	normalizedUrl.search = queryString;
	normalizedUrl.hash = "";
	return normalizedUrl.toString();
}
function decodeSharedWorkflowPayload(payload) {
	const result = zSharedWorkflowResponse.safeParse(payload);
	if (!result.success) return null;
	const r = result.data;
	return {
		shareId: r.share_id,
		workflowId: r.workflow_id,
		name: r.name,
		listed: r.listed,
		publishedAt: r.publish_time ? parsePublishedAt(r.publish_time) : null,
		workflowJson: r.workflow_json,
		assets: r.assets
	};
}
var UNPUBLISHED = {
	isPublished: false,
	shareId: null,
	shareUrl: null,
	publishedAt: null,
	prefill: null
};
function useWorkflowShareService() {
	async function fetchHubWorkflowPrefill(shareId) {
		const response = await api.fetchApi(`/hub/workflows/${encodeURIComponent(shareId)}`);
		if (!response.ok) throw new Error(`Failed to fetch hub workflow details: ${response.status}`);
		return decodeHubWorkflowPrefill(await response.json());
	}
	async function publishWorkflow(workflowPath, shareableAssets) {
		const assetIds = shareableAssets.map((a) => a.id);
		const response = await api.fetchApi(`/userdata/${encodeURIComponent(workflowPath)}/publish`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ asset_ids: assetIds })
		});
		if (!response.ok) throw new Error(`Failed to publish workflow: ${response.status}`);
		const record = decodePublishRecord(await response.json());
		if (!record?.shareId || !record.publishedAt) throw new Error("Failed to publish workflow: invalid response");
		return {
			shareId: record.shareId,
			shareUrl: normalizeShareUrl(record.shareId),
			publishedAt: record.publishedAt
		};
	}
	async function getPublishStatus(workflowPath) {
		const response = await api.fetchApi(`/userdata/${encodeURIComponent(workflowPath)}/publish`);
		if (!response.ok) {
			if (response.status === 404) return UNPUBLISHED;
			throw new Error(`Failed to fetch publish status: ${response.status} ${response.statusText}`);
		}
		const record = decodePublishRecord(await response.json());
		if (!record || !record.shareId || !record.publishedAt) return UNPUBLISHED;
		let prefill = record.prefill;
		if (!prefill && record.listed) try {
			prefill = await fetchHubWorkflowPrefill(record.shareId);
		} catch {
			prefill = null;
		}
		return {
			isPublished: true,
			shareId: record.shareId,
			shareUrl: normalizeShareUrl(record.shareId),
			publishedAt: record.publishedAt,
			prefill
		};
	}
	async function getShareableAssets(includingPublic = false) {
		const graph = app.rootGraph;
		if (!graph) return [];
		const { output } = await app.graphToPrompt(graph);
		const { assets } = await api.getShareableAssets(output);
		return includingPublic ? assets : assets.filter((asset) => !asset.public);
	}
	async function getSharedWorkflow(shareId) {
		let response;
		try {
			response = await api.fetchApi(`/workflows/published/${encodeURIComponent(shareId)}`);
		} catch {
			throw new SharedWorkflowLoadError(null, "Failed to load shared workflow: network error");
		}
		if (!response.ok) throw new SharedWorkflowLoadError(response.status);
		const workflow = decodeSharedWorkflowPayload(await response.json());
		if (!workflow) throw new Error("Failed to load shared workflow: invalid response");
		return workflow;
	}
	async function importPublishedAssets(assetIds, shareId) {
		const body = {
			published_asset_ids: assetIds,
			...shareId ? { share_id: shareId } : {}
		};
		const response = await api.fetchApi("/assets/import", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		if (!response.ok) throw new Error(`Failed to import assets: ${response.status}`);
		assetService.invalidateInputAssetsIncludingPublic();
	}
	return {
		publishWorkflow,
		getPublishStatus,
		getShareableAssets,
		getSharedWorkflow,
		importPublishedAssets
	};
}
//#endregion
export { zHubProfileResponse as a, zHubLabelListResponse as i, AssetSectionList_default as n, zHubWorkflowPublishResponse as o, zHubAssetUploadUrlResponse as r, useWorkflowShareService as t };

//# sourceMappingURL=workflowShareService-BujMfsa6.js.map