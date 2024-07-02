"use client";
import React from "react";
import PagesForm from "../PagesForm";

const ADD_PAGES = -1;

const page = () => {
  return <PagesForm open={ADD_PAGES} />;
};

export default page;
