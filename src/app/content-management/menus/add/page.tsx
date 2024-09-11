"use client";

import { useRouter } from "next/navigation";
import { ADD_BLOG } from "@/types/apps/blogsType";
import MenuForm from "../MenuForm";
import { usePermission } from "@/utils/permissions";

const Page = () => {
  const router = useRouter();
  const { hasPermission } = usePermission()
  return (
    <MenuForm
      open={ADD_BLOG}
      handleClose={() => router.push("/content-management/menus")}
      editingRow={null}
      permissionUser={hasPermission('Menu', 'Create')}
    />
  );
};

export default Page;
