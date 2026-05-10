import uvicorn
import os

if __name__ == "__main__":
    print("Starting EcoCheckers Dev Server...")
    print("Access the game at: http://localhost:8000")
    uvicorn.run("api.index:app", host="127.0.0.1", port=8000, reload=True)
