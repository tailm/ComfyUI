import "./rolldown-runtime-w0pxe0c8.js";
import { $ as onBeforeUnmount, B as createVNode, F as createElementBlock, Gt as normalizeStyle, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, Mt as ref, P as createCommentVNode, St as withDirectives, Ut as normalizeClass, Vt as unref, Y as mergeModels, Z as nextTick, _t as watch, f as storeToRefs, gt as useTemplateRef, it as openBlock, j as computed, mt as useModel, w as withModifiers, x as vModelText, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { C as app, H as useNodeOutputStore, g as useCanvasStore } from "./promotionUtils-vKoNYnM9.js";
import { b as useElementSize } from "./vendor-vueuse-BA2QXdyV.js";
import { c as readableTextColor, u as textOnColor } from "./ColorPicker-CzfjYyaP.js";
import { t as cn } from "./src-CDgHMYTj.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { t as PaletteSwatchRow_default } from "./PaletteSwatchRow-Ch0U8WTV.js";
import { t as Textarea_default } from "./Textarea-BHSJeXXM.js";
//#region src/composables/boundingBoxes/boundingBoxesUtil.ts
var clamp01 = (v) => Math.max(0, Math.min(1, v));
function normalizeBox(b) {
	let { x, y, w, h } = b;
	if (w < 0) {
		x += w;
		w = -w;
	}
	if (h < 0) {
		y += h;
		h = -h;
	}
	x = clamp01(x);
	y = clamp01(y);
	w = Math.min(w, 1 - x);
	h = Math.min(h, 1 - y);
	return {
		...b,
		x,
		y,
		w: Math.max(0, w),
		h: Math.max(0, h)
	};
}
function rectHitTest(mx, my, x1, y1, x2, y2, rx, ry) {
	const h = (cx, cy) => Math.abs(mx - cx) < rx && Math.abs(my - cy) < ry;
	if (h(x1, y1)) return "resize-tl";
	if (h(x2, y1)) return "resize-tr";
	if (h(x1, y2)) return "resize-bl";
	if (h(x2, y2)) return "resize-br";
	if (mx >= x1 && mx <= x2 && Math.abs(my - y1) < ry) return "resize-t";
	if (mx >= x1 && mx <= x2 && Math.abs(my - y2) < ry) return "resize-b";
	if (my >= y1 && my <= y2 && Math.abs(mx - x1) < rx) return "resize-l";
	if (my >= y1 && my <= y2 && Math.abs(mx - x2) < rx) return "resize-r";
	if (mx >= x1 && mx <= x2 && my >= y1 && my <= y2) return "move";
	return null;
}
function applyDrag(mode, start, dx, dy) {
	let { x, y, w, h } = start;
	switch (mode) {
		case "move":
			x += dx;
			y += dy;
			x = clamp01(Math.min(x, 1 - w));
			y = clamp01(Math.min(y, 1 - h));
			break;
		case "draw":
		case "resize-br":
			w += dx;
			h += dy;
			break;
		case "resize-tl":
			x += dx;
			y += dy;
			w -= dx;
			h -= dy;
			break;
		case "resize-tr":
			y += dy;
			w += dx;
			h -= dy;
			break;
		case "resize-bl":
			x += dx;
			w -= dx;
			h += dy;
			break;
		case "resize-t":
			y += dy;
			h -= dy;
			break;
		case "resize-b":
			h += dy;
			break;
		case "resize-l":
			x += dx;
			w -= dx;
			break;
		case "resize-r":
			w += dx;
			break;
	}
	return mode === "move" ? {
		...start,
		x,
		y
	} : normalizeBox({
		...start,
		x,
		y,
		w,
		h
	});
}
function boxesAt(regions, mxN, myN, handlePx, logW, logH, activeIdx) {
	const rx = handlePx / Math.max(1, logW);
	const ry = handlePx / Math.max(1, logH);
	const res = [];
	for (let i = 0; i < regions.length; i++) {
		const b = regions[i];
		const mode = rectHitTest(mxN, myN, b.x, b.y, b.x + b.w, b.y + b.h, rx, ry);
		if (mode) res.push({
			index: i,
			mode
		});
	}
	const ai = res.findIndex((c) => c.index === activeIdx);
	if (ai > 0) res.unshift(res.splice(ai, 1)[0]);
	return res;
}
function tagRects(regions, logW, logH, measureWidth, height = 14) {
	const placed = [];
	const rects = [];
	const hits = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
	for (let i = 0; i < regions.length; i++) {
		const b = regions[i];
		const x1 = b.x * logW;
		const y1 = b.y * logH;
		const x2 = (b.x + b.w) * logW;
		const y2 = (b.y + b.h) * logH;
		const tag = String(i + 1).padStart(2, "0");
		const w = measureWidth(tag) + 8;
		let pick = [x1, y1];
		for (const [cx, cy] of [
			[x1, y1],
			[x2 - w, y1],
			[x2 - w, y2 - height],
			[x1, y2 - height]
		]) {
			const candidate = {
				x: cx,
				y: cy,
				w,
				h: height,
				tag
			};
			if (!placed.some((p) => hits(candidate, p))) {
				pick = [cx, cy];
				break;
			}
		}
		const r = {
			x: pick[0],
			y: pick[1],
			w,
			h: height,
			tag
		};
		placed.push(r);
		rects[i] = r;
	}
	return rects;
}
function isBoundingBox(b) {
	if (!b || typeof b !== "object") return false;
	const box = b;
	return typeof box.x === "number" && typeof box.y === "number" && typeof box.width === "number" && typeof box.height === "number";
}
function fromBoundingBoxes(boxes, width, height) {
	const w = width || 1;
	const h = height || 1;
	return boxes.filter(isBoundingBox).map((box) => {
		const meta = box.metadata ?? {};
		return {
			x: box.x / w,
			y: box.y / h,
			w: box.width / w,
			h: box.height / h,
			type: meta.type === "text" ? "text" : "obj",
			text: typeof meta.text === "string" ? meta.text : "",
			desc: typeof meta.desc === "string" ? meta.desc : "",
			palette: Array.isArray(meta.palette) ? meta.palette.filter((c) => typeof c === "string") : []
		};
	});
}
function toBoundingBoxes(regions, width, height) {
	return regions.map((r) => ({
		x: Math.round(r.x * width),
		y: Math.round(r.y * height),
		width: Math.round(r.w * width),
		height: Math.round(r.h * height),
		metadata: {
			type: r.type,
			text: r.text,
			desc: r.desc,
			palette: r.palette.slice()
		}
	}));
}
//#endregion
//#region src/composables/boundingBoxes/useBoundingBoxes.ts
var HANDLE_PX = 8;
var DIMENSION_STEP = 16;
var BG_DIM = .75;
var MAX_ELEMENT_COLORS = 5;
function useBoundingBoxes(nodeId, { canvasEl, canvasContainer, inlineEditorEl, modelValue }) {
	const focused = ref(false);
	const drawing = ref(false);
	const dragMode = ref(null);
	const dragStartNorm = ref(null);
	const boxAtStart = ref(null);
	const hoverIndex = ref(null);
	const hoverTagIndex = ref(null);
	const bgImage = ref(null);
	const inlineEditor = ref(null);
	const { width: containerWidth } = useElementSize(canvasContainer);
	const litegraphNode = computed(() => nodeId && app.canvas?.graph ? app.canvas.graph.getNodeById(nodeId) : null);
	const { selectedNodeIds } = storeToRefs(useCanvasStore());
	const isNodeSelected = computed(() => selectedNodeIds.value.has(nodeId));
	function dimWidget(name) {
		const v = litegraphNode.value?.widgets?.find((w) => w.name === name)?.value;
		return typeof v === "number" && v > 0 ? v : void 0;
	}
	const widthValue = computed(() => dimWidget("width") ?? 1024);
	const heightValue = computed(() => dimWidget("height") ?? 1024);
	const state = ref({ regions: fromBoundingBoxes(modelValue.value ?? [], widthValue.value, heightValue.value) });
	const activeIndex = ref(state.value.regions.length ? 0 : -1);
	const aspectRatio = computed(() => `${widthValue.value} / ${heightValue.value}`);
	const canvasStyle = computed(() => ({ aspectRatio: aspectRatio.value }));
	const activeRegion = computed(() => activeIndex.value >= 0 ? state.value.regions[activeIndex.value] : null);
	const hasRegions = computed(() => state.value.regions.length > 0);
	function clampToCanvas(n) {
		return Math.max(0, Math.min(1, n));
	}
	function logicalSize() {
		const el = canvasEl.value;
		return {
			w: el?.clientWidth || 1,
			h: el?.clientHeight || 1
		};
	}
	function pointerNorm(e) {
		const el = canvasEl.value;
		if (!el) return {
			x: 0,
			y: 0
		};
		const r = el.getBoundingClientRect();
		return {
			x: clampToCanvas((e.clientX - r.left) / r.width),
			y: clampToCanvas((e.clientY - r.top) / r.height)
		};
	}
	let rafHandle = 0;
	function requestDraw() {
		if (rafHandle) return;
		rafHandle = requestAnimationFrame(() => {
			rafHandle = 0;
			drawCanvas();
		});
	}
	function measureWidth(ctx, s) {
		return ctx.measureText(s).width;
	}
	function drawCanvas() {
		const el = canvasEl.value;
		if (!el) return;
		const { w: W, h: H } = logicalSize();
		const dpr = window.devicePixelRatio || 1;
		const bw = Math.max(1, Math.round(W * dpr));
		const bh = Math.max(1, Math.round(H * dpr));
		if (el.width !== bw || el.height !== bh) {
			el.width = bw;
			el.height = bh;
		}
		const ctx = el.getContext("2d");
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		if (bgImage.value) {
			ctx.drawImage(bgImage.value, 0, 0, W, H);
			ctx.fillStyle = `rgba(0,0,0,${BG_DIM})`;
			ctx.fillRect(0, 0, W, H);
		}
		const aIdx = focused.value || isNodeSelected.value ? activeIndex.value : -1;
		const order = state.value.regions.map((_, i) => i).filter((i) => i !== aIdx).reverse();
		if (aIdx >= 0 && aIdx < state.value.regions.length) order.push(aIdx);
		ctx.font = "bold 11px monospace";
		const tag_rects = tagRects(state.value.regions, W, H, (s) => measureWidth(ctx, s));
		for (const i of order) {
			const b = state.value.regions[i];
			const active = i === aIdx;
			const pal = (b.palette || []).filter(Boolean);
			const col = pal.length ? pal[0] : "#8c8c8c";
			const x1 = b.x * W;
			const y1 = b.y * H;
			const x2 = (b.x + b.w) * W;
			const y2 = (b.y + b.h) * H;
			const w = x2 - x1;
			const h = y2 - y1;
			const hovered = i === hoverIndex.value || active;
			if (active) {
				ctx.fillStyle = "rgba(26,26,26,0.88)";
				ctx.fillRect(x1, y1, w, h);
			}
			ctx.fillStyle = col + (hovered ? "3a" : "22");
			ctx.fillRect(x1, y1, w, h);
			const lw = active ? 2 : hovered ? 1.5 : 1;
			ctx.strokeStyle = col;
			ctx.lineWidth = lw;
			ctx.strokeRect(x1 + lw / 2, y1 + lw / 2, w - lw, h - lw);
			if (pal.length) {
				const sw = w / pal.length;
				const sh = 7;
				for (let p = 0; p < pal.length; p++) {
					const sx = x1 + Math.round(p * sw);
					ctx.fillStyle = pal[p];
					ctx.fillRect(sx, y1, x1 + Math.round((p + 1) * sw) - sx, sh);
				}
			}
			ctx.save();
			ctx.beginPath();
			ctx.rect(x1, y1, w, h);
			ctx.clip();
			let body = b.desc || "";
			if (b.type === "text" && b.text) body = `"${b.text}"` + (body ? ` — ${body}` : "");
			if (body) {
				ctx.font = "12px monospace";
				ctx.fillStyle = readableTextColor(col);
				const pad = 4;
				const lh = 14;
				let ty = y1 + 15 + 12;
				for (const line of wrapLines(ctx, body, w - pad * 2)) {
					if (ty > y1 + h) break;
					ctx.fillText(line, x1 + pad, ty);
					ty += lh;
				}
			}
			const tr = tag_rects[i];
			ctx.font = "bold 11px monospace";
			ctx.fillStyle = col;
			ctx.fillRect(tr.x, tr.y, tr.w, 14);
			if (i === hoverTagIndex.value) {
				ctx.fillStyle = "rgba(255,255,255,0.25)";
				ctx.fillRect(tr.x, tr.y, tr.w, 14);
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 1;
				ctx.strokeRect(tr.x + .5, tr.y + .5, tr.w - 1, 13);
			}
			ctx.fillStyle = textOnColor(col);
			ctx.fillText(tr.tag, tr.x + 4, tr.y + 11);
			ctx.restore();
		}
	}
	function wrapLines(ctx, text, maxW) {
		const out = [];
		for (const para of text.split("\n")) {
			let line = "";
			for (const word of para.split(/\s+/)) {
				if (!word) continue;
				const test = line ? `${line} ${word}` : word;
				if (line && ctx.measureText(test).width > maxW) {
					out.push(line);
					line = word;
				} else line = test;
			}
			out.push(line);
		}
		return out;
	}
	const hitTestPoint = (mN) => {
		const { w: W, h: H } = logicalSize();
		const cands = boxesAt(state.value.regions, mN.x, mN.y, HANDLE_PX, W, H, activeIndex.value);
		if (!cands.length) return null;
		return cands.find((c) => c.index === activeIndex.value && c.mode !== "move") || cands[0];
	};
	const titleAt = (mN) => {
		const el = canvasEl.value;
		if (!el) return null;
		const ctx = el.getContext("2d");
		if (!ctx) return null;
		const { w: W, h: H } = logicalSize();
		const rects = tagRects(state.value.regions, W, H, (s) => measureWidth(ctx, s));
		const px = mN.x * W;
		const py = mN.y * H;
		for (let i = state.value.regions.length - 1; i >= 0; i--) {
			const r = rects[i];
			if (r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
		}
		return null;
	};
	function pickForSelection(mN, cycle) {
		const { w: W, h: H } = logicalSize();
		const cands = boxesAt(state.value.regions, mN.x, mN.y, HANDLE_PX, W, H, activeIndex.value);
		if (!cands.length) return null;
		const activeResize = cands.find((c) => c.index === activeIndex.value && c.mode !== "move");
		if (activeResize && !cycle) return activeResize;
		const ti = titleAt(mN);
		if (ti !== null && !cycle) return {
			index: ti,
			mode: "move"
		};
		if (cycle && cands.length > 1) return cands[(cands.findIndex((c) => c.index === activeIndex.value) + 1) % cands.length];
		return cands.find((c) => c.index === activeIndex.value && c.mode !== "move") || cands[0];
	}
	function onPointerDown(e) {
		if (e.button !== 0) return;
		canvasEl.value?.focus();
		hoverTagIndex.value = null;
		hoverIndex.value = null;
		const mN = pointerNorm(e);
		const hit = pickForSelection(mN, e.altKey);
		if (hit) {
			activeIndex.value = hit.index;
			dragMode.value = hit.mode;
			boxAtStart.value = { ...state.value.regions[hit.index] };
		} else {
			dragMode.value = "draw";
			const nb = {
				x: mN.x,
				y: mN.y,
				w: 0,
				h: 0,
				type: "obj",
				text: "",
				desc: "",
				palette: []
			};
			state.value.regions.push(nb);
			activeIndex.value = state.value.regions.length - 1;
			boxAtStart.value = { ...nb };
		}
		drawing.value = true;
		dragStartNorm.value = mN;
		canvasEl.value?.setPointerCapture(e.pointerId);
		e.preventDefault();
		requestDraw();
	}
	function onDocPointerMove(e) {
		if (!drawing.value || !boxAtStart.value || !dragStartNorm.value || !dragMode.value) return;
		const mN = pointerNorm(e);
		const dx = mN.x - dragStartNorm.value.x;
		const dy = mN.y - dragStartNorm.value.y;
		const nb = applyDrag(dragMode.value, boxAtStart.value, dx, dy);
		state.value.regions[activeIndex.value] = nb;
		requestDraw();
	}
	function onDocPointerUp(e) {
		if (!drawing.value) return;
		drawing.value = false;
		canvasEl.value?.releasePointerCapture?.(e.pointerId);
		const b = state.value.regions[activeIndex.value];
		if (b && (b.w < .005 || b.h < .005) && dragMode.value === "draw") removeRegion(activeIndex.value);
		syncState();
	}
	function onCanvasPointerMove(e) {
		if (drawing.value) onDocPointerMove(e);
		else onPointerMove(e);
	}
	function onPointerMove(e) {
		if (drawing.value) return;
		const mN = pointerNorm(e);
		const ti = titleAt(mN);
		const hit = hitTestPoint(mN);
		const hb = ti !== null ? ti : hit ? hit.index : null;
		if (ti !== hoverTagIndex.value || hb !== hoverIndex.value) {
			hoverTagIndex.value = ti;
			hoverIndex.value = hb;
			requestDraw();
		}
	}
	function onPointerLeave() {
		if (hoverTagIndex.value !== null || hoverIndex.value !== null) {
			hoverTagIndex.value = null;
			hoverIndex.value = null;
			requestDraw();
		}
	}
	const canvasCursor = computed(() => hoverTagIndex.value !== null ? "pointer" : "crosshair");
	function onDoubleClick(e) {
		e.preventDefault();
		const mN = pointerNormFromMouse(e);
		const { w: W, h: H } = logicalSize();
		const cands = boxesAt(state.value.regions, mN.x, mN.y, HANDLE_PX, W, H, activeIndex.value);
		const target = cands.find((c) => c.index === activeIndex.value) || cands[0];
		if (!target) return;
		openInlineEditor(target.index);
	}
	function pointerNormFromMouse(e) {
		const el = canvasEl.value;
		if (!el) return {
			x: 0,
			y: 0
		};
		const r = el.getBoundingClientRect();
		return {
			x: clampToCanvas((e.clientX - r.left) / r.width),
			y: clampToCanvas((e.clientY - r.top) / r.height)
		};
	}
	function openInlineEditor(index) {
		const b = state.value.regions[index];
		if (!b) return;
		activeIndex.value = index;
		const { w: W, h: H } = logicalSize();
		const w = Math.min(W, Math.max(70, b.w * W));
		const h = Math.min(H, Math.max(42, b.h * H));
		const left = Math.max(0, Math.min(b.x * W, W - w));
		const top = Math.max(0, Math.min(b.y * H, H - h));
		inlineEditor.value = {
			value: b.desc || "",
			index,
			style: {
				left: `${left}px`,
				top: `${top}px`,
				width: `${w}px`,
				height: `${h}px`,
				borderColor: (b.palette || []).find(Boolean) || "#46b4e6"
			}
		};
		nextTick(() => {
			inlineEditorEl.value?.focus();
			inlineEditorEl.value?.select();
		});
	}
	function onInlineKeyDown(e) {
		if (e.key === "Escape") inlineEditor.value = null;
		else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) commitInlineEditor();
	}
	function commitInlineEditor() {
		const ed = inlineEditor.value;
		if (!ed) return;
		const b = state.value.regions[ed.index];
		if (b) b.desc = ed.value;
		inlineEditor.value = null;
		syncState();
	}
	function onCanvasKeyDown(e) {
		if (drawing.value) return;
		const idx = activeIndex.value;
		if ((e.key === "Delete" || e.key === "Backspace") && idx >= 0) {
			e.preventDefault();
			e.stopPropagation();
			removeRegion(idx);
			syncState();
		}
	}
	function removeRegion(i) {
		state.value.regions.splice(i, 1);
		if (!state.value.regions.length) activeIndex.value = -1;
		else if (i <= activeIndex.value) activeIndex.value = Math.max(0, activeIndex.value - 1);
	}
	function setActiveType(t) {
		if (activeRegion.value) {
			activeRegion.value.type = t;
			syncState();
		}
	}
	function clearAll() {
		state.value.regions = [];
		activeIndex.value = -1;
		syncState();
	}
	function syncState() {
		modelValue.value = toBoundingBoxes(state.value.regions, widthValue.value, heightValue.value);
		requestDraw();
	}
	watch(containerWidth, () => requestDraw());
	watch(() => state.value.regions.length, () => requestDraw());
	watch(isNodeSelected, () => requestDraw());
	watch([widthValue, heightValue], () => syncState());
	const nodeOutputStore = useNodeOutputStore();
	function applyImageDimensions(naturalWidth, naturalHeight) {
		const node = litegraphNode.value;
		if (!node) return;
		const snap = (v) => Math.max(DIMENSION_STEP, Math.round(v / DIMENSION_STEP) * DIMENSION_STEP);
		const targetW = snap(naturalWidth);
		const targetH = snap(naturalHeight);
		const widthWidget = node.widgets?.find((w) => w.name === "width");
		const heightWidget = node.widgets?.find((w) => w.name === "height");
		if (widthWidget && widthWidget.value !== targetW) {
			widthWidget.value = targetW;
			widthWidget.callback?.(targetW);
		}
		if (heightWidget && heightWidget.value !== targetH) {
			heightWidget.value = targetH;
			heightWidget.callback?.(targetH);
		}
	}
	let lastBgUrl = "";
	function updateBgImage() {
		const node = litegraphNode.value;
		if (!node) return;
		const slot = node.findInputSlot("background");
		const inputNode = slot >= 0 ? node.getInputNode(slot) : null;
		const url = inputNode ? nodeOutputStore.getNodeImageUrls(inputNode)?.[0] : void 0;
		if (!url) {
			if (bgImage.value) {
				bgImage.value = null;
				lastBgUrl = "";
				requestDraw();
			}
			return;
		}
		if (url === lastBgUrl) return;
		lastBgUrl = url;
		const currentUrl = url;
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			if (currentUrl !== lastBgUrl) return;
			bgImage.value = img;
			applyImageDimensions(img.naturalWidth, img.naturalHeight);
			requestDraw();
		};
		img.src = url;
	}
	watch(() => nodeOutputStore.nodeOutputs, updateBgImage, { deep: true });
	watch(() => nodeOutputStore.nodePreviewImages, updateBgImage, { deep: true });
	updateBgImage();
	nextTick(() => requestDraw());
	onBeforeUnmount(() => {
		if (rafHandle) cancelAnimationFrame(rafHandle);
	});
	return {
		canvasStyle,
		canvasCursor,
		focused,
		activeRegion,
		hasRegions,
		inlineEditor,
		maxColors: MAX_ELEMENT_COLORS,
		onPointerDown,
		onCanvasPointerMove,
		onDocPointerUp,
		onPointerLeave,
		onDoubleClick,
		onCanvasKeyDown,
		onInlineKeyDown,
		commitInlineEditor,
		setActiveType,
		clearAll,
		syncState
	};
}
//#endregion
//#region src/components/boundingBoxes/WidgetBoundingBoxes.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "flex flex-col gap-2 rounded-sm bg-node-component-surface p-2 text-xs"
};
var _hoisted_2 = { class: "flex h-8 items-center gap-1 rounded-sm bg-component-node-widget-background p-1" };
var _hoisted_3 = {
	key: 0,
	class: "group relative rounded-lg transition-all focus-within:ring focus-within:ring-component-node-widget-background-highlighted hover:bg-component-node-widget-background-hovered"
};
var _hoisted_4 = { class: "pointer-events-none absolute top-1.5 left-3 z-10 text-2xs text-muted-foreground" };
var _hoisted_5 = { class: "group relative rounded-lg transition-all focus-within:ring focus-within:ring-component-node-widget-background-highlighted hover:bg-component-node-widget-background-hovered" };
var _hoisted_6 = { class: "pointer-events-none absolute top-1.5 left-3 z-10 text-2xs text-muted-foreground" };
var _hoisted_7 = { class: "flex items-center gap-2" };
var _hoisted_8 = { class: "shrink-0 truncate text-sm text-muted-foreground" };
var _hoisted_9 = {
	key: 1,
	class: "text-node-text-muted px-1 text-xs"
};
//#endregion
//#region src/components/boundingBoxes/WidgetBoundingBoxes.vue
var WidgetBoundingBoxes_default = /* @__PURE__ */ defineComponent({
	__name: "WidgetBoundingBoxes",
	props: /* @__PURE__ */ mergeModels({ nodeId: {} }, {
		"modelValue": { default: () => [] },
		"modelModifiers": {}
	}),
	emits: ["update:modelValue"],
	setup(__props) {
		const modelValue = useModel(__props, "modelValue");
		const canvasEl = useTemplateRef("canvasEl");
		const canvasContainer = useTemplateRef("canvasContainer");
		const inlineEditorEl = useTemplateRef("inlineEditorEl");
		const { canvasStyle, canvasCursor, focused, activeRegion, hasRegions, inlineEditor, maxColors, onPointerDown, onCanvasPointerMove, onDocPointerUp, onPointerLeave, onDoubleClick, onCanvasKeyDown, onInlineKeyDown, commitInlineEditor, setActiveType, clearAll, syncState } = useBoundingBoxes(__props.nodeId, {
			canvasEl,
			canvasContainer,
			inlineEditorEl,
			modelValue
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				class: "widget-expands flex size-full flex-col gap-1 select-none",
				"data-testid": "bounding-boxes",
				onPointerdown: _cache[18] || (_cache[18] = withModifiers(() => {}, ["stop"]))
			}, [
				createBaseVNode("div", {
					ref_key: "canvasContainer",
					ref: canvasContainer,
					class: "relative w-full shrink-0 overflow-hidden rounded-sm border border-component-node-border bg-node-component-surface",
					style: normalizeStyle(unref(canvasStyle))
				}, [createBaseVNode("canvas", {
					ref_key: "canvasEl",
					ref: canvasEl,
					tabindex: "0",
					class: "absolute inset-0 size-full rounded-sm outline-none",
					style: normalizeStyle({ cursor: unref(canvasCursor) }),
					onPointerdown: _cache[0] || (_cache[0] = (...args) => unref(onPointerDown) && unref(onPointerDown)(...args)),
					onPointermove: _cache[1] || (_cache[1] = (...args) => unref(onCanvasPointerMove) && unref(onCanvasPointerMove)(...args)),
					onPointerup: _cache[2] || (_cache[2] = (...args) => unref(onDocPointerUp) && unref(onDocPointerUp)(...args)),
					onPointercancel: _cache[3] || (_cache[3] = (...args) => unref(onDocPointerUp) && unref(onDocPointerUp)(...args)),
					onPointerleave: _cache[4] || (_cache[4] = (...args) => unref(onPointerLeave) && unref(onPointerLeave)(...args)),
					onLostpointercapture: _cache[5] || (_cache[5] = (...args) => unref(onDocPointerUp) && unref(onDocPointerUp)(...args)),
					onDblclick: _cache[6] || (_cache[6] = (...args) => unref(onDoubleClick) && unref(onDoubleClick)(...args)),
					onKeydown: _cache[7] || (_cache[7] = (...args) => unref(onCanvasKeyDown) && unref(onCanvasKeyDown)(...args)),
					onFocus: _cache[8] || (_cache[8] = ($event) => focused.value = true),
					onBlur: _cache[9] || (_cache[9] = ($event) => focused.value = false)
				}, null, 36), unref(inlineEditor) ? withDirectives((openBlock(), createElementBlock("textarea", {
					key: 0,
					ref_key: "inlineEditorEl",
					ref: inlineEditorEl,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(inlineEditor).value = $event),
					class: "absolute box-border resize-none rounded-sm border-2 bg-black/90 p-1 font-mono text-xs text-white outline-none",
					style: normalizeStyle(unref(inlineEditor).style),
					"data-capture-wheel": "true",
					onKeydown: _cache[11] || (_cache[11] = withModifiers((...args) => unref(onInlineKeyDown) && unref(onInlineKeyDown)(...args), ["stop"])),
					onBlur: _cache[12] || (_cache[12] = (...args) => unref(commitInlineEditor) && unref(commitInlineEditor)(...args))
				}, null, 36)), [[vModelText, unref(inlineEditor).value]]) : createCommentVNode("", true)], 4),
				unref(activeRegion) ? (openBlock(), createElementBlock("div", _hoisted_1, [
					createBaseVNode("div", _hoisted_2, [createVNode(Button_default, {
						variant: "textonly",
						size: "unset",
						class: normalizeClass(unref(cn)("flex-1 self-stretch px-2 text-xs transition-colors", unref(activeRegion).type === "obj" ? "rounded-sm bg-component-node-widget-background-selected text-base-foreground" : "text-node-text-muted hover:text-node-text")),
						onClick: _cache[13] || (_cache[13] = ($event) => unref(setActiveType)("obj"))
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("boundingBoxes.typeObj")), 1)]),
						_: 1
					}, 8, ["class"]), createVNode(Button_default, {
						variant: "textonly",
						size: "unset",
						class: normalizeClass(unref(cn)("flex-1 self-stretch px-2 text-xs transition-colors", unref(activeRegion).type === "text" ? "rounded-sm bg-component-node-widget-background-selected text-base-foreground" : "text-node-text-muted hover:text-node-text")),
						onClick: _cache[14] || (_cache[14] = ($event) => unref(setActiveType)("text"))
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("boundingBoxes.typeText")), 1)]),
						_: 1
					}, 8, ["class"])]),
					unref(activeRegion).type === "text" ? (openBlock(), createElementBlock("div", _hoisted_3, [createBaseVNode("span", _hoisted_4, toDisplayString(_ctx.$t("boundingBoxes.textLabel")), 1), createVNode(Textarea_default, {
						modelValue: unref(activeRegion).text,
						"onUpdate:modelValue": [_cache[15] || (_cache[15] = ($event) => unref(activeRegion).text = $event), unref(syncState)],
						placeholder: _ctx.$t("boundingBoxes.textPlaceholder"),
						class: "min-h-14 resize-none overflow-hidden pt-5 text-(length:--comfy-textarea-font-size) leading-normal not-disabled:bg-component-node-widget-background not-disabled:text-component-node-foreground hover:overflow-auto focus:overflow-auto",
						"data-capture-wheel": "true"
					}, null, 8, [
						"modelValue",
						"placeholder",
						"onUpdate:modelValue"
					])])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, toDisplayString(_ctx.$t("boundingBoxes.descLabel")), 1), createVNode(Textarea_default, {
						modelValue: unref(activeRegion).desc,
						"onUpdate:modelValue": [_cache[16] || (_cache[16] = ($event) => unref(activeRegion).desc = $event), unref(syncState)],
						placeholder: _ctx.$t("boundingBoxes.descPlaceholder"),
						class: "min-h-20 resize-none overflow-hidden pt-5 text-(length:--comfy-textarea-font-size) leading-normal not-disabled:bg-component-node-widget-background not-disabled:text-component-node-foreground hover:overflow-auto focus:overflow-auto",
						"data-capture-wheel": "true"
					}, null, 8, [
						"modelValue",
						"placeholder",
						"onUpdate:modelValue"
					])]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, toDisplayString(_ctx.$t("boundingBoxes.colors")), 1), createVNode(PaletteSwatchRow_default, {
						modelValue: unref(activeRegion).palette,
						"onUpdate:modelValue": [_cache[17] || (_cache[17] = ($event) => unref(activeRegion).palette = $event), unref(syncState)],
						max: unref(maxColors)
					}, null, 8, [
						"modelValue",
						"max",
						"onUpdate:modelValue"
					])])
				])) : unref(hasRegions) ? (openBlock(), createElementBlock("div", _hoisted_9, toDisplayString(_ctx.$t("boundingBoxes.clickRegionToEdit")), 1)) : createCommentVNode("", true),
				createVNode(Button_default, {
					variant: "secondary",
					size: "md",
					class: "gap-2 rounded-lg border border-component-node-border bg-component-node-background text-xs text-muted-foreground hover:text-base-foreground",
					onClick: unref(clearAll)
				}, {
					default: withCtx(() => [_cache[19] || (_cache[19] = createBaseVNode("i", { class: "icon-[lucide--undo-2]" }, null, -1)), createTextVNode(" " + toDisplayString(_ctx.$t("boundingBoxes.clearAll")), 1)]),
					_: 1
				}, 8, ["onClick"])
			], 32);
		};
	}
});
//#endregion
export { WidgetBoundingBoxes_default as default };

//# sourceMappingURL=WidgetBoundingBoxes-QnqhtxIi.js.map