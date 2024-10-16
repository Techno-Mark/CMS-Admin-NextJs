"use client"

import { useRouter } from "next/navigation"
import EventForm from "../EventForm"
import { usePermission } from "@/utils/permissions"

const ADD_EVENT = -1

const Page = () => {
  const router = useRouter()
  const { hasPermission } = usePermission()
  return (
    <EventForm
      open={ADD_EVENT}
      handleClose={() => router.push("/content-management/events")}
      editingRow={null}
      permissionUser={hasPermission('Event', 'Create')}
    />
  )
}

export default Page
