import json
from unittest.mock import patch, MagicMock

from app.services_ai import identify_plant_from_base64


def _mock_groq_response(content_json: dict):
    response = MagicMock()
    response.ok = True
    response.status_code = 200
    response.json.return_value = {
        "choices": [{"message": {"content": json.dumps(content_json)}}]
    }
    return response


def test_care_schedule_returned_in_response(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "x")
    payload = {
        "is_plant": True,
        "confidence": 0.9,
        "common_name": "Monstera",
        "scientific_name": "Monstera deliciosa",
        "nicknames": [],
        "description": "x",
        "care_summary": "x",
        "watering_notes": "x",
        "light_notes": "x",
        "difficulty": "easy",
        "is_toxic": False,
        "care_schedule": [
            {"type": "watering", "intervalDays": 3, "notes": "ok"},
            {"type": "fertilizing", "intervalDays": 30, "notes": None},
        ],
    }
    with patch("app.services_ai.requests.post", return_value=_mock_groq_response(payload)):
        result = identify_plant_from_base64("base64xxx", "")
    assert len(result["care_schedule"]) == 2
    assert result["care_schedule"][0]["intervalDays"] == 3


def test_care_schedule_filters_invalid_types(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "x")
    payload = {
        "is_plant": True,
        "confidence": 0.9,
        "common_name": "X",
        "scientific_name": "X",
        "nicknames": [],
        "description": None,
        "care_summary": None,
        "watering_notes": None,
        "light_notes": None,
        "difficulty": "easy",
        "is_toxic": False,
        "care_schedule": [
            {"type": "alien", "intervalDays": 3},
            {"type": "watering", "intervalDays": 500},  # clamp a 365
            {"type": "watering", "intervalDays": 0},    # descartar
            {"type": "watering", "intervalDays": 7},    # válido
        ],
    }
    with patch("app.services_ai.requests.post", return_value=_mock_groq_response(payload)):
        result = identify_plant_from_base64("base64xxx", "")
    assert len(result["care_schedule"]) == 2
    intervals = sorted(r["intervalDays"] for r in result["care_schedule"])
    assert intervals == [7, 365]


def test_care_schedule_empty_when_missing(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "x")
    payload = {
        "is_plant": False,
        "confidence": 0.0,
        "common_name": None,
        "scientific_name": None,
        "nicknames": [],
        "description": None,
        "care_summary": None,
        "watering_notes": None,
        "light_notes": None,
        "difficulty": None,
        "is_toxic": None,
    }
    with patch("app.services_ai.requests.post", return_value=_mock_groq_response(payload)):
        result = identify_plant_from_base64("base64xxx", "")
    assert result["care_schedule"] == []
