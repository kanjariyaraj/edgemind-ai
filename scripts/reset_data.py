#!/usr/bin/env python3
"""
Reset all data for EdgeMind.
"""

import sys
import os
import shutil
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database.database import get_engine
from backend.app.models import memory, decision, sync, conflict
from sqlmodel import SQLModel


def reset_data():
    print("Resetting EdgeMind data...")
    
    # Remove Qdrant data
    qdrant_path = "./data/qdrant"
    if os.path.exists(qdrant_path):
        shutil.rmtree(qdrant_path)
        print(f"  Removed {qdrant_path}")
    
    # Remove SQLite database
    db_path = "./data/edgemind.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"  Removed {db_path}")
    
    # Recreate database tables
    engine = get_engine()
    SQLModel.metadata.create_all(engine)
    print("  Recreated database tables")
    
    print("\nData reset complete!")


if __name__ == "__main__":
    reset_data()