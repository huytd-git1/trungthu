/**
 * Quản lý hệ thống Đèn Lồng tương tác (Interactive Lanterns Manager)
 * Bố trí các đèn lồng quanh cây đa và trôi nổi trên bầu trời trăng
 * Xử lý raycasting, hoạt ảnh đung đưa, chuyển động camera và mở thiệp chúc
 */

import * as THREE from 'three';
import { createStarLantern, createRoundSilkLantern, createLotusLantern } from './models.js';
import { WISHES, getWishById } from './wishes.js';
import { audioSystem } from './audio.js';

export class LanternManager {
  constructor(scene, camera, controls, onSelectWish) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.onSelectWish = onSelectWish;

    this.lanterns = [];
    this.clickableMeshes = [];
    this.hoveredLantern = null;
    this.selectedLantern = null;

    // Camera animation state
    this.isCameraAnimating = false;
    this.cameraStartPos = new THREE.Vector3();
    this.cameraStartTarget = new THREE.Vector3();
    this.cameraEndPos = new THREE.Vector3();
    this.cameraEndTarget = new THREE.Vector3();
    this.cameraAnimProgress = 1.0;
    this.cameraAnimDuration = 1.6; // giây

    // Vị trí camera mặc định góc nhìn bao quát, rộng rãi và thoáng đãng
    this.defaultCameraPos = new THREE.Vector3(0, 5.6, 20.5);
    this.defaultCameraTarget = new THREE.Vector3(0, 4.0, 0);

    // Particle burst khi mở đèn
    this.particleBursts = [];

