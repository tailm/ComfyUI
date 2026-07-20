import "./rolldown-runtime-w0pxe0c8.js";
import { w as useImage } from "./vendor-vueuse-D8rwdKM0.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { b as isCivitaiUrl } from "./formatUtil-NyC-AHAf.js";
//#region src/platform/assets/utils/assetMetadataUtils.ts
/**
* Type-safe utilities for extracting metadata from assets.
* These utilities check user_metadata first, then metadata, then fallback.
*/
/**
* Helper to get a string property from user_metadata or metadata
*/
function getStringProperty(asset, key) {
	const userValue = asset.user_metadata?.[key];
	if (typeof userValue === "string") return userValue;
	const metaValue = asset.metadata?.[key];
	if (typeof metaValue === "string") return metaValue;
}
/**
* Safely extracts string description from asset metadata
* Checks user_metadata first, then metadata, then returns null
* @param asset - The asset to extract description from
* @returns The description string or null if not present/not a string
*/
function getAssetDescription(asset) {
	return getStringProperty(asset, "description") ?? null;
}
/**
* Extracts base models as an array from asset metadata
* Checks user_metadata first, then metadata, then returns empty array
* @param asset - The asset to extract base models from
* @returns Array of base model strings
*/
function getAssetBaseModels(asset) {
	const baseModel = asset.user_metadata?.base_model ?? asset.metadata?.base_model;
	if (Array.isArray(baseModel)) return baseModel.filter((m) => typeof m === "string");
	if (typeof baseModel === "string" && baseModel) return [baseModel];
	return [];
}
/**
* Gets the display name for an asset
* Checks user_metadata.name, then metadata.name, then display_name, then asset.name
* @param asset - The asset to get display name from
* @returns The display name
*/
function getAssetDisplayName(asset) {
	return getStringProperty(asset, "name") || asset.display_name || asset.name;
}
/**
* Constructs source URL from asset's source_arn
* @param asset - The asset to extract source URL from
* @returns The source URL or null if not present/parseable
*/
function getAssetSourceUrl(asset) {
	if (typeof asset.metadata?.repo_url === "string") return asset.metadata.repo_url;
	const sourceArn = asset.metadata?.source_arn ?? asset.user_metadata?.source_arn;
	if (typeof sourceArn !== "string") return null;
	const civitaiMatch = sourceArn.match(/^civitai:model:(\d+):version:(\d+)(?::file:\d+)?$/);
	if (civitaiMatch) {
		const [, modelId, versionId] = civitaiMatch;
		return `https://civitai.com/models/${modelId}?modelVersionId=${versionId}`;
	}
	return null;
}
/**
* Extracts trigger phrases from asset metadata
* Checks user_metadata first, then metadata, then returns empty array
* @param asset - The asset to extract trigger phrases from
* @returns Array of trigger phrases
*/
function getAssetTriggerPhrases(asset) {
	const phrases = asset.user_metadata?.trained_words ?? asset.metadata?.trained_words;
	if (Array.isArray(phrases)) return phrases.filter((p) => typeof p === "string");
	if (typeof phrases === "string") return [phrases];
	return [];
}
/**
* Extracts additional tags from asset user_metadata
* @param asset - The asset to extract tags from
* @returns Array of user-defined tags
*/
function getAssetAdditionalTags(asset) {
	const tags = asset.user_metadata?.additional_tags;
	if (Array.isArray(tags)) return tags.filter((t) => typeof t === "string");
	return [];
}
/**
* Determines the source name from a URL
* @param url - The source URL
* @returns Human-readable source name
*/
function getSourceName(url) {
	if (isCivitaiUrl(url)) return "Civitai";
	try {
		const hostname = new URL(url).hostname.toLowerCase();
		if (hostname === "huggingface.co" || hostname.endsWith(".huggingface.co")) return "Hugging Face";
	} catch {}
	return "Source";
}
/**
* Extracts the model type from asset tags
* @param asset - The asset to extract model type from
* @returns The model type string or null if not present
*/
function getAssetModelType(asset) {
	return asset.tags?.find((tag) => tag && tag !== "models") ?? null;
}
/**
* Extracts user description from asset user_metadata
* @param asset - The asset to extract user description from
* @returns The user description string or empty string if not present
*/
function getAssetUserDescription(asset) {
	return typeof asset.user_metadata?.user_description === "string" ? asset.user_metadata.user_description : "";
}
/**
* Gets the filename for an asset with fallback chain
* Checks user_metadata.filename first, then metadata.filename, then asset.name.
* Use this for serialized/identifier contexts (workflow widget values,
* filename schema validation, missing-model matching) where we need the
* canonical filename and MUST NOT substitute a display-only string.
*/
function getAssetFilename(asset) {
	return getStringProperty(asset, "filename") ?? asset.name;
}
/**
* Resolves the filename that addresses an asset's *bytes* in storage — use
* this to build the path a backend resolves to a real file (the
* `createAnnotatedPath` input behind `/view` requests and widget values),
* never to show the user. Cloud is content-addressed, so it returns the
* content hash (`hash`); OSS is filesystem-backed, so it returns `name`.
*
* For a human-readable label use {@link getAssetDisplayFilename}; for a
* serialized identifier (matching, validation) use {@link getAssetFilename}.
*
* TODO(BE-933/934): collapse to `asset.file_path ?? asset.name`.
*/
function getAssetStoredFilename(asset) {
	return isCloud && asset.hash ? asset.hash : asset.name;
}
/**
* Gets the human-readable filename to render in UI surfaces.
* Fallback chain: user_metadata.filename → metadata.filename →
* asset.display_name → asset.name.
*
* `display_name` is populated by queue output mappers in Cloud where
* `asset.name` is a content hash. Use this helper for labels/titles only;
* for serialized identifiers use {@link getAssetFilename}.
*/
function getAssetDisplayFilename(asset) {
	return getStringProperty(asset, "filename") ?? asset.display_name ?? asset.name;
}
/**
* Gets the title to render on an asset browser card / delete confirmation.
* Prefers a user-curated name (user_metadata.name / metadata.name) when it
* actually differs from asset.name, so a user-renamed model keeps its
* display name. Falls through to {@link getAssetDisplayFilename} when the
* curated name is absent or equal to asset.name (Cloud hash case).
*/
function getAssetCardTitle(asset) {
	const curatedName = getStringProperty(asset, "name");
	if (curatedName && curatedName !== asset.name) return curatedName;
	return getAssetDisplayFilename(asset);
}
/**
* Type guard: a pixel dimension is a finite positive integer. `metadata` is
* typed as `Record<string, unknown>`, so `typeof === 'number'` alone admits
* NaN, Infinity, 0, negatives, and fractional values.
*/
function isValidDimension(value) {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}
/**
* Returns the original image dimensions from `asset.metadata.{width,height}`
* when both pass shape validation, otherwise `undefined`. Callers should fall
* back to the locally-computed `<img>.naturalWidth/Height`, which is correct
* on runtimes that serve the original file but reports preview size on
* runtimes that serve a downscaled preview.
*/
function getAssetMetadataDimensions(asset) {
	const w = asset?.metadata?.width;
	const h = asset?.metadata?.height;
	if (isValidDimension(w) && isValidDimension(h)) return {
		width: w,
		height: h
	};
}
/**
* Resolves the image dimensions an asset card should display.
*
* Prefers the server-provided original dimensions from
* {@link getAssetMetadataDimensions}. Only when those are absent does it fall
* back to `renderedNaturalSize` — the natural size of the `<img>` the card
* actually rendered — and only when that rendered image was the original file.
*
* A distinct `thumbnail_url` (one that differs from `preview_url`) means the
* card rendered a downscaled preview, so `renderedNaturalSize` reflects the
* preview's dimensions rather than the asset's. In that case this returns
* `undefined` so the card shows no label rather than a wrong resolution.
* On OSS, `thumbnail_url` and `preview_url` are the same URL (full-res),
* so the guard correctly passes through `renderedNaturalSize`.
*/
function resolveDisplayImageDimensions(asset, renderedNaturalSize) {
	const fromMetadata = getAssetMetadataDimensions(asset);
	if (fromMetadata) return fromMetadata;
	if (asset?.thumbnail_url && asset.thumbnail_url !== asset.preview_url) return void 0;
	return renderedNaturalSize;
}
/**
* Returns the filename component the cloud `/api/view` endpoint resolves
* for this asset — `hash` when present (cloud assets are hash-keyed
* in storage), otherwise `asset.name`. Use this when constructing widget
* values or media URLs that must round-trip through the view endpoint.
*/
function getAssetUrlFilename(asset) {
	return asset.hash ?? asset.name;
}
//#endregion
//#region src/composables/useImageQuiet.ts
/**
* `useImage()` that handles load failures quietly.
*
* `useImage()` already surfaces failures via its returned `error` ref (callers
* render a fallback). By default vueuse ALSO forwards the error to
* `globalThis.reportError`, which our error monitoring (Datadog RUM) captures as
* an unhandled error for every broken image — 404'd thumbnails, expired share
* links, in-app browsers that re-fetch in a loop. Broken images are expected,
* not bugs, so handle the failure here instead of letting it surface globally.
* The returned `error` ref behaviour is unchanged.
*
* `asyncStateOptions` is forwarded to `useImage`, so callers can still tune the
* other `useAsyncState` fields; only `onError` is fixed to the quiet default.
*/
function useImageQuiet(options, asyncStateOptions) {
	return useImage(options, {
		...asyncStateOptions,
		onError: () => {}
	});
}
//#endregion
export { getAssetDescription as a, getAssetFilename as c, getAssetStoredFilename as d, getAssetTriggerPhrases as f, resolveDisplayImageDimensions as g, getSourceName as h, getAssetCardTitle as i, getAssetModelType as l, getAssetUserDescription as m, getAssetAdditionalTags as n, getAssetDisplayFilename as o, getAssetUrlFilename as p, getAssetBaseModels as r, getAssetDisplayName as s, useImageQuiet as t, getAssetSourceUrl as u };

//# sourceMappingURL=useImageQuiet-CGqH69n-.js.map