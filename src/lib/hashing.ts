export function generateSalt(length = 16) {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

export function toBase64(buffer: Uint8Array<ArrayBuffer>) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function fromBase64(str: string) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

export async function hashPassword(password: string, salt: BufferSource) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits"]);

  // parameters
  const iterations = 100_000;
  const keyLength = 256;

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    key,
    keyLength
  );

  return {
    hash: new Uint8Array(derivedBits),
  };
}
