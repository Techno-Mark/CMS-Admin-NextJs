// components/OrganizationsForm.tsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField, Switch, Button, Divider } from '@mui/material';
import { OrganizationsType } from '@/types/apps/organizationsType';
import { toast } from 'react-toastify';
import { post } from '@/services/apiService';
import { organization } from '@/services/endpoint/organization';
import CustomTextField from '@/@core/components/mui/TextField';

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: OrganizationsType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<OrganizationsType | null>>;
};

const initialData = {
  id: 0,
  name: '',
  prefix: '',
  active: false,
};

const OrganizationsForm = ({ open, handleClose, editingRow, setEditingRow }: Props) => {
  const [formData, setFormData] = useState<OrganizationsType>(initialData);
  const [formErrors, setFormErrors] = useState({
    name: '',
    prefix: '',
    active: '',
  });

  useEffect(() => {
    if (editingRow) {
      console.log(editingRow);

      setFormData(editingRow);
    } else {
      setFormData(initialData);
    }
  }, [editingRow]);

  const validateFormData = (data: OrganizationsType) => {
    let isValid = true;
    let errors = { name: '', prefix: '', active: '' };

    if (data.name.trim().length < 5) {
      errors.name = 'Organization Name must be at least 5 characters long';
      isValid = false;
    }
    if (data.prefix.trim().length === 0) {
      errors.prefix = 'This field is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFormData(formData)) {
      try {
        const endpoint = editingRow ? organization.update : organization.create;

        const payload = {
          id: editingRow ? formData.id : undefined,
          name: formData.name,
          prefix: formData.prefix,
          active: formData.active,
        };

        // Call API service to submit form data
        const response = await post(endpoint, payload);
        console.log(response);

        toast.success(response.message);
        handleClose();
        setFormData(response);
      } catch (error: any) {
        console.error('Error saving organization:', error);
        try {
          const errorData = JSON.parse(error.message);
          if ((errorData.status === 'error' || errorData.status === 'failure') &&
            (errorData.message === 'validation' || errorData.message === 'validation error')) {

            // Handle first type of response
            if (errorData.data && typeof errorData.data === 'object' && !Array.isArray(errorData.data)) {
              for (const [key, value] of Object.entries(errorData.data)) {
                if (Array.isArray(value)) {
                  value.forEach((err) => {
                    toast.error(err);
                  });
                }
              }
            }

            // Handle second type of response
            if (Array.isArray(errorData.data)) {
              errorData.data.forEach((errObj: { [s: string]: any; } | ArrayLike<unknown>) => {
                for (const [key, value] of Object.entries(errObj)) {
                  toast.error(value);
                }
              });
            }
          } else {
            toast.error('An error occurred while saving the data.');
          }
        } catch (parseError: any) {
          console.error('Error parsing error response:', parseError);
          toast.error('An error occurred while saving the data.');
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{open === -1 ? 'Add' : 'Edit'} Organization</Typography>
        <Button onClick={handleClose} color="error">
          Cancel
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
        <Box display="flex" alignItems="center">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>

              <CustomTextField
                error={!!formErrors.name}
                label='Organization Name *'
                value={formData.name}
                fullWidth
                helperText={formErrors.name}
                id='validation-error-helper-text'
                onChange={(e) => {
                  setFormErrors((prevErrors) => ({ ...prevErrors, name: '' }));
                  setFormData((prevData) => ({ ...prevData, name: e.target.value }));
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
                id='validation-error-helper-text'
                onChange={(e) => {
                  setFormErrors((prevErrors) => ({ ...prevErrors, prefix: '' }));
                  setFormData((prevData) => ({ ...prevData, prefix: e.target.value }));
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mr: 0 }}>
                Status
              </Typography>
              <Switch
                size='medium'
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="end" gap={2}>
                <Button variant="outlined" color="error" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  {open === -1 ? 'Add' : 'Edit'} Organization
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Box>
  );
};

export default OrganizationsForm;
