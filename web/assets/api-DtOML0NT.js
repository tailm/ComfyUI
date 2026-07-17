import "./rolldown-runtime-w0pxe0c8.js";
import { jt as ref } from "./vendor-vue-core-ywZ1En3W.js";
import { H as trimEnd, St as get } from "./vendor-other-DslE47pR.js";
import { C as ZodIssueCode, _ as recordType, a as arrayType, b as unionType, d as literalType, f as nativeEnumType, h as objectType, i as anyType, l as enumType, m as numberType, o as booleanType, t as fromZodError, u as lazyType, v as stringType, x as unknownType, y as tupleType } from "./vendor-zod-BwmrqdWK.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import { t as axios } from "./vendor-axios-BWFjRHOY.js";
import { t as getDevOverride } from "./devFeatureFlagOverride-C_h7DxV8.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
//#region src/lib/litegraph/src/types/globalEnums.ts
/** Node slot type - input or output */
var NodeSlotType = /* @__PURE__ */ function(NodeSlotType) {
	NodeSlotType[NodeSlotType["INPUT"] = 1] = "INPUT";
	NodeSlotType[NodeSlotType["OUTPUT"] = 2] = "OUTPUT";
	return NodeSlotType;
}({});
/** Shape that an object will render as - used by nodes and slots */
var RenderShape = /* @__PURE__ */ function(RenderShape) {
	/** Rectangle with square corners */
	RenderShape[RenderShape["BOX"] = 1] = "BOX";
	/** Rounded rectangle */
	RenderShape[RenderShape["ROUND"] = 2] = "ROUND";
	/** Circle is circle */
	RenderShape[RenderShape["CIRCLE"] = 3] = "CIRCLE";
	/** Two rounded corners: top left & bottom right */
	RenderShape[RenderShape["CARD"] = 4] = "CARD";
	/** Slot shape: Arrow */
	RenderShape[RenderShape["ARROW"] = 5] = "ARROW";
	/** Slot shape: Grid */
	RenderShape[RenderShape["GRID"] = 6] = "GRID";
	/** Slot shape: Hollow circle  */
	RenderShape[RenderShape["HollowCircle"] = 7] = "HollowCircle";
	return RenderShape;
}({});
/** Bit flags used to indicate what the pointer is currently hovering over. */
var CanvasItem = /* @__PURE__ */ function(CanvasItem) {
	/** No items / none */
	CanvasItem[CanvasItem["Nothing"] = 0] = "Nothing";
	/** At least one node */
	CanvasItem[CanvasItem["Node"] = 1] = "Node";
	/** At least one group */
	CanvasItem[CanvasItem["Group"] = 2] = "Group";
	/** A reroute (not its path) */
	CanvasItem[CanvasItem["Reroute"] = 4] = "Reroute";
	/** The path of a link */
	CanvasItem[CanvasItem["Link"] = 8] = "Link";
	/** A reroute slot */
	CanvasItem[CanvasItem["RerouteSlot"] = 32] = "RerouteSlot";
	/** A subgraph input or output node */
	CanvasItem[CanvasItem["SubgraphIoNode"] = 64] = "SubgraphIoNode";
	/** A subgraph input or output slot */
	CanvasItem[CanvasItem["SubgraphIoSlot"] = 128] = "SubgraphIoSlot";
	return CanvasItem;
}({});
/** The direction that a link point will flow towards - e.g. horizontal outputs are right by default */
var LinkDirection = /* @__PURE__ */ function(LinkDirection) {
	LinkDirection[LinkDirection["NONE"] = 0] = "NONE";
	LinkDirection[LinkDirection["UP"] = 1] = "UP";
	LinkDirection[LinkDirection["DOWN"] = 2] = "DOWN";
	LinkDirection[LinkDirection["LEFT"] = 3] = "LEFT";
	LinkDirection[LinkDirection["RIGHT"] = 4] = "RIGHT";
	LinkDirection[LinkDirection["CENTER"] = 5] = "CENTER";
	return LinkDirection;
}({});
/** The path calculation that links follow */
var LinkRenderType = /* @__PURE__ */ function(LinkRenderType) {
	LinkRenderType[LinkRenderType["HIDDEN_LINK"] = -1] = "HIDDEN_LINK";
	/** Juts out from the input & output a little @see LinkDirection, then a straight line between them */
	LinkRenderType[LinkRenderType["STRAIGHT_LINK"] = 0] = "STRAIGHT_LINK";
	/** 90° angles, clean and box-like */
	LinkRenderType[LinkRenderType["LINEAR_LINK"] = 1] = "LINEAR_LINK";
	/** Smooth curved links - default */
	LinkRenderType[LinkRenderType["SPLINE_LINK"] = 2] = "SPLINE_LINK";
	return LinkRenderType;
}({});
/** The marker in the middle of a link */
var LinkMarkerShape = /* @__PURE__ */ function(LinkMarkerShape) {
	/** Do not display markers */
	LinkMarkerShape[LinkMarkerShape["None"] = 0] = "None";
	/** Circles (default) */
	LinkMarkerShape[LinkMarkerShape["Circle"] = 1] = "Circle";
	/** Directional arrows */
	LinkMarkerShape[LinkMarkerShape["Arrow"] = 2] = "Arrow";
	return LinkMarkerShape;
}({});
var TitleMode = /* @__PURE__ */ function(TitleMode) {
	TitleMode[TitleMode["NORMAL_TITLE"] = 0] = "NORMAL_TITLE";
	TitleMode[TitleMode["NO_TITLE"] = 1] = "NO_TITLE";
	TitleMode[TitleMode["TRANSPARENT_TITLE"] = 2] = "TRANSPARENT_TITLE";
	TitleMode[TitleMode["AUTOHIDE_TITLE"] = 3] = "AUTOHIDE_TITLE";
	return TitleMode;
}({});
var LGraphEventMode = /* @__PURE__ */ function(LGraphEventMode) {
	LGraphEventMode[LGraphEventMode["ALWAYS"] = 0] = "ALWAYS";
	LGraphEventMode[LGraphEventMode["ON_EVENT"] = 1] = "ON_EVENT";
	LGraphEventMode[LGraphEventMode["NEVER"] = 2] = "NEVER";
	LGraphEventMode[LGraphEventMode["ON_TRIGGER"] = 3] = "ON_TRIGGER";
	LGraphEventMode[LGraphEventMode["BYPASS"] = 4] = "BYPASS";
	return LGraphEventMode;
}({});
var EaseFunction = /* @__PURE__ */ function(EaseFunction) {
	EaseFunction["EASE_IN_OUT_QUAD"] = "easeInOutQuad";
	return EaseFunction;
}({});
/** Bit flags used to indicate what the pointer is currently hovering over. */
var Alignment = /* @__PURE__ */ function(Alignment) {
	/** No items / none */
	Alignment[Alignment["None"] = 0] = "None";
	/** Top */
	Alignment[Alignment["Top"] = 1] = "Top";
	/** Bottom */
	Alignment[Alignment["Bottom"] = 2] = "Bottom";
	/** Vertical middle */
	Alignment[Alignment["Middle"] = 4] = "Middle";
	/** Left */
	Alignment[Alignment["Left"] = 8] = "Left";
	/** Right */
	Alignment[Alignment["Right"] = 16] = "Right";
	/** Horizontal centre */
	Alignment[Alignment["Centre"] = 32] = "Centre";
	/** Top left */
	Alignment[Alignment["TopLeft"] = 9] = "TopLeft";
	/** Top side, horizontally centred */
	Alignment[Alignment["TopCentre"] = 33] = "TopCentre";
	/** Top right */
	Alignment[Alignment["TopRight"] = 17] = "TopRight";
	/** Left side, vertically centred */
	Alignment[Alignment["MidLeft"] = 12] = "MidLeft";
	/** Middle centre */
	Alignment[Alignment["MidCentre"] = 36] = "MidCentre";
	/** Right side, vertically centred */
	Alignment[Alignment["MidRight"] = 20] = "MidRight";
	/** Bottom left */
	Alignment[Alignment["BottomLeft"] = 10] = "BottomLeft";
	/** Bottom side, horizontally centred */
	Alignment[Alignment["BottomCentre"] = 34] = "BottomCentre";
	/** Bottom right */
	Alignment[Alignment["BottomRight"] = 18] = "BottomRight";
	return Alignment;
}({});
/**
* Checks if the bitwise {@link flag} is set in the {@link flagSet}.
* @param flagSet The unknown set of flags - will be checked for the presence of {@link flag}
* @param flag The flag to check for
* @returns `true` if the flag is set, `false` otherwise.
*/
function hasFlag(flagSet, flag) {
	return (flagSet & flag) === flag;
}
var clientFeatureFlags_default = {
	supports_preview_metadata: true,
	supports_manager_v4_ui: true,
	supports_progress_text_metadata: true
};
//#endregion
//#region src/platform/workflow/validation/schemas/workflowSchema.ts
var zRendererType = enumType([
	"LG",
	"Vue",
	"Vue-corrected"
]);
var zNodeId = unionType([numberType().int(), stringType()]);
var zNodeInputName = stringType();
var zSlotIndex = unionType([numberType().int(), stringType().transform((val) => parseInt(val)).refine((val) => !isNaN(val), { message: "Invalid number" })]);
var zDataType = unionType([
	stringType(),
	arrayType(stringType()),
	numberType()
]);
var zVector2 = unionType([objectType({
	0: numberType(),
	1: numberType()
}).passthrough().transform((v) => [v[0], v[1]]), tupleType([numberType(), numberType()])]);
var zModelFile = objectType({
	name: stringType(),
	url: stringType().url(),
	hash: stringType().optional(),
	hash_type: stringType().optional(),
	directory: stringType()
});
var zGraphState = objectType({
	lastGroupId: numberType(),
	lastNodeId: numberType(),
	lastLinkId: numberType(),
	lastRerouteId: numberType()
}).passthrough();
var zComfyLink = tupleType([
	numberType(),
	zNodeId,
	zSlotIndex,
	zNodeId,
	zSlotIndex,
	zDataType
]);
/** Extension to 0.4 schema (links as arrays): parent reroute ID */
var zComfyLinkExtension = objectType({
	id: numberType(),
	parentId: numberType()
}).passthrough();
var zComfyLinkObject = objectType({
	id: numberType(),
	origin_id: zNodeId,
	origin_slot: zSlotIndex,
	target_id: zNodeId,
	target_slot: zSlotIndex,
	type: zDataType,
	parentId: numberType().optional()
}).passthrough();
var zReroute = objectType({
	id: numberType(),
	parentId: numberType().optional(),
	pos: zVector2,
	linkIds: arrayType(numberType()).nullish(),
	floating: objectType({ slotType: enumType(["input", "output"]) }).optional()
}).passthrough();
var zNodeOutput = objectType({
	name: stringType(),
	type: zDataType,
	links: arrayType(numberType()).nullable().optional(),
	slot_index: zSlotIndex.optional()
}).passthrough();
var zNodeInput = objectType({
	name: zNodeInputName,
	type: zDataType,
	link: numberType().nullable().optional(),
	slot_index: zSlotIndex.optional()
}).passthrough();
var zFlags = objectType({
	collapsed: booleanType().optional(),
	pinned: booleanType().optional(),
	allow_interaction: booleanType().optional(),
	horizontal: booleanType().optional(),
	skip_repeated_outputs: booleanType().optional()
}).passthrough();
var repoLikeIdPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
var githubUsernamePattern = /^(?!-)(?!.*--)[a-zA-Z0-9-]+(?<!-)$/;
var gitHashPattern = /^[0-9a-f]{4,40}$/i;
var semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(?:\+([\da-z-]+(?:\.[\da-z-]+)*))?$/;
var zRepoLikeId = stringType().min(1).max(100).regex(repoLikeIdPattern, { message: "ID can only contain ASCII letters, digits, '_', '-', and '.'" }).refine((id) => !/^[_\-.]|[_\-.]$/.test(id), { message: "ID must not start or end with '_', '-', or '.'" });
var zCnrId = zRepoLikeId;
var zGithubRepoName = zRepoLikeId;
var zGithubUsername = stringType().min(1).max(39).regex(githubUsernamePattern, "Invalid GitHub username/org");
var zAuxId = stringType().regex(/^[^/]+\/[^/]+$/, "Invalid format. Must be 'github-user/repo-name'").transform((id) => id.split("/")).refine(([username, repo]) => zGithubUsername.safeParse(username).success && zGithubRepoName.safeParse(repo).success, "Invalid aux_id: Must be valid 'github-username/github-repo-name'").transform(([username, repo]) => `${username}/${repo}`);
var zGitHash = stringType().superRefine((val, ctx) => {
	if (!gitHashPattern.test(val)) ctx.addIssue({
		code: ZodIssueCode.custom,
		message: `Node pack version has invalid Git commit hash: "${val}"`
	});
});
var zSemVer = stringType().superRefine((val, ctx) => {
	if (!semverPattern.test(val)) ctx.addIssue({
		code: ZodIssueCode.custom,
		message: `Node pack version has invalid semantic version: "${val}"`
	});
});
var zVersion = unionType([stringType().transform((ver) => ver.replace(/^v/, "")).pipe(unionType([zSemVer, zGitHash])), literalType("unknown")]);
var zProperties = objectType({
	["Node name for S&R"]: stringType().optional(),
	cnr_id: zCnrId.optional(),
	aux_id: zAuxId.optional(),
	ver: zVersion.optional(),
	models: arrayType(zModelFile).optional()
}).passthrough();
var zWidgetValues = unionType([arrayType(anyType()), recordType(anyType())]);
var zComfyNode = objectType({
	id: zNodeId,
	type: stringType(),
	pos: zVector2,
	size: zVector2,
	flags: zFlags,
	order: numberType(),
	mode: numberType(),
	inputs: arrayType(zNodeInput).optional(),
	outputs: arrayType(zNodeOutput).optional(),
	properties: zProperties,
	widgets_values: zWidgetValues.optional(),
	color: stringType().optional(),
	bgcolor: stringType().optional()
}).passthrough();
var zSubgraphIO = zNodeInput.extend({
	/** Slot ID (internal; never changes once instantiated). */
	id: stringType().uuid(),
	/** The data type this slot uses. Unlike nodes, this does not support legacy numeric types. */
	type: stringType(),
	/** Links connected to this slot, or `undefined` if not connected. An output slot should only ever have one link. */
	linkIds: arrayType(numberType()).optional()
});
var zSubgraphInstance = objectType({
	id: zNodeId,
	type: stringType().uuid(),
	pos: zVector2,
	size: zVector2,
	flags: zFlags,
	order: numberType(),
	mode: numberType(),
	inputs: arrayType(zSubgraphIO).optional(),
	outputs: arrayType(zSubgraphIO).optional(),
	widgets_values: zWidgetValues.optional(),
	color: stringType().optional(),
	bgcolor: stringType().optional()
}).passthrough();
var zGroup = objectType({
	id: numberType().optional(),
	title: stringType(),
	bounding: tupleType([
		numberType(),
		numberType(),
		numberType(),
		numberType()
	]),
	color: stringType().optional(),
	font_size: numberType().optional(),
	locked: booleanType().optional()
}).passthrough();
var zDS = objectType({
	scale: numberType(),
	offset: zVector2
}).passthrough();
var zConfig = objectType({
	links_ontop: booleanType().optional(),
	align_to_grid: booleanType().optional()
}).passthrough();
var zExtra = objectType({
	ds: zDS.optional(),
	frontendVersion: stringType().optional(),
	linkExtensions: arrayType(zComfyLinkExtension).optional(),
	reroutes: arrayType(zReroute).optional(),
	workflowRendererVersion: zRendererType.optional(),
	BlueprintDescription: stringType().optional(),
	BlueprintSearchAliases: arrayType(stringType()).optional(),
	linearMode: booleanType().optional(),
	linearData: objectType({
		inputs: arrayType(unionType([tupleType([
			zNodeId,
			stringType(),
			objectType({ height: numberType().optional() }).passthrough()
		]), tupleType([zNodeId, stringType()])])).optional(),
		outputs: arrayType(zNodeId).optional()
	}).optional()
}).passthrough();
var zGraphDefinitions = objectType({ subgraphs: lazyType(() => arrayType(zSubgraphDefinition)) });
var zBaseExportableGraph = objectType({
	/** Unique graph ID.  Automatically generated if not provided. */
	id: stringType().uuid().optional(),
	revision: numberType().optional(),
	config: zConfig.optional().nullable(),
	/** Details of the appearance and location of subgraphs shown in this graph. Similar to */
	subgraphs: arrayType(zSubgraphInstance).optional()
});
/** Schema version 0.4 */
var zComfyWorkflow = zBaseExportableGraph.extend({
	id: stringType().uuid().optional(),
	revision: numberType().optional(),
	last_node_id: zNodeId,
	last_link_id: numberType(),
	nodes: arrayType(zComfyNode),
	links: arrayType(zComfyLink),
	floatingLinks: arrayType(zComfyLinkObject).optional(),
	groups: arrayType(zGroup).optional(),
	config: zConfig.optional().nullable(),
	extra: zExtra.optional().nullable(),
	version: numberType(),
	models: arrayType(zModelFile).optional(),
	definitions: zGraphDefinitions.optional()
}).passthrough();
/** Schema version 1 */
var zComfyWorkflow1 = zBaseExportableGraph.extend({
	id: stringType().uuid().optional(),
	revision: numberType().optional(),
	version: literalType(1),
	config: zConfig.optional().nullable(),
	state: zGraphState,
	groups: arrayType(zGroup).optional(),
	nodes: arrayType(zComfyNode),
	links: arrayType(zComfyLinkObject).optional(),
	floatingLinks: arrayType(zComfyLinkObject).optional(),
	reroutes: arrayType(zReroute).optional(),
	extra: zExtra.optional().nullable(),
	models: arrayType(zModelFile).optional(),
	definitions: objectType({ subgraphs: lazyType(() => arrayType(zSubgraphDefinition)) }).optional()
}).passthrough();
var zExportedSubgraphIONode = objectType({
	id: zNodeId,
	bounding: tupleType([
		numberType(),
		numberType(),
		numberType(),
		numberType()
	]),
	pinned: booleanType().optional()
});
var zExposedWidget = objectType({
	id: stringType(),
	name: stringType()
});
/** A subgraph definition `worfklow.definitions.subgraphs` */
var zSubgraphDefinition = zComfyWorkflow1.extend({
	/** Unique graph ID.  Automatically generated if not provided. */
	id: stringType().uuid(),
	revision: numberType(),
	name: stringType(),
	/** Optional description shown as tooltip when hovering over the subgraph node. */
	description: stringType().optional(),
	category: stringType().optional(),
	essentials_category: stringType().optional(),
	inputNode: zExportedSubgraphIONode,
	outputNode: zExportedSubgraphIONode,
	/** Ordered list of inputs to the subgraph itself. Similar to a reroute, with the input side in the graph, and the output side in the subgraph. */
	inputs: arrayType(zSubgraphIO).optional(),
	/** Ordered list of outputs from the subgraph itself. Similar to a reroute, with the input side in the subgraph, and the output side in the graph. */
	outputs: arrayType(zSubgraphIO).optional(),
	/** A list of node widgets displayed in the parent graph, on the subgraph object. */
	widgets: arrayType(zExposedWidget).optional(),
	definitions: objectType({ subgraphs: lazyType(() => zSubgraphDefinition.array()) }).optional()
}).passthrough();
var zWorkflowVersion = objectType({ version: numberType() });
async function validateComfyWorkflow(data, onError = console.warn) {
	const versionResult = zWorkflowVersion.safeParse(data);
	let result;
	if (!versionResult.success) {
		onError(`Workflow does not contain a valid version.  Zod error:\n${fromZodError(versionResult.error)}`);
		return null;
	} else if (versionResult.data.version === 1) result = await zComfyWorkflow1.safeParseAsync(data);
	else result = await zComfyWorkflow.safeParseAsync(data);
	if (result.success) return result.data;
	onError(`Invalid workflow against zod schema:\n${fromZodError(result.error)}`);
	return null;
}
recordType(zNodeId, objectType({
	inputs: recordType(zNodeInputName, unionType([anyType(), tupleType([zNodeId, zSlotIndex])])),
	class_type: stringType(),
	_meta: objectType({ title: stringType() })
}));
//#endregion
//#region src/schemas/colorPaletteSchema.ts
var nodeSlotSchema = objectType({
	CLIP: stringType(),
	CLIP_VISION: stringType(),
	CLIP_VISION_OUTPUT: stringType(),
	CONDITIONING: stringType(),
	CONTROL_NET: stringType(),
	IMAGE: stringType(),
	LATENT: stringType(),
	MASK: stringType(),
	MODEL: stringType(),
	STYLE_MODEL: stringType(),
	VAE: stringType(),
	NOISE: stringType(),
	GUIDER: stringType(),
	SAMPLER: stringType(),
	SIGMAS: stringType(),
	TAESD: stringType()
});
var litegraphBaseSchema = objectType({
	BACKGROUND_IMAGE: stringType(),
	CLEAR_BACKGROUND_COLOR: stringType(),
	NODE_TITLE_COLOR: stringType(),
	NODE_SELECTED_TITLE_COLOR: stringType(),
	NODE_TEXT_COLOR: stringType(),
	NODE_TEXT_HIGHLIGHT_COLOR: stringType(),
	NODE_DEFAULT_COLOR: stringType(),
	NODE_DEFAULT_BGCOLOR: stringType(),
	NODE_DEFAULT_BOXCOLOR: stringType(),
	NODE_DEFAULT_SHAPE: unionType([
		literalType(RenderShape.BOX),
		literalType(RenderShape.ROUND),
		literalType(RenderShape.CARD),
		stringType()
	]),
	NODE_BOX_OUTLINE_COLOR: stringType(),
	NODE_BYPASS_BGCOLOR: stringType(),
	NODE_ERROR_COLOUR: stringType(),
	DEFAULT_SHADOW_COLOR: stringType(),
	WIDGET_BGCOLOR: stringType(),
	WIDGET_OUTLINE_COLOR: stringType(),
	WIDGET_TEXT_COLOR: stringType(),
	WIDGET_SECONDARY_TEXT_COLOR: stringType(),
	WIDGET_DISABLED_TEXT_COLOR: stringType(),
	LINK_COLOR: stringType(),
	EVENT_LINK_COLOR: stringType(),
	CONNECTING_LINK_COLOR: stringType(),
	BADGE_FG_COLOR: stringType(),
	BADGE_BG_COLOR: stringType()
});
var comfyBaseSchema = objectType({
	["fg-color"]: stringType(),
	["bg-color"]: stringType(),
	["bg-img"]: stringType().optional(),
	["comfy-menu-bg"]: stringType(),
	["comfy-menu-secondary-bg"]: stringType(),
	["comfy-input-bg"]: stringType(),
	["input-text"]: stringType(),
	["descrip-text"]: stringType(),
	["drag-text"]: stringType(),
	["error-text"]: stringType(),
	["border-color"]: stringType(),
	["tr-even-bg-color"]: stringType(),
	["tr-odd-bg-color"]: stringType(),
	["content-bg"]: stringType(),
	["content-fg"]: stringType(),
	["content-hover-bg"]: stringType(),
	["content-hover-fg"]: stringType(),
	["bar-shadow"]: stringType(),
	["contrast-mix-color"]: stringType().optional(),
	["interface-stroke"]: stringType().optional(),
	["interface-panel-surface"]: stringType().optional(),
	["interface-panel-box-shadow"]: stringType().optional(),
	["interface-panel-drop-shadow"]: stringType().optional(),
	["interface-panel-hover-surface"]: stringType().optional(),
	["interface-panel-selected-surface"]: stringType().optional(),
	["interface-button-hover-surface"]: stringType().optional()
});
var colorsSchema = objectType({
	node_slot: nodeSlotSchema,
	litegraph_base: litegraphBaseSchema,
	comfy_base: comfyBaseSchema
});
var partialColorsSchema = objectType({
	node_slot: nodeSlotSchema.partial(),
	litegraph_base: litegraphBaseSchema.partial(),
	comfy_base: comfyBaseSchema.partial()
});
var paletteSchema = objectType({
	id: stringType(),
	name: stringType(),
	colors: partialColorsSchema,
	light_theme: booleanType().optional()
}).passthrough();
objectType({
	id: stringType(),
	name: stringType(),
	colors: colorsSchema
}).passthrough();
var colorPalettesSchema = recordType(paletteSchema);
//#endregion
//#region src/schemas/resultItemTypeSchema.ts
var resultItemType = enumType([
	"input",
	"output",
	"temp"
]);
//#endregion
//#region src/platform/keybindings/types.ts
var zKeyCombo = objectType({
	key: stringType(),
	ctrl: booleanType().optional(),
	alt: booleanType().optional(),
	shift: booleanType().optional(),
	meta: booleanType().optional()
});
var zKeybinding = objectType({
	commandId: stringType(),
	combo: zKeyCombo,
	targetElementId: stringType().optional()
});
var zKeybindingPreset = objectType({
	name: stringType().trim().min(1, "Preset name cannot be empty"),
	newBindings: arrayType(zKeybinding),
	unsetBindings: arrayType(zKeybinding)
});
//#endregion
//#region packages/object-info-parser/src/schemas/nodeDefSchema.ts
var CONTROL_OPTIONS = [
	"fixed",
	"increment",
	"decrement",
	"randomize"
];
var RESULT_ITEM_TYPE = enumType([
	"input",
	"output",
	"temp"
]);
var zComboOption = unionType([stringType(), numberType()]);
var zRemoteWidgetConfig = objectType({
	route: stringType().url().or(stringType().startsWith("/")),
	refresh: numberType().gte(128).safe().or(numberType().lte(0).safe()).optional(),
	response_key: stringType().optional(),
	query_params: recordType(stringType(), stringType()).optional(),
	refresh_button: booleanType().optional(),
	control_after_refresh: enumType(["first", "last"]).optional(),
	timeout: numberType().gte(0).optional(),
	max_retries: numberType().gte(0).optional()
});
var zMultiSelectOption = objectType({
	placeholder: stringType().optional(),
	chip: booleanType().optional()
});
var zBaseInputOptions = objectType({
	default: anyType().optional(),
	defaultInput: booleanType().optional(),
	display_name: stringType().optional(),
	forceInput: booleanType().optional(),
	tooltip: stringType().optional(),
	socketless: booleanType().optional(),
	hidden: booleanType().optional(),
	advanced: booleanType().optional(),
	widgetType: stringType().optional(),
	/** Backend-only properties. */
	rawLink: booleanType().optional(),
	lazy: booleanType().optional()
}).passthrough();
var zNumericInputOptions = zBaseInputOptions.extend({
	min: numberType().optional(),
	max: numberType().optional(),
	step: numberType().optional(),
	/** Note: Many node authors are using INT/FLOAT to pass list of INT/FLOAT. */
	default: unionType([numberType(), arrayType(numberType())]).optional(),
	display: enumType([
		"slider",
		"number",
		"knob",
		"gradientslider"
	]).optional()
});
var zIntInputOptions = zNumericInputOptions.extend({ 
/**
* If true, a linked widget will be added to the node to select the mode
* of `control_after_generate`.
*/
control_after_generate: unionType([booleanType(), enumType(CONTROL_OPTIONS)]).optional() });
var zColorStop = objectType({
	offset: numberType(),
	color: tupleType([
		numberType(),
		numberType(),
		numberType()
	])
});
var zFloatInputOptions = zNumericInputOptions.extend({
	round: unionType([numberType(), literalType(false)]).optional(),
	gradient_stops: arrayType(zColorStop).optional()
});
var zBooleanInputOptions = zBaseInputOptions.extend({
	label_on: stringType().optional(),
	label_off: stringType().optional(),
	default: booleanType().optional()
});
var zStringInputOptions = zBaseInputOptions.extend({
	default: stringType().optional(),
	multiline: booleanType().optional(),
	dynamicPrompts: booleanType().optional(),
	defaultVal: stringType().optional(),
	placeholder: stringType().optional()
});
var zComboInputOptions = zBaseInputOptions.extend({
	control_after_generate: unionType([booleanType(), enumType(CONTROL_OPTIONS)]).optional(),
	image_upload: booleanType().optional(),
	image_folder: RESULT_ITEM_TYPE.optional(),
	allow_batch: booleanType().optional(),
	video_upload: booleanType().optional(),
	audio_upload: booleanType().optional(),
	mesh_upload: booleanType().optional(),
	upload_subfolder: stringType().optional(),
	animated_image_upload: booleanType().optional(),
	options: arrayType(zComboOption).optional(),
	remote: zRemoteWidgetConfig.optional(),
	/** Whether the widget is a multi-select widget. */
	multi_select: zMultiSelectOption.optional()
});
var zIntInputSpec = tupleType([literalType("INT"), zIntInputOptions.optional()]);
var zFloatInputSpec = tupleType([literalType("FLOAT"), zFloatInputOptions.optional()]);
var zBooleanInputSpec = tupleType([literalType("BOOLEAN"), zBooleanInputOptions.optional()]);
var zStringInputSpec = tupleType([literalType("STRING"), zStringInputOptions.optional()]);
/**
* Legacy combo syntax.
* @deprecated Use `zComboInputSpecV2` instead.
*/
var zComboInputSpec = tupleType([arrayType(zComboOption), zComboInputOptions.optional()]);
var zComboInputSpecV2 = tupleType([literalType("COMBO"), zComboInputOptions.optional()]);
function isComboInputSpecV1(inputSpec) {
	return Array.isArray(inputSpec[0]);
}
function isIntInputSpec(inputSpec) {
	return inputSpec[0] === "INT";
}
function isFloatInputSpec(inputSpec) {
	return inputSpec[0] === "FLOAT";
}
function isComboInputSpecV2(inputSpec) {
	return inputSpec[0] === "COMBO";
}
function isComboInputSpec(inputSpec) {
	return isComboInputSpecV1(inputSpec) || isComboInputSpecV2(inputSpec);
}
function isMediaUploadComboInput(inputSpec) {
	const [inputName, inputOptions] = inputSpec;
	if (!inputOptions) return false;
	return (inputOptions["image_upload"] === true || inputOptions["video_upload"] === true || inputOptions["animated_image_upload"] === true) && (isComboInputSpecV1(inputSpec) || inputName === "COMBO");
}
/**
* Get the type of an input spec.
*
* @param inputSpec - The input spec to get the type of.
* @returns The type of the input spec.
*/
function getInputSpecType(inputSpec) {
	return isComboInputSpec(inputSpec) ? "COMBO" : inputSpec[0];
}
/**
* Get the combo options from a combo input spec.
*
* @param inputSpec - The input spec to get the combo options from.
* @returns The combo options.
*/
function getComboSpecComboOptions(inputSpec) {
	return (isComboInputSpecV2(inputSpec) ? inputSpec[1]?.options : inputSpec[0]) ?? [];
}
var excludedLiterals = new Set([
	"INT",
	"FLOAT",
	"BOOLEAN",
	"STRING",
	"COMBO"
]);
var zInputSpec = unionType([
	zIntInputSpec,
	zFloatInputSpec,
	zBooleanInputSpec,
	zStringInputSpec,
	zComboInputSpec,
	zComboInputSpecV2,
	tupleType([stringType().refine((value) => !excludedLiterals.has(value)), zBaseInputOptions.optional()])
]);
var zComfyInputsSpec = objectType({
	required: recordType(zInputSpec).optional(),
	optional: recordType(zInputSpec).optional(),
	hidden: recordType(anyType()).optional()
});
var zComfyOutputTypesSpec = arrayType(unionType([stringType(), arrayType(zComboOption)]));
/**
* Schema for price badge depends_on field.
* Specifies which widgets and inputs the pricing expression depends on.
* Widgets must be specified as objects with name and type.
*/
var zPriceBadgeDepends = objectType({
	widgets: arrayType(objectType({
		name: stringType(),
		type: stringType()
	})).optional().default([]),
	inputs: arrayType(stringType()).optional().default([]),
	/**
	* Autogrow input group names to track.
	* For each group, the count of connected inputs will be available in the
	* JSONata context as `g.<groupName>`.
	* Example: `input_groups: ["reference_videos"]` makes `g.reference_videos`
	* available with the count of connected inputs like `reference_videos.character1`, etc.
	*/
	input_groups: arrayType(stringType()).optional().default([])
});
/**
* Schema for price badge definition.
* Used to calculate and display pricing information for API nodes.
* The `expr` field contains a JSONata expression that returns a PricingResult.
*/
var zPriceBadge = objectType({
	engine: literalType("jsonata").optional().default("jsonata"),
	depends_on: zPriceBadgeDepends.optional().default({
		widgets: [],
		inputs: [],
		input_groups: []
	}),
	expr: stringType()
});
objectType({
	input: zComfyInputsSpec.optional(),
	output: zComfyOutputTypesSpec.optional(),
	output_is_list: arrayType(booleanType()).optional(),
	output_name: arrayType(stringType()).optional(),
	output_tooltips: arrayType(stringType()).optional(),
	output_matchtypes: arrayType(stringType().optional()).optional(),
	name: stringType(),
	display_name: stringType(),
	description: stringType(),
	help: stringType().optional(),
	category: stringType(),
	main_category: stringType().optional(),
	output_node: booleanType(),
	python_module: stringType(),
	deprecated: booleanType().optional(),
	experimental: booleanType().optional(),
	dev_only: booleanType().optional(),
	/**
	* Whether the node is an API node. Running API nodes requires login to
	* Comfy Org account.
	* https://docs.comfy.org/tutorials/api-nodes/overview
	*/
	api_node: booleanType().optional(),
	/**
	* Specifies the order of inputs for each input category.
	* Used to ensure consistent widget ordering regardless of JSON serialization.
	* Keys are 'required', 'optional', etc., values are arrays of input names.
	*/
	input_order: recordType(arrayType(stringType())).optional(),
	/**
	* Alternative names for search. Useful for synonyms, abbreviations,
	* or old names after renaming a node.
	*/
	search_aliases: arrayType(stringType()).optional(),
	/**
	* Price badge definition for API nodes.
	* Contains a JSONata expression to calculate pricing based on widget values
	* and input connectivity.
	*/
	price_badge: zPriceBadge.optional(),
	/** Category for the Essentials tab. If set, the node appears in Essentials. */
	essentials_category: stringType().optional(),
	/** Whether the blueprint is a global/installed blueprint (not user-created). */
	isGlobal: booleanType().optional()
});
var zAutogrowOptions = objectType({
	...zBaseInputOptions.shape,
	template: objectType({
		input: zComfyInputsSpec,
		names: arrayType(stringType()).optional(),
		max: numberType().optional(),
		min: numberType().optional(),
		prefix: stringType().optional()
	})
});
var zDynamicComboInputSpec = tupleType([literalType("COMFY_DYNAMICCOMBO_V3"), zBaseInputOptions.extend({ options: arrayType(objectType({
	inputs: zComfyInputsSpec,
	key: stringType()
})) })]);
var zMatchTypeOptions = objectType({
	...zBaseInputOptions.shape,
	type: literalType("COMFY_MATCHTYPE_V3"),
	template: objectType({
		allowed_types: stringType(),
		template_id: stringType()
	})
});
//#endregion
//#region packages/object-info-parser/src/classifiers/nodeSource.ts
var BLUEPRINT_CATEGORY = "Subgraph Blueprints";
var NodeSourceType = /* @__PURE__ */ function(NodeSourceType) {
	NodeSourceType["Core"] = "core";
	NodeSourceType["CustomNodes"] = "custom_nodes";
	NodeSourceType["Blueprint"] = "blueprint";
	NodeSourceType["Essentials"] = "essentials";
	NodeSourceType["Unknown"] = "unknown";
	return NodeSourceType;
}({});
var CORE_NODE_MODULES = [
	"nodes",
	"comfy_extras",
	"comfy_api_nodes"
];
var UNKNOWN_NODE_SOURCE = {
	type: "unknown",
	className: "comfy-unknown",
	displayText: "Unknown",
	badgeText: "?"
};
function shortenNodeName(name) {
	return name.replace(/^(ComfyUI-|ComfyUI_|Comfy-|Comfy_)/, "").replace(/(-ComfyUI|_ComfyUI|-Comfy|_Comfy)$/, "");
}
function getNodeSource(python_module, essentials_category) {
	if (!python_module) return UNKNOWN_NODE_SOURCE;
	const modules = python_module.split(".");
	if (essentials_category) {
		const displayName = shortenNodeName((modules[1] ?? modules[0] ?? "essentials").split("@")[0]);
		return {
			type: "essentials",
			className: "comfy-essentials",
			displayText: displayName,
			badgeText: displayName
		};
	} else if (CORE_NODE_MODULES.includes(modules[0])) return {
		type: "core",
		className: "comfy-core",
		displayText: "Comfy Core",
		badgeText: "🦊"
	};
	else if (modules[0] === "blueprint") return {
		type: "blueprint",
		className: "blueprint",
		displayText: "Blueprint",
		badgeText: "bp"
	};
	else if (modules[0] === "custom_nodes") {
		const moduleName = modules[1];
		if (!moduleName) return UNKNOWN_NODE_SOURCE;
		const customNodeName = moduleName.split("@")[0];
		const displayName = shortenNodeName(customNodeName);
		return {
			type: "custom_nodes",
			className: "comfy-custom-nodes",
			displayText: displayName,
			badgeText: displayName
		};
	} else return UNKNOWN_NODE_SOURCE;
}
function isEssentialNode(node) {
	return node.nodeSource.type === "essentials";
}
function isCustomNode(node) {
	return node.nodeSource.type === "custom_nodes";
}
var NodeBadgeMode = /* @__PURE__ */ function(NodeBadgeMode) {
	NodeBadgeMode["None"] = "None";
	NodeBadgeMode["ShowAll"] = "Show all";
	NodeBadgeMode["HideBuiltIn"] = "Hide built-in";
	return NodeBadgeMode;
}({});
//#endregion
//#region src/types/searchBoxTypes.ts
var LinkReleaseTriggerAction = /* @__PURE__ */ function(LinkReleaseTriggerAction) {
	LinkReleaseTriggerAction["CONTEXT_MENU"] = "context menu";
	LinkReleaseTriggerAction["SEARCH_BOX"] = "search box";
	LinkReleaseTriggerAction["NO_ACTION"] = "no action";
	return LinkReleaseTriggerAction;
}({});
//#endregion
//#region src/schemas/apiSchema.ts
var zNodeType = stringType();
var zJobId = stringType();
recordType(stringType(), unknownType());
var zResultItem = objectType({
	filename: stringType().optional(),
	subfolder: stringType().optional(),
	type: resultItemType.optional(),
	display_name: stringType().optional()
});
var zOutputs = objectType({
	audio: arrayType(zResultItem).optional(),
	images: arrayType(zResultItem).optional(),
	video: arrayType(zResultItem).optional(),
	animated: arrayType(booleanType()).optional(),
	text: unionType([stringType(), arrayType(stringType())]).optional()
}).passthrough();
objectType({
	status: objectType({ exec_info: objectType({ queue_remaining: numberType().int() }) }).nullish(),
	sid: stringType().nullish()
});
objectType({
	value: numberType().int(),
	max: numberType().int(),
	prompt_id: zJobId,
	node: zNodeId
});
objectType({
	prompt_id: zJobId,
	nodes: recordType(zNodeId, objectType({
		value: numberType(),
		max: numberType(),
		state: enumType([
			"pending",
			"running",
			"finished",
			"error"
		]),
		node_id: zNodeId,
		prompt_id: zJobId,
		display_node_id: zNodeId.optional(),
		parent_node_id: zNodeId.optional(),
		real_node_id: zNodeId.optional()
	}))
});
objectType({
	node: zNodeId,
	display_node: zNodeId,
	prompt_id: zJobId
}).extend({
	output: zOutputs,
	merge: booleanType().optional()
});
var zExecutionWsMessageBase = objectType({
	prompt_id: zJobId,
	timestamp: numberType().int()
});
zExecutionWsMessageBase.extend({ nodes: arrayType(zNodeId) });
zExecutionWsMessageBase.extend({
	node_id: zNodeId,
	node_type: zNodeType,
	executed: arrayType(zNodeId)
});
zExecutionWsMessageBase.extend({
	node_id: zNodeId,
	node_type: zNodeType,
	executed: arrayType(zNodeId),
	exception_message: stringType(),
	exception_type: stringType(),
	traceback: arrayType(stringType()),
	current_inputs: anyType(),
	current_outputs: anyType()
});
objectType({
	nodeId: zNodeId,
	text: stringType(),
	prompt_id: stringType().optional()
});
objectType({
	value: stringType(),
	id: stringType().optional()
});
var zTerminalSize = objectType({
	cols: numberType(),
	row: numberType()
});
var zLogEntry = objectType({
	t: stringType(),
	m: stringType()
});
objectType({
	size: zTerminalSize.optional(),
	entries: arrayType(zLogEntry)
});
objectType({
	size: zTerminalSize,
	entries: arrayType(zLogEntry)
});
recordType(stringType(), anyType());
objectType({
	task_id: stringType(),
	asset_name: stringType(),
	bytes_total: numberType(),
	bytes_downloaded: numberType(),
	progress: numberType(),
	status: enumType([
		"created",
		"running",
		"completed",
		"failed"
	]),
	asset_id: stringType().optional(),
	error: stringType().optional()
});
objectType({
	task_id: stringType(),
	export_name: stringType().optional(),
	assets_total: numberType(),
	assets_attempted: numberType(),
	assets_failed: numberType(),
	bytes_total: numberType(),
	bytes_processed: numberType(),
	progress: numberType(),
	status: enumType([
		"created",
		"running",
		"completed",
		"failed"
	]),
	error: stringType().optional()
});
var zTaskOutput = recordType(zNodeId, zOutputs);
arrayType(stringType());
arrayType(stringType());
var zError = objectType({
	type: stringType(),
	message: stringType(),
	details: stringType(),
	extra_info: objectType({ input_name: stringType().optional() }).passthrough().optional()
});
objectType({
	node_errors: recordType(zNodeId, objectType({
		errors: arrayType(zError),
		class_type: stringType(),
		dependent_outputs: arrayType(anyType())
	})).optional(),
	prompt_id: stringType().optional(),
	exec_info: objectType({ queue_remaining: numberType().optional() }).optional(),
	error: unionType([stringType(), zError])
});
objectType({
	type: stringType(),
	message: stringType(),
	details: stringType()
});
var zDeviceStats = objectType({
	name: stringType(),
	type: stringType(),
	index: numberType(),
	vram_total: numberType(),
	vram_free: numberType(),
	torch_vram_total: numberType(),
	torch_vram_free: numberType()
});
var zComfyPackageVersion = objectType({
	name: stringType(),
	installed: stringType().nullable(),
	required: stringType().nullable()
});
objectType({
	system: objectType({
		os: stringType(),
		python_version: stringType(),
		embedded_python: booleanType(),
		comfyui_version: stringType(),
		deploy_environment: stringType().optional(),
		pytorch_version: stringType(),
		required_frontend_version: stringType().optional(),
		argv: arrayType(stringType()),
		ram_total: numberType(),
		ram_free: numberType(),
		cloud_version: stringType().optional(),
		comfyui_frontend_version: stringType().optional(),
		workflow_templates_version: stringType().optional(),
		installed_templates_version: stringType().optional(),
		required_templates_version: stringType().optional(),
		comfy_package_versions: arrayType(zComfyPackageVersion).optional()
	}),
	devices: arrayType(zDeviceStats)
});
objectType({
	storage: enumType(["server"]),
	migrated: booleanType().optional(),
	users: arrayType(objectType({
		userId: stringType(),
		username: stringType()
	})).optional()
});
arrayType(arrayType(stringType(), stringType()));
objectType({
	path: stringType(),
	size: numberType(),
	modified: numberType()
});
var zBookmarkCustomization = objectType({
	icon: stringType().optional(),
	color: stringType().optional()
});
var zLinkReleaseTriggerAction = enumType(Object.values(LinkReleaseTriggerAction));
var zNodeBadgeMode = enumType(Object.values(NodeBadgeMode));
var zPreviewMethod = enumType([
	"default",
	"none",
	"auto",
	"latent2rgb",
	"taesd"
]);
objectType({
	"Comfy.ColorPalette": stringType(),
	"Comfy.CustomColorPalettes": colorPalettesSchema,
	"Comfy.Canvas.BackgroundImage": stringType().optional(),
	"Comfy.ConfirmClear": booleanType(),
	"Comfy.DevMode": booleanType(),
	"Comfy.Appearance.DisableAnimations": booleanType(),
	"Comfy.UI.TabBarLayout": enumType(["Default", "Legacy"]),
	"Comfy.Workflow.ShowMissingModelsWarning": booleanType(),
	"Comfy.Workflow.WarnBlueprintOverwrite": booleanType(),
	"Comfy.Desktop.CloudNotificationShown": booleanType(),
	"Comfy.DisableFloatRounding": booleanType(),
	"Comfy.DisableSliders": booleanType(),
	"Comfy.DOMClippingEnabled": booleanType(),
	"Comfy.EditAttention.Delta": numberType(),
	"Comfy.EnableTooltips": booleanType(),
	"Comfy.EnableWorkflowViewRestore": booleanType(),
	"Comfy.FloatRoundingPrecision": numberType(),
	"Comfy.Graph.AutoPanSpeed": numberType(),
	"Comfy.Graph.CanvasInfo": booleanType(),
	"Comfy.Graph.CanvasMenu": booleanType(),
	"Comfy.Graph.CtrlShiftZoom": booleanType(),
	"Comfy.Graph.DeduplicateSubgraphNodeIds": booleanType(),
	"Comfy.Graph.LiveSelection": booleanType(),
	"Comfy.Graph.LinkMarkers": nativeEnumType(LinkMarkerShape),
	"Comfy.Graph.ZoomSpeed": numberType(),
	"Comfy.Group.DoubleClickTitleToEdit": booleanType(),
	"Comfy.GroupSelectedNodes.Padding": numberType(),
	"Comfy.Locale": stringType(),
	"Comfy.NodeLibrary.NewDesign": booleanType(),
	"Comfy.NodeLibrary.Bookmarks": arrayType(stringType()),
	"Comfy.NodeLibrary.Bookmarks.V2": arrayType(stringType()),
	"Comfy.NodeLibrary.BookmarksCustomization": recordType(stringType(), zBookmarkCustomization),
	"Comfy.LinkRelease.Action": zLinkReleaseTriggerAction,
	"Comfy.LinkRelease.ActionShift": zLinkReleaseTriggerAction,
	"Comfy.ModelLibrary.AutoLoadAll": booleanType(),
	"Comfy.ModelLibrary.NameFormat": enumType(["filename", "title"]),
	"Comfy.NodeSearchBoxImpl.NodePreview": booleanType(),
	"Comfy.NodeSearchBoxImpl.FollowCursor": booleanType(),
	"Comfy.NodeSearchBoxImpl": enumType([
		"default",
		"v1 (legacy)",
		"litegraph (legacy)"
	]),
	"Comfy.NodeSearchBoxImpl.ShowCategory": booleanType(),
	"Comfy.NodeSearchBoxImpl.ShowIdName": booleanType(),
	"Comfy.NodeSearchBoxImpl.ShowNodeFrequency": booleanType(),
	"Comfy.NodeSuggestions.number": numberType(),
	"Comfy.Node.BypassAllLinksOnDelete": booleanType(),
	"Comfy.Node.Opacity": numberType(),
	"Comfy.Node.MiddleClickRerouteNode": booleanType(),
	"Comfy.Node.ShowDeprecated": booleanType(),
	"Comfy.Node.ShowExperimental": booleanType(),
	"Comfy.NodeReplacement.Enabled": booleanType(),
	"Comfy.Pointer.ClickBufferTime": numberType(),
	"Comfy.Pointer.ClickDrift": numberType(),
	"Comfy.Pointer.DoubleClickTime": numberType(),
	"Comfy.PreviewFormat": stringType(),
	"Comfy.PromptFilename": booleanType(),
	"Comfy.Sidebar.Location": enumType(["left", "right"]),
	"Comfy.Sidebar.Size": enumType(["small", "normal"]),
	"Comfy.Sidebar.UnifiedWidth": booleanType(),
	"Comfy.Sidebar.Style": enumType(["floating", "connected"]),
	"Comfy.SnapToGrid.GridSize": numberType(),
	"Comfy.TextareaWidget.FontSize": numberType(),
	"Comfy.TextareaWidget.Spellcheck": booleanType(),
	"Comfy.UseNewMenu": enumType(["Disabled", "Top"]),
	"Comfy.TreeExplorer.ItemPadding": numberType(),
	"Comfy.Validation.Workflows": booleanType(),
	"Comfy.Workflow.SortNodeIdOnSave": booleanType(),
	"Comfy.Execution.PreviewMethod": zPreviewMethod,
	"Comfy.Workflow.WorkflowTabsPosition": enumType(["Sidebar", "Topbar"]),
	"Comfy.Node.DoubleClickTitleToEdit": booleanType(),
	"Comfy.WidgetControlMode": enumType(["before", "after"]),
	"Comfy.Window.UnloadConfirmation": booleanType(),
	"Comfy.NodeBadge.NodeSourceBadgeMode": zNodeBadgeMode,
	"Comfy.NodeBadge.NodeIdBadgeMode": zNodeBadgeMode,
	"Comfy.NodeBadge.NodeLifeCycleBadgeMode": zNodeBadgeMode,
	"Comfy.NodeBadge.ShowApiPricing": booleanType(),
	"Comfy.Notification.ShowVersionUpdates": booleanType(),
	"Comfy.QueueButton.BatchCountLimit": numberType(),
	"Comfy.Queue.MaxHistoryItems": numberType(),
	"Comfy.Queue.History.Expanded": booleanType(),
	"Comfy.WorkflowActions.SeenItems": arrayType(stringType()),
	"Comfy.Keybinding.UnsetBindings": arrayType(zKeybinding),
	"Comfy.Keybinding.NewBindings": arrayType(zKeybinding),
	"Comfy.Keybinding.CurrentPreset": stringType(),
	"Comfy.Extension.Disabled": arrayType(stringType()),
	"Comfy.LinkRenderMode": numberType(),
	"Comfy.Node.AutoSnapLinkToSlot": booleanType(),
	"Comfy.Node.SnapHighlightsNode": booleanType(),
	"Comfy.Server.ServerConfigValues": recordType(stringType(), anyType()),
	"Comfy.Server.LaunchArgs": recordType(stringType(), stringType()),
	"LiteGraph.Canvas.MaximumFps": numberType(),
	"Comfy.Workflow.ConfirmDelete": booleanType(),
	"Comfy.Workflow.AutoSaveDelay": numberType(),
	"Comfy.Workflow.AutoSave": enumType(["off", "after delay"]),
	"Comfy.RerouteBeta": booleanType(),
	"LiteGraph.Canvas.MinFontSizeForLOD": numberType(),
	"Comfy.Canvas.SelectionToolbox": booleanType(),
	"LiteGraph.Node.TooltipDelay": numberType(),
	"LiteGraph.ContextMenu.Scaling": booleanType(),
	"LiteGraph.Reroute.SplineOffset": numberType(),
	"LiteGraph.Canvas.LowQualityRenderingZoomThreshold": numberType(),
	"Comfy.Toast.DisableReconnectingToast": booleanType(),
	"Comfy.Workflow.Persist": booleanType(),
	"Comfy.TutorialCompleted": booleanType(),
	"Comfy.InstalledVersion": stringType().nullable(),
	"Comfy.Node.AllowImageSizeDraw": booleanType(),
	"Comfy.Minimap.Visible": booleanType(),
	"Comfy.Minimap.NodeColors": booleanType(),
	"Comfy.Minimap.ShowLinks": booleanType(),
	"Comfy.Minimap.ShowGroups": booleanType(),
	"Comfy.Minimap.RenderBypassState": booleanType(),
	"Comfy.Minimap.RenderErrorState": booleanType(),
	"Comfy.Canvas.NavigationMode": stringType(),
	"Comfy.Canvas.LeftMouseClickBehavior": stringType(),
	"Comfy.Canvas.MouseWheelScroll": stringType(),
	"Comfy.VueNodes.Enabled": booleanType(),
	"Comfy.AppBuilder.VueNodeSwitchDismissed": booleanType(),
	"Comfy.Assets.UseAssetAPI": booleanType(),
	"Comfy.Queue.QPOV2": booleanType(),
	"Comfy.Queue.ShowRunProgressBar": booleanType(),
	"Comfy-Desktop.AutoUpdate": booleanType(),
	"Comfy-Desktop.SendStatistics": booleanType(),
	"Comfy-Desktop.WindowStyle": stringType(),
	"Comfy-Desktop.UV.PythonInstallMirror": stringType(),
	"Comfy-Desktop.UV.PypiInstallMirror": stringType(),
	"Comfy-Desktop.UV.TorchInstallMirror": stringType(),
	"Comfy.MaskEditor.BrushAdjustmentSpeed": numberType(),
	"Comfy.MaskEditor.UseDominantAxis": booleanType(),
	"Comfy.Load3D.ShowGrid": booleanType(),
	"Comfy.Load3D.BackgroundColor": stringType(),
	"Comfy.Load3D.LightIntensity": numberType(),
	"Comfy.Load3D.LightIntensityMaximum": numberType(),
	"Comfy.Load3D.LightIntensityMinimum": numberType(),
	"Comfy.Load3D.LightAdjustmentIncrement": numberType(),
	"Comfy.Load3D.CameraType": enumType(["perspective", "orthographic"]),
	"Comfy.Load3D.3DViewerEnable": booleanType(),
	"Comfy.Load3D.PLYEngine": enumType(["threejs", "fastply"]),
	"Comfy.Memory.AllowManualUnload": booleanType(),
	"pysssss.SnapToGrid": booleanType(),
	/** VHS setting is used for queue video preview support. */
	"VHS.AdvancedPreviews": stringType(),
	/** Release data settings */
	"Comfy.Release.Version": stringType(),
	"Comfy.Release.Status": enumType([
		"skipped",
		"changelog seen",
		"what's new seen"
	]),
	"Comfy.Release.Timestamp": numberType(),
	/** Template library filter settings */
	"Comfy.Templates.SelectedModels": arrayType(stringType()),
	"Comfy.Templates.SelectedUseCases": arrayType(stringType()),
	"Comfy.Templates.SelectedRunsOn": arrayType(stringType()),
	"Comfy.Templates.SortBy": enumType([
		"default",
		"recommended",
		"popular",
		"alphabetical",
		"newest",
		"vram-low-to-high",
		"model-size-low-to-high"
	]),
	/** Settings used for testing */
	"test.setting": anyType(),
	"main.sub.setting.name": anyType(),
	"single.setting": anyType(),
	"LiteGraph.Node.DefaultPadding": booleanType(),
	"LiteGraph.Pointer.TrackpadGestures": booleanType(),
	"Comfy.VersionCompatibility.DisableWarnings": booleanType(),
	"Comfy.RightSidePanel.IsOpen": booleanType(),
	"Comfy.RightSidePanel.ShowErrorsTab": booleanType(),
	"Comfy.Node.AlwaysShowAdvancedWidgets": booleanType(),
	"LiteGraph.Group.SelectChildrenOnClick": booleanType()
});
var zComfyHubProfile = objectType({
	username: stringType(),
	name: stringType().optional(),
	description: stringType().optional(),
	coverImageUrl: stringType().nullish(),
	profilePictureUrl: stringType().nullish()
});
var zAssetInfo = objectType({
	id: stringType(),
	name: stringType(),
	preview_url: stringType(),
	storage_url: stringType(),
	model: booleanType(),
	public: booleanType(),
	in_library: booleanType()
});
var zShareableAssetsResponse = objectType({ assets: arrayType(zAssetInfo) });
//#endregion
//#region src/platform/remote/comfyui/jobs/jobTypes.ts
/**
* @fileoverview Jobs API types - Backend job API format
* @module platform/remote/comfyui/jobs/jobTypes
*
* These types represent the jobs API format returned by the backend.
* Jobs API provides a memory-optimized alternative to history API.
*/
var zJobStatus = enumType([
	"pending",
	"in_progress",
	"completed",
	"failed",
	"cancelled"
]);
var zPreviewOutput = objectType({
	filename: stringType().optional(),
	subfolder: stringType().optional(),
	type: resultItemType.optional(),
	nodeId: stringType(),
	mediaType: stringType(),
	display_name: stringType().optional()
}).passthrough();
/**
* Execution error from Jobs API.
* Similar to ExecutionErrorWsMessage but with optional prompt_id/timestamp/executed
* since these may not be present in stored errors or infrastructure-generated errors.
*/
var zExecutionError = objectType({
	prompt_id: stringType().optional(),
	timestamp: numberType().optional(),
	node_id: stringType(),
	node_type: stringType(),
	executed: arrayType(stringType()).optional(),
	exception_message: stringType(),
	exception_type: stringType(),
	traceback: arrayType(stringType()),
	current_inputs: unknownType(),
	current_outputs: unknownType()
}).passthrough();
/**
* Raw job from API - uses passthrough to allow extra fields
*/
var zRawJobListItem = objectType({
	id: stringType(),
	status: zJobStatus,
	create_time: numberType(),
	execution_start_time: numberType().nullable().optional(),
	execution_end_time: numberType().nullable().optional(),
	preview_output: zPreviewOutput.nullable().optional(),
	outputs_count: numberType().nullable().optional(),
	execution_error: zExecutionError.nullable().optional(),
	workflow_id: stringType().nullable().optional(),
	priority: numberType().optional()
}).passthrough();
/**
* Job detail - returned by GET /api/jobs/{job_id} (detail endpoint)
* Includes full workflow and outputs for re-execution and downloads
*/
var zJobDetail = zRawJobListItem.extend({
	workflow: unknownType().optional(),
	outputs: zTaskOutput.optional(),
	update_time: numberType().optional(),
	execution_status: unknownType().optional(),
	execution_meta: unknownType().optional()
}).passthrough();
var zPaginationInfo = objectType({
	offset: numberType(),
	limit: numberType(),
	total: numberType(),
	has_more: booleanType()
});
var zJobsListResponse = objectType({
	jobs: arrayType(zRawJobListItem),
	pagination: zPaginationInfo
});
/** Schema for workflow container structure in job detail responses */
var zWorkflowContainer = objectType({ extra_data: objectType({ extra_pnginfo: objectType({ workflow: unknownType() }).optional() }).optional() });
//#endregion
//#region src/platform/remote/comfyui/jobs/fetchJobs.ts
/**
* Fetches raw jobs from /jobs endpoint
* @internal
*/
async function fetchJobsRaw(fetchApi, statuses, maxItems = 200, offset = 0) {
	const url = `/jobs?status=${statuses.join(",")}&limit=${maxItems}&offset=${offset}`;
	try {
		const res = await fetchApi(url);
		if (!res.ok) {
			console.error(`[Jobs API] Failed to fetch jobs: ${res.status}`);
			return {
				jobs: [],
				total: 0,
				offset,
				limit: maxItems,
				hasMore: false
			};
		}
		const data = zJobsListResponse.parse(await res.json());
		return {
			jobs: data.jobs,
			total: data.pagination.total,
			offset: data.pagination.offset,
			limit: data.pagination.limit,
			hasMore: data.pagination.has_more
		};
	} catch (error) {
		console.error("[Jobs API] Error fetching jobs:", error);
		return {
			jobs: [],
			total: 0,
			offset,
			limit: maxItems,
			hasMore: false
		};
	}
}
var QUEUE_PRIORITY_BASE = 1e6;
/**
* Assigns synthetic priority to jobs.
* Only assigns if job doesn't already have a server-provided priority.
*/
function assignPriority(jobs, basePriority) {
	return jobs.map((job, index) => ({
		...job,
		priority: job.priority ?? basePriority - index
	}));
}
/**
* Fetches history (terminal state jobs: completed, failed, cancelled)
* Assigns synthetic priority starting from total (lower than queue jobs).
*/
async function fetchHistory(fetchApi, maxItems = 200, offset = 0) {
	const { jobs } = await fetchHistoryPage(fetchApi, maxItems, offset);
	return jobs;
}
/**
* Fetches one page of history with server-provided pagination metadata.
*/
async function fetchHistoryPage(fetchApi, maxItems = 200, offset = 0) {
	const result = await fetchJobsRaw(fetchApi, [
		"completed",
		"failed",
		"cancelled"
	], maxItems, offset);
	return {
		jobs: assignPriority(result.jobs, result.total - result.offset),
		total: result.total,
		offset: result.offset,
		limit: result.limit,
		hasMore: result.hasMore
	};
}
/**
* Fetches queue (in_progress + pending jobs)
* Pending jobs get highest priority, then running jobs.
*/
async function fetchQueue(fetchApi) {
	const { jobs } = await fetchJobsRaw(fetchApi, ["in_progress", "pending"], 200, 0);
	const running = jobs.filter((j) => j.status === "in_progress");
	const pending = jobs.filter((j) => j.status === "pending");
	return {
		Running: assignPriority(running, QUEUE_PRIORITY_BASE + running.length),
		Pending: assignPriority(pending, QUEUE_PRIORITY_BASE + running.length + pending.length)
	};
}
/**
* Fetches full job details from /jobs/{job_id}
*/
async function fetchJobDetail(fetchApi, jobId) {
	try {
		const res = await fetchApi(`/jobs/${encodeURIComponent(jobId)}`);
		if (!res.ok) {
			console.warn(`Job not found for job ${jobId}`);
			return;
		}
		return zJobDetail.parse(await res.json());
	} catch (error) {
		console.error(`Failed to fetch job detail for job ${jobId}:`, error);
		return;
	}
}
/**
* Extracts and validates workflow from job detail response.
* The workflow is nested at: workflow.extra_data.extra_pnginfo.workflow
*
* Uses Zod validation via validateComfyWorkflow to ensure the workflow
* conforms to the expected schema. Logs validation failures for debugging
* but still returns undefined to allow graceful degradation.
*/
async function extractWorkflow(job) {
	const parsed = zWorkflowContainer.safeParse(job?.workflow);
	if (!parsed.success) return void 0;
	const rawWorkflow = parsed.data.extra_data?.extra_pnginfo?.workflow;
	if (!rawWorkflow) return void 0;
	return await validateComfyWorkflow(rawWorkflow, (error) => {
		console.warn("[extractWorkflow] Workflow validation failed:", error);
	}) ?? void 0;
}
//#endregion
//#region src/scripts/api.ts
var UnauthorizedError = class extends Error {};
function addHeaderEntry(headers, key, value) {
	if (Array.isArray(headers)) headers.push([key, value]);
	else if (headers instanceof Headers) headers.set(key, value);
	else headers[key] = value;
}
var PromptExecutionError = class extends Error {
	response;
	status;
	constructor(response, status) {
		super("Prompt execution failed");
		this.response = response;
		this.status = status;
	}
	toString() {
		let message = "";
		if (typeof this.response.error === "string") message += this.response.error;
		else if (this.response.error) message += this.response.error.message + ": " + this.response.error.details;
		for (const [_, nodeError] of Object.entries(this.response.node_errors ?? [])) {
			message += "\n" + nodeError.class_type + ":";
			for (const errorReason of nodeError.errors) message += "\n    - " + errorReason.message + ": " + errorReason.details;
		}
		return message;
	}
};
var ComfyApi = class extends EventTarget {
	_registered = /* @__PURE__ */ new Set();
	/**
	* Maps an original event listener to its error-guarded wrapper, so that
	* {@link removeEventListener} can match the wrapper installed by
	* {@link addEventListener}. Keyed weakly so wrappers are GC'd with listeners.
	*/
	_listenerWrappers = /* @__PURE__ */ new WeakMap();
	api_host;
	api_base;
	/**
	* The client id from the initial session storage.
	*/
	initialClientId;
	/**
	* The current client id from websocket status updates.
	*/
	clientId;
	/**
	* The current user id.
	*/
	user;
	socket = null;
	reportedUnknownMessageTypes = /* @__PURE__ */ new Set();
	/**
	* Get feature flags supported by this frontend client.
	* Returns a copy to prevent external modification.
	*/
	getClientFeatureFlags() {
		return { ...clientFeatureFlags_default };
	}
	/**
	* Feature flags received from the backend server.
	*/
	serverFeatureFlags = ref({});
	/**
	* The auth token for the comfy org account if the user is logged in.
	* This is only used for {@link queuePrompt} now. It is not directly
	* passed as parameter to the function because some custom nodes are hijacking
	* {@link queuePrompt} improperly, which causes extra parameters to be lost
	* in the function call chain.
	*
	* Ref: https://cs.comfy.org/search?q=context:global+%22api.queuePrompt+%3D%22&patternType=keyword&sm=0
	*
	* TODO: Move this field to parameter of {@link queuePrompt} once all
	* custom nodes are patched.
	*/
	authToken;
	/**
	* The API key for the comfy org account if the user logged in via API key.
	*/
	apiKey;
	constructor() {
		super();
		this.user = "";
		this.api_host = location.host;
		this.api_base = isCloud ? "" : location.pathname.split("/").slice(0, -1).join("/");
		this.initialClientId = sessionStorage.getItem("clientId");
	}
	internalURL(route) {
		return this.api_base + "/internal" + route;
	}
	apiURL(route) {
		if (route.startsWith("/api")) return this.api_base + route;
		return this.api_base + "/api" + route;
	}
	fileURL(route) {
		return this.api_base + route;
	}
	async fetchApi(route, options) {
		const headers = options?.headers ?? {};
		if (this.user) addHeaderEntry(headers, "Comfy-User", this.user);
		return fetch(this.apiURL(route), {
			cache: "no-cache",
			...options,
			headers
		});
	}
	/**
	* Wraps an event listener so an exception thrown by it — most often from a
	* third-party custom node — is caught and logged instead of surfacing as an
	* unhandled error in global telemetry (which RUM captures as a high-volume,
	* non-actionable error). Native EventTarget already isolates listeners from
	* one another; this only changes where the error goes.
	*
	* The same original listener always maps to the same wrapper, so
	* {@link removeEventListener} still matches. Logged at `warn` level on
	* purpose: RUM collects `console.error` by default, which would re-introduce
	* the noise this guard removes.
	*/
	wrapListener(callback) {
		if (!callback) return callback;
		let wrapped = this._listenerWrappers.get(callback);
		if (!wrapped) {
			const logError = (event, error) => console.warn(`[ComfyApi] Uncaught error in "${event.type}" event listener:`, error);
			wrapped = function(event) {
				try {
					const result = typeof callback === "function" ? callback.call(this, event) : callback.handleEvent(event);
					if (result != null && typeof result.then === "function") Promise.resolve(result).catch((error) => logError(event, error));
				} catch (error) {
					logError(event, error);
				}
			};
			this._listenerWrappers.set(callback, wrapped);
		}
		return wrapped;
	}
	/**
	* Looks up the guarded wrapper for a listener without creating one — used on
	* the remove path so a never-registered callback does not leave a stray
	* WeakMap entry. Falls back to the original callback (a harmless no-op).
	*/
	getWrappedListener(callback) {
		if (!callback) return callback;
		return this._listenerWrappers.get(callback) ?? callback;
	}
	addEventListener(type, callback, options) {
		super.addEventListener(type, this.wrapListener(callback), options);
		this._registered.add(type);
	}
	removeEventListener(type, callback, options) {
		super.removeEventListener(type, this.getWrappedListener(callback), options);
	}
	addCustomEventListener(type, callback, options) {
		super.addEventListener(type, this.wrapListener(callback), options);
		this._registered.add(type);
	}
	removeCustomEventListener(type, callback, options) {
		super.removeEventListener(type, this.getWrappedListener(callback), options);
	}
	dispatchCustomEvent(type, detail) {
		const event = detail === void 0 ? new CustomEvent(type) : new CustomEvent(type, { detail });
		return super.dispatchEvent(event);
	}
	/** @deprecated Use {@link dispatchCustomEvent}. */
	dispatchEvent(event) {
		return super.dispatchEvent(event);
	}
	/**
	* Poll status  for colab and other things that don't support websockets.
	*/
	_pollQueue() {
		setInterval(async () => {
			try {
				const status = await (await this.fetchApi("/prompt")).json();
				this.dispatchCustomEvent("status", status);
			} catch (error) {
				this.dispatchCustomEvent("status", null);
			}
		}, 1e3);
	}
	/**
	* Creates and connects a WebSocket for realtime updates
	* @param {boolean} isReconnect If the socket is connection is a reconnect attempt
	*/
	async createSocket(isReconnect) {
		if (this.socket) return;
		let opened = false;
		let existingSession = window.name;
		const params = new URLSearchParams();
		if (existingSession) params.set("clientId", existingSession);
		const baseUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${this.api_host}${this.api_base}/ws`;
		const query = params.toString();
		const wsUrl = query ? `${baseUrl}?${query}` : baseUrl;
		this.socket = new WebSocket(wsUrl);
		this.socket.binaryType = "arraybuffer";
		this.socket.addEventListener("open", () => {
			opened = true;
			this.socket.send(JSON.stringify({
				type: "feature_flags",
				data: this.getClientFeatureFlags()
			}));
			if (isReconnect) this.dispatchCustomEvent("reconnected");
		});
		this.socket.addEventListener("error", () => {
			if (this.socket) this.socket.close();
			if (!isReconnect && !opened) this._pollQueue();
		});
		this.socket.addEventListener("close", () => {
			setTimeout(async () => {
				this.socket = null;
				await this.createSocket(true);
			}, 300);
			if (opened) {
				this.dispatchCustomEvent("status", null);
				this.dispatchCustomEvent("reconnecting");
			}
		});
		this.socket.addEventListener("message", (event) => {
			try {
				if (event.data instanceof ArrayBuffer) {
					const view = new DataView(event.data);
					const eventType = view.getUint32(0);
					let imageMime;
					switch (eventType) {
						case 3:
							try {
								const decoder3 = new TextDecoder();
								const rawData = event.data.slice(4);
								const rawView = new DataView(rawData);
								let offset = 0;
								let promptId;
								if (this.serverSupportsFeature("supports_progress_text_metadata")) {
									const promptIdLength = rawView.getUint32(offset);
									offset += 4;
									promptId = decoder3.decode(rawData.slice(offset, offset + promptIdLength));
									offset += promptIdLength;
								}
								const nodeIdLength = rawView.getUint32(offset);
								offset += 4;
								const nodeId = decoder3.decode(rawData.slice(offset, offset + nodeIdLength));
								offset += nodeIdLength;
								const text = decoder3.decode(rawData.slice(offset));
								this.dispatchCustomEvent("progress_text", {
									nodeId,
									text,
									...promptId !== void 0 && { prompt_id: promptId }
								});
							} catch (e) {
								console.warn("Failed to parse progress_text binary message", e);
							}
							break;
						case 1:
							const imageType = view.getUint32(4);
							const imageData = event.data.slice(8);
							switch (imageType) {
								case 2:
									imageMime = "image/png";
									break;
								default:
									imageMime = "image/jpeg";
									break;
							}
							const imageBlob = new Blob([imageData], { type: imageMime });
							this.dispatchCustomEvent("b_preview", imageBlob);
							break;
						case 4:
							const decoder4 = new TextDecoder();
							const metadataLength = view.getUint32(4);
							const metadataBytes = event.data.slice(8, 8 + metadataLength);
							const metadata = JSON.parse(decoder4.decode(metadataBytes));
							const imageData4 = event.data.slice(8 + metadataLength);
							let imageMime4 = metadata.image_type;
							const imageBlob4 = new Blob([imageData4], { type: imageMime4 });
							this.dispatchCustomEvent("b_preview_with_metadata", {
								blob: imageBlob4,
								nodeId: metadata.node_id,
								displayNodeId: metadata.display_node_id,
								parentNodeId: metadata.parent_node_id,
								realNodeId: metadata.real_node_id,
								jobId: metadata.prompt_id
							});
							this.dispatchCustomEvent("b_preview", imageBlob4);
							break;
						default: throw new Error(`Unknown binary websocket message of type ${eventType}`);
					}
				} else {
					const msg = JSON.parse(event.data);
					switch (msg.type) {
						case "status":
							if (msg.data.sid) {
								const clientId = msg.data.sid;
								this.clientId = clientId;
								window.name = clientId;
								sessionStorage.setItem("clientId", clientId);
							}
							this.dispatchCustomEvent("status", msg.data.status ?? null);
							break;
						case "executing":
							this.dispatchCustomEvent("executing", msg.data.display_node || msg.data.node);
							break;
						case "execution_start":
						case "execution_error":
						case "execution_interrupted":
						case "execution_cached":
						case "execution_success":
						case "progress":
						case "progress_state":
						case "executed":
						case "graphChanged":
						case "promptQueued":
						case "logs":
						case "b_preview":
						case "notification":
							this.dispatchCustomEvent(msg.type, msg.data);
							break;
						case "feature_flags":
							this.serverFeatureFlags.value = msg.data;
							this.serverFeatureFlags.value;
							this.dispatchCustomEvent("feature_flags", msg.data);
							break;
						default: if (this._registered.has(msg.type)) super.dispatchEvent(new CustomEvent(msg.type, { detail: msg.data }));
						else if (!this.reportedUnknownMessageTypes.has(msg.type)) {
							this.reportedUnknownMessageTypes.add(msg.type);
							throw new Error(`Unknown message type ${msg.type}`);
						}
					}
				}
			} catch (error) {
				console.warn("Unhandled message:", event.data, error);
			}
		});
	}
	/**
	* Initialises sockets and realtime updates
	*/
	init() {
		this.createSocket();
	}
	/**
	* Gets a list of extension urls
	*/
	async getExtensions() {
		return await (await this.fetchApi("/extensions", { cache: "no-store" })).json();
	}
	/**
	* Gets the available workflow templates from custom nodes.
	* @returns A map of custom_node names and associated template workflow names.
	*/
	async getWorkflowTemplates() {
		return await (await this.fetchApi("/workflow_templates")).json();
	}
	/**
	* Gets the index of core workflow templates.
	* @param locale Optional locale code (e.g., 'en', 'fr', 'zh') to load localized templates
	*/
	async getCoreWorkflowTemplates(locale) {
		const fileName = locale && locale !== "en" ? `index.${locale}.json` : "index.json";
		try {
			const res = await axios.get(this.fileURL(`/templates/${fileName}`));
			return String(res.headers["content-type"] ?? "").includes("application/json") ? res.data : [];
		} catch (error) {
			if (locale && locale !== "en") {
				console.warn(`Localized templates for '${locale}' not found, falling back to English`);
				return this.getCoreWorkflowTemplates();
			}
			console.error("Error loading core workflow templates:", error);
			return [];
		}
	}
	/**
	* Gets a list of embedding names
	*/
	async getEmbeddings() {
		return await (await this.fetchApi("/embeddings", { cache: "no-store" })).json();
	}
	/**
	* Loads node object definitions for the graph
	* @returns The node definitions
	*/
	async getNodeDefs() {
		return await (await this.fetchApi("/object_info", { cache: "no-store" })).json();
	}
	/**
	* Queues a prompt to be executed
	* @param {number} number The index at which to queue the prompt, passing -1 will insert the prompt at the front of the queue
	* @param {object} data The prompt data to queue
	* @param {QueuePromptOptions} options Optional execution options
	* @throws {PromptExecutionError} If the prompt fails to execute
	*/
	async queuePrompt(number, data, options) {
		const { output: prompt, workflow } = data;
		const body = {
			client_id: this.clientId ?? "",
			prompt,
			...options?.partialExecutionTargets && { partial_execution_targets: options.partialExecutionTargets },
			extra_data: {
				auth_token_comfy_org: this.authToken,
				api_key_comfy_org: this.apiKey,
				comfy_usage_source: "comfyui-frontend",
				extra_pnginfo: { workflow },
				...options?.previewMethod && options.previewMethod !== "default" && { preview_method: options.previewMethod }
			}
		};
		if (number === -1) body.front = true;
		else if (number != 0) body.number = number;
		const res = await this.fetchApi("/prompt", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		if (res.status !== 200) {
			const text = await res.text();
			let errorResponse;
			try {
				errorResponse = JSON.parse(text);
			} catch {
				errorResponse = { error: {
					type: "server_error",
					message: `${res.status} ${res.statusText}`,
					details: text
				} };
			}
			throw new PromptExecutionError(errorResponse, res.status);
		}
		return await res.json();
	}
	/**
	* Gets the list of assets and models referenced by a prompt that would
	* need user consent before sharing.
	*/
	async getShareableAssets(prompt, options) {
		const body = { workflow_api_json: prompt };
		if (options?.owned !== void 0) body.owned = options.owned;
		const res = await this.fetchApi("/assets/from-workflow", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		if (res.status !== 200) throw new Error(`Failed to fetch shareable assets: ${res.status}`);
		const data = await res.json();
		return zShareableAssetsResponse.parse(data);
	}
	/**
	* Gets a list of model folder keys (eg ['checkpoints', 'loras', ...])
	* @returns The list of model folder keys
	*/
	async getModelFolders() {
		const res = await this.fetchApi(`/experiment/models`);
		if (res.status === 404) return [];
		const folderBlacklist = ["configs", "custom_nodes"];
		return (await res.json()).filter((folder) => !folderBlacklist.includes(folder.name));
	}
	/**
	* Gets a list of models in the specified folder
	* @param {string} folder The folder to list models from, such as 'checkpoints'
	* @returns The list of model filenames within the specified folder
	*/
	async getModels(folder) {
		const res = await this.fetchApi(`/experiment/models/${folder}`);
		if (res.status === 404) return [];
		return await res.json();
	}
	/**
	* Gets the metadata for a model
	* @param {string} folder The folder containing the model
	* @param {string} model The model to get metadata for
	* @returns The metadata for the model
	*/
	async viewMetadata(folder, model) {
		const res = await this.fetchApi(`/view_metadata/${folder}?filename=${encodeURIComponent(model)}`);
		const rawResponse = await res.text();
		if (!rawResponse) return null;
		try {
			return JSON.parse(rawResponse);
		} catch (error) {
			console.error("Error viewing metadata", res.status, res.statusText, rawResponse, error);
			return null;
		}
	}
	/**
	* Loads a list of items (queue or history)
	* @param {string} type The type of items to load, queue or history
	* @returns The items of the specified type grouped by their status
	*/
	async getItems(type) {
		if (type === "queue") return this.getQueue();
		return this.getHistory();
	}
	/**
	* Gets the current state of the queue
	* @returns The currently running and queued items
	*/
	async getQueue(options) {
		try {
			return await fetchQueue(this.fetchApi.bind(this));
		} catch (error) {
			if (options?.throwOnError) throw error;
			console.error("Failed to fetch queue:", error);
			return {
				Running: [],
				Pending: []
			};
		}
	}
	/**
	* Gets the prompt execution history
	* @returns Prompt history including node outputs
	*/
	async getHistory(max_items = 200, options) {
		try {
			return await fetchHistory(this.fetchApi.bind(this), max_items, options?.offset);
		} catch (error) {
			console.error(error);
			return [];
		}
	}
	/**
	* Gets detailed job info including outputs and workflow
	* @param jobId The job ID
	* @returns Full job details or undefined if not found
	*/
	async getJobDetail(jobId) {
		return fetchJobDetail(this.fetchApi.bind(this), jobId);
	}
	/**
	* Gets system & device stats
	* @returns System stats such as python version, OS, per device info
	*/
	async getSystemStats() {
		return await (await this.fetchApi("/system_stats")).json();
	}
	/**
	* Sends a POST request to the API
	* @param {*} type The endpoint to post to
	* @param {*} body Optional POST data
	*/
	async _postItem(type, body) {
		try {
			await this.fetchApi("/" + type, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: body ? JSON.stringify(body) : void 0
			});
		} catch (error) {
			console.error(error);
		}
	}
	/**
	* Deletes an item from the specified list
	* @param {string} type The type of item to delete, queue or history
	* @param {number} id The id of the item to delete
	*/
	async deleteItem(type, id) {
		await this._postItem(type, { delete: [id] });
	}
	/**
	* Clears the specified list
	* @param {string} type The type of list to clear, queue or history
	*/
	async clearItems(type) {
		await this._postItem(type, { clear: true });
	}
	/**
	* Interrupts the execution of the running job. If runningJobId is provided,
	* it is included in the payload as a helpful hint to the backend.
	* @param {string | null} [runningJobId] Optional Running Job ID to interrupt
	*/
	async interrupt(runningJobId) {
		await this._postItem("interrupt", runningJobId ? { prompt_id: runningJobId } : void 0);
	}
	/**
	* Cancels a single job by id via `POST /api/jobs/{job_id}/cancel` (idempotent:
	* already-terminal jobs are a no-op). Requires runtime parity — not every
	* runtime exposes this endpoint yet; do not merge callers before parity lands.
	*
	* @param {string} jobId The id of the job to cancel
	*/
	async cancelJob(jobId) {
		const res = await this.fetchApi(`/jobs/${encodeURIComponent(jobId)}/cancel`, { method: "POST" });
		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`Failed to cancel job ${jobId}: ${res.status}${body ? ` — ${body}` : ""}`);
		}
	}
	/**
	* Cancels multiple jobs in a single request via `POST /api/jobs/cancel` with
	* body `{ job_ids: [...] }`. Already-terminal jobs are no-ops. Same runtime
	* parity requirement as {@link cancelJob}.
	*
	* @param {string[]} jobIds The ids of the jobs to cancel
	*/
	async cancelJobs(jobIds) {
		if (!jobIds.length) return;
		const res = await this.fetchApi("/jobs/cancel", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ job_ids: jobIds })
		});
		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`Failed to cancel jobs: ${res.status}${body ? ` — ${body}` : ""}`);
		}
	}
	/**
	* Gets user configuration data and where data should be stored
	*/
	async getUserConfig() {
		return (await this.fetchApi("/users")).json();
	}
	/**
	* Creates a new user
	* @param { string } username
	* @returns The fetch response
	*/
	createUser(username) {
		return this.fetchApi("/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username })
		});
	}
	/**
	* Gets all setting values for the current user
	* @returns { Promise<string, unknown> } A dictionary of id -> value
	*/
	async getSettings() {
		const resp = await this.fetchApi("/settings");
		if (resp.status == 401) throw new UnauthorizedError(resp.statusText);
		if (resp.status !== 200) return {};
		return await resp.json();
	}
	/**
	* Gets a setting for the current user
	* @param { string } id The id of the setting to fetch
	* @returns { Promise<unknown> } The setting value
	*/
	async getSetting(id) {
		return (await this.fetchApi(`/settings/${encodeURIComponent(id)}`)).json();
	}
	/**
	* Stores a dictionary of settings for the current user
	*/
	async storeSettings(settings) {
		return this.fetchApi(`/settings`, {
			method: "POST",
			body: JSON.stringify(settings)
		});
	}
	/**
	* Stores a setting for the current user
	*/
	async storeSetting(id, value) {
		return this.fetchApi(`/settings/${encodeURIComponent(id)}`, {
			method: "POST",
			body: JSON.stringify(value)
		});
	}
	/**
	* Gets a user data file for the current user
	*/
	async getUserData(file, options) {
		return this.fetchApi(`/userdata/${encodeURIComponent(file)}`, options);
	}
	/**
	* Stores a user data file for the current user
	* @param { string } file The name of the userdata file to save
	* @param { unknown } data The data to save to the file
	* @param { RequestInit & { stringify?: boolean, throwOnError?: boolean } } [options]
	* @returns { Promise<Response> }
	*/
	async storeUserData(file, data, options = {
		overwrite: true,
		stringify: true,
		throwOnError: true,
		full_info: false
	}) {
		const resp = await this.fetchApi(`/userdata/${encodeURIComponent(file)}?overwrite=${options.overwrite}&full_info=${options.full_info}`, {
			method: "POST",
			body: options?.stringify ? JSON.stringify(data) : data,
			...options
		});
		if (resp.status !== 200 && options.throwOnError !== false) throw new Error(`Error storing user data file '${file}': ${resp.status} ${(await resp).statusText}`);
		return resp;
	}
	/**
	* Deletes a user data file for the current user
	* @param { string } file The name of the userdata file to delete
	*/
	async deleteUserData(file) {
		return await this.fetchApi(`/userdata/${encodeURIComponent(file)}`, { method: "DELETE" });
	}
	/**
	* Move a user data file for the current user
	* @param { string } source The userdata file to move
	* @param { string } dest The destination for the file
	*/
	async moveUserData(source, dest, options = { overwrite: false }) {
		return await this.fetchApi(`/userdata/${encodeURIComponent(source)}/move/${encodeURIComponent(dest)}?overwrite=${options?.overwrite}`, { method: "POST" });
	}
	async listUserDataFullInfo(dir) {
		const trimmedDir = trimEnd(dir, "/");
		const resp = await this.fetchApi(`/userdata?dir=${encodeURIComponent(trimmedDir)}&recurse=true&split=false&full_info=true`);
		if (resp.status === 404 || resp.status === 401) return [];
		if (resp.status !== 200) throw new Error(`Error getting user data list '${trimmedDir}': ${resp.status} ${resp.statusText}`);
		return resp.json();
	}
	async getGlobalSubgraphData(id) {
		const resp = await api.fetchApi("/global_subgraphs/" + id);
		if (resp.status !== 200) throw new Error(`Failed to fetch global subgraph '${id}': ${resp.status} ${resp.statusText}`);
		const subgraph = await resp.json();
		if (!subgraph?.data) throw new Error(`Global subgraph '${id}' returned empty data`);
		return subgraph.data;
	}
	async getGlobalSubgraphs() {
		const resp = await api.fetchApi("/global_subgraphs");
		if (resp.status !== 200) return {};
		const subgraphs = await resp.json();
		for (const [k, v] of Object.entries(subgraphs)) if (!v.data) v.data = this.getGlobalSubgraphData(k);
		return subgraphs;
	}
	async getLogs() {
		const url = isCloud ? this.apiURL("/logs") : this.internalURL("/logs");
		return (await axios.get(url)).data;
	}
	async getRawLogs() {
		const url = isCloud ? this.apiURL("/logs/raw") : this.internalURL("/logs/raw");
		return (await axios.get(url)).data;
	}
	async subscribeLogs(enabled) {
		const url = isCloud ? this.apiURL("/logs/subscribe") : this.internalURL("/logs/subscribe");
		return await axios.patch(url, {
			enabled,
			clientId: this.clientId
		});
	}
	async getFolderPaths() {
		const response = await axios.get(this.internalURL("/folder_paths")).catch(() => null);
		if (!response) return {};
		return response.data;
	}
	async freeMemory(options) {
		try {
			let mode = "";
			if (options.freeExecutionCache) mode = "{\"unload_models\": true, \"free_memory\": true}";
			else mode = "{\"unload_models\": true}";
			if ((await this.fetchApi(`/free`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: mode
			})).status === 200) if (options.freeExecutionCache) useToastStore().add({
				severity: "success",
				summary: "Models and Execution Cache have been cleared.",
				life: 3e3
			});
			else useToastStore().add({
				severity: "success",
				summary: "Models have been unloaded.",
				life: 3e3
			});
			else useToastStore().add({
				severity: "error",
				summary: "Unloading of models failed. Installed ComfyUI may be an outdated version."
			});
		} catch (error) {
			useToastStore().add({
				severity: "error",
				summary: "An error occurred while trying to unload models."
			});
		}
	}
	/**
	* Gets the custom nodes i18n data from the server.
	*
	* @returns The custom nodes i18n data
	*/
	async getCustomNodesI18n() {
		return (await axios.get(this.apiURL("/i18n"))).data;
	}
	/**
	* Checks if the server supports a specific feature.
	* @param featureName The name of the feature to check (supports dot notation for nested values)
	* @returns true if the feature is supported, false otherwise
	*/
	serverSupportsFeature(featureName) {
		const override = /* @__PURE__ */ getDevOverride(featureName);
		if (override !== void 0) return override;
		return get(this.serverFeatureFlags.value, featureName) === true;
	}
	/**
	* Gets a server feature flag value.
	* @param featureName The name of the feature to get (supports dot notation for nested values)
	* @param defaultValue The default value if the feature is not found
	* @returns The feature value or default
	*/
	getServerFeature(featureName, defaultValue) {
		const override = /* @__PURE__ */ getDevOverride(featureName);
		if (override !== void 0) return override;
		return get(this.serverFeatureFlags.value, featureName, defaultValue);
	}
	/**
	* Gets all server feature flags.
	* @returns Copy of all server feature flags
	*/
	getServerFeatures() {
		return { ...this.serverFeatureFlags.value };
	}
	async getFuseOptions() {
		try {
			const res = await axios.get(this.fileURL("/templates/fuse_options.json"), { headers: { "Content-Type": "application/json" } });
			return String(res.headers["content-type"] ?? "").includes("application/json") ? res.data : null;
		} catch (error) {
			console.error("Error loading fuse options:", error);
			return null;
		}
	}
};
var api = new ComfyApi();
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.api = window.comfyAPI.api || {};
window.comfyAPI.api.UnauthorizedError = UnauthorizedError;
window.comfyAPI.api.PromptExecutionError = PromptExecutionError;
window.comfyAPI.api.ComfyApi = ComfyApi;
window.comfyAPI.api.api = api;
//#endregion
export { zDynamicComboInputSpec as A, Alignment as B, isIntInputSpec as C, zBooleanInputOptions as D, zBaseInputOptions as E, zKeybindingPreset as F, LinkMarkerShape as G, EaseFunction as H, resultItemType as I, RenderShape as J, LinkRenderType as K, comfyBaseSchema as L, zIntInputOptions as M, zMatchTypeOptions as N, zColorStop as O, zStringInputOptions as P, paletteSchema as R, isFloatInputSpec as S, zAutogrowOptions as T, LGraphEventMode as U, CanvasItem as V, LinkDirection as W, hasFlag as X, TitleMode as Y, getComboSpecComboOptions as _, fetchHistoryPage as a, isComboInputSpecV1 as b, zResultItem as c, CORE_NODE_MODULES as d, NodeBadgeMode as f, isEssentialNode as g, isCustomNode as h, extractWorkflow as i, zFloatInputOptions as j, zComboInputOptions as k, LinkReleaseTriggerAction as l, getNodeSource as m, UnauthorizedError as n, zAssetInfo as o, NodeSourceType as p, NodeSlotType as q, api as r, zComfyHubProfile as s, PromptExecutionError as t, BLUEPRINT_CATEGORY as u, getInputSpecType as v, isMediaUploadComboInput as w, isComboInputSpecV2 as x, isComboInputSpec as y, validateComfyWorkflow as z };

//# sourceMappingURL=api-DtOML0NT.js.map