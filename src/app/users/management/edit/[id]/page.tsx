"use client";

import { useRouter } from "next/navigation";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { useEffect, useState } from "react";
import { get } from "@/services/apiService";
import UserForm from "../../UserForm";
import { getUserById } from "@/services/endpoint/users/management";

const EDIT_USER = 1;

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(getUserById(params.id));
        if (response.statusCode !== 200) {
          throw new Error("Failed to fetch data");
        }
        const data = await response;
        setEditingRow(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setEditingRow({
          userId: 1,
          userName: "iron man",
          userEmail: "ironman@yopmail.com",
          company:
            '[{"id":0,"companyId":1,"roleId":1},{"id":0,"companyId":1,"roleId":2},{"id":0,"companyId":1,"roleId":2}]',
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      {!loading && editingRow && (
        <UserForm
          open={EDIT_USER}
          handleClose={() => router.push("/users/management")}
          editingRow={editingRow}
        />
      )}
    </>
  );
};

export default Page;
