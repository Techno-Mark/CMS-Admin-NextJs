// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import { post } from "@/services/apiService";
import { deleteEvent } from "@/services/endpoint/events";
import { useState } from "react";

type ConfirmationDialogProps = {
  deletingId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  setDeletingId: React.Dispatch<React.SetStateAction<number>>;
};

const ConfirmationDialog = ({
  deletingId,
  open,
  setOpen,
  setDeletingId,
}: ConfirmationDialogProps) => {
  const [deleteData, setDeleteData] = useState<boolean>(false);
  const deleteContentBlock = async () => {
    try {
      const result = await post(deleteEvent, {
        eventId: deletingId,
      });

      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(0);
      setOpen(false);
      setDeleteData(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={() => {
        setOpen(false);
        setDeleteData(false);
      }}
    >
      <DialogContent className="flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
        <i className="tabler-alert-circle text-[88px] mbe-6 text-warning" />
        <Typography variant="h5">
          {deleteData
            ? "Are you sure you want to delete this event?"
            : "Please unlink this event from all templates"}
        </Typography>
      </DialogContent>
      <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button
          variant="contained"
          onClick={() =>
            deleteData ? deleteContentBlock() : setDeleteData(true)
          }
        >
          {deleteData ? "Yes" : "Unlink"}
        </Button>
        <Button
          variant="tonal"
          color="secondary"
          onClick={() => {
            setOpen(false);
            setDeleteData(false);
          }}
        >
          {deleteData ? "No" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
