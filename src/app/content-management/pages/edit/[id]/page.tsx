"use client";
import React from "react";
import PagesForm from "../../PagesForm";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { post } from '@/services/apiService';
import { pages } from '@/services/endpoint/pages';
import { PagesType } from "../../pagesType";
import LoadingBackdrop from "@/components/LoadingBackdrop";

const page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<PagesType | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
  
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await post(pages.getById, { id: params.id });
        if (response.statusCode !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = await response;
        setEditingRow(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.id]);

  return (<>
    <LoadingBackdrop isLoading={loading} />
    <PagesForm
      open={1}
      editingRow={editingRow}
      setEditingRow={setEditingRow}
      handleClose={() => router.push('/content-management/pages')}
    /></>
  );
};

export default page;
