import "./rolldown-runtime-w0pxe0c8.js";
import { B as createVNode, E as Fragment, F as createElementBlock, H as defineComponent, Kt as toDisplayString, M as createBaseVNode, N as createBlock, P as createCommentVNode, Ut as normalizeClass, Y as mergeModels, it as openBlock, j as computed, mt as useModel, ot as renderList, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { a as Select_default, i as SelectContent_default, n as SelectTrigger_default, r as SelectItem_default, t as SelectValue_default } from "./SelectValue-DqyfA2Es.js";
import { t as Slider_default } from "./Slider-C_rx-g3O.js";
//#region src/components/load3d/controls/AnimationControls.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "pointer-events-auto absolute top-0 left-0 z-10 flex w-full flex-col items-center gap-2 pt-2"
};
var _hoisted_2 = { class: "flex items-center justify-center gap-2" };
var _hoisted_3 = { class: "flex w-full max-w-xs items-center gap-2 px-4" };
var _hoisted_4 = { class: "min-w-16 text-xs text-base-foreground" };
//#endregion
//#region src/components/load3d/controls/AnimationControls.vue
var AnimationControls_default = /* @__PURE__ */ defineComponent({
	__name: "AnimationControls",
	props: {
		"animations": {},
		"animationsModifiers": {},
		"playing": { type: Boolean },
		"playingModifiers": {},
		"selectedSpeed": {},
		"selectedSpeedModifiers": {},
		"selectedAnimation": {},
		"selectedAnimationModifiers": {},
		"animationProgress": { default: 0 },
		"animationProgressModifiers": {},
		"animationDuration": { default: 0 },
		"animationDurationModifiers": {}
	},
	emits: /* @__PURE__ */ mergeModels(["seek"], [
		"update:animations",
		"update:playing",
		"update:selectedSpeed",
		"update:selectedAnimation",
		"update:animationProgress",
		"update:animationDuration"
	]),
	setup(__props, { emit: __emit }) {
		const animations = useModel(__props, "animations");
		const playing = useModel(__props, "playing");
		const selectedSpeed = useModel(__props, "selectedSpeed");
		const selectedAnimation = useModel(__props, "selectedAnimation");
		const animationProgress = useModel(__props, "animationProgress");
		const animationDuration = useModel(__props, "animationDuration");
		const emit = __emit;
		const speedOptions = [
			{
				name: "0.1x",
				value: .1
			},
			{
				name: "0.5x",
				value: .5
			},
			{
				name: "1x",
				value: 1
			},
			{
				name: "1.5x",
				value: 1.5
			},
			{
				name: "2x",
				value: 2
			}
		];
		const currentTime = computed(() => {
			if (!animationDuration.value) return 0;
			return animationProgress.value / 100 * animationDuration.value;
		});
		function formatTime(seconds) {
			const mins = Math.floor(seconds / 60);
			const secs = (seconds % 60).toFixed(1);
			return mins > 0 ? `${mins}:${secs.padStart(4, "0")}` : `${secs}s`;
		}
		function togglePlay() {
			playing.value = !playing.value;
		}
		function handleSliderChange(value) {
			if (!value) return;
			const progress = value[0];
			animationProgress.value = progress;
			emit("seek", progress);
		}
		return (_ctx, _cache) => {
			return animations.value && animations.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				createVNode(Button_default, {
					size: "icon",
					variant: "textonly",
					class: "rounded-full",
					"aria-label": _ctx.$t("g.playPause"),
					onClick: togglePlay
				}, {
					default: withCtx(() => [createBaseVNode("i", { class: normalizeClass([
						"pi",
						playing.value ? "pi-pause" : "pi-play",
						"text-lg text-base-foreground"
					]) }, null, 2)]),
					_: 1
				}, 8, ["aria-label"]),
				createVNode(Select_default, {
					"model-value": selectedSpeed.value != null ? String(selectedSpeed.value) : void 0,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = (val) => selectedSpeed.value = Number(val))
				}, {
					default: withCtx(() => [createVNode(SelectTrigger_default, {
						size: "md",
						class: "w-24"
					}, {
						default: withCtx(() => [createVNode(SelectValue_default)]),
						_: 1
					}), createVNode(SelectContent_default, null, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(speedOptions, (opt) => {
							return createVNode(SelectItem_default, {
								key: opt.value,
								value: String(opt.value)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(opt.name), 1)]),
								_: 2
							}, 1032, ["value"]);
						}), 64))]),
						_: 1
					})]),
					_: 1
				}, 8, ["model-value"]),
				createVNode(Select_default, {
					"model-value": selectedAnimation.value != null ? String(selectedAnimation.value) : void 0,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = (val) => selectedAnimation.value = Number(val))
				}, {
					default: withCtx(() => [createVNode(SelectTrigger_default, {
						size: "md",
						class: "w-32"
					}, {
						default: withCtx(() => [createVNode(SelectValue_default)]),
						_: 1
					}), createVNode(SelectContent_default, null, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(animations.value, (anim) => {
							return openBlock(), createBlock(SelectItem_default, {
								key: anim.index,
								value: String(anim.index)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(anim.name), 1)]),
								_: 2
							}, 1032, ["value"]);
						}), 128))]),
						_: 1
					})]),
					_: 1
				}, 8, ["model-value"])
			]), createBaseVNode("div", _hoisted_3, [createVNode(Slider_default, {
				"model-value": [animationProgress.value],
				min: 0,
				max: 100,
				step: .1,
				class: "flex-1",
				"onUpdate:modelValue": handleSliderChange
			}, null, 8, ["model-value"]), createBaseVNode("span", _hoisted_4, toDisplayString(formatTime(currentTime.value)) + " / " + toDisplayString(formatTime(animationDuration.value)), 1)])])) : createCommentVNode("", true);
		};
	}
});
//#endregion
export { AnimationControls_default as t };

//# sourceMappingURL=AnimationControls-DusZsuQK.js.map