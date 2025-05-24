/**
 * Gravity-Flip Tetris - Piece Definitions
 * 
 * This file contains the definitions for all the tetromino pieces
 * and their rotations.
 */

// Define colors for each piece
const COLORS = {
    I: '#00f0f0', // Cyan
    O: '#f0f000', // Yellow
    T: '#a000f0', // Purple
    S: '#00f000', // Green
    Z: '#f00000', // Red
    J: '#0000f0', // Blue
    L: '#f0a000'  // Orange
};

// Define the shapes of each piece using a 4x4 grid
// 0 represents empty space, 1 represents a block
const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    O: [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    T: [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    S: [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
    ],
    Z: [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ],
    L: [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
    ]
};

class Piece {
    constructor(type) {
        this.type = type;
        this.shape = JSON.parse(JSON.stringify(SHAPES[type]));
        this.color = COLORS[type];
        this.x = 3; // Starting x position (center of the board)
        this.y = 0; // Starting y position (top of the board)
        this.rotation = 0; // Current rotation state (0, 1, 2, or 3)
    }

    /**
     * Returns a rotated copy of the current shape
     * @param {number} direction - 1 for clockwise, -1 for counter-clockwise
     * @returns {Array} The rotated shape matrix
     */
    getRotatedShape(direction = 1) {
        // Create a deep copy of the current shape
        const shape = JSON.parse(JSON.stringify(this.shape));
        const n = shape.length;
        
        // Create a new matrix for the rotated shape
        const rotated = Array(n).fill().map(() => Array(n).fill(0));
        
        if (direction === 1) { // Clockwise rotation
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    rotated[x][n - 1 - y] = shape[y][x];
                }
            }
        } else { // Counter-clockwise rotation
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    rotated[n - 1 - x][y] = shape[y][x];
                }
            }
        }
        
        return rotated;
    }

    /**
     * Rotate the piece clockwise
     */
    rotate() {
        this.shape = this.getRotatedShape(1);
        this.rotation = (this.rotation + 1) % 4;
    }

    /**
     * Gets a clone of this piece
     * @returns {Piece} A new piece with the same properties
     */
    clone() {
        const clone = new Piece(this.type);
        clone.shape = JSON.parse(JSON.stringify(this.shape));
        clone.x = this.x;
        clone.y = this.y;
        clone.rotation = this.rotation;
        return clone;
    }

    /**
     * Flips the piece for when gravity is reversed
     */
    flip() {
        // Flip the shape vertically
        this.shape.reverse();
    }
}

/**
 * Generate a random piece
 * @returns {Piece} A new random piece
 */
function getRandomPiece() {
    const types = Object.keys(SHAPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Piece(randomType);
}
