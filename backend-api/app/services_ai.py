import json
import logging
import os
import re

import requests

logger = logging.getLogger(__name__)

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

_IDENTIFICATION_PROMPT = """
Eres un experto en botánica e identificación de plantas. Analiza la imagen proporcionada.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.
Usa exactamente este formato:

{
  "is_plant": true,
  "confidence": 0.92,
  "common_name": "Monstera",
  "scientific_name": "Monstera deliciosa",
  "description": "Planta tropical de interior con grandes hojas características.",
  "care_summary": "Riego moderado, luz indirecta brillante, temperatura 18-30°C.",
  "watering_notes": "Regar cuando el sustrato esté seco en los primeros 3 cm.",
  "light_notes": "Luz indirecta brillante. Tolera sombra parcial.",
  "difficulty": "easy",
  "is_toxic": true
}

Si la imagen NO contiene una planta, responde con:
{"is_plant": false, "confidence": 0.0, "common_name": null, "scientific_name": null, "description": null, "care_summary": null, "watering_notes": null, "light_notes": null, "difficulty": null, "is_toxic": null}

Reglas:
- confidence: valor entre 0.0 y 1.0 que indica tu certeza en la identificación
- difficulty: solo puede ser "easy", "medium" o "hard"
- Responde SOLO el JSON, absolutamente nada más
"""


def identify_plant_from_base64(image_base64: str, user_context: str = "") -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY no está configurada en las variables de entorno")

    prompt = _IDENTIFICATION_PROMPT
    if user_context and user_context.strip():
        prompt += f"\n\nContexto adicional del usuario: {user_context.strip()}"

    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1024,
        },
    }

    try:
        response = requests.post(
            _GEMINI_URL,
            params={"key": api_key},
            json=body,
            timeout=25,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise RuntimeError("La IA tardó demasiado en responder. Intenta de nuevo.")
    except requests.exceptions.HTTPError as exc:
        error_body = exc.response.text[:300] if exc.response is not None else ""
        logger.error("Gemini HTTP error %s: %s", exc.response.status_code, error_body)
        raise RuntimeError(f"Error al contactar la IA ({exc.response.status_code})") from exc
    except requests.exceptions.RequestException as exc:
        logger.exception("Error de red al llamar a Gemini")
        raise RuntimeError("No se pudo conectar con la IA") from exc

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        logger.error("Gemini returned no candidates: %s", data)
        raise RuntimeError("La IA no devolvió resultados. Intenta con otra foto.")

    raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
    logger.info("Gemini raw response (first 300 chars): %s", raw_text[:300])

    json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not json_match:
        logger.error("No JSON in Gemini response: %s", raw_text[:500])
        raise ValueError("La IA devolvió una respuesta inesperada")

    try:
        result = json.loads(json_match.group())
    except json.JSONDecodeError as exc:
        logger.exception("JSON parse error from Gemini: %s", json_match.group()[:300])
        raise ValueError("Respuesta de IA con formato inválido") from exc

    valid_difficulties = {"easy", "medium", "hard"}
    if result.get("difficulty") not in valid_difficulties:
        result["difficulty"] = None

    result.setdefault("is_plant", False)
    result["confidence"] = max(0.0, min(1.0, float(result.get("confidence", 0.0))))

    return result
