import "./rolldown-runtime-w0pxe0c8.js";
import { f as storeToRefs, j as computed } from "./vendor-vue-core-D3WB7mNE.js";
import { Bi as useTeamWorkspaceStore, Hi as useCurrentUser, Oi as useBillingContext, ia as getComfyPlatformBaseUrl, ki as useBillingOperationStore } from "./promotionUtils-vKoNYnM9.js";
import { c as t } from "./i18n-DAE2CSwM.js";
//#region src/platform/workspace/composables/useDowngradeToPersonal.ts
/**
* Team-plan downgrade to personal: validate via `previewSubscribe`, remove
* every member except the original owner, then initiate the tier change.
* BE seam (BE-1337): removal email and an atomic downgrade endpoint are
* BE-owned; until then the FE orchestrates the two steps non-atomically.
*/
function useDowngradeToPersonal() {
	const workspaceStore = useTeamWorkspaceStore();
	const { members } = storeToRefs(workspaceStore);
	const { subscribe, previewSubscribe } = useBillingContext();
	const billingOperationStore = useBillingOperationStore();
	const { userEmail } = useCurrentUser();
	const removableMembers = computed(() => {
		if (members.value.some((m) => m.isOriginalOwner)) return members.value.filter((m) => !m.isOriginalOwner);
		const email = userEmail.value?.toLowerCase() ?? null;
		return members.value.filter((m) => m.role !== "owner" && m.email.toLowerCase() !== email);
	});
	const hasOtherMembers = computed(() => removableMembers.value.length > 0);
	async function refreshMembers() {
		await workspaceStore.fetchMembers();
	}
	async function downgradeToPersonal(planSlug) {
		const preview = await previewSubscribe(planSlug);
		if (!preview?.allowed) throw new Error(preview?.reason || t("subscription.downgrade.notAllowed"));
		const membersToRemove = removableMembers.value;
		for (const member of membersToRemove) try {
			await workspaceStore.removeMember(member.id);
		} catch (error) {
			throw new Error(t("subscription.downgrade.memberRemovalFailed", { email: member.email }), { cause: error });
		}
		const response = await subscribe(planSlug, {
			returnUrl: `${getComfyPlatformBaseUrl()}/payment/success`,
			cancelUrl: `${getComfyPlatformBaseUrl()}/payment/failed`
		});
		if (!response) throw new Error(membersToRemove.length > 0 ? t("subscription.downgrade.failedAfterMemberRemoval") : t("subscription.downgrade.failed"));
		if (response.status === "needs_payment_method") {
			if (!response.payment_method_url) throw new Error(t("subscription.downgrade.paymentMethodRequired"));
			if (!window.open(response.payment_method_url, "_blank")) throw new Error(t("subscription.downgrade.paymentPageBlocked"));
			billingOperationStore.startOperation(response.billing_op_id, "subscription");
			return;
		}
		if (response.status === "pending_payment") billingOperationStore.startOperation(response.billing_op_id, "subscription");
	}
	return {
		removableMembers,
		hasOtherMembers,
		refreshMembers,
		downgradeToPersonal
	};
}
//#endregion
export { useDowngradeToPersonal };

//# sourceMappingURL=useDowngradeToPersonal-BooF-7jm.js.map