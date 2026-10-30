import sqlite3
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pathlib import Path

from app.config import settings
from app.schemas import CaseCreateRequest, CaseResponse, KVKContactInfo

logger = logging.getLogger("hackmint.verification")

class CaseManager:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = str(db_path or settings.DB_PATH)
        self._init_db()
        self.kvk_directory = self._load_kvk_directory()

    def _init_db(self):
        """Initializes SQLite tables for local prototype case escalation queue."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cases (
                    case_id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    status TEXT NOT NULL,
                    farmer_name TEXT,
                    location TEXT,
                    crop TEXT,
                    reported_symptoms TEXT,
                    image_quality_summary TEXT,
                    top_prediction TEXT,
                    confidence REAL,
                    orchestrator_verdict TEXT,
                    escalation_reason TEXT NOT NULL,
                    notes TEXT
                )
            """)
            conn.commit()

    def _load_kvk_directory(self) -> Dict[str, Any]:
        """Loads verified KVK directory data from JSON."""
        if not settings.KVK_DIRECTORY_PATH.exists():
            return {}
        try:
            with open(settings.KVK_DIRECTORY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading KVK directory: {e}")
            return {}

    def get_verified_kvk_recommendation(self, user_location: Optional[str] = None) -> KVKContactInfo:
        """
        Finds appropriate verified KVK or national helpline.
        Does NOT invent any phone number or address.
        """
        # Check if user location matches any of our verified regional KVKs
        if user_location and self.kvk_directory:
            loc_lower = user_location.lower()
            regional = self.kvk_directory.get("verified_regional_kvks", [])
            for kvk in regional:
                if (kvk["state"].lower() in loc_lower or
                    kvk["district"].lower() in loc_lower):
                    return KVKContactInfo(
                        name=kvk["kvk_name"],
                        type="District Krishi Vigyan Kendra (Verified Official Record)",
                        contact_details=f"{kvk['location']} | Host: {kvk['host_institution']}",
                        verified=True,
                        source_url=kvk.get("official_website", "https://kvk.icar.gov.in/"),
                        action_note=f"Verified KVK for {kvk['district']}. Present this case ID to the subject matter specialist (Plant Protection)."
                    )

        # Fallback to verified national Kisan Call Center and ICAR portal
        return KVKContactInfo(
            name="Kisan Call Center (Ministry of Agriculture & Farmers Welfare, Govt of India)",
            type="National Toll-Free Agritech Helpline",
            contact_details="Toll-Free Helpline: 1800-180-1551 (06:00 AM - 10:00 PM, 22 languages)",
            verified=True,
            source_url="https://kvk.icar.gov.in/",
            action_note="Dial 1800-180-1551 or access https://kvk.icar.gov.in to connect directly with your designated district plant pathologist."
        )

    def create_case(self, req: CaseCreateRequest) -> CaseResponse:
        """Stores an expert review escalation case in local SQLite database."""
        case_id = f"HM-{uuid.uuid4().hex[:8].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()
        status = "Pending Review"

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO cases (
                    case_id, created_at, status, farmer_name, location,
                    crop, reported_symptoms, image_quality_summary,
                    top_prediction, confidence, orchestrator_verdict,
                    escalation_reason, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case_id,
                now_iso,
                status,
                req.farmer_name,
                req.location,
                req.crop,
                req.reported_symptoms,
                req.image_quality_summary,
                req.top_prediction,
                req.confidence,
                req.orchestrator_verdict,
                req.escalation_reason,
                req.notes
            ))
            conn.commit()

        logger.info(f"Created escalation case {case_id} in local SQLite store.")
        return CaseResponse(
            case_id=case_id,
            created_at=now_iso,
            status=status,
            farmer_name=req.farmer_name,
            location=req.location,
            crop=req.crop,
            reported_symptoms=req.reported_symptoms,
            image_quality_summary=req.image_quality_summary,
            top_prediction=req.top_prediction,
            confidence=req.confidence,
            orchestrator_verdict=req.orchestrator_verdict,
            escalation_reason=req.escalation_reason,
            notes=req.notes,
            is_live_expert=False  # Clearly declared prototype state
        )

    def list_cases(self, limit: int = 50) -> List[CaseResponse]:
        """Lists cases from the prototype escalation queue."""
        cases = []
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT case_id, created_at, status, farmer_name, location,
                       crop, reported_symptoms, image_quality_summary,
                       top_prediction, confidence, orchestrator_verdict,
                       escalation_reason, notes
                FROM cases ORDER BY created_at DESC LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            for r in rows:
                cases.append(CaseResponse(
                    case_id=r[0],
                    created_at=r[1],
                    status=r[2],
                    farmer_name=r[3],
                    location=r[4],
                    crop=r[5],
                    reported_symptoms=r[6],
                    image_quality_summary=r[7],
                    top_prediction=r[8],
                    confidence=r[9],
                    orchestrator_verdict=r[10],
                    escalation_reason=r[11],
                    notes=r[12],
                    is_live_expert=False
                ))
        return cases

    def get_case(self, case_id: str) -> Optional[CaseResponse]:
        """Retrieves a single case by ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT case_id, created_at, status, farmer_name, location,
                       crop, reported_symptoms, image_quality_summary,
                       top_prediction, confidence, orchestrator_verdict,
                       escalation_reason, notes
                FROM cases WHERE case_id = ?
            """, (case_id,))
            r = cursor.fetchone()
            if not r:
                return None
            return CaseResponse(
                case_id=r[0],
                created_at=r[1],
                status=r[2],
                farmer_name=r[3],
                location=r[4],
                crop=r[5],
                reported_symptoms=r[6],
                image_quality_summary=r[7],
                top_prediction=r[8],
                confidence=r[9],
                orchestrator_verdict=r[10],
                escalation_reason=r[11],
                notes=r[12],
                is_live_expert=False
            )

# Global singleton case manager
case_manager = CaseManager()
