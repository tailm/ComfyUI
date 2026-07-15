import "./rolldown-runtime-w0pxe0c8.js";
import { i as script, n as zodResolver } from "./vendor-primevue-rx7tKw03.js";
import { B as createVNode, H as defineComponent, Kt as toDisplayString, Mt as ref, N as createBlock, Vt as unref, it as openBlock, xt as withCtx, z as createTextVNode } from "./vendor-vue-core-D3WB7mNE.js";
import { Ri as useAuthActions } from "./promotionUtils-vKoNYnM9.js";
import { t as Button_default } from "./Button-BDFBPNkK.js";
import { i as updatePasswordSchema } from "./signInSchema-BJiZQeas.js";
import { t as PasswordFields_default } from "./PasswordFields-BTAZ3cEe.js";
//#endregion
//#region src/components/dialog/content/UpdatePasswordContent.vue
var UpdatePasswordContent_default = /* @__PURE__ */ defineComponent({
	__name: "UpdatePasswordContent",
	props: { onSuccess: { type: Function } },
	setup(__props) {
		const authActions = useAuthActions();
		const loading = ref(false);
		const onSubmit = async (event) => {
			if (event.valid) {
				loading.value = true;
				try {
					await authActions.updatePassword(event.values.password);
					__props.onSuccess();
				} finally {
					loading.value = false;
				}
			}
		};
		return (_ctx, _cache) => {
			return openBlock(), createBlock(unref(script), {
				"data-testid": "update-password-dialog",
				class: "flex w-96 flex-col gap-6",
				resolver: unref(zodResolver)(unref(updatePasswordSchema)),
				onSubmit
			}, {
				default: withCtx(() => [createVNode(PasswordFields_default), createVNode(Button_default, {
					type: "submit",
					class: "mt-4 h-10 font-medium",
					loading: loading.value
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("userSettings.updatePassword")), 1)]),
					_: 1
				}, 8, ["loading"])]),
				_: 1
			}, 8, ["resolver"]);
		};
	}
});
//#endregion
export { UpdatePasswordContent_default as default };

//# sourceMappingURL=UpdatePasswordContent-Bx18GI67.js.map