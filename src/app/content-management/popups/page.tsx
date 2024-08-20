"use client";
import React, { useEffect, useState } from "react";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { post } from "@/services/apiService";
import PageListTable from "./PageListTable";
import {  popups } from "@/services/endpoint/popup";
import eventBus from "@/utils/eventBus";

const initialBody = {
  page: 0,
  limit: 10,
  search: "",
  active: true,
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagesData, setPagesData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const getList = async (body: any) => {
    try {
      setLoading(true);
      const result = await post(popups.list, body);
      setTotalCount(result.data.totalPopups);
      setPagesData(
        result.data.popups.map((item: any) => ({
          popupId: item.popupId,
          popupTitle: item.popupTitle,
          createdAt: item.createdAt,
          active: item.active,
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

export default page;
