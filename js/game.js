/**
 * Gravity-Flip Tetris - Main Game Logic
 * 
 * This file contains the main game loop and rendering logic.
 */

class Game {
    constructor() {
        // Game elements
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextPieceCanvas = document.getElementById('next-piece-canvas');
        this.nextPieceCtx = this.nextPieceCanvas.getContext('2d');
        
        // Game properties
        this.board = new Board();
        this.blockSize = 30; // Size of each block in pixels
        this.frameRate = 60; // Frames per second
        this.dropInterval = 1000; // Milliseconds between automatic drops
        this.lastDropTime = 0; // Time of last drop
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        
        // Game state
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
        
        // Current and next pieces
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Set up the canvas dimensions
        this.resizeCanvas();
        
        // Set up controls
        this.controls = new Controls(this);
        
        // Start the game loop
        this.setupGame();
    }
    
    /**
     * Set up the canvas dimensions based on the board size
     */
    resizeCanvas() {
        this.canvas.width = this.board.width * this.blockSize;
        this.canvas.height = this.board.height * this.blockSize;
        
        this.nextPieceCanvas.width = 4 * this.blockSize;
        this.nextPieceCanvas.height = 4 * this.blockSize;
    }
    
    /**
     * Set up a new game
     */
    setupGame() {
        this.board.reset();
        this.currentPiece = getRandomPiece();
        this.nextPiece = getRandomPiece();
        
        // Set initial position based on gravity direction
        this.currentPiece.y = this.board.getStartY();
        
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        this.updateScore();
        this.render();
        
        // Update the start button text
        document.getElementById('start-btn').textContent = 'Start Game';
    }
    
    /**
     * Start or reset the game
     */
    start() {
        if (this.isGameOver) {
            this.setupGame();
        }
        
        this.isPlaying = true;
        this.isPaused = false;
        document.getElementById('start-btn').textContent = 'Pause';
        
        this.gameLoop();
    }
    
    /**
     * Pause the game
     */
    pause() {
        this.isPlaying = false;
        this.isPaused = true;
        document.getElementById('start-btn').textContent = 'Resume';
    }
    
    /**
     * Toggle between pause and play
     */
    togglePause() {
        if (this.isPaused || !this.isPlaying) {
            this.start();
        } else {
            this.pause();
        }
    }
    
