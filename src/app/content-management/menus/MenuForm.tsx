// components/OrganizationsForm.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Switch,
  Button,
  Card,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { post } from "@/services/apiService";
import CustomTextField from "@/@core/components/mui/TextField";
import BreadCrumbList from "@/components/BreadCrumbList";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { menuDetailType } from "@/types/apps/menusType";
import { menu } from "@/services/endpoint/menu";
import ActiveConfirmationDialog from "./ActiveConfirmationDialog";

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: menuDetailType | null;
  permissionUser: Boolean;
};

const initialData = {
  menuId: -1,
  menuName: "",
  menuLocation: "",
  active: false,
};

const MenuForm = ({ open, handleClose, editingRow, permissionUser }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isActiveConfirm, setIsActiveConfirm] = useState(false);

  const [formData, setFormData] = useState<typeof initialData>(initialData);
  const [formErrors, setFormErrors] = useState({
    menuName: "",
    menuLocation: "",
    active: "",
  });

  useEffect(() => {
    setLoading(true);
    if (editingRow) {
      setFormData(editingRow);
      setLoading(false);
    } else {
      setFormData(initialData);
      setLoading(false);
    }
  }, [editingRow]);

  const validateFormData = (data: menuDetailType) => {
    let isValid = true;
    const errors = { ...formErrors };

    if (data.menuName.trim().length < 5) {
      errors.menuName = "Menu Name must be at least 5 characters long";
      isValid = false;
    }
    if (!data.menuLocation) {
      errors.menuLocation = "Menu Location is required";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };


  const handleSubmitAPICall = async () => {
    try {
      setLoading(true);
      const endpoint = menu.createAndUpdate;

      const payload = {
        menuId: editingRow ? formData.menuId : undefined,
        menuName: formData.menuName,
        menuLocation: formData.menuLocation,
        active: formData.active,
      };

      const response = await post(endpoint, payload);

      toast.success(response.message);
      handleClose();
      setFormData(response);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFormData(formData)) {
      try {

        if(editingRow && formData.active === true){
          setIsActiveConfirm(true);
        }else{
          handleSubmitAPICall();
        }

      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <div>
            <Box display="flex" alignItems="center">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.menuName}
                    label="Menu Name *"
                    value={formData.menuName}
                    fullWidth
                    helperText={formErrors.menuName}
                    id="validation-error-helper-text"
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        menuName: "",
                      }));
                      setFormData((prevData) => ({
                        ...prevData,
                        menuName: e.target.value,
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    select
                    fullWidth
                    defaultValue=""
                    label="Menu Location *"
                    id="custom-select"
                    error={!!formErrors.menuLocation}
                    value={formData.menuLocation}
                    helperText={formErrors.menuLocation}
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        menuLocation: "",
                      }));
                      setFormData((prevData) => ({
                        ...prevData,
                        menuLocation: e.target.value,
                      }));
                    }}
                  >
                    <MenuItem value={"header"}>header</MenuItem>
                    <MenuItem value={"footer"}>footer</MenuItem>
                  </CustomTextField>
                </Grid>

                {editingRow && (
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body2" sx={{ mr: 0 }}>
                      Status
                    </Typography>
                    <Switch
                      size="medium"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Grid
              item
              xs={12}
              style={{ position: "sticky", bottom: 0, zIndex: 10 }}
            >
              <Box
                p={7}
                display="flex"
                gap={2}
                justifyContent="end"
                bgcolor="background.paper"
              >
                <Button variant="outlined" color="error" onClick={handleClose}>
                  Cancel
                </Button>
                {permissionUser && (
                  <Button
                    variant="contained"
                    type="submit"
                    onSubmit={handleSubmit}
                  >
                    {open === -1 ? "Add" : "Edit"} Menu
                  </Button>
                )}
              </Box>
            </Grid>
          </div>
        </form>
      </Card>
      {
        isActiveConfirm &&
        <ActiveConfirmationDialog setOpen={setIsActiveConfirm}
        menuLocation={formData.menuLocation}
        handleSubmit={handleSubmitAPICall} />
      }
    </>
  );
};

export default MenuForm;
