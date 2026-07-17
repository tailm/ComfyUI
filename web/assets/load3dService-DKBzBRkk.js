const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./useLoad3d-DfW5TfYk.js","./useLoad3d-CJj9_CDG.js","./rolldown-runtime-w0pxe0c8.js","./promotionUtils-D7bbpSd5.js","./_plugin-vue_export-helper-BKp_-DiS.js","./vendor-primevue-Di5q1E0M.js","./vendor-vue-core-ywZ1En3W.js","./vendor-other-DslE47pR.js","./vendor-three-JCi_5yX-.js","./vendor-tiptap-BOgG_8hl.js","./vendor-reka-ui-BL45aHvm.js","./vendor-i18n-BitfRK9w.js","./vendor-sentry-BeVhjky-.js","./vendor-vueuse-D8rwdKM0.js","./vendor-axios-BWFjRHOY.js","./vendor-markdown-dKTpR1HU.js","./vendor-yjs-Cmf7NGGj.js","./vendor-zod-BwmrqdWK.js","./api-DtOML0NT.js","./types-4cVPtFn2.js","./toastStore-Dafwoqcw.js","./devFeatureFlagOverride-C_h7DxV8.js","./formatUtil-NyC-AHAf.js","./src-CAuVu1U5.js","./downloadUtil-Cl0cF0EY.js","./i18n-DzSsN4Ea.js","./commands-CXXLFVIe.js","./main-BSJkLqvQ.js","./nodeDefs-DNc3psLh.js","./settings-CXXL4Tkc.js","./WaveAudioPlayer-Q5zYiDcc.js","./Button-BOAvjEOG.js","./Slider-DrBXpOpg.js","./DialogHeader-D4JcQCFk.js","./dialogStore-B5tjby6O.js","./Loader-Pq650Xlb.js","./Popover-D6A0rMur.js","./useModalLiftedZIndex-DKRRcl_q.js","./ColorPicker-BdrSTTzc.js","./SelectValue-CrSaS-Kt.js","./TagsInputItemText-CszoEoLz.js","./extensionStore-CveIbRwz.js","./teamWorkspaceStore-CsZZpFU0.js","./remoteConfig-0E2rLe-N.js","./userStore-DHnsYsi1.js","./useImageQuiet-BNuH5iCW.js","./VideoPlayOverlay-K_gXsBIz.js","./useFeatureUsageTracker-B-33shAP.js","./telemetry-CLr022VN.js","./widgetTypes-DKb0MXCf.js","./envUtil-pF8O5Ge5.js","./markdownRendererUtil-0yaajO2y.js","./assetPreviewUtil-DKym8XkP.js","./vendor-other-DODGPXtn.css","./promotionUtils-DnZm_YOl.css","./useLoad3dViewer-B5nvmuTU.js","./useLoad3dViewer-OAWnLNzZ.js","./nodeTypes-BKkCXuZf.js","./SkeletonUtils-CvokxFWL.js"])))=>i.map(i=>d[i]);
import "./rolldown-runtime-w0pxe0c8.js";
import { Q as __vitePreload } from "./vendor-primevue-Di5q1E0M.js";
import { Ft as toRaw } from "./vendor-vue-core-ywZ1En3W.js";
import { a as OBJLoader2WorkerModule_default, c as FBXExporter, o as MtlObjBridge, s as OBJLoader2Parallel } from "./vendor-other-DslE47pR.js";
import { C as app, ea as useSettingStore } from "./promotionUtils-D7bbpSd5.js";
import { s as t } from "./i18n-DzSsN4Ea.js";
import { r as api } from "./api-DtOML0NT.js";
import { t as useToastStore } from "./toastStore-Dafwoqcw.js";
import { t as downloadBlob } from "./downloadUtil-Cl0cF0EY.js";
import { $ as Mesh, A as Clock, C as AnimationMixer, Ct as Vector2, D as BufferAttribute, E as Box3, G as LinearSRGBColorSpace, J as Material, N as DirectionalLight, O as BufferGeometry, P as Euler, R as GridHelper, S as AmbientLight, St as TextureLoader, T as Bone, V as Light, _ as clone, _t as SkinnedMesh, a as PLYLoader, at as OrthographicCamera, b as PMREMGenerator, bt as SpriteMaterial, c as GLTFLoader, ct as Points, d as OBJExporter, et as MeshBasicMaterial, f as GLTFExporter, g as EXRLoader, gt as SkeletonHelper, h as RGBELoader, i as SplatMesh, it as Object3D, j as Color, k as Camera, l as FBXLoader, lt as PointsMaterial, m as OrbitControls, mt as Scene, n as PlyReader, nt as MeshNormalMaterial, o as STLLoader, ot as PerspectiveCamera, p as TransformControls, pt as SRGBColorSpace, q as LoopRepeat, r as SparkRenderer, rt as MeshStandardMaterial, s as MTLLoader, st as PlaneGeometry, t as ViewHelper, tt as MeshDepthMaterial, u as STLExporter, w as BasicDepthPacking, wt as Vector3, x as WebGLRenderer, xt as Texture, yt as Sprite, z as Group } from "./vendor-three-JCi_5yX-.js";
import { t as WebGLViewport } from "./WebGLViewport-BUp5jTgC.js";
import { t as DIRECT_EXPORT_FORMATS } from "./constants-DUUberBO.js";
import { t as exceedsClickThreshold } from "./useClickDragGuard-qRfyQspx.js";
//#region src/extensions/core/load3d/Load3dUtils.ts
var Load3dUtils = class {
	static async uploadTempImage(imageData, prefix, fileType = "png") {
		const blob = await fetch(imageData).then((r) => r.blob());
		const name = `${prefix}_${Date.now()}.${fileType}`;
		const file = new File([blob], name, { type: fileType === "mp4" ? "video/mp4" : "image/png" });
		const body = new FormData();
		body.append("image", file);
		body.append("subfolder", "threed");
		body.append("type", "temp");
		const resp = await api.fetchApi("/upload/image", {
			method: "POST",
			body
		});
		if (resp.status !== 200) {
			const err = `Error uploading temp file: ${resp.status} - ${resp.statusText}`;
			useToastStore().addAlert(err);
			throw new Error(err);
		}
		return await resp.json();
	}
	static MAX_UPLOAD_SIZE_MB = 100;
	static async uploadFile(file, subfolder) {
		let uploadPath;
		const fileSizeMB = file.size / 1024 / 1024;
		if (fileSizeMB > this.MAX_UPLOAD_SIZE_MB) {
			const message = t("toastMessages.fileTooLarge", {
				size: fileSizeMB.toFixed(1),
				maxSize: this.MAX_UPLOAD_SIZE_MB
			});
			console.warn("[Load3D] uploadFile: file too large", fileSizeMB.toFixed(2), "MB");
			useToastStore().addAlert(message);
			return;
		}
		try {
			const body = new FormData();
			body.append("image", file);
			body.append("subfolder", subfolder);
			const resp = await api.fetchApi("/upload/image", {
				method: "POST",
				body
			});
			if (resp.status === 200) {
				const data = await resp.json();
				let path = data.name;
				if (data.subfolder) path = data.subfolder + "/" + path;
				uploadPath = path;
			} else useToastStore().addAlert(resp.status + " - " + resp.statusText);
		} catch (error) {
			console.error("[Load3D] uploadFile: exception", error);
			useToastStore().addAlert(error instanceof Error ? error.message : t("toastMessages.fileUploadFailed"));
		}
		return uploadPath;
	}
	static getFilenameExtension(url) {
		const queryString = url.split("?")[1];
		if (queryString) {
			const filename = new URLSearchParams(queryString).get("filename");
			if (filename) return filename.split(".").pop()?.toLowerCase();
		}
		return url.split("?")[0].split(".").pop()?.toLowerCase();
	}
	static splitFilePath(path) {
		const folder_separator = path.lastIndexOf("/");
		if (folder_separator === -1) return ["", path];
		return [path.substring(0, folder_separator), path.substring(folder_separator + 1)];
	}
	static getResourceURL(subfolder, filename, type = "input") {
		return `/view?${[
			"filename=" + encodeURIComponent(filename),
			"type=" + type,
			"subfolder=" + subfolder,
			app.getRandParam().substring(1)
		].join("&")}`;
	}
	static async uploadMultipleFiles(files, subfolder = "3d") {
		const uploadPromises = Array.from(files).map((file) => this.uploadFile(file, subfolder));
		await Promise.all(uploadPromises);
	}
	static mapSceneLightIntensityToHdri(sceneIntensity, sceneMin, sceneMax) {
		const span = sceneMax - sceneMin;
		const t = span > 0 ? (sceneIntensity - sceneMin) / span : 0;
		const mapped = Math.min(1, Math.max(0, t)) * 5;
		return Math.min(5, Math.max(.25, mapped));
	}
};
//#endregion
//#region src/extensions/core/load3d/AnimationManager.ts
var AnimationManager = class {
	currentAnimation = null;
	animationActions = [];
	animationClips = [];
	selectedAnimationIndex = 0;
	isAnimationPlaying = false;
	animationSpeed = 1;
	eventManager;
	constructor(eventManager) {
		this.eventManager = eventManager;
	}
	init() {}
	dispose() {
		if (this.currentAnimation) {
			this.animationActions.forEach((action) => {
				action.stop();
			});
			this.currentAnimation = null;
		}
		this.animationActions = [];
		this.animationClips = [];
		this.selectedAnimationIndex = 0;
		this.isAnimationPlaying = false;
		this.animationSpeed = 1;
		this.eventManager.emitEvent("animationListChange", []);
	}
	setupModelAnimations(model, originalModel) {
		if (this.currentAnimation) {
			this.currentAnimation.stopAllAction();
			this.animationActions = [];
		}
		let animations = [];
		if (model.animations?.length > 0) animations = model.animations;
		else if (originalModel && "animations" in originalModel && Array.isArray(originalModel.animations)) animations = originalModel.animations;
		if (animations.length > 0) {
			this.animationClips = animations;
			this.currentAnimation = new AnimationMixer(model);
			if (this.animationClips.length > 0) this.updateSelectedAnimation(0);
		} else this.animationClips = [];
		this.updateAnimationList();
	}
	updateAnimationList() {
		let updatedAnimationList = [];
		if (this.animationClips.length > 0) updatedAnimationList = this.animationClips.map((clip, index) => ({
			name: clip.name || `Animation ${index + 1}`,
			index
		}));
		this.eventManager.emitEvent("animationListChange", updatedAnimationList);
	}
	setAnimationSpeed(speed) {
		this.animationSpeed = speed;
		this.animationActions.forEach((action) => {
			action.setEffectiveTimeScale(speed);
		});
	}
	updateSelectedAnimation(index) {
		if (!this.currentAnimation || !this.animationClips || index >= this.animationClips.length) {
			console.warn("Invalid animation update request");
			return;
		}
		this.animationActions.forEach((action) => {
			action.stop();
		});
		this.currentAnimation.stopAllAction();
		this.animationActions = [];
		this.selectedAnimationIndex = index;
		const clip = this.animationClips[index];
		const action = this.currentAnimation.clipAction(clip);
		action.setEffectiveTimeScale(this.animationSpeed);
		action.reset();
		action.clampWhenFinished = false;
		action.loop = LoopRepeat;
		if (this.isAnimationPlaying) action.play();
		else {
			action.play();
			action.paused = true;
		}
		this.animationActions = [action];
		this.eventManager.emitEvent("animationProgressChange", {
			progress: 0,
			currentTime: 0,
			duration: clip.duration
		});
	}
	toggleAnimation(play) {
		if (!this.currentAnimation || this.animationActions.length === 0) {
			console.warn("No animation to toggle");
			return;
		}
		this.isAnimationPlaying = play ?? !this.isAnimationPlaying;
		this.animationActions.forEach((action) => {
			if (this.isAnimationPlaying) {
				action.paused = false;
				if (action.time === 0 || action.time === action.getClip().duration) action.reset();
			} else action.paused = true;
		});
	}
	update(delta) {
		if (this.currentAnimation && this.isAnimationPlaying) {
			this.currentAnimation.update(delta);
			if (this.animationActions.length > 0) {
				const action = this.animationActions[0];
				const clip = action.getClip();
				const progress = action.time / clip.duration * 100;
				this.eventManager.emitEvent("animationProgressChange", {
					progress,
					currentTime: action.time,
					duration: clip.duration
				});
			}
		}
	}
	getAnimationTime() {
		if (this.animationActions.length === 0) return 0;
		return this.animationActions[0].time;
	}
	getAnimationDuration() {
		if (this.animationActions.length === 0) return 0;
		return this.animationActions[0].getClip().duration;
	}
	setAnimationTime(time) {
		if (this.animationActions.length === 0) return;
		const duration = this.getAnimationDuration();
		const clampedTime = Math.max(0, Math.min(time, duration));
		const wasPaused = this.animationActions.map((action) => action.paused);
		this.animationActions.forEach((action) => {
			action.paused = false;
			action.time = clampedTime;
		});
		if (this.currentAnimation) {
			this.currentAnimation.setTime(clampedTime);
			this.currentAnimation.update(0);
		}
		this.animationActions.forEach((action, i) => {
			action.paused = wasPaused[i];
		});
		this.eventManager.emitEvent("animationProgressChange", {
			progress: clampedTime / duration * 100,
			currentTime: clampedTime,
			duration
		});
	}
	reset() {}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.AnimationManager = window.comfyAPI.AnimationManager || {};
window.comfyAPI.AnimationManager.AnimationManager = AnimationManager;
//#endregion
//#region src/extensions/core/load3d/CameraManager.ts
var CameraManager = class {
	perspectiveCamera;
	orthographicCamera;
	activeCamera;
	eventManager;
	controls = null;
	DEFAULT_DISTANCE = 10;
	DEFAULT_LOOK_AT = 0;
	DEFAULT_CAMERA = {
		near: .01,
		far: 1e4
	};
	DEFAULT_PERSPECTIVE_CAMERA = {
		fov: 35,
		aspect: 1
	};
	DEFAULT_FRUSTUM_SIZE = 10;
	DEFAULT_ORTHOGRAPHIC_CAMERA = {
		left: -this.DEFAULT_FRUSTUM_SIZE / 2,
		right: this.DEFAULT_FRUSTUM_SIZE / 2,
		top: this.DEFAULT_FRUSTUM_SIZE / 2,
		bottom: -this.DEFAULT_FRUSTUM_SIZE / 2
	};
	constructor(_renderer, eventManager) {
		this.eventManager = eventManager;
		this.perspectiveCamera = new PerspectiveCamera(this.DEFAULT_PERSPECTIVE_CAMERA.fov, this.DEFAULT_PERSPECTIVE_CAMERA.aspect, this.DEFAULT_CAMERA.near, this.DEFAULT_CAMERA.far);
		this.orthographicCamera = new OrthographicCamera(this.DEFAULT_ORTHOGRAPHIC_CAMERA.left, this.DEFAULT_ORTHOGRAPHIC_CAMERA.right, this.DEFAULT_ORTHOGRAPHIC_CAMERA.top, this.DEFAULT_ORTHOGRAPHIC_CAMERA.bottom, this.DEFAULT_CAMERA.near, this.DEFAULT_CAMERA.far);
		this.reset();
		this.activeCamera = this.perspectiveCamera;
	}
	init() {}
	dispose() {}
	setControls(controls) {
		this.controls = controls;
		if (this.controls) this.controls.addEventListener("end", () => {
			this.eventManager.emitEvent("cameraChanged", this.getCameraState());
		});
	}
	getCurrentCameraType() {
		return this.activeCamera === this.perspectiveCamera ? "perspective" : "orthographic";
	}
	toggleCamera(cameraType) {
		const oldCamera = this.activeCamera;
		const position = oldCamera.position.clone();
		const rotation = oldCamera.rotation.clone();
		const target = this.controls?.target.clone() || new Vector3();
		const oldZoom = oldCamera instanceof OrthographicCamera ? oldCamera.zoom : oldCamera.zoom;
		if (!cameraType) this.activeCamera = oldCamera === this.perspectiveCamera ? this.orthographicCamera : this.perspectiveCamera;
		else {
			this.activeCamera = cameraType === "perspective" ? this.perspectiveCamera : this.orthographicCamera;
			if (oldCamera === this.activeCamera) return;
		}
		this.activeCamera.position.copy(position);
		this.activeCamera.rotation.copy(rotation);
		if (this.activeCamera instanceof OrthographicCamera) {
			this.activeCamera.zoom = oldZoom;
			this.activeCamera.updateProjectionMatrix();
		} else if (this.activeCamera instanceof PerspectiveCamera) {
			this.activeCamera.zoom = oldZoom;
			this.activeCamera.updateProjectionMatrix();
		}
		if (this.controls) {
			this.controls.object = this.activeCamera;
			this.controls.target.copy(target);
			this.controls.update();
		}
		this.eventManager.emitEvent("cameraTypeChange", cameraType);
	}
	setFOV(fov) {
		if (this.activeCamera === this.perspectiveCamera) {
			this.perspectiveCamera.fov = fov;
			this.perspectiveCamera.updateProjectionMatrix();
		}
		this.eventManager.emitEvent("fovChange", fov);
	}
	getCameraState() {
		const { x, y, z, w } = this.activeCamera.quaternion;
		const activeCamera = this.activeCamera;
		return {
			position: this.activeCamera.position.clone(),
			target: this.controls?.target.clone() || new Vector3(),
			zoom: this.activeCamera instanceof OrthographicCamera ? this.activeCamera.zoom : this.activeCamera.zoom,
			cameraType: this.getCurrentCameraType(),
			quaternion: {
				x,
				y,
				z,
				w
			},
			fov: this.perspectiveCamera.fov,
			aspect: this.perspectiveCamera.aspect,
			near: activeCamera.near,
			far: activeCamera.far,
			frustum: {
				left: this.orthographicCamera.left,
				right: this.orthographicCamera.right,
				top: this.orthographicCamera.top,
				bottom: this.orthographicCamera.bottom
			}
		};
	}
	setCameraState(state) {
		this.activeCamera.position.copy(state.position);
		this.controls?.target.copy(state.target);
		if (this.activeCamera instanceof OrthographicCamera) {
			this.activeCamera.zoom = state.zoom;
			this.activeCamera.updateProjectionMatrix();
		} else if (this.activeCamera instanceof PerspectiveCamera) {
			this.activeCamera.zoom = state.zoom;
			this.activeCamera.updateProjectionMatrix();
		}
		this.controls?.update();
	}
	handleResize(width, height) {
		const aspect = width / height;
		this.updateAspectRatio(aspect);
	}
	updateAspectRatio(aspect) {
		if (this.activeCamera === this.perspectiveCamera) {
			this.perspectiveCamera.aspect = aspect;
			this.perspectiveCamera.updateProjectionMatrix();
		} else {
			const frustumSize = 10;
			this.orthographicCamera.left = -frustumSize * aspect / 2;
			this.orthographicCamera.right = frustumSize * aspect / 2;
			this.orthographicCamera.top = frustumSize / 2;
			this.orthographicCamera.bottom = -frustumSize / 2;
			this.orthographicCamera.updateProjectionMatrix();
		}
	}
	setupForModel(size, center = new Vector3(0, size.y / 2, 0)) {
		const maxDim = Math.max(size.x, size.y, size.z);
		const distance = Math.max(size.x, size.z) * 2;
		const height = center.y + maxDim;
		this.perspectiveCamera.position.set(center.x + distance, height, center.z + distance);
		this.orthographicCamera.position.set(center.x + distance, height, center.z + distance);
		if (this.activeCamera === this.perspectiveCamera) {
			this.perspectiveCamera.lookAt(center);
			this.perspectiveCamera.updateProjectionMatrix();
		} else {
			const frustumSize = maxDim * 2;
			const aspect = this.perspectiveCamera.aspect;
			this.orthographicCamera.left = -frustumSize * aspect / 2;
			this.orthographicCamera.right = frustumSize * aspect / 2;
			this.orthographicCamera.top = frustumSize / 2;
			this.orthographicCamera.bottom = -frustumSize / 2;
			this.orthographicCamera.lookAt(center);
			this.orthographicCamera.updateProjectionMatrix();
		}
		this.controls?.target.copy(center);
		this.controls?.update();
	}
	reset() {
		this.perspectiveCamera.position.set(this.DEFAULT_DISTANCE, this.DEFAULT_DISTANCE, this.DEFAULT_DISTANCE);
		this.orthographicCamera.position.set(this.DEFAULT_DISTANCE, this.DEFAULT_DISTANCE, this.DEFAULT_DISTANCE);
		this.perspectiveCamera.lookAt(this.DEFAULT_LOOK_AT, this.DEFAULT_LOOK_AT, this.DEFAULT_LOOK_AT);
		this.orthographicCamera.lookAt(this.DEFAULT_LOOK_AT, this.DEFAULT_LOOK_AT, this.DEFAULT_LOOK_AT);
		this.perspectiveCamera.updateProjectionMatrix();
		this.orthographicCamera.updateProjectionMatrix();
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.CameraManager = window.comfyAPI.CameraManager || {};
window.comfyAPI.CameraManager.CameraManager = CameraManager;
//#endregion
//#region src/extensions/core/load3d/ControlsManager.ts
var ControlsManager = class {
	controls;
	eventManager;
	camera;
	constructor(renderer, camera, eventManager) {
		this.eventManager = eventManager;
		this.camera = camera;
		const container = renderer.domElement.parentElement || renderer.domElement;
		this.controls = new OrbitControls(camera, container);
		this.controls.enableDamping = true;
	}
	init() {
		this.controls.addEventListener("end", () => {
			const cameraState = {
				position: this.camera.position.clone(),
				target: this.controls.target.clone(),
				zoom: this.camera instanceof OrthographicCamera ? this.camera.zoom : this.camera.zoom,
				cameraType: this.camera instanceof PerspectiveCamera ? "perspective" : "orthographic"
			};
			this.eventManager.emitEvent("cameraChanged", cameraState);
		});
	}
	dispose() {
		this.controls.dispose();
	}
	handleResize() {}
	update() {
		this.controls.update();
	}
	updateCamera(camera) {
		const position = this.controls.object.position.clone();
		const target = this.controls.target.clone();
		this.camera = camera;
		this.controls.object = camera;
		this.controls.target = target;
		camera.position.copy(position);
		this.controls.update();
	}
	detach() {
		this.controls.enabled = false;
	}
	attach() {
		this.controls.enabled = true;
	}
	reset() {
		this.controls.target.set(0, 0, 0);
		this.controls.update();
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.ControlsManager = window.comfyAPI.ControlsManager || {};
window.comfyAPI.ControlsManager.ControlsManager = ControlsManager;
//#endregion
//#region src/extensions/core/load3d/EventManager.ts
var EventManager = class {
	listeners = {};
	addEventListener(event, callback) {
		if (!this.listeners[event]) this.listeners[event] = [];
		this.listeners[event].push(callback);
	}
	removeEventListener(event, callback) {
		if (this.listeners[event]) this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
	}
	emitEvent(event, data) {
		if (this.listeners[event]) this.listeners[event].forEach((callback) => callback(data));
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.EventManager = window.comfyAPI.EventManager || {};
window.comfyAPI.EventManager.EventManager = EventManager;
//#endregion
//#region src/extensions/core/load3d/GizmoManager.ts
var GizmoManager = class {
	transformControls = null;
	targetObject = null;
	initialPosition = new Vector3();
	initialRotation = new Euler();
	initialScale = new Vector3(1, 1, 1);
	enabled = false;
	activeCamera;
	mode = "translate";
	scene;
	renderer;
	orbitControls;
	onTransformChange;
	constructor(scene, renderer, orbitControls, getActiveCamera, onTransformChange) {
		this.scene = scene;
		this.renderer = renderer;
		this.orbitControls = orbitControls;
		this.activeCamera = getActiveCamera();
		this.onTransformChange = onTransformChange;
	}
	init() {
		this.transformControls = new TransformControls(this.activeCamera, this.renderer.domElement);
		this.transformControls.addEventListener("dragging-changed", (event) => {
			this.orbitControls.enabled = !event.value;
			if (!event.value && this.onTransformChange) this.onTransformChange();
		});
		const helper = this.transformControls.getHelper();
		helper.name = "GizmoTransformControls";
		helper.renderOrder = 999;
		this.scene.add(helper);
	}
	setupForModel(model) {
		if (!this.transformControls) return;
		this.ensureHelperInScene();
		this.transformControls.detach();
		this.transformControls.enabled = false;
		this.targetObject = model;
		this.initialPosition.copy(model.position);
		this.initialRotation.copy(model.rotation);
		this.initialScale.copy(model.scale);
		if (this.enabled) {
			this.transformControls.attach(model);
			this.transformControls.setMode(this.mode);
			this.transformControls.enabled = true;
		}
	}
	detach() {
		this.enabled = false;
		if (this.transformControls) {
			this.transformControls.detach();
			this.transformControls.enabled = false;
		}
		this.targetObject = null;
	}
	setEnabled(enabled) {
		this.enabled = enabled;
		if (!this.transformControls) return;
		this.ensureHelperInScene();
		if (enabled && this.targetObject) {
			this.transformControls.attach(this.targetObject);
			this.transformControls.setMode(this.mode);
			this.transformControls.enabled = true;
		} else {
			this.transformControls.detach();
			this.transformControls.enabled = false;
		}
	}
	ensureHelperInScene() {
		if (!this.transformControls) return;
		const helper = this.transformControls.getHelper();
		if (!helper.parent) this.scene.add(helper);
	}
	removeFromScene() {
		if (!this.transformControls) return;
		const helper = this.transformControls.getHelper();
		if (helper.parent) helper.parent.remove(helper);
	}
	isEnabled() {
		return this.enabled;
	}
	updateCamera(camera) {
		this.activeCamera = camera;
		if (this.transformControls) this.transformControls.camera = camera;
	}
	setMode(mode) {
		this.mode = mode;
		if (this.transformControls) this.transformControls.setMode(mode);
	}
	getMode() {
		return this.mode;
	}
	reset() {
		if (!this.targetObject) return;
		this.targetObject.position.copy(this.initialPosition);
		this.targetObject.rotation.copy(this.initialRotation);
		this.targetObject.scale.copy(this.initialScale);
		this.onTransformChange?.();
	}
	applyTransform(position, rotation, scale) {
		if (!this.targetObject) return;
		this.targetObject.position.set(position.x, position.y, position.z);
		this.targetObject.rotation.set(rotation.x, rotation.y, rotation.z);
		if (scale) this.targetObject.scale.set(scale.x, scale.y, scale.z);
	}
	applyModelTransform(transform) {
		if (!this.targetObject) return;
		this.targetObject.position.set(transform.position.x, transform.position.y, transform.position.z);
		this.targetObject.quaternion.set(transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w);
		this.targetObject.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
		this.onTransformChange?.();
	}
	getInitialTransform() {
		return {
			position: {
				x: this.initialPosition.x,
				y: this.initialPosition.y,
				z: this.initialPosition.z
			},
			rotation: {
				x: this.initialRotation.x,
				y: this.initialRotation.y,
				z: this.initialRotation.z
			},
			scale: {
				x: this.initialScale.x,
				y: this.initialScale.y,
				z: this.initialScale.z
			}
		};
	}
	getTransform() {
		if (!this.targetObject) return {
			position: {
				x: 0,
				y: 0,
				z: 0
			},
			rotation: {
				x: 0,
				y: 0,
				z: 0
			},
			scale: {
				x: 1,
				y: 1,
				z: 1
			}
		};
		return {
			position: {
				x: this.targetObject.position.x,
				y: this.targetObject.position.y,
				z: this.targetObject.position.z
			},
			rotation: {
				x: this.targetObject.rotation.x,
				y: this.targetObject.rotation.y,
				z: this.targetObject.rotation.z
			},
			scale: {
				x: this.targetObject.scale.x,
				y: this.targetObject.scale.y,
				z: this.targetObject.scale.z
			}
		};
	}
	getModelInfo() {
		const object = this.targetObject;
		if (!object) return null;
		return {
			position: {
				x: object.position.x,
				y: object.position.y,
				z: object.position.z
			},
			quaternion: {
				x: object.quaternion.x,
				y: object.quaternion.y,
				z: object.quaternion.z,
				w: object.quaternion.w
			},
			scale: {
				x: object.scale.x,
				y: object.scale.y,
				z: object.scale.z
			}
		};
	}
	dispose() {
		if (this.transformControls) {
			const helper = this.transformControls.getHelper();
			this.scene.remove(helper);
			this.transformControls.detach();
			this.transformControls.dispose();
			this.transformControls = null;
		}
		this.targetObject = null;
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.GizmoManager = window.comfyAPI.GizmoManager || {};
window.comfyAPI.GizmoManager.GizmoManager = GizmoManager;
//#endregion
//#region src/extensions/core/load3d/HDRIManager.ts
var HDRIManager = class {
	scene;
	renderer;
	pmremGenerator;
	eventManager;
	hdriTexture = null;
	envMapTarget = null;
	_isEnabled = false;
	_showAsBackground = false;
	_intensity = 1;
	get isEnabled() {
		return this._isEnabled;
	}
	get showAsBackground() {
		return this._showAsBackground;
	}
	get intensity() {
		return this._intensity;
	}
	constructor(scene, renderer, eventManager) {
		this.scene = scene;
		this.renderer = renderer;
		this.pmremGenerator = new PMREMGenerator(renderer);
		this.pmremGenerator.compileEquirectangularShader();
		this.eventManager = eventManager;
	}
	async loadHDRI(url) {
		const ext = Load3dUtils.getFilenameExtension(url);
		let newTexture;
		if (ext === "exr") newTexture = await new Promise((resolve, reject) => {
			new EXRLoader().load(url, resolve, void 0, reject);
		});
		else newTexture = await new Promise((resolve, reject) => {
			new RGBELoader().load(url, resolve, void 0, reject);
		});
		newTexture.mapping = 303;
		const newEnvMapTarget = this.pmremGenerator.fromEquirectangular(newTexture);
		this.hdriTexture?.dispose();
		this.envMapTarget?.dispose();
		this.hdriTexture = newTexture;
		this.envMapTarget = newEnvMapTarget;
		if (this._isEnabled) this.applyToScene();
	}
	setEnabled(enabled) {
		this._isEnabled = enabled;
		if (enabled) {
			if (this.envMapTarget) this.applyToScene();
		} else this.removeFromScene();
	}
	setShowAsBackground(show) {
		this._showAsBackground = show;
		if (this._isEnabled && this.envMapTarget) this.applyToScene();
	}
	setIntensity(intensity) {
		this._intensity = intensity;
		if (this._isEnabled) this.scene.environmentIntensity = intensity;
	}
	applyToScene() {
		const envMap = this.envMapTarget?.texture;
		if (!envMap) return;
		this.scene.environment = envMap;
		this.scene.environmentIntensity = this._intensity;
		this.scene.background = this._showAsBackground ? this.hdriTexture : null;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = 1;
		this.eventManager.emitEvent("hdriChange", {
			enabled: this._isEnabled,
			showAsBackground: this._showAsBackground
		});
	}
	removeFromScene() {
		this.scene.environment = null;
		if (this.scene.background === this.hdriTexture) this.scene.background = null;
		this.renderer.toneMapping = 0;
		this.renderer.toneMappingExposure = 1;
		this.eventManager.emitEvent("hdriChange", {
			enabled: false,
			showAsBackground: this._showAsBackground
		});
	}
	clearResources() {
		this.removeFromScene();
		this.hdriTexture?.dispose();
		this.envMapTarget?.dispose();
		this.hdriTexture = null;
		this.envMapTarget = null;
	}
	clear() {
		this.clearResources();
		this._isEnabled = false;
	}
	dispose() {
		this.clearResources();
		this.pmremGenerator.dispose();
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.HDRIManager = window.comfyAPI.HDRIManager || {};
window.comfyAPI.HDRIManager.HDRIManager = HDRIManager;
//#endregion
//#region src/extensions/core/load3d/LightingManager.ts
var LightingManager = class {
	lights = [];
	currentIntensity = 3;
	scene;
	eventManager;
	lightMultipliers = /* @__PURE__ */ new Map();
	constructor(scene, eventManager) {
		this.scene = scene;
		this.eventManager = eventManager;
	}
	init() {
		this.setupLights();
	}
	dispose() {
		this.lights.forEach((light) => {
			this.scene.remove(light);
		});
		this.lights = [];
		this.lightMultipliers.clear();
	}
	setupLights() {
		const addLight = (light, multiplier) => {
			this.scene.add(light);
			this.lights.push(light);
			this.lightMultipliers.set(light, multiplier);
		};
		addLight(new AmbientLight(16777215, .5), .5);
		const mainLight = new DirectionalLight(16777215, .8);
		mainLight.position.set(0, 10, 10);
		addLight(mainLight, .8);
		const backLight = new DirectionalLight(16777215, .5);
		backLight.position.set(0, 10, -10);
		addLight(backLight, .5);
		const leftFillLight = new DirectionalLight(16777215, .3);
		leftFillLight.position.set(-10, 0, 0);
		addLight(leftFillLight, .3);
		const rightFillLight = new DirectionalLight(16777215, .3);
		rightFillLight.position.set(10, 0, 0);
		addLight(rightFillLight, .3);
		const bottomLight = new DirectionalLight(16777215, .2);
		bottomLight.position.set(0, -10, 0);
		addLight(bottomLight, .2);
	}
	setLightIntensity(intensity) {
		this.currentIntensity = intensity;
		this.lights.forEach((light) => {
			light.intensity = intensity * (this.lightMultipliers.get(light) ?? 1);
		});
		this.eventManager.emitEvent("lightIntensityChange", intensity);
	}
	setHDRIMode(hdriActive) {
		this.lights.forEach((light) => {
			light.visible = !hdriActive;
		});
	}
	reset() {}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.LightingManager = window.comfyAPI.LightingManager || {};
window.comfyAPI.LightingManager.LightingManager = LightingManager;
//#endregion
//#region src/extensions/core/load3d/ModelExporter.ts
var ModelExporter = class ModelExporter {
	static detectFormatFromURL(url) {
		try {
			const filenameParam = new URLSearchParams(url.split("?")[1]).get("filename");
			if (filenameParam) return filenameParam.split(".").pop()?.toLowerCase() || null;
		} catch (e) {
			console.error("Error parsing URL:", e);
		}
		return null;
	}
	static canUseDirectURL(url, format) {
		if (!url) return false;
		const urlFormat = ModelExporter.detectFormatFromURL(url);
		if (!urlFormat) return false;
		return urlFormat.toLowerCase() === format.toLowerCase();
	}
	static async downloadFromURL(url, desiredFilename) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to download file (HTTP ${response.status})`);
			downloadBlob(desiredFilename, await response.blob());
		} catch (error) {
			console.error("Error downloading from URL:", error);
			useToastStore().addAlert(t("toastMessages.failedToDownloadFile"));
			throw error;
		}
	}
	static async exportGLB(model, filename = "model.glb", originalURL) {
		if (originalURL && ModelExporter.canUseDirectURL(originalURL, "glb")) return ModelExporter.downloadFromURL(originalURL, filename);
		const exporter = new GLTFExporter();
		try {
			await new Promise((resolve) => setTimeout(resolve, 50));
			const result = await new Promise((resolve, reject) => {
				exporter.parse(model, (gltf) => {
					resolve(gltf);
				}, (error) => {
					reject(error);
				}, { binary: true });
			});
			await new Promise((resolve) => setTimeout(resolve, 50));
			ModelExporter.saveArrayBuffer(result, filename);
		} catch (error) {
			console.error("Error exporting GLB:", error);
			useToastStore().addAlert(t("toastMessages.failedToExportModel", { format: "GLB" }));
			throw error;
		}
	}
	static async exportOBJ(model, filename = "model.obj", originalURL) {
		if (originalURL && ModelExporter.canUseDirectURL(originalURL, "obj")) return ModelExporter.downloadFromURL(originalURL, filename);
		const exporter = new OBJExporter();
		try {
			await new Promise((resolve) => setTimeout(resolve, 50));
			const result = exporter.parse(model);
			await new Promise((resolve) => setTimeout(resolve, 50));
			ModelExporter.saveString(result, filename);
		} catch (error) {
			console.error("Error exporting OBJ:", error);
			useToastStore().addAlert(t("toastMessages.failedToExportModel", { format: "OBJ" }));
			throw error;
		}
	}
	static async exportFBX(model, filename = "model.fbx", originalURL) {
		if (originalURL && ModelExporter.canUseDirectURL(originalURL, "fbx")) return ModelExporter.downloadFromURL(originalURL, filename);
		const exporter = new FBXExporter();
		try {
			await new Promise((resolve) => setTimeout(resolve, 50));
			const bytes = await exporter.parseAsync(model);
			await new Promise((resolve) => setTimeout(resolve, 50));
			ModelExporter.saveArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), filename);
		} catch (error) {
			console.error("Error exporting FBX:", error);
			useToastStore().addAlert(t("toastMessages.failedToExportModel", { format: "FBX" }));
			throw error;
		}
	}
	static async exportSTL(model, filename = "model.stl", originalURL) {
		if (originalURL && ModelExporter.canUseDirectURL(originalURL, "stl")) return ModelExporter.downloadFromURL(originalURL, filename);
		const exporter = new STLExporter();
		try {
			await new Promise((resolve) => setTimeout(resolve, 50));
			const result = exporter.parse(model);
			await new Promise((resolve) => setTimeout(resolve, 50));
			ModelExporter.saveString(result, filename);
		} catch (error) {
			console.error("Error exporting STL:", error);
			useToastStore().addAlert(t("toastMessages.failedToExportModel", { format: "STL" }));
			throw error;
		}
	}
	static async exportDirect(originalURL, filename, format) {
		if (!originalURL) throw new Error(`No source file available to export as ${format}`);
		return ModelExporter.downloadFromURL(originalURL, filename);
	}
	static saveArrayBuffer(buffer, filename) {
		downloadBlob(filename, new Blob([buffer], { type: "application/octet-stream" }));
	}
	static saveString(text, filename) {
		downloadBlob(filename, new Blob([text], { type: "text/plain" }));
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.ModelExporter = window.comfyAPI.ModelExporter || {};
window.comfyAPI.ModelExporter.ModelExporter = ModelExporter;
//#endregion
//#region src/extensions/core/load3d/ModelAdapter.ts
var DEFAULT_MODEL_CAPABILITIES = {
	fitToViewer: true,
	requiresMaterialRebuild: false,
	gizmoTransform: true,
	lighting: true,
	exportable: true,
	materialModes: [
		"original",
		"normal",
		"wireframe"
	],
	fitTargetSize: 5
};
var createAdapterRef = () => ({
	current: null,
	capabilities: null
});
async function fetchModelData(path, filename) {
	const route = "/" + path.replace(/^api\//, "") + encodeURIComponent(filename);
	const response = await api.fetchApi(route);
	if (!response.ok) throw new Error(`Failed to fetch model: ${response.status}`);
	return response.arrayBuffer();
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.ModelAdapter = window.comfyAPI.ModelAdapter || {};
window.comfyAPI.ModelAdapter.DEFAULT_MODEL_CAPABILITIES = DEFAULT_MODEL_CAPABILITIES;
window.comfyAPI.ModelAdapter.createAdapterRef = createAdapterRef;
window.comfyAPI.ModelAdapter.fetchModelData = fetchModelData;
//#endregion
//#region src/extensions/core/load3d/load3dContextMenuGuard.ts
function attachContextMenuGuard(target, onMenu, { isDisabled = () => false, dragThreshold = 5 } = {}) {
	const abort = new AbortController();
	const { signal } = abort;
	let start = {
		x: 0,
		y: 0
	};
	let moved = false;
	target.addEventListener("mousedown", (e) => {
		if (e.button === 2) {
			start = {
				x: e.clientX,
				y: e.clientY
			};
			moved = false;
		}
	}, { signal });
	target.addEventListener("mousemove", (e) => {
		if (e.buttons === 2 && exceedsClickThreshold(start, {
			x: e.clientX,
			y: e.clientY
		}, dragThreshold)) moved = true;
	}, { signal });
	target.addEventListener("contextmenu", (e) => {
		if (isDisabled()) return;
		const wasDragging = moved || exceedsClickThreshold(start, {
			x: e.clientX,
			y: e.clientY
		}, dragThreshold);
		moved = false;
		if (wasDragging) return;
		e.preventDefault();
		e.stopPropagation();
		onMenu(e);
	}, { signal });
	return () => abort.abort();
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.load3dContextMenuGuard = window.comfyAPI.load3dContextMenuGuard || {};
window.comfyAPI.load3dContextMenuGuard.attachContextMenuGuard = attachContextMenuGuard;
//#endregion
//#region src/extensions/core/load3d/load3dRenderLoop.ts
function startRenderLoop({ tick, isActive }) {
	let frameId = null;
	const loop = () => {
		frameId = requestAnimationFrame(loop);
		if (!isActive()) return;
		tick();
	};
	loop();
	return { stop() {
		if (frameId !== null) {
			cancelAnimationFrame(frameId);
			frameId = null;
		}
	} };
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.load3dRenderLoop = window.comfyAPI.load3dRenderLoop || {};
window.comfyAPI.load3dRenderLoop.startRenderLoop = startRenderLoop;
//#endregion
//#region src/extensions/core/load3d/load3dViewport.ts
function computeLetterboxedViewport(container, targetAspectRatio) {
	if (container.width / container.height > targetAspectRatio) {
		const height = container.height;
		const width = height * targetAspectRatio;
		return {
			offsetX: (container.width - width) / 2,
			offsetY: 0,
			width,
			height
		};
	}
	const width = container.width;
	const height = width / targetAspectRatio;
	return {
		offsetX: 0,
		offsetY: (container.height - height) / 2,
		width,
		height
	};
}
function isLoad3dActive(flags) {
	return flags.mouseOnNode || flags.mouseOnScene || flags.mouseOnViewer || flags.recording || !flags.initialRenderDone || flags.animationPlaying;
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.load3dViewport = window.comfyAPI.load3dViewport || {};
window.comfyAPI.load3dViewport.computeLetterboxedViewport = computeLetterboxedViewport;
window.comfyAPI.load3dViewport.isLoad3dActive = isLoad3dActive;
//#endregion
//#region src/extensions/core/load3d/Viewport3d.ts
var Viewport3d = class extends WebGLViewport {
	clock;
	renderLoop = null;
	onContextMenuCallback;
	getDimensionsCallback;
	eventManager;
	sceneManager;
	cameraManager;
	controlsManager;
	lightingManager;
	viewHelperManager;
	STATUS_MOUSE_ON_NODE;
	STATUS_MOUSE_ON_SCENE;
	STATUS_MOUSE_ON_VIEWER;
	INITIAL_RENDER_DONE = false;
	targetWidth = 0;
	targetHeight = 0;
	targetAspectRatio = 1;
	isViewerMode = false;
	disposeContextMenuGuard = null;
	getZoomScaleCallback;
	externalActiveCamera = null;
	overlay = null;
	initialRenderTimer = null;
	constructor(container, deps, options = {}) {
		super(deps.renderer);
		this.clock = new Clock();
		this.isViewerMode = options.isViewerMode || false;
		this.onContextMenuCallback = options.onContextMenu;
		this.getDimensionsCallback = options.getDimensions;
		this.getZoomScaleCallback = options.getZoomScale;
		if (options.width !== void 0 && options.height !== void 0) this.applyTargetSize(options.width, options.height);
		this.eventManager = deps.eventManager;
		this.sceneManager = deps.sceneManager;
		this.cameraManager = deps.cameraManager;
		this.controlsManager = deps.controlsManager;
		this.lightingManager = deps.lightingManager;
		this.viewHelperManager = deps.viewHelperManager;
		this.sceneManager.init();
		this.cameraManager.init();
		this.controlsManager.init();
		this.lightingManager.init();
		this.viewHelperManager.createViewHelper(container);
		this.viewHelperManager.init();
		this.STATUS_MOUSE_ON_NODE = false;
		this.STATUS_MOUSE_ON_SCENE = false;
		this.STATUS_MOUSE_ON_VIEWER = false;
		this.initContextMenu();
		this.observeResize(container, () => this.handleResize());
	}
	start() {
		if (this.hasStarted) return;
		this.hasStarted = true;
		this.handleResize();
		this.startAnimation();
		this.initialRenderTimer = setTimeout(() => {
			this.initialRenderTimer = null;
			this.forceRender();
		}, 100);
	}
	hasStarted = false;
	applyTargetSize(width, height) {
		if (!Number.isFinite(width) || !Number.isFinite(height)) return;
		if (width <= 0 || height <= 0) return;
		this.targetWidth = width;
		this.targetHeight = height;
		this.targetAspectRatio = width / height;
	}
	initContextMenu() {
		this.disposeContextMenuGuard = attachContextMenuGuard(this.renderer.domElement, (event) => this.onContextMenuCallback?.(event), { isDisabled: () => this.isViewerMode });
	}
	getEventManager() {
		return this.eventManager;
	}
	getSceneManager() {
		return this.sceneManager;
	}
	getCameraManager() {
		return this.cameraManager;
	}
	getControlsManager() {
		return this.controlsManager;
	}
	getLightingManager() {
		return this.lightingManager;
	}
	getViewHelperManager() {
		return this.viewHelperManager;
	}
	getTargetSize() {
		return {
			width: this.targetWidth,
			height: this.targetHeight
		};
	}
	shouldMaintainAspectRatio() {
		return this.isViewerMode || this.targetWidth > 0 && this.targetHeight > 0;
	}
	forceRender() {
		const delta = this.clock.getDelta();
		this.tickPerFrame(delta);
		this.renderMainScene();
		this.resetViewport();
		if (this.viewHelperManager.viewHelper.render) this.viewHelperManager.viewHelper.render(this.renderer);
		this.INITIAL_RENDER_DONE = true;
	}
	tickPerFrame(delta) {
		this.overlay?.update?.(delta);
		this.viewHelperManager.update(delta);
		this.controlsManager.update();
	}
	getRenderCamera() {
		return this.externalActiveCamera ?? this.cameraManager.activeCamera;
	}
	setExternalActiveCamera(camera) {
		if (this.externalActiveCamera === camera) return;
		this.externalActiveCamera = camera;
		if (camera) {
			this.controlsManager.detach();
			this.viewHelperManager.visibleViewHelper(false);
		} else {
			this.controlsManager.attach();
			this.viewHelperManager.visibleViewHelper(true);
		}
		this.overlay?.onActiveCameraChange?.(this.getRenderCamera());
		this.forceRender();
	}
	setOverlay(overlay) {
		if (this.overlay === overlay) return;
		if (this.overlay) {
			this.overlay.detach();
			this.overlay.dispose();
		}
		this.overlay = overlay;
		overlay.attach(this.sceneManager.scene);
		overlay.onActiveCameraChange?.(this.getRenderCamera());
		this.forceRender();
	}
	removeOverlay() {
		if (!this.overlay) return;
		this.overlay.detach();
		this.overlay.dispose();
		this.overlay = null;
		this.forceRender();
	}
	getOverlay() {
		return this.overlay;
	}
	renderMainScene() {
		const containerWidth = this.renderer.domElement.clientWidth;
		const containerHeight = this.renderer.domElement.clientHeight;
		if (this.getDimensionsCallback) {
			const dims = this.getDimensionsCallback();
			if (dims) this.applyTargetSize(dims.width, dims.height);
		}
		if (this.shouldMaintainAspectRatio()) {
			const { offsetX, offsetY, width, height } = computeLetterboxedViewport({
				width: containerWidth,
				height: containerHeight
			}, this.targetAspectRatio);
			this.renderer.setViewport(0, 0, containerWidth, containerHeight);
			this.renderer.setScissor(0, 0, containerWidth, containerHeight);
			this.renderer.setScissorTest(true);
			this.renderer.setClearColor(657930);
			this.renderer.clear();
			this.renderer.setViewport(offsetX, offsetY, width, height);
			this.renderer.setScissor(offsetX, offsetY, width, height);
			this.cameraManager.updateAspectRatio(width / height);
		} else {
			this.renderer.setViewport(0, 0, containerWidth, containerHeight);
			this.renderer.setScissor(0, 0, containerWidth, containerHeight);
			this.renderer.setScissorTest(true);
		}
		this.sceneManager.renderBackground();
		this.renderer.render(this.sceneManager.scene, this.getRenderCamera());
	}
	resetViewport() {
		const width = this.renderer.domElement.clientWidth;
		const height = this.renderer.domElement.clientHeight;
		this.renderer.setViewport(0, 0, width, height);
		this.renderer.setScissor(0, 0, width, height);
		this.renderer.setScissorTest(false);
	}
	startAnimation() {
		this.renderLoop = startRenderLoop({
			tick: () => {
				const delta = this.clock.getDelta();
				this.tickPerFrame(delta);
				this.renderMainScene();
				this.resetViewport();
				if (this.viewHelperManager.viewHelper.render) this.viewHelperManager.viewHelper.render(this.renderer);
			},
			isActive: () => this.isActive()
		});
	}
	updateStatusMouseOnNode(onNode) {
		this.STATUS_MOUSE_ON_NODE = onNode;
	}
	updateStatusMouseOnScene(onScene) {
		this.STATUS_MOUSE_ON_SCENE = onScene;
	}
	updateStatusMouseOnViewer(onViewer) {
		this.STATUS_MOUSE_ON_VIEWER = onViewer;
	}
	isActive() {
		return isLoad3dActive({
			mouseOnNode: this.STATUS_MOUSE_ON_NODE,
			mouseOnScene: this.STATUS_MOUSE_ON_SCENE,
			mouseOnViewer: this.STATUS_MOUSE_ON_VIEWER,
			recording: false,
			initialRenderDone: this.INITIAL_RENDER_DONE,
			animationPlaying: false
		});
	}
	toggleCamera(cameraType) {
		this.cameraManager.toggleCamera(cameraType);
		this.controlsManager.updateCamera(this.cameraManager.activeCamera);
		this.onActiveCameraChanged();
		this.viewHelperManager.recreateViewHelper();
		if (!this.externalActiveCamera) this.overlay?.onActiveCameraChange?.(this.cameraManager.activeCamera);
		this.handleResize();
	}
	onActiveCameraChanged() {}
	getCurrentCameraType() {
		return this.cameraManager.getCurrentCameraType();
	}
	setCameraState(state) {
		this.cameraManager.setCameraState(state);
		this.forceRender();
	}
	getCameraState() {
		return this.cameraManager.getCameraState();
	}
	setTargetSize(width, height) {
		this.applyTargetSize(width, height);
		this.handleResize();
	}
	addEventListener(event, callback) {
		this.eventManager.addEventListener(event, callback);
	}
	removeEventListener(event, callback) {
		this.eventManager.removeEventListener(event, callback);
	}
	refreshViewport() {
		this.handleResize();
	}
	handleResize() {
		const parentElement = this.renderer?.domElement?.parentElement;
		if (!parentElement) {
			console.warn("Parent element not found");
			return;
		}
		const containerWidth = parentElement.clientWidth;
		const containerHeight = parentElement.clientHeight;
		const zoomScale = this.getZoomScaleCallback?.() ?? 1;
		this.renderer.setPixelRatio(Math.min(zoomScale, 3));
		if (this.getDimensionsCallback) {
			const dims = this.getDimensionsCallback();
			if (dims) this.applyTargetSize(dims.width, dims.height);
		}
		if (this.shouldMaintainAspectRatio()) {
			const { width, height } = computeLetterboxedViewport({
				width: containerWidth,
				height: containerHeight
			}, this.targetAspectRatio);
			this.renderer.setSize(containerWidth, containerHeight);
			this.cameraManager.handleResize(width, height);
			this.sceneManager.handleResize(width, height);
		} else {
			this.renderer.setSize(containerWidth, containerHeight);
			this.cameraManager.handleResize(containerWidth, containerHeight);
			this.sceneManager.handleResize(containerWidth, containerHeight);
		}
		this.forceRender();
	}
	remove() {
		if (this.initialRenderTimer) {
			clearTimeout(this.initialRenderTimer);
			this.initialRenderTimer = null;
		}
		this.disposeContextMenuGuard?.();
		this.disposeContextMenuGuard = null;
		this.renderLoop?.stop();
		this.renderLoop = null;
		this.disposeManagers();
		this.disposeRenderer();
	}
	disposeManagers() {
		if (this.overlay) {
			this.overlay.detach();
			this.overlay.dispose();
			this.overlay = null;
		}
		this.sceneManager.dispose();
		this.cameraManager.dispose();
		this.controlsManager.dispose();
		this.lightingManager.dispose();
		this.viewHelperManager.dispose();
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.Viewport3d = window.comfyAPI.Viewport3d || {};
window.comfyAPI.Viewport3d.Viewport3d = Viewport3d;
//#endregion
//#region src/extensions/core/load3d/cameraFromMatrices.ts
function computeCameraFromMatrices(extrinsics, intrinsics) {
	assertMatrixShape(extrinsics, 4, 4, "extrinsics");
	assertMatrixShape(intrinsics, 3, 3, "intrinsics");
	const r00 = extrinsics[0][0];
	const r01 = extrinsics[0][1];
	const r02 = extrinsics[0][2];
	const r10 = extrinsics[1][0];
	const r11 = extrinsics[1][1];
	const r12 = extrinsics[1][2];
	const r20 = extrinsics[2][0];
	const r21 = extrinsics[2][1];
	const r22 = extrinsics[2][2];
	const tx = extrinsics[0][3];
	const ty = extrinsics[1][3];
	const tz = extrinsics[2][3];
	const posX = -(r00 * tx + r10 * ty + r20 * tz);
	const posY = -(r01 * tx + r11 * ty + r21 * tz);
	const posZ = -(r02 * tx + r12 * ty + r22 * tz);
	const targetX = posX + r20;
	const targetY = posY + r21;
	const targetZ = posZ + r22;
	const fy = intrinsics[1][1];
	const cy = intrinsics[1][2];
	if (!Number.isFinite(fy) || fy === 0) throw new Error(`intrinsics[1][1] (fy) must be a non-zero finite number, got ${fy}`);
	const fovYDegrees = 2 * Math.atan(cy / fy) * 180 / Math.PI;
	return {
		position: [
			posX,
			-posY,
			-posZ
		],
		target: [
			targetX,
			-targetY,
			-targetZ
		],
		fovYDegrees
	};
}
function assertMatrixShape(matrix, rows, cols, name) {
	if (matrix.length !== rows) throw new Error(`${name} must be ${rows}x${cols}, got ${matrix.length} rows`);
	for (let i = 0; i < rows; i++) if (matrix[i].length !== cols) throw new Error(`${name} row ${i} must have ${cols} columns, got ${matrix[i].length}`);
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.cameraFromMatrices = window.comfyAPI.cameraFromMatrices || {};
window.comfyAPI.cameraFromMatrices.computeCameraFromMatrices = computeCameraFromMatrices;
//#endregion
//#region src/extensions/core/load3d/Load3d.ts
function positionThumbnailCamera(camera, model) {
	const box = new Box3().setFromObject(model);
	const size = box.getSize(new Vector3());
	const center = box.getCenter(new Vector3());
	const distance = Math.max(size.x, size.y, size.z) * 1.5;
	camera.position.set(center.x + distance * .7, center.y + distance * .5, center.z + distance * .7);
	camera.lookAt(center);
	camera.updateProjectionMatrix();
}
var Load3d = class extends Viewport3d {
	hdriManager;
	loaderManager;
	modelManager;
	recordingManager;
	animationManager;
	gizmoManager;
	adapterRef;
	loadingPromise = null;
	_loadGeneration = 0;
	hasLoadedModel = false;
	constructor(container, deps, options = {}) {
		super(container, deps, options);
		this.hdriManager = deps.hdriManager;
		this.loaderManager = deps.loaderManager;
		this.modelManager = deps.modelManager;
		this.recordingManager = deps.recordingManager;
		this.animationManager = deps.animationManager;
		this.gizmoManager = deps.gizmoManager;
		this.adapterRef = deps.adapterRef;
		this.loaderManager.init();
		this.animationManager.init();
		this.gizmoManager.init();
		this.eventManager.addEventListener("modelReady", () => {
			if (this.adapterRef.current?.kind !== "splat") return;
			this.repaintWhenSparkPaintable();
		});
		this.start();
	}
	async repaintWhenSparkPaintable() {
		const sortComplete = this.sceneManager.awaitNextSparkDirty();
		this.forceRender();
		await sortComplete;
		this.forceRender();
	}
	getLoaderManager() {
		return this.loaderManager;
	}
	getModelManager() {
		return this.modelManager;
	}
	getRecordingManager() {
		return this.recordingManager;
	}
	getGizmoManager() {
		return this.gizmoManager;
	}
	tickPerFrame(delta) {
		this.animationManager.update(delta);
		super.tickPerFrame(delta);
	}
	isActive() {
		return isLoad3dActive({
			mouseOnNode: this.STATUS_MOUSE_ON_NODE,
			mouseOnScene: this.STATUS_MOUSE_ON_SCENE,
			mouseOnViewer: this.STATUS_MOUSE_ON_VIEWER,
			recording: this.isRecording(),
			initialRenderDone: this.INITIAL_RENDER_DONE,
			animationPlaying: this.animationManager.isAnimationPlaying
		});
	}
	async exportModel(format) {
		if (!this.modelManager.currentModel) throw new Error("No model to export");
		const exportMessage = `Exporting as ${format.toUpperCase()}...`;
		this.eventManager.emitEvent("exportLoadingStart", exportMessage);
		const filename = `${this.modelManager.originalFileName || "model"}.${format}`;
		const originalURL = this.modelManager.originalURL;
		if (DIRECT_EXPORT_FORMATS.has(format)) {
			try {
				if (this.getSourceFormat() !== format) throw new Error(`Cannot export ${format} without converting from the loaded ${this.getSourceFormat() ?? "unknown"} source`);
				await ModelExporter.exportDirect(originalURL, filename, format);
			} catch (error) {
				console.error(`Error exporting model as ${format}:`, error);
				throw error;
			} finally {
				this.eventManager.emitEvent("exportLoadingEnd", null);
			}
			return;
		}
		const source = this.modelManager.currentModel;
		const savedPos = source.position.clone();
		const savedRot = source.rotation.clone();
		const savedScale = source.scale.clone();
		source.position.set(0, 0, 0);
		source.rotation.set(0, 0, 0);
		source.scale.set(1, 1, 1);
		source.updateMatrixWorld(true);
		try {
			const original = this.modelManager.originalModel;
			const clipsFromOriginal = original && "animations" in original && Array.isArray(original.animations) ? original.animations : [];
			const clips = source.animations?.length ? source.animations : clipsFromOriginal;
			const model = format === "fbx" ? Object.assign(clone(source), { animations: clips }) : source.clone();
			await new Promise((resolve) => setTimeout(resolve, 10));
			switch (format) {
				case "glb":
					await ModelExporter.exportGLB(model, filename, originalURL);
					break;
				case "obj":
					await ModelExporter.exportOBJ(model, filename, originalURL);
					break;
				case "stl":
					await ModelExporter.exportSTL(model, filename, originalURL);
					break;
				case "fbx":
					await ModelExporter.exportFBX(model, filename, originalURL);
					break;
				default: throw new Error(`Unsupported export format: ${format}`);
			}
			await new Promise((resolve) => setTimeout(resolve, 10));
		} catch (error) {
			console.error(`Error exporting model as ${format}:`, error);
			throw error;
		} finally {
			source.position.copy(savedPos);
			source.rotation.copy(savedRot);
			source.scale.copy(savedScale);
			source.updateMatrixWorld(true);
			this.eventManager.emitEvent("exportLoadingEnd", null);
		}
	}
	getSourceFormat() {
		const url = this.modelManager.originalURL;
		if (!url) return null;
		return ModelExporter.detectFormatFromURL(url);
	}
	onActiveCameraChanged() {
		this.gizmoManager.updateCamera(this.cameraManager.activeCamera);
	}
	setFOV(fov) {
		this.cameraManager.setFOV(fov);
		this.forceRender();
	}
	setBackgroundColor(color) {
		this.sceneManager.setBackgroundColor(color);
		this.forceRender();
	}
	toggleGrid(showGrid) {
		this.sceneManager.toggleGrid(showGrid);
		this.forceRender();
	}
	setLightIntensity(intensity) {
		this.lightingManager.setLightIntensity(intensity);
		this.forceRender();
	}
	async setBackgroundImage(uploadPath) {
		await this.sceneManager.setBackgroundImage(uploadPath);
		if (this.sceneManager.backgroundTexture && this.sceneManager.backgroundMesh) {
			const containerWidth = this.renderer.domElement.clientWidth;
			const containerHeight = this.renderer.domElement.clientHeight;
			if (this.shouldMaintainAspectRatio()) {
				const { width, height } = computeLetterboxedViewport({
					width: containerWidth,
					height: containerHeight
				}, this.targetAspectRatio);
				this.sceneManager.updateBackgroundSize(this.sceneManager.backgroundTexture, this.sceneManager.backgroundMesh, width, height);
			} else this.sceneManager.updateBackgroundSize(this.sceneManager.backgroundTexture, this.sceneManager.backgroundMesh, containerWidth, containerHeight);
		}
		this.forceRender();
	}
	removeBackgroundImage() {
		this.sceneManager.removeBackgroundImage();
		this.forceRender();
	}
	setBackgroundRenderMode(mode) {
		this.sceneManager.setBackgroundRenderMode(mode);
		this.forceRender();
	}
	setCameraFromMatrices(extrinsics, intrinsics) {
		const { position, target, fovYDegrees } = computeCameraFromMatrices(extrinsics, intrinsics);
		const current = this.cameraManager.getCameraState();
		this.setCameraState({
			position: new Vector3(position[0], position[1], position[2]),
			target: new Vector3(target[0], target[1], target[2]),
			zoom: current.zoom,
			cameraType: current.cameraType
		});
		this.setFOV(fovYDegrees);
	}
	getCurrentModel() {
		return this.modelManager.currentModel;
	}
	setMaterialMode(mode) {
		this.modelManager.setMaterialMode(mode);
		this.forceRender();
	}
	get currentLoadGeneration() {
		return this._loadGeneration;
	}
	async loadModel(url, originalFileName, options) {
		this._loadGeneration += 1;
		if (this.loadingPromise) try {
			await this.loadingPromise;
		} catch (e) {}
		this.loadingPromise = this._loadModelInternal(url, originalFileName, options);
		return this.loadingPromise;
	}
	async whenLoadIdle() {
		let last = null;
		while (this.loadingPromise && this.loadingPromise !== last) {
			last = this.loadingPromise;
			try {
				await last;
			} catch (e) {}
		}
	}
	async _loadModelInternal(url, originalFileName, options) {
		const shouldRetainView = this.hasLoadedModel;
		const savedCameraState = shouldRetainView ? this.cameraManager.getCameraState() : null;
		if (!shouldRetainView) {
			this.cameraManager.reset();
			this.controlsManager.reset();
		}
		this.gizmoManager.detach();
		this.modelManager.clearModel();
		this.animationManager.dispose();
		await this.loaderManager.loadModel(url, originalFileName, options);
		if (this.modelManager.currentModel) {
			this.animationManager.setupModelAnimations(this.modelManager.currentModel, this.modelManager.originalModel);
			this.hasLoadedModel = true;
		}
		if (savedCameraState) {
			if (savedCameraState.cameraType !== this.cameraManager.getCurrentCameraType()) this.toggleCamera(savedCameraState.cameraType);
			this.cameraManager.setCameraState(savedCameraState);
		}
		this.handleResize();
		this.loadingPromise = null;
	}
	isSplatModel() {
		return this.adapterRef.current?.kind === "splat";
	}
	isPlyModel() {
		return this.adapterRef.current?.kind === "pointCloud";
	}
	getCurrentModelCapabilities() {
		return this.adapterRef.capabilities ?? DEFAULT_MODEL_CAPABILITIES;
	}
	clearModel() {
		this.animationManager.dispose();
		this.gizmoManager.detach();
		this.modelManager.clearModel();
		this.adapterRef.current = null;
		this.hasLoadedModel = false;
		this.forceRender();
	}
	setUpDirection(direction) {
		this.modelManager.setUpDirection(direction);
		this.forceRender();
	}
	async loadHDRI(url) {
		await this.hdriManager.loadHDRI(url);
		this.forceRender();
	}
	setHDRIEnabled(enabled) {
		this.hdriManager.setEnabled(enabled);
		this.lightingManager.setHDRIMode(enabled);
		this.forceRender();
	}
	setHDRIAsBackground(show) {
		this.hdriManager.setShowAsBackground(show);
		this.forceRender();
	}
	setHDRIIntensity(intensity) {
		this.hdriManager.setIntensity(intensity);
		this.forceRender();
	}
	clearHDRI() {
		this.hdriManager.clear();
		this.lightingManager.setHDRIMode(false);
		this.forceRender();
	}
	emitModelReady() {
		this.eventManager.emitEvent("modelReady", null);
	}
	captureScene(width, height) {
		this.gizmoManager.removeFromScene();
		return this.sceneManager.captureScene(width, height).finally(() => {
			this.gizmoManager.ensureHelperInScene();
		});
	}
	async startRecording() {
		this.viewHelperManager.visibleViewHelper(false);
		return this.recordingManager.startRecording(this.targetWidth, this.targetHeight);
	}
	stopRecording() {
		this.viewHelperManager.visibleViewHelper(true);
		this.recordingManager.stopRecording();
		this.eventManager.emitEvent("recordingStatusChange", false);
	}
	isRecording() {
		return this.recordingManager.getIsRecording();
	}
	getRecordingDuration() {
		return this.recordingManager.getRecordingDuration();
	}
	getRecordingData() {
		return this.recordingManager.getRecordingData();
	}
	exportRecording(filename) {
		this.recordingManager.exportRecording(filename);
	}
	clearRecording() {
		this.recordingManager.clearRecording();
	}
	setAnimationSpeed(speed) {
		this.animationManager.setAnimationSpeed(speed);
	}
	updateSelectedAnimation(index) {
		this.animationManager.updateSelectedAnimation(index);
	}
	toggleAnimation(play) {
		this.animationManager.toggleAnimation(play);
	}
	hasAnimations() {
		return this.animationManager.animationClips.length > 0;
	}
	hasSkeleton() {
		return this.modelManager.hasSkeleton();
	}
	setShowSkeleton(show) {
		this.modelManager.setShowSkeleton(show);
		this.forceRender();
	}
	getShowSkeleton() {
		return this.modelManager.showSkeleton;
	}
	getAnimationTime() {
		return this.animationManager.getAnimationTime();
	}
	getAnimationDuration() {
		return this.animationManager.getAnimationDuration();
	}
	setAnimationTime(time) {
		this.animationManager.setAnimationTime(time);
		this.forceRender();
	}
	async captureThumbnail(width = 256, height = 256) {
		if (!this.modelManager.currentModel) throw new Error("No model loaded for thumbnail capture");
		const savedState = this.cameraManager.getCameraState();
		const savedCameraType = this.cameraManager.getCurrentCameraType();
		const savedGridVisible = this.sceneManager.gridHelper.visible;
		try {
			this.sceneManager.gridHelper.visible = false;
			if (savedCameraType !== "perspective") this.cameraManager.toggleCamera("perspective");
			positionThumbnailCamera(this.cameraManager.perspectiveCamera, this.modelManager.currentModel);
			if (this.controlsManager.controls) {
				const box = new Box3().setFromObject(this.modelManager.currentModel);
				this.controlsManager.controls.target.copy(box.getCenter(new Vector3()));
				this.controlsManager.controls.update();
			}
			return (await this.captureScene(width, height)).scene;
		} finally {
			this.sceneManager.gridHelper.visible = savedGridVisible;
			if (savedCameraType !== "perspective") this.cameraManager.toggleCamera(savedCameraType);
			this.cameraManager.setCameraState(savedState);
			this.controlsManager.controls?.update();
			this.forceRender();
		}
	}
	setGizmoEnabled(enabled) {
		if (enabled && !this.getCurrentModelCapabilities().gizmoTransform) return;
		this.gizmoManager.setEnabled(enabled);
		this.forceRender();
	}
	setGizmoMode(mode) {
		if (!this.getCurrentModelCapabilities().gizmoTransform) return;
		this.gizmoManager.setMode(mode);
		this.forceRender();
	}
	resetGizmoTransform() {
		if (!this.getCurrentModelCapabilities().gizmoTransform) return;
		this.gizmoManager.reset();
		this.forceRender();
	}
	applyGizmoTransform(position, rotation, scale) {
		if (!this.getCurrentModelCapabilities().gizmoTransform) return;
		this.gizmoManager.applyTransform(position, rotation, scale);
		this.forceRender();
	}
	applyModelTransform(transform) {
		if (!this.getCurrentModelCapabilities().gizmoTransform) return;
		this.gizmoManager.applyModelTransform(transform);
		this.forceRender();
	}
	getGizmoTransform() {
		return this.gizmoManager.getTransform();
	}
	getModelInfo() {
		return this.gizmoManager.getModelInfo();
	}
	fitToViewer() {
		this.modelManager.fitToViewer();
		this.forceRender();
	}
	centerCameraOnModel() {
		const bounds = this.modelManager.getCurrentBounds();
		if (!bounds || bounds.isEmpty()) return;
		const center = bounds.getCenter(new Vector3());
		const camera = this.cameraManager.activeCamera;
		const controls = this.controlsManager.controls;
		const offset = center.clone().sub(camera.position);
		camera.position.add(offset);
		controls.target.add(offset);
		camera.updateMatrixWorld(true);
		controls.update();
		this.forceRender();
	}
	disposeManagers() {
		super.disposeManagers();
		this.hdriManager.dispose();
		this.loaderManager.dispose();
		this.modelManager.dispose();
		this.adapterRef.current = null;
		this.recordingManager.dispose();
		this.animationManager.dispose();
		this.gizmoManager.dispose();
	}
};
//#endregion
//#region src/extensions/core/load3d/MeshModelAdapter.ts
var MeshModelAdapter = class {
	kind = "mesh";
	extensions = [
		"stl",
		"fbx",
		"obj",
		"gltf",
		"glb"
	];
	capabilities = {
		fitToViewer: true,
		requiresMaterialRebuild: false,
		gizmoTransform: true,
		lighting: true,
		exportable: true,
		materialModes: [
			"original",
			"normal",
			"wireframe"
		],
		fitTargetSize: 5
	};
	gltfLoader = new GLTFLoader();
	objLoader;
	mtlLoader = new MTLLoader();
	fbxLoader = new FBXLoader();
	stlLoader = new STLLoader();
	constructor() {
		this.objLoader = new OBJLoader2Parallel();
		this.objLoader.setWorkerUrl(true, new URL(OBJLoader2WorkerModule_default, import.meta.url));
	}
	async load(ctx, path, filename) {
		const extension = filename.split(".").pop()?.toLowerCase();
		const object = await (extension === "stl" ? this.loadSTL(ctx, path, filename) : extension === "fbx" ? this.loadFBX(ctx, path, filename) : extension === "obj" ? this.loadOBJ(ctx, path, filename) : extension === "gltf" || extension === "glb" ? this.loadGLTF(ctx, path, filename) : Promise.resolve(null));
		return object ? {
			object,
			capabilities: this.capabilities
		} : null;
	}
	async loadSTL(ctx, path, filename) {
		this.stlLoader.setPath(path);
		const geometry = await this.stlLoader.loadAsync(filename);
		ctx.setOriginalModel(geometry);
		geometry.computeVertexNormals();
		const mesh = new Mesh(geometry, ctx.standardMaterial);
		const group = new Group();
		group.add(mesh);
		return group;
	}
	async loadFBX(ctx, path, filename) {
		this.fbxLoader.setPath(path);
		const fbxModel = await this.fbxLoader.loadAsync(filename);
		ctx.setOriginalModel(fbxModel);
		fbxModel.traverse((child) => {
			if (child instanceof Mesh) {
				ctx.registerOriginalMaterial(child, child.material);
				if (child instanceof SkinnedMesh) child.frustumCulled = false;
			}
		});
		return fbxModel;
	}
	async loadOBJ(ctx, path, filename) {
		this.objLoader.setBaseObject3d(new Object3D());
		if (ctx.materialMode === "original") try {
			this.mtlLoader.setPath(path);
			const mtlFileName = filename.replace(/\.obj$/i, ".mtl");
			const materials = await this.mtlLoader.loadAsync(mtlFileName);
			materials.preload();
			const materialsFromMtl = MtlObjBridge.addMaterialsFromMtlLoader(materials);
			this.objLoader.setMaterials(materialsFromMtl);
		} catch {}
		const objUrl = path + encodeURIComponent(filename);
		const model = await this.objLoader.loadAsync(objUrl);
		model.traverse((child) => {
			if (child instanceof Mesh) ctx.registerOriginalMaterial(child, child.material);
		});
		return model;
	}
	async loadGLTF(ctx, path, filename) {
		this.gltfLoader.setPath(path);
		const gltf = await this.gltfLoader.loadAsync(filename);
		ctx.setOriginalModel(gltf);
		gltf.scene.traverse((child) => {
			if (child instanceof Mesh) {
				child.geometry.computeVertexNormals();
				ctx.registerOriginalMaterial(child, child.material);
				if (child instanceof SkinnedMesh) child.frustumCulled = false;
			}
		});
		return gltf.scene;
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.MeshModelAdapter = window.comfyAPI.MeshModelAdapter || {};
window.comfyAPI.MeshModelAdapter.MeshModelAdapter = MeshModelAdapter;
//#endregion
//#region src/scripts/metadata/ply.ts
/**
* PLY (Polygon File Format) decoder
* Parses ASCII PLY files and extracts vertex positions and colors
*/
function parsePLYHeader(lines) {
	let vertexCount = 0;
	let headerEndLine = 0;
	let hasColor = false;
	let xIndex = -1;
	let yIndex = -1;
	let zIndex = -1;
	let redIndex = -1;
	let greenIndex = -1;
	let blueIndex = -1;
	let propertyIndex = 0;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line.startsWith("element vertex")) vertexCount = parseInt(line.split(/\s+/)[2]);
		else if (line.startsWith("property")) {
			const parts = line.split(/\s+/);
			const propName = parts[parts.length - 1];
			if (propName === "x") xIndex = propertyIndex;
			else if (propName === "y") yIndex = propertyIndex;
			else if (propName === "z") zIndex = propertyIndex;
			else if (propName === "red") {
				hasColor = true;
				redIndex = propertyIndex;
			} else if (propName === "green") greenIndex = propertyIndex;
			else if (propName === "blue") blueIndex = propertyIndex;
			propertyIndex++;
		} else if (line === "end_header") {
			headerEndLine = i;
			break;
		}
	}
	if (vertexCount === 0 || xIndex < 0 || yIndex < 0 || zIndex < 0) return null;
	return {
		vertexCount,
		hasColor,
		propertyIndices: {
			x: xIndex,
			y: yIndex,
			z: zIndex,
			red: redIndex,
			green: greenIndex,
			blue: blueIndex
		},
		headerEndLine
	};
}
function parsePLYVertices(lines, header) {
	const { vertexCount, hasColor, propertyIndices, headerEndLine } = header;
	const { x: xIndex, y: yIndex, z: zIndex } = propertyIndices;
	const { red: redIndex, green: greenIndex, blue: blueIndex } = propertyIndices;
	const positions = new Float32Array(vertexCount * 3);
	const colors = hasColor ? new Float32Array(vertexCount * 3) : null;
	let vertexIndex = 0;
	for (let i = headerEndLine + 1; i < lines.length && vertexIndex < vertexCount; i++) {
		const line = lines[i].trim();
		if (!line) continue;
		const parts = line.split(/\s+/);
		if (parts.length < 3) continue;
		const posIndex = vertexIndex * 3;
		positions[posIndex] = parseFloat(parts[xIndex]);
		positions[posIndex + 1] = parseFloat(parts[yIndex]);
		positions[posIndex + 2] = parseFloat(parts[zIndex]);
		if (hasColor && colors && redIndex >= 0 && greenIndex >= 0 && blueIndex >= 0) {
			if (parts.length > Math.max(redIndex, greenIndex, blueIndex)) {
				colors[posIndex] = parseInt(parts[redIndex]) / 255;
				colors[posIndex + 1] = parseInt(parts[greenIndex]) / 255;
				colors[posIndex + 2] = parseInt(parts[blueIndex]) / 255;
			}
		}
		vertexIndex++;
	}
	return {
		positions,
		colors,
		vertexCount: vertexIndex
	};
}
/**
* Parse ASCII PLY data from an ArrayBuffer
* Returns positions and colors as typed arrays
*/
function parseASCIIPLY(arrayBuffer) {
	const lines = new TextDecoder().decode(arrayBuffer).split("\n");
	const header = parsePLYHeader(lines);
	if (!header) return null;
	return parsePLYVertices(lines, header);
}
/**
* Check if PLY data is in ASCII format
*/
function isPLYAsciiFormat(arrayBuffer) {
	return new TextDecoder().decode(arrayBuffer.slice(0, 500)).includes("format ascii");
}
/**
* Mirrors sparkjs's own check (PlyReader.parseSplats:
* `hasScales && hasRots`), we delegate header parsing to sparkjs's
* PlyReader so the property dictionary we inspect is exactly the one
* sparkjs would see if asked to render the file. parseHeader rejects
* ASCII PLYs by design; we catch and treat them as not-3DGS (no real
* 3DGS export uses ASCII PLY).
*/
async function isGaussianSplatPLY(arrayBuffer) {
	try {
		const reader = new PlyReader({ fileBytes: arrayBuffer });
		await reader.parseHeader();
		const props = reader.elements.vertex?.properties;
		if (!props) return false;
		const hasScales = !!(props.scale_0 && props.scale_1 && props.scale_2);
		const hasRots = !!(props.rot_0 && props.rot_1 && props.rot_2 && props.rot_3);
		return hasScales && hasRots;
	} catch {
		return false;
	}
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.ply = window.comfyAPI.ply || {};
window.comfyAPI.ply.parseASCIIPLY = parseASCIIPLY;
window.comfyAPI.ply.isPLYAsciiFormat = isPLYAsciiFormat;
window.comfyAPI.ply.isGaussianSplatPLY = isGaussianSplatPLY;
//#endregion
//#region src/extensions/core/load3d/loader/FastPLYLoader.ts
/**
* Fast ASCII PLY Loader
* Optimized for simple ASCII PLY files with position and color data
* 4-5x faster than Three.js PLYLoader for ASCII files
*/
var FastPLYLoader = class {
	parse(arrayBuffer) {
		const plyData = parseASCIIPLY(arrayBuffer);
		if (!plyData) throw new Error("Failed to parse PLY data");
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(plyData.positions, 3));
		if (plyData.colors) geometry.setAttribute("color", new BufferAttribute(plyData.colors, 3));
		return geometry;
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.FastPLYLoader = window.comfyAPI.FastPLYLoader || {};
window.comfyAPI.FastPLYLoader.FastPLYLoader = FastPLYLoader;
//#endregion
//#region src/extensions/core/load3d/PointCloudModelAdapter.ts
function getPLYEngine() {
	return useSettingStore().get("Comfy.Load3D.PLYEngine");
}
var POINT_CLOUD_CAPABILITIES = {
	fitToViewer: true,
	requiresMaterialRebuild: true,
	gizmoTransform: false,
	lighting: true,
	exportable: true,
	materialModes: [
		"original",
		"pointCloud",
		"normal",
		"wireframe"
	],
	fitTargetSize: 5
};
var PointCloudModelAdapter = class {
	kind = "pointCloud";
	extensions = ["ply"];
	capabilities = POINT_CLOUD_CAPABILITIES;
	plyLoader = new PLYLoader();
	fastPlyLoader = new FastPLYLoader();
	async load(ctx, path, filename, fetchBytes) {
		const arrayBuffer = await (fetchBytes?.() ?? fetchModelData(path, filename));
		const plyGeometry = isPLYAsciiFormat(arrayBuffer) && getPLYEngine() === "fastply" ? this.fastPlyLoader.parse(arrayBuffer) : (this.plyLoader.setPath(path), this.plyLoader.parse(arrayBuffer));
		ctx.setOriginalModel(plyGeometry);
		plyGeometry.computeVertexNormals();
		const hasVertexColors = plyGeometry.attributes.color !== void 0;
		const hasFaces = (plyGeometry.index?.count ?? 0) > 0;
		return {
			object: ctx.materialMode === "pointCloud" || !hasFaces ? buildPointsGroup(ctx, plyGeometry, hasVertexColors) : buildMeshGroup(ctx, plyGeometry, hasVertexColors),
			capabilities: hasFaces ? POINT_CLOUD_CAPABILITIES : {
				...POINT_CLOUD_CAPABILITIES,
				materialModes: ["pointCloud"]
			}
		};
	}
};
function buildPointsGroup(ctx, geometry, hasVertexColors) {
	geometry.computeBoundingSphere();
	if (geometry.boundingSphere) {
		const { center, radius } = geometry.boundingSphere;
		geometry.translate(-center.x, -center.y, -center.z);
		if (radius > 0) {
			const scale = 1 / radius;
			geometry.scale(scale, scale, scale);
		}
	}
	const pointMaterial = hasVertexColors ? new PointsMaterial({
		size: .005,
		vertexColors: true,
		sizeAttenuation: true
	}) : new PointsMaterial({
		size: .005,
		color: 13421772,
		sizeAttenuation: true
	});
	const points = new Points(geometry, pointMaterial);
	ctx.registerOriginalMaterial(points, pointMaterial);
	const group = new Group();
	group.add(points);
	return group;
}
function buildMeshGroup(ctx, geometry, hasVertexColors) {
	const material = hasVertexColors ? new MeshStandardMaterial({
		vertexColors: true,
		metalness: 0,
		roughness: .5,
		side: 2
	}) : ctx.standardMaterial.clone();
	if (!hasVertexColors && material instanceof MeshStandardMaterial) material.side = 2;
	const mesh = new Mesh(geometry, material);
	ctx.registerOriginalMaterial(mesh, material);
	const group = new Group();
	group.add(mesh);
	return group;
}
function buildPointCloudForMaterialMode(originalGeometry, mode, standardMaterial, originalMaterials) {
	const geometry = originalGeometry.clone();
	const hasVertexColors = geometry.attributes.color !== void 0;
	const ctx = {
		setOriginalModel: () => {},
		registerOriginalMaterial: (mesh, material) => originalMaterials.set(mesh, material),
		standardMaterial,
		materialMode: mode
	};
	if (mode === "pointCloud") return buildPointsGroup(ctx, geometry, hasVertexColors);
	const group = buildMeshGroup(ctx, geometry, hasVertexColors);
	if (mode === "normal" || mode === "wireframe") {
		const mesh = group.children[0];
		mesh.material = mode === "normal" ? new MeshNormalMaterial({
			flatShading: false,
			side: 2
		}) : new MeshBasicMaterial({
			color: 16777215,
			wireframe: true
		});
	}
	return group;
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.PointCloudModelAdapter = window.comfyAPI.PointCloudModelAdapter || {};
window.comfyAPI.PointCloudModelAdapter.PointCloudModelAdapter = PointCloudModelAdapter;
window.comfyAPI.PointCloudModelAdapter.buildPointCloudForMaterialMode = buildPointCloudForMaterialMode;
//#endregion
//#region src/extensions/core/load3d/SplatModelAdapter.ts
var SplatModelAdapter = class {
	kind = "splat";
	extensions = [
		"spz",
		"splat",
		"ksplat",
		"ply"
	];
	capabilities = {
		fitToViewer: true,
		requiresMaterialRebuild: false,
		gizmoTransform: true,
		lighting: false,
		exportable: true,
		materialModes: [],
		fitTargetSize: 20
	};
	async matches(extension, fetchBytes) {
		if (extension !== "ply") return true;
		return isGaussianSplatPLY(await fetchBytes());
	}
	async load(ctx, path, filename, fetchBytes) {
		const splatMesh = new SplatMesh({
			fileBytes: await (fetchBytes?.() ?? fetchModelData(path, filename)),
			fileName: filename
		});
		await splatMesh.initialized;
		splatMesh.quaternion.set(1, 0, 0, 0);
		ctx.setOriginalModel(splatMesh);
		const splatGroup = new Group();
		splatGroup.add(splatMesh);
		return {
			object: splatGroup,
			capabilities: this.capabilities
		};
	}
	computeBounds(model) {
		const splat = model.children[0];
		if (!(splat instanceof SplatMesh)) return null;
		splat.updateWorldMatrix(true, false);
		return splat.getBoundingBox(false).clone().applyMatrix4(splat.matrixWorld);
	}
	disposeModel(model) {
		model.traverse((child) => {
			if (child instanceof SplatMesh) child.dispose();
		});
	}
	defaultCameraPose() {
		return {
			size: new Vector3(5, 5, 5),
			center: new Vector3(0, 2.5, 0)
		};
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.SplatModelAdapter = window.comfyAPI.SplatModelAdapter || {};
window.comfyAPI.SplatModelAdapter.SplatModelAdapter = SplatModelAdapter;
//#endregion
//#region src/extensions/core/load3d/LoaderManager.ts
/**
* three.js's HttpError attaches the failed `Response` to the thrown Error.
* fetchModelData throws a plain Error whose message embeds the status code.
* Detect both forms so we can keep the toast for parse / network failures
* but stay silent on 404 when the caller opted in.
*/
function isNotFoundError(error) {
	if (!(error instanceof Error)) return false;
	if ("response" in error && typeof error.response === "object" && error.response !== null && "status" in error.response && error.response.status === 404) return true;
	return /\b404\b/.test(error.message);
}
/**
* Default adapter set: mesh + splat + pointCloud. Each adapter declares the
* file extensions it owns. For shared extensions (.ply), the adapter with an
* async `matches()` tiebreaker is tried first; the unconditional adapter acts
* as the fallback — so SplatModelAdapter precedes PointCloudModelAdapter.
*/
function defaultAdapters() {
	return [
		new MeshModelAdapter(),
		new SplatModelAdapter(),
		new PointCloudModelAdapter()
	];
}
var LoaderManager = class {
	modelManager;
	eventManager;
	adapters;
	adapterRef;
	currentLoadId = 0;
	constructor(modelManager, eventManager, adapters, adapterRef) {
		this.modelManager = modelManager;
		this.eventManager = eventManager;
		this.adapters = adapters ? [...adapters] : defaultAdapters();
		this.adapterRef = adapterRef ?? createAdapterRef();
	}
	getCurrentAdapter() {
		return this.adapterRef.current;
	}
	init() {}
	dispose() {}
	async loadModel(url, originalFileName, options) {
		const loadId = ++this.currentLoadId;
		try {
			this.eventManager.emitEvent("modelLoadingStart", null);
			this.modelManager.clearModel();
			this.adapterRef.current = null;
			this.adapterRef.capabilities = null;
			this.modelManager.originalURL = url;
			let fileExtension;
			if (originalFileName) {
				fileExtension = originalFileName.split(".").pop()?.toLowerCase();
				this.modelManager.originalFileName = originalFileName.split("/").pop()?.split(".")[0] || "model";
			} else {
				const filename = new URLSearchParams(url.split("?")[1]).get("filename");
				fileExtension = filename?.split(".").pop()?.toLowerCase();
				this.modelManager.originalFileName = filename ? filename.split(".")[0] || "model" : "model";
			}
			if (!fileExtension) {
				useToastStore().addAlert(t("toastMessages.couldNotDetermineFileType"));
				return;
			}
			const result = await this.loadModelInternal(url, fileExtension);
			if (loadId !== this.currentLoadId) return;
			if (result) {
				this.adapterRef.current = result.adapter;
				this.adapterRef.capabilities = result.capabilities;
				await this.modelManager.setupModel(result.object);
			}
			this.eventManager.emitEvent("modelLoadingEnd", null);
		} catch (error) {
			if (loadId === this.currentLoadId) {
				this.eventManager.emitEvent("modelLoadingEnd", null);
				console.error("Error loading model:", error);
				if (!(options?.silentOnNotFound && isNotFoundError(error))) useToastStore().addAlert(t("toastMessages.errorLoadingModel"));
			}
		}
	}
	async pickAdapter(extension, fetchBytes) {
		const candidates = this.adapters.filter((a) => a.extensions.includes(extension));
		for (const adapter of candidates) {
			if (!adapter.matches) return adapter;
			if (await adapter.matches(extension, fetchBytes)) return adapter;
		}
		return null;
	}
	createLoadContext() {
		const mm = this.modelManager;
		return {
			setOriginalModel: (model) => mm.setOriginalModel(model),
			registerOriginalMaterial: (mesh, material) => mm.originalMaterials.set(mesh, material),
			get standardMaterial() {
				return mm.standardMaterial;
			},
			get materialMode() {
				return mm.materialMode;
			}
		};
	}
	async loadModelInternal(url, fileExtension) {
		const params = new URLSearchParams(url.split("?")[1]);
		const filename = params.get("filename");
		if (!filename) {
			console.error("Missing filename in URL:", url);
			return null;
		}
		const requestedType = params.get("type");
		const loadRootFolder = requestedType === "output" || requestedType === "temp" ? requestedType : "input";
		const subfolder = params.get("subfolder") ?? "";
		const path = "api/view?type=" + loadRootFolder + "&subfolder=" + encodeURIComponent(subfolder) + "&filename=";
		let bytesPromise = null;
		const fetchBytes = () => bytesPromise ??= fetchModelData(path, filename);
		const adapter = await this.pickAdapter(fileExtension, fetchBytes);
		if (!adapter) return null;
		const loadResult = await adapter.load(this.createLoadContext(), path, filename, fetchBytes);
		return loadResult ? {
			object: loadResult.object,
			capabilities: loadResult.capabilities,
			adapter
		} : null;
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.LoaderManager = window.comfyAPI.LoaderManager || {};
window.comfyAPI.LoaderManager.LoaderManager = LoaderManager;
//#endregion
//#region src/extensions/core/load3d/RecordingManager.ts
var RecordingManager = class {
	mediaRecorder = null;
	recordedChunks = [];
	isRecording = false;
	recordingStream = null;
	recordingIndicator = null;
	scene;
	renderer;
	eventManager;
	recordingStartTime = 0;
	recordingDuration = 0;
	recordingCanvas = null;
	recordingContext = null;
	animationFrameId = null;
	constructor(scene, renderer, eventManager) {
		this.scene = scene;
		this.renderer = renderer;
		this.eventManager = eventManager;
		this.setupRecordingIndicator();
	}
	setupRecordingIndicator() {
		const material = new SpriteMaterial({
			map: new TextureLoader().load("data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="24" fill="#4CAF50" opacity="0.8" />
        <circle cx="32" cy="32" r="16" fill="#2E7D32" opacity="0.8" />
      </svg>`)),
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		this.recordingIndicator = new Sprite(material);
		this.recordingIndicator.scale.set(.5, .5, .5);
		this.recordingIndicator.position.set(-.8, .8, 0);
		this.recordingIndicator.visible = false;
		this.scene.add(this.recordingIndicator);
	}
	async startRecording(targetWidth, targetHeight) {
		if (this.isRecording) return;
		try {
			const sourceCanvas = this.renderer.domElement;
			const sourceWidth = sourceCanvas.width;
			const sourceHeight = sourceCanvas.height;
			const recordWidth = targetWidth || sourceWidth;
			const recordHeight = targetHeight || sourceHeight;
			this.recordingCanvas = document.createElement("canvas");
			this.recordingCanvas.width = recordWidth;
			this.recordingCanvas.height = recordHeight;
			this.recordingContext = this.recordingCanvas.getContext("2d", { alpha: false });
			if (!this.recordingContext) throw new Error("Failed to get 2D context for recording canvas");
			const sourceAspectRatio = sourceWidth / sourceHeight;
			const targetAspectRatio = recordWidth / recordHeight;
			let sx = 0;
			let sy = 0;
			let sw = sourceWidth;
			let sh = sourceHeight;
			if (Math.abs(sourceAspectRatio - targetAspectRatio) > .01) if (sourceAspectRatio > targetAspectRatio) {
				sw = sourceHeight * targetAspectRatio;
				sx = (sourceWidth - sw) / 2;
			} else {
				sh = sourceWidth / targetAspectRatio;
				sy = (sourceHeight - sh) / 2;
			}
			const captureFrame = () => {
				if (!this.isRecording || !this.recordingContext) return;
				this.recordingContext.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, recordWidth, recordHeight);
				this.animationFrameId = requestAnimationFrame(captureFrame);
			};
			this.recordingStream = this.recordingCanvas.captureStream(30);
			if (!this.recordingStream) throw new Error("Failed to capture stream from canvas");
			this.mediaRecorder = new MediaRecorder(this.recordingStream, {
				mimeType: "video/webm;codecs=vp9",
				videoBitsPerSecond: 5e6
			});
			this.recordedChunks = [];
			this.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) this.recordedChunks.push(event.data);
			};
			this.mediaRecorder.onstop = () => {
				this.recordingIndicator.visible = false;
				this.isRecording = false;
				this.recordingStream = null;
				if (this.animationFrameId !== null) {
					cancelAnimationFrame(this.animationFrameId);
					this.animationFrameId = null;
				}
				this.eventManager.emitEvent("recordingStopped", {
					duration: this.recordingDuration,
					hasRecording: this.recordedChunks.length > 0
				});
			};
			if (this.recordingIndicator) this.recordingIndicator.visible = true;
			this.mediaRecorder.start(100);
			this.isRecording = true;
			this.recordingStartTime = Date.now();
			captureFrame();
			this.eventManager.emitEvent("recordingStarted", null);
		} catch (error) {
			console.error("Error starting recording:", error);
			this.eventManager.emitEvent("recordingError", error);
		}
	}
	stopRecording() {
		if (!this.isRecording || !this.mediaRecorder) return;
		this.recordingDuration = (Date.now() - this.recordingStartTime) / 1e3;
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		this.mediaRecorder.stop();
		if (this.recordingStream) this.recordingStream.getTracks().forEach((track) => track.stop());
		this.recordingCanvas = null;
		this.recordingContext = null;
	}
	getIsRecording() {
		return this.isRecording;
	}
	hasRecording() {
		return this.recordedChunks.length > 0;
	}
	getRecordingDuration() {
		return this.recordingDuration;
	}
	getRecordingData() {
		if (this.recordedChunks.length !== 0) {
			const blob = new Blob(this.recordedChunks, { type: "video/webm" });
			return URL.createObjectURL(blob);
		}
		return null;
	}
	exportRecording(filename = "scene-recording.mp4") {
		if (this.recordedChunks.length === 0) {
			this.eventManager.emitEvent("recordingError", /* @__PURE__ */ new Error("No recording available to export"));
			return;
		}
		this.eventManager.emitEvent("exportingRecording", null);
		try {
			downloadBlob(filename, new Blob(this.recordedChunks, { type: "video/webm" }));
			this.eventManager.emitEvent("recordingExported", null);
		} catch (error) {
			console.error("Error exporting recording:", error);
			this.eventManager.emitEvent("recordingError", error);
		}
	}
	clearRecording() {
		this.recordedChunks = [];
		this.recordingDuration = 0;
		this.eventManager.emitEvent("recordingCleared", null);
	}
	dispose() {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		this.stopRecording();
		this.clearRecording();
		this.recordingCanvas = null;
		this.recordingContext = null;
		if (this.recordingIndicator) {
			this.scene.remove(this.recordingIndicator);
			this.recordingIndicator.material.map?.dispose();
			this.recordingIndicator.material.dispose();
		}
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.RecordingManager = window.comfyAPI.RecordingManager || {};
window.comfyAPI.RecordingManager.RecordingManager = RecordingManager;
//#endregion
//#region src/extensions/core/load3d/SceneManager.ts
var SceneManager = class {
	scene;
	gridHelper;
	sparkRenderer;
	nextSparkDirtyPromise = null;
	nextSparkDirtyResolve = null;
	awaitNextSparkDirty() {
		if (this.nextSparkDirtyPromise) return this.nextSparkDirtyPromise;
		this.nextSparkDirtyPromise = new Promise((resolve) => {
			this.nextSparkDirtyResolve = resolve;
		});
		return this.nextSparkDirtyPromise;
	}
	backgroundScene;
	backgroundCamera;
	backgroundMesh = null;
	backgroundTexture = null;
	backgroundRenderMode = "tiled";
	backgroundColorMaterial = null;
	currentBackgroundType = "color";
	currentBackgroundColor = "#282828";
	eventManager;
	renderer;
	getActiveCamera;
	constructor(renderer, getActiveCamera, _getControls, eventManager) {
		this.renderer = renderer;
		this.eventManager = eventManager;
		this.scene = new Scene();
		this.scene.name = "MainScene";
		this.getActiveCamera = getActiveCamera;
		this.sparkRenderer = new SparkRenderer({
			renderer,
			onDirty: () => {
				const resolve = this.nextSparkDirtyResolve;
				this.nextSparkDirtyResolve = null;
				this.nextSparkDirtyPromise = null;
				resolve?.();
			}
		});
		this.scene.add(this.sparkRenderer);
		this.gridHelper = new GridHelper(20, 20);
		this.gridHelper.position.set(0, 0, 0);
		this.scene.add(this.gridHelper);
		this.backgroundScene = new Scene();
		this.backgroundScene.name = "BackgroundScene";
		this.backgroundCamera = new OrthographicCamera(-1, 1, 1, -1, -1, 1);
		this.initBackgroundScene();
	}
	initBackgroundScene() {
		const planeGeometry = new PlaneGeometry(2, 2);
		this.backgroundColorMaterial = new MeshBasicMaterial({
			color: new Color(this.currentBackgroundColor),
			transparent: false,
			depthWrite: false,
			depthTest: false,
			side: 2
		});
		this.backgroundMesh = new Mesh(planeGeometry, this.backgroundColorMaterial);
		this.backgroundMesh.position.set(0, 0, 0);
		this.backgroundScene.add(this.backgroundMesh);
		this.renderer.setClearColor(0, 0);
	}
	init() {}
	dispose() {
		if (this.backgroundTexture) this.backgroundTexture.dispose();
		if (this.backgroundColorMaterial) this.backgroundColorMaterial.dispose();
		if (this.backgroundMesh) {
			this.backgroundMesh.geometry.dispose();
			if (this.backgroundMesh.material instanceof Material) this.backgroundMesh.material.dispose();
		}
		if (this.scene.background) this.scene.background = null;
		this.backgroundScene.clear();
		this.scene.clear();
	}
	toggleGrid(showGrid) {
		if (this.gridHelper) this.gridHelper.visible = showGrid;
		this.eventManager.emitEvent("showGridChange", showGrid);
	}
	setBackgroundColor(color) {
		this.currentBackgroundColor = color;
		this.currentBackgroundType = "color";
		if (this.scene.background instanceof Texture) this.scene.background = null;
		if (this.backgroundRenderMode === "panorama") {
			this.backgroundRenderMode = "tiled";
			this.eventManager.emitEvent("backgroundRenderModeChange", "tiled");
		}
		if (!this.backgroundMesh || !this.backgroundColorMaterial) this.initBackgroundScene();
		this.backgroundColorMaterial.color.set(color);
		this.backgroundColorMaterial.map = null;
		this.backgroundColorMaterial.transparent = false;
		this.backgroundColorMaterial.needsUpdate = true;
		if (this.backgroundMesh) this.backgroundMesh.material = this.backgroundColorMaterial;
		if (this.backgroundTexture) {
			this.backgroundTexture.dispose();
			this.backgroundTexture = null;
		}
		this.eventManager.emitEvent("backgroundColorChange", color);
	}
	async setBackgroundImage(uploadPath) {
		if (uploadPath === "") {
			this.setBackgroundColor(this.currentBackgroundColor);
			return;
		}
		this.eventManager.emitEvent("backgroundImageLoadingStart", null);
		let type = "input";
		let pathParts = Load3dUtils.splitFilePath(uploadPath);
		let subfolder = pathParts[0];
		let filename = pathParts[1];
		if (subfolder === "temp") {
			type = "temp";
			pathParts = ["", filename];
		} else if (subfolder === "output") {
			type = "output";
			pathParts = ["", filename];
		}
		let imageUrl = Load3dUtils.getResourceURL(...pathParts, type);
		if (!imageUrl.startsWith("/api")) imageUrl = "/api" + imageUrl;
		try {
			const textureLoader = new TextureLoader();
			const texture = await new Promise((resolve, reject) => {
				textureLoader.load(imageUrl, resolve, void 0, reject);
			});
			if (this.backgroundTexture) this.backgroundTexture.dispose();
			texture.colorSpace = SRGBColorSpace;
			this.backgroundTexture = texture;
			this.currentBackgroundType = "image";
			if (this.backgroundRenderMode === "panorama") {
				texture.mapping = 303;
				this.scene.background = texture;
			} else {
				if (!this.backgroundMesh) this.initBackgroundScene();
				const imageMaterial = new MeshBasicMaterial({
					map: texture,
					transparent: true,
					depthWrite: false,
					depthTest: false,
					side: 2
				});
				if (this.backgroundMesh) {
					if (this.backgroundMesh.material !== this.backgroundColorMaterial && this.backgroundMesh.material instanceof Material) this.backgroundMesh.material.dispose();
					this.backgroundMesh.material = imageMaterial;
					this.backgroundMesh.position.set(0, 0, 0);
				}
				this.updateBackgroundSize(this.backgroundTexture, this.backgroundMesh, this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight);
			}
			this.eventManager.emitEvent("backgroundImageChange", uploadPath);
			this.eventManager.emitEvent("backgroundImageLoadingEnd", null);
		} catch (error) {
			this.eventManager.emitEvent("backgroundImageLoadingEnd", null);
			console.error("Error loading background image:", error);
			this.setBackgroundColor(this.currentBackgroundColor);
		}
	}
	removeBackgroundImage() {
		this.setBackgroundColor(this.currentBackgroundColor);
		this.eventManager.emitEvent("backgroundImageLoadingEnd", null);
	}
	setBackgroundRenderMode(mode) {
		if (this.backgroundRenderMode === mode) return;
		this.backgroundRenderMode = mode;
		if (this.currentBackgroundType === "image" && this.backgroundTexture) try {
			if (mode === "panorama") {
				this.backgroundTexture.mapping = 303;
				this.scene.background = this.backgroundTexture;
			} else {
				this.scene.background = null;
				if (this.backgroundMesh && this.backgroundMesh.material instanceof MeshBasicMaterial) {
					this.backgroundMesh.material.map = this.backgroundTexture;
					this.backgroundMesh.material.needsUpdate = true;
				}
			}
		} catch (error) {
			console.error("Error set background render mode:", error);
		}
		this.eventManager.emitEvent("backgroundRenderModeChange", mode);
	}
	updateBackgroundSize(backgroundTexture, backgroundMesh, targetWidth, targetHeight) {
		if (!backgroundTexture || !backgroundMesh) return;
		const material = backgroundMesh.material;
		if (!material.map) return;
		const image = backgroundTexture.image;
		const imageAspect = image.width / image.height;
		const targetAspect = targetWidth / targetHeight;
		if (imageAspect > targetAspect) backgroundMesh.scale.set(imageAspect / targetAspect, 1, 1);
		else backgroundMesh.scale.set(1, targetAspect / imageAspect, 1);
		material.needsUpdate = true;
	}
	handleResize(width, height) {
		if (this.backgroundTexture && this.backgroundMesh && this.currentBackgroundType === "image") this.updateBackgroundSize(this.backgroundTexture, this.backgroundMesh, width, height);
	}
	renderBackground() {
		if ((this.backgroundRenderMode === "tiled" || this.currentBackgroundType === "color") && this.backgroundMesh) {
			const currentToneMapping = this.renderer.toneMapping;
			const currentExposure = this.renderer.toneMappingExposure;
			this.renderer.toneMapping = 0;
			this.renderer.render(this.backgroundScene, this.backgroundCamera);
			this.renderer.toneMapping = currentToneMapping;
			this.renderer.toneMappingExposure = currentExposure;
		}
	}
	getCurrentBackgroundInfo() {
		return {
			type: this.currentBackgroundType,
			value: this.currentBackgroundType === "color" ? this.currentBackgroundColor : ""
		};
	}
	async captureScene(width, height) {
		const originalSize = new Vector2();
		this.renderer.getSize(originalSize);
		const originalPixelRatio = this.renderer.getPixelRatio();
		const originalClearColor = this.renderer.getClearColor(new Color());
		const originalClearAlpha = this.renderer.getClearAlpha();
		const originalOutputColorSpace = this.renderer.outputColorSpace;
		const activeCamera = this.getActiveCamera();
		const savedCameraParams = activeCamera instanceof PerspectiveCamera ? {
			type: "perspective",
			aspect: activeCamera.aspect
		} : {
			type: "orthographic",
			left: activeCamera.left,
			right: activeCamera.right,
			top: activeCamera.top,
			bottom: activeCamera.bottom
		};
		const originalMaterials = /* @__PURE__ */ new Map();
		const tempMaterials = [];
		const gridVisible = this.gridHelper.visible;
		try {
			this.renderer.setPixelRatio(1);
			this.renderer.setSize(width, height);
			if (activeCamera instanceof PerspectiveCamera) {
				activeCamera.aspect = width / height;
				activeCamera.updateProjectionMatrix();
			} else {
				const orthographicCamera = activeCamera;
				const frustumSize = 10;
				const aspect = width / height;
				orthographicCamera.left = -frustumSize * aspect / 2;
				orthographicCamera.right = frustumSize * aspect / 2;
				orthographicCamera.top = frustumSize / 2;
				orthographicCamera.bottom = -frustumSize / 2;
				orthographicCamera.updateProjectionMatrix();
			}
			if (this.backgroundTexture && this.backgroundMesh && this.currentBackgroundType === "image") this.updateBackgroundSize(this.backgroundTexture, this.backgroundMesh, width, height);
			this.renderer.clear();
			this.renderBackground();
			this.renderer.render(this.scene, activeCamera);
			const sceneData = this.renderer.domElement.toDataURL("image/png");
			this.renderer.setClearColor(0, 0);
			this.renderer.clear();
			this.renderer.render(this.scene, activeCamera);
			const maskData = this.renderer.domElement.toDataURL("image/png");
			this.scene.traverse((child) => {
				if (child instanceof Mesh) {
					originalMaterials.set(child, child.material);
					const tempMaterial = new MeshNormalMaterial({
						flatShading: false,
						side: 2,
						normalScale: new Vector2(1, 1)
					});
					tempMaterials.push(tempMaterial);
					child.material = tempMaterial;
				}
			});
			this.gridHelper.visible = false;
			this.renderer.setClearColor(0, 1);
			this.renderer.clear();
			this.renderer.render(this.scene, activeCamera);
			const normalData = this.renderer.domElement.toDataURL("image/png");
			this.renderer.setClearColor(16777215, 1);
			this.renderer.clear();
			return {
				scene: sceneData,
				mask: maskData,
				normal: normalData
			};
		} finally {
			this.scene.traverse((child) => {
				if (child instanceof Mesh) {
					const originalMaterial = originalMaterials.get(child);
					if (originalMaterial) child.material = originalMaterial;
				}
			});
			for (const mat of tempMaterials) mat.dispose();
			this.gridHelper.visible = gridVisible;
			if (savedCameraParams.type === "perspective") {
				const persp = activeCamera;
				persp.aspect = savedCameraParams.aspect;
				persp.updateProjectionMatrix();
			} else {
				const ortho = activeCamera;
				ortho.left = savedCameraParams.left;
				ortho.right = savedCameraParams.right;
				ortho.top = savedCameraParams.top;
				ortho.bottom = savedCameraParams.bottom;
				ortho.updateProjectionMatrix();
			}
			this.renderer.setClearColor(originalClearColor, originalClearAlpha);
			this.renderer.setPixelRatio(originalPixelRatio);
			this.renderer.setSize(originalSize.x, originalSize.y);
			this.renderer.outputColorSpace = originalOutputColorSpace;
			this.handleResize(originalSize.x, originalSize.y);
		}
	}
	reset() {}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.SceneManager = window.comfyAPI.SceneManager || {};
window.comfyAPI.SceneManager.SceneManager = SceneManager;
//#endregion
//#region src/extensions/core/load3d/SceneModelManager.ts
var SceneModelManager = class {
	currentModel = null;
	originalModel = null;
	originalRotation = null;
	currentUpDirection = "original";
	materialMode = "original";
	originalMaterials = /* @__PURE__ */ new WeakMap();
	normalMaterial;
	standardMaterial;
	wireframeMaterial;
	depthMaterial;
	originalFileName = null;
	originalURL = null;
	appliedTexture = null;
	textureLoader;
	skeletonHelper = null;
	showSkeleton = false;
	scene;
	renderer;
	eventManager;
	activeCamera;
	setupCamera;
	setupGizmo;
	getCurrentCapabilities;
	getBoundsFromAdapter;
	disposeModelViaAdapter;
	getDefaultCameraPose;
	constructor(scene, renderer, eventManager, getActiveCamera, setupCamera, setupGizmo, getCurrentCapabilities = () => DEFAULT_MODEL_CAPABILITIES, getBoundsFromAdapter = () => null, disposeModelViaAdapter = () => {}, getDefaultCameraPose = () => null) {
		this.scene = scene;
		this.renderer = renderer;
		this.eventManager = eventManager;
		this.activeCamera = getActiveCamera();
		this.setupCamera = setupCamera;
		this.textureLoader = new TextureLoader();
		this.setupGizmo = setupGizmo;
		this.getCurrentCapabilities = getCurrentCapabilities;
		this.getBoundsFromAdapter = getBoundsFromAdapter;
		this.disposeModelViaAdapter = disposeModelViaAdapter;
		this.getDefaultCameraPose = getDefaultCameraPose;
		this.normalMaterial = new MeshNormalMaterial({
			flatShading: false,
			side: 2,
			normalScale: new Vector2(1, 1),
			transparent: false,
			opacity: 1
		});
		this.wireframeMaterial = new MeshBasicMaterial({
			color: 16777215,
			wireframe: true,
			transparent: false,
			opacity: 1
		});
		this.depthMaterial = new MeshDepthMaterial({
			depthPacking: BasicDepthPacking,
			side: 2
		});
		this.standardMaterial = this.createSTLMaterial();
	}
	init() {}
	dispose() {
		this.clearModel();
		this.normalMaterial.dispose();
		this.standardMaterial.dispose();
		this.wireframeMaterial.dispose();
		this.depthMaterial.dispose();
		if (this.appliedTexture) {
			this.appliedTexture.dispose();
			this.appliedTexture = null;
		}
	}
	createSTLMaterial() {
		return new MeshStandardMaterial({
			color: 8421504,
			metalness: .1,
			roughness: .8,
			flatShading: false,
			side: 2
		});
	}
	removeAllMainModelsFromScene() {
		const oldMainModels = [];
		this.scene.traverse((obj) => {
			if (obj.name === "MainModel") oldMainModels.push(obj);
		});
		oldMainModels.forEach((oldModel) => {
			oldModel.traverse((child) => {
				if (child instanceof Mesh || child instanceof Points) {
					child.geometry?.dispose();
					if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
					else child.material?.dispose();
				}
			});
			this.disposeModelViaAdapter(oldModel);
			this.scene.remove(oldModel);
		});
	}
	rebuildForMaterialMode(mode) {
		if (!(this.originalModel instanceof BufferGeometry)) return;
		this.removeAllMainModelsFromScene();
		this.currentModel = null;
		const newModel = buildPointCloudForMaterialMode(this.originalModel, mode, this.standardMaterial, this.originalMaterials);
		newModel.name = "MainModel";
		if (mode !== "pointCloud") {
			const box = new Box3().setFromObject(newModel);
			const size = box.getSize(new Vector3());
			const center = box.getCenter(new Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);
			const scale = this.getCurrentCapabilities().fitTargetSize / maxDim;
			newModel.scale.multiplyScalar(scale);
			box.setFromObject(newModel);
			box.getCenter(center);
			box.getSize(size);
			newModel.position.set(-center.x, -box.min.y, -center.z);
		}
		this.scene.add(newModel);
		this.currentModel = newModel;
		this.eventManager.emitEvent("materialModeChange", mode);
	}
	setMaterialMode(mode) {
		if (!this.currentModel || mode === this.materialMode) return;
		this.materialMode = mode;
		if (this.getCurrentCapabilities().requiresMaterialRebuild) {
			this.rebuildForMaterialMode(mode);
			return;
		}
		if (mode === "depth") this.renderer.outputColorSpace = LinearSRGBColorSpace;
		else this.renderer.outputColorSpace = SRGBColorSpace;
		if (this.currentModel) this.currentModel.visible = true;
		this.currentModel.traverse((child) => {
			if (child instanceof Mesh) switch (mode) {
				case "depth":
					if (!this.originalMaterials.has(child)) this.originalMaterials.set(child, child.material);
					const depthMat = new MeshDepthMaterial({
						depthPacking: BasicDepthPacking,
						side: 2
					});
					depthMat.onBeforeCompile = (shader) => {
						shader.uniforms.cameraType = { value: this.activeCamera instanceof OrthographicCamera ? 1 : 0 };
						shader.fragmentShader = `
                uniform float cameraType;
                ${shader.fragmentShader}
              `;
						shader.fragmentShader = shader.fragmentShader.replace(/gl_FragColor\s*=\s*vec4\(\s*vec3\(\s*1.0\s*-\s*fragCoordZ\s*\)\s*,\s*opacity\s*\)\s*;/, `
                  float depth = 1.0 - fragCoordZ;
                  if (cameraType > 0.5) {
                    depth = pow(depth, 400.0);
                  } else {
                    depth = pow(depth, 0.6);
                  }
                  gl_FragColor = vec4(vec3(depth), opacity);
                `);
					};
					depthMat.customProgramCacheKey = () => {
						return this.activeCamera instanceof OrthographicCamera ? "ortho" : "persp";
					};
					child.material = depthMat;
					break;
				case "normal":
					if (!this.originalMaterials.has(child)) this.originalMaterials.set(child, child.material);
					child.material = new MeshNormalMaterial({
						flatShading: false,
						side: 2,
						normalScale: new Vector2(1, 1),
						transparent: false,
						opacity: 1
					});
					break;
				case "wireframe":
					if (!this.originalMaterials.has(child)) this.originalMaterials.set(child, child.material);
					child.material = new MeshBasicMaterial({
						color: 16777215,
						wireframe: true,
						transparent: false,
						opacity: 1
					});
					break;
				case "original":
				case "pointCloud":
					const originalMaterial = this.originalMaterials.get(child);
					if (originalMaterial) child.material = originalMaterial;
					else if (this.appliedTexture) child.material = new MeshStandardMaterial({
						map: this.appliedTexture,
						metalness: .1,
						roughness: .8,
						side: 2
					});
					else child.material = this.standardMaterial;
					break;
			}
		});
		this.eventManager.emitEvent("materialModeChange", mode);
	}
	setupModelMaterials(model) {
		model.traverse((child) => {
			if (child instanceof Mesh) this.originalMaterials.set(child, child.material);
		});
		this.setMaterialMode("original");
	}
	clearModel() {
		const objectsToRemove = [];
		for (const object of [...this.scene.children]) if (!(object instanceof GridHelper || object instanceof Light || object instanceof Camera || object instanceof SparkRenderer || object.name === "GizmoTransformControls")) objectsToRemove.push(object);
		objectsToRemove.forEach((obj) => {
			this.scene.remove(obj);
			obj.traverse((child) => {
				if (child instanceof Mesh || child instanceof Points) {
					child.geometry?.dispose();
					if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
					else child.material?.dispose();
				}
			});
			this.disposeModelViaAdapter(obj);
		});
		this.reset();
	}
	reset() {
		this.currentModel = null;
		this.originalModel = null;
		this.originalRotation = null;
		this.currentUpDirection = "original";
		this.setMaterialMode("original");
		this.originalFileName = null;
		this.originalURL = null;
		if (this.appliedTexture) {
			this.appliedTexture.dispose();
			this.appliedTexture = null;
		}
		if (this.skeletonHelper) {
			this.scene.remove(this.skeletonHelper);
			this.skeletonHelper.dispose();
			this.skeletonHelper = null;
		}
		this.showSkeleton = false;
		this.originalMaterials = /* @__PURE__ */ new WeakMap();
	}
	hasSkeleton() {
		if (!this.currentModel) return false;
		let found = false;
		this.currentModel.traverse((child) => {
			if (child instanceof SkinnedMesh && child.skeleton) found = true;
		});
		return found;
	}
	setShowSkeleton(show) {
		this.showSkeleton = show;
		if (show) {
			if (!this.skeletonHelper && this.currentModel) {
				let rootBone = null;
				this.currentModel.traverse((child) => {
					if (child instanceof Bone && !rootBone) {
						if (!(child.parent instanceof Bone)) rootBone = child;
					}
				});
				if (rootBone) {
					this.skeletonHelper = new SkeletonHelper(rootBone);
					this.scene.add(this.skeletonHelper);
				} else {
					let skinnedMesh = null;
					this.currentModel.traverse((child) => {
						if (child instanceof SkinnedMesh && !skinnedMesh) skinnedMesh = child;
					});
					if (skinnedMesh) {
						this.skeletonHelper = new SkeletonHelper(skinnedMesh);
						this.scene.add(this.skeletonHelper);
					}
				}
			} else if (this.skeletonHelper) this.skeletonHelper.visible = true;
		} else if (this.skeletonHelper) this.skeletonHelper.visible = false;
		this.eventManager.emitEvent("skeletonVisibilityChange", show);
	}
	addModelToScene(model) {
		this.currentModel = model;
		model.name = "MainModel";
		this.scene.add(this.currentModel);
	}
	computeWorldBounds(model) {
		return this.getBoundsFromAdapter(model) ?? new Box3().setFromObject(model);
	}
	getCurrentBounds() {
		if (!this.currentModel) return null;
		return this.computeWorldBounds(this.currentModel);
	}
	async setupModel(model) {
		this.currentModel = model;
		model.name = "MainModel";
		if (!this.getCurrentCapabilities().fitToViewer) {
			const pose = this.getDefaultCameraPose();
			if (pose) {
				this.scene.add(model);
				this.setupCamera(pose.size, pose.center);
				return;
			}
		}
		this.scene.add(model);
		const pendingMaterialMode = this.materialMode;
		this.setupModelMaterials(model);
		if (pendingMaterialMode !== "original") this.setMaterialMode(pendingMaterialMode);
		const validModes = this.getCurrentCapabilities().materialModes;
		if (validModes.length > 0 && !validModes.includes(this.materialMode)) {
			this.materialMode = validModes[0];
			this.eventManager.emitEvent("materialModeChange", this.materialMode);
		}
		if (this.currentUpDirection !== "original") this.setUpDirection(this.currentUpDirection);
		const box = this.computeWorldBounds(model);
		const size = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());
		this.setupCamera(size, center);
		this.setupGizmo(model);
	}
	fitToViewer() {
		if (!this.currentModel || !this.getCurrentCapabilities().fitToViewer) return;
		const model = this.currentModel;
		model.scale.set(1, 1, 1);
		model.position.set(0, 0, 0);
		model.rotation.set(0, 0, 0);
		const box = this.computeWorldBounds(model);
		const size = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());
		const maxDim = Math.max(size.x, size.y, size.z);
		if (maxDim === 0) return;
		const scale = this.getCurrentCapabilities().fitTargetSize / maxDim;
		model.scale.set(scale, scale, scale);
		const scaledBox = this.computeWorldBounds(model);
		scaledBox.getCenter(center);
		scaledBox.getSize(size);
		model.position.set(-center.x, -scaledBox.min.y, -center.z);
		this.originalRotation = null;
		if (this.currentUpDirection !== "original") this.setUpDirection(this.currentUpDirection);
		const newBox = this.computeWorldBounds(model);
		const newSize = newBox.getSize(new Vector3());
		const newCenter = newBox.getCenter(new Vector3());
		this.setupCamera(newSize, newCenter);
		this.setupGizmo(model);
	}
	setOriginalModel(model) {
		this.originalModel = model;
	}
	setUpDirection(direction) {
		if (!this.currentModel) return;
		const directionChanged = this.currentUpDirection !== direction;
		if (!this.originalRotation && this.currentModel.rotation) this.originalRotation = this.currentModel.rotation.clone();
		this.currentUpDirection = direction;
		if (this.originalRotation) this.currentModel.rotation.copy(this.originalRotation);
		switch (direction) {
			case "original": break;
			case "-x":
				this.currentModel.rotation.z = Math.PI / 2;
				break;
			case "+x":
				this.currentModel.rotation.z = -Math.PI / 2;
				break;
			case "-y":
				this.currentModel.rotation.x = Math.PI;
				break;
			case "+y": break;
			case "-z":
				this.currentModel.rotation.x = Math.PI / 2;
				break;
			case "+z":
				this.currentModel.rotation.x = -Math.PI / 2;
				break;
		}
		this.eventManager.emitEvent("upDirectionChange", direction);
		if (directionChanged) this.setupGizmo(this.currentModel);
	}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.SceneModelManager = window.comfyAPI.SceneModelManager || {};
window.comfyAPI.SceneModelManager.SceneModelManager = SceneModelManager;
//#endregion
//#region src/extensions/core/load3d/ViewHelperManager.ts
var ViewHelperManager = class {
	viewHelper = {};
	viewHelperContainer = {};
	getActiveCamera;
	getControls;
	eventManager;
	constructor(_renderer, getActiveCamera, getControls, eventManager) {
		this.getActiveCamera = getActiveCamera;
		this.getControls = getControls;
		this.eventManager = eventManager;
	}
	init() {}
	dispose() {
		if (this.viewHelper) this.viewHelper.dispose();
		if (this.viewHelperContainer && this.viewHelperContainer.parentNode) this.viewHelperContainer.parentNode.removeChild(this.viewHelperContainer);
	}
	createViewHelper(container) {
		this.viewHelperContainer = document.createElement("div");
		this.viewHelperContainer.style.position = "absolute";
		this.viewHelperContainer.style.bottom = "0";
		this.viewHelperContainer.style.left = "0";
		this.viewHelperContainer.style.width = "128px";
		this.viewHelperContainer.style.height = "128px";
		this.viewHelperContainer.addEventListener("pointerup", (event) => {
			event.stopPropagation();
			this.viewHelper.handleClick(event);
		});
		this.viewHelperContainer.addEventListener("pointerdown", (event) => {
			event.stopPropagation();
		});
		container.appendChild(this.viewHelperContainer);
		this.viewHelper = new ViewHelper(this.getActiveCamera(), this.viewHelperContainer);
		this.viewHelper.center = this.getControls().target;
	}
	update(delta) {
		if (this.viewHelper.animating) {
			this.viewHelper.update(delta);
			if (!this.viewHelper.animating) {
				const cameraState = {
					position: this.getActiveCamera().position.clone(),
					target: this.getControls().target.clone(),
					zoom: this.getActiveCamera() instanceof OrthographicCamera ? this.getActiveCamera().zoom : this.getActiveCamera().zoom,
					cameraType: this.getActiveCamera() instanceof PerspectiveCamera ? "perspective" : "orthographic"
				};
				this.eventManager.emitEvent("cameraChanged", cameraState);
			}
		}
	}
	handleResize() {}
	visibleViewHelper(visible) {
		if (visible) {
			this.viewHelper.visible = true;
			this.viewHelperContainer.style.display = "block";
		} else {
			this.viewHelper.visible = false;
			this.viewHelperContainer.style.display = "none";
		}
	}
	recreateViewHelper() {
		if (this.viewHelper) this.viewHelper.dispose();
		this.viewHelper = new ViewHelper(this.getActiveCamera(), this.viewHelperContainer);
		this.viewHelper.center = this.getControls().target;
	}
	reset() {}
};
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.ViewHelperManager = window.comfyAPI.ViewHelperManager || {};
window.comfyAPI.ViewHelperManager.ViewHelperManager = ViewHelperManager;
//#endregion
//#region src/extensions/core/load3d/createLoad3d.ts
function createRenderer(container) {
	const renderer = new WebGLRenderer({
		alpha: true,
		antialias: true
	});
	renderer.setSize(300, 300);
	renderer.setClearColor(2631720);
	renderer.autoClear = false;
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.domElement.classList.add("absolute", "inset-0", "h-full", "w-full", "outline-none");
	container.appendChild(renderer.domElement);
	return renderer;
}
function buildLoad3dDeps(container) {
	const renderer = createRenderer(container);
	const eventManager = new EventManager();
	const adapterRef = createAdapterRef();
	let cameraManager;
	let controlsManager;
	let gizmoManager;
	const getActiveCamera = () => cameraManager.activeCamera;
	const getControls = () => controlsManager.controls;
	const sceneManager = new SceneManager(renderer, getActiveCamera, getControls, eventManager);
	cameraManager = new CameraManager(renderer, eventManager);
	controlsManager = new ControlsManager(renderer, cameraManager.activeCamera, eventManager);
	cameraManager.setControls(controlsManager.controls);
	const lightingManager = new LightingManager(sceneManager.scene, eventManager);
	const hdriManager = new HDRIManager(sceneManager.scene, renderer, eventManager);
	const viewHelperManager = new ViewHelperManager(renderer, getActiveCamera, getControls, eventManager);
	const modelManager = new SceneModelManager(sceneManager.scene, renderer, eventManager, getActiveCamera, (size, center) => cameraManager.setupForModel(size, center), (model) => gizmoManager.setupForModel(model), () => adapterRef.capabilities ?? DEFAULT_MODEL_CAPABILITIES, (model) => adapterRef.current?.computeBounds?.(model) ?? null, (model) => adapterRef.current?.disposeModel?.(model), () => adapterRef.current?.defaultCameraPose?.() ?? null);
	const loaderManager = new LoaderManager(modelManager, eventManager, void 0, adapterRef);
	const recordingManager = new RecordingManager(sceneManager.scene, renderer, eventManager);
	const animationManager = new AnimationManager(eventManager);
	gizmoManager = new GizmoManager(sceneManager.scene, renderer, controlsManager.controls, getActiveCamera, () => {
		const transform = gizmoManager.getTransform();
		eventManager.emitEvent("gizmoTransformChange", {
			...transform,
			enabled: gizmoManager.isEnabled(),
			mode: gizmoManager.getMode()
		});
	});
	return {
		renderer,
		eventManager,
		sceneManager,
		cameraManager,
		controlsManager,
		lightingManager,
		hdriManager,
		viewHelperManager,
		loaderManager,
		modelManager,
		recordingManager,
		animationManager,
		gizmoManager,
		adapterRef
	};
}
function createLoad3d(container, options) {
	return new Load3d(container, buildLoad3dDeps(container), options);
}
window.comfyAPI = window.comfyAPI || {};
window.comfyAPI.createLoad3d = window.comfyAPI.createLoad3d || {};
window.comfyAPI.createLoad3d.createLoad3d = createLoad3d;
//#endregion
//#region src/services/load3dService.ts
/**
* Load3D Service - provides access to Load3D instances
*
* This service uses lazy imports to avoid pulling THREE.js into the main bundle.
* The nodeToLoad3dMap is accessed lazily - it will only be available after
* the load3d extension has been loaded.
*/
var cachedNodeToLoad3dMap = null;
var cachedUseLoad3dViewer = null;
var cachedSkeletonUtils = null;
function getNodeToLoad3dMapSync() {
	return cachedNodeToLoad3dMap;
}
async function loadNodeToLoad3dMap() {
	if (!cachedNodeToLoad3dMap) cachedNodeToLoad3dMap = (await __vitePreload(() => import("./useLoad3d-DfW5TfYk.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54]), import.meta.url)).nodeToLoad3dMap;
	return cachedNodeToLoad3dMap;
}
async function loadUseLoad3dViewer() {
	if (!cachedUseLoad3dViewer) cachedUseLoad3dViewer = (await __vitePreload(() => import("./useLoad3dViewer-B5nvmuTU.js"), __vite__mapDeps([55,56,2,7,8,9,6,18,14,17,19,20,21,57,25,5,11,26,27,28,29,53]), import.meta.url)).useLoad3dViewer;
	return cachedUseLoad3dViewer;
}
async function loadSkeletonUtils() {
	if (!cachedSkeletonUtils) cachedSkeletonUtils = await __vitePreload(() => import("./SkeletonUtils-CvokxFWL.js"), __vite__mapDeps([58,8,2]), import.meta.url);
	return cachedSkeletonUtils;
}
var viewerInstances = /* @__PURE__ */ new Map();
var Load3dService = class Load3dService {
	static instance;
	constructor() {}
	static getInstance() {
		if (!Load3dService.instance) Load3dService.instance = new Load3dService();
		return Load3dService.instance;
	}
	/**
	* Get Load3d instance for a node (synchronous).
	* Returns null if the load3d module hasn't been loaded yet.
	*/
	getLoad3d(node) {
		const rawNode = toRaw(node);
		const map = getNodeToLoad3dMapSync();
		if (!map) return null;
		return map.get(rawNode) || null;
	}
	/**
	* Get Load3d instance for a node (async, loads module if needed).
	*/
	async getLoad3dAsync(node) {
		const rawNode = toRaw(node);
		return (await loadNodeToLoad3dMap()).get(rawNode) || null;
	}
	getNodeByLoad3d(load3d) {
		const map = getNodeToLoad3dMapSync();
		if (!map) return null;
		for (const [node, instance] of map) if (instance === load3d) return node;
		return null;
	}
	removeLoad3d(node) {
		const rawNode = toRaw(node);
		const map = getNodeToLoad3dMapSync();
		if (!map) return;
		const instance = map.get(rawNode);
		if (instance) {
			instance.remove();
			map.delete(rawNode);
		}
	}
	clear() {
		const map = getNodeToLoad3dMapSync();
		if (!map) return;
		for (const [node] of map) this.removeLoad3d(node);
	}
	/**
	* Get or create viewer (async, loads module if needed).
	* Use this for initial viewer creation.
	*/
	async getOrCreateViewer(node) {
		const nodeId = node.id;
		if (!viewerInstances.has(nodeId)) {
			const useLoad3dViewer = await loadUseLoad3dViewer();
			viewerInstances.set(nodeId, useLoad3dViewer(node));
		}
		return viewerInstances.get(nodeId);
	}
	/**
	* Get or create viewer (sync version).
	* Only works after useLoad3dViewer has been loaded.
	* Returns null if module not yet loaded - use async version instead.
	*/
	getOrCreateViewerSync(node, useLoad3dViewer) {
		const nodeId = node.id;
		if (!viewerInstances.has(nodeId)) viewerInstances.set(nodeId, useLoad3dViewer(node));
		return viewerInstances.get(nodeId);
	}
	removeViewer(node) {
		const nodeId = node.id;
		const viewer = viewerInstances.get(nodeId);
		if (viewer) viewer.cleanup();
		viewerInstances.delete(nodeId);
	}
	async copyLoad3dState(source, target) {
		const sourceModel = source.modelManager.currentModel;
		const gizmoWasEnabled = target.getGizmoManager().isEnabled();
		target.getGizmoManager().detach();
		if (sourceModel) {
			const existingModel = target.getModelManager().currentModel;
			if (existingModel) target.getSceneManager().scene.remove(existingModel);
			if (source.isSplatModel()) {
				const originalURL = source.modelManager.originalURL;
				if (originalURL) await target.loadModel(originalURL);
			} else {
				const modelClone = (await loadSkeletonUtils()).clone(sourceModel);
				target.getModelManager().currentModel = modelClone;
				target.getSceneManager().scene.add(modelClone);
				const sourceOriginalModel = source.getModelManager().originalModel;
				if (sourceOriginalModel) target.getModelManager().originalModel = sourceOriginalModel;
				target.getModelManager().materialMode = source.getModelManager().materialMode;
				target.getModelManager().currentUpDirection = source.getModelManager().currentUpDirection;
				target.setMaterialMode(source.getModelManager().materialMode);
				target.setUpDirection(source.getModelManager().currentUpDirection);
				if (source.getModelManager().appliedTexture) target.getModelManager().appliedTexture = source.getModelManager().appliedTexture;
				const sourceInitial = source.getGizmoManager().getInitialTransform();
				modelClone.position.set(sourceInitial.position.x, sourceInitial.position.y, sourceInitial.position.z);
				modelClone.rotation.set(sourceInitial.rotation.x, sourceInitial.rotation.y, sourceInitial.rotation.z);
				modelClone.scale.set(sourceInitial.scale.x, sourceInitial.scale.y, sourceInitial.scale.z);
				target.getGizmoManager().setupForModel(modelClone);
				const gizmoTransform = source.getGizmoTransform();
				target.applyGizmoTransform(gizmoTransform.position, gizmoTransform.rotation, gizmoTransform.scale);
				if (gizmoWasEnabled || source.getGizmoManager().isEnabled()) target.setGizmoEnabled(true);
				if (source.hasAnimations()) target.animationManager.setupModelAnimations(modelClone, sourceOriginalModel);
			}
		}
		const sourceCameraType = source.getCurrentCameraType();
		const sourceCameraState = source.getCameraState();
		target.toggleCamera(sourceCameraType);
		target.setCameraState(sourceCameraState);
		target.setBackgroundColor(source.getSceneManager().currentBackgroundColor);
		target.toggleGrid(source.getSceneManager().gridHelper.visible);
		if (source.getSceneManager().getCurrentBackgroundInfo().type === "image") {
			const backgroundPath = (this.getNodeByLoad3d(source)?.properties?.["Scene Config"])?.backgroundImage;
			if (backgroundPath) await target.setBackgroundImage(backgroundPath);
		} else await target.setBackgroundImage("");
		target.setLightIntensity(source.getLightingManager().lights[1]?.intensity || 1);
		if (sourceCameraType === "perspective") target.setFOV(source.getCameraManager().perspectiveCamera.fov);
	}
	handleViewportRefresh(load3d) {
		if (!load3d) return;
		load3d.handleResize();
		const currentType = load3d.getCurrentCameraType();
		load3d.toggleCamera(currentType === "perspective" ? "orthographic" : "perspective");
		load3d.toggleCamera(currentType);
		load3d.getControlsManager().controls.update();
	}
	async handleViewerClose(node) {
		const viewer = await useLoad3dService().getOrCreateViewer(node);
		if (!viewer) return;
		if (viewer.needApplyChanges.value) {
			await viewer.applyChanges();
			const load3DNode = node;
			if (load3DNode.syncLoad3dConfig) load3DNode.syncLoad3dConfig();
		}
		useLoad3dService().removeViewer(node);
	}
};
var useLoad3dService = () => {
	return Load3dService.getInstance();
};
//#endregion
export { createLoad3d as n, Load3dUtils as r, useLoad3dService as t };

//# sourceMappingURL=load3dService-DKBzBRkk.js.map