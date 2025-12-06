/**
 * Abstract Geometric Sketch - Clockwork 1080p
 * An interactive canvas art piece featuring dynamic shapes,
 * orbital animations, and 1080p recording capabilities.
 */

// ============================================
// Canvas Setup
// ============================================

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// --- High Res Configuration ---
const RENDER_WIDTH = 1080;
const RENDER_HEIGHT = 1350;

const settings = {
    shapeCount: 70,
    connectionDistance: 220,
    palette: [
        '#1F2833', '#C5C6C7', '#66FCF1', '#45A29E',
        '#0b0c10', '#D4AF37', '#F2F2F2', '#2C3531', '#116466'
    ],
    metallicAccent: '#D4AF37',
    accentRgb: '212, 175, 55',
    bg: '#050505',
    frameMargin: 140,
    fps: 60
};

let width = RENDER_WIDTH;
let height = RENDER_HEIGHT;
let minDim = Math.min(width, height);

let shapes = [];
let centralShapes = [];
let noiseCanvas;
let time = 0;
const GLOBAL_ROTATION_SPEED = 0.0003;

let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

// ============================================
// Utility Functions
// ============================================

const randomRange = (min, max) => Math.random() * (max - min) + min;
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const createNoise = () => {
    if (!width || !height) return;
    noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    const noiseCtx = noiseCanvas.getContext('2d');
    try {
        const imageData = noiseCtx.createImageData(width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 255;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = 18;
        }
        noiseCtx.putImageData(imageData, 0, 0);
    } catch (e) {
        console.warn('Noise generation failed:', e);
    }
};

// ============================================
// Shape Class
// ============================================

class Shape {
    constructor() {
        // Define behavior: ~75% attraction to center, ~25% orbiting
        this.behavior = Math.random() < 0.75 ? 'center' : 'orbit';

        // --- SIZE SETUP ---
        this.baseSize = randomRange(60, 180);
        this.size = this.baseSize;
        this.pulseOffset = Math.random() * Math.PI * 2;

        // --- PARALLAX SPEED ---
        const sizeFactor = this.baseSize / 200;
        this.parallaxSpeed = 0.6 + (sizeFactor * 0.8);

        const centerX = width / 2;
        const centerY = height / 2;

        // Opacity handling for smooth fades
        this.baseOpacity = randomRange(0.4, 0.95);
        this.opacity = this.baseOpacity;
        this.scaleMod = 1.0;

        if (this.behavior === 'center') {
            // --- CENTER ATTRACTION SETUP ---
            const angle = Math.random() * Math.PI * 2;
            const radius = randomRange(minDim * 0.6, minDim * 1.0);
            this.x = centerX + Math.cos(angle) * radius;
            this.y = centerY + Math.sin(angle) * radius;

            this.attractionSpeed = randomRange(0.2, 0.6);
            this.tangentSpeed = randomRange(-0.3, 0.3);
        } else {
            // --- ORBIT SETUP ---
            const safeRadius = (minDim / 2) - settings.frameMargin + 40;

            if (Math.random() > 0.5) {
                this.orbitType = 'elliptical';
                this.orbitRadiusX = randomRange(safeRadius * 0.5, safeRadius * 0.9);
                this.orbitRadiusY = this.orbitRadiusX * randomRange(0.8, 1.2);
            } else {
                this.orbitType = 'wave';
                this.baseOrbitRadius = randomRange(safeRadius * 0.6, safeRadius * 1.0);
                this.waveFrequency = Math.floor(randomRange(3, 7));
                this.waveAmplitude = randomRange(40, 80);
                this.waveOffset = Math.random() * Math.PI * 2;
            }
            this.angle = Math.random() * Math.PI * 2;
            this.baseSpeed = randomRange(0.001, 0.003) * (Math.random() > 0.5 ? 1 : -1);

            this.updateOrbitPosition(centerX, centerY, 0);
        }

        // Geometry
        this.points = [];
        const numPoints = Math.floor(randomRange(3, 6));
        const angleStep = (Math.PI * 2) / numPoints;
        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep + randomRange(-angleStep / 4, angleStep / 4);
            const radius = (this.baseSize / 2) * randomRange(0.5, 1.1);
            this.points.push({ angle: angle, radius: radius });
        }

