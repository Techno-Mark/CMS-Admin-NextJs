"use client"
import React from "react"
import { useRouter } from "next/navigation"
import NewPopupForm from "../NewPopupForm"
import { usePermission } from "@/utils/permissions"

const ADD_PAGES = -1

const page = () => {
  const router = useRouter()
  const { hasPermission } = usePermission()
  return (
    <NewPopupForm
      open={ADD_PAGES}
      editingRow={null}
      handleClose={() => router.push("/content-management/popups")}
      permissionUser={hasPermission('Popup', 'Create')}
    />
  )
}

export default page
