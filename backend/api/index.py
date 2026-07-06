import os
import sys

try:
    # On Vercel, the backend directory is mounted at /var/task.
    # To resolve 'backend.app' imports properly, we create a symlink
    # /tmp/backend -> /var/task and add /tmp to sys.path.
    if not os.path.exists("/tmp/backend"):
        os.symlink("/var/task", "/tmp/backend")
    if "/tmp" not in sys.path:
        sys.path.insert(0, "/tmp")
except Exception as e:
    # Fallback to absolute parent path if running locally
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)

from backend.app.main import app
