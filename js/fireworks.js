class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 3;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.particles = [];
        this.alive = true;
        this.trail = [];
        this.style = Math.floor(Math.random() * 4); // 0: 圆形, 1: 心形, 2: 螺旋形, 3: 双环形
        this.baseHue = Math.random() * 360;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // 添加尾迹效果
        if (this.alive) {
            this.trail.push({ x: this.x, y: this.y, alpha: 1 });
            if (this.trail.length > 20) this.trail.shift();
        }

        // 更新尾迹透明度
        this.trail.forEach(point => point.alpha *= 0.96);

        if (Math.abs(this.x - this.targetX) < 5 && Math.abs(this.y - this.targetY) < 5) {
            this.explode();
            this.alive = false;
        }
    }

    explode() {
        const particleCount = 150;
        switch(this.style) {
            case 0: // 圆形
                this.createCircleExplosion(particleCount);
                break;
            case 1: // 心形
                this.createHeartExplosion(particleCount);
                break;
            case 2: // 螺旋形
                this.createSpiralExplosion(particleCount);
                break;
            case 3: // 双环形
                this.createDoubleRingExplosion(particleCount);
                break;
        }
    }

    createCircleExplosion(count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const velocity = 2 + Math.random();
            const hue = this.baseHue + Math.random() * 30 - 15;
            this.particles.push(new Particle(
                this.x, this.y,
                Math.cos(angle) * velocity,
                Math.sin(angle) * velocity,
                `hsl(${hue}, 70%, 60%)`,
                0.015 + Math.random() * 0.01
            ));
        }
    }

    createHeartExplosion(count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const heartShape = this.heartShape(angle);
            const velocity = 2 + Math.random();
            const hue = this.baseHue + Math.random() * 30 - 15;
            this.particles.push(new Particle(
                this.x, this.y,
                heartShape.x * velocity,
                heartShape.y * velocity,
                `hsl(${hue}, 70%, 60%)`,
                0.02 + Math.random() * 0.01
            ));
        }
    }

    createSpiralExplosion(count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 8 * i / count);
            const velocity = 1 + (i / count) * 2;
            const hue = this.baseHue + (i / count) * 60;
            this.particles.push(new Particle(
                this.x, this.y,
                Math.cos(angle) * velocity,
                Math.sin(angle) * velocity,
                `hsl(${hue}, 70%, 60%)`,
                0.01 + (i / count) * 0.01
            ));
        }
    }

    createDoubleRingExplosion(count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const velocity = i % 2 === 0 ? 1.5 : 2.5;
            const hue = this.baseHue + (i % 2 === 0 ? 0 : 30);
            this.particles.push(new Particle(
                this.x, this.y,
                Math.cos(angle) * velocity,
                Math.sin(angle) * velocity,
                `hsl(${hue}, 70%, 60%)`,
                0.015
            ));
        }
    }

    heartShape(angle) {
        return {
            x: 16 * Math.pow(Math.sin(angle), 3),
            y: -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle))
        };
    }
    draw(ctx) {
        // 绘制尾迹
        this.trail.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 180, ${point.alpha})`;
            ctx.fill();
        });

        if (this.alive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.baseHue}, 50%, 50%)`;
            ctx.fill();
        }

        this.particles.forEach((particle, index) => {
            if (particle.alpha <= 0) {
                this.particles.splice(index, 1);
            } else {
                particle.update();
                particle.draw(ctx);
            }
        });
    }
}

class Particle {
    constructor(x, y, vx, vy, color, decay = 0.02) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.alpha = 1;
        this.decay = decay;
        this.size = 1 + Math.random();
        this.resistance = 0.98;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravity
        this.vx *= this.resistance;
        this.vy *= this.resistance;
        this.alpha -= this.decay;
        this.size *= 0.96;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
    }
}

const canvas = document.getElementById('fireworks');if (!canvas) {
    console.error('无法找到 canvas 元素');
    throw new Error('Canvas element not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    console.error('无法获取 canvas 上下文');
    throw new Error('Canvas context not found');
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let fireworks = [];

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.05) {
        const x = canvas.width / 2;
        const y = canvas.height;
        const targetX = Math.random() * canvas.width;
        const targetY = Math.random() * canvas.height * 0.5;
        fireworks.push(new Firework(x, y, targetX, targetY));
    }

    fireworks.forEach((firework, index) => {
        if (!firework.alive && firework.particles.length === 0) {
            fireworks.splice(index, 1);
        } else {
            firework.update();
            firework.draw(ctx);
        }
    });
}

animate();

canvas.addEventListener('click', (e) => {
    const x = canvas.width / 2;
    const y = canvas.height;
    fireworks.push(new Firework(x, y, e.clientX, e.clientY));
});