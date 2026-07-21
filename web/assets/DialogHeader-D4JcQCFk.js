import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Bt as unref, F as createPropsRestProxy, Gt as toDisplayString, Ht as normalizeClass, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, Rt as toValue, U as guardReactiveProps, Ut as normalizeProps, V as defineComponent, Y as mergeProps, bt as withCtx, j as createBaseVNode, ot as renderSlot, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { O as cva } from "./vendor-other-DslE47pR.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { At as DialogRoot_default, Ct as DialogTitle_default$1, Dt as DialogContent_default$1, It as Presence_default, Lt as useForwardPropsEmits, Tt as DialogOverlay_default$1, jt as injectDialogRootContext, kt as DialogClose_default$1, wt as DialogPortal_default$1 } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as Button_default } from "./Button-BOAvjEOG.js";
import { t as useDialogStore } from "./dialogStore-B5tjby6O.js";
//#region src/components/dialog/confirm/ConfirmBody.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "flex flex-col border-t border-border-default px-4 py-2 text-sm wrap-break-word text-muted-foreground" };
//#endregion
//#region src/components/dialog/confirm/ConfirmBody.vue
var ConfirmBody_default = /* @__PURE__ */ defineComponent({
	__name: "ConfirmBody",
	props: {
		promptText: {},
		preserveNewlines: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const promptTextReal = computed(() => toValue(__props.promptText));
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$3, [promptTextReal.value ? (openBlock(), createElementBlock("p", {
				key: 0,
				class: normalizeClass(__props.preserveNewlines && "whitespace-pre-line")
			}, toDisplayString(promptTextReal.value), 3)) : createCommentVNode("", true)]);
		};
	}
});
//#endregion
//#region src/components/dialog/confirm/ConfirmFooter.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "flex w-full flex-wrap justify-end gap-2 px-2 pb-2" };
//#endregion
//#region src/components/dialog/confirm/ConfirmFooter.vue
var ConfirmFooter_default = /* @__PURE__ */ defineComponent({
	__name: "ConfirmFooter",
	props: {
		cancelText: {},
		confirmText: {},
		confirmClass: {},
		confirmVariant: {},
		optionsDisabled: {}
	},
	emits: ["cancel", "confirm"],
	setup(__props) {
		const { t } = useI18n();
		const confirmTextX = computed(() => __props.confirmText || t("g.confirm"));
		const cancelTextX = computed(() => __props.cancelText || t("g.cancel"));
		const disabled = computed(() => toValue(__props.optionsDisabled));
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("section", _hoisted_1$2, [createVNode(Button_default, {
				disabled: disabled.value,
				variant: "textonly",
				autofocus: "",
				onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("cancel"))
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(cancelTextX.value), 1)]),
				_: 1
			}, 8, ["disabled"]), createVNode(Button_default, {
				disabled: disabled.value,
				variant: __props.confirmVariant ?? "textonly",
				class: normalizeClass(__props.confirmClass),
				onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("confirm"))
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(confirmTextX.value), 1)]),
				_: 1
			}, 8, [
				"disabled",
				"variant",
				"class"
			])]);
		};
	}
});
//#endregion
//#region src/components/dialog/confirm/ConfirmHeader.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex items-center gap-2 p-4 font-inter text-sm font-bold text-base-foreground" };
var _hoisted_2 = {
	key: 1,
	class: "flex-auto"
};
//#endregion
//#region src/components/dialog/confirm/ConfirmHeader.vue
var ConfirmHeader_default = /* @__PURE__ */ defineComponent({
	__name: "ConfirmHeader",
	props: {
		title: {},
		icon: {}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [__props.icon ? (openBlock(), createElementBlock("i", {
				key: 0,
				class: normalizeClass(unref(cn)(__props.icon, "size-4")),
				"aria-hidden": "true"
			}, null, 2)) : createCommentVNode("", true), __props.title ? (openBlock(), createElementBlock("span", _hoisted_2, toDisplayString(__props.title), 1)) : createCommentVNode("", true)]);
		};
	}
});
//#endregion
//#region src/components/dialog/confirm/confirmDialog.ts
function showConfirmDialog(options = {}) {
	const dialogStore = useDialogStore();
	const { key, headerProps, props, footerProps } = options;
	return dialogStore.showDialog({
		key,
		headerComponent: ConfirmHeader_default,
		component: ConfirmBody_default,
		footerComponent: ConfirmFooter_default,
		headerProps,
		props,
		footerProps,
		dialogComponentProps: {
			renderer: "reka",
			size: "md",
			headerClass: "p-0",
			bodyClass: "p-0",
			footerClass: "p-0"
		}
	});
}
//#endregion
//#region src/components/ui/dialog/Dialog.vue
var Dialog_default = /* @__PURE__ */ defineComponent({
	__name: "Dialog",
	props: {
		open: { type: Boolean },
		defaultOpen: { type: Boolean },
		modal: { type: Boolean }
	},
	emits: ["update:open"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(DialogRoot_default), mergeProps(props, { "onUpdate:open": _cache[0] || (_cache[0] = (open) => emit("update:open", open)) }), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
				_: 3
			}, 16);
		};
	}
});
//#endregion
//#region src/components/ui/dialog/dialog.variants.ts
var dialogContentVariants = cva({
	base: "fixed z-1700 flex flex-col rounded-lg border border-border-subtle bg-base-background shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
	variants: {
		size: {
			sm: "sm:max-w-sm",
			md: "sm:max-w-xl",
			lg: "sm:max-w-3xl",
			xl: "sm:max-w-5xl",
			full: "sm:max-w-[calc(100vw-1rem)]"
		},
		maximized: {
			true: "inset-2 top-2 left-2 size-auto max-h-none max-w-none sm:max-w-none",
			false: "top-1/2 left-1/2 max-h-[85vh] w-[calc(100vw-1rem)] -translate-1/2"
		}
	},
	defaultVariants: {
		size: "md",
		maximized: false
	}
});
//#endregion
//#region src/components/ui/dialog/DialogContent.vue
var DialogContent_default = /* @__PURE__ */ defineComponent({
	__name: "DialogContent",
	props: {
		forceMount: { type: Boolean },
		disableOutsidePointerEvents: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		size: {},
		maximized: {
			type: Boolean,
			default: false
		},
		class: {
			type: [
				Boolean,
				null,
				String,
				Object,
				Array
			],
			default: ""
		}
	},
	emits: [
		"escapeKeyDown",
		"pointerDownOutside",
		"focusOutside",
		"interactOutside",
		"openAutoFocus",
		"closeAutoFocus"
	],
	setup(__props, { emit: __emit }) {
		const forwarded = useForwardPropsEmits(createPropsRestProxy(__props, [
			"size",
			"maximized",
			"class"
		]), __emit);
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(DialogContent_default$1), mergeProps(unref(forwarded), { class: unref(cn)(unref(dialogContentVariants)({
				size: __props.size,
				maximized: __props.maximized
			}), __props.class, __props.maximized && "size-auto max-h-none max-w-none sm:max-w-none") }), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
				_: 3
			}, 16, ["class"]);
		};
	}
});
//#endregion
//#region src/components/ui/dialog/DialogOverlay.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = ["data-state"];
var overlayClass = "fixed inset-0 z-1700 bg-black/70 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0";
//#endregion
//#region src/components/ui/dialog/DialogOverlay.vue
var DialogOverlay_default = /* @__PURE__ */ defineComponent({
	__name: "DialogOverlay",
	props: {
		forceMount: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: {
			type: [
				Boolean,
				null,
				String,
				Object,
				Array
			],
			default: ""
		}
	},
	setup(__props) {
		const delegated = createPropsRestProxy(__props, ["class"]);
		const rootContext = injectDialogRootContext();
		return (_ctx, _cache) => {
			return unref(rootContext).modal.value ? (openBlock(), createBlock(unref(DialogOverlay_default$1), mergeProps({ key: 0 }, delegated, {
				"data-testid": "dialog-overlay",
				class: unref(cn)(overlayClass, __props.class)
			}), null, 16, ["class"])) : (openBlock(), createBlock(unref(Presence_default), {
				key: 1,
				present: delegated.forceMount || unref(rootContext).open.value
			}, {
				default: withCtx(() => [createBaseVNode("div", {
					"data-state": unref(rootContext).open.value ? "open" : "closed",
					"data-testid": "dialog-overlay",
					class: normalizeClass(unref(cn)(overlayClass, __props.class))
				}, null, 10, _hoisted_1)]),
				_: 1
			}, 8, ["present"]));
		};
	}
});
//#endregion
//#region src/components/ui/dialog/DialogPortal.vue
var DialogPortal_default = /* @__PURE__ */ defineComponent({
	__name: "DialogPortal",
	props: {
		to: {},
		disabled: { type: Boolean },
		defer: { type: Boolean },
		forceMount: { type: Boolean }
	},
	setup(__props) {
		const props = __props;
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(DialogPortal_default$1), normalizeProps(guardReactiveProps(props)), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
				_: 3
			}, 16);
		};
	}
});
//#endregion
//#region src/components/ui/dialog/DialogTitle.vue
var DialogTitle_default = /* @__PURE__ */ defineComponent({
	__name: "DialogTitle",
	props: {
		asChild: { type: Boolean },
		as: {},
		class: {
			type: [
				Boolean,
				null,
				String,
				Object,
				Array
			],
			default: ""
		}
	},
	setup(__props) {
		const delegated = createPropsRestProxy(__props, ["class"]);
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(DialogTitle_default$1), mergeProps(delegated, { class: unref(cn)("text-base font-semibold text-base-foreground", __props.class) }), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
				_: 3
			}, 16, ["class"]);
		};
	}
});
//#endregion
//#region src/utils/dateTimeUtil.ts
var isoFractionalSecondsPattern = /\.(\d+)(?=Z|[+-]\d{2}:?\d{2}|$)/;
/**
* Parse an ISO 8601 date string tolerantly. Some JavaScript Date parsers reject
* fractional seconds unless they are exactly 3 digits, which turns values like
* "2026-04-18T10:04:55.6Z" or "2026-04-18T10:04:55.6513Z" into Invalid Date.
* This helper normalizes the fractional portion to millisecond precision first.
*
* @returns Parsed Date, or null if the string is missing or unparseable.
*/
function parseIsoDateSafe(input) {
	if (!input) return null;
	const normalized = input.replace(isoFractionalSecondsPattern, (_, fractionalSeconds) => `.${fractionalSeconds.slice(0, 3).padEnd(3, "0")}`);
	const date = new Date(normalized);
	return Number.isNaN(date.getTime()) ? null : date;
}
/**
* Return a local date key in YYYY-MM-DD format for grouping.
*
* @param ts Unix timestamp in milliseconds
* @returns Local date key string
*/
var dateKey = (ts) => {
	const d = new Date(ts);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
/**
* Check if a timestamp is on the same local day as today.
*
* @param ts Unix timestamp in milliseconds
* @returns True if today
*/
var isToday = (ts) => {
	const d = new Date(ts);
	const now = /* @__PURE__ */ new Date();
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};
/**
* Check if a timestamp corresponds to yesterday in local time.
*
* @param ts Unix timestamp in milliseconds
* @returns True if yesterday
*/
var isYesterday = (ts) => {
	const d = new Date(ts);
	const now = /* @__PURE__ */ new Date();
	const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
	return d.getFullYear() === yest.getFullYear() && d.getMonth() === yest.getMonth() && d.getDate() === yest.getDate();
};
/**
* Localized short month + day label, e.g. "Jan 2".
*
* @param ts Unix timestamp in milliseconds
* @param locale BCP-47 locale string
* @returns Localized month/day label
*/
var formatShortMonthDay = (ts, locale) => {
	const d = new Date(ts);
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		day: "numeric"
	}).format(d);
};
/**
* Localized clock time, e.g. "10:05:06" with locale defaults for 12/24 hour.
*
* @param ts Unix timestamp in milliseconds
* @param locale BCP-47 locale string
* @returns Localized time string
*/
var formatClockTime = (ts, locale) => {
	const d = new Date(ts);
	return new Intl.DateTimeFormat(locale, {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit"
	}).format(d);
};
//#endregion
//#region src/components/ui/dialog/DialogClose.vue
var DialogClose_default = /* @__PURE__ */ defineComponent({
	__name: "DialogClose",
	setup(__props) {
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(DialogClose_default$1), { "as-child": "" }, {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default", {}, () => [createVNode(Button_default, {
					"aria-label": unref(t)("g.close"),
					size: "icon",
					variant: "muted-textonly"
				}, {
					default: withCtx(() => [..._cache[0] || (_cache[0] = [createBaseVNode("i", { class: "icon-[lucide--x]" }, null, -1)])]),
					_: 1
				}, 8, ["aria-label"])])]),
				_: 3
			});
		};
	}
});
//#endregion
//#region src/components/ui/dialog/DialogHeader.vue
var DialogHeader_default = /* @__PURE__ */ defineComponent({
	__name: "DialogHeader",
	props: { class: {
		type: [
			Boolean,
			null,
			String,
			Object,
			Array
		],
		default: ""
	} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(unref(cn)("flex shrink-0 items-center justify-between gap-2 px-4 pt-4 pb-2", __props.class)) }, [renderSlot(_ctx.$slots, "default")], 2);
		};
	}
});
//#endregion
export { formatShortMonthDay as a, parseIsoDateSafe as c, DialogOverlay_default as d, DialogContent_default as f, formatClockTime as i, DialogTitle_default as l, showConfirmDialog as m, DialogClose_default as n, isToday as o, Dialog_default as p, dateKey as r, isYesterday as s, DialogHeader_default as t, DialogPortal_default as u };

//# sourceMappingURL=DialogHeader-D4JcQCFk.js.map