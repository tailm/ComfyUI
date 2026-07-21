import "./rolldown-runtime-w0pxe0c8.js";
import { k as script } from "./vendor-primevue-Di5q1E0M.js";
import { A as computed, Bt as unref, M as createBlock, V as defineComponent, jt as ref, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
import { t as useUserStore } from "./userStore-sNxhcspP.js";
//#endregion
//#region src/components/common/UserAvatar.vue
var UserAvatar_default = /* @__PURE__ */ defineComponent({
	__name: "UserAvatar",
	props: {
		photoUrl: {},
		ariaLabel: {}
	},
	setup(__props) {
		const imageError = ref(false);
		const handleImageError = () => {
			imageError.value = true;
		};
		const hasAvatar = computed(() => __props.photoUrl && !imageError.value);
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(script), {
				class: "aspect-square bg-interface-panel-selected-surface",
				image: __props.photoUrl ?? void 0,
				icon: hasAvatar.value ? void 0 : "icon-[lucide--user]",
				pt: { icon: {
					class: { "size-4": !hasAvatar.value },
					"data-testid": "avatar-icon"
				} },
				shape: "circle",
				"aria-label": __props.ariaLabel ?? _ctx.$t("auth.login.userAvatar"),
				onError: handleImageError
			}, null, 8, [
				"image",
				"icon",
				"pt",
				"aria-label"
			]);
		};
	}
});
//#endregion
//#region src/composables/auth/useCurrentUser.ts
/**
* Stub for the deleted useCurrentUser composable.
* Provides local-auth compatible replacements for cloud auth features.
*/
function useCurrentUser() {
	const userStore = useUserStore();
	const isLoggedIn = computed(() => !!userStore.currentUserId);
	const loading = ref(false);
	const isApiKeyLogin = ref(false);
	const isEmailProvider = ref(true);
	const userDisplayName = computed(() => userStore.currentUser?.username ?? userStore.currentUserId ?? "");
	const userEmail = computed(() => "");
	const userPhotoUrl = ref(null);
	const providerName = ref("Local");
	const providerIcon = ref("pi pi-key");
	const resolvedUserInfo = computed(() => userStore.currentUserId ? { id: userStore.currentUserId } : null);
	async function handleSignOut() {
		await fetch("/api/logout", { method: "POST" });
		await userStore.logout();
		window.location.href = "/login";
	}
	function handleSignIn() {
		window.location.href = "/login";
	}
	function onUserResolved(_callback) {}
	function onTokenRefreshed(_callback) {}
	function onUserLogout(_callback) {}
	return {
		isLoggedIn,
		loading,
		isApiKeyLogin,
		isEmailProvider,
		userDisplayName,
		userEmail,
		userPhotoUrl,
		providerName,
		providerIcon,
		resolvedUserInfo,
		handleSignOut,
		handleSignIn,
		onUserResolved,
		onTokenRefreshed,
		onUserLogout
	};
}
//#endregion
export { UserAvatar_default as n, useCurrentUser as t };

//# sourceMappingURL=useCurrentUser-2h6zopW4.js.map