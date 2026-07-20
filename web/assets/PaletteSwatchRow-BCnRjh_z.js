import "./rolldown-runtime-w0pxe0c8.js";
import { Bt as unref, C as withModifiers, J as mergeModels, N as createCommentVNode, P as createElementBlock, T as Fragment, V as defineComponent, Wt as normalizeStyle, at as renderList, ht as useTemplateRef, j as createBaseVNode, jt as ref, pt as useModel, rt as openBlock } from "./vendor-vue-core-ywZ1En3W.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { x as useEventListener } from "./vendor-vueuse-D8rwdKM0.js";
//#region src/composables/palette/usePaletteSwatchRow.ts
function usePaletteSwatchRow({ modelValue, container, picker }) {
	const pickerIndex = ref(null);
	function openPicker(i, e) {
		e.stopPropagation();
		pickerIndex.value = i;
		const el = picker.value;
		if (!el) return;
		el.value = modelValue.value[i] || "#ffffff";
		el.click();
	}
	function onPickerInput(e) {
		const v = e.target.value;
		if (pickerIndex.value === null) return;
		const next = modelValue.value.slice();
		next[pickerIndex.value] = v;
		modelValue.value = next;
	}
	function remove(i) {
		const next = modelValue.value.slice();
		next.splice(i, 1);
		modelValue.value = next;
	}
	function addColor() {
		modelValue.value = [...modelValue.value, "#ffffff"];
	}
	const drag = ref(null);
	function onPointerDown(i, e) {
		if (e.button !== 0) return;
		drag.value = {
			index: i,
			startX: e.clientX,
			startY: e.clientY,
			active: false
		};
	}
	useEventListener(document, "pointermove", (e) => {
		const d = drag.value;
		if (!d) return;
		if ((e.buttons & 1) === 0) {
			drag.value = null;
			return;
		}
		if (!d.active) {
			if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) < 4) return;
			d.active = true;
		}
		const rows = container.value?.querySelectorAll("[data-index]");
		if (!rows) return;
		for (const other of rows) {
			if (parseInt(other.dataset.index || "-1", 10) === d.index) continue;
			const r = other.getBoundingClientRect();
			if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6) {
				const oi = parseInt(other.dataset.index || "-1", 10);
				if (oi < 0) continue;
				const next = modelValue.value.slice();
				const [moved] = next.splice(d.index, 1);
				const insertAt = e.clientX > r.left + r.width / 2 ? oi + 1 : oi;
				next.splice(insertAt > d.index ? insertAt - 1 : insertAt, 0, moved);
				modelValue.value = next;
				drag.value = null;
				return;
			}
		}
	});
	useEventListener(document, "pointerup", () => {
		drag.value = null;
	});
	useEventListener(document, "pointercancel", () => {
		drag.value = null;
	});
	return {
		openPicker,
		onPickerInput,
		remove,
		addColor,
		onPointerDown
	};
}
//#endregion
//#region src/components/palette/PaletteSwatchRow.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = [
	"data-index",
	"data-hex",
	"title",
	"onClick",
	"onContextmenu",
	"onPointerdown"
];
var _hoisted_2 = ["title"];
//#endregion
//#region src/components/palette/PaletteSwatchRow.vue
var PaletteSwatchRow_default = /* @__PURE__ */ defineComponent({
	__name: "PaletteSwatchRow",
	props: /* @__PURE__ */ mergeModels({ max: { default: 5 } }, {
		"modelValue": { required: true },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		const { t } = useI18n();
		const container = useTemplateRef("container");
		const picker = useTemplateRef("picker");
		const { openPicker, onPickerInput, remove, addColor, onPointerDown } = usePaletteSwatchRow({
			modelValue,
			container,
			picker
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				ref_key: "container",
				ref: container,
				class: "flex flex-wrap items-center gap-1"
			}, [
				(openBlock(true), createElementBlock(Fragment, null, renderList(modelValue.value, (hex, i) => {
					return openBlock(), createElementBlock("div", {
						key: `${i}-${hex}`,
						"data-index": i,
						"data-hex": hex,
						class: "relative size-5 cursor-pointer rounded-sm border border-component-node-border",
						style: normalizeStyle({ background: hex }),
						title: unref(t)("palette.swatchTitle"),
						onClick: ($event) => unref(openPicker)(i, $event),
						onContextmenu: withModifiers(($event) => unref(remove)(i), ["prevent", "stop"]),
						onPointerdown: ($event) => unref(onPointerDown)(i, $event)
					}, null, 44, _hoisted_1);
				}), 128)),
				modelValue.value.length < __props.max ? (openBlock(), createElementBlock("button", {
					key: 0,
					type: "button",
					class: "h-5 rounded-sm border border-component-node-border bg-component-node-widget-background px-2 text-xs leading-none",
					title: unref(t)("palette.addColor"),
					onClick: _cache[0] || (_cache[0] = (...args) => unref(addColor) && unref(addColor)(...args))
				}, " + ", 8, _hoisted_2)) : createCommentVNode("", true),
				createBaseVNode("input", {
					ref_key: "picker",
					ref: picker,
					type: "color",
					class: "pointer-events-none absolute size-0 opacity-0",
					onInput: _cache[1] || (_cache[1] = (...args) => unref(onPickerInput) && unref(onPickerInput)(...args))
				}, null, 544)
			], 512);
		};
	}
});
//#endregion
export { PaletteSwatchRow_default as t };

//# sourceMappingURL=PaletteSwatchRow-BCnRjh_z.js.map