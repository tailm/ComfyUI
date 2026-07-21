import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, jt as ref } from "./vendor-vue-core-ywZ1En3W.js";
import "./api-vRWcNBJQ.js";
//#region src/scripts/pointsApi.ts
var PointsApi = class {
	baseUrl;
	constructor(baseUrl = "") {
		this.baseUrl = baseUrl;
	}
	async getBalance() {
		const res = await fetch(`${this.baseUrl}/api/points/accounts/balance`);
		if (res.status !== 200) throw new Error(`Failed to get balance: ${res.status}`);
		return await res.json();
	}
	async validatePoints(userId) {
		const res = await fetch(`${this.baseUrl}/api/points/accounts/validate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId })
		});
		if (res.status !== 200) throw new Error(`Failed to validate points: ${res.status}`);
		return await res.json();
	}
	async deductPoints(userId, duration) {
		const res = await fetch(`${this.baseUrl}/api/points/accounts/deduct`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId,
				duration
			})
		});
		if (res.status !== 200) throw new Error(`Failed to deduct points: ${res.status}`);
		return await res.json();
	}
	async createRechargeOrder(userId, amount, paymentMethod) {
		const res = await fetch(`${this.baseUrl}/api/points/recharge/orders`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId,
				amount,
				paymentMethod
			})
		});
		if (res.status !== 200) throw new Error(`Failed to create recharge order: ${res.status}`);
		return await res.json();
	}
};
var pointsApi = new PointsApi();
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.pointsApi = window.comfyAPI.pointsApi || {};
window.comfyAPI.pointsApi.PointsApi = PointsApi;
window.comfyAPI.pointsApi.pointsApi = pointsApi;
//#endregion
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

//# sourceMappingURL=usePoints-CMy1xCXO.js.map