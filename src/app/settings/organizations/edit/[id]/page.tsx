"use client"

import { OrganizationsType } from '@/types/apps/organizationsType'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OrganizationsForm from '../../OrganizationsForm'
import { post } from '@/services/apiService'
import { organization } from '@/services/endpoint/organization'

const EditOrganizationPage = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<OrganizationsType | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await post(organization.getById, { id: params.id })
        if (response.statusCode !== 200) {
          throw new Error('Failed to fetch data')
        }
        const data = await response
        setEditingRow(data.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Handle error, maybe show a toast or redirect
      }
    }

    fetchData()
  }, [params.id])

  return (
    <OrganizationsForm
      open={1}
      editingRow={editingRow}
      setEditingRow={setEditingRow}
      handleClose={() => router.push('/settings/organizations')}
    />
  )
}

export default EditOrganizationPage
