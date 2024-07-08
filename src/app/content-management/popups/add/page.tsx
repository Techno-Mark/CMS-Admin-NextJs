"use client";

import { useRouter } from "next/navigation";
import { ADD_BLOG } from "@/types/apps/blogsType";
import PopupForm from "../PopupForm";

const Page = () => {
  const router = useRouter();

  return (
    <PopupForm
      open={ADD_BLOG}
      handleClose={() => router.push("/content-management/blogs")}
      editingRow={null}
    />
  );
};

export default Page;
