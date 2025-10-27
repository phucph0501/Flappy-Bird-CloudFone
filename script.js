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
        document.getElementById('jumpBtn').addEventListener('click', () => {
            this.handleJump();
        });
        
        document.getElementById('exitBtn').addEventListener('click', () => {
            this.handleExit();
        });
        
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
        
        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#70c5ce');
        gradient.addColorStop(0.5, '#bde3e8');
        gradient.addColorStop(0.5, '#ded895');
        gradient.addColorStop(1, '#87ceeb');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#228B22';
        for (const pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // Pipe caps
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillRect(pipe.x - 3, pipe.topHeight - 15, this.pipeWidth + 6, 15);
            this.ctx.fillRect(pipe.x - 3, pipe.bottomY, this.pipeWidth + 6, 15);
            this.ctx.fillStyle = '#228B22';
        }
        
        // Draw ground
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.groundHeight);
        
        // Draw grass on ground
        this.ctx.fillStyle = '#9ACD32';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 8);
        
        // Draw bird
        if (this.bird.alive) {
            this.ctx.fillStyle = this.bird.color;
        } else {
            this.ctx.fillStyle = '#FF4444';
        }
        
        // Bird body
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.bird.x + this.bird.width/2, 
            this.bird.y + this.bird.height/2, 
            this.bird.width/2, 
            this.bird.height/2, 
            0, 0, 2 * Math.PI
        );
        this.ctx.fill();
        
        // Bird wing (simple animation)
        if (this.frameCount % 10 < 5) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.ellipse(
                this.bird.x + this.bird.width * 0.3, 
                this.bird.y + this.bird.height * 0.4, 
                this.bird.width * 0.3, 
                this.bird.height * 0.2, 
                0, 0, 2 * Math.PI
            );
            this.ctx.fill();
        }
        
        // Bird eye
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(
            this.bird.x + this.bird.width * 0.6, 
            this.bird.y + this.bird.height * 0.3, 
            this.bird.width * 0.15, 
            0, 2 * Math.PI
        );
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(
            this.bird.x + this.bird.width * 0.65, 
            this.bird.y + this.bird.height * 0.3, 
            this.bird.width * 0.08, 
            0, 2 * Math.PI
        );
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.width, this.bird.y + this.bird.height * 0.5);
        this.ctx.lineTo(this.bird.x + this.bird.width + 8, this.bird.y + this.bird.height * 0.4);
        this.ctx.lineTo(this.bird.x + this.bird.width + 8, this.bird.y + this.bird.height * 0.6);
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