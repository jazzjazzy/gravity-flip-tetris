/**
 * Gravity-Flip Tetris - Board Management
 * 
 * This file handles the game board and gravity mechanics.
 */

class Board {
    constructor(width = 10, height = 20) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
        this.gravityDirection = 'down'; // 'down' or 'up'
    }

    /**
     * Create an empty grid
     * @returns {Array} 2D array representing the board
     */
    createEmptyGrid() {
        return Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    /**
     * Reset the board
     */
    reset() {
        this.grid = this.createEmptyGrid();
        this.gravityDirection = 'down';
    }

    /**
     * Check if a piece can move to a new position
     * @param {Piece} piece - The piece to check
     * @param {number} newX - New X position
     * @param {number} newY - New Y position
     * @param {Array} shape - Shape to check (used for rotation validation)
     * @returns {boolean} True if the move is valid
     */
    isValidMove(piece, newX, newY, shape = piece.shape) {
        const n = shape.length;
        
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                if (shape[y][x]) {
                    // Calculate actual position on the board
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    // Check boundaries
                    if (boardX < 0 || boardX >= this.width || 
                        boardY < 0 || boardY >= this.height) {
                        return false;
                    }
                    
                    // Check collision with placed blocks
                    if (this.grid[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * Place a piece on the board
     * @param {Piece} piece - The piece to place
     */
    placePiece(piece) {
        const shape = piece.shape;
        const n = shape.length;
        
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                if (shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    this.grid[boardY][boardX] = piece.color;
                }
            }
        }
    }

    /**
     * Check for completed lines and clear them
     * @returns {number} Number of lines cleared
     */
    clearLines() {
        let linesCleared = 0;
        
        // For gravity down, check from bottom to top
        if (this.gravityDirection === 'down') {
            for (let y = this.height - 1; y >= 0; y--) {
                if (this.isLineComplete(y)) {
                    this.clearLine(y);
                    this.shiftLinesDown(y);
                    y++; // Check the same line again as lines shifted down
                    linesCleared++;
                }
            }
        } 
        // For gravity up, check from top to bottom
        else {
            for (let y = 0; y < this.height; y++) {
                if (this.isLineComplete(y)) {
                    this.clearLine(y);
                    this.shiftLinesUp(y);
                    y--; // Check the same line again as lines shifted up
                    linesCleared++;
                }
            }
        }
        
        return linesCleared;
    }

    /**
     * Check if a line is complete (filled with blocks)
     * @param {number} y - Y position of the line
     * @returns {boolean} True if the line is complete
     */
    isLineComplete(y) {
        for (let x = 0; x < this.width; x++) {
            if (!this.grid[y][x]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Clear a line
     * @param {number} y - Y position of the line to clear
     */
    clearLine(y) {
        for (let x = 0; x < this.width; x++) {
            this.grid[y][x] = 0;
        }
    }

    /**
     * Shift lines down after a line is cleared (for normal gravity)
     * @param {number} clearedY - Y position of the cleared line
     */
    shiftLinesDown(clearedY) {
        for (let y = clearedY; y > 0; y--) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = this.grid[y - 1][x];
            }
        }
        
        // Clear the top line
        for (let x = 0; x < this.width; x++) {
            this.grid[0][x] = 0;
        }
    }

    /**
     * Shift lines up after a line is cleared (for reversed gravity)
     * @param {number} clearedY - Y position of the cleared line
     */
    shiftLinesUp(clearedY) {
        for (let y = clearedY; y < this.height - 1; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = this.grid[y + 1][x];
            }
        }
        
        // Clear the bottom line
        for (let x = 0; x < this.width; x++) {
            this.grid[this.height - 1][x] = 0;
        }
    }

    /**
     * Flip gravity direction
     * This changes how pieces fall and how lines are cleared
     * Also flips the entire grid to maintain the same arrangement
     */
    flipGravity() {
        // Change gravity direction
        this.gravityDirection = this.gravityDirection === 'down' ? 'up' : 'down';
        
        // Flip the entire grid
        this.flipGrid();
        
        return this.gravityDirection;
    }
    
    /**
     * Move all blocks to the opposite side of the board when gravity changes
     * This maintains the same arrangement of blocks but moves them to the opposite side
     */
    flipGrid() {
        // Create a new empty grid
        const newGrid = this.createEmptyGrid();
        
        // Find the top and bottom filled rows
        let topFilledRow = this.height;
        let bottomFilledRow = -1;
        
        for (let y = 0; y < this.height; y++) {
            let rowHasBlock = false;
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) {
                    rowHasBlock = true;
                    topFilledRow = Math.min(topFilledRow, y);
                    bottomFilledRow = Math.max(bottomFilledRow, y);
                    break;
                }
            }
        }
        
        // If no blocks on the board, nothing to move
        if (bottomFilledRow === -1) return;
        
        // Calculate the height of the filled area
        const filledHeight = bottomFilledRow - topFilledRow + 1;
        
        // Calculate the offset to move blocks to the opposite side
        let offset;
        if (this.gravityDirection === 'up') {
            // Moving blocks from bottom to top
            offset = topFilledRow;
        } else {
            // Moving blocks from top to bottom
            offset = this.height - bottomFilledRow - 1;
        }
        
        // Move blocks to the opposite side while maintaining their arrangement
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) {
                    let newY;
                    if (this.gravityDirection === 'up') {
                        // Moving from bottom to top
                        newY = y - offset;
                    } else {
                        // Moving from top to bottom
                        newY = y + offset;
                    }
                    newGrid[newY][x] = this.grid[y][x];
                }
            }
        }
        
        // Replace the old grid with the new one
        this.grid = newGrid;
    }

    /**
     * Get the Y position for a new piece based on gravity direction
     * @returns {number} Starting Y position
     */
    getStartY() {
        return this.gravityDirection === 'down' ? 0 : this.height - 4;
    }

    /**
     * Check if game is over (blocks in the spawn area)
     * @returns {boolean} True if game is over
     */
    isGameOver() {
        if (this.gravityDirection === 'down') {
            // Check if there are blocks in the top rows
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.grid[y][x]) {
                        return true;
                    }
                }
            }
        } else {
            // Check if there are blocks in the bottom rows
            for (let y = this.height - 4; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.grid[y][x]) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
}
