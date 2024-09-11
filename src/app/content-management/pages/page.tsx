"use client";
import { usePermission } from "@/utils/permissions";
import PageListTable from "./PageListTable";
import { useEffect, useState } from "react";
import { authnetication } from "@/services/endpoint/auth";
import { post } from "@/services/apiService";
import { storePermissionData } from "@/utils/storageService";

const Page = () => {
  const { hasPermission } = usePermission()
  const editPer = hasPermission('Page', 'Edit');
  const createPer = hasPermission('Page', 'Create');
  const deletePer = hasPermission('Page', 'Delete');

  const getPermissionModule = async () => {
    
      try {
        const result = await post(authnetication.user_permission_data, {});
        await storePermissionData(result.data);
      } catch (error: any) {
        console.error(error);

    
    }
  };
  useEffect(() => {


    getPermissionModule();
  }, []);

  return (
    <>
      <PageListTable
        editPer={editPer}
        createPer={createPer}
        deletePer={deletePer}
      />
    </>
  );
};

export default Page;
