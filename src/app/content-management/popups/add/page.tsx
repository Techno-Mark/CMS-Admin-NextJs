"use client";
import React from "react";
import PagesForm from "../PagesForm";
import { useRouter } from 'next/navigation';

const ADD_PAGES = -1;

const page = () => {
  const router = useRouter();

  return <PagesForm 
  open={ADD_PAGES} 
  editingRow={null}
  setEditingRow={()=>{}}
  handleClose={() => router.push('/content-management/popups')}/>;
};

export default page;