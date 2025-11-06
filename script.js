// Конфигурация
const collections = {
    demim: {
        name: "WELCOME",
        tracks: [1, 2],
        color: "#8B5CF6",
        description: "EXP"
    }
};

const tracks = [
    {
        id: 1,
        title: "Not",
        cover: "img/1.png",
        audio: "mu/not.mp3",
        duration: "3:44",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true,
        bpm: 124 // BPM для точной синхронизации
    },
    {
        id: 2,
        title: "relax",
        cover: "img/black.png",
        audio: "mu/relax.mp3",
        duration: "3:44",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true,
        bpm: 122
    },
    {
        id: 4,
        title: "Track 1",
        cover: "img/1.png",
        audio: "mu/new1.mp3",
        duration: "3:44",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true,
        bpm: 125
    },
    {
        id: 5,
        title: "Track 2",
        cover: "img/1.png",
        audio: "mu/new2.mp3",
        duration: "3:44",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true,
        bpm: 125
    },	
    {
        id: 6,
        title: "Track 3",
        cover: "img/1.png",
        audio: "mu/new3.mp3",
        duration: "3:44",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true,
        bpm: 125
    },		
];

const upcomingRelease = {
    trackId: 3,
    title: "idk",
    cover: "img/1.png",
    audio: "mu/Project_21.mp3",
    releaseDate: "2025-11-10T00:00:00",
    preReleaseStart: "2024-12-20T00:00:00",
    bpm: 130
};

class PlayCountTracker {
    constructor() {
        this.counts = JSON.parse(localStorage.getItem('cawercat_playCounts') || '{}');
    }

    trackPlay(trackId) {
        this.counts[trackId] = (this.counts[trackId] || 0) + 1;
        localStorage.setItem('cawercat_playCounts', JSON.stringify(this.counts));
        return this.counts[trackId];
    }

    getCount(trackId) {
        return this.counts[trackId] || 0;
    }

    getTotalPlays() {
        return Object.values(this.counts).reduce((sum, count) => sum + count, 0);
    }
}

class ModernMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.isPlaying = false;
        this.isTransitioning = false;
        this.playTracker = new PlayCountTracker();
        this.fadeDuration = 12000;
        
        // Для точной детекции битов
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.animationId = null;
        
        // Частотные диапазоны для инструментов
        this.frequencyRanges = {
            drums: { low: 2000, high: 8000 },  // Высокие частоты - барабаны
            bass: { low: 20, high: 250 },      // Низкие частоты - бас
            synth: { low: 250, high: 2000 },   // Средние частоты - синтезатор
            vocal: { low: 2000, high: 4000 }   // Высокие частоты - вокал
        };
        
        // Пороги срабатывания для каждого инструмента
        this.thresholds = {
            drums: 0.6,
            bass: 0.5,
            synth: 0.4,
            vocal: 0.3
        };
        
        // История уровней для каждого инструмента
        this.levelHistory = {
            drums: [],
            bass: [],
            synth: [],
            vocal: []
        };

        this.initializeElements();
        this.setupEventListeners();
        this.setupNavigation();
        this.renderCollections();
        this.renderTracks();
        this.checkUpcomingRelease();
        this.setupProtection();
        this.updateTotalPlays();
        
        document.getElementById('totalTracks').textContent = tracks.filter(t => t.released).length;
        this.setupAutoplay();
    }

    initializeElements() {
        // Основные элементы
        this.currentCover = document.getElementById('currentCover');
        this.currentTitle = document.getElementById('currentTitle');
        this.currentRelease = document.getElementById('currentRelease');
        this.tracksGrid = document.getElementById('tracks-grid');
        this.collectionsGrid = document.querySelector('.collections-grid');
        this.collectionModal = document.getElementById('collectionModal');
        this.modalTracks = document.getElementById('modalTracks');
        this.modalTitle = document.getElementById('modalTitle');
        this.totalPlays = document.getElementById('totalPlays');
        this.preReleaseBanner = document.getElementById('pre-release-banner');
        this.bannerCover = document.getElementById('banner-cover');
        this.bannerTitle = document.getElementById('banner-title');
        this.releaseCountdown = document.getElementById('releaseCountdown');
        
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.sections = document.querySelectorAll('.section');

        // Полноэкранный плеер
        this.fullscreenPlayer = document.getElementById('fullscreenPlayer');
        this.closeFullscreenBtn = document.querySelector('.close-fullscreen-player');
        this.fullscreenCover = document.getElementById('fullscreenCover');
        this.fullscreenTitle = document.getElementById('fullscreenTitle');
        this.fullscreenRelease = document.getElementById('fullscreenRelease');
        this.fullscreenDuration = document.getElementById('fullscreenDuration');
        this.fsPlayBtn = document.getElementById('fsPlayBtn');
        this.fsPrevBtn = document.getElementById('fsPrevBtn');
        this.fsNextBtn = document.getElementById('fsNextBtn');
        this.fsProgressBar = document.getElementById('fsProgressBar');
        this.fsProgressFill = document.getElementById('fsProgressFill');
        this.fsCurrentTime = document.getElementById('fsCurrentTime');
        this.fsTotalTime = document.getElementById('fsTotalTime');
        this.pulsesContainer = document.querySelector('.gentle-pulses-container');
        this.coverPulseContainer = document.querySelector('.cover-pulse-container');
        
        // Создаем элементы пульсаций для каждого инструмента
        this.createPulseElements();
    }

    createPulseElements() {
        // Создаем пульсации для каждого инструмента
        this.beatPulses = {
            drums: document.createElement('div'),
            bass: document.createElement('div'),
            synth: document.createElement('div'),
            vocal: document.createElement('div')
        };
        
        // Настраиваем стили для каждого инструмента
        Object.keys(this.beatPulses).forEach(instrument => {
            const pulse = this.beatPulses[instrument];
            pulse.className = `beat-pulse pulse-${instrument}`;
            this.coverPulseContainer.appendChild(pulse);
        });
    }

    setupAutoplay() {
        const unlockAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Создаем и воспроизводим тихий звук для разблокировки аудио
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start();
            
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
    }

    setupNavigation() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(sectionName) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        this.sections.forEach(section => section.classList.remove('active'));
        
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        document.getElementById(`${sectionName}-section`).classList.add('active');
    }

    setupAudioAnalyser() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.source = this.audioContext.createMediaElementSource(this.audio);
            
            // Настройки анализатора для точного определения битов
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            // Подключаем цепочку: источник -> анализатор -> выход
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            console.log('Audio analyser setup completed');
            
        } catch (error) {
            console.log('Audio context not supported:', error);
        }
    }

    startBeatDetection() {
        if (!this.analyser) return;
        
        const analyzeAudio = () => {
            if (!this.isPlaying) return;
            
            // Получаем данные частотного спектра
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Анализируем каждый инструмент
            this.analyzeInstrument('drums');
            this.analyzeInstrument('bass');
            this.analyzeInstrument('synth');
            this.analyzeInstrument('vocal');
            
            this.animationId = requestAnimationFrame(analyzeAudio);
        };
        
        this.animationId = requestAnimationFrame(analyzeAudio);
    }

    stopBeatDetection() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Анализ конкретного инструмента по частотному диапазону
    analyzeInstrument(instrument) {
        const range = this.frequencyRanges[instrument];
        const startFreq = this.frequencyToIndex(range.low);
        const endFreq = this.frequencyToIndex(range.high);
        
        let sum = 0;
        let count = 0;
        
        // Суммируем уровни в заданном частотном диапазоне
        for (let i = startFreq; i <= endFreq; i++) {
            sum += this.dataArray[i];
            count++;
        }
        
        if (count === 0) return;
        
        const average = sum / count;
        const normalized = average / 255;
        
        // Сохраняем историю уровней
        this.levelHistory[instrument].push(normalized);
        if (this.levelHistory[instrument].length > 10) {
            this.levelHistory[instrument].shift();
        }
        
        // Вычисляем динамический порог на основе истории
        const dynamicThreshold = this.calculateDynamicThreshold(instrument);
        
        // Если уровень превышает порог - активируем пульсацию
        if (normalized > dynamicThreshold && this.isSignificantPeak(instrument, normalized)) {
            this.triggerPulse(instrument, normalized);
        }
    }

    // Преобразование частоты в индекс массива
    frequencyToIndex(frequency) {
        if (!this.audioContext) return 0;
        const nyquist = this.audioContext.sampleRate / 2;
        return Math.round(frequency / nyquist * this.bufferLength);
    }

    // Вычисление динамического порога на основе истории уровней
    calculateDynamicThreshold(instrument) {
        const history = this.levelHistory[instrument];
        if (history.length === 0) return this.thresholds[instrument];
        
        const average = history.reduce((sum, val) => sum + val, 0) / history.length;
        const max = Math.max(...history);
        
        // Динамический порог = среднее + (максимум - среднее) * коэффициент
        return Math.max(this.thresholds[instrument], average + (max - average) * 0.3);
    }

    // Проверка, является ли пик значительным
    isSignificantPeak(instrument, currentLevel) {
        const history = this.levelHistory[instrument];
        if (history.length < 3) return true;
        
        // Пик значителен, если текущий уровень значительно выше предыдущих
        const recentAverage = history.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
        return currentLevel > recentAverage * 1.5;
    }

    // Активация пульсации для инструмента
    triggerPulse(instrument, intensity) {
        const pulseElement = this.beatPulses[instrument];
        if (!pulseElement) return;
        
        // Интенсивность влияет на параметры пульсации
        const scale = 0.8 + (intensity * 0.4);
        
        // Применяем стили в зависимости от интенсивности
        pulseElement.style.transform = `scale(${scale})`;
        
        // Активируем пульсацию
        pulseElement.classList.add('active');
        
        // Деактивируем после завершения анимации
        setTimeout(() => {
            pulseElement.classList.remove('active');
        }, this.getPulseDuration(instrument, intensity));
    }

    getPulseDuration(instrument, intensity) {
        // Длительность зависит от инструмента и интенсивности
        const baseDurations = {
            drums: 400,  // Короткие для барабанов
            bass: 600,   // Длиннее для баса
            synth: 500,  // Средние для синтезатора
            vocal: 700   // Самые длинные для вокала
        };
        
        return baseDurations[instrument] * (0.8 + intensity * 0.4);
    }

    setupEventListeners() {
        // Полноэкранный плеер
        this.closeFullscreenBtn.addEventListener('click', () => {
            this.closeFullscreenPlayer();
        });
        
        this.fsPlayBtn.addEventListener('click', () => this.togglePlay());
        this.fsPrevBtn.addEventListener('click', () => this.previousTrack());
        this.fsNextBtn.addEventListener('click', () => this.nextTrack());
        
        this.fsProgressBar.addEventListener('input', (e) => {
            if (this.audio.duration) {
                const value = parseFloat(e.target.value);
                this.audio.currentTime = value;
                this.fsProgressFill.style.width = `${(value / this.audio.duration) * 100}%`;
            }
        });

        // Аудио события
        this.audio.addEventListener('loadedmetadata', () => {
            this.fsProgressBar.max = this.audio.duration;
            this.fsTotalTime.textContent = this.formatTime(this.audio.duration);
        });

        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                this.fsProgressBar.value = this.audio.currentTime;
                if (this.fsProgressFill) {
                    this.fsProgressFill.style.width = `${progress}%`;
                }
                this.fsCurrentTime.textContent = this.formatTime(this.audio.currentTime);
            }
        });

        this.audio.addEventListener('ended', () => {
            this.nextTrackWithFade();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.fsPlayBtn.classList.add('playing');
            
            // Запускаем анализ аудио
            if (!this.audioContext) {
                this.setupAudioAnalyser();
            }
            
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.startBeatDetection();
            
            if (this.currentTrack) {
                this.playTracker.trackPlay(this.currentTrack.id);
                this.updatePlayCounts();
                this.updateTotalPlays();
            }
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.fsPlayBtn.classList.remove('playing');
            this.stopBeatDetection();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            alert('Ошибка загрузки аудио. Проверьте ссылку на файл.');
        });

        // Открытие полноэкранного плеера при клике на обложку в мини-плеере
        this.currentCover.addEventListener('click', () => {
            this.openFullscreenPlayer();
        });

        // Сборники и треки
        document.addEventListener('click', (e) => {
            if (e.target.closest('.collection-card')) {
                const card = e.target.closest('.collection-card');
                const collectionId = card.dataset.collection;
                this.openCollection(collectionId);
            }
            
            if (e.target.closest('.apple-style-track')) {
                const card = e.target.closest('.apple-style-track');
                const trackId = parseInt(card.dataset.trackId);
                const track = tracks.find(t => t.id === trackId);
                if (track) {
                    this.playTrack(track);
                }
            }
            
            if (e.target.closest('.track-player-play-btn')) {
                const btn = e.target.closest('.track-player-play-btn');
                const trackId = parseInt(btn.closest('.apple-style-track').dataset.trackId);
                const track = tracks.find(t => t.id === trackId);
                if (track) {
                    this.playTrack(track);
                }
            }
        });

        // Закрытие модального окна
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeCollection();
        });

        this.collectionModal.addEventListener('click', (e) => {
            if (e.target === this.collectionModal) {
                this.closeCollection();
            }
        });

        // Сортировка
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortTracks(e.target.value);
            });
        }

        // Защита
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's')) {
                e.preventDefault();
            }
        });

        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });
    }

    setupProtection() {
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                document.body.innerHTML = `
                    <div style="
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        font-size: 2rem; 
                        color: #8B5CF6;
                        background: #000;
                        font-family: system-ui;
                    ">
                        🎵 CAWERCAT
                    </div>
                `;
            }
        }, 1000);
    }

    renderCollections() {
        this.collectionsGrid.innerHTML = Object.entries(collections).map(([id, collection]) => {
            const collectionTracks = tracks.filter(track => 
                track.collection === id && track.released
            );
            
            return `
                <div class="collection-card" data-collection="${id}">
                    <div class="collection-cover" style="background: linear-gradient(135deg, ${collection.color}, ${this.lightenColor(collection.color, 20)})">
                        <div class="collection-overlay">
                            <h3>${collection.name}</h3>
                            <span class="track-count">${collectionTracks.length} треков</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTracks() {
        const releasedTracks = tracks.filter(track => track.released);
        
        this.tracksGrid.innerHTML = releasedTracks.map(track => {
            const plays = this.playTracker.getCount(track.id);
            const isCurrent = this.currentTrack && this.currentTrack.id === track.id;
            
            return `
                <div class="apple-style-track ${isCurrent && this.isPlaying ? 'playing' : ''}" data-track-id="${track.id}">
                    <div class="track-player-container">
                        <img src="${track.cover}" alt="${track.title}" class="track-player-cover" 
                             onerror="this.src='https://via.placeholder.com/70x70/1a237e/ffffff?text=🎵'">
                        <div class="track-player-info">
                            <div class="track-player-title">${track.title}</div>
                            <div class="track-player-artist">CAWERCAT</div>
                            <div class="track-player-release">release: ${track.releaseDate}</div>
                            <div class="track-plays">${plays} прослушиваний</div>
                        </div>
                        <div class="track-player-controls">
                            <button class="track-player-play-btn ${isCurrent && this.isPlaying ? 'playing' : ''}">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    ${isCurrent && this.isPlaying ? 
                                        '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' : 
                                        '<path fill="currentColor" d="M8 5v14l11-7z"/>'}
                                </svg>
                            </button>
                            <div class="track-player-duration">${track.duration}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    sortTracks(sortType) {
        const releasedTracks = tracks.filter(track => track.released);
        
        switch(sortType) {
            case 'newest':
                releasedTracks.sort((a, b) => b.id - a.id);
                break;
            case 'oldest':
                releasedTracks.sort((a, b) => a.id - b.id);
                break;
            case 'popular':
                releasedTracks.sort((a, b) => {
                    const playsA = this.playTracker.getCount(a.id);
                    const playsB = this.playTracker.getCount(b.id);
                    return playsB - playsA;
                });
                break;
        }
        
        this.tracksGrid.innerHTML = releasedTracks.map(track => {
            const plays = this.playTracker.getCount(track.id);
            const isCurrent = this.currentTrack && this.currentTrack.id === track.id;
            
            return `
                <div class="apple-style-track ${isCurrent && this.isPlaying ? 'playing' : ''}" data-track-id="${track.id}">
                    <div class="track-player-container">
                        <img src="${track.cover}" alt="${track.title}" class="track-player-cover"
                             onerror="this.src='https://via.placeholder.com/70x70/1a237e/ffffff?text=🎵'">
                        <div class="track-player-info">
                            <div class="track-player-title">${track.title}</div>
                            <div class="track-player-artist">CAWERCAT</div>
                            <div class="track-player-release">release: ${track.releaseDate}</div>
                            <div class="track-plays">${plays} прослушиваний</div>
                        </div>
                        <div class="track-player-controls">
                            <button class="track-player-play-btn ${isCurrent && this.isPlaying ? 'playing' : ''}">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    ${isCurrent && this.isPlaying ? 
                                        '<path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' : 
                                        '<path fill="currentColor" d="M8 5v14l11-7z"/>'}
                                </svg>
                            </button>
                            <div class="track-player-duration">${track.duration}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openCollection(collectionId) {
        const collection = collections[collectionId];
        const collectionTracks = tracks.filter(track => 
            track.collection === collectionId && track.released
        );

        this.modalTitle.textContent = collection.name;
        this.modalTracks.innerHTML = collectionTracks.map(track => {
            const plays = this.playTracker.getCount(track.id);
            
            return `
                <div class="modal-track" data-track-id="${track.id}">
                    <img src="${track.cover}" alt="${track.title}" class="modal-track-cover"
                         onerror="this.src='https://via.placeholder.com/40x40/1a237e/ffffff?text=🎵'">
                    <div class="modal-track-info">
                        <div class="modal-track-name">${track.title}</div>
                        <div class="modal-track-duration">${track.duration}</div>
                        <div class="track-plays">${plays} прослушиваний</div>
                    </div>
                </div>
            `;
        }).join('');

        this.modalTracks.querySelectorAll('.modal-track').forEach(trackEl => {
            trackEl.addEventListener('click', () => {
                const trackId = parseInt(trackEl.dataset.trackId);
                const track = tracks.find(t => t.id === trackId);
                if (track) {
                    this.playTrack(track);
                    this.closeCollection();
                }
            });
        });

        this.collectionModal.style.display = 'block';
    }

    closeCollection() {
        this.collectionModal.style.display = 'none';
    }

    // === ПОЛНОЭКРАННЫЙ ПЛЕЕР ===
    openFullscreenPlayer() {
        if (!this.currentTrack) return;
        
        this.fullscreenPlayer.classList.add('active');
        this.updateFullscreenPlayerInfo();
        this.startGentlePulses();
        
        // Обновляем прогресс
        if (this.audio.duration) {
            this.fsProgressBar.max = this.audio.duration;
            this.fsTotalTime.textContent = this.formatTime(this.audio.duration);
        }
    }

    closeFullscreenPlayer() {
        this.fullscreenPlayer.classList.remove('active');
        this.stopGentlePulses();
    }

    updateFullscreenPlayerInfo() {
        if (this.currentTrack) {
            this.fullscreenCover.src = this.currentTrack.cover;
            this.fullscreenTitle.textContent = this.currentTrack.title;
            this.fullscreenRelease.textContent = `release: ${this.currentTrack.releaseDate}`;
            this.fullscreenDuration.textContent = this.currentTrack.duration;
            
            // Обновляем состояние кнопки play/pause
            if (this.isPlaying) {
                this.fsPlayBtn.classList.add('playing');
            } else {
                this.fsPlayBtn.classList.remove('playing');
            }
        }
    }

    startGentlePulses() {
        this.stopGentlePulses();
        
        this.pulseInterval = setInterval(() => {
            this.createGentlePulse();
        }, 1200);
    }

    stopGentlePulses() {
        if (this.pulseInterval) {
            clearInterval(this.pulseInterval);
            this.pulseInterval = null;
        }
        
        this.pulsesContainer.innerHTML = '';
    }

    createGentlePulse() {
        const pulse = document.createElement('div');
        pulse.className = 'gentle-pulse';
        
        const x = 15 + Math.random() * 70;
        const y = 15 + Math.random() * 70;
        const size = 30 + Math.random() * 50;
        const delay = Math.random() * 0.5;
        
        pulse.style.cssText = `
            top: ${y}%;
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${delay}s;
        `;
        
        this.pulsesContainer.appendChild(pulse);
        
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        }, 2000);
    }

    // === ВОСПРОИЗВЕДЕНИЕ ТРЕКОВ ===
    playTrack(track) {
        if (this.isTransitioning) return;
        
        // Если кликаем на тот же трек - пауза/плей
        if (this.currentTrack && this.currentTrack.id === track.id) {
            this.togglePlay();
            return;
        }
        
        // Если уже играет другой трек - плавный переход
        if (this.currentTrack && this.isPlaying) {
            this.crossfadeToTrack(track);
        } else {
            // Просто запускаем новый трек
            this.loadTrack(track);
            this.audio.play().catch(error => {
                console.error('Playback failed:', error);
                alert('Не удалось воспроизвести трек. Проверьте подключение к интернету.');
            });
        }
        
        // Автоматически открываем полноэкранный плеер
        setTimeout(() => {
            this.openFullscreenPlayer();
        }, 300);
    }

    crossfadeToTrack(nextTrack) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        const currentVolume = this.audio.volume;
        const nextAudio = new Audio(nextTrack.audio);
        nextAudio.volume = 0;
        
        let startTime = Date.now();
        
        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.fadeDuration, 1);
            
            if (progress < 1) {
                this.audio.volume = Math.max(0, currentVolume - progress);
                nextAudio.volume = Math.min(1, progress);
            } else {
                clearInterval(fadeInterval);
                this.audio.pause();
                this.audio = nextAudio;
                this.setupNewAudioListeners();
                this.currentTrack = nextTrack;
                this.updatePlayerInfo();
                this.highlightCurrentTrack();
                this.updateFullscreenPlayerInfo();
                this.isTransitioning = false;
            }
        }, 50);
        
        nextAudio.play().catch(error => {
            console.error('Next track playback failed:', error);
            clearInterval(fadeInterval);
            this.isTransitioning = false;
        });
    }

    nextTrackWithFade() {
        if (!this.currentTrack || this.isTransitioning) return;
        
        const currentIndex = tracks.findIndex(t => t.id === this.currentTrack.id);
        let nextIndex = (currentIndex + 1) % tracks.length;
        
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[nextIndex];
            if (track.released) {
                this.crossfadeToTrack(track);
                return;
            }
            nextIndex = (nextIndex + 1) % tracks.length;
        }
    }

    setupNewAudioListeners() {
        const audio = this.audio;
        
        audio.addEventListener('loadedmetadata', () => {
            this.fsProgressBar.max = audio.duration;
            this.fsTotalTime.textContent = this.formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                this.fsProgressBar.value = audio.currentTime;
                if (this.fsProgressFill) {
                    this.fsProgressFill.style.width = `${progress}%`;
                }
                this.fsCurrentTime.textContent = this.formatTime(audio.currentTime);
            }
        });

        audio.addEventListener('ended', () => {
            this.nextTrackWithFade();
        });

        audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.fsPlayBtn.classList.add('playing');
            
            if (!this.audioContext) {
                this.setupAudioAnalyser();
            }
            
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.startBeatDetection();
            
            if (this.currentTrack) {
                this.playTracker.trackPlay(this.currentTrack.id);
                this.updatePlayCounts();
                this.updateTotalPlays();
            }
        });

        audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.fsPlayBtn.classList.remove('playing');
            this.stopBeatDetection();
        });
    }

    loadTrack(track) {
        this.audio.src = track.audio;
        this.audio.preload = 'auto';
        this.audio.volume = 1;
        this.currentTrack = track;
        this.updatePlayerInfo();
        this.highlightCurrentTrack();
    }

    togglePlay() {
        if (!this.currentTrack) {
            const firstTrack = tracks.find(track => track.released);
            if (firstTrack) {
                this.playTrack(firstTrack);
            }
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(error => {
                console.error('Resume playback failed:', error);
            });
        }
    }

    nextTrack() {
        if (!this.currentTrack || this.isTransitioning) return;
        
        const currentIndex = tracks.findIndex(t => t.id === this.currentTrack.id);
        let nextIndex = (currentIndex + 1) % tracks.length;
        
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[nextIndex];
            if (track.released) {
                this.playTrack(track);
                return;
            }
            nextIndex = (nextIndex + 1) % tracks.length;
        }
    }

    previousTrack() {
        if (!this.currentTrack || this.isTransitioning) return;
        
        const currentIndex = tracks.findIndex(t => t.id === this.currentTrack.id);
        let prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[prevIndex];
            if (track.released) {
                this.playTrack(track);
                return;
            }
            prevIndex = (prevIndex - 1 + tracks.length) % tracks.length;
        }
    }

    updatePlayerInfo() {
        if (this.currentTrack) {
            this.currentTitle.textContent = this.currentTrack.title;
            this.currentCover.src = this.currentTrack.cover;
            this.currentRelease.textContent = `release: ${this.currentTrack.releaseDate}`;
        }
    }

    highlightCurrentTrack() {
        document.querySelectorAll('.apple-style-track, .modal-track').forEach(el => {
            el.classList.remove('playing');
        });
        
        document.querySelectorAll('.track-player-play-btn').forEach(btn => {
            btn.classList.remove('playing');
        });
        
        if (this.currentTrack) {
            const currentCard = document.querySelector(`[data-track-id="${this.currentTrack.id}"]`);
            if (currentCard) {
                currentCard.classList.add('playing');
                const playBtn = currentCard.querySelector('.track-player-play-btn');
                if (playBtn) {
                    playBtn.classList.add('playing');
                }
            }
        }
    }

    updatePlayCounts() {
        document.querySelectorAll('.apple-style-track, .modal-track').forEach(el => {
            const trackId = parseInt(el.dataset.trackId);
            const plays = this.playTracker.getCount(trackId);
            let playsEl = el.querySelector('.track-plays');
            
            if (!playsEl) {
                playsEl = document.createElement('div');
                playsEl.className = 'track-plays';
                el.querySelector('.track-player-info, .modal-track-info').appendChild(playsEl);
            }
            
            playsEl.textContent = `${plays} прослушиваний`;
        });
    }

    updateTotalPlays() {
        const total = this.playTracker.getTotalPlays();
        this.totalPlays.textContent = total;
    }

    checkUpcomingRelease() {
        const now = new Date();
        const releaseDate = new Date(upcomingRelease.releaseDate);
        const preReleaseDate = new Date(upcomingRelease.preReleaseStart);
        
        if (now >= preReleaseDate && now < releaseDate) {
            this.showPreReleaseBanner();
        } else if (now >= releaseDate) {
            this.activateRelease();
        }
    }

    showPreReleaseBanner() {
        this.bannerCover.src = upcomingRelease.cover;
        this.bannerTitle.textContent = upcomingRelease.title;
        this.preReleaseBanner.style.display = 'block';
        this.startCountdown();
    }

    activateRelease() {
        this.preReleaseBanner.classList.add('released');
        
        if (!tracks.find(t => t.id === upcomingRelease.trackId)) {
            tracks.push({
                ...upcomingRelease,
                id: upcomingRelease.trackId,
                duration: "0:00",
                releaseDate: "24.12.25",
                collection: "demim",
                released: true
            });
            this.renderTracks();
            this.renderCollections();
            document.getElementById('totalTracks').textContent = tracks.filter(t => t.released).length;
        }

        setInterval(() => {
            this.preReleaseBanner.classList.toggle('pulse-glow');
        }, 2000);
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date();
            const distance = new Date(upcomingRelease.releaseDate) - now;
            
            if (distance < 0) {
                this.releaseCountdown.innerHTML = "<span>OUT NOW</span>";
                this.activateRelease();
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            
            const daysEl = this.releaseCountdown.querySelector('.days');
            const hoursEl = this.releaseCountdown.querySelector('.hours');
            const minutesEl = this.releaseCountdown.querySelector('.minutes');
            
            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        };
        
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new ModernMusicPlayer();
});