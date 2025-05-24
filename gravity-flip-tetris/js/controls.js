/**
 * Gravity-Flip Tetris - Controls
 * 
 * This file handles user input and controls for the game.
 */

class Controls {
    constructor(game) {
        this.game = game;
        this.setupKeyboardControls();
        this.setupButtonControls();
    }

    /**
     * Set up keyboard event listeners
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (!this.game.isPlaying) return;
            
            switch (event.key) {
                case 'j':
                case 'J':
                    this.moveLeft();
                    break;
                case 'l':
                case 'L':
                    this.moveRight();
                    break;
                case 'k':
                case 'K':
                    this.rotate();
                    break;
                case 'ArrowDown':
                    this.softDrop();
                    break;
                case ' ': // Space key
                    this.hardDrop();
                    break;
                case 'f':
                case 'F':
                    this.flipGravity();
                    break;
                case 'p':
                case 'P':
                    this.game.togglePause();
                    break;
            }
        });
    }

    /**
     * Set up button controls
     */
    setupButtonControls() {
        // Start/Pause button
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            if (!this.game.isGameOver) {
                this.game.togglePause();
            } else {
                this.game.reset();
            }
        });

        // Gravity flip button
        const flipBtn = document.getElementById('gravity-flip-btn');
        flipBtn.addEventListener('click', () => {
            if (this.game.isPlaying) {
                this.flipGravity();
            }
        });
    }

    /**
     * Move the current piece left
     */
    moveLeft() {
        const currentPiece = this.game.currentPiece;
        if (this.game.board.isValidMove(currentPiece, currentPiece.x - 1, currentPiece.y)) {
            currentPiece.x--;
            this.game.render();
        }
    }

    /**
     * Move the current piece right
     */
    moveRight() {
        const currentPiece = this.game.currentPiece;
        if (this.game.board.isValidMove(currentPiece, currentPiece.x + 1, currentPiece.y)) {
            currentPiece.x++;
            this.game.render();
        }
    }

    /**
     * Rotate the current piece
     */
    rotate() {
        const currentPiece = this.game.currentPiece;
        const rotatedShape = currentPiece.getRotatedShape();
        
        // Try normal rotation
        if (this.game.board.isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotatedShape)) {
            currentPiece.rotate();
            this.game.render();
            return;
        }
        
        // Wall kicks - try to shift the piece if rotation would hit a wall
        const kicks = [
            { x: -1, y: 0 }, // try left
            { x: 1, y: 0 },  // try right
            { x: 0, y: -1 }, // try up (or down in flipped gravity)
            { x: -2, y: 0 }, // try 2 left (for I piece)
            { x: 2, y: 0 },  // try 2 right (for I piece)
        ];
        
        for (const kick of kicks) {
            if (this.game.board.isValidMove(
                currentPiece, 
                currentPiece.x + kick.x, 
                currentPiece.y + kick.y, 
                rotatedShape
            )) {
                currentPiece.x += kick.x;
                currentPiece.y += kick.y;
                currentPiece.rotate();
                this.game.render();
                return;
            }
        }
    }

    /**
     * Soft drop - move piece down (or up) faster
     */
    softDrop() {
        this.game.moveDown();
        // Add a small score bonus for manual soft drop
        this.game.score += 1;
        this.game.updateScore();
    }

    /**
     * Hard drop - move piece all the way down (or up) instantly
     */
    hardDrop() {
        let dropDistance = 0;
        const currentPiece = this.game.currentPiece;
        const board = this.game.board;
        
        if (board.gravityDirection === 'down') {
            // Move down until collision
            while (board.isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
                dropDistance++;
            }
        } else {
            // Move up until collision
            while (board.isValidMove(currentPiece, currentPiece.x, currentPiece.y - 1)) {
                currentPiece.y--;
                dropDistance++;
            }
        }
        
        // Add score bonus for hard drop (2 points per cell)
        this.game.score += dropDistance * 2;
        
        // Place the piece and get a new one
        this.game.placePiece();
        this.game.updateScore();
    }

    /**
     * Flip gravity
     */
    flipGravity() {
        // Get the new gravity direction
        const newDirection = this.game.board.flipGravity();
        
        // If there's a current piece, adjust its position for the new gravity
        if (this.game.currentPiece) {
            // Flip the piece's internal representation
            this.game.currentPiece.flip();
            
            // Calculate the new Y position for the piece
            const pieceHeight = this.getEffectiveHeight(this.game.currentPiece);
            
            // Flip the piece's position to the opposite side of the board
            // while maintaining its relative position
            this.game.currentPiece.y = this.game.board.height - this.game.currentPiece.y - pieceHeight;
            
            // Make sure the piece doesn't go out of bounds
            if (this.game.currentPiece.y < 0) {
                this.game.currentPiece.y = 0;
            }
            if (this.game.currentPiece.y + pieceHeight > this.game.board.height) {
                this.game.currentPiece.y = this.game.board.height - pieceHeight;
            }
        }
        
        // Update the next piece's starting position for the next drop
        if (this.game.nextPiece) {
            // The next piece will start from the correct side when it becomes current
            this.game.nextPiece.y = this.game.board.getStartY();
        }
        
        // Render the updated board and piece
        this.game.render();
    }
    
    /**
     * Get the effective height of a piece (number of rows it occupies)
     * @param {Piece} piece - The piece to measure
     * @returns {number} The effective height
     */
    getEffectiveHeight(piece) {
        const shape = piece.shape;
        let minRow = 4;
        let maxRow = 0;
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y][x]) {
                    minRow = Math.min(minRow, y);
                    maxRow = Math.max(maxRow, y);
                }
            }
        }
        
        return maxRow - minRow + 1;
    }
}
