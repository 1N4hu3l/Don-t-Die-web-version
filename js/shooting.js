const bullets = []; // Balas del jugador
const enemyBullets = []; // Balas de los enemigos
let lastShotTime = 0;
const shootCooldown = 250;
const bulletSprite = new Image();
bulletSprite.src = '/sprites/beam.png';  // Ruta del sprite de la bala
const enemyBulletSprite = new Image();
enemyBulletSprite.src = '/sprites/enemy_bullet.png';

bulletSprite.onload = () => {
    playerBulletWidth = bulletSprite.width;
    playerBulletHeight = bulletSprite.height;
};

bulletSprite.onload = () => {
    playerBulletWidth = bulletSprite.width;
    playerBulletHeight = bulletSprite.height;
};

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.angle = angle;
        this.scale = 3;  // Factor de escala para agrandar el tamaño de la bala
        this.width = bulletSprite.width * this.scale;  // Ancho escalado del sprite
        this.height = bulletSprite.height * this.scale;  // Alto escalado del sprite
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Dibujar el sprite escalado
        ctx.drawImage(bulletSprite, -this.width / 2, -this.height / 2, this.width, this.height);

        // Opcional: Añadir un borde violeta
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    outOfBounds() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}


enemyBulletSprite.onload = () => {
    enemyBulletWidth = enemyBulletSprite.width;
    enemyBulletHeight = enemyBulletSprite.height;
};

class EnemyBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.angle = angle;
        this.scale = 3;  // Factor de escala para agrandar el tamaño de la bala del enemigo
        this.width = enemyBulletSprite.width * this.scale;  // Ancho escalado del sprite
        this.height = enemyBulletSprite.height * this.scale;  // Alto escalado del sprite
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Dibuja el sprite escalado de la bala del enemigo
        ctx.drawImage(enemyBulletSprite, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
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
            // Verificar colisión usando AABB
            if (bullet.x < enemy.x + enemy.size &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.size &&
                bullet.y + bullet.height > enemy.y) {
                enemy.receiveDamage(10);
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
        // Verificar colisión usando AABB
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            // Reducir la vida del jugador
            player.health -= 20; // Ajusta el daño según sea necesario
            if (player.health <= 0) {
                player.health = 0;
                triggerGameOver(); // Llamar a la función de Game Over
            }

            // Eliminar la bala que impactó
            enemyBullets.splice(bulletIndex, 1);
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
