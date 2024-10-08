const font = new FontFace('MyFont', 'url(./fonts/Myfont.ttf)');

font.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
}).catch(function(error) {
    console.error('Error loading font:', error);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const script = document.createElement('script');
script.src = '/js/shooting.js';
script.onload = function() {
    // Iniciar el juego solo cuando el script de balas se haya cargado
    gameLoop();
};
document.head.appendChild(script);


let score = 0; // Inicializar la puntuación


// ajustar canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuración del jugador
const player = {
    x: canvas.width / 2, // Comienza en el centro
    y: canvas.height / 2,
    size: 20, // Tamaño del jugador 
    speed: 5, // Velocidad de movimiento
    angle: 0, // Ángulo de rotación
    color: 'white',
    maxHealth: 100, // Vida máxima del jugador
    health: 100 // Vida actual del jugador
};

//barra de vida
function drawHealthBar() {
    const barWidth = 200; // Ancho total de la barra de vida
    const barHeight = 20; // Altura de la barra de vida
    const x = 20; // Posición en X (esquina superior izquierda)
    const y = 20; // Posición en Y (esquina superior izquierda)

    // Fondo de la barra (gris)
    ctx.fillStyle = 'gray';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Parte de la barra que representa la vida restante (verde)
    const healthWidth = (player.health / player.maxHealth) * barWidth;
    ctx.fillStyle = 'cyan';
    ctx.fillRect(x, y, healthWidth, barHeight);

    // Bordes de la barra
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
        player.health -= 10; // Reduce la vida del jugador
        if (player.health < 0) player.health = 0; // No permitir que la vida sea negativa
    }
});

function drawScore() {
    ctx.fillStyle = 'white'; // Color del texto
    ctx.font = '20px MyFont'; // Fuente y tamaño del texto
    ctx.fillText(`Score: ${score}`, 20, 60); // Dibuja la puntuación en la posición (20, 50)
}


window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const currentTime = Date.now();
        if (currentTime - lastShotTime >= shootCooldown) {
            const bullet = new Bullet(player.x, player.y, player.angle);
            bullets.push(bullet);
            lastShotTime = currentTime;
            score += 10; // Aumentar la puntuación al disparar
        }
    }
});

// Variables de control de movimiento
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Escuchar eventos de teclado
window.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

// Actualizar la posición del jugador y su rotación
function updatePlayer() {
    let moving = false;

    if (keys.ArrowUp) {
        player.y -= player.speed;
        moving = true;
    }
    if (keys.ArrowDown) {
        player.y += player.speed;
        moving = true;
    }
    if (keys.ArrowLeft) {
        player.x -= player.speed;
        moving = true;
    }
    if (keys.ArrowRight) {
        player.x += player.speed;
        moving = true;
    }

    // Restringir al jugador dentro de los límites del canvas
    if (player.x < player.size) player.x = player.size;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < player.size) player.y = player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;

    // Cambiar el ángulo de rotación según la dirección de movimiento
    if (moving) {
        player.angle = Math.atan2(keys.ArrowDown - keys.ArrowUp, keys.ArrowRight - keys.ArrowLeft);
    }
}

// Dibujar al jugador en el canvas
function drawPlayer() {
    ctx.save(); // Guardar el estado actual del contexto
    ctx.translate(player.x, player.y); // Mover el punto de origen al centro del jugador
    ctx.rotate(player.angle); // Rotar el contexto en el ángulo del jugador
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size); // Dibujar el jugador
    ctx.restore(); // Restaurar el contexto al estado original
}

// Bucle principal del juego
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    updatePlayer(); // Actualizar el jugador
    updateBullets(); // Actualizar balas
    drawPlayer(); // Dibujar al jugador
    drawHealthBar(); // Dibujar la barra de vida
    drawScore();
    requestAnimationFrame(gameLoop); // Continuar el ciclo del juego
}

// Ajustar el tamaño del canvas al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});