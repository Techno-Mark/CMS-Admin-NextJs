"use client";

// MUI Imports
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import type { CardProps } from "@mui/material/Card";

import OpenDialogOnElementClick from "@/components/Dialogs/OpenDialogOnElementClick";
import RoleDialog from "./RoleDialog";

const RoleCards = ({ openDialog, setOpenDialog }: any) => {
  const CardProps: CardProps = {
    className: "cursor-pointer bs-full",
    children: (
      <Button
        variant="contained"
        startIcon={<i className="tabler-plus" />}
        className="is-full sm:is-auto"
      >
        Add Role
      </Button>
    ),
  };

  return (
    <OpenDialogOnElementClick
      element={Card}
      elementProps={CardProps}
      dialog={RoleDialog}
      openDialog={openDialog}
      setOpenDialog={setOpenDialog}
    />
  );
};

export default RoleCards;
