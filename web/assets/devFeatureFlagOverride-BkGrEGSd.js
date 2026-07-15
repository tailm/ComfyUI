import "./rolldown-runtime-w0pxe0c8.js";
//#region src/utils/devFeatureFlagOverride.ts
/**
* Gets a dev-time feature flag override from localStorage.
* Stripped from production builds via import.meta.env.DEV tree-shaking.
*
* Returns undefined (not null) as the "no override" sentinel because
* null is a valid JSON value — JSON.parse('null') returns null.
* Using undefined avoids ambiguity between "no override set" and
* "override explicitly set to null".
*
* Usage in browser console:
*   localStorage.setItem('ff:team_workspaces_enabled', 'true')
*   localStorage.removeItem('ff:team_workspaces_enabled')
*/
function getDevOverride(flagKey) {}
//#endregion
export { getDevOverride as t };

//# sourceMappingURL=devFeatureFlagOverride-BkGrEGSd.js.map