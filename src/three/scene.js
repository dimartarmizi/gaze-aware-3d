import * as THREE from 'three';

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
	const depth = 15;

	const gridRoom = createGridRoom(width, height, depth);
	scene.add(gridRoom);

	const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
	const sphereMaterial = new THREE.MeshStandardMaterial({
		color: 0x00ff88,
		metalness: 0.8,
		roughness: 0.2,
		emissive: 0x003311
	});
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphere.position.set(0, 0, -depth / 2);
	scene.add(sphere);

	const pointLight = new THREE.PointLight(0x00ffff, 1, 20);
	pointLight.position.set(0, 0, -5);
	scene.add(pointLight);

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	window.addEventListener('resize', () => {
		const aspect = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	return { scene, camera, renderer };
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
