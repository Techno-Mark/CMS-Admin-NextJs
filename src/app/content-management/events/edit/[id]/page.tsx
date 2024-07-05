"use client";

import { useRouter } from "next/navigation";
import EventForm from "../../EventForm";

const EDIT_EVENT = 1;

const Page = () => {
  const router = useRouter();

  return (
    <EventForm
      open={EDIT_EVENT}
      handleClose={() => router.push("/content-management/events")}
    />
  );
};

export default Page;
