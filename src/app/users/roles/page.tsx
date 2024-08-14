"use client";

import { useEffect, useState } from "react";
import { post } from "@/services/apiService";
import { getRoleList } from "@/services/endpoint/users/roles";
import RolesListTable from "./RolesListTable";

const page = () => {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [rolesData, setRolesData] = useState([]);
  const [initialBody, setInitialBody] = useState({
    page: 0,
    limit: 10,
    search: "",
    organizationId: null,
    active: null,
  });

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
    // Retrieve organizationId from localStorage only on the client side
    const orgId = localStorage.getItem('selectedOrgId');
    if (orgId) {
      setInitialBody((prevBody:any) => ({
        ...prevBody,
        organizationId: orgId,
      }));
    }
  }, []);

  useEffect(() => {
    if (initialBody.organizationId) {
      getList(initialBody);
    }
  }, [initialBody]);

  useEffect(() => {
    const handleStorageUpdate = async () => {
      const storedOrgName = localStorage.getItem('selectedOrgId');
      const getList = async (body: any) => {
        try {
          const result = await post(getRoleList, body);
          setTotalCount(result.data.totalRoles);
          setRolesData(result.data.roles);
        } catch (error) {
          console.error(error);
        }
      };
      getList(initialBody);
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate);
    };
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
