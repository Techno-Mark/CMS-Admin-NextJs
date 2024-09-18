"use client"

import { useRouter } from "next/navigation"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import EventForm from "../../CareerForm"
import { useEffect, useState } from "react"
import { postDataToOrganizationAPIs } from "@/services/apiService"
import { usePermission } from "@/utils/permissions"
import { career } from "@/services/endpoint/career"
import { careerDetailType, EDIT_CAREER } from "@/types/apps/careerType"

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<careerDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { hasPermission } = usePermission()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postDataToOrganizationAPIs(career.getById, {
          careerId: params.id
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
          open={EDIT_CAREER}
          handleClose={() => router.push("/content-management/career")}
          editingRow={editingRow}
          permissionUser={hasPermission('Career', 'Edit')}
        />
      )}
    </>
  )
}

export default Page
