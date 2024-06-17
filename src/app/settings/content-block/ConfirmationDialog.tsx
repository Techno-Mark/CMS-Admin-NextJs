// React Imports
import { Fragment, useState } from "react";

// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// Third-party Imports
import classnames from "classnames";

type ConfirmationType = "delete-account" | "unsubscribe" | "suspend-account";

type ConfirmationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  type: ConfirmationType;
};

const ConfirmationDialog = ({
  open,
  setOpen,
  type,
}: ConfirmationDialogProps) => {
  const handleConfirmation = (value: boolean) => {
    setOpen(false);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)}>
      <DialogContent className="flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
        <i className="tabler-alert-circle text-[88px] mbe-6 text-warning" />
        <Typography variant="h5">
          Are you sure you want to delete the content block?
        </Typography>
      </DialogContent>
      <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button variant="contained" onClick={() => handleConfirmation(true)}>
          Yes
        </Button>
        <Button
          variant="tonal"
          color="secondary"
          onClick={() => {
            handleConfirmation(false);
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
