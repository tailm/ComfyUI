const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./useSessionCookie-BloeUZ9K.js","./useSessionCookie-BgsIJkKY.js","./rolldown-runtime-w0pxe0c8.js","./promotionUtils-vKoNYnM9.js","./_plugin-vue_export-helper-BTZD_w11.js","./vendor-primevue-rx7tKw03.js","./vendor-vue-core-D3WB7mNE.js","./vendor-other-CcVI76zn.js","./vendor-firebase-C7k8AidI.js","./vendor-three-BgtZEsKh.js","./vendor-tiptap-Da8lvoX9.js","./vendor-zod-9ZYBvZOX.js","./vendor-reka-ui-3rzHRTLU.js","./vendor-i18n-BVGbvPvq.js","./vendor-sentry-CJqm_Nmo.js","./vendor-vueuse-BA2QXdyV.js","./vendor-axios-CCRjO_8I.js","./vendor-markdown-ZOM1KON6.js","./vendor-yjs-DF9PYGyQ.js","./api-DrovjuJk.js","./types-4cVPtFn2.js","./toastStore-BIphcVgz.js","./devFeatureFlagOverride-BkGrEGSd.js","./formatUtil-B15pKy0Z.js","./src-CDgHMYTj.js","./downloadUtil-DVwV9jPP.js","./i18n-DAE2CSwM.js","./commands-DD5bW_sz.js","./main-mdv62577.js","./nodeDefs-BSMa-osx.js","./settings-C20_o31_.js","./WaveAudioPlayer-B565XRpq.js","./Button-BDFBPNkK.js","./Slider-C_rx-g3O.js","./DialogHeader-DkWnDCOh.js","./dialogStore-DD1yBh6P.js","./Loader-BDNSi0qc.js","./Popover-CZfXPPLp.js","./useModalLiftedZIndex-CHOpgGKh.js","./ColorPicker-CzfjYyaP.js","./SelectValue-DqyfA2Es.js","./Input-DH6Bhvfp.js","./extensionStore-rc50enKT.js","./useErrorHandling-DNyo9FnY.js","./useExternalLink-lnTgXLgb.js","./envUtil-BjE8ep-x.js","./useFeatureFlags-DVgtsxbC.js","./remoteConfig-DjUkM6Dg.js","./useImageQuiet-Cr1HOQ5t.js","./VideoPlayOverlay-BHVjultu.js","./useFeatureUsageTracker-Dmo_jNxY.js","./telemetry-BQKS_Is7.js","./topupTracker-DNKc8Xp6.js","./userStore-BKADmpNR.js","./widgetTypes-oIdIlxxV.js","./markdownRendererUtil-B-BSW0UD.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css","./CloudLayoutView-uHwVyGDk.js","./GlobalToast-D8zwEjjb.js","./CloudLayoutView-DROL9oAr.css","./CloudLoginView-CGdbG15M.js","./webviewDetection-BEN5stoL.js","./usePostAuthRedirect-CVNmGSM8.js","./oauthState-0r1ukMzs.js","./signInSchema-BJiZQeas.js","./CloudLoginView-Ce8BuGOl.css","./useCurrentUser-BZ-mpcHT.js","./CloudSignupView-DqADBpyj.js","./SignUpForm-BCKuoyRd.js","./PasswordFields-BTAZ3cEe.js","./loadExternalScript-DaB_1k_B.js","./CloudSignupView-CkQ7PF-y.css","./CloudForgotPasswordView-njKShShl.js","./CloudForgotPasswordView-qHVhh4y3.css","./CloudSurveyView-BwnhDQl8.js","./auth-DbePuc5y.js","./errorUtil-CVYb13Xf.js","./OAuthConsentView-DnSYzGb6.js","./WorkspaceProfilePic-DA3oYgmE.js","./UserCheckView-Dsrq73da.js","./CloudSorryContactSupportView-YEWjXvP4.js","./CloudSorryContactSupportView-Cg1Fm-bz.css","./CloudAuthTimeoutView-B3Ob_qOx.js","./CloudSubscriptionRedirectView-C3lUfJ8p.js","./comfy-logo-single-D0Vl2r_r.js","./workspaceCheckoutTelemetry-C-mPoQzr.js","./subscriptionCheckoutUtil-BiZO4SZw.js"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { tt as __vitePreload } from "./vendor-primevue-rx7tKw03.js";
import { r as getOAuthRequestId } from "./oauthState-0r1ukMzs.js";
//#region src/platform/cloud/onboarding/onboardingCloudRoutes.ts
async function oauthConsentRedirect() {
	const oauthRequestId = getOAuthRequestId();
	if (!oauthRequestId) return { name: "cloud-user-check" };
	try {
		const { useSessionCookie } = await __vitePreload(async () => {
			const { useSessionCookie } = await import("./useSessionCookie-BloeUZ9K.js");
			return { useSessionCookie };
		}, __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]), import.meta.url);
		await useSessionCookie().createSessionOrThrow();
	} catch (error) {
		console.warn("Failed to establish Cloud session cookie before OAuth consent:", error);
	}
	return {
		name: "cloud-oauth-consent",
		query: { oauth_request_id: oauthRequestId }
	};
}
var cloudOnboardingRoutes = [{
	path: "/cloud",
	component: () => __vitePreload(() => import("./CloudLayoutView-uHwVyGDk.js"), __vite__mapDeps([58,2,13,6,59,5,3,4,7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,60]), import.meta.url),
	children: [
		{
			path: "login",
			name: "cloud-login",
			component: () => __vitePreload(() => import("./CloudLoginView-CGdbG15M.js"), __vite__mapDeps([61,4,2,5,6,3,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,62,63,1,64,65,56,57,66]), import.meta.url),
			beforeEnter: async (to, _from, next) => {
				if (!to.query.switchAccount) {
					const { useCurrentUser } = await __vitePreload(async () => {
						const { useCurrentUser } = await import("./useCurrentUser-BZ-mpcHT.js");
						return { useCurrentUser };
					}, __vite__mapDeps([67,3,4,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]), import.meta.url);
					const { isLoggedIn } = useCurrentUser();
					if (isLoggedIn.value) return next(await oauthConsentRedirect());
				}
				next();
			}
		},
		{
			path: "signup",
			name: "cloud-signup",
			component: () => __vitePreload(() => import("./CloudSignupView-DqADBpyj.js"), __vite__mapDeps([68,4,2,5,6,3,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,62,69,70,65,71,63,1,64,56,57,72]), import.meta.url),
			beforeEnter: async (to, _from, next) => {
				if (!to.query.switchAccount) {
					const { useCurrentUser } = await __vitePreload(async () => {
						const { useCurrentUser } = await import("./useCurrentUser-BZ-mpcHT.js");
						return { useCurrentUser };
					}, __vite__mapDeps([67,3,4,2,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]), import.meta.url);
					const { isLoggedIn } = useCurrentUser();
					if (isLoggedIn.value) return next(await oauthConsentRedirect());
				}
				next();
			}
		},
		{
			path: "forgot-password",
			name: "cloud-forgot-password",
			component: () => __vitePreload(() => import("./CloudForgotPasswordView-njKShShl.js"), __vite__mapDeps([73,4,2,5,6,3,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,74]), import.meta.url)
		},
		{
			path: "survey",
			name: "cloud-survey",
			component: () => __vitePreload(() => import("./CloudSurveyView-BwnhDQl8.js"), __vite__mapDeps([75,2,5,6,7,8,9,10,11,13,24,32,12,41,46,19,15,16,20,21,22,47,76,14,77,51,56]), import.meta.url),
			meta: { requiresAuth: true }
		},
		{
			path: "oauth/consent",
			name: "cloud-oauth-consent",
			component: () => __vitePreload(() => import("./OAuthConsentView-DnSYzGb6.js"), __vite__mapDeps([78,2,12,6,13,24,7,8,9,10,11,32,64,79,56]), import.meta.url)
		},
		{
			path: "user-check",
			name: "cloud-user-check",
			component: () => __vitePreload(() => import("./UserCheckView-Dsrq73da.js"), __vite__mapDeps([80,2,5,6,15,32,7,8,9,10,11,12,24,43,26,13,27,28,29,30,21,46,19,16,20,22,47,76,14,77,56]), import.meta.url),
			meta: { requiresAuth: true }
		},
		{
			path: "sorry-contact-support",
			name: "cloud-sorry-contact-support",
			component: () => __vitePreload(() => import("./CloudSorryContactSupportView-YEWjXvP4.js"), __vite__mapDeps([81,4,2,13,6,82]), import.meta.url)
		},
		{
			path: "auth-timeout",
			name: "cloud-auth-timeout",
			component: () => __vitePreload(() => import("./CloudAuthTimeoutView-B3Ob_qOx.js"), __vite__mapDeps([83,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]), import.meta.url),
			props: true
		},
		{
			path: "subscribe",
			name: "cloud-subscribe",
			component: () => __vitePreload(() => import("./CloudSubscriptionRedirectView-C3lUfJ8p.js"), __vite__mapDeps([84,2,5,6,3,4,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,85,86,87,56,57]), import.meta.url),
			meta: { requiresAuth: true }
		}
	]
}];
//#endregion
export { cloudOnboardingRoutes };

//# sourceMappingURL=onboardingCloudRoutes-DCcIXn4P.js.map