"use client";

import { useRouter } from "next/navigation";
import BlogForm from "@/app/content-management/blogs/BlogForm";
import { ADD_BLOG } from "@/types/apps/blogsType";

const Page = () => {
  const router = useRouter();

  return (
    <BlogForm
      open={ADD_BLOG}
      handleClose={() => router.push("/content-management/blogs")}
      editingRow={null}
    />
  );
};

export default Page;
