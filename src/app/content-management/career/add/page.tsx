"use client"

import { useRouter } from "next/navigation"
import EventForm from "../CareerForm"
import { usePermission } from "@/utils/permissions"

const ADD_CAREER = -1

const Page = () => {
  const router = useRouter()
  const { hasPermission } = usePermission()
  return (
    <EventForm
      open={ADD_CAREER}
      handleClose={() => router.push("/content-management/career")}
      editingRow={null}
      permissionUser={hasPermission('Career', 'Create')}
    />
  )
}

export default Page
