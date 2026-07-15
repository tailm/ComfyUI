import "./rolldown-runtime-w0pxe0c8.js";
//#region src/base/webviewDetection.ts
/**
* Detects whether the app is running inside an embedded webview.
*
* Google blocks OAuth via `signInWithPopup` in embedded webviews,
* returning a 403 `disallowed_useragent` error (policy since 2021).
* This utility is used to hide the Google SSO button in those contexts.
*
* Detection covers:
*   • Android WebView (`wv` token in UA)
*   • iOS WKWebView (has `AppleWebKit` but lacks `Safari/`)
*   • Social app in-app browsers (Facebook, Instagram, TikTok, etc.)
*   • JS bridge objects (`window.webkit.messageHandlers`, `ReactNativeWebView`)
*/
var SOCIAL_APP_PATTERNS = /FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|musical_ly/i;
function isAndroidWebView(ua) {
	return /\bwv\b/.test(ua) && /Android/.test(ua);
}
function isIOSWebView(ua) {
	if (!/AppleWebKit/i.test(ua)) return false;
	if (/Safari\//i.test(ua)) return false;
	if (/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)) return false;
	return true;
}
function isSocialAppBrowser(ua) {
	return SOCIAL_APP_PATTERNS.test(ua);
}
function hasWebViewBridge() {
	try {
		const win = globalThis;
		if (typeof win.webkit === "object" && win.webkit !== null && typeof win.webkit.messageHandlers === "object") return true;
		if (win.ReactNativeWebView != null) return true;
	} catch {}
	return false;
}
function isEmbeddedWebView(ua = navigator.userAgent) {
	if (isSocialAppBrowser(ua)) return true;
	if (isAndroidWebView(ua)) return true;
	if (isIOSWebView(ua)) return true;
	if (hasWebViewBridge()) return true;
	return false;
}
function getGoogleSsoBlockedReason(ua = navigator.userAgent) {
	if (isEmbeddedWebView(ua)) return "embedded-webview";
	return null;
}
//#endregion
export { getGoogleSsoBlockedReason as t };

//# sourceMappingURL=webviewDetection-BEN5stoL.js.map