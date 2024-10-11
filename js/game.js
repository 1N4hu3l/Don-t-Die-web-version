const font = new FontFace('MyCustomFont', 'url(./fonts/Myfont.ttf)');

font.load().then(function (loadedFont) {
    document.fonts.add(loadedFont);
}).catch(function (error) {
    console.error('Error loading font:', error);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Obtener las pantallas de menú, game over y los modales
const menuScreen = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOver');
const scoreDisplay = document.getElementById('scoreDisplay');
const rulesModal = document.getElementById('rulesModal');
const whyModal = document.getElementById('whyModal');

// Botones
document.getElementById('playButton').addEventListener('click', startGame);
document.getElementById('menuButton').addEventListener('click', showMenu);
document.getElementById('retryButton').addEventListener('click', retryGame);
document.getElementById('rulesButton').addEventListener('click', showRulesModal);
document.getElementById('whyButton').addEventListener('click', showWhyModal);

// Botones para cerrar los modales
document.getElementById('closeRulesButton').addEventListener('click', closeRulesModal);
document.getElementById('closeWhyButton').addEventListener('click', closeWhyModal);

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
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);
}

// Animar el fondo en el menú
function animateMenuBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar y dibujar el fondo
    updateBackground();
    drawBackground();

    // Generar meteoritos/enemigos de fondo
    updateMenuEnemies();

    if (gameOver || menuScreen.style.display === 'block') {
        requestAnimationFrame(animateMenuBackground);  // Seguir animando si estamos en el menú o game over
    }
}

// Lista de meteoritos/enemigos en el fondo del menú
let menuEnemies = [];

function spawnMenuEnemies() {
    const meteorite = new Meteorite();  // Usamos la clase de Meteorito ya creada
    menuEnemies.push(meteorite);
}

function updateMenuEnemies() {
    menuEnemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw(ctx);
        if (enemy.outOfBounds()) {
            menuEnemies.splice(index, 1);  // Eliminar los meteoritos que salgan de la pantalla
        }
    });

    // Añadir un meteorito cada pocos segundos
    if (Math.random() < 0.01) {  // Ajusta la probabilidad de aparición
        spawnMenuEnemies();
    }
}

const scriptEnemies = document.createElement('script');
scriptEnemies.src = '/js/enemies.js';
document.head.appendChild(scriptEnemies);

scriptEnemies.onload = function () {
    const script = document.createElement('script');
    script.src = '/js/shooting.js';
    script.onload = function () {
        showMenu();  // Mostrar el menú principal al cargar los scripts
    };
    document.head.appendChild(script);
};

let score = 0;
let gameOver = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerSprite = new Image();
playerSprite.src = '/sprites/player_ship.png';  // Ruta de tu sprite

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    scale: 3,
    width: 0,
    height: 0,
    speed: 6,
    angle: 0,
    health: 200,
    maxHealth: 200
};

// Esperar a que cargue el sprite del jugador
playerSprite.onload = function () {
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
    ctx.font = '30px MyCustomFont';
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
        if (player.x < enemy.x + enemy.size &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.height > enemy.y) {

            if (enemy instanceof Boss) {
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const reboundDistance = 50;
                player.x += Math.cos(angle) * reboundDistance;
                player.y += Math.sin(angle) * reboundDistance;
            } else {
                player.health -= enemy.damage;
                if (player.health <= 0) {
                    player.health = 0;
                    triggerGameOver();
                }

                score -= 100;
                if (score < 0) score = 0;

                enemies.splice(index, 1);
            }
        }
    });
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.drawImage(playerSprite, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBackground();
    drawBackground();

    updatePlayer();
    updateBullets();
    updateEnemyBullets();
    drawPlayer();
    drawHealthBar();
    drawScore();

    if (!bossActive) {
        spawnEnemies(score);
    } else {
        spawnMeteorites();
    }

    updateEnemies(ctx);
    checkCollisions();
    checkBulletEnemyCollisions();
    checkEnemyBulletPlayerCollisions();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    score = 0;
    player.health = player.maxHealth;
    enemies.length = 0;
    gameOver = false;

    menuScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';

    gameLoop();
}

function showMenu() {
    gameOverScreen.style.display = 'none';
    menuScreen.style.display = 'block';
    canvas.style.display = 'block';  // Mostrar el canvas para el fondo animado
    gameOver = true;

    animateMenuBackground();
}

function triggerGameOver() {
    gameOver = true;
    canvas.style.display = 'block';  // Mostrar el canvas para el fondo animado
    gameOverScreen.style.display = 'block';
    scoreDisplay.textContent = `Your score: ${score}`;

    animateMenuBackground();
}

function retryGame() {
    startGame();
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Mostrar y ocultar los modales
function showRulesModal() {
    rulesModal.style.display = 'flex';
}

function closeRulesModal() {
    rulesModal.style.display = 'none';
}

function showWhyModal() {
    whyModal.style.display = 'flex';
}

function closeWhyModal() {
    whyModal.style.display = 'none';
}
