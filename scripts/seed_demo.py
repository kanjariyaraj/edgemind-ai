#!/usr/bin/env python3
"""
Seed demo data for EdgeMind.

Creates realistic industrial IoT memories for:
- Machine A, Machine B
- Pump 12, Generator 04
- Technician notes, temperature events
- Maintenance logs, fault events
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.memory.ingestion import ingest_memory
from backend.app.qdrant.collections import create_memory_collection
from backend.app.database.database import init_db
from backend.app.config import settings

import uuid
from datetime import datetime, timedelta
import random

DEMO_MEMORIES = [
    # Machine A - Temperature events
    {
        "text": "Machine A temperature exceeded threshold at 14:32 - reached 95°C (threshold: 85°C)",
        "source": "sensor_reading",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },
    {
        "text": "Machine A temperature returned to normal at 14:45 after cooling cycle - 72°C",
        "source": "sensor_reading",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },
    {
        "text": "Technician noted unusual vibration on Machine A during inspection at 10:15",
        "source": "technician_note",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },
    {
        "text": "Fan replacement was performed on Machine A at 11:30 - bearing wear detected",
        "source": "maintenance_log",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },
    {
        "text": "Machine A vibration levels normalized after fan replacement - within spec",
        "source": "sensor_reading",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },
    {
        "text": "Critical: Machine A pressure sensor fault detected at 08:22 - reading erratic",
        "source": "fault_event",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },
    {
        "text": "Pressure sensor on Machine A replaced at 09:15 - calibration completed",
        "source": "maintenance_log",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "internal",
    },

    # Machine B - Cooling system
    {
        "text": "Machine B coolant level dropped below minimum at 16:40 - auto-shutdown triggered",
        "source": "sensor_reading",
        "device_id": "edge-001",
        "entity_id": "machine-B",
        "sensitivity": "internal",
    },
    {
        "text": "Coolant leak detected on Machine B at 16:45 - hose connection loose",
        "source": "technician_note",
        "device_id": "edge-001",
        "entity_id": "machine-B",
        "sensitivity": "internal",
    },
    {
        "text": "Machine B coolant system repaired at 17:30 - hose clamp tightened, system refilled",
        "source": "maintenance_log",
        "device_id": "edge-001",
        "entity_id": "machine-B",
        "sensitivity": "internal",
    },
    {
        "text": "Machine B restarted successfully at 17:45 - all parameters nominal",
        "source": "system_log",
        "device_id": "edge-001",
        "entity_id": "machine-B",
        "sensitivity": "internal",
    },

    # Pump 12 - Pressure events
    {
        "text": "Pump 12 discharge pressure exceeded 150 PSI at 22:10 - relief valve activated",
        "source": "sensor_reading",
        "device_id": "edge-002",
        "entity_id": "pump-12",
        "sensitivity": "internal",
    },
    {
        "text": "Pump 12 flow rate dropped 40% at 22:15 - possible impeller damage",
        "source": "sensor_reading",
        "device_id": "edge-002",
        "entity_id": "pump-12",
        "sensitivity": "internal",
    },
    {
        "text": "Emergency shutdown of Pump 12 at 22:20 - operator intervention required",
        "source": "fault_event",
        "device_id": "edge-002",
        "entity_id": "pump-12",
        "sensitivity": "internal",
    },
    {
        "text": "Pump 12 impeller inspection at 23:00 - erosion found on leading edges",
        "source": "technician_note",
        "device_id": "edge-002",
        "entity_id": "pump-12",
        "sensitivity": "internal",
    },
    {
        "text": "Pump 12 impeller replaced at 02:30 - performance restored to 98% capacity",
        "source": "maintenance_log",
        "device_id": "edge-002",
        "entity_id": "pump-12",
        "sensitivity": "internal",
    },

    # Generator 04 - Power events
    {
        "text": "Generator 04 voltage fluctuation detected at 03:15 - 415V ±12V (spec: ±5V)",
        "source": "sensor_reading",
        "device_id": "edge-003",
        "entity_id": "generator-04",
        "sensitivity": "internal",
    },
    {
        "text": "Generator 04 AVR (Automatic Voltage Regulator) warning at 03:20 - excitation unstable",
        "source": "fault_event",
        "device_id": "edge-003",
        "entity_id": "generator-04",
        "sensitivity": "internal",
    },
    {
        "text": "Generator 04 load reduced to 60% at 03:30 - stabilizing voltage output",
        "source": "system_log",
        "device_id": "edge-003",
        "entity_id": "generator-04",
        "sensitivity": "internal",
    },
    {
        "text": "Generator 04 AVR module replaced at 05:45 - voltage stable at 415V ±2V",
        "source": "maintenance_log",
        "device_id": "edge-003",
        "entity_id": "generator-04",
        "sensitivity": "internal",
    },

    # General maintenance
    {
        "text": "Monthly lubrication completed for all rotating equipment - completed 09:00",
        "source": "maintenance_log",
        "device_id": "edge-001",
        "entity_id": "facility-main",
        "sensitivity": "internal",
    },
    {
        "text": "Vibration analysis baseline updated for Machine A and B - trends stable",
        "source": "technician_note",
        "device_id": "edge-001",
        "entity_id": "facility-main",
        "sensitivity": "internal",
    },
    {
        "text": "Thermal imaging scan of electrical panels - no hotspots detected",
        "source": "technician_note",
        "device_id": "edge-001",
        "entity_id": "facility-main",
        "sensitivity": "public",
    },

    # Private sensitivity examples
    {
        "text": "Proprietary process parameter for Machine A: optimal feed rate 2.3 kg/min",
        "source": "technician_note",
        "device_id": "edge-001",
        "entity_id": "machine-A",
        "sensitivity": "private",
    },
    {
        "text": "Maintenance window scheduled for Generator 04 - classified timing",
        "source": "maintenance_log",
        "device_id": "edge-003",
        "entity_id": "generator-04",
        "sensitivity": "private",
    },

    # Public sensitivity examples
    {
        "text": "Facility operational status: All systems nominal as of 12:00",
        "source": "system_log",
        "device_id": "edge-001",
        "entity_id": "facility-main",
        "sensitivity": "public",
    },
    {
        "text": "Quarterly safety audit completed - zero findings",
        "source": "technician_note",
        "device_id": "edge-001",
        "entity_id": "facility-main",
        "sensitivity": "public",
    },
]


def seed_demo():
    print("Initializing database...")
    init_db()
    
    print("Creating Qdrant collection...")
    create_memory_collection()
    
    print(f"Seeding {len(DEMO_MEMORIES)} demo memories...")
    
    for i, mem in enumerate(DEMO_MEMORIES):
        try:
            result = ingest_memory(**mem)
            print(f"  [{i+1}/{len(DEMO_MEMORIES)}] {result['memory_id'][:8]} - {result['decision']} - {mem['entity_id']}")
        except Exception as e:
            print(f"  [{i+1}/{len(DEMO_MEMORIES)}] ERROR: {e}")
    
    print("\nDemo data seeding complete!")
    print("\nTry these queries:")
    print("  - 'Why did Machine A overheat?'")
    print("  - 'What maintenance was done on Pump 12?'")
    print("  - 'Generator 04 voltage issues'")
    print("  - 'Machine B coolant leak'")


if __name__ == "__main__":
    seed_demo()