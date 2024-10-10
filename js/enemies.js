const enemies = [];
let enemySpeed = 2;
let spawnInterval = 1000;
let lastSpawnTime = 0;

class Enemy {
    constructor(x, y, health, damage, speed, color) {
        this.x = x;
        this.y = y;
        this.health = 1; 
        this.damage = damage;
        this.speed = speed;
        this.size = 30;
        this.color = color;
        this.active = true;
    }

    update() {}

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // borde violeta a todos los enemigos
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    outOfBounds() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    checkBulletCollision(bullet) {
        const distX = this.x - bullet.x;
        const distY = this.y - bullet.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < this.size;
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
        }
    }
}

class Kamikaze extends Enemy {
    constructor(x, y) {
        super(x, y, 1, 20, enemySpeed, 'red');
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);
    }
}

class Gun extends Enemy {
    constructor(x, y) {
        super(x, y, 1, 10, enemySpeed, 'blue');
        this.shootCooldown = 1000;
        this.lastShotTime = 0;
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += this.speed * Math.cos(angle);
        this.y += this.speed * Math.sin(angle);

        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootCooldown) {
            this.shoot();
            this.lastShotTime = currentTime;
        }
    }

    shoot() {
        const enemyBullet = new EnemyBullet(this.x, this.y, Math.atan2(player.y - this.y, player.x - this.x));
        enemyBullets.push(enemyBullet);
    }
}

class Meteorite extends Enemy {
    constructor(x, y) {
        // El meteorito mata al jugador de una (daño igual a la vida máxima del jugador)
        super(x, y, 1, player.maxHealth, enemySpeed, 'gray');
    }

    update() {
        this.y += this.speed;
    }
}

class Boss extends Enemy {
    constructor() {
        super(canvas.width / 2, -50, 1, 30, 2, 'purple');
        this.phase = 1;
    }

    update() {
        if (this.phase === 1) {
            // Movimiento hacia el jugador
        } else if (this.phase === 2) {
            // Disparar balas
        } else if (this.phase === 3) {
            // Hacer ambas cosas
        }
    }
}

function spawnEnemies(currentScore) {
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnInterval) {
        let enemy;
        const rand = Math.random();

        if (rand < 0.25) {
            enemy = new Kamikaze(Math.random() * canvas.width, Math.random() * canvas.height);
        } else if (rand < 0.5) {
            enemy = new Gun(Math.random() * canvas.width, Math.random() * canvas.height);
        } else {
            enemy = new Meteorite(Math.random() * canvas.width, 0);
        }

        enemies.push(enemy);
        lastSpawnTime = currentTime;
    }

    if (currentScore >= 1000 && currentScore % 1000 === 0) {
        enemies.push(new Boss());
    }
}

function updateEnemies(ctx) {
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw(ctx);
        if (enemy.outOfBounds() || !enemy.active) {
            enemies.splice(index, 1);
        }
    });
}
