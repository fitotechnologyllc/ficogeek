import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Validates that the encryption key is present in production.
 * This is called by encrypt/decrypt to ensure we don't accidentally
 * use the fallback key in a live production environment.
 */
function ensureKey() {
  if (IS_PROD && !ENCRYPTION_KEY) {
    // If we're in production but no key is set, we must throw to prevent data loss or insecure storage.
    // However, we allow the build process to proceed by not throwing at the top level of the module.
    throw new Error("CRITICAL: ENCRYPTION_KEY environment variable is missing in production!");
  }
}

const FINAL_KEY = ENCRYPTION_KEY || "fallback_dev_key_32_chars_long_!!";
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Used for storing sensitive data securely in Firestore.
 */
export function encrypt(text: string): string {
  ensureKey();
  
  // Ensure we have a valid 32-byte key
  const key = crypto.createHash('sha256').update(String(FINAL_KEY)).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Return as IV:AuthTag:EncryptedData
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string that was encrypted with encrypt().
 */
export function decrypt(hash: string): string {
  ensureKey();
  
  try {
    const [ivHex, authTagHex, encryptedText] = hash.split(":");
    
    const key = crypto.createHash('sha256').update(String(FINAL_KEY)).digest();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("[Encryption] Decryption failed:", err);
    throw new Error("Failed to decrypt sensitive data.");
  }
}
