// Конфигурация
const collections = {
    demim: {
        name: "WELCOME",
        tracks: [1, 2, 4, 5, 6],
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
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 2,
        title: "relax",
        cover: "img/black.png",
        audio: "mu/relax.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 4,
        title: "Track 1",
        cover: "img/1.png",
        audio: "mu/new1.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 5,
        title: "Track 2",
        cover: "img/1.png",
        audio: "mu/new2.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },	
    {
        id: 6,
        title: "Track 3",
        cover: "img/1.png",
        audio: "mu/new3.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    }		
];

const upcomingRelease = {
    trackId: 3,
    title: "idk",
    cover: "img/1.png",
    audio: "mu/Project_21.mp3",
    releaseDate: "2025-11-10T00:00:00",
    preReleaseStart: "2024-12-20T00:00:00"
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
        
        // Оптимизация: кэш длительностей треков
        this.durationCache = new Map();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupNavigation();
        this.preloadDurations().then(() => {
            this.renderCollections();
            this.renderTracks();
            this.checkUpcomingRelease();
            this.updateTotalPlays();
            document.getElementById('totalTracks').textContent = tracks.filter(t => t.released).length;
        });
        
        this.setupProtection();
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
    }

    async preloadDurations() {
        // Предзагрузка длительностей треков без блокировки интерфейса
        const promises = tracks.map(track => this.getTrackDuration(track));
        await Promise.allSettled(promises);
    }

    async getTrackDuration(track) {
        if (this.durationCache.has(track.id)) {
            return this.durationCache.get(track.id);
        }

        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'metadata';
            
            const timeout = setTimeout(() => {
                audio.removeEventListener('loadedmetadata', loadedHandler);
                track.duration = "3:44";
                this.durationCache.set(track.id, track.duration);
                resolve(track.duration);
            }, 2000);

            const loadedHandler = () => {
                clearTimeout(timeout);
                if (audio.duration && isFinite(audio.duration)) {
                    track.duration = this.formatTime(audio.duration);
                } else {
                    track.duration = "3:44";
                }
                this.durationCache.set(track.id, track.duration);
                resolve(track.duration);
                audio.remove();
            };

            audio.addEventListener('loadedmetadata', loadedHandler);
            audio.addEventListener('error', () => {
                clearTimeout(timeout);
                track.duration = "3:44";
                this.durationCache.set(track.id, track.duration);
                resolve(track.duration);
                audio.remove();
            });

            audio.src = track.audio;
        });
    }

    setupAutoplay() {
        const unlockAudio = () => {
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

    setupEventListeners() {
        // Делегирование событий для оптимизации
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
            this.nextTrack();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.fsPlayBtn.classList.add('playing');
            
            if (this.currentTrack) {
                this.playTracker.trackPlay(this.currentTrack.id);
                this.updatePlayCounts();
                this.updateTotalPlays();
            }
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.fsPlayBtn.classList.remove('playing');
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });

        // Открытие полноэкранного плеера при клике на обложку в мини-плеере
        this.currentCover.addEventListener('click', () => {
            this.openFullscreenPlayer();
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
        }, 3000);
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
                             loading="lazy" onerror="this.src='img/1.png'">
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
                             loading="lazy" onerror="this.src='img/1.png'">
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
                         loading="lazy" onerror="this.src='img/1.png'">
                    <div class="modal-track-info">
                        <div class="modal-track-name">${track.title}</div>
                        <div class="modal-track-duration">${track.duration}</div>
                        <div class="track-plays">${plays} прослушиваний</div>
                    </div>
                </div>
            `;
        }).join('');

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
        
        if (this.audio.duration) {
            this.fsProgressBar.max = this.audio.duration;
            this.fsTotalTime.textContent = this.formatTime(this.audio.duration);
        }
    }

    closeFullscreenPlayer() {
        this.fullscreenPlayer.classList.remove('active');
    }

    updateFullscreenPlayerInfo() {
        if (this.currentTrack) {
            this.fullscreenCover.src = this.currentTrack.cover;
            this.fullscreenTitle.textContent = this.currentTrack.title;
            this.fullscreenRelease.textContent = `release: ${this.currentTrack.releaseDate}`;
            this.fullscreenDuration.textContent = this.currentTrack.duration;
            
            if (this.isPlaying) {
                this.fsPlayBtn.classList.add('playing');
            } else {
                this.fsPlayBtn.classList.remove('playing');
            }
        }
    }

    // === ВОСПРОИЗВЕДЕНИЕ ТРЕКОВ ===
    playTrack(track) {
        if (this.isTransitioning) return;
        
        if (this.currentTrack && this.currentTrack.id === track.id) {
            this.togglePlay();
            return;
        }
        
        this.loadTrack(track);
        this.audio.play().catch(error => {
            console.error('Playback failed:', error);
        });
        
        setTimeout(() => {
            this.openFullscreenPlayer();
        }, 300);
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
        if (!this.currentTrack) return;
        
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
        if (!this.currentTrack) return;
        
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