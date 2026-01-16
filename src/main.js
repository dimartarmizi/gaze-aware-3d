import { initScene } from './three/scene.js';
import { FaceTracker } from './tracking/faceTracker.js';
import { CameraController } from './three/cameraController.js';

async function main() {
	const statusEl = document.getElementById('status');
	const videoEl = document.getElementById('webcam-view');
	const canvasEl = document.getElementById('feedback-canvas');

	try {
		const { scene, camera, renderer } = initScene();

		const faceTracker = new FaceTracker(videoEl, canvasEl);
		await faceTracker.start();

		const cameraController = new CameraController(camera);

		statusEl.textContent = 'Tracking active. Move your head to change perspective.';

		function animate() {
			requestAnimationFrame(animate);

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
