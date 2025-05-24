# Gravity-Flip Tetris

A unique take on the classic Tetris game, featuring a gravity-flipping mechanic that allows players to add pieces from both the top and bottom of the board.

## Features

- Classic Tetris gameplay with all standard tetromino pieces
- Gravity-flipping mechanic that changes the direction pieces fall
- Fill in gaps from both the top and bottom of the board
- Responsive design that works on different screen sizes
- Score system based on the classic Nintendo scoring
- Level progression that increases speed

## How to Play

1. Use the arrow keys to move and rotate the pieces:
   - Left/Right: Move piece horizontally
   - Up: Rotate piece
   - Down: Soft drop (move piece down faster)
   - Space: Hard drop (place piece instantly)
   - F: Flip gravity

2. Complete rows to clear them and score points.
3. As you clear more lines, the game will speed up.
4. The game ends when pieces stack up to the top (or bottom when gravity is flipped).

## Gravity Flip Mechanic

The unique feature of this game is the ability to flip gravity:

- When gravity is normal (down), pieces fall from top to bottom.
- When gravity is flipped (up), pieces fall from bottom to top.
- Flipping gravity allows you to fill gaps that would be impossible to reach in traditional Tetris.
- The flip action also flips the current piece to maintain its orientation relative to the direction of gravity.

## Running the Game

Simply open the `index.html` file in a web browser to start playing.

```
cd gravity-flip-tetris
# Then open index.html in your browser
```

## Development

The game is built with vanilla JavaScript, HTML5 Canvas, and CSS. The code is organized into several modules:

- `game.js`: Main game loop and rendering
- `board.js`: Game board and gravity management
- `pieces.js`: Tetromino piece definitions
- `controls.js`: User input handling

## Future Enhancements

- Mobile touch controls
- High score tracking
- Different game modes
- Sound effects and music
- Multiplayer functionality
