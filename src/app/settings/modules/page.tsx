"use client"
import { useEffect, useState } from "react"
import { post } from "@/services/apiService"
import PermissionsListTable from "./PermissionsListTable"
import { modules } from "@/services/endpoint/modules"

const initialBody = {
  page: 0,
  limit: 1000,
  search: "",
  active: null
}

const Page = () => {
  const [totalCount, setTotalCount] = useState<number>(0)
  const [permissionsData, setPermissionsData] = useState([])

  const getList = async (body: any) => {
    try {
      const result = await post(modules.list, body)
      setTotalCount(result.data.totalRoles)
      setPermissionsData(result.data.modules)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getList(initialBody)
  }, [])

  return (
    <>
      <PermissionsListTable
        totalCount={totalCount}
        tableData={permissionsData}
        getList={getList}
        initialBody={initialBody}
      />
    </>
  )
}

export default Page
