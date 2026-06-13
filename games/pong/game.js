// ===== PONG GAME - Complete Implementation =====

class PongGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameRunning = true;
        this.gamePaused = false;
        
        // Ball properties
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            speedX: 5,
            speedY: 5,
            maxSpeed: 8
        };
        
        // Paddle properties
        this.paddleHeight = 100;
        this.paddleWidth = 15;
        
        // Player paddle (left)
        this.playerPaddle = {
            x: 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 7,
            velocityY: 0
        };
        
        // Computer paddle (right)
        this.computerPaddle = {
            x: this.canvas.width - 35,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 5.5
        };
        
        // Scores
        this.playerScore = 0;
        this.computerScore = 0;
        
        // Input handling
        this.keys = {};
        this.mouseY = 0;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Reset game with Space
            if (e.key === ' ') {
                e.preventDefault();
                this.resetGame();
            }
            
            // Pause with P
            if (e.key.toLowerCase() === 'p') {
                this.gamePaused = !this.gamePaused;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top;
        });
    }
    
    resetGame() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
        
        this.playerPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.computerPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
    }
    
    gameLoop = () => {
        if (!this.gamePaused) {
            this.update();
        }
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
    
    update() {
        // Update player paddle position
        this.updatePlayerPaddle();
        
        // Update computer paddle (AI)
        this.updateComputerPaddle();
        
        // Update ball
        this.updateBall();
        
        // Check collisions
        this.checkCollisions();
    }
    
    updatePlayerPaddle() {
        // Mouse control (primary)
        this.playerPaddle.y = this.mouseY - this.paddleHeight / 2;
        
        // Arrow keys override (secondary)
        if (this.keys['arrowup']) {
            this.playerPaddle.y -= this.playerPaddle.speed;
        }
        if (this.keys['arrowdown']) {
            this.playerPaddle.y += this.playerPaddle.speed;
        }
        
        // Boundary checking
        if (this.playerPaddle.y < 0) {
            this.playerPaddle.y = 0;
        }
        if (this.playerPaddle.y + this.paddleHeight > this.canvas.height) {
            this.playerPaddle.y = this.canvas.height - this.paddleHeight;
        }
    }
    
    updateComputerPaddle() {
        const computerCenter = this.computerPaddle.y + this.paddleHeight / 2;
        const ballCenter = this.ball.y;
        
        // Simple AI: follow the ball with some error margin
        const errorMargin = 35;
        
        if (computerCenter < ballCenter - errorMargin) {
            this.computerPaddle.y += this.computerPaddle.speed;
        } else if (computerCenter > ballCenter + errorMargin) {
            this.computerPaddle.y -= this.computerPaddle.speed;
        }
        
        // Boundary checking
        if (this.computerPaddle.y < 0) {
            this.computerPaddle.y = 0;
        }
        if (this.computerPaddle.y + this.paddleHeight > this.canvas.height) {
            this.computerPaddle.y = this.canvas.height - this.paddleHeight;
        }
    }
    
    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Top and bottom wall collisions
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.speedY = -this.ball.speedY;
            this.playSound('wall');
        }
        
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.speedY = -this.ball.speedY;
            this.playSound('wall');
        }
        
        // Scoring
        if (this.ball.x - this.ball.radius < 0) {
            this.computerScore++;
            this.playSound('score');
            this.resetBall();
        }
        
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.playerScore++;
            this.playSound('score');
            this.resetBall();
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    checkCollisions() {
        // Player paddle collision
        this.checkPaddleCollision(this.playerPaddle);
        
        // Computer paddle collision
        this.checkPaddleCollision(this.computerPaddle);
    }
    
    checkPaddleCollision(paddle) {
        // Check if ball is at paddle's x position
        if (this.ball.speedX > 0) {
            // Ball moving right - check computer paddle
            if (paddle === this.computerPaddle) {
                if (this.ball.x + this.ball.radius >= paddle.x &&
                    this.ball.x + this.ball.radius <= paddle.x + paddle.width + 10 &&
                    this.ball.y >= paddle.y &&
                    this.ball.y <= paddle.y + paddle.height) {
                    
                    this.ball.speedX = -this.ball.speedX;
                    this.ball.x = paddle.x - this.ball.radius;
                    
                    // Add spin based on paddle position
                    const deltaY = (paddle.y + paddle.height / 2) - this.ball.y;
                    this.ball.speedY = deltaY * 0.1;
                    
                    // Increase speed slightly
                    if (Math.abs(this.ball.speedX) < this.ball.maxSpeed) {
                        this.ball.speedX *= 1.05;
                    }
                    
                    this.playSound('paddle');
                }
            }
        } else {
            // Ball moving left - check player paddle
            if (paddle === this.playerPaddle) {
                if (this.ball.x - this.ball.radius <= paddle.x + paddle.width &&
                    this.ball.x - this.ball.radius >= paddle.x - 10 &&
                    this.ball.y >= paddle.y &&
                    this.ball.y <= paddle.y + paddle.height) {
                    
                    this.ball.speedX = -this.ball.speedX;
                    this.ball.x = paddle.x + paddle.width + this.ball.radius;
                    
                    // Add spin based on paddle position
                    const deltaY = (paddle.y + paddle.height / 2) - this.ball.y;
                    this.ball.speedY = deltaY * 0.1;
                    
                    // Increase speed slightly
                    if (Math.abs(this.ball.speedX) < this.ball.maxSpeed) {
                        this.ball.speedX *= 1.05;
                    }
                    
                    this.playSound('paddle');
                }
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.setLineDash([10, 10]);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.drawPaddle(this.playerPaddle, '#ff00ff');
        this.drawPaddle(this.computerPaddle, '#00ffff');
        
        // Draw ball
        this.drawBall();
        
        // Update scoreboard
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('computerScore').textContent = this.computerScore;
        
        // Draw pause indicator
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    drawPaddle(paddle, color) {
        // Glow effect
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 15;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
    }
    
    drawBall() {
        // Glow effect
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 20;
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
    }
    
    playSound(type) {
        // Create simple web audio sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        try {
            if (type === 'paddle') {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'wall') {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
                
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'score') {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1000, now + 0.05);
                osc.frequency.setValueAtTime(800, now + 0.1);
                
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {
            // Audio context not available or error - silently fail
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});