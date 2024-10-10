const enemies = [];
let enemySpeed = 2;
let spawnInterval = 1000;
let lastSpawnTime = 0;
let bossActive = false; // Controla si el jefe está activo

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
        return this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50;
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
    constructor() {
        // Determina desde qué lado de la pantalla aparecerá el meteorito
        const side = Math.floor(Math.random() * 4); // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
        let x, y, speedX, speedY;

        switch (side) {
            case 0: // Aparece arriba
                x = Math.random() * canvas.width;
                y = -30; // fuera del canvas
                speedX = (Math.random() - 0.5) * enemySpeed;
                speedY = enemySpeed;
                break;
            case 1: // Aparece a la derecha
                x = canvas.width + 30;
                y = Math.random() * canvas.height;
                speedX = -enemySpeed;
                speedY = (Math.random() - 0.5) * enemySpeed;
                break;
            case 2: // Aparece abajo
                x = Math.random() * canvas.width;
                y = canvas.height + 30;
                speedX = (Math.random() - 0.5) * enemySpeed;
                speedY = -enemySpeed;
                break;
            case 3: // Aparece a la izquierda
                x = -30;
                y = Math.random() * canvas.height;
                speedX = enemySpeed;
                speedY = (Math.random() - 0.5) * enemySpeed;
                break;
        }

        // Constructor con nueva velocidad y dirección
        super(x, y, 1, player.maxHealth, enemySpeed, 'gray');
        this.speedX = speedX;
        this.speedY = speedY;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
}

class Boss extends Enemy {
    constructor() {
        super(canvas.width / 2, -50, 20, 30, 2, 'purple'); // Más vida y daño
        this.phase = 1;
        this.shootCooldown = 2000; // Tiempo entre disparos
        this.lastShotTime = 0;
    }

    update() {
        const currentTime = Date.now();

        if (this.phase === 1) {
            // Fase 1: El jefe se mueve hacia el jugador lentamente
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += this.speed * Math.cos(angle);
            this.y += this.speed * Math.sin(angle);

            // Si el jefe llega cerca del jugador, pasa a la fase 2
            if (this.health < 15) {
                this.phase = 2;
            }
        } else if (this.phase === 2) {
            // Fase 2: El jefe dispara balas hacia el jugador en intervalos
            if (currentTime - this.lastShotTime >= this.shootCooldown) {
                this.shoot();
                this.lastShotTime = currentTime;
            }

            // Si la salud baja a menos de 10, pasa a la fase 3
            if (this.health < 10) {
                this.phase = 3;
                this.speed = 4; // Aumenta la velocidad en la última fase
            }
        } else if (this.phase === 3) {
            // Fase 3: Combina movimiento rápido y disparos
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += this.speed * Math.cos(angle);
            this.y += this.speed * Math.sin(angle);

            // Disparos más rápidos
            if (currentTime - this.lastShotTime >= this.shootCooldown / 2) {
                this.shoot();
                this.lastShotTime = currentTime;
            }
        }
    }

    shoot() {
        // Disparo de balas hacia el jugador
        const bossBullet = new EnemyBullet(this.x, this.y, Math.atan2(player.y - this.y, player.x - this.x));
        enemyBullets.push(bossBullet);
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            bossActive = false; // Permitir la aparición de un nuevo jefe
        }
    }
}

function spawnEnemies(currentScore) {
    const currentTime = Date.now();

    // Solo hacer spawn de enemigos normales si no hay un jefe activo
    if (!bossActive && currentTime - lastSpawnTime > spawnInterval) {
        let enemy;
        const rand = Math.random();

        // Aparecen desde los bordes
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch (side) {
            case 0: x = Math.random() * canvas.width; y = -30; break; // Aparece desde arriba
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break; // Derecha
            case 2: x = Math.random() * canvas.width; y = canvas.height + 30; break; // Abajo
            case 3: x = -30; y = Math.random() * canvas.height; break; // Izquierda
        }

        if (rand < 0.25) {
            enemy = new Kamikaze(x, y);
        } else if (rand < 0.5) {
            enemy = new Gun(x, y);
        } else {
            enemy = new Meteorite(x, y); // Meteoritos siguen apareciendo
        }

        enemies.push(enemy);
        lastSpawnTime = currentTime;
    }

    // Aparición del boss si el puntaje es suficiente y no hay uno activo
    if (currentScore >= 1000 && !bossActive) {
        enemies.push(new Boss());
        bossActive = true; // Marcar que el jefe está en pantalla
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
