"use client"

import { useRouter } from "next/navigation"
import FileForm from "../FileForm"
import { ADD_File } from "@/types/apps/FilesTypes"
import { usePermission } from "@/utils/permissions"

const Page = () => {
  const router = useRouter()
  const { hasPermission } = usePermission()
  return (
    <FileForm
      open={ADD_File}
      handleClose={() => router.push("/content-management/media")}
      editingRow={null}
      permissionUser={hasPermission('Media', 'Create')}
    />
  )
}

export default Page
