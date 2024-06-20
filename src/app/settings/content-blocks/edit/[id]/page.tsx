"use client";
import React from "react";
import ContentBlockForm from "../../ContentBlockForm";

const EDIT_CONTENT_BLOCK = 1;

const page = () => {
  return <ContentBlockForm open={EDIT_CONTENT_BLOCK} />;
};

export default page;
