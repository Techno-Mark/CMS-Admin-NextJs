"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { get, post } from '@/services/apiService';
import TemplateForm from '../../TemplateForm';
import { template } from '@/services/endpoint/template';
import { TemplateType } from '@/types/apps/templateType';

const EditTemplatePage = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<TemplateType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(template.getById+'/'+params.id);
        if (response.statusCode !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = await response;
        setEditingRow(data.data);

        // const response1 = await get(template.getBySlug+'/'+params.id);
        // if (response.statusCode !== 200) {
        //   throw new Error('Failed to fetch data');
        // }
        // const data1 = await response1;
        // setEditingRow(data.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error, maybe show a toast or redirect
      }
    };

    fetchData();
  }, [params.id]);

  return (
    <TemplateForm
      open={1}
      editingRow={editingRow}
      setEditingRow={setEditingRow}
      handleClose={() => router.push('/settings/templates')}
    />
  );
};

export default EditTemplatePage;
