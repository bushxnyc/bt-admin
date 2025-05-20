/**
 * Edge Runtime compatible MD5 HMAC implementation
 * Uses only APIs available in Edge Runtime
 */

export async function createHmacSha1(
  message: string | Uint8Array,
  key: string | Uint8Array,
): Promise<string> {
  // Convert string inputs to Uint8Array if needed
  const messageBuffer =
    typeof message === "string" ? new TextEncoder().encode(message) : message;

  const keyBuffer =
    typeof key === "string" ? new TextEncoder().encode(key) : key;

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    {
      name: "HMAC",
      hash: { name: "SHA-1" },
    },
    false, // extractable
    ["sign"], // key usages
  );

  // Create the HMAC
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBuffer);

  // Convert the result to hex string
  return arrayBufferToHexString(signature);
}

/**
 * Converts an ArrayBuffer to a hex string
 * @param buffer - The ArrayBuffer to convert
 * @returns A hex string representation
 */
function arrayBufferToHexString(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  let hexString = "";

  for (let i = 0; i < byteArray.byteLength; i++) {
    const hex = byteArray[i].toString(16).padStart(2, "0");
    hexString += hex;
  }

  return hexString;
}
