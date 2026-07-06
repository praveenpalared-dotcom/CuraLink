import sys
import os

# Add root directory to python path so backend package imports resolve correctly
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.app.main import app
