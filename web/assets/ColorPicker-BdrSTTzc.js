import "./rolldown-runtime-w0pxe0c8.js";
import { A as computed, Bt as unref, Gt as toDisplayString, Ht as normalizeClass, J as mergeModels, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, Wt as normalizeStyle, bt as withCtx, gt as watch, j as createBaseVNode, jt as ref, pt as useModel, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { $ as memoize } from "./vendor-other-DslE47pR.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { G as PopoverTrigger_default, K as PopoverPortal_default, Z as PopoverRoot_default, q as PopoverContent_default } from "./vendor-reka-ui-BL45aHvm.js";
import { t as cn } from "./src-CAuVu1U5.js";
import { t as useModalLiftedZIndex } from "./useModalLiftedZIndex-DKRRcl_q.js";
import { a as Select_default, i as SelectContent_default, n as SelectTrigger_default, r as SelectItem_default, t as SelectValue_default } from "./SelectValue-CrSaS-Kt.js";
//#region src/utils/colorUtil.ts
function isTransparent(color) {
	if (color === "transparent") return true;
	if (color[0] === "#") {
		if (color.length === 5) return color[4] === "0";
		if (color.length === 9) return color.substring(7) === "00";
	}
	return false;
}
function rgbToHsl({ r, g, b }) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > .5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return {
		h,
		s,
		l
	};
}
function hexToRgb(hex) {
	let r = 0;
	let g = 0;
	let b = 0;
	if (hex.length === 4 || hex.length === 5) {
		r = parseInt(hex[1] + hex[1], 16);
		g = parseInt(hex[2] + hex[2], 16);
		b = parseInt(hex[3] + hex[3], 16);
	} else if (hex.length === 7 || hex.length === 9) {
		r = parseInt(hex.slice(1, 3), 16);
		g = parseInt(hex.slice(3, 5), 16);
		b = parseInt(hex.slice(5, 7), 16);
	}
	return {
		r,
		g,
		b
	};
}
function hexToInt(hex) {
	const { r, g, b } = hexToRgb(hex);
	return r << 16 | g << 8 | b;
}
function rgbToHex({ r, g, b }) {
	const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function luminance({ r, g, b }) {
	return .299 * r + .587 * g + .114 * b;
}
function readableTextColor(hex) {
	const rgb = hexToRgb(hex);
	let { r, g, b } = rgb;
	const lum = luminance(rgb);
	const MIN = 130;
	if (lum < MIN) {
		const t = (MIN - lum) / (255 - lum);
		r = Math.round(r + (255 - r) * t);
		g = Math.round(g + (255 - g) * t);
		b = Math.round(b + (255 - b) * t);
	}
	return `rgb(${r},${g},${b})`;
}
function textOnColor(hex) {
	return luminance(hexToRgb(hex)) > 140 ? "#000" : "#fff";
}
function hsbToRgb({ h, s, b }) {
	const hh = (h % 360 + 360) % 360;
	const ss = Math.max(0, Math.min(100, s)) / 100;
	const vv = Math.max(0, Math.min(100, b)) / 100;
	const c = vv * ss;
	const x = c * (1 - Math.abs(hh / 60 % 2 - 1));
	const m = vv - c;
	let rp;
	let gp;
	let bp;
	if (hh < 60) {
		rp = c;
		gp = x;
		bp = 0;
	} else if (hh < 120) {
		rp = x;
		gp = c;
		bp = 0;
	} else if (hh < 180) {
		rp = 0;
		gp = c;
		bp = x;
	} else if (hh < 240) {
		rp = 0;
		gp = x;
		bp = c;
	} else if (hh < 300) {
		rp = x;
		gp = 0;
		bp = c;
	} else {
		rp = c;
		gp = 0;
		bp = x;
	}
	return {
		r: Math.floor((rp + m) * 255),
		g: Math.floor((gp + m) * 255),
		b: Math.floor((bp + m) * 255)
	};
}
/**
* Normalize various color inputs (hex, rgb/rgba, hsl/hsla, hsb string/object)
* into lowercase #rrggbb. Falls back to #000000 on invalid inputs.
*/
function parseToRgb(color) {
	const format = identifyColorFormat(color);
	if (!format) return {
		r: 0,
		g: 0,
		b: 0
	};
	const hsla = parseToHSLA(color, format);
	if (!isHSLA(hsla)) return {
		r: 0,
		g: 0,
		b: 0
	};
	const h = hsla.h / 360;
	const s = hsla.s / 100;
	const l = hsla.l / 100;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(h * 6 % 2 - 1));
	const m = l - c / 2;
	let r;
	let g;
	let b;
	if (h < 1 / 6) {
		r = c;
		g = x;
		b = 0;
	} else if (h < 2 / 6) {
		r = x;
		g = c;
		b = 0;
	} else if (h < 3 / 6) {
		r = 0;
		g = c;
		b = x;
	} else if (h < 4 / 6) {
		r = 0;
		g = x;
		b = c;
	} else if (h < 5 / 6) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}
	return {
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255)
	};
}
var identifyColorFormat = (color) => {
	if (!color) return null;
	if (color.startsWith("#") && (color.length === 4 || color.length === 5 || color.length === 7 || color.length === 9)) return "hex";
	if (/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*/.test(color)) return color.includes("rgba") ? "rgba" : "rgb";
	if (/hsla?\(\s*\d+(\.\d+)?\s*,\s*\d+(\.\d+)?%\s*,\s*\d+(\.\d+)?%/.test(color)) return color.includes("hsla") ? "hsla" : "hsl";
	return null;
};
var isHSLA = (color) => {
	if (typeof color !== "object" || color === null) return false;
	return [
		"h",
		"s",
		"l",
		"a"
	].every((key) => typeof color[key] === "number" && !isNaN(color[key]));
};
function isColorFormat(v) {
	return v === "hex" || v === "rgb" || v === "hsb";
}
function isHSBObject(v) {
	if (!v || typeof v !== "object") return false;
	const rec = v;
	return typeof rec.h === "number" && Number.isFinite(rec.h) && typeof rec.s === "number" && Number.isFinite(rec.s) && typeof rec.b === "number" && Number.isFinite(rec.b);
}
function isHSVObject(v) {
	if (!v || typeof v !== "object") return false;
	const rec = v;
	return typeof rec.h === "number" && Number.isFinite(rec.h) && typeof rec.s === "number" && Number.isFinite(rec.s) && typeof rec.v === "number" && Number.isFinite(rec.v);
}
function toHexFromFormat(val, format) {
	if (format === "hex" && typeof val === "string") {
		const raw = val.trim().toLowerCase();
		if (!raw) return "#000000";
		if (/^[0-9a-f]{3,4}$/.test(raw)) return `#${raw}`;
		if (/^#[0-9a-f]{3,4}$/.test(raw)) return raw;
		if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
		if (/^#[0-9a-f]{6}$/.test(raw)) return raw;
		if (/^[0-9a-f]{8}$/.test(raw)) return `#${raw}`;
		if (/^#[0-9a-f]{8}$/.test(raw)) return raw;
		return "#000000";
	}
	if (format === "rgb" && typeof val === "string") return rgbToHex(parseToRgb(val)).toLowerCase();
	if (format === "hsb") {
		if (isHSBObject(val)) return rgbToHex(hsbToRgb(val)).toLowerCase();
		if (isHSVObject(val)) {
			const { h, s, v } = val;
			return rgbToHex(hsbToRgb({
				h,
				s,
				b: v
			})).toLowerCase();
		}
		if (typeof val === "string") {
			const nums = val.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
			if (nums.length >= 3) return rgbToHex(hsbToRgb({
				h: nums[0],
				s: nums[1],
				b: nums[2]
			})).toLowerCase();
		}
	}
	return "#000000";
}
function parseToHSLA(color, format) {
	let match;
	switch (format) {
		case "hex": {
			let a = 1;
			let hexColor = color;
			if (color.length === 9) {
				a = parseInt(color.slice(7, 9), 16) / 255;
				hexColor = color.slice(0, 7);
			} else if (color.length === 5) {
				const aChar = color[4];
				a = parseInt(aChar + aChar, 16) / 255;
				hexColor = color.slice(0, 4);
			}
			const hsl = rgbToHsl(hexToRgb(hexColor));
			return {
				h: Math.round(hsl.h * 360),
				s: +(hsl.s * 100).toFixed(1),
				l: +(hsl.l * 100).toFixed(1),
				a
			};
		}
		case "rgb":
		case "rgba": {
			match = color.match(/\d+(\.\d+)?/g);
			if (!match || match.length < 3) return null;
			const [r, g, b] = match.map(Number);
			const hsl = rgbToHsl({
				r,
				g,
				b
			});
			const a = format === "rgba" && match[3] ? parseFloat(match[3]) : 1;
			return {
				h: Math.round(hsl.h * 360),
				s: +(hsl.s * 100).toFixed(1),
				l: +(hsl.l * 100).toFixed(1),
				a
			};
		}
		case "hsl":
		case "hsla": {
			match = color.match(/\d+(\.\d+)?/g);
			if (!match || match.length < 3) return null;
			const [h, s, l] = match.map(Number);
			return {
				h,
				s,
				l,
				a: format === "hsla" && match[3] ? parseFloat(match[3]) : 1
			};
		}
		default: return null;
	}
}
function rgbToHsv({ r, g, b }) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const d = max - Math.min(r, g, b);
	let h = 0;
	const s = max === 0 ? 0 : d / max * 100;
	const v = max * 100;
	if (d !== 0) switch (max) {
		case r:
			h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
			break;
		case g:
			h = ((b - r) / d + 2) * 60;
			break;
		case b:
			h = ((r - g) / d + 4) * 60;
			break;
	}
	return {
		h,
		s,
		v
	};
}
function hexToHsva(hex) {
	const normalized = hex.startsWith("#") ? hex : `#${hex}`;
	let a = 100;
	let hexColor = normalized;
	if (normalized.length === 9) {
		a = Math.round(parseInt(normalized.slice(7, 9), 16) / 255 * 100);
		hexColor = normalized.slice(0, 7);
	} else if (normalized.length === 5) {
		const aChar = normalized[4];
		a = Math.round(parseInt(aChar + aChar, 16) / 255 * 100);
		hexColor = normalized.slice(0, 4);
	}
	return {
		...rgbToHsv(hexToRgb(hexColor)),
		a
	};
}
function hsvaToHex(hsva) {
	const hex = rgbToHex(hsbToRgb({
		h: hsva.h,
		s: hsva.s,
		b: hsva.v
	}));
	if (hsva.a >= 100) return hex.toLowerCase();
	return `${hex}${Math.round(hsva.a / 100 * 255).toString(16).padStart(2, "0")}`.toLowerCase();
}
var applyColorAdjustments = (color, options) => {
	if (!Object.keys(options).length) return color;
	const format = identifyColorFormat(color);
	if (!format) {
		console.warn(`Unsupported color format in color palette: ${color}`);
		return color;
	}
	const hsla = parseToHSLA(color, format);
	if (!isHSLA(hsla)) {
		console.warn(`Invalid color values in color palette: ${color}`);
		return color;
	}
	if (options.lightness) hsla.l = Math.max(0, Math.min(100, hsla.l + options.lightness * 100));
	if (options.opacity) hsla.a = Math.max(0, Math.min(1, options.opacity));
	return `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
};
var adjustColor = memoize(applyColorAdjustments, (color, options) => `${color}-${JSON.stringify(options)}`);
//#endregion
//#region src/components/ui/color-picker/ColorPickerSaturationValue.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = ["aria-label", "aria-valuetext"];
//#endregion
//#region src/components/ui/color-picker/ColorPickerSaturationValue.vue
var ColorPickerSaturationValue_default = /* @__PURE__ */ defineComponent({
	__name: "ColorPickerSaturationValue",
	props: /* @__PURE__ */ mergeModels({ hue: {} }, {
		"saturation": { required: true },
		"saturationModifiers": {},
		"value": { required: true },
		"valueModifiers": {}
	}),
	emits: ["update:saturation", "update:value"],
	setup(__props) {
		const { t } = useI18n();
		const saturation = useModel(__props, "saturation");
		const value = useModel(__props, "value");
		const containerRef = ref(null);
		const hueBackground = computed(() => `hsl(${__props.hue}, 100%, 50%)`);
		const handleStyle = computed(() => ({
			left: `${saturation.value}%`,
			top: `${100 - value.value}%`
		}));
		function updateFromPointer(e) {
			const el = containerRef.value;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
			saturation.value = Math.round(x * 100);
			value.value = Math.round((1 - y) * 100);
		}
		function handlePointerDown(e) {
			e.currentTarget.setPointerCapture(e.pointerId);
			updateFromPointer(e);
		}
		function handlePointerMove(e) {
			if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
			updateFromPointer(e);
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				ref_key: "containerRef",
				ref: containerRef,
				role: "slider",
				"aria-label": unref(t)("color.saturationBrightness"),
				"aria-valuetext": `${saturation.value}%, ${value.value}%`,
				class: "relative aspect-square w-full cursor-crosshair rounded-sm",
				style: normalizeStyle({
					backgroundColor: hueBackground.value,
					touchAction: "none"
				}),
				onPointerdown: handlePointerDown,
				onPointermove: handlePointerMove
			}, [
				_cache[0] || (_cache[0] = createBaseVNode("div", { class: "absolute inset-0 rounded-sm bg-linear-to-r from-white to-transparent" }, null, -1)),
				_cache[1] || (_cache[1] = createBaseVNode("div", { class: "absolute inset-0 rounded-sm bg-linear-to-b from-transparent to-black" }, null, -1)),
				createBaseVNode("div", {
					class: "pointer-events-none absolute size-3.5 -translate-1/2 rounded-full border-2 border-white shadow-[0_0_2px_rgba(0,0,0,0.6)]",
					style: normalizeStyle(handleStyle.value)
				}, null, 4)
			], 44, _hoisted_1$3);
		};
	}
});
//#endregion
//#region src/components/ui/color-picker/ColorPickerSlider.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = [
	"aria-label",
	"aria-valuemax",
	"aria-valuenow"
];
//#endregion
//#region src/components/ui/color-picker/ColorPickerSlider.vue
var ColorPickerSlider_default = /* @__PURE__ */ defineComponent({
	__name: "ColorPickerSlider",
	props: /* @__PURE__ */ mergeModels({
		type: {},
		hue: { default: 0 },
		saturation: { default: 100 },
		brightness: { default: 100 }
	}, {
		"modelValue": { required: true },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const { t } = useI18n();
		const modelValue = useModel(__props, "modelValue");
		const max = computed(() => __props.type === "hue" ? 360 : 100);
		const fraction = computed(() => modelValue.value / max.value);
		const trackBackground = computed(() => {
			if (__props.type === "hue") return "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)";
			return `linear-gradient(to right, transparent, ${rgbToHex(hsbToRgb({
				h: __props.hue,
				s: __props.saturation,
				b: __props.brightness
			}))})`;
		});
		const containerStyle = computed(() => {
			if (__props.type === "alpha") return {
				backgroundImage: "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)",
				backgroundSize: "8px 8px",
				touchAction: "none"
			};
			return {
				background: trackBackground.value,
				touchAction: "none"
			};
		});
		function updateFromPointer(e) {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
			modelValue.value = Math.round(x * max.value);
		}
		function handlePointerDown(e) {
			e.currentTarget.setPointerCapture(e.pointerId);
			updateFromPointer(e);
		}
		function handlePointerMove(e) {
			if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
			updateFromPointer(e);
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				role: "slider",
				"aria-label": __props.type === "hue" ? unref(t)("color.hue") : unref(t)("color.alpha"),
				"aria-valuemin": 0,
				"aria-valuemax": max.value,
				"aria-valuenow": modelValue.value,
				class: "relative flex h-4 cursor-pointer items-center rounded-full p-px",
				style: normalizeStyle(containerStyle.value),
				onPointerdown: handlePointerDown,
				onPointermove: handlePointerMove
			}, [__props.type === "alpha" ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: "absolute inset-0 rounded-full",
				style: normalizeStyle({ background: trackBackground.value })
			}, null, 4)) : createCommentVNode("", true), createBaseVNode("div", {
				class: "pointer-events-none absolute aspect-square h-full -translate-x-1/2 rounded-full border-2 border-white shadow-[0_0_2px_rgba(0,0,0,0.6)]",
				style: normalizeStyle({ left: `${fraction.value * 100}%` })
			}, null, 4)], 44, _hoisted_1$2);
		};
	}
});
//#endregion
//#region src/components/ui/color-picker/ColorPickerPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "flex w-[211px] flex-col gap-2 rounded-lg border border-border-subtle bg-base-background p-2 shadow-md" };
var _hoisted_2$1 = { class: "flex items-center gap-1" };
var _hoisted_3$1 = { class: "flex h-6 min-w-0 flex-1 items-center gap-1 rounded-sm bg-secondary-background px-1 text-xs text-node-component-slot-text" };
var _hoisted_4$1 = {
	key: 0,
	class: "min-w-0 flex-1 truncate text-center"
};
var _hoisted_5$1 = { class: "w-6 shrink-0 text-center" };
var _hoisted_6$1 = { class: "w-6 shrink-0 text-center" };
var _hoisted_7 = { class: "w-6 shrink-0 text-center" };
var _hoisted_8 = { class: "shrink-0 border-l border-border-subtle pl-1" };
//#endregion
//#region src/components/ui/color-picker/ColorPickerPanel.vue
var ColorPickerPanel_default = /* @__PURE__ */ defineComponent({
	__name: "ColorPickerPanel",
	props: {
		"hsva": { required: true },
		"hsvaModifiers": {},
		"displayMode": { required: true },
		"displayModeModifiers": {}
	},
	emits: ["update:hsva", "update:displayMode"],
	setup(__props) {
		const hsva = useModel(__props, "hsva");
		const displayMode = useModel(__props, "displayMode");
		const rgb = computed(() => hsbToRgb({
			h: hsva.value.h,
			s: hsva.value.s,
			b: hsva.value.v
		}));
		const hexString = computed(() => rgbToHex(rgb.value).toLowerCase());
		const { t } = useI18n();
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				createVNode(ColorPickerSaturationValue_default, {
					saturation: hsva.value.s,
					"onUpdate:saturation": _cache[0] || (_cache[0] = ($event) => hsva.value.s = $event),
					value: hsva.value.v,
					"onUpdate:value": _cache[1] || (_cache[1] = ($event) => hsva.value.v = $event),
					hue: hsva.value.h
				}, null, 8, [
					"saturation",
					"value",
					"hue"
				]),
				createVNode(ColorPickerSlider_default, {
					modelValue: hsva.value.h,
					"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => hsva.value.h = $event),
					type: "hue"
				}, null, 8, ["modelValue"]),
				createVNode(ColorPickerSlider_default, {
					modelValue: hsva.value.a,
					"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => hsva.value.a = $event),
					type: "alpha",
					hue: hsva.value.h,
					saturation: hsva.value.s,
					brightness: hsva.value.v
				}, null, 8, [
					"modelValue",
					"hue",
					"saturation",
					"brightness"
				]),
				createBaseVNode("div", _hoisted_2$1, [createVNode(Select_default, {
					modelValue: displayMode.value,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => displayMode.value = $event)
				}, {
					default: withCtx(() => [createVNode(SelectTrigger_default, { class: "h-6 w-[58px] shrink-0 gap-0.5 overflow-clip rounded-sm border-0 px-1.5 py-0 text-xs [&>span]:overflow-visible" }, {
						default: withCtx(() => [createVNode(SelectValue_default)]),
						_: 1
					}), createVNode(SelectContent_default, { class: "min-w-16 p-1" }, {
						default: withCtx(() => [createVNode(SelectItem_default, {
							value: "hex",
							class: "px-2 py-1 text-xs"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("color.hex")), 1)]),
							_: 1
						}), createVNode(SelectItem_default, {
							value: "rgba",
							class: "px-2 py-1 text-xs"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(t)("color.rgba")), 1)]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]), createBaseVNode("div", _hoisted_3$1, [displayMode.value === "hex" ? (openBlock(), createElementBlock("span", _hoisted_4$1, toDisplayString(hexString.value), 1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					createBaseVNode("span", _hoisted_5$1, toDisplayString(rgb.value.r), 1),
					createBaseVNode("span", _hoisted_6$1, toDisplayString(rgb.value.g), 1),
					createBaseVNode("span", _hoisted_7, toDisplayString(rgb.value.b), 1)
				], 64)), createBaseVNode("span", _hoisted_8, toDisplayString(hsva.value.a) + "%", 1)])])
			]);
		};
	}
});
//#endregion
//#region src/components/ui/color-picker/ColorPicker.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = ["disabled"];
var _hoisted_2 = { class: "flex size-8 shrink-0 items-center justify-center" };
var _hoisted_3 = { class: "relative size-4 overflow-hidden rounded-sm" };
var _hoisted_4 = { class: "flex flex-1 items-center justify-between pl-1 text-xs text-component-node-foreground" };
var _hoisted_5 = { key: 0 };
var _hoisted_6 = {
	key: 1,
	class: "flex gap-2"
};
//#endregion
//#region src/components/ui/color-picker/ColorPicker.vue
var ColorPicker_default = /* @__PURE__ */ defineComponent({
	__name: "ColorPicker",
	props: /* @__PURE__ */ mergeModels({
		class: {},
		disabled: { type: Boolean }
	}, {
		"modelValue": { default: "#000000" },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		const hsva = ref(hexToHsva(modelValue.value || "#000000"));
		const displayMode = ref("hex");
		watch(modelValue, (newVal) => {
			if (newVal !== hsvaToHex(hsva.value)) hsva.value = hexToHsva(newVal || "#000000");
		});
		watch(hsva, (newHsva) => {
			const hex = hsvaToHex(newHsva);
			if (hex !== modelValue.value) modelValue.value = hex;
		}, { deep: true });
		const baseRgb = computed(() => hsbToRgb({
			h: hsva.value.h,
			s: hsva.value.s,
			b: hsva.value.v
		}));
		const previewColor = computed(() => {
			const hex = rgbToHex(baseRgb.value);
			const a = hsva.value.a / 100;
			if (a < 1) return `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
			return hex;
		});
		const displayHex = computed(() => rgbToHex(baseRgb.value).toLowerCase());
		const isOpen = ref(false);
		const contentStyle = useModalLiftedZIndex(isOpen);
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(PopoverRoot_default), {
				open: isOpen.value,
				"onUpdate:open": _cache[2] || (_cache[2] = ($event) => isOpen.value = $event)
			}, {
				default: withCtx(() => [createVNode(unref(PopoverTrigger_default), { "as-child": "" }, {
					default: withCtx(() => [createBaseVNode("button", {
						type: "button",
						disabled: _ctx.$props.disabled,
						class: normalizeClass(unref(cn)("flex h-8 w-full items-center overflow-clip rounded-lg border border-transparent bg-component-node-widget-background pr-2 outline-none hover:bg-component-node-widget-background-hovered disabled:cursor-not-allowed disabled:opacity-50", isOpen.value && "border-node-stroke", _ctx.$props.class))
					}, [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [_cache[3] || (_cache[3] = createBaseVNode("div", {
						class: "absolute inset-0",
						style: {
							backgroundImage: "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%)",
							backgroundSize: "4px 4px"
						}
					}, null, -1)), createBaseVNode("div", {
						class: "absolute inset-0",
						style: normalizeStyle({ backgroundColor: previewColor.value })
					}, null, 4)])]), createBaseVNode("div", _hoisted_4, [displayMode.value === "hex" ? (openBlock(), createElementBlock("span", _hoisted_5, toDisplayString(displayHex.value), 1)) : (openBlock(), createElementBlock("div", _hoisted_6, [
						createBaseVNode("span", null, toDisplayString(baseRgb.value.r), 1),
						createBaseVNode("span", null, toDisplayString(baseRgb.value.g), 1),
						createBaseVNode("span", null, toDisplayString(baseRgb.value.b), 1)
					])), createBaseVNode("span", null, toDisplayString(hsva.value.a) + "%", 1)])], 10, _hoisted_1)]),
					_: 1
				}), createVNode(unref(PopoverPortal_default), null, {
					default: withCtx(() => [createVNode(unref(PopoverContent_default), {
						side: "bottom",
						align: "start",
						"side-offset": 7,
						"collision-padding": 10,
						class: "z-1700",
						style: normalizeStyle(unref(contentStyle))
					}, {
						default: withCtx(() => [createVNode(ColorPickerPanel_default, {
							hsva: hsva.value,
							"onUpdate:hsva": _cache[0] || (_cache[0] = ($event) => hsva.value = $event),
							"display-mode": displayMode.value,
							"onUpdate:displayMode": _cache[1] || (_cache[1] = ($event) => displayMode.value = $event)
						}, null, 8, ["hsva", "display-mode"])]),
						_: 1
					}, 8, ["style"])]),
					_: 1
				})]),
				_: 1
			}, 8, ["open"]);
		};
	}
});
//#endregion
export { isColorFormat as a, readableTextColor as c, toHexFromFormat as d, hexToRgb as i, rgbToHsl as l, adjustColor as n, isTransparent as o, hexToInt as r, parseToRgb as s, ColorPicker_default as t, textOnColor as u };

//# sourceMappingURL=ColorPicker-BdrSTTzc.js.map