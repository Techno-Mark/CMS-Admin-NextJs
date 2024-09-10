// storageService.ts
import { getKey, encryptData, decryptData } from './cryptoUtils';

const authSecret = process.env.NEXT_PUBLIC_AUTH_SECRET || 'mysecret';

if (!authSecret) {
  throw new Error('AUTH_SECRET is not defined in environment variables');
}

// Function to store encrypted data in localStorage
export const storePermissionData = async (data: any) => {
  try {
    const key = await getKey(authSecret);

    // Convert object to string and encrypt it
    const encryptedData = await encryptData(key, JSON.stringify(data));

    // Store encrypted data as a single item in localStorage
    localStorage.setItem('encryptedPermissionData', JSON.stringify(encryptedData));

    console.log('Permission data stored successfully!');
  } catch (error: any) {
    console.error('Error encrypting and storing permission data:', error);
  }
};


export const getDecryptedPermissionData = async () => {
    try {
      // Get encrypted data from localStorage
      const encryptedData = JSON.parse(localStorage.getItem('encryptedPermissionData') || '{}');
  
      if (!encryptedData || !encryptedData.data || !encryptedData.iv) {
        throw new Error('No encrypted permission data found');
      }
  
      const key = await getKey(authSecret);
  
      // Decrypt the stored data
      const decryptedData = await decryptData(key, encryptedData);
  
      // Parse the decrypted data (assuming it's in JSON format)
      return JSON.parse(decryptedData);
    } catch (error: any) {
      console.error('Error decrypting permission data:', error);
      return null;
    }
  };