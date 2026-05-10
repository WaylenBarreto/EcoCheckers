import random

# Constants for sustainability zones
FOREST = 'forest'
INDUSTRIAL = 'industrial'
WATER = 'water'
URBAN = 'urban'
PLAIN = 'plain'

class EcoCheckers:
    def __init__(self):
        self.board = self.initialize_board()
        self.turn = 'player' # player (Red) or ai (White)
        self.env_score = 100
        self.player_score = 0
        self.ai_score = 0
        self.pollution = 0
        self.game_over = False
        self.winner = None

    def initialize_board(self):
        # 8x8 board with zones
        # 0: empty, 1: player piece, 2: player king, -1: ai piece, -2: ai king
        board = [[0 for _ in range(8)] for _ in range(8)]
        
        # Zones layout (fixed or procedural)
        self.zones = [[PLAIN for _ in range(8)] for _ in range(8)]
        # Add some variety
        for i in range(8):
            for j in range(8):
                if (i+j) % 5 == 0: self.zones[i][j] = FOREST
                elif (i+j) % 7 == 0: self.zones[i][j] = INDUSTRIAL
                elif (i+j) % 11 == 0: self.zones[i][j] = WATER
                elif (i+j) % 3 == 0: self.zones[i][j] = URBAN
        
        # Place pieces
        # Player (Red) at bottom (rows 5, 6, 7)
        for r in range(5, 8):
            for c in range(8):
                if (r + c) % 2 != 0:
                    board[r][c] = 1
        
        # AI (White) at top (rows 0, 1, 2)
        for r in range(0, 3):
            for c in range(8):
                if (r + c) % 2 != 0:
                    board[r][c] = -1
                    
        return board

    def get_valid_moves(self, player):
        moves = []
        is_ai = (player == 'ai')
        target_values = [-1, -2] if is_ai else [1, 2]
        
        for r in range(8):
            for c in range(8):
                if self.board[r][c] in target_values:
                    moves.extend(self.get_piece_moves(r, c))
        
        # If there are captures, forced move rule (optional, but standard)
        captures = [m for m in moves if m['capture']]
        return captures if captures else moves

    def get_piece_moves(self, r, c):
        piece = self.board[r][c]
        is_king = abs(piece) == 2
        is_ai = piece < 0
        directions = []
        
        if is_king:
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
        elif is_ai:
            directions = [(1, -1), (1, 1)] # AI moves down
        else:
            directions = [(-1, -1), (-1, 1)] # Player moves up
            
        moves = []
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            
            # Simple move
            if 0 <= nr < 8 and 0 <= nc < 8:
                if self.board[nr][nc] == 0:
                    # Check water restriction
                    if self.zones[nr][nc] == WATER and not is_king:
                        continue
                    moves.append({'from': (r, c), 'to': (nr, nc), 'capture': None})
                
                # Capture move
                elif (is_ai and self.board[nr][nc] > 0) or (not is_ai and self.board[nr][nc] < 0):
                    jr, jc = nr + dr, nc + dc # jump position
                    if 0 <= jr < 8 and 0 <= jc < 8 and self.board[jr][jc] == 0:
                        moves.append({'from': (r, c), 'to': (jr, jc), 'capture': (nr, nc)})
                        
        return moves

    def make_move(self, move):
        fr, fc = move['from']
        tr, tc = move['to']
        piece = self.board[fr][fc]
        
        # Update board
        self.board[tr][tc] = piece
        self.board[fr][fc] = 0
        
        # Handle captures
        if move['capture']:
            cr, cc = move['capture']
            self.board[cr][cc] = 0
            self.env_score -= 5
            self.pollution += 2
            if self.zones[cr][cc] == FOREST:
                self.env_score -= 5
                self.add_event("⚠️ Forest damage during capture!")
        
        # Zone effects
        zone = self.zones[tr][tc]
        if zone == FOREST:
            self.env_score -= 3
        elif zone == INDUSTRIAL:
            self.env_score -= 2
            self.pollution += 3
            if piece > 0: self.player_score += 10
            else: self.ai_score += 10
        elif zone == URBAN:
            if piece > 0: self.player_score += 5
            else: self.ai_score += 5
            
        # King promotion
        if piece == 1 and tr == 0: self.board[tr][tc] = 2
        if piece == -1 and tr == 7: self.board[tr][tc] = -2
        
        # Climate Events check (10% chance per move)
        if random.random() < 0.15:
            self.trigger_climate_event()

        # Check game over
        if self.env_score <= 0:
            self.game_over = True
            self.winner = 'Ecological Collapse'
        
        self.turn = 'ai' if self.turn == 'player' else 'player'
        return True

    def trigger_climate_event(self):
        events = ['Wildfire', 'Acid Rain', 'Green Recovery']
        event = random.choice(events)
        
        if event == 'Wildfire':
            self.env_score -= 10
            self.add_event("🔥 Wildfire! Environmental health dropped.")
        elif event == 'Acid Rain':
            self.pollution += 5
            self.add_event("🌧️ Acid Rain! Pollution increased.")
        elif event == 'Green Recovery':
            self.env_score = min(100, self.env_score + 8)
            self.add_event("🌿 Green Recovery! Forests are healing.")

    def add_event(self, msg):
        if not hasattr(self, 'events'): self.events = []
        self.events.append(msg)

    def get_state(self):
        state = {
            'board': self.board,
            'zones': self.zones,
            'env_score': self.env_score,
            'player_score': self.player_score,
            'ai_score': self.ai_score,
            'pollution': self.pollution,
            'turn': self.turn,
            'game_over': self.game_over,
            'winner': self.winner,
            'events': getattr(self, 'events', [])
        }
        self.events = [] # Clear events after sending
        return state
