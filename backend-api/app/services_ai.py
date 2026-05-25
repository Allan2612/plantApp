import json
import logging
import os
import re

import requests

logger = logging.getLogger(__name__)

_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
_GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

_IDENTIFICATION_PROMPT = """
Eres un experto en botánica e identificación de plantas. Analiza la imagen proporcionada.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.
Usa exactamente este formato:

{
  "is_plant": true,
  "confidence": 0.92,
  "common_name": "Monstera",
  "scientific_name": "Monstera deliciosa",
  "nicknames": ["Costilla de Adán", "Piñanona", "Cerimán"],
  "description": "Planta tropical de interior con grandes hojas características.",
  "care_summary": "Riego moderado, luz indirecta brillante, temperatura 18-30°C.",
  "watering_notes": "Regar cuando el sustrato esté seco en los primeros 3 cm.",
  "light_notes": "Luz indirecta brillante. Tolera sombra parcial.",
  "difficulty": "easy",
  "is_toxic": true
}

Si la imagen NO contiene una planta, responde con:
{"is_plant": false, "confidence": 0.0, "common_name": null, "scientific_name": null, "nicknames": [], "description": null, "care_summary": null, "watering_notes": null, "light_notes": null, "difficulty": null, "is_toxic": null}

Reglas:
- confidence: valor entre 0.0 y 1.0 que indica tu certeza en la identificación
- difficulty: solo puede ser "easy", "medium" o "hard"
- nicknames: array de 2 a 5 apodos coloquiales o nombres populares en español con los que la gente conoce la planta. Si no hay apodos populares, devuelve un array vacío [].
- Responde SOLO el JSON, absolutamente nada más
"""


def identify_plant_from_base64(image_base64: str, user_context: str = "") -> dict:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("La IA no está configurada. Contacta al administrador.")

    prompt = _IDENTIFICATION_PROMPT
    if user_context and user_context.strip():
        prompt += f"\n\nContexto adicional del usuario: {user_context.strip()}"

    body = {
        "model": _GROQ_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}",
                        },
                    },
                ],
            }
        ],
        "temperature": 0.1,
        "max_tokens": 1024,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            _GROQ_URL,
            headers=headers,
            json=body,
            timeout=25,
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("La IA tardó demasiado en responder. Intenta de nuevo.")
    except requests.exceptions.RequestException as exc:
        logger.exception("Error de red al llamar a Groq")
        raise RuntimeError("Sin conexión con la IA. Verifica tu internet e intenta de nuevo.") from exc

    if response.status_code == 429:
        logger.error("Groq 429 body: %s", response.text[:500])
        raise RuntimeError("Demasiadas solicitudes en poco tiempo. Espera 30 segundos e intenta de nuevo.")

    if response.status_code == 400:
        logger.error("Groq 400: %s", response.text[:300])
        raise RuntimeError("La imagen no pudo ser procesada. Intenta con otra foto.")

    if response.status_code == 401:
        logger.error("Groq 401: %s", response.text[:200])
        raise RuntimeError("Sin acceso a la IA. Verifica la configuración del servicio.")

    if not response.ok:
        logger.error("Groq HTTP %s: %s", response.status_code, response.text[:300])
        raise RuntimeError(f"Error del servicio de IA ({response.status_code}). Intenta más tarde.")

    data = response.json()
    choices = data.get("choices", [])
    if not choices:
        logger.error("Groq returned no choices: %s", data)
        raise RuntimeError("La IA no pudo analizar la imagen. Intenta con una foto más clara.")

    raw_text = choices[0].get("message", {}).get("content", "").strip()
    logger.info("Groq raw response (first 300 chars): %s", raw_text[:300])

    json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not json_match:
        logger.error("No JSON in Groq response: %s", raw_text[:500])
        raise ValueError("La IA devolvió una respuesta inesperada. Intenta de nuevo.")

    try:
        result = json.loads(json_match.group())
    except json.JSONDecodeError as exc:
        logger.exception("JSON parse error from Groq: %s", json_match.group()[:300])
        raise ValueError("Error al procesar la respuesta de la IA. Intenta de nuevo.") from exc

    valid_difficulties = {"easy", "medium", "hard"}
    if result.get("difficulty") not in valid_difficulties:
        result["difficulty"] = None

    raw_nicknames = result.get("nicknames")
    if isinstance(raw_nicknames, list):
        result["nicknames"] = [
            value.strip()
            for value in raw_nicknames
            if isinstance(value, str) and value.strip()
        ]
    else:
        result["nicknames"] = []

    result.setdefault("is_plant", False)
    result["confidence"] = max(0.0, min(1.0, float(result.get("confidence", 0.0))))

    return result
