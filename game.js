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
    const bossName = document.getElementById('bossName');
    const bossHealthBar = document.getElementById('bossHealthBar');
    const bossPhaseText = document.getElementById('bossPhaseText');

    // Page 2 Navigation & Cutscene Elements
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const dotPage1 = document.getElementById('dotPage1');
    const dotPage2 = document.getElementById('dotPage2');
    const levelPageBadge = document.getElementById('levelPageBadge');
    const cutsceneOverlay = document.getElementById('cutsceneOverlay');
    const cutsceneChapter = document.getElementById('cutsceneChapter');
    const cutsceneText = document.getElementById('cutsceneText');
    const btnSkipCutscene = document.getElementById('btnSkipCutscene');
    const ctrlTurnik = document.getElementById('ctrlTurnik');
    const ctrlRope = document.getElementById('ctrlRope');
    const ctrlLadder = document.getElementById('ctrlLadder');

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
            } else if (type === 'birdChirp') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2600, now);
                osc.frequency.exponentialRampToValueAtTime(3400, now + 0.08);
                osc.frequency.exponentialRampToValueAtTime(3100, now + 0.16);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.16);
            } else if (type === 'rustle') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.14);
            } else if (type === 'natureStart') {
                const chord = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
                chord.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const noteTime = now + idx * 0.09;
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, noteTime);
                    gain.gain.setValueAtTime(0.22, noteTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(noteTime);
                    osc.stop(noteTime + 0.4);
                });
            } else if (type === 'rockHit') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(110, now);
                osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
                gain.gain.setValueAtTime(0.45, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
            } else if (type === 'laserCharge') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(750, now + 1.8);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.linearRampToValueAtTime(0.28, now + 1.8);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 1.8);
            } else if (type === 'laserFire') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.exponentialRampToValueAtTime(70, now + 1.0);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 1.0);
            } else if (type === 'treeSwing') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
                gain.gain.setValueAtTime(0.38, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'bambooSpikes') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
                gain.gain.setValueAtTime(0.32, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'crack') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'coldWind') {
                const chord = [220.00, 293.66, 349.23, 440.00];
                chord.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const noteTime = now + idx * 0.15;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, noteTime);
                    osc.frequency.linearRampToValueAtTime(freq * 0.95, noteTime + 1.2);
                    gain.gain.setValueAtTime(0.12, noteTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(noteTime);
                    osc.stop(noteTime + 1.2);
                });
            } else if (type === 'golemRoar') {
                // Primal deep subterranean monster roar
                const osc1 = audioCtx.createOscillator();
                const gain1 = audioCtx.createGain();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(60, now);
                osc1.frequency.exponentialRampToValueAtTime(155, now + 0.35);
                osc1.frequency.exponentialRampToValueAtTime(45, now + 1.8);
                gain1.gain.setValueAtTime(0.65, now);
                gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.8);
                osc1.connect(gain1);
                gain1.connect(audioCtx.destination);
                osc1.start(now);
                osc1.stop(now + 1.8);

                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.type = 'square';
                osc2.frequency.setValueAtTime(85, now);
                osc2.frequency.exponentialRampToValueAtTime(185, now + 0.45);
                osc2.frequency.exponentialRampToValueAtTime(35, now + 1.9);
                gain2.gain.setValueAtTime(0.45, now);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 1.9);
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.start(now);
                osc2.stop(now + 1.9);
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

        if (currentState === STATES.CUTSCENE) {
            if (cutsceneIntro21 && cutsceneIntro21.active) {
                if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
                    finishLevel21IntroCutscene();
                    return;
                }
            } else if (typeof golemCutscene !== 'undefined' && golemCutscene && golemCutscene.active) {
                if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
                    finishGolemDefeatCutscene();
                    return;
                }
            } else if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active) {
                if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
                    finishGolemIntroCutscene();
                    return;
                }
            }
        }

        if (currentState === STATES.LEVEL_SELECT || (levelSelectScreen && !levelSelectScreen.classList.contains('hidden'))) {
            if (e.code === 'ArrowRight' && currentSelectPage === 1) {
                currentSelectPage = 2;
                playSound('jump');
                generateLevelsGrid();
                return;
            } else if (e.code === 'ArrowLeft' && currentSelectPage === 2) {
                currentSelectPage = 1;
                playSound('jump');
                generateLevelsGrid();
                return;
            }
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

    // --- LEVELS DATABASE & PAGE PROGRESSION ---
    let unlockedPage1Levels = 20; // 1st Page: all 20 levels unlocked
    let unlockedPage2Levels = 40; // 2nd Page: levels 21 to 40 unlocked!
    let currentSelectPage = 1;    // 1: Building (levels 1-20), 2: Nature (levels 21-40)
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
        },
        21: {
            id: 21,
            title: "Уровень 21",
            theme: "nature",
            worldWidth: 10500,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 10500, h: 140, type: 'ground' }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 440, w: 150, h: 100, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 980, y: 350, w: 180, h: 190, isStone: true },
                // 3rd Object: Камень 3 (Высокая скала для запрыгивания)
                { id: 'stone3', x: 1320, y: 250, w: 220, h: 290, isStone: true },
                // 5th Object: Камень 4 (Плато приземления после дерева 1)
                { id: 'stone4', x: 2150, y: 240, w: 260, h: 300, isStone: true },
                // 7th Object: Камень 5 (Каменный столб после лианы 1)
                { id: 'stone5', x: 3150, y: 220, w: 200, h: 320, isStone: true },
                // 8th Object: Камень 6 (Монолит с деревянной лестницей 1, высота y: 60)
                { id: 'stone6', x: 3550, y: 60, w: 260, h: 480, isStone: true, noLedgeGrab: true },
                // 11th Object: Камень 7 (Уступ приземления после лианы 2)
                { id: 'stone7', x: 4920, y: 160, w: 240, h: 380, isStone: true },
                // 12th Object: Камень 8 (Наземный речной валун - без потолочных камней!)
                { id: 'stone8', x: 5320, y: 320, w: 200, h: 220, isStone: true },
                // 13th Object: Камень 9 (Ступенчатый камень)
                { id: 'stone9', x: 5680, y: 260, w: 180, h: 280, isStone: true },
                // 15th Object: Камень 10 (Каменная гряда после дерева 3)
                { id: 'stone10', x: 6500, y: 200, w: 260, h: 340, isStone: true },
                // 18th Object: Камень 11 (Большая скала с деревянной лестницей 2, высота y: 0)
                { id: 'stone11', x: 7980, y: 0, w: 280, h: 540, isStone: true, noLedgeGrab: true },
                // 20th Object: Камень 12 (Каменный пьедестал после лианы 4)
                { id: 'stone12', x: 9020, y: 140, w: 220, h: 400, isStone: true },
                // 21st Object: Камень 13 (Вершинный камень с флагом победы!)
                { id: 'stone13', x: 9420, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 4th Object: Дерево 1 с прочной веткой для раскачки (y: 150)
                { id: 'tree1', x: 1720, y: 150, length: 90, trunkX: 1675, isTree: true },
                // 9th Object: Дерево 2 с высокой кроновой веткой (y: -40)
                { id: 'tree2', x: 4050, y: -40, length: 90, trunkX: 4005, isTree: true },
                // 14th Object: Дерево 3 (Ива) с веткой (y: 120)
                { id: 'tree3', x: 6080, y: 120, length: 90, trunkX: 6035, isTree: true },
                // 17th Object: Дерево 4 (Секвойя) с веткой (y: 60)
                { id: 'tree4', x: 7550, y: 60, length: 90, trunkX: 7505, isTree: true }
            ],
            ropes: [
                // 6th Object: Лиана 1, свисающая с высокого дерева (ствол x: 2610, ветка к x: 2700)
                { id: 'liana1', x: 2700, anchorY: -70, length: 260, trunkX: 2610, isVine: true },
                // 10th Object: Лиана 2, свисающая с высокого дерева (ствол x: 4410, ветка к x: 4500)
                { id: 'liana2', x: 4500, anchorY: -160, length: 250, trunkX: 4410, isVine: true },
                // 16th Object: Лиана 3, свисающая с высокого дерева (ствол x: 6960, ветка к x: 7050)
                { id: 'liana3', x: 7050, anchorY: -70, length: 260, trunkX: 6960, isVine: true },
                // 19th Object: Лиана 4, свисающая с высокого дерева (ствол x: 8460, ветка к x: 8550)
                { id: 'liana4', x: 8550, anchorY: -180, length: 280, trunkX: 8460, isVine: true }
            ],
            ladders: [
                // 8th Object: Лианы на камне 6 (стебли и петли из лиан, покрывающие скалу)
                { x: 3570, topY: 60, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 18th Object: Лианы на камне 11 (стебли и петли из лиан, покрывающие скалу)
                { x: 8000, topY: 0, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 9620, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        }
,
        22: {
            id: 22,
            title: "Уровень 22",
            theme: "nature",
            worldWidth: 13311,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1460, h: 140, type: 'ground' },
                { x: 2774, y: 540, w: 945, h: 140, type: 'ground' },
                { x: 5045, y: 540, w: 316, h: 140, type: 'ground' },
                { x: 6167, y: 540, w: 1900, h: 140, type: 'ground' },
                { x: 9361, y: 540, w: 944, h: 140, type: 'ground' },
                { x: 11622, y: 540, w: 1689, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1460, endX: 2774 },
                { startX: 3719, endX: 5045 },
                { startX: 5361, endX: 6167 },
                { startX: 8067, endX: 9361 },
                { startX: 10305, endX: 11622 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 421, w: 174, h: 119, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1172, y: 231, w: 228, h: 309, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2774, y: 236, w: 242, h: 304, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3376, y: 52, w: 283, h: 488, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 5 (Высокая скала-уступ)
                { id: 'stone5', x: 5045, y: 215, w: 256, h: 325, isStone: true },
                // 11th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 6167, y: 444, w: 168, h: 96, isStone: true, isSmall: true },
                // 12th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6715, y: -200, w: 223, h: 690, isStone: true, noLedgeGrab: true },
                // 13th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 7298, y: 356, w: 202, h: 184, isStone: true },
                // 14th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7840, y: 443, w: 167, h: 97, isStone: true, isSmall: true },
                // 17th Object: Камень 10 (Монолит с лианами для подъема)
                { id: 'stone10', x: 9361, y: 56, w: 275, h: 484, isStone: true, noLedgeGrab: true },
                // 18th Object: Камень 11 (Парящая замшелая плита)
                { id: 'stone11', x: 10006, y: 163, w: 239, h: 65, isStone: true },
                // 21st Object: Камень 12 (Средний гранитный валун)
                { id: 'stone12', x: 11622, y: 335, w: 189, h: 205, isStone: true },
                // 22nd Object: Камень 13 (Вершинная скала с флагом победы!)
                { id: 'stone13', x: 12151, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 129)
                { id: 'tree1', x: 1762, y: 129, length: 90, trunkX: 1717, isTree: true },
                // 7th Object: Дерево 2 с прочной веткой над пропастью (y: 105)
                { id: 'tree2', x: 4029, y: 105, length: 90, trunkX: 3984, isTree: true },
                // 10th Object: Дерево 3 с прочной веткой над пропастью (y: 128)
                { id: 'tree3', x: 5662, y: 128, length: 90, trunkX: 5617, isTree: true },
                // 16th Object: Дерево 4 с прочной веткой над пропастью (y: 145)
                { id: 'tree4', x: 8845, y: 145, length: 90, trunkX: 8800, isTree: true },
                // 20th Object: Дерево 5 с прочной веткой над пропастью (y: 131)
                { id: 'tree5', x: 11115, y: 131, length: 90, trunkX: 11070, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -117)
                { id: 'liana1', x: 2247, anchorY: -117, length: 265, trunkX: 2157, isVine: true },
                // 8th Object: Лиана 2, свисающая над пропастью (ветка y: -136)
                { id: 'liana2', x: 4516, anchorY: -136, length: 261, trunkX: 4426, isVine: true },
                // 15th Object: Лиана 3, свисающая над пропастью (ветка y: -140)
                { id: 'liana3', x: 8332, anchorY: -140, length: 284, trunkX: 8242, isVine: true },
                // 19th Object: Лиана 4, свисающая над пропастью (ветка y: -111)
                { id: 'liana4', x: 10595, anchorY: -111, length: 261, trunkX: 10505, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3398, topY: 52, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 17th Object: Лианы на камне 10
                { x: 9383, topY: 56, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 12351, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        23: {
            id: 23,
            title: "Уровень 23",
            theme: "nature",
            worldWidth: 13853,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1450, h: 140, type: 'ground' },
                { x: 2797, y: 540, w: 931, h: 140, type: 'ground' },
                { x: 4576, y: 540, w: 296, h: 140, type: 'ground' },
                { x: 6195, y: 540, w: 1869, h: 140, type: 'ground' },
                { x: 9379, y: 540, w: 860, h: 140, type: 'ground' },
                { x: 11074, y: 540, w: 291, h: 140, type: 'ground' },
                { x: 12693, y: 540, w: 1160, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1450, endX: 2797 },
                { startX: 3728, endX: 4576 },
                { startX: 4872, endX: 6195 },
                { startX: 8064, endX: 9379 },
                { startX: 10239, endX: 11074 },
                { startX: 11365, endX: 12693 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 423, w: 166, h: 117, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1152, y: 259, w: 238, h: 281, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2797, y: 247, w: 240, h: 293, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3404, y: 64, w: 264, h: 476, isStone: true, noLedgeGrab: true },
                // 8th Object: Камень 5 (Высокая скала-уступ)
                { id: 'stone5', x: 4576, y: 257, w: 236, h: 283, isStone: true },
                // 11th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 6195, y: 429, w: 151, h: 111, isStone: true, isSmall: true },
                // 12th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6726, y: -200, w: 227, h: 690, isStone: true, noLedgeGrab: true },
                // 13th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 7313, y: 355, w: 196, h: 185, isStone: true },
                // 14th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7849, y: 445, w: 155, h: 95, isStone: true, isSmall: true },
                // 17th Object: Камень 10 (Средний гранитный валун)
                { id: 'stone10', x: 9379, y: 358, w: 200, h: 182, isStone: true },
                // 18th Object: Камень 11 (Монолит с лианами для подъема)
                { id: 'stone11', x: 9919, y: 74, w: 260, h: 466, isStone: true, noLedgeGrab: true },
                // 20th Object: Камень 12 (Высокая скала-уступ)
                { id: 'stone12', x: 11074, y: 234, w: 231, h: 306, isStone: true },
                // 23rd Object: Камень 13 (Вершинная скала с флагом победы!)
                { id: 'stone13', x: 12693, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 4th Object: Дерево 1 с прочной веткой над пропастью (y: 117)
                { id: 'tree1', x: 2300, y: 117, length: 90, trunkX: 2255, isTree: true },
                // 9th Object: Дерево 2 с прочной веткой над пропастью (y: 122)
                { id: 'tree2', x: 5181, y: 122, length: 90, trunkX: 5136, isTree: true },
                // 16th Object: Дерево 3 с прочной веткой над пропастью (y: 105)
                { id: 'tree3', x: 8861, y: 105, length: 90, trunkX: 8816, isTree: true },
                // 21st Object: Дерево 4 с прочной веткой над пропастью (y: 117)
                { id: 'tree4', x: 11668, y: 117, length: 90, trunkX: 11623, isTree: true }
            ],
            ropes: [
                // 3rd Object: Лиана 1, свисающая над пропастью (ветка y: -111)
                { id: 'liana1', x: 1772, anchorY: -111, length: 267, trunkX: 1682, isVine: true },
                // 7th Object: Лиана 2, свисающая над пропастью (ветка y: -95)
                { id: 'liana2', x: 4038, anchorY: -95, length: 284, trunkX: 3948, isVine: true },
                // 10th Object: Лиана 3, свисающая над пропастью (ветка y: -105)
                { id: 'liana3', x: 5674, anchorY: -105, length: 271, trunkX: 5584, isVine: true },
                // 15th Object: Лиана 4, свисающая над пропастью (ветка y: -86)
                { id: 'liana4', x: 8332, anchorY: -86, length: 273, trunkX: 8242, isVine: true },
                // 19th Object: Лиана 5, свисающая над пропастью (ветка y: -100)
                { id: 'liana5', x: 10549, anchorY: -100, length: 277, trunkX: 10459, isVine: true },
                // 22nd Object: Лиана 6, свисающая над пропастью (ветка y: -122)
                { id: 'liana6', x: 12157, anchorY: -122, length: 273, trunkX: 12067, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3426, topY: 64, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 18th Object: Лианы на камне 11
                { x: 9941, topY: 74, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 12893, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        24: {
            id: 24,
            title: "Уровень 24",
            theme: "nature",
            worldWidth: 14512,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1484, h: 140, type: 'ground' },
                { x: 2332, y: 540, w: 322, h: 140, type: 'ground' },
                { x: 3485, y: 540, w: 1905, h: 140, type: 'ground' },
                { x: 6710, y: 540, w: 864, h: 140, type: 'ground' },
                { x: 8895, y: 540, w: 1881, h: 140, type: 'ground' },
                { x: 11592, y: 540, w: 323, h: 140, type: 'ground' },
                { x: 12719, y: 540, w: 1793, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1484, endX: 2332 },
                { startX: 2654, endX: 3485 },
                { startX: 5390, endX: 6710 },
                { startX: 7574, endX: 8895 },
                { startX: 10776, endX: 11592 },
                { startX: 11915, endX: 12719 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 443, w: 171, h: 97, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1165, y: 248, w: 259, h: 292, isStone: true },
                // 4th Object: Камень 3 (Монолит с лианами для подъема)
                { id: 'stone3', x: 2332, y: 73, w: 262, h: 467, isStone: true, noLedgeGrab: true },
                // 6th Object: Камень 4 (Средний гранитный валун)
                { id: 'stone4', x: 3485, y: 332, w: 199, h: 208, isStone: true },
                // 7th Object: Камень 5 (Низкий валун-препятствие)
                { id: 'stone5', x: 4024, y: 443, w: 157, h: 97, isStone: true, isSmall: true },
                // 8th Object: Камень 6 (Скалистая арка с лазом под ней)
                { id: 'stone6', x: 4561, y: -200, w: 225, h: 690, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 7 (Средний гранитный валун)
                { id: 'stone7', x: 5146, y: 329, w: 184, h: 211, isStone: true },
                // 12th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6710, y: 344, w: 185, h: 196, isStone: true },
                // 13th Object: Камень 9 (Монолит с лианами для подъема)
                { id: 'stone9', x: 7235, y: 72, w: 279, h: 468, isStone: true, noLedgeGrab: true },
                // 16th Object: Камень 10 (Низкий валун-препятствие)
                { id: 'stone10', x: 8895, y: 431, w: 154, h: 109, isStone: true, isSmall: true },
                // 17th Object: Камень 11 (Скалистая арка с лазом под ней)
                { id: 'stone11', x: 9429, y: -200, w: 236, h: 690, isStone: true, noLedgeGrab: true },
                // 18th Object: Камень 12 (Средний гранитный валун)
                { id: 'stone12', x: 10025, y: 339, w: 190, h: 201, isStone: true },
                // 19th Object: Камень 13 (Низкий валун-препятствие)
                { id: 'stone13', x: 10555, y: 434, w: 161, h: 106, isStone: true, isSmall: true },
                // 21st Object: Камень 14 (Монолит с лианами для подъема)
                { id: 'stone14', x: 11592, y: 71, w: 263, h: 469, isStone: true, noLedgeGrab: true },
                // 23rd Object: Камень 15 (Высокая скала-уступ)
                { id: 'stone15', x: 12719, y: 226, w: 244, h: 314, isStone: true },
                // 24th Object: Камень 16 (Вершинная скала с флагом победы!)
                { id: 'stone16', x: 13352, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 105)
                { id: 'tree1', x: 1813, y: 105, length: 90, trunkX: 1768, isTree: true },
                // 10th Object: Дерево 2 с прочной веткой над пропастью (y: 110)
                { id: 'tree2', x: 5670, y: 110, length: 90, trunkX: 5625, isTree: true },
                // 15th Object: Дерево 3 с прочной веткой над пропастью (y: 111)
                { id: 'tree3', x: 8402, y: 111, length: 90, trunkX: 8357, isTree: true },
                // 22nd Object: Дерево 4 с прочной веткой над пропастью (y: 127)
                { id: 'tree4', x: 12225, y: 127, length: 90, trunkX: 12180, isTree: true }
            ],
            ropes: [
                // 5th Object: Лиана 1, свисающая над пропастью (ветка y: -141)
                { id: 'liana1', x: 2964, anchorY: -141, length: 263, trunkX: 2874, isVine: true },
                // 11th Object: Лиана 2, свисающая над пропастью (ветка y: -126)
                { id: 'liana2', x: 6168, anchorY: -126, length: 276, trunkX: 6078, isVine: true },
                // 14th Object: Лиана 3, свисающая над пропастью (ветка y: -126)
                { id: 'liana3', x: 7884, anchorY: -126, length: 276, trunkX: 7794, isVine: true },
                // 20th Object: Лиана 4, свисающая над пропастью (ветка y: -88)
                { id: 'liana4', x: 11050, anchorY: -88, length: 275, trunkX: 10960, isVine: true }
            ],
            ladders: [
                // 4th Object: Лианы на камне 3
                { x: 2354, topY: 73, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 13th Object: Лианы на камне 9
                { x: 7257, topY: 72, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 21st Object: Лианы на камне 14
                { x: 11614, topY: 71, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 13552, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        25: {
            id: 25,
            title: "Уровень 25",
            theme: "nature",
            worldWidth: 15079,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1416, h: 140, type: 'ground' },
                { x: 2759, y: 540, w: 296, h: 140, type: 'ground' },
                { x: 3901, y: 540, w: 326, h: 140, type: 'ground' },
                { x: 5046, y: 540, w: 876, h: 140, type: 'ground' },
                { x: 6736, y: 540, w: 1388, h: 140, type: 'ground' },
                { x: 8915, y: 540, w: 845, h: 140, type: 'ground' },
                { x: 11038, y: 540, w: 936, h: 140, type: 'ground' },
                { x: 13307, y: 540, w: 1772, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1416, endX: 2759 },
                { startX: 3055, endX: 3901 },
                { startX: 4227, endX: 5046 },
                { startX: 5922, endX: 6736 },
                { startX: 8124, endX: 8915 },
                { startX: 9760, endX: 11038 },
                { startX: 11974, endX: 13307 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 440, w: 172, h: 100, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1144, y: 347, w: 212, h: 193, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2759, y: 220, w: 236, h: 320, isStone: true },
                // 7th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3901, y: 60, w: 266, h: 480, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 5 (Высокая скала-уступ)
                { id: 'stone5', x: 5046, y: 213, w: 223, h: 327, isStone: true },
                // 10th Object: Камень 6 (Средний гранитный валун)
                { id: 'stone6', x: 5648, y: 352, w: 214, h: 188, isStone: true },
                // 12th Object: Камень 7 (Низкий валун-препятствие)
                { id: 'stone7', x: 6736, y: 441, w: 178, h: 99, isStone: true, isSmall: true },
                // 13th Object: Камень 8 (Скалистая арка с лазом под ней)
                { id: 'stone8', x: 7294, y: -200, w: 222, h: 690, isStone: true, noLedgeGrab: true },
                // 14th Object: Камень 9 (Средний гранитный валун)
                { id: 'stone9', x: 7876, y: 347, w: 188, h: 193, isStone: true },
                // 16th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8915, y: 247, w: 222, h: 293, isStone: true },
                // 17th Object: Камень 11 (Средний гранитный валун)
                { id: 'stone11', x: 9519, y: 340, w: 181, h: 200, isStone: true },
                // 20th Object: Камень 12 (Монолит с лианами для подъема)
                { id: 'stone12', x: 11038, y: 55, w: 269, h: 485, isStone: true, noLedgeGrab: true },
                // 21st Object: Камень 13 (Парящая замшелая плита)
                { id: 'stone13', x: 11677, y: 172, w: 237, h: 65, isStone: true },
                // 24th Object: Камень 14 (Высокая скала-уступ)
                { id: 'stone14', x: 13307, y: 231, w: 224, h: 309, isStone: true },
                // 25th Object: Камень 15 (Вершинная скала с флагом победы!)
                { id: 'stone15', x: 13919, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 118)
                { id: 'tree1', x: 1696, y: 118, length: 90, trunkX: 1651, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 147)
                { id: 'tree2', x: 4537, y: 147, length: 90, trunkX: 4492, isTree: true },
                // 15th Object: Дерево 3 с прочной веткой над пропастью (y: 149)
                { id: 'tree3', x: 8404, y: 149, length: 90, trunkX: 8359, isTree: true },
                // 18th Object: Дерево 4 с прочной веткой над пропастью (y: 107)
                { id: 'tree4', x: 10040, y: 107, length: 90, trunkX: 9995, isTree: true },
                // 23rd Object: Дерево 5 с прочной веткой над пропастью (y: 143)
                { id: 'tree5', x: 12795, y: 143, length: 90, trunkX: 12750, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -103)
                { id: 'liana1', x: 2215, anchorY: -103, length: 276, trunkX: 2125, isVine: true },
                // 6th Object: Лиана 2, свисающая над пропастью (ветка y: -104)
                { id: 'liana2', x: 3381, anchorY: -104, length: 276, trunkX: 3291, isVine: true },
                // 11th Object: Лиана 3, свисающая над пропастью (ветка y: -94)
                { id: 'liana3', x: 6202, anchorY: -94, length: 279, trunkX: 6112, isVine: true },
                // 19th Object: Лиана 4, свисающая над пропастью (ветка y: -137)
                { id: 'liana4', x: 10533, anchorY: -137, length: 284, trunkX: 10443, isVine: true },
                // 22nd Object: Лиана 5, свисающая над пропастью (ветка y: -127)
                { id: 'liana5', x: 12264, anchorY: -127, length: 265, trunkX: 12174, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 4
                { x: 3923, topY: 60, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 20th Object: Лианы на камне 12
                { x: 11060, topY: 55, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 14119, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        26: {
            id: 26,
            title: "Уровень 26",
            theme: "nature",
            worldWidth: 15392,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1421, h: 140, type: 'ground' },
                { x: 2731, y: 540, w: 1346, h: 140, type: 'ground' },
                { x: 5427, y: 540, w: 894, h: 140, type: 'ground' },
                { x: 7088, y: 540, w: 1367, h: 140, type: 'ground' },
                { x: 9245, y: 540, w: 308, h: 140, type: 'ground' },
                { x: 10890, y: 540, w: 1461, h: 140, type: 'ground' },
                { x: 13621, y: 540, w: 1771, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1421, endX: 2731 },
                { startX: 4077, endX: 5427 },
                { startX: 6321, endX: 7088 },
                { startX: 8455, endX: 9245 },
                { startX: 9553, endX: 10890 },
                { startX: 12351, endX: 13621 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 423, w: 167, h: 117, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1163, y: 327, w: 198, h: 213, isStone: true },
                // 5th Object: Камень 3 (Средний гранитный валун)
                { id: 'stone3', x: 2731, y: 349, w: 182, h: 191, isStone: true },
                // 6th Object: Камень 4 (Низкий валун-препятствие)
                { id: 'stone4', x: 3253, y: 440, w: 161, h: 100, isStone: true, isSmall: true },
                // 7th Object: Камень 5 (Монолит с лианами для подъема)
                { id: 'stone5', x: 3748, y: 55, w: 269, h: 485, isStone: true, noLedgeGrab: true },
                // 10th Object: Камень 6 (Высокая скала-уступ)
                { id: 'stone6', x: 5427, y: 260, w: 257, h: 280, isStone: true },
                // 11th Object: Камень 7 (Средний гранитный валун)
                { id: 'stone7', x: 6059, y: 323, w: 202, h: 217, isStone: true },
                // 13th Object: Камень 8 (Низкий валун-препятствие)
                { id: 'stone8', x: 7088, y: 439, w: 154, h: 101, isStone: true, isSmall: true },
                // 14th Object: Камень 9 (Скалистая арка с лазом под ней)
                { id: 'stone9', x: 7622, y: -200, w: 227, h: 690, isStone: true, noLedgeGrab: true },
                // 15th Object: Камень 10 (Средний гранитный валун)
                { id: 'stone10', x: 8209, y: 337, w: 186, h: 203, isStone: true },
                // 17th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9245, y: 244, w: 248, h: 296, isStone: true },
                // 20th Object: Камень 12 (Монолит с лианами для подъема)
                { id: 'stone12', x: 10890, y: 64, w: 265, h: 476, isStone: true, noLedgeGrab: true },
                // 21st Object: Камень 13 (Парящая замшелая плита)
                { id: 'stone13', x: 11525, y: 182, w: 244, h: 65, isStone: true },
                // 22nd Object: Камень 14 (Низкий валун-препятствие)
                { id: 'stone14', x: 12119, y: 429, w: 172, h: 111, isStone: true, isSmall: true },
                // 25th Object: Камень 15 (Высокая скала-уступ)
                { id: 'stone15', x: 13621, y: 224, w: 246, h: 316, isStone: true },
                // 26th Object: Камень 16 (Вершинная скала с флагом победы!)
                { id: 'stone16', x: 14232, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 137)
                { id: 'tree1', x: 1701, y: 137, length: 90, trunkX: 1656, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 135)
                { id: 'tree2', x: 4387, y: 135, length: 90, trunkX: 4342, isTree: true },
                // 12th Object: Дерево 3 с прочной веткой над пропастью (y: 117)
                { id: 'tree3', x: 6601, y: 117, length: 90, trunkX: 6556, isTree: true },
                // 19th Object: Дерево 4 с прочной веткой над пропастью (y: 113)
                { id: 'tree4', x: 10393, y: 113, length: 90, trunkX: 10348, isTree: true },
                // 24th Object: Дерево 5 с прочной веткой над пропастью (y: 123)
                { id: 'tree5', x: 13131, y: 123, length: 90, trunkX: 13086, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -105)
                { id: 'liana1', x: 2213, anchorY: -105, length: 280, trunkX: 2123, isVine: true },
                // 9th Object: Лиана 2, свисающая над пропастью (ветка y: -112)
                { id: 'liana2', x: 4907, anchorY: -112, length: 266, trunkX: 4817, isVine: true },
                // 16th Object: Лиана 3, свисающая над пропастью (ветка y: -132)
                { id: 'liana3', x: 8735, anchorY: -132, length: 262, trunkX: 8645, isVine: true },
                // 18th Object: Лиана 4, свисающая над пропастью (ветка y: -132)
                { id: 'liana4', x: 9854, anchorY: -132, length: 280, trunkX: 9764, isVine: true },
                // 23rd Object: Лиана 5, свисающая над пропастью (ветка y: -123)
                { id: 'liana5', x: 12622, anchorY: -123, length: 270, trunkX: 12532, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 5
                { x: 3770, topY: 55, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 20th Object: Лианы на камне 12
                { x: 10912, topY: 64, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 14432, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        27: {
            id: 27,
            title: "Уровень 27",
            theme: "nature",
            worldWidth: 16306,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1401, h: 140, type: 'ground' },
                { x: 2718, y: 540, w: 1470, h: 140, type: 'ground' },
                { x: 5004, y: 540, w: 285, h: 140, type: 'ground' },
                { x: 6671, y: 540, w: 2578, h: 140, type: 'ground' },
                { x: 10580, y: 540, w: 1463, h: 140, type: 'ground' },
                { x: 12867, y: 540, w: 307, h: 140, type: 'ground' },
                { x: 14525, y: 540, w: 1781, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1401, endX: 2718 },
                { startX: 4188, endX: 5004 },
                { startX: 5289, endX: 6671 },
                { startX: 9249, endX: 10580 },
                { startX: 12043, endX: 12867 },
                { startX: 13174, endX: 14525 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 426, w: 175, h: 114, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1147, y: 359, w: 194, h: 181, isStone: true },
                // 5th Object: Камень 3 (Средний гранитный валун)
                { id: 'stone3', x: 2718, y: 322, w: 196, h: 218, isStone: true },
                // 6th Object: Камень 4 (Высокая скала-уступ)
                { id: 'stone4', x: 3254, y: 236, w: 246, h: 304, isStone: true },
                // 7th Object: Камень 5 (Монолит с лианами для подъема)
                { id: 'stone5', x: 3860, y: 53, w: 268, h: 487, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 6 (Высокая скала-уступ)
                { id: 'stone6', x: 5004, y: 227, w: 225, h: 313, isStone: true },
                // 12th Object: Камень 7 (Высокая скала-уступ)
                { id: 'stone7', x: 6671, y: 245, w: 227, h: 295, isStone: true },
                // 13th Object: Камень 8 (Низкий валун-препятствие)
                { id: 'stone8', x: 7273, y: 438, w: 165, h: 102, isStone: true, isSmall: true },
                // 14th Object: Камень 9 (Скалистая арка с лазом под ней)
                { id: 'stone9', x: 7818, y: -200, w: 230, h: 690, isStone: true, noLedgeGrab: true },
                // 15th Object: Камень 10 (Средний гранитный валун)
                { id: 'stone10', x: 8408, y: 335, w: 211, h: 205, isStone: true },
                // 16th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 8959, y: 248, w: 230, h: 292, isStone: true },
                // 19th Object: Камень 12 (Высокая скала-уступ)
                { id: 'stone12', x: 10580, y: 230, w: 229, h: 310, isStone: true },
                // 20th Object: Камень 13 (Средний гранитный валун)
                { id: 'stone13', x: 11180, y: 346, w: 186, h: 194, isStone: true },
                // 21st Object: Камень 14 (Монолит с лианами для подъема)
                { id: 'stone14', x: 11706, y: 74, w: 277, h: 466, isStone: true, noLedgeGrab: true },
                // 23rd Object: Камень 15 (Высокая скала-уступ)
                { id: 'stone15', x: 12867, y: 221, w: 247, h: 319, isStone: true },
                // 26th Object: Камень 16 (Высокая скала-уступ)
                { id: 'stone16', x: 14525, y: 225, w: 252, h: 315, isStone: true },
                // 27th Object: Камень 17 (Вершинная скала с флагом победы!)
                { id: 'stone17', x: 15146, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 106)
                { id: 'tree1', x: 1681, y: 106, length: 90, trunkX: 1636, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 146)
                { id: 'tree2', x: 4498, y: 146, length: 90, trunkX: 4453, isTree: true },
                // 11th Object: Дерево 3 с прочной веткой над пропастью (y: 131)
                { id: 'tree3', x: 6150, y: 131, length: 90, trunkX: 6105, isTree: true },
                // 17th Object: Дерево 4 с прочной веткой над пропастью (y: 124)
                { id: 'tree4', x: 9550, y: 124, length: 90, trunkX: 9505, isTree: true },
                // 22nd Object: Дерево 5 с прочной веткой над пропастью (y: 134)
                { id: 'tree5', x: 12353, y: 134, length: 90, trunkX: 12308, isTree: true },
                // 25th Object: Дерево 6 с прочной веткой над пропастью (y: 111)
                { id: 'tree6', x: 14016, y: 111, length: 90, trunkX: 13971, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -102)
                { id: 'liana1', x: 2192, anchorY: -102, length: 268, trunkX: 2102, isVine: true },
                // 10th Object: Лиана 2, свисающая над пропастью (ветка y: -138)
                { id: 'liana2', x: 5614, anchorY: -138, length: 273, trunkX: 5524, isVine: true },
                // 18th Object: Лиана 3, свисающая над пропастью (ветка y: -129)
                { id: 'liana3', x: 10065, anchorY: -129, length: 268, trunkX: 9975, isVine: true },
                // 24th Object: Лиана 4, свисающая над пропастью (ветка y: -108)
                { id: 'liana4', x: 13484, anchorY: -108, length: 268, trunkX: 13394, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 5
                { x: 3882, topY: 53, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 21st Object: Лианы на камне 14
                { x: 11728, topY: 74, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 15346, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        28: {
            id: 28,
            title: "Уровень 28",
            theme: "nature",
            worldWidth: 16780,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1395, h: 140, type: 'ground' },
                { x: 2708, y: 540, w: 319, h: 140, type: 'ground' },
                { x: 3873, y: 540, w: 1477, h: 140, type: 'ground' },
                { x: 6662, y: 540, w: 315, h: 140, type: 'ground' },
                { x: 7795, y: 540, w: 1965, h: 140, type: 'ground' },
                { x: 11103, y: 540, w: 1475, h: 140, type: 'ground' },
                { x: 13400, y: 540, w: 321, h: 140, type: 'ground' },
                { x: 15094, y: 540, w: 1686, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1395, endX: 2708 },
                { startX: 3027, endX: 3873 },
                { startX: 5350, endX: 6662 },
                { startX: 6977, endX: 7795 },
                { startX: 9760, endX: 11103 },
                { startX: 12578, endX: 13400 },
                { startX: 13721, endX: 15094 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 426, w: 167, h: 114, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1138, y: 351, w: 197, h: 189, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2708, y: 234, w: 259, h: 306, isStone: true },
                // 7th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3873, y: 60, w: 262, h: 480, isStone: true, noLedgeGrab: true },
                // 8th Object: Камень 5 (Парящая замшелая плита)
                { id: 'stone5', x: 4505, y: 202, w: 226, h: 65, isStone: true },
                // 9th Object: Камень 6 (Средний гранитный валун)
                { id: 'stone6', x: 5081, y: 336, w: 209, h: 204, isStone: true },
                // 12th Object: Камень 7 (Высокая скала-уступ)
                { id: 'stone7', x: 6662, y: 252, w: 255, h: 288, isStone: true },
                // 14th Object: Камень 8 (Низкий валун-препятствие)
                { id: 'stone8', x: 7795, y: 427, w: 158, h: 113, isStone: true, isSmall: true },
                // 15th Object: Камень 9 (Скалистая арка с лазом под ней)
                { id: 'stone9', x: 8333, y: -200, w: 237, h: 690, isStone: true, noLedgeGrab: true },
                // 16th Object: Камень 10 (Средний гранитный валун)
                { id: 'stone10', x: 8930, y: 353, w: 209, h: 187, isStone: true },
                // 17th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9479, y: 211, w: 221, h: 329, isStone: true },
                // 20th Object: Камень 12 (Высокая скала-уступ)
                { id: 'stone12', x: 11103, y: 215, w: 263, h: 325, isStone: true },
                // 21st Object: Камень 13 (Низкий валун-препятствие)
                { id: 'stone13', x: 11750, y: 431, w: 171, h: 109, isStone: true, isSmall: true },
                // 22nd Object: Камень 14 (Монолит с лианами для подъема)
                { id: 'stone14', x: 12257, y: 53, w: 261, h: 487, isStone: true, noLedgeGrab: true },
                // 24th Object: Камень 15 (Высокая скала-уступ)
                { id: 'stone15', x: 13400, y: 251, w: 261, h: 289, isStone: true },
                // 27th Object: Камень 16 (Средний гранитный валун)
                { id: 'stone16', x: 15094, y: 360, w: 186, h: 180, isStone: true },
                // 28th Object: Камень 17 (Вершинная скала с флагом победы!)
                { id: 'stone17', x: 15620, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 4th Object: Дерево 1 с прочной веткой над пропастью (y: 117)
                { id: 'tree1', x: 2199, y: 117, length: 90, trunkX: 2154, isTree: true },
                // 10th Object: Дерево 2 с прочной веткой над пропастью (y: 140)
                { id: 'tree2', x: 5630, y: 140, length: 90, trunkX: 5585, isTree: true },
                // 19th Object: Дерево 3 с прочной веткой над пропастью (y: 114)
                { id: 'tree3', x: 10593, y: 114, length: 90, trunkX: 10548, isTree: true },
                // 25th Object: Дерево 4 с прочной веткой над пропастью (y: 136)
                { id: 'tree4', x: 14035, y: 136, length: 90, trunkX: 13990, isTree: true }
            ],
            ropes: [
                // 3rd Object: Лиана 1, свисающая над пропастью (ветка y: -109)
                { id: 'liana1', x: 1675, anchorY: -109, length: 278, trunkX: 1585, isVine: true },
                // 6th Object: Лиана 2, свисающая над пропастью (ветка y: -127)
                { id: 'liana2', x: 3336, anchorY: -127, length: 275, trunkX: 3246, isVine: true },
                // 11th Object: Лиана 3, свисающая над пропастью (ветка y: -108)
                { id: 'liana3', x: 6125, anchorY: -108, length: 280, trunkX: 6035, isVine: true },
                // 13th Object: Лиана 4, свисающая над пропастью (ветка y: -122)
                { id: 'liana4', x: 7286, anchorY: -122, length: 280, trunkX: 7196, isVine: true },
                // 18th Object: Лиана 5, свисающая над пропастью (ветка y: -121)
                { id: 'liana5', x: 10081, anchorY: -121, length: 272, trunkX: 9991, isVine: true },
                // 23rd Object: Лиана 6, свисающая над пропастью (ветка y: -97)
                { id: 'liana6', x: 12888, anchorY: -97, length: 274, trunkX: 12798, isVine: true },
                // 26th Object: Лиана 7, свисающая над пропастью (ветка y: -129)
                { id: 'liana7', x: 14552, anchorY: -129, length: 273, trunkX: 14462, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 4
                { x: 3895, topY: 60, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 22nd Object: Лианы на камне 14
                { x: 12279, topY: 53, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 15820, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        29: {
            id: 29,
            title: "Уровень 29",
            theme: "nature",
            worldWidth: 17193,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1411, h: 140, type: 'ground' },
                { x: 2731, y: 540, w: 920, h: 140, type: 'ground' },
                { x: 4475, y: 540, w: 1402, h: 140, type: 'ground' },
                { x: 6654, y: 540, w: 756, h: 140, type: 'ground' },
                { x: 8192, y: 540, w: 338, h: 140, type: 'ground' },
                { x: 9326, y: 540, w: 2538, h: 140, type: 'ground' },
                { x: 13174, y: 540, w: 877, h: 140, type: 'ground' },
                { x: 15403, y: 540, w: 1790, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1411, endX: 2731 },
                { startX: 3651, endX: 4475 },
                { startX: 5877, endX: 6654 },
                { startX: 7410, endX: 8192 },
                { startX: 8530, endX: 9326 },
                { startX: 11864, endX: 13174 },
                { startX: 14051, endX: 15403 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 430, w: 164, h: 110, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1146, y: 345, w: 205, h: 195, isStone: true },
                // 5th Object: Камень 3 (Монолит с лианами для подъема)
                { id: 'stone3', x: 2731, y: 72, w: 265, h: 468, isStone: true, noLedgeGrab: true },
                // 6th Object: Камень 4 (Парящая замшелая плита)
                { id: 'stone4', x: 3366, y: 190, w: 225, h: 65, isStone: true },
                // 8th Object: Камень 5 (Низкий валун-препятствие)
                { id: 'stone5', x: 4475, y: 424, w: 168, h: 116, isStone: true, isSmall: true },
                // 9th Object: Камень 6 (Скалистая арка с лазом под ней)
                { id: 'stone6', x: 5023, y: -200, w: 233, h: 690, isStone: true, noLedgeGrab: true },
                // 10th Object: Камень 7 (Средний гранитный валун)
                { id: 'stone7', x: 5616, y: 353, w: 201, h: 187, isStone: true },
                // 12th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6654, y: 330, w: 199, h: 210, isStone: true },
                // 13th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7193, y: 424, w: 157, h: 116, isStone: true, isSmall: true },
                // 15th Object: Камень 10 (Монолит с лианами для подъема)
                { id: 'stone10', x: 8192, y: 52, w: 278, h: 488, isStone: true, noLedgeGrab: true },
                // 17th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9326, y: 248, w: 245, h: 292, isStone: true },
                // 18th Object: Камень 12 (Средний гранитный валун)
                { id: 'stone12', x: 9944, y: 359, w: 182, h: 181, isStone: true },
                // 19th Object: Камень 13 (Низкий валун-препятствие)
                { id: 'stone13', x: 10466, y: 429, w: 167, h: 111, isStone: true, isSmall: true },
                // 20th Object: Камень 14 (Скалистая арка с лазом под ней)
                { id: 'stone14', x: 11013, y: -200, w: 229, h: 690, isStone: true, noLedgeGrab: true },
                // 21st Object: Камень 15 (Средний гранитный валун)
                { id: 'stone15', x: 11602, y: 354, w: 202, h: 186, isStone: true },
                // 24th Object: Камень 16 (Средний гранитный валун)
                { id: 'stone16', x: 13174, y: 350, w: 205, h: 190, isStone: true },
                // 25th Object: Камень 17 (Монолит с лианами для подъема)
                { id: 'stone17', x: 13719, y: 59, w: 272, h: 481, isStone: true, noLedgeGrab: true },
                // 28th Object: Камень 18 (Высокая скала-уступ)
                { id: 'stone18', x: 15403, y: 220, w: 251, h: 320, isStone: true },
                // 29th Object: Камень 19 (Вершинная скала с флагом победы!)
                { id: 'stone19', x: 16033, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 151)
                { id: 'tree1', x: 1691, y: 151, length: 90, trunkX: 1646, isTree: true },
                // 11th Object: Дерево 2 с прочной веткой над пропастью (y: 133)
                { id: 'tree2', x: 6157, y: 133, length: 90, trunkX: 6112, isTree: true },
                // 16th Object: Дерево 3 с прочной веткой над пропастью (y: 151)
                { id: 'tree3', x: 8840, y: 151, length: 90, trunkX: 8795, isTree: true },
                // 22nd Object: Дерево 4 с прочной веткой над пропастью (y: 113)
                { id: 'tree4', x: 12144, y: 113, length: 90, trunkX: 12099, isTree: true },
                // 27th Object: Дерево 5 с прочной веткой над пропастью (y: 154)
                { id: 'tree5', x: 14897, y: 154, length: 90, trunkX: 14852, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -130)
                { id: 'liana1', x: 2214, anchorY: -130, length: 270, trunkX: 2124, isVine: true },
                // 7th Object: Лиана 2, свисающая над пропастью (ветка y: -138)
                { id: 'liana2', x: 3941, anchorY: -138, length: 280, trunkX: 3851, isVine: true },
                // 14th Object: Лиана 3, свисающая над пропастью (ветка y: -124)
                { id: 'liana3', x: 7673, anchorY: -124, length: 264, trunkX: 7583, isVine: true },
                // 23rd Object: Лиана 4, свисающая над пропастью (ветка y: -117)
                { id: 'liana4', x: 12655, anchorY: -117, length: 275, trunkX: 12565, isVine: true },
                // 26th Object: Лиана 5, свисающая над пропастью (ветка y: -124)
                { id: 'liana5', x: 14361, anchorY: -124, length: 275, trunkX: 14271, isVine: true }
            ],
            ladders: [
                // 5th Object: Лианы на камне 3
                { x: 2753, topY: 72, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 15th Object: Лианы на камне 10
                { x: 8214, topY: 52, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 25th Object: Лианы на камне 17
                { x: 13741, topY: 59, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 16233, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        30: {
            id: 30,
            title: "Уровень 30",
            theme: "nature",
            worldWidth: 17730,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1428, h: 140, type: 'ground' },
                { x: 2710, y: 540, w: 287, h: 140, type: 'ground' },
                { x: 3857, y: 540, w: 330, h: 140, type: 'ground' },
                { x: 5021, y: 540, w: 1946, h: 140, type: 'ground' },
                { x: 8299, y: 540, w: 886, h: 140, type: 'ground' },
                { x: 10470, y: 540, w: 268, h: 140, type: 'ground' },
                { x: 11527, y: 540, w: 2021, h: 140, type: 'ground' },
                { x: 14343, y: 540, w: 267, h: 140, type: 'ground' },
                { x: 15937, y: 540, w: 1793, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1428, endX: 2710 },
                { startX: 2997, endX: 3857 },
                { startX: 4187, endX: 5021 },
                { startX: 6967, endX: 8299 },
                { startX: 9185, endX: 10470 },
                { startX: 10738, endX: 11527 },
                { startX: 13548, endX: 14343 },
                { startX: 14610, endX: 15937 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 439, w: 179, h: 101, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1169, y: 344, w: 199, h: 196, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2710, y: 235, w: 227, h: 305, isStone: true },
                // 7th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3857, y: 65, w: 270, h: 475, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 5 (Низкий валун-препятствие)
                { id: 'stone5', x: 5021, y: 438, w: 163, h: 102, isStone: true, isSmall: true },
                // 10th Object: Камень 6 (Скалистая арка с лазом под ней)
                { id: 'stone6', x: 5564, y: -200, w: 223, h: 690, isStone: true, noLedgeGrab: true },
                // 11th Object: Камень 7 (Средний гранитный валун)
                { id: 'stone7', x: 6147, y: 311, w: 194, h: 229, isStone: true },
                // 12th Object: Камень 8 (Высокая скала-уступ)
                { id: 'stone8', x: 6681, y: 216, w: 226, h: 324, isStone: true },
                // 15th Object: Камень 9 (Высокая скала-уступ)
                { id: 'stone9', x: 8299, y: 221, w: 253, h: 319, isStone: true },
                // 16th Object: Камень 10 (Средний гранитный валун)
                { id: 'stone10', x: 8923, y: 359, w: 202, h: 181, isStone: true },
                // 19th Object: Камень 11 (Средний гранитный валун)
                { id: 'stone11', x: 10470, y: 358, w: 208, h: 182, isStone: true },
                // 21st Object: Камень 12 (Низкий валун-препятствие)
                { id: 'stone12', x: 11527, y: 423, w: 161, h: 117, isStone: true, isSmall: true },
                // 22nd Object: Камень 13 (Скалистая арка с лазом под ней)
                { id: 'stone13', x: 12068, y: -200, w: 235, h: 690, isStone: true, noLedgeGrab: true },
                // 23rd Object: Камень 14 (Средний гранитный валун)
                { id: 'stone14', x: 12663, y: 339, w: 208, h: 201, isStone: true },
                // 24th Object: Камень 15 (Монолит с лианами для подъема)
                { id: 'stone15', x: 13211, y: 54, w: 277, h: 486, isStone: true, noLedgeGrab: true },
                // 26th Object: Камень 16 (Средний гранитный валун)
                { id: 'stone16', x: 14343, y: 354, w: 207, h: 186, isStone: true },
                // 29th Object: Камень 17 (Высокая скала-уступ)
                { id: 'stone17', x: 15937, y: 211, w: 263, h: 329, isStone: true },
                // 30th Object: Камень 18 (Вершинная скала с флагом победы!)
                { id: 'stone18', x: 16570, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 142)
                { id: 'tree1', x: 1708, y: 142, length: 90, trunkX: 1663, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 153)
                { id: 'tree2', x: 4497, y: 153, length: 90, trunkX: 4452, isTree: true },
                // 14th Object: Дерево 3 с прочной веткой над пропастью (y: 147)
                { id: 'tree3', x: 7798, y: 147, length: 90, trunkX: 7753, isTree: true },
                // 17th Object: Дерево 4 с прочной веткой над пропастью (y: 154)
                { id: 'tree4', x: 9465, y: 154, length: 90, trunkX: 9420, isTree: true },
                // 25th Object: Дерево 5 с прочной веткой над пропастью (y: 107)
                { id: 'tree5', x: 13858, y: 107, length: 90, trunkX: 13813, isTree: true },
                // 28th Object: Дерево 6 с прочной веткой над пропастью (y: 105)
                { id: 'tree6', x: 15421, y: 105, length: 90, trunkX: 15376, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -92)
                { id: 'liana1', x: 2198, anchorY: -92, length: 263, trunkX: 2108, isVine: true },
                // 6th Object: Лиана 2, свисающая над пропастью (ветка y: -111)
                { id: 'liana2', x: 3317, anchorY: -111, length: 282, trunkX: 3227, isVine: true },
                // 13th Object: Лиана 3, свисающая над пропастью (ветка y: -115)
                { id: 'liana3', x: 7278, anchorY: -115, length: 265, trunkX: 7188, isVine: true },
                // 18th Object: Лиана 4, свисающая над пропастью (ветка y: -94)
                { id: 'liana4', x: 9951, anchorY: -94, length: 274, trunkX: 9861, isVine: true },
                // 20th Object: Лиана 5, свисающая над пропастью (ветка y: -94)
                { id: 'liana5', x: 11018, anchorY: -94, length: 276, trunkX: 10928, isVine: true },
                // 27th Object: Лиана 6, свисающая над пропастью (ветка y: -98)
                { id: 'liana6', x: 14890, anchorY: -98, length: 263, trunkX: 14800, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 4
                { x: 3879, topY: 65, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 24th Object: Лианы на камне 15
                { x: 13233, topY: 54, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 16770, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        31: {
            id: 31,
            title: "Уровень 31",
            theme: "nature",
            worldWidth: 18316,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1412, h: 140, type: 'ground' },
                { x: 2731, y: 540, w: 317, h: 140, type: 'ground' },
                { x: 3890, y: 540, w: 328, h: 140, type: 'ground' },
                { x: 5042, y: 540, w: 2525, h: 140, type: 'ground' },
                { x: 8873, y: 540, w: 280, h: 140, type: 'ground' },
                { x: 10529, y: 540, w: 2551, h: 140, type: 'ground' },
                { x: 13864, y: 540, w: 325, h: 140, type: 'ground' },
                { x: 15024, y: 540, w: 263, h: 140, type: 'ground' },
                { x: 16610, y: 540, w: 1706, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1412, endX: 2731 },
                { startX: 3048, endX: 3890 },
                { startX: 4218, endX: 5042 },
                { startX: 7567, endX: 8873 },
                { startX: 9153, endX: 10529 },
                { startX: 13080, endX: 13864 },
                { startX: 14189, endX: 15024 },
                { startX: 15287, endX: 16610 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 429, w: 152, h: 111, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1146, y: 334, w: 206, h: 206, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2731, y: 223, w: 257, h: 317, isStone: true },
                // 7th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3890, y: 55, w: 268, h: 485, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 5 (Низкий валун-препятствие)
                { id: 'stone5', x: 5042, y: 421, w: 150, h: 119, isStone: true, isSmall: true },
                // 10th Object: Камень 6 (Скалистая арка с лазом под ней)
                { id: 'stone6', x: 5572, y: -200, w: 224, h: 690, isStone: true, noLedgeGrab: true },
                // 11th Object: Камень 7 (Средний гранитный валун)
                { id: 'stone7', x: 6156, y: 360, w: 192, h: 180, isStone: true },
                // 12th Object: Камень 8 (Высокая скала-уступ)
                { id: 'stone8', x: 6688, y: 227, w: 261, h: 313, isStone: true },
                // 13th Object: Камень 9 (Средний гранитный валун)
                { id: 'stone9', x: 7320, y: 340, w: 187, h: 200, isStone: true },
                // 16th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8873, y: 229, w: 220, h: 311, isStone: true },
                // 19th Object: Камень 11 (Средний гранитный валун)
                { id: 'stone11', x: 10529, y: 353, w: 214, h: 187, isStone: true },
                // 20th Object: Камень 12 (Высокая скала-уступ)
                { id: 'stone12', x: 11083, y: 227, w: 251, h: 313, isStone: true },
                // 21st Object: Камень 13 (Низкий валун-препятствие)
                { id: 'stone13', x: 11696, y: 426, w: 163, h: 114, isStone: true, isSmall: true },
                // 22nd Object: Камень 14 (Скалистая арка с лазом под ней)
                { id: 'stone14', x: 12239, y: -200, w: 228, h: 690, isStone: true, noLedgeGrab: true },
                // 23rd Object: Камень 15 (Средний гранитный валун)
                { id: 'stone15', x: 12827, y: 360, w: 193, h: 180, isStone: true },
                // 25th Object: Камень 16 (Монолит с лианами для подъема)
                { id: 'stone16', x: 13864, y: 64, w: 265, h: 476, isStone: true, noLedgeGrab: true },
                // 27th Object: Камень 17 (Средний гранитный валун)
                { id: 'stone17', x: 15024, y: 355, w: 203, h: 185, isStone: true },
                // 30th Object: Камень 18 (Средний гранитный валун)
                { id: 'stone18', x: 16610, y: 352, w: 206, h: 188, isStone: true },
                // 31st Object: Камень 19 (Вершинная скала с флагом победы!)
                { id: 'stone19', x: 17156, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 129)
                { id: 'tree1', x: 1692, y: 129, length: 90, trunkX: 1647, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 123)
                { id: 'tree2', x: 4528, y: 123, length: 90, trunkX: 4483, isTree: true },
                // 14th Object: Дерево 3 с прочной веткой над пропастью (y: 153)
                { id: 'tree3', x: 7847, y: 153, length: 90, trunkX: 7802, isTree: true },
                // 18th Object: Дерево 4 с прочной веткой над пропастью (y: 116)
                { id: 'tree4', x: 10006, y: 116, length: 90, trunkX: 9961, isTree: true },
                // 24th Object: Дерево 5 с прочной веткой над пропастью (y: 139)
                { id: 'tree5', x: 13360, y: 139, length: 90, trunkX: 13315, isTree: true },
                // 29th Object: Дерево 6 с прочной веткой над пропастью (y: 125)
                { id: 'tree6', x: 16092, y: 125, length: 90, trunkX: 16047, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -143)
                { id: 'liana1', x: 2209, anchorY: -143, length: 263, trunkX: 2119, isVine: true },
                // 6th Object: Лиана 2, свисающая над пропастью (ветка y: -86)
                { id: 'liana2', x: 3377, anchorY: -86, length: 260, trunkX: 3287, isVine: true },
                // 15th Object: Лиана 3, свисающая над пропастью (ветка y: -118)
                { id: 'liana3', x: 8360, anchorY: -118, length: 273, trunkX: 8270, isVine: true },
                // 17th Object: Лиана 4, свисающая над пропастью (ветка y: -86)
                { id: 'liana4', x: 9480, anchorY: -86, length: 278, trunkX: 9390, isVine: true },
                // 26th Object: Лиана 5, свисающая над пропастью (ветка y: -128)
                { id: 'liana5', x: 14499, anchorY: -128, length: 278, trunkX: 14409, isVine: true },
                // 28th Object: Лиана 6, свисающая над пропастью (ветка y: -133)
                { id: 'liana6', x: 15567, anchorY: -133, length: 264, trunkX: 15477, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 4
                { x: 3912, topY: 55, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 25th Object: Лианы на камне 16
                { x: 13886, topY: 64, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 17356, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        32: {
            id: 32,
            title: "Уровень 32",
            theme: "nature",
            worldWidth: 18626,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1415, h: 140, type: 'ground' },
                { x: 3241, y: 540, w: 930, h: 140, type: 'ground' },
                { x: 4969, y: 540, w: 1391, h: 140, type: 'ground' },
                { x: 7153, y: 540, w: 788, h: 140, type: 'ground' },
                { x: 9212, y: 540, w: 320, h: 140, type: 'ground' },
                { x: 10359, y: 540, w: 837, h: 140, type: 'ground' },
                { x: 11966, y: 540, w: 1421, h: 140, type: 'ground' },
                { x: 14185, y: 540, w: 246, h: 140, type: 'ground' },
                { x: 15211, y: 540, w: 328, h: 140, type: 'ground' },
                { x: 16862, y: 540, w: 1764, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1415, endX: 3241 },
                { startX: 4171, endX: 4969 },
                { startX: 6360, endX: 7153 },
                { startX: 7941, endX: 9212 },
                { startX: 9532, endX: 10359 },
                { startX: 11196, endX: 11966 },
                { startX: 13387, endX: 14185 },
                { startX: 14431, endX: 15211 },
                { startX: 15539, endX: 16862 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 429, w: 157, h: 111, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Средний гранитный валун)
                { id: 'stone2', x: 1154, y: 357, w: 201, h: 183, isStone: true },
                // 6th Object: Камень 3 (Монолит с лианами для подъема)
                { id: 'stone3', x: 3241, y: 70, w: 264, h: 470, isStone: true, noLedgeGrab: true },
                // 7th Object: Камень 4 (Парящая замшелая плита)
                { id: 'stone4', x: 3875, y: 166, w: 236, h: 65, isStone: true },
                // 9th Object: Камень 5 (Низкий валун-препятствие)
                { id: 'stone5', x: 4969, y: 426, w: 165, h: 114, isStone: true, isSmall: true },
                // 10th Object: Камень 6 (Скалистая арка с лазом под ней)
                { id: 'stone6', x: 5514, y: -200, w: 220, h: 690, isStone: true, noLedgeGrab: true },
                // 11th Object: Камень 7 (Средний гранитный валун)
                { id: 'stone7', x: 6094, y: 320, w: 206, h: 220, isStone: true },
                // 13th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 7153, y: 313, w: 210, h: 227, isStone: true },
                // 14th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7703, y: 439, w: 178, h: 101, isStone: true, isSmall: true },
                // 17th Object: Камень 10 (Монолит с лианами для подъема)
                { id: 'stone10', x: 9212, y: 59, w: 260, h: 481, isStone: true, noLedgeGrab: true },
                // 19th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 10359, y: 243, w: 220, h: 297, isStone: true },
                // 20th Object: Камень 12 (Средний гранитный валун)
                { id: 'stone12', x: 10953, y: 355, w: 183, h: 185, isStone: true },
                // 22nd Object: Камень 13 (Низкий валун-препятствие)
                { id: 'stone13', x: 11966, y: 439, w: 171, h: 101, isStone: true, isSmall: true },
                // 23rd Object: Камень 14 (Скалистая арка с лазом под ней)
                { id: 'stone14', x: 12517, y: -200, w: 236, h: 690, isStone: true, noLedgeGrab: true },
                // 24th Object: Камень 15 (Средний гранитный валун)
                { id: 'stone15', x: 13113, y: 321, w: 214, h: 219, isStone: true },
                // 26th Object: Камень 16 (Средний гранитный валун)
                { id: 'stone16', x: 14185, y: 316, w: 186, h: 224, isStone: true },
                // 28th Object: Камень 17 (Монолит с лианами для подъема)
                { id: 'stone17', x: 15211, y: 56, w: 268, h: 484, isStone: true, noLedgeGrab: true },
                // 31st Object: Камень 18 (Высокая скала-уступ)
                { id: 'stone18', x: 16862, y: 237, w: 221, h: 303, isStone: true },
                // 32nd Object: Камень 19 (Вершинная скала с флагом победы!)
                { id: 'stone19', x: 17466, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 113)
                { id: 'tree1', x: 1695, y: 113, length: 90, trunkX: 1650, isTree: true },
                // 5th Object: Дерево 2 с прочной веткой над пропастью (y: 110)
                { id: 'tree2', x: 2729, y: 110, length: 90, trunkX: 2684, isTree: true },
                // 12th Object: Дерево 3 с прочной веткой над пропастью (y: 109)
                { id: 'tree3', x: 6640, y: 109, length: 90, trunkX: 6595, isTree: true },
                // 15th Object: Дерево 4 с прочной веткой над пропастью (y: 126)
                { id: 'tree4', x: 8208, y: 126, length: 90, trunkX: 8163, isTree: true },
                // 18th Object: Дерево 5 с прочной веткой над пропастью (y: 116)
                { id: 'tree5', x: 9842, y: 116, length: 90, trunkX: 9797, isTree: true },
                // 21st Object: Дерево 6 с прочной веткой над пропастью (y: 151)
                { id: 'tree6', x: 11476, y: 151, length: 90, trunkX: 11431, isTree: true },
                // 27th Object: Дерево 7 с прочной веткой над пропастью (y: 127)
                { id: 'tree7', x: 14711, y: 127, length: 90, trunkX: 14666, isTree: true },
                // 30th Object: Дерево 8 с прочной веткой над пропастью (y: 146)
                { id: 'tree8', x: 16362, y: 146, length: 90, trunkX: 16317, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -136)
                { id: 'liana1', x: 2192, anchorY: -136, length: 272, trunkX: 2102, isVine: true },
                // 8th Object: Лиана 2, свисающая над пропастью (ветка y: -92)
                { id: 'liana2', x: 4461, anchorY: -92, length: 284, trunkX: 4371, isVine: true },
                // 16th Object: Лиана 3, свисающая над пропастью (ветка y: -85)
                { id: 'liana3', x: 8696, anchorY: -85, length: 269, trunkX: 8606, isVine: true },
                // 25th Object: Лиана 4, свисающая над пропастью (ветка y: -86)
                { id: 'liana4', x: 13667, anchorY: -86, length: 268, trunkX: 13577, isVine: true },
                // 29th Object: Лиана 5, свисающая над пропастью (ветка y: -135)
                { id: 'liana5', x: 15849, anchorY: -135, length: 277, trunkX: 15759, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 3
                { x: 3263, topY: 70, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 17th Object: Лианы на камне 10
                { x: 9234, topY: 59, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 28th Object: Лианы на камне 17
                { x: 15233, topY: 56, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 17666, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        33: {
            id: 33,
            title: "Уровень 33",
            theme: "nature",
            worldWidth: 19553,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1431, h: 140, type: 'ground' },
                { x: 2786, y: 540, w: 928, h: 140, type: 'ground' },
                { x: 4559, y: 540, w: 1996, h: 140, type: 'ground' },
                { x: 7837, y: 540, w: 293, h: 140, type: 'ground' },
                { x: 8968, y: 540, w: 970, h: 140, type: 'ground' },
                { x: 11304, y: 540, w: 259, h: 140, type: 'ground' },
                { x: 12358, y: 540, w: 1398, h: 140, type: 'ground' },
                { x: 14551, y: 540, w: 246, h: 140, type: 'ground' },
                { x: 15605, y: 540, w: 945, h: 140, type: 'ground' },
                { x: 17862, y: 540, w: 1691, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1431, endX: 2786 },
                { startX: 3714, endX: 4559 },
                { startX: 6555, endX: 7837 },
                { startX: 8130, endX: 8968 },
                { startX: 9938, endX: 11304 },
                { startX: 11563, endX: 12358 },
                { startX: 13756, endX: 14551 },
                { startX: 14797, endX: 15605 },
                { startX: 16550, endX: 17862 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 427, w: 150, h: 113, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1136, y: 231, w: 235, h: 309, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2786, y: 216, w: 241, h: 324, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3389, y: 56, w: 265, h: 484, isStone: true, noLedgeGrab: true },
                // 8th Object: Камень 5 (Высокая скала-уступ)
                { id: 'stone5', x: 4559, y: 244, w: 226, h: 296, isStone: true },
                // 9th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 5159, y: 422, w: 169, h: 118, isStone: true, isSmall: true },
                // 10th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 5708, y: -200, w: 221, h: 690, isStone: true, noLedgeGrab: true },
                // 11th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6289, y: 311, w: 206, h: 229, isStone: true },
                // 14th Object: Камень 9 (Высокая скала-уступ)
                { id: 'stone9', x: 7837, y: 251, w: 233, h: 289, isStone: true },
                // 16th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8968, y: 260, w: 253, h: 280, isStone: true },
                // 17th Object: Камень 11 (Монолит с лианами для подъема)
                { id: 'stone11', x: 9608, y: 74, w: 270, h: 466, isStone: true, noLedgeGrab: true },
                // 20th Object: Камень 12 (Средний гранитный валун)
                { id: 'stone12', x: 11304, y: 334, w: 199, h: 206, isStone: true },
                // 22nd Object: Камень 13 (Низкий валун-препятствие)
                { id: 'stone13', x: 12358, y: 428, w: 169, h: 112, isStone: true, isSmall: true },
                // 23rd Object: Камень 14 (Скалистая арка с лазом под ней)
                { id: 'stone14', x: 12907, y: -200, w: 226, h: 690, isStone: true, noLedgeGrab: true },
                // 24th Object: Камень 15 (Средний гранитный валун)
                { id: 'stone15', x: 13493, y: 351, w: 203, h: 189, isStone: true },
                // 26th Object: Камень 16 (Средний гранитный валун)
                { id: 'stone16', x: 14551, y: 324, w: 186, h: 216, isStone: true },
                // 28th Object: Камень 17 (Монолит с лианами для подъема)
                { id: 'stone17', x: 15605, y: 63, w: 273, h: 477, isStone: true, noLedgeGrab: true },
                // 29th Object: Камень 18 (Парящая замшелая плита)
                { id: 'stone18', x: 16248, y: 209, w: 242, h: 65, isStone: true },
                // 32nd Object: Камень 19 (Средний гранитный валун)
                { id: 'stone19', x: 17862, y: 317, w: 191, h: 223, isStone: true },
                // 33rd Object: Камень 20 (Вершинная скала с флагом победы!)
                { id: 'stone20', x: 18393, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 4th Object: Дерево 1 с прочной веткой над пропастью (y: 108)
                { id: 'tree1', x: 2263, y: 108, length: 90, trunkX: 2218, isTree: true },
                // 12th Object: Дерево 2 с прочной веткой над пропастью (y: 117)
                { id: 'tree2', x: 6835, y: 117, length: 90, trunkX: 6790, isTree: true },
                // 18th Object: Дерево 3 с прочной веткой над пропастью (y: 118)
                { id: 'tree3', x: 10248, y: 118, length: 90, trunkX: 10203, isTree: true },
                // 25th Object: Дерево 4 с прочной веткой над пропастью (y: 151)
                { id: 'tree4', x: 14036, y: 151, length: 90, trunkX: 13991, isTree: true },
                // 30th Object: Дерево 5 с прочной веткой над пропастью (y: 125)
                { id: 'tree5', x: 16840, y: 125, length: 90, trunkX: 16795, isTree: true }
            ],
            ropes: [
                // 3rd Object: Лиана 1, свисающая над пропастью (ветка y: -97)
                { id: 'liana1', x: 1733, anchorY: -97, length: 265, trunkX: 1643, isVine: true },
                // 7th Object: Лиана 2, свисающая над пропастью (ветка y: -132)
                { id: 'liana2', x: 4024, anchorY: -132, length: 281, trunkX: 3934, isVine: true },
                // 13th Object: Лиана 3, свисающая над пропастью (ветка y: -100)
                { id: 'liana3', x: 7324, anchorY: -100, length: 271, trunkX: 7234, isVine: true },
                // 15th Object: Лиана 4, свисающая над пропастью (ветка y: -136)
                { id: 'liana4', x: 8430, anchorY: -136, length: 278, trunkX: 8340, isVine: true },
                // 19th Object: Лиана 5, свисающая над пропастью (ветка y: -92)
                { id: 'liana5', x: 10767, anchorY: -92, length: 278, trunkX: 10677, isVine: true },
                // 21st Object: Лиана 6, свисающая над пропастью (ветка y: -133)
                { id: 'liana6', x: 11843, anchorY: -133, length: 275, trunkX: 11753, isVine: true },
                // 27th Object: Лиана 7, свисающая над пропастью (ветка y: -103)
                { id: 'liana7', x: 15077, anchorY: -103, length: 281, trunkX: 14987, isVine: true },
                // 31st Object: Лиана 8, свисающая над пропастью (ветка y: -120)
                { id: 'liana8', x: 17333, anchorY: -120, length: 279, trunkX: 17243, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3411, topY: 56, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 17th Object: Лианы на камне 11
                { x: 9630, topY: 74, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 28th Object: Лианы на камне 17
                { x: 15627, topY: 63, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 18593, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        34: {
            id: 34,
            title: "Уровень 34",
            theme: "nature",
            worldWidth: 20151,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1478, h: 140, type: 'ground' },
                { x: 2836, y: 540, w: 1569, h: 140, type: 'ground' },
                { x: 5741, y: 540, w: 2409, h: 140, type: 'ground' },
                { x: 9472, y: 540, w: 931, h: 140, type: 'ground' },
                { x: 11743, y: 540, w: 813, h: 140, type: 'ground' },
                { x: 13424, y: 540, w: 1402, h: 140, type: 'ground' },
                { x: 15625, y: 540, w: 1491, h: 140, type: 'ground' },
                { x: 18445, y: 540, w: 1706, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1478, endX: 2836 },
                { startX: 4405, endX: 5741 },
                { startX: 8150, endX: 9472 },
                { startX: 10403, endX: 11743 },
                { startX: 12556, endX: 13424 },
                { startX: 14826, endX: 15625 },
                { startX: 17116, endX: 18445 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 433, w: 167, h: 107, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1154, y: 218, w: 264, h: 322, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2836, y: 228, w: 263, h: 312, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3469, y: 64, w: 269, h: 476, isStone: true, noLedgeGrab: true },
                // 7th Object: Камень 5 (Парящая замшелая плита)
                { id: 'stone5', x: 4108, y: 162, w: 237, h: 65, isStone: true },
                // 10th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 5741, y: 430, w: 163, h: 110, isStone: true, isSmall: true },
                // 11th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6284, y: -200, w: 220, h: 690, isStone: true, noLedgeGrab: true },
                // 12th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6864, y: 312, w: 198, h: 228, isStone: true },
                // 13th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7402, y: 434, w: 158, h: 106, isStone: true, isSmall: true },
                // 14th Object: Камень 10 (Средний гранитный валун)
                { id: 'stone10', x: 7889, y: 360, w: 201, h: 180, isStone: true },
                // 17th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9472, y: 234, w: 220, h: 306, isStone: true },
                // 18th Object: Камень 12 (Монолит с лианами для подъема)
                { id: 'stone12', x: 10062, y: 60, w: 281, h: 480, isStone: true, noLedgeGrab: true },
                // 21st Object: Камень 13 (Средний гранитный валун)
                { id: 'stone13', x: 11743, y: 319, w: 182, h: 221, isStone: true },
                // 22nd Object: Камень 14 (Высокая скала-уступ)
                { id: 'stone14', x: 12265, y: 249, w: 231, h: 291, isStone: true },
                // 24th Object: Камень 15 (Низкий валун-препятствие)
                { id: 'stone15', x: 13424, y: 432, w: 179, h: 108, isStone: true, isSmall: true },
                // 25th Object: Камень 16 (Скалистая арка с лазом под ней)
                { id: 'stone16', x: 13983, y: -200, w: 225, h: 690, isStone: true, noLedgeGrab: true },
                // 26th Object: Камень 17 (Средний гранитный валун)
                { id: 'stone17', x: 14568, y: 323, w: 198, h: 217, isStone: true },
                // 28th Object: Камень 18 (Средний гранитный валун)
                { id: 'stone18', x: 15625, y: 357, w: 208, h: 183, isStone: true },
                // 29th Object: Камень 19 (Монолит с лианами для подъема)
                { id: 'stone19', x: 16173, y: 67, w: 275, h: 473, isStone: true, noLedgeGrab: true },
                // 30th Object: Камень 20 (Парящая замшелая плита)
                { id: 'stone20', x: 16818, y: 160, w: 238, h: 65, isStone: true },
                // 33rd Object: Камень 21 (Средний гранитный валун)
                { id: 'stone21', x: 18445, y: 334, w: 206, h: 206, isStone: true },
                // 34th Object: Камень 22 (Вершинная скала с флагом победы!)
                { id: 'stone22', x: 18991, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 150)
                { id: 'tree1', x: 1795, y: 150, length: 90, trunkX: 1750, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 131)
                { id: 'tree2', x: 4695, y: 131, length: 90, trunkX: 4650, isTree: true },
                // 15th Object: Дерево 3 с прочной веткой над пропастью (y: 143)
                { id: 'tree3', x: 8430, y: 143, length: 90, trunkX: 8385, isTree: true },
                // 20th Object: Дерево 4 с прочной веткой над пропастью (y: 124)
                { id: 'tree4', x: 11247, y: 124, length: 90, trunkX: 11202, isTree: true },
                // 27th Object: Дерево 5 с прочной веткой над пропастью (y: 125)
                { id: 'tree5', x: 15106, y: 125, length: 90, trunkX: 15061, isTree: true },
                // 32nd Object: Дерево 6 с прочной веткой над пропастью (y: 124)
                { id: 'tree6', x: 17921, y: 124, length: 90, trunkX: 17876, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -86)
                { id: 'liana1', x: 2299, anchorY: -86, length: 265, trunkX: 2209, isVine: true },
                // 9th Object: Лиана 2, свисающая над пропастью (ветка y: -97)
                { id: 'liana2', x: 5205, anchorY: -97, length: 271, trunkX: 5115, isVine: true },
                // 16th Object: Лиана 3, свисающая над пропастью (ветка y: -93)
                { id: 'liana3', x: 8942, anchorY: -93, length: 270, trunkX: 8852, isVine: true },
                // 19th Object: Лиана 4, свисающая над пропастью (ветка y: -133)
                { id: 'liana4', x: 10713, anchorY: -133, length: 262, trunkX: 10623, isVine: true },
                // 23rd Object: Лиана 5, свисающая над пропастью (ветка y: -98)
                { id: 'liana5', x: 12884, anchorY: -98, length: 278, trunkX: 12794, isVine: true },
                // 31st Object: Лиана 6, свисающая над пропастью (ветка y: -124)
                { id: 'liana6', x: 17406, anchorY: -124, length: 281, trunkX: 17316, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3491, topY: 64, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 18th Object: Лианы на камне 12
                { x: 10084, topY: 60, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 29th Object: Лианы на камне 19
                { x: 16195, topY: 67, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 19191, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        35: {
            id: 35,
            title: "Уровень 35",
            theme: "nature",
            worldWidth: 20308,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1455, h: 140, type: 'ground' },
                { x: 2790, y: 540, w: 852, h: 140, type: 'ground' },
                { x: 4991, y: 540, w: 2445, h: 140, type: 'ground' },
                { x: 8757, y: 540, w: 302, h: 140, type: 'ground' },
                { x: 9864, y: 540, w: 327, h: 140, type: 'ground' },
                { x: 11010, y: 540, w: 266, h: 140, type: 'ground' },
                { x: 12586, y: 540, w: 2418, h: 140, type: 'ground' },
                { x: 16294, y: 540, w: 917, h: 140, type: 'ground' },
                { x: 18523, y: 540, w: 1785, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1455, endX: 2790 },
                { startX: 3642, endX: 4991 },
                { startX: 7436, endX: 8757 },
                { startX: 9059, endX: 9864 },
                { startX: 10191, endX: 11010 },
                { startX: 11276, endX: 12586 },
                { startX: 15004, endX: 16294 },
                { startX: 17211, endX: 18523 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 434, w: 162, h: 106, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1157, y: 229, w: 238, h: 311, isStone: true },
                // 5th Object: Камень 3 (Средний гранитный валун)
                { id: 'stone3', x: 2790, y: 350, w: 181, h: 190, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3311, y: 62, w: 271, h: 478, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 5 (Средний гранитный валун)
                { id: 'stone5', x: 4991, y: 345, w: 212, h: 195, isStone: true },
                // 10th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 5543, y: 425, w: 168, h: 115, isStone: true, isSmall: true },
                // 11th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6091, y: -200, w: 229, h: 690, isStone: true, noLedgeGrab: true },
                // 12th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6680, y: 319, w: 181, h: 221, isStone: true },
                // 13th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7201, y: 438, w: 175, h: 102, isStone: true, isSmall: true },
                // 16th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8757, y: 259, w: 242, h: 281, isStone: true },
                // 18th Object: Камень 11 (Монолит с лианами для подъема)
                { id: 'stone11', x: 9864, y: 67, w: 267, h: 473, isStone: true, noLedgeGrab: true },
                // 20th Object: Камень 12 (Средний гранитный валун)
                { id: 'stone12', x: 11010, y: 312, w: 206, h: 228, isStone: true },
                // 23rd Object: Камень 13 (Средний гранитный валун)
                { id: 'stone13', x: 12586, y: 323, w: 189, h: 217, isStone: true },
                // 24th Object: Камень 14 (Низкий валун-препятствие)
                { id: 'stone14', x: 13115, y: 443, w: 154, h: 97, isStone: true, isSmall: true },
                // 25th Object: Камень 15 (Скалистая арка с лазом под ней)
                { id: 'stone15', x: 13649, y: -200, w: 235, h: 690, isStone: true, noLedgeGrab: true },
                // 26th Object: Камень 16 (Средний гранитный валун)
                { id: 'stone16', x: 14244, y: 321, w: 184, h: 219, isStone: true },
                // 27th Object: Камень 17 (Низкий валун-препятствие)
                { id: 'stone17', x: 14768, y: 427, w: 176, h: 113, isStone: true, isSmall: true },
                // 30th Object: Камень 18 (Монолит с лианами для подъема)
                { id: 'stone18', x: 16294, y: 65, w: 265, h: 475, isStone: true, noLedgeGrab: true },
                // 31st Object: Камень 19 (Парящая замшелая плита)
                { id: 'stone19', x: 16929, y: 164, w: 222, h: 65, isStone: true },
                // 34th Object: Камень 20 (Высокая скала-уступ)
                { id: 'stone20', x: 18523, y: 231, w: 257, h: 309, isStone: true },
                // 35th Object: Камень 21 (Вершинная скала с флагом победы!)
                { id: 'stone21', x: 19148, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 135)
                { id: 'tree1', x: 1783, y: 135, length: 90, trunkX: 1738, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 150)
                { id: 'tree2', x: 4469, y: 150, length: 90, trunkX: 4424, isTree: true },
                // 14th Object: Дерево 3 с прочной веткой над пропастью (y: 126)
                { id: 'tree3', x: 7711, y: 126, length: 90, trunkX: 7666, isTree: true },
                // 17th Object: Дерево 4 с прочной веткой над пропастью (y: 105)
                { id: 'tree4', x: 9375, y: 105, length: 90, trunkX: 9330, isTree: true },
                // 22nd Object: Дерево 5 с прочной веткой над пропастью (y: 147)
                { id: 'tree5', x: 12095, y: 147, length: 90, trunkX: 12050, isTree: true },
                // 28th Object: Дерево 6 с прочной веткой над пропастью (y: 149)
                { id: 'tree6', x: 15279, y: 149, length: 90, trunkX: 15234, isTree: true },
                // 33rd Object: Дерево 7 с прочной веткой над пропастью (y: 136)
                { id: 'tree7', x: 18031, y: 136, length: 90, trunkX: 17986, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -144)
                { id: 'liana1', x: 2280, anchorY: -144, length: 272, trunkX: 2190, isVine: true },
                // 7th Object: Лиана 2, свисающая над пропастью (ветка y: -108)
                { id: 'liana2', x: 3952, anchorY: -108, length: 268, trunkX: 3862, isVine: true },
                // 15th Object: Лиана 3, свисающая над пропастью (ветка y: -134)
                { id: 'liana3', x: 8232, anchorY: -134, length: 273, trunkX: 8142, isVine: true },
                // 19th Object: Лиана 4, свисающая над пропастью (ветка y: -120)
                { id: 'liana4', x: 10501, anchorY: -120, length: 278, trunkX: 10411, isVine: true },
                // 21st Object: Лиана 5, свисающая над пропастью (ветка y: -86)
                { id: 'liana5', x: 11556, anchorY: -86, length: 275, trunkX: 11466, isVine: true },
                // 29th Object: Лиана 6, свисающая над пропастью (ветка y: -120)
                { id: 'liana6', x: 15764, anchorY: -120, length: 277, trunkX: 15674, isVine: true },
                // 32nd Object: Лиана 7, свисающая над пропастью (ветка y: -130)
                { id: 'liana7', x: 17501, anchorY: -130, length: 263, trunkX: 17411, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3333, topY: 62, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 18th Object: Лианы на камне 11
                { x: 9886, topY: 67, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 30th Object: Лианы на камне 18
                { x: 16316, topY: 65, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 19348, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        36: {
            id: 36,
            title: "Уровень 36",
            theme: "nature",
            worldWidth: 21008,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1454, h: 140, type: 'ground' },
                { x: 2794, y: 540, w: 957, h: 140, type: 'ground' },
                { x: 5065, y: 540, w: 2494, h: 140, type: 'ground' },
                { x: 8859, y: 540, w: 847, h: 140, type: 'ground' },
                { x: 10474, y: 540, w: 339, h: 140, type: 'ground' },
                { x: 11662, y: 540, w: 300, h: 140, type: 'ground' },
                { x: 13309, y: 540, w: 2498, h: 140, type: 'ground' },
                { x: 17088, y: 540, w: 927, h: 140, type: 'ground' },
                { x: 19308, y: 540, w: 1700, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1454, endX: 2794 },
                { startX: 3751, endX: 5065 },
                { startX: 7559, endX: 8859 },
                { startX: 9706, endX: 10474 },
                { startX: 10813, endX: 11662 },
                { startX: 11962, endX: 13309 },
                { startX: 15807, endX: 17088 },
                { startX: 18015, endX: 19308 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 443, w: 162, h: 97, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1156, y: 245, w: 238, h: 295, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2794, y: 233, w: 254, h: 307, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3427, y: 52, w: 264, h: 488, isStone: true, noLedgeGrab: true },
                // 9th Object: Камень 5 (Высокая скала-уступ)
                { id: 'stone5', x: 5065, y: 252, w: 241, h: 288, isStone: true },
                // 10th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 5677, y: 443, w: 152, h: 97, isStone: true, isSmall: true },
                // 11th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6209, y: -200, w: 234, h: 690, isStone: true, noLedgeGrab: true },
                // 12th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6803, y: 334, w: 190, h: 206, isStone: true },
                // 13th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7333, y: 440, w: 166, h: 100, isStone: true, isSmall: true },
                // 16th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8859, y: 225, w: 220, h: 315, isStone: true },
                // 17th Object: Камень 11 (Средний гранитный валун)
                { id: 'stone11', x: 9446, y: 323, w: 200, h: 217, isStone: true },
                // 19th Object: Камень 12 (Монолит с лианами для подъема)
                { id: 'stone12', x: 10474, y: 63, w: 279, h: 477, isStone: true, noLedgeGrab: true },
                // 21st Object: Камень 13 (Высокая скала-уступ)
                { id: 'stone13', x: 11662, y: 255, w: 240, h: 285, isStone: true },
                // 24th Object: Камень 14 (Высокая скала-уступ)
                { id: 'stone14', x: 13309, y: 249, w: 233, h: 291, isStone: true },
                // 25th Object: Камень 15 (Низкий валун-препятствие)
                { id: 'stone15', x: 13925, y: 423, w: 168, h: 117, isStone: true, isSmall: true },
                // 26th Object: Камень 16 (Скалистая арка с лазом под ней)
                { id: 'stone16', x: 14473, y: -200, w: 224, h: 690, isStone: true, noLedgeGrab: true },
                // 27th Object: Камень 17 (Средний гранитный валун)
                { id: 'stone17', x: 15057, y: 323, w: 183, h: 217, isStone: true },
                // 28th Object: Камень 18 (Низкий валун-препятствие)
                { id: 'stone18', x: 15580, y: 424, w: 167, h: 116, isStone: true, isSmall: true },
                // 31st Object: Камень 19 (Монолит с лианами для подъема)
                { id: 'stone19', x: 17088, y: 70, w: 272, h: 470, isStone: true, noLedgeGrab: true },
                // 32nd Object: Камень 20 (Парящая замшелая плита)
                { id: 'stone20', x: 17730, y: 197, w: 225, h: 65, isStone: true },
                // 35th Object: Камень 21 (Средний гранитный валун)
                { id: 'stone21', x: 19308, y: 327, w: 200, h: 213, isStone: true },
                // 36th Object: Камень 22 (Вершинная скала с флагом победы!)
                { id: 'stone22', x: 19848, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 111)
                { id: 'tree1', x: 1762, y: 111, length: 90, trunkX: 1717, isTree: true },
                // 8th Object: Дерево 2 с прочной веткой над пропастью (y: 138)
                { id: 'tree2', x: 4575, y: 138, length: 90, trunkX: 4530, isTree: true },
                // 14th Object: Дерево 3 с прочной веткой над пропастью (y: 118)
                { id: 'tree3', x: 7837, y: 118, length: 90, trunkX: 7792, isTree: true },
                // 18th Object: Дерево 4 с прочной веткой над пропастью (y: 138)
                { id: 'tree4', x: 9986, y: 138, length: 90, trunkX: 9941, isTree: true },
                // 23rd Object: Дерево 5 с прочной веткой над пропастью (y: 134)
                { id: 'tree5', x: 12796, y: 134, length: 90, trunkX: 12751, isTree: true },
                // 29th Object: Дерево 6 с прочной веткой над пропастью (y: 130)
                { id: 'tree6', x: 16074, y: 130, length: 90, trunkX: 16029, isTree: true },
                // 34th Object: Дерево 7 с прочной веткой над пропастью (y: 151)
                { id: 'tree7', x: 18811, y: 151, length: 90, trunkX: 18766, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -131)
                { id: 'liana1', x: 2285, anchorY: -131, length: 271, trunkX: 2195, isVine: true },
                // 7th Object: Лиана 2, свисающая над пропастью (ветка y: -119)
                { id: 'liana2', x: 4061, anchorY: -119, length: 267, trunkX: 3971, isVine: true },
                // 15th Object: Лиана 3, свисающая над пропастью (ветка y: -138)
                { id: 'liana3', x: 8335, anchorY: -138, length: 275, trunkX: 8245, isVine: true },
                // 20th Object: Лиана 4, свисающая над пропастью (ветка y: -130)
                { id: 'liana4', x: 11123, anchorY: -130, length: 263, trunkX: 11033, isVine: true },
                // 22nd Object: Лиана 5, свисающая над пропастью (ветка y: -100)
                { id: 'liana5', x: 12279, anchorY: -100, length: 274, trunkX: 12189, isVine: true },
                // 30th Object: Лиана 6, свисающая над пропастью (ветка y: -99)
                { id: 'liana6', x: 16572, anchorY: -99, length: 283, trunkX: 16482, isVine: true },
                // 33rd Object: Лиана 7, свисающая над пропастью (ветка y: -134)
                { id: 'liana7', x: 18305, anchorY: -134, length: 270, trunkX: 18215, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3449, topY: 52, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 19th Object: Лианы на камне 12
                { x: 10496, topY: 63, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 31st Object: Лианы на камне 19
                { x: 17110, topY: 70, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 20048, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        37: {
            id: 37,
            title: "Уровень 37",
            theme: "nature",
            worldWidth: 21693,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1425, h: 140, type: 'ground' },
                { x: 2787, y: 540, w: 959, h: 140, type: 'ground' },
                { x: 4568, y: 540, w: 258, h: 140, type: 'ground' },
                { x: 5632, y: 540, w: 1383, h: 140, type: 'ground' },
                { x: 7806, y: 540, w: 817, h: 140, type: 'ground' },
                { x: 9942, y: 540, w: 939, h: 140, type: 'ground' },
                { x: 12723, y: 540, w: 2573, h: 140, type: 'ground' },
                { x: 16609, y: 540, w: 318, h: 140, type: 'ground' },
                { x: 17756, y: 540, w: 947, h: 140, type: 'ground' },
                { x: 20011, y: 540, w: 1682, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1425, endX: 2787 },
                { startX: 3746, endX: 4568 },
                { startX: 4826, endX: 5632 },
                { startX: 7015, endX: 7806 },
                { startX: 8623, endX: 9942 },
                { startX: 10881, endX: 12723 },
                { startX: 15296, endX: 16609 },
                { startX: 16927, endX: 17756 },
                { startX: 18703, endX: 20011 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 436, w: 160, h: 104, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1137, y: 227, w: 228, h: 313, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2787, y: 227, w: 233, h: 313, isStone: true },
                // 6th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3402, y: 71, w: 284, h: 469, isStone: true, noLedgeGrab: true },
                // 8th Object: Камень 5 (Средний гранитный валун)
                { id: 'stone5', x: 4568, y: 341, w: 198, h: 199, isStone: true },
                // 10th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 5632, y: 443, w: 157, h: 97, isStone: true, isSmall: true },
                // 11th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6169, y: -200, w: 227, h: 690, isStone: true, noLedgeGrab: true },
                // 12th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 6756, y: 345, w: 199, h: 195, isStone: true },
                // 14th Object: Камень 9 (Средний гранитный валун)
                { id: 'stone9', x: 7806, y: 338, w: 197, h: 202, isStone: true },
                // 15th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8343, y: 252, w: 220, h: 288, isStone: true },
                // 18th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9942, y: 215, w: 240, h: 325, isStone: true },
                // 19th Object: Камень 12 (Монолит с лианами для подъема)
                { id: 'stone12', x: 10560, y: 70, w: 261, h: 470, isStone: true, noLedgeGrab: true },
                // 23rd Object: Камень 13 (Средний гранитный валун)
                { id: 'stone13', x: 12723, y: 360, w: 207, h: 180, isStone: true },
                // 24th Object: Камень 14 (Высокая скала-уступ)
                { id: 'stone14', x: 13270, y: 241, w: 244, h: 299, isStone: true },
                // 25th Object: Камень 15 (Низкий валун-препятствие)
                { id: 'stone15', x: 13883, y: 431, w: 174, h: 109, isStone: true, isSmall: true },
                // 26th Object: Камень 16 (Скалистая арка с лазом под ней)
                { id: 'stone16', x: 14437, y: -200, w: 235, h: 690, isStone: true, noLedgeGrab: true },
                // 27th Object: Камень 17 (Средний гранитный валун)
                { id: 'stone17', x: 15032, y: 314, w: 204, h: 226, isStone: true },
                // 30th Object: Камень 18 (Высокая скала-уступ)
                { id: 'stone18', x: 16609, y: 213, w: 258, h: 327, isStone: true },
                // 32nd Object: Камень 19 (Монолит с лианами для подъема)
                { id: 'stone19', x: 17756, y: 59, w: 283, h: 481, isStone: true, noLedgeGrab: true },
                // 33rd Object: Камень 20 (Парящая замшелая плита)
                { id: 'stone20', x: 18409, y: 187, w: 234, h: 65, isStone: true },
                // 36th Object: Камень 21 (Средний гранитный валун)
                { id: 'stone21', x: 20011, y: 347, w: 182, h: 193, isStone: true },
                // 37th Object: Камень 22 (Вершинная скала с флагом победы!)
                { id: 'stone22', x: 20533, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой над пропастью (y: 153)
                { id: 'tree1', x: 1754, y: 153, length: 90, trunkX: 1709, isTree: true },
                // 7th Object: Дерево 2 с прочной веткой над пропастью (y: 147)
                { id: 'tree2', x: 4056, y: 147, length: 90, trunkX: 4011, isTree: true },
                // 13th Object: Дерево 3 с прочной веткой над пропастью (y: 132)
                { id: 'tree3', x: 7295, y: 132, length: 90, trunkX: 7250, isTree: true },
                // 16th Object: Дерево 4 с прочной веткой над пропастью (y: 116)
                { id: 'tree4', x: 8930, y: 116, length: 90, trunkX: 8885, isTree: true },
                // 20th Object: Дерево 5 с прочной веткой над пропастью (y: 110)
                { id: 'tree5', x: 11191, y: 110, length: 90, trunkX: 11146, isTree: true },
                // 22nd Object: Дерево 6 с прочной веткой над пропастью (y: 108)
                { id: 'tree6', x: 12202, y: 108, length: 90, trunkX: 12157, isTree: true },
                // 28th Object: Дерево 7 с прочной веткой над пропастью (y: 126)
                { id: 'tree7', x: 15576, y: 126, length: 90, trunkX: 15531, isTree: true },
                // 31st Object: Дерево 8 с прочной веткой над пропастью (y: 141)
                { id: 'tree8', x: 17244, y: 141, length: 90, trunkX: 17199, isTree: true },
                // 35th Object: Дерево 9 с прочной веткой над пропастью (y: 137)
                { id: 'tree9', x: 19503, y: 137, length: 90, trunkX: 19458, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1, свисающая над пропастью (ветка y: -87)
                { id: 'liana1', x: 2275, anchorY: -87, length: 279, trunkX: 2185, isVine: true },
                // 9th Object: Лиана 2, свисающая над пропастью (ветка y: -143)
                { id: 'liana2', x: 5106, anchorY: -143, length: 268, trunkX: 5016, isVine: true },
                // 17th Object: Лиана 3, свисающая над пропастью (ветка y: -85)
                { id: 'liana3', x: 9430, anchorY: -85, length: 267, trunkX: 9340, isVine: true },
                // 21st Object: Лиана 4, свисающая над пропастью (ветка y: -126)
                { id: 'liana4', x: 11695, anchorY: -126, length: 282, trunkX: 11605, isVine: true },
                // 29th Object: Лиана 5, свисающая над пропастью (ветка y: -134)
                { id: 'liana5', x: 16086, anchorY: -134, length: 273, trunkX: 15996, isVine: true },
                // 34th Object: Лиана 6, свисающая над пропастью (ветка y: -139)
                { id: 'liana6', x: 18993, anchorY: -139, length: 268, trunkX: 18903, isVine: true }
            ],
            ladders: [
                // 6th Object: Лианы на камне 4
                { x: 3424, topY: 71, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 19th Object: Лианы на камне 12
                { x: 10582, topY: 70, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 32nd Object: Лианы на камне 19
                { x: 17778, topY: 59, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 20733, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        38: {
            id: 38,
            title: "Уровень 38",
            theme: "nature",
            worldWidth: 22401,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1474, h: 140, type: 'ground' },
                { x: 2803, y: 540, w: 248, h: 140, type: 'ground' },
                { x: 3866, y: 540, w: 925, h: 140, type: 'ground' },
                { x: 6106, y: 540, w: 2467, h: 140, type: 'ground' },
                { x: 9925, y: 540, w: 295, h: 140, type: 'ground' },
                { x: 11067, y: 540, w: 942, h: 140, type: 'ground' },
                { x: 13328, y: 540, w: 870, h: 140, type: 'ground' },
                { x: 15008, y: 540, w: 1366, h: 140, type: 'ground' },
                { x: 17172, y: 540, w: 289, h: 140, type: 'ground' },
                { x: 18320, y: 540, w: 936, h: 140, type: 'ground' },
                { x: 20605, y: 540, w: 1796, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1474, endX: 2803 },
                { startX: 3051, endX: 3866 },
                { startX: 4791, endX: 6106 },
                { startX: 8573, endX: 9925 },
                { startX: 10220, endX: 11067 },
                { startX: 12009, endX: 13328 },
                { startX: 14198, endX: 15008 },
                { startX: 16374, endX: 17172 },
                { startX: 17461, endX: 18320 },
                { startX: 19256, endX: 20605 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 438, w: 177, h: 102, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1165, y: 212, w: 249, h: 328, isStone: true },
                // 5th Object: Камень 3 (Средний гранитный валун)
                { id: 'stone3', x: 2803, y: 317, w: 188, h: 223, isStone: true },
                // 7th Object: Камень 4 (Монолит с лианами для подъема)
                { id: 'stone4', x: 3866, y: 53, w: 274, h: 487, isStone: true, noLedgeGrab: true },
                // 8th Object: Камень 5 (Парящая замшелая плита)
                { id: 'stone5', x: 4510, y: 201, w: 221, h: 65, isStone: true },
                // 11th Object: Камень 6 (Низкий валун-препятствие)
                { id: 'stone6', x: 6106, y: 428, w: 154, h: 112, isStone: true, isSmall: true },
                // 12th Object: Камень 7 (Скалистая арка с лазом под ней)
                { id: 'stone7', x: 6640, y: -200, w: 228, h: 690, isStone: true, noLedgeGrab: true },
                // 13th Object: Камень 8 (Средний гранитный валун)
                { id: 'stone8', x: 7228, y: 332, w: 191, h: 208, isStone: true },
                // 14th Object: Камень 9 (Низкий валун-препятствие)
                { id: 'stone9', x: 7759, y: 425, w: 173, h: 115, isStone: true, isSmall: true },
                // 15th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 8259, y: 211, w: 254, h: 329, isStone: true },
                // 18th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9925, y: 257, w: 235, h: 283, isStone: true },
                // 20th Object: Камень 12 (Монолит с лианами для подъема)
                { id: 'stone12', x: 11067, y: 55, w: 265, h: 485, isStone: true, noLedgeGrab: true },
                // 21st Object: Камень 13 (Парящая замшелая плита)
                { id: 'stone13', x: 11702, y: 194, w: 247, h: 65, isStone: true },
                // 24th Object: Камень 14 (Высокая скала-уступ)
                { id: 'stone14', x: 13328, y: 215, w: 228, h: 325, isStone: true },
                // 25th Object: Камень 15 (Средний гранитный валун)
                { id: 'stone15', x: 13926, y: 320, w: 212, h: 220, isStone: true },
                // 27th Object: Камень 16 (Низкий валун-препятствие)
                { id: 'stone16', x: 15008, y: 423, w: 154, h: 117, isStone: true, isSmall: true },
                // 28th Object: Камень 17 (Скалистая арка с лазом под ней)
                { id: 'stone17', x: 15542, y: -200, w: 229, h: 690, isStone: true, noLedgeGrab: true },
                // 29th Object: Камень 18 (Средний гранитный валун)
                { id: 'stone18', x: 16131, y: 337, w: 183, h: 203, isStone: true },
                // 31st Object: Камень 19 (Высокая скала-уступ)
                { id: 'stone19', x: 17172, y: 237, w: 229, h: 303, isStone: true },
                // 33rd Object: Камень 20 (Монолит с лианами для подъема)
                { id: 'stone20', x: 18320, y: 72, w: 261, h: 468, isStone: true, noLedgeGrab: true },
                // 34th Object: Камень 21 (Парящая замшелая плита)
                { id: 'stone21', x: 18951, y: 172, w: 245, h: 65, isStone: true },
                // 37th Object: Камень 22 (Высокая скала-уступ)
                { id: 'stone22', x: 20605, y: 237, w: 264, h: 303, isStone: true },
                // 38th Object: Камень 23 (Вершинная скала с флагом победы!)
                { id: 'stone23', x: 21241, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 4th Object: Дерево 1 с прочной веткой над пропастью (y: 120)
                { id: 'tree1', x: 2314, y: 120, length: 90, trunkX: 2269, isTree: true },
                // 9th Object: Дерево 2 с прочной веткой над пропастью (y: 111)
                { id: 'tree2', x: 5081, y: 111, length: 90, trunkX: 5036, isTree: true },
                // 17th Object: Дерево 3 с прочной веткой над пропастью (y: 149)
                { id: 'tree3', x: 9436, y: 149, length: 90, trunkX: 9391, isTree: true },
                // 22nd Object: Дерево 4 с прочной веткой над пропастью (y: 105)
                { id: 'tree4', x: 12299, y: 105, length: 90, trunkX: 12254, isTree: true },
                // 30th Object: Дерево 5 с прочной веткой над пропастью (y: 123)
                { id: 'tree5', x: 16654, y: 123, length: 90, trunkX: 16609, isTree: true },
                // 35th Object: Дерево 6 с прочной веткой над пропастью (y: 118)
                { id: 'tree6', x: 19546, y: 118, length: 90, trunkX: 19501, isTree: true }
            ],
            ropes: [
                // 3rd Object: Лиана 1, свисающая над пропастью (ветка y: -126)
                { id: 'liana1', x: 1774, anchorY: -126, length: 280, trunkX: 1684, isVine: true },
                // 6th Object: Лиана 2, свисающая над пропастью (ветка y: -130)
                { id: 'liana2', x: 3331, anchorY: -130, length: 282, trunkX: 3241, isVine: true },
                // 10th Object: Лиана 3, свисающая над пропастью (ветка y: -95)
                { id: 'liana3', x: 5597, anchorY: -95, length: 282, trunkX: 5507, isVine: true },
                // 16th Object: Лиана 4, свисающая над пропастью (ветка y: -135)
                { id: 'liana4', x: 8892, anchorY: -135, length: 267, trunkX: 8802, isVine: true },
                // 19th Object: Лиана 5, свисающая над пропастью (ветка y: -88)
                { id: 'liana5', x: 10536, anchorY: -88, length: 280, trunkX: 10446, isVine: true },
                // 23rd Object: Лиана 6, свисающая над пропастью (ветка y: -102)
                { id: 'liana6', x: 12793, anchorY: -102, length: 270, trunkX: 12703, isVine: true },
                // 26th Object: Лиана 7, свисающая над пропастью (ветка y: -133)
                { id: 'liana7', x: 14478, anchorY: -133, length: 283, trunkX: 14388, isVine: true },
                // 32nd Object: Лиана 8, свисающая над пропастью (ветка y: -100)
                { id: 'liana8', x: 17779, anchorY: -100, length: 263, trunkX: 17689, isVine: true },
                // 36th Object: Лиана 9, свисающая над пропастью (ветка y: -142)
                { id: 'liana9', x: 20064, anchorY: -142, length: 282, trunkX: 19974, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 4
                { x: 3888, topY: 53, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 20th Object: Лианы на камне 12
                { x: 11089, topY: 55, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 33rd Object: Лианы на камне 20
                { x: 18342, topY: 72, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 21441, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        39: {
            id: 39,
            title: "Уровень 39",
            theme: "nature",
            worldWidth: 22778,
            groundY: 540,
            playerStartX: 320,
            platforms: [
                { x: 0, y: 540, w: 1461, h: 140, type: 'ground' },
                { x: 2784, y: 540, w: 1492, h: 140, type: 'ground' },
                { x: 5653, y: 540, w: 2498, h: 140, type: 'ground' },
                { x: 9480, y: 540, w: 825, h: 140, type: 'ground' },
                { x: 11109, y: 540, w: 344, h: 140, type: 'ground' },
                { x: 12282, y: 540, w: 873, h: 140, type: 'ground' },
                { x: 14502, y: 540, w: 2489, h: 140, type: 'ground' },
                { x: 18306, y: 540, w: 1481, h: 140, type: 'ground' },
                { x: 21098, y: 540, w: 1680, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1461, endX: 2784 },
                { startX: 4276, endX: 5653 },
                { startX: 8151, endX: 9480 },
                { startX: 10305, endX: 11109 },
                { startX: 11453, endX: 12282 },
                { startX: 13155, endX: 14502 },
                { startX: 16991, endX: 18306 },
                { startX: 19787, endX: 21098 }
            ],
            boxes: [
                // 1st Object: Камень 1 (Низкий валун-препятствие)
                { id: 'stone1', x: 650, y: 436, w: 172, h: 104, isStone: true, isSmall: true },
                // 2nd Object: Камень 2 (Высокая скала-уступ)
                { id: 'stone2', x: 1153, y: 219, w: 248, h: 321, isStone: true },
                // 5th Object: Камень 3 (Высокая скала-уступ)
                { id: 'stone3', x: 2784, y: 243, w: 245, h: 297, isStone: true },
                // 6th Object: Камень 4 (Средний гранитный валун)
                { id: 'stone4', x: 3400, y: 354, w: 195, h: 186, isStone: true },
                // 7th Object: Камень 5 (Монолит с лианами для подъема)
                { id: 'stone5', x: 3935, y: 65, w: 281, h: 475, isStone: true, noLedgeGrab: true },
                // 10th Object: Камень 6 (Средний гранитный валун)
                { id: 'stone6', x: 5653, y: 343, w: 190, h: 197, isStone: true },
                // 11th Object: Камень 7 (Низкий валун-препятствие)
                { id: 'stone7', x: 6183, y: 423, w: 168, h: 117, isStone: true, isSmall: true },
                // 12th Object: Камень 8 (Скалистая арка с лазом под ней)
                { id: 'stone8', x: 6731, y: -200, w: 222, h: 690, isStone: true, noLedgeGrab: true },
                // 13th Object: Камень 9 (Средний гранитный валун)
                { id: 'stone9', x: 7313, y: 335, w: 182, h: 205, isStone: true },
                // 14th Object: Камень 10 (Высокая скала-уступ)
                { id: 'stone10', x: 7835, y: 260, w: 256, h: 280, isStone: true },
                // 17th Object: Камень 11 (Высокая скала-уступ)
                { id: 'stone11', x: 9480, y: 236, w: 229, h: 304, isStone: true },
                // 18th Object: Камень 12 (Низкий валун-препятствие)
                { id: 'stone12', x: 10070, y: 439, w: 175, h: 101, isStone: true, isSmall: true },
                // 20th Object: Камень 13 (Монолит с лианами для подъема)
                { id: 'stone13', x: 11109, y: 63, w: 284, h: 477, isStone: true, noLedgeGrab: true },
                // 22nd Object: Камень 14 (Высокая скала-уступ)
                { id: 'stone14', x: 12282, y: 260, w: 263, h: 280, isStone: true },
                // 23rd Object: Камень 15 (Низкий валун-препятствие)
                { id: 'stone15', x: 12920, y: 439, w: 175, h: 101, isStone: true, isSmall: true },
                // 26th Object: Камень 16 (Высокая скала-уступ)
                { id: 'stone16', x: 14502, y: 225, w: 238, h: 315, isStone: true },
                // 27th Object: Камень 17 (Низкий валун-препятствие)
                { id: 'stone17', x: 15102, y: 443, w: 174, h: 97, isStone: true, isSmall: true },
                // 28th Object: Камень 18 (Скалистая арка с лазом под ней)
                { id: 'stone18', x: 15656, y: -200, w: 233, h: 690, isStone: true, noLedgeGrab: true },
                // 29th Object: Камень 19 (Средний гранитный валун)
                { id: 'stone19', x: 16249, y: 347, w: 188, h: 193, isStone: true },
                // 30th Object: Камень 20 (Низкий валун-препятствие)
                { id: 'stone20', x: 16777, y: 426, w: 154, h: 114, isStone: true, isSmall: true },
                // 33rd Object: Камень 21 (Монолит с лианами для подъема)
                { id: 'stone21', x: 18306, y: 66, w: 275, h: 474, isStone: true, noLedgeGrab: true },
                // 34th Object: Камень 22 (Парящая замшелая плита)
                { id: 'stone22', x: 18951, y: 206, w: 235, h: 65, isStone: true },
                // 35th Object: Камень 23 (Средний гранитный валун)
                { id: 'stone23', x: 19536, y: 323, w: 191, h: 217, isStone: true },
                // 38th Object: Камень 24 (Средний гранитный валун)
                { id: 'stone24', x: 21098, y: 341, w: 180, h: 199, isStone: true },
                // 39th Object: Камень 25 (Вершинная скала с флагом победы!)
                { id: 'stone25', x: 21618, y: 80, w: 360, h: 460, isStone: true }
            ],
            turniks: [
                // 4th Object: Дерево 1 с прочной веткой над пропастью (y: 148)
                { id: 'tree1', x: 2299, y: 148, length: 90, trunkX: 2254, isTree: true },
                // 9th Object: Дерево 2 с прочной веткой над пропастью (y: 114)
                { id: 'tree2', x: 5130, y: 114, length: 90, trunkX: 5085, isTree: true },
                // 16th Object: Дерево 3 с прочной веткой над пропастью (y: 108)
                { id: 'tree3', x: 8987, y: 108, length: 90, trunkX: 8942, isTree: true },
                // 21st Object: Дерево 4 с прочной веткой над пропастью (y: 145)
                { id: 'tree4', x: 11763, y: 145, length: 90, trunkX: 11718, isTree: true },
                // 25th Object: Дерево 5 с прочной веткой над пропастью (y: 138)
                { id: 'tree5', x: 13979, y: 138, length: 90, trunkX: 13934, isTree: true },
                // 32nd Object: Дерево 6 с прочной веткой над пропастью (y: 147)
                { id: 'tree6', x: 17784, y: 147, length: 90, trunkX: 17739, isTree: true },
                // 37th Object: Дерево 7 с прочной веткой над пропастью (y: 108)
                { id: 'tree7', x: 20585, y: 108, length: 90, trunkX: 20540, isTree: true }
            ],
            ropes: [
                // 3rd Object: Лиана 1, свисающая над пропастью (ветка y: -110)
                { id: 'liana1', x: 1778, anchorY: -110, length: 268, trunkX: 1688, isVine: true },
                // 8th Object: Лиана 2, свисающая над пропастью (ветка y: -86)
                { id: 'liana2', x: 4586, anchorY: -86, length: 266, trunkX: 4496, isVine: true },
                // 15th Object: Лиана 3, свисающая над пропастью (ветка y: -98)
                { id: 'liana3', x: 8464, anchorY: -98, length: 284, trunkX: 8374, isVine: true },
                // 19th Object: Лиана 4, свисающая над пропастью (ветка y: -131)
                { id: 'liana4', x: 10593, anchorY: -131, length: 283, trunkX: 10503, isVine: true },
                // 24th Object: Лиана 5, свисающая над пропастью (ветка y: -139)
                { id: 'liana5', x: 13440, anchorY: -139, length: 284, trunkX: 13350, isVine: true },
                // 31st Object: Лиана 6, свисающая над пропастью (ветка y: -99)
                { id: 'liana6', x: 17258, anchorY: -99, length: 270, trunkX: 17168, isVine: true },
                // 36th Object: Лиана 7, свисающая над пропастью (ветка y: -104)
                { id: 'liana7', x: 20067, anchorY: -104, length: 273, trunkX: 19977, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы на камне 5
                { x: 3957, topY: 65, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 20th Object: Лианы на камне 13
                { x: 11131, topY: 63, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 33rd Object: Лианы на камне 21
                { x: 18328, topY: 66, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: { x: 21818, y: 80, poleHeight: 110, bannerW: 45, bannerH: 30, isNatureFlag: true }
        },
        // Уровень 40: Финал природы и Битва с Древним Големом
        40: {
            id: 40,
            title: "Уровень 40: Древний Голем",
            theme: "nature",
            worldWidth: 10500,
            groundY: 540,
            playerStartX: 220,
            platforms: [
                { x: 0, y: 540, w: 1400, h: 140, type: 'ground' },
                { x: 1800, y: 540, w: 1200, h: 140, type: 'ground' },
                { x: 3400, y: 540, w: 1200, h: 140, type: 'ground' },
                { x: 5000, y: 540, w: 5500, h: 140, type: 'ground' }
            ],
            chasms: [
                { startX: 1400, endX: 1800 },
                { startX: 3000, endX: 3400 },
                { startX: 4600, endX: 5000 }
            ],
            boxes: [
                // 1st Object: Низкий валун-препятствие
                { id: 'g_s1', x: 500, y: 440, w: 160, h: 100, isStone: true, isSmall: true },
                // 2nd Object: Высокая гранитная скала
                { id: 'g_s2', x: 850, y: 280, w: 200, h: 260, isStone: true },
                // 5th Object: Валун на краю платформы 2
                { id: 'g_s3', x: 1850, y: 380, w: 180, h: 160, isStone: true },
                // 6th Object: Высокий каменный монолит с лианами для подъема
                { id: 'g_s4', x: 2200, y: 70, w: 250, h: 470, isStone: true, noLedgeGrab: true },
                // 8th Object: Парящая замшелая плита
                { id: 'g_s5', x: 2600, y: 240, w: 200, h: 60, isStone: true },
                // 10th Object: Гранитная глыба платформы 3
                { id: 'g_s6', x: 3450, y: 340, w: 190, h: 200, isStone: true },
                // 11th Object: Скалистая арка с лазом под ней (требует подкат / приседание)
                { id: 'g_s7', x: 3800, y: -200, w: 220, h: 690, isStone: true, noLedgeGrab: true },
                // 12th Object: Низкий камень-барьер
                { id: 'g_s8', x: 4180, y: 440, w: 150, h: 100, isStone: true, isSmall: true },
                // 14th Object: Островок-валун посреди пропасти 3
                { id: 'g_s9', x: 4760, y: 320, w: 140, h: 220, isStone: true },
                // 16th Object: Высокий утес платформы 4
                { id: 'g_s10', x: 5080, y: 240, w: 220, h: 300, isStone: true },
                // 17th Object: Монолит перед входом на арену
                { id: 'g_s11', x: 5450, y: 80, w: 250, h: 460, isStone: true, noLedgeGrab: true },
                // 20th Object: Древние каменные врата в священную арену Голема
                { id: 'g_s12', x: 6100, y: 180, w: 260, h: 360, isStone: true }
            ],
            turniks: [
                // 3rd Object: Дерево 1 с прочной веткой (y: 150)
                { id: 'g_t1', x: 1250, y: 150, length: 90, trunkX: 1205, isTree: true },
                // 9th Object: Дерево 2 с веткой над пропастью 2 (y: 140)
                { id: 'g_t2', x: 3180, y: 140, length: 90, trunkX: 3135, isTree: true },
                // 13th Object: Дерево 3 перед пропастью 3 (y: 140)
                { id: 'g_t3', x: 4480, y: 140, length: 90, trunkX: 4435, isTree: true },
                // 19th Object: Вековое дерево-страж у врат арены (y: 140)
                { id: 'g_t4', x: 5850, y: 140, length: 90, trunkX: 5805, isTree: true }
            ],
            ropes: [
                // 4th Object: Лиана 1 над пропастью 1
                { id: 'g_l1', x: 1600, anchorY: -100, length: 270, trunkX: 1510, isVine: true },
                // 15th Object: Лиана 2 над пропастью 3
                { id: 'g_l2', x: 4920, anchorY: -110, length: 270, trunkX: 4830, isVine: true }
            ],
            ladders: [
                // 7th Object: Лианы для подъёма на камень 4
                { x: 2220, topY: 70, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true },
                // 18th Object: Лианы на монолите 11
                { x: 5470, topY: 80, bottomY: 540, w: 42, isVineLadder: true, isWoodLadder: true }
            ],
            flag: null
        }
    };

        let currentLevelData = levelsData[1];

    function loadLevel(levelNum) {
        currentLevelIndex = levelNum;
        currentLevelData = levelsData[levelNum] || levelsData[1];

        // Dynamic HUD control descriptions
        const isNature = currentLevelData.theme === 'nature' || currentLevelIndex >= 21;
        if (ctrlTurnik) {
            ctrlTurnik.innerHTML = isNature
                ? '<span>ВЕТКА</span> Дерево (раскачка)'
                : '<span>ТУРНИК</span> A/D раскачка, Пробел рывок';
        }
        if (ctrlRope) {
            ctrlRope.innerHTML = isNature
                ? '<span>ЛИАНА</span> Раскачка A/D, рывок Пробел'
                : '<span>КАНАТ</span> A/D раскачка, Пробел рывок';
        }
        if (ctrlLadder) {
            ctrlLadder.innerHTML = isNature
                ? '<span>ЛИАНЫ</span> E залезть на камень'
                : '<span>E</span> Лестница';
        }
    }

    // Generate 20 Level Tiles in Grid (Page 1: 1-20, Page 2: 21-40)
    function generateLevelsGrid() {
        if (!levelsGrid) return;
        levelsGrid.innerHTML = '';

        if (currentSelectPage === 1) {
            if (levelPageBadge) {
                levelPageBadge.textContent = '1 страница - Здание Препятствий';
                levelPageBadge.className = 'level-page-badge page-building';
            }
            if (btnPrevPage) {
                btnPrevPage.disabled = true;
                btnPrevPage.classList.add('disabled');
            }
            if (btnNextPage) {
                btnNextPage.disabled = false;
                btnNextPage.classList.remove('disabled');
                btnNextPage.classList.add('pulse-hint');
            }
            if (dotPage1) {
                dotPage1.classList.add('active');
                dotPage1.classList.remove('nature');
            }
            if (dotPage2) {
                dotPage2.classList.remove('active');
                dotPage2.classList.remove('nature');
            }

            for (let i = 1; i <= 20; i++) {
                const tile = document.createElement('div');
                if (i <= unlockedPage1Levels) {
                    tile.className = (i === 20) ? 'level-tile unlocked boss-level-20' : 'level-tile unlocked';
                    if (i === 20) {
                        tile.innerHTML = `<span>20</span><span style="font-size: 0.65rem; display: block; font-weight: 700; letter-spacing: 0.5px;">🤖 БОСС</span>`;
                    } else {
                        tile.textContent = i;
                    }
                    const levelNum = i;
                    tile.addEventListener('click', () => {
                        startLevelWithFade(levelNum);
                    });
                } else {
                    tile.className = (i === 20) ? 'level-tile locked boss-level-20' : 'level-tile locked';
                    tile.innerHTML = (i === 20)
                        ? `<span>20 🤖</span><span class="lock-icon">🔒</span>`
                        : `<span>${i}</span><span class="lock-icon">🔒</span>`;
                }
                levelsGrid.appendChild(tile);
            }
        } else {
            if (levelPageBadge) {
                levelPageBadge.textContent = '2 страница - Дикая Природа';
                levelPageBadge.className = 'level-page-badge page-nature';
            }
            if (btnPrevPage) {
                btnPrevPage.disabled = false;
                btnPrevPage.classList.remove('disabled');
            }
            if (btnNextPage) {
                btnNextPage.disabled = true;
                btnNextPage.classList.add('disabled');
                btnNextPage.classList.remove('pulse-hint');
            }
            if (dotPage1) {
                dotPage1.classList.remove('active');
                dotPage1.classList.remove('nature');
            }
            if (dotPage2) {
                dotPage2.classList.add('active');
                dotPage2.classList.add('nature');
            }

            for (let i = 21; i <= 40; i++) {
                const tile = document.createElement('div');
                if (i <= unlockedPage2Levels) {
                    tile.className = (i === 40) ? 'level-tile unlocked nature boss-level-40' : 'level-tile unlocked nature';
                    if (i === 40) {
                        tile.innerHTML = `<span>40</span><span style="font-size: 0.65rem; display: block; font-weight: 700; letter-spacing: 0.5px;">🗿 БОСС</span>`;
                    } else {
                        tile.textContent = i;
                    }
                    const levelNum = i;
                    tile.addEventListener('click', () => {
                        startLevelWithFade(levelNum);
                    });
                } else {
                    tile.className = (i === 40) ? 'level-tile locked boss-level-40' : 'level-tile locked';
                    tile.innerHTML = (i === 40)
                        ? `<span>40 🗿</span><span class="lock-icon">🔒</span>`
                        : `<span>${i}</span><span class="lock-icon">🔒</span>`;
                }
                levelsGrid.appendChild(tile);
            }
        }
    }

    if (btnNextPage) {
        btnNextPage.addEventListener('click', () => {
            initAudio();
            if (currentSelectPage !== 2) {
                currentSelectPage = 2;
                playSound('jump');
                generateLevelsGrid();
            }
        });
    }

    if (btnPrevPage) {
        btnPrevPage.addEventListener('click', () => {
            initAudio();
            if (currentSelectPage !== 1) {
                currentSelectPage = 1;
                playSound('jump');
                generateLevelsGrid();
            }
        });
    }

    if (dotPage1) {
        dotPage1.addEventListener('click', () => {
            if (currentSelectPage !== 1) {
                initAudio();
                currentSelectPage = 1;
                playSound('jump');
                generateLevelsGrid();
            }
        });
    }

    if (dotPage2) {
        dotPage2.addEventListener('click', () => {
            if (currentSelectPage !== 2) {
                initAudio();
                currentSelectPage = 2;
                playSound('jump');
                generateLevelsGrid();
            }
        });
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

    function startLevelWithFade(levelNum, forceSkipCutscene = false) {
        initAudio();
        loadLevel(levelNum);
        triggerFadeTransition(() => {
            levelSelectScreen.classList.remove('screen-active');
            levelSelectScreen.classList.add('hidden');

            player.reset();
            if (levelNum === 21 && !forceSkipCutscene) {
                startLevel21IntroCutscene();
            } else {
                hudOverlay.classList.remove('hidden');
                currentState = STATES.PLAYING;
            }
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

        if (currentLevelIndex === 20 || currentLevelIndex === 40) {
            currentLevelData.flag = null;
        }
        if (typeof resetGolem === 'function') {
            resetGolem();
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
        if (bossName) {
            bossName.textContent = '🤖 ЛЕТАЮЩИЙ МИНИ-РОБОТ';
        }
        if (bossHealthBar) {
            bossHealthBar.style.width = '100%';
            bossHealthBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)';
        }
        if (bossPhaseText) {
            bossPhaseText.textContent = 'БОСС: 5 / 5';
        }

        playSound('warning');
    }

    function triggerDefeat(isAbyss = false) {
        if (player.state === 'DEFEAT' || player.state === 'VICTORY' || player.state === 'VICTORY_IDLE' || currentState === STATES.CUTSCENE) return;
        player.state = 'DEFEAT';
        player.isAbyssFall = isAbyss;
        player.staggerTimer = 0;
        player.staggerAngle = 0;
        player.vx = isAbyss ? player.vx * 0.3 : 0;
        if (!isAbyss) player.vy = 0;

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
        spawnDust(player.x, Math.min(player.y, currentLevelData.groundY));

        if (defeatScreen) {
            const isNature = currentLevelData.theme === 'nature' || currentLevelIndex >= 21;
            const defeatSubtextEl = defeatScreen.querySelector('.defeat-subtext');
            if (defeatSubtextEl) {
                if (currentLevelIndex === 40 && typeof golem !== 'undefined' && golem.active) {
                    defeatSubtextEl.textContent = (golem.state === 'RAGE_BEAM')
                        ? 'Луч Голема сокрушил вас! Пригнитесь [Ctrl / C / Подкат], чтобы избежать луча!'
                        : 'Древний Голем сокрушил вас! Собирайте камни и уворачивайтесь от атак!';
                } else {
                    defeatSubtextEl.textContent = (isNature || isAbyss)
                        ? 'Вы сорвались в бездну! Раскачивайтесь на ветках и лианах, чтобы перепрыгнуть пропасть.'
                        : 'Робот-босс прервал ваш забег!';
                }
            }
            const defeatTitleEl = defeatScreen.querySelector('.defeat-title');
            if (defeatTitleEl) {
                defeatTitleEl.textContent = (currentLevelIndex === 40 && typeof golem !== 'undefined' && golem.active)
                    ? 'Сокрушение Голема'
                    : ((isNature || isAbyss) ? 'Падение в пропасть' : 'Поражение');
            }
        }
    }

    function isOverChasm(x) {
        if (currentLevelData && currentLevelData.chasms && currentLevelData.chasms.length > 0) {
            for (const c of currentLevelData.chasms) {
                if (x >= c.startX && x <= c.endX) return true;
            }
        }
        if (currentLevelData && currentLevelData.platforms && currentLevelData.platforms.length > 1) {
            let onPlat = false;
            for (const p of currentLevelData.platforms) {
                if (x >= p.x && x <= p.x + p.w) {
                    onPlat = true;
                    break;
                }
            }
            if (!onPlat) return true;
        }
        if (boss && boss.chasms && boss.chasms.length > 0) {
            for (const c of boss.chasms) {
                if (x > c.startX + 6 && x < c.endX - 6) return true;
            }
        }
        if (typeof golem !== 'undefined' && golem && golem.chasms && golem.chasms.length > 0) {
            for (const c of golem.chasms) {
                if (x > c.startX + 6 && x < c.endX - 6) return true;
            }
        }
        return false;
    }

    function updateBoss() {
        if (currentLevelIndex === 40) {
            if (typeof updateGolem === 'function') {
                updateGolem();
            }
            return;
        }

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

    // ==========================================
    // --- LEVEL 40: ANCIENT STONE GOLEM BOSS ---
    // ==========================================
    const golem = {
        active: false,
        x: 7600,
        y: 430,
        vx: 0,
        vy: 0,
        baseY: 430,
        width: 140,
        height: 190,
        health: 50,
        maxHealth: 50,
        state: 'INACTIVE', // 'INTRO', 'IDLE', 'BAMBOO_TELEGRAPH', 'BAMBOO_ERUPT', 'BOMB_CREATE', 'BOMB_THROW', 'TREE_TELEGRAPH', 'TREE_SWING', 'TREE_PAUSE', 'SLAM_WINDUP', 'SLAM_IMPACT', 'RAGE_CHARGE', 'RAGE_BEAM', 'DEFEATED'
        timer: 0,
        attackIndex: 0,
        attackList: ['BAMBOO', 'BOMB', 'TREE', 'SLAM', 'RAGE'],
        hitFlashTimer: 0,
        eyeGlow: 1.0,
        isFallen: false,
        fallAngle: 0,
        arenaLeft: 6360,
        arenaRight: 8600,
        introPlayed: false,
        shoveTimer: 0,
        groundCrackWidth: 0,
        roarShockwaves: [],
        roarArms: 0,
        
        // Attack 1: Bamboo spikes
        bambooWarning: null, // { startX, endX, timer }
        bambooSpikes: null,  // { startX, endX, timer }
        armSwingProg: 0,
        
        // Attack 2: Rock bomb
        boulderBomb: null,   // { formProgress, thrown, x, y, vx, vy, targetX, targetY, radius }
        boulderTarget: null, // { x, y, timer }
        boulderDebris: [],   // harmless rock shards
        
        // Attack 3: Thor's Tree Hammer (Throws tree at player, impacts ground, returns like Mjolnir)
        treeEquipped: false,
        treeThrowCount: 0,
        treeWarning: null,  // { startX, endX, targetX, timer }
        treeAngle: 0,
        thrownTree: null,   // { startX, startY, x, y, targetX, targetY, progress, rot, rotSpeed, state, returnStartX, returnStartY }
        
        // Attack 4: Cracking ground
        fragileGrounds: [],  // [{ id, startX, endX, cracked: true, broken: false, stepped: false, stepTimer: 0 }]
        chasms: [],          // [{ startX, endX }]
        
        // Attack 5: Golem Rage
        rageChargeTimer: 0,
        rageBeamActive: false,
        rageBeamTimer: 0,
        mouthOpen: 0,
        
        // Win condition: Arena stones
        arenaStones: [],     // [{ id, x, y, bobTimer }]
        thrownStones: [],    // [{ x, y, startX, startY, targetX, targetY, t, rot }]
        stoneSpawnTimer: 0
    };

    const golemIntroCutscene = {
        active: false,
        phase: 'NONE', // 'EARTHQUAKE', 'EMERGE', 'ROAR'
        timer: 0,
        rumbleInterval: 0
    };

    const golemCutscene = {
        active: false,
        phase: 'NONE', // 'FALL', 'WALK_TO_SNOW', 'COLD_SHIVER'
        timer: 0,
        snowParticles: [],
        breathPuffs: []
    };

    // Initialize ambient snowflakes for snowy biome
    for (let i = 0; i < 90; i++) {
        golemCutscene.snowParticles.push({
            x: Math.random() * 2500,
            y: Math.random() * 700,
            vx: -0.8 - Math.random() * 1.5,
            vy: 0.9 + Math.random() * 1.8,
            size: 2 + Math.random() * 3.5,
            alpha: 0.4 + Math.random() * 0.6
        });
    }

    function startGolemIntroCutscene() {
        if (golem.introPlayed || golemIntroCutscene.active || golem.active || golem.isFallen) return;
        currentState = STATES.CUTSCENE;
        golemIntroCutscene.active = true;
        golemIntroCutscene.phase = 'EARTHQUAKE';
        golemIntroCutscene.timer = 0;
        golemIntroCutscene.rumbleInterval = 0;

        golem.shoveTimer = 0;
        golem.roarArms = 0;
        golem.mouthOpen = 0;
        golem.roarShockwaves = [];
        golem.groundCrackWidth = 0;
        golem.eyeGlow = 0;
        golem.y = currentLevelData.groundY + 160; // subterranean starting depth beneath floor

        player.vx = 0;
        player.vy = 0;
        player.state = 'IDLE';
        player.facing = 1;
        player.grounded = true;

        if (bossHud) bossHud.classList.add('hidden');
        if (cutsceneOverlay) cutsceneOverlay.classList.remove('hidden');
        if (cutsceneChapter) cutsceneChapter.textContent = '🗿 ДРЕВНИЙ ГОЛЕМ: ПРОБУЖДЕНИЕ';
        if (cutsceneText) cutsceneText.textContent = 'Внезапно земля под ногами начинает яростно трястись... Что-то колоссальное пробуждается в недрах!';

        screenShake = 24;
        playSound('crack');
        playSound('slam');
    }

    function updateGolemIntroCutscene() {
        golemIntroCutscene.timer += 0.016;

        // Camera smoothly focuses on the emergence zone ahead
        const targetCamX = Math.min(golem.x - 450, Math.max(player.x - 220, golem.arenaLeft + 60));
        cameraX += (targetCamX - cameraX) * 0.05;

        // Update roar shockwaves
        for (let i = golem.roarShockwaves.length - 1; i >= 0; i--) {
            const sw = golem.roarShockwaves[i];
            sw.radius += 14;
            sw.alpha -= 0.022;
            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                golem.roarShockwaves.splice(i, 1);
            }
        }

        if (golemIntroCutscene.phase === 'EARTHQUAKE') {
            // Intense floor shaking
            screenShake = Math.max(screenShake, 18);
            golem.groundCrackWidth = Math.min(260, golem.groundCrackWidth + 3.2);

            golemIntroCutscene.rumbleInterval += 0.016;
            if (golemIntroCutscene.rumbleInterval >= 0.42) {
                golemIntroCutscene.rumbleInterval = 0;
                playSound('crack');
                screenShake = 22;
            }

            // Ground fissures, rock shards and dust erupting from the floor at x = 7600
            if (Math.random() < 0.75) {
                particles.push({
                    x: golem.x + (Math.random() - 0.5) * golem.groundCrackWidth,
                    y: currentLevelData.groundY,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -(3 + Math.random() * 8),
                    size: 4 + Math.random() * 6,
                    color: Math.random() < 0.4 ? '#64748b' : (Math.random() < 0.5 ? '#334155' : '#22c55e'),
                    life: 0.8,
                    decay: 0.03
                });
            }

            if (golemIntroCutscene.timer >= 2.2) {
                golemIntroCutscene.phase = 'EMERGE';
                golemIntroCutscene.timer = 0;
                playSound('slam');
                screenShake = 26;
                if (cutsceneText) cutsceneText.textContent = 'Из расколотого пола медленно поднимается исполинский древний голем!';
            }
        } else if (golemIntroCutscene.phase === 'EMERGE') {
            const emergeDuration = 3.0;
            const emergeProg = Math.min(1, golemIntroCutscene.timer / emergeDuration);

            // Golem rises smoothly out of the floor up to baseY
            const startY = currentLevelData.groundY + 160;
            golem.y = startY + (golem.baseY - startY) * Math.sin(emergeProg * Math.PI * 0.5);

            // Emerald eyes and runic body glyphs ignite with emerald light
            golem.eyeGlow = emergeProg;

            screenShake = Math.max(screenShake, 13);

            // Continuous debris and dust bursts around the rising colossus
            if (Math.random() < 0.55) {
                spawnDust(golem.x + (Math.random() - 0.5) * 120, currentLevelData.groundY);
                particles.push({
                    x: golem.x + (Math.random() - 0.5) * 130,
                    y: currentLevelData.groundY - 10,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -(2 + Math.random() * 6),
                    size: 3 + Math.random() * 5,
                    color: Math.random() < 0.5 ? '#475569' : '#1e293b',
                    life: 0.7,
                    decay: 0.035
                });
            }

            if (golemIntroCutscene.timer >= emergeDuration) {
                golem.y = golem.baseY;
                golem.eyeGlow = 1.0;
                golemIntroCutscene.phase = 'ROAR';
                golemIntroCutscene.timer = 0;
                golemIntroCutscene.rumbleInterval = 0;

                playSound('golemRoar');
                screenShake = 26;
                if (cutsceneText) cutsceneText.textContent = 'Голем расправляет исполинские плечи и издаёт оглушительный первобытный рёв!';
            }
        } else if (golemIntroCutscene.phase === 'ROAR') {
            const roarDuration = 2.8;
            const roarProg = Math.min(1, golemIntroCutscene.timer / 0.45);
            golem.roarArms = roarProg;
            golem.mouthOpen = roarProg;

            screenShake = Math.max(screenShake, 16);

            // Expanding sonic roar shockwaves
            golemIntroCutscene.rumbleInterval += 0.016;
            if (golemIntroCutscene.rumbleInterval >= 0.38) {
                golemIntroCutscene.rumbleInterval = 0;
                golem.roarShockwaves.push({
                    x: golem.x,
                    y: golem.y - 75,
                    radius: 15,
                    maxRadius: 650,
                    alpha: 1.0
                });
                playSound('laserFire');
            }

            // Green energy sparkles bursting around Golem during roar
            if (Math.random() < 0.55) {
                particles.push({
                    x: golem.x + (Math.random() - 0.5) * 45,
                    y: golem.y - 70 + (Math.random() - 0.5) * 35,
                    vx: -(4 + Math.random() * 10),
                    vy: (Math.random() - 0.5) * 6,
                    size: 3 + Math.random() * 5,
                    color: Math.random() < 0.6 ? '#22c55e' : '#86efac',
                    life: 0.7,
                    decay: 0.035
                });
            }

            if (golemIntroCutscene.timer >= roarDuration) {
                finishGolemIntroCutscene();
            }
        }
    }

    function finishGolemIntroCutscene() {
        if (!golemIntroCutscene.active) return;
        golemIntroCutscene.active = false;
        golem.introPlayed = true;
        golem.roarArms = 0;
        golem.mouthOpen = 0;
        golem.y = golem.baseY;
        golem.eyeGlow = 1.0;

        if (cutsceneOverlay) cutsceneOverlay.classList.add('hidden');
        if (hudOverlay) hudOverlay.classList.remove('hidden');

        currentState = STATES.PLAYING;
        startGolemFight();
    }

    function startGolemFight() {
        if (golem.active) return;
        golem.active = true;
        golem.health = 50;
        golem.maxHealth = 50;
        golem.x = 7600;
        golem.y = currentLevelData.groundY - 110;
        golem.baseY = currentLevelData.groundY - 110;
        golem.state = 'IDLE';
        golem.timer = 0;
        golem.attackIndex = 0;
        golem.hitFlashTimer = 0;
        golem.eyeGlow = 1.0;
        golem.isFallen = false;
        golem.fallAngle = 0;
        golem.armSwingProg = 0;
        golem.mouthOpen = 0;
        golem.shoveTimer = 0;
        golem.roarArms = 0;
        golem.bambooWarning = null;
        golem.bambooSpikes = null;
        golem.boulderBomb = null;
        golem.boulderTarget = null;
        golem.boulderDebris = [];
        golem.treeEquipped = false;
        golem.treeThrowCount = 0;
        golem.treeWarning = null;
        golem.thrownTree = null;
        golem.fragileGrounds = [];
        golem.chasms = [];
        golem.rageBeamActive = false;
        golem.arenaStones = [];
        golem.thrownStones = [];
        golem.stoneSpawnTimer = 0;

        // Player has full parkour freedom (not locked to auto-run)
        player.isBossMode = false;

        if (bossHud) {
            bossHud.classList.remove('hidden');
        }
        if (bossName) {
            bossName.textContent = '🗿 ДРЕВНИЙ КАМЕННЫЙ ГОЛЕМ';
        }
        if (bossHealthBar) {
            bossHealthBar.style.width = '100%';
            bossHealthBar.style.background = 'linear-gradient(90deg, #10b981 0%, #22c55e 100%)';
        }
        if (bossPhaseText) {
            bossPhaseText.textContent = 'БОСС: 50 / 50 (Собирайте камни!)';
        }

        playSound('slam');
        screenShake = 16;
        spawnDust(golem.x, currentLevelData.groundY);
    }

    function resetGolem() {
        golem.active = false;
        golem.health = 50;
        golem.state = 'INACTIVE';
        golem.timer = 0;
        golem.attackIndex = 0;
        golem.hitFlashTimer = 0;
        golem.eyeGlow = 1.0;
        golem.isFallen = false;
        golem.fallAngle = 0;
        golem.armSwingProg = 0;
        golem.mouthOpen = 0;
        golem.introPlayed = false;
        golem.shoveTimer = 0;
        golem.groundCrackWidth = 0;
        golem.roarShockwaves = [];
        golem.roarArms = 0;
        golem.bambooWarning = null;
        golem.bambooSpikes = null;
        golem.boulderBomb = null;
        golem.boulderTarget = null;
        golem.boulderDebris = [];
        golem.treeEquipped = false;
        golem.treeThrowCount = 0;
        golem.treeWarning = null;
        golem.thrownTree = null;
        golem.fragileGrounds = [];
        golem.chasms = [];
        golem.rageBeamActive = false;
        golem.arenaStones = [];
        golem.thrownStones = [];
        golemIntroCutscene.active = false;
        golemIntroCutscene.phase = 'NONE';
        golemIntroCutscene.timer = 0;
        golemCutscene.active = false;
        golemCutscene.phase = 'NONE';
        golemCutscene.breathPuffs = [];

        if (currentLevelIndex === 40 && bossHud) {
            bossHud.classList.add('hidden');
        }
    }

    function canSeeSnowyBiome() {
        if (currentLevelIndex !== 40) return false;
        const scale = canvas.height / 675;
        const screenW = canvas.width / scale;
        const snowStartX = 7850; // Snowy biome begins right behind the Golem (x = 7600)
        const screenSnowStart = (snowStartX - cameraX) * scale;
        // Activates as soon as player/camera brings the snowy biome behind Golem into view
        return (screenSnowStart <= canvas.width - 20 * scale) || (player.x >= 7050);
    }

    function updateGolem() {
        // Trigger fight entrance only when the player can see the snowy biome behind Golem
        if (!golem.active && !golem.isFallen && player.state !== 'DEFEAT') {
            if (canSeeSnowyBiome()) {
                if (!golem.introPlayed) {
                    startGolemIntroCutscene();
                    return;
                } else {
                    startGolemFight();
                }
            }
        }

        if (golem.shoveTimer > 0) golem.shoveTimer -= 0.016;

        // Update roar shockwaves if still fading
        for (let i = golem.roarShockwaves.length - 1; i >= 0; i--) {
            const sw = golem.roarShockwaves[i];
            sw.radius += 14;
            sw.alpha -= 0.022;
            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                golem.roarShockwaves.splice(i, 1);
            }
        }

        if (!golem.active) return;

        if (player.state === 'DEFEAT') {
            return;
        }

        // Keep player strictly bounded within arena bounds
        if (player.x < golem.arenaLeft + 30) {
            player.x = golem.arenaLeft + 30;
            if (player.vx < 0) player.vx = 0;
        }
        if (player.x > golem.arenaRight - 30) {
            player.x = golem.arenaRight - 30;
            if (player.vx > 0) player.vx = 0;
        }

        golem.timer += 0.016;
        if (golem.hitFlashTimer > 0) golem.hitFlashTimer -= 0.016;

        // Smoothly heal floor emergence crack over 10 seconds
        if (golem.groundCrackWidth > 0) {
            golem.groundCrackWidth = Math.max(0, golem.groundCrackWidth - 0.4);
        }

        // Screen shake decay
        if (screenShake > 0) {
            screenShake *= 0.88;
            if (screenShake < 0.2) screenShake = 0;
        }

        // ==========================================
        // 1. ARENA STONES SPAWN & COLLECTION (WIN MECHANIC)
        // ==========================================
        golem.stoneSpawnTimer += 0.016;
        if (golem.stoneSpawnTimer >= 1.3 && golem.arenaStones.length < 3 && golem.health > 0) {
            golem.stoneSpawnTimer = 0;
            const randX = golem.arenaLeft + 80 + Math.random() * (golem.x - golem.arenaLeft - 160);
            let onChasm = false;
            for (const ch of golem.chasms) {
                if (randX >= ch.startX - 30 && randX <= ch.endX + 30) {
                    onChasm = true;
                    break;
                }
            }
            if (!onChasm) {
                golem.arenaStones.push({
                    id: Math.random(),
                    x: randX,
                    y: currentLevelData.groundY,
                    bobTimer: Math.random() * Math.PI * 2
                });
            }
        }

        // Player collects stone
        for (let i = golem.arenaStones.length - 1; i >= 0; i--) {
            const st = golem.arenaStones[i];
            st.bobTimer += 0.05;
            if (Math.abs(player.x - st.x) < 38 && player.y >= currentLevelData.groundY - 45) {
                // Collect stone & throw projectile towards Golem
                golem.thrownStones.push({
                    x: player.x,
                    y: player.y - 36,
                    startX: player.x,
                    startY: player.y - 36,
                    targetX: golem.x,
                    targetY: golem.y - 30,
                    t: 0,
                    rot: 0
                });
                golem.arenaStones.splice(i, 1);
                playSound('airBoost');
                spawnDust(st.x, currentLevelData.groundY);
            }
        }

        // Update thrown stones
        for (let i = golem.thrownStones.length - 1; i >= 0; i--) {
            const p = golem.thrownStones[i];
            p.t += 0.06;
            p.rot += 0.28;
            p.x = p.startX + (p.targetX - p.startX) * p.t;
            p.y = p.startY + (p.targetY - p.startY) * p.t - Math.sin(p.t * Math.PI) * 75;

            if (p.t >= 1.0) {
                // Impact on Golem!
                golem.thrownStones.splice(i, 1);
                golem.health = Math.max(0, golem.health - 1);
                golem.hitFlashTimer = 0.22;
                screenShake = 6;
                playSound('rockHit');

                // Burst particles at impact spot
                for (let k = 0; k < 8; k++) {
                    particles.push({
                        x: golem.x + (Math.random() - 0.5) * 40,
                        y: golem.y - 30 + (Math.random() - 0.5) * 40,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        size: 3 + Math.random() * 4,
                        color: Math.random() < 0.5 ? '#22c55e' : '#cbd5e1',
                        life: 0.8,
                        decay: 0.04
                    });
                }

                if (bossHealthBar) {
                    bossHealthBar.style.width = Math.max(0, (golem.health / golem.maxHealth) * 100) + '%';
                }
                if (bossPhaseText) {
                    bossPhaseText.textContent = `БОСС: ${golem.health} / 50`;
                }

                if (golem.health <= 0) {
                    startGolemDefeatCutscene();
                    return;
                }
            }
        }

        // ==========================================
        // 2. FRAGILE GROUND TILE & CHASM HEALING (ATTACK 4 - 10S LIFETIME)
        // ==========================================
        for (let i = golem.fragileGrounds.length - 1; i >= 0; i--) {
            const fg = golem.fragileGrounds[i];

            if (!fg.broken) {
                // Timer while unbroken
                fg.timer = (fg.timer || 0) + 0.016;

                // Player step check (breaks slab into abyss chasm)
                if (player.grounded && player.x > fg.startX && player.x < fg.endX) {
                    if (!fg.stepped) {
                        fg.stepped = true;
                        playSound('crack');
                        screenShake = 5;
                    }
                    fg.stepTimer += 0.016;
                    if (fg.stepTimer >= 0.22) {
                        fg.broken = true;
                        fg.chasmTimer = 0;
                        golem.chasms.push({ id: fg.id, startX: fg.startX, endX: fg.endX });
                        playSound('slam');
                        screenShake = 12;
                        spawnDust(fg.startX + (fg.endX - fg.startX) / 2, currentLevelData.groundY);
                    }
                }

                // If crack was not broken within 10 seconds, it seals itself!
                if (!fg.broken && fg.timer >= 10.0) {
                    playSound('land');
                    const midX = (fg.startX + fg.endX) / 2;
                    spawnDust(midX, currentLevelData.groundY);
                    for (let p = 0; p < 12; p++) {
                        particles.push({
                            x: fg.startX + Math.random() * (fg.endX - fg.startX),
                            y: currentLevelData.groundY,
                            vx: (Math.random() - 0.5) * 4,
                            vy: -Math.random() * 3 - 1,
                            size: 3 + Math.random() * 3,
                            color: Math.random() < 0.5 ? '#15803d' : '#64748b',
                            life: 0.6,
                            decay: 0.04
                        });
                    }
                    golem.fragileGrounds.splice(i, 1);
                }
            } else {
                // If broken into a chasm, chasm also seals itself after 10 seconds!
                fg.chasmTimer = (fg.chasmTimer || 0) + 0.016;
                if (fg.chasmTimer >= 10.0) {
                    // Chasm seals up: earth rises from the abyss and closes the pit!
                    playSound('slam');
                    screenShake = 6;
                    const midX = (fg.startX + fg.endX) / 2;
                    spawnDust(midX, currentLevelData.groundY);

                    // Stone & nature particles bursting upward as the chasm knits together
                    for (let p = 0; p < 16; p++) {
                        particles.push({
                            x: fg.startX + Math.random() * (fg.endX - fg.startX),
                            y: currentLevelData.groundY + (Math.random() - 0.5) * 10,
                            vx: (Math.random() - 0.5) * 5,
                            vy: -Math.random() * 5 - 2,
                            size: 4 + Math.random() * 4,
                            color: Math.random() < 0.5 ? '#22c55e' : '#475569',
                            life: 0.7,
                            decay: 0.035
                        });
                    }

                    // Remove chasm from golem.chasms
                    for (let c = golem.chasms.length - 1; c >= 0; c--) {
                        const ch = golem.chasms[c];
                        if (ch.id === fg.id || (Math.abs(ch.startX - fg.startX) < 5 && Math.abs(ch.endX - fg.endX) < 5)) {
                            golem.chasms.splice(c, 1);
                        }
                    }

                    // Remove from fragileGrounds
                    golem.fragileGrounds.splice(i, 1);
                }
            }
        }

        // ==========================================
        // 3. BOULDER DEBRIS PARTICLES (HARMLESS)
        // ==========================================
        for (let i = golem.boulderDebris.length - 1; i >= 0; i--) {
            const deb = golem.boulderDebris[i];
            deb.x += deb.vx;
            deb.y += deb.vy;
            deb.vy += 0.5;
            deb.rot += deb.rotSpeed;
            if (deb.y >= currentLevelData.groundY - 5) {
                deb.y = currentLevelData.groundY - 5;
                deb.vy = -deb.vy * 0.35;
                deb.vx *= 0.85;
            }
            deb.life -= deb.decay;
            if (deb.life <= 0) golem.boulderDebris.splice(i, 1);
        }

        // ==========================================
        // 4. GOLEM ATTACK STATE MACHINE
        // ==========================================
        if (golem.state === 'INTRO') {
            golem.y = golem.baseY + Math.sin(golem.timer * 3) * 6;
            if (golem.timer >= 1.2) {
                golem.state = 'IDLE';
                golem.timer = 0;
            }
            return;
        }

        if (golem.state === 'IDLE') {
            golem.y = golem.baseY + Math.sin(Date.now() * 0.003) * 5;
            if (golem.timer >= 1.2) {
                const nextAttack = golem.attackList[golem.attackIndex % golem.attackList.length];
                golem.timer = 0;

                if (nextAttack === 'BAMBOO') {
                    golem.state = 'BAMBOO_TELEGRAPH';
                    const targetX = Math.max(golem.arenaLeft + 80, Math.min(golem.arenaRight - 180, player.x));
                    golem.bambooWarning = { startX: targetX - 110, endX: targetX + 110, timer: 1.0 };
                    playSound('warning');
                } else if (nextAttack === 'BOMB') {
                    golem.state = 'BOMB_CREATE';
                    const targetX = Math.max(golem.arenaLeft + 60, Math.min(golem.arenaRight - 60, player.x));
                    golem.boulderTarget = { x: targetX, y: currentLevelData.groundY, timer: 1.0 };
                    golem.boulderBomb = { formProg: 0, x: golem.x - 55, y: golem.y - 25, radius: 0 };
                    playSound('warning');
                } else if (nextAttack === 'TREE') {
                    golem.state = 'TREE_TELEGRAPH';
                    golem.treeEquipped = true;
                    golem.treeThrowCount = 0;
                    golem.treeAngle = 0;
                    golem.thrownTree = null;
                    const targetX = Math.max(golem.arenaLeft + 90, Math.min(golem.arenaRight - 150, player.x));
                    golem.treeWarning = { startX: targetX - 90, endX: targetX + 90, targetX: targetX, timer: 1.0 };
                    playSound('warning');
                } else if (nextAttack === 'SLAM') {
                    golem.state = 'SLAM_WINDUP';
                    playSound('warning');
                } else if (nextAttack === 'RAGE') {
                    golem.state = 'RAGE_CHARGE';
                    playSound('laserCharge');
                }
            }
            return;
        }

        // --- ATTACK 1: BAMBOO SPIKES ---
        if (golem.state === 'BAMBOO_TELEGRAPH') {
            golem.armSwingProg = Math.min(1, golem.timer / 1.0);
            if (golem.timer >= 1.0) {
                golem.state = 'BAMBOO_ERUPT';
                golem.timer = 0;
                golem.bambooSpikes = {
                    startX: golem.bambooWarning.startX,
                    endX: golem.bambooWarning.endX,
                    timer: 0.8
                };
                golem.bambooWarning = null;
                playSound('bambooSpikes');
                screenShake = 10;
                spawnDust((golem.bambooSpikes.startX + golem.bambooSpikes.endX) / 2, currentLevelData.groundY);
            }
            return;
        }

        if (golem.state === 'BAMBOO_ERUPT') {
            // Check collision: player is grounded in the bamboo zone
            if (player.x > golem.bambooSpikes.startX && player.x < golem.bambooSpikes.endX) {
                if (player.grounded || player.y >= currentLevelData.groundY - 35) {
                    triggerDefeat();
                }
            }
            if (golem.timer >= 0.8) {
                golem.bambooSpikes = null;
                golem.armSwingProg = 0;
                golem.attackIndex++;
                golem.state = 'IDLE';
                golem.timer = 0;
            }
            return;
        }

        // --- ATTACK 2: ROCK BOMB ---
        if (golem.state === 'BOMB_CREATE') {
            golem.boulderBomb.formProg = Math.min(1, golem.timer / 1.0);
            golem.boulderBomb.radius = 28 * golem.boulderBomb.formProg;
            if (golem.timer >= 1.0) {
                golem.state = 'BOMB_THROW';
                golem.timer = 0;
                golem.boulderBomb.thrown = true;
                golem.boulderBomb.startX = golem.boulderBomb.x;
                golem.boulderBomb.startY = golem.boulderBomb.y;
                golem.boulderBomb.targetX = golem.boulderTarget.x;
                golem.boulderBomb.targetY = currentLevelData.groundY - 10;
                golem.boulderBomb.progress = 0;
                golem.boulderBomb.rot = 0;
                playSound('airBoost');
            }
            return;
        }

        if (golem.state === 'BOMB_THROW') {
            if (!golem.boulderBomb || !golem.boulderTarget) {
                golem.state = 'IDLE';
                golem.timer = 0;
                return;
            }
            const bomb = golem.boulderBomb;
            bomb.progress += 0.016 / 0.65; // ~0.65s flight time
            const p = Math.min(1, bomb.progress);
            bomb.x = bomb.startX + (bomb.targetX - bomb.startX) * p;
            bomb.y = bomb.startY + (bomb.targetY - bomb.startY) * p - Math.sin(p * Math.PI) * 150;
            bomb.rot = (bomb.rot || 0) + 0.15;

            // In-flight collision if player jumps up directly into the flying boulder
            if (Math.abs(player.x - bomb.x) < 30 && Math.abs(player.y - bomb.y) < 30) {
                triggerDefeat();
                return;
            }

            if (bomb.progress >= 1.0) {
                // Impact PRECISELY in the center of the warning zone!
                const hitX = bomb.targetX;
                bomb.x = hitX;
                bomb.y = currentLevelData.groundY - 10;

                // Ground damage check: only hits player if player is inside the warning zone (radius ~50px)
                if (Math.abs(player.x - hitX) < 55 && player.y >= currentLevelData.groundY - 45) {
                    triggerDefeat();
                }

                // Shatters into harmless debris fragments from the exact impact warning point
                for (let k = 0; k < 18; k++) {
                    golem.boulderDebris.push({
                        x: hitX + (Math.random() - 0.5) * 20,
                        y: currentLevelData.groundY - 8,
                        vx: (Math.random() - 0.5) * 14,
                        vy: -(3 + Math.random() * 8),
                        rot: Math.random() * Math.PI,
                        rotSpeed: (Math.random() - 0.5) * 0.4,
                        size: 5 + Math.random() * 8,
                        life: 1.0,
                        decay: 0.02 + Math.random() * 0.02,
                        color: Math.random() < 0.4 ? '#475569' : '#64748b'
                    });
                }

                playSound('slam');
                screenShake = 16;
                spawnDust(hitX, currentLevelData.groundY);
                golem.boulderBomb = null;
                golem.boulderTarget = null;
                golem.attackIndex++;
                golem.state = 'IDLE';
                golem.timer = 0;
            }
            return;
        }

        // --- ATTACK 3: THOR'S TREE HAMMER (THROW & RETURN) ---
        if (golem.state === 'TREE_TELEGRAPH') {
            golem.treeAngle = -Math.PI * 0.45 * Math.min(1, golem.timer / 1.0);
            if (golem.timer >= 1.0) {
                golem.state = 'TREE_THROW';
                golem.timer = 0;
                golem.treeEquipped = false;
                const targetX = golem.treeWarning ? golem.treeWarning.targetX : player.x;
                const targetY = currentLevelData.groundY - 12;
                golem.thrownTree = {
                    startX: golem.x - 40,
                    startY: golem.y - 30,
                    x: golem.x - 40,
                    y: golem.y - 30,
                    targetX: targetX,
                    targetY: targetY,
                    progress: 0,
                    rot: -0.6,
                    rotSpeed: -14,
                    state: 'FLYING_OUT',
                    returnStartX: 0,
                    returnStartY: 0
                };
                playSound('treeSwing');
            }
            return;
        }

        if (golem.state === 'TREE_THROW') {
            golem.treeAngle = Math.PI * 0.28 * Math.min(1, golem.timer / 0.15);
            if (!golem.thrownTree) {
                golem.state = 'IDLE';
                golem.timer = 0;
                return;
            }
            const tree = golem.thrownTree;
            tree.progress += 0.016 / 0.52; // reaches target in ~0.52s
            const p = Math.min(1, tree.progress);
            tree.x = tree.startX + (tree.targetX - tree.startX) * p;
            tree.y = tree.startY + (tree.targetY - tree.startY) * p - Math.sin(p * Math.PI) * 110;
            tree.rot += tree.rotSpeed * 0.016;

            // Emerald motion trail particles
            if (Math.random() < 0.6) {
                particles.push({
                    x: tree.x + (Math.random() - 0.5) * 20,
                    y: tree.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    size: 3 + Math.random() * 3,
                    color: Math.random() < 0.5 ? '#22c55e' : '#84cc16',
                    life: 0.45,
                    decay: 0.05
                });
            }

            // Player dodge collision check while tree is flying forward
            if (Math.abs(player.x - tree.x) < 55 && Math.abs(player.y - tree.y) < 65) {
                if (!player.isCrouching && player.state !== 'ROLL') {
                    triggerDefeat();
                }
            }

            if (tree.progress >= 1.0) {
                // Ground impact!
                tree.x = tree.targetX;
                tree.y = tree.targetY;
                tree.rot = 0.28; // embedded into earth
                tree.state = 'IMPACT';
                golem.state = 'TREE_IMPACT';
                golem.timer = 0;
                golem.treeWarning = null;

                playSound('slam');
                screenShake = 18;
                spawnDust(tree.x, currentLevelData.groundY);

                // Earth shards from impact
                for (let k = 0; k < 14; k++) {
                    particles.push({
                        x: tree.x + (Math.random() - 0.5) * 36,
                        y: currentLevelData.groundY - 8,
                        vx: (Math.random() - 0.5) * 8,
                        vy: -Math.random() * 7 - 2,
                        size: 3 + Math.random() * 4,
                        color: Math.random() < 0.5 ? '#78350f' : '#64748b',
                        life: 0.8,
                        decay: 0.04
                    });
                }

                // Splash damage on ground impact (crouch or roll or airborne is safe)
                if (Math.abs(player.x - tree.targetX) < 80 && (player.grounded || player.y >= currentLevelData.groundY - 35)) {
                    if (!player.isCrouching && player.state !== 'ROLL') {
                        triggerDefeat();
                    }
                }
            }
            return;
        }

        if (golem.state === 'TREE_IMPACT') {
            // Embedded tree trembles in the ground
            if (golem.thrownTree) {
                golem.thrownTree.rot = 0.28 + Math.sin(golem.timer * 35) * 0.04;
                if (Math.random() < 0.5) {
                    particles.push({
                        x: golem.thrownTree.x + (Math.random() - 0.5) * 30,
                        y: currentLevelData.groundY - 10 + (Math.random() - 0.5) * 15,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -Math.random() * 4,
                        size: 2 + Math.random() * 3,
                        color: '#4ade80',
                        life: 0.4,
                        decay: 0.08
                    });
                }
            }

            // Golem pauses for 0.45s, then recalls the tree like Thor summoning Mjolnir
            if (golem.timer >= 0.45) {
                golem.state = 'TREE_RETURN';
                golem.timer = 0;
                if (golem.thrownTree) {
                    golem.thrownTree.state = 'RETURNING';
                    golem.thrownTree.returnStartX = golem.thrownTree.x;
                    golem.thrownTree.returnStartY = golem.thrownTree.y;
                    golem.thrownTree.progress = 0;
                    golem.thrownTree.rotSpeed = 16;
                }
                playSound('laserCharge');
            }
            return;
        }

        if (golem.state === 'TREE_RETURN') {
            golem.treeAngle = -Math.PI * 0.12; // reaching open palm towards returning tree
            if (!golem.thrownTree) {
                golem.state = 'IDLE';
                golem.timer = 0;
                return;
            }
            const tree = golem.thrownTree;
            tree.progress += 0.016 / 0.50; // returns in ~0.50s
            const p = Math.min(1, tree.progress);
            const handX = golem.x - 40;
            const handY = golem.y - 30;
            tree.x = tree.returnStartX + (handX - tree.returnStartX) * p;
            tree.y = tree.returnStartY + (handY - tree.returnStartY) * p - Math.sin(p * Math.PI) * 75;
            tree.rot += tree.rotSpeed * 0.016;

            // Green energy trail behind returning hammer-tree
            if (Math.random() < 0.5) {
                particles.push({
                    x: tree.x + (Math.random() - 0.5) * 20,
                    y: tree.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    size: 3 + Math.random() * 3,
                    color: '#34d399',
                    life: 0.4,
                    decay: 0.06
                });
            }

            // Player dodge collision check while tree is flying BACK to Golem
            if (Math.abs(player.x - tree.x) < 55 && Math.abs(player.y - tree.y) < 65) {
                if (!player.isCrouching && player.state !== 'ROLL') {
                    triggerDefeat();
                }
            }

            if (tree.progress >= 1.0) {
                // Catch! Snaps into Golem's hand
                golem.treeEquipped = true;
                golem.thrownTree = null;
                golem.treeWarning = null;
                playSound('slam');
                screenShake = 9;

                // Catch burst of emerald energy particles around hand
                for (let k = 0; k < 12; k++) {
                    particles.push({
                        x: golem.x - 40 + (Math.random() - 0.5) * 30,
                        y: golem.y - 30 + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        size: 3 + Math.random() * 3,
                        color: '#22c55e',
                        life: 0.5,
                        decay: 0.05
                    });
                }

                golem.treeThrowCount++;
                if (golem.treeThrowCount < 2) {
                    // Pause for 0.7s before throw 2
                    golem.state = 'TREE_PAUSE';
                    golem.timer = 0;
                } else {
                    // 2 throws complete: tree shatters into wood/leaf fragments!
                    golem.treeEquipped = false;
                    for (let k = 0; k < 16; k++) {
                        particles.push({
                            x: golem.x - 40 + (Math.random() - 0.5) * 40,
                            y: golem.y - 30 + (Math.random() - 0.5) * 40,
                            vx: (Math.random() - 0.5) * 7,
                            vy: (Math.random() - 0.5) * 7,
                            size: 4 + Math.random() * 4,
                            color: Math.random() < 0.5 ? '#15803d' : '#854d0e',
                            life: 0.8,
                            decay: 0.04
                        });
                    }
                    golem.attackIndex++;
                    golem.state = 'IDLE';
                    golem.timer = 0;
                }
            }
            return;
        }

        if (golem.state === 'TREE_PAUSE') {
            if (golem.timer >= 0.7) {
                // Prepare next throw telegraph
                golem.state = 'TREE_TELEGRAPH';
                golem.timer = 0;
                const targetX = Math.max(golem.arenaLeft + 90, Math.min(golem.arenaRight - 150, player.x));
                golem.treeWarning = { startX: targetX - 90, endX: targetX + 90, targetX: targetX, timer: 1.0 };
                playSound('warning');
            }
            return;
        }

        // --- ATTACK 4: CRACKING GROUND ---
        if (golem.state === 'SLAM_WINDUP') {
            golem.y = golem.baseY - 38 * Math.sin((golem.timer / 0.8) * Math.PI * 0.5);
            if (golem.timer >= 0.8) {
                golem.state = 'SLAM_IMPACT';
                golem.timer = 0;
                golem.y = golem.baseY;
                playSound('slam');
                screenShake = 22;
                spawnDust(golem.x, currentLevelData.groundY);

                // Add fragile cracked ground sections (if fewer than 4)
                if (golem.fragileGrounds.filter(g => !g.broken).length < 4) {
                    const candidateSpots = [
                        golem.arenaLeft + 320,
                        golem.arenaLeft + 780,
                        golem.arenaLeft + 1280,
                        golem.arenaLeft + 1720
                    ];
                    candidateSpots.forEach(sp => {
                        const alreadyExists = golem.fragileGrounds.some(g => Math.abs(g.startX - sp) < 80);
                        if (!alreadyExists && golem.fragileGrounds.filter(g => !g.broken).length < 4) {
                            golem.fragileGrounds.push({
                                id: Math.random(),
                                startX: sp,
                                endX: sp + 130,
                                cracked: true,
                                broken: false,
                                stepped: false,
                                stepTimer: 0,
                                timer: 0,
                                chasmTimer: 0
                            });
                        }
                    });
                }
            }
            return;
        }

        if (golem.state === 'SLAM_IMPACT') {
            if (golem.timer >= 0.7) {
                golem.attackIndex++;
                golem.state = 'IDLE';
                golem.timer = 0;
            }
            return;
        }

        // --- ATTACK 5: GOLEM RAGE (2S CHARGE + COLOSSAL GREEN BEAM) ---
        if (golem.state === 'RAGE_CHARGE') {
            golem.mouthOpen = Math.min(1, golem.timer / 1.5);
            if (golem.timer >= 2.0) {
                golem.state = 'RAGE_BEAM';
                golem.timer = 0;
                golem.rageBeamActive = true;
                playSound('laserFire');
                screenShake = 20;
            }
            return;
        }

        if (golem.state === 'RAGE_BEAM') {
            screenShake = Math.max(screenShake, 8);

            // Dodge check: Player must crouch or slide/roll to duck under the beam!
            // Standing torso/head (player standing height 76) or jumping into the beam causes defeat!
            const isDucking = player.isCrouching || player.state === 'ROLL';
            if (!isDucking) {
                triggerDefeat();
            } else if (!player.grounded && player.y < currentLevelData.groundY - 38) {
                // If airborne above the safe ducking clearance level
                triggerDefeat();
            }

            if (golem.timer >= 1.3) {
                golem.rageBeamActive = false;
                golem.mouthOpen = 0;
                golem.attackIndex++;
                golem.state = 'IDLE';
                golem.timer = 0;
            }
            return;
        }
    }

    // ==========================================
    // --- GOLEM DEFEAT CUTSCENE & SNOW BIOME ---
    // ==========================================
    function startGolemDefeatCutscene() {
        if (player.state === 'DEFEAT' || currentState === STATES.DEFEAT) return;
        currentState = STATES.CUTSCENE;
        golem.state = 'DEFEATED';
        golem.active = false;
        golemCutscene.active = true;
        golemCutscene.phase = 'FALL';
        golemCutscene.timer = 0;
        golemCutscene.breathPuffs = [];

        // Clean up lingering combat hazards
        golem.bambooWarning = null;
        golem.bambooSpikes = null;
        golem.boulderBomb = null;
        golem.boulderTarget = null;
        golem.treeEquipped = false;
        golem.treeThrowCount = 0;
        golem.treeWarning = null;
        golem.thrownTree = null;
        golem.rageBeamActive = false;
        golem.arenaStones = [];
        golem.thrownStones = [];

        if (bossHud) bossHud.classList.add('hidden');
        if (cutsceneOverlay) cutsceneOverlay.classList.remove('hidden');
        if (cutsceneChapter) cutsceneChapter.textContent = '🗿 ПОРАЖЕНИЕ ДРЕВНЕГО ГОЛЕМА';
        if (cutsceneText) cutsceneText.textContent = 'Древний гигант сокрушён и теряет последние силы...';

        player.state = 'IDLE';
        player.vx = 0;
        player.vy = 0;
        player.facing = 1;

        playSound('victory');
    }

    function updateGolemDefeatCutscene() {
        golemCutscene.timer += 0.016;

        if (golemCutscene.phase === 'FALL') {
            const prog = Math.min(1, golemCutscene.timer / 2.0);
            golem.fallAngle = -(Math.PI * 0.48) * prog;
            golem.y = golem.baseY + 28 * prog;

            // Green eyes dim and extinguish
            golem.eyeGlow = Math.max(0, 1.0 - prog * 1.15);

            if (prog >= 1.0 && !golem.isFallen) {
                golem.isFallen = true;
                golem.eyeGlow = 0; // Completely dark
                screenShake = 18;
                playSound('slam');
                spawnDust(golem.x, currentLevelData.groundY);
                if (cutsceneText) cutsceneText.textContent = 'Голем падает на спину, и его пылающие зелёные глаза навсегда угасают...';
            }

            if (golemCutscene.timer >= 3.2) {
                golemCutscene.phase = 'WALK_TO_SNOW';
                golemCutscene.timer = 0;
                player.state = 'WALK';
                player.vx = 3.2;
                player.facing = 1;
                if (cutsceneChapter) cutsceneChapter.textContent = '❄️ ГЛАВА 3: СНЕЖНЫЙ БИОМ';
                if (cutsceneText) cutsceneText.textContent = 'Стикмен продолжает свой путь в неизведанный холодный мир...';
            }
        } else if (golemCutscene.phase === 'WALK_TO_SNOW') {
            player.animTime += 0.15;
            player.x += player.vx;
            player.state = 'WALK';

            // Camera tracks player
            const targetCamX = player.x - 320;
            cameraX += (targetCamX - cameraX) * 0.08;

            if (player.x >= 9100) {
                player.x = 9100;
                player.vx = 0;
                player.state = 'COLD_SHIVER';
                golemCutscene.phase = 'COLD_SHIVER';
                golemCutscene.timer = 0;
                playSound('coldWind');
                if (cutsceneText) cutsceneText.textContent = 'Бр-р-р... Невероятный холод! Стикмен дрожит от леденящего ветра...';
            }
        } else if (golemCutscene.phase === 'COLD_SHIVER') {
            player.vx = 0;
            player.state = 'COLD_SHIVER';
            player.animTime += 0.25;

            // Breath vapor puffs emitting from mouth
            if (Math.random() < 0.15) {
                golemCutscene.breathPuffs.push({
                    x: player.x + player.facing * 10,
                    y: player.y - 66,
                    vx: player.facing * (1.2 + Math.random() * 1.6),
                    vy: -(0.9 + Math.random() * 1.3),
                    size: 3.5 + Math.random() * 4,
                    alpha: 0.75,
                    life: 1.0
                });
            }

            if (golemCutscene.timer >= 4.2) {
                finishGolemDefeatCutscene();
            }
        }

        // Update breath puffs
        for (let i = golemCutscene.breathPuffs.length - 1; i >= 0; i--) {
            const p = golemCutscene.breathPuffs[i];
            p.x += p.vx;
            p.y += p.vy;
            p.size += 0.18;
            p.alpha -= 0.016;
            if (p.alpha <= 0) golemCutscene.breathPuffs.splice(i, 1);
        }
    }

    function finishGolemDefeatCutscene() {
        if (!golemCutscene.active) return;
        golemCutscene.active = false;
        if (cutsceneOverlay) cutsceneOverlay.classList.add('hidden');

        currentState = STATES.VICTORY;
        player.state = 'VICTORY_IDLE';

        if (victoryTitle) victoryTitle.textContent = 'Уровень 40 пройден! Победа над Големом!';
        if (victorySubtext) victorySubtext.textContent = 'Древний страж повержен! Вы открыли путь в неизведанный Снежный Биом!';

        if (btnNextLevel) btnNextLevel.classList.add('hidden');
        if (btnReplay) btnReplay.innerHTML = '<span class="btn-icon">🔄</span> Пройти снова';
        if (btnToMenu) btnToMenu.innerHTML = '<span class="btn-icon">📋</span> В меню уровней';

        victoryScreen.classList.remove('hidden');
        victoryScreen.classList.add('screen-active');
    }

    // Helper: Draw Pine Tree Model (used when held in hand and when thrown as Thor's hammer)
    function drawPineTreeModel(ctx, scale, isGlowing = false) {
        ctx.save();
        if (isGlowing) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 14 * scale;
        }

        // Tree Trunk (centered at 0, runs from -100 to 40)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-12 * scale, -100 * scale, 24 * scale, 140 * scale);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.5 * scale;
        ctx.strokeRect(-12 * scale, -100 * scale, 24 * scale, 140 * scale);

        // Ancient Runic Bands wrapped around trunk (Thor / Mjolnir energy)
        ctx.fillStyle = isGlowing ? '#4ade80' : '#84cc16';
        ctx.fillRect(-13 * scale, -65 * scale, 26 * scale, 7 * scale);
        ctx.fillRect(-13 * scale, -25 * scale, 26 * scale, 7 * scale);
        ctx.fillRect(-13 * scale, 15 * scale, 26 * scale, 7 * scale);

        // Pine Foliage Tiers (centered at x = 0, runs from -80 to +110)
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(0, 110 * scale);
        ctx.lineTo(55 * scale, 40 * scale);
        ctx.lineTo(25 * scale, 40 * scale);
        ctx.lineTo(65 * scale, -20 * scale);
        ctx.lineTo(20 * scale, -20 * scale);
        ctx.lineTo(55 * scale, -80 * scale);
        ctx.lineTo(-55 * scale, -80 * scale);
        ctx.lineTo(-20 * scale, -20 * scale);
        ctx.lineTo(-65 * scale, -20 * scale);
        ctx.lineTo(-25 * scale, 40 * scale);
        ctx.lineTo(-55 * scale, 40 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2.5 * scale;
        ctx.stroke();

        ctx.restore();
    }

    // ==========================================
    // --- DRAW GOLEM, HAZARDS & SNOW BIOME ---
    // ==========================================
    function drawGolem() {
        if (currentLevelIndex !== 40) return;
        if (!golem.active && !golem.isFallen && !(typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active && golemIntroCutscene.phase !== 'EARTHQUAKE')) return;

        const scale = canvas.height / 675;
        const gX = (golem.x - cameraX) * scale;
        const gY = (golem.y - cameraY) * scale;

        ctx.save();
        ctx.translate(gX, gY);
        ctx.rotate(golem.fallAngle);

        // Clip lower body beneath ground while rising during EMERGE phase
        if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active && golemIntroCutscene.phase === 'EMERGE') {
            const groundLocalY = (currentLevelData.groundY - golem.y + 6) * scale;
            ctx.beginPath();
            ctx.rect(-350 * scale, -500 * scale, 700 * scale, groundLocalY + 500 * scale);
            ctx.clip();
        }

        const isFlashing = golem.hitFlashTimer > 0;

        // 1. Shadow beneath Golem
        if (!golem.isFallen && (!golemIntroCutscene || !golemIntroCutscene.active || golemIntroCutscene.phase === 'ROAR')) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 75 * scale, 75 * scale, 18 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Colossal Stone Legs & Feet
        ctx.fillStyle = isFlashing ? '#ef4444' : '#334155';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5 * scale;

        // Left Leg
        ctx.fillRect(-55 * scale, 15 * scale, 34 * scale, 65 * scale);
        ctx.strokeRect(-55 * scale, 15 * scale, 34 * scale, 65 * scale);

        // Right Leg
        ctx.fillRect(21 * scale, 15 * scale, 34 * scale, 65 * scale);
        ctx.strokeRect(21 * scale, 15 * scale, 34 * scale, 65 * scale);

        // 3. Massive Torso & Chestplate
        const torsoGrad = ctx.createLinearGradient(0, -65 * scale, 0, 25 * scale);
        torsoGrad.addColorStop(0, isFlashing ? '#fca5a5' : '#475569');
        torsoGrad.addColorStop(1, isFlashing ? '#ef4444' : '#1e293b');
        ctx.fillStyle = torsoGrad;
        ctx.fillRect(-65 * scale, -65 * scale, 130 * scale, 85 * scale);
        ctx.strokeRect(-65 * scale, -65 * scale, 130 * scale, 85 * scale);

        // Ancient Carved Glowing Runes on Torso
        if (golem.eyeGlow > 0) {
            ctx.save();
            ctx.strokeStyle = isFlashing ? '#ffffff' : `rgba(74, 222, 128, ${0.45 + 0.45 * golem.eyeGlow * Math.sin(Date.now() * 0.005)})`;
            ctx.lineWidth = 3 * scale;
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 12 * golem.eyeGlow * scale;

            // Runic Diamond glyph
            ctx.beginPath();
            ctx.moveTo(0, -50 * scale);
            ctx.lineTo(24 * scale, -25 * scale);
            ctx.lineTo(0, 0);
            ctx.lineTo(-24 * scale, -25 * scale);
            ctx.closePath();
            ctx.stroke();

            // Inner rune cross
            ctx.beginPath();
            ctx.moveTo(0, -42 * scale);
            ctx.lineTo(0, -8 * scale);
            ctx.moveTo(-16 * scale, -25 * scale);
            ctx.lineTo(16 * scale, -25 * scale);
            ctx.stroke();
            ctx.restore();
        }

        // Mossy Overgrowth Patches
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-50 * scale, -60 * scale, 26 * scale, 8 * scale);
        ctx.fillRect(18 * scale, -45 * scale, 30 * scale, 7 * scale);
        ctx.fillRect(-20 * scale, 12 * scale, 22 * scale, 6 * scale);

        // 4. Giant Spherical Shoulder Joints
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(-72 * scale, -52 * scale, 22 * scale, 0, Math.PI * 2);
        ctx.arc(72 * scale, -52 * scale, 22 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 5. Left Arm & Fist (Rock Bomb / Slam / Shove / Roar)
        ctx.save();
        ctx.translate(-75 * scale, -45 * scale);
        if (golem.shoveTimer > 0) {
            // Thrust stone fist forward in shove punch
            ctx.rotate(Math.PI * 0.42);
        } else if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active && golemIntroCutscene.phase === 'ROAR') {
            ctx.rotate(-Math.PI * 0.72 * golem.roarArms);
        } else if (golem.state === 'SLAM_WINDUP') {
            ctx.rotate(-Math.PI * 0.7);
        } else if (golem.state === 'BOMB_CREATE') {
            ctx.rotate(-Math.PI * 0.25);
        }
        ctx.fillStyle = isFlashing ? '#ef4444' : '#475569';
        ctx.fillRect(-16 * scale, 0, 32 * scale, 60 * scale);
        ctx.strokeRect(-16 * scale, 0, 32 * scale, 60 * scale);

        // Kinetic shockwave ring around shoved fist
        if (golem.shoveTimer > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.9)';
            ctx.lineWidth = 3.5 * scale;
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 14 * scale;
            ctx.beginPath();
            ctx.arc(0, 60 * scale, 34 * scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Boulder in hand during BOMB_CREATE
        if (golem.boulderBomb && !golem.boulderBomb.thrown) {
            const bR = golem.boulderBomb.radius * scale;
            ctx.fillStyle = '#64748b';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3 * scale;
            ctx.beginPath();
            ctx.arc(0, 75 * scale, bR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();

        // 6. Right Arm & Fist (Bamboo swing / Tree Thor Hammer / Roar)
        ctx.save();
        ctx.translate(75 * scale, -45 * scale);
        if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active && golemIntroCutscene.phase === 'ROAR') {
            ctx.rotate(-Math.PI * 0.72 * golem.roarArms);
        } else if (golem.state === 'BAMBOO_TELEGRAPH') {
            ctx.rotate(-Math.PI * 0.65 * golem.armSwingProg);
        } else if (golem.state === 'TREE_TELEGRAPH' || golem.state === 'TREE_THROW' || golem.state === 'TREE_PAUSE') {
            ctx.rotate(golem.treeAngle);
        } else if (golem.state === 'TREE_RETURN' || golem.state === 'TREE_IMPACT') {
            ctx.rotate(-Math.PI * 0.12); // Reaching open palm towards returning tree!
        } else if (golem.state === 'SLAM_WINDUP') {
            ctx.rotate(-Math.PI * 0.7);
        }
        ctx.fillStyle = isFlashing ? '#ef4444' : '#475569';
        ctx.fillRect(-16 * scale, 0, 32 * scale, 60 * scale);
        ctx.strokeRect(-16 * scale, 0, 32 * scale, 60 * scale);

        // Open Palm Rune when summoning Mjolnir-tree back
        if (golem.state === 'TREE_RETURN') {
            ctx.save();
            ctx.fillStyle = '#4ade80';
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 14 * scale;
            ctx.beginPath();
            ctx.arc(0, 60 * scale, 13 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5 * scale;
            ctx.stroke();
            ctx.restore();
        }

        // Giant Tree held in Right Hand (extends down from fist)
        if (golem.treeEquipped) {
            ctx.save();
            ctx.translate(0, 160 * scale);
            drawPineTreeModel(ctx, scale, false);
            ctx.restore();
        }
        ctx.restore();

        // 7. Angular Stone Head & Face
        ctx.save();
        ctx.translate(0, -95 * scale);

        ctx.fillStyle = isFlashing ? '#fca5a5' : '#334155';
        ctx.fillRect(-45 * scale, -38 * scale, 90 * scale, 58 * scale);
        ctx.strokeRect(-45 * scale, -38 * scale, 90 * scale, 58 * scale);

        // Stone Brow Ridge
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-42 * scale, -22 * scale, 84 * scale, 10 * scale);

        // Glowing Emerald Eyes (or Extinguished upon defeat)
        const eyeColor = golem.eyeGlow > 0 ? (isFlashing ? '#ffffff' : '#4ade80') : '#1e293b';
        ctx.fillStyle = eyeColor;
        if (golem.eyeGlow > 0) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 18 * golem.eyeGlow * scale;
        }

        // Left Eye
        ctx.beginPath();
        ctx.arc(-18 * scale, -12 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye
        ctx.beginPath();
        ctx.arc(18 * scale, -12 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Stone Mouth (opens for Rage beam & Roar)
        const mouthH = (8 + golem.mouthOpen * 22) * scale;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22 * scale, 4 * scale, 44 * scale, mouthH);
        ctx.strokeRect(-22 * scale, 4 * scale, 44 * scale, mouthH);

        // Swirling Energy Orb in Mouth during RAGE_CHARGE
        if (golem.state === 'RAGE_CHARGE') {
            const chargeR = (golem.timer / 2.0) * 16 * scale;
            const chargeGrad = ctx.createRadialGradient(0, 4 * scale + mouthH / 2, 2 * scale, 0, 4 * scale + mouthH / 2, chargeR);
            chargeGrad.addColorStop(0, '#ffffff');
            chargeGrad.addColorStop(0.4, '#4ade80');
            chargeGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
            ctx.fillStyle = chargeGrad;
            ctx.beginPath();
            ctx.arc(0, 4 * scale + mouthH / 2, chargeR, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sonic Emerald Roar Flare in mouth during ROAR phase
        if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active && golemIntroCutscene.phase === 'ROAR') {
            const roarGrad = ctx.createRadialGradient(0, 4 * scale + mouthH / 2, 2 * scale, 0, 4 * scale + mouthH / 2, 26 * scale);
            roarGrad.addColorStop(0, '#ffffff');
            roarGrad.addColorStop(0.5, '#4ade80');
            roarGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
            ctx.fillStyle = roarGrad;
            ctx.beginPath();
            ctx.arc(0, 4 * scale + mouthH / 2, 26 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // 8. Colossal Green Rage Beam (sweeps above crouched player)
        if (golem.rageBeamActive) {
            ctx.save();
            const beamLength = 2600 * scale;
            const beamBottomY = 68 * scale; // World: groundY - 42 (leaves 42px clearance for crouch/slide)
            const beamThickness = 125 * scale; // Colossal 125px thickness (from groundY - 42 to groundY - 167)
            const beamCenterY = beamBottomY - beamThickness / 2; // 5.5 * scale

            // A. Outer Radiant Emerald Aura
            ctx.fillStyle = 'rgba(34, 197, 94, 0.32)';
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 40 * scale;
            ctx.fillRect(-beamLength, beamCenterY - beamThickness * 0.62, beamLength, beamThickness * 1.24);

            // B. Massive Plasma Stream
            const plasmaGrad = ctx.createLinearGradient(0, beamCenterY - beamThickness * 0.45, 0, beamCenterY + beamThickness * 0.45);
            plasmaGrad.addColorStop(0, '#15803d');
            plasmaGrad.addColorStop(0.2, '#22c55e');
            plasmaGrad.addColorStop(0.5, '#4ade80');
            plasmaGrad.addColorStop(0.8, '#22c55e');
            plasmaGrad.addColorStop(1, '#15803d');
            ctx.fillStyle = plasmaGrad;
            ctx.fillRect(-beamLength, beamCenterY - beamThickness * 0.45, beamLength, beamThickness * 0.9);

            // C. High-Intensity Compressed Core
            const coreGrad = ctx.createLinearGradient(0, beamCenterY - beamThickness * 0.22, 0, beamCenterY + beamThickness * 0.22);
            coreGrad.addColorStop(0, '#4ade80');
            coreGrad.addColorStop(0.5, '#bbf7d0');
            coreGrad.addColorStop(1, '#4ade80');
            ctx.fillStyle = coreGrad;
            ctx.shadowColor = '#86efac';
            ctx.shadowBlur = 26 * scale;
            ctx.fillRect(-beamLength, beamCenterY - beamThickness * 0.22, beamLength, beamThickness * 0.44);

            // D. Blinding White-Hot Scorching Laser Core
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 18 * scale;
            ctx.fillRect(-beamLength, beamCenterY - beamThickness * 0.08, beamLength, beamThickness * 0.16);

            // E. Radiating Emitter Funnel from Mouth (-85) & Chest Core (-30) to Main Beam
            ctx.fillStyle = 'rgba(74, 222, 128, 0.85)';
            ctx.beginPath();
            ctx.moveTo(0, -95 * scale);
            ctx.lineTo(-65 * scale, beamCenterY - beamThickness * 0.45);
            ctx.lineTo(-65 * scale, beamCenterY + beamThickness * 0.45);
            ctx.lineTo(0, 15 * scale);
            ctx.closePath();
            ctx.fill();

            // F. Pulsating Sine-Wave Lightning Bolts coursing through the Beam
            ctx.save();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3 * scale;
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 12 * scale;
            for (let bolt = 0; bolt < 2; bolt++) {
                const boltOffset = bolt * Math.PI;
                ctx.beginPath();
                for (let bx = 0; bx <= beamLength; bx += 30 * scale) {
                    const waveY = beamCenterY + Math.sin(bx * 0.02 + Date.now() * 0.02 + boltOffset) * 24 * scale;
                    if (bx === 0) ctx.moveTo(-bx, waveY);
                    else ctx.lineTo(-bx, waveY);
                }
                ctx.stroke();
            }
            ctx.restore();

            // G. Traveling High-Energy Resonance Rings along the Beam
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2.5 * scale;
            for (let arc = 0; arc < 9; arc++) {
                const arcX = -((arc * 280 + (Date.now() * 1.5) % 280) * scale);
                if (arcX <= 0 && arcX >= -beamLength) {
                    ctx.beginPath();
                    ctx.ellipse(arcX, beamCenterY, 14 * scale, beamThickness * 0.42, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // H. Energy sparks rushing along the bottom clearance edge
            ctx.fillStyle = '#bbf7d0';
            for (let sp = 0; sp < 8; sp++) {
                const spX = -(((sp * 320 + Date.now() * 2.2) % beamLength));
                const spY = beamBottomY + (Math.sin(sp * 13 + Date.now() * 0.01) * 3) * scale;
                ctx.beginPath();
                ctx.arc(spX, spY, 2.5 * scale, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        ctx.restore();
    }

    function drawGolemHazards() {
        if (currentLevelIndex !== 40) return;
        const scale = canvas.height / 675;

        // --- BATTLEFIELD ARENA ENVIRONMENT (ПОЛЕ БОЯ) ---
        // 1. Entrance Boundary Monolith Pillar (x = 6360)
        const enterPillarX = (6360 - cameraX) * scale;
        const enterPillarY = (currentLevelData.groundY - 340 - cameraY) * scale;
        const pW = 68 * scale;
        const pH = 340 * scale;

        const pGrad = ctx.createLinearGradient(enterPillarX, enterPillarY, enterPillarX + pW, enterPillarY);
        pGrad.addColorStop(0, '#1e293b');
        pGrad.addColorStop(0.5, '#334155');
        pGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = pGrad;
        ctx.fillRect(enterPillarX, enterPillarY, pW, pH);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(enterPillarX, enterPillarY, pW, pH);

        // Moss overgrown patches
        ctx.fillStyle = '#15803d';
        ctx.fillRect(enterPillarX + 6 * scale, enterPillarY + 30 * scale, 24 * scale, 8 * scale);
        ctx.fillRect(enterPillarX + 30 * scale, enterPillarY + 110 * scale, 28 * scale, 7 * scale);
        ctx.fillRect(enterPillarX + 12 * scale, enterPillarY + 220 * scale, 22 * scale, 9 * scale);

        // Glowing Emerald Runes carved along pillar
        const runePulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
        ctx.save();
        ctx.strokeStyle = `rgba(74, 222, 128, ${runePulse})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10 * runePulse * scale;
        [60, 130, 200, 270].forEach(rY => {
            ctx.beginPath();
            ctx.moveTo(enterPillarX + 34 * scale, enterPillarY + (rY - 14) * scale);
            ctx.lineTo(enterPillarX + 48 * scale, enterPillarY + rY * scale);
            ctx.lineTo(enterPillarX + 34 * scale, enterPillarY + (rY + 14) * scale);
            ctx.lineTo(enterPillarX + 20 * scale, enterPillarY + rY * scale);
            ctx.closePath();
            ctx.stroke();
        });
        ctx.restore();

        // 2. Right Boundary Monolith Pillar (x = 8400, inside Snowy Biome)
        const exitPillarX = (8400 - cameraX) * scale;
        const exitPillarY = (currentLevelData.groundY - 340 - cameraY) * scale;
        ctx.fillStyle = pGrad;
        ctx.fillRect(exitPillarX, exitPillarY, pW, pH);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(exitPillarX, exitPillarY, pW, pH);

        ctx.save();
        ctx.strokeStyle = `rgba(74, 222, 128, ${runePulse})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10 * runePulse * scale;
        [60, 130, 200, 270].forEach(rY => {
            ctx.beginPath();
            ctx.moveTo(exitPillarX + 34 * scale, exitPillarY + (rY - 14) * scale);
            ctx.lineTo(exitPillarX + 48 * scale, exitPillarY + rY * scale);
            ctx.lineTo(exitPillarX + 34 * scale, exitPillarY + (rY + 14) * scale);
            ctx.lineTo(exitPillarX + 20 * scale, exitPillarY + rY * scale);
            ctx.closePath();
            ctx.stroke();
        });
        ctx.restore();

        // 3. Ancient Arena Floor Runes along the battlefield ground
        const floorRunes = [6720, 7060, 7380, 7840, 8140, 8420];
        floorRunes.forEach(frX => {
            const scrX = (frX - cameraX) * scale;
            const scrY = (currentLevelData.groundY - cameraY) * scale;
            ctx.save();
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(scrX - 18 * scale, scrY + 2 * scale);
            ctx.lineTo(scrX, scrY - 6 * scale);
            ctx.lineTo(scrX + 18 * scale, scrY + 2 * scale);
            ctx.stroke();
            ctx.restore();
        });

        // 4. Ground Emergence Crater & Fissures at x = 7600
        if (golem.groundCrackWidth > 0) {
            const crX = (7600 - cameraX) * scale;
            const crY = (currentLevelData.groundY - cameraY) * scale;
            const crHalfW = (golem.groundCrackWidth / 2) * scale;

            ctx.save();
            // Deep subterranean chasm interior
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.moveTo(crX - crHalfW, crY);
            ctx.lineTo(crX - crHalfW * 0.4, crY + 45 * scale);
            ctx.lineTo(crX + crHalfW * 0.3, crY + 52 * scale);
            ctx.lineTo(crX + crHalfW, crY);
            ctx.closePath();
            ctx.fill();

            // Glowing subterranean emerald energy inside fissure
            const crackGrad = ctx.createLinearGradient(crX, crY, crX, crY + 40 * scale);
            crackGrad.addColorStop(0, 'rgba(34, 197, 94, 0.7)');
            crackGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
            crackGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
            ctx.fillStyle = crackGrad;
            ctx.beginPath();
            ctx.moveTo(crX - crHalfW * 0.8, crY);
            ctx.lineTo(crX, crY + 38 * scale);
            ctx.lineTo(crX + crHalfW * 0.8, crY);
            ctx.closePath();
            ctx.fill();

            // Fractured stone slabs tilted on crater edges
            ctx.fillStyle = '#475569';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2 * scale;
            // Left slab
            ctx.beginPath();
            ctx.moveTo(crX - crHalfW - 14 * scale, crY);
            ctx.lineTo(crX - crHalfW + 10 * scale, crY - 14 * scale);
            ctx.lineTo(crX - crHalfW + 20 * scale, crY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Right slab
            ctx.beginPath();
            ctx.moveTo(crX + crHalfW - 18 * scale, crY);
            ctx.lineTo(crX + crHalfW - 8 * scale, crY - 16 * scale);
            ctx.lineTo(crX + crHalfW + 16 * scale, crY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // 5. Roar Expanding Emerald Sonic Shockwaves
        if (golem.roarShockwaves && golem.roarShockwaves.length > 0) {
            golem.roarShockwaves.forEach(sw => {
                const swX = (sw.x - cameraX) * scale;
                const swY = (sw.y - cameraY) * scale;
                const r = sw.radius * scale;
                ctx.save();
                ctx.strokeStyle = `rgba(74, 222, 128, ${Math.max(0, sw.alpha)})`;
                ctx.lineWidth = 4 * scale;
                ctx.shadowColor = '#22c55e';
                ctx.shadowBlur = 18 * scale;
                ctx.beginPath();
                ctx.arc(swX, swY, r, 0, Math.PI * 2);
                ctx.stroke();

                if (r > 32 * scale) {
                    ctx.strokeStyle = `rgba(240, 253, 244, ${Math.max(0, sw.alpha * 0.55)})`;
                    ctx.lineWidth = 2 * scale;
                    ctx.beginPath();
                    ctx.arc(swX, swY, r - 16 * scale, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            });
        }

        // 6. Draw Fragile / Cracked Ground & Chasms (with 10-second healing visual)
        golem.fragileGrounds.forEach(fg => {
            const fX = (fg.startX - cameraX) * scale;
            const fW = (fg.endX - fg.startX) * scale;
            const fY = (currentLevelData.groundY - cameraY) * scale;
            const fH = 140 * scale;

            if (fg.broken) {
                // Real abyss pit hole
                ctx.fillStyle = '#030712';
                ctx.fillRect(fX, fY, fW, fH);

                const chasmLeft = Math.max(0, 10.0 - (fg.chasmTimer || 0));
                const isHealing = chasmLeft <= 2.5;

                if (isHealing) {
                    // Rising earth slab animation as chasm seals
                    const healProgress = 1 - (chasmLeft / 2.5);
                    const risingH = fH * healProgress;
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(fX, fY + fH - risingH, fW, risingH);
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 2.5 * scale;
                    ctx.strokeRect(fX, fY + fH - risingH, fW, risingH);

                    // Green healing runes & timer
                    ctx.fillStyle = '#22c55e';
                    ctx.font = `bold ${10 * scale}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(`✨ ЗАДЕЛЫВАЕТСЯ (${Math.ceil(chasmLeft)}с)`, fX + fW / 2, fY - 8 * scale);
                    ctx.textAlign = 'start';
                } else {
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2.5 * scale;
                    ctx.strokeRect(fX, fY, fW, fH);

                    ctx.fillStyle = '#f87171';
                    ctx.font = `bold ${10 * scale}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(`🕳️ ПРОПАСТЬ (${Math.ceil(chasmLeft)}с)`, fX + fW / 2, fY - 8 * scale);
                    ctx.textAlign = 'start';
                }
            } else {
                // Cracked stone slab with glowing fissures
                const crackLeft = Math.max(0, 10.0 - (fg.timer || 0));
                const isHealing = crackLeft <= 2.5;

                ctx.fillStyle = isHealing ? '#1e293b' : '#334155';
                ctx.fillRect(fX, fY, fW, 20 * scale);

                ctx.strokeStyle = isHealing ? '#22c55e' : (fg.stepped ? '#ef4444' : '#e2e8f0');
                ctx.lineWidth = 2.5 * scale;
                ctx.beginPath();
                ctx.moveTo(fX + 10 * scale, fY);
                ctx.lineTo(fX + 35 * scale, fY + 14 * scale);
                ctx.lineTo(fX + 70 * scale, fY + 4 * scale);
                ctx.lineTo(fX + fW - 10 * scale, fY + 18 * scale);
                ctx.stroke();

                // Warning / Healing indicator above cracked tile
                ctx.fillStyle = isHealing ? '#22c55e' : (fg.stepped ? '#ef4444' : '#f59e0b');
                ctx.font = `bold ${10 * scale}px sans-serif`;
                ctx.textAlign = 'center';
                if (isHealing) {
                    ctx.fillText(`✨ ЗАДЕЛЫВАЕТСЯ (${Math.ceil(crackLeft)}с)`, fX + fW / 2, fY - 8 * scale);
                } else {
                    ctx.fillText(`⚠️ ТРЕЩИНА (${Math.ceil(crackLeft)}с)`, fX + fW / 2, fY - 8 * scale);
                }
                ctx.textAlign = 'start';
            }
        });

        // 2. Bamboo Spikes Warning (Telegraph)
        if (golem.bambooWarning) {
            const bw = golem.bambooWarning;
            const bwX = (bw.startX - cameraX) * scale;
            const bwW = (bw.endX - bw.startX) * scale;
            const bwY = (currentLevelData.groundY - cameraY) * scale;

            const pulse = 0.45 + 0.35 * Math.sin(Date.now() * 0.02);
            ctx.save();
            ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5 * scale;

            // Semi-transparent red spike outlines rising from the ground
            const spikeCount = 6;
            const sWidth = bwW / spikeCount;
            for (let s = 0; s < spikeCount; s++) {
                const sx = bwX + s * sWidth;
                ctx.beginPath();
                ctx.moveTo(sx, bwY);
                ctx.lineTo(sx + sWidth / 2, bwY - 28 * scale);
                ctx.lineTo(sx + sWidth, bwY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = '#ef4444';
            ctx.font = `bold ${12 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ ОПАСНОСТЬ: ШИПЫ ИЗ БАМБУКА!', bwX + bwW / 2, bwY - 36 * scale);
            ctx.textAlign = 'start';
            ctx.restore();
        }

        // 3. Bamboo Spikes Active Eruption
        if (golem.bambooSpikes) {
            const bs = golem.bambooSpikes;
            const bsX = (bs.startX - cameraX) * scale;
            const bsW = (bs.endX - bs.startX) * scale;
            const bsY = (currentLevelData.groundY - cameraY) * scale;

            const spikeCount = 7;
            const sWidth = bsW / spikeCount;
            const maxH = 105 * scale;

            for (let s = 0; s < spikeCount; s++) {
                const sx = bsX + s * sWidth;
                const grad = ctx.createLinearGradient(sx, bsY, sx + sWidth, bsY - maxH);
                grad.addColorStop(0, '#14532d');
                grad.addColorStop(0.5, '#22c55e');
                grad.addColorStop(1, '#86efac');
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(sx + 3 * scale, bsY);
                ctx.lineTo(sx + sWidth / 2, bsY - maxH);
                ctx.lineTo(sx + sWidth - 3 * scale, bsY);
                ctx.closePath();
                ctx.fill();

                // Bamboo segments rings
                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 2.5 * scale;
                ctx.beginPath();
                ctx.moveTo(sx + 6 * scale, bsY - maxH * 0.4);
                ctx.lineTo(sx + sWidth - 6 * scale, bsY - maxH * 0.4);
                ctx.moveTo(sx + 9 * scale, bsY - maxH * 0.7);
                ctx.lineTo(sx + sWidth - 9 * scale, bsY - maxH * 0.7);
                ctx.stroke();
            }
        }

        // 4. Boulder Target Telegraph
        if (golem.boulderTarget) {
            const tgX = (golem.boulderTarget.x - cameraX) * scale;
            const tgY = (golem.boulderTarget.y - cameraY) * scale;
            const pulse = 0.5 + 0.4 * Math.sin(Date.now() * 0.02);

            ctx.save();
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
            ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.3})`;
            ctx.lineWidth = 3 * scale;

            ctx.beginPath();
            ctx.ellipse(tgX, tgY, 50 * scale, 14 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Crosshair
            ctx.beginPath();
            ctx.moveTo(tgX - 25 * scale, tgY);
            ctx.lineTo(tgX + 25 * scale, tgY);
            ctx.moveTo(tgX, tgY - 14 * scale);
            ctx.lineTo(tgX, tgY + 14 * scale);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = `bold ${12 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('💣 МЕСТО ПАДЕНИЯ ВАЛУНА', tgX, tgY - 24 * scale);
            ctx.textAlign = 'start';
            ctx.restore();
        }

        // 5. Flying Rock Bomb
        if (golem.boulderBomb && golem.boulderBomb.thrown) {
            const bX = (golem.boulderBomb.x - cameraX) * scale;
            const bY = (golem.boulderBomb.y - cameraY) * scale;
            const bR = 26 * scale;

            ctx.save();
            ctx.translate(bX, bY);
            ctx.rotate(Date.now() * 0.01);
            const bGrad = ctx.createRadialGradient(-bR * 0.3, -bR * 0.3, 2 * scale, 0, 0, bR);
            bGrad.addColorStop(0, '#94a3b8');
            bGrad.addColorStop(0.7, '#475569');
            bGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.arc(0, 0, bR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();
            ctx.restore();
        }

        // 6. Harmless Boulder Debris
        golem.boulderDebris.forEach(deb => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, deb.life);
            const dX = (deb.x - cameraX) * scale;
            const dY = (deb.y - cameraY) * scale;
            ctx.translate(dX, dY);
            ctx.rotate(deb.rot);
            ctx.fillStyle = deb.color;
            ctx.fillRect(-deb.size * scale / 2, -deb.size * scale / 2, deb.size * scale, deb.size * scale);
            ctx.restore();
        });

        // 7. Thor's Tree Hammer: Warning Telegraph, Flying/Returning Tree & Recall Tether
        if (golem.treeWarning) {
            const twX = (golem.treeWarning.startX - cameraX) * scale;
            const twW = (golem.treeWarning.endX - golem.treeWarning.startX) * scale;
            const twY = (currentLevelData.groundY - cameraY) * scale;
            const centerTwX = ((golem.treeWarning.targetX || (golem.treeWarning.startX + golem.treeWarning.endX) / 2) - cameraX) * scale;

            const pulse = 0.45 + 0.35 * Math.sin(Date.now() * 0.02);
            ctx.save();
            ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.35})`;
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3 * scale;

            ctx.fillRect(twX, twY - 70 * scale, twW, 70 * scale);
            ctx.strokeRect(twX, twY - 70 * scale, twW, 70 * scale);

            // Vertical targeting beacon beam
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse * 0.7})`;
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(centerTwX, twY - 240 * scale);
            ctx.lineTo(centerTwX, twY);
            ctx.stroke();

            // Ground impact reticle
            ctx.beginPath();
            ctx.arc(centerTwX, twY, 18 * scale, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = `bold ${12 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`⚡ МОЛОТ ТОРА: БРОСОК ДРЕВА [${golem.treeThrowCount + 1}/2]! ⚡`, centerTwX, twY - 80 * scale);
            ctx.font = `italic ${10 * scale}px sans-serif`;
            ctx.fillStyle = '#fca5a5';
            ctx.fillText(`(Уклоняйтесь при броске и возврате!)`, centerTwX, twY - 65 * scale);
            ctx.textAlign = 'start';
            ctx.restore();
        }

        // Magnetic Recall Lightning Tether (Thor Mjolnir Call)
        if (golem.state === 'TREE_RETURN' && golem.thrownTree) {
            const handX = (golem.x - 40 - cameraX) * scale;
            const handY = (golem.y - 30 - cameraY) * scale;
            const trX = (golem.thrownTree.x - cameraX) * scale;
            const trY = (golem.thrownTree.y - cameraY) * scale;

            ctx.save();
            ctx.strokeStyle = '#4ade80';
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 15 * scale;
            ctx.lineWidth = 3 * scale;

            // Jagged magnetic lightning arc from hand to returning tree
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            const segments = 6;
            for (let s = 1; s < segments; s++) {
                const frac = s / segments;
                const midX = handX + (trX - handX) * frac;
                const midY = handY + (trY - handY) * frac + (Math.random() - 0.5) * 22 * scale;
                ctx.lineTo(midX, midY);
            }
            ctx.lineTo(trX, trY);
            ctx.stroke();

            // Inner bright white-green core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();
            ctx.restore();
        }

        // Thrown / Embedded / Returning Tree
        if (golem.thrownTree) {
            const trX = (golem.thrownTree.x - cameraX) * scale;
            const trY = (golem.thrownTree.y - cameraY) * scale;

            // Impact ground crack fissures when embedded in earth
            if (golem.thrownTree.state === 'IMPACT') {
                const grY = (currentLevelData.groundY - cameraY) * scale;
                ctx.save();
                ctx.strokeStyle = '#22c55e';
                ctx.shadowColor = '#4ade80';
                ctx.shadowBlur = 12 * scale;
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.moveTo(trX - 35 * scale, grY);
                ctx.lineTo(trX - 10 * scale, grY + 5 * scale);
                ctx.lineTo(trX, grY);
                ctx.lineTo(trX + 15 * scale, grY + 6 * scale);
                ctx.lineTo(trX + 40 * scale, grY);
                ctx.stroke();
                ctx.restore();
            }

            // Motion blur trail streak during flight
            if (golem.thrownTree.state === 'FLYING_OUT' || golem.thrownTree.state === 'RETURNING') {
                ctx.save();
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
                ctx.lineWidth = 14 * scale;
                ctx.lineCap = 'round';
                const streakDir = golem.thrownTree.state === 'FLYING_OUT' ? 32 * scale : -32 * scale;
                ctx.beginPath();
                ctx.moveTo(trX + streakDir, trY);
                ctx.lineTo(trX, trY);
                ctx.stroke();
                ctx.restore();
            }

            // Draw spinning / embedded pine tree model
            ctx.save();
            ctx.translate(trX, trY);
            ctx.rotate(golem.thrownTree.rot);
            drawPineTreeModel(ctx, scale, true);
            ctx.restore();
        }

        // 8. Rage Beam Warning Corridor (2 Seconds)
        if (golem.state === 'RAGE_CHARGE') {
            const beamBottomY = (currentLevelData.groundY - 42 - cameraY) * scale;
            const corridorH = 125 * scale;
            const beamCorridorY = beamBottomY - corridorH;
            const pulse = 0.4 + 0.35 * Math.sin(Date.now() * 0.02);

            ctx.save();
            // Warning corridor filling the beam area
            const warnGrad = ctx.createLinearGradient(0, beamCorridorY, 0, beamBottomY);
            warnGrad.addColorStop(0, `rgba(34, 197, 94, ${pulse * 0.25})`);
            warnGrad.addColorStop(0.5, `rgba(239, 68, 68, ${pulse * 0.35})`);
            warnGrad.addColorStop(1, `rgba(34, 197, 94, ${pulse * 0.25})`);
            ctx.fillStyle = warnGrad;
            ctx.fillRect(0, beamCorridorY, canvas.width, corridorH);

            // Hazard boundary lines (top and bottom of beam)
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse * 1.1})`;
            ctx.lineWidth = 2.5 * scale;
            ctx.beginPath();
            ctx.moveTo(0, beamCorridorY);
            ctx.lineTo(canvas.width, beamCorridorY);
            ctx.moveTo(0, beamBottomY);
            ctx.lineTo(canvas.width, beamBottomY);
            ctx.stroke();

            // Diagonal hazard stripes in beam zone
            ctx.strokeStyle = `rgba(239, 68, 68, ${pulse * 0.22})`;
            ctx.lineWidth = 3 * scale;
            const stripeSpacing = 45 * scale;
            const startX = -(cameraX * scale) % stripeSpacing;
            for (let sx = startX; sx < canvas.width; sx += stripeSpacing) {
                ctx.beginPath();
                ctx.moveTo(sx, beamBottomY);
                ctx.lineTo(sx + 25 * scale, beamCorridorY);
                ctx.stroke();
            }

            // Warning Text in corridor
            ctx.fillStyle = '#ef4444';
            ctx.font = `bold ${16 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = '#b91c1c';
            ctx.shadowBlur = 10 * scale;
            ctx.fillText(`⚡ ПРИГНИТЕСЬ! [CTRL / C / ПОДКАТ] ⚡ (ЗАРЯД: ${Math.max(0, 2.0 - golem.timer).toFixed(1)}с)`, canvas.width / 2, beamCorridorY + corridorH / 2);

            // Safe clearance indicator along the ground
            const groundScreenY = (currentLevelData.groundY - cameraY) * scale;
            ctx.fillStyle = '#4ade80';
            ctx.font = `bold ${12 * scale}px sans-serif`;
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 8 * scale;
            ctx.fillText('⬇️ ПРИСЕДАЙТЕ ЗДЕСЬ ДЛЯ СПАСЕНИЯ [НИЖЕ ЛУЧА] ⬇️', canvas.width / 2, groundScreenY - 12 * scale);
            ctx.restore();
        }

        // 9. Collectable Arena Stones (Win Condition)
        golem.arenaStones.forEach(st => {
            const sX = (st.x - cameraX) * scale;
            const sY = (st.y - cameraY - 12 + Math.sin(st.bobTimer) * 4) * scale;
            const sR = 14 * scale;

            ctx.save();
            // Glowing magical aura around stone
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 14 * scale;

            const grad = ctx.createRadialGradient(sX, sY, 2 * scale, sX, sY, sR);
            grad.addColorStop(0, '#f0fdf4');
            grad.addColorStop(0.4, '#4ade80');
            grad.addColorStop(1, '#0f766e');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.arc(sX, sY, sR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Sparkle marker
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${11 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('💎 БРОСОК!', sX, sY - 18 * scale);
            ctx.textAlign = 'start';
            ctx.restore();
        });

        // 10. Thrown Stone Projectiles
        golem.thrownStones.forEach(p => {
            const pX = (p.x - cameraX) * scale;
            const pY = (p.y - cameraY) * scale;
            const pR = 11 * scale;

            ctx.save();
            ctx.translate(pX, pY);
            ctx.rotate(p.rot);
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 16 * scale;

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, pR, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            ctx.restore();
        });
    }

    // ==========================================
    // --- DRAW SNOWY BIOME (CUTSCENE & ZONE) ---
    // ==========================================
    function drawSnowyBiome(scale) {
        if (currentLevelIndex !== 40) return;
        if (!scale) scale = canvas.height / 675;

        const snowStartX = 7850; // Snowy biome begins right behind the Golem (x = 7600)
        const screenSnowStart = (snowStartX - cameraX) * scale;

        // If player or camera is nearing snow biome or during cutscene
        if (screenSnowStart < canvas.width || (typeof golemCutscene !== 'undefined' && (golemCutscene.phase === 'WALK_TO_SNOW' || golemCutscene.phase === 'COLD_SHIVER'))) {
            const snowW = Math.max(0, canvas.width - Math.max(0, screenSnowStart));

            // Snowy ground cap (white snowy surface)
            ctx.save();
            const gY = (currentLevelData.groundY - cameraY) * scale;
            const snowGrad = ctx.createLinearGradient(0, gY, 0, gY + 45 * scale);
            snowGrad.addColorStop(0, '#ffffff');
            snowGrad.addColorStop(0.5, '#e0f2fe');
            snowGrad.addColorStop(1, '#94a3b8');

            const startX = Math.max(0, screenSnowStart);
            ctx.fillStyle = snowGrad;
            ctx.fillRect(startX, gY - 4 * scale, snowW, 36 * scale);

            // Frosted Snow Drifts
            ctx.fillStyle = '#ffffff';
            for (let bx = startX; bx < canvas.width; bx += 65 * scale) {
                ctx.beginPath();
                ctx.arc(bx + 32 * scale, gY - 4 * scale, 30 * scale, Math.PI, 0);
                ctx.fill();
            }

            // Frost crystal patch at border transition (7800 to 7850)
            const borderX = (7800 - cameraX) * scale;
            if (borderX < canvas.width && borderX + 60 * scale > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.beginPath();
                ctx.ellipse(borderX + 25 * scale, gY - 2 * scale, 30 * scale, 8 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // Falling Snowflakes
            ctx.save();
            golemCutscene.snowParticles.forEach(snow => {
                snow.x += snow.vx;
                snow.y += snow.vy;
                if (snow.y > canvas.height) snow.y = -10;
                if (snow.x < 0) snow.x = canvas.width;

                ctx.fillStyle = `rgba(255, 255, 255, ${snow.alpha})`;
                ctx.beginPath();
                ctx.arc(snow.x, snow.y, snow.size * scale, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            // Breath vapor puffs
            golemCutscene.breathPuffs.forEach(puff => {
                const pX = (puff.x - cameraX) * scale;
                const pY = (puff.y - cameraY) * scale;
                ctx.save();
                ctx.fillStyle = `rgba(241, 245, 249, ${puff.alpha})`;
                ctx.beginPath();
                ctx.arc(pX, pY, puff.size * scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
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
        if (victorySubtext) victorySubtext.textContent = "Вы вырвались из здания! Нажмите 'На 2 страницу', чтобы выйти на природу!";

        if (btnNextLevel) {
            btnNextLevel.classList.remove('hidden');
            btnNextLevel.innerHTML = '<span class="btn-icon">🌿</span> На 2 страницу (Природа)';
        }
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

    // --- LEVEL 21 INTRO CUTSCENE SYSTEM ---
    const cutsceneIntro21 = {
        active: false,
        phase: 'WALK_OUT', // 'WALK_OUT' -> 'DISCOVER_EARTH' -> 'LOOK_AROUND'
        timer: 0
    };

    function startLevel21IntroCutscene() {
        currentState = STATES.CUTSCENE;
        cutsceneIntro21.active = true;
        cutsceneIntro21.phase = 'WALK_OUT';
        cutsceneIntro21.timer = 0;

        if (hudOverlay) hudOverlay.classList.add('hidden');
        if (cutsceneOverlay) cutsceneOverlay.classList.remove('hidden');

        player.x = 140;
        player.y = currentLevelData.groundY;
        player.vx = 2.0;
        player.vy = 0;
        player.facing = 1;
        player.grounded = true;
        player.state = 'WALK';
        player.isBossMode = false;
        player.isCrouching = false;
        player.height = 76;

        cameraX = 0;
        cameraY = 0;

        playSound('doorOpen');
        if (cutsceneChapter) cutsceneChapter.textContent = '🌲 СТРАНИЦА 2: ДИКАЯ ПРИРОДА';
        if (cutsceneText) cutsceneText.textContent = 'Стикмен выходит из темного здания наружу...';
    }

    function updateCutsceneIntro21() {
        cutsceneIntro21.timer += 0.016;

        if (cutsceneIntro21.phase === 'WALK_OUT') {
            player.animTime += 0.14;
            player.x += player.vx;
            player.facing = 1;
            player.state = 'WALK';

            if (player.x > 210) {
                // Crossing the threshold onto the green grass!
                if (Math.random() < 0.3) {
                    particles.push({
                        x: player.x,
                        y: player.y,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: -Math.random() * 2,
                        size: 3 + Math.random() * 3,
                        color: Math.random() < 0.5 ? '#16a34a' : '#22c55e',
                        life: 0.6,
                        decay: 0.03
                    });
                }
            }

            if (player.x >= 290) {
                player.x = 290;
                player.vx = 0;
                player.state = 'EXAMINE_EARTH';
                cutsceneIntro21.phase = 'DISCOVER_EARTH';
                cutsceneIntro21.timer = 0;
                playSound('birdChirp');

                if (cutsceneText) cutsceneText.textContent = 'Наконец-то... Настоящая земля, свежая трава и свобода!';
            }
        } else if (cutsceneIntro21.phase === 'DISCOVER_EARTH') {
            player.state = 'EXAMINE_EARTH';
            player.vx = 0;

            if (cutsceneIntro21.timer > 1.2 && cutsceneIntro21.timer < 1.35) {
                playSound('rustle');
            }

            if (cutsceneIntro21.timer >= 3.0) {
                player.state = 'IDLE';
                cutsceneIntro21.phase = 'LOOK_AROUND';
                cutsceneIntro21.timer = 0;
                playSound('birdChirp');

                if (cutsceneText) cutsceneText.textContent = 'Впереди неизведанная природа и 21 препятствие. Вперёд!';
            }
        } else if (cutsceneIntro21.phase === 'LOOK_AROUND') {
            player.state = 'IDLE';
            player.facing = 1;
            cameraX += (120 - cameraX) * 0.04;

            if (cutsceneIntro21.timer >= 2.6) {
                finishLevel21IntroCutscene();
            }
        }
    }

    function finishLevel21IntroCutscene() {
        if (!cutsceneIntro21.active) return;
        cutsceneIntro21.active = false;

        if (cutsceneOverlay) cutsceneOverlay.classList.add('hidden');
        if (hudOverlay) hudOverlay.classList.remove('hidden');

        player.state = 'IDLE';
        player.x = 320;
        player.y = currentLevelData.groundY;
        player.vx = 0;
        player.vy = 0;
        player.facing = 1;
        player.grounded = true;
        cameraX = 0;
        cameraY = 0;

        currentState = STATES.PLAYING;
        playSound('natureStart');
    }

    if (btnSkipCutscene) {
        btnSkipCutscene.addEventListener('click', () => {
            if (cutsceneIntro21 && cutsceneIntro21.active) {
                finishLevel21IntroCutscene();
            } else if (typeof golemCutscene !== 'undefined' && golemCutscene && golemCutscene.active) {
                finishGolemDefeatCutscene();
            } else if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active) {
                finishGolemIntroCutscene();
            }
        });
    }

    // --- AMBIENT NATURE PARTICLES (LEAVES) ---
    const ambientLeaves = [];
    for (let i = 0; i < 28; i++) {
        ambientLeaves.push({
            x: Math.random() * 2600,
            y: Math.random() * 600,
            vx: 0.9 + Math.random() * 1.2,
            vy: 0.4 + Math.random() * 0.6,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: 0.02 + Math.random() * 0.03,
            size: 5 + Math.random() * 5,
            color: Math.random() < 0.6 ? '#22c55e' : (Math.random() < 0.5 ? '#16a34a' : '#eab308')
        });
    }

    function updateAmbientLeaves() {
        ambientLeaves.forEach(leaf => {
            leaf.x += leaf.vx;
            leaf.y += leaf.vy + Math.sin(Date.now() * 0.003 + leaf.x * 0.01) * 0.3;
            leaf.rot += leaf.rotSpeed;
            if (leaf.x > cameraX + 1300) {
                leaf.x = cameraX - 100;
                leaf.y = Math.random() * 500;
            }
            if (leaf.y > 550) {
                leaf.y = -20;
                leaf.x = cameraX + Math.random() * 1200;
            }
        });
    }

    function drawAmbientLeaves(scale) {
        ambientLeaves.forEach(leaf => {
            const lx = (leaf.x - cameraX) * scale;
            const ly = (leaf.y - cameraY) * scale;
            if (lx < -50 || lx > canvas.width + 50) return;

            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(leaf.rot);
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, leaf.size * scale, (leaf.size * 0.45) * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // --- NATURE THEME DRAWING HELPERS ---
    function drawNatureChasms(scale) {
        if (!currentLevelData || !currentLevelData.chasms || currentLevelData.chasms.length === 0) return;
        const groundDrawY = (currentLevelData.groundY - cameraY) * scale;
        const chasmH = (canvas.height - groundDrawY) + 60 * scale;

        currentLevelData.chasms.forEach(c => {
            const startDrawX = (c.startX - cameraX) * scale;
            const endDrawX = (c.endX - cameraX) * scale;
            const chasmW = endDrawX - startDrawX;

            if (endDrawX < -150 || startDrawX > canvas.width + 150) return;

            ctx.save();

            // 1. Deep Abyssal Canyon Void
            const abyssGrad = ctx.createLinearGradient(0, groundDrawY, 0, groundDrawY + 320 * scale);
            abyssGrad.addColorStop(0, '#030712');
            abyssGrad.addColorStop(0.35, '#020617');
            abyssGrad.addColorStop(0.75, '#064e3b');
            abyssGrad.addColorStop(1, '#000000');
            ctx.fillStyle = abyssGrad;
            ctx.fillRect(startDrawX, groundDrawY, chasmW, chasmH);

            // 2. Rising Canyon Fog / Atmospheric Depth Mist
            const mistGrad = ctx.createLinearGradient(0, groundDrawY + 40 * scale, 0, groundDrawY + 180 * scale);
            mistGrad.addColorStop(0, 'rgba(34, 197, 94, 0)');
            mistGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.16)');
            mistGrad.addColorStop(1, 'rgba(5, 46, 22, 0.38)');
            ctx.fillStyle = mistGrad;
            ctx.fillRect(startDrawX, groundDrawY + 40 * scale, chasmW, 140 * scale);

            // 3. Left Cliff Edge (Rocky drop-off with hanging roots)
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3.5 * scale;
            ctx.beginPath();
            ctx.moveTo(startDrawX, groundDrawY);
            ctx.lineTo(startDrawX + 8 * scale, groundDrawY + 35 * scale);
            ctx.lineTo(startDrawX - 4 * scale, groundDrawY + 80 * scale);
            ctx.lineTo(startDrawX + 6 * scale, groundDrawY + 140 * scale);
            ctx.stroke();

            // Left rim moss highlight
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.ellipse(startDrawX - 2 * scale, groundDrawY + 4 * scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dangling roots from left cliff
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(startDrawX + 2 * scale, groundDrawY + 8 * scale);
            ctx.quadraticCurveTo(startDrawX + 6 * scale, groundDrawY + 30 * scale, startDrawX + 2 * scale, groundDrawY + 55 * scale);
            ctx.stroke();

            // 4. Right Cliff Edge (Rocky drop-off with hanging roots)
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3.5 * scale;
            ctx.beginPath();
            ctx.moveTo(endDrawX, groundDrawY);
            ctx.lineTo(endDrawX - 8 * scale, groundDrawY + 35 * scale);
            ctx.lineTo(endDrawX + 4 * scale, groundDrawY + 80 * scale);
            ctx.lineTo(endDrawX - 6 * scale, groundDrawY + 140 * scale);
            ctx.stroke();

            // Right rim moss highlight
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.ellipse(endDrawX + 2 * scale, groundDrawY + 4 * scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dangling roots from right cliff
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(endDrawX - 2 * scale, groundDrawY + 8 * scale);
            ctx.quadraticCurveTo(endDrawX - 6 * scale, groundDrawY + 28 * scale, endDrawX - 3 * scale, groundDrawY + 50 * scale);
            ctx.stroke();

            ctx.restore();
        });
    }


    function drawStartBuilding(scale) {
        if (currentLevelIndex !== 21) return;
        const wallStartX = (-260 - cameraX) * scale;
        const wallEndX = (210 - cameraX) * scale;
        const wallW = wallEndX - wallStartX;
        const wallH = (540 - (-250)) * scale;
        const wallTopY = (-250 - cameraY) * scale;
        const groundDrawY = (540 - cameraY) * scale;

        if (wallEndX < -100) return; // Cull if off-screen to the left

        ctx.save();

        // 1. Massive Concrete / Steel Building Wall (Page 1 Exit)
        const wallGrad = ctx.createLinearGradient(wallStartX, wallTopY, wallEndX, wallTopY);
        wallGrad.addColorStop(0, '#0f172a');
        wallGrad.addColorStop(0.65, '#1e293b');
        wallGrad.addColorStop(1, '#334155');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(wallStartX, wallTopY, wallW, wallH);

        // Right corner edge border
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(wallEndX, wallTopY);
        ctx.lineTo(wallEndX, groundDrawY);
        ctx.stroke();

        // Panel rivets & seams
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2 * scale;
        for (let py = wallTopY; py < groundDrawY; py += 70 * scale) {
            ctx.beginPath();
            ctx.moveTo(wallStartX, py);
            ctx.lineTo(wallEndX, py);
            ctx.stroke();
        }

        // Yellow-Black Hazard Caution Stripes above door
        const stripeY = groundDrawY - 170 * scale;
        const stripeH = 16 * scale;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wallEndX - 100 * scale, stripeY, 100 * scale, stripeH);
        ctx.fillStyle = '#0f172a';
        for (let sx = wallEndX - 95 * scale; sx < wallEndX; sx += 18 * scale) {
            ctx.beginPath();
            ctx.moveTo(sx, stripeY);
            ctx.lineTo(sx + 9 * scale, stripeY);
            ctx.lineTo(sx - 3 * scale, stripeY + stripeH);
            ctx.lineTo(sx - 12 * scale, stripeY + stripeH);
            ctx.closePath();
            ctx.fill();
        }

        // Facility Sign: СЕКТОР 1 • ВЫХОД
        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${10 * scale}px monospace`;
        ctx.fillText('СЕКТОР 1 • ВЫХОД', wallEndX - 98 * scale, stripeY - 8 * scale);

        // 2. Open Steel Vault Doorway at x: 130 to 205
        const doorLeft = (130 - cameraX) * scale;
        const doorTop = (395 - cameraY) * scale;
        const doorW = 75 * scale;
        const doorH = (540 - 395) * scale;

        // Interior doorway glow (illuminated warm white/blue portal)
        const insideGrad = ctx.createLinearGradient(doorLeft, doorTop, doorLeft + doorW, doorTop);
        insideGrad.addColorStop(0, '#0284c7');
        insideGrad.addColorStop(0.5, '#e0f2fe');
        insideGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = insideGrad;
        ctx.fillRect(doorLeft, doorTop, doorW, doorH);

        // Door frame
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 4 * scale;
        ctx.strokeRect(doorLeft, doorTop, doorW, doorH);

        // Open Heavy Vault Door swung outwards to the left
        const openDoorX = doorLeft - 18 * scale;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(openDoorX, doorTop - 6 * scale, 22 * scale, doorH + 6 * scale);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5 * scale;
        ctx.strokeRect(openDoorX, doorTop - 6 * scale, 22 * scale, doorH + 6 * scale);

        // Concrete door threshold transition to grass (x: 120 to 215)
        const threshX = (120 - cameraX) * scale;
        const threshW = 95 * scale;
        ctx.fillStyle = '#475569';
        ctx.fillRect(threshX, groundDrawY, threshW, 14 * scale);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(threshX, groundDrawY, threshW, 14 * scale);

        ctx.restore();
    }

    function drawNatureRock(box, scale) {
        const drawX = (box.x - cameraX) * scale;
        const drawY = (box.y - cameraY) * scale;
        const drawW = box.w * scale;
        const drawH = box.h * scale;

        // Rock Silhouette (chiseled organic boulder with rounded top corners)
        const cornerR = Math.min(14 * scale, drawW * 0.15, drawH * 0.15);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(drawX + cornerR, drawY);
        ctx.lineTo(drawX + drawW - cornerR, drawY);
        ctx.quadraticCurveTo(drawX + drawW, drawY, drawX + drawW, drawY + cornerR);
        ctx.lineTo(drawX + drawW, drawY + drawH);
        ctx.lineTo(drawX, drawY + drawH);
        ctx.lineTo(drawX, drawY + cornerR);
        ctx.quadraticCurveTo(drawX, drawY, drawX + cornerR, drawY);
        ctx.closePath();

        // Slate Granite Body Gradient
        const rockGrad = ctx.createLinearGradient(drawX, drawY, drawX, drawY + drawH);
        rockGrad.addColorStop(0, '#64748b'); // sunlit top
        rockGrad.addColorStop(0.3, '#475569');
        rockGrad.addColorStop(0.7, '#334155');
        rockGrad.addColorStop(1, '#1e293b'); // base
        ctx.fillStyle = rockGrad;
        ctx.fill();

        // Rock Edge Contour
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5 * scale;
        ctx.stroke();

        // Natural Rock Strata & Fissures / Cracks
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.lineWidth = 2 * scale;
        ctx.moveTo(drawX + drawW * 0.25, drawY + drawH * 0.2);
        ctx.lineTo(drawX + drawW * 0.4, drawY + drawH * 0.5);
        ctx.lineTo(drawX + drawW * 0.35, drawY + drawH * 0.85);

        ctx.moveTo(drawX + drawW * 0.7, drawY + drawH * 0.3);
        ctx.lineTo(drawX + drawW * 0.62, drawY + drawH * 0.65);
        ctx.stroke();

        // Light Specular / Sun Edge on the left
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 2 * scale;
        ctx.moveTo(drawX + 4 * scale, drawY + cornerR);
        ctx.lineTo(drawX + 4 * scale, drawY + drawH - 4 * scale);
        ctx.stroke();

        // Top Moss Carpet (living green moss)
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.moveTo(drawX, drawY + 8 * scale);
        const step = 16 * scale;
        for (let mx = drawX; mx <= drawX + drawW; mx += step) {
            const my = drawY + 8 * scale + Math.sin(mx * 0.1) * 3 * scale;
            ctx.lineTo(mx, my);
        }
        ctx.lineTo(drawX + drawW, drawY);
        ctx.lineTo(drawX, drawY);
        ctx.closePath();
        ctx.fill();

        // Bright moss highlight fringe
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(drawX + cornerR, drawY);
        ctx.lineTo(drawX + drawW - cornerR, drawY);
        ctx.stroke();

        // Ledge-grab indicator nodes (mossy flower/bud accents)
        if (!box.noLedgeGrab) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(drawX + 4 * scale, drawY + 2 * scale, 3 * scale, 0, Math.PI * 2);
            ctx.arc(drawX + drawW - 4 * scale, drawY + 2 * scale, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawNatureTree(tur, scale) {
        const drawX = (tur.x - cameraX) * scale;
        const drawY = (tur.y - cameraY) * scale;
        const barLen = (tur.length || 90) * scale;
        const trunkWorldX = tur.trunkX || (tur.x - (tur.length || 90) / 2);
        const drawTrunkX = (trunkWorldX - cameraX) * scale;
        const groundScreenY = (currentLevelData.groundY - cameraY) * scale;

        ctx.save();

        // 1. Mighty Tree Trunk (from ground to sky canopy)
        const trunkW = 34 * scale;
        const trunkTopY = Math.min(drawY - 90 * scale, -200 * scale);

        const trunkGrad = ctx.createLinearGradient(drawTrunkX - trunkW / 2, 0, drawTrunkX + trunkW / 2, 0);
        trunkGrad.addColorStop(0, '#592c10');
        trunkGrad.addColorStop(0.35, '#854d0e');
        trunkGrad.addColorStop(0.7, '#713f12');
        trunkGrad.addColorStop(1, '#3b1a08');
        ctx.fillStyle = trunkGrad;

        // Trunk with flare at base
        ctx.beginPath();
        ctx.moveTo(drawTrunkX - trunkW * 0.45, trunkTopY);
        ctx.lineTo(drawTrunkX + trunkW * 0.45, trunkTopY);
        ctx.lineTo(drawTrunkX + trunkW * 0.55, groundScreenY);
        ctx.quadraticCurveTo(drawTrunkX + trunkW * 0.9, groundScreenY, drawTrunkX + trunkW * 1.1, groundScreenY + 20 * scale);
        ctx.lineTo(drawTrunkX - trunkW * 1.1, groundScreenY + 20 * scale);
        ctx.quadraticCurveTo(drawTrunkX - trunkW * 0.9, groundScreenY, drawTrunkX - trunkW * 0.55, groundScreenY);
        ctx.closePath();
        ctx.fill();

        // Bark grooves
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(drawTrunkX - 4 * scale, trunkTopY + 30 * scale);
        ctx.lineTo(drawTrunkX - 4 * scale, groundScreenY - 10 * scale);
        ctx.moveTo(drawTrunkX + 6 * scale, trunkTopY + 50 * scale);
        ctx.lineTo(drawTrunkX + 6 * scale, groundScreenY - 20 * scale);
        ctx.stroke();

        // 2. Canopy Foliage Clusters (above trunk)
        const foliageColors = ['#15803d', '#16a34a', '#22c55e'];
        const leafClusters = [
            { ox: 0, oy: -80 * scale, r: 42 * scale },
            { ox: -25 * scale, oy: -60 * scale, r: 35 * scale },
            { ox: 25 * scale, oy: -65 * scale, r: 36 * scale }
        ];
        leafClusters.forEach((cl, i) => {
            ctx.fillStyle = foliageColors[i % foliageColors.length];
            ctx.beginPath();
            ctx.arc(drawTrunkX + cl.ox, drawY + cl.oy, cl.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 3. Horizontal Sturdy Living Branch (The Grab Bar at drawY)
        const branchStartX = drawTrunkX;
        const branchEndX = drawX + barLen / 2;

        const branchGrad = ctx.createLinearGradient(0, drawY - 6 * scale, 0, drawY + 6 * scale);
        branchGrad.addColorStop(0, '#92400e');
        branchGrad.addColorStop(0.5, '#78350f');
        branchGrad.addColorStop(1, '#451a03');

        ctx.strokeStyle = branchGrad;
        ctx.lineWidth = 10 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(branchStartX, drawY);
        ctx.lineTo(branchEndX, drawY);
        ctx.stroke();

        // Smooth Wood Highlight on top of branch (where stickman hands grab)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(drawX - barLen / 2 + 5 * scale, drawY - 2.5 * scale);
        ctx.lineTo(drawX + barLen / 2 - 5 * scale, drawY - 2.5 * scale);
        ctx.stroke();

        // Green leaves sprouting near branch tip and junction
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(branchEndX + 4 * scale, drawY - 6 * scale, 7 * scale, 4 * scale, -0.4, 0, Math.PI * 2);
        ctx.ellipse(branchEndX + 8 * scale, drawY + 4 * scale, 6 * scale, 3.5 * scale, 0.4, 0, Math.PI * 2);
        ctx.ellipse(drawTrunkX + 16 * scale, drawY - 7 * scale, 8 * scale, 4.5 * scale, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawNatureVine(rope, scale) {
        const drawAnchorX = (rope.x - cameraX) * scale;
        const drawAnchorY = (rope.anchorY - cameraY) * scale;
        const vineLen = (rope.length || 240) * scale;

        // Tall Tree rooted in ground holding the liana branch
        const trunkWorldX = rope.trunkX || (rope.x - 90);
        const drawTrunkX = (trunkWorldX - cameraX) * scale;
        const groundScreenY = (currentLevelData.groundY - cameraY) * scale;

        // Quick visibility cull
        if (drawAnchorX < -250 * scale || drawTrunkX > canvas.width + 250 * scale) return;

        let angle = 0;
        if (player.state === 'ROPE' && player.activeRope && player.activeRope.id === rope.id) {
            angle = player.ropeAngle;
        } else {
            angle = Math.sin(Date.now() * 0.002 + rope.x) * 0.05;
        }

        const endX = drawAnchorX + Math.sin(angle) * vineLen;
        const endY = drawAnchorY + Math.cos(angle) * vineLen;

        ctx.save();

        // ========================================================
        // 1. TALL ANCIENT TREE (Высокое дерево от земли до неба)
        // ========================================================
        const trunkW = 38 * scale;
        const trunkTopY = drawAnchorY - 65 * scale;

        // Bark gradient
        const trunkGrad = ctx.createLinearGradient(drawTrunkX - trunkW, 0, drawTrunkX + trunkW, 0);
        trunkGrad.addColorStop(0, '#3b1a08');
        trunkGrad.addColorStop(0.35, '#713f12');
        trunkGrad.addColorStop(0.7, '#854d0e');
        trunkGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = trunkGrad;

        // Trunk rising tall from ground to canopy
        ctx.beginPath();
        ctx.moveTo(drawTrunkX - trunkW * 0.45, trunkTopY);
        ctx.lineTo(drawTrunkX + trunkW * 0.45, trunkTopY);
        ctx.lineTo(drawTrunkX + trunkW * 0.55, groundScreenY);
        ctx.quadraticCurveTo(drawTrunkX + trunkW * 0.9, groundScreenY, drawTrunkX + trunkW * 1.35, groundScreenY + 18 * scale);
        ctx.lineTo(drawTrunkX - trunkW * 1.35, groundScreenY + 18 * scale);
        ctx.quadraticCurveTo(drawTrunkX - trunkW * 0.9, groundScreenY, drawTrunkX - trunkW * 0.55, groundScreenY);
        ctx.closePath();
        ctx.fill();

        // Bark texture & grooves
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(drawTrunkX - 5 * scale, trunkTopY + 45 * scale);
        ctx.lineTo(drawTrunkX - 5 * scale, groundScreenY - 15 * scale);
        ctx.moveTo(drawTrunkX + 7 * scale, trunkTopY + 70 * scale);
        ctx.lineTo(drawTrunkX + 7 * scale, groundScreenY - 25 * scale);
        ctx.stroke();

        // Tree trunk moss patch
        ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.beginPath();
        ctx.ellipse(drawTrunkX - 7 * scale, groundScreenY - 60 * scale, 9 * scale, 36 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Top Canopy foliage crown of the tall tree
        const crownColors = ['#14532d', '#15803d', '#16a34a', '#22c55e'];
        const crownClusters = [
            { ox: 0, oy: -35 * scale, r: 52 * scale },
            { ox: -30 * scale, oy: -15 * scale, r: 42 * scale },
            { ox: 25 * scale, oy: -20 * scale, r: 44 * scale },
            { ox: 12 * scale, oy: -55 * scale, r: 46 * scale }
        ];
        crownClusters.forEach((cl, i) => {
            ctx.fillStyle = crownColors[i % crownColors.length];
            ctx.beginPath();
            ctx.arc(drawTrunkX + cl.ox, trunkTopY + cl.oy, cl.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // ========================================================
        // 2. LARGE LIVING BOUGH (Ветка дерева, с которой свисает лиана)
        // ========================================================
        const boughStartX = drawTrunkX;
        const boughStartY = drawAnchorY - 10 * scale;
        const boughEndX = drawAnchorX + 26 * scale;
        const boughEndY = drawAnchorY - 6 * scale;

        const boughGrad = ctx.createLinearGradient(0, boughStartY - 10 * scale, 0, boughStartY + 10 * scale);
        boughGrad.addColorStop(0, '#854d0e');
        boughGrad.addColorStop(0.5, '#713f12');
        boughGrad.addColorStop(1, '#3b1a08');
        ctx.strokeStyle = boughGrad;
        ctx.lineWidth = 14 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(boughStartX, boughStartY);
        ctx.quadraticCurveTo((boughStartX + boughEndX) / 2, boughStartY - 4 * scale, boughEndX, boughEndY);
        ctx.stroke();

        // Sturdy branch wood highlight
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(boughStartX + 8 * scale, boughStartY - 5 * scale);
        ctx.quadraticCurveTo((boughStartX + boughEndX) / 2, boughStartY - 7 * scale, boughEndX - 8 * scale, boughEndY - 3 * scale);
        ctx.stroke();

        // Lush leaves along the bough
        const boughLeaves = [
            { x: boughEndX + 4 * scale, y: boughEndY - 8 * scale, rx: 9 * scale, ry: 4.5 * scale, rot: -0.3 },
            { x: boughEndX + 10 * scale, y: boughEndY + 4 * scale, rx: 7 * scale, ry: 3.5 * scale, rot: 0.4 },
            { x: (boughStartX + drawAnchorX) / 2, y: boughStartY - 12 * scale, rx: 11 * scale, ry: 5.5 * scale, rot: -0.2 },
            { x: drawAnchorX + 16 * scale, y: boughEndY - 10 * scale, rx: 10 * scale, ry: 5 * scale, rot: 0.3 }
        ];
        ctx.fillStyle = '#22c55e';
        boughLeaves.forEach(bl => {
            ctx.beginPath();
            ctx.ellipse(bl.x, bl.y, bl.rx, bl.ry, bl.rot, 0, Math.PI * 2);
            ctx.fill();
        });

        // Vine Coils Wrapping around the branch at anchor
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 7 * scale;
        ctx.beginPath();
        ctx.arc(drawAnchorX, drawAnchorY - 8 * scale, 12 * scale, Math.PI * 0.2, Math.PI * 1.8);
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3.5 * scale;
        ctx.beginPath();
        ctx.arc(drawAnchorX, drawAnchorY - 8 * scale, 12 * scale, Math.PI * 0.2, Math.PI * 1.8);
        ctx.stroke();

        // Leaf cluster at the bough anchor knot
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(drawAnchorX - 10 * scale, drawAnchorY - 6 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.arc(drawAnchorX + 8 * scale, drawAnchorY - 4 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.fill();

        // ========================================================
        // 3. HANGING LIANA BODY
        // ========================================================
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 6.5 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(drawAnchorX, drawAnchorY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Inner lighter vine strand
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2.4 * scale;
        ctx.beginPath();
        ctx.moveTo(drawAnchorX, drawAnchorY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Leaf nodes along swinging vine
        const nodeCount = 5;
        for (let k = 1; k <= nodeCount; k++) {
            const ratio = k / (nodeCount + 1);
            const kX = drawAnchorX + (endX - drawAnchorX) * ratio;
            const kY = drawAnchorY + (endY - drawAnchorY) * ratio;

            const leafSide = (k % 2 === 0) ? 1 : -1;
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse(kX + leafSide * 8 * scale, kY, 8 * scale, 4 * scale, angle + leafSide * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Vine knot
            ctx.fillStyle = '#854d0e';
            ctx.beginPath();
            ctx.arc(kX, kY, 4.5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bottom knot & tassel
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(endX, endY, 7.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.arc(endX, endY, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dangling leaf tip
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(endX + Math.sin(angle) * 9 * scale, endY + Math.cos(angle) * 9 * scale, 7.5 * scale, 3.8 * scale, angle, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawNatureLadder(lad, scale) {
        const drawX = (lad.x - cameraX) * scale;
        const drawTopY = (lad.topY - cameraY) * scale;
        const drawBotY = (lad.bottomY - cameraY) * scale;
        const drawW = (lad.w || 40) * scale;

        const leftX = drawX - drawW / 2;
        const rightX = drawX + drawW / 2;

        if (drawX < -100 * scale || drawX > canvas.width + 100 * scale) return;

        ctx.save();

        // ========================================================
        // ЛИАНЫ НА КАМНЕ ДЛЯ ЛАЗАНИЯ (Вместо деревянной лестницы)
        // ========================================================
        // 1. Mossy Rock Shadow Crevice Behind the Vines
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(leftX - 6 * scale, drawTopY, drawW + 12 * scale, drawBotY - drawTopY);

        ctx.fillStyle = 'rgba(22, 101, 52, 0.35)';
        ctx.fillRect(leftX - 4 * scale, drawTopY, drawW + 8 * scale, drawBotY - drawTopY);

        // 2. Thick Creeping Vine Stems Climbing the Stone
        // Left twisting vertical vine stem
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 6 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let y = drawBotY; y >= drawTopY; y -= 16 * scale) {
            const wave = Math.sin(y * 0.08) * 3 * scale;
            if (y === drawBotY) ctx.moveTo(leftX + wave, y);
            else ctx.lineTo(leftX + wave, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.4 * scale;
        ctx.beginPath();
        for (let y = drawBotY; y >= drawTopY; y -= 16 * scale) {
            const wave = Math.sin(y * 0.08) * 3 * scale;
            if (y === drawBotY) ctx.moveTo(leftX + wave, y);
            else ctx.lineTo(leftX + wave, y);
        }
        ctx.stroke();

        // Right twisting vertical vine stem
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        for (let y = drawBotY; y >= drawTopY; y -= 16 * scale) {
            const wave = Math.cos(y * 0.08) * 3 * scale;
            if (y === drawBotY) ctx.moveTo(rightX + wave, y);
            else ctx.lineTo(rightX + wave, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.4 * scale;
        ctx.beginPath();
        for (let y = drawBotY; y >= drawTopY; y -= 16 * scale) {
            const wave = Math.cos(y * 0.08) * 3 * scale;
            if (y === drawBotY) ctx.moveTo(rightX + wave, y);
            else ctx.lineTo(rightX + wave, y);
        }
        ctx.stroke();

        // 3. Natural Curved Vine Loops (Петли лиан, создающие пространство для рук и ног)
        const step = 22;
        for (let rY = lad.topY + 12; rY <= lad.bottomY - 8; rY += step) {
            const rungY = (rY - cameraY) * scale;
            const leftWave = Math.sin(rungY * 0.08) * 3 * scale;
            const rightWave = Math.cos(rungY * 0.08) * 3 * scale;

            // Bowed-out horizontal vine loop creating space to climb
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 5.2 * scale;
            ctx.beginPath();
            ctx.moveTo(leftX + leftWave, rungY);
            ctx.quadraticCurveTo(drawX, rungY + 7 * scale, rightX + rightWave, rungY);
            ctx.stroke();

            // Inner bright loop highlight
            ctx.strokeStyle = '#86efac';
            ctx.lineWidth = 1.8 * scale;
            ctx.beginPath();
            ctx.moveTo(leftX + leftWave, rungY);
            ctx.quadraticCurveTo(drawX, rungY + 7 * scale, rightX + rightWave, rungY);
            ctx.stroke();

            // Root knuckles at stone attachment points
            ctx.fillStyle = '#854d0e';
            ctx.beginPath();
            ctx.arc(leftX + leftWave, rungY, 4 * scale, 0, Math.PI * 2);
            ctx.arc(rightX + rightWave, rungY, 4 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Foliage & Ivy Leaves sprouting from each loop hold
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.ellipse(leftX + leftWave - 5 * scale, rungY, 6.5 * scale, 3.2 * scale, -0.4, 0, Math.PI * 2);
            ctx.ellipse(rightX + rightWave + 5 * scale, rungY, 6.5 * scale, 3.2 * scale, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. Vine Crest Overhanging the Top Stone Ledge
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(drawX, drawTopY, 14 * scale, 0, Math.PI * 2);
        ctx.arc(leftX, drawTopY - 2 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.arc(rightX, drawTopY - 2 * scale, 10 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(drawX, drawTopY - 6 * scale, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // 5. Roots at base entering the earth floor
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(leftX, drawBotY + 2 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.arc(rightX, drawBotY + 2 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawNatureFlag(flag, scale) {
        const flagX = (flag.x - cameraX) * scale;
        const flagY = (flag.y - cameraY) * scale;

        ctx.save();

        // Polished Wooden Staff
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 5 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(flagX, flagY);
        ctx.lineTo(flagX, flagY - flag.poleHeight * scale);
        ctx.stroke();

        // Ivy Vine climbing the pole
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        for (let py = flagY; py >= flagY - flag.poleHeight * scale; py -= 8 * scale) {
            const sinOff = Math.sin(py * 0.15) * 3 * scale;
            ctx.lineTo(flagX + sinOff, py);
        }
        ctx.stroke();

        // Golden Acorn / Finial Top
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(flagX, flagY - flag.poleHeight * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Emerald Nature Banner
        const wave = Math.sin(Date.now() * 0.005) * 6 * scale;
        const bannerTopY = flagY - flag.poleHeight * scale + 6 * scale;
        const bannerW = flag.bannerW * scale;
        const bannerH = flag.bannerH * scale;

        const flagGrad = ctx.createLinearGradient(flagX, bannerTopY, flagX + bannerW, bannerTopY);
        flagGrad.addColorStop(0, '#059669');
        flagGrad.addColorStop(0.5, '#10b981');
        flagGrad.addColorStop(1, '#34d399');

        ctx.fillStyle = flagGrad;
        ctx.beginPath();
        ctx.moveTo(flagX, bannerTopY);
        ctx.quadraticCurveTo(flagX + bannerW * 0.5, bannerTopY + wave, flagX + bannerW, bannerTopY + wave / 2);
        ctx.lineTo(flagX + bannerW, bannerTopY + bannerH + wave / 2);
        ctx.quadraticCurveTo(flagX + bannerW * 0.5, bannerTopY + bannerH + wave, flagX, bannerTopY + bannerH);
        ctx.closePath();
        ctx.fill();

        // White Leaf Emblem
        ctx.fillStyle = '#ffffff';
        ctx.font = `${16 * scale}px sans-serif`;
        ctx.fillText('🍃', flagX + 10 * scale, bannerTopY + 22 * scale + wave / 2);

        ctx.restore();
    }

    function drawCutsceneDoor() {
        if (currentLevelIndex !== 20 || (!cutscene.active && cutscene.whiteAlpha <= 0)) return;
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
        isAbyssFall: false,
        staggerTimer: 0,
        staggerAngle: 0,

        hangingLedge: null,
        climbProgress: 0,
        climbStartPos: { x: 0, y: 0 },
        climbTargetPos: { x: 0, y: 0 },
        activeLadder: null,
        activeTurnik: null,
        turnikTimer: 0,
        turnikAngle: 0,
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
        shoveCooldown: 0,

        animTime: 0,
        victoryTimer: 0,
        victoryLandY: null,

        reset() {
            this.x = currentLevelData.playerStartX || 180;
            this.y = currentLevelData.groundY;
            this.vx = 0;
            this.vy = 0;
            this.facing = 1;
            this.grounded = true;
            this.state = 'IDLE';
            this.isCrouching = false;
            this.isBossMode = false;
            this.isAbyssFall = false;
            this.staggerTimer = 0;
            this.staggerAngle = 0;
            this.height = 76;
            this.shoveCooldown = 0;
            this.hangingLedge = null;
            this.climbProgress = 0;
            this.victoryTimer = 0;
            this.victoryLandY = null;
            this.activeLadder = null;
            this.activeTurnik = null;
            this.turnikTimer = 0;
            this.turnikAngle = 0;
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

            if (cutsceneIntro21) {
                cutsceneIntro21.active = false;
            }
            if (cutsceneOverlay) {
                cutsceneOverlay.classList.add('hidden');
            }

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
        if (player.shoveCooldown > 0) player.shoveCooldown--;

        // Check boss arena trigger on Level 20
        if (currentLevelIndex === 20 && !boss.active && player.x >= 5200 && player.state !== 'DEFEAT') {
            startBossFight();
        }

        // Check boss arena intro trigger on Level 40 (activates only when snowy biome behind Golem enters the view!)
        if (currentLevelIndex === 40 && !golem.active && !golem.isFallen && player.state !== 'DEFEAT') {
            if (canSeeSnowyBiome()) {
                if (!golem.introPlayed && (!golemIntroCutscene || !golemIntroCutscene.active)) {
                    startGolemIntroCutscene();
                    return;
                } else if (!golem.active) {
                    startGolemFight();
                }
            }
        }

        // --- DEFEAT STATE ---
        if (player.state === 'DEFEAT') {
            player.staggerTimer += 0.016;

            if (player.isAbyssFall) {
                // Plunging down into the abyss
                player.vy += 0.55;
                player.y += player.vy;
                player.vx *= 0.96;
                player.x += player.vx;
                player.grounded = false;

                // Show defeat screen smoothly after 0.55s
                if (player.staggerTimer > 0.55) {
                    if (defeatScreen && !defeatScreen.classList.contains('screen-active')) {
                        defeatScreen.classList.remove('hidden');
                        defeatScreen.classList.add('screen-active');
                    }
                }
                return;
            }

            // Normal ground defeat (boulder / spikes)
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
                if (currentLevelIndex >= 21) {
                    if (nextLevelNum <= 40) {
                        unlockedPage2Levels = Math.max(unlockedPage2Levels, nextLevelNum);
                    }
                    generateLevelsGrid();
                } else {
                    unlockedPage1Levels = Math.max(unlockedPage1Levels, nextLevelNum);
                    generateLevelsGrid();
                }

                if (levelsData[nextLevelNum] && nextLevelNum <= 40) {
                    btnNextLevel.classList.remove('hidden');
                    btnNextLevel.innerHTML = (nextLevelNum === 40)
                        ? '<span class="btn-icon">🗿</span> К БОССУ: Уровень 40'
                        : '<span class="btn-icon">➡️</span> Следующий уровень';
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
                player.turnikAngle = 0;
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
            ledgeHint.innerHTML = '<span class="hint-key">A / D</span> Раскачка ног &nbsp;&nbsp; <span class="hint-key">ПРОБЕЛ</span> Прыжок вперед';
            ledgeHint.classList.remove('hidden');

            // Interactive leg swing on horizontal bar (hands remain firmly fixed)
            if (keys.left) {
                player.turnikAngle = (player.turnikAngle || 0) + 0.035;
                player.facing = -1;
            } else if (keys.right) {
                player.turnikAngle = (player.turnikAngle || 0) - 0.035;
                player.facing = 1;
            } else {
                player.turnikAngle = (player.turnikAngle || 0) * 0.93;
            }
            player.turnikAngle = Math.max(-0.55, Math.min(0.55, player.turnikAngle || 0));

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

            // Calculate player grip position (knot of rope / liana)
            const ropeLen = rope.length || (rope.isVine ? 240 : 220);
            const gripX = rope.x + Math.sin(player.ropeAngle) * ropeLen;
            const gripY = rope.anchorY + Math.cos(player.ropeAngle) * ropeLen;

            player.x = gripX;
            player.y = gripY + 58; // Hang so local hands at (0, -58) clamp exactly on the knot

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
        const isSpecialState = ['VICTORY', 'VICTORY_IDLE', 'HANG', 'CLIMB', 'LADDER', 'TURNIK', 'TURNIK_SWING', 'ROPE', 'DEFEAT', 'COLD_SHIVER', 'WALK'].includes(player.state);

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

                const ropeLen = rope.length || (rope.isVine ? 240 : 220);
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

                    // Immediately attach player hands to the knot
                    const gripX = rope.x + Math.sin(player.ropeAngle) * ropeLen;
                    const gripY = rope.anchorY + Math.cos(player.ropeAngle) * ropeLen;
                    player.x = gripX;
                    player.y = gripY + 58;

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

        // Level 40: Golem Living Wall & Non-Lethal Pushback
        if (currentLevelIndex === 40 && (golem.active || (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active)) && !golem.isFallen) {
            const gLeft = golem.x - 72;
            const gRight = golem.x + 72;
            const gTop = golem.y - 110;
            const gBottom = currentLevelData.groundY + 30;

            // 1. Solid Living Wall: Player CANNOT pass through the Golem
            if (nextY > gTop && nextY - player.height < gBottom) {
                if (player.x <= golem.x && nextX + 16 > gLeft) {
                    nextX = gLeft - 16;
                    if (player.vx > 0) player.vx = 0;
                } else if (player.x > golem.x && nextX - 16 < gRight) {
                    nextX = gRight + 16;
                    if (player.vx < 0) player.vx = 0;
                }
            }

            // 2. Proximity Shove: If player approaches Golem, Golem shoves them away (non-lethal!)
            if (player.shoveCooldown <= 0 && golem.active && golem.state !== 'DEFEATED' && !golem.isFallen && player.state !== 'DEFEAT') {
                const distToGolem = Math.abs(nextX - golem.x);
                if (distToGolem < 125 && nextY > gTop && nextY <= currentLevelData.groundY + 15) {
                    player.shoveCooldown = 45; // ~0.75s cooldown
                    golem.shoveTimer = 0.35; // Golem thrusts stone fist forward

                    const shoveDir = (nextX <= golem.x) ? -1 : 1;
                    player.vx = shoveDir * 17;
                    player.vy = -6.5;
                    player.grounded = false;
                    player.state = 'JUMP';
                    nextX += shoveDir * 25;

                    playSound('slam');
                    playSound('airBoost');
                    screenShake = 12;
                    spawnDust(nextX, currentLevelData.groundY);

                    // Kinetic air shockwave particles
                    for (let sp = 0; sp < 14; sp++) {
                        particles.push({
                            x: golem.x + shoveDir * 55,
                            y: golem.y - 10 + (Math.random() - 0.5) * 45,
                            vx: shoveDir * (5 + Math.random() * 9),
                            vy: (Math.random() - 0.5) * 6,
                            size: 4 + Math.random() * 6,
                            color: Math.random() < 0.5 ? '#22c55e' : '#f8fafc',
                            life: 0.6,
                            decay: 0.04
                        });
                    }
                }
            }
        }

        // Ground platform collision & Chasm check
        if (nextY >= currentLevelData.groundY) {
            if (isOverChasm(nextX)) {
                // Falling into chasm!
                player.grounded = false;
                if (nextY > currentLevelData.groundY + 70) {
                    triggerDefeat(true);
                    return;
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

        // General out-of-world / abyss fall fallback
        if (player.y > currentLevelData.groundY + 90) {
            triggerDefeat(true);
            return;
        }

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

        // State update guard: NEVER overwrite DEFEAT, VICTORY, or CUTSCENE states!
        if (player.state === 'DEFEAT' || player.state === 'VICTORY' || player.state === 'VICTORY_IDLE' || player.state === 'COLD_SHIVER' || player.state === 'WALK' || player.state === 'CUTSCENE_REACH' || player.state === 'EXAMINE_EARTH') {
            return;
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
            const isNature = currentLevelData.theme === 'nature' || currentLevelIndex >= 21;

            if (isNature) {
                // ==========================================
                // NATURE THEME: RADIANT SUNNY SKY & LANDSCAPE
                // ==========================================
                const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                skyGrad.addColorStop(0, '#0284c7');
                skyGrad.addColorStop(0.4, '#38bdf8');
                skyGrad.addColorStop(0.75, '#7dd3fc');
                skyGrad.addColorStop(1, '#fef3c7');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Radiant Sun & Sunbeams
                const sunX = canvas.width - 220 * scale;
                const sunY = 120 * scale;
                const sunR = 48 * scale;
                const sunGrad = ctx.createRadialGradient(sunX, sunY, 4 * scale, sunX, sunY, sunR * 2.2);
                sunGrad.addColorStop(0, '#ffffff');
                sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.75)');
                sunGrad.addColorStop(0.7, 'rgba(253, 224, 71, 0.2)');
                sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
                ctx.fillStyle = sunGrad;
                ctx.beginPath();
                ctx.arc(sunX, sunY, sunR * 2.2, 0, Math.PI * 2);
                ctx.fill();

                // Distant Mountains Silhouette (Parallax 1)
                ctx.save();
                ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
                ctx.beginPath();
                ctx.moveTo(0, canvas.height);
                const mStep = 240 * scale;
                const mOffset = -(cameraX * 0.05 * scale) % mStep;
                for (let mx = mOffset - mStep; mx < canvas.width + mStep * 2; mx += mStep) {
                    ctx.lineTo(mx, 320 * scale);
                    ctx.lineTo(mx + mStep * 0.5, 230 * scale);
                    ctx.lineTo(mx + mStep, 320 * scale);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // Rolling Forest Hills Silhouette (Parallax 2)
                ctx.save();
                ctx.fillStyle = 'rgba(22, 101, 52, 0.42)';
                ctx.beginPath();
                ctx.moveTo(0, canvas.height);
                const hStep = 320 * scale;
                const hOffset = -(cameraX * 0.12 * scale) % hStep;
                for (let hx = hOffset - hStep; hx < canvas.width + hStep * 2; hx += hStep) {
                    ctx.quadraticCurveTo(hx + hStep * 0.5, 360 * scale, hx + hStep, 420 * scale);
                }
                ctx.lineTo(canvas.width, canvas.height);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // Ambient Leaves Drifting in the Wind
                drawAmbientLeaves(scale);

                // Snowy Biome Atmospheric Twilight & Mountains for Level 40
                const rightEdge = cameraX + (canvas.width / scale);
                if (currentLevelIndex === 40 && (rightEdge > 7700 || (typeof golemCutscene !== 'undefined' && golemCutscene.active))) {
                    const snowProg = Math.min(1, Math.max(0, (rightEdge - 7700) / 900));
                    ctx.save();
                    const activeCutscene = (typeof golemCutscene !== 'undefined' && (golemCutscene.phase === 'WALK_TO_SNOW' || golemCutscene.phase === 'COLD_SHIVER'));
                    ctx.globalAlpha = activeCutscene ? 0.92 : snowProg * 0.85;
                    const winterSky = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    winterSky.addColorStop(0, '#0f172a');
                    winterSky.addColorStop(0.4, '#1e293b');
                    winterSky.addColorStop(0.8, '#334155');
                    winterSky.addColorStop(1, '#94a3b8');
                    ctx.fillStyle = winterSky;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Distant Snow-capped Mountain Peaks
                    ctx.fillStyle = '#e2e8f0';
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height);
                    const sStep = 280 * scale;
                    const sOffset = -(cameraX * 0.08 * scale) % sStep;
                    for (let sx = sOffset - sStep; sx < canvas.width + sStep * 2; sx += sStep) {
                        ctx.lineTo(sx, 300 * scale);
                        ctx.lineTo(sx + sStep * 0.45, 170 * scale);
                        ctx.lineTo(sx + sStep, 300 * scale);
                    }
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }

                // Page 1 Building Wall & Vault Door at start (x = -260 to 210)
                drawStartBuilding(scale);

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
        }

        const isNature = currentLevelData.theme === 'nature' || currentLevelIndex >= 21;

        // --- RENDER LEVEL PLATFORMS & OBSTACLES ---
        if (isNature && currentLevelData.chasms) {
            drawNatureChasms(scale);
        }
        // Ground Platform
        currentLevelData.platforms.forEach(plat => {
            const drawX = (plat.x - cameraX) * scale;
            const drawY = (plat.y - cameraY) * scale;
            const drawW = plat.w * scale;
            const drawH = plat.h * scale;

            if (isNature) {
                // Nature Earth Ground Platform
                const soilGrad = ctx.createLinearGradient(0, drawY, 0, drawY + drawH);
                soilGrad.addColorStop(0, '#78350f'); // rich brown top soil
                soilGrad.addColorStop(0.35, '#451a03');
                soilGrad.addColorStop(1, '#271003');
                ctx.fillStyle = soilGrad;
                ctx.fillRect(drawX, drawY, drawW, drawH);

                // Lush Green Grass Carpet Surface
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(drawX, drawY, drawW, 8 * scale);
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(drawX, drawY + 8 * scale, drawW, 4 * scale);

                // Immovable, static grass tufts & wildflowers anchored directly in world coordinates
                const tuftStep = 20; // 20 world units step
                const visibleWorldMin = Math.max(plat.x, Math.floor((cameraX - 50) / tuftStep) * tuftStep);
                const visibleWorldMax = Math.min(plat.x + plat.w, Math.ceil((cameraX + canvas.width / scale + 50) / tuftStep) * tuftStep);

                for (let wx = visibleWorldMin; wx <= visibleWorldMax; wx += tuftStep) {
                    const gx = (wx - cameraX) * scale;
                    // Deterministic pseudorandom values based on world coordinate wx
                    const seed = Math.sin(wx * 0.123);
                    const bladeH = (6 + Math.abs(seed) * 5) * scale;
                    const lean = seed * 3 * scale;

                    // Grass blade cluster (completely frozen in place on the floor)
                    ctx.fillStyle = '#4ade80';
                    ctx.beginPath();
                    ctx.moveTo(gx - 2 * scale, drawY);
                    ctx.lineTo(gx + lean, drawY - bladeH);
                    ctx.lineTo(gx + 3 * scale, drawY);
                    ctx.fill();

                    // Second smaller blade in the tuft
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.moveTo(gx + 1 * scale, drawY);
                    ctx.lineTo(gx + 4 * scale - lean * 0.5, drawY - bladeH * 0.7);
                    ctx.lineTo(gx + 5 * scale, drawY);
                    ctx.fill();

                    // Wildflower based on world coordinate wx
                    if (Math.sin(wx * 0.357) > 0.65) {
                        const flowerColor = Math.sin(wx * 0.8) > 0 ? '#facc15' : '#f472b6';
                        ctx.fillStyle = flowerColor;
                        ctx.beginPath();
                        ctx.arc(gx + lean * 0.8, drawY - bladeH - 1 * scale, 2.5 * scale, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(gx + lean * 0.8, drawY - bladeH - 1 * scale, 1 * scale, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // Occasional ground pebble / stone embedded in the soil
                    if (Math.cos(wx * 0.491) > 0.82) {
                        ctx.fillStyle = '#64748b';
                        ctx.beginPath();
                        ctx.ellipse(gx + 7 * scale, drawY + 2 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else {
                const platGrad = ctx.createLinearGradient(0, drawY, 0, drawY + drawH);
                platGrad.addColorStop(0, '#1e293b');
                platGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = platGrad;
                ctx.fillRect(drawX, drawY, drawW, drawH);

                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(drawX, drawY, drawW, 4 * scale);
            }
        });

        // Box / Stone Obstacles
        currentLevelData.boxes.forEach(box => {
            if (isNature || box.isStone) {
                drawNatureRock(box, scale);
            } else {
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
            }
        });

        // Render Ladders
        if (currentLevelData.ladders) {
            currentLevelData.ladders.forEach(lad => {
                if (isNature || lad.isWoodLadder) {
                    drawNatureLadder(lad, scale);
                } else {
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
                }
            });
        }

        // Render Turniks / Trees
        if (currentLevelData.turniks) {
            currentLevelData.turniks.forEach(tur => {
                if (isNature || tur.isTree) {
                    drawNatureTree(tur, scale);
                } else {
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
                }
            });
        }

        // Render Ropes / Vines
        if (currentLevelData.ropes) {
            currentLevelData.ropes.forEach(rope => {
                if (isNature || rope.isVine) {
                    drawNatureVine(rope, scale);
                } else {
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
                }
            });
        }

        // Finish Flag
        if (currentLevelData.flag) {
            if (isNature || currentLevelData.flag.isNatureFlag) {
                drawNatureFlag(currentLevelData.flag, scale);
            } else {
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
        }

        // Draw Cutscene Door & Light (behind stickman)
        drawCutsceneDoor();

        // Draw Boss Hazards (Chasms, Spikes, Boulders, Ground Debris)
        drawBossHazards();
        drawGolemHazards();

        // Render Particles
        drawParticles();

        // Render Stickman
        drawStickman();

        // Draw Boss Robot
        drawBossRobot();

        // Draw Ancient Stone Golem
        drawGolem();

        // Draw Snowy Biome & Cold Breath
        drawSnowyBiome(scale);

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
                if (progress < 0.35) {
                    // Backswing: legs swing backward
                    swingAngle = (progress / 0.35) * 0.45 * facing;
                } else {
                    // Forward whip: legs swing powerfully forward into horizontal release
                    const fProg = (progress - 0.35) / 0.65;
                    swingAngle = (0.45 - fProg * 1.65) * facing;
                }
            } else {
                // Natural gentle leg sway + interactive A/D swing
                const idleSway = Math.sin(time * 3) * 0.12 * facing;
                swingAngle = idleSway + (player.turnikAngle || 0);
            }

            // Pivot around the turnik bar at (0, -60 * scale): hands stay pinned to the bar, legs and body swing!
            ctx.translate(0, -60 * scale);
            ctx.rotate(swingAngle);
            ctx.translate(0, 60 * scale);

            hip = { x: 0, y: -22 };
            shoulder = { x: 0, y: -42 };
            head = { x: 0, y: -52 };

            leftHand = { x: -7, y: -60 };
            rightHand = { x: 7, y: -60 };

            leftKnee = { x: -4, y: -10 };
            rightKnee = { x: 4, y: -10 };
            leftFoot = { x: -6, y: 0 };
            rightFoot = { x: 6, y: 0 };

        } else if (player.state === 'ROPE') {
            // Pivot around the rope/liana knot at (0, -58 * scale): hands stay clamped to the knot, body swings naturally along the rope!
            ctx.translate(0, -58 * scale);
            ctx.rotate(-player.ropeAngle);
            ctx.translate(0, 58 * scale);

            hip = { x: 0, y: -22 };
            shoulder = { x: 0, y: -40 };
            head = { x: 0, y: -50 };

            leftHand = { x: -3, y: -58 };
            rightHand = { x: 3, y: -56 };

            leftKnee = { x: -facing * 5, y: -10 };
            rightKnee = { x: facing * 5, y: -8 };
            leftFoot = { x: -facing * 7, y: 0 };
            rightFoot = { x: facing * 7, y: 2 };

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

        } else if (player.state === 'EXAMINE_EARTH') {
            // Kneeling / crouching down to touch the ground grass & soil
            hip = { x: 0, y: -24 };
            shoulder = { x: facing * 6, y: -38 };
            head = { x: facing * 10, y: -48 };

            leftKnee = { x: -facing * 12, y: -12 };
            leftFoot = { x: -facing * 14, y: 0 };
            rightKnee = { x: facing * 12, y: -10 };
            rightFoot = { x: facing * 14, y: 0 };

            leftHand = { x: -facing * 2, y: -24 };
            rightHand = { x: facing * 16, y: -3 }; // Right hand touching the earth!

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
        } else if (player.state === 'COLD_SHIVER') {
            // Rapid trembling & shivering from intense freezing cold
            const shiverX = Math.sin(time * 38) * 2.2;
            const shiverY = Math.cos(time * 32) * 1.0;

            hip = { x: shiverX, y: -36 + shiverY };
            shoulder = { x: facing * 3 + shiverX, y: -50 + shiverY };
            head = { x: facing * 5 + shiverX, y: -64 + shiverY };

            // Arms crossed tightly hugging shoulders and torso
            leftHand = { x: facing * 8 + shiverX, y: -48 + shiverY };
            rightHand = { x: -facing * 6 + shiverX, y: -46 + shiverY };

            // Knocking knees and shaking legs
            leftKnee = { x: -6 * facing + Math.sin(time * 30) * 1.5, y: -18 };
            rightKnee = { x: 4 * facing - Math.sin(time * 30) * 1.5, y: -18 };
            leftFoot = { x: -8 * facing, y: 0 };
            rightFoot = { x: 8 * facing, y: 0 };
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

        // Draw Prominent, Clearly Visible Gripping Hands & Knuckles
        if (player.state === 'ROPE') {
            // Both hands visibly gripping the rope/liana knot with knuckles and clasping finger wraps
            [leftHand, rightHand].forEach((hand, idx) => {
                const hx = hand.x * scale;
                const hy = hand.y * scale;

                // Clenched fist base
                ctx.fillStyle = '#020617';
                ctx.beginPath();
                ctx.arc(hx, hy, 4.8 * scale, 0, Math.PI * 2);
                ctx.fill();

                // High-contrast knuckle outline (pops over green lianas and brown ropes)
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 1.6 * scale;
                ctx.beginPath();
                ctx.arc(hx, hy, 4.8 * scale, 0, Math.PI * 2);
                ctx.stroke();

                // Cyan clasping grip wrapped around the rope knot
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2 * scale;
                ctx.beginPath();
                const startAngle = idx === 0 ? Math.PI * 0.4 : -Math.PI * 0.4;
                ctx.arc(hx, hy, 3.2 * scale, startAngle, startAngle + Math.PI * 0.9);
                ctx.stroke();
            });
        } else if (player.state === 'TURNIK' || player.state === 'TURNIK_SWING') {
            // Hands hooked over the turnik horizontal bar
            [leftHand, rightHand].forEach((hand) => {
                const hx = hand.x * scale;
                const hy = hand.y * scale;

                // Clenched fist
                ctx.fillStyle = '#020617';
                ctx.beginPath();
                ctx.arc(hx, hy, 4.8 * scale, 0, Math.PI * 2);
                ctx.fill();

                // High-contrast outline
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 1.6 * scale;
                ctx.beginPath();
                ctx.arc(hx, hy, 4.8 * scale, 0, Math.PI * 2);
                ctx.stroke();

                // Fingers hooked over the top of the horizontal bar
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.2 * scale;
                ctx.beginPath();
                ctx.arc(hx, hy, 3.2 * scale, Math.PI * 0.85, Math.PI * 2.15);
                ctx.stroke();
            });
        } else if (player.state === 'HANG' || player.state === 'CLIMB') {
            [leftHand, rightHand].forEach(hand => {
                const hx = hand.x * scale;
                const hy = hand.y * scale;
                ctx.fillStyle = '#020617';
                ctx.beginPath();
                ctx.arc(hx, hy, 4.2 * scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 1.5 * scale;
                ctx.stroke();
            });
        } else {
            // Default hands
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.arc(leftHand.x * scale, leftHand.y * scale, 3 * scale, 0, Math.PI * 2);
            ctx.arc(rightHand.x * scale, rightHand.y * scale, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Game loop
    function gameLoop() {
        const isNature = currentLevelData.theme === 'nature' || currentLevelIndex >= 21;
        if (isNature) {
            updateAmbientLeaves();
        }

        if (currentState === STATES.PLAYING || currentState === STATES.VICTORY) {
            updatePlayer();
            updateBoss();
            updateParticles();
            updateCamera();
        } else if (currentState === STATES.CUTSCENE) {
            if (cutsceneIntro21.active) {
                updateCutsceneIntro21();
            } else if (typeof golemCutscene !== 'undefined' && golemCutscene && golemCutscene.active) {
                updateGolemDefeatCutscene();
            } else if (typeof golemIntroCutscene !== 'undefined' && golemIntroCutscene && golemIntroCutscene.active) {
                updateGolemIntroCutscene();
            } else {
                updateCutscene();
            }
            updateParticles();
            updateCamera();
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
        if (nextLevelNum > 20 && currentSelectPage === 1) {
            currentSelectPage = 2;
            generateLevelsGrid();
        }

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
            if (currentLevelIndex >= 20) {
                if (currentLevelIndex >= 21) {
                    currentSelectPage = 2;
                }
                generateLevelsGrid();
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

