"use client";

import { useRouter } from "next/navigation";
import UserForm from "../UserForm";

const ADD_USER = -1;

const Page = () => {
  const router = useRouter();

  return (
    <UserForm
      open={ADD_USER}
      handleClose={() => router.push("/users/management")}
      editingRow={null}
    />
  );
};

export default Page;
