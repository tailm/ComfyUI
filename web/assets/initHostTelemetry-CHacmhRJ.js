import "./rolldown-runtime-w0pxe0c8.js";
import { r as Fuse } from "./vendor-vueuse-D8rwdKM0.js";
import { t as getDevOverride } from "./devFeatureFlagOverride-C_h7DxV8.js";
import { t as setTelemetryRegistry } from "./telemetry-CLr022VN.js";
import { a as remoteConfig } from "./remoteConfig-0E2rLe-N.js";
import { i as startTopupTracking, n as clearTopupTracking, t as checkForCompletedTopup } from "./topupTracker-DjokaHr0.js";
//#region src/platform/telemetry/TelemetryRegistry.ts
/**
* Registry that holds multiple telemetry providers and dispatches
* all tracking calls to each registered provider.
*
* Implements TelemetryDispatcher (all methods required) while dispatching
* to TelemetryProvider instances using optional chaining since providers
* only implement the methods they care about.
*/
var TelemetryRegistry = class {
	providers = [];
	registerProvider(provider) {
		this.providers.push(provider);
	}
	dispatch(action) {
		this.providers.forEach((provider) => {
			try {
				action(provider);
			} catch (error) {
				console.error("[Telemetry] Provider dispatch failed", error);
			}
		});
	}
	trackSignupOpened() {
		this.dispatch((provider) => provider.trackSignupOpened?.());
	}
	trackAuth(metadata) {
		this.dispatch((provider) => provider.trackAuth?.(metadata));
	}
	trackUserLoggedIn() {
		this.dispatch((provider) => provider.trackUserLoggedIn?.());
	}
	trackSubscription(event, metadata) {
		this.dispatch((provider) => provider.trackSubscription?.(event, metadata));
	}
	trackBeginCheckout(metadata) {
		this.dispatch((provider) => provider.trackBeginCheckout?.(metadata));
	}
	trackMonthlySubscriptionSucceeded(metadata) {
		this.dispatch((provider) => provider.trackMonthlySubscriptionSucceeded?.(metadata));
	}
	trackMonthlySubscriptionCancelled() {
		this.dispatch((provider) => provider.trackMonthlySubscriptionCancelled?.());
	}
	trackSubscriptionCancellation(event, metadata) {
		this.dispatch((provider) => provider.trackSubscriptionCancellation?.(event, metadata));
	}
	trackResubscribeClicked(metadata) {
		this.dispatch((provider) => provider.trackResubscribeClicked?.(metadata));
	}
	trackAddApiCreditButtonClicked(metadata) {
		this.dispatch((provider) => provider.trackAddApiCreditButtonClicked?.(metadata));
	}
	trackApiCreditTopupButtonPurchaseClicked(amount) {
		this.dispatch((provider) => provider.trackApiCreditTopupButtonPurchaseClicked?.(amount));
	}
	trackApiCreditTopupSucceeded() {
		this.dispatch((provider) => provider.trackApiCreditTopupSucceeded?.());
	}
	trackWorkspaceInviteSent(metadata) {
		this.dispatch((provider) => provider.trackWorkspaceInviteSent?.(metadata));
	}
	trackRunButton(properties) {
		this.dispatch((provider) => provider.trackRunButton?.(properties));
	}
	startTopupTracking() {
		this.dispatch((provider) => provider.startTopupTracking?.());
	}
	checkForCompletedTopup(events) {
		return this.providers.some((provider) => {
			try {
				return provider.checkForCompletedTopup?.(events) ?? false;
			} catch (error) {
				console.error("[Telemetry] Provider dispatch failed", error);
				return false;
			}
		});
	}
	clearTopupTracking() {
		this.dispatch((provider) => provider.clearTopupTracking?.());
	}
	trackSurvey(stage, responses) {
		this.dispatch((provider) => provider.trackSurvey?.(stage, responses));
	}
	trackEmailVerification(stage) {
		this.dispatch((provider) => provider.trackEmailVerification?.(stage));
	}
	trackTemplate(metadata) {
		this.dispatch((provider) => provider.trackTemplate?.(metadata));
	}
	trackTemplateLibraryOpened(metadata) {
		this.dispatch((provider) => provider.trackTemplateLibraryOpened?.(metadata));
	}
	trackTemplateLibraryClosed(metadata) {
		this.dispatch((provider) => provider.trackTemplateLibraryClosed?.(metadata));
	}
	trackWorkflowImported(metadata) {
		this.dispatch((provider) => provider.trackWorkflowImported?.(metadata));
	}
	trackWorkflowOpened(metadata) {
		this.dispatch((provider) => provider.trackWorkflowOpened?.(metadata));
	}
	trackWorkflowSaved(metadata) {
		this.dispatch((provider) => provider.trackWorkflowSaved?.(metadata));
	}
	trackDefaultViewSet(metadata) {
		this.dispatch((provider) => provider.trackDefaultViewSet?.(metadata));
	}
	trackEnterLinear(metadata) {
		this.dispatch((provider) => provider.trackEnterLinear?.(metadata));
	}
	trackShareFlow(metadata) {
		this.dispatch((provider) => provider.trackShareFlow?.(metadata));
	}
	trackShareLinkOpened(metadata) {
		this.dispatch((provider) => provider.trackShareLinkOpened?.(metadata));
	}
	trackPageVisibilityChanged(metadata) {
		this.dispatch((provider) => provider.trackPageVisibilityChanged?.(metadata));
	}
	trackTabCount(metadata) {
		this.dispatch((provider) => provider.trackTabCount?.(metadata));
	}
	trackShellLayout(metadata) {
		this.dispatch((provider) => provider.trackShellLayout?.(metadata));
	}
	trackNodeSearch(metadata) {
		this.dispatch((provider) => provider.trackNodeSearch?.(metadata));
	}
	trackNodeSearchResultSelected(metadata) {
		this.dispatch((provider) => provider.trackNodeSearchResultSelected?.(metadata));
	}
	trackSearchQuery(metadata) {
		this.dispatch((provider) => provider.trackSearchQuery?.(metadata));
	}
	trackNodeAdded(metadata) {
		this.dispatch((provider) => provider.trackNodeAdded?.(metadata));
	}
	trackTemplateFilterChanged(metadata) {
		this.dispatch((provider) => provider.trackTemplateFilterChanged?.(metadata));
	}
	trackHelpCenterOpened(metadata) {
		this.dispatch((provider) => provider.trackHelpCenterOpened?.(metadata));
	}
	trackHelpResourceClicked(metadata) {
		this.dispatch((provider) => provider.trackHelpResourceClicked?.(metadata));
	}
	trackHelpCenterClosed(metadata) {
		this.dispatch((provider) => provider.trackHelpCenterClosed?.(metadata));
	}
	trackWorkflowCreated(metadata) {
		this.dispatch((provider) => provider.trackWorkflowCreated?.(metadata));
	}
	trackWorkflowExecution() {
		this.dispatch((provider) => provider.trackWorkflowExecution?.());
	}
	trackExecutionError(metadata) {
		this.dispatch((provider) => provider.trackExecutionError?.(metadata));
	}
	trackExecutionSuccess(metadata) {
		this.dispatch((provider) => provider.trackExecutionSuccess?.(metadata));
	}
	trackSharedWorkflowRun(metadata) {
		this.dispatch((provider) => provider.trackSharedWorkflowRun?.(metadata));
	}
	trackSettingChanged(metadata) {
		this.dispatch((provider) => provider.trackSettingChanged?.(metadata));
	}
	trackUiButtonClicked(metadata) {
		this.dispatch((provider) => provider.trackUiButtonClicked?.(metadata));
	}
	trackPageView(pageName, properties) {
		this.dispatch((provider) => provider.trackPageView?.(pageName, properties));
	}
};
//#endregion
//#region src/platform/telemetry/types.ts
/**
* Telemetry event constants
*
* Event naming conventions:
* - 'app:' prefix: UI/user interaction events
* - No prefix: Backend/system events (execution lifecycle)
*/
var TelemetryEvents = {
	USER_SIGN_UP_OPENED: "app:user_sign_up_opened",
	USER_AUTH_COMPLETED: "app:user_auth_completed",
	USER_LOGGED_IN: "app:user_logged_in",
	RUN_BUTTON_CLICKED: "app:run_button_click",
	SUBSCRIPTION_REQUIRED_MODAL_OPENED: "app:subscription_required_modal_opened",
	SUBSCRIBE_NOW_BUTTON_CLICKED: "app:subscribe_now_button_clicked",
	MONTHLY_SUBSCRIPTION_SUCCEEDED: "app:monthly_subscription_succeeded",
	MONTHLY_SUBSCRIPTION_CANCELLED: "app:monthly_subscription_cancelled",
	SUBSCRIPTION_CANCEL_FLOW_OPENED: "app:subscription_cancel_flow_opened",
	SUBSCRIPTION_CANCEL_CONFIRMED: "app:subscription_cancel_confirmed",
	SUBSCRIPTION_CANCEL_ABANDONED: "app:subscription_cancel_abandoned",
	SUBSCRIPTION_CANCEL_FAILED: "app:subscription_cancel_failed",
	RESUBSCRIBE_BUTTON_CLICKED: "app:resubscribe_button_clicked",
	ADD_API_CREDIT_BUTTON_CLICKED: "app:add_api_credit_button_clicked",
	API_CREDIT_TOPUP_BUTTON_PURCHASE_CLICKED: "app:api_credit_topup_button_purchase_clicked",
	API_CREDIT_TOPUP_SUCCEEDED: "app:api_credit_topup_succeeded",
	WORKSPACE_INVITE_SENT: "app:workspace_invite_sent",
	BEGIN_CHECKOUT: "begin_checkout",
	USER_SURVEY_OPENED: "app:user_survey_opened",
	USER_SURVEY_SUBMITTED: "app:user_survey_submitted",
	USER_EMAIL_VERIFY_OPENED: "app:user_email_verify_opened",
	USER_EMAIL_VERIFY_REQUESTED: "app:user_email_verify_requested",
	USER_EMAIL_VERIFY_COMPLETED: "app:user_email_verify_completed",
	TEMPLATE_WORKFLOW_OPENED: "app:template_workflow_opened",
	TEMPLATE_LIBRARY_OPENED: "app:template_library_opened",
	TEMPLATE_LIBRARY_CLOSED: "app:template_library_closed",
	WORKFLOW_IMPORTED: "app:workflow_imported",
	WORKFLOW_OPENED: "app:workflow_opened",
	ENTER_LINEAR_MODE: "app:app_mode_opened",
	SHARE_FLOW: "app:share_flow",
	SHARE_LINK_OPENED: "app:share_link_opened",
	PAGE_VISIBILITY_CHANGED: "app:page_visibility_changed",
	TAB_COUNT_TRACKING: "app:tab_count_tracking",
	SHELL_LAYOUT: "app:shell_layout",
	NODE_SEARCH: "app:node_search",
	NODE_SEARCH_RESULT_SELECTED: "app:node_search_result_selected",
	SEARCH_QUERY: "app:search_query",
	NODE_ADDED: "app:node_added_to_workflow",
	TEMPLATE_FILTER_CHANGED: "app:template_filter_changed",
	SETTING_CHANGED: "app:setting_changed",
	HELP_CENTER_OPENED: "app:help_center_opened",
	HELP_RESOURCE_CLICKED: "app:help_resource_clicked",
	HELP_CENTER_CLOSED: "app:help_center_closed",
	WORKFLOW_CREATED: "app:workflow_created",
	WORKFLOW_SAVED: "app:workflow_saved",
	DEFAULT_VIEW_SET: "app:default_view_set",
	EXECUTION_START: "execution_start",
	EXECUTION_ERROR: "execution_error",
	EXECUTION_SUCCESS: "execution_success",
	SHARED_WORKFLOW_RUN: "app:shared_workflow_run",
	UI_BUTTON_CLICKED: "app:ui_button_clicked",
	PAGE_VIEW: "app:page_view"
};
var CANCELLATION_STAGE_EVENTS = {
	flow_opened: TelemetryEvents.SUBSCRIPTION_CANCEL_FLOW_OPENED,
	confirmed: TelemetryEvents.SUBSCRIPTION_CANCEL_CONFIRMED,
	abandoned: TelemetryEvents.SUBSCRIPTION_CANCEL_ABANDONED,
	failed: TelemetryEvents.SUBSCRIPTION_CANCEL_FAILED
};
//#endregion
//#region src/platform/telemetry/utils/surveyNormalization.ts
/**
* Survey Response Normalization Utilities
*
* Smart categorization system to normalize free-text survey responses
* into standardized categories for better analytics breakdowns.
* Uses Fuse.js for fuzzy matching against category keywords.
*/
/**
* Industry category mappings based on ~9,000 user analysis
*/
var INDUSTRY_CATEGORIES = [
	{
		name: "Film / TV / Animation",
		userCount: 2885,
		keywords: [
			"film",
			"tv",
			"television",
			"animation",
			"animation studio",
			"tv production",
			"film production",
			"story",
			"anime",
			"video",
			"cinematography",
			"visual effects",
			"vfx",
			"vfx artist",
			"movie",
			"cinema",
			"documentary",
			"documentary filmmaker",
			"broadcast",
			"streaming",
			"production",
			"director",
			"filmmaker",
			"post-production",
			"editing"
		]
	},
	{
		name: "Marketing / Advertising / Social Media",
		userCount: 1340,
		keywords: [
			"marketing",
			"advertising",
			"youtube",
			"tiktok",
			"social media",
			"content creation",
			"influencer",
			"brand",
			"promotion",
			"digital marketing",
			"seo",
			"campaigns",
			"copywriting",
			"growth",
			"engagement"
		]
	},
	{
		name: "Software / IT / AI",
		userCount: 1100,
		keywords: [
			"software",
			"software development",
			"software engineer",
			"it",
			"ai",
			"ai research",
			"corporate ai research",
			"ai research lab",
			"tech company ai research",
			"developer",
			"app developer",
			"consulting",
			"tech",
			"tech startup",
			"programmer",
			"data science",
			"machine learning",
			"coding",
			"programming",
			"web development",
			"app development",
			"saas"
		]
	},
	{
		name: "Product & Industrial Design",
		userCount: 1050,
		keywords: [
			"product design",
			"industrial",
			"manufacturing",
			"3d rendering",
			"product visualization",
			"mechanical",
			"automotive",
			"cad",
			"prototype",
			"design engineering",
			"invention"
		]
	},
	{
		name: "Fine Art / Contemporary Art",
		userCount: 780,
		keywords: [
			"fine art",
			"art",
			"illustration",
			"contemporary",
			"artist",
			"painting",
			"drawing",
			"sculpture",
			"gallery",
			"canvas",
			"digital art",
			"mixed media",
			"abstract",
			"portrait"
		]
	},
	{
		name: "Education / Research",
		userCount: 640,
		keywords: [
			"education",
			"student",
			"teacher",
			"research",
			"university research",
			"academic ai research",
			"university ai research",
			"ai research at university",
			"learning",
			"university",
			"school",
			"academic",
			"professor",
			"curriculum",
			"training",
			"instruction",
			"pedagogy"
		]
	},
	{
		name: "Architecture / Engineering / Construction",
		userCount: 420,
		keywords: [
			"architecture",
			"architecture firm",
			"construction",
			"engineering",
			"civil",
			"civil engineering",
			"cad",
			"building",
			"structural",
			"landscape",
			"landscape architecture",
			"interior design",
			"real estate",
			"planning",
			"blueprints"
		]
	},
	{
		name: "Gaming / Interactive Media",
		userCount: 410,
		keywords: [
			"gaming",
			"game dev",
			"game development",
			"indie game studio",
			"vr development",
			"roblox",
			"interactive",
			"interactive media",
			"virtual world",
			"vr",
			"ar",
			"metaverse",
			"simulation",
			"unity",
			"unity developer",
			"unreal",
			"indie games"
		]
	},
	{
		name: "Photography / Videography",
		userCount: 70,
		keywords: [
			"photography",
			"photo",
			"videography",
			"camera",
			"image",
			"portrait",
			"wedding",
			"commercial photo",
			"stock photography",
			"photojournalism",
			"event photography"
		]
	},
	{
		name: "Fashion / Beauty / Retail",
		userCount: 25,
		keywords: [
			"fashion",
			"fashion design",
			"beauty",
			"beauty industry",
			"jewelry",
			"jewelry design",
			"custom jewelry design",
			"retail",
			"retail store",
			"style",
			"clothing",
			"cosmetics",
			"makeup",
			"accessories",
			"boutique"
		]
	},
	{
		name: "Music / Performing Arts",
		userCount: 25,
		keywords: [
			"music",
			"music production",
			"vj",
			"dance",
			"projection mapping",
			"audio visual",
			"concert",
			"concert production",
			"performance",
			"theater",
			"stage",
			"live events"
		]
	},
	{
		name: "Healthcare / Medical / Life Science",
		userCount: 30,
		keywords: [
			"healthcare",
			"medical",
			"medical research",
			"doctor",
			"biotech",
			"life science",
			"pharmaceutical",
			"clinical",
			"clinical research",
			"hospital",
			"medicine",
			"health"
		]
	},
	{
		name: "E-commerce / Print-on-Demand / Business",
		userCount: 15,
		keywords: [
			"ecommerce",
			"e-commerce",
			"print on demand",
			"shop",
			"business",
			"commercial",
			"startup",
			"entrepreneur",
			"sales",
			"online store"
		]
	},
	{
		name: "Nonprofit / Government / Public Sector",
		userCount: 15,
		keywords: [
			"501c3",
			"ngo",
			"government",
			"public service",
			"policy",
			"nonprofit",
			"charity",
			"civic",
			"community",
			"social impact"
		]
	},
	{
		name: "Adult / NSFW",
		userCount: 10,
		keywords: [
			"nsfw",
			"nsfw content",
			"adult",
			"adult entertainment",
			"erotic",
			"explicit",
			"xxx",
			"porn"
		]
	}
];
/**
* Use case category mappings based on common patterns
*/
var USE_CASE_CATEGORIES = [
	{
		name: "Content Creation & Marketing",
		keywords: [
			"content creation",
			"social media",
			"marketing",
			"marketing campaigns",
			"advertising",
			"youtube",
			"youtube thumbnail",
			"youtube thumbnail generation",
			"tiktok",
			"instagram",
			"thumbnails",
			"posts",
			"campaigns",
			"brand content"
		]
	},
	{
		name: "Art & Illustration",
		keywords: [
			"art",
			"illustration",
			"drawing",
			"painting",
			"concept art",
			"creating concept art",
			"character design",
			"digital art",
			"fantasy art",
			"portraits"
		]
	},
	{
		name: "Product Visualization & Design",
		keywords: [
			"product",
			"product mockup",
			"product mockup creation",
			"visualization",
			"prototype visualization",
			"design",
			"prototype",
			"mockup",
			"3d rendering",
			"industrial design",
			"product photos"
		]
	},
	{
		name: "Film & Video Production",
		keywords: [
			"film",
			"video",
			"video editing",
			"movie",
			"movie production",
			"animation",
			"vfx",
			"visual effects",
			"storyboard",
			"storyboard creation",
			"cinematography",
			"post production"
		]
	},
	{
		name: "Gaming & Interactive Media",
		keywords: [
			"game",
			"gaming",
			"game asset generation",
			"game assets",
			"game development",
			"game textures",
			"interactive",
			"vr",
			"vr content creation",
			"ar",
			"virtual",
			"simulation",
			"metaverse",
			"textures"
		]
	},
	{
		name: "Architecture & Construction",
		keywords: [
			"architecture",
			"architectural rendering",
			"building",
			"building visualization",
			"construction",
			"interior design",
			"interior design mockups",
			"landscape",
			"real estate",
			"real estate visualization",
			"floor plans",
			"renderings"
		]
	},
	{
		name: "Education & Training",
		keywords: [
			"education",
			"educational",
			"educational content",
			"training",
			"training materials",
			"learning",
			"teaching",
			"tutorial",
			"tutorial creation",
			"course",
			"academic",
			"academic projects",
			"instructional",
			"workshops"
		]
	},
	{
		name: "Research & Development",
		keywords: [
			"research",
			"research experiments",
			"development",
			"experiment",
			"prototype",
			"prototype testing",
			"testing",
			"analysis",
			"study",
			"innovation",
			"innovation projects",
			"r&d",
			"scientific visualization"
		]
	},
	{
		name: "Personal & Hobby",
		keywords: [
			"personal",
			"personal art projects",
			"hobby",
			"hobby work",
			"fun",
			"fun experiments",
			"experiment",
			"learning",
			"curiosity",
			"explore",
			"creative",
			"creative exploration",
			"side project"
		]
	},
	{
		name: "Photography & Image Processing",
		keywords: [
			"photography",
			"product photography",
			"portrait photography",
			"photo",
			"photo editing",
			"image",
			"image enhancement",
			"portrait",
			"editing",
			"enhancement",
			"restoration",
			"photo manipulation"
		]
	}
];
/**
* Fuse.js configuration for category matching
*/
var FUSE_OPTIONS = {
	keys: ["keywords"],
	threshold: .53,
	minMatchCharLength: 5,
	includeScore: true,
	includeMatches: true,
	ignoreLocation: true,
	findAllMatches: true
};
/**
* Create Fuse instances for category matching
*/
var industryFuse = new Fuse(INDUSTRY_CATEGORIES, FUSE_OPTIONS);
var useCaseFuse = new Fuse(USE_CASE_CATEGORIES, FUSE_OPTIONS);
/**
* Normalize industry responses using Fuse.js fuzzy search
*/
function normalizeIndustry(rawIndustry) {
	if (!rawIndustry || typeof rawIndustry !== "string") return "Other / Undefined";
	if (rawIndustry.toLowerCase().trim().match(/^(other|none|undefined|unknown|n\/a|not applicable|-|)$/)) return "Other / Undefined";
	const results = industryFuse.search(rawIndustry);
	if (results.length > 0) return results[0].item.name;
	return `Uncategorized: ${rawIndustry}`;
}
/**
* Normalize use case responses using Fuse.js fuzzy search
*/
function normalizeUseCase(rawUseCase) {
	if (!rawUseCase || typeof rawUseCase !== "string") return "Other / Undefined";
	if (rawUseCase.toLowerCase().trim().match(/^(other|none|undefined|unknown|n\/a|not applicable|-|)$/)) return "Other / Undefined";
	const results = useCaseFuse.search(rawUseCase);
	if (results.length > 0) return results[0].item.name;
	return `Uncategorized: ${rawUseCase}`;
}
/**
* Apply normalization to survey responses
* Creates both normalized and raw versions of responses
*/
function normalizeSurveyResponses(responses) {
	const normalized = { ...responses };
	if (typeof responses.industry === "string") {
		normalized.industry_normalized = normalizeIndustry(responses.industry);
		normalized.industry_raw = responses.industry;
	}
	if (typeof responses.useCase === "string") {
		normalized.useCase_normalized = normalizeUseCase(responses.useCase);
		normalized.useCase_raw = responses.useCase;
	}
	return normalized;
}
//#endregion
//#region src/platform/telemetry/providers/host/HostTelemetrySink.ts
function isHostTelemetryPrimitive(value) {
	return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function toHostTelemetryProperties(properties) {
	if (!properties) return void 0;
	const out = {};
	for (const [key, value] of Object.entries(properties)) if (isHostTelemetryPrimitive(value)) out[key] = value;
	else if (Array.isArray(value) && value.every(isHostTelemetryPrimitive)) out[key] = value;
	return out;
}
var HostTelemetrySink = class {
	capture(event, properties) {
		window.__comfyDesktop2?.Telemetry?.capture(event, toHostTelemetryProperties(properties));
	}
	trackSignupOpened() {
		this.capture(TelemetryEvents.USER_SIGN_UP_OPENED);
	}
	trackAuth(metadata) {
		this.capture(TelemetryEvents.USER_AUTH_COMPLETED, metadata);
	}
	trackUserLoggedIn() {
		this.capture(TelemetryEvents.USER_LOGGED_IN);
	}
	trackSubscription(event, metadata) {
		this.capture(event === "modal_opened" ? TelemetryEvents.SUBSCRIPTION_REQUIRED_MODAL_OPENED : TelemetryEvents.SUBSCRIBE_NOW_BUTTON_CLICKED, metadata);
	}
	trackBeginCheckout(metadata) {
		this.capture(TelemetryEvents.BEGIN_CHECKOUT, metadata);
	}
	trackMonthlySubscriptionSucceeded(metadata) {
		this.capture(TelemetryEvents.MONTHLY_SUBSCRIPTION_SUCCEEDED, metadata);
	}
	trackMonthlySubscriptionCancelled() {
		this.capture(TelemetryEvents.MONTHLY_SUBSCRIPTION_CANCELLED);
	}
	trackSubscriptionCancellation(event, metadata) {
		this.capture(CANCELLATION_STAGE_EVENTS[event], metadata);
	}
	trackResubscribeClicked(metadata) {
		this.capture(TelemetryEvents.RESUBSCRIBE_BUTTON_CLICKED, metadata);
	}
	trackAddApiCreditButtonClicked(metadata) {
		this.capture(TelemetryEvents.ADD_API_CREDIT_BUTTON_CLICKED, metadata);
	}
	trackApiCreditTopupButtonPurchaseClicked(amount) {
		this.capture(TelemetryEvents.API_CREDIT_TOPUP_BUTTON_PURCHASE_CLICKED, { credit_amount: amount });
	}
	trackApiCreditTopupSucceeded() {
		this.capture(TelemetryEvents.API_CREDIT_TOPUP_SUCCEEDED);
	}
	trackRunButton(properties) {
		this.capture(TelemetryEvents.RUN_BUTTON_CLICKED, properties);
	}
	startTopupTracking() {
		startTopupTracking();
	}
	checkForCompletedTopup(events) {
		return checkForCompletedTopup(events);
	}
	clearTopupTracking() {
		clearTopupTracking();
	}
	trackSurvey(stage, responses) {
		this.capture(stage === "opened" ? TelemetryEvents.USER_SURVEY_OPENED : TelemetryEvents.USER_SURVEY_SUBMITTED, responses ? normalizeSurveyResponses(responses) : void 0);
	}
	trackEmailVerification(stage) {
		const event = stage === "opened" ? TelemetryEvents.USER_EMAIL_VERIFY_OPENED : stage === "requested" ? TelemetryEvents.USER_EMAIL_VERIFY_REQUESTED : TelemetryEvents.USER_EMAIL_VERIFY_COMPLETED;
		this.capture(event);
	}
	trackTemplate(metadata) {
		this.capture(TelemetryEvents.TEMPLATE_WORKFLOW_OPENED, metadata);
	}
	trackTemplateLibraryOpened(metadata) {
		this.capture(TelemetryEvents.TEMPLATE_LIBRARY_OPENED, metadata);
	}
	trackTemplateLibraryClosed(metadata) {
		this.capture(TelemetryEvents.TEMPLATE_LIBRARY_CLOSED, metadata);
	}
	trackWorkflowImported(metadata) {
		this.capture(TelemetryEvents.WORKFLOW_IMPORTED, metadata);
	}
	trackWorkflowOpened(metadata) {
		this.capture(TelemetryEvents.WORKFLOW_OPENED, metadata);
	}
	trackWorkflowSaved(metadata) {
		this.capture(TelemetryEvents.WORKFLOW_SAVED, metadata);
	}
	trackDefaultViewSet(metadata) {
		this.capture(TelemetryEvents.DEFAULT_VIEW_SET, metadata);
	}
	trackEnterLinear(metadata) {
		this.capture(TelemetryEvents.ENTER_LINEAR_MODE, metadata);
	}
	trackShareFlow(metadata) {
		this.capture(TelemetryEvents.SHARE_FLOW, metadata);
	}
	trackShareLinkOpened(metadata) {
		this.capture(TelemetryEvents.SHARE_LINK_OPENED, metadata);
	}
	trackPageVisibilityChanged(metadata) {
		this.capture(TelemetryEvents.PAGE_VISIBILITY_CHANGED, metadata);
	}
	trackTabCount(metadata) {
		this.capture(TelemetryEvents.TAB_COUNT_TRACKING, metadata);
	}
	trackNodeSearch(metadata) {
		this.capture(TelemetryEvents.NODE_SEARCH, metadata);
	}
	trackNodeSearchResultSelected(metadata) {
		this.capture(TelemetryEvents.NODE_SEARCH_RESULT_SELECTED, metadata);
	}
	trackSearchQuery(metadata) {
		this.capture(TelemetryEvents.SEARCH_QUERY, metadata);
	}
	trackNodeAdded(metadata) {
		this.capture(TelemetryEvents.NODE_ADDED, metadata);
	}
	trackTemplateFilterChanged(metadata) {
		this.capture(TelemetryEvents.TEMPLATE_FILTER_CHANGED, metadata);
	}
	trackHelpCenterOpened(metadata) {
		this.capture(TelemetryEvents.HELP_CENTER_OPENED, metadata);
	}
	trackHelpResourceClicked(metadata) {
		this.capture(TelemetryEvents.HELP_RESOURCE_CLICKED, metadata);
	}
	trackHelpCenterClosed(metadata) {
		this.capture(TelemetryEvents.HELP_CENTER_CLOSED, metadata);
	}
	trackWorkflowCreated(metadata) {
		this.capture(TelemetryEvents.WORKFLOW_CREATED, metadata);
	}
	trackWorkflowExecution() {
		this.capture(TelemetryEvents.EXECUTION_START);
	}
	trackExecutionError(metadata) {
		this.capture(TelemetryEvents.EXECUTION_ERROR, metadata);
	}
	trackExecutionSuccess(metadata) {
		this.capture(TelemetryEvents.EXECUTION_SUCCESS, metadata);
	}
	trackSharedWorkflowRun(metadata) {
		this.capture(TelemetryEvents.SHARED_WORKFLOW_RUN, metadata);
	}
	trackSettingChanged(metadata) {
		this.capture(TelemetryEvents.SETTING_CHANGED, metadata);
	}
	trackUiButtonClicked(metadata) {
		this.capture(TelemetryEvents.UI_BUTTON_CLICKED, metadata);
	}
	trackPageView(pageName, properties) {
		this.capture(TelemetryEvents.PAGE_VIEW, {
			page_name: pageName,
			...properties
		});
	}
};
//#endregion
//#region src/platform/telemetry/initHostTelemetry.ts
var ENABLE_TELEMETRY_FEATURE = "enable_telemetry";
function isHostTelemetryEnabled() {
	const override = /* @__PURE__ */ getDevOverride(ENABLE_TELEMETRY_FEATURE);
	if (override !== void 0) return override;
	return remoteConfig.value.enable_telemetry === true;
}
function initHostTelemetry() {
	if (!isHostTelemetryEnabled()) return;
	if (!window.__comfyDesktop2?.Telemetry) return;
	const registry = new TelemetryRegistry();
	registry.registerProvider(new HostTelemetrySink());
	setTelemetryRegistry(registry);
}
//#endregion
export { initHostTelemetry };

//# sourceMappingURL=initHostTelemetry-CHacmhRJ.js.map