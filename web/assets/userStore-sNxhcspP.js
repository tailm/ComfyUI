import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, _t as watchEffect, jt as ref, l as defineStore } from "./vendor-vue-core-ywZ1En3W.js";
import { r as api } from "./api-Bz5NhLSR.js";
//#region src/stores/userStore.ts
var useUserStore = defineStore("user", () => {
	/**
	* The user config. null if not loaded.
	*/
	const userConfig = ref(null);
	/**
	* The current user id. null if not logged in or in single user mode.
	*/
	const currentUserId = ref(null);
	/**
	* Whether the current user is an admin.
	*/
	const isAdmin = ref(false);
	const isMultiUserServer = computed(() => userConfig.value && "users" in userConfig.value);
	const needsLogin = computed(() => !currentUserId.value && isMultiUserServer.value);
	const users = computed(() => (userConfig.value?.users ?? []).map(({ id, userId, username }) => ({
		id,
		userId,
		username
	})));
	const currentUser = computed(() => users.value.find((user) => user.userId === currentUserId.value) ?? null);
	const initialized = computed(() => userConfig.value !== null);
	let initializePromise = null;
	/**
	* Initialize the user store.
	*/
	async function initialize() {
		initializePromise ??= (async () => {
			try {
				const storedUserId = localStorage["Comfy.userId"];
				if (storedUserId) api.user = storedUserId;
				userConfig.value = await api.getUserConfig();
				if (!storedUserId && userConfig.value?.users?.length) {
					const apiUserId = userConfig.value.users[0].userId;
					currentUserId.value = apiUserId;
					api.user = apiUserId;
					localStorage["Comfy.userId"] = apiUserId;
					if (userConfig.value.users[0].username) localStorage["Comfy.userName"] = userConfig.value.users[0].username;
				} else currentUserId.value = storedUserId ?? null;
				if (userConfig.value?.users?.length) isAdmin.value = !!userConfig.value.users[0].isAdmin;
			} catch (err) {
				initializePromise = null;
				throw err;
			}
		})();
		return initializePromise;
	}
	/**
	* Reset the initialize promise so that initialize() can be called again.
	* This is needed after logout or when the user state needs to be refreshed.
	*/
	function resetInitialize() {
		initializePromise = null;
	}
	/**
	* Create a new user.
	*
	* @param username - The username.
	* @returns The new user.
	*/
	async function createUser(username) {
		const resp = await api.createUser(username);
		const data = await resp.json();
		if (resp.status >= 300) throw new Error(data.error ?? "Error creating user: " + resp.status + " " + resp.statusText);
		return {
			userId: data,
			username
		};
	}
	/**
	* Login the current user.
	*
	* @param user - The user.
	*/
	async function login({ userId, username }) {
		currentUserId.value = userId;
		localStorage["Comfy.userId"] = userId;
		localStorage["Comfy.userName"] = username;
	}
	watchEffect(() => {
		if (currentUserId.value) api.user = currentUserId.value;
	});
	/**
	* Logout the current user.
	*/
	async function logout() {
		delete localStorage["Comfy.userId"];
		delete localStorage["Comfy.userName"];
		currentUserId.value = null;
		userConfig.value = null;
		isAdmin.value = false;
		api.user = null;
		resetInitialize();
	}
	return {
		users,
		currentUser,
		isMultiUserServer,
		needsLogin,
		isAdmin,
		initialized,
		initialize,
		resetInitialize,
		createUser,
		login,
		logout
	};
});
//#endregion
export { useUserStore as t };

//# sourceMappingURL=userStore-sNxhcspP.js.map