// utils/permissions.ts

import { useEffect, useState } from "react";
import { getDecryptedPermissionData } from "./storageService";
import { useSession } from "next-auth/react";

// Define the type for permission data
type PermissionData = Record<string, string[]>;

// A custom hook to handle fetching decrypted permission data
export const usePermission = () => {
  const [permissionData, setPermissionData] = useState<PermissionData>({});

  const fetchDecryptedData = async () => {
    try {
      const data = await getDecryptedPermissionData(); // Assumes this function is defined elsewhere
      if (data) {
        setPermissionData(data);
      }
    } catch (error) {
      console.error("Error fetching decrypted data:", error);
    }
  };

  useEffect(() => {
    fetchDecryptedData();
  }, []);
  const { data: session } = useSession();
  // Function to check if a module has a specific action
  const hasPermission = (module: string, action: string): boolean => {
    console.log(session?.user.id);
     {/* @ts-ignore */}
    if (session?.user.id === 1) {
      return true;
    }
  
    return permissionData[module]?.includes(action) ?? false;
  };

  return { hasPermission };
};
