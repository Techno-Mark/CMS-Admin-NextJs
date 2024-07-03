"use client";

import { useRouter } from "next/navigation";
import BlogForm from "../../BlogForm";

const ADD_CONTENT_BLOCK = -1;

const Page = () => {
  const router = useRouter();

  return (
    <BlogForm
      open={ADD_CONTENT_BLOCK}
      handleClose={() => router.push("/content-management/blogs")}
    />
  );
};

export default Page;
