"use client";
import React from "react";
import ContentBlockForm from "../ContentBlockForm";

const ADD_CONTENT_BLOCK = -1;

const page = () => {
  return <ContentBlockForm open={ADD_CONTENT_BLOCK} />;
};

export default page;
