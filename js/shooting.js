const bullets = [];
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
