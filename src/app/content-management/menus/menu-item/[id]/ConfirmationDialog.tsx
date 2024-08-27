// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

type ConfirmationDialogProps = {
  deleteData: any;
  menuItems: any;
  setMenuItems: React.Dispatch<React.SetStateAction<any>>;
  setOpen: (open: boolean) => void;
};

const ConfirmationDialog = ({
  deleteData,
  menuItems,
  setMenuItems,
  setOpen,
}: ConfirmationDialogProps) => {
  const deleteTemplate = async () => {
    try {
      if (!menuItems) return;

      if (deleteData.parentId == -1) {
        menuItems.splice(deleteData.index, 1);
      } else {
        menuItems[deleteData.parentId].children.splice(deleteData.index, 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={true} onClose={() => setOpen(false)}>
      <DialogContent className="flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
        <i className="tabler-alert-circle text-[88px] mbe-6 text-warning" />
        <Typography variant="h5">
          Are you sure you want to delete Menu Item?
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
            setOpen(false);
          }}
        >
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
