/**
 * ==========================================================================
 * HỆ THỐNG ÂM THANH WEBSITE TRUNG THU (AUDIO SYSTEM)
 * Tích hợp YouTube Player, File MP3 & Bộ tổng hợp sáo trúc dự phòng
 * ==========================================================================
 */

// Video YouTube phát nhạc nền (qSFMCGaMCnA)
export const YOUTUBE_VIDEO_ID = "qSFMCGaMCnA";

// Đường dẫn file MP3 cục bộ (nếu có)
export const CUSTOM_AUDIO_URL = "audio/nhac_nen.mp3";

class MidAutumnAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false; // Mặc định BẬT âm thanh theo yêu cầu ("vào là phát âm thanh luôn")
    this.isPlaying = true;
    this.masterGain = null;
    this.ambientGain = null;
    this.timerId = null;
    this.onStateChange = null; // Callback cập nhật UI

    // Trình phát YouTube ngầm
    this.ytPlayer = null;
    this.ytReady = false;

    // File MP3
    this.customAudio = null;
    this.hasCustomAudio = false;

    // Thang âm ngũ cung sáo trúc dự phòng (Hò - Xự - Xang - Xê - Cống)
    this.pentatonicScale = [
      261.63, 293.66, 349.23, 392.00, 440.00,
      523.25, 587.33, 698.46, 783.99, 880.00
    ];

    this.melodyPattern = [
      { noteIdx: 2, dur: 1.8, delay: 0.0 },
      { noteIdx: 3, dur: 1.2, delay: 1.6 },
      { noteIdx: 4, dur: 2.2, delay: 2.8 },
      { noteIdx: 5, dur: 1.5, delay: 4.8 },
      { noteIdx: 6, dur: 2.5, delay: 6.2 },
      { noteIdx: 5, dur: 1.2, delay: 8.6 },
      { noteIdx: 4, dur: 2.0, delay: 9.8 },
      { noteIdx: 3, dur: 2.8, delay: 11.6 }
    ];

    this.initYouTubePlayer();
    this.checkCustomAudio();
    this.setupAutoplayGestureUnlock();
  }

  /**
   * Khởi tạo YouTube IFrame Player ngầm với cấu hình tự động phát
   */
  initYouTubePlayer() {
    if (!YOUTUBE_VIDEO_ID) return;

    // Nhúng thư viện YouTube IFrame API nếu chưa có
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      try {
        this.ytPlayer = new window.YT.Player('youtube-player', {
          height: '200',
          width: '200',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              this.ytReady = true;
              event.target.setVolume(80);
              // CHỈ phát YouTube nếu chưa có file MP3 trực tiếp (tránh quảng cáo YouTube)
              if (!this.isMuted && !this.hasCustomAudio) {
                try {
                  event.target.unMute();
                  event.target.playVideo();
                } catch (err) {
                  console.warn("Lỗi phát video lúc khởi tạo:", err);
                }
              }
            },
            onStateChange: (event) => {
              if (!window.YT) return;
              if (this.hasCustomAudio) {
                // Nếu đã có file MP3 không quảng cáo, cưỡng chế tắt YouTube
                try { this.ytPlayer.pauseVideo(); } catch (e) {}
                return;
              }
              if (event.data === window.YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.isMuted = false;
                if (typeof this.onStateChange === 'function') {
                  this.onStateChange(true);
                }
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                if (this.isMuted) {
                  this.isPlaying = false;
                  if (typeof this.onStateChange === 'function') {
                    this.onStateChange(false);
                  }
                }
              }
            },
            onError: (err) => {
              console.warn("YouTube Player gặp sự cố, tự động dùng âm thanh thay thế:", err);
              this.ytReady = false;
              if (!this.isMuted) {
                this.fallbackPlay();
              }
            }
          }
        });
      } catch (err) {
        console.warn("Lỗi khởi tạo YT Player:", err);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        setupPlayer();
      };
    }
  }

  /**
   * Đảm bảo âm thanh phát ngay lập tức khi người dùng chạm hoặc click lần đầu
   * (Vượt qua chính sách Autoplay Policy của trình duyệt một cách mượt mà nhất)
   */
  setupAutoplayGestureUnlock() {
    const triggerStart = () => {
      if (!this.isMuted) {
        this.ensureContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        // ƯU TIÊN 1: Phát trực tiếp file MP3 (100% Sạch - Không quảng cáo)
        if (this.customAudio && this.hasCustomAudio) {
          if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            try { this.ytPlayer.pauseVideo(); } catch (e) {}
          }
          this.customAudio.play().then(() => {
            this.isPlaying = true;
            if (typeof this.onStateChange === 'function') {
              this.onStateChange(true);
            }
          }).catch(() => {
            this.playYouTubeOrFallback();
          });
        } else {
          this.playYouTubeOrFallback();
        }
      }

      window.removeEventListener('pointerdown', triggerStart);
      window.removeEventListener('touchstart', triggerStart);
      window.removeEventListener('click', triggerStart);
      window.removeEventListener('keydown', triggerStart);
    };

    window.addEventListener('pointerdown', triggerStart, { passive: true });
    window.addEventListener('touchstart', triggerStart, { passive: true });
    window.addEventListener('click', triggerStart, { passive: true });
    window.addEventListener('keydown', triggerStart, { passive: true });
  }

  /**
   * Kiểm tra và nạp file MP3 không quảng cáo
   */
  checkCustomAudio() {
    if (CUSTOM_AUDIO_URL) {
      const audio = new Audio();
      audio.src = CUSTOM_AUDIO_URL;
      audio.loop = true;
      audio.volume = 0.75;
      audio.preload = 'auto';

      const onAudioLoaded = () => {
        this.hasCustomAudio = true;
        this.customAudio = audio;
        console.log("Đã phát hiện file MP3 không quảng cáo, ưu tiên phát MP3!");
        if (!this.isMuted) {
          if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            try { this.ytPlayer.pauseVideo(); } catch (e) {}
          }
          audio.play().then(() => {
            this.isPlaying = true;
            if (typeof this.onStateChange === 'function') {
              this.onStateChange(true);
            }
          }).catch(e => {
            // Chờ tương tác đầu tiên (setupAutoplayGestureUnlock sẽ phát ngay)
          });
        }
      };

      audio.addEventListener('canplaythrough', onAudioLoaded, { once: true });
      audio.addEventListener('loadeddata', onAudioLoaded, { once: true });

      audio.addEventListener('error', (e) => {
        console.warn("Chưa tải được file MP3, dùng YouTube dự phòng:", e);
        this.hasCustomAudio = false;
        this.customAudio = null;
      });

      audio.load();
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Tiếng chuông gió pha lê khi chạm vào đèn lồng
   */
  playLanternChime() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chimeFrequencies = [1046.50, 1318.51, 1567.98, 2093.00];

    chimeFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.9);
    });
  }

  /**
   * Sáo trúc dự phòng
   */
  playFluteNote(freq, duration = 2.0, timeOffset = 0) {
    if (!this.ctx || this.isMuted) return;
    const startTime = this.ctx.currentTime + timeOffset;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5.2, startTime);
    lfoGain.gain.setValueAtTime(3.5, startTime);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, startTime);
    filter.Q.setValueAtTime(1.5, startTime);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.35);
    noteGain.gain.setValueAtTime(0.22, startTime + duration * 0.7);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.ambientGain);

    osc1.start(startTime);
    osc2.start(startTime);
    lfo.start(startTime);
    osc1.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
    lfo.stop(startTime + duration + 0.1);
  }

  playPluckNote(freq, timeOffset = 0) {
    if (!this.ctx || this.isMuted) return;
    const startTime = this.ctx.currentTime + timeOffset;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, startTime);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + 1.2);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.2, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.ambientGain);

    osc.start(startTime);
    osc.stop(startTime + 1.7);
  }

  startMelodyLoop() {
    if (this.timerId) clearInterval(this.timerId);

    const playCycle = () => {
      if (this.isMuted) return;
      this.melodyPattern.forEach(item => {
        const freq = this.pentatonicScale[item.noteIdx];
        this.playFluteNote(freq, item.dur, item.delay);
      });
      const plucks = [
        { noteIdx: 0, delay: 0.5 },
        { noteIdx: 3, delay: 2.2 },
        { noteIdx: 4, delay: 4.0 },
        { noteIdx: 7, delay: 7.2 },
        { noteIdx: 5, delay: 10.5 }
      ];
      plucks.forEach(p => {
        const freq = this.pentatonicScale[p.noteIdx];
        this.playPluckNote(freq, p.delay);
      });
    };

    playCycle();
    this.timerId = setInterval(playCycle, 15000);
  }

  /**
   * Bật/Tắt âm thanh (Toggle)
   */
  toggleSound() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      // 1. Tạm dừng YouTube
      if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.pauseVideo === 'function') {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }
      // 2. Tạm dừng MP3 nếu có
      if (this.customAudio) {
        this.customAudio.pause();
      }
      // 3. Tạm dừng sáo trúc
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      }
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.isPlaying = false;
      if (typeof this.onStateChange === 'function') {
        this.onStateChange(false);
      }
      return false;
    } else {
      // BẬT ÂM THANH
      this.ensureContext();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.4);
      }

      // ƯU TIÊN 1 TUYỆT ĐỐI: Phát file MP3 (100% Sạch - Không quảng cáo)
      if (this.customAudio && this.hasCustomAudio) {
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
          try { this.ytPlayer.pauseVideo(); } catch (e) {}
        }
        this.customAudio.play().then(() => {
          this.isPlaying = true;
          if (typeof this.onStateChange === 'function') {
            this.onStateChange(true);
          }
        }).catch(e => {
          this.playYouTubeOrFallback();
        });
      } else {
        this.playYouTubeOrFallback();
      }

      this.isPlaying = true;
      if (typeof this.onStateChange === 'function') {
        this.onStateChange(true);
      }
      return true;
    }
  }

  playYouTubeOrFallback() {
    if (this.ytPlayer && this.ytReady && typeof this.ytPlayer.playVideo === 'function') {
      try {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(80);
        this.ytPlayer.playVideo();
      } catch (e) {
        console.warn("Không thể phát video YouTube, chuyển âm thanh dự phòng:", e);
        this.fallbackPlay();
      }
    } else {
      this.fallbackPlay();
    }
  }

  fallbackPlay() {
    if (this.customAudio && this.hasCustomAudio) {
      this.customAudio.play().catch(() => this.startMelodyLoop());
    } else {
      this.startMelodyLoop();
    }
  }

  getIsMuted() {
    return this.isMuted;
  }
}

export const audioSystem = new MidAutumnAudio();
