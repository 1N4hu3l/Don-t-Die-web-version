const bullets = []; // Balas del jugador
const enemyBullets = []; // Balas de los enemigos
let lastShotTime = 0;
const shootCooldown = 250;

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.speed = 10;
        this.angle = angle;
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Agregar borde violeta a las balas del jugador
        ctx.strokeStyle = 'violeta';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    outOfBounds() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

class EnemyBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.speed = 7;  // La velocidad puede ser diferente de la bala del jugador
        this.angle = angle;
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    draw() {
        ctx.fillStyle = 'red'; // Bala de enemigo en color rojo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Borde violeta para la bala del enemigo
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    outOfBounds() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.outOfBounds()) {
            bullets.splice(index, 1);
        }
    });
}

function updateEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.outOfBounds()) {
            enemyBullets.splice(index, 1);
        }
    });
}

function checkBulletEnemyCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (enemy.checkBulletCollision(bullet)) {
                enemy.receiveDamage(20);
                bullets.splice(bulletIndex, 1);
                if (!enemy.active) {
                    enemies.splice(enemyIndex, 1);
                    score += 50;
                }
            }
        });
    });
}

function checkEnemyBulletPlayerCollisions() {
    enemyBullets.forEach((bullet, bulletIndex) => {
        const distX = player.x - bullet.x;
        const distY = player.y - bullet.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < player.size + bullet.size) {
            player.health -= 20; // Daño al jugador
            if (player.health < 0) player.health = 0;
            enemyBullets.splice(bulletIndex, 1); // Eliminar la bala que impactó
        }
    });
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const currentTime = Date.now();
        if (currentTime - lastShotTime >= shootCooldown) {
            const bullet = new Bullet(player.x, player.y, player.angle);
            bullets.push(bullet);
            lastShotTime = currentTime;
        }
    }
});
