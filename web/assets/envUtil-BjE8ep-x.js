import "./rolldown-runtime-w0pxe0c8.js";
import { n as isDesktop } from "./types-4cVPtFn2.js";
//#region src/utils/envUtil.ts
function electronAPI() {
	return window.electronAPI;
}
function showNativeSystemMenu() {
	electronAPI()?.showContextMenu();
}
function isNativeWindow() {
	return isDesktop && !!window.navigator.windowControlsOverlay?.visible;
}
//#endregion
export { isNativeWindow as n, showNativeSystemMenu as r, electronAPI as t };

//# sourceMappingURL=envUtil-BjE8ep-x.js.map