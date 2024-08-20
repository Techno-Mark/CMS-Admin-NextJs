"use client";

import { useRouter } from "next/navigation";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { useEffect, useState } from "react";
import { post } from "@/services/apiService";
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
        const response = await post(getUserById, { userId: params.id });
        if (response.statusCode !== 200) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.data;
        setEditingRow(data);
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
