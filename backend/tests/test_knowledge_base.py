import pytest
from app.knowledge_base.retriever import retriever

def test_retriever_loads_documents():
    count = retriever.get_total_count()
    assert count >= 10, f"Expected at least 10 verified documents, found {count}"

def test_retrieve_exact_tomato_early_blight():
    doc = retriever.retrieve(crop="Tomato", disease_or_condition="Early Blight")
    assert doc is not None
    assert doc.crop == "Tomato"
    assert "Early Blight" in doc.disease
    assert "ICAR" in doc.source_organization or "TNAU" in doc.source_organization
    assert len(doc.cultural_management) > 0

def test_retrieve_unknown_disease_returns_none_without_fabrication():
    doc = retriever.retrieve(crop="Avocado", disease_or_condition="Nonexistent Fungal Rot")
    assert doc is None, "Should strictly return None rather than fabricating documents."
