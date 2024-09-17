"use client"

import { useRouter } from "next/navigation"
import BlogForm from "@/app/content-management/blogs/BlogForm"
import { ADD_BLOG } from "@/types/apps/blogsType"
import { usePermission } from "@/utils/permissions"

const Page = () => {
  const router = useRouter()

  const { hasPermission } = usePermission()
  return (
    <BlogForm
      open={ADD_BLOG}
      handleClose={() => router.push("/content-management/blogs")}
      editingRow={null}
      permissionUser={hasPermission('Blog', 'Create')}
    />
  )
}

export default Page
