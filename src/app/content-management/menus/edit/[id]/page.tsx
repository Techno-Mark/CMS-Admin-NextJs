"use client";

import { useRouter } from "next/navigation";
import { EDIT_BLOG } from "@/types/apps/blogsType";
import { useEffect, useState } from "react";
import { postDataToOrganizationAPIs } from "@/services/apiService";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import MenuForm from "../../MenuForm";
import { menu } from "@/services/endpoint/menu";
import { menuDetailType } from "@/types/apps/menusType";

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<menuDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postDataToOrganizationAPIs(menu.getById, {
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
        <MenuForm
          open={EDIT_BLOG}
          editingRow={editingRow}
          handleClose={() => router.push("/content-management/menus")}
        />
      )}
    </>
  );
};

export default Page;