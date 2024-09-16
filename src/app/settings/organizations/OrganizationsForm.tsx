// components/OrganizationsForm.tsx

import React, { useEffect, useState } from "react"
import {
  Box,
  Typography,
  Grid,
  Switch,
  Button,
  Card
} from "@mui/material"
import { OrganizationsType } from "@/types/apps/organizationsType"
import { toast } from "react-toastify"
import { post } from "@/services/apiService"
import { organization } from "@/services/endpoint/organization"
import CustomTextField from "@/@core/components/mui/TextField"
import BreadCrumbList from "@/components/BreadCrumbList"
import LoadingBackdrop from "@/components/LoadingBackdrop"

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: OrganizationsType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<OrganizationsType | null>>;
};

const initialData = {
  id: 0,
  name: "",
  prefix: "",
  organizationURL: "",
  active: false
}

const OrganizationsForm = ({
  open,
  handleClose,
  editingRow,
  setEditingRow
}: Props) => {
  const [loading, setLoading] = useState<boolean>(true)

  const [formData, setFormData] = useState<OrganizationsType>(initialData)
  const [formErrors, setFormErrors] = useState({
    name: "",
    prefix: "",
    active: "",
    organizationURL: ""
  })

  useEffect(() => {
    setLoading(true)
    if (editingRow) {
      setFormData(editingRow)
      setLoading(false)
    } else {
      setFormData(initialData)
      setLoading(false)
    }
  }, [editingRow])

  const validateFormData = (data: OrganizationsType) => {
    let isValid = true
    const errors = { name: "", prefix: "", active: "", organizationURL: "" }

    if (data.name.trim().length < 5) {
      errors.name = "Organization Name must be at least 5 characters long"
      isValid = false
    }
    if (data.prefix.trim().length === 0) {
      errors.prefix = "This field is required"
      isValid = false
    }
    if (data.organizationURL.trim().length < 7) {
      errors.organizationURL = "Organization URL must be valid & required"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateFormData(formData)) {
      try {
        setLoading(true)
        const endpoint = editingRow ? organization.update : organization.create

        const payload = {
          id: editingRow ? formData.id : undefined,
          name: formData.name,
          prefix: formData.prefix,
          organizationURL: formData.organizationURL,
          active: formData.active
        }

        const response = await post(endpoint, payload)

        toast.success(response.message)
        handleClose()
        setFormData(response)
        setLoading(false)
      } catch (error: any) {
        console.error("Error fetching data:", error.message)
        setLoading(false)
      }
    }
  }

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
                    error={!!formErrors.name}
                    label="Organization Name *"
                    value={formData.name}
                    fullWidth
                    helperText={formErrors.name}
                    id="validation-error-helper-text"
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        name: ""
                      }))
                      setFormData((prevData) => ({
                        ...prevData,
                        name: e.target.value
                      }))
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.prefix}
                    helperText={formErrors.prefix}
                    value={formData.prefix}
                    fullWidth
                    label="Prefix *"
                    id="validation-error-helper-text"
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        prefix: ""
                      }))
                      setFormData((prevData) => ({
                        ...prevData,
                        prefix: e.target.value
                      }))
                    }}
                  />
                </Grid>

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
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.organizationURL}
                    helperText={formErrors.organizationURL}
                    value={formData.organizationURL}
                    fullWidth
                    label="Organization URL *"
                    id="validation-error-helper-text"
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        organizationURL: ""
                      }))
                      setFormData((prevData) => ({
                        ...prevData,
                        organizationURL: e.target.value
                      }))
                    }}
                  />
                </Grid>
                {/* <Grid item xs={12}>
                  <Box display="flex" justifyContent="end" gap={2}>
                    <Button variant="outlined" color="error" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit"  onSubmit={handleSubmit} >
                      {open === -1 ? 'Add' : 'Edit'} Organization
                    </Button>
                  </Box>
                </Grid> */}
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
                <Button
                  variant="contained"
                  type="submit"
                  onSubmit={handleSubmit}
                >
                  {open === -1 ? "Add" : "Edit"} Organization
                </Button>
              </Box>
            </Grid>
          </div>
        </form>
      </Card>
    </>
  )
}

export default OrganizationsForm
