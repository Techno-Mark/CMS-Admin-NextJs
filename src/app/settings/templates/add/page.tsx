"use client";

import { useRouter } from 'next/navigation';
import TemplateForm from '../TemplateForm';
 

const page = ({ params }: { params: {  } }) => {
  const router = useRouter();

  return (
    <TemplateForm
      open={-1}
      editingRow={null}
      setEditingRow={()=>{}}
      handleClose={() => router.push('/settings/templates')}
    />
  );
};

export default page;

