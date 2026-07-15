import "./rolldown-runtime-w0pxe0c8.js";
import { At as reactive, j as computed, jt as readonly } from "./vendor-vue-core-D3WB7mNE.js";
import { a as remoteConfig, i as isAuthenticatedConfigLoaded, n as cachedTeamWorkspacesEnabled, t as cachedConsolidatedBillingEnabled } from "./remoteConfig-DjUkM6Dg.js";
import { i as api } from "./api-DrovjuJk.js";
import { t as isCloud } from "./types-4cVPtFn2.js";
import { t as getDevOverride } from "./devFeatureFlagOverride-BkGrEGSd.js";
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
export { useFeatureFlags as n, ServerFeatureFlag as t };

//# sourceMappingURL=useFeatureFlags-DVgtsxbC.js.map