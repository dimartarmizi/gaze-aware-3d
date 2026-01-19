import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initScene() {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x050505);

	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.getElementById('canvas-container').appendChild(renderer.domElement);

	const aspect = window.innerWidth / window.innerHeight;
	const width = 10;
	const height = width / aspect;
	let depth = 15;

	let gridRoom = createGridRoom(width, height, depth);
	scene.add(gridRoom);

	// Container for the model to allow Sketchfab-like rotation/panning
	const modelContainer = new THREE.Group();
	scene.add(modelContainer);

	const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
	const sphereMaterial = new THREE.MeshStandardMaterial({
		color: 0x00ff88,
		metalness: 0.8,
		roughness: 0.2,
		emissive: 0x003311
	});
	let currentModel = new THREE.Mesh(sphereGeometry, sphereMaterial);
	modelContainer.add(currentModel);
	modelContainer.position.set(0, 0, -depth / 2);

	const pointLight = new THREE.PointLight(0x00ffff, 1, 50);
	pointLight.position.set(0, 5, -5);
	scene.add(pointLight);

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
	scene.add(ambientLight);

	window.addEventListener('resize', () => {
		const aspect = window.innerWidth / window.innerHeight;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	const loader = new GLTFLoader();

	return {
		scene,
		camera,
		renderer,
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
		updateModelTransform: (transform) => {
			if (transform.position) {
				modelContainer.position.set(transform.position.x, transform.position.y, transform.position.z);
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
		loadModel: (url) => {
			loader.load(url, (gltf) => {
				modelContainer.remove(currentModel);
				currentModel = gltf.scene;
				// Auto-scale to fit roughly
				const box = new THREE.Box3().setFromObject(currentModel);
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const scaleFactor = 3 / maxDim;
				currentModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
				
				// Center the model in the container
				const center = box.getCenter(new THREE.Vector3());
				currentModel.position.sub(center.multiplyScalar(scaleFactor));
				
				modelContainer.add(currentModel);
			});
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
