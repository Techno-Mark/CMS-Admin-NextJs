import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogCloseButton from "@components/Dialogs/DialogCloseButton";
import CustomTextField from "@core/components/mui/TextField";
import tableStyles from "@core/styles/table.module.css";
import axios from "axios";
import React from "react";
import {
  createRole,
  getRoleById,
  updateRole,
} from "@/services/endpoint/users/roles";
import { post } from "@/services/apiService";
import { toast } from "react-toastify";
import { Switch } from "@mui/material";

type RoleDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  editId?: number;
};

const RoleDialog = ({ open, setOpen, title, editId = 0 }: RoleDialogProps) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState<number[]>([]);
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] =
    useState<boolean>(false);
  const [defaultData, setDefaultData] = useState<any>([]);
  const [roleName, setRoleName] = useState("");
  const [roleError, setRoleError] = useState(false);
  const [active, setActive] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setRoleName("");
    setRoleError(false);
    setActive(false);
    setDefaultData([]);
    setSelectedCheckbox([]);
    setIsIndeterminateCheckbox(false);
  };

  const togglePermission = (id: number) => {
    setSelectedCheckbox((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCheckbox = () => {
    if (isIndeterminateCheckbox) {
      setSelectedCheckbox([]);
    } else {
      const allCheckboxes = defaultData.flatMap((module: any) =>
        module.permissions.map((perm: any) => perm.id)
      );
      setSelectedCheckbox(allCheckboxes);
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const result = await post(getRoleById, { roleId });

      if (result.data.data) {
        const data = result.data.data;
        const permissions = data.permission;
        const selected = permissions.flatMap((perm: any) =>
          perm.permissions.filter((p: any) => p.checked).map((p: any) => p.id)
        );
        if (roleId > 0) {
          setDefaultData(permissions);
          setSelectedCheckbox(selected);
          setActive(data.active);
          setRoleName(data.roleName);
        } else {
          setDefaultData(permissions);
          setSelectedCheckbox(selected);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      if (editId !== 0) {
        fetchRolePermissions(1);
      } else {
        fetchRolePermissions(0);
      }
    }
  }, [open, editId]);

  useEffect(() => {
    const allPermissionsCount = defaultData.flatMap(
      (module: any) => module.permissions
    ).length;
    if (
      selectedCheckbox.length > 0 &&
      selectedCheckbox.length < allPermissionsCount
    ) {
      setIsIndeterminateCheckbox(true);
    } else {
      setIsIndeterminateCheckbox(false);
    }
  }, [selectedCheckbox, defaultData]);

  const validateForm = () => {
    let valid = true;

    if (roleName.trim().length <= 0) {
      setRoleError(true);
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const endpoint = editId > 0 ? updateRole : createRole;
        const payload = {
          organizationId: 1,
          roleName: roleName,
          roleId: editId,
          roleActionMapping: selectedCheckbox,
          active: active,
        };
        const result = await post(endpoint, payload);
        toast.success(result.message);
        handleClose();
      } catch (error) {
        console.error(error);
      } finally {
        handleClose();
      }
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      scroll="body"
      open={open}
      onClose={handleClose}
      sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}
      className="my-[-5px]"
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className="tabler-x" />
      </DialogCloseButton>
      <DialogTitle
        variant="h4"
        className="flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16 mt-[-2rem]"
      >
        {title ? "Edit Role" : "Add Role"}
        <Typography component="span" className="flex flex-col text-center">
          Set Role Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="overflow-visible flex flex-col gap-6 pbs-0 sm:pli-16 mt-[-2rem] mb-[-10px]">
          <CustomTextField
            label="Role Name"
            variant="outlined"
            fullWidth
            placeholder="Enter Role Name"
            value={roleName}
            error={!!roleError}
            helperText={!!roleError && "Please enter role name"}
            onChange={(e) => {
              setRoleName(e.target.value);
              setRoleError(false);
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            }
            label="Status"
          />
          <Typography variant="h5" className="min-is-[225px]">
            Role Permissions
          </Typography>
          <div className="overflow-x-auto max-h-[15rem]">
            <table className={tableStyles.table}>
              <tbody>
                <tr className="border-bs-0">
                  <th className="pis-0">
                    <Typography
                      color="text.primary"
                      className="font-medium whitespace-nowrap flex-grow min-is-[225px]"
                    >
                      {/* Module Name */}
                    </Typography>
                  </th>
                  <th className="!text-end pie-0 !pr-4">
                    <FormControlLabel
                      className="mie-0 capitalize"
                      control={
                        <Checkbox
                          onChange={handleSelectAllCheckbox}
                          indeterminate={isIndeterminateCheckbox}
                          checked={
                            selectedCheckbox.length > 0 &&
                            defaultData.length > 0 &&
                            selectedCheckbox.length ===
                              defaultData.flatMap(
                                (module: any) => module.permissions
                              ).length
                          }
                        />
                      }
                      label="Select All"
                    />
                  </th>
                </tr>
                {defaultData.length > 0 &&
                  defaultData.map((module: any, index: number) => (
                    <React.Fragment key={index}>
                      <tr className="border-be">
                        <td className="pis-0">
                          <Typography
                            className="font-medium whitespace-nowrap flex-grow min-is-[225px]"
                            color="text.primary"
                          >
                            {module.moduleName}
                          </Typography>
                        </td>
                        <td className="!text-end pie-0 !pr-4">
                          <FormGroup className="flex-row justify-end flex-nowrap gap-6">
                            {module.permissions.map((perm: any) => (
                              <FormControlLabel
                                key={perm.id}
                                className="mie-0"
                                control={
                                  <Checkbox
                                    id={perm.id.toString()}
                                    onChange={() => togglePermission(perm.id)}
                                    checked={selectedCheckbox.includes(perm.id)}
                                  />
                                }
                                label={perm.permissionName}
                              />
                            ))}
                          </FormGroup>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16 mb-[-3rem]">
          <Button variant="contained" type="submit">
            Submit
          </Button>
          <Button
            variant="tonal"
            type="reset"
            color="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RoleDialog;
