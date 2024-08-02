"use client";
import { useEffect, useState } from "react";
import { post } from "@/services/apiService";
import { getRoleList } from "@/services/endpoint/users/roles";
import RolesListTable from "./RolesListTable";

const initialBody = {
  page: 0,
  limit: 10,
  search: "",
  organizationId: 1,
  active: null,
};

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [rolesData, setRolesData] = useState([]);

  const getList = async (body: any) => {
    try {
      const result = await post(getRoleList, body);
      setTotalCount(result.data.totalRoles);
      setRolesData(result.data.roles);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getList(initialBody);
  }, []);

  return (
    <>
      <RolesListTable
        totalCount={totalCount}
        tableData={rolesData}
        getList={getList}
        initialBody={initialBody}
      />
    </>
  );
};

export default page;
