class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameState = 'playing'; // playing, check, checkmate, stalemate, draw
        this.isPaused = false;
        this.boardFlipped = false;
        
        // Time control
        this.timeControl = 10; // minutes
        this.increment = 0; // seconds
        this.whiteTime = this.timeControl * 60;
        this.blackTime = this.timeControl * 60;
        this.timerInterval = null;
        this.lastMoveTime = Date.now();
        
        this.initializeUI();
        this.setupEventListeners();
        this.startTimer();
        this.updateDisplay();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up pieces
        const initialSetup = {
            0: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            1: ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            6: ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            7: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        };

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (initialSetup[row]) {
                    board[row][col] = {
                        piece: initialSetup[row][col],
                        color: row < 2 ? 'black' : 'white'
                    };
                }
            }
        }
        
        return board;
    }

    initializeUI() {
        const boardElement = document.getElementById('chess-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    square.innerHTML = `<span class="piece">${piece.piece}</span>`;
                }
                
                boardElement.appendChild(square);
            }
        }
    }

    setupEventListeners() {
        const board = document.getElementById('chess-board');
        board.addEventListener('click', (e) => {
            if (e.target.classList.contains('square') || e.target.classList.contains('piece')) {
                const square = e.target.classList.contains('square') ? e.target : e.target.parentElement;
                this.handleSquareClick(parseInt(square.dataset.row), parseInt(square.dataset.col));
            }
        });

        // Game control buttons
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('flip-board-btn').addEventListener('click', () => this.flipBoard());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());

        // Modal buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.closeModal('game-over-modal');
            this.newGame();
        });
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.closeModal('game-over-modal');
        });
        document.getElementById('apply-settings-btn').addEventListener('click', () => this.applySettings());
        document.getElementById('close-settings-btn').addEventListener('click', () => this.closeModal('settings-modal'));
    }

    handleSquareClick(row, col) {
        if (this.gameState !== 'playing' || this.isPaused) return;

        const piece = this.board[row][col];
        
        // If no piece is selected and clicked square has a piece of current player's color
        if (!this.selectedSquare && piece && piece.color === this.currentPlayer) {
            this.selectSquare(row, col);
        }
        // If a piece is selected and clicked square is a valid move
        else if (this.selectedSquare && this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
            this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
        }
        // If a piece is selected and clicked square has a piece of current player's color, select new piece
        else if (this.selectedSquare && piece && piece.color === this.currentPlayer) {
            this.selectSquare(row, col);
        }
        // Deselect current piece
        else if (this.selectedSquare) {
            this.clearSelection();
        }
    }

    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        
        // Highlight selected square
        const square = this.getSquareElement(row, col);
        square.classList.add('selected');
        
        // Highlight valid moves
        this.validMoves.forEach(move => {
            const targetSquare = this.getSquareElement(move.row, move.col);
            if (this.board[move.row][move.col]) {
                targetSquare.classList.add('valid-capture');
            } else {
                targetSquare.classList.add('valid-move');
            }
        });
    }

    clearSelection() {
        if (this.selectedSquare) {
            const square = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
            square.classList.remove('selected');
            
            this.validMoves.forEach(move => {
                const targetSquare = this.getSquareElement(move.row, move.col);
                targetSquare.classList.remove('valid-move', 'valid-capture');
            });
            
            this.selectedSquare = null;
            this.validMoves = [];
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const fromPiece = this.board[fromRow][fromCol];
        const toPiece = this.board[toRow][toCol];
        
        // Record move
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: fromPiece.piece,
            captured: toPiece ? toPiece.piece : null,
            color: fromPiece.color
        };
        
        // Handle captured piece
        if (toPiece) {
            this.capturedPieces[this.currentPlayer].push(toPiece.piece);
        }
        
        // Make the move
        this.board[toRow][toCol] = fromPiece;
        this.board[fromRow][fromCol] = null;
        
        // Handle special moves
        this.handleSpecialMoves(move);
        
        // Update move history
        this.moveHistory.push(move);
        
        // Add increment to the player who just moved
        if (this.currentPlayer === 'white') {
            this.whiteTime += this.increment;
        } else {
            this.blackTime += this.increment;
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update game state
        this.updateGameState();
        
        // Clear selection and update display
        this.clearSelection();
        this.updateDisplay();
        
        // Check for game end conditions
        this.checkGameEnd();
    }

    handleSpecialMoves(move) {
        const piece = move.piece;
        const fromRow = move.from.row;
        const toRow = move.to.row;
        const fromCol = move.from.col;
        const toCol = move.to.col;
        
        // Pawn promotion
        if ((piece === '♙' && toRow === 0) || (piece === '♟' && toRow === 7)) {
            this.board[toRow][toCol].piece = '♕'; // Promote to queen
        }
        
        // En passant (simplified - would need more complex logic for full implementation)
        // Castling (simplified - would need more complex logic for full implementation)
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const pieceType = piece.piece;
        const color = piece.color;
        
        switch (pieceType) {
            case '♙': // White pawn
            case '♟': // Black pawn
                moves.push(...this.getPawnMoves(row, col, color));
                break;
            case '♖': // White rook
            case '♜': // Black rook
                moves.push(...this.getRookMoves(row, col, color));
                break;
            case '♘': // White knight
            case '♞': // Black knight
                moves.push(...this.getKnightMoves(row, col, color));
                break;
            case '♗': // White bishop
            case '♝': // Black bishop
                moves.push(...this.getBishopMoves(row, col, color));
                break;
            case '♕': // White queen
            case '♛': // Black queen
                moves.push(...this.getQueenMoves(row, col, color));
                break;
            case '♔': // White king
            case '♚': // Black king
                moves.push(...this.getKingMoves(row, col, color));
                break;
        }
        
        return moves;
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        const forwardRow = row + direction;
        if (forwardRow >= 0 && forwardRow < 8 && !this.board[forwardRow][col]) {
            moves.push({ row: forwardRow, col: col });
            
            // Double move from starting position
            if (row === startRow && !this.board[forwardRow + direction][col]) {
                moves.push({ row: forwardRow + direction, col: col });
            }
        }
        
        // Diagonal captures
        const captureCols = [col - 1, col + 1];
        captureCols.forEach(captureCol => {
            if (captureCol >= 0 && captureCol < 8 && forwardRow >= 0 && forwardRow < 8) {
                const targetPiece = this.board[forwardRow][captureCol];
                if (targetPiece && targetPiece.color !== color) {
                    moves.push({ row: forwardRow, col: captureCol });
                }
            }
        });
        
        return moves;
    }

    getRookMoves(row, col, color) {
        return this.getLinearMoves(row, col, color, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getBishopMoves(row, col, color) {
        return this.getLinearMoves(row, col, color, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getQueenMoves(row, col, color) {
        return this.getLinearMoves(row, col, color, [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        kingMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getLinearMoves(row, col, color, directions) {
        const moves = [];
        
        directions.forEach(([dRow, dCol]) => {
            let currentRow = row + dRow;
            let currentCol = col + dCol;
            
            while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
                const targetPiece = this.board[currentRow][currentCol];
                
                if (!targetPiece) {
                    moves.push({ row: currentRow, col: currentCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: currentRow, col: currentCol });
                    }
                    break;
                }
                
                currentRow += dRow;
                currentCol += dCol;
            }
        });
        
        return moves;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.validMoves.some(move => move.row === toRow && move.col === toCol);
    }

    updateGameState() {
        // Check if current player is in check
        const kingPosition = this.findKing(this.currentPlayer);
        if (this.isSquareUnderAttack(kingPosition.row, kingPosition.col, this.currentPlayer)) {
            this.gameState = 'check';
        } else {
            this.gameState = 'playing';
        }
    }

    findKing(color) {
        const kingPiece = color === 'white' ? '♔' : '♚';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.piece === kingPiece && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isSquareUnderAttack(row, col, defendingColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color !== defendingColor) {
                    const moves = this.getValidMoves(r, c);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkGameEnd() {
        // Check for checkmate or stalemate
        const hasLegalMoves = this.hasLegalMoves();
        
        if (this.gameState === 'check' && !hasLegalMoves) {
            this.endGame('checkmate');
        } else if (this.gameState === 'playing' && !hasLegalMoves) {
            this.endGame('stalemate');
        }
    }

    hasLegalMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    endGame(result) {
        this.gameState = result;
        this.stopTimer();
        this.showGameOverModal(result);
    }

    updateDisplay() {
        // Update board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.getSquareElement(row, col);
                const piece = this.board[row][col];
                
                if (piece) {
                    square.innerHTML = `<span class="piece">${piece.piece}</span>`;
                } else {
                    square.innerHTML = '';
                }
            }
        }
        
        // Update status
        const statusText = document.querySelector('.status-text');
        if (this.gameState === 'check') {
            statusText.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} is in check!`;
        } else {
            statusText.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} to move`;
        }
        
        // Update captured pieces
        this.updateCapturedPieces();
        
        // Update move history
        this.updateMoveHistory();
        
        // Update timers
        this.updateTimers();
    }

    getSquareElement(row, col) {
        const index = row * 8 + col;
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    updateCapturedPieces() {
        const whiteCaptured = document.getElementById('white-captured');
        const blackCaptured = document.getElementById('black-captured');
        
        whiteCaptured.innerHTML = this.capturedPieces.white.map(piece => 
            `<span class="captured-piece">${piece}</span>`
        ).join('');
        
        blackCaptured.innerHTML = this.capturedPieces.black.map(piece => 
            `<span class="captured-piece">${piece}</span>`
        ).join('');
    }

    updateMoveHistory() {
        const moveHistory = document.getElementById('move-history');
        moveHistory.innerHTML = '';
        
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            
            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `${Math.floor(i / 2) + 1}.`;
            
            const whiteMove = document.createElement('span');
            whiteMove.textContent = this.formatMove(this.moveHistory[i]);
            
            moveEntry.appendChild(moveNumber);
            moveEntry.appendChild(whiteMove);
            
            if (i + 1 < this.moveHistory.length) {
                const blackMove = document.createElement('span');
                blackMove.textContent = this.formatMove(this.moveHistory[i + 1]);
                moveEntry.appendChild(blackMove);
            }
            
            moveHistory.appendChild(moveEntry);
        }
        
        moveHistory.scrollTop = moveHistory.scrollHeight;
    }

    formatMove(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const from = `${files[move.from.col]}${ranks[move.from.row]}`;
        const to = `${files[move.to.col]}${ranks[move.to.row]}`;
        return `${from}-${to} `;
    }

    startTimer() {
        this.lastMoveTime = Date.now();
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.gameState === 'playing') {
                const now = Date.now();
                const elapsed = (now - this.lastMoveTime) / 1000;
                
                if (this.currentPlayer === 'white') {
                    this.whiteTime -= elapsed;
                } else {
                    this.blackTime -= elapsed;
                }
                
                this.lastMoveTime = now;
                this.updateTimers();
                
                // Check for time out
                if (this.whiteTime <= 0 || this.blackTime <= 0) {
                    this.endGame('timeout');
                }
            }
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimers() {
        const whiteTimer = document.getElementById('white-timer');
        const blackTimer = document.getElementById('black-timer');
        
        whiteTimer.textContent = this.formatTime(this.whiteTime);
        blackTimer.textContent = this.formatTime(this.blackTime);
        
        // Add low time warning
        whiteTimer.classList.toggle('low-time', this.whiteTime <= 60);
        blackTimer.classList.toggle('low-time', this.blackTime <= 60);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    newGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameState = 'playing';
        this.isPaused = false;
        
        // Reset timers
        this.whiteTime = this.timeControl * 60;
        this.blackTime = this.timeControl * 60;
        
        this.stopTimer();
        this.startTimer();
        this.updateDisplay();
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore the piece to its original position
        this.board[lastMove.from.row][lastMove.from.col] = {
            piece: lastMove.piece,
            color: lastMove.color
        };
        
        // Restore captured piece if any
        if (lastMove.captured) {
            this.board[lastMove.to.row][lastMove.to.col] = {
                piece: lastMove.captured,
                color: lastMove.color === 'white' ? 'black' : 'white'
            };
            
            // Remove from captured pieces
            const capturedArray = this.capturedPieces[lastMove.color];
            const index = capturedArray.indexOf(lastMove.captured);
            if (index > -1) {
                capturedArray.splice(index, 1);
            }
        } else {
            this.board[lastMove.to.row][lastMove.to.col] = null;
        }
        
        // Switch back to previous player
        this.currentPlayer = lastMove.color;
        
        // Update game state
        this.updateGameState();
        this.updateDisplay();
    }

    flipBoard() {
        this.boardFlipped = !this.boardFlipped;
        const board = document.getElementById('chess-board');
        board.style.transform = this.boardFlipped ? 'rotate(180deg)' : '';
        
        // Flip pieces
        const pieces = board.querySelectorAll('.piece');
        pieces.forEach(piece => {
            piece.style.transform = this.boardFlipped ? 'rotate(180deg)' : '';
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            this.stopTimer();
        } else {
            this.lastMoveTime = Date.now();
            this.startTimer();
        }
    }

    showGameOverModal(result) {
        const modal = document.getElementById('game-over-modal');
        const resultTitle = document.getElementById('game-result');
        const resultDetails = document.getElementById('game-result-details');
        
        switch (result) {
            case 'checkmate':
                resultTitle.textContent = 'Checkmate!';
                resultDetails.textContent = `${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
                break;
            case 'stalemate':
                resultTitle.textContent = 'Stalemate!';
                resultDetails.textContent = 'The game is a draw.';
                break;
            case 'timeout':
                resultTitle.textContent = 'Time Out!';
                resultDetails.textContent = `${this.currentPlayer === 'white' ? 'Black' : 'White'} wins on time!`;
                break;
        }
        
        modal.style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    showSettings() {
        document.getElementById('time-control').value = this.timeControl;
        document.getElementById('increment').value = this.increment;
        document.getElementById('settings-modal').style.display = 'block';
    }

    applySettings() {
        this.timeControl = parseInt(document.getElementById('time-control').value);
        this.increment = parseInt(document.getElementById('increment').value);
        
        // Reset timers with new settings
        this.whiteTime = this.timeControl * 60;
        this.blackTime = this.timeControl * 60;
        this.updateTimers();
        
        this.closeModal('settings-modal');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
}); 