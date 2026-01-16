# Blueprint Aplikasi Web

## Nama Proyek (Working Title)
**Gaze-Aware 3D Display Web App**

## Deskripsi Singkat
Aplikasi web interaktif yang menggunakan kamera perangkat untuk mendeteksi posisi mata / arah pandangan pengguna, lalu menyesuaikan perspektif tampilan 3D sehingga layar terasa seperti jendela 3D nyata (pseudo-holographic effect). Model 3D (misalnya dari Sketchfab) ditampilkan di tengah scene dan sudut pandangnya berubah secara real-time mengikuti pergerakan kepala/mata pengguna.

## Tujuan Utama
- Mensimulasikan efek 3D perspektif nyata pada layar 2D
- Menampilkan model 3D sebagai show model interaktif
- Menghubungkan pergerakan mata/kepala pengguna dengan kamera virtual 3D

## Fitur Utama
- Akses kamera (Webcam)
- Deteksi wajah dan landmark mata
- Estimasi posisi kepala (head pose estimation)
- Penyesuaian kamera 3D secara real-time
- Render model 3D dari file eksternal (GLTF/GLB)
- Efek depth & perspective correction

## Arsitektur Umum

```
[ Webcam ]
     ↓
[ Face & Eye Tracking ]  (MediaPipe / TensorFlow.js)
     ↓
[ Head Pose Estimation ]
     ↓
[ Virtual Camera Controller ]
     ↓
[ Three.js Renderer ]
     ↓
[ 3D Scene + Model Viewer ]
```

## Stack Teknologi

### Frontend
- HTML5
- CSS3 / Tailwind CSS
- JavaScript / TypeScript
- Three.js (WebGL renderer)

### Computer Vision
- MediaPipe Face Mesh (via CDN atau npm)
  - Deteksi wajah
  - Landmark mata
  - Estimasi arah pandangan

### 3D Asset
- Model 3D: `.glb` / `.gltf`
- Sumber: Sketchfab (download manual atau embed loader)

### Browser API
- `getUserMedia()` (kamera)
- `requestAnimationFrame()`

## Alur Kerja Sistem

1. User membuka aplikasi web
2. Browser meminta izin kamera
3. Kamera aktif dan feed diproses oleh Face Mesh
4. Sistem mendapatkan:
   - Posisi kepala (x, y, z relatif)
   - Arah pandangan (yaw, pitch)
5. Data ini dipetakan ke:
   - Posisi kamera virtual Three.js
   - Rotasi kamera
6. Scene 3D dirender ulang setiap frame
7. Model 3D tampak berubah sudut mengikuti gerakan user

## Ilusi "3D Window / Monitor"

### Konsep
Layar dianggap sebagai jendela ke dunia 3D. Kamera virtual selalu menghadap ke titik tengah layar, namun posisinya bergeser mengikuti posisi kepala user.

### Mapping Sederhana
- Gerak kepala ke kiri → kamera bergeser ke kanan
- Gerak kepala ke atas → kamera turun
- Mendekat ke layar → FOV atau Z kamera menyesuaikan

### Rumus Dasar (Konseptual)
```
camera.position.x = headX * sensitivity
camera.position.y = headY * sensitivity
camera.position.z = baseZ + headZ
camera.lookAt(sceneCenter)
```

## Struktur Folder

```
project-root/
├── public/
│   ├── index.html
│   ├── models/
│   │   └── model.glb
│   └── assets/
│
├── src/
│   ├── camera/
│   │   └── webcam.js
│   ├── tracking/
│   │   └── faceTracker.js
│   ├── three/
│   │   ├── scene.js
│   │   ├── cameraController.js
│   │   └── modelLoader.js
│   ├── utils/
│   │   └── mapping.js
│   └── main.js
│
└── blueprint.md
```

## Modul Penting

### Face Tracker
- Inisialisasi MediaPipe FaceMesh
- Ambil landmark mata & hidung
- Hitung offset posisi kepala

### Head Pose Estimation
- Gunakan perbandingan jarak antar landmark
- Normalisasi ke rentang -1 .. 1

### Camera Controller
- Sinkronisasi data tracking ke kamera Three.js
- Smooth movement (lerp)

### 3D Renderer
- PerspectiveCamera
- Ambient + Directional Light
- Shadow opsional

## Integrasi Model 3D (Sketchfab)

### Opsi 1: Download Model
- Download `.glb`
- Load via `GLTFLoader`

### Opsi 2: Sketchfab Viewer API (opsional)
- Embed iframe
- Sinkronisasi kamera (lebih terbatas)

## UX & Visual
- Background grid / box perspective (seperti ruang 3D)
- Model di tengah sebagai fokus
- Feedback indikator tracking (opsional, debug)

## Tantangan Teknis
- Latency kamera
- Noise pada deteksi wajah
- Performa di device low-end
- Akurasi depth estimation (Z-axis)

## Optimasi
- Throttling tracking frame
- Smoothing dengan moving average / lerp
- Resolusi kamera rendah

## Keamanan & Privasi
- Kamera hanya diproses lokal
- Tidak ada upload video
- Jelaskan izin kamera ke user

## Pengembangan Lanjutan
- Support VR / WebXR
- Multi-model gallery
- Kalibrasi jarak mata
- Dynamic lighting sesuai posisi user

## Output Akhir
- Aplikasi web interaktif
- Efek 3D perspektif nyata
- Model 3D terasa "hidup" mengikuti pandangan user

