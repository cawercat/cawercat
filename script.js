// Конфигурация - Обновлены цвета для соответствия новой теме
const collections = {
    demim: {
        name: "Last Release",
        tracks: [1, 2, 4, 5, 6],
        // Используем неоновый цвет, соответствующий дизайну
        color: "#00FFFF", 
        description: "EXP // INITIALIZATION LOG"
    },
    new_archive: {
        name: "NEW",
        tracks: [7, 8],
        color: "#FF00FF", // Используем другой неоновый цвет
        description: "LOGS // NEW MELODY (09.11)"
    }
};

const tracks = [
    {
        id: 1,
        title: "LOG // NOT FOUND",
        cover: "img/1.png",
        audio: "mu/not.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 2,
        title: "LOG // RELAX SEQUENCE",
        cover: "img/black.png",
        audio: "mu/relax.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 3,
        title: "LOG // IDK SYSTEM FAILURE",
        cover: "img/1.png",
        audio: "mu/Project_21.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "new_archive",
        released: true
    },		
    {
        id: 4,
        title: "LOG // NEW PROTOCOL 1",
        cover: "img/1.png",
        audio: "mu/new1.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 5,
        title: "LOG // SEQUENCE 5.1",
        cover: "img/1.png",
        audio: "mu/new2.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 6,
        title: "LOG // EXPIRED CODE",
        cover: "img/1.png",
        audio: "mu/new3.mp3",
        duration: "0:00",
        releaseDate: "06.11.25",
        collection: "demim",
        released: true
    },
    {
        id: 7,
        title: "NEW // L,On9mOi8J ",
        cover: "img/1.png",
        audio: "mu/Project_11.mp3",
        duration: "0:00",
        releaseDate: "09.11.26",
        collection: "new_archive",
        released: true
    },
    {
        id: 8,
        title: "LOG // Q4 SOON",
        cover: "img/1.png",
        audio: "mu/new5.mp3",
        duration: "0:00",
        releaseDate: "11.11.25",
        collection: "new_archive",
        released: false
    }
];

