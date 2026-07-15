import "./rolldown-runtime-w0pxe0c8.js";
import { H as defineComponent, I as createPropsRestProxy, N as createBlock, Vt as unref, X as mergeProps, it as openBlock, st as renderSlot, xt as withCtx } from "./vendor-vue-core-D3WB7mNE.js";
import { ko as collectAllNodes } from "./promotionUtils-vKoNYnM9.js";
import { Bt as useForwardProps, Lt as Primitive } from "./vendor-reka-ui-3rzHRTLU.js";
import { t as cn } from "./src-CDgHMYTj.js";
//#endregion
//#region src/components/ui/button-group/ButtonGroup.vue
var ButtonGroup_default = /* @__PURE__ */ defineComponent({
	__name: "ButtonGroup",
	props: {
		class: {
			type: [
				Boolean,
				null,
				String,
				Object,
				Array
			],
			default: ""
		},
		asChild: { type: Boolean },
		as: { default: "div" }
	},
	setup(__props) {
		const forwardedProps = useForwardProps(createPropsRestProxy(__props, ["as", "class"]));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(Primitive), mergeProps(unref(forwardedProps), {
				as: __props.as,
				class: unref(cn)("inline-flex items-stretch overflow-hidden rounded-md", __props.class)
			}), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
				_: 3
			}, 16, ["as", "class"]);
		};
	}
});
//#endregion
//#region src/workbench/extensions/manager/utils/graphHasMissingNodes.ts
var isNodeMissingDefinition = (node, nodeDefsByName) => {
	const nodeName = node?.type;
	if (!nodeName) return false;
	return !nodeDefsByName[nodeName];
};
var collectMissingNodes = (graph, nodeDefsByName) => {
	if (!graph) return [];
	const lookup = unref(nodeDefsByName);
	return collectAllNodes(graph, (node) => isNodeMissingDefinition(node, lookup));
};
var graphHasMissingNodes = (graph, nodeDefsByName) => {
	return collectMissingNodes(graph, nodeDefsByName).length > 0;
};
//#endregion
export { ButtonGroup_default as n, graphHasMissingNodes as t };

//# sourceMappingURL=graphHasMissingNodes-BlFtKDC_.js.map