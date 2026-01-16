import * as THREE from 'three';

export class CameraController {
	constructor(camera) {
		this.camera = camera;
		this.targetPosition = new THREE.Vector3(0, 0, 5);
		this.currentPosition = new THREE.Vector3(0, 0, 5);
		this.sensitivity = {
			x: 8,
			y: 6,
			z: 10
		};
		this.lerpFactor = 0.1;
	}

	update(headPose) {
		const sensitivityScale = 0.5;

		this.targetPosition.x = -headPose.x * this.sensitivity.x * sensitivityScale;
		this.targetPosition.y = headPose.y * this.sensitivity.y * sensitivityScale;

		this.targetPosition.z = 10 + (headPose.z * this.sensitivity.z * 0.3);

		this.targetPosition.x = THREE.MathUtils.clamp(this.targetPosition.x, -5, 5);
		this.targetPosition.y = THREE.MathUtils.clamp(this.targetPosition.y, -4, 4);
		this.targetPosition.z = THREE.MathUtils.clamp(this.targetPosition.z, 8, 25);

		this.currentPosition.lerp(this.targetPosition, 0.1);

		this.camera.position.copy(this.currentPosition);

		const aspect = window.innerWidth / window.innerHeight;
		const width = 10;
		const height = width / aspect;

		const near = 0.1;
		const far = 1000;

		const z = this.currentPosition.z;

		const left = ((-width / 2) - this.currentPosition.x) * (near / z);
		const right = ((width / 2) - this.currentPosition.x) * (near / z);
		const top = ((height / 2) - this.currentPosition.y) * (near / z);
		const bottom = ((-height / 2) - this.currentPosition.y) * (near / z);

		this.camera.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
		this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();

		this.camera.quaternion.set(0, 0, 0, 1);
	}
}
