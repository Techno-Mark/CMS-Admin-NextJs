"use client";
import UserListTable from "./ContentBlockListTable";
import { useEffect, useState } from "react";
import { getSectionList } from "@/app/api/content-block";
import { post } from "@/services/apiService";
import LoadingBackdrop from "@/components/LoadingBackdrop";

const initialBody = {
  page: 0,
  limit: 10,
  search: "",
  active:null
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [contentBlockData, setContentBlockData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const getList = async (body: any) => {
    try {
      setLoading(true);
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
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getList(initialBody);
  }, []);

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
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
