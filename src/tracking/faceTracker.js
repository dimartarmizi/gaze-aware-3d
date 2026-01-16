import { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export class FaceTracker {
	constructor(videoElement, canvasElement) {
		this.videoElement = videoElement;
		this.canvasElement = canvasElement;
		this.canvasCtx = canvasElement.getContext('2d');

		this.canvasElement.width = 640;
		this.canvasElement.height = 480;

		this.faceMesh = new FaceMesh({
			locateFile: (file) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
			}
		});

		this.faceMesh.setOptions({
			maxNumFaces: 1,
			refineLandmarks: true,
			minDetectionConfidence: 0.6,
			minTrackingConfidence: 0.6
		});

		this.headPose = { x: 0, y: 0, z: 0 };
		this.faceMesh.onResults(this.onResults.bind(this));

		this.camera = new Camera(this.videoElement, {
			onFrame: async () => {
				await this.faceMesh.send({ image: this.videoElement });
			},
			width: 640,
			height: 480
		});
	}

	async start() {
		await this.camera.start();
	}

	onResults(results) {
		this.canvasCtx.save();
		this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

		if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
			const landmarks = results.multiFaceLandmarks[0];

			drawConnectors(this.canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
			drawConnectors(this.canvasCtx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030', lineWidth: 1 });
			drawConnectors(this.canvasCtx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30', lineWidth: 1 });

			const noseTip = landmarks[1];

			this.headPose.x = (noseTip.x - 0.5) * 2;
			this.headPose.y = (0.5 - noseTip.y) * 2;

			const leftFace = landmarks[234];
			const rightFace = landmarks[454];
			const faceWidth = Math.sqrt(
				Math.pow(leftFace.x - rightFace.x, 2) +
				Math.pow(leftFace.y - rightFace.y, 2)
			);

			this.headPose.z = (0.15 / faceWidth);
		}
		this.canvasCtx.restore();
	}

	getHeadPose() {
		return this.headPose;
	}
}
