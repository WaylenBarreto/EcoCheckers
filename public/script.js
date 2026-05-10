let gameState = null;
let selectedPiece = null;
let validMoves = [];
let lastMove = null;

// Audio Setup
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioCtx();

function playSound(type) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'capture') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'event') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }
}

// Theme Toggle
document.getElementById('theme-toggle').onclick = () => {
    document.body.classList.toggle('light-mode');
};

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Play click sound
        playSound('move');
    };
});

const boardEl = document.getElementById('game-board');
const envScoreEl = document.getElementById('env-score');
const envMeterEl = document.getElementById('env-meter');
const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');
const pollutionEl = document.getElementById('pollution-value');
const logEl = document.getElementById('game-log');
const turnIndicator = document.getElementById('turn-indicator');
const difficultySelect = document.getElementById('difficulty');

async function init() {
    addLog("Initializing game engine...");
    try {
        const res = await fetch('/api/init');
        gameState = await res.json();
        renderBoard();
        updateUI();
    } catch (err) {
        addLog("Error connecting to Python backend. Ensure server is running.");
        console.error(err);
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    const { board, zones } = gameState;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            // Add zone class
            const zone = zones[r][c];
            if (zone !== 'plain') {
                cell.classList.add(zone);
            }

            const pieceVal = board[r][c];
            if (pieceVal !== 0) {
                const piece = document.createElement('div');
                piece.className = `piece ${pieceVal > 0 ? 'player' : 'ai'} ${Math.abs(pieceVal) === 2 ? 'king' : ''}`;
                if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                    piece.classList.add('selected');
                }
                if (lastMove && lastMove.to[0] === r && lastMove.to[1] === c) {
                    piece.classList.add('just-moved');
                }
                cell.appendChild(piece);
            }

            // Highlight valid moves
            const move = validMoves.find(m => m.to[0] === r && m.to[1] === c);
            if (move) {
                cell.classList.add('highlight');
            }

            // Highlight last move
            if (lastMove) {
                if (lastMove.from[0] === r && lastMove.from[1] === c) {
                    cell.classList.add('last-move-source');
                }
                if (lastMove.to[0] === r && lastMove.to[1] === c) {
                    cell.classList.add('last-move-target');
                }
            }

            cell.onclick = () => handleCellClick(r, c);
            boardEl.appendChild(cell);
        }
    }
}

async function handleCellClick(r, c) {
    if (gameState.turn !== 'player' || gameState.game_over) return;

    const pieceVal = gameState.board[r][c];

    // Selecting a piece
    if (pieceVal > 0) {
        selectedPiece = { r, c };
        // Fetch valid moves for this piece (calculated on frontend or requested)
        // For simplicity, let's just get all valid moves for the player
        const res = await fetch('/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...gameState, move: null }) // Dummy to get state/moves? Actually index.py needs a move.
        });
        // Wait, my API design was a bit simple. Let's assume the frontend can calculate moves or we add an endpoint.
        // Let's use a trick: any piece click just selects it, and we check if there's a move to that spot.
        // Actually, let's just get valid moves from the backend in a new endpoint or update logic.
        // I'll add a 'get-moves' endpoint if needed, but for now I'll just filter on frontend if I had the logic.
        // Better: update api/index.py to provide valid moves.
        
        // RE-FETCHING ALL VALID MOVES
        // Since I can't easily change the Python file now without another tool call, 
        // let's assume I can calculate simple moves here or I'll just use a generic 'move' call.
        
        // Actually, I'll update the Python logic to return valid moves in the state.
        // I will do that in the next turn if this fails.
        // For now, let's just try to move if a target is clicked.
    }

    // Try to make a move
    const move = validMoves.find(m => m.to[0] === r && m.to[1] === c);
    if (move) {
        await executeMove(move);
    } else if (pieceVal > 0) {
        // Just selecting - we need valid moves from backend.
        // Let's mock the valid moves for now or just request them.
        addLog(`Selected piece at ${r},${c}`);
        // Fetch moves for this specific piece
        // ... (I'll update the API to include moves in the state)
    }
}

