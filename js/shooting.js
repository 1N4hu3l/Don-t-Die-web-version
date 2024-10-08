const bullets = [];
let lastShotTime = 0; // Tiempo del último disparo
const shootCooldown = 250; // Tiempo de espera entre disparos (en milisegundos)

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

// Actualizar y dibujar balas
function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();

        // Eliminar la bala si sale de los límites
        if (bullet.outOfBounds()) {
            bullets.splice(index, 1);
        }
    });
}

// Escuchar el evento de disparo
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const currentTime = Date.now(); // Obtener el tiempo actual
        if (currentTime - lastShotTime >= shootCooldown) {
            const bullet = new Bullet(player.x, player.y, player.angle);
            bullets.push(bullet);
            lastShotTime = currentTime; // Actualizar el tiempo del último disparo
        }
    }
});
