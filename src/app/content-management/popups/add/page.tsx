"use client";
import React from "react";
import PagesForm from "../PagesForm";
import { useRouter } from "next/navigation";
import NewPopupForm from "../NewPopupForm";

const ADD_PAGES = -1;

const page = () => {
  const router = useRouter();

  return (
    <NewPopupForm
      open={ADD_PAGES}
      editingRow={null}
      handleClose={() => router.push("/content-management/popups")}
    />
  );
};

export default page;
