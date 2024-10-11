// audio.js
const audioFiles = [
    '/audio/music/song2.mp3',
    '/audio/music/song3.mp3',
    '/audio/music/song4.mp3'
];

let audioElement = new Audio();
let currentTrackIndex = -1;  // Esto se inicializa en -1 para seleccionar el primer archivo aleatoriamente

// Función para reproducir una pista aleatoria
function playRandomTrack() {
    // Elegir un archivo aleatorio
    const randomIndex = Math.floor(Math.random() * audioFiles.length);

    // Cambiar la fuente del archivo de audio
    audioElement.src = audioFiles[randomIndex];

    // Reproducir la canción seleccionada
    audioElement.play().catch(error => {
        console.error('Error al reproducir el audio:', error);
    });

    // Cuando termine la canción, reproducir otra aleatoriamente
    audioElement.onended = function () {
        playRandomTrack();
    };
}

// Función para ajustar el volumen
function setVolume(volume) {
    // Asegurarse de que el valor esté entre 0 y 1
    audioElement.volume = Math.max(0, Math.min(1, volume));
}

// Función para ajustar la velocidad de reproducción
function setPlaybackSpeed(speed) {
    // Asegurarse de que el valor esté entre 0.5 y 2
    audioElement.playbackRate = Math.max(0.5, Math.min(2, speed));
}

// Esperar a que el usuario interactúe con la página
function enableAudioOnUserInteraction() {
    // Detectar la primera interacción (click o toque) y comenzar la música
    document.body.addEventListener('click', function playMusic() {
        playRandomTrack();  // Inicia la música aleatoria
        document.body.removeEventListener('click', playMusic);  // Quita el evento después de la primera interacción
    });
}

// Comenzar la reproducción cuando el usuario interactúe
document.addEventListener('DOMContentLoaded', function () {
    enableAudioOnUserInteraction();  // Espera la interacción del usuario
});

// Ejemplo de cómo puedes ajustar el volumen y la velocidad:
setVolume(0.05);
