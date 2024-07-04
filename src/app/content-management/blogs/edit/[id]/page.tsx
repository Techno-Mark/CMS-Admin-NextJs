"use client";

import { useRouter } from "next/navigation";
import BlogForm from "../../BlogForm";
import { blogDetailType, EDIT_BLOCK } from "@/types/apps/blogsType";
import { useEffect, useState } from "react";
import { postDataToOrganizationAPIs } from "@/services/apiService";
import { blogPost } from "@/services/endpoint/blogpost";
import LoadingBackdrop from "@/components/LoadingBackdrop";

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<blogDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postDataToOrganizationAPIs(blogPost.getById, {
          id: params.id,
        });
        if (response.statusCode !== 200) {
          throw new Error("Failed to fetch data");
        }
        const data = await response;
        setEditingRow(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      {!loading && editingRow && (
        <BlogForm
          open={EDIT_BLOCK}
          handleClose={() => router.push("/content-management/blogs")}
          editingRow={editingRow}
        />
      )}
    </>
  );
};

export default Page;