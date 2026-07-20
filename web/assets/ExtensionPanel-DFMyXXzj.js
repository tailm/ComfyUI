import "./rolldown-runtime-w0pxe0c8.js";
import { C as script$3, H as script$6, W as script$4, X as script, j as script$5, p as script$1, rt as FilterMatchMode, x as script$2 } from "./vendor-primevue-CQFMRQbS.js";
import { A as computed, Bt as unref, Gt as toDisplayString, M as createBlock, N as createCommentVNode, P as createElementBlock, R as createTextVNode, T as Fragment, V as defineComponent, at as renderList, bt as withCtx, et as onMounted, j as createBaseVNode, jt as ref, rt as openBlock, z as createVNode } from "./vendor-vue-core-ywZ1En3W.js";
import { Hi as SearchInput_default, ea as useSettingStore } from "./promotionUtils-CFmuY7Wj.js";
import { r as useI18n } from "./vendor-i18n-BitfRK9w.js";
import { t as Button_default } from "./Button-7CPgYufe.js";
import { i as useExtensionStore } from "./envUtil-DEoYkEM7.js";
//#region src/platform/settings/components/ExtensionPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "extension-panel flex flex-col gap-2" };
var _hoisted_2 = { class: "flex justify-end" };
var _hoisted_3 = { class: "mb-3 flex gap-2" };
//#endregion
//#region src/platform/settings/components/ExtensionPanel.vue
var ExtensionPanel_default = /* @__PURE__ */ defineComponent({
	__name: "ExtensionPanel",
	setup(__props) {
		const { t } = useI18n();
		const filterTypeKeys = [
			"all",
			"core",
			"custom"
		];
		const filterTypes = computed(() => filterTypeKeys.map((key) => ({
			label: t(`g.${key}`),
			value: key
		})));
		const filterType = ref("all");
		const selectedExtensions = ref([]);
		const filters = ref({ global: {
			value: "",
			matchMode: FilterMatchMode.CONTAINS
		} });
		const extensionStore = useExtensionStore();
		const settingStore = useSettingStore();
		const editingEnabledExtensions = ref({});
		const filteredExtensions = computed(() => {
			const extensions = extensionStore.extensions;
			switch (filterType.value) {
				case "core": return extensions.filter((ext) => extensionStore.isCoreExtension(ext.name));
				case "custom": return extensions.filter((ext) => !extensionStore.isCoreExtension(ext.name));
				default: return extensions;
			}
		});
		onMounted(() => {
			extensionStore.extensions.forEach((ext) => {
				editingEnabledExtensions.value[ext.name] = extensionStore.isExtensionEnabled(ext.name);
			});
		});
		const changedExtensions = computed(() => {
			return extensionStore.extensions.filter((ext) => editingEnabledExtensions.value[ext.name] !== extensionStore.isExtensionEnabled(ext.name));
		});
		const hasChanges = computed(() => {
			return changedExtensions.value.length > 0;
		});
		const updateExtensionStatus = async () => {
			const editingDisabledExtensionNames = Object.entries(editingEnabledExtensions.value).filter(([_, enabled]) => !enabled).map(([name]) => name);
			await settingStore.set("Comfy.Extension.Disabled", [...extensionStore.inactiveDisabledExtensionNames, ...editingDisabledExtensionNames]);
		};
		const enableAllExtensions = async () => {
			extensionStore.extensions.forEach((ext) => {
				if (extensionStore.isExtensionReadOnly(ext.name)) return;
				editingEnabledExtensions.value[ext.name] = true;
			});
			await updateExtensionStatus();
		};
		const disableAllExtensions = async () => {
			extensionStore.extensions.forEach((ext) => {
				if (extensionStore.isExtensionReadOnly(ext.name)) return;
				editingEnabledExtensions.value[ext.name] = false;
			});
			await updateExtensionStatus();
		};
		const disableThirdPartyExtensions = async () => {
			extensionStore.extensions.forEach((ext) => {
				if (extensionStore.isCoreExtension(ext.name)) return;
				editingEnabledExtensions.value[ext.name] = false;
			});
			await updateExtensionStatus();
		};
		const applyChanges = () => {
			window.location.reload();
		};
		const menu = ref();
		const contextMenuItems = computed(() => [
			{
				label: t("g.enableSelected"),
				icon: "pi pi-check",
				command: async () => {
					selectedExtensions.value.forEach((ext) => {
						if (!extensionStore.isExtensionReadOnly(ext.name)) editingEnabledExtensions.value[ext.name] = true;
					});
					await updateExtensionStatus();
				}
			},
			{
				label: t("g.disableSelected"),
				icon: "pi pi-times",
				command: async () => {
					selectedExtensions.value.forEach((ext) => {
						if (!extensionStore.isExtensionReadOnly(ext.name)) editingEnabledExtensions.value[ext.name] = false;
					});
					await updateExtensionStatus();
				}
			},
			{ separator: true },
			{
				label: t("g.enableAll"),
				icon: "pi pi-check",
				command: enableAllExtensions
			},
			{
				label: t("g.disableAll"),
				icon: "pi pi-times",
				command: disableAllExtensions
			},
			{
				label: t("g.disableThirdParty"),
				icon: "pi pi-times",
				command: disableThirdPartyExtensions,
				disabled: !extensionStore.hasThirdPartyExtensions
			}
		]);
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(SearchInput_default, {
					modelValue: filters.value["global"].value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filters.value["global"].value = $event),
					placeholder: _ctx.$t("g.searchPlaceholder", { subject: _ctx.$t("g.extensions") })
				}, null, 8, ["modelValue", "placeholder"]),
				hasChanges.value ? (openBlock(), createBlock(unref(script), {
					key: 0,
					severity: "info",
					"pt:text": "w-full",
					class: "max-h-96 overflow-y-auto"
				}, {
					default: withCtx(() => [createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(changedExtensions.value, (ext) => {
						return openBlock(), createElementBlock("li", { key: ext.name }, [createBaseVNode("span", null, toDisplayString(unref(extensionStore).isExtensionEnabled(ext.name) ? "[-]" : "[+]"), 1), createTextVNode(" " + toDisplayString(ext.name), 1)]);
					}), 128))]), createBaseVNode("div", _hoisted_2, [createVNode(Button_default, {
						variant: "destructive",
						onClick: applyChanges
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("g.reloadToApplyChanges")), 1)]),
						_: 1
					})])]),
					_: 1
				})) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_3, [createVNode(unref(script$1), {
					modelValue: filterType.value,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filterType.value = $event),
					options: filterTypes.value,
					"option-label": "label",
					"option-value": "value"
				}, null, 8, ["modelValue", "options"])]),
				createVNode(unref(script$2), {
					selection: selectedExtensions.value,
					"onUpdate:selection": _cache[3] || (_cache[3] = ($event) => selectedExtensions.value = $event),
					value: filteredExtensions.value,
					"striped-rows": "",
					size: "small",
					filters: filters.value,
					"selection-mode": "multiple",
					"data-key": "name"
				}, {
					default: withCtx(() => [
						createVNode(unref(script$3), {
							"selection-mode": "multiple",
							frozen: true,
							style: { "width": "3rem" }
						}),
						createVNode(unref(script$3), {
							header: _ctx.$t("g.extensionName"),
							sortable: "",
							field: "name"
						}, {
							body: withCtx((slotProps) => [createTextVNode(toDisplayString(slotProps.data.name) + " ", 1), unref(extensionStore).isCoreExtension(slotProps.data.name) ? (openBlock(), createBlock(unref(script$4), {
								key: 0,
								value: _ctx.$t("g.core")
							}, null, 8, ["value"])) : (openBlock(), createBlock(unref(script$4), {
								key: 1,
								value: _ctx.$t("g.custom"),
								severity: "info"
							}, null, 8, ["value"]))]),
							_: 1
						}, 8, ["header"]),
						createVNode(unref(script$3), { pt: {
							headerCell: "flex items-center justify-end",
							bodyCell: "flex items-center justify-end"
						} }, {
							header: withCtx(() => [createVNode(Button_default, {
								size: "icon",
								variant: "muted-textonly",
								onClick: _cache[2] || (_cache[2] = ($event) => menu.value?.show($event))
							}, {
								default: withCtx(() => [..._cache[4] || (_cache[4] = [createBaseVNode("i", { class: "pi pi-ellipsis-h" }, null, -1)])]),
								_: 1
							}), createVNode(unref(script$5), {
								ref_key: "menu",
								ref: menu,
								model: contextMenuItems.value
							}, null, 8, ["model"])]),
							body: withCtx((slotProps) => [createVNode(unref(script$6), {
								modelValue: editingEnabledExtensions.value[slotProps.data.name],
								"onUpdate:modelValue": ($event) => editingEnabledExtensions.value[slotProps.data.name] = $event,
								disabled: unref(extensionStore).isExtensionReadOnly(slotProps.data.name),
								onChange: updateExtensionStatus
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"disabled"
							])]),
							_: 1
						})
					]),
					_: 1
				}, 8, [
					"selection",
					"value",
					"filters"
				])
			]);
		};
	}
});
//#endregion
export { ExtensionPanel_default as default };

//# sourceMappingURL=ExtensionPanel-DFMyXXzj.js.map