/**
 * Khởi tạo Cảnh 3D (Scene, Camera, Renderer, Cinematic Lights & Starfield)
 * Nâng cấp màu nền phong phú (Bầu trời tinh vân, Vầng Trăng rằm khổng lồ phát sáng)
 * Cho phép thu phóng góc nhìn siêu rộng (Zoom out rộng rãi) & tối ưu Mobile
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { createMoonSurface, createBanyanTree, createCharacters, createEarth, createSolarSystem } from './models.js';

export class WorldScene {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initControls();
    this.initLights();
    this.initSkyAndCosmos();
    this.buildWorld();

    this.clock = new THREE.Clock();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initScene() {
    this.scene = new THREE.Scene();
    // Bầu không khí vũ trụ thăm thẳm
    this.scene.background = new THREE.Color(0x060818);
    // Sương mờ nhẹ ở khoảng cách xa để không gian sâu thẳm rõ nét
    this.scene.fog = new THREE.Fog(0x060818, 140, 750);
  }

  initCamera() {
    // Tầm nhìn xa lên đến 1200 để thấy trọn vẹn cả Hệ Mặt Trời khi zoom out
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 1200);
    this.camera.position.set(0, 5.6, 20.5);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 3.8, 0);

    // PHẠM VI ZOOM SIÊU RỘNG:
    // Zoom gần (2.0) ngắm Cuội, Hằng, Thỏ, Đèn lồng
    // Zoom xa (190.0) ngắm trọn quả cầu Mặt Trăng, Trái Đất và cả Hệ Mặt Trời!
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 190.0;
    this.controls.minPolarAngle = Math.PI * 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.75; // Có thể xoay ngắm quanh Mặt Trăng khi zoom xa

    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.14;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1.1;
  }

  initLights() {
    // 1. Ánh sáng môi trường xanh đêm sâu thẳm
    const ambientLight = new THREE.AmbientLight(0x28325a, 0.95);
    this.scene.add(ambientLight);

    // 2. Ánh trăng vàng ngà dịu mát từ trên cao (Moonlight Key Light)
    const moonLight = new THREE.DirectionalLight(0xfff3db, 2.2);
    moonLight.position.set(-10, 22, -8);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 1;
    moonLight.shadow.camera.far = 45;
    moonLight.shadow.camera.left = -16;
    moonLight.shadow.camera.right = 16;
    moonLight.shadow.camera.top = 20;
    moonLight.shadow.camera.bottom = -6;
    moonLight.shadow.bias = -0.001;
    this.scene.add(moonLight);

    // 3. Ánh sáng ngược (Rim light) màu xanh thiên thanh tôn vinh đường nét nhân vật
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    rimLight.position.set(12, 14, 10);
    this.scene.add(rimLight);

    // 4. Ánh sáng vàng hổ phách ấm áp từ trung tâm gốc cây
    const groundGlow = new THREE.PointLight(0xf59e0b, 1.8, 16, 1.6);
    groundGlow.position.set(0, 1.8, 3.2);
    this.scene.add(groundGlow);
    this.groundGlow = groundGlow;
  }

  /**
   * Tạo bầu trời vũ trụ bao la, ngàn sao và đom đóm
   */
  initSkyAndCosmos() {
    // A. VÒM TRỜI VŨ TRỤ SÂU THẲM (Cosmic Deep Skydome)
    const skyGeo = new THREE.SphereGeometry(600, 32, 24);
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d');
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
    skyGrad.addColorStop(0, '#040612');   // Đỉnh trời thăm thẳm
    skyGrad.addColorStop(0.35, '#0e1236'); // Tím xanh huyền bí
    skyGrad.addColorStop(0.7, '#151c4a');  // Xanh sapphire
    skyGrad.addColorStop(1, '#24183e');    // Chân trời hoàng hôn vũ trụ
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 512, 512);

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyDome);

    // B. Bầu trời ngàn sao lấp lánh (2.800 ngôi sao trong không gian sâu)
    const starCount = 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0xffffff), // Trắng bạc
      new THREE.Color(0xfef08a), // Vàng kim nhạt
      new THREE.Color(0x93c5fd), // Xanh thiên thanh
      new THREE.Color(0xf472b6)  // Hồng thạch anh
    ];

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1); // Rải đều khắp quả cầu vũ trụ
      const radius = 350 + Math.random() * 200;

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // C. Đom đóm mặt trăng bay lơ lửng quanh cây đa
    const fireflyCount = 130;
    const ffGeo = new THREE.BufferGeometry();
    const ffPositions = new Float32Array(fireflyCount * 3);
    this.fireflyVelocities = [];

    for (let i = 0; i < fireflyCount; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = 0.5 + Math.random() * 11;
      const z = (Math.random() - 0.5) * 18;

      ffPositions[i * 3] = x;
      ffPositions[i * 3 + 1] = y;
      ffPositions[i * 3 + 2] = z;

      this.fireflyVelocities.push({
        originX: x,
        originY: y,
        originZ: z,
        phase: Math.random() * Math.PI * 2
      });
    }

    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPositions, 3));

    const ffMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.38,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.fireflies = new THREE.Points(ffGeo, ffMat);
    this.scene.add(this.fireflies);
  }

  buildWorld() {
    // 1. Mặt Trăng (Quả cầu hoàn chỉnh)
    this.moonSurface = createMoonSurface();
    this.scene.add(this.moonSurface);

    // 2. Cây Đa Cổ Thụ
    this.banyanTree = createBanyanTree();
    this.scene.add(this.banyanTree);

    // 3. Nhân vật: Cuội, Hằng, Thỏ Ngọc
    this.characters = createCharacters();
    this.scene.add(this.characters);

    // 4. TRÁI ĐẤT XANH BIẾC (The Earth) - Hiện diện lộng lẫy trên bầu trời cung trăng
    this.earth = createEarth(9.5);
    // Vị trí đẹp: Nhìn thấy rõ từ mặt trăng bên cạnh cây đa
    this.earth.position.set(-34, 28, -42);
    this.scene.add(this.earth);

    // 5. TOÀN BỘ HỆ MẶT TRỜI KỲ VĨ (The Solar System)
    // Khi zoom out xa sẽ chiêm ngưỡng trọn vẹn Mặt Trời rực rỡ, Sao Hỏa, Sao Mộc, Sao Thổ có vành đai
    this.solarSystem = createSolarSystem();
    this.scene.add(this.solarSystem);
  }

  update() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // 1. Trái Đất tự quay quanh trục & Tầng mây cuộn trôi
    if (this.earth) {
      if (this.earth.earthMesh) {
        this.earth.earthMesh.rotation.y += delta * 0.08;
      }
      if (this.earth.cloudMesh) {
        this.earth.cloudMesh.rotation.y += delta * 0.13;
      }
    }

    // 2. Các hành tinh trong Hệ Mặt Trời chuyển động theo quỹ đạo
    if (this.solarSystem && this.solarSystem.planets) {
      this.solarSystem.planets.forEach(p => {
        p.angle += delta * p.speed * 0.08;
        p.position.x = this.solarSystem.sunCenter.x + Math.cos(p.angle) * p.orbitDist;
        p.position.z = this.solarSystem.sunCenter.z + Math.sin(p.angle) * p.orbitDist;
        p.rotation.y += delta * 0.4;
      });
      // Mặt Trời tự quay nhẹ
      if (this.solarSystem.sunGroup) {
        this.solarSystem.sunGroup.rotation.y += delta * 0.04;
      }
    }

    // 3. Xoay bầu trời ngàn sao cực chậm
    if (this.starfield) {
      this.starfield.rotation.y = elapsed * 0.005;
    }

    // 4. Đom đóm vũ trụ bay lượn
    if (this.fireflies) {
      const pos = this.fireflies.geometry.attributes.position.array;
      for (let i = 0; i < this.fireflyVelocities.length; i++) {
        const vel = this.fireflyVelocities[i];
        const t = elapsed * 0.7 + vel.phase;

        pos[i * 3] = vel.originX + Math.sin(t) * 1.3;
        pos[i * 3 + 1] = vel.originY + Math.cos(t * 0.8) * 0.9;
        pos[i * 3 + 2] = vel.originZ + Math.sin(t * 0.5) * 1.3;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Tán lá cây đa đung đưa trong gió thu
    if (this.banyanTree && this.banyanTree.foliageGroup) {
      const foliage = this.banyanTree.foliageGroup;
      foliage.rotation.y = Math.sin(elapsed * 0.55) * 0.018;
      foliage.rotation.z = Math.cos(elapsed * 0.45) * 0.012;
    }

    // 6. Hoạt ảnh nhân vật
    if (this.characters) {
      // Chú Cuội
      if (this.characters.cuoiGroup) {
        this.characters.cuoiGroup.position.y = Math.sin(elapsed * 1.2) * 0.035;
        this.characters.cuoiGroup.rotation.z = Math.cos(elapsed * 0.85) * 0.02;
      }

      // Chị Hằng & Dải lụa tiên
      if (this.characters.hangGroup) {
        this.characters.hangGroup.position.y = Math.sin(elapsed * 1.2 + 0.5) * 0.03;
        if (this.characters.hangGroup.ribbon) {
          const ribbon = this.characters.hangGroup.ribbon;
          ribbon.rotation.x = Math.sin(elapsed * 1.4) * 0.09;
          ribbon.rotation.y = Math.cos(elapsed * 1.0) * 0.07;
        }
      }

      // Thỏ Ngọc
      if (this.characters.rabbitGroup) {
        const rabbit = this.characters.rabbitGroup;
        if (rabbit.leftEar && rabbit.rightEar) {
          rabbit.leftEar.rotation.z = -0.2 + Math.sin(elapsed * 3.0) * 0.09;
          rabbit.rightEar.rotation.z = 0.2 - Math.sin(elapsed * 3.0) * 0.09;
        }
        rabbit.scale.y = 1.0 + Math.sin(elapsed * 2.0) * 0.035;
      }
    }

    this.controls.update();

    return { delta, elapsed };
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
