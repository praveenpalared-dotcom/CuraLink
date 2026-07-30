import os
import sys

# Add parent directory to sys.path to allow importing backend module on Vercel
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.main import app
