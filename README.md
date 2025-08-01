# ♔ Chess Game - 1v1 Offline ♛

A fully functional chess game built for GitHub Pages with modern UI and complete chess rules implementation.

## 🎮 Features

### Core Gameplay
- **Complete Chess Rules**: All standard chess pieces with proper movement validation
- **1v1 Offline Mode**: Perfect for two players on the same device
- **Visual Move Hints**: Highlights valid moves and captures
- **Piece Selection**: Click to select and move pieces with visual feedback

### Time Control
- **Configurable Time Limits**: 1, 3, 5, 10, 15, or 30 minutes per player
- **Increment Options**: 0, 1, 2, 3, or 5 seconds added per move
- **Visual Time Warnings**: Timer pulses red when under 1 minute
- **Automatic Timeout**: Game ends when a player runs out of time

### Game Controls
- **New Game**: Start a fresh game at any time
- **Undo Move**: Take back the last move made
- **Flip Board**: Rotate the board 180° to see from opponent's perspective
- **Pause/Resume**: Pause the game and timers

### Game State Management
- **Check Detection**: Automatically detects when a king is in check
- **Checkmate Detection**: Game ends when checkmate occurs
- **Stalemate Detection**: Game ends in draw when no legal moves remain
- **Move History**: Complete record of all moves made
- **Captured Pieces**: Visual display of captured pieces for each player

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient background and glass-morphism effects
- **Smooth Animations**: Hover effects and transitions throughout
- **Accessible**: Clear visual feedback and intuitive controls

## 🚀 How to Play

1. **Starting**: White always moves first
2. **Moving Pieces**: Click on a piece to select it, then click on a valid square to move
3. **Valid Moves**: Green squares show valid moves, red squares show valid captures
4. **Game End**: The game ends with checkmate, stalemate, or timeout

## 🛠️ Technical Implementation

### Technologies Used
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **Vanilla JavaScript**: No external dependencies, pure ES6+ code
- **Unicode Chess Symbols**: High-quality chess piece representation

### Key Components
- **ChessGame Class**: Main game logic and state management
- **Move Validation**: Complete chess rules implementation
- **Timer System**: Real-time countdown with pause functionality
- **UI Management**: Dynamic board updates and visual feedback

## 📱 GitHub Pages Setup

This chess game is designed to work perfectly on GitHub Pages:

1. **Repository Setup**: All files are ready for immediate deployment
2. **No Build Process**: Pure HTML/CSS/JS - no compilation needed
3. **Fast Loading**: Optimized for quick page loads
4. **Mobile Friendly**: Responsive design works on all devices

### Files Structure
```
├── index.html          # Main game page
├── styles.css          # Complete styling
├── chess.js           # Game logic and functionality
└── README.md          # This file
```

## 🎯 Game Rules Implemented

### Piece Movements
- **Pawns**: Forward movement, diagonal captures, double move from starting position
- **Rooks**: Horizontal and vertical movement
- **Knights**: L-shaped movement (2+1 squares)
- **Bishops**: Diagonal movement
- **Queens**: Combination of rook and bishop movements
- **Kings**: One square in any direction

### Special Rules
- **Pawn Promotion**: Automatically promotes to queen when reaching the opposite end
- **Check Detection**: Prevents moves that would put your own king in check
- **Legal Move Validation**: Only allows moves that follow chess rules

## 🔧 Customization

The game is easily customizable:

- **Time Controls**: Modify the time control options in the HTML
- **Styling**: Update colors and layout in `styles.css`
- **Game Logic**: Extend chess rules in `chess.js`

## 🌟 Future Enhancements

Potential additions for future versions:
- En passant moves
- Castling
- Pawn promotion choice (queen, rook, bishop, knight)
- Game save/load functionality
- Move notation (algebraic notation)
- Sound effects
- AI opponent

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing chess! ♔♛**