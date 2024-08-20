"use client";

import { useRouter } from "next/navigation";
import { EDIT_File } from "@/types/apps/FilesTypes";
import FileForm from "../../FileForm";

const Page = () => {
  const router = useRouter();

  return (
    <FileForm
      open={EDIT_File}
      handleClose={() => router.push("/settings/files")}
      editingRow={null}
    />
  );
};

export default Page;
