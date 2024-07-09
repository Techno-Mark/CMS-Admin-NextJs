"use client";

import { useRouter } from "next/navigation";
import EventForm from "../EventForm";

const ADD_EVENT = -1;

const Page = () => {
  const router = useRouter();

  return (
    <EventForm
      open={ADD_EVENT}
      handleClose={() => router.push("/content-management/events")}
      editingRow={null}
    />
  );
};

export default Page;
