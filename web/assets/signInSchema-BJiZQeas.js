import "./rolldown-runtime-w0pxe0c8.js";
import { c as t } from "./i18n-DAE2CSwM.js";
import { _ as objectType, b as stringType } from "./vendor-zod-9ZYBvZOX.js";
//#region src/schemas/signInSchema.ts
var apiKeySchema = objectType({ apiKey: stringType().trim().startsWith("comfyui-", t("validation.prefix", { prefix: "comfyui-" })).length(72, t("validation.length", { length: 72 })) });
var signInSchema = objectType({
	email: stringType().email(t("validation.invalidEmail")).min(1, t("validation.required")),
	password: stringType().min(1, t("validation.required"))
});
var passwordSchema = objectType({
	password: stringType().min(8, t("validation.minLength", { length: 8 })).max(32, t("validation.maxLength", { length: 32 })).regex(/[A-Z]/, t("validation.password.uppercase")).regex(/[a-z]/, t("validation.password.lowercase")).regex(/\d/, t("validation.password.number")).regex(/[^A-Za-z0-9]/, t("validation.password.special")),
	confirmPassword: stringType().min(1, t("validation.required"))
});
var updatePasswordSchema = passwordSchema.refine((data) => data.password === data.confirmPassword, {
	message: t("validation.password.match"),
	path: ["confirmPassword"]
});
var signUpSchema = passwordSchema.extend({ email: stringType().email(t("validation.invalidEmail")).min(1, t("validation.required")) }).refine((data) => data.password === data.confirmPassword, {
	message: t("validation.password.match"),
	path: ["confirmPassword"]
});
//#endregion
export { updatePasswordSchema as i, signInSchema as n, signUpSchema as r, apiKeySchema as t };

//# sourceMappingURL=signInSchema-BJiZQeas.js.map