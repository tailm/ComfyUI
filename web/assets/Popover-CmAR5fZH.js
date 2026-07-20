import "./rolldown-runtime-w0pxe0c8.js";
import { Bt as unref, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, Y as mergeProps, at as renderList, bt as withCtx, j as createBaseVNode, jt as ref, ot as renderSlot, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { G as PopoverTrigger_default, K as PopoverPortal_default, Y as PopoverArrow_default, Z as PopoverRoot_default, q as PopoverContent_default } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { t as useModalLiftedZIndex } from "./useModalLiftedZIndex-C8CdtEh7.js";
//#region src/lib/litegraph/src/utils/mathParser.ts
function tokenize(input) {
	const tokens = [];
	const re = /(\d+(?:\.\d*)?|\.\d+)|([+\-*/%()])/g;
	let lastIndex = 0;
	for (const match of input.matchAll(re)) {
		if (input.slice(lastIndex, match.index).trim()) return void 0;
		lastIndex = match.index + match[0].length;
		if (match[1]) tokens.push({
			type: "number",
			value: parseFloat(match[1])
		});
		else tokens.push({
			type: "op",
			value: match[2]
		});
	}
	if (input.slice(lastIndex).trim()) return void 0;
	return tokens;
}
/**
* Evaluates a basic arithmetic expression string containing
* `+`, `-`, `*`, `/`, `%`, parentheses, and decimal numbers.
* Returns `undefined` for empty or malformed input.
*/
function evaluateMathExpression(input) {
	const tokenized = tokenize(input);
	if (!tokenized || tokenized.length === 0) return void 0;
	const tokens = tokenized;
	let pos = 0;
	let depth = 0;
	const MAX_DEPTH = 200;
	function peek() {
		return tokens[pos];
	}
	function consume() {
		return tokens[pos++];
	}
	function primary() {
		const t = peek();
		if (!t) return void 0;
		if (t.type === "number") {
			consume();
			return t.value;
		}
		if (t.type === "op" && t.value === "(") {
			if (++depth > MAX_DEPTH) return void 0;
			consume();
			const result = expr();
			if (result === void 0) return void 0;
			const closing = peek();
			if (!closing || closing.type !== "op" || closing.value !== ")") return;
			consume();
			depth--;
			return result;
		}
	}
	function unary() {
		const t = peek();
		if (t?.type === "op" && (t.value === "+" || t.value === "-")) {
			consume();
			const operand = unary();
			if (operand === void 0) return void 0;
			return t.value === "-" ? -operand : operand;
		}
		return primary();
	}
	function factor() {
		let left = unary();
		if (left === void 0) return void 0;
		while (peek()?.type === "op" && (peek().value === "*" || peek().value === "/" || peek().value === "%")) {
			const op = consume().value;
			const right = unary();
			if (right === void 0) return void 0;
			left = op === "*" ? left * right : op === "/" ? left / right : left % right;
		}
		return left;
	}
	function expr() {
		let left = factor();
		if (left === void 0) return void 0;
		while (peek()?.type === "op" && (peek().value === "+" || peek().value === "-")) {
			const op = consume().value;
			const right = factor();
			if (right === void 0) return void 0;
			left = op === "+" ? left + right : left - right;
		}
		return left;
	}
	const result = expr();
	if (result === void 0 || pos !== tokens.length) return void 0;
	return result === 0 ? 0 : result;
}
//#endregion
//#region src/lib/litegraph/src/utils/widget.ts
/**
* The step value for numeric widgets.
* Use {@link IWidgetOptions.step2} if available, otherwise fallback to
* {@link IWidgetOptions.step} which is scaled up by 10x in the legacy frontend logic.
*/
function getWidgetStep(options) {
	return options.step2 || (options.step || 10) * .1;
}
function evaluateInput(input) {
	const result = evaluateMathExpression(input);
	if (result !== void 0) {
		if (!isFinite(result)) return void 0;
		return result;
	}
	const newValue = Number(input);
	if (!isFinite(newValue)) return void 0;
	return newValue;
}
function resolveNodeRootGraphId(node, fallbackGraphId) {
	return node.graph?.rootGraph.id ?? fallbackGraphId;
}
//#endregion
//#region src/components/ui/Popover.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "flex flex-col p-1" };
var _hoisted_2 = {
	key: 0,
	class: "w-full border-b border-border-subtle"
};
var _hoisted_3 = ["onClick"];
//#endregion
//#region src/components/ui/Popover.vue
var Popover_default = /* @__PURE__ */ defineComponent({
	inheritAttrs: false,
	__name: "Popover",
	props: {
		entries: {},
		icon: {},
		to: {},
		showArrow: {
			type: Boolean,
			default: true
		}
	},
	setup(__props) {
		const open = ref(false);
		const contentStyle = useModalLiftedZIndex(open);
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(PopoverRoot_default), {
				open: open.value,
				"onUpdate:open": _cache[0] || (_cache[0] = ($event) => open.value = $event)
			}, {
				default: withCtx(({ close }) => [createVNode(unref(PopoverTrigger_default), { "as-child": "" }, {
					default: withCtx(() => [renderSlot(_ctx.$slots, "button", {}, () => [createVNode(Button_default, { size: "icon" }, {
						default: withCtx(() => [createBaseVNode("i", { class: normalizeClass(__props.icon ?? "icon-[lucide--ellipsis]") }, null, 2)]),
						_: 1
					})])]),
					_: 3
				}), createVNode(unref(PopoverPortal_default), { to: __props.to }, {
					default: withCtx(() => [createVNode(unref(PopoverContent_default), mergeProps({
						side: "bottom",
						"side-offset": 5,
						"collision-padding": 10
					}, _ctx.$attrs, {
						style: unref(contentStyle),
						class: "data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade z-1700 rounded-lg border border-border-subtle bg-base-background p-2 shadow-sm will-change-[transform,opacity]"
					}), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default", { close }, () => [createBaseVNode("div", _hoisted_1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.entries ?? [], (item) => {
							return openBlock(), createElementBlock(Fragment, { key: item.label }, [item.separator ? (openBlock(), createElementBlock("div", _hoisted_2)) : (openBlock(), createElementBlock("div", {
								key: 1,
								class: normalizeClass(unref(cn)("my-1 flex flex-row gap-4 rounded-sm p-2", item.disabled ? "pointer-events-none opacity-50" : item.command && "cursor-pointer hover:bg-secondary-background-hover")),
								onClick: (e) => {
									if (!item.command || item.disabled) return;
									item.command({
										originalEvent: e,
										item
									});
									close();
								}
							}, [item.icon ? (openBlock(), createElementBlock("i", {
								key: 0,
								class: normalizeClass(item.icon)
							}, null, 2)) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(item.label), 1)], 10, _hoisted_3))], 64);
						}), 128))])]), __props.showArrow ? (openBlock(), createBlock(unref(PopoverArrow_default), {
							key: 0,
							class: "fill-base-background stroke-border-subtle"
						})) : createCommentVNode("", true)]),
						_: 2
					}, 1040, ["style"])]),
					_: 2
				}, 1032, ["to"])]),
				_: 3
			}, 8, ["open"]);
		};
	}
});
//#endregion
export { resolveNodeRootGraphId as i, evaluateInput as n, getWidgetStep as r, Popover_default as t };

//# sourceMappingURL=Popover-CmAR5fZH.js.map