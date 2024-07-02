"use client";
import React, { useEffect, useState } from "react";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { post } from "@/services/apiService";
import PageListTable from "./PageListTable";
import { pages } from "@/services/endpoint/pages";
import eventBus from "@/utils/eventBus";

const initialBody = {
  page: 0,
  limit: 10,
  search: "",
  organizationName: "pabs",
  active: true,
  status: "Publish",
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagesData, setPagesData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const getList = async (body: any) => {
    try {
      setLoading(true);
      const result = await post(pages.list, body);
      setTotalCount(result.data.totalRoles);
      setPagesData(
        result.data.pages.map((item: any) => ({
          id: item.pageId,
          name: item.pageTitle,
          slug: item.pageSlug,
          jsonContent: item.pageContent,
          createdAt: item.createdAt,
          status: item.active,
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleDropdownChange = async (value: any) => {
      const newBody = { ...initialBody, organizationName: value };
      getList(newBody);
    };

    eventBus.on("dropdownChange", handleDropdownChange);

    setLoading(false);
    return () => {
      eventBus.remove("dropdownChange", handleDropdownChange);
    };
  }, []);

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <PageListTable
        totalCount={totalCount}
        tableData={pagesData}
        getList={getList}
        initialBody={initialBody}
      />
    </>
  );
};

export default page;
