"use client";
import UserListTable from "./ContentBlockListTable";
import { useEffect, useState } from "react";
import { getSectionList } from "@/app/api/content-block";
import { post } from "@/services/apiService";

const initialBody = {
  page: 0,
  limit: 10,
  search: "",
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [contentBlockData, setContentBlockData] = useState([]);

  const getList = async (body: any) => {
    try {
      const result = await post(getSectionList, body);
      setTotalCount(result.data.totalRoles);
      setContentBlockData(
        result.data.sections.map((item: any) => ({
          id: item.sectionId,
          name: item.sectionName,
          slug: item.sectionSlug,
          jsonContent: item.sectionTemplate,
          createdAt: item.createdAt,
          status: item.active,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
    }
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