// Класс для управления всем приложением
class MusicPlayerApp {
    constructor() {
        this.audio = new Audio();
        this.currentTrackIndex = -1;
        this.currentPlaylist = tracks.filter(t => t.released); // Начальный плейлист - только выпущенные треки
        this.isPlaying = false;
        this.isShuffling = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        
        // --- DOM Elements (Обновлены для соответствия HTML) ---
        
        // Секции
        this.tracksList = document.getElementById('tracksList');
        this.collectionsGrid = document.getElementById('collectionsGrid');
        this.totalTracksEl = document.getElementById('totalTracks');
        this.releaseCountdown = document.getElementById('releaseCountdown');

        // Мини-плеер (Футер)
        this.playerContainer = document.getElementById('playerContainer');
        this.playerCover = document.getElementById('playerCover');
        this.playerTitle = document.getElementById('playerTitle');
        this.playerPlayBtn = document.getElementById('playerPlayBtn');
        this.playerPrevBtn = document.getElementById('playerPrevBtn');
        this.playerNextBtn = document.getElementById('playerNextBtn');
        this.playerProgressBar = document.getElementById('playerProgressBar');
        this.playerProgressFill = document.getElementById('playerProgressFill');
        this.playerCurrentTime = document.getElementById('playerCurrentTime');
        this.playerTotalTime = document.getElementById('playerTotalTime');
        this.openFullscreenBtn = document.getElementById('openFullscreenBtn');

        // Полноэкранный плеер
        this.fullscreenPlayer = document.getElementById('fullscreenPlayer');
        this.closeFullscreenBtn = document.getElementById('closeFullscreenBtn');
        this.fsCover = document.getElementById('fsCover');
        this.fsTitle = document.getElementById('fsTitle');
        this.fsPlayBtn = document.getElementById('fsPlayBtn');
        this.fsPrevBtn = document.getElementById('fsPrevBtn');
        this.fsNextBtn = document.getElementById('fsNextBtn');
        this.fsProgressBar = document.getElementById('fsProgressBar');
        this.fsProgressFill = document.getElementById('fsProgressFill');
        this.fsCurrentTime = document.getElementById('fsCurrentTime');
        this.fsTotalTime = document.getElementById('fsTotalTime');
        this.fsShuffleBtn = document.getElementById('fsShuffleBtn');
        this.fsRepeatBtn = document.getElementById('fsRepeatBtn');

        // Модальное окно
        this.collectionModal = document.getElementById('collectionModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalTracks = document.getElementById('modalTracks');
        this.closeModalBtn = this.collectionModal.querySelector('.close-modal');

        this.init();
    }

    init() {
        this.renderTracks();
        this.renderCollections();
        this.setupEventListeners();
        this.updateTotalTracksCount();
        this.startCountdownTimer('11/11/2025 00:00:00'); 
    }
    
    // --- Утилиты ---

    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Функция для осветления цвета (используется для динамических стилей, если нужно)
    lightenColor(color, percent) {
        // ... (функция осветления остается прежней)
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
    
    // Функция для установки цвета, если это необходимо
    setAccentColor(color) {
        // В новой "андерграунд" теме мы минимизируем изменение всего сайта,
        // но можем подкрасить прогресс-бар в цвет коллекции, если нужно.
        // Здесь оставляем функцию на случай будущих изменений, но в CSS жестко заданы неоновые цвета.
        document.documentElement.style.setProperty('--track-accent-color', color);
    }
    
    // --- Рендеринг ---
    
    renderTracks() {
        this.tracksList.innerHTML = '';
        tracks.forEach((track, index) => {
            const trackEl = document.createElement('div');
            const collectionData = collections[track.collection] || { name: 'UNKNOWN' };
            const isReleased = track.released;
            
            trackEl.classList.add('track-item');
            if (!isReleased) {
                trackEl.classList.add('track-released-false');
            }
            trackEl.dataset.id = track.id;
            
            trackEl.innerHTML = `
                <span class="track-index">${track.id.toString().padStart(2, '0')}</span>
                <div class="track-cover" style="background-image: url('${track.cover}')"></div>
                <div class="track-details">
                    <span class="track-title">${track.title}</span>
                    <span class="track-artist">${collectionData.name} // CAWERCAT</span>
                </div>
                <span class="track-duration">${isReleased ? track.duration : '0:00'}</span>
                <span class="track-release">${isReleased ? 'ONLINE' : track.releaseDate}</span>
            `;

            if (isReleased) {
                trackEl.addEventListener('click', () => this.loadTrack(track.id));
            } else {
                trackEl.title = `Access denied. Release: ${track.releaseDate}`;
            }
            
            this.tracksList.appendChild(trackEl);
        });
        
        this.trackElements = document.querySelectorAll('.track-item');
    }

    renderCollections() {
        this.collectionsGrid.innerHTML = '';
        Object.entries(collections).forEach(([key, collection]) => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('collection-card');
            cardEl.dataset.key = key;

            cardEl.innerHTML = `
                <div class="collection-title" style="color: ${collection.color};">${collection.name}</div>
                <div class="collection-desc">${collection.description}</div>
            `;
            
            cardEl.addEventListener('click', () => this.openCollectionModal(key));
            this.collectionsGrid.appendChild(cardEl);
        });
    }

    updateTotalTracksCount() {
        this.totalTracksEl.textContent = tracks.length.toString().padStart(2, '0');
    }
    
    // --- Плеер. Загрузка и управление ---

    loadTrack(trackId) {
        const track = tracks.find(t => t.id === trackId);
        if (!track || !track.released) return;

        const trackIndexInPlaylist = this.currentPlaylist.findIndex(t => t.id === trackId);
        if (trackIndexInPlaylist === -1) {
             // Если трек не в текущем плейлисте, возможно, нужно обновить плейлист
             this.currentPlaylist = tracks.filter(t => t.released);
             this.currentTrackIndex = this.currentPlaylist.findIndex(t => t.id === trackId);
        } else {
             this.currentTrackIndex = trackIndexInPlaylist;
        }

        this.audio.src = track.audio;
        this.updatePlayerInfo(track);
        this.playTrack();
        this.updateActiveTrackHighlight(trackId);
    }
    
    updatePlayerInfo(track) {
        const collection = collections[track.collection] || { name: 'UNKNOWN' };
        
        // Мини-плеер
        this.playerTitle.textContent = track.title;
        this.playerCover.style.backgroundImage = `url('${track.cover}')`;
        // Полноэкранный плеер
        this.fsTitle.textContent = track.title;
        this.fsCover.style.backgroundImage = `url('${track.cover}')`;
        this.playerContainer.style.display = 'flex';
        
        // Обновляем общий тайминг (нужно получить после загрузки метаданных)
        this.audio.onloadedmetadata = () => {
            this.playerTotalTime.textContent = this.formatTime(this.audio.duration);
            this.fsTotalTime.textContent = this.formatTime(this.audio.duration);
            // Если длительность в данных была "0:00", обновляем ее
            const trackData = tracks.find(t => t.id === track.id);
            if (trackData.duration === "0:00") {
                trackData.duration = this.formatTime(this.audio.duration);
                // Перерисовываем список треков, чтобы обновить длительность
                this.renderTracks();
                this.updateActiveTrackHighlight(track.id); // Восстанавливаем выделение
            }
        };
    }

    playTrack() {
        if (this.audio.src) {
            this.audio.play().catch(e => console.error("Play failed:", e));
            this.isPlaying = true;
            this.playerPlayBtn.classList.add('playing');
            this.fsPlayBtn.classList.add('playing');
        }
    }

    pauseTrack() {
        this.audio.pause();
        this.isPlaying = false;
        this.playerPlayBtn.classList.remove('playing');
        this.fsPlayBtn.classList.remove('playing');
    }
    
    togglePlayPause() {
        if (this.currentTrackIndex === -1) {
            // Если ничего не выбрано, загружаем первый трек
            const firstTrack = this.currentPlaylist[0];
            if (firstTrack) this.loadTrack(firstTrack.id);
            return;
        }
        
        if (this.isPlaying) {
            this.pauseTrack();
        } else {
            this.playTrack();
        }
    }

    playNext() {
        if (this.currentPlaylist.length === 0) return;
        
        if (this.isShuffling) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.currentPlaylist.length);
            } while (nextIndex === this.currentTrackIndex);
            this.currentTrackIndex = nextIndex;
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        }
        
        this.loadTrack(this.currentPlaylist[this.currentTrackIndex].id);
    }
    
    playPrev() {
        if (this.currentPlaylist.length === 0) return;
        
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0; // Начать заново, если проиграно > 3 сек
            return;
        }
        
        let prevIndex = this.currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.currentPlaylist.length - 1; // Зацикливание назад
        }
        this.currentTrackIndex = prevIndex;
        this.loadTrack(this.currentPlaylist[this.currentTrackIndex].id);
    }
    
    updateActiveTrackHighlight(currentTrackId) {
        this.trackElements.forEach(el => {
            el.classList.remove('active');
            if (parseInt(el.dataset.id) === currentTrackId) {
                el.classList.add('active');
            }
        });
    }

    // --- Обработчики событий ---

    setupEventListeners() {
        // Управление воспроизведением
        this.playerPlayBtn.addEventListener('click', () => this.togglePlayPause());
        this.fsPlayBtn.addEventListener('click', () => this.togglePlayPause());
        this.playerNextBtn.addEventListener('click', () => this.playNext());
        this.fsNextBtn.addEventListener('click', () => this.playNext());
        this.playerPrevBtn.addEventListener('click', () => this.playPrev());
        this.fsPrevBtn.addEventListener('click', () => this.playPrev());

        // Прогресс-бар (мини-плеер)
        this.playerProgressBar.addEventListener('input', () => this.seek(this.playerProgressBar.value));
        this.playerProgressBar.addEventListener('change', () => this.seek(this.playerProgressBar.value));
        
        // Прогресс-бар (полноэкранный)
        this.fsProgressBar.addEventListener('input', () => this.seek(this.fsProgressBar.value, true));
        this.fsProgressBar.addEventListener('change', () => this.seek(this.fsProgressBar.value, true));

        // Открытие/Закрытие полноэкранного плеера
        this.openFullscreenBtn.addEventListener('click', () => this.fullscreenPlayer.classList.add('open'));
        this.closeFullscreenBtn.addEventListener('click', () => this.fullscreenPlayer.classList.remove('open'));
        
        // Открытие/Закрытие модального окна
        this.closeModalBtn.addEventListener('click', () => this.collectionModal.classList.remove('open'));

        // События аудио
        this.audio.ontimeupdate = () => this.updateProgress();
        this.audio.onended = () => this.handleTrackEnd();
        
        // Кнопки полноэкранного плеера
        this.fsShuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.fsRepeatBtn.addEventListener('click', () => this.toggleRepeat());
    }
    
    seek(value, isFullscreen = false) {
        const time = (this.audio.duration / 100) * value;
        this.audio.currentTime = time;
        
        // Обновляем ползунки и полосы заполнения в реальном времени
        const progressFill = isFullscreen ? this.fsProgressFill : this.playerProgressFill;
        const progressBar = isFullscreen ? this.fsProgressBar : this.playerProgressBar;
        
        progressFill.style.width = `${value}%`;
        progressBar.value = value;
    }
    
    updateProgress() {
        if (this.audio.duration) {
            const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
            
            // Мини-плеер
            this.playerProgressFill.style.width = `${progressPercent}%`;
            this.playerProgressBar.value = progressPercent;
            this.playerCurrentTime.textContent = this.formatTime(this.audio.currentTime);

            // Полноэкранный плеер
            this.fsProgressFill.style.width = `${progressPercent}%`;
            this.fsProgressBar.value = progressPercent;
            this.fsCurrentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.playTrack();
        } else if (this.repeatMode === 'all' || this.isShuffling) {
            this.playNext();
        } else {
            this.pauseTrack();
            this.currentTrackIndex = -1;
            this.updateActiveTrackHighlight(null);
        }
    }
    
    toggleShuffle() {
        this.isShuffling = !this.isShuffling;
        this.fsShuffleBtn.classList.toggle('active', this.isShuffling);
        
        // Визуальное изменение для андерграунд стиля
        this.fsShuffleBtn.style.borderColor = this.isShuffling ? '#FF00FF' : 'var(--text-primary)';
        this.fsShuffleBtn.style.color = this.isShuffling ? '#FF00FF' : 'var(--text-primary)';
    }

    toggleRepeat() {
        switch (this.repeatMode) {
            case 'none':
                this.repeatMode = 'all';
                break;
            case 'all':
                this.repeatMode = 'one';
                break;
            case 'one':
                this.repeatMode = 'none';
                break;
        }

        const iconPath = this.fsRepeatBtn.querySelector('svg path');
        
        // Обновление иконки и стиля
        let color = 'var(--text-primary)';
        let pathD = 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v3z'; // Иконка повтора
        
        if (this.repeatMode === 'all') {
            color = '#00FFFF';
        } else if (this.repeatMode === 'one') {
            color = '#FF00FF';
            pathD = 'M13 15h2v4h-2zm-6-4h2v4H7zm0 8h10v-3l4 4-4 4v-3H5V9h2v10zM17 7H7V4l-4 4 4 4V9h10v4l4-4-4-4v3z'; // Иконка повтора одного
        }
        
        iconPath.setAttribute('d', pathD);
        this.fsRepeatBtn.style.borderColor = color;
        this.fsRepeatBtn.style.color = color;
    }
    
    // --- Модальное окно для коллекций ---
    
    openCollectionModal(collectionKey) {
        const collection = collections[collectionKey];
        if (!collection) return;
        
        this.modalTitle.textContent = collection.name.toUpperCase() + ' // ' + collection.description.toUpperCase();
        this.modalTracks.innerHTML = '';
        
        const trackIds = collection.tracks;
        trackIds.forEach(id => {
            const track = tracks.find(t => t.id === id);
            if (!track) return;

            const isReleased = track.released;
            const trackEl = document.createElement('div');
            trackEl.classList.add('track-item'); // Используем общий класс стиля трека
            trackEl.classList.add('modal-track-item');
            if (!isReleased) {
                trackEl.classList.add('track-released-false');
            }
            
            trackEl.innerHTML = `
                <span class="track-index">${track.id.toString().padStart(2, '0')}</span>
                <div class="track-cover" style="background-image: url('${track.cover}')"></div>
                <div class="track-details">
                    <span class="track-title">${track.title}</span>
                    <span class="track-artist">CAWERCAT</span>
                </div>
                <span class="track-duration">${isReleased ? track.duration : 'N/A'}</span>
            `;
            
            if (isReleased) {
                trackEl.addEventListener('click', () => {
                    this.loadTrack(track.id);
                    this.collectionModal.classList.remove('open');
                });
            } else {
                 trackEl.title = `Access denied. Release: ${track.releaseDate}`;
            }

            this.modalTracks.appendChild(trackEl);
        });
        
        this.collectionModal.classList.add('open');
    }
    
    // --- Таймер Обратного Отсчета ---
    
    startCountdownTimer(releaseDateString) {
        const releaseDate = new Date(releaseDateString).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = releaseDate - now;

            if (distance < 0) {
                this.releaseCountdown.innerHTML = '<div class="countdown-item"><span class="countdown-number" style="font-size: 1.5rem;">RELEASE ACTIVATED // FULL ACCESS</span></div>';
                clearInterval(this.countdownInterval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.releaseCountdown.innerHTML = `
                <div class="countdown-item"><span class="countdown-number days">${days.toString().padStart(2, '0')}</span><span class="countdown-label">DAYS</span></div>
                <div class="countdown-item"><span class="countdown-number hours">${hours.toString().padStart(2, '0')}</span><span class="countdown-label">HOURS</span></div>
                <div class="countdown-item"><span class="countdown-number minutes">${minutes.toString().padStart(2, '0')}</span><span class="countdown-label">MINUTES</span></div>
                <div class="countdown-item"><span class="countdown-number seconds">${seconds.toString().padStart(2, '0')}</span><span class="countdown-label">SECONDS</span></div>
            `;
        };
        
        this.countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }
}

// Запуск приложения после загрузки DOM
window.onload = function() {
    new MusicPlayerApp();
};