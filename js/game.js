const font = new FontFace('MyFont', 'url(./fonts/Myfont.ttf)');

font.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
}).catch(function(error) {
    console.error('Error loading font:', error);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Cargar la imagen del fondo
const backgroundImage = new Image();
backgroundImage.src = '/img/fondo.png';  // Ajusta la ruta del fondo

let backgroundY = 0;  // Posición inicial del fondo
const backgroundSpeed = 2;  // Velocidad del desplazamiento del fondo

// Actualizar la posición del fondo para crear el efecto de movimiento
function updateBackground() {
    backgroundY += backgroundSpeed;

    // Reinicia la posición cuando el fondo sale de la pantalla
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}

// Dibujar el fondo
function drawBackground() {
    // Dibujar el fondo dos veces para crear el bucle
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);
}

const scriptEnemies = document.createElement('script');
scriptEnemies.src = '/js/enemies.js';
document.head.appendChild(scriptEnemies);

// Cuando el script de enemigos se cargue, entonces cargamos shooting.js y finalmente ejecutamos el gameLoop
scriptEnemies.onload = function() {
    const script = document.createElement('script');
    script.src = '/js/shooting.js';
    script.onload = function() {
        gameLoop();  // Solo ejecutar gameLoop después de que ambos scripts se hayan cargado
    };
    document.head.appendChild(script);
};

let score = 950;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerSprite = new Image();
playerSprite.src = '/sprites/player_ship.png';  // Ruta de tu sprite

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    scale: 3,  // Factor de escala para el jugador
    width: 0,    // Inicializaremos esto cuando cargue el sprite
    height: 0,   // Lo mismo para la altura
    speed: 5,
    angle: 0,
    health: 100,
    maxHealth: 100
};

// Esperar a que cargue el sprite del jugador para ajustar las dimensiones
playerSprite.onload = function() {
    player.width = playerSprite.width * player.scale;
    player.height = playerSprite.height * player.scale;
};

function drawHealthBar() {
    const barWidth = 200;
    const barHeight = 20;
    const x = 20;
    const y = 20;

    ctx.fillStyle = 'gray';
    ctx.fillRect(x, y, barWidth, barHeight);

    const healthWidth = (player.health / player.maxHealth) * barWidth;
    ctx.fillStyle = 'cyan';
    ctx.fillRect(x, y, healthWidth, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px MyFont';
    ctx.fillText(`Score: ${score}`, 20, 65);
}

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

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

    // Limitar movimiento dentro de los bordes del canvas
    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > canvas.width - player.width / 2) player.x = canvas.width - player.width / 2;
    if (player.y < player.height / 2) player.y = player.height / 2;
    if (player.y > canvas.height - player.height / 2) player.y = canvas.height - player.height / 2;

    // Calcular el ángulo si se está moviendo
    if (moving) {
        player.angle = Math.atan2(keys.ArrowDown - keys.ArrowUp, keys.ArrowRight - keys.ArrowLeft);
    }
}

function checkCollisions() {
    enemies.forEach((enemy, index) => {
        // Verificar colisión con hitbox escalada (AABB)
        if (player.x < enemy.x + enemy.size &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.height > enemy.y) {

            if (enemy instanceof Boss) {
                // Rebote del jugador al chocar con el boss
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const reboundDistance = 50;
                player.x += Math.cos(angle) * reboundDistance;
                player.y += Math.sin(angle) * reboundDistance;
            } else {
                // Daño normal al jugador si choca con otros enemigos
                player.health -= enemy.damage;
                if (player.health < 0) player.health = 0;

                score -= 100;
                if (score < 0) score = 0;

                enemies.splice(index, 1); // Eliminar el enemigo tras colisionar
            }
        }
    });
}


function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Dibujar el sprite del jugador escalado
    ctx.drawImage(playerSprite, -player.width / 2, -player.height / 2, player.width, player.height);

    // Dibujar la hitbox del jugador (escalada)
    ctx.strokeStyle = 'violet';
    ctx.lineWidth = 1;
    ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);

    ctx.restore();
}


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Actualizar y dibujar el fondo
    updateBackground();
    drawBackground();

    updatePlayer();
    updateBullets();
    updateEnemyBullets();
    drawPlayer();
    drawHealthBar();
    drawScore();

    // Revisamos si el jefe está activo o no
    if (!bossActive) {
        spawnEnemies(score);  // Solo spawn de enemigos si no hay jefe
    } else {
        spawnMeteorites();  // Meteoritos siguen apareciendo con el jefe activo
    }

    updateEnemies(ctx);
    checkCollisions();
    checkBulletEnemyCollisions();
    checkEnemyBulletPlayerCollisions();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