        // Color
        const roll = Math.random();
        if (roll > 0.85) {
            this.color1 = settings.metallicAccent;
            this.color2 = '#FFF';
            this.isAccent = true;
        } else {
            this.color1 = randomPick(settings.palette);
            this.color2 = randomPick(settings.palette);
            this.isAccent = false;
        }

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = randomRange(-0.002, 0.002);
        this.hasStroke = Math.random() > 0.6;
    }

    update(shapes) {
        const centerX = width / 2;
        const centerY = height / 2;

        // --- 1. MOVEMENT LOGIC ---
        if (this.behavior === 'center') {
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // SMOOTH DISSOLVE/SHRINK MECHANISM
            if (dist < 150) {
                const factor = Math.max(0, dist / 150);
                this.scaleMod = factor;
                this.opacity = this.baseOpacity * factor;
            } else {
                this.scaleMod = 1.0;
                this.opacity = this.baseOpacity;
            }

            // Respawn logic
            if (dist < 5) {
                const angle = Math.random() * Math.PI * 2;
                const radius = randomRange(minDim * 0.7, minDim * 1.1);
                this.x = centerX + Math.cos(angle) * radius;
                this.y = centerY + Math.sin(angle) * radius;
                this.scaleMod = 1.0;
            } else {
                const vx = (dx / dist) * this.attractionSpeed;
                const vy = (dy / dist) * this.attractionSpeed;

                const tangentX = -vy * this.tangentSpeed;
                const tangentY = vx * this.tangentSpeed;

                this.x += vx + tangentX;
                this.y += vy + tangentY;
            }
        } else {
            this.updateOrbitPosition(centerX, centerY, time);

            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const gCos = Math.cos(GLOBAL_ROTATION_SPEED);
            const gSin = Math.sin(GLOBAL_ROTATION_SPEED);
            this.x = centerX + (dx * gCos - dy * gSin);
            this.y = centerY + (dx * gSin + dy * gCos);

            this.scaleMod = 1.0;
        }

        // --- 2. SOFT COLLISION (SEPARATION) MECHANISM ---
        const repulsionStrength = 0.5;

        for (let other of shapes) {
            if (other === this) continue;

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distSq = dx * dx + dy * dy;

            const minDist = (this.size + other.size) * 0.25;
            const minDistSq = minDist * minDist;

            if (distSq < minDistSq && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const force = (minDist - dist) / minDist;
                const fx = (dx / dist) * force * repulsionStrength;
                const fy = (dy / dist) * force * repulsionStrength;

                this.x += fx;
                this.y += fy;
            }
        }

        // Common updates
        this.rotation += this.rotationSpeed;
        const pulse = Math.sin(time * 2 + this.pulseOffset);
        this.size = (this.baseSize + pulse * 3.0) * this.scaleMod;
    }

    updateOrbitPosition(centerX, centerY, currentTime) {
        let localX, localY;
        const currentSpeed = this.baseSpeed * this.parallaxSpeed;
        this.angle += currentSpeed;

        if (this.orbitType === 'elliptical') {
            const breathing = Math.sin(currentTime * 2 + this.pulseOffset) * 20;
            localX = Math.cos(this.angle) * (this.orbitRadiusX + breathing);
            localY = Math.sin(this.angle) * (this.orbitRadiusY + breathing);
        } else {
            const wave = Math.sin(this.angle * this.waveFrequency + currentTime * 0.5 + this.waveOffset);
            const currentRadius = this.baseOrbitRadius + (wave * this.waveAmplitude);
            localX = Math.cos(this.angle) * currentRadius;
            localY = Math.sin(this.angle) * currentRadius;
        }
        this.x = centerX + localX;
        this.y = centerY + localY;
    }

    draw(ctx) {
        if (this.opacity < 0.01) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createLinearGradient(-this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
        ctx.fillStyle = gradient;

        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 30 * this.scaleMod;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10 * this.scaleMod;

        ctx.beginPath();
        const scale = this.size / this.baseSize;
        const p0 = this.points[0];
        ctx.moveTo(p0.radius * scale * Math.cos(p0.angle), p0.radius * scale * Math.sin(p0.angle));
        for (let i = 1; i < this.points.length; i++) {
            const p = this.points[i];
            ctx.lineTo(p.radius * scale * Math.cos(p.angle), p.radius * scale * Math.sin(p.angle));
        }
        ctx.closePath();
        ctx.fill();

        if (this.hasStroke || this.isAccent) {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = settings.metallicAccent;
            ctx.shadowColor = settings.metallicAccent;
            ctx.shadowBlur = 15 * this.scaleMod;
            ctx.stroke();
        }
        ctx.restore();
    }
}

