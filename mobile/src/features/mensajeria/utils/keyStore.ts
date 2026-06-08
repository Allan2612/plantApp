import * as SecureStore from "expo-secure-store";

import type { KeyPair } from "./crypto";

/**
 * Persistencia del par de llaves en el almacenamiento cifrado del dispositivo
 * (expo-secure-store). No usar AsyncStorage: no está cifrado.
 *
 * Las llaves se separan por usuario de plantApp (sufijo) para que cuentas
 * distintas en el mismo dispositivo no compartan identidad criptográfica.
 */

const SECRET_KEY = "chat_secretKey";
const PUBLIC_KEY = "chat_publicKey";

function keys(suffix?: string) {
  const s = suffix ? `_${suffix}` : "";
  return { secret: `${SECRET_KEY}${s}`, public: `${PUBLIC_KEY}${s}` };
}

export async function saveKeyPair(kp: KeyPair, suffix?: string): Promise<void> {
  const k = keys(suffix);
  await SecureStore.setItemAsync(k.secret, kp.secretKey);
  await SecureStore.setItemAsync(k.public, kp.publicKey);
}

export async function loadKeyPair(suffix?: string): Promise<KeyPair | null> {
  const k = keys(suffix);
  const secretKey = await SecureStore.getItemAsync(k.secret);
  const publicKey = await SecureStore.getItemAsync(k.public);
  if (secretKey && publicKey) return { secretKey, publicKey };
  return null;
}
