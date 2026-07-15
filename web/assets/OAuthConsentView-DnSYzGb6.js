import "./rolldown-runtime-w0pxe0c8.js";
import { B as createVNode, E as Fragment, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, N as createBlock, P as createCommentVNode, Ut as normalizeClass, Vt as unref, it as openBlock, j as computed, ot as renderList, s as useRoute, tt as onMounted, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { r as useI18n } from "./vendor-i18n-BVGbvPvq.js";
import { M as RadioGroupRoot_default, j as RadioGroupItem_default } from "./vendor-reka-ui-3rzHRTLU.js";
import { t as cn } from "./src-CDgHMYTj.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { n as clearOAuthRequestId, r as getOAuthRequestId } from "./oauthState-0r1ukMzs.js";
import { t as WorkspaceProfilePic_default } from "./WorkspaceProfilePic-DA3oYgmE.js";
//#region src/platform/cloud/oauth/oauthApi.ts
var EXECUTABLE_SCHEMES = new Set([
	"javascript:",
	"data:",
	"blob:",
	"vbscript:",
	"about:"
]);
var OAuthApiError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.status = status;
		this.name = "OAuthApiError";
	}
};
async function readErrorMessage(response) {
	const message = (await response.json().catch(() => null))?.message;
	return typeof message === "string" ? message : response.statusText;
}
function assertChallenge(value) {
	if (typeof value !== "object" || value === null) throw new Error("OAuth consent challenge is invalid");
	const challenge = value;
	if (typeof challenge.oauth_request_id !== "string" || typeof challenge.csrf_token !== "string" || typeof challenge.client_display_name !== "string" || !Array.isArray(challenge.scopes) || !challenge.scopes.every((scope) => typeof scope === "string") || !Array.isArray(challenge.workspaces) || !challenge.workspaces.every(isValidWorkspace)) throw new Error("OAuth consent challenge is invalid");
}
function isValidWorkspace(value) {
	if (typeof value !== "object" || value === null) return false;
	const workspace = value;
	return typeof workspace.id === "string" && typeof workspace.name === "string" && (workspace.type === "personal" || workspace.type === "team") && (workspace.role === "owner" || workspace.role === "member");
}
async function fetchOAuthConsentChallenge(oauthRequestId) {
	const response = await fetch(`/oauth/authorize?oauth_request_id=${encodeURIComponent(oauthRequestId)}`, {
		method: "GET",
		credentials: "include"
	});
	if (!response.ok) throw new OAuthApiError(await readErrorMessage(response), response.status);
	const challenge = await response.json();
	assertChallenge(challenge);
	return challenge;
}
async function submitOAuthConsentDecision({ oauthRequestId, csrfToken, decision, workspaceId, expectedRedirectUri }) {
	const response = await fetch("/oauth/authorize", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			oauth_request_id: oauthRequestId,
			csrf_token: csrfToken,
			decision,
			workspace_id: workspaceId
		})
	});
	if (!response.ok) throw new OAuthApiError(await readErrorMessage(response), response.status);
	const redirectUrl = (await response.json())?.redirect_url;
	if (typeof redirectUrl !== "string") throw new Error("OAuth consent response did not include redirect_url");
	const parseTarget = () => {
		try {
			return new URL(redirectUrl, globalThis.location.origin);
		} catch (err) {
			throw new Error("OAuth consent redirect_url is not a valid URL", { cause: err });
		}
	};
	const target = parseTarget();
	if (EXECUTABLE_SCHEMES.has(target.protocol)) throw new Error("OAuth consent redirect_url has an unsafe scheme");
	if (expectedRedirectUri) {
		const parseExpected = () => {
			try {
				return new URL(expectedRedirectUri);
			} catch (err) {
				throw new Error("OAuth consent challenge redirect_uri is not a valid URL", { cause: err });
			}
		};
		const expected = parseExpected();
		if (!(target.protocol === expected.protocol && target.host === expected.host && target.pathname === expected.pathname)) throw new Error("OAuth consent redirect_url does not match the registered redirect_uri");
	} else if (target.protocol !== "http:" && target.protocol !== "https:") throw new Error("OAuth consent redirect_url has an unsafe scheme");
	globalThis.location.href = target.href;
}
//#endregion
//#region src/platform/cloud/oauth/OAuthConsentView.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "dark-theme mx-auto flex min-h-screen max-w-md flex-col justify-center p-6" };
var _hoisted_2 = {
	key: 0,
	class: "flex flex-col gap-6 rounded-2xl border border-solid border-muted bg-secondary-background p-6 shadow-sm"
};
var _hoisted_3 = { class: "flex flex-col items-center gap-3 pt-2 text-center" };
var _hoisted_4 = { class: "flex flex-col items-center gap-1.5" };
var _hoisted_5 = { class: "m-0 text-xl/tight font-semibold" };
var _hoisted_6 = { class: "m-0 text-sm text-muted" };
var _hoisted_7 = { class: "flex flex-col gap-2" };
var _hoisted_8 = { class: "m-0 text-sm font-medium" };
var _hoisted_9 = {
	key: 0,
	class: "p-3 text-sm text-muted"
};
var _hoisted_10 = { class: "flex min-w-0 flex-1 flex-col" };
var _hoisted_11 = { class: "truncate text-sm text-base-foreground" };
var _hoisted_12 = { class: "text-xs text-muted-foreground" };
var _hoisted_13 = {
	key: 0,
	class: "icon-[lucide--check] size-4 shrink-0 text-base-foreground",
	"aria-hidden": "true"
};
var _hoisted_14 = { class: "m-0 text-xs text-muted" };
var _hoisted_15 = { class: "flex flex-col gap-3" };
var _hoisted_16 = { class: "m-0 text-sm font-medium" };
var _hoisted_17 = { class: "m-0 flex list-none flex-col gap-1.5 p-0" };
var _hoisted_18 = { class: "text-sm" };
var _hoisted_19 = {
	key: 0,
	class: "flex flex-col gap-1.5 rounded-lg border border-solid border-muted bg-secondary-background/40 p-3"
};
var _hoisted_20 = { class: "text-xs text-muted" };
var _hoisted_21 = ["title"];
var _hoisted_22 = {
	key: 1,
	role: "alert",
	class: "m-0 rounded-md border border-solid border-destructive-background bg-destructive-background/10 p-3 text-sm text-destructive-background"
};
var _hoisted_23 = { class: "flex flex-col gap-2" };
var _hoisted_24 = {
	key: 1,
	role: "alert",
	class: "m-0 rounded-md border border-solid border-destructive-background bg-destructive-background/10 p-3 text-center text-sm text-destructive-background"
};
var _hoisted_25 = {
	key: 2,
	class: "m-0 text-center text-sm text-muted"
};
//#endregion
//#region src/platform/cloud/oauth/OAuthConsentView.vue
var OAuthConsentView_default = /* @__PURE__ */ defineComponent({
	__name: "OAuthConsentView",
	props: { initialChallenge: {} },
	setup(__props) {
		const { t, te } = useI18n();
		const route = useRoute();
		function getDefaultWorkspaceId(source) {
			return source?.workspaces.length === 1 ? source.workspaces[0].id : void 0;
		}
		const challenge = ref(__props.initialChallenge ?? null);
		const selectedWorkspaceId = ref(getDefaultWorkspaceId(__props.initialChallenge));
		const errorMessage = ref("");
		const submitting = ref(null);
		const isSubmitting = computed(() => submitting.value !== null);
		const resourceName = computed(() => challenge.value?.resource_display_name ?? t("oauth.consent.resourceFallback"));
		const selectedWorkspaceIsValid = computed(() => Boolean(selectedWorkspaceId.value && challenge.value?.workspaces.some((workspace) => workspace.id === selectedWorkspaceId.value)));
		function scopeLabel(scope) {
			const key = `oauth.scopes.${scope}.label`;
			return te(key) ? t(key) : scope;
		}
		function workspaceSecondaryLabel(workspace) {
			if (workspace.type === "personal") return t("oauth.workspace.personal");
			return workspace.role === "owner" ? t("oauth.workspace.owner") : t("oauth.workspace.member");
		}
		function requestIdFromRoute() {
			return typeof route.query.oauth_request_id === "string" ? route.query.oauth_request_id : getOAuthRequestId();
		}
		async function loadChallenge() {
			const oauthRequestId = requestIdFromRoute();
			if (!oauthRequestId) {
				errorMessage.value = t("oauth.consent.missingRequest");
				return;
			}
			try {
				const next = await fetchOAuthConsentChallenge(oauthRequestId);
				challenge.value = next;
				selectedWorkspaceId.value = getDefaultWorkspaceId(next);
			} catch (error) {
				errorMessage.value = messageForError(error);
			}
		}
		function messageForError(error) {
			if (error instanceof OAuthApiError) {
				if (error.status === 400) return t("oauth.consent.errorExpired");
				if (error.status === 403) return t("oauth.consent.errorScopeBroadening");
				if (error.status === 404) return t("oauth.consent.errorUnavailable");
			}
			return t("oauth.consent.genericError");
		}
		async function submit(decision) {
			if (!challenge.value) return;
			if (decision === "allow" && !selectedWorkspaceIsValid.value) return;
			const workspaceId = selectedWorkspaceId.value ?? challenge.value.workspaces[0]?.id;
			if (!workspaceId) return;
			errorMessage.value = "";
			submitting.value = decision;
			try {
				await submitOAuthConsentDecision({
					oauthRequestId: challenge.value.oauth_request_id,
					csrfToken: challenge.value.csrf_token,
					decision,
					workspaceId,
					expectedRedirectUri: challenge.value.redirect_uri
				});
				clearOAuthRequestId();
			} catch (error) {
				errorMessage.value = messageForError(error);
			} finally {
				submitting.value = null;
			}
		}
		onMounted(() => {
			if (!__props.initialChallenge) loadChallenge();
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("main", _hoisted_1, [challenge.value ? (openBlock(), createElementBlock("section", _hoisted_2, [
				createBaseVNode("header", _hoisted_3, [_cache[3] || (_cache[3] = createBaseVNode("div", { class: "flex size-12 items-center justify-center rounded-2xl bg-secondary-background" }, [createBaseVNode("i", {
					class: "icon-[lucide--key] size-5 text-base-foreground",
					"aria-hidden": "true"
				})], -1)), createBaseVNode("div", _hoisted_4, [createBaseVNode("h1", _hoisted_5, toDisplayString(unref(t)("oauth.consent.title", { client: challenge.value.client_display_name })), 1), createBaseVNode("p", _hoisted_6, toDisplayString(unref(t)("oauth.consent.subtitle", { resource: resourceName.value })), 1)])]),
				createBaseVNode("section", _hoisted_7, [
					createBaseVNode("p", _hoisted_8, toDisplayString(unref(t)("oauth.consent.workspaceLabel")), 1),
					challenge.value.workspaces.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_9, toDisplayString(unref(t)("oauth.consent.noWorkspaces")), 1)) : (openBlock(), createBlock(unref(RadioGroupRoot_default), {
						key: 1,
						modelValue: selectedWorkspaceId.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedWorkspaceId.value = $event),
						"aria-label": unref(t)("oauth.consent.workspaceLabel"),
						class: "m-0 flex scrollbar-custom max-h-72 list-none flex-col gap-1 overflow-y-auto p-0"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(challenge.value.workspaces, (workspace) => {
							return openBlock(), createBlock(unref(RadioGroupItem_default), {
								key: workspace.id,
								value: workspace.id,
								class: normalizeClass(unref(cn)("flex w-full cursor-pointer items-center gap-3 rounded-md border-none bg-transparent px-3 py-2 text-left transition-colors", "hover:bg-secondary-background-hover", "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none", selectedWorkspaceId.value === workspace.id && "bg-secondary-background"))
							}, {
								default: withCtx(() => [
									createVNode(WorkspaceProfilePic_default, {
										class: "size-8 shrink-0 text-sm",
										"workspace-name": workspace.name
									}, null, 8, ["workspace-name"]),
									createBaseVNode("div", _hoisted_10, [createBaseVNode("span", _hoisted_11, toDisplayString(workspace.name), 1), createBaseVNode("span", _hoisted_12, toDisplayString(workspaceSecondaryLabel(workspace)), 1)]),
									selectedWorkspaceId.value === workspace.id ? (openBlock(), createElementBlock("i", _hoisted_13)) : createCommentVNode("", true)
								]),
								_: 2
							}, 1032, ["value", "class"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue", "aria-label"])),
					createBaseVNode("p", _hoisted_14, toDisplayString(unref(t)("oauth.consent.workspaceHelp")), 1)
				]),
				createBaseVNode("section", _hoisted_15, [createBaseVNode("p", _hoisted_16, toDisplayString(unref(t)("oauth.consent.permissionsHeader")), 1), createBaseVNode("ul", _hoisted_17, [(openBlock(true), createElementBlock(Fragment, null, renderList(challenge.value.scopes, (scope) => {
					return openBlock(), createElementBlock("li", {
						key: scope,
						class: "flex items-center gap-2"
					}, [_cache[4] || (_cache[4] = createBaseVNode("i", {
						class: "icon-[lucide--check] size-4 shrink-0 text-primary-background",
						"aria-hidden": "true"
					}, null, -1)), createBaseVNode("span", _hoisted_18, toDisplayString(scopeLabel(scope)), 1)]);
				}), 128))])]),
				challenge.value.redirect_uri ? (openBlock(), createElementBlock("section", _hoisted_19, [createBaseVNode("span", _hoisted_20, toDisplayString(unref(t)("oauth.consent.redirectNotice")), 1), createBaseVNode("code", {
					class: "m-0 truncate font-mono text-xs text-base-foreground",
					title: challenge.value.redirect_uri
				}, toDisplayString(challenge.value.redirect_uri), 9, _hoisted_21)])) : createCommentVNode("", true),
				errorMessage.value ? (openBlock(), createElementBlock("p", _hoisted_22, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
				createBaseVNode("footer", _hoisted_23, [createVNode(Button_default, {
					variant: "primary",
					size: "lg",
					class: "w-full",
					loading: submitting.value === "allow",
					disabled: isSubmitting.value || !selectedWorkspaceIsValid.value,
					onClick: _cache[1] || (_cache[1] = ($event) => submit("allow"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("oauth.consent.allow")), 1)]),
					_: 1
				}, 8, ["loading", "disabled"]), createVNode(Button_default, {
					variant: "secondary",
					size: "lg",
					class: "w-full",
					loading: submitting.value === "deny",
					disabled: isSubmitting.value || challenge.value.workspaces.length === 0,
					onClick: _cache[2] || (_cache[2] = ($event) => submit("deny"))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("oauth.consent.deny")), 1)]),
					_: 1
				}, 8, ["loading", "disabled"])])
			])) : errorMessage.value ? (openBlock(), createElementBlock("p", _hoisted_24, toDisplayString(errorMessage.value), 1)) : (openBlock(), createElementBlock("p", _hoisted_25, toDisplayString(unref(t)("oauth.consent.loading")), 1))]);
		};
	}
});
//#endregion
export { OAuthConsentView_default as default };

//# sourceMappingURL=OAuthConsentView-DnSYzGb6.js.map