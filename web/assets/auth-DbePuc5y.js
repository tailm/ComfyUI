import "./rolldown-runtime-w0pxe0c8.js";
import { n as addBreadcrumb, r as captureException } from "./vendor-sentry-CJqm_Nmo.js";
import { K as isEmpty } from "./vendor-other-CcVI76zn.js";
import { i as api } from "./api-DrovjuJk.js";
import { n as toError } from "./errorUtil-CVYb13Xf.js";
//#region src/platform/cloud/onboarding/auth.ts
var ONBOARDING_SURVEY_KEY = "onboarding_survey";
/**
* Helper function to capture API errors with Sentry
*/
function captureApiError(error, endpoint, errorType, httpStatus, operation, extraContext) {
	const tags = {
		api_endpoint: endpoint,
		error_type: errorType
	};
	if (httpStatus !== void 0) tags.http_status = httpStatus;
	if (operation) tags.operation = operation;
	captureException(error, {
		tags,
		extra: extraContext ? { ...extraContext } : void 0
	});
}
/**
* Helper function to check if error is already handled HTTP error
*/
function isHttpError(error, errorMessagePrefix) {
	return error instanceof Error && error.message.startsWith(errorMessagePrefix);
}
async function getUserCloudStatus() {
	try {
		const response = await api.fetchApi("/user", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		if (!response.ok) {
			const error = /* @__PURE__ */ new Error(`Failed to get user: ${response.statusText}`);
			captureApiError(error, "/user", "http_error", response.status, void 0, { api: {
				method: "GET",
				endpoint: "/user",
				status_code: response.status,
				status_text: response.statusText
			} });
			throw error;
		}
		return response.json();
	} catch (error) {
		if (!isHttpError(error, "Failed to get user:")) captureApiError(toError(error), "/user", "network_error");
		throw error;
	}
}
async function getSurveyCompletedStatus() {
	try {
		const response = await api.fetchApi(`/settings/${ONBOARDING_SURVEY_KEY}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		if (response.status === 404) return false;
		if (!response.ok) {
			addBreadcrumb({
				category: "auth",
				message: "Survey status check returned non-ok response",
				level: "warning",
				data: {
					status: response.status,
					endpoint: `/settings/${ONBOARDING_SURVEY_KEY}`
				}
			});
			return true;
		}
		return !isEmpty((await response.json()).value);
	} catch (error) {
		captureException(error, {
			tags: {
				api_endpoint: "/settings/{key}",
				error_type: "network_error"
			},
			extra: {
				route_template: "/settings/{key}",
				route_actual: `/settings/${ONBOARDING_SURVEY_KEY}`
			},
			level: "warning"
		});
		return true;
	}
}
async function submitSurvey(survey) {
	try {
		addBreadcrumb({
			category: "auth",
			message: "Submitting survey",
			level: "info",
			data: { survey_fields: Object.keys(survey) }
		});
		const response = await api.fetchApi("/settings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ [ONBOARDING_SURVEY_KEY]: survey })
		});
		if (!response.ok) {
			const error = /* @__PURE__ */ new Error(`Failed to submit survey: ${response.statusText}`);
			captureApiError(error, "/settings", "http_error", response.status, "submit_survey", { survey: {
				field_count: Object.keys(survey).length,
				field_names: Object.keys(survey)
			} });
			throw error;
		}
		addBreadcrumb({
			category: "auth",
			message: "Survey submitted successfully",
			level: "info"
		});
	} catch (error) {
		if (!isHttpError(error, "Failed to submit survey:")) captureApiError(toError(error), "/settings", "network_error", void 0, "submit_survey");
		throw error;
	}
}
//#endregion
export { getUserCloudStatus as n, submitSurvey as r, getSurveyCompletedStatus as t };

//# sourceMappingURL=auth-DbePuc5y.js.map