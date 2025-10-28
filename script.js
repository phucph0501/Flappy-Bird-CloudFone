// Flappy Bird CloudFone - Optimized for CloudFone platform
// Compatible with 240x320 and 128x160 screen sizes

class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBirdBest')) || 0;
        
        // Game settings
        this.gravity = 0.5;
        this.jumpPower = -8;
        this.gameSpeed = 2;
        
        // Initialize canvas size
        this.resizeCanvas();
        
        // Bird properties
        this.bird = {
            x: this.canvas.width * 0.25,
            y: this.canvas.height * 0.5,
            width: 20,
            height: 15,
            velocity: 0,
            color: '#FFFF00',
            alive: true
        };
        
        // Pipes array
        this.pipes = [];
        this.pipeWidth = 40;
        this.pipeGap = 100;
        this.pipeInterval = 120;
        this.frameCount = 0;
        
        // Ground properties
        this.groundHeight = 50;
        this.groundY = this.canvas.height - this.groundHeight;
        
        // Initialize game
        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
    }
    
    resizeCanvas() {
        const container = document.querySelector('.container');
        const rect = container.getBoundingClientRect();
        
        // Set canvas dimensions based on screen size
        if (window.innerWidth <= 128) {
            this.canvas.width = 128;
            this.canvas.height = 120;
        } else if (window.innerWidth <= 240) {
            this.canvas.width = 240;
            this.canvas.height = 260;
        } else {
            this.canvas.width = 240;
            this.canvas.height = 320;
        }
        
        // Adjust game settings based on screen size
        if (this.canvas.width <= 128) {
            this.pipeGap = 60;
            this.pipeWidth = 25;
            this.bird.width = 12;
            this.bird.height = 10;
            this.gameSpeed = 1.5;
            this.jumpPower = -6;
            this.gravity = 0.4;
        } else {
            this.pipeGap = 100;
            this.pipeWidth = 40;
            this.bird.width = 20;
            this.bird.height = 15;
            this.gameSpeed = 2;
            this.jumpPower = -8;
            this.gravity = 0.5;
        }
        
        this.groundHeight = Math.max(30, this.canvas.height * 0.15);
        this.groundY = this.canvas.height - this.groundHeight;
        
        // Reset bird position
        this.bird.x = this.canvas.width * 0.25;
        this.bird.y = this.canvas.height * 0.5;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                case 'ArrowUp':
                case 'Enter':
                    e.preventDefault();
                    this.handleJump();
                    break;
                case 'Escape':
                    this.handleExit();
                    break;
            }
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        // Soft key controls
        // Soft key controls (CloudFone soft key bar)
        const leftSoft = document.getElementById('soft-key-left') || document.getElementById('jumpBtn');
        const rightSoft = document.getElementById('soft-key-right') || document.getElementById('exitBtn');
        if (leftSoft) {
            leftSoft.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleJump();
            });
        }
        if (rightSoft) {
            rightSoft.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleExit();
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    handleJump() {
        if (this.gameState === 'start') {
            this.startGame();
        } else if (this.gameState === 'playing' && this.bird.alive) {
            this.bird.velocity = this.jumpPower;
        } else if (this.gameState === 'gameOver') {
            this.resetGame();
        }
    }
    
    handleExit() {
        if (this.gameState === 'playing') {
            this.gameState = 'start';
            this.updateUI();
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.frameCount = 0;
        this.pipes = [];
        this.bird.velocity = 0;
        this.bird.alive = true;
        this.bird.y = this.canvas.height * 0.5;
        this.updateUI();
    }
    
    resetGame() {
        this.gameState = 'start';
        this.updateUI();
    }
    
    updateUI() {
        const startScreen = document.getElementById('startScreen');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const hud = document.getElementById('hud');
        const instructions = document.getElementById('instructions');
        
        // Hide all screens first
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        hud.classList.add('hidden');
        
        switch(this.gameState) {
            case 'start':
                startScreen.classList.remove('hidden');
                instructions.style.display = 'block';
                break;
            case 'playing':
                hud.classList.remove('hidden');
                instructions.style.display = 'none';
                break;
            case 'gameOver':
                gameOverScreen.classList.remove('hidden');
                instructions.style.display = 'block';
                document.getElementById('finalScore').textContent = this.score;
                document.getElementById('bestScore').textContent = this.bestScore;
                break;
        }
        
        // Update current score
        document.getElementById('currentScore').textContent = this.score;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.frameCount++;
        
        // Update bird physics
        if (this.bird.alive) {
            this.bird.velocity += this.gravity;
            this.bird.y += this.bird.velocity;
            
            // Check ground collision
            if (this.bird.y + this.bird.height >= this.groundY) {
                this.bird.y = this.groundY - this.bird.height;
                this.bird.alive = false;
                this.gameOver();
            }
            
            // Check ceiling collision
            if (this.bird.y <= 0) {
                this.bird.y = 0;
                this.bird.velocity = 0;
            }
        }
        
        // Generate pipes
        if (this.frameCount % this.pipeInterval === 0) {
            this.addPipe();
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.gameSpeed;
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Check collision with pipes
            if (this.bird.alive && this.checkCollision(this.bird, pipe)) {
                this.bird.alive = false;
                this.gameOver();
            }
            
            // Check if bird passed pipe (score)
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.updateUI();
            }
        }
    }
    
    addPipe() {
        const minHeight = 50;
        const maxHeight = this.groundY - this.pipeGap - minHeight;
        const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.groundY - (topHeight + this.pipeGap),
            passed: false
        });
    }
    
    checkCollision(bird, pipe) {
        // Check collision with top pipe
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + this.pipeWidth) {
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                return true;
            }
        }
        return false;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBirdBest', this.bestScore);
        }
        
        this.updateUI();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background - Flappy Bird style
        this.drawBackground();
        
        // Draw pipes
        this.drawPipes();
        
        // Draw ground with city skyline
        this.drawGround();
        
        // Draw bird
        this.drawBird();
        
        // Draw clouds
        this.drawClouds();
    }
    
    drawBackground() {
        // Sky gradient - cyan to light blue
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.groundY);
        gradient.addColorStop(0, '#4ec0ca');
        gradient.addColorStop(1, '#87ceeb');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.groundY);
    }
    
    drawPipes() {
        for (const pipe of this.pipes) {
            // Draw pipe body with gradient
            const pipeGradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            pipeGradient.addColorStop(0, '#228B22');
            pipeGradient.addColorStop(0.3, '#32CD32');
            pipeGradient.addColorStop(0.7, '#228B22');
            pipeGradient.addColorStop(1, '#006400');
            
            this.ctx.fillStyle = pipeGradient;
            
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Pipe caps with rounded edges
            this.ctx.fillStyle = '#32CD32';
            const capHeight = 20;
            const capWidth = this.pipeWidth + 6;
            const capX = pipe.x - 3;
            
            // Top cap
            this.drawRoundedRect(capX, pipe.topHeight - capHeight, capWidth, capHeight, 3);
            // Bottom cap
            this.drawRoundedRect(capX, pipe.bottomY, capWidth, capHeight, 3);
            
            // Add pipe shine effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(pipe.x + 2, 0, 3, pipe.topHeight);
            this.ctx.fillRect(pipe.x + 2, pipe.bottomY, 3, pipe.bottomHeight);
        }
    }
    
    drawGround() {
        // Ground base
        this.ctx.fillStyle = '#ded895';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.groundHeight);
        
        // Grass layer
        this.ctx.fillStyle = '#5ac54f';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 8);
        
        // Simple city skyline
        this.drawCitySkyline();
    }
    
    drawCitySkyline() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        const buildingWidth = 15;
        const numBuildings = Math.ceil(this.canvas.width / buildingWidth);
        
        for (let i = 0; i < numBuildings; i++) {
            const x = i * buildingWidth;
            const height = 20 + Math.random() * 15;
            this.ctx.fillRect(x, this.groundY - height, buildingWidth - 1, height);
            
            // Building windows
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < Math.floor(height / 8); k++) {
                    if (Math.random() > 0.5) {
                        this.ctx.fillRect(x + 2 + j * 6, this.groundY - height + 2 + k * 8, 3, 3);
                    }
                }
            }
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        }
    }
    
    drawBird() {
        const birdX = this.bird.x;
        const birdY = this.bird.y;
        const size = this.bird.width;
        
        // Bird rotation based on velocity
        const rotation = Math.max(-0.5, Math.min(0.5, this.bird.velocity * 0.1));
        
        this.ctx.save();
        this.ctx.translate(birdX + size/2, birdY + size/2);
        this.ctx.rotate(rotation);
        
        // Bird body - yellow with orange tint
        const bodyGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
        bodyGradient.addColorStop(0, '#ffdc00');
        bodyGradient.addColorStop(1, '#ffa500');
        this.ctx.fillStyle = bodyGradient;
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size*0.5, size*0.4, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Wing animation
        const wingFlap = Math.sin(this.frameCount * 0.3) * 0.3;
        this.ctx.fillStyle = '#ff8c00';
        this.ctx.beginPath();
        this.ctx.ellipse(-size*0.2, wingFlap - size*0.1, size*0.3, size*0.2, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(size*0.15, -size*0.15, size*0.15, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(size*0.2, -size*0.1, size*0.08, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#ff6600';
        this.ctx.beginPath();
        this.ctx.moveTo(size*0.4, 0);
        this.ctx.lineTo(size*0.7, -size*0.1);
        this.ctx.lineTo(size*0.7, size*0.1);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawClouds() {
        // Simple cloud effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const cloudOffset = (this.frameCount * 0.5) % (this.canvas.width + 60);
        
        for (let i = 0; i < 3; i++) {
            const x = -60 + cloudOffset + i * 100;
            const y = 30 + i * 20;
            this.drawCloud(x, y, 30 + i * 5);
        }
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.5, y, size * 0.7, 0, 2 * Math.PI);
        this.ctx.arc(x + size, y, size * 0.5, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.25, y - size * 0.5, size * 0.6, 0, 2 * Math.PI);
        this.ctx.arc(x + size * 0.75, y - size * 0.5, size * 0.6, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new FlappyBirdGame();
    
    // Make game globally accessible for debugging
    window.game = game;
});

// Service worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}