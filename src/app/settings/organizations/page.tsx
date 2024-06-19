import OrganizationsListTable from "./OrganizationsListTable";

const page = () => {
  return (
    <>
      <OrganizationsListTable
        tableData={[
          {
            id: 1,
            name: "Technomark",
            status: true,
            prefix: "TM_"
           
          },
        ]}
      />
    </>
  );
};

export default page;
