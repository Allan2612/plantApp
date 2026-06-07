import { decode as decodeBase64, encode as encodeBase64 } from "@stablelib/base64";
import { decode as decodeUTF8, encode as encodeUTF8 } from "@stablelib/utf8";
import * as Crypto from "expo-crypto";
import nacl from "tweetnacl";

/**
 * Encriptación de mensajes (Grupo 4).
 *
 * - DM: cifrado asimétrico (nacl.box) con la llave pública del destinatario y la
 *   privada propia. El remitente NO puede descifrar su propio eco → inserción
 *   optimista en la UI.
 * - Grupal: cifrado simétrico (nacl.secretbox) con la group_key del servidor.
 *   Si el servidor no tiene group_key (cadena vacía), se usa texto plano.
 *
 * PRNG: tweetnacl necesita una fuente de aleatoriedad. En vez de
 * react-native-get-random-values (módulo nativo no disponible en Expo Go) se usa
 * expo-crypto, que funciona tanto en Expo Go como en builds EAS.
 */
nacl.setPRNG((x, n) => {
  const bytes = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i++) x[i] = bytes[i];
});

export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

export function generateKeyPair(): KeyPair {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

export function encryptDM(
  message: string,
  recipientPublicKeyB64: string,
  mySecretKeyB64: string,
): string {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box(
    encodeUTF8(message),
    nonce,
    decodeBase64(recipientPublicKeyB64),
    decodeBase64(mySecretKeyB64),
  );
  return encodeBase64(new Uint8Array([...nonce, ...encrypted]));
}

export function decryptDM(
  ciphertextB64: string,
  senderPublicKeyB64: string,
  mySecretKeyB64: string,
): string | null {
  try {
    const data = decodeBase64(ciphertextB64);
    const nonce = data.slice(0, nacl.box.nonceLength);
    const box = data.slice(nacl.box.nonceLength);
    const result = nacl.box.open(
      box,
      nonce,
      decodeBase64(senderPublicKeyB64),
      decodeBase64(mySecretKeyB64),
    );
    return result ? decodeUTF8(result) : null;
  } catch {
    return null;
  }
}

export function encryptGroup(message: string, groupKeyB64: string): string {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encrypted = nacl.secretbox(
    encodeUTF8(message),
    nonce,
    decodeBase64(groupKeyB64),
  );
  return encodeBase64(new Uint8Array([...nonce, ...encrypted]));
}

export function decryptGroup(
  ciphertextB64: string,
  groupKeyB64: string,
): string | null {
  try {
    const data = decodeBase64(ciphertextB64);
    const nonce = data.slice(0, nacl.secretbox.nonceLength);
    const box = data.slice(nacl.secretbox.nonceLength);
    const result = nacl.secretbox.open(box, nonce, decodeBase64(groupKeyB64));
    return result ? decodeUTF8(result) : null;
  } catch {
    return null;
  }
}
