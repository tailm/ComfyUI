import "./rolldown-runtime-w0pxe0c8.js";
//#region src/renderer/three/WebGLViewport.ts
var WebGLViewport = class {
	renderer;
	resizeObserver = null;
	constructor(renderer) {
		this.renderer = renderer;
	}
	observeResize(target, onResize) {
		if (typeof ResizeObserver === "undefined") return;
		this.resizeObserver?.disconnect();
		this.resizeObserver = new ResizeObserver(() => onResize());
		this.resizeObserver.observe(target);
	}
	disposeRenderer() {
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.renderer.forceContextLoss();
		this.renderer.domElement.dispatchEvent(new Event("webglcontextlost", {
			bubbles: true,
			cancelable: true
		}));
		this.renderer.dispose();
		this.renderer.domElement.remove();
	}
};
//#endregion
export { WebGLViewport as t };

//# sourceMappingURL=WebGLViewport-BUp5jTgC.js.map