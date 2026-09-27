#!/usr/bin/env python3
"""
Health check script for EdgeMind.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
import asyncio


async def check_health():
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Basic health
        try:
            response = await client.get(f"{base_url}/health")
            print(f"✓ /health: {response.status_code}")
            print(f"  Response: {response.json()}")
        except Exception as e:
            print(f"✗ /health: {e}")
            return False
        
        # Detailed health
        try:
            response = await client.get(f"{base_url}/health/detailed")
            print(f"\n✓ /health/detailed: {response.status_code}")
            data = response.json()
            print(f"  Status: {data.get('status')}")
            print(f"  Checks: {data.get('checks')}")
            if data.get('qdrant'):
                print(f"  Qdrant: {data['qdrant']}")
            if data.get('database'):
                print(f"  Database: {data['database']}")
            if data.get('embeddings'):
                print(f"  Embeddings: {data['embeddings']}")
        except Exception as e:
            print(f"✗ /health/detailed: {e}")
            return False
        
        # System status
        try:
            response = await client.get(f"{base_url}/api/system/status")
            print(f"\n✓ /api/system/status: {response.status_code}")
            print(f"  Response: {response.json()}")
        except Exception as e:
            print(f"✗ /api/system/status: {e}")
            return False
    
    return True


if __name__ == "__main__":
    result = asyncio.run(check_health())
    sys.exit(0 if result else 1)