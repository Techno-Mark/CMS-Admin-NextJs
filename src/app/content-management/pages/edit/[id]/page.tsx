"use client";
import React from "react";
import PagesForm from "../../PagesForm";

const EDIT_PAGES = 1;

const page = () => {
  return <PagesForm open={EDIT_PAGES} />;
};

export default page;
