// MUI Imports
import Drawer from "@mui/material/Drawer"
import Typography from "@mui/material/Typography"

import IconButton from "@mui/material/IconButton"

import CustomTextField from "@/@core/components/mui/TextField"
import { ChangeEvent, useEffect, useState } from "react"
import { Button, Tooltip } from "@mui/material"
import { InfoIcon } from "lucide-react"

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
  logo: ""
}

const initialErrorData = {
  name: "",
  link: "",
  logo: ""
}

const KanbanDrawer = (props: KanbanDrawerProps) => {
  // Props
  const {
    drawerOpen,
    setDrawerOpen,
    menuItems,
    setMenuItems,
    dataRequired,
    open
  } = props
  const [, setLoading] = useState(true)
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData)
  const [formData, setFormData] =
    useState<typeof initialErrorData>(initialFormData)

  // Close Drawer
  const handleClose = () => {
    setFormData(initialFormData)
    setFormErrors(initialErrorData)
    setDrawerOpen(false)
  }

  // validation before submit
  const validateForm = () => {
    let valid = true
    const errors = { ...initialErrorData }

    if (!formData.name) {
      errors.name = "Name is required"
      valid = false
    } else if (formData.name.length < 3) {
      errors.name = "Name must be at least 3 characters long"
      valid = false
    } else if (formData.name.length > 255) {
      errors.name = "Name must be at most 255 characters long"
      valid = false
    }
    if (!formData.link) {
      errors.link = "Link is required"
      valid = false
    } else if (formData.link.length > 1000) {
      errors.link = "Link must be at most 1000 characters long"
      valid = false
    }
    if (!formData.logo) {
      errors.logo = "Logo link  is required"
      valid = false
    } else if (formData.logo.length > 1000) {
      errors.logo = "Logo link must be at most 1000 characters long"
      valid = false
    }

    setFormErrors(errors)
    return valid
  }

  // Handle Sunmit
  const handleSubmit = (d: any) => {
    if (validateForm()) {
      const newItem = {
        name: formData.name,
        link: formData.link,
        children: [],
        logo: formData.logo
      }
      if (open == -1) {
        if (!menuItems) {
          setMenuItems([newItem])
        } else {
          const newMenus = [
            ...menuItems,
            newItem
          ]
          setMenuItems(newMenus)
        }
      } else if (open == 1) {
        const { index, parentId } = dataRequired
        if (parentId == -1) {
          menuItems[index].name = formData.name
          menuItems[index].link = formData.link
          menuItems[index].logo = formData.logo
        } else {
          menuItems[parentId].children[index].name = formData.name
          menuItems[parentId].children[index].link = formData.link
          menuItems[parentId].children[index].logo = formData.logo
        }
      }
      handleClose()
    }
  }

  useEffect(() => {
    if (open == 1) {
      const { index, parentId } = dataRequired
      let name
      let link
      let logo = ""

      if (parentId == -1) {
        name = menuItems[index].name
        link = menuItems[index].link
        logo = menuItems[index].logo
      } else {
        name = menuItems[parentId].children[index].name
        link = menuItems[parentId].children[index].link
        logo = menuItems[parentId].children[index].logo
      }
      setFormData({
        name,
        link,
        logo
      })
    }
    setLoading(false)
  }, [])

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
          <Typography variant="h5">
            {" "}
            {open == -1 ? "Add " : "Edit"} Menu
          </Typography>
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
                setFormData({ ...formData, name: e.target.value })
                if (e.target?.value?.length) {
                  setFormErrors({ ...formErrors, name: "" })
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
                setFormData({ ...formData, link: e.target.value })
                if (e.target?.value?.length) {
                  setFormErrors({ ...formErrors, link: "" })
                }
              }}
            />
            <CustomTextField
              error={!!formErrors.logo}
              helperText={formErrors.logo}
              label={
                <span>
      Logo Link *
      <Tooltip title={"If you do not want to add icon. Please add '#' sign"}>
               <IconButton size="small" aria-label="info">
          <InfoIcon style={{ fontSize: '5px', marginLeft: '5px', color: 'gray' }} />
        </IconButton>
      </Tooltip>
    </span>
              }
              fullWidth
              placeholder=""
              value={formData.logo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, logo: e.target.value })
                if (e.target?.value?.length) {
                  setFormErrors({ ...formErrors, logo: "" })
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
  )
}

export default KanbanDrawer
