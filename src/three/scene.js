import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initScene() {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x050505);

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({ 
		antialias: true,
		logarithmicDepthBuffer: false
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;
	document.getElementById('canvas-container').appendChild(renderer.domElement);

	const aspect = window.innerWidth / window.innerHeight;
	const width = 10;
	const height = width / aspect;
	let depth = 15;

	let gridRoom = createGridRoom(width, height, depth);
	scene.add(gridRoom);

	const modelContainer = new THREE.Group();
	scene.add(modelContainer);

	const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
	const sphereMaterial = new THREE.MeshStandardMaterial({
		color: 0x00ff88,
		metalness: 0.5,
		roughness: 0.2
	});
	let currentModel = new THREE.Mesh(sphereGeometry, sphereMaterial);
	modelContainer.add(currentModel);
	modelContainer.position.set(0, 0, 0);

	const mainLight = new THREE.DirectionalLight(0xffffff, 3);
	mainLight.position.set(5, 10, 7.5);
	scene.add(mainLight);

	const fillLight = new THREE.PointLight(0x00ffff, 1, 50);
	fillLight.position.set(-5, 5, -5);
	scene.add(fillLight);

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
	scene.add(hemiLight);

	window.addEventListener('resize', () => {
		const aspect = window.innerWidth / window.innerHeight;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	const loader = new GLTFLoader();
	let mixer = null;
	const clock = new THREE.Clock();

	return {
		scene,
		camera,
		renderer,
		update: () => {
			if (mixer) {
				const delta = clock.getDelta();
				mixer.update(delta);
			}
		},
		updateBackground: (theme) => {
			if (theme === 'dark') {
				scene.background = new THREE.Color(0x050505);
				gridRoom.visible = false;
			} else if (theme === 'light') {
				scene.background = new THREE.Color(0xeeeeee);
				gridRoom.visible = false;
			} else if (theme === 'grid') {
				scene.background = new THREE.Color(0x050505);
				gridRoom.visible = true;
			}
		},
		updatePOV: (newDepth) => {
			depth = newDepth;
			scene.remove(gridRoom);
			gridRoom = createGridRoom(width, height, depth);
			scene.add(gridRoom);
		},
		updateLighting: (intensity) => {
			mainLight.intensity = intensity * 2;
			hemiLight.intensity = intensity;
		},
		updateModelTransform: (transform) => {
			if (transform.position) {
				const z = Math.min(0, transform.position.z);
				modelContainer.position.set(transform.position.x, transform.position.y, z);
			}
			if (transform.rotation) {
				modelContainer.rotation.set(
					THREE.MathUtils.degToRad(transform.rotation.x),
					THREE.MathUtils.degToRad(transform.rotation.y),
					THREE.MathUtils.degToRad(transform.rotation.z)
				);
			}
			if (transform.scale) {
				modelContainer.scale.setScalar(transform.scale);
			}
		},
		getModelTransform: () => {
			return {
				position: { x: modelContainer.position.x, y: modelContainer.position.y, z: modelContainer.position.z },
				rotation: { 
					x: THREE.MathUtils.radToDeg(modelContainer.rotation.x), 
					y: THREE.MathUtils.radToDeg(modelContainer.rotation.y) ,
					z: THREE.MathUtils.radToDeg(modelContainer.rotation.z)
				},
				scale: modelContainer.scale.x
			};
		},
		loadModel: (url, onComplete) => {
			loader.load(url, (gltf) => {
				modelContainer.remove(currentModel);
				currentModel = gltf.scene;
				
				currentModel.traverse((child) => {
					if (child.isMesh) {
						child.material.alphaTest = 0.5;
						child.material.depthWrite = true;
						child.material.needsUpdate = true;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});

				mixer = new THREE.AnimationMixer(currentModel);
				const animations = gltf.animations;

				const box = new THREE.Box3().setFromObject(currentModel);
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const scaleFactor = 3 / maxDim;
				currentModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
				
				const center = box.getCenter(new THREE.Vector3());
				currentModel.position.sub(center.multiplyScalar(scaleFactor));
				
				modelContainer.add(currentModel);

				if (onComplete) onComplete(animations);
			});
		},
		setAnimation: (clip) => {
			if (!mixer) return;
			mixer.stopAllAction();
			if (clip) {
				mixer.clipAction(clip).play();
			}
		}
	};
}

function createGridRoom(width, height, depth) {
	const group = new THREE.Group();
	const divisions = 10;
	const gridColor = 0xaaaaaa;

	const floorGrid = new THREE.GridHelper(depth, divisions, gridColor, gridColor);
	floorGrid.position.y = -height / 2;
	floorGrid.position.z = -depth / 2;
	floorGrid.rotation.x = 0;


	const material = new THREE.LineBasicMaterial({ color: gridColor });

	for (let i = 0; i <= divisions; i++) {
		const x = (i / divisions - 0.5) * width;
		const zStart = 0;
		const zEnd = -depth;

		const points = [];
		points.push(new THREE.Vector3(x, -height / 2, zStart));
		points.push(new THREE.Vector3(x, -height / 2, zEnd));
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		group.add(new THREE.Line(geometry, material));
	}
	for (let i = 0; i <= divisions; i++) {
		const z = -(i / divisions) * depth;
		const xStart = -width / 2;
		const xEnd = width / 2;

		const points = [];
		points.push(new THREE.Vector3(xStart, -height / 2, z));
		points.push(new THREE.Vector3(xEnd, -height / 2, z));
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		group.add(new THREE.Line(geometry, material));
	}

	for (let i = 0; i <= divisions; i++) {
		const x = (i / divisions - 0.5) * width;
		const points = [new THREE.Vector3(x, height / 2, 0), new THREE.Vector3(x, height / 2, -depth)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}
	for (let i = 0; i <= divisions; i++) {
		const z = -(i / divisions) * depth;
		const points = [new THREE.Vector3(-width / 2, height / 2, z), new THREE.Vector3(width / 2, height / 2, z)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}

	for (let i = 0; i <= divisions; i++) {
		const y = (i / divisions - 0.5) * height;
		const points = [new THREE.Vector3(-width / 2, y, 0), new THREE.Vector3(-width / 2, y, -depth)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}
	for (let i = 0; i <= divisions; i++) {
		const z = -(i / divisions) * depth;
		const points = [new THREE.Vector3(-width / 2, -height / 2, z), new THREE.Vector3(-width / 2, height / 2, z)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}

	for (let i = 0; i <= divisions; i++) {
		const y = (i / divisions - 0.5) * height;
		const points = [new THREE.Vector3(width / 2, y, 0), new THREE.Vector3(width / 2, y, -depth)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}
	for (let i = 0; i <= divisions; i++) {
		const z = -(i / divisions) * depth;
		const points = [new THREE.Vector3(width / 2, -height / 2, z), new THREE.Vector3(width / 2, height / 2, z)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}

	for (let i = 0; i <= divisions; i++) {
		const x = (i / divisions - 0.5) * width;
		const points = [new THREE.Vector3(x, -height / 2, -depth), new THREE.Vector3(x, height / 2, -depth)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}
	for (let i = 0; i <= divisions; i++) {
		const y = (i / divisions - 0.5) * height;
		const points = [new THREE.Vector3(-width / 2, y, -depth), new THREE.Vector3(width / 2, y, -depth)];
		group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
	}

	return group;
}
