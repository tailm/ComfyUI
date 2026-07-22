import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Gt as toDisplayString, P as createElementBlock, V as defineComponent, Wt as normalizeStyle, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
//#endregion
//#region src/platform/workspace/components/WorkspaceProfilePic.vue
var WorkspaceProfilePic_default = /* @__PURE__ */ defineComponent({
	__name: "WorkspaceProfilePic",
	props: { workspaceName: {} },
	setup(__props) {
		const letter = computed(() => __props.workspaceName?.charAt(0)?.toUpperCase() ?? "?");
		const gradient = computed(() => {
			const seed = letter.value.charCodeAt(0);
			function mulberry32(a) {
				return function() {
					let t = a += 1831565813;
					t = Math.imul(t ^ t >>> 15, t | 1);
					t ^= t + Math.imul(t ^ t >>> 7, t | 61);
					return ((t ^ t >>> 14) >>> 0) / 4294967296;
				};
			}
			const rand = mulberry32(seed);
			const hue1 = Math.floor(rand() * 360);
			const hue2 = (hue1 + 40 + Math.floor(rand() * 80)) % 360;
			const sat = 65 + Math.floor(rand() * 20);
			const light = 55 + Math.floor(rand() * 15);
			return `linear-gradient(135deg, hsl(${hue1}, ${sat}%, ${light}%), hsl(${hue2}, ${sat}%, ${light}%))`;
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				class: "flex aspect-square size-8 items-center justify-center rounded-md text-base font-semibold text-white",
				style: normalizeStyle({
					background: gradient.value,
					textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)"
				})
			}, toDisplayString(letter.value), 5);
		};
	}
});
//#endregion
export { WorkspaceProfilePic_default as t };

//# sourceMappingURL=WorkspaceProfilePic-CS8eXxuJ.js.map