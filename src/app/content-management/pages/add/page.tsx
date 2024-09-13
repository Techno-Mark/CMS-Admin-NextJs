"use client"
import React from "react"
import PagesForm from "../PagesForm"
import { useRouter } from 'next/navigation'
import { usePermission } from "@/utils/permissions"

const ADD_PAGES = -1

const page = () => {
  const router = useRouter()

  const { hasPermission } = usePermission()

  return <PagesForm
    open={ADD_PAGES}
    editingRow={null}
    setEditingRow={() => { }}
    handleClose={() => router.push('/content-management/pages')}
    permissionUser={hasPermission('Page', 'Create')} />
}

export default page
