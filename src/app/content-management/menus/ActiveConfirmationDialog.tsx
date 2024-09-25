// MUI Imports
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"

type ActiveConfirmationDialogProps = {
  setOpen: (open: boolean) => void;
  menuLocation: string;
  handleSubmit: any;
};

const ActiveConfirmationDialog = ({
  setOpen,
  menuLocation,
  handleSubmit
}: ActiveConfirmationDialogProps) => {

  return (
    <Dialog fullWidth maxWidth="xs" open={true} onClose={() => setOpen(false)}>
      <DialogContent className="flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
        <i className="tabler-alert-circle text-[88px] mbe-6 text-warning" />
        <Typography variant="h5">
          <p className="text-warning">Activating this menu will deactivate another currently active {menuLocation} menu. </p>
          <hr/>
          Are you sure you want to Active the Menu?
        </Typography>
      </DialogContent>
      <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button variant="contained" onClick={handleSubmit}>
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

export default ActiveConfirmationDialog
