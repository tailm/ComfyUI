const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./commands-qdX6n16y.js","./commands-CXXLFVIe.js","./main-317SKpWk.js","./main-fVqRQcYa.js","./nodeDefs-DVJ7oDYe.js","./nodeDefs-DNc3psLh.js","./settings-D2zRYmgh.js","./settings-CXXL4Tkc.js"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { Q as __vitePreload } from "./vendor-primevue-CQFMRQbS.js";
import { n as createI18n } from "./vendor-i18n-BitfRK9w.js";
import { qt as commands_default } from "./commands-CXXLFVIe.js";
import { kt as main_default } from "./main-fVqRQcYa.js";
import { Rm as nodeDefs_default } from "./nodeDefs-DNc3psLh.js";
import { $t as settings_default } from "./settings-CXXL4Tkc.js";
//#region src/locales/localeConfig.ts
var localeFiles = /* @__PURE__ */ Object.assign({
	"./ar/commands.json": () => __vitePreload(() => import("./commands-B5s1as8p.js"), [], import.meta.url),
	"./ar/main.json": () => __vitePreload(() => import("./main-8o_iyYf0.js"), [], import.meta.url),
	"./ar/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-DlzycPy0.js"), [], import.meta.url),
	"./ar/settings.json": () => __vitePreload(() => import("./settings-Cc3IaV7t.js"), [], import.meta.url),
	"./en/commands.json": () => __vitePreload(() => import("./commands-qdX6n16y.js"), __vite__mapDeps([0,1]), import.meta.url),
	"./en/main.json": () => __vitePreload(() => import("./main-317SKpWk.js"), __vite__mapDeps([2,3]), import.meta.url),
	"./en/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-DVJ7oDYe.js"), __vite__mapDeps([4,5]), import.meta.url),
	"./en/settings.json": () => __vitePreload(() => import("./settings-D2zRYmgh.js"), __vite__mapDeps([6,7]), import.meta.url),
	"./es/commands.json": () => __vitePreload(() => import("./commands-D0Rf2tE-.js"), [], import.meta.url),
	"./es/main.json": () => __vitePreload(() => import("./main-D7RAx5t1.js"), [], import.meta.url),
	"./es/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-BdhtbJJ9.js"), [], import.meta.url),
	"./es/settings.json": () => __vitePreload(() => import("./settings-Bj1Edkcw.js"), [], import.meta.url),
	"./fa/commands.json": () => __vitePreload(() => import("./commands-o4XPLnc4.js"), [], import.meta.url),
	"./fa/main.json": () => __vitePreload(() => import("./main-LfdT2W64.js"), [], import.meta.url),
	"./fa/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-IwRpJAXF.js"), [], import.meta.url),
	"./fa/settings.json": () => __vitePreload(() => import("./settings-CtG7dGIm.js"), [], import.meta.url),
	"./fr/commands.json": () => __vitePreload(() => import("./commands-CSSUlZZ_.js"), [], import.meta.url),
	"./fr/main.json": () => __vitePreload(() => import("./main-CATDiNaU.js"), [], import.meta.url),
	"./fr/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-Dk1EqgrL.js"), [], import.meta.url),
	"./fr/settings.json": () => __vitePreload(() => import("./settings-BvafQF8H.js"), [], import.meta.url),
	"./he/commands.json": () => __vitePreload(() => import("./commands-CAQPhJwX.js"), [], import.meta.url),
	"./he/main.json": () => __vitePreload(() => import("./main-ClQs1FWq.js"), [], import.meta.url),
	"./he/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-CfOqXU8d.js"), [], import.meta.url),
	"./he/settings.json": () => __vitePreload(() => import("./settings-DVM3SDQD.js"), [], import.meta.url),
	"./ja/commands.json": () => __vitePreload(() => import("./commands-BuvWfxx4.js"), [], import.meta.url),
	"./ja/main.json": () => __vitePreload(() => import("./main-2i95BTPW.js"), [], import.meta.url),
	"./ja/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-CRKMBJEN.js"), [], import.meta.url),
	"./ja/settings.json": () => __vitePreload(() => import("./settings-CwWS7XYy.js"), [], import.meta.url),
	"./ko/commands.json": () => __vitePreload(() => import("./commands--oG3x4kU.js"), [], import.meta.url),
	"./ko/main.json": () => __vitePreload(() => import("./main-DArlNrQ8.js"), [], import.meta.url),
	"./ko/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-DFV-3RG4.js"), [], import.meta.url),
	"./ko/settings.json": () => __vitePreload(() => import("./settings-Z5fkx33-.js"), [], import.meta.url),
	"./pt-BR/commands.json": () => __vitePreload(() => import("./commands-CVNcqBSg.js"), [], import.meta.url),
	"./pt-BR/main.json": () => __vitePreload(() => import("./main-Y_gomUlW.js"), [], import.meta.url),
	"./pt-BR/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-TZeVwh1D.js"), [], import.meta.url),
	"./pt-BR/settings.json": () => __vitePreload(() => import("./settings-CO-8--NT.js"), [], import.meta.url),
	"./ru/commands.json": () => __vitePreload(() => import("./commands-DxVfa313.js"), [], import.meta.url),
	"./ru/main.json": () => __vitePreload(() => import("./main-LoNpIgdk.js"), [], import.meta.url),
	"./ru/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-Te77eluE.js"), [], import.meta.url),
	"./ru/settings.json": () => __vitePreload(() => import("./settings-Cf4jRYPX.js"), [], import.meta.url),
	"./tr/commands.json": () => __vitePreload(() => import("./commands-1yqn7PHC.js"), [], import.meta.url),
	"./tr/main.json": () => __vitePreload(() => import("./main-CMPSQQuL.js"), [], import.meta.url),
	"./tr/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-CDT8rgYt.js"), [], import.meta.url),
	"./tr/settings.json": () => __vitePreload(() => import("./settings-D7XePboi.js"), [], import.meta.url),
	"./zh/commands.json": () => __vitePreload(() => import("./commands-CrvXu3IG.js"), [], import.meta.url),
	"./zh/main.json": () => __vitePreload(() => import("./main-Bca0uj-4.js"), [], import.meta.url),
	"./zh/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-vo3ev5VJ.js"), [], import.meta.url),
	"./zh/settings.json": () => __vitePreload(() => import("./settings-BzoIE60Y.js"), [], import.meta.url),
	"./zh-TW/commands.json": () => __vitePreload(() => import("./commands-oc6Gdrb3.js"), [], import.meta.url),
	"./zh-TW/main.json": () => __vitePreload(() => import("./main-EuEJg5v8.js"), [], import.meta.url),
	"./zh-TW/nodeDefs.json": () => __vitePreload(() => import("./nodeDefs-DwLAVuue.js"), [], import.meta.url),
	"./zh-TW/settings.json": () => __vitePreload(() => import("./settings-32eim3Uw.js"), [], import.meta.url)
});
function loadersFor(locale) {
	return {
		main: localeFiles[`./${locale}/main.json`],
		nodeDefs: localeFiles[`./${locale}/nodeDefs.json`],
		commands: localeFiles[`./${locale}/commands.json`],
		settings: localeFiles[`./${locale}/settings.json`]
	};
}
var localeDefinitions = {
	en: {
		text: "English",
		loaders: null
	},
	zh: {
		text: "中文",
		loaders: loadersFor("zh")
	},
	"zh-TW": {
		text: "繁體中文",
		loaders: loadersFor("zh-TW")
	},
	ru: {
		text: "Русский",
		loaders: loadersFor("ru")
	},
	ja: {
		text: "日本語",
		loaders: loadersFor("ja")
	},
	ko: {
		text: "한국어",
		loaders: loadersFor("ko")
	},
	fr: {
		text: "Français",
		loaders: loadersFor("fr")
	},
	es: {
		text: "Español",
		loaders: loadersFor("es")
	},
	ar: {
		text: "عربي",
		loaders: loadersFor("ar")
	},
	tr: {
		text: "Türkçe",
		loaders: loadersFor("tr")
	},
	"pt-BR": {
		text: "Português (BR)",
		loaders: loadersFor("pt-BR")
	},
	fa: {
		text: "فارسی",
		loaders: loadersFor("fa")
	},
	he: {
		text: "עברית",
		loaders: loadersFor("he")
	}
};
var SUPPORTED_LOCALES = Object.keys(localeDefinitions);
var SUPPORTED_LOCALE_OPTIONS = SUPPORTED_LOCALES.map((value) => ({
	value,
	text: localeDefinitions[value].text
}));
var supportedLocaleByLower = new Map(SUPPORTED_LOCALES.map((locale) => [locale.toLowerCase(), locale]));
function matchSingle(candidate) {
	const normalized = candidate.toLowerCase();
	return supportedLocaleByLower.get(normalized) ?? supportedLocaleByLower.get(normalized.split("-")[0]);
}
function resolveSupportedLocale(input) {
	const candidates = Array.isArray(input) ? input : input ? [input] : [];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const matched = matchSingle(candidate);
		if (matched) return matched;
	}
	return "en";
}
function getDefaultLocale() {
	return resolveSupportedLocale(navigator.languages);
}
//#endregion
//#region src/i18n.ts
function buildLocale(main, nodes, commands, settings) {
	return {
		...main,
		nodeDefs: nodes,
		commands,
		settings
	};
}
var loadedLocales = new Set(["en"]);
var loadingLocales = /* @__PURE__ */ new Map();
var customNodesI18nData = {};
/**
* Dynamically load a shipped locale's bundles (nodeDefs, commands, settings).
* Callers must pre-resolve untrusted input via `resolveSupportedLocale` or
* `setActiveLocale`, which is the boundary helper for arbitrary input.
*/
async function loadLocale(locale) {
	if (loadedLocales.has(locale)) return;
	const existingLoad = loadingLocales.get(locale);
	if (existingLoad) {
		await existingLoad;
		return;
	}
	const loaders = localeDefinitions[locale].loaders;
	if (!loaders) return;
	const loadPromise = (async () => {
		try {
			const [main, nodes, commands, settings] = await Promise.all([
				loaders.main(),
				loaders.nodeDefs(),
				loaders.commands(),
				loaders.settings()
			]);
			const messages = buildLocale(main.default, nodes.default, commands.default, settings.default);
			i18n.global.setLocaleMessage(locale, messages);
			loadedLocales.add(locale);
			if (customNodesI18nData[locale]) i18n.global.mergeLocaleMessage(locale, customNodesI18nData[locale]);
		} catch (error) {
			console.error(`Failed to load locale "${locale}":`, error);
			throw error;
		} finally {
			loadingLocales.delete(locale);
		}
	})();
	loadingLocales.set(locale, loadPromise);
	await loadPromise;
}
/**
* Boundary helper for arbitrary locale input (settings, browser preferences):
* resolves to a shipped tag, loads it, and updates the active locale.
*
* Returns the resolved tag so callers can detect a clamp (e.g. a stale stored
* `Comfy.Locale` from an older build) and self-heal persisted state.
*/
async function setActiveLocale(input) {
	const resolved = resolveSupportedLocale(input);
	if (typeof input === "string" && input && input !== resolved) console.warn(`Locale "${input}" not shipped; using "${resolved}"`);
	await loadLocale(resolved);
	i18n.global.locale.value = resolved;
	return resolved;
}
/**
* Stores the data for later use when locales are lazily loaded,
* and immediately merges data for already-loaded locales.
*/
function mergeCustomNodesI18n(i18nData) {
	for (const key of Object.keys(customNodesI18nData)) delete customNodesI18nData[key];
	Object.assign(customNodesI18nData, i18nData);
	for (const [locale, message] of Object.entries(i18nData)) if (loadedLocales.has(locale)) i18n.global.mergeLocaleMessage(locale, message);
}
var messages = { en: buildLocale(main_default, nodeDefs_default, commands_default, settings_default) };
var i18n = createI18n({
	legacy: false,
	locale: getDefaultLocale(),
	fallbackLocale: "en",
	escapeParameter: true,
	messages,
	missingWarn: /^(?!settings\.Comfy_Locale\.options\.).+/,
	fallbackWarn: /^(?!settings\.Comfy_Locale\.options\.).+/
});
/** Convenience shorthand: i18n.global */
var t = i18n.global.t;
var te = i18n.global.te;
i18n.global.d;
var tm = i18n.global.tm;
/**
* Safe translation function that returns the fallback message if the key is not found.
*
* @param key - The key to translate.
* @param fallbackMessage - The fallback message to use if the key is not found.
*/
function st(key, fallbackMessage) {
	return te(key) ? t(key) : fallbackMessage;
}
/**
* Safe raw translation function for strings that may contain i18n syntax.
*
* @param key - The key for the raw locale message.
* @param fallbackMessage - The fallback message to use if the key is not found
* or the locale message is not a string.
*/
function stRaw(key, fallbackMessage) {
	if (!te(key)) return fallbackMessage;
	const message = tm(key);
	return typeof message === "string" ? message : fallbackMessage;
}
//#endregion
export { st as a, te as c, resolveSupportedLocale as d, setActiveLocale as i, SUPPORTED_LOCALE_OPTIONS as l, loadLocale as n, stRaw as o, mergeCustomNodesI18n as r, t as s, i18n as t, getDefaultLocale as u };

//# sourceMappingURL=i18n-BJjDt-Gn.js.map