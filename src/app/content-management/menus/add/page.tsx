"use client";

import { useRouter } from "next/navigation";
import { ADD_BLOG } from "@/types/apps/blogsType";
import MenuForm from "../MenuForm";

const Page = () => {
  const router = useRouter();

  return (
    <MenuForm
      open={ADD_BLOG}
      handleClose={() => router.push("/content-management/menus")}
      editingRow={null}
    />
  );
};

export default Page;
