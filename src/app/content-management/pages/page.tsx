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
  active: true,
};

const Page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagesData, setPagesData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getList = async (body: any) => {
    try {
      setLoading(true);
      const result = await post(pages.list, body);
      setTotalCount(result.data.totalRoles);
      
      // if (result.data) {
        setPagesData(
          result.data.pages.map((item: any) => ({
            id: item.pageId,
            name: item.pageTitle,
            slug: item.pageSlug,
            jsonContent: item.pageContent,
            createdAt: item.createdAt,
            active: item.active,
          }))

        );
      // } else {
        // setPagesData([]);
      // }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedOrgName = localStorage.getItem('selectedOrgId');
      const newBody = { ...initialBody, organizationName: storedOrgName || "" };
      await getList(newBody);
    };

    fetchData();

    const handleDropdownChange = async (value: any) => {
      const newBody = { ...initialBody, organizationName: value };
      await getList(newBody);
    };

    eventBus.on("dropdownChange", handleDropdownChange);

    return () => {
      eventBus.remove("dropdownChange", handleDropdownChange);
    };
  }, []);

  useEffect(() => {
    const handleStorageUpdate = async () => {
      const storedOrgName = localStorage.getItem('selectedOrgId');
      const newBody = { ...initialBody, organizationName: storedOrgName || "" };
      await getList(newBody);
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate);
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

export default Page;
