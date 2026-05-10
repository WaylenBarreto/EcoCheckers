import copy
try:
    from .logic import EcoCheckers, FOREST, INDUSTRIAL, URBAN
except ImportError:
    from logic import EcoCheckers, FOREST, INDUSTRIAL, URBAN

def evaluate_board(game):
    # Heuristic: Score = (Own Pieces × 5) + (Kings × 10) + (Controlled Green Zones × 3) + (Environment Score × 2) − (Pollution Generated × 4)
    score = 0
    
    # Piece counts
    ai_pieces = 0
    ai_kings = 0
    player_pieces = 0
    player_kings = 0
    
    green_zones_controlled = 0
    
    for r in range(8):
        for c in range(8):
            val = game.board[r][c]
            if val == -1: ai_pieces += 1
            elif val == -2: ai_kings += 1
            elif val == 1: player_pieces += 1
            elif val == 2: player_kings += 1
            
            # Zone control (simplified: piece sitting on it)
            if game.zones[r][c] == FOREST and val < 0:
                green_zones_controlled += 1

    # AI perspective
    ai_score_val = (ai_pieces * 5) + (ai_kings * 10) + (green_zones_controlled * 3) + (game.env_score * 2) - (game.pollution * 4)
    # Player perspective (roughly same formula)
    player_score_val = (player_pieces * 5) + (player_kings * 10) + (0 * 3) + (game.env_score * 2) - (game.pollution * 4)
    
    return ai_score_val - player_score_val

def minimax(game, depth, alpha, beta, maximizing_player):
    if depth == 0 or game.game_over:
        return evaluate_board(game), None
    
    valid_moves = game.get_valid_moves('ai' if maximizing_player else 'player')
    if not valid_moves:
        return evaluate_board(game), None
    
    best_move = None
    if maximizing_player:
        max_eval = float('-inf')
        for move in valid_moves:
            # Simulate move
            sim_game = copy.deepcopy(game)
            sim_game.make_move(move)
            eval_val, _ = minimax(sim_game, depth - 1, alpha, beta, False)
            if eval_val > max_eval:
                max_eval = eval_val
                best_move = move
            alpha = max(alpha, eval_val)
            if beta <= alpha:
                break
        return max_eval, best_move
    else:
        min_eval = float('inf')
        for move in valid_moves:
            sim_game = copy.deepcopy(game)
            sim_game.make_move(move)
            eval_val, _ = minimax(sim_game, depth - 1, alpha, beta, True)
            if eval_val < min_eval:
                min_eval = eval_val
                best_move = move
            beta = min(beta, eval_val)
            if beta <= alpha:
                break
        return min_eval, best_move

def get_best_move(game, difficulty='medium'):
    depth = 2
    if difficulty == 'easy': depth = 1
    elif difficulty == 'hard': depth = 4
    
    _, move = minimax(game, depth, float('-inf'), float('inf'), True)
    return move
