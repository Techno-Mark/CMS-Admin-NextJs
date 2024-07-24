// MUI Imports
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";

import CustomTextField from "@/@core/components/mui/TextField";
import { ChangeEvent, Children, useEffect, useState } from "react";
import { Button } from "@mui/material";

type KanbanDrawerProps = {
  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  dataRequired: any;
  menuItems: any;
  setMenuItems: Function;
  open: number;
};

const initialFormData = {
  name: "",
  link: "",
};

const initialErrorData = {
  name: "",
  link: "",
};

const KanbanDrawer = (props: KanbanDrawerProps) => {
  // Props
  const {
    drawerOpen,
    setDrawerOpen,
    menuItems,
    setMenuItems,
    dataRequired,
    open,
  } = props;
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);
  const [formData, setFormData] =
    useState<typeof initialErrorData>(initialFormData);

  // Close Drawer
  const handleClose = () => {
    setFormData(initialFormData);
    setFormErrors(initialErrorData);
    setDrawerOpen(false);
  };

  // Update Task
  const updateTask = (data: FormData) => {
    handleClose();
  };

  //validation before submit
  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };

    if (!formData.name) {
      errors.name = "Please enter a menu name";
      valid = false;
    } else if (formData.name.length < 3) {
      errors.name = "name must be at least 3 characters long";
      valid = false;
    } else if (formData.name.length > 255) {
      errors.name = "name must be at most 255 characters long";
      valid = false;
    }
    if (!formData.link) {
      errors.link = "Please add a link";
      valid = false;
    } else if (formData.link.length < 7) {
      errors.link = "link must be at least 7 characters long";
      valid = false;
    } else if (formData.link.length > 1000) {
      errors.link = "link must be at most 1000 characters long";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // Handle Sunmit
  const handleSubmit = (d: any) => {
    if (validateForm()) {
      if (open == -1) {
        const newMenus = [
          ...menuItems,
          { name: formData.name, link: formData.link, children: [], logo: "" },
        ];
        console.log(newMenus);
        setMenuItems(newMenus);
      } else if (open == 1) {
        const { index, parentId } = dataRequired;
        if (parentId == -1) {
          menuItems[index].name = formData.name;
          menuItems[index].link = formData.link;
        } else {
          menuItems[parentId].children[index].name = formData.name;
          menuItems[parentId].children[index].link = formData.link;
        }
      }
      handleClose();
    }
  };

  useEffect(() => {
    if (open == 1) {
      const { index, parentId } = dataRequired;
      let name = "",
        link = "";
      if (parentId == -1) {
        name = menuItems[index].name;
        link = menuItems[index].link;
      } else {
        name = menuItems[parentId].children[index].name;
        link = menuItems[parentId].children[index].link;
      }
      setFormData({
        name: name,
        link: link,
      });
    }
    setLoading(false);
  }, []);

  return (
    <div>
      <Drawer
        open={drawerOpen}
        anchor="right"
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": { width: { xs: 300, sm: 400 } } }}
        onClose={handleClose}
      >
        <div className="flex justify-between items-center pli-6 plb-5 border-be">
          <Typography variant="h5">Add Menu</Typography>
          <IconButton size="small" onClick={handleClose}>
            <i className="tabler-x text-2xl text-textPrimary" />
          </IconButton>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-y-5">
            <CustomTextField
              error={!!formErrors.name}
              helperText={formErrors.name}
              label="Name *"
              fullWidth
              placeholder=""
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, name: e.target.value });
                if (e.target?.value?.length) {
                  setFormErrors({ ...formErrors, name: "" });
                }
              }}
            />
            <CustomTextField
              error={!!formErrors.link}
              helperText={formErrors.link}
              label="Link *"
              fullWidth
              placeholder=""
              value={formData.link}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, link: e.target.value });
                if (e.target?.value?.length) {
                  setFormErrors({ ...formErrors, link: "" });
                }
              }}
            />
            <Button
              variant="contained"
              type="submit"
              onClick={() => handleSubmit(true)}
            >
              {open == -1 ? "Add " : "Edit"} Menu
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default KanbanDrawer;