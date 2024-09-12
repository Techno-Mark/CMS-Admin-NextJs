"use client";
import React from "react";
import PagesForm from "../../PagesForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { post } from "@/services/apiService";
import { PopupTypes } from "../../popupTypes";
import { popups } from "@/services/endpoint/popup";
import NewPopupForm from "../../NewPopupForm";
import { usePermission } from "@/utils/permissions";

const page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<PopupTypes | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await post(popups.getById, { id: params.id });
        if (response.statusCode !== 200) {
          throw new Error("Failed to fetch data");
        }
        const data = await response;
        setEditingRow(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [params.id]);
  const { hasPermission } = usePermission()
  return (
    <>
      {editingRow && (
        <NewPopupForm
          open={1}
          editingRow={editingRow}
          handleClose={() => router.push("/content-management/popups")}
          permissionUser={hasPermission('Popup', 'Edit')}
        />
      )}
    </>
  );
};

export default page;
