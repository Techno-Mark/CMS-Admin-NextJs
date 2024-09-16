"use client"

import { useRouter } from "next/navigation"
// eslint-disable-next-line
import { EDIT_File } from "@/types/apps/FilesTypes"
import FileForm from "../../FileForm"
import { usePermission } from "@/utils/permissions"

const Page = () => {
  const router = useRouter()
  const { hasPermission } = usePermission()

  return (
    <FileForm
      // eslint-disable-next-line
      open={EDIT_File}
      handleClose={() => router.push("/content-management/media")}
      editingRow={null}
      permissionUser={hasPermission('Media', 'Edit')}
    />
  )
}

export default Page
