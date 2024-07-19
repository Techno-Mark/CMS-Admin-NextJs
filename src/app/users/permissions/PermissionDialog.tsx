// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";

// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import DialogCloseButton from "../../../components/Dialogs/DialogCloseButton";
import { useEffect, useState } from "react";
import { get, post } from "@/services/apiService";
import {
  createPermission,
  getPermissionById,
  updatePermission,
} from "@/services/endpoint/users/permissions";
import { toast } from "react-toastify";
import { Switch } from "@mui/material";

//types
type PermissionDataType = {
  permissionId: number | string;
  permissionName: string;
  status: boolean;
};

type ContentProps = {
  handleClose: () => void;
  handleSubmit: () => void;
  permissionData: PermissionDataType;
  permissionDataErr: { name: string };
  setPermissionData: React.Dispatch<React.SetStateAction<PermissionDataType>>;
  setPermissionDataErr: React.Dispatch<React.SetStateAction<{ name: string }>>;
};

type PermissionDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editId: number | string;
};

type EditProps = {
  handleClose: () => void;
  permissionData: any;
};

const AddContent = ({
  handleClose,
  handleSubmit,
  permissionData,
  permissionDataErr,
  setPermissionData,
  setPermissionDataErr,
}: ContentProps) => {
  console.log(permissionData);

  return (
    <>
      <DialogContent className="overflow-visible pbs-0 sm:pli-16">
        <CustomTextField
          fullWidth
          label="Permission Name"
          variant="outlined"
          placeholder="Enter Permission Name"
          className="mbe-2"
          value={permissionData.permissionName}
          helperText={permissionDataErr.name}
          error={!!permissionDataErr.name}
          onChange={(e) =>
            setPermissionData({
              ...permissionData,
              permissionName: e.target.value,
            })
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={permissionData.status}
              onChange={(e) =>
                setPermissionData({
                  ...permissionData,
                  status: e.target.checked,
                })
              }
            />
          }
          label="Status"
        />
      </DialogContent>
      <DialogActions className="flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button type="submit" variant="contained" onClick={handleSubmit}>
          Add Permission
        </Button>
        <Button
          onClick={handleClose}
          variant="tonal"
          color="secondary"
          className="max-sm:mis-0"
        >
          Discard
        </Button>
      </DialogActions>
    </>
  );
};

const EditContent = ({
  handleClose,
  handleSubmit,
  permissionData,
  permissionDataErr,
  setPermissionData,
  setPermissionDataErr,
}: ContentProps) => {
  return (
    <>
      <DialogContent className="overflow-visible pbs-0 sm:pli-16">
        <CustomTextField
          fullWidth
          label="Permission Name"
          variant="outlined"
          placeholder="Enter Permission Name"
          className="mbe-2"
          helperText={permissionDataErr.name}
          error={!!permissionDataErr.name}
          value={permissionData.permissionName}
          onChange={(e) => {
            setPermissionDataErr({ name: "" });
            setPermissionData({
              ...permissionData,
              permissionName: e.target.value,
            });
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={permissionData.status}
              onChange={(e) =>
                setPermissionData({
                  ...permissionData,
                  status: e.target.checked,
                })
              }
            />
          }
          label="Status"
        />
      </DialogContent>
      <DialogActions className="flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16">
        <Button type="submit" variant="contained" onClick={handleSubmit}>
          Update Permission
        </Button>
        <Button
          onClick={handleClose}
          variant="tonal"
          color="secondary"
          className="max-sm:mis-0"
        >
          Discard
        </Button>
      </DialogActions>
    </>
  );
};

const PermissionDialog = ({ open, setOpen, editId }: PermissionDialogProps) => {
  //vars
  const initialPermissionData: PermissionDataType = {
    permissionId: 0,
    permissionName: "",
    status: false,
  };

  const [permissionData, setPermissionData] = useState<PermissionDataType>(
    initialPermissionData
  );
  const [permissionDataErr, setPermissionDataErr] = useState<{ name: string }>({
    name: "",
  });

  const validateIfHasErr = (data: PermissionDataType): boolean => {
    if (data.permissionName.trim().length === 0) {
      setPermissionDataErr({ name: "This is a required field" });
      return true;
    }
    setPermissionDataErr({ name: "" });
    return false;
  };

  const handleSubmit = async () => {
    if (validateIfHasErr(permissionData)) return;

    try {
      const result = await post(
        editId ? updatePermission : createPermission,
        editId
          ? {
              permissionId: permissionData.permissionId,
              permissionName: permissionData.permissionName,
              permissionDescription: "",
              active: permissionData.status,
            }
          : {
              permissionName: permissionData.permissionName,
              permissionDescription: "",
              active: permissionData.status,
            }
      );
      toast.success(result.message);
      setOpen(false);
    } catch (error) {
      console.error(error);
      setOpen(false);
    }
  };

  const getPermissionDataById = async () => {
    try {
      const result = await get(getPermissionById(editId));

      if (result.status == "success") {
        setPermissionData({ ...result.data, status: result.data.active });
        console.log({ ...result.data, status: result.data.active });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPermissionData(initialPermissionData);
    setPermissionDataErr({ name: "" });
  };

  useEffect(() => {
    if (!!editId) {
      getPermissionDataById();
    }
  }, [editId]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className="tabler-x" />
      </DialogCloseButton>
      <DialogTitle
        variant="h4"
        className="flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16"
      >
        {editId ? "Edit Permission" : "Add New Permission"}
        <Typography component="span" className="flex flex-col text-center">
          {editId
            ? "Edit permission as per your requirements."
            : "Permissions you may use and assign to your users."}
        </Typography>
      </DialogTitle>
      {editId ? (
        <EditContent
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          permissionData={permissionData}
          setPermissionData={setPermissionData}
          permissionDataErr={permissionDataErr}
          setPermissionDataErr={setPermissionDataErr}
        />
      ) : (
        <AddContent
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          permissionData={permissionData}
          setPermissionData={setPermissionData}
          permissionDataErr={permissionDataErr}
          setPermissionDataErr={setPermissionDataErr}
        />
      )}
    </Dialog>
  );
};

export default PermissionDialog;
