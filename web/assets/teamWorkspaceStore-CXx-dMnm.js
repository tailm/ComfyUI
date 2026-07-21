import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, At as readonly, Pt as shallowRef, jt as ref, kt as reactive, l as defineStore } from "./vendor-vue-core-ywZ1En3W.js";
import { s as t } from "./i18n-Ck8-Gum6.js";
import { r as api } from "./api-Bz5NhLSR.js";
import { a as arrayType, h as objectType, l as enumType, v as stringType } from "./vendor-zod-BwmrqdWK.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import { t as axios } from "./vendor-axios-BWFjRHOY.js";
import { t as getDevOverride } from "./devFeatureFlagOverride-C_h7DxV8.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { a as remoteConfig, i as isAuthenticatedConfigLoaded, n as cachedTeamWorkspacesEnabled, t as cachedConsolidatedBillingEnabled } from "./remoteConfig-0E2rLe-N.js";
import { t as useUserStore } from "./userStore-sNxhcspP.js";
//#region src/platform/workspace/workspaceConstants.ts
var WORKSPACE_STORAGE_KEYS = {
	CURRENT_WORKSPACE: "Comfy.Workspace.Current",
	TOKEN: "Comfy.Workspace.Token",
	EXPIRES_AT: "Comfy.Workspace.ExpiresAt",
	LAST_WORKSPACE_ID: "Comfy.Workspace.LastWorkspaceId"
};
var TOKEN_REFRESH_BUFFER_MS = 300 * 1e3;
//#endregion
//#region src/composables/useFeatureFlags.ts
/**
* Known server feature flags (top-level, not extensions)
*/
var ServerFeatureFlag = /* @__PURE__ */ function(ServerFeatureFlag) {
	ServerFeatureFlag["SUPPORTS_PREVIEW_METADATA"] = "supports_preview_metadata";
	ServerFeatureFlag["MAX_UPLOAD_SIZE"] = "max_upload_size";
	ServerFeatureFlag["MANAGER_SUPPORTS_V4"] = "extension.manager.supports_v4";
	ServerFeatureFlag["MODEL_UPLOAD_BUTTON_ENABLED"] = "model_upload_button_enabled";
	ServerFeatureFlag["ASSET_RENAME_ENABLED"] = "asset_rename_enabled";
	ServerFeatureFlag["PRIVATE_MODELS_ENABLED"] = "private_models_enabled";
	ServerFeatureFlag["ONBOARDING_SURVEY_ENABLED"] = "onboarding_survey_enabled";
	ServerFeatureFlag["LINEAR_TOGGLE_ENABLED"] = "linear_toggle_enabled";
	ServerFeatureFlag["TEAM_WORKSPACES_ENABLED"] = "team_workspaces_enabled";
	ServerFeatureFlag["USER_SECRETS_ENABLED"] = "user_secrets_enabled";
	ServerFeatureFlag["NODE_REPLACEMENTS"] = "node_replacements";
	ServerFeatureFlag["NODE_LIBRARY_ESSENTIALS_ENABLED"] = "node_library_essentials_enabled";
	ServerFeatureFlag["WORKFLOW_SHARING_ENABLED"] = "workflow_sharing_enabled";
	ServerFeatureFlag["COMFYHUB_UPLOAD_ENABLED"] = "comfyhub_upload_enabled";
	ServerFeatureFlag["COMFYHUB_PROFILE_GATE_ENABLED"] = "comfyhub_profile_gate_enabled";
	ServerFeatureFlag["SHOW_SIGNIN_BUTTON"] = "show_signin_button";
	ServerFeatureFlag["UNIFIED_CLOUD_AUTH"] = "unified_cloud_auth";
	ServerFeatureFlag["CONSOLIDATED_BILLING_ENABLED"] = "consolidated_billing_enabled";
	ServerFeatureFlag["SIGNUP_TURNSTILE"] = "signup_turnstile";
	return ServerFeatureFlag;
}({});
/**
* Resolves a feature flag value with dev override > remoteConfig > serverFeature priority.
*/
function resolveFlag(flagKey, remoteConfigValue, defaultValue) {
	const override = /* @__PURE__ */ getDevOverride(flagKey);
	if (override !== void 0) return override;
	return remoteConfigValue ?? api.getServerFeature(flagKey, defaultValue);
}
/**
* Resolves a per-user, Cloud-only flag that selects backend behavior. Off the
* Cloud build it is always false; during the auth window it falls back to the
* cached session value so anonymous bootstrap config cannot route the user to
* the wrong backend before authenticated config confirms the flag.
*/
function resolveAuthGatedFlag(flagKey, remoteConfigValue, cachedValue) {
	const override = /* @__PURE__ */ getDevOverride(flagKey);
	if (override !== void 0) return override;
	if (!isCloud) return false;
	if (!isAuthenticatedConfigLoaded.value) return cachedValue.value ?? false;
	return remoteConfigValue ?? api.getServerFeature(flagKey, false);
}
/**
* Composable for reactive access to server-side feature flags
*/
function useFeatureFlags() {
	const flags = reactive({
		get supportsPreviewMetadata() {
			return api.getServerFeature("supports_preview_metadata");
		},
		get maxUploadSize() {
			return api.getServerFeature("max_upload_size");
		},
		get supportsManagerV4() {
			return api.getServerFeature("extension.manager.supports_v4");
		},
		get modelUploadButtonEnabled() {
			return resolveFlag("model_upload_button_enabled", remoteConfig.value.model_upload_button_enabled, false);
		},
		get assetRenameEnabled() {
			return resolveFlag("asset_rename_enabled", remoteConfig.value.asset_rename_enabled, false);
		},
		get privateModelsEnabled() {
			return resolveFlag("private_models_enabled", remoteConfig.value.private_models_enabled, false);
		},
		get onboardingSurveyEnabled() {
			return resolveFlag("onboarding_survey_enabled", remoteConfig.value.onboarding_survey_enabled, false);
		},
		get linearToggleEnabled() {
			return resolveFlag("linear_toggle_enabled", remoteConfig.value.linear_toggle_enabled, false);
		},
		/**
		* Whether team workspaces feature is enabled.
		* IMPORTANT: Returns false until authenticated remote config is loaded.
		* This ensures we never use workspace tokens when the feature is disabled,
		* and prevents race conditions during initialization.
		*/
		get teamWorkspacesEnabled() {
			return resolveAuthGatedFlag("team_workspaces_enabled", remoteConfig.value.team_workspaces_enabled, cachedTeamWorkspacesEnabled);
		},
		get userSecretsEnabled() {
			return resolveFlag("user_secrets_enabled", remoteConfig.value.user_secrets_enabled, false);
		},
		get nodeReplacementsEnabled() {
			return api.getServerFeature("node_replacements", false);
		},
		get nodeLibraryEssentialsEnabled() {
			return remoteConfig.value.node_library_essentials_enabled ?? api.getServerFeature("node_library_essentials_enabled", false);
		},
		get workflowSharingEnabled() {
			return resolveFlag("workflow_sharing_enabled", remoteConfig.value.workflow_sharing_enabled, false);
		},
		get comfyHubUploadEnabled() {
			return resolveFlag("comfyhub_upload_enabled", remoteConfig.value.comfyhub_upload_enabled, false);
		},
		get comfyHubProfileGateEnabled() {
			return resolveFlag("comfyhub_profile_gate_enabled", remoteConfig.value.comfyhub_profile_gate_enabled, false);
		},
		get showSignInButton() {
			return api.getServerFeature("show_signin_button", void 0);
		},
		get unifiedCloudAuthEnabled() {
			return resolveFlag("unified_cloud_auth", remoteConfig.value.unified_cloud_auth, false);
		},
		/**
		* Whether personal workspaces use the consolidated (workspace-scoped)
		* billing flow. While false (default), personal workspaces stay on the
		* legacy per-user billing flow; team workspaces are unaffected.
		*/
		get consolidatedBillingEnabled() {
			return resolveAuthGatedFlag("consolidated_billing_enabled", remoteConfig.value.consolidated_billing_enabled, cachedConsolidatedBillingEnabled);
		},
		get signupTurnstileMode() {
			return resolveFlag("signup_turnstile", remoteConfig.value.signup_turnstile, "off");
		}
	});
	const featureFlag = (featurePath, defaultValue) => computed(() => api.getServerFeature(featurePath, defaultValue));
	return {
		flags: readonly(flags),
		featureFlag
	};
}
//#endregion
//#region src/platform/navigation/preservedQueryManager.ts
var STORAGE_PREFIX = "Comfy.PreservedQuery.";
var preservedQueries = /* @__PURE__ */ new Map();
var readQueryParam = (value) => {
	if (typeof value === "string") return value;
	if (!Array.isArray(value)) return void 0;
	return value.find((entry) => typeof entry === "string" && entry !== "");
};
var getStorageKey = (namespace) => `${STORAGE_PREFIX}${namespace}`;
var isValidQueryRecord = (value) => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	return Object.values(value).every((v) => typeof v === "string");
};
var readFromStorage = (namespace) => {
	try {
		const raw = sessionStorage.getItem(getStorageKey(namespace));
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!isValidQueryRecord(parsed)) {
			console.warn("[preservedQuery] invalid storage format");
			sessionStorage.removeItem(getStorageKey(namespace));
			return null;
		}
		return parsed;
	} catch (error) {
		console.warn("[preservedQuery] storage operation failed");
		sessionStorage.removeItem(getStorageKey(namespace));
		return null;
	}
};
var writeToStorage = (namespace, payload) => {
	try {
		if (!payload || Object.keys(payload).length === 0) {
			sessionStorage.removeItem(getStorageKey(namespace));
			return;
		}
		sessionStorage.setItem(getStorageKey(namespace), JSON.stringify(payload));
	} catch (error) {
		console.warn("[preservedQuery] failed to write storage", {
			namespace,
			error
		});
	}
};
var hydratePreservedQuery = (namespace) => {
	if (preservedQueries.has(namespace)) return;
	const payload = readFromStorage(namespace);
	if (payload) preservedQueries.set(namespace, payload);
};
/**
* By default each capture replaces the namespace stash with the values present
* in the given query. With `merge`, values are merged into the existing stash
* and a key supplied with an empty value clears its stashed entry — for
* namespaces where the stash, not the URL, is the surviving carrier.
*/
var capturePreservedQuery = (namespace, query, keys, { merge = false } = {}) => {
	if (!merge) {
		const payload = {};
		keys.forEach((key) => {
			const value = readQueryParam(query[key]);
			if (value) payload[key] = value;
		});
		if (Object.keys(payload).length === 0) return;
		preservedQueries.set(namespace, payload);
		writeToStorage(namespace, payload);
		return;
	}
	hydratePreservedQuery(namespace);
	const payload = { ...preservedQueries.get(namespace) ?? {} };
	let changed = false;
	keys.forEach((key) => {
		if (!Object.hasOwn(query, key)) return;
		const value = readQueryParam(query[key]);
		if (value) {
			payload[key] = value;
			changed = true;
			return;
		}
		if (key in payload) {
			delete payload[key];
			changed = true;
		}
	});
	if (!changed) return;
	if (Object.keys(payload).length === 0) preservedQueries.delete(namespace);
	else preservedQueries.set(namespace, payload);
	writeToStorage(namespace, payload);
};
var mergePreservedQueryIntoQuery = (namespace, query) => {
	const payload = preservedQueries.get(namespace);
	if (!payload) return void 0;
	const nextQuery = { ...query || {} };
	let changed = false;
	for (const [key, value] of Object.entries(payload)) {
		if (typeof nextQuery[key] === "string") continue;
		nextQuery[key] = value;
		changed = true;
	}
	return changed ? nextQuery : void 0;
};
var clearPreservedQuery = (namespace) => {
	if (!preservedQueries.has(namespace)) return;
	preservedQueries.delete(namespace);
	writeToStorage(namespace, null);
};
//#endregion
//#region src/platform/navigation/preservedQueryNamespaces.ts
var PRESERVED_QUERY_NAMESPACES = {
	TEMPLATE: "template",
	INVITE: "invite",
	SHARE: "share",
	SHARE_AUTH: "share_auth",
	CREATE_WORKSPACE: "create_workspace",
	OAUTH: "oauth",
	PRICING: "pricing"
};
//#endregion
//#region src/platform/workspace/stores/workspaceAuthStore.ts
var WorkspaceWithRoleSchema = objectType({
	id: stringType(),
	name: stringType(),
	type: enumType(["personal", "team"]),
	role: enumType(["owner", "member"])
});
objectType({
	token: stringType(),
	expires_at: stringType(),
	workspace: objectType({
		id: stringType(),
		name: stringType(),
		type: enumType(["personal", "team"])
	}),
	role: enumType(["owner", "member"]),
	permissions: arrayType(stringType())
});
var MAX_SCHEDULED_REFRESH_RETRIES = 3;
var WorkspaceAuthError = class extends Error {
	code;
	constructor(message, code) {
		super(message);
		this.code = code;
		this.name = "WorkspaceAuthError";
	}
};
var PERMANENT_AUTH_ERROR_CODES = new Set([
	"ACCESS_DENIED",
	"WORKSPACE_NOT_FOUND",
	"INVALID_FIREBASE_TOKEN",
	"NOT_AUTHENTICATED"
]);
function isPermanentAuthError(err) {
	return err instanceof WorkspaceAuthError && PERMANENT_AUTH_ERROR_CODES.has(err.code ?? "");
}
function permanentAuthErrorMessageKey(code) {
	switch (code) {
		case "ACCESS_DENIED": return "workspaceAuth.errors.accessDenied";
		case "WORKSPACE_NOT_FOUND": return "workspaceAuth.errors.workspaceNotFound";
		case "INVALID_FIREBASE_TOKEN": return "workspaceAuth.errors.invalidFirebaseToken";
		default: return "workspaceAuth.errors.notAuthenticated";
	}
}
function surfacePermanentAuthError(err) {
	console.error("Unified workspace auth revoked or invalid:", err);
	useToastStore().add({
		severity: "error",
		summary: t("g.error"),
		detail: t(permanentAuthErrorMessageKey(err.code))
	});
}
var useWorkspaceAuthStore = defineStore("workspaceAuth", () => {
	const { flags } = useFeatureFlags();
	const currentWorkspace = shallowRef(null);
	const workspaceToken = ref(null);
	const workspaceTokenExpiresAt = ref(null);
	const isLoading = ref(false);
	const error = ref(null);
	const unifiedToken = ref(null);
	let refreshTimerId = null;
	let inFlightSwitchCount = 0;
	let scheduledRefreshRetryCount = 0;
	let unifiedRefreshTimerId = null;
	let refreshRequestId = 0;
	let unifiedRefreshRequestId = 0;
	const isAuthenticated = computed(() => currentWorkspace.value !== null && workspaceToken.value !== null);
	function stopRefreshTimer() {
		if (refreshTimerId !== null) {
			clearTimeout(refreshTimerId);
			refreshTimerId = null;
		}
	}
	function scheduleTokenRefresh(expiresAt) {
		stopRefreshTimer();
		scheduledRefreshRetryCount = 0;
		const now = Date.now();
		const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
		const delay = Math.max(0, refreshAt - now);
		refreshTimerId = setTimeout(() => {
			refreshToken();
		}, delay);
	}
	function scheduleClearAtExpiry() {
		if (workspaceTokenExpiresAt.value === null) {
			clearWorkspaceContext();
			return;
		}
		const timeUntilExpiry = workspaceTokenExpiresAt.value - Date.now();
		if (timeUntilExpiry <= 0) {
			clearWorkspaceContext();
			return;
		}
		stopRefreshTimer();
		refreshTimerId = setTimeout(() => {
			clearWorkspaceContext();
		}, timeUntilExpiry);
	}
	function scheduleTokenRefreshRetry(delayMs) {
		if (workspaceTokenExpiresAt.value === null) {
			clearWorkspaceContext();
			return false;
		}
		const timeUntilExpiry = workspaceTokenExpiresAt.value - Date.now();
		if (timeUntilExpiry <= 0) {
			clearWorkspaceContext();
			return false;
		}
		if (scheduledRefreshRetryCount >= MAX_SCHEDULED_REFRESH_RETRIES) {
			scheduleClearAtExpiry();
			return false;
		}
		scheduledRefreshRetryCount += 1;
		stopRefreshTimer();
		const timeUntilRefreshBuffer = Math.max(0, timeUntilExpiry - TOKEN_REFRESH_BUFFER_MS);
		refreshTimerId = setTimeout(() => {
			refreshToken();
		}, Math.min(delayMs, timeUntilRefreshBuffer));
		return true;
	}
	function isStaleWorkspaceRequest(capturedRequestId) {
		return capturedRequestId !== refreshRequestId;
	}
	function persistToSession(workspace, token, expiresAt) {
		try {
			sessionStorage.setItem(WORKSPACE_STORAGE_KEYS.CURRENT_WORKSPACE, JSON.stringify(workspace));
			sessionStorage.setItem(WORKSPACE_STORAGE_KEYS.TOKEN, token);
			sessionStorage.setItem(WORKSPACE_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
		} catch {
			console.warn("Failed to persist workspace context to sessionStorage");
		}
	}
	function clearSessionStorage() {
		try {
			sessionStorage.removeItem(WORKSPACE_STORAGE_KEYS.CURRENT_WORKSPACE);
			sessionStorage.removeItem(WORKSPACE_STORAGE_KEYS.TOKEN);
			sessionStorage.removeItem(WORKSPACE_STORAGE_KEYS.EXPIRES_AT);
		} catch {
			console.warn("Failed to clear workspace context from sessionStorage");
		}
	}
	function init() {
		initializeFromSession();
	}
	function destroy() {
		stopRefreshTimer();
	}
	function initializeFromSession() {
		if (!flags.teamWorkspacesEnabled) return false;
		try {
			const workspaceJson = sessionStorage.getItem(WORKSPACE_STORAGE_KEYS.CURRENT_WORKSPACE);
			const token = sessionStorage.getItem(WORKSPACE_STORAGE_KEYS.TOKEN);
			const expiresAtStr = sessionStorage.getItem(WORKSPACE_STORAGE_KEYS.EXPIRES_AT);
			if (!workspaceJson || !token || !expiresAtStr) return false;
			const expiresAt = parseInt(expiresAtStr, 10);
			if (isNaN(expiresAt) || expiresAt <= Date.now()) {
				clearSessionStorage();
				return false;
			}
			const parseResult = WorkspaceWithRoleSchema.safeParse(JSON.parse(workspaceJson));
			if (!parseResult.success) {
				clearSessionStorage();
				return false;
			}
			currentWorkspace.value = parseResult.data;
			workspaceToken.value = token;
			workspaceTokenExpiresAt.value = expiresAt;
			error.value = null;
			scheduleTokenRefresh(expiresAt);
			return true;
		} catch {
			clearSessionStorage();
			return false;
		}
	}
	/**
	* Exchanges the Firebase identity for a Cloud JWT via POST /auth/token.
	* An id-less body ({}) mints the caller's personal-workspace token; a
	* concrete workspace_id mints that workspace's token. Pure network + parse:
	* it writes no store state, schedules no timer, and reads no flag, so both
	* the legacy switch path and the unified path can reuse it without inheriting
	* each other's gates.
	*/
	async function requestToken(workspaceId) {
		throw new WorkspaceAuthError(t("workspaceAuth.errors.notAuthenticated"), "NOT_AUTHENTICATED");
	}
	async function switchWorkspace(workspaceId) {
		if (!flags.teamWorkspacesEnabled) return;
		const capturedRequestId = refreshRequestId;
		inFlightSwitchCount += 1;
		isLoading.value = true;
		error.value = null;
		try {
			const { token, expiresAt, workspace } = await requestToken(workspaceId);
			if (isStaleWorkspaceRequest(capturedRequestId)) {
				console.warn("Aborting stale workspace switch: workspace context changed before commit");
				return;
			}
			if (currentWorkspace.value?.id !== workspaceId) refreshRequestId++;
			currentWorkspace.value = workspace;
			workspaceToken.value = token;
			workspaceTokenExpiresAt.value = expiresAt;
			scheduledRefreshRetryCount = 0;
			persistToSession(workspace, token, expiresAt);
			scheduleTokenRefresh(expiresAt);
		} catch (err) {
			if (isStaleWorkspaceRequest(capturedRequestId)) {
				console.warn("Aborting stale workspace switch: workspace context changed before error commit", err);
				return;
			}
			error.value = err instanceof Error ? err : new Error(String(err));
			throw error.value;
		} finally {
			inFlightSwitchCount = Math.max(0, inFlightSwitchCount - 1);
			isLoading.value = inFlightSwitchCount > 0;
		}
	}
	async function refreshToken() {
		if (!currentWorkspace.value) return;
		const workspaceId = currentWorkspace.value.id;
		const capturedRequestId = refreshRequestId;
		const maxRetries = 3;
		const baseDelayMs = 1e3;
		error.value = null;
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			if (isStaleWorkspaceRequest(capturedRequestId)) {
				console.warn("Aborting stale token refresh: workspace context changed during refresh");
				return;
			}
			try {
				await switchWorkspace(workspaceId);
				return;
			} catch (err) {
				const isAuthError = err instanceof WorkspaceAuthError;
				if (isAuthError && (err.code === "ACCESS_DENIED" || err.code === "WORKSPACE_NOT_FOUND" || err.code === "INVALID_FIREBASE_TOKEN" || err.code === "NOT_AUTHENTICATED")) {
					if (!isStaleWorkspaceRequest(capturedRequestId)) {
						console.error("Workspace access revoked or auth invalid:", err);
						clearWorkspaceContext();
					}
					return;
				}
				const isTransientError = isAuthError && err.code === "TOKEN_EXCHANGE_FAILED";
				if (isTransientError && attempt < maxRetries) {
					const delay = baseDelayMs * Math.pow(2, attempt);
					console.warn(`Token refresh failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, err);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}
				if (!isStaleWorkspaceRequest(capturedRequestId)) {
					if (isTransientError && hasValidWorkspaceToken()) {
						error.value = null;
						const retryScheduled = scheduleTokenRefreshRetry(baseDelayMs * Math.pow(2, maxRetries));
						console.warn(retryScheduled ? "Failed to refresh workspace token after retries; preserving existing valid token and retrying later:" : "Failed to refresh workspace token after retries; preserving existing valid token until expiry:", err);
						return;
					}
					console.error("Failed to refresh workspace token after retries:", err);
					clearWorkspaceContext();
				}
			}
		}
	}
	let unifiedTarget = null;
	function personalWorkspaceTarget() {
		return {};
	}
	function currentUnifiedTarget() {
		return unifiedTarget;
	}
	function stopUnifiedRefreshTimer() {
		if (unifiedRefreshTimerId !== null) {
			clearTimeout(unifiedRefreshTimerId);
			unifiedRefreshTimerId = null;
		}
	}
	function scheduleUnifiedRefresh(expiresAt) {
		stopUnifiedRefreshTimer();
		const now = Date.now();
		const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER_MS;
		const delay = Math.max(0, refreshAt - now);
		unifiedRefreshTimerId = setTimeout(() => {
			refreshUnified();
		}, delay);
	}
	function clearUnifiedContext() {
		unifiedRefreshRequestId++;
		stopUnifiedRefreshTimer();
		unifiedToken.value = null;
		unifiedTarget = null;
	}
	async function mintUnified(target) {
		const capturedRequestId = ++unifiedRefreshRequestId;
		const { token, expiresAt } = await requestToken("workspace_id" in target ? target.workspace_id : void 0);
		if (capturedRequestId !== unifiedRefreshRequestId) return false;
		unifiedToken.value = token;
		unifiedTarget = target;
		scheduleUnifiedRefresh(expiresAt);
		return true;
	}
	async function refreshUnified() {
		if (!flags.unifiedCloudAuthEnabled) return;
		const target = currentUnifiedTarget();
		if (!target) return;
		try {
			if (await mintUnified(target)) {}
		} catch (err) {
			if (isPermanentAuthError(err)) {
				if (unifiedToken.value) surfacePermanentAuthError(err);
				clearUnifiedContext();
			} else console.warn("Unified token refresh failed:", err);
		}
	}
	const mintAtLogin = async () => {
		if (!flags.unifiedCloudAuthEnabled) return false;
		if (unifiedToken.value) return true;
		try {
			return await mintUnified(personalWorkspaceTarget());
		} catch (err) {
			if (isPermanentAuthError(err)) surfacePermanentAuthError(err);
			else console.warn("Unified login mint failed:", err);
			return false;
		}
	};
	const remintUnifiedOnce = async () => {
		if (!flags.unifiedCloudAuthEnabled) return null;
		const target = currentUnifiedTarget();
		if (!target) return null;
		try {
			await mintUnified(target);
			return unifiedToken.value ?? null;
		} catch (err) {
			if (isPermanentAuthError(err)) {
				if (unifiedToken.value) surfacePermanentAuthError(err);
				clearUnifiedContext();
			} else console.warn("Unified reactive re-mint failed:", err);
			return null;
		}
	};
	function getWorkspaceAuthHeader() {
		if (!workspaceToken.value) return null;
		return { Authorization: `Bearer ${workspaceToken.value}` };
	}
	function getWorkspaceToken() {
		return workspaceToken.value ?? void 0;
	}
	function hasValidWorkspaceToken() {
		return workspaceToken.value !== null && workspaceTokenExpiresAt.value !== null && workspaceTokenExpiresAt.value > Date.now();
	}
	function clearWorkspaceContext() {
		refreshRequestId++;
		stopRefreshTimer();
		currentWorkspace.value = null;
		workspaceToken.value = null;
		workspaceTokenExpiresAt.value = null;
		scheduledRefreshRetryCount = 0;
		error.value = null;
		clearSessionStorage();
		clearUnifiedContext();
	}
	return {
		currentWorkspace,
		workspaceToken,
		unifiedToken,
		isLoading,
		error,
		isAuthenticated,
		init,
		destroy,
		initializeFromSession,
		switchWorkspace,
		refreshToken,
		mintAtLogin,
		remintUnifiedOnce,
		getWorkspaceAuthHeader,
		getWorkspaceToken,
		clearWorkspaceContext
	};
});
//#endregion
//#region src/platform/workspace/api/workspaceApi.ts
var WorkspaceApiError = class extends Error {
	status;
	code;
	constructor(message, status, code) {
		super(message);
		this.status = status;
		this.code = code;
		this.name = "WorkspaceApiError";
	}
};
var workspaceApiClient = axios.create({ headers: { "Content-Type": "application/json" } });
async function getAuthHeaderOrThrow() {
	return {};
}
function handleAxiosError(err) {
	if (axios.isAxiosError(err)) {
		const status = err.response?.status;
		throw new WorkspaceApiError(err.response?.data?.message ?? err.message, status);
	}
	throw err;
}
var workspaceApi = {
	/**
	* List all workspaces the user has access to
	* GET /api/workspaces
	*/
	async list() {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/workspaces"), { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Create a new workspace
	* POST /api/workspaces
	*/
	async create(payload) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/workspaces"), payload, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Update workspace name
	* PATCH /api/workspaces/:id
	*/
	async update(workspaceId, payload) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.patch(api.apiURL(`/workspaces/${workspaceId}`), payload, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Delete a workspace (owner only)
	* DELETE /api/workspaces/:id
	*/
	async delete(workspaceId) {
		const headers = await getAuthHeaderOrThrow();
		try {
			await workspaceApiClient.delete(api.apiURL(`/workspaces/${workspaceId}`), { headers });
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Leave the current workspace.
	* POST /api/workspace/leave
	*/
	async leave() {
		const headers = await getAuthHeaderOrThrow();
		try {
			await workspaceApiClient.post(api.apiURL("/workspace/leave"), null, { headers });
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* List workspace members (paginated).
	* GET /api/workspace/members
	*/
	async listMembers(params) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/workspace/members"), {
				headers,
				params
			})).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Remove a member from the workspace.
	* DELETE /api/workspace/members/:userId
	*/
	async removeMember(userId) {
		const headers = await getAuthHeaderOrThrow();
		try {
			await workspaceApiClient.delete(api.apiURL(`/workspace/members/${userId}`), { headers });
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Change a member's role (member ↔ owner).
	* PATCH /api/workspace/members/:userId
	*/
	async updateMemberRole(userId, role) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.patch(api.apiURL(`/workspace/members/${userId}`), { role }, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* List pending invites for the workspace.
	* GET /api/workspace/invites
	*/
	async listInvites() {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/workspace/invites"), { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Create an invite for the workspace.
	* POST /api/workspace/invites
	*/
	async createInvite(payload) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/workspace/invites"), payload, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Revoke a pending invite.
	* DELETE /api/workspace/invites/:inviteId
	*/
	async revokeInvite(inviteId) {
		const headers = await getAuthHeaderOrThrow();
		try {
			await workspaceApiClient.delete(api.apiURL(`/workspace/invites/${inviteId}`), { headers });
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Accept a workspace invite.
	* POST /api/invites/:token/accept
	*/
	async acceptInvite(token) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL(`/invites/${token}/accept`), null, {
				headers,
				__skipUnifiedRemint: true
			})).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Get billing status for the current workspace
	* GET /api/billing/status
	*/
	async getBillingStatus() {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/billing/status"), { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Get credit balance for the current workspace
	* GET /api/billing/balance
	*/
	async getBillingBalance() {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/billing/balance"), { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Get available subscription plans
	* GET /api/billing/plans
	*/
	async getBillingPlans() {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/billing/plans"), { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Preview subscription change
	* POST /api/billing/preview-subscribe
	*/
	async previewSubscribe(planSlug, options = {}) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/billing/preview-subscribe"), {
				plan_slug: planSlug,
				team_credit_stop_id: options.teamCreditStopId,
				billing_cycle: options.billingCycle
			}, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Subscribe to a billing plan
	* POST /api/billing/subscribe
	*/
	async subscribe(planSlug, options = {}) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/billing/subscribe"), {
				plan_slug: planSlug,
				return_url: options.returnUrl,
				cancel_url: options.cancelUrl,
				team_credit_stop_id: options.teamCreditStopId,
				billing_cycle: options.billingCycle
			}, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Cancel current subscription
	* POST /api/billing/subscription/cancel
	*/
	async cancelSubscription(idempotencyKey) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/billing/subscription/cancel"), { idempotency_key: idempotencyKey }, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Resubscribe (undo cancel) before period ends
	* POST /api/billing/subscription/resubscribe
	*/
	async resubscribe(idempotencyKey) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/billing/subscription/resubscribe"), { idempotency_key: idempotencyKey }, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Get Stripe payment portal URL for managing payment methods
	* POST /api/billing/payment-portal
	*/
	async getPaymentPortalUrl(returnUrl) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/billing/payment-portal"), { return_url: returnUrl }, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Create a credit top-up
	* POST /api/billing/topup
	*/
	async createTopup(amountCents, idempotencyKey) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.post(api.apiURL("/billing/topup"), {
				amount_cents: amountCents,
				idempotency_key: idempotencyKey
			}, { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Get billing events
	* GET /api/billing/events
	*/
	async getBillingEvents(params) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL("/billing/events"), {
				headers,
				params
			})).data;
		} catch (err) {
			handleAxiosError(err);
		}
	},
	/**
	* Get billing operation status
	* GET /api/billing/ops/:id
	*/
	async getBillingOpStatus(opId) {
		const headers = await getAuthHeaderOrThrow();
		try {
			return (await workspaceApiClient.get(api.apiURL(`/billing/ops/${opId}`), { headers })).data;
		} catch (err) {
			handleAxiosError(err);
		}
	}
};
//#endregion
//#region src/platform/workspace/stores/teamWorkspaceStore.ts
function mapApiMemberToWorkspaceMember(member) {
	return {
		id: member.id,
		name: member.name,
		email: member.email,
		joinDate: new Date(member.joined_at),
		role: member.role,
		isOriginalOwner: member.is_original_owner ?? false
	};
}
function mapApiInviteToPendingInvite(invite) {
	return {
		id: invite.id,
		email: invite.email,
		inviteDate: new Date(invite.invited_at),
		expiryDate: new Date(invite.expires_at)
	};
}
function createWorkspaceState(workspace) {
	return {
		...workspace,
		isSubscribed: workspace.type === "personal" || !!workspace.subscription_tier,
		subscriptionPlan: null,
		subscriptionTier: workspace.subscription_tier ?? null,
		members: [],
		pendingInvites: []
	};
}
function sortWorkspaces(list) {
	return [...list].sort((a, b) => {
		if (a.type === "personal") return -1;
		if (b.type === "personal") return 1;
		const dateA = a.role === "owner" ? a.created_at : a.joined_at;
		const dateB = b.role === "owner" ? b.created_at : b.joined_at;
		return dateA.localeCompare(dateB);
	});
}
function getLastWorkspaceId() {
	try {
		return localStorage.getItem(WORKSPACE_STORAGE_KEYS.LAST_WORKSPACE_ID);
	} catch {
		return null;
	}
}
function setLastWorkspaceId(workspaceId) {
	try {
		localStorage.setItem(WORKSPACE_STORAGE_KEYS.LAST_WORKSPACE_ID, workspaceId);
	} catch {
		console.warn("Failed to persist last workspace ID to localStorage");
	}
}
var MAX_OWNED_WORKSPACES = 10;
var MAX_INIT_RETRIES = 3;
var BASE_RETRY_DELAY_MS = 1e3;
var useTeamWorkspaceStore = defineStore("teamWorkspace", () => {
	const initState = ref("uninitialized");
	const workspaces = shallowRef([]);
	const activeWorkspaceId = ref(null);
	const error = ref(null);
	const isCreating = ref(false);
	const isDeleting = ref(false);
	const isSwitching = ref(false);
	const isFetchingWorkspaces = ref(false);
	const activeWorkspace = computed(() => workspaces.value.find((w) => w.id === activeWorkspaceId.value) ?? null);
	const personalWorkspace = computed(() => workspaces.value.find((w) => w.type === "personal") ?? null);
	const isInPersonalWorkspace = computed(() => activeWorkspace.value?.type === "personal");
	const sharedWorkspaces = computed(() => workspaces.value.filter((w) => w.type !== "personal"));
	const ownedWorkspacesCount = computed(() => workspaces.value.filter((w) => w.role === "owner").length);
	const canCreateWorkspace = computed(() => ownedWorkspacesCount.value < MAX_OWNED_WORKSPACES);
	const members = computed(() => activeWorkspace.value?.members ?? []);
	const originalOwnerId = computed(() => {
		const flagged = members.value.find((m) => m.isOriginalOwner);
		if (flagged) return flagged.id;
		const owners = members.value.filter((m) => m.role === "owner");
		if (owners.length === 0) return null;
		return owners.reduce((earliest, m) => m.joinDate < earliest.joinDate ? m : earliest).id;
	});
	const isCurrentUserOriginalOwner = computed(() => {
		const email = useUserStore().currentUserId?.toLowerCase() ?? "";
		if (!email) return false;
		const selfRow = members.value.find((m) => m.email.toLowerCase() === email);
		return !!selfRow && selfRow.id === originalOwnerId.value;
	});
	const pendingInvites = computed(() => activeWorkspace.value?.pendingInvites ?? []);
	const totalMemberSlots = computed(() => members.value.length + pendingInvites.value.length);
	const isInviteLimitReached = computed(() => totalMemberSlots.value >= 30);
	const workspaceId = computed(() => activeWorkspace.value?.id ?? null);
	const workspaceName = computed(() => activeWorkspace.value?.name ?? "");
	const isWorkspaceSubscribed = computed(() => activeWorkspace.value?.isSubscribed ?? false);
	const subscriptionPlan = computed(() => activeWorkspace.value?.subscriptionPlan ?? null);
	function updateWorkspace(workspaceId, updates) {
		const index = workspaces.value.findIndex((w) => w.id === workspaceId);
		if (index === -1) return;
		const updated = {
			...workspaces.value[index],
			...updates
		};
		workspaces.value = [
			...workspaces.value.slice(0, index),
			updated,
			...workspaces.value.slice(index + 1)
		];
	}
	function updateActiveWorkspace(updates) {
		if (!activeWorkspaceId.value) return;
		updateWorkspace(activeWorkspaceId.value, updates);
	}
	/**
	* Initialize the workspace store.
	* Fetches workspaces and resolves the active workspace from session/localStorage.
	* Delegates token management to workspaceAuthStore.
	* Retries on transient failures with exponential backoff.
	* Call once on app boot.
	*/
	async function initialize() {
		if (initState.value !== "uninitialized") return;
		initState.value = "loading";
		isFetchingWorkspaces.value = true;
		error.value = null;
		const workspaceAuthStore = useWorkspaceAuthStore();
		for (let attempt = 0; attempt <= MAX_INIT_RETRIES; attempt++) try {
			if (workspaceAuthStore.initializeFromSession() && workspaceAuthStore.currentWorkspace) {
				workspaces.value = sortWorkspaces((await workspaceApi.list()).workspaces.map(createWorkspaceState));
				if (workspaces.value.length === 0) throw new Error("No workspaces available");
				const sessionWorkspaceId = workspaceAuthStore.currentWorkspace.id;
				if (workspaces.value.some((w) => w.id === sessionWorkspaceId)) {
					activeWorkspaceId.value = sessionWorkspaceId;
					initState.value = "ready";
					isFetchingWorkspaces.value = false;
					return;
				}
				workspaceAuthStore.clearWorkspaceContext();
				const fallbackWorkspaceId = workspaces.value.find((w) => w.type === "personal")?.id ?? workspaces.value[0].id;
				try {
					await workspaceAuthStore.switchWorkspace(fallbackWorkspaceId);
				} catch {
					console.error("[teamWorkspaceStore] Token exchange failed during fallback");
				}
				activeWorkspaceId.value = fallbackWorkspaceId;
				setLastWorkspaceId(fallbackWorkspaceId);
				initState.value = "ready";
				isFetchingWorkspaces.value = false;
				return;
			}
			workspaces.value = sortWorkspaces((await workspaceApi.list()).workspaces.map(createWorkspaceState));
			if (workspaces.value.length === 0) throw new Error("No workspaces available");
			let targetWorkspaceId = null;
			const lastId = getLastWorkspaceId();
			if (lastId && workspaces.value.some((w) => w.id === lastId)) targetWorkspaceId = lastId;
			if (!targetWorkspaceId) targetWorkspaceId = workspaces.value.find((w) => w.type === "personal")?.id ?? workspaces.value[0].id;
			try {
				await workspaceAuthStore.switchWorkspace(targetWorkspaceId);
			} catch {
				console.error("[teamWorkspaceStore] Token exchange failed during init");
			}
			activeWorkspaceId.value = targetWorkspaceId;
			setLastWorkspaceId(targetWorkspaceId);
			initState.value = "ready";
			isFetchingWorkspaces.value = false;
			return;
		} catch (e) {
			if (e instanceof Error && e.message === "No workspaces available" || attempt >= MAX_INIT_RETRIES) {
				error.value = e instanceof Error ? e : /* @__PURE__ */ new Error("Unknown error");
				initState.value = "error";
				isFetchingWorkspaces.value = false;
				throw e;
			}
			const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
			const errorMessage = e instanceof Error ? e.message : String(e);
			console.warn(`[teamWorkspaceStore] Init failed (attempt ${attempt + 1}/${MAX_INIT_RETRIES + 1}), retrying in ${delay}ms: ${errorMessage}`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
		isFetchingWorkspaces.value = false;
	}
	/**
	* Re-fetch workspaces from API without changing active workspace.
	*/
	async function refreshWorkspaces() {
		isFetchingWorkspaces.value = true;
		try {
			workspaces.value = sortWorkspaces((await workspaceApi.list()).workspaces.map(createWorkspaceState));
		} finally {
			isFetchingWorkspaces.value = false;
		}
	}
	/**
	* Switch to a different workspace.
	* Clears workspace context and reloads the page.
	*/
	async function switchWorkspace(workspaceId) {
		if (workspaceId === activeWorkspaceId.value) return;
		const workspaceAuthStore = useWorkspaceAuthStore();
		isSwitching.value = true;
		try {
			if (!workspaces.value.find((w) => w.id === workspaceId)) {
				await refreshWorkspaces();
				if (!workspaces.value.find((w) => w.id === workspaceId)) throw new Error("Workspace not found or access denied");
			}
			workspaceAuthStore.clearWorkspaceContext();
			setLastWorkspaceId(workspaceId);
			window.location.reload();
		} catch (e) {
			isSwitching.value = false;
			throw e;
		}
	}
	/**
	* Create a new workspace and switch to it.
	*/
	async function createWorkspace(name) {
		const workspaceAuthStore = useWorkspaceAuthStore();
		isCreating.value = true;
		try {
			const newWorkspace = await workspaceApi.create({ name });
			const workspaceState = createWorkspaceState(newWorkspace);
			workspaces.value = [...workspaces.value, workspaceState];
			workspaceAuthStore.clearWorkspaceContext();
			clearPreservedQuery(PRESERVED_QUERY_NAMESPACES.INVITE);
			setLastWorkspaceId(newWorkspace.id);
			window.location.reload();
			return workspaceState;
		} catch (e) {
			isCreating.value = false;
			throw e;
		}
	}
	/**
	* Delete a workspace.
	* If deleting active workspace, switches to personal.
	*/
	async function deleteWorkspace(workspaceId) {
		const targetId = workspaceId ?? activeWorkspaceId.value;
		if (!targetId) throw new Error("No workspace to delete");
		const workspace = workspaces.value.find((w) => w.id === targetId);
		if (!workspace) throw new Error("Workspace not found");
		if (workspace.type === "personal") throw new Error("Cannot delete personal workspace");
		const workspaceAuthStore = useWorkspaceAuthStore();
		isDeleting.value = true;
		try {
			await workspaceApi.delete(targetId);
			if (targetId === activeWorkspaceId.value) {
				const personal = personalWorkspace.value;
				workspaceAuthStore.clearWorkspaceContext();
				if (personal) setLastWorkspaceId(personal.id);
				window.location.reload();
			} else {
				workspaces.value = workspaces.value.filter((w) => w.id !== targetId);
				isDeleting.value = false;
			}
		} catch (e) {
			isDeleting.value = false;
			throw e;
		}
	}
	/**
	* Rename a workspace. No reload needed.
	*/
	async function renameWorkspace(workspaceId, newName) {
		updateWorkspace(workspaceId, { name: (await workspaceApi.update(workspaceId, { name: newName })).name });
	}
	/**
	* Update workspace name (convenience for current workspace).
	*/
	async function updateWorkspaceName(name) {
		if (!activeWorkspaceId.value) throw new Error("No active workspace");
		await renameWorkspace(activeWorkspaceId.value, name);
	}
	/**
	* Leave the current workspace.
	* Switches to personal workspace after leaving.
	*/
	async function leaveWorkspace() {
		const current = activeWorkspace.value;
		if (!current || current.type === "personal") throw new Error("Cannot leave personal workspace");
		const workspaceAuthStore = useWorkspaceAuthStore();
		await workspaceApi.leave();
		const personal = personalWorkspace.value;
		workspaceAuthStore.clearWorkspaceContext();
		if (personal) setLastWorkspaceId(personal.id);
		window.location.reload();
	}
	/**
	* Fetch members for the current workspace.
	*/
	async function fetchMembers(params) {
		if (!activeWorkspaceId.value) return [];
		if (activeWorkspace.value?.type === "personal") return [];
		const members = (await workspaceApi.listMembers(params)).members.map(mapApiMemberToWorkspaceMember);
		updateActiveWorkspace({ members });
		return members;
	}
	const loadedMemberWorkspaceIds = /* @__PURE__ */ new Set();
	let inFlightMembersWorkspaceId = null;
	/**
	* Load the active team workspace's members once. No-ops for personal or
	* already-loaded workspaces and dedupes concurrent calls. A failed request is
	* logged and leaves the workspace unloaded so a later call retries.
	*/
	async function ensureMembersLoaded() {
		const workspaceId = activeWorkspaceId.value;
		if (!workspaceId) return;
		if (activeWorkspace.value?.type === "personal") return;
		if (loadedMemberWorkspaceIds.has(workspaceId)) return;
		if (inFlightMembersWorkspaceId === workspaceId) return;
		inFlightMembersWorkspaceId = workspaceId;
		try {
			await fetchMembers();
			loadedMemberWorkspaceIds.add(workspaceId);
		} catch (e) {
			console.error("Failed to load workspace members", e);
		} finally {
			if (inFlightMembersWorkspaceId === workspaceId) inFlightMembersWorkspaceId = null;
		}
	}
	/**
	* Remove a member from the current workspace.
	*/
	async function removeMember(userId) {
		await workspaceApi.removeMember(userId);
		const current = activeWorkspace.value;
		if (current) updateActiveWorkspace({ members: current.members.filter((m) => m.id !== userId) });
	}
	/**
	* Change a member's role in the current workspace.
	*/
	async function changeMemberRole(userId, role) {
		if (userId === originalOwnerId.value) throw new Error("Cannot change the workspace creator's role");
		await workspaceApi.updateMemberRole(userId, role);
		const current = activeWorkspace.value;
		if (current) updateActiveWorkspace({ members: current.members.map((m) => m.id === userId ? {
			...m,
			role
		} : m) });
	}
	/**
	* Fetch pending invites for the current workspace.
	*/
	async function fetchPendingInvites() {
		if (!activeWorkspaceId.value) return [];
		if (activeWorkspace.value?.type === "personal") return [];
		const invites = (await workspaceApi.listInvites()).invites.map(mapApiInviteToPendingInvite);
		updateActiveWorkspace({ pendingInvites: invites });
		return invites;
	}
	/**
	* Create an invite for the current workspace.
	*/
	async function createInvite(email) {
		const invite = mapApiInviteToPendingInvite(await workspaceApi.createInvite({ email }));
		const current = activeWorkspace.value;
		if (current) updateActiveWorkspace({ pendingInvites: [...current.pendingInvites, invite] });
		return invite;
	}
	/**
	* Revoke a pending invite.
	*/
	async function revokeInvite(inviteId) {
		await workspaceApi.revokeInvite(inviteId);
		const current = activeWorkspace.value;
		if (current) updateActiveWorkspace({ pendingInvites: current.pendingInvites.filter((i) => i.id !== inviteId) });
	}
	const resendingInviteIds = /* @__PURE__ */ new Set();
	/**
	* Resend a pending invite by issuing a fresh one before revoking the old.
	* Create-first so a failed resend never destroys the original invite. If the
	* revoke fails, the store is resynced (so the leftover original surfaces) and
	* the error is rethrown so the caller can report the partial failure rather
	* than show success over two live invites for the same email.
	*/
	async function resendInvite(inviteId) {
		if (resendingInviteIds.has(inviteId)) throw new Error("Invite resend already in progress");
		const invite = activeWorkspace.value?.pendingInvites.find((i) => i.id === inviteId);
		if (!invite) throw new Error("Invite not found");
		resendingInviteIds.add(inviteId);
		try {
			const newInvite = await createInvite(invite.email);
			try {
				await revokeInvite(inviteId);
			} catch (error) {
				await fetchPendingInvites();
				throw error;
			}
			return newInvite;
		} finally {
			resendingInviteIds.delete(inviteId);
		}
	}
	/**
	* Accept a workspace invite.
	* Returns workspace info so UI can offer "View Workspace" button.
	*/
	async function acceptInvite(token) {
		const response = await workspaceApi.acceptInvite(token);
		await refreshWorkspaces();
		return {
			workspaceId: response.workspace_id,
			workspaceName: response.workspace_name
		};
	}
	function subscribeWorkspace(plan = "PRO_MONTHLY") {
		console.warn(plan, "Billing endpoint has not been added yet.");
	}
	/**
	* Clean up store resources.
	* Delegates to workspaceAuthStore for token cleanup.
	*/
	function destroy() {
		useWorkspaceAuthStore().destroy();
	}
	return {
		initState,
		workspaces,
		activeWorkspaceId,
		error,
		isCreating,
		isDeleting,
		isSwitching,
		isFetchingWorkspaces,
		activeWorkspace,
		personalWorkspace,
		isInPersonalWorkspace,
		sharedWorkspaces,
		ownedWorkspacesCount,
		canCreateWorkspace,
		members,
		isCurrentUserOriginalOwner,
		pendingInvites,
		originalOwnerId,
		totalMemberSlots,
		isInviteLimitReached,
		workspaceId,
		workspaceName,
		isWorkspaceSubscribed,
		subscriptionPlan,
		initialize,
		destroy,
		refreshWorkspaces,
		switchWorkspace,
		createWorkspace,
		deleteWorkspace,
		renameWorkspace,
		updateWorkspaceName,
		leaveWorkspace,
		fetchMembers,
		ensureMembersLoaded,
		removeMember,
		changeMemberRole,
		fetchPendingInvites,
		createInvite,
		revokeInvite,
		resendInvite,
		acceptInvite,
		subscribeWorkspace,
		updateActiveWorkspace
	};
});
//#endregion
export { clearPreservedQuery as a, ServerFeatureFlag as c, capturePreservedQuery as i, useFeatureFlags as l, workspaceApi as n, hydratePreservedQuery as o, PRESERVED_QUERY_NAMESPACES as r, mergePreservedQueryIntoQuery as s, useTeamWorkspaceStore as t, WORKSPACE_STORAGE_KEYS as u };

//# sourceMappingURL=teamWorkspaceStore-CXx-dMnm.js.map