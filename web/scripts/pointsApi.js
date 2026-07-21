// Shim for scripts/pointsApi.ts
console.warn('[ComfyUI Notice] "scripts/pointsApi.js" is an internal module, not part of the public API. Future updates may break this import.');
export const PointsApi = window.comfyAPI.pointsApi.PointsApi;
export const pointsApi = window.comfyAPI.pointsApi.pointsApi;
