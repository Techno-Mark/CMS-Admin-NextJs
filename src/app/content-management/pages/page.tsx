"use client"
import { usePermission } from "@/utils/permissions"
import PageListTable from "./PageListTable"
import { useEffect, useState } from "react"
import { authnetication } from "@/services/endpoint/auth"
import { post } from "@/services/apiService"
import { storePermissionData } from "@/utils/storageService"

const Page = () => {
  return (
    <>
      <PageListTable />
    </>
  )
}

export default Page
