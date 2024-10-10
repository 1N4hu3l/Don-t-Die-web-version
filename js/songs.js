const songs = [
    '/audio/music/song1.mp3',
    '/audio/music/song2.mp3',
    '/audio/music/song3.mp3',
    '/audio/music/song4.mp3',
];

const backgroundMusic = document.getElementById('backgroundMusic');
backgroundMusic.volume = 0.5;  // Ajusta el volumen si es necesario
backgroundMusic.playbackRate = 1; // Ajusta la velocidad de reproducción

// Función para seleccionar una canción aleatoria
function playRandomSong() {
    const randomIndex = Math.floor(Math.random() * songs.length);
    backgroundMusic.src = songs[randomIndex];
    backgroundMusic.play().catch(error => {
        console.error('Error al reproducir la canción:', error);
        playRandomSong(); // Intenta reproducir otra canción si hay un error
    });
}

// Escuchar el evento 'ended' para reproducir una nueva canción
backgroundMusic.addEventListener('ended', playRandomSong);

// Iniciar la reproducción con una canción aleatoria
playRandomSong();
