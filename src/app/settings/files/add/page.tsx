"use client";

import { useRouter } from "next/navigation";
import FileForm from "../FileForm";
import { ADD_File } from "@/types/apps/FilesTypes";

const Page = () => {
  const router = useRouter();

  return (
    <FileForm
      open={ADD_File}
      handleClose={() => router.push("/settings/files")}
      editingRow={null}
    />
  );
};

export default Page;
