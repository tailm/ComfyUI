import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, jt as ref } from "./vendor-vue-core-ywZ1En3W.js";
import "./api-Bz5NhLSR.js";
import { n as pointsApi } from "./pointsApi-BtUVnmG2.js";
//#region src/composables/points/usePoints.ts
/**
* 积分系统Composable
*/
function usePoints() {
	const balance = ref(0);
	const loading = ref(false);
	const error = ref(null);
	const formattedBalance = computed(() => {
		return Math.round(balance.value).toString();
	});
	const isInsufficient = computed(() => {
		return balance.value < 0;
	});
	async function fetchBalance() {
		try {
			balance.value = (await pointsApi.getBalance()).balance;
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to fetch balance";
			console.error(error.value);
		}
	}
	function setBalance(newBalance) {
		balance.value = newBalance;
	}
	return {
		balance,
		loading,
		error,
		formattedBalance,
		isInsufficient,
		fetchBalance,
		setBalance
	};
}
//#endregion
export { usePoints as t };

//# sourceMappingURL=usePoints-Loly83vu.js.map