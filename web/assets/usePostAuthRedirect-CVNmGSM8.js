import "./rolldown-runtime-w0pxe0c8.js";
import { c as useRouter, s as useRoute } from "./vendor-vue-core-D3WB7mNE.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { t as useToastStore } from "./toastStore-BIphcVgz.js";
import { r as getOAuthRequestId, t as captureOAuthRequestId } from "./oauthState-0r1ukMzs.js";
import { t as useSessionCookie } from "./useSessionCookie-BgsIJkKY.js";
//#region src/platform/cloud/oauth/useOAuthPostLoginRedirect.ts
/**
* Post-login OAuth resume. If the current login flow originated from an OAuth
* authorize request, establishes the Cloud session cookie and navigates to the
* consent route. Used by both `CloudLoginView` and `CloudSignupView`.
*/
function useOAuthPostLoginRedirect() {
	const router = useRouter();
	const sessionCookie = useSessionCookie();
	const { t } = useI18n();
	async function resumeOAuthIfNeeded(query) {
		captureOAuthRequestId(query);
		const oauthRequestId = getOAuthRequestId();
		if (!oauthRequestId) return { kind: "no-oauth" };
		try {
			await sessionCookie.createSessionOrThrow();
		} catch (error) {
			return {
				kind: "error",
				message: error instanceof Error ? error.message : t("oauth.consent.sessionError")
			};
		}
		await router.push({
			name: "cloud-oauth-consent",
			query: { oauth_request_id: oauthRequestId }
		});
		return { kind: "resumed" };
	}
	return { resumeOAuthIfNeeded };
}
//#endregion
//#region src/platform/cloud/onboarding/utils/previousFullPath.ts
var decodeQueryParam = (value) => {
	try {
		return decodeURIComponent(value);
	} catch {
		return null;
	}
};
var isSafeInternalRedirectPath = (path) => {
	return path.startsWith("/") && !path.startsWith("//");
};
var getSafePreviousFullPath = (query) => {
	const raw = query.previousFullPath;
	const value = Array.isArray(raw) ? raw[0] : raw;
	if (!value) return null;
	const decoded = decodeQueryParam(value);
	if (!decoded) return null;
	return isSafeInternalRedirectPath(decoded) ? decoded : null;
};
//#endregion
//#region src/platform/cloud/onboarding/composables/usePostAuthRedirect.ts
/**
* Shared post-authentication redirect logic used by both CloudLoginView and
* CloudSignupView. Handles OAuth resume, previousFullPath redirect, and
* default redirect after successful sign-in or sign-up.
*/
function usePostAuthRedirect(options) {
	const { t } = useI18n();
	const router = useRouter();
	const route = useRoute();
	const toastStore = useToastStore();
	const { resumeOAuthIfNeeded } = useOAuthPostLoginRedirect();
	async function onAuthSuccess() {
		toastStore.add({
			severity: "success",
			summary: options.successSummary,
			life: 2e3
		});
		const oauthResume = await resumeOAuthIfNeeded(route.query);
		if (oauthResume.kind === "error") {
			options.authError.value = oauthResume.message;
			toastStore.add({
				severity: "error",
				summary: t("oauth.consent.sessionErrorToastSummary"),
				detail: oauthResume.message,
				life: 4e3
			});
			return;
		}
		if (oauthResume.kind === "resumed") return;
		const previousFullPath = getSafePreviousFullPath(route.query);
		if (previousFullPath) {
			await router.replace(previousFullPath);
			return;
		}
		await router.push(options.defaultRedirect());
	}
	return { onAuthSuccess };
}
//#endregion
export { usePostAuthRedirect as t };

//# sourceMappingURL=usePostAuthRedirect-CVNmGSM8.js.map