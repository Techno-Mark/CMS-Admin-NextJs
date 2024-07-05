"use client";

import { useRouter } from 'next/navigation';
import OrganizationsForm from '../OrganizationsForm';

const page = ({ params }: { params: {  } }) => {
  const router = useRouter();

  return (
    <OrganizationsForm
      open={-1}
      editingRow={null}
      setEditingRow={()=>{}}
      handleClose={() => router.push('/settings/organizations')}
    />
  );
};

export default page;