    this.initLanterns();
  }

  initLanterns() {
    // 12 Vị trí nghệ thuật tương ứng chính xác với 12 lời chúc (Wishes 1-12)
    const lanternConfigs = [
      {
        type: 'star',
        color: 0xf59e0b, // Vàng ấm hoàng yến
        pos: [-3.6, 6.8, 2.2],
        wishId: 1,
        title: "Lồng Đèn 1: Một Mùa Trăng An Yên",
        swaySpeed: 1.2,
        swayAmp: 0.15,
        floatAmp: 0.25,
        phase: 0.2
      },
      {
        type: 'lotus',
        color: 0xe0e7ff, // Bạch ngọc ánh bạc
        pos: [-1.8, 3.6, 4.8],
        wishId: 2,
        title: "Lồng Đèn 2: Tâm Hồn An Lạc",
        swaySpeed: 0.9,
        swayAmp: 0.1,
        floatAmp: 0.3,
        phase: 1.5
      },
      {
        type: 'round',
        color: 0x14b8a6, // Xanh ngọc bích
        pos: [3.8, 6.2, 2.0],
        wishId: 3,
        title: "Lồng Đèn 3: Thân Tâm An Lạc",
        swaySpeed: 1.0,
        swayAmp: 0.12,
        floatAmp: 0.22,
        phase: 2.8
      },
      {
        type: 'star',
        color: 0xfbbf24, // Vàng hổ phách
        pos: [2.4, 4.2, 4.5],
        wishId: 4,
        title: "Lồng Đèn 4: Hoa Nở Sau Những Ngày Dài",
        swaySpeed: 1.3,
        swayAmp: 0.14,
        floatAmp: 0.24,
        phase: 0.8
      },
      {
        type: 'star',
        color: 0xf97316, // Cam ánh sao
        pos: [-6.0, 7.5, 0.5],
        wishId: 5,
        title: "Lồng Đèn 5: Đi Đến Nơi Mình Muốn",
        swaySpeed: 0.85,
        swayAmp: 0.16,
        floatAmp: 0.3,
        phase: 3.2
      },
      {
        type: 'round',
        color: 0xf59e0b, // Vàng mật ong ấm
        pos: [0.0, 3.2, 5.5],
        wishId: 6,
        title: "Lồng Đèn 6: Cứ Vui Như Thế",
        swaySpeed: 1.1,
        swayAmp: 0.11,
        floatAmp: 0.26,
        phase: 4.1
      },
      {
        type: 'round',
        color: 0xef4444, // Đỏ thắm ấm cúng
        pos: [-4.5, 5.2, -2.8],
        wishId: 7,
        title: "Lồng Đèn 7: Một Nơi Để Trở Về",
        swaySpeed: 0.8,
        swayAmp: 0.17,
        floatAmp: 0.28,
        phase: 1.9
      },
      {
        type: 'lotus',
        color: 0x38bdf8, // Xanh lam ngọc biển
        pos: [5.8, 7.8, -0.5],
        wishId: 8,
        title: "Lồng Đèn 8: Thế Giới Ngoài Kia",
        swaySpeed: 1.05,
        swayAmp: 0.13,
        floatAmp: 0.32,
        phase: 5.0
      },
      {
        type: 'lotus',
        color: 0xf472b6, // Hồng sen ngát hương
        pos: [0.0, 8.2, 3.2],
        wishId: 9,
        title: "Lồng Đèn 9: Quẻ Thượng Thượng",
        swaySpeed: 0.75,
        swayAmp: 0.1,
        floatAmp: 0.2,
        phase: 2.2
      },
      {
        type: 'round',
        color: 0xd97706, // Hổ phách cổ điển
        pos: [4.2, 5.0, -3.0],
        wishId: 10,
        title: "Lồng Đèn 10: Một Đoạn Đường",
        swaySpeed: 0.95,
        swayAmp: 0.18,
        floatAmp: 0.25,
        phase: 3.7
      },
      {
        type: 'star',
        color: 0x06b6d4, // Lam ngọc tỏa sáng
        pos: [-2.2, 9.2, -1.5],
        wishId: 11,
        title: "Lồng Đèn 11: Dưới Ánh Trăng Này",
        swaySpeed: 1.15,
        swayAmp: 0.15,
        floatAmp: 0.27,
        phase: 1.1
      },
      {
        type: 'round',
        color: 0xffd700, // Vàng kim rực rỡ nhất đỉnh cây đa
        pos: [0.0, 10.6, 0.8],
        wishId: 12,
        title: "Lồng Đèn 12: Gửi Em Dưới Ánh Trăng",
        swaySpeed: 0.7,
        swayAmp: 0.12,
        floatAmp: 0.2,
        phase: 4.7
      }
    ];

    lanternConfigs.forEach((cfg, idx) => {
      let lanternObj;
      if (cfg.type === 'star') {
        lanternObj = createStarLantern(cfg.color);
      } else if (cfg.type === 'round') {
        lanternObj = createRoundSilkLantern(cfg.color);
      } else {
        lanternObj = createLotusLantern(cfg.color);
      }

      lanternObj.position.set(...cfg.pos);
      lanternObj.basePos = new THREE.Vector3(...cfg.pos);
      lanternObj.cfg = cfg;
      lanternObj.index = idx;
      lanternObj.wishData = getWishById(cfg.wishId);

      // Thêm hình khối hit-box vô hình để dễ dàng click/chạm trên điện thoại
      const hitBoxGeo = new THREE.SphereGeometry(1.4, 8, 8);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.userData = { lanternRef: lanternObj };
      lanternObj.add(hitBox);
      this.clickableMeshes.push(hitBox);

      this.scene.add(lanternObj);
      this.lanterns.push(lanternObj);
    });
  }

  /**
   * Cập nhật đung đưa, trôi nổi và hạt bụi trăng
   */
  update(delta, elapsed) {
    // 1. Hoạt ảnh đung đưa tự nhiên của đèn lồng
    this.lanterns.forEach(lantern => {
      const cfg = lantern.cfg;
      const t = elapsed * cfg.swaySpeed + cfg.phase;

      // Trôi nổi theo phương Y
      lantern.position.y = lantern.basePos.y + Math.sin(t) * cfg.floatAmp;
      lantern.position.x = lantern.basePos.x + Math.sin(t * 0.7) * 0.08;
      lantern.position.z = lantern.basePos.z + Math.cos(t * 0.5) * 0.08;

      // Đung đưa con lắc (Pendulum sway)
      lantern.rotation.z = Math.sin(t) * cfg.swayAmp;
      lantern.rotation.x = Math.cos(t * 0.8) * (cfg.swayAmp * 0.6);

      // Hơi thở ánh sáng (Breathing light intensity)
      if (lantern.lanternLight) {
        const pulse = 1.0 + Math.sin(elapsed * 2.5 + cfg.phase) * 0.2;
        const isHovered = (lantern === this.hoveredLantern);
        const isSelected = (lantern === this.selectedLantern);

        let targetIntensity = 1.6 * pulse;
        if (isSelected) targetIntensity = 3.2;
        else if (isHovered) targetIntensity = 2.4;

        lantern.lanternLight.intensity = THREE.MathUtils.lerp(
          lantern.lanternLight.intensity,
          targetIntensity,
          delta * 4
        );
      }

      // Hào quang phóng to nhẹ khi hover
      if (lantern.halo) {
        const targetScale = (lantern === this.hoveredLantern || lantern === this.selectedLantern) ? 1.4 : 1.0;
        lantern.halo.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
      }
    });

    // 2. Chuyển động mượt của Camera (Camera Lerp)
    if (this.isCameraAnimating) {
      this.cameraAnimProgress += delta / this.cameraAnimDuration;
      const t = Math.min(this.cameraAnimProgress, 1.0);
      // Easing cubic mượt mà
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, easeT);
      if (this.controls) {
        this.controls.target.lerpVectors(this.cameraStartTarget, this.cameraEndTarget, easeT);
        this.controls.update();
      }

      if (t >= 1.0) {
        this.isCameraAnimating = false;
      }
    }

    // 3. Cập nhật các hạt pháo hoa bụi sao (Particle Bursts)
    for (let i = this.particleBursts.length - 1; i >= 0; i--) {
      const burst = this.particleBursts[i];
      burst.age += delta;
      const positions = burst.geo.attributes.position.array;
      for (let p = 0; p < burst.count; p++) {
        const idx = p * 3;
        positions[idx] += burst.vels[p].x * delta;
        positions[idx + 1] += burst.vels[p].y * delta;
        positions[idx + 2] += burst.vels[p].z * delta;
        // Lực cản nhẹ
        burst.vels[p].multiplyScalar(0.96);
      }
      burst.geo.attributes.position.needsUpdate = true;
      burst.mat.opacity = Math.max(0, 1.0 - burst.age / burst.maxAge);

      if (burst.age >= burst.maxAge) {
        this.scene.remove(burst.mesh);
        burst.geo.dispose();
        burst.mat.dispose();
        this.particleBursts.splice(i, 1);
      }
    }
  }

  /**
   * Tạo hiệu ứng vỡ òa bụi sao vàng quanh đèn lồng khi chọn
   */
  spawnParticleBurst(origin) {
    const count = 50;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const vels = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;

      // Vận tốc bung tròn theo hình cầu
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 1.2 + Math.random() * 2.2;
      vels.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.18,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);

    this.particleBursts.push({
      mesh,
      geo,
      mat,
      vels,
      count,
      age: 0,
      maxAge: 1.4
    });
  }

  /**
   * Chọn đèn lồng và zoom camera tới
   */
  selectLantern(lantern) {
    if (!lantern) return;

    this.selectedLantern = lantern;
    audioSystem.playLanternChime();
    this.spawnParticleBurst(lantern.position);

    // Tính toán góc camera đẹp: hướng về phía đèn lồng nhưng vẫn thấy một phần cây đa
    const lanternPos = lantern.position.clone();
    const dir = new THREE.Vector3(0, 0.4, 3.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), lantern.position.x * 0.12);
    const targetCamPos = lanternPos.clone().add(dir);

    this.startCameraMove(targetCamPos, lanternPos, 1.4);

    // Báo cho UI mở modal thiệp chúc
    if (this.onSelectWish) {
      this.onSelectWish(lantern.wishData, lantern.index);
    }
  }

  /**
   * Chọn đèn lồng kế tiếp (Nút "Chọn đèn lồng khác")
   */
  selectNextLantern() {
    let nextIdx = 0;
    if (this.selectedLantern) {
      nextIdx = (this.selectedLantern.index + 1) % this.lanterns.length;
    } else {
      nextIdx = 0;
    }
    this.selectLantern(this.lanterns[nextIdx]);
  }

  /**
   * Chọn đèn lồng trước đó
   */
  selectPrevLantern() {
    let prevIdx = 0;
    if (this.selectedLantern) {
      prevIdx = (this.selectedLantern.index - 1 + this.lanterns.length) % this.lanterns.length;
    } else {
      prevIdx = this.lanterns.length - 1;
    }
    this.selectLantern(this.lanterns[prevIdx]);
  }

  /**
   * Đóng thiệp chúc và quay lại góc nhìn toàn cảnh cây đa
   */
  resetView() {
    this.selectedLantern = null;
    this.startCameraMove(this.defaultCameraPos, this.defaultCameraTarget, 1.6);
  }

  startCameraMove(targetPos, targetLookAt, duration = 1.5) {
    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.copy(targetPos);

    if (this.controls) {
      this.cameraStartTarget.copy(this.controls.target);
    } else {
      this.cameraStartTarget.copy(this.defaultCameraTarget);
    }
    this.cameraEndTarget.copy(targetLookAt);

    this.cameraAnimProgress = 0.0;
    this.cameraAnimDuration = duration;
    this.isCameraAnimating = true;
  }

  /**
   * Xử lý Hover khi di chuyển chuột
   */
  handleHover(hitObject) {
    if (hitObject && hitObject.userData && hitObject.userData.lanternRef) {
      const lantern = hitObject.userData.lanternRef;
      if (this.hoveredLantern !== lantern) {
        this.hoveredLantern = lantern;
      }
      return lantern;
    } else {
      this.hoveredLantern = null;
      return null;
    }
  }
}
