import UserListTable from "./ContentBlockListTable";

const page = () => {
  return (
    <>
      <UserListTable
        tableData={[
          {
            id: 1,
            name: "demo user",
            status: true,
            createdAt: "today",
            jsonContent: JSON.stringify({
              name: "John Doe",
              age: 30,
              email: "john@example.com",
              address: {
                street: "123 Main St",
                city: "Anytown",
                zip: "12345",
              },
              isMember: true,
              orders: [
                {
                  id: "001",
                  product: "Widget",
                  quantity: 2,
                },
                {
                  id: "002",
                  product: "Gadget",
                  quantity: 1,
                },
              ],
            }),
          },
        ]}
      />
    </>
  );
};

export default page;
