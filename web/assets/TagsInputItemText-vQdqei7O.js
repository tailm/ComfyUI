import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Bt as unref, C as withModifiers, F as createPropsRestProxy, K as inject, M as createBlock, N as createCommentVNode, P as createElementBlock, S as withKeys, V as defineComponent, X as nextTick, Y as mergeProps, bt as withCtx, et as onMounted, it as provide, j as createBaseVNode, jt as ref, ot as renderSlot, rt as openBlock, tt as onUnmounted } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { l as onClickOutside, m as useCurrentElement } from "./vendor-vueuse-D8rwdKM0.js";
import { Lt as useForwardPropsEmits, Rt as useForwardProps, c as TagsInputItem_default$1, l as TagsInputInput_default$1, o as TagsInputItemText_default$1, s as TagsInputItemDelete_default$1, u as TagsInputRoot_default, zt as useForwardExpose } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-3J7AEIG_.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
//#region src/components/ui/tags-input/tagsInputContext.ts
var tagsInputFocusKey = Symbol("tagsInputFocus");
var tagsInputIsEditingKey = Symbol("tagsInputIsEditing");
//#endregion
//#region src/components/ui/tags-input/TagsInput.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	"aria-hidden": "true",
	class: "absolute right-2 bottom-2 icon-[lucide--square-pen] size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
};
//#endregion
//#region src/components/ui/tags-input/TagsInput.vue
var TagsInput_default = /* @__PURE__ */ defineComponent({
	__name: "TagsInput",
	props: {
		modelValue: {},
		defaultValue: {},
		addOnPaste: { type: Boolean },
		addOnTab: { type: Boolean },
		addOnBlur: { type: Boolean },
		duplicate: { type: Boolean },
		disabled: {
			type: Boolean,
			default: false
		},
		delimiter: {},
		dir: {},
		max: {},
		id: {},
		convertValue: { type: Function },
		displayValue: { type: Function },
		asChild: { type: Boolean },
		as: {},
		name: {},
		required: { type: Boolean },
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		alwaysEditing: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"update:modelValue",
		"invalid",
		"addTag",
		"removeTag"
	],
	setup(__props, { emit: __emit }) {
		const restProps = createPropsRestProxy(__props, [
			"disabled",
			"alwaysEditing",
			"class"
		]);
		const emits = __emit;
		const isEditing = ref(false);
		const rootEl = useCurrentElement();
		const focusInput = ref();
		provide(tagsInputFocusKey, (callback) => {
			focusInput.value = callback;
		});
		const isEditingEnabled = computed(() => __props.alwaysEditing || isEditing.value);
		provide(tagsInputIsEditingKey, isEditingEnabled);
		const internalDisabled = computed(() => __props.disabled || !isEditingEnabled.value);
		const forwarded = useForwardPropsEmits(computed(() => ({
			...restProps,
			disabled: internalDisabled.value
		})), emits);
		async function enableEditing() {
			if (!__props.disabled && !__props.alwaysEditing && !isEditing.value) {
				isEditing.value = true;
				await nextTick();
				focusInput.value?.();
			}
		}
		onClickOutside(rootEl, () => {
			if (!__props.alwaysEditing) isEditing.value = false;
		});
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(TagsInputRoot_default), mergeProps(unref(forwarded), {
				class: unref(cn)("group relative flex flex-wrap items-center gap-2 rounded-lg bg-transparent p-2 text-xs text-base-foreground", !internalDisabled.value && "focus-within:bg-modal-card-background-hovered hover:bg-modal-card-background-hovered", !__props.disabled && !isEditingEnabled.value && "cursor-pointer", __props.class),
				onClick: enableEditing
			}), {
				default: withCtx(({ modelValue }) => [renderSlot(_ctx.$slots, "default", { isEmpty: modelValue.length === 0 }), !__props.disabled && !isEditingEnabled.value ? (openBlock(), createElementBlock("i", _hoisted_1)) : createCommentVNode("", true)]),
				_: 3
			}, 16, ["class"]);
		};
	}
});
//#endregion
//#region src/components/ui/tags-input/TagsInputInput.vue
var TagsInputInput_default = /* @__PURE__ */ defineComponent({
	__name: "TagsInputInput",
	props: {
		placeholder: {},
		autoFocus: { type: Boolean },
		maxLength: {},
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] },
		isEmpty: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const forwardedProps = useForwardProps(createPropsRestProxy(__props, ["isEmpty", "class"]));
		const isEditing = inject(tagsInputIsEditingKey, ref(true));
		const showInput = computed(() => isEditing.value || __props.isEmpty);
		const { forwardRef, currentElement } = useForwardExpose();
		const registerFocus = inject(tagsInputFocusKey, void 0);
		function handleEscape() {
			currentElement.value?.blur();
			isEditing.value = false;
		}
		onMounted(() => {
			registerFocus?.(() => currentElement.value?.focus());
		});
		onUnmounted(() => {
			registerFocus?.(void 0);
		});
		return (_ctx, _cache) => {
			return showInput.value ? (openBlock(), createBlock(unref(TagsInputInput_default$1), mergeProps({
				key: 0,
				ref: unref(forwardRef)
			}, unref(forwardedProps), {
				class: unref(cn)("min-h-6 flex-1 appearance-none border-none bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground focus:outline-none", !unref(isEditing) && "pointer-events-none", __props.class),
				onKeydown: withKeys(withModifiers(handleEscape, ["stop"]), ["escape"])
			}), null, 16, ["class", "onKeydown"])) : createCommentVNode("", true);
		};
	}
});
//#endregion
//#region src/components/ui/tags-input/TagsInputItem.vue
var TagsInputItem_default = /* @__PURE__ */ defineComponent({
	__name: "TagsInputItem",
	props: {
		value: {},
		disabled: { type: Boolean },
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(__props) {
		const forwardedProps = useForwardProps(createPropsRestProxy(__props, ["class"]));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(TagsInputItem_default$1), mergeProps(unref(forwardedProps), { class: unref(cn)("flex h-6 items-center gap-1 rounded-sm bg-modal-card-tag-background py-1 pr-1 pl-2 text-modal-card-tag-foreground ring-offset-base-background backdrop-blur-sm data-[state=active]:ring-2 data-[state=active]:ring-base-foreground data-[state=active]:ring-offset-1", __props.class) }), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
				_: 3
			}, 16, ["class"]);
		};
	}
});
//#endregion
//#region src/components/ui/tags-input/TagsInputItemDelete.vue
var TagsInputItemDelete_default = /* @__PURE__ */ defineComponent({
	__name: "TagsInputItemDelete",
	props: {
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(__props) {
		const forwardedProps = useForwardProps(createPropsRestProxy(__props, ["class"]));
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(TagsInputItemDelete_default$1), mergeProps(unref(forwardedProps), {
				as: Button_default,
				variant: "textonly",
				size: "icon-sm",
				"aria-label": unref(t)("g.removeTag"),
				class: unref(cn)("w-4 overflow-hidden opacity-60 transition-[opacity,width] duration-150 hover:bg-transparent hover:opacity-100 data-disabled:pointer-events-none data-disabled:w-0 data-disabled:opacity-0", __props.class)
			}), {
				default: withCtx(() => [renderSlot(_ctx.$slots, "default", {}, () => [_cache[0] || (_cache[0] = createBaseVNode("i", { class: "icon-[lucide--x] size-4" }, null, -1))])]),
				_: 3
			}, 16, ["aria-label", "class"]);
		};
	}
});
//#endregion
//#region src/components/ui/tags-input/TagsInputItemText.vue
var TagsInputItemText_default = /* @__PURE__ */ defineComponent({
	__name: "TagsInputItemText",
	props: {
		asChild: { type: Boolean },
		as: {},
		class: { type: [
			Boolean,
			null,
			String,
			Object,
			Array
		] }
	},
	setup(__props) {
		const forwardedProps = useForwardProps(createPropsRestProxy(__props, ["class"]));
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(TagsInputItemText_default$1), mergeProps(unref(forwardedProps), { class: unref(cn)("bg-transparent text-xs", __props.class) }), null, 16, ["class"]);
		};
	}
});
//#endregion
export { TagsInput_default as a, TagsInputInput_default as i, TagsInputItemDelete_default as n, TagsInputItem_default as r, TagsInputItemText_default as t };

//# sourceMappingURL=TagsInputItemText-vQdqei7O.js.map