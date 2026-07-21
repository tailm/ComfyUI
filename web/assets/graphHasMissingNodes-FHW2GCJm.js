import "./rolldown-runtime-w0pxe0c8.js";
import { Bt as unref, F as createPropsRestProxy, M as createBlock, V as defineComponent, Y as mergeProps, bt as withCtx, ot as renderSlot, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
import { to as collectAllNodes } from "./promotionUtils-B4DSH7RT.js";
import { Ft as Primitive, Rt as useForwardProps } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-CAuVu1U5.js";
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

//# sourceMappingURL=graphHasMissingNodes-FHW2GCJm.js.map