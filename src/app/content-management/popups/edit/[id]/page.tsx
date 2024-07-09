"use client";
import React from "react";
import PagesForm from "../../PagesForm";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { post } from '@/services/apiService';
import { pages } from '@/services/endpoint/pages';
import { PagesType } from "../../pagesType";

const page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<PagesType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await post(pages.getById, { id: params.id });
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
