/**
 * Mô hình hóa 3D nghệ thuật cho website Trung Thu Cung Trăng
 * Sử dụng Three.js: Bề mặt Mặt Trăng, Cây Đa cổ thụ, Chú Cuội, Chị Hằng, Thỏ Ngọc & Đèn Lồng
 */

import * as THREE from 'three';
import { WISHES } from './wishes.js';

/**
 * Tạo chất liệu bề mặt Mặt Trăng bằng Canvas động (Dynamic Procedural Texture)
 */
function createMoonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Nền xám bạc ánh xanh tím mộng ảo
  const gradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 600);
  gradient.addColorStop(0, '#3a4168');
  gradient.addColorStop(0.5, '#222744');
  gradient.addColorStop(1, '#11152a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // Vẽ các đốm bụi mặt trăng (Moon dust & craters)
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = Math.random() * 8 + 1;
    const alpha = Math.random() * 0.15 + 0.05;
    ctx.fillStyle = `rgba(200, 215, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vẽ vài miệng hố thiên thạch mờ (Craters)
  const craterCenters = [
    { x: 300, y: 400, r: 65 },
    { x: 700, y: 350, r: 90 },
    { x: 500, y: 750, r: 110 },
    { x: 200, y: 800, r: 45 },
    { x: 850, y: 700, r: 55 }
  ];

  craterCenters.forEach(c => {
    // Vành hố sáng
    ctx.strokeStyle = 'rgba(230, 240, 255, 0.18)';
    ctx.lineWidth = c.r * 0.15;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.stroke();

    // Đáy hố sẫm
    const innerGrad = ctx.createRadialGradient(c.x - c.r * 0.2, c.y - c.r * 0.2, 5, c.x, c.y, c.r);
    innerGrad.addColorStop(0, 'rgba(10, 14, 30, 0.45)');
    innerGrad.addColorStop(1, 'rgba(30, 35, 65, 0.05)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * 1. BỀ MẶT MẶT TRĂNG (The Moon Surface - Quả cầu Mặt Trăng hoàn chỉnh)
 * Khi zoom cận cảnh: Là mặt đất cung trăng dưới gốc cây đa
 * Khi zoom xa: Là cả quả cầu Mặt Trăng lơ lửng trong không gian
 */
export function createMoonSurface() {
  const moonGroup = new THREE.Group();
  moonGroup.name = "MoonSurface";

  const moonTex = createMoonTexture();

  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    color: 0xa8bbdc,
    roughness: 0.88,
    metalness: 0.12,
    flatShading: false
  });

  // Quả cầu Mặt Trăng hoàn chỉnh (Bán kính 18 đơn vị, tâm tại y = -17.5 để đỉnh mặt trăng tại y = 0.5)
  const moonGlobeGeo = new THREE.SphereGeometry(18.0, 64, 48);
  const moonGlobe = new THREE.Mesh(moonGlobeGeo, moonMat);
  moonGlobe.position.set(0, -17.5, 0);
  moonGlobe.receiveShadow = true;
  moonGroup.add(moonGlobe);
  moonGroup.globe = moonGlobe;

  // Lớp mặt đất đỉnh phẳng nhẹ dưới gốc cây đa để nhân vật ngồi vững vàng
  const localCapGeo = new THREE.CylinderGeometry(10, 14, 2.5, 32);
  const localCap = new THREE.Mesh(localCapGeo, moonMat);
  localCap.position.set(0, -1.0, 0);
  localCap.receiveShadow = true;
  moonGroup.add(localCap);

  // Tạo các miệng hố thiên thạch nổi (3D Craters)
  const craterPositions = [
    { x: -9, y: -0.2, z: 6, scale: 2.2 },
    { x: 10, y: -0.3, z: 5, scale: 2.8 },
    { x: -6, y: -0.4, z: -10, scale: 2.5 },
    { x: 8, y: -0.5, z: -9, scale: 2.0 },
    { x: 2, y: -0.2, z: 10, scale: 2.0 }
  ];

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x7c8cb8,
    roughness: 0.9,
    metalness: 0.1
  });

  craterPositions.forEach(cp => {
    const rimGeo = new THREE.TorusGeometry(cp.scale, cp.scale * 0.26, 12, 28);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(cp.x, cp.y, cp.z);
    rim.receiveShadow = true;
    moonGroup.add(rim);
  });

  // Tinh thể đá mặt trăng phát sáng mờ ảo rải rác
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xc8ddff,
    emissive: 0x4d6c9e,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.8
  });

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + (Math.random() * 0.3);
    const dist = 7 + Math.random() * 8;
    const crystalGeo = new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.3);
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(Math.cos(angle) * dist, 0.15, Math.sin(angle) * dist);
    crystal.rotation.set(Math.random(), Math.random(), Math.random());
    moonGroup.add(crystal);
  }

  // Vầng hào quang mỏng dịu mát bao quanh Mặt Trăng khi nhìn từ xa
  const moonAtmosphereGeo = new THREE.SphereGeometry(18.5, 32, 32);
  const moonAtmosphereMat = new THREE.MeshBasicMaterial({
    color: 0xc7d2fe,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const moonAtmo = new THREE.Mesh(moonAtmosphereGeo, moonAtmosphereMat);
  moonAtmo.position.set(0, -17.5, 0);
  moonGroup.add(moonAtmo);

  return moonGroup;
}

/**
 * 2. CÂY ĐA CỔ THỤ TRÊN CUNG TRĂNG (Grand Banyan Tree)
 */
export function createBanyanTree() {
  const treeGroup = new THREE.Group();
  treeGroup.name = "BanyanTree";

  // Chất liệu vỏ cây đa phong trần cổ kính
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x3d271d,
    roughness: 0.92,
    metalness: 0.05,
    flatShading: false
  });

  // Thân cây đa chính uốn lượn phong trần
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, 3.5, 0.2),
    new THREE.Vector3(-0.4, 7.0, -0.3),
    new THREE.Vector3(0.2, 10.5, 0.1)
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 24, 1.8, 16, false);
  const trunk = new THREE.Mesh(trunkGeo, barkMat);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Bộ rễ đa cổ thụ đồ sộ bám lấy đá mặt trăng
  const rootAngles = [0, 0.8, 1.6, 2.5, 3.4, 4.3, 5.2, 5.9];
  rootAngles.forEach((ang, idx) => {
    const rx = Math.cos(ang) * 4.2;
    const rz = Math.sin(ang) * 4.2;
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(ang) * 1.4, 2.8, Math.sin(ang) * 1.4),
      new THREE.Vector3(Math.cos(ang) * 2.6, 1.2, Math.sin(ang) * 2.6 + (idx % 2 ? 0.6 : -0.6)),
      new THREE.Vector3(rx, 0, rz)
    ]);
    const rootGeo = new THREE.TubeGeometry(rootCurve, 12, 0.55 - idx * 0.02, 10, false);
    const root = new THREE.Mesh(rootGeo, barkMat);
    root.castShadow = true;
    root.receiveShadow = true;
    treeGroup.add(root);
  });

  // Rễ phụ buông rủ từ cành đa (Đặc trưng cây đa làng quê Việt Nam)
  const aerialRootPositions = [
    { x: -2.8, y: 7.5, z: 2.2 },
    { x: 3.2, y: 7.2, z: 1.8 },
    { x: -1.8, y: 6.8, z: -3.0 },
    { x: 2.5, y: 6.5, z: -2.5 }
  ];

  aerialRootPositions.forEach(ap => {
    const aerialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ap.x, ap.y, ap.z),
      new THREE.Vector3(ap.x * 0.9, ap.y * 0.5, ap.z * 0.9),
      new THREE.Vector3(ap.x * 0.85, 0.1, ap.z * 0.85)
    ]);
    const aerialGeo = new THREE.TubeGeometry(aerialCurve, 16, 0.18, 8, false);
    const aerial = new THREE.Mesh(aerialGeo, barkMat);
    treeGroup.add(aerial);
  });

  // Các cành đa vươn rộng che chở
  const branches = [
    { start: [0, 8.5, 0], end: [-6.5, 11.0, 3.2], rad: 1.0 },
    { start: [0, 8.8, 0], end: [6.8, 10.8, 2.5], rad: 1.0 },
    { start: [0, 9.2, 0], end: [-4.5, 12.0, -5.2], rad: 0.9 },
    { start: [0, 9.5, 0], end: [5.2, 11.5, -4.8], rad: 0.9 },
    { start: [0, 10.5, 0], end: [0.0, 14.5, 0.0], rad: 0.8 }
  ];

  branches.forEach(b => {
    const bCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...b.start),
      new THREE.Vector3((b.start[0] + b.end[0]) * 0.5, (b.start[1] + b.end[1]) * 0.5 + 0.8, (b.start[2] + b.end[2]) * 0.5),
      new THREE.Vector3(...b.end)
    ]);
    const bGeo = new THREE.TubeGeometry(bCurve, 14, b.rad, 10, false);
    const bMesh = new THREE.Mesh(bGeo, barkMat);
    bMesh.castShadow = true;
    treeGroup.add(bMesh);
  });

  // Tán lá xanh ngọc mộng ảo (Lush stylized glowing jade canopy)
  const foliageGroup = new THREE.Group();
  foliageGroup.name = "FoliageGroup";

  // Chất liệu tán lá đa: màu ngọc lục bảo ánh trăng, phát sáng nhẹ
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x1e5a44,
    emissive: 0x09261a,
    emissiveIntensity: 0.35,
    roughness: 0.65,
    metalness: 0.1,
    flatShading: true
  });

  const leafClusterData = [
    { x: 0, y: 14.8, z: 0, scale: [7.5, 4.0, 7.5] },
    { x: -5.5, y: 12.2, z: 2.8, scale: [6.2, 3.5, 6.0] },
    { x: 6.0, y: 11.8, z: 2.2, scale: [6.5, 3.8, 6.2] },
    { x: -3.8, y: 12.8, z: -4.5, scale: [6.0, 3.6, 5.8] },
    { x: 4.8, y: 12.5, z: -4.2, scale: [6.2, 3.5, 5.5] },
    { x: -8.0, y: 10.5, z: 3.5, scale: [4.2, 2.6, 4.0] },
    { x: 8.5, y: 10.2, z: 2.0, scale: [4.5, 2.8, 4.2] }
  ];

  leafClusterData.forEach(cd => {
    // Tạo hình khối tán lá dạng quả cầu đa diện mềm mại
    const clusterGeo = new THREE.DodecahedronGeometry(1.0, 2);
    const cluster = new THREE.Mesh(clusterGeo, leafMat);
    cluster.position.set(cd.x, cd.y, cd.z);
    cluster.scale.set(...cd.scale);
    cluster.castShadow = true;
    foliageGroup.add(cluster);
  });

  treeGroup.add(foliageGroup);
  treeGroup.foliageGroup = foliageGroup;

  return treeGroup;
}

/**
 * 3. CHÚ CUỘI & CHỊ HẰNG & THỎ NGỌC (The Main Characters)
 */
export function createCharacters() {
  const charGroup = new THREE.Group();
  charGroup.name = "CharactersGroup";

  // Vị trí ngồi: dưới gốc cây đa, quay mặt về phía người xem một góc ấm cúng
  charGroup.position.set(0, 0, 3.2);

  // ----------------------------------------------------
  // A. CHÚ CUỘI (Chàng trai mộc mạc, áo nâu chàm, cầm sáo)
  // ----------------------------------------------------
  const cuoiGroup = new THREE.Group();
  cuoiGroup.name = "ChuCuoi";
  cuoiGroup.position.set(-1.4, 0, 0);
  cuoiGroup.rotation.y = 0.25;

  // Chất liệu trang phục Cuội
  const cuoiSkinMat = new THREE.MeshStandardMaterial({ color: 0xefc49e, roughness: 0.7 });
  const cuoiClothMat = new THREE.MeshStandardMaterial({ color: 0x4d382c, roughness: 0.85 }); // Áo chàm mộc
  const cuoiPantsMat = new THREE.MeshStandardMaterial({ color: 0x2b3345, roughness: 0.9 });
  const cuoiTurbanMat = new THREE.MeshStandardMaterial({ color: 0x3d2b22, roughness: 0.8 }); // Khăn vấn

  // Thân áo Cuội (ngồi xếp bằng tựa gốc đa)
  const cuoiTorsoGeo = new THREE.CylinderGeometry(0.45, 0.6, 1.2, 12);
  const cuoiTorso = new THREE.Mesh(cuoiTorsoGeo, cuoiClothMat);
  cuoiTorso.position.y = 0.85;
  cuoiTorso.rotation.x = -0.08;
  cuoiGroup.add(cuoiTorso);

  // Đầu & Mặt Cuội
  const cuoiHeadGeo = new THREE.SphereGeometry(0.38, 16, 16);
  const cuoiHead = new THREE.Mesh(cuoiHeadGeo, cuoiSkinMat);
  cuoiHead.position.y = 1.7;
  cuoiGroup.add(cuoiHead);

  // Khăn vấn tóc truyền thống
  const cuoiTurbanGeo = new THREE.TorusGeometry(0.36, 0.12, 8, 20);
  const cuoiTurban = new THREE.Mesh(cuoiTurbanGeo, cuoiTurbanMat);
  cuoiTurban.position.set(0, 1.85, 0);
  cuoiTurban.rotation.x = Math.PI / 2 + 0.15;
  cuoiGroup.add(cuoiTurban);

  // Chân ngồi xếp bằng thoải mái
  const cuoiLegGeo = new THREE.CapsuleGeometry(0.24, 0.8, 8, 12);
  const cuoiLeftLeg = new THREE.Mesh(cuoiLegGeo, cuoiPantsMat);
  cuoiLeftLeg.position.set(-0.4, 0.25, 0.2);
  cuoiLeftLeg.rotation.set(Math.PI / 2, 0.4, 0.6);
  cuoiGroup.add(cuoiLeftLeg);

  const cuoiRightLeg = new THREE.Mesh(cuoiLegGeo, cuoiPantsMat);
  cuoiRightLeg.position.set(0.4, 0.25, 0.2);
  cuoiRightLeg.rotation.set(Math.PI / 2, -0.4, -0.6);
  cuoiGroup.add(cuoiRightLeg);

  // Tay cầm cây sáo trúc
  const cuoiArmMat = cuoiSkinMat;
  const cuoiArmGeo = new THREE.CapsuleGeometry(0.14, 0.65, 8, 8);
  const cuoiLeftArm = new THREE.Mesh(cuoiArmGeo, cuoiClothMat);
  cuoiLeftArm.position.set(-0.55, 1.0, 0.25);
  cuoiLeftArm.rotation.set(0.8, 0.3, -0.5);
  cuoiGroup.add(cuoiLeftArm);

  const cuoiRightArm = new THREE.Mesh(cuoiArmGeo, cuoiClothMat);
  cuoiRightArm.position.set(0.55, 1.0, 0.25);
  cuoiRightArm.rotation.set(0.8, -0.3, 0.5);
  cuoiGroup.add(cuoiRightArm);

  // Cây Sáo Trúc (Bamboo Flute)
  const fluteGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.1, 10);
  const fluteMat = new THREE.MeshStandardMaterial({
    color: 0xcd853f,
    roughness: 0.4,
    metalness: 0.2
  });
  const flute = new THREE.Mesh(fluteGeo, fluteMat);
  flute.position.set(0, 1.05, 0.5);
  flute.rotation.set(0.2, 0, 0.9);
  cuoiGroup.add(flute);

  // Hit-box vô hình để dễ dàng click/chạm vào Chú Cuội (Mặc Thủ Nhân)
  const cuoiHitBoxGeo = new THREE.CapsuleGeometry(0.7, 1.8, 8, 8);
  const cuoiHitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
  const cuoiHitBox = new THREE.Mesh(cuoiHitBoxGeo, cuoiHitBoxMat);
  cuoiHitBox.position.set(0, 1.0, 0);
  cuoiHitBox.userData = {
    isCharacter: true,
    characterType: 'cuoi',
    name: 'Mặc Thủ Nhân',
    quote: 'Ngồi tựa gốc đa, thổi khúc sáo trúc an yên giữa đêm rằm.'
  };
  cuoiGroup.add(cuoiHitBox);
  cuoiGroup.hitBox = cuoiHitBox;

  charGroup.add(cuoiGroup);

  // ----------------------------------------------------
  // B. CHỊ HẰNG (Nàng tiên thanh thoát, dải lụa bay mộng ảo)
  // ----------------------------------------------------
  const hangGroup = new THREE.Group();
  hangGroup.name = "ChiHang";
  hangGroup.position.set(1.3, 0, 0);
  hangGroup.rotation.y = -0.25;

  // Chất liệu trang phục Chị Hằng (Áo lụa trắng tinh khôi)
  const hangSkinMat = new THREE.MeshStandardMaterial({ color: 0xfde3cf, roughness: 0.5 });
  const hangDressMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // Màu trắng ngọc trai thanh khiết
    emissive: 0x333344,
    emissiveIntensity: 0.16,
    roughness: 0.45
  });
  const hangSashMat = new THREE.MeshStandardMaterial({
    color: 0xfbcfe8,
    transparent: true,
    opacity: 0.88,
    roughness: 0.3,
    metalness: 0.1
  });
  const goldOrnamentMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x664400,
    emissiveIntensity: 0.5
  });

  // Váy dài thướt tha mềm mại
  const hangDressGeo = new THREE.ConeGeometry(0.75, 1.45, 20);
  const hangDress = new THREE.Mesh(hangDressGeo, hangDressMat);
  hangDress.position.y = 0.72;
  hangGroup.add(hangDress);

  // Thân áo trên
  const hangTorsoGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.85, 16);
  const hangTorso = new THREE.Mesh(hangTorsoGeo, hangDressMat);
  hangTorso.position.y = 1.35;
  hangGroup.add(hangTorso);

  // Đầu & Mái tóc tiên nữ
  const hangHeadGeo = new THREE.SphereGeometry(0.34, 16, 16);
  const hangHead = new THREE.Mesh(hangHeadGeo, hangSkinMat);
  hangHead.position.y = 1.95;
  hangGroup.add(hangHead);

  // Búi tóc tiên nữ thanh nhã
  const hangHairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
  const hairBunGeo = new THREE.SphereGeometry(0.24, 12, 12);
  const hairBun = new THREE.Mesh(hairBunGeo, hangHairMat);
  hairBun.position.set(0, 2.25, -0.15);
  hangGroup.add(hairBun);

  // Trâm cài tóc vầng trăng khuyết vàng óng
  const moonPinGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 16, Math.PI * 1.4);
  const moonPin = new THREE.Mesh(moonPinGeo, goldOrnamentMat);
  moonPin.position.set(0.18, 2.3, 0.05);
  moonPin.rotation.z = -0.5;
  hangGroup.add(moonPin);

  // Dải lụa tiên uốn lượn bay bổng (Celestial Floating Ribbon)
  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.9, 1.4, -0.3),
    new THREE.Vector3(-1.1, 2.1, 0.2),
    new THREE.Vector3(0.0, 2.5, 0.4),
    new THREE.Vector3(1.1, 2.2, 0.2),
    new THREE.Vector3(1.3, 1.3, -0.3),
    new THREE.Vector3(1.5, 0.6, -0.8)
  ]);
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 32, 0.08, 8, false);
  const ribbon = new THREE.Mesh(ribbonGeo, hangSashMat);
  hangGroup.add(ribbon);
  hangGroup.ribbon = ribbon;

  // Hit-box vô hình để dễ dàng click/chạm vào Chị Hằng (Quỳnh Dương)
  const hangHitBoxGeo = new THREE.CapsuleGeometry(0.8, 2.2, 8, 8);
  const hangHitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
  const hangHitBox = new THREE.Mesh(hangHitBoxGeo, hangHitBoxMat);
  hangHitBox.position.set(0, 1.2, 0);
  hangHitBox.userData = {
    isCharacter: true,
    characterType: 'hang',
    name: 'Quỳnh Dương',
    quote: 'Thanh nhã dịu dàng, gửi ánh trăng vẹn tròn dịu ngọt đến muôn nơi.'
  };
  hangGroup.add(hangHitBox);
  hangGroup.hitBox = hangHitBox;

  charGroup.add(hangGroup);

  // ----------------------------------------------------
  // C. THỎ NGỌC (White Jade Rabbit - Dễ thương, tinh nghịch)
  // ----------------------------------------------------
  const rabbitGroup = new THREE.Group();
  rabbitGroup.name = "ThoNgoc";
  rabbitGroup.position.set(0, 0, 1.4);

  const rabbitFurMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.9,
    emissive: 0x1e293b,
    emissiveIntensity: 0.15
  });
  const rabbitPinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 });

  // Thân thỏ
  const rabbitBodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
  rabbitBodyGeo.scale(0.85, 1.0, 1.15);
  const rabbitBody = new THREE.Mesh(rabbitBodyGeo, rabbitFurMat);
  rabbitBody.position.y = 0.35;
  rabbitGroup.add(rabbitBody);

  // Đầu thỏ
  const rabbitHeadGeo = new THREE.SphereGeometry(0.26, 16, 16);
  const rabbitHead = new THREE.Mesh(rabbitHeadGeo, rabbitFurMat);
  rabbitHead.position.set(0, 0.65, 0.3);
  rabbitGroup.add(rabbitHead);

  // Đôi tai dài vểnh ngộ nghĩnh
  const earGeo = new THREE.CapsuleGeometry(0.07, 0.45, 6, 8);
  const earInnerGeo = new THREE.CapsuleGeometry(0.04, 0.35, 6, 8);

  const leftEar = new THREE.Group();
  const leftEarMesh = new THREE.Mesh(earGeo, rabbitFurMat);
  const leftEarInner = new THREE.Mesh(earInnerGeo, rabbitPinkMat);
  leftEarInner.position.z = 0.02;
  leftEar.add(leftEarMesh, leftEarInner);
  leftEar.position.set(-0.14, 0.95, 0.22);
  leftEar.rotation.set(-0.2, 0, -0.2);
  rabbitGroup.add(leftEar);
  rabbitGroup.leftEar = leftEar;

  const rightEar = new THREE.Group();
  const rightEarMesh = new THREE.Mesh(earGeo, rabbitFurMat);
  const rightEarInner = new THREE.Mesh(earInnerGeo, rabbitPinkMat);
  rightEarInner.position.z = 0.02;
  rightEar.add(rightEarMesh, rightEarInner);
  rightEar.position.set(0.14, 0.95, 0.22);
  rightEar.rotation.set(-0.2, 0, 0.2);
  rabbitGroup.add(rightEar);
  rabbitGroup.rightEar = rightEar;

  // Đuôi thỏ bông xù
  const tailGeo = new THREE.SphereGeometry(0.12, 10, 10);
  const tail = new THREE.Mesh(tailGeo, rabbitFurMat);
  tail.position.set(0, 0.35, -0.45);
  rabbitGroup.add(tail);

  charGroup.add(rabbitGroup);

  // Hit-box vô hình cho Thỏ Ngọc
  const rabbitHitBoxGeo = new THREE.SphereGeometry(0.7, 8, 8);
  const rabbitHitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
  const rabbitHitBox = new THREE.Mesh(rabbitHitBoxGeo, rabbitHitBoxMat);
  rabbitHitBox.position.set(0, 0.5, 0);
  rabbitHitBox.userData = {
    isCharacter: true,
    characterType: 'rabbit',
    name: 'Thỏ Ngọc',
    role: '🐇 Thỏ Ngọc',
    quote: 'Thỏ ngọc nhỏ bên gốc cây đa, chúc bạn một mùa trăng đong đầy niềm vui!'
  };
  rabbitGroup.add(rabbitHitBox);
  rabbitGroup.hitBox = rabbitHitBox;

  charGroup.cuoiGroup = cuoiGroup;
  charGroup.hangGroup = hangGroup;
  charGroup.rabbitGroup = rabbitGroup;

  // Danh sách các hit-box nhân vật để raycasting
  charGroup.clickableCharacters = [cuoiHitBox, hangHitBox, rabbitHitBox];

  return charGroup;
}

/**
 * 4. TẠO CÁC KIỂU DÁNG ĐÈN LỒNG TRUYỀN THỐNG VIỆT NAM (Star, Round, Lotus)
 */

/**
 * A. ĐÈN ÔNG SAO (Traditional 5-point Star Lantern with outer ring & translucent faces)
 */
export function createStarLantern(themeColor = 0xef4444) {
  const group = new THREE.Group();
  group.name = "StarLantern";

  // Tạo ngôi sao 5 cánh 3D
  const starShape = new THREE.Shape();
  const outerR = 0.85;
  const innerR = 0.36;
  for (let i = 0; i < 10; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();

  const extrudeSettings = {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04
  };

  const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  starGeo.center();

  // Giấy bóng kính trong suốt phát sáng màu đỏ/vàng
  const starMat = new THREE.MeshStandardMaterial({
    color: themeColor,
    emissive: themeColor,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.88,
    roughness: 0.2,
    metalness: 0.1
  });
  const starMesh = new THREE.Mesh(starGeo, starMat);
  group.add(starMesh);

  // Vòng tre bao tròn bên ngoài (Nét đặc trưng nhất của Đèn Ông Sao Việt Nam)
  const ringGeo = new THREE.TorusGeometry(0.88, 0.035, 8, 36);
  const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
  const ring = new THREE.Mesh(ringGeo, bambooMat);
  group.add(ring);

  // Que nan tre chống giữa các cánh
  const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.7, 8);
  for (let i = 0; i < 3; i++) {
    const strut = new THREE.Mesh(strutGeo, bambooMat);
    strut.rotation.z = (i * Math.PI) / 3;
    group.add(strut);
  }

  // Dây treo đèn & cán cầm
  const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.2, 6);
  const stringMesh = new THREE.Mesh(stringGeo, bambooMat);
  stringMesh.position.y = 1.35;
  group.add(stringMesh);

  // Đốm sáng ấm bên trong tim đèn
  const light = new THREE.PointLight(0xffb703, 1.8, 8.0, 1.6);
  light.position.set(0, 0, 0);
  group.add(light);
  group.lanternLight = light;

  // Hào quang mềm mại
  const haloGeo = new THREE.SphereGeometry(0.95, 12, 12);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  group.add(halo);
  group.halo = halo;

  return group;
}

/**
 * B. ĐÈN LỒNG TRÒN GẤP XẾP (Traditional Pleated Silk Sphere Lantern with tassels)
 */
export function createRoundSilkLantern(themeColor = 0xd97706) {
  const group = new THREE.Group();
  group.name = "RoundSilkLantern";

  // Thân đèn lồng hình cầu dẹt có gân nếp gấp
  const bodyGeo = new THREE.SphereGeometry(0.75, 24, 20);
  bodyGeo.scale(1.0, 1.25, 1.0);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: themeColor,
    emissive: themeColor,
    emissiveIntensity: 0.75,
    roughness: 0.5,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Nắp gỗ vàng trên và dưới
  const capMat = new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.6, roughness: 0.4 });
  const topCapGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.15, 16);
  const topCap = new THREE.Mesh(topCapGeo, capMat);
  topCap.position.y = 0.95;
  group.add(topCap);

  const btmCapGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.15, 16);
  const btmCap = new THREE.Mesh(btmCapGeo, capMat);
  btmCap.position.y = -0.95;
  group.add(btmCap);

  // Dây tua rua đỏ vàng đuôi đèn (Tassels)
  const tasselCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.0, 0),
    new THREE.Vector3(0.04, -1.4, 0.03),
    new THREE.Vector3(-0.02, -1.9, -0.02)
  ]);
  const tasselGeo = new THREE.TubeGeometry(tasselCurve, 12, 0.06, 8, false);
  const tasselMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.8 });
  const tassel = new THREE.Mesh(tasselGeo, tasselMat);
  group.add(tassel);
  group.tassel = tassel;

  // Dây treo trên
  const cordGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.0, 6);
  const cord = new THREE.Mesh(cordGeo, capMat);
  cord.position.y = 1.45;
  group.add(cord);

  // Ánh sáng tỏa ra
  const light = new THREE.PointLight(0xffedd5, 1.6, 7.5, 1.5);
  group.add(light);
  group.lanternLight = light;

  // Hào quang
  const haloGeo = new THREE.SphereGeometry(1.0, 12, 12);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfed7aa,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  group.add(halo);
  group.halo = halo;

  return group;
}

/**
 * C. ĐÈN HOA SEN (Lotus Lantern)
 */
export function createLotusLantern(themeColor = 0xf472b6) {
  const group = new THREE.Group();
  group.name = "LotusLantern";

  const petalMat = new THREE.MeshStandardMaterial({
    color: themeColor,
    emissive: themeColor,
    emissiveIntensity: 0.8,
    roughness: 0.35,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  // Cánh sen đa tầng
  const petalCount = 8;
  for (let layer = 0; layer < 2; layer++) {
    const count = petalCount + layer * 2;
    const r = 0.45 + layer * 0.22;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (layer * 0.3);
      const petalGeo = new THREE.ConeGeometry(0.24, 0.65, 8);
      petalGeo.scale(1.2, 1.0, 0.3);
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * r, layer * 0.12, Math.sin(angle) * r);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = layer === 0 ? 0.45 : 0.75;
      group.add(petal);
    }
  }

  // Nhụy sen vàng sáng rực
  const pistilGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const pistilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.0,
    roughness: 0.2
  });
  const pistil = new THREE.Mesh(pistilGeo, pistilMat);
  group.add(pistil);

  // Đèn ánh sáng ấm
  const light = new THREE.PointLight(0xfef08a, 1.7, 7.0, 1.5);
  group.add(light);
  group.lanternLight = light;

  // Hào quang
  const haloGeo = new THREE.SphereGeometry(0.85, 12, 12);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfbcfe8,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  group.add(halo);
  group.halo = halo;

  return group;
}

/**
 * ==========================================================================
 * 5. TRÁI ĐẤT XANH BIẾC (The Blue Marble Earth)
 * Nhìn từ Cung Trăng: Viên ngọc xanh lấp lánh giữa màn đêm vũ trụ
 * ==========================================================================
 */
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Đại dương xanh biếc sâu thẳm
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0a2352');
  oceanGrad.addColorStop(0.5, '#0e428c');
  oceanGrad.addColorStop(1, '#0a2352');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Lục địa xanh & nâu đất (Châu Á, Âu, Phi, Mỹ, Úc)
  ctx.fillStyle = '#1e7b34'; // Xanh rừng rậm
  // Châu Mỹ
  ctx.beginPath();
  ctx.ellipse(270, 180, 85, 110, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(320, 330, 65, 100, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Châu Á & Châu Âu
  ctx.fillStyle = '#28873d';
  ctx.beginPath();
  ctx.ellipse(640, 160, 140, 85, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Châu Phi & Hoang mạc
  ctx.fillStyle = '#856427';
  ctx.beginPath();
  ctx.ellipse(590, 260, 80, 95, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Châu Úc
  ctx.fillStyle = '#926a2e';
  ctx.beginPath();
  ctx.ellipse(820, 350, 55, 40, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Băng cực Bắc & Nam
  ctx.fillStyle = '#f0f9ff';
  ctx.fillRect(0, 0, 1024, 38);
  ctx.fillRect(0, 478, 1024, 34);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createCloudsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 512);

  // Mây trắng cuộn xoáy trên bầu khí quyển
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 1024;
    const y = 50 + Math.random() * 410;
    const rx = 35 + Math.random() * 85;
    const ry = 8 + Math.random() * 22;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (Math.random() - 0.5) * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

export function createEarth(radius = 8.5) {
  const earthGroup = new THREE.Group();
  earthGroup.name = "EarthGlobe";

  // 1. Quả cầu Trái Đất chính
  const earthGeo = new THREE.SphereGeometry(radius, 48, 48);
  const earthMat = new THREE.MeshStandardMaterial({
    map: createEarthTexture(),
    roughness: 0.6,
    metalness: 0.1,
    emissive: 0x051329,
    emissiveIntensity: 0.2
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthGroup.add(earthMesh);
  earthGroup.earthMesh = earthMesh;

  // 2. Tầng mây bồng bềnh chuyển động độc lập
  const cloudGeo = new THREE.SphereGeometry(radius * 1.025, 40, 40);
  const cloudMat = new THREE.MeshStandardMaterial({
    map: createCloudsTexture(),
    transparent: true,
    opacity: 0.68,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
  const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
  earthGroup.add(cloudMesh);
  earthGroup.cloudMesh = cloudMesh;

  // 3. Vành hào quang khí quyển màu xanh ngọc biển (Atmospheric Glow)
  const atmoGeo = new THREE.SphereGeometry(radius * 1.15, 32, 32);
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
  earthGroup.add(atmoMesh);

  // Trục nghiêng tự nhiên của Trái Đất 23.4 độ
  earthGroup.rotation.z = THREE.MathUtils.degToRad(23.4);

  return earthGroup;
}

/**
 * ==========================================================================
 * 6. HỆ MẶT TRỜI KỲ VĨ (The Grand Solar System)
 * Khi zoom out ra xa: Thấy toàn bộ Hệ Mặt Trời, Mặt Trời rực rỡ và các hành tinh
 * ==========================================================================
 */

function createJupiterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const colors = ['#a07850', '#8b5a32', '#cbb38d', '#b0845a', '#744520', '#d8c4a6', '#9c683b'];
  for (let y = 0; y < 256; y++) {
    const cIdx = Math.floor((y / 256) * colors.length);
    ctx.fillStyle = colors[cIdx];
    ctx.fillRect(0, y, 512, 1);
  }
  // Vết Đỏ Lớn (Great Red Spot)
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.ellipse(320, 160, 36, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function createSaturnRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  for (let x = 0; x < 512; x++) {
    const norm = x / 512;
    const alpha = (Math.sin(norm * Math.PI * 16) * 0.3 + 0.6) * Math.sin(norm * Math.PI);
    ctx.fillStyle = `rgba(225, 190, 130, ${Math.max(0, alpha)})`;
    ctx.fillRect(x, 0, 1, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createSolarSystem() {
  const solarGroup = new THREE.Group();
  solarGroup.name = "SolarSystemGroup";

  // Tâm của hệ mặt trời (Vị trí đặt Mặt Trời trong không gian sâu)
  const sunCenter = new THREE.Vector3(-110, 36, -95);
  solarGroup.sunCenter = sunCenter;

  // 1. MẶT TRỜI RỰC RỠ (The Sun)
  const sunGroup = new THREE.Group();
  sunGroup.position.copy(sunCenter);

  const sunGeo = new THREE.SphereGeometry(22, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xfffbeb
  });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunGroup.add(sunMesh);

  // Vầng hào quang lửa Mặt Trời (Solar Corona)
  const sunCoronaGeo1 = new THREE.SphereGeometry(25.5, 24, 24);
  const sunCoronaMat1 = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  sunGroup.add(new THREE.Mesh(sunCoronaGeo1, sunCoronaMat1));

  const sunCoronaGeo2 = new THREE.SphereGeometry(32.0, 24, 24);
  const sunCoronaMat2 = new THREE.MeshBasicMaterial({
    color: 0xea580c,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  sunGroup.add(new THREE.Mesh(sunCoronaGeo2, sunCoronaMat2));

  // Nguồn sáng từ Mặt Trời tỏa ra toàn hệ
  const sunLight = new THREE.PointLight(0xfffaed, 3.2, 500, 1.2);
  sunGroup.add(sunLight);

  solarGroup.add(sunGroup);
  solarGroup.sunGroup = sunGroup;

  // 2. CÁC HÀNH TINH & ĐƯỜNG QUỸ ĐẠO
  const planetList = [
    {
      name: "Mercury", // Sao Thủy
      radius: 1.8,
      orbitDist: 40,
      color: 0x94a3b8,
      speed: 1.6,
      angle: 0.8
    },
    {
      name: "Venus", // Sao Kim
      radius: 3.2,
      orbitDist: 62,
      color: 0xfef08a,
      speed: 1.2,
      angle: 2.1
    },
    {
      name: "Earth", // Trái Đất (Cùng Mặt Trăng quay quanh)
      radius: 6.2,
      orbitDist: 90,
      isEarth: true,
      speed: 1.0,
      angle: 0.65
    },
    {
      name: "Mars", // Sao Hỏa (Hành tinh Đỏ)
      radius: 2.6,
      orbitDist: 125,
      color: 0xef4444,
      speed: 0.85,
      angle: 4.2
    },
    {
      name: "Jupiter", // Sao Mộc (Khổng lồ)
      radius: 10.5,
      orbitDist: 175,
      texture: createJupiterTexture(),
      speed: 0.45,
      angle: 1.2
    },
    {
      name: "Saturn", // Sao Thổ (Có vành đai)
      radius: 8.5,
      orbitDist: 230,
      color: 0xfde047,
      hasRings: true,
      speed: 0.32,
      angle: 3.5
    },
    {
      name: "Uranus", // Sao Thiên Vương
      radius: 5.2,
      orbitDist: 280,
      color: 0x38bdf8,
      speed: 0.22,
      angle: 5.1
    },
    {
      name: "Neptune", // Sao Hải Vương
      radius: 5.0,
      orbitDist: 330,
      color: 0x3b82f6,
      speed: 0.16,
      angle: 0.4
    }
  ];

  solarGroup.planets = [];

  planetList.forEach(p => {
    // A. Vẽ vòng quỹ đạo phát sáng tinh tế
    const orbitGeo = new THREE.BufferGeometry();
    const segs = 64;
    const orbitPts = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      orbitPts.push(
        sunCenter.x + Math.cos(a) * p.orbitDist,
        sunCenter.y + Math.sin(a * 2) * (p.orbitDist * 0.05), // Nghiêng nhẹ
        sunCenter.z + Math.sin(a) * p.orbitDist
      );
    }
    orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(orbitPts, 3));
    const orbitMat = new THREE.LineBasicMaterial({
      color: p.isEarth ? 0x38bdf8 : 0x60a5fa,
      transparent: true,
      opacity: p.isEarth ? 0.42 : 0.14
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    solarGroup.add(orbitLine);

    // B. Quả cầu hành tinh
    let pMesh;
    if (p.isEarth) {
      // 1. Khởi tạo Trái Đất đầy đủ lục địa, đại dương, mây và tầng khí quyển
      pMesh = createEarth(p.radius);
      pMesh.name = p.name;
      pMesh.orbitDist = p.orbitDist;
      pMesh.speed = p.speed;
      pMesh.angle = p.angle;
      pMesh.isEarth = true;

      // 2. HỆ THỐNG MẶT TRĂNG QUAY QUANH TRÁI ĐẤT (The Moon Orbiting Earth)
      const moonOrbitGroup = new THREE.Group();
      moonOrbitGroup.name = "MoonOrbitGroup";

      const moonOrbitDist = 15.5;
      const moonRadius = 1.8;
      const moonInclination = THREE.MathUtils.degToRad(5.15); // Độ nghiêng quỹ đạo 5.15°

      // Vòng quỹ đạo ánh bạc của Mặt Trăng quanh Trái Đất
      const moonOrbitGeo = new THREE.BufferGeometry();
      const mSegs = 64;
      const mPts = [];
      for (let j = 0; j <= mSegs; j++) {
        const ma = (j / mSegs) * Math.PI * 2;
        mPts.push(
          Math.cos(ma) * moonOrbitDist,
          Math.sin(ma) * (moonOrbitDist * Math.tan(moonInclination)),
          Math.sin(ma) * moonOrbitDist
        );
      }
      moonOrbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(mPts, 3));
      const moonOrbitMat = new THREE.LineBasicMaterial({
        color: 0xf1f5f9,
        transparent: true,
        opacity: 0.5
      });
      const moonOrbitLine = new THREE.Line(moonOrbitGeo, moonOrbitMat);
      moonOrbitGroup.add(moonOrbitLine);

      // Quả cầu Mặt Trăng
      const moonGeo = new THREE.SphereGeometry(moonRadius, 28, 28);
      const moonMat = new THREE.MeshStandardMaterial({
        map: createMoonTexture(),
        roughness: 0.85,
        metalness: 0.1,
        color: 0xdbeafe
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.name = "Moon";
      moonMesh.orbitDist = moonOrbitDist;
      moonMesh.inclination = moonInclination;
      moonMesh.angle = 0.8;
      moonMesh.speed = 3.6;

      // Hào quang bạc dịu mát quanh Mặt Trăng
      const moonHaloGeo = new THREE.SphereGeometry(moonRadius * 1.3, 20, 20);
      const moonHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      moonMesh.add(new THREE.Mesh(moonHaloGeo, moonHaloMat));

      moonMesh.position.set(
        Math.cos(moonMesh.angle) * moonOrbitDist,
        Math.sin(moonMesh.angle) * (moonOrbitDist * Math.tan(moonInclination)),
        Math.sin(moonMesh.angle) * moonOrbitDist
      );

      moonOrbitGroup.add(moonMesh);
      pMesh.add(moonOrbitGroup);

      pMesh.moonMesh = moonMesh;
      pMesh.moonOrbitGroup = moonOrbitGroup;
      solarGroup.earth = pMesh;
      solarGroup.moon = moonMesh;
    } else {
      const pGeo = new THREE.SphereGeometry(p.radius, 24, 24);
      let pMat;
      if (p.texture) {
        pMat = new THREE.MeshStandardMaterial({
          map: p.texture,
          roughness: 0.6
        });
      } else {
        pMat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.7
        });
      }

      pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.name = p.name;
      pMesh.orbitDist = p.orbitDist;
      pMesh.speed = p.speed;
      pMesh.angle = p.angle;

      // Vành đai Sao Thổ nếu có
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.35, p.radius * 2.4, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          map: createSaturnRingTexture(),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + 0.45;
        ringMesh.rotation.y = 0.2;
        pMesh.add(ringMesh);
      }
    }

    // Đặt vị trí ban đầu
    pMesh.position.set(
      sunCenter.x + Math.cos(p.angle) * p.orbitDist,
      sunCenter.y + Math.sin(p.angle * 2) * (p.orbitDist * 0.05),
      sunCenter.z + Math.sin(p.angle) * p.orbitDist
    );

    solarGroup.add(pMesh);
    solarGroup.planets.push(pMesh);
  });

  return solarGroup;
}

