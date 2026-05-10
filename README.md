# ♟️ EcoCheckers: AI-Based Sustainable Strategy Game

**EcoCheckers** is a modern reimagining of the classic game of checkers, where players must balance economic growth with environmental preservation. Built with a Python logic engine and a premium web-based UI, it demonstrates how AI can be programmed with ethical and sustainability-aware heuristics.

![EcoCheckers Preview](https://via.placeholder.com/800x450?text=EcoCheckers+Sustainability+Game)

## 🎯 Project Objective
Develop a modified checkers game where the winner is determined not just by capturing pieces, but by maintaining a healthy ecosystem and a high sustainability score.

---

## 🚀 Features
- **Sustainability Zones**: The board is divided into Forest, Industrial, Water, and Urban zones, each with unique gameplay effects.
- **Environmental Health System**: A dynamic score (0-100) that tracks the global impact of your moves. Reach 0, and the match ends in ecological collapse!
- **AI Opponent**: A Minimax-driven agent with Alpha-Beta pruning that evaluates moves based on a sustainability-aware heuristic.
- **Dynamic Difficulty**: Choose between Easy, Medium, and Hard modes. In Hard mode, the AI prioritizes long-term environmental health.
- **Eco-Analytics**: Track pollution levels and economic growth in real-time.

---

## 🛠 Tech Stack
- **Backend**: Python (FastAPI)
- **AI Engine**: Minimax with Alpha-Beta Pruning
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Deployment Ready**: Optimized for Vercel and local development.

---

## 🏃 Getting Started

### 1. Prerequisites
- Python 3.8+
- pip

### 2. Installation
```bash
git clone https://github.com/WaylenBarreto/EcoCheckers.git
cd EcoCheckers
pip install -r requirements.txt
```

### 3. Run Locally
```bash
python run.py
```
Open your browser and navigate to `http://localhost:8000`.

---

## 🎮 How to Play
1. **Economic Points**: Earn points by moving into Industrial/Urban zones.
2. **Eco Health**: Preserve Forest zones and minimize pollution from captures.
3. **Winning**: Control the territory and pieces while keeping the environment score above 0. If the environment collapses, no one wins!

---

## 🧩 AI Heuristic Formula
The AI evaluates its moves using the following weighted logic:
`Score = (Own Pieces × 5) + (Kings × 10) + (Controlled Green Zones × 3) + (Env Score × 2) − (Pollution × 4)`

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

**Developed for Sustainability & AI Research.**
