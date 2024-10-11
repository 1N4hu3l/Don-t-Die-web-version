const enemies = [];
let enemySpeed = 2;
let spawnInterval = 900;
let lastSpawnTime = 0;
let bossActive = false; // Controla si el jefe está activo

const meteoriteSprite = new Image();
meteoriteSprite.src = '/sprites/meteorite.png';
const kamikazeSprite = new Image();
kamikazeSprite.src = '/sprites/kamikaze1.png';  // Ajusta la ruta del sprite
const gunSprite = new Image();
gunSprite.src = '/sprites/gun.png';  // Ajusta la ruta del sprite
const bossSprite = new Image();
bossSprite.src = '/sprites/boss.png';  // Ajusta la ruta del sprite


class Enemy {
    constructor(x, y, health, damage, speed, color) {
        this.x = x;
        this.y = y;
        this.health = health; 
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

        this.scale = 5;  // Ajuste de escala (puedes cambiar este valor)
        this.width = kamikazeSprite.width * this.scale;
        this.height = kamikazeSprite.height * this.scale;
    }

    update() {
        // Calcular el ángulo hacia el jugador
        this.angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);  // Girar hacia el jugador

        // Dibujar el sprite escalado
        ctx.drawImage(kamikazeSprite, -this.width / 2, -this.height / 2, this.width, this.height);

        // Dibujar la hitbox escalada alrededor del sprite
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}


class Gun extends Enemy {
    constructor(x, y) {
        super(x, y, 1, 10, enemySpeed, 'green');
        this.shootCooldown = 500;
        this.lastShotTime = 0;
        this.scale = 5;  // Factor de escala (puedes ajustarlo)
        this.width = gunSprite.width * this.scale;
        this.height = gunSprite.height * this.scale;
        this.angle = 0;  // Nueva propiedad para almacenar el ángulo
    }

    update() {
        // Calcular el ángulo hacia el jugador
        this.angle = Math.atan2(player.y - this.y, player.x - this.x);

        // Actualizar la posición del enemigo
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

        const currentTime = Date.now();
        if (currentTime - this.lastShotTime >= this.shootCooldown) {
            this.shoot();
            this.lastShotTime = currentTime;
        }
    }

    shoot() {
        const enemyBullet = new EnemyBullet(this.x, this.y, this.angle);  // Usamos el mismo ángulo para disparar
        enemyBullets.push(enemyBullet);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);  // Mover el contexto a la posición del enemigo
        ctx.rotate(this.angle);  // Girar el contexto en el ángulo calculado

        // Dibuja el sprite del enemigo Gun girado y escalado
        ctx.drawImage(gunSprite, -this.width / 2, -this.height / 2, this.width, this.height);

        // Dibujar la hitbox escalada alrededor del sprite
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}

class Meteorite extends Enemy {
    constructor() {
        // Configuración inicial de los meteoritos (posición, velocidad, etc.)
        const side = Math.floor(Math.random() * 4); 
        let x, y, speedX, speedY;

        switch (side) {
            case 0: x = Math.random() * canvas.width; y = -30; speedX = (Math.random() - 0.5) * enemySpeed; speedY = enemySpeed; break;
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; speedX = -enemySpeed; speedY = (Math.random() - 0.5) * enemySpeed; break;
            case 2: x = Math.random() * canvas.width; y = canvas.height + 30; speedX = (Math.random() - 0.5) * enemySpeed; speedY = -enemySpeed; break;
            case 3: x = -30; y = Math.random() * canvas.height; speedX = enemySpeed; speedY = (Math.random() - 0.5) * enemySpeed; break;
        }

        super(x, y, 1, 50, enemySpeed, 'gray');
        this.speedX = speedX;
        this.speedY = speedY;
        this.scale = 1;  // Factor de escala para el meteorito
        this.width = meteoriteSprite.width * this.scale;
        this.height = meteoriteSprite.height * this.scale;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Dibujar el sprite del meteorito escalado
        ctx.drawImage(meteoriteSprite, -this.width / 2, -this.height / 2, this.width, this.height);

        // Dibujar la hitbox escalada alrededor del sprite
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}



class Boss extends Enemy {
    constructor() {
        super(canvas.width / 2, -50, 50, 30, 3, 'purple');  // Vida del Boss = 50
        this.phase = 1;
        this.shootCooldown = 400;  // Cooldown inicial de los disparos
        this.lastShotTime = 0;
        this.scale = 4;  // Factor de escala para el Boss (ajustable)
        this.width = bossSprite.width * this.scale;
        this.height = bossSprite.height * this.scale;
        this.angle = 0;  // Nueva propiedad para almacenar el ángulo
    }

