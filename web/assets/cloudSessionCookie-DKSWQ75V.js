import "./rolldown-runtime-w0pxe0c8.js";
import { Wn as useExtensionService } from "./promotionUtils-vKoNYnM9.js";
import { n as clearOAuthRequestId } from "./oauthState-0r1ukMzs.js";
import { t as useSessionCookie } from "./useSessionCookie-BgsIJkKY.js";
//#region src/extensions/core/cloudSessionCookie.ts
/**
* Cloud-only extension that manages session cookies for authentication.
* Creates session cookie on login, refreshes it when token refreshes, and deletes on logout.
*/
useExtensionService().registerExtension({
	name: "Comfy.Cloud.SessionCookie",
	onAuthUserResolved: async () => {
		const { createSession } = useSessionCookie();
		await createSession();
	},
	onAuthTokenRefreshed: async () => {
		const { createSession } = useSessionCookie();
		await createSession();
	},
	onAuthUserLogout: async () => {
		clearOAuthRequestId();
		const { deleteSession } = useSessionCookie();
		await deleteSession();
	}
});
//#endregion

//# sourceMappingURL=cloudSessionCookie-DKSWQ75V.js.map