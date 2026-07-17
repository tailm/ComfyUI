import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, jt as ref } from "./vendor-vue-core-ywZ1En3W.js";
import { t as useUserStore } from "./userStore-DHnsYsi1.js";
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
	const userDisplayName = computed(() => userStore.currentUserId ?? "");
	const userEmail = computed(() => "");
	const userPhotoUrl = ref(null);
	const providerName = ref("Local");
	const providerIcon = ref("pi pi-key");
	const resolvedUserInfo = computed(() => userStore.currentUserId ? { id: userStore.currentUserId } : null);
	async function handleSignOut() {
		await fetch("/api/logout", { method: "POST" });
		userStore.$reset();
	}
	function handleSignIn() {
		window.location.hash = "#/login";
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
export { useCurrentUser as t };

//# sourceMappingURL=useCurrentUser-VR5ritSj.js.map