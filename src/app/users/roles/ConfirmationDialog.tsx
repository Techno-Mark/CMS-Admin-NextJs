// MUI Imports
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { toast } from "react-toastify"
import { post } from "@/services/apiService"
import { deleteRole } from "@/services/endpoint/users/roles"

type ConfirmationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  setDeletingId: React.Dispatch<React.SetStateAction<number>>;
  deletePayload: object;

};

const ConfirmationDialog = ({
  open,
  setOpen,

  setDeletingId,
  deletePayload
}: ConfirmationDialogProps) => {
  const handleDeletePermission = async () => {
    try {
      const result = await post(deleteRole, deletePayload)

      if (result.status === "success") {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingId(0)
      setOpen(false)
    }
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)}>
      <DialogContent className="flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
        <i className="tabler-alert-circle text-[88px] mbe-6 text-warning" />
        <Typography variant="h5">
          Are you sure you want to delete this role? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button variant="contained" onClick={handleDeletePermission}>
          Yes
        </Button>
        <Button
          variant="tonal"
          color="secondary"
          onClick={() => {
            setOpen(false)
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
