"use client";
import UserListTable from "./ContentBlockListTable";
import { useEffect, useState } from "react";
import { callAPIwithHeaders } from "@/app/api/common/commonAPI";
import { getSectionList } from "@/app/api/content-block";
import { toast } from "react-toastify";

const initialBody = {
  page: 0,
  limit: 10,
  search: "",
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [contentBlockData, setContentBlockData] = useState([]);

  const getList = (body: any) => {
    const callBack = (status: boolean, message: string, data: any) => {
      if (status) {
        setTotalCount(data.totalRoles);
        setContentBlockData(
          data.sections.map((item: any) => ({
            id: item.sectionId,
            name: item.sectionName,
            jsonContent: item.sectionTemplate,
            status: item.active,
          }))
        );
      } else {
        toast.error(message);
      }
    };

    callAPIwithHeaders(
      getSectionList.pathName,
      getSectionList.method,
      callBack,
      body
    );
  };

  useEffect(() => {
    getList(initialBody);
  }, []);

  return (
    <>
      <UserListTable
        totalCount={totalCount}
        tableData={contentBlockData}
        getList={getList}
        initialBody={initialBody}
      />
    </>
  );
};

export default page;
