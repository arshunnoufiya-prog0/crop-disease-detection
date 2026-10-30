import json
import logging
from typing import List, Optional, Dict
from pathlib import Path

from app.config import settings
from app.schemas import KnowledgeSource

logger = logging.getLogger("hackmint.knowledge_base")

class AgriculturalKnowledgeRetriever:
    def __init__(self, json_path: Optional[Path] = None):
        self.json_path = json_path or settings.KNOWLEDGE_BASE_PATH
        self.documents: List[KnowledgeSource] = []
        self._load_documents()

    def _load_documents(self):
        """Loads and indexes verified agricultural documents from disk."""
        if not self.json_path.exists():
            logger.warning(f"Knowledge base file not found at {self.json_path}")
            self.documents = []
            return

        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
            self.documents = [KnowledgeSource(**item) for item in raw_data]
            logger.info(f"Loaded {len(self.documents)} verified documents into agricultural knowledge base.")
        except Exception as e:
            logger.error(f"Error reading knowledge base JSON: {e}")
            self.documents = []

    def get_total_count(self) -> int:
        return len(self.documents)

    def retrieve(
        self,
        crop: Optional[str] = None,
        disease_or_condition: Optional[str] = None,
        symptoms_query: Optional[str] = None
    ) -> Optional[KnowledgeSource]:
        """
        Retrieves the most relevant verified document based on crop and disease condition.
        Returns None if no verified record exists, maintaining strict truthfulness.
        """
        if not self.documents:
            return None

        clean_crop = crop.strip().lower() if crop else ""
        clean_disease = disease_or_condition.strip().lower() if disease_or_condition else ""
        
        # 1. Exact crop + disease match
        for doc in self.documents:
            doc_crop = doc.crop.lower()
            doc_disease = doc.disease.lower()
            
            crop_matches = (clean_crop in doc_crop or doc_crop in clean_crop) if clean_crop else False
            disease_matches = (clean_disease in doc_disease or doc_disease in clean_disease) if clean_disease else False
            
            if crop_matches and disease_matches:
                return doc

        # 2. Match disease across crop or general solanaceous blights
        for doc in self.documents:
            doc_disease = doc.disease.lower()
            if clean_disease and (clean_disease in doc_disease or doc_disease in clean_disease):
                return doc

        # 3. Match based on key diagnostic keywords in farmer symptoms if available
        if symptoms_query:
            query_lower = symptoms_query.lower()
            best_match = None
            best_score = 0
            for doc in self.documents:
                score = 0
                if clean_crop and clean_crop in doc.crop.lower():
                    score += 2
                for s in doc.verified_symptoms:
                    # check for common agricultural tokens
                    for word in query_lower.split():
                        if len(word) > 3 and word in s.lower():
                            score += 1
                if score > best_score and score >= 3:
                    best_score = score
                    best_match = doc
            if best_match:
                return best_match

        return None

    def search_all_for_crop(self, crop: str) -> List[KnowledgeSource]:
        """Returns all verified documents for a given crop."""
        clean_crop = crop.strip().lower()
        return [doc for doc in self.documents if clean_crop in doc.crop.lower()]

# Global singleton retriever instance
retriever = AgriculturalKnowledgeRetriever()