async function executeMove(move) {
    addLog(`Moving from ${move.from} to ${move.to}...`);
    
    // Sound logic
    if (move.capture) playSound('capture');
    else playSound('move');

    validMoves = [];
    selectedPiece = null;
    
    const res = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...gameState, move })
    });
    gameState = await res.json();
    lastMove = move;
    renderBoard();
    updateUI();

    if (!gameState.game_over && gameState.turn === 'ai') {
        setTimeout(triggerAIMove, 1000);
    }
}

async function triggerAIMove() {
    turnIndicator.innerText = "AI Thinking...";
    addLog("AI is analyzing sustainability options...");
    
    const res = await fetch('/api/ai-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...gameState, difficulty: difficultySelect.value })
    });
    const result = await res.json();
    gameState = result.state;
    lastMove = result.move;
    const move = result.move;

    if (move) {
        addLog(`AI moved from ${move.from} to ${move.to}`);
        if (move.capture) playSound('capture');
        else playSound('move');
    } else {
        addLog("AI has no valid moves!");
    }

    renderBoard();
    updateUI();
}

function updateUI() {
    envScoreEl.innerText = gameState.env_score;
    envMeterEl.style.width = `${gameState.env_score}%`;
    playerScoreEl.innerText = gameState.player_score;
    aiScoreEl.innerText = gameState.ai_score;
    pollutionEl.innerText = gameState.pollution;
    turnIndicator.innerText = gameState.turn === 'player' ? "Your Turn" : "AI Turn";

    // Update environmental visuals
    if (gameState.env_score < 30) {
        document.body.classList.add('eco-danger');
        document.documentElement.style.setProperty('--env-glow', 'rgba(255, 77, 77, 0.2)');
    } else {
        document.body.classList.remove('eco-danger');
        document.documentElement.style.setProperty('--env-glow', 'rgba(0, 255, 136, 0.1)');
    }

    // Handle new events
    if (gameState.events && gameState.events.length > 0) {
        playSound('event');
        gameState.events.forEach(event => {
            addLog(`<span style="color: var(--primary-green); font-weight: bold;">${event}</span>`);
        });
    }

    if (gameState.game_over) {
        document.getElementById('game-over-overlay').classList.remove('hidden');
        document.getElementById('winner-text').innerText = gameState.winner === 'player' ? "You Won!" : "AI Won!";
        document.getElementById('winner-reason').innerText = gameState.winner === 'Ecological Collapse' 
            ? "The ecosystem has collapsed. Nobody wins." 
            : "Strategic dominance achieved.";
    }
}

function addLog(msg) {
    const p = document.createElement('p');
    p.innerHTML = `<b>[${new Date().toLocaleTimeString()}]</b> ${msg}`;
    logEl.prepend(p);
}

// Initial call
init();

// Simple move calculation on frontend to avoid constant API calls for "valid move" check
// (We still validate on backend)
// I'll add a helper to fetch valid moves from backend when a piece is clicked.
// Let's modify handleCellClick to fetch moves.

async function handleCellClick(r, c) {
    if (gameState.turn !== 'player' || gameState.game_over) return;

    const pieceVal = gameState.board[r][c];
    
    // If clicking a highlight, execute the move
    const move = validMoves.find(m => m.to[0] === r && m.to[1] === c);
    if (move) {
        await executeMove(move);
        return;
    }

    // If clicking own piece, show its moves
    if (pieceVal > 0) {
        selectedPiece = { r, c };
        // We'll call a special internal endpoint or just reuse /api/ai-move with a 'calc-only' flag if we had one.
        // For now, I'll add a quick 'valid-moves' endpoint to the Python backend in the next step.
        // Temporary: just fetch all moves and filter.
        const res = await fetch('/api/valid-moves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameState)
        });
        const allMoves = await res.json();
        validMoves = allMoves.filter(m => m.from[0] === r && m.from[1] === c);
        renderBoard();
    } else {
        selectedPiece = null;
        validMoves = [];
        renderBoard();
    }
}
