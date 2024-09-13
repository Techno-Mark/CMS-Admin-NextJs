"use client"
import React, { useEffect, useState } from "react"
import PagesForm from "../../PagesForm"
import { useRouter } from 'next/navigation'
import { post } from '@/services/apiService'
import { pages } from '@/services/endpoint/pages'
import { PagesType } from "../../pagesType"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import { usePermission } from "@/utils/permissions"

const page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<PagesType | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await post(pages.getById, { id: params.id })
        if (response.statusCode !== 200) {
          throw new Error('Failed to fetch data')
        }
        const data = await response
        setEditingRow(data.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [params.id])
  const { hasPermission } = usePermission()
  return (<>
    <LoadingBackdrop isLoading={loading} />
    <PagesForm
      open={1}
      editingRow={editingRow}
      setEditingRow={setEditingRow}
      handleClose={() => router.push('/content-management/pages')}
      permissionUser={hasPermission('Page', 'Edit')}
    /></>
  )
}

export default page
