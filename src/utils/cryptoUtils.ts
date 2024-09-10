// cryptoUtils.ts

// Helper function to hash the secret key to 256-bit (32 bytes)
const hashKey = async (keyString: string): Promise<ArrayBuffer> => {
    const enc = new TextEncoder();
    const keyData = enc.encode(keyString);
    return window.crypto.subtle.digest('SHA-256', keyData); // Hash key with SHA-256
  };
  
  // Generate a CryptoKey from the hashed key
  export const getKey = async (keyString: string): Promise<CryptoKey> => {
    const hashedKey = await hashKey(keyString); // Hash the key
    return window.crypto.subtle.importKey(
      'raw',
      hashedKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  };
  
  // Encrypt data using AES-GCM
  export const encryptData = async (key: CryptoKey, data: string): Promise<{ iv: string; data: string }> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
    const encodedData = new TextEncoder().encode(data); // Encode data to Uint8Array
  
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );
  
    // Convert ArrayBuffer to Base64 string
    const bufferToBase64 = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
  
    return {
      iv: bufferToBase64(iv),
      data: bufferToBase64(encryptedData),
    };
  };
  
  // Decrypt data using AES-GCM
  export const decryptData = async (key: CryptoKey, encrypted: { iv: string; data: string }): Promise<string> => {
    const base64ToBuffer = (base64: string) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const iv = base64ToBuffer(encrypted.iv);
    const encryptedData = base64ToBuffer(encrypted.data);
  
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );
  
    return new TextDecoder().decode(decryptedData);
  };
  