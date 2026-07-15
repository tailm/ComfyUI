import "./rolldown-runtime-w0pxe0c8.js";
import { H as defineComponent, N as createBlock, it as openBlock, j as computed } from "./vendor-vue-core-D3WB7mNE.js";
import { t as TopbarBadge_default } from "./TopbarBadge-K3OBXOuv.js";
//#endregion
//#region src/components/topbar/CloudBadge.vue
var CloudBadge_default = /* @__PURE__ */ defineComponent({
	__name: "CloudBadge",
	props: {
		displayMode: { default: "full" },
		reverseOrder: { type: Boolean },
		noPadding: { type: Boolean },
		backgroundColor: { default: "var(--comfy-menu-bg)" }
	},
	setup(__props) {
		const cloudBadge = computed(() => ({
			icon: "icon-[lucide--cloud]",
			text: "Comfy Cloud"
		}));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(TopbarBadge_default, {
				badge: cloudBadge.value,
				"display-mode": __props.displayMode,
				"reverse-order": __props.reverseOrder,
				"no-padding": __props.noPadding,
				"background-color": __props.backgroundColor
			}, null, 8, [
				"badge",
				"display-mode",
				"reverse-order",
				"no-padding",
				"background-color"
			]);
		};
	}
});
//#endregion
export { CloudBadge_default as t };

//# sourceMappingURL=CloudBadge-CdweN2BG.js.map