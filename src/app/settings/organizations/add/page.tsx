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



// "use client";
// import React from "react";
// import OrganizationsForm from "../OrganizationsForm";

// const page = () => {
//   return (
//     <OrganizationsForm
//       open={-1}
//       editingRow={null}
//       setEditingRow={() => {}}
//       handleClose={() => {}}
//     />
//   );
// };

// export default page;

//   <OrganizationsForm
// open={-1}
// editingRow={null}
// setEditingRow={() => {}}
// handleClose={() => {}}
// />
