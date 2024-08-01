"use client";
import React from "react";
import PagesForm from "../../PagesForm";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { post } from '@/services/apiService';
import { PopupTypes } from "../../popupTypes";
import { popups } from "@/services/endpoint/popup";

const page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<PopupTypes | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await post(popups.getById, { id: params.id });
        if (response.statusCode !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = await response;
        setEditingRow(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.id]);

  return (
    <PagesForm
      open={1}
      editingRow={editingRow}
      setEditingRow={setEditingRow}
      handleClose={() => router.push('/content-management/popups')}
    />
  );
};

export default page;
