import "./rolldown-runtime-w0pxe0c8.js";
import { jt as ref } from "./vendor-vue-core-ywZ1En3W.js";
import { n as pointsApi } from "./pointsApi-BtUVnmG2.js";
//#region src/composables/points/usePointsStats.ts
function usePointsStats() {
	const stats = ref({
		balance: 0,
		totalEarned: 0,
		totalConsumed: 0
	});
	const loading = ref(false);
	const error = ref(null);
	async function fetchStats() {
		loading.value = true;
		error.value = null;
		try {
			stats.value = await pointsApi.getStats();
		} catch (e) {
			error.value = e instanceof Error ? e.message : "Failed to fetch stats";
		} finally {
			loading.value = false;
		}
	}
	return {
		stats,
		loading,
		error,
		fetchStats
	};
}
//#endregion
export { usePointsStats as t };

//# sourceMappingURL=usePointsStats-DMd6O-zQ.js.map