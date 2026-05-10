from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
try:
    from .logic import EcoCheckers
    from .ai import get_best_move
except ImportError:
    from logic import EcoCheckers
    from ai import get_best_move
import os

app = FastAPI()

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/init")
async def init_game():
    game = EcoCheckers()
    return game.get_state()

@app.post("/api/move")
async def make_move(data: dict = Body(...)):
    # Reconstruct game state from request
    game = EcoCheckers()
    game.board = data['board']
    game.env_score = data['env_score']
    game.player_score = data['player_score']
    game.ai_score = data['ai_score']
    game.pollution = data['pollution']
    game.turn = data['turn']
    
    move = data['move']
    game.make_move(move)
    
    return game.get_state()

@app.post("/api/ai-move")
async def ai_move(data: dict = Body(...)):
    game = EcoCheckers()
    game.board = data['board']
    game.env_score = data['env_score']
    game.player_score = data['player_score']
    game.ai_score = data['ai_score']
    game.pollution = data['pollution']
    game.turn = data['turn']
    
    difficulty = data.get('difficulty', 'medium')
    
    move = get_best_move(game, difficulty)
    if move:
        game.make_move(move)
    
    return {
        "state": game.get_state(),
        "move": move
    }

@app.post("/api/valid-moves")
async def get_moves(data: dict = Body(...)):
    game = EcoCheckers()
    game.board = data['board']
    game.turn = data['turn']
    
    moves = game.get_valid_moves(game.turn)
    return moves

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# The static mount below is only for local dev. 
# Vercel handles the /public folder automatically via vercel.json.
if not os.environ.get("VERCEL"):
    app.mount("/", StaticFiles(directory="public", html=True), name="public")
