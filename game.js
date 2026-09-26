/**
 * Вселенная паркура - 2D Stickman Parkour Game
 * Engine & Game Logic with Multi-Level System & Next Level Transition
 */

(function () {
    // --- Canvas & Audio Setup ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // UI Elements
    const mainMenuScreen = document.getElementById('mainMenu');
    const levelSelectScreen = document.getElementById('levelSelectScreen');
    const levelsGrid = document.getElementById('levelsGrid');
    const hudOverlay = document.getElementById('hud');
    const ledgeHint = document.getElementById('ledgeHint');
    const victoryScreen = document.getElementById('victoryScreen');
    const victoryTitle = document.querySelector('.victory-title');
    const victorySubtext = document.querySelector('.victory-subtext');
    const pauseScreen = document.getElementById('pauseScreen');
    const fadeOverlay = document.getElementById('fadeOverlay');

    const menuCard = document.querySelector('#mainMenu .menu-card');
    const levelCard = document.querySelector('#levelSelectScreen .level-card');

    const btnPlay = document.getElementById('btnPlay');
    const btnBackToMenu = document.getElementById('btnBackToMenu');
    const btnNextLevel = document.getElementById('btnNextLevel');
    const btnReplay = document.getElementById('btnReplay');
    const btnToMenu = document.getElementById('btnToMenu');
    const btnPause = document.getElementById('btnPause');
    const btnResume = document.getElementById('btnResume');
    const btnPauseReplay = document.getElementById('btnPauseReplay');
    const btnPauseToLevels = document.getElementById('btnPauseToLevels');
    const defeatScreen = document.getElementById('defeatScreen');
    const btnDefeatReplay = document.getElementById('btnDefeatReplay');
    const btnDefeatToLevels = document.getElementById('btnDefeatToLevels');
    const bossHud = document.getElementById('bossHud');
    const bossHealthBar = document.getElementById('bossHealthBar');
    const bossPhaseText = document.getElementById('bossPhaseText');

    // Sound Engine (Web Audio API)
    let audioCtx = null;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSound(type) {
        if (!audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            if (type === 'jump') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'grab') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'climb') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(240, now);
                osc.frequency.exponentialRampToValueAtTime(520, now + 0.2);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'victory') {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const noteTime = now + idx * 0.12;
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, noteTime);
                    gain.gain.setValueAtTime(0.3, noteTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(noteTime);
                    osc.stop(noteTime + 0.3);
                });
            } else if (type === 'airBoost') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(650, now + 0.18);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
            } else if (type === 'defeat') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(240, now);
                osc.frequency.exponentialRampToValueAtTime(55, now + 0.55);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.55);
            } else if (type === 'warning') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.setValueAtTime(1100, now + 0.08);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.22);
            } else if (type === 'slam') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(130, now);
                osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'doorOpen') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(440, now + 0.6);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.6);
            } else if (type === 'whiteLight') {
                const chord = [329.63, 440.00, 554.37, 659.25, 880.00, 1108.73];
                chord.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const noteTime = now + idx * 0.08;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, noteTime);
                    gain.gain.setValueAtTime(0.18, noteTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(noteTime);
                    osc.stop(noteTime + 1.2);
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Game States
    const STATES = {
        MENU: 'MENU',
        LEVEL_SELECT: 'LEVEL_SELECT',
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        VICTORY: 'VICTORY',
        DEFEAT: 'DEFEAT',
        CUTSCENE: 'CUTSCENE'
    };
    let currentState = STATES.MENU;

    // Viewport & Scale Settings
    let width = 1200;
    let height = 675;
    let cameraX = 0;
    let cameraY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const scale = canvas.height / 675;
        width = canvas.width / scale;
        height = 675;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Input Controller
    const keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        crouch: false,
        shift: false,
        shiftPressedThisFrame: false,
        jump: false,
        jumpPressedThisFrame: false,
        interact: false,
        interactPressedThisFrame: false
    };

    function togglePause() {
        if (currentState === STATES.PLAYING) {
            currentState = STATES.PAUSED;
            pauseScreen.classList.remove('hidden');
            pauseScreen.classList.add('screen-active');
        } else if (currentState === STATES.PAUSED) {
            currentState = STATES.PLAYING;
            pauseScreen.classList.remove('screen-active');
            pauseScreen.classList.add('hidden');
        }
    }

    window.addEventListener('keydown', (e) => {
        initAudio();

        const isGameKey = [
            'KeyA', 'KeyD', 'KeyW', 'KeyS',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'ControlLeft', 'ControlRight', 'KeyC', 'KeyE', 'Space',
            'ShiftLeft', 'ShiftRight',
            'Escape', 'KeyP'
        ].includes(e.code) || e.key === 'Control' || e.key === 'Shift';

        if (isGameKey) {
            e.preventDefault();
        }

        if (e.code === 'Escape' || e.code === 'KeyP') {
            togglePause();
            return;
        }

        if (currentState === STATES.PAUSED) return;

        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = true;
        if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.key === 'Control' || e.code === 'KeyC') keys.crouch = true;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
            if (!keys.shift) keys.shiftPressedThisFrame = true;
            keys.shift = true;
        }
        if (e.code === 'KeyE') {
            if (!keys.interact) keys.interactPressedThisFrame = true;
            keys.interact = true;
        }
        if (e.code === 'Space') {
            if (!keys.jump) keys.jumpPressedThisFrame = true;
            keys.jump = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        const isGameKey = [
            'KeyA', 'KeyD', 'KeyW', 'KeyS',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'ControlLeft', 'ControlRight', 'KeyC', 'KeyE', 'Space',
            'ShiftLeft', 'ShiftRight'
        ].includes(e.code) || e.key === 'Control' || e.key === 'Shift';

        if (isGameKey) {
            e.preventDefault();
        }

        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = false;
        if (e.code === 'ControlLeft' || e.code === 'ControlRight' || e.key === 'Control' || e.code === 'KeyC') keys.crouch = false;
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') keys.shift = false;
        if (e.code === 'KeyE') keys.interact = false;
        if (e.code === 'Space') keys.jump = false;
    });

    // --- LEVELS DATABASE ---
    const unlockedLevels = 20; // Levels 1 to 20 unlocked
    let currentLevelIndex = 1;

    const levelsData = {
        1: {
            id: 1,
            title: "Уровень 1",
            worldWidth: 2200,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 2200, h: 140, type: 'ground' }
            ],
            boxes: [
                // Single Large Box Obstacle
                { x: 750, y: 360, w: 180, h: 180 }
            ],
            flag: { x: 1850, y: 540, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        2: {
            id: 2,
            title: "Уровень 2",
            worldWidth: 2600,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 2600, h: 140, type: 'ground' }
            ],
            boxes: [
                // Small Box
                { x: 650, y: 440, w: 130, h: 100, isSmall: true },
                // Big Box
                { x: 830, y: 280, w: 180, h: 260 }
            ],
            flag: { x: 2000, y: 540, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        3: {
            id: 3,
            title: "Уровень 3",
            worldWidth: 3400,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 3400, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Large box to climb over edge (h: 230, top at y: 310)
                { x: 600, y: 310, w: 200, h: 230 },
                // 2nd Object: Huge long box with Ladder (w: 520, h: 520, top at y: 20)
                { x: 1050, y: 20, w: 520, h: 520 },
                // 3rd Object: Identical size as 2nd Object (w: 520, h: 520, top at y: 20, gap: 260px allows jump or ledge catch)
                { x: 1830, y: 20, w: 520, h: 520 }
            ],
            ladders: [
                { x: 1070, topY: 20, bottomY: 540, w: 36 }
            ],
            flag: { x: 2230, y: 20, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        4: {
            id: 4,
            title: "Уровень 4",
            worldWidth: 2800,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 2800, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Tunnel Box with low space underneath (bottomY: 490, gap 50px). High top to prevent jumping over.
                { x: 600, y: -200, w: 220, h: 690, noLedgeGrab: true },
                // 2nd Object: Box with Ladder (top at y: 50, bottom at 540). Cannot ledge-grab or jump over.
                { x: 1000, y: 50, w: 220, h: 490, noLedgeGrab: true },
                // 3rd Object: Box overhead for Turnik (shifted left x: 1320, y: -380, h: 200, bottom at y: -180).
                { x: 1320, y: -380, w: 220, h: 200, noLedgeGrab: true },
                // 4th Object: Box identical in size to 2nd Object (shifted closer x: 1640, top at y: 50, bottom at 540, w: 220, h: 490) with Flag.
                { x: 1640, y: 50, w: 220, h: 490 }
            ],
            ladders: [
                { x: 1020, topY: 50, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik bar at x: 1430, y: -130
                { id: 'turnik1', x: 1430, y: -130, length: 80, boxBottomY: -180 }
            ],
            flag: { x: 1750, y: 50, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        5: {
            id: 5,
            title: "Уровень 5",
            worldWidth: 3200,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 3200, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Long Box with Ladder (top at y: 160, bottom at 540, w: 340, h: 380)
                { x: 550, y: 160, w: 340, h: 380, noLedgeGrab: true },
                // 2nd Object Support: Overhead structure for Turnik 1 (bottom at y: 0)
                { x: 1100, y: -200, w: 200, h: 200, noLedgeGrab: true },
                // 3rd Object Support: Overhead structure for Turnik 2 (bottom at y: -60)
                { x: 1540, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 4th Object Support: Overhead structure for Turnik 3 (bottom at y: -120)
                { x: 1980, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 5th Object: Final Box with Victory Flag (top at y: 60, bottom at 540, w: 280, h: 480)
                { x: 2480, y: 60, w: 280, h: 480 }
            ],
            ladders: [
                // Ladder for 1st Object
                { x: 570, topY: 160, bottomY: 540, w: 36 }
            ],
            turniks: [
                // 2nd Object: Turnik 1 at x: 1200, y: 50
                { id: 'turnik1', x: 1200, y: 50, length: 80, boxBottomY: 0 },
                // 3rd Object: Turnik 2 at x: 1640, y: -10
                { id: 'turnik2', x: 1640, y: -10, length: 80, boxBottomY: -60 },
                // 4th Object: Turnik 3 at x: 2080, y: -70
                { id: 'turnik3', x: 2080, y: -70, length: 80, boxBottomY: -120 }
            ],
            flag: { x: 2620, y: 60, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        6: {
            id: 6,
            title: "Уровень 6",
            worldWidth: 3800,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 3800, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Box with low space underneath (bottom at y: 490, gap 50px) for Roll / Ctrl
                { x: 550, y: -200, w: 220, h: 690, noLedgeGrab: true },
                // 2nd Object: High box requiring double jump to grab edge (top at y: 260)
                { x: 950, y: 260, w: 180, h: 280 },
                // 3rd Object Support: Overhead structure for Turnik (bottom at y: 100)
                { x: 1280, y: -200, w: 200, h: 300, noLedgeGrab: true },
                // 4th Object: Huge wall with low space underneath (bottom at y: 490). Cannot jump over via turnik, forcing turnik swing underneath!
                { x: 1650, y: -250, w: 240, h: 740, noLedgeGrab: true },
                // 5th Object: Box with Ladder (top at y: 160, w: 320, h: 380)
                { x: 2150, y: 160, w: 320, h: 380, noLedgeGrab: true },
                // 6th Object: Box identical size to 5th Object (w: 320, h: 380) with Flag. Requires jumping from 5th Object!
                { x: 2700, y: 160, w: 320, h: 380 }
            ],
            ladders: [
                // Ladder for 5th Object
                { x: 2170, topY: 160, bottomY: 540, w: 36 }
            ],
            turniks: [
                // 3rd Object: Turnik bar at x: 1380, y: 160 (slightly higher & ahead of 2nd object)
                { id: 'turnik1', x: 1380, y: 160, length: 80, boxBottomY: 100 }
            ],
            flag: { x: 2840, y: 160, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        7: {
            id: 7,
            title: "Уровень 7",
            worldWidth: 4200,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 4200, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Box with low space underneath (bottom at y: 490, gap 50px)
                { x: 550, y: -200, w: 220, h: 690, noLedgeGrab: true },
                // 2nd Object: Box with Ladder (top at y: 160, bottom at 540)
                { x: 950, y: 160, w: 320, h: 380, noLedgeGrab: true },
                // 3rd Object Support: Overhead structure for Turnik 1 (bottom at y: 0)
                { x: 1450, y: -200, w: 200, h: 200, noLedgeGrab: true },
                // 4th Object Support: Overhead structure for Turnik 2 (bottom at y: -60)
                { x: 1850, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 5th Object (New): Structure with opening/tunnel IN THE MIDDLE (gap between y: -60 and y: 60)
                { x: 2300, y: -300, w: 260, h: 240, noLedgeGrab: true },
                { x: 2300, y: 60, w: 260, h: 480, noLedgeGrab: true },
                // 6th Object: Box with low space underneath (bottom at y: 490, gap 50px). High top wall (y: -600) prevents climbing over.
                { x: 2750, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 7th Object: Box with Ladder holding Victory Flag at the top
                { x: 3200, y: 100, w: 240, h: 440 }
            ],
            ladders: [
                // Ladder for 2nd Object
                { x: 970, topY: 160, bottomY: 540, w: 36 },
                // Ladder for 7th Object with Victory Flag
                { x: 3220, topY: 100, bottomY: 540, w: 36 }
            ],
            turniks: [
                // 3rd Object: Turnik 1 at x: 1550, y: 50
                { id: 'turnik1', x: 1550, y: 50, length: 80, boxBottomY: 0 },
                // 4th Object: Turnik 2 at x: 1950, y: -10 (swing launches player straight into middle opening of 5th object!)
                { id: 'turnik2', x: 1950, y: -10, length: 80, boxBottomY: -60 }
            ],
            flag: { x: 3240, y: 100, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        8: {
            id: 8,
            title: "Уровень 8",
            worldWidth: 4600,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 4600, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px for Roll)
                { x: 500, y: -200, w: 220, h: 690, noLedgeGrab: true },
                // 2nd Object: Stepping pillar box (top at y: 390)
                { x: 880, y: 390, w: 160, h: 150, isSmall: true },
                // 3rd Object: Tower box with Ladder (top at y: 160, bottom at 540)
                { x: 1200, y: 160, w: 280, h: 380, noLedgeGrab: true },
                // 4th Object: Mid-air floating island platform (top at y: 160)
                { x: 1720, y: 160, w: 220, h: 60 },
                // 5th Object: Overhead structure for Turnik 1 (bottom at y: -20)
                { x: 2160, y: -220, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Mid-course landing pillar (top at y: 120)
                { x: 2680, y: 120, w: 200, h: 420 },
                // 7th Object: Overhead structure for Turnik 2 (bottom at y: -60)
                { x: 3100, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 8th Object: Victory Citadel Box with Ladder (top at y: 80)
                { x: 3620, y: 80, w: 320, h: 460 }
            ],
            ladders: [
                // Ladder for 3rd Object
                { x: 1220, topY: 160, bottomY: 540, w: 36 },
                // Ladder for 8th Object with Victory Flag
                { x: 3640, topY: 80, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 5th Object (y: 30)
                { id: 'turnik1', x: 2260, y: 30, length: 80, boxBottomY: -20 },
                // Turnik for 7th Object (y: -10)
                { id: 'turnik2', x: 3200, y: -10, length: 80, boxBottomY: -60 }
            ],
            flag: { x: 3800, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        9: {
            id: 9,
            title: "Уровень 9",
            worldWidth: 5000,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 5000, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel obstacle (bottom at y: 490, gap 50px)
                { x: 500, y: -200, w: 220, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle box (top at y: 410)
                { x: 860, y: 410, w: 150, h: 130, isSmall: true },
                // 3rd Object: Medium stepping column (top at y: 280)
                { x: 1150, y: 280, w: 180, h: 260 },
                // 4th Object: Tower with Ladder (top at y: 100, bottom at 540)
                { x: 1480, y: 100, w: 260, h: 440, noLedgeGrab: true },
                // 5th Object: Overhead structure for Turnik 1 (bottom at y: -40)
                { x: 1960, y: -240, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Turnik 2 (bottom at y: -80)
                { x: 2460, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Solid pillar box (top at y: 40, bottom at 540, blocks ground passage)
                { x: 2980, y: 40, w: 220, h: 500 },
                // 8th Object: Giant wall with low crawlway underneath (bottom at y: 490, gap 50px)
                { x: 3420, y: -500, w: 260, h: 990, noLedgeGrab: true },
                // 9th Object: Grand Citadel with Ladder & Flag (top at y: 60)
                { x: 3880, y: 60, w: 340, h: 480 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1500, topY: 100, bottomY: 540, w: 36 },
                // Ladder for 9th Object with Victory Flag
                { x: 3900, topY: 60, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 5th Object (y: 10)
                { id: 'turnik1', x: 2060, y: 10, length: 80, boxBottomY: -40 },
                // Turnik for 6th Object (y: -30)
                { id: 'turnik2', x: 2560, y: -30, length: 80, boxBottomY: -80 }
            ],
            flag: { x: 4080, y: 60, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        10: {
            id: 10,
            title: "Уровень 10",
            worldWidth: 5600,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 5600, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Low entry slide gate (bottom at y: 490, gap 50px)
                { x: 480, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: High vault box requiring double jump/ledge grab (top at y: 280)
                { x: 800, y: 280, w: 180, h: 260 },
                // 3rd Object: Tower of Ascent with Ladder (top at y: 120, bottom at 540)
                { x: 1140, y: 120, w: 260, h: 420, noLedgeGrab: true },
                // 4th Object: Overhead structure for Sky Turnik 1 (bottom at y: -60)
                { x: 1600, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 5th Object: Overhead structure for Sky Turnik 2 (bottom at y: -120)
                { x: 2100, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Cloud Island Pillar (top at y: -30, bottom at 540, blocks ground passage)
                { x: 2600, y: -30, w: 240, h: 570 },
                // 7th Object: Overhead structure for Sky Turnik 3 (bottom at y: -80)
                { x: 3040, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 8th Object: Stepping Pillar (top at y: 60, bottom at 540, blocks ground passage)
                { x: 3560, y: 60, w: 220, h: 480 },
                // 9th Object: Colossal Monolith wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 4000, y: -600, w: 260, h: 1090, noLedgeGrab: true },
                // 10th Object: Final Apex Temple with Ladder & Flag (top at y: 40)
                { x: 4460, y: 40, w: 360, h: 500 }
            ],
            ladders: [
                // Ladder for 3rd Object
                { x: 1160, topY: 120, bottomY: 540, w: 36 },
                // Ladder for 10th Object with Victory Flag
                { x: 4480, topY: 40, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 4th Object (y: -10)
                { id: 'turnik1', x: 1700, y: -10, length: 80, boxBottomY: -60 },
                // Turnik for 5th Object (y: -70)
                { id: 'turnik2', x: 2200, y: -70, length: 80, boxBottomY: -120 },
                // Turnik for 7th Object (y: -30)
                { id: 'turnik3', x: 3140, y: -30, length: 80, boxBottomY: -80 }
            ],
            flag: { x: 4680, y: 40, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        11: {
            id: 11,
            title: "Уровень 11",
            worldWidth: 5200,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 5200, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 480, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Stepping block (top at y: 390)
                { x: 800, y: 390, w: 160, h: 150, isSmall: true },
                // 3rd Object: High tower with Ladder 1 (top at y: 140, bottom at 540)
                { x: 1100, y: 140, w: 260, h: 400, noLedgeGrab: true },
                // 4th Object: Overhead structure for Rope 1 (bottom at y: -60)
                { x: 1550, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 5th Object: Solid landing pillar 1 (top at y: 140, bottom at 540)
                { x: 2050, y: 140, w: 240, h: 400 },
                // 6th Object: Low vault box (top at y: 380, bottom at 540)
                { x: 2450, y: 380, w: 160, h: 160, isSmall: true },
                // 7th Object: Overhead structure for Turnik 1 (bottom at y: -40)
                { x: 2800, y: -240, w: 200, h: 200, noLedgeGrab: true },
                // 8th Object: Solid landing pillar 2 (top at y: 100, bottom at 540)
                { x: 3300, y: 100, w: 240, h: 440 },
                // 9th Object: Overhead structure for Rope 2 (bottom at y: -80)
                { x: 3750, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Monolith wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 4250, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 11th Object: Victory Citadel with Ladder 2 & Flag (top at y: 60)
                { x: 4680, y: 60, w: 340, h: 480 }
            ],
            ladders: [
                // Ladder for 3rd Object
                { x: 1120, topY: 140, bottomY: 540, w: 36 },
                // Ladder for 11th Object with Victory Flag
                { x: 4700, topY: 60, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 7th Object (y: 20)
                { id: 'turnik1', x: 2900, y: 20, length: 80, boxBottomY: -40 }
            ],
            ropes: [
                // Rope 1 for 4th Object
                { id: 'rope1', x: 1650, anchorY: -60, length: 220 },
                // Rope 2 for 9th Object
                { id: 'rope2', x: 3850, anchorY: -80, length: 220 }
            ],
            flag: { x: 4880, y: 60, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        12: {
            id: 12,
            title: "Уровень 12",
            worldWidth: 5600,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 5600, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 480, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle (top at y: 410, bottom at 540)
                { x: 780, y: 410, w: 140, h: 130, isSmall: true },
                // 3rd Object: Medium hurdle (top at y: 280, bottom at 540)
                { x: 1020, y: 280, w: 160, h: 260 },
                // 4th Object: Tower with Ladder 1 (top at y: 120, bottom at 540)
                { x: 1300, y: 120, w: 260, h: 420, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -80)
                { x: 1750, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Rope 2 (bottom at y: -80)
                { x: 2250, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Solid center pillar (top at y: 100, bottom at 540)
                { x: 2750, y: 100, w: 240, h: 440 },
                // 8th Object: Overhead structure for Turnik 1 (bottom at y: -40)
                { x: 3200, y: -240, w: 200, h: 200, noLedgeGrab: true },
                // 9th Object: Stepping column (top at y: 160, bottom at 540)
                { x: 3680, y: 160, w: 200, h: 380 },
                // 10th Object: Overhead structure for Rope 3 (bottom at y: -60)
                { x: 4080, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 11th Object: Monolith wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 4560, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 12th Object: Victory Fortress with Ladder 2 & Flag (top at y: 40)
                { x: 4980, y: 40, w: 340, h: 500 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1320, topY: 120, bottomY: 540, w: 36 },
                // Ladder for 12th Object with Victory Flag
                { x: 5000, topY: 40, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 8th Object (y: 20)
                { id: 'turnik1', x: 3300, y: 20, length: 80, boxBottomY: -40 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1850, anchorY: -80, length: 230 },
                // Rope 2 for 6th Object
                { id: 'rope2', x: 2350, anchorY: -80, length: 230 },
                // Rope 3 for 10th Object
                { id: 'rope3', x: 4180, anchorY: -60, length: 220 }
            ],
            flag: { x: 5180, y: 40, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        13: {
            id: 13,
            title: "Уровень 13",
            worldWidth: 5800,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 5800, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 460, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: High step box (top at y: 320, bottom at 540)
                { x: 760, y: 320, w: 160, h: 220 },
                // 3rd Object: Double jump wall (top at y: 180, bottom at 540)
                { x: 1020, y: 180, w: 180, h: 360 },
                // 4th Object: Tower with Ladder 1 (top at y: 80, bottom at 540)
                { x: 1300, y: 80, w: 240, h: 460, noLedgeGrab: true },
                // 5th Object: Overhead structure for Turnik 1 (bottom at y: -60)
                { x: 1720, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Rope 1 (bottom at y: -100)
                { x: 2180, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Solid mid-sky pillar (top at y: 60, bottom at 540)
                { x: 2680, y: 60, w: 220, h: 480 },
                // 8th Object: Overhead structure for Rope 2 (bottom at y: -100)
                { x: 3100, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 9th Object: Overhead structure for Turnik 2 (bottom at y: -60)
                { x: 3580, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Solid landing bastion (top at y: 60, bottom at 540)
                { x: 4060, y: 60, w: 240, h: 480 },
                // 11th Object: Step-down column (top at y: 240, bottom at 540)
                { x: 4420, y: 240, w: 180, h: 300 },
                // 12th Object: Monolith barrier wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 4760, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 13th Object: Victory Spire with Ladder 2 & Flag (top at y: 40)
                { x: 5180, y: 40, w: 340, h: 500 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1320, topY: 80, bottomY: 540, w: 36 },
                // Ladder for 13th Object with Victory Flag
                { x: 5200, topY: 40, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 5th Object (y: 0)
                { id: 'turnik1', x: 1820, y: 0, length: 80, boxBottomY: -60 },
                // Turnik for 9th Object (y: -10)
                { id: 'turnik2', x: 3680, y: -10, length: 80, boxBottomY: -60 }
            ],
            ropes: [
                // Rope 1 for 6th Object
                { id: 'rope1', x: 2280, anchorY: -100, length: 230 },
                // Rope 2 for 8th Object
                { id: 'rope2', x: 3200, anchorY: -100, length: 230 }
            ],
            flag: { x: 5380, y: 40, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        14: {
            id: 14,
            title: "Уровень 14",
            worldWidth: 6400,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 6400, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 460, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle (top at y: 420, bottom at 540)
                { x: 760, y: 420, w: 140, h: 120, isSmall: true },
                // 3rd Object: Medium hurdle (top at y: 300, bottom at 540)
                { x: 1000, y: 300, w: 160, h: 240 },
                // 4th Object: Tower with Ladder 1 (top at y: 120, bottom at 540)
                { x: 1280, y: 120, w: 240, h: 420, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -80)
                { x: 1700, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Rope 2 (bottom at y: -120)
                { x: 2180, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Solid high pillar (top at y: 20, bottom at 540)
                { x: 2680, y: 20, w: 220, h: 520 },
                // 8th Object: Overhead structure for Turnik 1 (bottom at y: -60)
                { x: 3100, y: -260, w: 200, h: 200, noLedgeGrab: true },
                // 9th Object: Overhead structure for Turnik 2 (bottom at y: -100)
                { x: 3580, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Solid high plateau pillar (top at y: 0, bottom at 540)
                { x: 4060, y: 0, w: 240, h: 540 },
                // 11th Object: Overhead structure for Rope 3 (bottom at y: -120)
                { x: 4500, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 12th Object: Solid landing column (top at y: 160, bottom at 540)
                { x: 4980, y: 160, w: 200, h: 380 },
                // 13th Object: Monolith gate with low crawlway (bottom at y: 490, gap 50px)
                { x: 5320, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 14th Object: Grand Citadel with Ladder 2 & Flag (top at y: 40)
                { x: 5740, y: 40, w: 360, h: 500 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1300, topY: 120, bottomY: 540, w: 36 },
                // Ladder for 14th Object with Victory Flag
                { x: 5760, topY: 40, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 8th Object (y: -10)
                { id: 'turnik1', x: 3200, y: -10, length: 80, boxBottomY: -60 },
                // Turnik for 9th Object (y: -50)
                { id: 'turnik2', x: 3680, y: -50, length: 80, boxBottomY: -100 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1800, anchorY: -80, length: 220 },
                // Rope 2 for 6th Object
                { id: 'rope2', x: 2280, anchorY: -120, length: 230 },
                // Rope 3 for 11th Object
                { id: 'rope3', x: 4600, anchorY: -120, length: 240 }
            ],
            flag: { x: 5960, y: 40, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        15: {
            id: 15,
            title: "Уровень 15",
            worldWidth: 6800,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 6800, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 440, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low jump block (top at y: 400, bottom at 540)
                { x: 740, y: 400, w: 150, h: 140, isSmall: true },
                // 3rd Object: High jump block (top at y: 260, bottom at 540)
                { x: 990, y: 260, w: 160, h: 280 },
                // 4th Object: Tower of Ascent with Ladder 1 (top at y: 80, bottom at 540)
                { x: 1260, y: 80, w: 240, h: 460, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -100)
                { x: 1680, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Turnik 1 (bottom at y: -100)
                { x: 2140, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Overhead structure for Rope 2 (bottom at y: -140)
                { x: 2600, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 8th Object: Solid Sky Pillar 1 (top at y: -40, bottom at 540)
                { x: 3080, y: -40, w: 220, h: 580 },
                // 9th Object: Overhead structure for Turnik 2 (bottom at y: -140)
                { x: 3500, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Overhead structure for Rope 3 (bottom at y: -160)
                { x: 3960, y: -360, w: 200, h: 200, noLedgeGrab: true },
                // 11th Object: Solid Sky Pillar 2 (top at y: 0, bottom at 540)
                { x: 4460, y: 0, w: 220, h: 540 },
                // 12th Object: Overhead structure for Rope 4 (bottom at y: -120)
                { x: 4880, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 13th Object: Solid step-down column (top at y: 140, bottom at 540)
                { x: 5380, y: 140, w: 200, h: 400 },
                // 14th Object: Colossal Monolith with low crawlway (bottom at y: 490, gap 50px)
                { x: 5720, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 15th Object: Pantheon of Victory with Ladder 2 & Flag (top at y: 20)
                { x: 6140, y: 20, w: 380, h: 520 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1280, topY: 80, bottomY: 540, w: 36 },
                // Ladder for 15th Object with Victory Flag
                { x: 6160, topY: 20, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 6th Object (y: -40)
                { id: 'turnik1', x: 2240, y: -40, length: 80, boxBottomY: -100 },
                // Turnik for 9th Object (y: -80)
                { id: 'turnik2', x: 3600, y: -80, length: 80, boxBottomY: -140 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1780, anchorY: -100, length: 220 },
                // Rope 2 for 7th Object
                { id: 'rope2', x: 2700, anchorY: -140, length: 230 },
                // Rope 3 for 10th Object
                { id: 'rope3', x: 4060, anchorY: -160, length: 230 },
                // Rope 4 for 12th Object
                { id: 'rope4', x: 4980, anchorY: -120, length: 230 }
            ],
            flag: { x: 6360, y: 20, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        16: {
            id: 16,
            title: "Уровень 16",
            worldWidth: 7200,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 7200, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 440, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle (top at y: 410, bottom at 540)
                { x: 740, y: 410, w: 140, h: 130, isSmall: true },
                // 3rd Object: Stepping pillar (top at y: 280, bottom at 540)
                { x: 980, y: 280, w: 160, h: 260 },
                // 4th Object: Tower of Ascent with Ladder 1 (top at y: 100, bottom at 540)
                { x: 1260, y: 100, w: 260, h: 440, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -80)
                { x: 1720, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Solid landing pillar 1 (top at y: 140, bottom at 540)
                { x: 2220, y: 140, w: 240, h: 400 },
                // 7th Object: Overhead structure for Turnik 1 (bottom at y: -50)
                { x: 2700, y: -250, w: 200, h: 200, noLedgeGrab: true },
                // 8th & 9th Object: Elevated window opening (gap between y: -40 and y: 80)
                { x: 3250, y: -300, w: 240, h: 260, noLedgeGrab: true },
                { x: 3250, y: 80, w: 240, h: 460, noLedgeGrab: true },
                // 10th Object: Overhead structure for Rope 2 (bottom at y: -100)
                { x: 3800, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 11th Object: Overhead structure for Rope 3 (bottom at y: -100)
                { x: 4300, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 12th Object: Landing bastion (top at y: 80, bottom at 540)
                { x: 4850, y: 80, w: 240, h: 460 },
                // 13th Object: Step-down column (top at y: 240, bottom at 540)
                { x: 5240, y: 240, w: 180, h: 300 },
                // 14th Object: Monolith wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 5580, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 15th Object: Grand Citadel with Ladder 2 & Flag (top at y: 40)
                { x: 6020, y: 40, w: 360, h: 500 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1280, topY: 100, bottomY: 540, w: 36 },
                // Ladder for 15th Object with Victory Flag
                { x: 6040, topY: 40, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 7th Object (y: 10)
                { id: 'turnik1', x: 2800, y: 10, length: 80, boxBottomY: -50 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1820, anchorY: -80, length: 230 },
                // Rope 2 for 10th Object
                { id: 'rope2', x: 3900, anchorY: -100, length: 230 },
                // Rope 3 for 11th Object
                { id: 'rope3', x: 4400, anchorY: -100, length: 230 }
            ],
            flag: { x: 6240, y: 40, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        17: {
            id: 17,
            title: "Уровень 17",
            worldWidth: 7600,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 7600, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 440, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Stepping column (top at y: 380, bottom at 540)
                { x: 740, y: 380, w: 150, h: 160, isSmall: true },
                // 3rd Object: High hurdle (top at y: 240, bottom at 540)
                { x: 990, y: 240, w: 170, h: 300 },
                // 4th Object: Tower of the Wind with Ladder 1 (top at y: 80, bottom at 540)
                { x: 1280, y: 80, w: 240, h: 460, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -100)
                { x: 1720, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Rope 2 (bottom at y: -120)
                { x: 2220, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Overhead structure for Rope 3 (bottom at y: -100)
                { x: 2720, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 8th Object: Giant Ground Blocker Pillar (top at y: -20, bottom at 540)
                { x: 3180, y: -20, w: 240, h: 560 },
                // 9th Object: Overhead structure for Turnik 1 (bottom at y: -90)
                { x: 3660, y: -290, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Mid-Air Island Platform (top at y: 80)
                { x: 4180, y: 80, w: 220, h: 60 },
                // 11th Object: Overhead structure for Rope 4 (bottom at y: -120)
                { x: 4680, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 12th Object: Solid intermediate pillar (top at y: 120, bottom at 540)
                { x: 5180, y: 120, w: 220, h: 420 },
                // 13th Object: Step pillar (top at y: 260, bottom at 540)
                { x: 5540, y: 260, w: 180, h: 280 },
                // 14th Object: Monolith wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 5880, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 15th Object: Sky Citadel with Ladder 2 & Flag (top at y: 20)
                { x: 6320, y: 20, w: 380, h: 520 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1300, topY: 80, bottomY: 540, w: 36 },
                // Ladder for 15th Object with Victory Flag
                { x: 6340, topY: 20, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 9th Object (y: -30)
                { id: 'turnik1', x: 3760, y: -30, length: 80, boxBottomY: -90 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1820, anchorY: -100, length: 230 },
                // Rope 2 for 6th Object
                { id: 'rope2', x: 2320, anchorY: -120, length: 230 },
                // Rope 3 for 7th Object
                { id: 'rope3', x: 2820, anchorY: -100, length: 230 },
                // Rope 4 for 11th Object
                { id: 'rope4', x: 4780, anchorY: -120, length: 240 }
            ],
            flag: { x: 6560, y: 20, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        18: {
            id: 18,
            title: "Уровень 18",
            worldWidth: 8000,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 8000, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 440, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle (top at y: 400, bottom at 540)
                { x: 740, y: 400, w: 140, h: 140, isSmall: true },
                // 3rd Object: High step column (top at y: 260, bottom at 540)
                { x: 980, y: 260, w: 160, h: 280 },
                // 4th Object: Ascent Tower with Ladder 1 (top at y: 80, bottom at 540)
                { x: 1260, y: 80, w: 240, h: 460, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -100)
                { x: 1680, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Turnik 1 (bottom at y: -80)
                { x: 2140, y: -280, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Solid Landing Bastion (top at y: 40, bottom at 540)
                { x: 2620, y: 40, w: 240, h: 500 },
                // 8th Object: Overhead structure for Rope 2 (bottom at y: -140)
                { x: 3100, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 9th Object: Overhead structure for Rope 3 (bottom at y: -160)
                { x: 3600, y: -360, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Giant Sky Pillar (top at y: -40, bottom at 540)
                { x: 4120, y: -40, w: 220, h: 580 },
                // 11th Object: Overhead structure for Turnik 2 (bottom at y: -140)
                { x: 4580, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 12th Object: Overhead structure for Turnik 3 (bottom at y: -100)
                { x: 5080, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 13th Object: Solid Mid-Column (top at y: 120, bottom at 540)
                { x: 5560, y: 120, w: 200, h: 420 },
                // 14th Object: Monolith wall with low crawlway (bottom at y: 490, gap 50px)
                { x: 5920, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 15th Object: Overhead structure for Rope 4 (bottom at y: -100)
                { x: 6360, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 16th Object: Acropolis of Victory with Ladder 2 & Flag (top at y: 20)
                { x: 6860, y: 20, w: 380, h: 520 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1280, topY: 80, bottomY: 540, w: 36 },
                // Ladder for 16th Object with Victory Flag
                { x: 6880, topY: 20, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 6th Object (y: -20)
                { id: 'turnik1', x: 2240, y: -20, length: 80, boxBottomY: -80 },
                // Turnik for 11th Object (y: -80)
                { id: 'turnik2', x: 4680, y: -80, length: 80, boxBottomY: -140 },
                // Turnik for 12th Object (y: -40)
                { id: 'turnik3', x: 5180, y: -40, length: 80, boxBottomY: -100 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1780, anchorY: -100, length: 230 },
                // Rope 2 for 8th Object
                { id: 'rope2', x: 3200, anchorY: -140, length: 240 },
                // Rope 3 for 9th Object
                { id: 'rope3', x: 3700, anchorY: -160, length: 240 },
                // Rope 4 for 15th Object
                { id: 'rope4', x: 6460, anchorY: -100, length: 230 }
            ],
            flag: { x: 7100, y: 20, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        19: {
            id: 19,
            title: "Уровень 19",
            worldWidth: 8400,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 8400, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 420, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle (top at y: 410, bottom at 540)
                { x: 720, y: 410, w: 140, h: 130, isSmall: true },
                // 3rd Object: Medium vault box (top at y: 280, bottom at 540)
                { x: 960, y: 280, w: 160, h: 260 },
                // 4th Object: Tower of the Apex with Ladder 1 (top at y: 60, bottom at 540)
                { x: 1220, y: 60, w: 240, h: 480, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -100)
                { x: 1640, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Turnik 1 (bottom at y: -90)
                { x: 2100, y: -290, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Floating Mid-Air Island (top at y: 40)
                { x: 2580, y: 40, w: 240, h: 60 },
                // 8th Object: Overhead structure for Rope 2 (bottom at y: -140)
                { x: 3040, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 9th Object: Overhead structure for Rope 3 (bottom at y: -160)
                { x: 3520, y: -360, w: 200, h: 200, noLedgeGrab: true },
                // 10th Object: Overhead structure for Rope 4 (bottom at y: -140)
                { x: 4000, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 11th Object: Gigantic Monolith Pillar (top at y: -60, bottom at 540)
                { x: 4480, y: -60, w: 240, h: 600 },
                // 12th Object: Overhead structure for Turnik 2 (bottom at y: -140)
                { x: 4960, y: -340, w: 200, h: 200, noLedgeGrab: true },
                // 13th Object: Overhead structure for Turnik 3 (bottom at y: -120)
                { x: 5420, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 14th & 15th Object: Aerial Window opening (gap between y: -80 and y: 40)
                { x: 5900, y: -400, w: 260, h: 320, noLedgeGrab: true },
                { x: 5900, y: 40, w: 260, h: 500, noLedgeGrab: true },
                // 16th Object: Overhead structure for Rope 5 (bottom at y: -120)
                { x: 6400, y: -320, w: 200, h: 200, noLedgeGrab: true },
                // 17th Object: Solid Step-down Pillar (top at y: 140, bottom at 540)
                { x: 6900, y: 140, w: 200, h: 400 },
                // 18th Object: Colossal Monolith with low crawlway (bottom at y: 490, gap 50px)
                { x: 7240, y: -600, w: 240, h: 1090, noLedgeGrab: true },
                // 19th Object: Pantheon of the Universe with Ladder 2 & Flag (top at y: 0)
                { x: 7660, y: 0, w: 400, h: 540 }
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1240, topY: 60, bottomY: 540, w: 36 },
                // Ladder for 19th Object with Victory Flag
                { x: 7680, topY: 0, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 6th Object (y: -30)
                { id: 'turnik1', x: 2200, y: -30, length: 80, boxBottomY: -90 },
                // Turnik for 12th Object (y: -80)
                { id: 'turnik2', x: 5060, y: -80, length: 80, boxBottomY: -140 },
                // Turnik for 13th Object (y: -60)
                { id: 'turnik3', x: 5520, y: -60, length: 80, boxBottomY: -120 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1740, anchorY: -100, length: 230 },
                // Rope 2 for 8th Object
                { id: 'rope2', x: 3140, anchorY: -140, length: 240 },
                // Rope 3 for 9th Object
                { id: 'rope3', x: 3620, anchorY: -160, length: 240 },
                // Rope 4 for 10th Object
                { id: 'rope4', x: 4100, anchorY: -140, length: 240 },
                // Rope 5 for 16th Object
                { id: 'rope5', x: 6500, anchorY: -120, length: 240 }
            ],
            flag: { x: 7900, y: 0, poleHeight: 110, bannerW: 45, bannerH: 30 }
        },
        20: {
            id: 20,
            title: "Уровень 20",
            worldWidth: 16000,
            groundY: 540,
            platforms: [
                { x: 0, y: 540, w: 16000, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Slide tunnel (bottom at y: 490, gap 50px)
                { x: 440, y: -200, w: 200, h: 690, noLedgeGrab: true },
                // 2nd Object: Low hurdle
                { x: 740, y: 400, w: 140, h: 140, isSmall: true },
                // 3rd Object: Stepping pillar
                { x: 980, y: 260, w: 160, h: 280 },
                // 4th Object: Tower of Ascent with Ladder 1 (top at y: 80, bottom at 540)
                { x: 1260, y: 80, w: 240, h: 460, noLedgeGrab: true },
                // 5th Object: Overhead structure for Rope 1 (bottom at y: -100)
                { x: 1680, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 6th Object: Overhead structure for Turnik 1 (bottom at y: -90)
                { x: 2120, y: -290, w: 200, h: 200, noLedgeGrab: true },
                // 7th Object: Solid landing pillar (top at y: 120, bottom at 540)
                { x: 2600, y: 120, w: 220, h: 420 },
                // 8th Object: Overhead structure for Rope 2 (bottom at y: -100)
                { x: 3000, y: -300, w: 200, h: 200, noLedgeGrab: true },
                // 9th Object: Final parkour platform leading forward (top at y: 200, bottom at 540) - NO FLAG!
                { x: 3400, y: 200, w: 350, h: 340 },
                // 10th Object: Stepping ramp descending to runway leading forward
                { x: 3750, y: 360, w: 200, h: 180, isSmall: true }
                // From x: 3950 onwards: Wide continuous platform leads forward ~30m before Boss Fight!
            ],
            ladders: [
                // Ladder for 4th Object
                { x: 1280, topY: 80, bottomY: 540, w: 36 }
            ],
            turniks: [
                // Turnik for 6th Object
                { id: 'turnik1', x: 2220, y: -30, length: 80, boxBottomY: -90 }
            ],
            ropes: [
                // Rope 1 for 5th Object
                { id: 'rope1', x: 1780, anchorY: -100, length: 230 },
                // Rope 2 for 8th Object
                { id: 'rope2', x: 3100, anchorY: -100, length: 230 }
            ],
            flag: null // No flag on last parkour object! Spawns only after Boss is defeated!
        }
    };

    let currentLevelData = levelsData[1];

    function loadLevel(levelNum) {
        currentLevelIndex = levelNum;
        currentLevelData = levelsData[levelNum] || levelsData[1];
    }

    // Generate 20 Level Tiles in Grid
    function generateLevelsGrid() {
        levelsGrid.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const tile = document.createElement('div');
            if (i <= unlockedLevels) {
                tile.className = 'level-tile unlocked';
                tile.textContent = i;
                const levelNum = i;
                tile.addEventListener('click', () => {
                    startLevelWithFade(levelNum);
                });
            } else {
                tile.className = 'level-tile locked';
                tile.innerHTML = `<span>${i}</span><span class="lock-icon">🔒</span>`;
            }
            levelsGrid.appendChild(tile);
        }
    }
    generateLevelsGrid();

    // Smooth Fade Transition Handler
    function triggerFadeTransition(onMidpoint) {
        fadeOverlay.classList.add('active'); // Darken screen to black over 0.4s
        setTimeout(() => {
            onMidpoint();
            setTimeout(() => {
                fadeOverlay.classList.remove('active'); // Fade back in to reveal gameplay
            }, 50);
        }, 400);
    }

    function startLevelWithFade(levelNum) {
        initAudio();
        loadLevel(levelNum);
        triggerFadeTransition(() => {
            levelSelectScreen.classList.remove('screen-active');
            levelSelectScreen.classList.add('hidden');
            hudOverlay.classList.remove('hidden');

            player.reset();
            currentState = STATES.PLAYING;
        });
    }

    // --- COSMIC SPACE SYSTEM (MENU & LEVEL SELECT) ---
    const stars = [];
    const starColors = ['#ffffff', '#a7f3d0', '#bfdbfe', '#e9d5ff', '#fef08a', '#38bdf8'];
    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random() * 2600,
            y: Math.random() * 675,
            radius: Math.random() * 1.8 + 0.4,
            alpha: Math.random(),
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            color: starColors[Math.floor(Math.random() * starColors.length)]
        });
    }

    const nebulae = [
        { x: 400, y: 180, r: 420, color: 'rgba(124, 58, 237, 0.18)' },
        { x: 1200, y: 140, r: 480, color: 'rgba(6, 182, 212, 0.15)' },
        { x: 1900, y: 240, r: 380, color: 'rgba(236, 72, 153, 0.15)' }
    ];

    let shootingStar = null;
    function updateShootingStar() {
        if (!shootingStar && Math.random() < 0.008) {
            shootingStar = {
                x: Math.random() * 2200,
                y: Math.random() * 250,
                len: 90 + Math.random() * 70,
                speed: 14 + Math.random() * 8,
                vx: 10 + Math.random() * 4,
                vy: 5 + Math.random() * 2,
                alpha: 1
            };
        }

        if (shootingStar) {
            shootingStar.x += shootingStar.speed;
            shootingStar.y += shootingStar.speed * 0.4;
            shootingStar.alpha -= 0.02;
            if (shootingStar.alpha <= 0) shootingStar = null;
        }
    }

    // Particle System
    let particles = [];
    function spawnConfetti(x, y) {
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#38bdf8'];
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 9;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.01 + Math.random() * 0.015,
                rotation: Math.random() * 6.28,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }

    function spawnDust(x, y) {
        for (let i = 0; i < 6; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 15,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 1.5,
                size: 3 + Math.random() * 4,
                color: 'rgba(192, 132, 252, 0.4)',
                life: 1,
                decay: 0.04
            });
        }
    }

    function spawnAirPushEffect(x, y, facing, direction = 'vertical') {
        const isVert = direction === 'vertical';
        const ringY = isVert ? y - 15 : y - 35;
        const ringX = isVert ? x : x - facing * 12;

        // 1. Dual expanding shockwave rings
        particles.push({
            type: 'shockwave',
            x: ringX,
            y: ringY,
            vx: 0,
            vy: 0,
            radius: 12,
            expandSpeed: 5.5,
            lineWidth: 4.5,
            color: '#38bdf8',
            life: 1,
            decay: 0.045
        });
        particles.push({
            type: 'shockwave',
            x: ringX,
            y: ringY,
            vx: 0,
            vy: 0,
            radius: 6,
            expandSpeed: 3.5,
            lineWidth: 3.0,
            color: '#ffffff',
            life: 1,
            decay: 0.05
        });

        // 2. Wind gust particles (Downwards for vertical jump, Backwards for horizontal dash)
        const colors = ['#38bdf8', '#06b6d4', '#e0f2fe', '#ffffff', '#a855f7'];
        for (let i = 0; i < 28; i++) {
            let pVx, pVy;
            if (isVert) {
                // Downward blast for upward double jump
                pVx = (Math.random() - 0.5) * 8;
                pVy = 4 + Math.random() * 8;
            } else {
                // Backward blast for forward dash
                const angle = (facing > 0 ? Math.PI : 0) + (Math.random() - 0.5) * 1.3;
                const speed = 4 + Math.random() * 10;
                pVx = Math.cos(angle) * speed;
                pVy = Math.sin(angle) * speed * 0.6;
            }

            particles.push({
                x: ringX + (Math.random() - 0.5) * 16,
                y: ringY + (Math.random() - 0.5) * 16,
                vx: pVx,
                vy: pVy,
                size: 3.5 + Math.random() * 5.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.03 + Math.random() * 0.035
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.type === 'shockwave') {
                p.radius += p.expandSpeed;
            } else {
                p.vy += 0.15;
            }
            p.life -= p.decay;
            if (p.rotation !== undefined) p.rotation += p.rotSpeed;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        const scale = canvas.height / 675;
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            const drawX = (p.x - cameraX) * scale;
            const drawY = (p.y - cameraY) * scale;
            ctx.translate(drawX, drawY);

            if (p.type === 'shockwave') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = (p.lineWidth || 3) * scale;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius * scale, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                if (p.rotation !== undefined) ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size * scale / 2, -p.size * scale / 2, p.size * scale, p.size * scale);
            }
            ctx.restore();
        });
    }

    // --- BOSS FIGHT SYSTEM (LEVEL 20) ---
    let screenShake = 0;
    let cutsceneTimeoutId = null;
    let victoryFadeInterval = null;

    const boss = {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0,
        health: 5,
        maxHealth: 5,
        state: 'INACTIVE', // 'INTRO', 'HOVER', 'SPIKES_TELEGRAPH', 'SPIKES_ATTACK', 'BOULDER_WINDUP', 'BOULDER_ATTACK', 'SLAM_WINDUP', 'SLAM_IMPACT', 'SLAM_RECOVER', 'DEFEATED'
        timer: 0,
        attackIndex: 0,
        attackList: ['SPIKES', 'BOULDER', 'SLAM', 'SPIKES', 'BOULDER'],
        spikes: [],
        boulders: [],
        chasms: [],
        debris: []
    };

    function resetBoss() {
        if (cutsceneTimeoutId) {
            clearTimeout(cutsceneTimeoutId);
            cutsceneTimeoutId = null;
        }
        if (victoryFadeInterval) {
            clearInterval(victoryFadeInterval);
            victoryFadeInterval = null;
        }
        boss.active = false;
        boss.x = 0;
        boss.y = 0;
        boss.vx = 0;
        boss.vy = 0;
        boss.targetX = 0;
        boss.targetY = 0;
        boss.health = 5;
        boss.maxHealth = 5;
        boss.state = 'INACTIVE';
        boss.timer = 0;
        boss.attackIndex = 0;
        boss.spikes = [];
        boss.boulders = [];
        boss.chasms = [];
        boss.debris = [];
        screenShake = 0;

        if (currentLevelIndex === 20) {
            currentLevelData.flag = null;
        }
        if (bossHud) {
            bossHud.classList.add('hidden');
        }
    }

    function startBossFight() {
        if (boss.active) return;
        boss.active = true;
        boss.x = player.x + 650;
        boss.y = currentLevelData.groundY - 320;
        boss.targetX = player.x + 360;
        boss.targetY = currentLevelData.groundY - 140;
        boss.vx = 0;
        boss.vy = 0;
        boss.health = 5;
        boss.maxHealth = 5;
        boss.state = 'INTRO';
        boss.timer = 0;
        boss.attackIndex = 0;
        boss.spikes = [];
        boss.boulders = [];
        boss.chasms = [];
        boss.debris = [];

        player.isBossMode = true;
        player.facing = 1;

        if (bossHud) {
            bossHud.classList.remove('hidden');
        }
        if (bossHealthBar) {
            bossHealthBar.style.width = '100%';
        }
        if (bossPhaseText) {
            bossPhaseText.textContent = 'БОСС: 5 / 5';
        }

        playSound('warning');
    }

    function triggerDefeat() {
        if (player.state === 'DEFEAT' || player.state === 'VICTORY' || player.state === 'VICTORY_IDLE' || currentState === STATES.CUTSCENE) return;
        player.state = 'DEFEAT';
        player.staggerTimer = 0;
        player.staggerAngle = 0;
        player.vx = 0;

        // Immediately abort any pending victory cutscene!
        if (cutsceneTimeoutId) {
            clearTimeout(cutsceneTimeoutId);
            cutsceneTimeoutId = null;
        }
        if (victoryFadeInterval) {
            clearInterval(victoryFadeInterval);
            victoryFadeInterval = null;
        }
        cutscene.active = false;
        cutscene.whiteAlpha = 0;
        if (fadeOverlay) {
            fadeOverlay.classList.remove('active');
        }

        playSound('defeat');
        spawnDust(player.x, player.y);
    }

    function isOverChasm(x) {
        if (!boss.chasms || boss.chasms.length === 0) return false;
        for (const c of boss.chasms) {
            if (x > c.startX + 6 && x < c.endX - 6) return true;
        }
        return false;
    }

    function updateBoss() {
        if (currentLevelIndex === 20 && !boss.active && player.x >= 5200 && player.state !== 'DEFEAT') {
            startBossFight();
        }

        if (!boss.active) return;

        // If player is defeated, the robot does NOT continue attacking or taking damage!
        if (player.state === 'DEFEAT') {
            if (cutsceneTimeoutId) {
                clearTimeout(cutsceneTimeoutId);
                cutsceneTimeoutId = null;
            }
            if (victoryFadeInterval) {
                clearInterval(victoryFadeInterval);
                victoryFadeInterval = null;
            }
            cutscene.active = false;
            cutscene.whiteAlpha = 0;
            // Robot hovers in place over defeated player
            boss.targetY = currentLevelData.groundY - 160;
            boss.y += (boss.targetY - boss.y) * 0.05;
            return;
        }

        boss.timer += 0.016;

        // Screen shake decay
        if (screenShake > 0) {
            screenShake *= 0.88;
            if (screenShake < 0.2) screenShake = 0;
        }

        // Update debris particles
        for (let i = boss.debris.length - 1; i >= 0; i--) {
            const deb = boss.debris[i];
            deb.x += deb.vx;
            deb.y += deb.vy;
            deb.vy += 0.55;
            deb.rot += deb.rotSpeed;
            deb.life -= deb.decay;
            if (deb.life <= 0) boss.debris.splice(i, 1);
        }

        // Update active boulders
        for (let i = boss.boulders.length - 1; i >= 0; i--) {
            const bld = boss.boulders[i];
            bld.x += bld.vx;
            bld.rotation += 0.15;

            // Collision check:
            // Boulder flying at chest/head level.
            if (Math.abs(bld.x - player.x) < (bld.radius + 14)) {
                // If player is crouching or rolling, player height is 38 (ducking under boulder!)
                if (player.isCrouching || player.state === 'ROLL') {
                    // Dodged safely!
                } else {
                    // Standing or jumping -> Hit!
                    triggerDefeat();
                    boss.boulders.splice(i, 1);
                    continue;
                }
            }

            // Despawn if far behind player
            if (bld.x < player.x - 300) {
                boss.boulders.splice(i, 1);
            }
        }

        // Update spikes
        for (let i = boss.spikes.length - 1; i >= 0; i--) {
            const spk = boss.spikes[i];
            if (!spk.active) {
                spk.telegraphTimer -= 0.016;
                if (spk.telegraphTimer <= 0) {
                    spk.active = true;
                    playSound('warning');
                }
            } else {
                spk.activeTimer -= 0.016;
                // Collision check while spikes are thrust up
                if (player.x + 12 > spk.x && player.x - 12 < spk.x + spk.w) {
                    if (player.y >= currentLevelData.groundY - 30) {
                        triggerDefeat();
                    }
                }
                if (spk.activeTimer <= 0) {
                    boss.spikes.splice(i, 1);
                }
            }
        }

        // Boss State Machine
        if (boss.state === 'DEFEATED') {
            boss.vy += 0.35;
            boss.y += boss.vy;
            boss.x += boss.vx;
            if (boss.y >= currentLevelData.groundY - 20) {
                boss.y = currentLevelData.groundY - 20;
                boss.vy = 0;
            }
            return;
        }

        if (boss.state === 'INTRO') {
            boss.targetX = player.x + 360;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.05;
            boss.y += (boss.targetY - boss.y) * 0.05;

            if (boss.timer >= 1.5) {
                boss.state = 'HOVER';
                boss.timer = 0;
            }
            return;
        }

        if (boss.state === 'HOVER') {
            boss.targetX = player.x + 360;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.08;
            boss.y += (boss.targetY - boss.y) * 0.08;

            if (boss.timer >= 1.2) {
                const nextAttack = boss.attackList[boss.attackIndex % boss.attackList.length];
                boss.timer = 0;

                if (nextAttack === 'SPIKES') {
                    boss.state = 'SPIKES_TELEGRAPH';
                    boss.spikes.push({
                        x: player.x + 240,
                        w: 160,
                        telegraphTimer: 0.5,
                        activeTimer: 0.7,
                        active: false
                    });
                    playSound('warning');
                } else if (nextAttack === 'BOULDER') {
                    boss.state = 'BOULDER_WINDUP';
                } else if (nextAttack === 'SLAM') {
                    boss.state = 'SLAM_WINDUP';
                    playSound('airBoost');
                }
            }
            return;
        }

        // Attack 1: Spikes
        if (boss.state === 'SPIKES_TELEGRAPH') {
            boss.targetX = player.x + 360;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.08;
            boss.y += (boss.targetY - boss.y) * 0.08;

            if (boss.timer >= 0.5) {
                boss.state = 'SPIKES_ATTACK';
                boss.timer = 0;
            }
            return;
        }

        if (boss.state === 'SPIKES_ATTACK') {
            boss.targetX = player.x + 360;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.08;
            boss.y += (boss.targetY - boss.y) * 0.08;

            if (boss.timer >= 0.8) {
                onAttackFinished();
            }
            return;
        }

        // Attack 2: Boulder
        if (boss.state === 'BOULDER_WINDUP') {
            boss.targetX = player.x + 380;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.08;
            boss.y += (boss.targetY - boss.y) * 0.08;

            if (boss.timer >= 0.7) {
                boss.state = 'BOULDER_ATTACK';
                boss.timer = 0;
                boss.boulders.push({
                    x: boss.x - 30,
                    y: currentLevelData.groundY - 65, // flying at chest height
                    vx: -13.0,
                    radius: 24,
                    rotation: 0
                });
                playSound('climb');
            }
            return;
        }

        if (boss.state === 'BOULDER_ATTACK') {
            boss.targetX = player.x + 360;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.08;
            boss.y += (boss.targetY - boss.y) * 0.08;

            if (boss.timer >= 1.2) {
                onAttackFinished();
            }
            return;
        }

        // Attack 3: Ground Slam
        if (boss.state === 'SLAM_WINDUP') {
            // Windup lasting 1.0 second
            boss.targetX = player.x + 280;
            boss.targetY = currentLevelData.groundY - 260;
            boss.x += (boss.targetX - boss.x) * 0.1;
            boss.y += (boss.targetY - boss.y) * 0.1;

            if (boss.timer >= 1.0) {
                boss.state = 'SLAM_IMPACT';
                boss.timer = 0;
                boss.vy = 28;
            }
            return;
        }

        if (boss.state === 'SLAM_IMPACT') {
            boss.y += boss.vy;
            if (boss.y >= currentLevelData.groundY - 25) {
                boss.y = currentLevelData.groundY - 25;
                boss.state = 'SLAM_RECOVER';
                boss.timer = 0;
                boss.vy = -6;
                screenShake = 18;
                playSound('slam');

                // Cosmetic flying earth debris
                for (let d = 0; d < 32; d++) {
                    const angle = -Math.PI * (0.15 + Math.random() * 0.7);
                    const spd = 4 + Math.random() * 11;
                    boss.debris.push({
                        x: boss.x + (Math.random() - 0.5) * 30,
                        y: currentLevelData.groundY - 8,
                        vx: Math.cos(angle) * spd,
                        vy: Math.sin(angle) * spd,
                        size: 4 + Math.random() * 7,
                        rot: Math.random() * 6.28,
                        rotSpeed: (Math.random() - 0.5) * 0.3,
                        color: Math.random() < 0.5 ? '#64748b' : '#334155',
                        life: 1,
                        decay: 0.02 + Math.random() * 0.02
                    });
                }

                // 5m chasm (approx 210px) created ~5m (200px) in front of player
                const chasmStart = player.x + 190;
                const chasmEnd = chasmStart + 210;
                boss.chasms.push({ startX: chasmStart, endX: chasmEnd });
            }
            return;
        }

        if (boss.state === 'SLAM_RECOVER') {
            boss.targetX = player.x + 360;
            boss.targetY = currentLevelData.groundY - 140;
            boss.x += (boss.targetX - boss.x) * 0.06;
            boss.y += (boss.targetY - boss.y) * 0.06;

            if (boss.timer >= 1.2) {
                onAttackFinished();
            }
            return;
        }

        function onAttackFinished() {
            if (player.state === 'DEFEAT') {
                boss.state = 'HOVER';
                boss.timer = 0;
                return;
            }

            boss.attackIndex++;
            boss.health--;

            if (bossHealthBar) {
                bossHealthBar.style.width = Math.max(0, (boss.health / boss.maxHealth) * 100) + '%';
            }
            if (bossPhaseText) {
                bossPhaseText.textContent = `БОСС: ${Math.max(0, boss.health)} / ${boss.maxHealth}`;
            }

            if (boss.health <= 0) {
                if (player.state === 'DEFEAT') return;

                boss.state = 'DEFEATED';
                boss.vx = 2;
                boss.vy = -4;
                playSound('victory');
                spawnConfetti(boss.x, boss.y);

                player.isBossMode = false;
                player.vx = 0;

                // Clear any lingering boss hazards
                boss.boulders = [];
                boss.spikes = [];
                boss.debris = [];

                if (bossHud) {
                    bossHud.classList.add('hidden');
                }
                if (ledgeHint) {
                    ledgeHint.classList.add('hidden');
                }

                // Darken screen, then after 2 seconds start the ending cutscene!
                fadeOverlay.classList.add('active');
                if (cutsceneTimeoutId) clearTimeout(cutsceneTimeoutId);
                cutsceneTimeoutId = setTimeout(() => {
                    if (player.state !== 'DEFEAT') {
                        startEndCutscene();
                    }
                }, 2000);
            } else {
                boss.state = 'HOVER';
                boss.timer = 0;
            }
        }
    }

    function drawBossRobot() {
        if (!boss.active) return;
        const scale = canvas.height / 675;
        const bX = (boss.x - cameraX) * scale;
        const bY = (boss.y - cameraY) * scale;

        ctx.save();
        ctx.translate(bX, bY);

        const hoverOffset = Math.sin(Date.now() * 0.008) * 4 * scale;
        ctx.translate(0, hoverOffset);
        ctx.rotate(boss.vx * 0.02);

        // Thruster flame
        const flameLen = (12 + Math.sin(Date.now() * 0.03) * 6) * scale;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-18 * scale, 12 * scale);
        ctx.lineTo(-12 * scale, 12 * scale + flameLen);
        ctx.lineTo(-6 * scale, 12 * scale);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(6 * scale, 12 * scale);
        ctx.lineTo(12 * scale, 12 * scale + flameLen);
        ctx.lineTo(18 * scale, 12 * scale);
        ctx.fill();

        // Spherical drone body
        const bodyR = 24 * scale;
        const bodyGrad = ctx.createRadialGradient(-6 * scale, -6 * scale, 2 * scale, 0, 0, bodyR);
        bodyGrad.addColorStop(0, '#475569');
        bodyGrad.addColorStop(0.7, '#1e293b');
        bodyGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = (boss.state.includes('WINDUP') || boss.state.includes('TELEGRAPH')) ? '#ef4444' : '#06b6d4';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        // Glowing optic sensor
        const eyeColor = (boss.state.includes('WINDUP') || boss.state.includes('TELEGRAPH')) ? '#ef4444' : '#38bdf8';
        ctx.fillStyle = eyeColor;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 15 * scale;
        ctx.beginPath();
        ctx.arc(-4 * scale, -2 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5 * scale, -3 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Antenna
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(0, -bodyR);
        ctx.lineTo(0, -bodyR - 10 * scale);
        ctx.stroke();

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(0, -bodyR - 11 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Side thruster pods
        ctx.fillStyle = '#334155';
        ctx.fillRect(-22 * scale, 2 * scale, 8 * scale, 12 * scale);
        ctx.fillRect(14 * scale, 2 * scale, 8 * scale, 12 * scale);

        // Boulder in tractor beam
        if (boss.state === 'BOULDER_WINDUP') {
            const bldR = 24 * scale;
            const bldY = -48 * scale;
            const bldGrad = ctx.createRadialGradient(-6 * scale, bldY - 6 * scale, 3 * scale, 0, bldY, bldR);
            bldGrad.addColorStop(0, '#78716c');
            bldGrad.addColorStop(0.8, '#44403c');
            bldGrad.addColorStop(1, '#1c1917');
            ctx.fillStyle = bldGrad;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5 * scale;
            ctx.beginPath();
            ctx.arc(0, bldY, bldR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.ellipse(0, -26 * scale, 14 * scale, 5 * scale, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Slam charging ring
        if (boss.state === 'SLAM_WINDUP') {
            const slamChargeRatio = Math.min(1, boss.timer / 1.0);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + slamChargeRatio * 0.6})`;
            ctx.lineWidth = 4 * scale;
            ctx.beginPath();
            ctx.arc(0, 0, (bodyR + 8 * scale + Math.sin(Date.now() * 0.05) * 4 * scale), 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawBossHazards() {
        if (!boss.active) return;
        const scale = canvas.height / 675;

        // Draw Chasms (Пропасти в земле)
        boss.chasms.forEach(c => {
            const cX = (c.startX - cameraX) * scale;
            const cW = (c.endX - c.startX) * scale;
            const cY = (currentLevelData.groundY - cameraY) * scale;
            const cH = 220 * scale;

            // Deep void pit
            const pitGrad = ctx.createLinearGradient(0, cY, 0, cY + cH);
            pitGrad.addColorStop(0, '#030712');
            pitGrad.addColorStop(0.3, '#000000');
            pitGrad.addColorStop(1, '#050505');
            ctx.fillStyle = pitGrad;
            ctx.fillRect(cX, cY, cW, cH);

            // Red hazard warning glow at depth
            const glowGrad = ctx.createLinearGradient(0, cY + cH * 0.4, 0, cY + cH);
            glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
            glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(cX, cY + cH * 0.4, cW, cH * 0.6);

            // Left & right jagged rock walls
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 3 * scale;
            ctx.beginPath();
            ctx.moveTo(cX, cY);
            ctx.lineTo(cX + 6 * scale, cY + 30 * scale);
            ctx.lineTo(cX, cY + 70 * scale);
            ctx.lineTo(cX + 5 * scale, cY + 120 * scale);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cX + cW, cY);
            ctx.lineTo(cX + cW - 6 * scale, cY + 30 * scale);
            ctx.lineTo(cX + cW, cY + 70 * scale);
            ctx.lineTo(cX + cW - 5 * scale, cY + 120 * scale);
            ctx.stroke();

            // Hazard warning markers at the rim
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(cX - 4 * scale, cY, 6 * scale, 4 * scale);
            ctx.fillRect(cX + cW - 2 * scale, cY, 6 * scale, 4 * scale);
        });

        // Draw Spikes
        boss.spikes.forEach(spk => {
            const spkX = (spk.x - cameraX) * scale;
            const spkW = spk.w * scale;
            const spkY = (currentLevelData.groundY - cameraY) * scale;

            if (!spk.active) {
                const pulse = Math.abs(Math.sin(Date.now() * 0.02));
                ctx.fillStyle = `rgba(239, 68, 68, ${0.25 + pulse * 0.3})`;
                ctx.fillRect(spkX, spkY - 6 * scale, spkW, 10 * scale);

                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2 * scale;
                ctx.strokeRect(spkX, spkY - 6 * scale, spkW, 10 * scale);

                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${12 * scale}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('⚠️ ОПАСНОСТЬ: ШИПЫ', spkX + spkW / 2, spkY - 14 * scale);
                ctx.textAlign = 'start';
            } else {
                const spikeCount = 6;
                const spikeW = spkW / spikeCount;
                const spikeH = 46 * scale;

                for (let s = 0; s < spikeCount; s++) {
                    const sx = spkX + s * spikeW;
                    const grad = ctx.createLinearGradient(sx, spkY, sx + spikeW, spkY - spikeH);
                    grad.addColorStop(0, '#991b1b');
                    grad.addColorStop(0.6, '#ef4444');
                    grad.addColorStop(1, '#fef08a');
                    ctx.fillStyle = grad;

                    ctx.beginPath();
                    ctx.moveTo(sx, spkY);
                    ctx.lineTo(sx + spikeW / 2, spkY - spikeH);
                    ctx.lineTo(sx + spikeW, spkY);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5 * scale;
                    ctx.beginPath();
                    ctx.moveTo(sx + spikeW / 2, spkY - spikeH);
                    ctx.lineTo(sx + spikeW / 2, spkY);
                    ctx.stroke();
                }
            }
        });

        // Draw Boulders
        boss.boulders.forEach(bld => {
            const bldX = (bld.x - cameraX) * scale;
            const bldY = (bld.y - cameraY) * scale;
            const bldR = bld.radius * scale;

            ctx.save();
            ctx.translate(bldX, bldY);
            ctx.rotate(bld.rotation);

            const bldGrad = ctx.createRadialGradient(-bldR * 0.3, -bldR * 0.3, bldR * 0.1, 0, 0, bldR);
            bldGrad.addColorStop(0, '#a8a29e');
            bldGrad.addColorStop(0.5, '#57534e');
            bldGrad.addColorStop(1, '#1c1917');
            ctx.fillStyle = bldGrad;
            ctx.beginPath();
            ctx.arc(0, 0, bldR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(-bldR * 0.5, -bldR * 0.3);
            ctx.lineTo(0, bldR * 0.2);
            ctx.lineTo(bldR * 0.5, -bldR * 0.4);
            ctx.stroke();

            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 3 * scale;
            ctx.beginPath();
            ctx.arc(0, 0, bldR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        });

        // Draw Debris Particles
        boss.debris.forEach(deb => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, deb.life);
            const debX = (deb.x - cameraX) * scale;
            const debY = (deb.y - cameraY) * scale;
            ctx.translate(debX, debY);
            ctx.rotate(deb.rot);
            ctx.fillStyle = deb.color;
            ctx.fillRect(-deb.size * scale / 2, -deb.size * scale / 2, deb.size * scale, deb.size * scale);
            ctx.restore();
        });
    }

    // --- LEVEL 20 END CUTSCENE SYSTEM ---
    const cutscene = {
        active: false,
        phase: 'RUN', // 'RUN' -> 'REACH_DOOR' -> 'OPEN_DOOR' -> 'WHITE_BURST'
        timer: 0,
        doorX: 7420,
        doorY: 540,
        doorWidth: 68,
        doorHeight: 114,
        doorOpenProgress: 0,
        whiteAlpha: 0,
        beams: []
    };

    function startEndCutscene() {
        if (player.state === 'DEFEAT' || currentState === STATES.DEFEAT) return;
        currentState = STATES.CUTSCENE;
        cutscene.active = true;
        cutscene.phase = 'RUN';
        cutscene.timer = 0;
        cutscene.doorOpenProgress = 0;
        cutscene.whiteAlpha = 0;

        if (hudOverlay) hudOverlay.classList.add('hidden');
        if (bossHud) bossHud.classList.add('hidden');
        if (ledgeHint) ledgeHint.classList.add('hidden');

        // Position player running forward toward the door
        player.x = 7050;
        player.y = currentLevelData.groundY;
        player.vx = 4.5;
        player.vy = 0;
        player.facing = 1;
        player.grounded = true;
        player.state = 'RUN';
        player.isBossMode = false;
        player.isCrouching = false;
        player.height = 76;

        cameraX = player.x - 300;
        cameraY = 0;

        // Generate radiating beams
        cutscene.beams = [];
        for (let i = 0; i < 14; i++) {
            cutscene.beams.push({
                angle: -Math.PI * 0.42 + (i / 13) * Math.PI * 0.84,
                len: 260 + Math.random() * 140,
                width: 14 + Math.random() * 16,
                alpha: 0.35 + Math.random() * 0.35,
                driftSpeed: (Math.random() - 0.5) * 0.015
            });
        }

        // Reveal world from black
        fadeOverlay.classList.remove('active');
    }

    function updateCutscene() {
        cutscene.timer += 0.016;

        if (cutscene.phase === 'RUN') {
            player.animTime += 0.16;
            player.vx = 4.5;
            player.x += player.vx;
            player.facing = 1;
            player.grounded = true;
            player.state = 'RUN';

            if (Math.random() < 0.25) {
                spawnDust(player.x - 10, player.y);
            }

            const targetCamX = player.x - 320;
            cameraX += (targetCamX - cameraX) * 0.1;

            if (player.x >= cutscene.doorX - 60) {
                player.x = cutscene.doorX - 60;
                player.vx = 0;
                player.state = 'CUTSCENE_REACH';
                cutscene.phase = 'REACH_DOOR';
                cutscene.timer = 0;
            }
        } else if (cutscene.phase === 'REACH_DOOR') {
            player.vx = 0;
            player.state = 'CUTSCENE_REACH';

            const targetCamX = cutscene.doorX - 420;
            cameraX += (targetCamX - cameraX) * 0.08;

            if (cutscene.timer >= 0.8) {
                playSound('doorOpen');
                cutscene.phase = 'OPEN_DOOR';
                cutscene.timer = 0;
            }
        } else if (cutscene.phase === 'OPEN_DOOR') {
            player.vx = 0;
            player.state = 'CUTSCENE_REACH';
            cutscene.doorOpenProgress = Math.min(1, cutscene.timer / 1.5);

            if (Math.random() < 0.6) {
                particles.push({
                    x: cutscene.doorX - 4 + (Math.random() - 0.5) * 10,
                    y: cutscene.doorY - 55 + (Math.random() - 0.5) * 70,
                    vx: -(2.5 + Math.random() * 4),
                    vy: (Math.random() - 0.5) * 2.5,
                    size: 3 + Math.random() * 5,
                    color: Math.random() < 0.3 ? '#bae6fd' : '#ffffff',
                    life: 0.85,
                    decay: 0.025
                });
            }

            if (cutscene.timer >= 1.6) {
                playSound('whiteLight');
                cutscene.phase = 'WHITE_BURST';
                cutscene.timer = 0;
            }
        } else if (cutscene.phase === 'WHITE_BURST') {
            player.vx = 0;
            cutscene.whiteAlpha = Math.min(1, cutscene.timer / 1.2);

            if (cutscene.timer >= 1.6) {
                cutscene.active = false;
                showLevel20Victory();
            }
        }
    }

    function showLevel20Victory() {
        if (player.state === 'DEFEAT' || currentState === STATES.DEFEAT) return;
        currentState = STATES.VICTORY;
        player.state = 'VICTORY_IDLE';

        if (victoryTitle) victoryTitle.textContent = "Страница 1 завершена!";
        if (victorySubtext) victorySubtext.textContent = "Вы прошли 1 страницу! Вас будут ждать новые приключения позже!";

        if (btnNextLevel) btnNextLevel.classList.add('hidden');
        if (btnReplay) btnReplay.innerHTML = '<span class="btn-icon">🔄</span> Заново';
        if (btnToMenu) btnToMenu.innerHTML = '<span class="btn-icon">📋</span> В меню уровней';

        if (hudOverlay) hudOverlay.classList.add('hidden');
        if (bossHud) bossHud.classList.add('hidden');
        if (ledgeHint) ledgeHint.classList.add('hidden');

        if (victoryFadeInterval) {
            clearInterval(victoryFadeInterval);
            victoryFadeInterval = null;
        }

        // Screen is brightened white (cutscene.whiteAlpha = 1).
        // On level 20 victory, render() draws a pure black screen underneath.
        // Fading cutscene.whiteAlpha down smoothly turns the white screen into pure black.
        // Once faded to black, display the victory menu while keeping location and stickman hidden.
        victoryFadeInterval = setInterval(() => {
            cutscene.whiteAlpha -= 0.035;
            if (cutscene.whiteAlpha <= 0) {
                cutscene.whiteAlpha = 0;
                clearInterval(victoryFadeInterval);
                victoryFadeInterval = null;

                victoryScreen.classList.remove('hidden');
                victoryScreen.classList.add('screen-active');
            }
        }, 16);
    }

    function drawCutsceneDoor() {
        if (!cutscene.active && currentState !== STATES.CUTSCENE && cutscene.whiteAlpha <= 0) return;
        const scale = canvas.height / 675;

        const dX = (cutscene.doorX - cameraX) * scale;
        const dY = (cutscene.doorY - cameraY) * scale;
        const dW = cutscene.doorWidth * scale;
        const dH = cutscene.doorHeight * scale;

        ctx.save();

        // 1. Blinding celestial white glow behind the opening door
        if (cutscene.doorOpenProgress > 0) {
            const openGap = dW * cutscene.doorOpenProgress * 0.9;
            const openCenterX = dX;
            const openCenterY = dY - dH * 0.5;

            // Intense radial white aura
            const auraR = (120 + cutscene.doorOpenProgress * 140) * scale;
            const auraGrad = ctx.createRadialGradient(openCenterX, openCenterY, 5 * scale, openCenterX, openCenterY, auraR);
            auraGrad.addColorStop(0, '#ffffff');
            auraGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.96)');
            auraGrad.addColorStop(0.65, 'rgba(224, 242, 254, 0.7)');
            auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(openCenterX, openCenterY, auraR, 0, Math.PI * 2);
            ctx.fill();

            // Volumetric radiating light beams
            cutscene.beams.forEach(b => {
                b.angle += b.driftSpeed;
                const bLen = b.len * scale * (0.8 + cutscene.doorOpenProgress * 0.5);

                const rayGrad = ctx.createLinearGradient(openCenterX, openCenterY, openCenterX - Math.cos(b.angle) * bLen, openCenterY + Math.sin(b.angle) * bLen);
                rayGrad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * cutscene.doorOpenProgress})`);
                rayGrad.addColorStop(0.6, `rgba(224, 242, 254, ${b.alpha * 0.5 * cutscene.doorOpenProgress})`);
                rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = rayGrad;
                ctx.beginPath();
                ctx.moveTo(openCenterX, openCenterY);
                ctx.lineTo(openCenterX - Math.cos(b.angle - 0.08) * bLen, openCenterY + Math.sin(b.angle - 0.08) * bLen);
                ctx.lineTo(openCenterX - Math.cos(b.angle + 0.08) * bLen, openCenterY + Math.sin(b.angle + 0.08) * bLen);
                ctx.closePath();
                ctx.fill();
            });

            // Pure white core inside doorway opening
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(dX - openGap / 2, dY - dH, openGap, dH);
        }

        // 2. Door Frame (Archway)
        const frameW = dW + 28 * scale;
        const frameH = dH + 20 * scale;
        const frameLeft = dX - frameW / 2;
        const frameTop = dY - frameH;

        // Outer Metallic Frame
        const frameGrad = ctx.createLinearGradient(frameLeft, frameTop, frameLeft + frameW, frameTop + frameH);
        frameGrad.addColorStop(0, '#334155');
        frameGrad.addColorStop(0.5, '#1e293b');
        frameGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = frameGrad;
        ctx.fillRect(frameLeft, frameTop, frameW, frameH);

        // Frame Border Glow
        ctx.strokeStyle = cutscene.doorOpenProgress > 0 ? '#38bdf8' : '#64748b';
        ctx.lineWidth = 3.5 * scale;
        ctx.strokeRect(frameLeft, frameTop, frameW, frameH);

        // Archway Apex Emblem
        ctx.fillStyle = cutscene.doorOpenProgress > 0 ? '#38bdf8' : '#ef4444';
        ctx.shadowColor = cutscene.doorOpenProgress > 0 ? '#38bdf8' : '#ef4444';
        ctx.shadowBlur = 12 * scale;
        ctx.beginPath();
        ctx.arc(dX, frameTop + 10 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 3. Sliding Door Panels
        const panelW = (dW / 2);
        const openSlide = panelW * cutscene.doorOpenProgress;

        // Left Panel
        const leftPanelX = dX - panelW - openSlide;
        const panelGrad = ctx.createLinearGradient(leftPanelX, dY - dH, leftPanelX + panelW, dY);
        panelGrad.addColorStop(0, '#1e293b');
        panelGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = panelGrad;
        ctx.fillRect(leftPanelX, dY - dH, panelW, dH);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(leftPanelX, dY - dH, panelW, dH);

        // Right Panel
        const rightPanelX = dX + openSlide;
        ctx.fillStyle = panelGrad;
        ctx.fillRect(rightPanelX, dY - dH, panelW, dH);
        ctx.strokeRect(rightPanelX, dY - dH, panelW, dH);

        // Door Handles / Futuristic Seams
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(leftPanelX + panelW - 4 * scale, dY - dH * 0.55, 3 * scale, 18 * scale);
        ctx.fillRect(rightPanelX + 1 * scale, dY - dH * 0.55, 3 * scale, 18 * scale);

        ctx.restore();
    }

    // Player Object
    const player = {
        x: 180,
        y: 450,
        vx: 0,
        vy: 0,
        width: 32,
        height: 76,
        facing: 1,
        grounded: false,
        state: 'IDLE',
        isCrouching: false,
        isBossMode: false,
        staggerTimer: 0,
        staggerAngle: 0,

        hangingLedge: null,
        climbProgress: 0,
        climbStartPos: { x: 0, y: 0 },
        climbTargetPos: { x: 0, y: 0 },
        activeLadder: null,
        activeTurnik: null,
        turnikTimer: 0,
        lastTurnikId: null,
        lastTurnikCooldown: 0,
        activeRope: null,
        ropeAngle: 0,
        ropeAngularVel: 0,
        lastRopeId: null,
        lastRopeCooldown: 0,

        canDoubleJump: true,
        turnikBoostTimer: 0,
        airBoostTimer: 0,
        dashTimer: 0,
        dashCooldown: 0,
        rollTimer: 0,
        rollCooldown: 0,

        animTime: 0,
        victoryTimer: 0,
        victoryLandY: null,

        reset() {
            this.x = 180;
            this.y = currentLevelData.groundY;
            this.vx = 0;
            this.vy = 0;
            this.facing = 1;
            this.grounded = true;
            this.state = 'IDLE';
            this.isCrouching = false;
            this.isBossMode = false;
            this.staggerTimer = 0;
            this.staggerAngle = 0;
            this.height = 76;
            this.hangingLedge = null;
            this.climbProgress = 0;
            this.victoryTimer = 0;
            this.victoryLandY = null;
            this.activeLadder = null;
            this.activeTurnik = null;
            this.turnikTimer = 0;
            this.lastTurnikId = null;
            this.lastTurnikCooldown = 0;
            this.activeRope = null;
            this.ropeAngle = 0;
            this.ropeAngularVel = 0;
            this.lastRopeId = null;
            this.lastRopeCooldown = 0;
            this.canDoubleJump = true;
            this.turnikBoostTimer = 0;
            this.airBoostTimer = 0;
            this.dashTimer = 0;
            this.dashCooldown = 0;
            this.rollTimer = 0;
            this.rollCooldown = 0;
            cameraX = 0;
            cameraY = 0;

            resetBoss();
            cutscene.active = false;
            cutscene.phase = 'RUN';
            cutscene.timer = 0;
            cutscene.doorOpenProgress = 0;
            cutscene.whiteAlpha = 0;
            if (fadeOverlay) {
                fadeOverlay.classList.remove('active');
            }
            if (defeatScreen) {
                defeatScreen.classList.remove('screen-active');
                defeatScreen.classList.add('hidden');
            }
            if (bossHud) {
                bossHud.classList.add('hidden');
            }
        }
    };

    function getSolidFloorY(x, y) {
        if (isOverChasm(x)) {
            return 9999;
        }
        let floorY = currentLevelData.groundY;
        if (currentLevelData.boxes) {
            for (const box of currentLevelData.boxes) {
                if (x + 14 > box.x && x - 14 < box.x + box.w) {
                    if (box.y >= y - 15 && box.y < floorY) {
                        floorY = box.y;
                    }
                }
            }
        }
        return floorY;
    }

    // Physics Engine & State Logic
    function updatePlayer() {
        player.animTime += 0.15;
        if (player.lastTurnikCooldown > 0) player.lastTurnikCooldown--;
        if (player.lastRopeCooldown > 0) player.lastRopeCooldown--;
        if (player.turnikBoostTimer > 0) player.turnikBoostTimer--;
        if (player.airBoostTimer > 0) player.airBoostTimer--;
        if (player.dashCooldown > 0) player.dashCooldown--;
        if (player.rollCooldown > 0) player.rollCooldown--;
        if (player.dashTimer > 0) player.dashTimer--;
        if (player.rollTimer > 0) player.rollTimer--;

        // Check boss arena trigger on Level 20
        if (currentLevelIndex === 20 && !boss.active && player.x >= 5200 && player.state !== 'DEFEAT') {
            startBossFight();
        }

        // --- DEFEAT STATE ---
        if (player.state === 'DEFEAT') {
            player.staggerTimer += 0.016;
            if (player.vy < 0 || !player.grounded) {
                player.vy += 0.5;
                player.y += player.vy;
                const landY = getSolidFloorY(player.x, player.y);
                if (player.y >= landY) {
                    player.y = landY;
                    player.vy = 0;
                    player.grounded = true;
                }
            }

            // Phase 1: Stagger / Wobble (0s to 0.55s)
            if (player.staggerTimer < 0.55) {
                player.staggerAngle = Math.sin(player.staggerTimer * 18) * 0.32;
            } else {
                // Phase 2: Collapse flat onto ground
                player.staggerAngle = -Math.PI / 2 * player.facing;
                player.isCrouching = true;
                player.height = 20;
            }

            // Phase 3: Show Defeat Screen after 1.1s
            if (player.staggerTimer > 1.1) {
                if (defeatScreen && !defeatScreen.classList.contains('screen-active')) {
                    defeatScreen.classList.remove('hidden');
                    defeatScreen.classList.add('screen-active');
                }
            }
            return;
        }

        // --- VICTORY STATE ---
        if (player.state === 'VICTORY') {
            player.victoryTimer += 0.016;
            if (player.vy < 0 || !player.grounded) {
                player.vy += 0.4;
                player.y += player.vy;
                const landY = (player.victoryLandY !== null) ? player.victoryLandY : getSolidFloorY(player.x, player.y);
                if (player.y >= landY) {
                    player.y = landY;
                    player.vy = 0;
                    player.grounded = true;
                }
            }

            if (player.victoryTimer > 1.0) {
                if (victoryTitle) victoryTitle.textContent = `${currentLevelData.title} пройден!`;
                if (victorySubtext) victorySubtext.textContent = `Отличный паркур и результаты на Уровне ${currentLevelIndex}!`;

                const nextLevelNum = currentLevelIndex + 1;
                if (levelsData[nextLevelNum]) {
                    btnNextLevel.classList.remove('hidden');
                    btnNextLevel.innerHTML = '<span class="btn-icon">➡️</span> Следующий уровень';
                } else {
                    btnNextLevel.classList.add('hidden');
                }
                if (btnReplay) btnReplay.innerHTML = '<span class="btn-icon">🔄</span> Пройти снова';
                if (btnToMenu) btnToMenu.innerHTML = '<span class="btn-icon">🏠</span> В меню';

                victoryScreen.classList.remove('hidden');
                victoryScreen.classList.add('screen-active');
                player.state = 'VICTORY_IDLE'; // State transition to prevent re-opening modal!
            }
            return;
        }

        if (player.state === 'VICTORY_IDLE') {
            return;
        }

        // --- TURNIK STATE & SWING ANIMATION ---
        if (player.state === 'TURNIK_SWING') {
            player.turnikTimer += 0.016;
            ledgeHint.classList.add('hidden');
            if (player.turnikTimer >= 0.3) {
                player.state = 'JUMP';
                player.vx = 18 * player.facing; // Pure horizontal forward dash
                player.vy = -1;                 // Horizontal dash vector (minimal vertical arc)
                player.turnikBoostTimer = 35;   // Sustained forward impulse (no manual input required)
                player.canDoubleJump = true;    // Reset double jump on turnik launch
                player.grounded = false;
                player.lastTurnikId = player.activeTurnik ? player.activeTurnik.id : null;
                player.lastTurnikCooldown = 45; // Only prevents re-grabbing THIS specific turnik during launch
                player.activeTurnik = null;
                playSound('jump');
                spawnDust(player.x, player.y - 20);
                spawnAirPushEffect(player.x, player.y, player.facing, 'horizontal');
            }
            return;
        }

        if (player.state === 'TURNIK') {
            player.vx = 0;
            player.vy = 0;
            player.canDoubleJump = true;
            ledgeHint.innerHTML = '<span class="hint-key">ПРОБЕЛ</span> Нажмите, чтобы раскачаться и прыгнуть!';
            ledgeHint.classList.remove('hidden');

            if (keys.jumpPressedThisFrame) {
                player.state = 'TURNIK_SWING';
                player.turnikTimer = 0;
                keys.jumpPressedThisFrame = false;
                playSound('climb');
            }
            return;
        }

        // --- ROPE (КАНАТ) STATE & SWING LOGIC ---
        if (player.state === 'ROPE') {
            player.vx = 0;
            player.vy = 0;
            player.canDoubleJump = true;
            ledgeHint.innerHTML = '<span class="hint-key">A / D</span> Раскачиваться &nbsp;&nbsp; <span class="hint-key">ПРОБЕЛ</span> Прыжок / Рывок';
            ledgeHint.classList.remove('hidden');

            const rope = player.activeRope;
            if (!rope) {
                player.state = 'JUMP';
                return;
            }

            // Swing inputs (A / D or Left / Right)
            if (keys.left) {
                player.ropeAngularVel -= 0.007;
                player.facing = -1;
            } else if (keys.right) {
                player.ropeAngularVel += 0.007;
                player.facing = 1;
            }

            // Natural pendulum gravity torque
            const gravityTorque = -0.018 * Math.sin(player.ropeAngle);
            player.ropeAngularVel += gravityTorque;

            // Damping / Air drag
            player.ropeAngularVel *= 0.988;

            // Clamp angular velocity
            player.ropeAngularVel = Math.max(-0.08, Math.min(0.08, player.ropeAngularVel));

            // Update angle
            player.ropeAngle += player.ropeAngularVel;
            player.ropeAngle = Math.max(-1.15, Math.min(1.15, player.ropeAngle));

            // Calculate player grip position
            const ropeLen = rope.length || 220;
            const gripX = rope.x + Math.sin(player.ropeAngle) * ropeLen;
            const gripY = rope.anchorY + Math.cos(player.ropeAngle) * ropeLen;

            player.x = gripX;
            player.y = gripY + 55; // Hang so hands grip the knot

            // Launch / Dash on Space (Пробел)
            if (keys.jumpPressedThisFrame) {
                player.state = 'JUMP';
                const tangentialSpeed = player.ropeAngularVel * ropeLen;
                let launchVx = Math.cos(player.ropeAngle) * tangentialSpeed * 1.5;
                let launchVy = -Math.sin(player.ropeAngle) * tangentialSpeed * 1.5;

                // Ensure strong forward launch impulse in facing direction
                const minForwardSpeed = 12;
                if (Math.abs(launchVx) < minForwardSpeed || Math.sign(launchVx) !== player.facing) {
                    launchVx = player.facing * minForwardSpeed;
                } else {
                    launchVx += player.facing * 5;
                }

                launchVy = Math.min(-7, launchVy - 5);

                player.vx = launchVx;
                player.vy = launchVy;
                player.turnikBoostTimer = 35; // Forward air boost momentum
                player.canDoubleJump = true;  // Double jump refreshed!
                player.grounded = false;
                player.lastRopeId = rope.id;
                player.lastRopeCooldown = 45;
                player.activeRope = null;
                keys.jumpPressedThisFrame = false;
                ledgeHint.classList.add('hidden');

                playSound('airBoost');
                spawnDust(player.x, player.y - 15);
                spawnAirPushEffect(player.x, player.y, player.facing, 'horizontal');
                return;
            }
            return;
        }

        // --- LADDER STATE & INTERACTION ---
        function getNearbyLadder() {
            if (!currentLevelData.ladders) return null;
            for (const lad of currentLevelData.ladders) {
                if (Math.abs(player.x - lad.x) < 55 && player.y >= lad.topY - 40 && player.y <= lad.bottomY + 30) {
                    return lad;
                }
            }
            return null;
        }

        const nearbyLadder = getNearbyLadder();

        if (player.state === 'LADDER') {
            player.canDoubleJump = true;
            ledgeHint.innerHTML = '<span class="hint-key">W / S</span> Идти по лестнице &nbsp;&nbsp; <span class="hint-key">ПРОБЕЛ / E</span> Слезть';
            ledgeHint.classList.remove('hidden');

            const lad = player.activeLadder || nearbyLadder;
            const climbSpeed = 3.5;
            let movingOnLadder = false;

            if (keys.up) {
                player.y -= climbSpeed;
                movingOnLadder = true;
            } else if (keys.down) {
                player.y += climbSpeed;
                movingOnLadder = true;
            }

            if (movingOnLadder) {
                player.animTime += 0.2;
            }

            // Check top dismount (climb onto box roof)
            if (lad && player.y <= lad.topY - 5) {
                player.y = lad.topY;
                player.x = lad.x + 35;
                player.state = 'IDLE';
                player.grounded = true;
                player.activeLadder = null;
                player.vx = 0;
                player.vy = 0;
                ledgeHint.classList.add('hidden');
                playSound('climb');
                return;
            }

            // Check bottom dismount (step onto ground)
            if (lad && player.y >= lad.bottomY) {
                player.y = lad.bottomY;
                player.state = 'IDLE';
                player.grounded = true;
                player.activeLadder = null;
                player.vx = 0;
                player.vy = 0;
                ledgeHint.classList.add('hidden');
                return;
            }

            // Dismount via Space or E
            if (keys.jumpPressedThisFrame || keys.interactPressedThisFrame) {
                player.state = 'JUMP';
                player.vy = keys.jumpPressedThisFrame ? -11 : -2;
                player.vx = player.facing * 3.5;
                player.grounded = false;
                player.activeLadder = null;
                keys.jumpPressedThisFrame = false;
                keys.interactPressedThisFrame = false;
                playSound('jump');
                ledgeHint.classList.add('hidden');
                return;
            }

            return;
        } else {
            // Not on ladder: check if near one to mount
            if (nearbyLadder) {
                ledgeHint.innerHTML = '<span class="hint-key">E</span> Нажмите E, чтобы залезть на лестницу!';
                ledgeHint.classList.remove('hidden');

                if (keys.interactPressedThisFrame) {
                    player.state = 'LADDER';
                    player.activeLadder = nearbyLadder;
                    player.x = nearbyLadder.x;

                    // If mounting from ground level, position player slightly up ladder so they don't immediately dismount
                    if (player.y >= nearbyLadder.bottomY - 15) {
                        player.y = nearbyLadder.bottomY - 20;
                    }

                    player.vx = 0;
                    player.vy = 0;
                    player.grounded = false;
                    keys.interactPressedThisFrame = false;
                    playSound('grab');
                    return;
                }
            } else if (player.state !== 'HANG' && player.state !== 'CLIMB') {
                ledgeHint.classList.add('hidden');
            }
        }

        // --- CLIMBING STATE ---
        if (player.state === 'CLIMB') {
            player.climbProgress += 0.06;
            if (player.climbProgress >= 1) {
                player.climbProgress = 1;
                player.x = player.climbTargetPos.x;
                player.y = player.climbTargetPos.y;
                player.state = 'IDLE';
                player.grounded = true;
                player.hangingLedge = null;
                player.vx = 0;
                player.vy = 0;
                ledgeHint.classList.add('hidden');
                playSound('climb');
            } else {
                const t = player.climbProgress;
                const easeT = Math.sin((t * Math.PI) / 2);
                player.x = player.climbStartPos.x + (player.climbTargetPos.x - player.climbStartPos.x) * easeT;
                player.y = player.climbStartPos.y + (player.climbTargetPos.y - player.climbStartPos.y) * easeT;
            }
            return;
        }

        // --- HANGING ON LEDGE STATE ---
        if (player.state === 'HANG') {
            player.vx = 0;
            player.vy = 0;
            player.canDoubleJump = true;
            ledgeHint.innerHTML = '<span class="hint-key">ПРОБЕЛ</span> Нажмите, чтобы залезть на край!';
            ledgeHint.classList.remove('hidden');

            if (keys.jumpPressedThisFrame) {
                player.state = 'CLIMB';
                player.climbProgress = 0;
                player.climbStartPos = { x: player.x, y: player.y };

                const ledge = player.hangingLedge;
                const landX = ledge.side === 'LEFT' ? ledge.x + 35 : ledge.x - 35;
                const landY = ledge.y;
                player.climbTargetPos = { x: landX, y: landY };
                keys.jumpPressedThisFrame = false;
            }
            return;
        }

        // Crouch & Ceiling Check
        function isCeilingAbove(x, y) {
            const pLeft = x - 14;
            const pRight = x + 14;
            const pTop = y - 76; // standing height top
            for (const box of currentLevelData.boxes) {
                if (pRight > box.x && pLeft < box.x + box.w && pTop < box.y + box.h && y - 30 > box.y) {
                    return true;
                }
            }
            return false;
        }

        // --- SPECIAL DASH & ROLL TRIGGERS ---
        const isSpecialState = ['VICTORY', 'VICTORY_IDLE', 'HANG', 'CLIMB', 'LADDER', 'TURNIK', 'TURNIK_SWING', 'ROPE', 'DEFEAT'].includes(player.state);

        if (!isSpecialState) {
            let triggerRoll = false;
            let triggerDash = false;

            if (player.isBossMode) {
                // In Boss fight: only Jump, Roll, and Crouch are allowed!
                if (keys.shiftPressedThisFrame || (keys.shift && player.rollCooldown === 0 && player.state !== 'ROLL')) {
                    triggerRoll = true;
                }
            } else {
                if (keys.shiftPressedThisFrame) {
                    if (keys.crouch) {
                        triggerRoll = true;
                    } else {
                        triggerDash = true;
                    }
                } else if (keys.crouch && keys.shift && player.rollCooldown === 0 && player.state !== 'ROLL') {
                    triggerRoll = true;
                }
            }

            if (triggerRoll && player.rollCooldown === 0 && player.state !== 'ROLL') {
                player.state = 'ROLL';
                player.rollTimer = 22;
                player.rollCooldown = 30;
                if (keys.left && !player.isBossMode) player.facing = -1;
                if (keys.right || player.isBossMode) player.facing = 1;
                player.vx = player.facing * 10.5;
                player.isCrouching = true;
                player.height = 38;
                playSound('climb');
                spawnDust(player.x, player.y);
                keys.shiftPressedThisFrame = false;
            } else if (triggerDash && player.dashCooldown === 0 && player.state !== 'DASH') {
                player.state = 'DASH';
                player.dashTimer = 14;
                player.dashCooldown = 24;
                if (keys.left) player.facing = -1;
                if (keys.right) player.facing = 1;
                player.vx = player.facing * 18;
                player.vy = 0;
                playSound('airBoost');
                spawnAirPushEffect(player.x, player.y, player.facing, 'horizontal');
                keys.shiftPressedThisFrame = false;
            }
        }

        let wantsCrouch = keys.crouch && player.grounded;
        if (!wantsCrouch && player.isCrouching && isCeilingAbove(player.x, player.y)) {
            wantsCrouch = true; // force crouch while under box
        }

        if (player.state !== 'ROLL' && player.state !== 'DASH') {
            player.isCrouching = wantsCrouch;
            player.height = player.isCrouching ? 38 : 76;
        }

        // --- MOVEMENT PHYSICS & STATES ---
        const moveAccel = 0.8;
        const maxSpeed = player.isCrouching ? 3.5 : 6.5;
        const friction = 0.82;
        const gravity = 0.65;

        const isBoosting = (player.turnikBoostTimer > 0 || player.airBoostTimer > 0);

        if (player.state === 'DASH') {
            player.height = 76;
            player.isCrouching = false;
            player.vy = 0; // Maintain horizontal dash line
            player.vx = player.facing * 18;

            if (Math.random() < 0.6) {
                particles.push({
                    x: player.x - player.facing * 16,
                    y: player.y - 35 + (Math.random() - 0.5) * 25,
                    vx: -player.facing * (3 + Math.random() * 4),
                    vy: (Math.random() - 0.5) * 1.5,
                    size: 2.5 + Math.random() * 4,
                    color: Math.random() < 0.5 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                    life: 0.7,
                    decay: 0.06
                });
            }

            if (player.dashTimer <= 0) {
                player.vx = player.facing * 10;
                player.state = player.grounded ? 'RUN' : 'JUMP';
            }
        } else if (player.state === 'ROLL') {
            player.isCrouching = true;
            player.height = 38;
            player.vx = player.facing * 10.5;
            player.vy += gravity;

            if (player.grounded && Math.random() < 0.4) {
                spawnDust(player.x, player.y);
            }

            if (player.rollTimer <= 0) {
                if (isCeilingAbove(player.x, player.y)) {
                    player.isCrouching = true;
                    player.height = 38;
                    player.state = 'RUN';
                } else {
                    player.isCrouching = false;
                    player.height = 76;
                    player.state = player.grounded ? (Math.abs(player.vx) > 0.5 ? 'RUN' : 'IDLE') : 'JUMP';
                }
            }
        } else if (player.isBossMode) {
            // Auto-run forward continuously with fixed facing!
            player.facing = 1;
            player.vx = player.isCrouching ? 4.8 : 7.5;
            player.vy += gravity;
        } else if (keys.left) {
            player.vx -= moveAccel;
            player.facing = -1;
            if (isBoosting && player.vx > 0) {
                player.turnikBoostTimer = 0;
                player.airBoostTimer = 0;
            }
        } else if (keys.right) {
            player.vx += moveAccel;
            player.facing = 1;
            if (isBoosting && player.vx < 0) {
                player.turnikBoostTimer = 0;
                player.airBoostTimer = 0;
            }
        } else if (isBoosting) {
            // Automatic forward propulsion: maintain high velocity with mild drag
            player.vx *= 0.97;
            if (Math.random() < 0.4) {
                particles.push({
                    x: player.x - player.facing * 12,
                    y: player.y - 30 + (Math.random() - 0.5) * 20,
                    vx: -player.facing * (2 + Math.random() * 3),
                    vy: (Math.random() - 0.5) * 1,
                    size: 2 + Math.random() * 3,
                    color: 'rgba(56, 189, 248, 0.6)',
                    life: 0.8,
                    decay: 0.05
                });
            }
        } else {
            player.vx *= friction;
        }

        if (player.state !== 'DASH' && player.state !== 'ROLL' && !player.isBossMode) {
            const activeMaxSpeed = isBoosting ? 18 : maxSpeed;
            player.vx = Math.max(-activeMaxSpeed, Math.min(activeMaxSpeed, player.vx));
            if (Math.abs(player.vx) < 0.05) player.vx = 0;
            player.vy += gravity;
        }

        let nextX = player.x + player.vx;
        let nextY = player.y + player.vy;

        // --- TURNIK GRAB DETECTION ---
        if (!player.grounded && currentLevelData.turniks && player.state !== 'DASH' && player.state !== 'ROLL' && !player.isBossMode) {
            const handY = nextY - 55;
            for (const tur of currentLevelData.turniks) {
                // Ignore grab only if THIS specific turnik is on re-grab cooldown
                if (player.lastTurnikId === tur.id && player.lastTurnikCooldown > 0) {
                    continue;
                }

                if (Math.abs(nextX - tur.x) < 55 && Math.abs(handY - tur.y) < 45 && player.vy >= -6) {
                    player.state = 'TURNIK';
                    player.activeTurnik = tur;
                    player.x = tur.x;
                    player.y = tur.y + 60;
                    player.facing = 1;
                    player.vx = 0;
                    player.vy = 0;
                    player.grounded = false;
                    player.canDoubleJump = true;
                    player.lastTurnikId = null;
                    player.lastTurnikCooldown = 0;
                    playSound('grab');
                    keys.jumpPressedThisFrame = false;
                    return;
                }
            }
        }

        // --- ROPE (КАНАТ) GRAB DETECTION ---
        if (!player.grounded && currentLevelData.ropes && player.state !== 'DASH' && player.state !== 'ROLL' && player.state !== 'ROPE' && !player.isBossMode) {
            for (const rope of currentLevelData.ropes) {
                if (player.lastRopeId === rope.id && player.lastRopeCooldown > 0) {
                    continue;
                }

                const ropeLen = rope.length || 220;
                const ropeBottomX = rope.x;
                const ropeBottomY = rope.anchorY + ropeLen;
                const handY = nextY - 55;

                const distToBottom = Math.hypot(nextX - ropeBottomX, handY - ropeBottomY);
                const horizontalDist = Math.abs(nextX - rope.x);
                const verticalInRange = handY >= rope.anchorY + ropeLen * 0.4 && handY <= rope.anchorY + ropeLen + 50;

                if ((distToBottom < 65 || (horizontalDist < 45 && verticalInRange)) && player.vy >= -8) {
                    player.state = 'ROPE';
                    player.activeRope = rope;
                    player.lastRopeId = null;
                    player.lastRopeCooldown = 0;
                    player.canDoubleJump = true;

                    // Initial angle based on approach
                    const dx = nextX - rope.x;
                    player.ropeAngle = Math.max(-0.8, Math.min(0.8, dx / ropeLen));
                    player.ropeAngularVel = (player.vx * 0.003); // Transfer horizontal momentum into swing!
                    player.facing = player.vx >= 0 ? 1 : -1;

                    playSound('grab');
                    keys.jumpPressedThisFrame = false;
                    return;
                }
            }
        }

        // --- LEDGE GRAB DETECTION ---
        if (!player.grounded && player.vy >= -8 && player.state !== 'DASH' && player.state !== 'ROLL' && !player.isBossMode) {
            for (const box of currentLevelData.boxes) {
                if (box.noLedgeGrab) continue;

                const leftCorner = { x: box.x, y: box.y };
                const rightCorner = { x: box.x + box.w, y: box.y };
                const handY = nextY - 62;

                const grabDistLeftX = Math.abs((nextX + 12) - leftCorner.x);
                const grabDistRightX = Math.abs((nextX - 12) - rightCorner.x);
                const grabDistY = Math.abs(handY - leftCorner.y);

                if (player.vx >= 0 && grabDistLeftX < 32 && grabDistY < 48) {
                    player.state = 'HANG';
                    player.hangingLedge = { x: leftCorner.x, y: leftCorner.y, side: 'LEFT', box };
                    player.x = leftCorner.x - 14;
                    player.y = leftCorner.y + 68;
                    player.facing = 1;
                    player.vx = 0;
                    player.vy = 0;
                    player.grounded = false;
                    player.canDoubleJump = true;
                    playSound('grab');
                    keys.jumpPressedThisFrame = false;
                    return;
                } else if (player.vx <= 0 && grabDistRightX < 32 && grabDistY < 48) {
                    player.state = 'HANG';
                    player.hangingLedge = { x: rightCorner.x, y: rightCorner.y, side: 'RIGHT', box };
                    player.x = rightCorner.x + 14;
                    player.y = rightCorner.y + 68;
                    player.facing = -1;
                    player.vx = 0;
                    player.vy = 0;
                    player.grounded = false;
                    player.canDoubleJump = true;
                    playSound('grab');
                    keys.jumpPressedThisFrame = false;
                    return;
                }
            }
        }

        // --- BOX SOLID COLLISIONS ---
        player.grounded = false;

        for (const box of currentLevelData.boxes) {
            const bLeft = box.x;
            const bRight = box.x + box.w;
            const bTop = box.y;
            const bBottom = box.y + box.h;

            const pLeft = nextX - 14;
            const pRight = nextX + 14;
            const pTop = nextY - player.height;
            const pBottom = nextY;

            if (pRight > bLeft && pLeft < bRight && pBottom > bTop && pTop < bBottom) {
                const overlapLeft = pRight - bLeft;
                const overlapRight = bRight - pLeft;
                const overlapTop = pBottom - bTop;
                const overlapBottom = bBottom - pTop;

                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop && player.vy >= 0) {
                    nextY = bTop;
                    player.vy = 0;
                    player.grounded = true;
                } else if (minOverlap === overlapBottom && player.vy < 0) {
                    nextY = bBottom + player.height;
                    player.vy = 0;
                } else if (minOverlap === overlapLeft) {
                    nextX = bLeft - 14;
                    player.vx = 0;
                } else if (minOverlap === overlapRight) {
                    nextX = bRight + 14;
                    player.vx = 0;
                }
            }
        }

        // Ground platform collision & Chasm check
        if (nextY >= currentLevelData.groundY) {
            if (isOverChasm(nextX)) {
                // Falling into chasm created by Boss slam!
                player.grounded = false;
                if (nextY > currentLevelData.groundY + 110) {
                    triggerDefeat();
                }
            } else {
                if (!player.grounded && player.vy > 4) {
                    spawnDust(nextX, currentLevelData.groundY);
                }
                nextY = currentLevelData.groundY;
                player.vy = 0;
                player.grounded = true;
            }
        }

        player.x = Math.max(20, nextX);
        player.y = nextY;

        if (player.grounded) {
            player.canDoubleJump = true;
        }

        if (keys.jumpPressedThisFrame) {
            if (player.grounded) {
                player.vy = -14.5;
                player.grounded = false;
                playSound('jump');
                spawnDust(player.x, player.y);
            } else if (player.canDoubleJump && (player.state === 'JUMP' || !player.grounded)) {
                // Double Jump / Air Push ("Оттолкнуться от воздуха только вверх")
                player.canDoubleJump = false;
                player.vy = -14.5;              // Pure vertical upward jump force
                playSound('airBoost');
                spawnAirPushEffect(player.x, player.y, player.facing, 'vertical');
            }
        }

        if (player.state === 'DASH' || player.state === 'ROLL') {
            // State active while timers tick
        } else if (!player.grounded) {
            player.state = 'JUMP';
        } else if (Math.abs(player.vx) > 0.5) {
            player.state = 'RUN';
        } else {
            player.state = 'IDLE';
        }

        keys.shiftPressedThisFrame = false;
        keys.jumpPressedThisFrame = false;
        keys.interactPressedThisFrame = false;

        // Check Victory Flag
        if (currentLevelData.flag) {
            const distToFlag = Math.abs(player.x - currentLevelData.flag.x);
            if (distToFlag < 45 && Math.abs(player.y - currentLevelData.flag.y) < 45) {
                player.state = 'VICTORY';
                player.victoryLandY = getSolidFloorY(player.x, player.y);
                player.vy = -12;
                player.grounded = false;
                playSound('victory');
                spawnConfetti(currentLevelData.flag.x, currentLevelData.flag.y - 60);
            }
        }
    }

    // Camera controller (2D tracking: follows player on X and Y axes)
    function updateCamera() {
        const scale = canvas.height / 675;
        const screenW = canvas.width / scale;
        const screenH = 675;

        if (currentState === STATES.MENU || currentState === STATES.LEVEL_SELECT) {
            cameraX = (Math.sin(Date.now() * 0.0003) + 1) * 300;
            cameraY = 0;
        } else {
            // Horizontal camera tracking
            const targetCamX = player.x - screenW * 0.35;
            cameraX += (targetCamX - cameraX) * 0.1;
            cameraX = Math.max(0, Math.min(currentLevelData.worldWidth - screenW, cameraX));

            // Vertical camera tracking
            const targetCamY = (player.y - 40) - screenH * 0.5;
            cameraY += (targetCamY - cameraY) * 0.1;
            cameraY = Math.max(-600, Math.min(60, cameraY));

            if (screenShake > 0) {
                cameraX += (Math.random() - 0.5) * screenShake;
                cameraY += (Math.random() - 0.5) * screenShake;
            }
        }
    }

    // --- RENDER ENGINE ---
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = canvas.height / 675;

        if (currentState === STATES.MENU || currentState === STATES.LEVEL_SELECT) {
            // ==========================================
            // MENU & LEVEL SELECT: PURE COSMIC SPACE BACKGROUND
            // ==========================================
            const spaceGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            spaceGrad.addColorStop(0, '#030712');
            spaceGrad.addColorStop(0.5, '#0b0f19');
            spaceGrad.addColorStop(1, '#1e1035');
            ctx.fillStyle = spaceGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Nebulae
            nebulae.forEach(neb => {
                const nebX = (neb.x - cameraX * 0.15) * scale;
                const nebY = neb.y * scale;
                const nebR = neb.r * scale;

                const grad = ctx.createRadialGradient(nebX, nebY, 0, nebX, nebY, nebR);
                grad.addColorStop(0, neb.color);
                grad.addColorStop(1, 'transparent');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(nebX, nebY, nebR, 0, Math.PI * 2);
                ctx.fill();
            });

            // Ringed Planet
            const planetX = (1600 - cameraX * 0.1) * scale;
            const planetY = 180 * scale;
            const planetR = 55 * scale;

            ctx.save();
            const planetGrad = ctx.createLinearGradient(planetX - planetR, planetY - planetR, planetX + planetR, planetY + planetR);
            planetGrad.addColorStop(0, '#a855f7');
            planetGrad.addColorStop(0.5, '#3b82f6');
            planetGrad.addColorStop(1, '#030712');
            ctx.fillStyle = planetGrad;
            ctx.beginPath();
            ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
            ctx.lineWidth = 6 * scale;
            ctx.beginPath();
            ctx.ellipse(planetX, planetY, planetR * 1.8, planetR * 0.4, -Math.PI / 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Twinkling Stars
            stars.forEach(st => {
                st.alpha += st.twinkleSpeed;
                const currentAlpha = Math.abs(Math.sin(st.alpha));
                const stX = (st.x - cameraX * 0.25) * scale;
                const stY = st.y * scale;

                ctx.save();
                ctx.globalAlpha = currentAlpha * 0.85 + 0.15;
                ctx.fillStyle = st.color;
                ctx.beginPath();
                ctx.arc(stX, stY, st.radius * scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Shooting Star Effect
            updateShootingStar();
            if (shootingStar) {
                const ssX = (shootingStar.x - cameraX * 0.25) * scale;
                const ssY = shootingStar.y * scale;
                ctx.save();
                ctx.globalAlpha = Math.max(0, shootingStar.alpha);
                const ssGrad = ctx.createLinearGradient(ssX, ssY, ssX - shootingStar.vx * 4 * scale, ssY - shootingStar.vy * 4 * scale);
                ssGrad.addColorStop(0, '#ffffff');
                ssGrad.addColorStop(1, 'transparent');
                ctx.strokeStyle = ssGrad;
                ctx.lineWidth = 2.5 * scale;
                ctx.beginPath();
                ctx.moveTo(ssX, ssY);
                ctx.lineTo(ssX - shootingStar.vx * 6 * scale, ssY - shootingStar.vy * 6 * scale);
                ctx.stroke();
                ctx.restore();
            }

            // Early return during MENU / LEVEL_SELECT (level objects NOT rendered)
            return;

        } else if (currentState === STATES.VICTORY && currentLevelIndex === 20) {
            // ==========================================
            // LEVEL 20 VICTORY: PURE BLACK SCREEN
            // ==========================================
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Blinding white light smoothly washing out to deep black
            if (cutscene.whiteAlpha > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, cutscene.whiteAlpha)})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            // Early return during Level 20 victory (location & stickman NOT rendered)
            return;

        } else {
            // ==========================================
            // IN-GAME BACKGROUND (DISTINCT PARKOUR THEME)
            // ==========================================
            const levelGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            levelGrad.addColorStop(0, '#0b0f17');
            levelGrad.addColorStop(0.6, '#182232');
            levelGrad.addColorStop(1, '#090d16');
            ctx.fillStyle = levelGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Clean Urban Parkour Grid Pattern
            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
            ctx.lineWidth = 1;
            const gridSize = 60 * scale;
            const offsetX = -(cameraX * 0.3 * scale) % gridSize;
            const offsetY = -(cameraY * 0.3 * scale) % gridSize;
            for (let x = offsetX; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = offsetY; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            ctx.restore();
        }

        // --- RENDER LEVEL PLATFORMS & OBSTACLES ---
        // Ground Platform
        currentLevelData.platforms.forEach(plat => {
            const drawX = (plat.x - cameraX) * scale;
            const drawY = (plat.y - cameraY) * scale;
            const drawW = plat.w * scale;
            const drawH = plat.h * scale;

            const platGrad = ctx.createLinearGradient(0, drawY, 0, drawY + drawH);
            platGrad.addColorStop(0, '#1e293b');
            platGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = platGrad;
            ctx.fillRect(drawX, drawY, drawW, drawH);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(drawX, drawY, drawW, 4 * scale);
        });

        // Box Obstacles
        currentLevelData.boxes.forEach(box => {
            const drawX = (box.x - cameraX) * scale;
            const drawY = (box.y - cameraY) * scale;
            const drawW = box.w * scale;
            const drawH = box.h * scale;

            const boxGrad = ctx.createLinearGradient(drawX, drawY, drawX + drawW, drawY + drawH);
            boxGrad.addColorStop(0, box.isSmall ? '#1e293b' : '#334155');
            boxGrad.addColorStop(1, box.isSmall ? '#0f172a' : '#1e293b');
            ctx.fillStyle = boxGrad;
            ctx.fillRect(drawX, drawY, drawW, drawH);

            ctx.strokeStyle = box.isSmall ? '#38bdf8' : '#64748b';
            ctx.lineWidth = 3 * scale;
            ctx.strokeRect(drawX, drawY, drawW, drawH);

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2 * scale;
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(drawX + drawW, drawY + drawH);
            ctx.moveTo(drawX + drawW, drawY);
            ctx.lineTo(drawX, drawY + drawH);
            ctx.stroke();

            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(drawX, drawY, 5 * scale, 0, Math.PI * 2);
            ctx.arc(drawX + drawW, drawY, 5 * scale, 0, Math.PI * 2);
            ctx.fill();
        });

        // Render Ladders
        if (currentLevelData.ladders) {
            currentLevelData.ladders.forEach(lad => {
                const drawX = (lad.x - cameraX) * scale;
                const drawTopY = (lad.topY - cameraY) * scale;
                const drawBotY = (lad.bottomY - cameraY) * scale;
                const drawW = (lad.w || 36) * scale;

                const leftX = drawX - drawW / 2;
                const rightX = drawX + drawW / 2;

                // Vertical Rails
                ctx.strokeStyle = '#06b6d4';
                ctx.lineWidth = 4 * scale;
                ctx.beginPath();
                ctx.moveTo(leftX, drawTopY);
                ctx.lineTo(leftX, drawBotY);
                ctx.moveTo(rightX, drawTopY);
                ctx.lineTo(rightX, drawBotY);
                ctx.stroke();

                // Rail Tops (yellow accent caps)
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(leftX, drawTopY, 4 * scale, 0, Math.PI * 2);
                ctx.arc(rightX, drawTopY, 4 * scale, 0, Math.PI * 2);
                ctx.fill();

                // Horizontal Rungs
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3.5 * scale;
                const step = 22;
                for (let rY = lad.topY + 12; rY <= lad.bottomY - 8; rY += step) {
                    const rungY = (rY - cameraY) * scale;
                    ctx.beginPath();
                    ctx.moveTo(leftX + 2 * scale, rungY);
                    ctx.lineTo(rightX - 2 * scale, rungY);
                    ctx.stroke();
                }
            });
        }

        // Render Turniks
        if (currentLevelData.turniks) {
            currentLevelData.turniks.forEach(tur => {
                const drawX = (tur.x - cameraX) * scale;
                const drawY = (tur.y - cameraY) * scale;
                const drawBoxBotY = (tur.boxBottomY - cameraY) * scale;
                const barLen = (tur.length || 80) * scale;

                // Vertical Metallic Rods/Supports attached from box down to bar
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 4 * scale;
                ctx.beginPath();
                ctx.moveTo(drawX - barLen / 2 + 8 * scale, drawBoxBotY);
                ctx.lineTo(drawX - barLen / 2 + 8 * scale, drawY);
                ctx.moveTo(drawX + barLen / 2 - 8 * scale, drawBoxBotY);
                ctx.lineTo(drawX + barLen / 2 - 8 * scale, drawY);
                ctx.stroke();

                // Horizontal Bar
                const barGrad = ctx.createLinearGradient(drawX - barLen / 2, drawY, drawX + barLen / 2, drawY);
                barGrad.addColorStop(0, '#06b6d4');
                barGrad.addColorStop(0.5, '#38bdf8');
                barGrad.addColorStop(1, '#06b6d4');
                ctx.strokeStyle = barGrad;
                ctx.lineWidth = 6 * scale;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(drawX - barLen / 2, drawY);
                ctx.lineTo(drawX + barLen / 2, drawY);
                ctx.stroke();

                // Decorative Yellow End Caps
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(drawX - barLen / 2, drawY, 5 * scale, 0, Math.PI * 2);
                ctx.arc(drawX + barLen / 2, drawY, 5 * scale, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Render Ropes (Канаты)
        if (currentLevelData.ropes) {
            currentLevelData.ropes.forEach(rope => {
                const drawAnchorX = (rope.x - cameraX) * scale;
                const drawAnchorY = (rope.anchorY - cameraY) * scale;
                const ropeLen = (rope.length || 220) * scale;

                let angle = 0;
                if (player.state === 'ROPE' && player.activeRope && player.activeRope.id === rope.id) {
                    angle = player.ropeAngle;
                } else {
                    angle = Math.sin(Date.now() * 0.0018 + rope.x) * 0.04;
                }

                const endX = drawAnchorX + Math.sin(angle) * ropeLen;
                const endY = drawAnchorY + Math.cos(angle) * ropeLen;

                // Metallic Ceiling Anchor Plate
                ctx.fillStyle = '#475569';
                ctx.fillRect(drawAnchorX - 12 * scale, drawAnchorY - 6 * scale, 24 * scale, 8 * scale);
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.arc(drawAnchorX, drawAnchorY, 6 * scale, 0, Math.PI * 2);
                ctx.stroke();

                // Main Twisted Rope Body
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 5.5 * scale;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(drawAnchorX, drawAnchorY);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Inner Highlight Strand
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2 * scale;
                ctx.beginPath();
                ctx.moveTo(drawAnchorX, drawAnchorY);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Grip Knots along the rope
                const knotCount = 4;
                for (let k = 1; k <= knotCount; k++) {
                    const ratio = k / knotCount;
                    const kX = drawAnchorX + (endX - drawAnchorX) * ratio;
                    const kY = drawAnchorY + (endY - drawAnchorY) * ratio;

                    ctx.fillStyle = '#b45309';
                    ctx.beginPath();
                    ctx.arc(kX, kY, 4.5 * scale, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Bottom Grip Knot & Accent
                ctx.fillStyle = '#92400e';
                ctx.beginPath();
                ctx.arc(endX, endY, 6 * scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(endX, endY, 2.5 * scale, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Finish Flag
        if (currentLevelData.flag) {
            const flag = currentLevelData.flag;
            const flagX = (flag.x - cameraX) * scale;
            const flagY = (flag.y - cameraY) * scale;

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 4 * scale;
            ctx.beginPath();
            ctx.moveTo(flagX, flagY);
            ctx.lineTo(flagX, flagY - flag.poleHeight * scale);
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(flagX, flagY - flag.poleHeight * scale, 6 * scale, 0, Math.PI * 2);
            ctx.fill();

            const wave = Math.sin(Date.now() * 0.005) * 6 * scale;
            const bannerTopY = flagY - flag.poleHeight * scale + 6 * scale;
            const bannerW = flag.bannerW * scale;
            const bannerH = flag.bannerH * scale;

            const flagGrad = ctx.createLinearGradient(flagX, bannerTopY, flagX + bannerW, bannerTopY);
            flagGrad.addColorStop(0, '#ef4444');
            flagGrad.addColorStop(1, '#f59e0b');

            ctx.fillStyle = flagGrad;
            ctx.beginPath();
            ctx.moveTo(flagX, bannerTopY);
            ctx.quadraticCurveTo(flagX + bannerW * 0.5, bannerTopY + wave, flagX + bannerW, bannerTopY + wave / 2);
            ctx.lineTo(flagX + bannerW, bannerTopY + bannerH + wave / 2);
            ctx.quadraticCurveTo(flagX + bannerW * 0.5, bannerTopY + bannerH + wave, flagX, bannerTopY + bannerH);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = `${14 * scale}px sans-serif`;
            ctx.fillText('★', flagX + 12 * scale, bannerTopY + 20 * scale + wave / 2);
        }

        // Draw Cutscene Door & Light (behind stickman)
        drawCutsceneDoor();

        // Draw Boss Hazards (Chasms, Spikes, Boulders, Ground Debris)
        drawBossHazards();

        // Render Particles
        drawParticles();

        // Render Stickman
        drawStickman();

        // Draw Boss Robot
        drawBossRobot();

        // Fullscreen White Light Washout (Экран засветляется)
        if (cutscene.whiteAlpha > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, cutscene.whiteAlpha)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }

    // Procedural Stickman Animator
    function drawStickman() {
        const scale = canvas.height / 675;
        const screenX = (player.x - cameraX) * scale;
        const screenY = (player.y - cameraY) * scale;

        ctx.save();
        ctx.translate(screenX, screenY);

        ctx.strokeStyle = '#020617';
        ctx.fillStyle = '#020617';
        ctx.lineWidth = 4.5 * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let hip = { x: 0, y: -38 };
        let head = { x: 0, y: -68 };
        let shoulder = { x: 0, y: -54 };

        let leftHand = { x: -10, y: -40 };
        let rightHand = { x: 10, y: -40 };
        let leftKnee = { x: -8, y: -20 };
        let rightKnee = { x: 8, y: -20 };
        let leftFoot = { x: -12, y: 0 };
        let rightFoot = { x: 12, y: 0 };

        const facing = player.facing;
        const time = player.animTime;

        if (player.state === 'TURNIK' || player.state === 'TURNIK_SWING') {
            let swingAngle = 0;
            if (player.state === 'TURNIK_SWING') {
                const progress = Math.min(1, player.turnikTimer / 0.3);
                if (progress < 0.4) {
                    swingAngle = -(progress / 0.4) * 0.5 * facing;
                } else {
                    const fProg = (progress - 0.4) / 0.6;
                    swingAngle = (-0.5 + fProg * 1.3) * facing;
                }
            } else {
                swingAngle = Math.sin(time * 0.8) * 0.08 * facing;
            }

            ctx.rotate(swingAngle);
            hip = { x: 0, y: -22 };
            shoulder = { x: 0, y: -40 };
            head = { x: 0, y: -52 };

            leftHand = { x: -6, y: -60 };
            rightHand = { x: 6, y: -60 };

            leftKnee = { x: -6, y: -10 };
            rightKnee = { x: 6, y: -10 };
            leftFoot = { x: -8, y: 0 };
            rightFoot = { x: 8, y: 0 };

        } else if (player.state === 'ROPE') {
            ctx.rotate(player.ropeAngle);
            hip = { x: 0, y: -20 };
            shoulder = { x: 0, y: -38 };
            head = { x: 0, y: -50 };

            leftHand = { x: -2, y: -58 };
            rightHand = { x: 2, y: -58 };

            leftKnee = { x: -facing * 6, y: -10 };
            rightKnee = { x: facing * 6, y: -8 };
            leftFoot = { x: -facing * 10, y: 0 };
            rightFoot = { x: facing * 8, y: 2 };

        } else if (player.state === 'DASH') {
            hip = { x: -facing * 10, y: -34 };
            shoulder = { x: facing * 12, y: -42 };
            head = { x: facing * 24, y: -48 };

            leftHand = { x: -facing * 24, y: -36 };
            rightHand = { x: -facing * 28, y: -44 };

            leftFoot = { x: -facing * 28, y: -20 };
            rightFoot = { x: -facing * 20, y: -10 };
            leftKnee = { x: -facing * 18, y: -26 };
            rightKnee = { x: -facing * 14, y: -22 };

            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
            ctx.lineWidth = 2 * scale;
            for (let i = 0; i < 3; i++) {
                const lineY = (-54 + i * 20) * scale;
                const startX = (-facing * 45 - i * 12) * scale;
                const endX = (facing * 25) * scale;
                ctx.beginPath();
                ctx.moveTo(startX, lineY);
                ctx.lineTo(endX, lineY);
                ctx.stroke();
            }
            ctx.restore();

        } else if (player.state === 'ROLL') {
            const rollProgress = 1 - Math.max(0, player.rollTimer / 22);
            const rotationAngle = rollProgress * Math.PI * 2 * facing;

            ctx.translate(0, -22 * scale);
            ctx.rotate(rotationAngle);
            ctx.translate(0, 22 * scale);

            hip = { x: 0, y: -18 };
            shoulder = { x: facing * 4, y: -28 };
            head = { x: facing * 8, y: -34 };

            leftHand = { x: facing * 6, y: -12 };
            rightHand = { x: -facing * 4, y: -12 };

            leftKnee = { x: -facing * 8, y: -24 };
            rightKnee = { x: facing * 10, y: -24 };
            leftFoot = { x: -facing * 4, y: -10 };
            rightFoot = { x: facing * 6, y: -10 };

        } else if (player.isCrouching) {
            hip = { x: -facing * 4, y: -18 };
            shoulder = { x: facing * 4, y: -28 };
            head = { x: facing * 8, y: -38 };

            if (Math.abs(player.vx) > 0.3) {
                const crawl = Math.sin(time * 3);
                leftFoot = { x: -14 * facing + crawl * 6, y: 0 };
                rightFoot = { x: 8 * facing - crawl * 6, y: 0 };
                leftKnee = { x: -10 * facing, y: -10 };
                rightKnee = { x: 12 * facing, y: -10 };
                leftHand = { x: 14 * facing + crawl * 8, y: -12 };
                rightHand = { x: -4 * facing - crawl * 8, y: -12 };
            } else {
                leftFoot = { x: -10 * facing, y: 0 };
                rightFoot = { x: 10 * facing, y: 0 };
                leftKnee = { x: -12 * facing, y: -10 };
                rightKnee = { x: 12 * facing, y: -10 };
                leftHand = { x: 10 * facing, y: -18 };
                rightHand = { x: -4 * facing, y: -18 };
            }

        } else if (player.state === 'DEFEAT') {
            if (player.staggerTimer < 0.55) {
                // Stagger / wobble animation (пошатывается)
                ctx.rotate(player.staggerAngle);
                hip = { x: -facing * 4, y: -34 };
                shoulder = { x: -facing * 8, y: -50 };
                head = { x: -facing * 12, y: -64 };

                // Arms flailing in panic to keep balance
                const flail = Math.sin(time * 5);
                leftHand = { x: -facing * 20 + flail * 8, y: -56 + Math.cos(time * 5) * 10 };
                rightHand = { x: facing * 18 - flail * 8, y: -52 - Math.cos(time * 5) * 10 };

                // Buckling knees and unsteady feet
                leftKnee = { x: -10 * facing, y: -14 };
                rightKnee = { x: 6 * facing, y: -12 };
                leftFoot = { x: -16 * facing, y: 0 };
                rightFoot = { x: 12 * facing, y: 0 };
            } else {
                // Collapse flat on ground (падает)
                hip = { x: -facing * 12, y: -6 };
                shoulder = { x: facing * 10, y: -6 };
                head = { x: facing * 24, y: -6 };

                leftHand = { x: facing * 16, y: -4 };
                rightHand = { x: -facing * 4, y: -4 };

                leftFoot = { x: -facing * 34, y: -2 };
                rightFoot = { x: -facing * 26, y: -2 };
                leftKnee = { x: -facing * 22, y: -4 };
                rightKnee = { x: -facing * 18, y: -4 };
            }

        } else if (player.state === 'CUTSCENE_REACH') {
            if (cutscene.phase === 'OPEN_DOOR' || cutscene.phase === 'WHITE_BURST') {
                // Shielding eyes from the blinding white celestial light
                hip = { x: -facing * 3, y: -38 };
                shoulder = { x: -facing * 6, y: -54 };
                head = { x: -facing * 8, y: -68 };

                rightHand = { x: facing * 12, y: -62 };
                leftHand = { x: -facing * 14, y: -38 };

                leftFoot = { x: -8 * facing, y: 0 };
                rightFoot = { x: 8 * facing, y: 0 };
                leftKnee = { x: -10 * facing, y: -18 };
                rightKnee = { x: 6 * facing, y: -18 };
            } else {
                // Reaching hand out towards the door to open it
                hip = { x: 0, y: -38 };
                shoulder = { x: facing * 3, y: -54 };
                head = { x: facing * 5, y: -68 };

                rightHand = { x: 22 * facing, y: -44 };
                leftHand = { x: -10 * facing, y: -38 };

                leftFoot = { x: -8 * facing, y: 0 };
                rightFoot = { x: 8 * facing, y: 0 };
                leftKnee = { x: -10 * facing, y: -18 };
                rightKnee = { x: 6 * facing, y: -18 };
            }

        } else if (player.state === 'IDLE') {
            const breath = Math.sin(time * 0.8) * 1.5;
            head.y += breath;
            shoulder.y += breath * 0.8;
            hip.y += breath * 0.5;

            leftHand = { x: -12 * facing, y: -38 + breath };
            rightHand = { x: 12 * facing, y: -38 + breath };
            leftFoot = { x: -8 * facing, y: 0 };
            rightFoot = { x: 8 * facing, y: 0 };
            leftKnee = { x: -10 * facing, y: -18 };
            rightKnee = { x: 6 * facing, y: -18 };

        } else if (player.state === 'RUN') {
            if (player.isBossMode) {
                // High-speed survival sprint in Boss Fight
                const sprintPhase = time * 3.8;
                const legSwing = Math.sin(sprintPhase);
                const armSwing = Math.cos(sprintPhase);

                hip.y = -36 + Math.abs(Math.sin(sprintPhase)) * 5;
                shoulder.y = -52 + Math.abs(Math.sin(sprintPhase)) * 4;
                head.y = shoulder.y - 12;

                // Strong forward athletic lean
                shoulder.x = facing * 14;
                head.x = facing * 22;
                hip.x = -facing * 4;

                leftFoot = { x: legSwing * 24 * facing, y: Math.max(0, -legSwing * 14) };
                rightFoot = { x: -legSwing * 24 * facing, y: Math.max(0, legSwing * 14) };

                leftKnee = { x: (leftFoot.x + hip.x) / 2 + facing * 6, y: -20 };
                rightKnee = { x: (rightFoot.x + hip.x) / 2 - facing * 6, y: -20 };

                leftHand = { x: armSwing * 22 * facing, y: -44 + armSwing * 8 };
                rightHand = { x: -armSwing * 22 * facing, y: -44 - armSwing * 8 };
            } else {
                const legSwing = Math.sin(time * 2.5);
                const armSwing = Math.cos(time * 2.5);

                hip.y = -38 + Math.abs(Math.sin(time * 2.5)) * 4;
                shoulder.y = -54 + Math.abs(Math.sin(time * 2.5)) * 3;
                head.y = shoulder.y - 14;

                shoulder.x = facing * 4;
                head.x = facing * 6;

                leftFoot = { x: legSwing * 18 * facing, y: Math.max(0, -legSwing * 10) };
                rightFoot = { x: -legSwing * 18 * facing, y: Math.max(0, legSwing * 10) };

                leftKnee = { x: (leftFoot.x + hip.x) / 2 + facing * 4, y: -20 };
                rightKnee = { x: (rightFoot.x + hip.x) / 2 - facing * 4, y: -20 };

                leftHand = { x: armSwing * 16 * facing, y: -42 + armSwing * 6 };
                rightHand = { x: -armSwing * 16 * facing, y: -42 - armSwing * 6 };
            }

        } else if (player.state === 'JUMP') {
            hip.y = -36;
            shoulder.y = -52;
            head.y = -66;
            head.x = facing * 3;

            rightHand = { x: facing * 16, y: -46 };
            leftHand = { x: -facing * 16, y: -42 };

            leftFoot = { x: -facing * 10, y: -12 };
            leftKnee = { x: -facing * 16, y: -28 };

            rightFoot = { x: facing * 12, y: -22 };
            rightKnee = { x: facing * 18, y: -38 };

        } else if (player.state === 'VICTORY' || player.state === 'VICTORY_IDLE') {
            hip.y = -36;
            shoulder.y = -52;
            head.y = -66;
            head.x = facing * 2;

            rightHand = { x: facing * 10, y: -90 };
            leftHand = { x: -facing * 18, y: -38 };

            leftFoot = { x: -facing * 10, y: -12 };
            leftKnee = { x: -facing * 16, y: -28 };

            rightFoot = { x: facing * 12, y: -22 };
            rightKnee = { x: facing * 18, y: -38 };

        } else if (player.state === 'HANG') {
            hip = { x: -facing * 8, y: -30 };
            shoulder = { x: -facing * 6, y: -48 };
            head = { x: -facing * 4, y: -62 };

            leftHand = { x: facing * 14, y: -68 };
            rightHand = { x: facing * 16, y: -68 };

            const dangle = Math.sin(time * 0.8) * 3;
            leftFoot = { x: -facing * 10 + dangle, y: 0 };
            rightFoot = { x: -facing * 6 - dangle, y: 0 };
            leftKnee = { x: -facing * 8, y: -16 };
            rightKnee = { x: -facing * 6, y: -16 };

        } else if (player.state === 'LADDER') {
            const climbPhase = player.y * 0.15;
            const handCycle = Math.sin(climbPhase);
            const footCycle = Math.cos(climbPhase);

            hip = { x: 0, y: -38 };
            shoulder = { x: 0, y: -54 };
            head = { x: 0, y: -68 };

            leftHand = { x: -14, y: -62 + handCycle * 14 };
            rightHand = { x: 14, y: -62 - handCycle * 14 };

            leftFoot = { x: -10, y: 0 - footCycle * 12 };
            rightFoot = { x: 10, y: 0 + footCycle * 12 };

            leftKnee = { x: -14, y: -18 - footCycle * 6 };
            rightKnee = { x: 14, y: -18 + footCycle * 6 };

        } else if (player.state === 'CLIMB') {
            const t = player.climbProgress;

            if (t < 0.5) {
                hip = { x: facing * 8, y: -45 };
                shoulder = { x: facing * 14, y: -58 };
                head = { x: facing * 16, y: -70 };

                leftHand = { x: facing * 20, y: -60 };
                rightHand = { x: facing * 22, y: -60 };

                rightFoot = { x: facing * 18, y: -48 };
                rightKnee = { x: facing * 22, y: -54 };

                leftFoot = { x: -facing * 4, y: -15 };
                leftKnee = { x: 0, y: -25 };
            } else {
                hip = { x: 0, y: -38 };
                shoulder = { x: 0, y: -54 };
                head = { x: 0, y: -68 };

                leftHand = { x: -10 * facing, y: -40 };
                rightHand = { x: 10 * facing, y: -40 };
                leftFoot = { x: -8 * facing, y: 0 };
                rightFoot = { x: 8 * facing, y: 0 };
                leftKnee = { x: -10 * facing, y: -18 };
                rightKnee = { x: 6 * facing, y: -18 };
            }
        }

        // Draw Skeleton Lines
        ctx.beginPath();
        ctx.moveTo(hip.x * scale, hip.y * scale);
        ctx.lineTo(shoulder.x * scale, shoulder.y * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shoulder.x * scale, shoulder.y * scale);
        ctx.lineTo(head.x * scale, head.y * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(head.x * scale, head.y * scale - 4 * scale, 9 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(shoulder.x * scale, shoulder.y * scale);
        ctx.lineTo(leftHand.x * scale, leftHand.y * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shoulder.x * scale, shoulder.y * scale);
        ctx.lineTo(rightHand.x * scale, rightHand.y * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hip.x * scale, hip.y * scale);
        ctx.lineTo(leftKnee.x * scale, leftKnee.y * scale);
        ctx.lineTo(leftFoot.x * scale, leftFoot.y * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hip.x * scale, hip.y * scale);
        ctx.lineTo(rightKnee.x * scale, rightKnee.y * scale);
        ctx.lineTo(rightFoot.x * scale, rightFoot.y * scale);
        ctx.stroke();

        ctx.restore();
    }

    // Game loop
    function gameLoop() {
        if (currentState === STATES.PLAYING || currentState === STATES.VICTORY) {
            updatePlayer();
            updateBoss();
            updateParticles();
            updateCamera();
        } else if (currentState === STATES.CUTSCENE) {
            updateCutscene();
            updateParticles();
        } else if (currentState === STATES.MENU || currentState === STATES.LEVEL_SELECT) {
            updateCamera();
            player.animTime += 0.05;
        }

        render();
        requestAnimationFrame(gameLoop);
    }

    // UI Event Listeners
    btnPlay.addEventListener('click', () => {
        initAudio();
        if (menuCard) {
            menuCard.classList.remove('animate-pop');
            menuCard.classList.add('animate-pop-out');
        }

        setTimeout(() => {
            mainMenuScreen.classList.remove('screen-active');
            mainMenuScreen.classList.add('hidden');
            if (menuCard) menuCard.classList.remove('animate-pop-out');

            levelSelectScreen.classList.remove('hidden');
            levelSelectScreen.classList.add('screen-active');

            if (levelCard) {
                levelCard.classList.remove('animate-pop');
                void levelCard.offsetWidth; // trigger reflow
                levelCard.classList.add('animate-pop');
            }

            currentState = STATES.LEVEL_SELECT;
        }, 280);
    });

    btnBackToMenu.addEventListener('click', () => {
        initAudio();
        if (levelCard) {
            levelCard.classList.remove('animate-pop');
            levelCard.classList.add('animate-pop-out');
        }

        setTimeout(() => {
            levelSelectScreen.classList.remove('screen-active');
            levelSelectScreen.classList.add('hidden');
            if (levelCard) levelCard.classList.remove('animate-pop-out');

            mainMenuScreen.classList.remove('hidden');
            mainMenuScreen.classList.add('screen-active');

            if (menuCard) {
                menuCard.classList.remove('animate-pop');
                void menuCard.offsetWidth; // trigger reflow
                menuCard.classList.add('animate-pop');
            }

            currentState = STATES.MENU;
        }, 280);
    });

    btnNextLevel.addEventListener('click', () => {
        initAudio();
        victoryScreen.classList.remove('screen-active');
        victoryScreen.classList.add('hidden');

        const nextLevelNum = currentLevelIndex + 1;
        if (levelsData[nextLevelNum]) {
            startLevelWithFade(nextLevelNum);
        } else {
            triggerFadeTransition(() => {
                player.reset();
                hudOverlay.classList.add('hidden');
                levelSelectScreen.classList.remove('hidden');
                levelSelectScreen.classList.add('screen-active');
                currentState = STATES.LEVEL_SELECT;
            });
        }
    });

    btnReplay.addEventListener('click', () => {
        initAudio();
        if (victoryFadeInterval) {
            clearInterval(victoryFadeInterval);
            victoryFadeInterval = null;
        }
        victoryScreen.classList.remove('screen-active');
        victoryScreen.classList.add('hidden');
        hudOverlay.classList.remove('hidden');

        triggerFadeTransition(() => {
            player.reset();
            currentState = STATES.PLAYING;
        });
    });

    btnToMenu.addEventListener('click', () => {
        initAudio();
        if (victoryFadeInterval) {
            clearInterval(victoryFadeInterval);
            victoryFadeInterval = null;
        }
        victoryScreen.classList.remove('screen-active');
        victoryScreen.classList.add('hidden');
        hudOverlay.classList.add('hidden');

        triggerFadeTransition(() => {
            player.reset();
            if (currentLevelIndex === 20) {
                levelSelectScreen.classList.remove('hidden');
                levelSelectScreen.classList.add('screen-active');
                currentState = STATES.LEVEL_SELECT;
            } else {
                mainMenuScreen.classList.remove('hidden');
                mainMenuScreen.classList.add('screen-active');
                currentState = STATES.MENU;
            }
        });
    });

    btnPause.addEventListener('click', () => {
        togglePause();
    });

    btnResume.addEventListener('click', () => {
        togglePause();
    });

    if (btnPauseReplay) {
        btnPauseReplay.addEventListener('click', () => {
            initAudio();
            pauseScreen.classList.remove('screen-active');
            pauseScreen.classList.add('hidden');
            triggerFadeTransition(() => {
                player.reset();
                currentState = STATES.PLAYING;
            });
        });
    }

    if (btnPauseToLevels) {
        btnPauseToLevels.addEventListener('click', () => {
            initAudio();
            pauseScreen.classList.remove('screen-active');
            pauseScreen.classList.add('hidden');
            hudOverlay.classList.add('hidden');

            triggerFadeTransition(() => {
                player.reset();
                levelSelectScreen.classList.remove('hidden');
                levelSelectScreen.classList.add('screen-active');
                currentState = STATES.LEVEL_SELECT;
            });
        });
    }

    if (btnDefeatReplay) {
        btnDefeatReplay.addEventListener('click', () => {
            initAudio();
            defeatScreen.classList.remove('screen-active');
            defeatScreen.classList.add('hidden');
            triggerFadeTransition(() => {
                player.reset();
                currentState = STATES.PLAYING;
            });
        });
    }

    if (btnDefeatToLevels) {
        btnDefeatToLevels.addEventListener('click', () => {
            initAudio();
            defeatScreen.classList.remove('screen-active');
            defeatScreen.classList.add('hidden');
            hudOverlay.classList.add('hidden');
            if (bossHud) bossHud.classList.add('hidden');

            triggerFadeTransition(() => {
                player.reset();
                levelSelectScreen.classList.remove('hidden');
                levelSelectScreen.classList.add('screen-active');
                currentState = STATES.LEVEL_SELECT;
            });
        });
    }

    requestAnimationFrame(gameLoop);
})();

