import { getKey, encryptData, decryptData } from "./cryptoUtils";

const authSecret = process.env.NEXT_PUBLIC_AUTH_SECRET || "mysecret";

if (!authSecret) {
  throw new Error("AUTH_SECRET is not defined in environment variables");
}

export const storePermissionData = async (data: any) => {
  try {
    const key = await getKey(authSecret);
    const encryptedData = await encryptData(key, JSON.stringify(data));
    localStorage.setItem(
      
      "encryptedPermissionData",
      JSON.stringify(encryptedData)
    );
  } catch (error: any) {
    console.error("Error encrypting and storing permission data:", error);
  }
};

export const getDecryptedPermissionData = async () => {
  try {
    const encryptedData = JSON.parse(
      localStorage.getItem("encryptedPermissionData") || "{}"
    );
    if (!encryptedData || !encryptedData.data || !encryptedData.iv) {
      throw new Error("No encrypted permission data found");
    }
    const key = await getKey(authSecret);
    const decryptedData = await decryptData(key, encryptedData);

    return JSON.parse(decryptedData);
  } catch (error: any) {
    console.error("Error decrypting permission data:", error);
    return null;
  }
};
