import { initScene } from './three/scene.js';
import { FaceTracker } from './tracking/faceTracker.js';
import { CameraController } from './three/cameraController.js';

async function main() {
	const statusEl = document.getElementById('status');
	const videoEl = document.getElementById('webcam-view');
	const canvasEl = document.getElementById('feedback-canvas');

	const btnApp = document.getElementById('btn-app-settings');
	const btnModel = document.getElementById('btn-model-settings');
	const btnHelp = document.getElementById('btn-help');
	const btnResetModel = document.getElementById('btn-reset-model');
	const btnResetApp = document.getElementById('btn-reset-app');
	
	const panelApp = document.getElementById('panel-app-settings');
	const panelModel = document.getElementById('panel-model-settings');
	const panelHelp = document.getElementById('panel-help');

	const settingBg = document.getElementById('setting-bg');
	const settingPov = document.getElementById('setting-pov');
	const settingShowTitle = document.getElementById('setting-show-title');
	const settingShowWebcam = document.getElementById('setting-show-webcam');

	const settingModelFile = document.getElementById('setting-model-file');
	const settingModelX = document.getElementById('setting-model-x');
	const settingModelY = document.getElementById('setting-model-y');
	const settingModelZ = document.getElementById('setting-model-z');
	const settingModelRotX = document.getElementById('setting-model-rot-x');
	const settingModelRotY = document.getElementById('setting-model-rot-y');
	const settingModelScale = document.getElementById('setting-model-scale');
	const settingModelLight = document.getElementById('setting-model-light');
	const settingModelAnim = document.getElementById('setting-model-anim');
	const groupModelAnim = document.getElementById('group-model-anim');

	const defaults = {
		x: 0,
		y: 0,
		z: 0,
		rotX: 0,
		rotY: 0,
		scale: 1,
		light: 1.5
	};

	try {
		const sceneData = initScene();
		const { scene, camera, renderer, update, updateBackground, updatePOV, updateLighting, updateModelTransform, getModelTransform, loadModel, setAnimation } = sceneData;

		const faceTracker = new FaceTracker(videoEl, canvasEl);
		await faceTracker.start();

		const cameraController = new CameraController(camera);

		let currentAnimations = [];

		statusEl.textContent = 'Tracking active. Move your head to change perspective.';

		const togglePanel = (panel) => {
			const isActive = panel.classList.contains('active');
			document.querySelectorAll('.glass-panel').forEach(p => p.classList.remove('active'));
			if (!isActive) panel.classList.add('active');
		};

		const updateValDisplays = () => {
			document.getElementById('val-pov').textContent = settingPov.value;
			document.getElementById('val-model-x').textContent = parseFloat(settingModelX.value).toFixed(1);
			document.getElementById('val-model-y').textContent = parseFloat(settingModelY.value).toFixed(1);
			document.getElementById('val-model-z').textContent = parseFloat(settingModelZ.value).toFixed(1);
			document.getElementById('val-model-rot-x').textContent = settingModelRotX.value;
			document.getElementById('val-model-rot-y').textContent = settingModelRotY.value;
			document.getElementById('val-model-scale').textContent = parseFloat(settingModelScale.value).toFixed(1);
			document.getElementById('val-model-light').textContent = parseFloat(settingModelLight.value).toFixed(1);
		};

		btnApp.onclick = () => togglePanel(panelApp);
		btnModel.onclick = () => togglePanel(panelModel);
		btnHelp.onclick = () => togglePanel(panelHelp);

		settingBg.onchange = (e) => updateBackground(e.target.value);
		settingPov.oninput = (e) => {
			updatePOV(parseInt(e.target.value));
			updateValDisplays();
		};
		settingShowTitle.onchange = (e) => {
			document.getElementById('ui-overlay').style.opacity = e.target.checked ? '1' : '0';
		};
		settingShowWebcam.onchange = (e) => {
			document.getElementById('webcam-container').style.opacity = e.target.checked ? '1' : '0';
		};

		btnResetApp.onclick = () => {
			settingBg.value = 'dark';
			settingPov.value = 15;
			settingShowTitle.checked = true;
			settingShowWebcam.checked = true;
			
			updateBackground('dark');
			updatePOV(15);
			document.getElementById('ui-overlay').style.opacity = '1';
			document.getElementById('webcam-container').style.opacity = '1';
			updateValDisplays();
		};

		const updateSlidersFromModel = () => {
			const t = getModelTransform();
			settingModelX.value = t.position.x;
			settingModelY.value = t.position.y;
			settingModelZ.value = t.position.z;
			settingModelRotX.value = t.rotation.x;
			settingModelRotY.value = t.rotation.y;
			settingModelScale.value = t.scale;
			updateValDisplays();
		};

		const updateModelFromSliders = () => {
			updateModelTransform({
				position: { x: parseFloat(settingModelX.value), y: parseFloat(settingModelY.value), z: parseFloat(settingModelZ.value) },
				rotation: { x: parseFloat(settingModelRotX.value), y: parseFloat(settingModelRotY.value), z: 0 },
				scale: parseFloat(settingModelScale.value)
			});
			updateValDisplays();
		};

		[settingModelX, settingModelY, settingModelZ, settingModelRotX, settingModelRotY, settingModelScale].forEach(el => {
			el.oninput = updateModelFromSliders;
		});

		settingModelLight.oninput = (e) => {
			updateLighting(parseFloat(e.target.value));
			updateValDisplays();
		};

		btnResetModel.onclick = () => {
			settingModelX.value = defaults.x;
			settingModelY.value = defaults.y;
			settingModelZ.value = defaults.z;
			settingModelRotX.value = defaults.rotX;
			settingModelRotY.value = defaults.rotY;
			settingModelScale.value = defaults.scale;
			settingModelLight.value = defaults.light;
			updateModelFromSliders();
			updateLighting(defaults.light);
		};
		updateValDisplays();
		settingModelFile.onchange = (e) => {
			const file = e.target.files[0];
			if (file) {
				const url = URL.createObjectURL(file);
				loadModel(url, (animations) => {
					currentAnimations = animations;
					settingModelAnim.innerHTML = '<option value="">Tanpa Animasi</option>';
					
					if (animations && animations.length > 0) {
						groupModelAnim.style.display = 'block';
						animations.forEach((anim, index) => {
							const option = document.createElement('option');
							option.value = index;
							option.textContent = anim.name || `Animation ${index + 1}`;
							settingModelAnim.appendChild(option);
						});
					} else {
						groupModelAnim.style.display = 'none';
					}
				});
			}
		};

		settingModelAnim.onchange = (e) => {
			const index = e.target.value;
			if (index === "") {
				setAnimation(null);
			} else {
				setAnimation(currentAnimations[parseInt(index)]);
			}
		};

		let isDragging = false;
		let dragMode = 'rotate';
		let lastMouseX, lastMouseY;

		renderer.domElement.addEventListener('mousedown', (e) => {
			isDragging = true;
			lastMouseX = e.clientX;
			lastMouseY = e.clientY;
			dragMode = e.button === 0 ? 'rotate' : 'pan';
		});

		window.addEventListener('mouseup', () => {
			isDragging = false;
		});

		renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

		window.addEventListener('mousemove', (e) => {
			if (!isDragging) return;

			const deltaX = e.clientX - lastMouseX;
			const deltaY = e.clientY - lastMouseY;
			lastMouseX = e.clientX;
			lastMouseY = e.clientY;

			const t = getModelTransform();

			if (dragMode === 'rotate') {
				t.rotation.y += deltaX * 0.5;
				t.rotation.x += deltaY * 0.5;
			} else {
				t.position.x += deltaX * 0.02;
				t.position.y -= deltaY * 0.02;
			}

			t.position.z = Math.min(0, t.position.z);

			updateModelTransform(t);
			updateSlidersFromModel();
		});

		renderer.domElement.addEventListener('wheel', (e) => {
			e.preventDefault();
			const t = getModelTransform();
			t.position.z -= e.deltaY * 0.01;
			t.position.z = Math.min(0, t.position.z);
			updateModelTransform(t);
			updateSlidersFromModel();
		}, { passive: false });

		function animate() {
			requestAnimationFrame(animate);

			if (update) update();

			const headPose = faceTracker.getHeadPose();
			if (headPose) {
				cameraController.update(headPose);
			}

			renderer.render(scene, camera);
		}

		animate();

	} catch (error) {
		console.error(error);
		statusEl.textContent = 'Error: ' + error.message;
	}
}

main();
