import base64
import json
import logging
import os
import re

import google.generativeai as genai

logger = logging.getLogger(__name__)

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

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = _IDENTIFICATION_PROMPT
    if user_context and user_context.strip():
        prompt += f"\n\nContexto adicional del usuario: {user_context.strip()}"

    try:
        image_bytes = base64.b64decode(image_base64)
    except Exception as exc:
        raise ValueError("La imagen enviada no es base64 válido") from exc

    image_part = {"mime_type": "image/jpeg", "data": image_bytes}

    try:
        response = model.generate_content([prompt, image_part])
        raw_text = response.text.strip()
        logger.info("Gemini raw response (first 300 chars): %s", raw_text[:300])
    except Exception as exc:
        logger.exception("Error al llamar a la API de Gemini")
        raise RuntimeError(f"Error al contactar la IA: {exc}") from exc

    json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not json_match:
        logger.error("Respuesta de Gemini sin JSON: %s", raw_text[:500])
        raise ValueError("La IA devolvió una respuesta inesperada")

    try:
        result = json.loads(json_match.group())
    except json.JSONDecodeError as exc:
        logger.exception("Error al parsear JSON de Gemini: %s", json_match.group()[:300])
        raise ValueError("Respuesta de IA con formato inválido") from exc

    # Normalizar y validar campos
    valid_difficulties = {"easy", "medium", "hard"}
    difficulty = result.get("difficulty")
    if difficulty not in valid_difficulties:
        result["difficulty"] = None

    result.setdefault("is_plant", False)
    result.setdefault("confidence", 0.0)
    result["confidence"] = max(0.0, min(1.0, float(result.get("confidence", 0.0))))

    return result
