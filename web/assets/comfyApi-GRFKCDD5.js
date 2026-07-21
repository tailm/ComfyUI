import "./rolldown-runtime-w0pxe0c8.js";
import { a as remoteConfig, r as configValueOrDefault } from "./remoteConfig-0E2rLe-N.js";
//#region src/config/comfyApi.ts
var STAGING_API_BASE_URL = "https://stagingapi.comfy.org";
var STAGING_PLATFORM_BASE_URL = "https://stagingplatform.comfy.org";
var BUILD_TIME_API_BASE_URL = STAGING_API_BASE_URL;
var BUILD_TIME_PLATFORM_BASE_URL = STAGING_PLATFORM_BASE_URL;
function getComfyApiBaseUrl() {
	return configValueOrDefault(remoteConfig.value, "comfy_api_base_url", BUILD_TIME_API_BASE_URL);
}
function getComfyPlatformBaseUrl() {
	return configValueOrDefault(remoteConfig.value, "comfy_platform_base_url", BUILD_TIME_PLATFORM_BASE_URL);
}
//#endregion
export { getComfyPlatformBaseUrl as n, getComfyApiBaseUrl as t };

//# sourceMappingURL=comfyApi-GRFKCDD5.js.map