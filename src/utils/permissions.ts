import { useEffect, useState } from "react"
import { getDecryptedPermissionData } from "./storageService"
type PermissionData = Record<string, string[]>;
export const usePermission = () => {
  const [permissionData, setPermissionData] = useState<PermissionData>({})
  const [userId, setUserId] = useState()

  const fetchDecryptedData = async () => {
    try {
      const data = await getDecryptedPermissionData()
      if (data) {
        console.log(data)

        setUserId(data.currentUserId)
        setPermissionData(data.moduleWisePermissions)
      }
    } catch (error) {
      console.error("Error fetching decrypted data:", error)
    }
  }

  useEffect(() => {
    fetchDecryptedData()
  }, [])
  const hasPermission = (module: string, action: string): boolean => {
    console.log(userId)
    console.log(permissionData)

    console.log(permissionData[module]?.includes(action) ?? false)
    if (userId === 1) {
      return true
    }

    return permissionData[module]?.includes(action) ?? false
  }

  return { hasPermission, fetchDecryptedData }
}