    update() {
        const currentTime = Date.now();
        this.angle = Math.atan2(player.y - this.y, player.x - this.x);  // Calcular el ángulo hacia el jugador

        if (this.phase === 1) {
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);

            if (this.health <= 30) {
                this.phase = 2;
            }
        } else if (this.phase === 2) {
            if (currentTime - this.lastShotTime >= this.shootCooldown) {
                this.shootRandomBullets();
                this.lastShotTime = currentTime;
            }

            if (this.health <= 20) {
                this.phase = 3;
                this.speed = 2;  // Reducir la velocidad en la fase 3
                this.shootCooldown = 300;  // Disparar más rápido en la fase 3
            }
        } else if (this.phase === 3) {
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);

            if (currentTime - this.lastShotTime >= this.shootCooldown / 2) {
                this.shootRandomBullets();
                this.lastShotTime = currentTime;
            }
        }
    }

    // Método para disparar balas en direcciones aleatorias
    shootRandomBullets() {
        const numBullets = 5;
        for (let i = 0; i < numBullets; i++) {
            const randomAngle = Math.random() * Math.PI * 2; // Ángulo aleatorio entre 0 y 2π
            const bossBullet = new EnemyBullet(this.x, this.y, randomAngle);
            enemyBullets.push(bossBullet);
        }
    }

    receiveDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            bossActive = false; // Si el jefe muere, permitir que otros enemigos aparezcan
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);  // Girar el Boss hacia el jugador

        // Dibujar el sprite del Boss escalado
        ctx.drawImage(bossSprite, -this.width / 2, -this.height / 2, this.width, this.height);

        // Dibujar la hitbox escalada alrededor del sprite
        ctx.strokeStyle = 'violet';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}



function checkEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        for (let j = i + 1; j < enemies.length; j++) {
            const distX = enemies[i].x - enemies[j].x;
            const distY = enemies[i].y - enemies[j].y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            // Si la distancia entre dos enemigos es menor que la suma de sus tamaños, colisionan
            if (distance < enemies[i].size + enemies[j].size) {
                
                // Si el primer enemigo es el Boss, elimina solo al segundo enemigo
                if (enemies[i] instanceof Boss) {
                    enemies.splice(j, 1);  // Elimina al enemigo que colisiona con el Boss
                    break;
                }
                
                // Si el segundo enemigo es el Boss, elimina solo al primer enemigo
                if (enemies[j] instanceof Boss) {
                    enemies.splice(i, 1);  // Elimina al enemigo que colisiona con el Boss
                    break;
                }

                // Si ninguno es el Boss, eliminar ambos enemigos
                enemies.splice(j, 1);  // Elimina al segundo enemigo
                enemies.splice(i, 1);  // Luego elimina al primero
                break;  // Romper el bucle para evitar errores de índice
            }
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
            case 0: x = Math.random() * canvas.width; y = -30; break;
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = canvas.height + 30; break;
            case 3: x = -30; y = Math.random() * canvas.height; break;
        }

        if (rand < 0.25) {
            enemy = new Kamikaze(x, y);
        } else if (rand < 0.5) {
            enemy = new Gun(x, y);
        } else {
            enemy = new Meteorite(x, y); // Meteoritos siempre aparecen
        }

        enemies.push(enemy);
        lastSpawnTime = currentTime;
    }

    // Aparición del jefe cada vez que el puntaje es múltiplo de 1000 y no hay uno activo
    if (currentScore % 1000 === 0 && currentScore > 0 && !bossActive) {
        enemies.push(new Boss());
        bossActive = true; // Marcar que el jefe está en pantalla
    }
}

function spawnMeteorites() {
    const currentTime = Date.now();

    if (currentTime - lastSpawnTime > spawnInterval) {
        const meteorite = new Meteorite();
        enemies.push(meteorite);
        lastSpawnTime = currentTime;
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

    // Llamar a la nueva función que verifica colisiones entre enemigos
    checkEnemyCollisions();
}
