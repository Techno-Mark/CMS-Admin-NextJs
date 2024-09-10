"use client";

import { useRouter } from "next/navigation";
import BlogForm from "@/app/content-management/blogs/BlogForm";
import { ADD_BLOG } from "@/types/apps/blogsType";
import { useEffect, useState } from "react";
import { usePermission } from "@/utils/permissions";

const Page = () => {
  const router = useRouter();

  // const [permissionData, setPermissionData] = useState<Record<string, string[]>>({})


  // const fetchDecryptedData = async () => {
  //   try {
  //     const data = await getDecryptedPermissionData()
  //     if (data) {
  //       setPermissionData(data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching decrypted data:', error)
  //   }
  // }

  // useEffect(() => {
  //   fetchDecryptedData()
  // }, [])

  // const hasPermission = (module: string, action: string) => {
  //   return permissionData[module]?.includes(action) ?? false
  // }

  const { hasPermission } = usePermission()
  return (
    <BlogForm
      open={ADD_BLOG}
      handleClose={() => router.push("/content-management/blogs")}
      editingRow={null}
      permissionUser={hasPermission('Blog', 'Create')}
    />
  );
};

export default Page;
