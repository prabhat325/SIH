"""
User Feedback & Interaction Logging Service.

Maintains an ML-ready interaction store (SQLite) tracking events:
- destination_liked
- destination_saved
- destination_rejected
- recommendation_viewed
- itinerary_generated
- budget_viewed

Provides data extraction methods for future ML recommendation reranker retraining.
"""

from datetime import datetime
import json
from pathlib import Path
import sqlite3
from typing import Dict, List, Optional


DB_PATH = Path(__file__).resolve().parents[2] / "data" / "user_feedback.db"


def _get_connection():
    """Initializes and returns SQLite database connection."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_feedback_db():
    """Creates feedback & interaction tables if they do not exist."""
    conn = _get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            destination_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            rating REAL,
            context_json TEXT,
            timestamp TEXT NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_user_interactions_event
        ON user_interactions (event_type, destination_id)
        """
    )
    conn.commit()
    conn.close()


def log_interaction(
    user_id: str,
    destination_id: str,
    event_type: str,
    rating: Optional[float] = None,
    context: Optional[Dict] = None,
) -> Dict:
    """
    Logs a user interaction event into the persistent store.
    """
    init_feedback_db()
    conn = _get_connection()
    cursor = conn.cursor()

    now_iso = datetime.now().isoformat()
    context_str = json.dumps(context or {})

    cursor.execute(
        """
        INSERT INTO user_interactions (user_id, destination_id, event_type, rating, context_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, destination_id, event_type, rating, context_str, now_iso),
    )
    inserted_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "interaction_id": inserted_id,
        "user_id": user_id,
        "destination_id": destination_id,
        "event_type": event_type,
        "timestamp": now_iso,
    }


def get_interaction_stats() -> Dict:
    """
    Returns high-level statistics of collected interactions for ML retraining readiness.
    """
    init_feedback_db()
    conn = _get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM user_interactions")
    total_count = cursor.fetchone()["total"]

    cursor.execute(
        """
        SELECT event_type, COUNT(*) as count
        FROM user_interactions
        GROUP BY event_type
        """
    )
    breakdown = {row["event_type"]: row["count"] for row in cursor.fetchall()}
    conn.close()

    return {
        "total_interactions_logged": total_count,
        "events_breakdown": breakdown,
        "ml_pipeline_status": (
            "Ready for retraining" if total_count >= 100 else "Collecting live interaction logs"
        ),
    }


def export_training_dataset(limit: int = 1000) -> List[Dict]:
    """
    Extracts tabular records formatted for ML recommendation reranker training.
    """
    init_feedback_db()
    conn = _get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT user_id, destination_id, event_type, rating, context_json, timestamp
        FROM user_interactions
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = cursor.fetchall()
    conn.close()

    dataset = []
    for r in rows:
        dataset.append({
            "user_id": r["user_id"],
            "destination_id": r["destination_id"],
            "event_type": r["event_type"],
            "rating": r["rating"],
            "context": json.loads(r["context_json"] or "{}"),
            "timestamp": r["timestamp"],
            # Target binary label: 1 if positive engagement (liked/saved/itinerary), 0 if rejected
            "target_label": 1 if r["event_type"] in ["destination_liked", "destination_saved", "itinerary_saved"] else 0,
        })

    return dataset
