// MUI Imports
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import { toast } from "react-toastify"
import { postDataToOrganizationAPIs } from "@/services/apiService"
import { blogPost } from "@/services/endpoint/blogpost"
import { media } from "@/services/endpoint/media"

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
  setDeletingId
}: ConfirmationDialogProps) => {
  const deleteTemplate = async () => {
    try {
      const result = await postDataToOrganizationAPIs(media.deleteMediaResource, {
        mediaId: deletingId
      })

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
          Are you sure you want to delete the Media?
        </Typography>
      </DialogContent>
      <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button variant="contained" onClick={deleteTemplate}>
          Yes
        </Button>
        <Button
          variant="tonal"
          color="secondary"
          onClick={() => {
            setOpen(false)
          }}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
