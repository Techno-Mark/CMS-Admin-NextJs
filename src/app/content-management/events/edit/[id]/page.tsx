"use client"

import { useRouter } from "next/navigation"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import EventForm from "../../EventForm"
import { EDIT_EVENT, eventDetailType } from "@/types/apps/eventType"
import { event } from "@/services/endpoint/event"
import { useEffect, useState } from "react"
import { postDataToOrganizationAPIs } from "@/services/apiService"
import { usePermission } from "@/utils/permissions"

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<eventDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { hasPermission } = usePermission()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postDataToOrganizationAPIs(event.getById, {
          id: params.id
        })
        if (response.statusCode !== 200) {
          throw new Error("Failed to fetch data")
        }
        const data = await response
        setEditingRow(data.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      {!loading && editingRow && (
        <EventForm
          open={EDIT_EVENT}
          handleClose={() => router.push("/content-management/events")}
          editingRow={editingRow}
          permissionUser={hasPermission('Event', 'Edit')}
        />
      )}
    </>
  )
}

export default Page