    /**
     * Reset the game
     */
    reset() {
        this.setupGame();
        this.start();
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current time from requestAnimationFrame
     */
    gameLoop(timestamp = 0) {
        if (!this.isPlaying) return;
        
        // Calculate time since last drop
        const deltaTime = timestamp - this.lastDropTime;
        
        // Move piece down at regular intervals
        if (deltaTime > this.dropInterval) {
            this.moveDown();
            this.lastDropTime = timestamp;
        }
        
        // Render the game
        this.render();
        
        // Continue the game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    /**
     * Move the current piece down (or up if gravity is flipped)
     */
    moveDown() {
        const currentPiece = this.currentPiece;
        const board = this.board;
        
        let newY;
        if (board.gravityDirection === 'down') {
            newY = currentPiece.y + 1;
        } else {
            newY = currentPiece.y - 1;
        }
        
        if (board.isValidMove(currentPiece, currentPiece.x, newY)) {
            currentPiece.y = newY;
        } else {
            // Piece can't move, place it on the board
            this.placePiece();
        }
    }
    
    /**
     * Place the current piece on the board and get a new piece
     */
    placePiece() {
        // Add the current piece to the board
        this.board.placePiece(this.currentPiece);
        
        // Check for completed lines
        const linesCleared = this.board.clearLines();
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
        
        // Check for game over
        if (this.board.isGameOver()) {
            this.gameOver();
            return;
        }
        
        // Get the next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = getRandomPiece();
        
        // Set initial position based on gravity direction
        this.currentPiece.y = this.board.getStartY();
        
        // Render the updated board
        this.render();
        
        // Pause briefly when a new piece appears
        this.pauseForNewPiece();
    }
    
    /**
     * Pause briefly when a new piece appears
     */
    pauseForNewPiece() {
        // Save current state
        const wasPlaying = this.isPlaying;
        
        // Pause the game
        this.isPlaying = false;
        
        // Resume after a short delay (500ms)
        setTimeout(() => {
            // Only resume if the game was playing before
            if (wasPlaying && !this.isPaused && !this.isGameOver) {
                this.isPlaying = true;
                this.gameLoop(performance.now());
            }
        }, 500);
    }
    
    /**
     * Update the score based on lines cleared
     * @param {number} linesCleared - Number of lines cleared
     */
    updateScore(linesCleared = 0) {
        if (linesCleared > 0) {
            // Original Nintendo scoring system
            const linePoints = [0, 40, 100, 300, 1200];
            this.score += linePoints[linesCleared] * this.level;
            
            // Update lines cleared and level
            this.linesCleared += linesCleared;
            this.level = Math.floor(this.linesCleared / 10) + 1;
            
            // Increase speed as level increases
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
        
        // Update the score display
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
    }
    
    /**
     * Game over logic
     */
    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        document.getElementById('start-btn').textContent = 'New Game';
        
        // Draw "Game Over" text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 15);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    /**
     * Render the game state
     */
    render() {
        this.renderBoard();
        this.renderCurrentPiece();
        this.renderNextPiece();
    }
    
    /**
     * Render the game board
     */
    renderBoard() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the background grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        // Draw vertical lines
        for (let x = 0; x <= this.board.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.board.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
        
        // Draw the placed blocks
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                if (this.board.grid[y][x]) {
                    this.drawBlock(x, y, this.board.grid[y][x]);
                }
            }
        }
    }
    
    /**
     * Render the current piece
     */
    renderCurrentPiece() {
        if (!this.currentPiece) return;
        
        const shape = this.currentPiece.shape;
        const color = this.currentPiece.color;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(
                        this.currentPiece.x + x,
                        this.currentPiece.y + y,
                        color
                    );
                }
            }
        }
    }
    
    /**
     * Render the next piece preview
     */
    renderNextPiece() {
        if (!this.nextPiece) return;
        
        // Clear the next piece canvas
        this.nextPieceCtx.clearRect(
            0, 0, 
            this.nextPieceCanvas.width, 
            this.nextPieceCanvas.height
        );
        
        const shape = this.nextPiece.shape;
        const color = this.nextPiece.color;
        
        // Draw the next piece centered in the preview
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    // Draw each block of the piece
                    this.nextPieceCtx.fillStyle = color;
                    this.nextPieceCtx.fillRect(
                        x * this.blockSize, 
                        y * this.blockSize, 
                        this.blockSize, 
                        this.blockSize
                    );
                    
                    // Draw block border
                    this.nextPieceCtx.strokeStyle = '#000';
                    this.nextPieceCtx.lineWidth = 2;
                    this.nextPieceCtx.strokeRect(
                        x * this.blockSize, 
                        y * this.blockSize, 
                        this.blockSize, 
                        this.blockSize
                    );
                }
            }
        }
    }
    
    /**
     * Draw a single block on the canvas
     * @param {number} x - X position on the board
     * @param {number} y - Y position on the board
     * @param {string} color - Color of the block
     */
    drawBlock(x, y, color) {
        // Block position
        const posX = x * this.blockSize;
        const posY = y * this.blockSize;
        
        // Draw the block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(posX, posY, this.blockSize, this.blockSize);
        
        // Draw highlight (3D effect)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(posX, posY);
        this.ctx.lineTo(posX + this.blockSize, posY);
        this.ctx.lineTo(posX + this.blockSize, posY + this.blockSize);
        this.ctx.lineTo(posX, posY + this.blockSize);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw block border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(posX, posY, this.blockSize, this.blockSize);
    }
}

// Initialize the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
    
    // Expose game instance globally for debugging
    window.tetrisGame = game;
});