// ============================================
// Central Shape Class
// ============================================

class CentralShape extends Shape {
    constructor() {
        super();
        this.behavior = 'central';
        this.x = width / 2;
        this.y = height / 2;
        this.size = randomRange(80, 150);
        this.rotationSpeed = randomRange(-0.005, 0.005);
        this.opacity = randomRange(0.8, 1.0);

        if (Math.random() > 0.5) {
            this.color1 = settings.metallicAccent;
            this.color2 = '#FFF';
            this.isAccent = true;
        }
    }

    update() {
        this.rotation += this.rotationSpeed;
        const pulse = Math.sin(time * 2 + this.pulseOffset);
        this.size = (this.baseSize + pulse * 2.0);
    }
}

// ============================================
// Initialization Functions
// ============================================

const resize = () => {
    canvas.width = RENDER_WIDTH;
    canvas.height = RENDER_HEIGHT;
    createNoise();
    initShapes();
};

const initShapes = () => {
    shapes = [];
    for (let i = 0; i < settings.shapeCount; i++) {
        shapes.push(new Shape());
    }

    centralShapes = [];
    for (let i = 0; i < 3; i++) {
        centralShapes.push(new CentralShape());
    }
};

// ============================================
// Drawing Functions
// ============================================

const drawConnections = () => {
    context.save();
    const m = settings.frameMargin;

    context.beginPath();
    context.rect(m, m, width - m * 2, height - m * 2);
    context.clip();

    // Inter-connections between moving shapes
    for (let i = 0; i < shapes.length; i++) {
        if (shapes[i].opacity < 0.1) continue;

        for (let j = i + 1; j < Math.min(i + 25, shapes.length); j++) {
            if (shapes[j].opacity < 0.1) continue;

            const a = shapes[i];
            const b = shapes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < settings.connectionDistance * settings.connectionDistance) {
                const dist = Math.sqrt(distSq);
                const alpha = 1 - (dist / settings.connectionDistance);
                const combinedOpacity = Math.min(a.opacity, b.opacity);

                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.strokeStyle = `rgba(${settings.accentRgb}, ${alpha * 1.5 * combinedOpacity})`;
                context.lineWidth = 1;
                context.stroke();
            }
        }
    }

    // Connect Central Shapes to Moving Shapes
    for (let i = 0; i < centralShapes.length; i++) {
        const center = centralShapes[i];

        for (let j = 0; j < shapes.length; j++) {
            const mover = shapes[j];
            if (mover.opacity < 0.1) continue;

            const dx = center.x - mover.x;
            const dy = center.y - mover.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < settings.connectionDistance * settings.connectionDistance) {
                const dist = Math.sqrt(distSq);
                const alpha = 1 - (dist / settings.connectionDistance);
                const combinedOpacity = Math.min(center.opacity, mover.opacity);

                context.beginPath();
                context.moveTo(center.x, center.y);
                context.lineTo(mover.x, mover.y);
                context.strokeStyle = `rgba(${settings.accentRgb}, ${alpha * 1.5 * combinedOpacity})`;
                context.lineWidth = 1;
                context.stroke();
            }
        }

        // Connect central shapes to each other
        for (let k = i + 1; k < centralShapes.length; k++) {
            const otherCenter = centralShapes[k];
            const dx = center.x - otherCenter.x;
            const dy = center.y - otherCenter.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < settings.connectionDistance * settings.connectionDistance) {
                const dist = Math.sqrt(distSq);
                const alpha = 1 - (dist / settings.connectionDistance);

                context.beginPath();
                context.moveTo(center.x, center.y);
                context.lineTo(otherCenter.x, otherCenter.y);
                context.strokeStyle = `rgba(${settings.accentRgb}, ${alpha * 1.5})`;
                context.lineWidth = 1;
                context.stroke();
            }
        }
    }

    context.restore();
};

