import "./rolldown-runtime-w0pxe0c8.js";
import { r as api } from "./api-Bz5NhLSR.js";
//#region src/scripts/pointsApi.ts
/**
* 积分系统API客户端
*/
var PointsApi = class {
	async getBalance() {
		const res = await api.fetchApi("/points/accounts/balance");
		if (res.status !== 200) throw new Error(`Failed to get balance: ${res.status}`);
		return await res.json();
	}
	async validatePoints(userId) {
		const res = await api.fetchApi("/points/accounts/validate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId })
		});
		if (res.status !== 200) throw new Error(`Failed to validate points: ${res.status}`);
		return await res.json();
	}
	async deductPoints(userId, duration) {
		const res = await api.fetchApi("/points/accounts/deduct", {
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
	async createRechargeOrder(amount, paymentMethod) {
		const res = await api.fetchApi("/points/recharge/orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				amount,
				paymentMethod
			})
		});
		if (res.status !== 200) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error || `Failed to create recharge order: ${res.status}`);
		}
		return await res.json();
	}
	async getOrderStatus(orderId) {
		const res = await api.fetchApi(`/points/recharge/order-status?orderId=${encodeURIComponent(orderId)}`);
		if (res.status !== 200) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error || `Failed to get order status: ${res.status}`);
		}
		return await res.json();
	}
	async getStats() {
		const res = await api.fetchApi("/points/accounts/stats");
		if (res.status !== 200) throw new Error(`Failed to get stats: ${res.status}`);
		return await res.json();
	}
	async getTransactions(params = {}) {
		const query = new URLSearchParams({
			page: String(params.page ?? 1),
			pageSize: String(params.pageSize ?? 10),
			type: params.type ?? "all"
		});
		const res = await api.fetchApi(`/points/transactions?${query}`);
		if (res.status !== 200) throw new Error(`Failed to get transactions: ${res.status}`);
		return await res.json();
	}
	async claimDailyPoints() {
		const res = await api.fetchApi("/points/accounts/claim-daily", { method: "POST" });
		if (res.status !== 200) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error || data.message || `Failed to claim daily points: ${res.status}`);
		}
		return await res.json();
	}
};
var pointsApi = new PointsApi();
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.pointsApi = window.comfyAPI.pointsApi || {};
window.comfyAPI.pointsApi.PointsApi = PointsApi;
window.comfyAPI.pointsApi.pointsApi = pointsApi;
//#endregion
export { pointsApi as n, PointsApi as t };

//# sourceMappingURL=pointsApi-BtUVnmG2.js.map