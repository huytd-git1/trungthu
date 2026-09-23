/**
 * Điểm khởi chạy chính của Website Trung Thu 3D (Main Entry Point)
 * Kết nối Scene 3D, Lantern Manager, Audio System và Modal Giao Diện
 */

import * as THREE from 'three';
import { WorldScene } from './scene.js';
import { LanternManager } from './lanterns.js';
import { audioSystem } from './audio.js';

class MidAutumnApp {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.tooltip = document.getElementById('scene-tooltip');
    this.modal = document.getElementById('wish-modal');
    this.wishCard = document.getElementById('wish-card');
    this.deck = document.getElementById('lantern-deck');

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.isPointerDown = false;
    this.pointerDownPos = { x: 0, y: 0 };

    this.init();
  }

  init() {
    try {
      // 1. Khởi tạo không gian 3D
      this.world = new WorldScene(this.container);

      // 2. Khởi tạo hệ thống đèn lồng
      this.lanternManager = new LanternManager(
        this.world.scene,
        this.world.camera,
        this.world.controls,
        (wishData, lanternIdx) => this.showWishModal(wishData, lanternIdx)
      );

      // 3. Khởi tạo UI điều khiển & sự kiện
      this.initUI();
      this.initEventListeners();

      // 4. Vòng lặp Render (Animation loop)
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    } catch (err) {
      console.error("Lỗi khi khởi tạo ứng dụng 3D:", err);
      const errBox = document.getElementById('debug-error-box');
      if (errBox) {
        errBox.textContent = `Lỗi khởi tạo: ${err.message}`;
        errBox.style.display = 'block';
      }
    }
  }

  initUI() {
    // A. Nút bật/tắt âm thanh
    const soundBtn = document.getElementById('sound-btn');
    const iconMute = document.getElementById('sound-icon-mute');
    const iconPlay = document.getElementById('sound-icon-play');

    const updateSoundBtnUI = (isPlaying) => {
      if (!soundBtn) return;
      if (isPlaying) {
        soundBtn.classList.add('playing');
        if (iconMute) iconMute.style.display = 'none';
        if (iconPlay) iconPlay.style.display = 'block';
        soundBtn.title = "Tắt âm thanh";
      } else {
        soundBtn.classList.remove('playing');
        if (iconMute) iconMute.style.display = 'block';
        if (iconPlay) iconPlay.style.display = 'none';
        soundBtn.title = "Bật âm thanh";
      }
    };

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isPlaying = audioSystem.toggleSound();
        updateSoundBtnUI(isPlaying);
      });
    }

    // Tự động đồng bộ UI khi âm thanh kích hoạt hoặc thay đổi
    audioSystem.onStateChange = (isPlaying) => {
      updateSoundBtnUI(isPlaying);
    };

    // Khởi tạo trạng thái ban đầu (mặc định đang phát)
    updateSoundBtnUI(!audioSystem.getIsMuted());

    // D. Nút đóng modal
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCloseView = document.getElementById('btn-close-view');
    const closeHandler = () => {
      this.hideWishModal();
      this.lanternManager.resetView();
    };
    btnCloseModal.addEventListener('click', closeHandler);
    btnCloseView.addEventListener('click', closeHandler);

    // Đóng khi click ra ngoài thẻ card
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        closeHandler();
      }
    });

    // E. Nút "Chọn đèn lồng khác" trong modal
    const btnNext = document.getElementById('btn-next-lantern');
    btnNext.addEventListener('click', () => {
      this.lanternManager.selectNextLantern();
    });

    // F. Nút "Sao chép lời chúc"
    const btnCopy = document.getElementById('btn-copy-wish');
    const copyToast = document.getElementById('copy-toast');
    btnCopy.addEventListener('click', async () => {
      const title = document.getElementById('modal-wish-title').textContent;
      const msg = document.getElementById('modal-wish-message').textContent;
      const quote = document.getElementById('modal-wish-quote').textContent;
      const textToCopy = `✨ ${title} ✨\n${msg}\n\n"${quote}"\n— Chúc mừng Tết Trung Thu! 🌕`;

      try {
        await navigator.clipboard.writeText(textToCopy);
        copyToast.classList.add('show');
        setTimeout(() => copyToast.classList.remove('show'), 2400);
      } catch (err) {
        console.warn("Không thể sao chép tự động:", err);
      }
    });
  }

  updateActiveChip(activeIdx) {
    if (!this.deck) return;
    const chips = this.deck.querySelectorAll('.lantern-chip');
    chips.forEach((c, idx) => {
      if (idx === activeIdx) c.classList.add('active');
      else c.classList.remove('active');
    });
  }

  showWishModal(wishData, lanternIdx) {
    this.updateActiveChip(lanternIdx);

    const totalLanterns = (this.lanternManager && this.lanternManager.lanterns.length) ? this.lanternManager.lanterns.length : 12;
    const currentNumber = lanternIdx + 1;
    document.getElementById('modal-wish-badge').textContent = `${wishData.badge || '🏮 Lời chúc'} • ${currentNumber}/${totalLanterns}`;
    document.getElementById('modal-wish-title').textContent = wishData.title;
    document.getElementById('modal-wish-message').textContent = wishData.message;
    document.getElementById('modal-wish-quote').textContent = wishData.quote;

    this.modal.classList.add('open');
  }

  hideWishModal() {
    this.modal.classList.remove('open');
    this.updateActiveChip(-1);
  }

  initEventListeners() {
    // 1. Raycaster Pointer Move
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Cập nhật Raycast kiểm tra đèn lồng được hover
      this.raycaster.setFromCamera(this.mouse, this.world.camera);
      const intersects = this.raycaster.intersectObjects(this.lanternManager.clickableMeshes, false);

      if (intersects.length > 0) {
        const hitLantern = this.lanternManager.handleHover(intersects[0].object);
        if (hitLantern) {
          document.body.style.cursor = 'pointer';
          this.tooltip.textContent = `🏮 ${hitLantern.cfg.title} - Chạm để xem lời chúc`;
          this.tooltip.style.left = `${e.clientX}px`;
          this.tooltip.style.top = `${e.clientY}px`;
          this.tooltip.classList.add('visible');
          this.world.controls.autoRotate = false;
        }
      } else {
        this.lanternManager.handleHover(null);
        document.body.style.cursor = 'default';
        this.tooltip.classList.remove('visible');
      }
    });

    // 2. Click / Tap trên canvas để chọn đèn
    window.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', (e) => {
      // Tránh kích hoạt nhầm khi người dùng đang vuốt xoay camera
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist > 8) return;

      // Không raycast nếu click trúng vào các phần tử HUD / Modal
      if (e.target.closest('.hud-overlay') || e.target.closest('.modal-backdrop')) {
        return;
      }

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.world.camera);

      const intersects = this.raycaster.intersectObjects(this.lanternManager.clickableMeshes, false);
      if (intersects.length > 0) {
        const lantern = intersects[0].object.userData.lanternRef;
        if (lantern) {
          this.lanternManager.selectLantern(lantern);
        }
      }
    });

    // 3. Phím tắt bàn phím (Phím 1-9, 0, -, = để chọn 12 đèn lồng, Esc để đóng, phím Mũi tên để lướt)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideWishModal();
        this.lanternManager.resetView();
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (this.lanternManager.lanterns[idx]) {
          this.lanternManager.selectLantern(this.lanternManager.lanterns[idx]);
        }
      } else if (e.key === '0') {
        if (this.lanternManager.lanterns[9]) {
          this.lanternManager.selectLantern(this.lanternManager.lanterns[9]);
        }
      } else if (e.key === '-' || e.key === '_') {
        if (this.lanternManager.lanterns[10]) {
          this.lanternManager.selectLantern(this.lanternManager.lanterns[10]);
        }
      } else if (e.key === '=' || e.key === '+') {
        if (this.lanternManager.lanterns[11]) {
          this.lanternManager.selectLantern(this.lanternManager.lanterns[11]);
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        if (this.modal.classList.contains('open')) {
          e.preventDefault();
          this.lanternManager.selectNextLantern();
        }
      } else if (e.key === 'ArrowLeft') {
        if (this.modal.classList.contains('open')) {
          e.preventDefault();
          this.lanternManager.selectPrevLantern();
        }
      }
    });

    // 4. Resize cửa sổ trình duyệt
    window.addEventListener('resize', () => {
      this.world.onResize();
    });
  }

  animate() {
    requestAnimationFrame(this.animate);

    const { delta, elapsed } = this.world.update();
    this.lanternManager.update(delta, elapsed);
    this.world.render();
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  new MidAutumnApp();
});
