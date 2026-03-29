const firebaseAuthMessages: Record<string, string> = {
  "auth/invalid-api-key": "La configuración de Firebase es inválida (API key). Revisa tu .env.",
  "auth/operation-not-allowed": "El proveedor Email/Password no está habilitado en Firebase.",
  "auth/network-request-failed": "No hay conexión con Firebase. Revisa tu conexión e inténtalo de nuevo.",
  "auth/missing-email": "Debes ingresar un correo.",
  "auth/invalid-email": "Ingresa un correo válido.",
  "auth/missing-password": "Debes ingresar una contraseña.",
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Este correo ya está en uso.",
  "auth/weak-password": "La contraseña es muy débil.",
  "auth/user-not-found": "No existe una cuenta con ese correo.",
  "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
  "auth/user-disabled": "Esta cuenta fue deshabilitada.",
};

const httpStatusMessages: Record<number, string> = {
  400: "La solicitud no es válida.",
  401: "Tu sesión no es válida o expiró. Inicia sesión nuevamente.",
  403: "No tienes permisos para realizar esta acción.",
  404: "No se encontró la información solicitada.",
  409: "Ya existe un registro con esos datos.",
  422: "Algunos datos del formulario no son válidos.",
  429: "Se superó el límite de solicitudes. Inténtalo más tarde.",
  500: "Ocurrió un error en el servidor. Inténtalo más tarde.",
  502: "El servicio no está disponible temporalmente.",
  503: "El servicio está temporalmente fuera de línea.",
  504: "El servidor tardó demasiado en responder.",
};

function getRawMessage(input: unknown): string {
  if (typeof input === "string") return input.trim();
  if (input instanceof Error) return (input.message ?? "").trim();
  return "";
}

export function mapFirebaseAuthCode(code?: string): string {
  if (!code) return "Ocurrió un error de autenticación.";
  return firebaseAuthMessages[code] ?? "No fue posible autenticarte en este momento.";
}

export function mapHttpStatus(status: number): string {
  return httpStatusMessages[status] ?? `No se pudo completar la solicitud (HTTP ${status}).`;
}

export function extractFirebaseAuthCode(message: string): string | null {
  const match = message.match(/auth\/[a-z-]+/i);
  return match ? match[0].toLowerCase() : null;
}

export function normalizeErrorMessage(
  input: unknown,
  fallback = "Ocurrió un error inesperado. Inténtalo de nuevo.",
): string {
  const rawMessage = getRawMessage(input);
  if (!rawMessage) return fallback;

  const firebaseCode = extractFirebaseAuthCode(rawMessage);
  if (firebaseCode) {
    return mapFirebaseAuthCode(firebaseCode);
  }

  const httpMatch = rawMessage.match(/^HTTP\s+(\d{3})$/i);
  if (httpMatch) {
    return mapHttpStatus(Number(httpMatch[1]));
  }

  if (/AbortError|tiempo de espera|timeout/i.test(rawMessage)) {
    return "La solicitud tardó demasiado. Verifica tu conexión e inténtalo de nuevo.";
  }

  if (/Network request failed|Failed to fetch|network/i.test(rawMessage)) {
    return "No hay conexión disponible en este momento.";
  }

  return rawMessage;
}
