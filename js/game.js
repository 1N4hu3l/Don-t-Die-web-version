const font = new FontFace('MyFont', 'url(./fonts/Myfont.ttf)');

font.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
}).catch(function(error) {
    console.error('Error loading font:', error);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scriptEnemies = document.createElement('script');
scriptEnemies.src = '/js/enemies.js'; 
document.head.appendChild(scriptEnemies);

const script = document.createElement('script');
script.src = '/js/shooting.js';
script.onload = function() {
    gameLoop();
};
document.head.appendChild(script);

let score = 950;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 5,
    angle: 0,
    color: 'white',
    maxHealth: 100,
    health: 100
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

    if (player.x < player.size) player.x = player.size;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < player.size) player.y = player.size;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;

    if (moving) {
        player.angle = Math.atan2(keys.ArrowDown - keys.ArrowUp, keys.ArrowRight - keys.ArrowLeft);
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);

    // borde violeta a la hitbox del jugador
    ctx.strokeStyle = 'violet';
    ctx.lineWidth = 3;
    ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);

    ctx.restore();
}

function checkCollisions() {
    enemies.forEach((enemy, index) => {
        const distX = player.x - enemy.x;
        const distY = player.y - enemy.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < player.size + enemy.size) {
            if (enemy instanceof Boss) {
                // Rebote del jugador al chocar con el boss
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const reboundDistance = 50; // Distancia del rebote
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


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
