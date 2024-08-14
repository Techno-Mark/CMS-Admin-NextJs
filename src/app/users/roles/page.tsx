"use client";
import { useEffect, useState } from "react";
import { post } from "@/services/apiService";
import { getRoleList } from "@/services/endpoint/users/roles";
import RolesListTable from "./RolesListTable";
// const orgId = localStorage.getItem('selectedOrgId');
const initialBody = {
  page: 0,
  limit: 10,
  search: "",
  // organizationId: orgId,
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
        //@ts-ignore
        initialBody={initialBody}
      />
    </>
  );
};

export default page;
