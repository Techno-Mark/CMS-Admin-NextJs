// MUI Imports
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"

// Component Imports
import CustomTextField from "@core/components/mui/TextField"
import DialogCloseButton from "../../../components/Dialogs/DialogCloseButton"
import { useEffect, useState } from "react"
import { get, post } from "@/services/apiService"
import {
  createPermission,
  getPermissionById,
  updatePermission
} from "@/services/endpoint/users/permissions"
import { toast } from "react-toastify"

// Types
type PermissionDataType = {
  permissionId: number | string;
  permissionName: string;
  status: boolean;
};

type PermissionDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editId: number;
  addOpen: boolean;
};

const PermissionForm = ({
  handleClose,
  handleSubmit,
  permissionData,
  permissionDataErr,
  setPermissionData,
  setPermissionDataErr,

  isEditMode
}: {
  handleClose: () => void;
  handleSubmit: () => void;
  permissionData: PermissionDataType;
  permissionDataErr: { name: string };
  setPermissionData: React.Dispatch<React.SetStateAction<PermissionDataType>>;
  setPermissionDataErr: React.Dispatch<React.SetStateAction<{ name: string }>>;
  isEditMode: boolean;
}) => (
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
        onChange={(e) => {
          setPermissionDataErr({ name: "" })
          setPermissionData({
            ...permissionData,
            permissionName: e.target.value
          })
        }}
      />
      {/* <FormControlLabel
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
      /> */}
    </DialogContent>
    <DialogActions className="flex max-sm:flex-col max-sm:items-center max-sm:gap-2 justify-center pbs-0 sm:pbe-16 sm:pli-16">
      <Button type="submit" variant="contained" onClick={handleSubmit}>
        {isEditMode ? "Update Permission" : "Add Permission"}
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
)

const PermissionDialog = ({
  open,
  setOpen,
  editId,
  addOpen
}: PermissionDialogProps) => {
  const initialPermissionData: PermissionDataType = {
    permissionId: 0,
    permissionName: "",
    status: true
  }

  const [permissionData, setPermissionData] = useState<PermissionDataType>(
    initialPermissionData
  )
  const [permissionDataErr, setPermissionDataErr] = useState<{ name: string }>({
    name: ""
  })

  const validateIfHasErr = (data: PermissionDataType): boolean => {
    if (data.permissionName.trim().length === 0) {
      setPermissionDataErr({ name: "This is a required field" })
      return true
    }
    setPermissionDataErr({ name: "" })
    return false
  }

  const handleSubmit = async () => {
    if (validateIfHasErr(permissionData)) return

    try {
      const endpoint = editId > 0 ? updatePermission : createPermission
      const payload = {
        permissionId: editId > 0 ? permissionData.permissionId : undefined,
        permissionName: permissionData.permissionName,
        permissionDescription: "",
        active: permissionData.status
      }
      const result = await post(endpoint, payload)
      toast.success(result.message)
      handleClose()
    } catch (error) {
      console.error(error)
    } finally {
      resetForm()
    }
  }

  const getPermissionDataById = async () => {
    try {
      const result = await get(getPermissionById(editId))
      if (result.status === "success") {
        setPermissionData({ ...result.data, status: result.data.active })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const resetForm = () => {
    setPermissionData(initialPermissionData)
    setPermissionDataErr({ name: "" })
    setOpen(false)
  }

  useEffect(() => {
    if (editId > 0 && open) {
      getPermissionDataById()
    } else {
      setPermissionData(initialPermissionData)
      setPermissionDataErr({ name: "" })
    }
  }, [editId])

  const handleClose = () => {
    resetForm()
  }

  return (
    <Dialog
      open={open && addOpen}
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
          {editId ? "Edit permission as per your requirements." : "Permissions you may use and assign to your users."}
        </Typography>
      </DialogTitle>
      <PermissionForm
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        permissionData={permissionData}
        setPermissionData={setPermissionData}
        permissionDataErr={permissionDataErr}
        setPermissionDataErr={setPermissionDataErr}
        isEditMode={!!editId}
      />
    </Dialog>
  )
}

export default PermissionDialog
