"use client";
import React from "react";
import ContentBlockForm from "../OrganizationsBlockForm";

const page = () => {
  return (
    <ContentBlockForm
      open={-1}
      editingRow={null}
      setEditingRow={() => {}}
      handleClose={() => {}}
    />
  );
};

export default page;
