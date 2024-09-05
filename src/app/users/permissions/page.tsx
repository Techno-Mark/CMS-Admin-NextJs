"use client";
import { useEffect, useState } from "react";
import { post } from "@/services/apiService";
import { getPermissionsList } from "@/services/endpoint/users/permissions";
import PermissionsListTable from "./PermissionsListTable";

const initialBody = {
  page: 0,
  limit: 1000,
  search: "",
  active: null,
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [permissionsData, setPermissionsData] = useState([]);

  const getList = async (body: any) => {
    try {
      const result = await post(getPermissionsList, body);
      setTotalCount(result.data.totalRoles);
      setPermissionsData(result.data.permissions);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getList(initialBody);
  }, []);

  return (
    <>
      <PermissionsListTable
        totalCount={totalCount}
        tableData={permissionsData}
        getList={getList}
        initialBody={initialBody}
      />
    </>
  );
};

export default page;
