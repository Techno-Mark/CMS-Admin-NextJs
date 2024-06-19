// components/OrganizationsForm.tsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, TextField, Switch, Button, Divider } from '@mui/material';
import { OrganizationsType } from '@/types/apps/organizationsType';
import { toast } from 'react-toastify';
import { post } from '@/services/apiService';
import { organization } from '@/services/endpoint/organization';
import CustomTextField from '@/@core/components/mui/TextField';
import { TemplateType } from '@/types/apps/templateType';
import { template } from '@/services/endpoint/template';

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: OrganizationsType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<OrganizationsType | null>>;
};

const initialData = {
  templateId: 0,
  templateName: '',
  templateDescription: '',
  active: false,
};

const TemplateForm = ({ open, handleClose, editingRow, setEditingRow }: Props) => {
  const [formData, setFormData] = useState<TemplateType>(initialData);
  const [formErrors, setFormErrors] = useState({
    templateName: '',
    templateDescription: '',
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
    let errors = { templateName: '', templateDescription: '', active: '' };

    if (data.templateName.trim().length < 5) {
      errors.templateName = 'Template Name must be at least 5 characters long';
      isValid = false;
    }
    if (data.templateDescription.trim().length === 0) {
      errors.templateDescription = 'This field is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFormData(formData)) {
      try {
        const endpoint = editingRow ? template.update : template.create;

        const payload = {
          id: editingRow ? formData.id : undefined,
          templateName: formData.templateName,
          templateDescription: formData.templateDescription,
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
              errorData.data.forEach((errObj: { [s: string]: unknown; } | ArrayLike<unknown>) => {
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
        <Typography variant="h5">{open === -1 ? 'Add' : 'Edit'} Template</Typography>
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
                error={!!formErrors.templateName}
                label='Template Name *'
                value={formData.templateName}
                fullWidth
                helperText={formErrors.templateName}
                id='validation-error-helper-text'
                onChange={(e) => {
                  setFormErrors((prevErrors) => ({ ...prevErrors, templateName: '' }));
                  setFormData((prevData) => ({ ...prevData, templateName: e.target.value }));
                }}
              />

            </Grid>
            <Grid item xs={12} sm={4}>

              <CustomTextField
                error={!!formErrors.templateDescription}
                helperText={formErrors.templateDescription}
                value={formData.templateDescription}
                fullWidth
                label="Template Description *"
                id='validation-error-helper-text'
                onChange={(e) => {
                  setFormErrors((prevErrors) => ({ ...prevErrors, templateDescription: '' }));
                  setFormData((prevData) => ({ ...prevData, templateDescription: e.target.value }));
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
                  {open === -1 ? 'Add' : 'Edit'} Template
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Box>
  );
};

export default TemplateForm;
