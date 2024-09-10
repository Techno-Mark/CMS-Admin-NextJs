"use client";

import { useRouter } from "next/navigation";
import StaticComponentForm from "./StaticComponentForm";
import { useEffect, useState } from "react";
import { get, postDataToOrganizationAPIs } from "@/services/apiService";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { staticContentBlock } from "@/services/endpoint/staticContentBlock";
import { section } from "@/services/endpoint/section";
import { usePermission } from "@/utils/permissions";

const Page = ({ params }: { params: { id: string } }) => {
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [sectionScheam, setSectionSchema] = useState<any>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staticContentBlockSchema, staticContentBlockData] =
          await Promise.all([
            get(`${section.getById}/${params.id}`),
            postDataToOrganizationAPIs(staticContentBlock.getById, {
              id: params.id,
            }),
          ]);
        setEditingRow(staticContentBlockData.data);
        setSectionSchema(staticContentBlockSchema.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);
  const { hasPermission } = usePermission()
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      {!loading  && (
        <StaticComponentForm
          editingRow={editingRow}
          sectionSchema={sectionScheam}
          handleClose={() =>
            router.push("/content-management/static-component")
          }
          permissionUser={hasPermission('Static Component', 'Edit')}
        />
      )}
    </>
  );
};

export default Page;
