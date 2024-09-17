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
  getPermissionById
} from "@/services/endpoint/users/permissions"
import { toast } from "react-toastify"
import { modules } from "@/services/endpoint/modules"

// Types
type ModuleDataType = {
  moduleId: number | string;
  moduleName: string;
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
  permissionData: ModuleDataType;
  permissionDataErr: { name: string };
  setPermissionData: React.Dispatch<React.SetStateAction<ModuleDataType>>;
  setPermissionDataErr: React.Dispatch<React.SetStateAction<{ name: string }>>;
  isEditMode: boolean;
}) => (
  <>
    <DialogContent className="overflow-visible pbs-0 sm:pli-16">
      <CustomTextField
        fullWidth
        label="Module Name"
        variant="outlined"
        // placeholder="Enter Module Name"
        className="mbe-2"
        value={permissionData.moduleName}
        helperText={permissionDataErr.name}
        error={!!permissionDataErr.name}
        onChange={(e) => {
          setPermissionDataErr({ name: "" })
          setPermissionData({
            ...permissionData,
            moduleName: e.target.value
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
        {isEditMode ? "Update Module" : "Add Module"}
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
  const initialPermissionData: ModuleDataType = {
    moduleId: 0,
    moduleName: "",
    status: true
  }

  const [permissionData, setPermissionData] = useState<ModuleDataType>(
    initialPermissionData
  )
  const [permissionDataErr, setPermissionDataErr] = useState<{ name: string }>({
    name: ""
  })

  const validateIfHasErr = (data: ModuleDataType): boolean => {
    if (data.moduleName.trim().length === 0) {
      setPermissionDataErr({ name: "This is a required field" })
      return true
    }
    setPermissionDataErr({ name: "" })
    return false
  }

  const handleSubmit = async () => {
    if (validateIfHasErr(permissionData)) return

    try {
      const endpoint = modules.create
      const payload = {
        moduleId: editId > 0 ? permissionData.moduleId : undefined,
        moduleName: permissionData.moduleName,
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
          {editId ? "Edit module as per your requirements." : "Module you may use and assign to your users."}
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
