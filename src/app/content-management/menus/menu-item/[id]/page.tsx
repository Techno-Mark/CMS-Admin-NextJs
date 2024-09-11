"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postDataToOrganizationAPIs } from "@/services/apiService";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { menu } from "@/services/endpoint/menu";
import MenuItem from "./MenuItem";
import { usePermission } from "@/utils/permissions";

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postDataToOrganizationAPIs(
          menu.menuItemGetById,
          {
            id: params.id,
          }
        );
        if (response.statusCode !== 200) {
          throw new Error("Failed to fetch data");
        }
        const data = await response;

        setEditingRow(data.data?.menuJSONData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);
  const { hasPermission } = usePermission()
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      {!loading && (
        <>
          <MenuItem
            menuData={editingRow}
            menuId={params.id}
            handleClose={() => router.push("/content-management/menus")}
            permissionUser={hasPermission('Menu', 'Edit')}
          />
        </>
      )}
    </>
  );
};

export default Page;