const drawFrame = () => {
    const m = settings.frameMargin;
    context.save();

    // Fill the margin area (the matte)
    context.fillStyle = settings.bg;
    context.beginPath();
    context.rect(0, 0, width, height);
    context.rect(m, m, width - m * 2, height - m * 2);
    context.fill("evenodd");

    // Draw a sleeker, double-line metallic frame
    context.strokeStyle = settings.metallicAccent;
    context.shadowColor = settings.metallicAccent;

    // Outer main line
    context.shadowBlur = 10;
    context.lineWidth = 2.5;
    context.strokeRect(m, m, width - m * 2, height - m * 2);

    // Inner, thinner accent line
    context.shadowBlur = 2;
    context.lineWidth = 1;
    context.globalAlpha = 0.8;

    const offset = 6;
    context.strokeRect(m + offset, m + offset, width - (m * 2) - offset * 2, height - (m * 2) - offset * 2);

    context.restore();
};

const drawVignette = () => {
    const gradient = context.createRadialGradient(width / 2, height / 2, minDim / 4, width / 2, height / 2, minDim);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
};

// ============================================
// Main Animation Loop
// ============================================

const draw = () => {
    time += 0.003;

    context.fillStyle = "#0b0c10";
    context.fillRect(0, 0, width, height);

    drawConnections();

    const m = settings.frameMargin;
    context.save();
    context.beginPath();
    context.rect(m, m, width - m * 2, height - m * 2);
    context.clip();

    shapes.forEach(shape => {
        shape.update(shapes);
        shape.draw(context);
    });

    centralShapes.forEach(shape => {
        shape.update();
        shape.draw(context);
    });

    context.restore();

    drawVignette();

    if (noiseCanvas) {
        context.save();
        context.globalCompositeOperation = 'overlay';
        context.globalAlpha = 0.25;
        context.drawImage(noiseCanvas, 0, 0);
        context.restore();
    }

    drawFrame();

    requestAnimationFrame(draw);
};

// ============================================
// Recording Functions
// ============================================

const startRecording = () => {
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {};
    }

    try {
        const stream = canvas.captureStream(60);
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genesis_clockwork_1080p_${Date.now()}.webm`;
            a.click();
            recordedChunks = [];
        };
        mediaRecorder.start();
        isRecording = true;
        const btn = document.getElementById('btn-record');
        btn.textContent = "Stop Recording";
        btn.classList.add('recording');
    } catch (e) {
        console.error("Recording failed", e);
        alert("Recording not supported in this browser environment.");
    }
};

const stopRecording = () => {
    mediaRecorder.stop();
    isRecording = false;
    const btn = document.getElementById('btn-record');
    btn.textContent = "Record 1080p";
    btn.classList.remove('recording');
};

// ============================================
// Event Listeners & Initialization
// ============================================

window.addEventListener('resize', resize);
document.getElementById('btn-scramble').addEventListener('click', initShapes);
document.getElementById('btn-record').addEventListener('click', () => {
    isRecording ? stopRecording() : startRecording();
});

// Start the application
resize();
draw();
