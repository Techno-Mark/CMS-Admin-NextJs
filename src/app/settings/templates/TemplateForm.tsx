import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Switch,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  Card,
} from '@mui/material';
import { toast } from 'react-toastify';
import { post } from '@/services/apiService';
import CustomTextField from '@/@core/components/mui/TextField';
import { TemplateType } from '@/types/apps/templateType';
import { template } from '@/services/endpoint/template';
import CustomAutocomplete from '@core/components/mui/Autocomplete';
import { section } from '@/services/endpoint/section';

import type { SVGProps } from 'react';
import BreadCrumbList from '../content-blocks/BreadCrumbList';

export function TablerBaselineDensityMedium(props: SVGProps<SVGSVGElement>) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16M4 12h16M4 4h16"></path></svg>);
}

type SectionType = {
  sectionId: number;
  sectionName: string;
  isCommon?: boolean;
};

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: TemplateType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<TemplateType | null>>;
};

const initialData: TemplateType = {
  templateId: 0,
  templateName: '',
  templateDescription: '',
  active: false,
  templateSlug: '',
  sectionIds: []
};

const TemplateForm: React.FC<Props> = ({ open, handleClose, editingRow, setEditingRow }) => {
  const [formData, setFormData] = useState<TemplateType>(initialData);
  const [formErrors, setFormErrors] = useState({
    templateName: '',
    templateDescription: '',
    active: '',
    templateSlug: '',
  });
  const [activeData, setActiveData] = useState<SectionType[]>([]);
  const [selectedSections, setSelectedSections] = useState<SectionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getActiveSection = async () => {
      setLoading(true);
      try {
        const result = await post(section.active, {});
        setActiveData(result.data.sections);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getActiveSection();
  }, []);

  useEffect(() => {
    if (editingRow) {
      setFormData(editingRow);
    } else {
      setFormData(initialData);
    }
  }, [editingRow]);

  const validateFormData = (data: TemplateType) => {
    let isValid = true;
    let errors = { templateName: '', templateDescription: '', active: '', templateSlug: '' };

    if (data.templateName.trim().length < 5) {
      errors.templateName = 'Template Name must be at least 5 characters long';
      isValid = false;
    }
    if (data.templateSlug.trim().length === 0) {
      errors.templateSlug = 'This field is required';
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
          id: editingRow ? formData.templateId : undefined,
          templateName: formData.templateName,
          templateDescription: formData.templateDescription,
          active: formData.active,
          templateSlug: formData.templateSlug,
          sectionIds: selectedSections.map(section => ({
            sectionId: section.sectionId,
            isCommon: section.isCommon ? 'true' : undefined,
          })),
        };

        const response = await post(endpoint, payload);
        console.log(response);

        toast.success(response.message);
        handleClose();
        setFormData(response.data);
        setEditingRow(null);

      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      }
    }
  };

  const handleAddSection = (event: any, newValue: SectionType[]) => {
    setSelectedSections(newValue);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    const draggedIndex = Number(event.dataTransfer.getData('text/plain'));
    const updatedSections = [...selectedSections];
    const [draggedSection] = updatedSections.splice(draggedIndex, 1);
    updatedSections.splice(index, 0, draggedSection);
    setSelectedSections(updatedSections);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSectionIsCommonChange = (sectionId: number) => {
    setSelectedSections(prevSections =>
      prevSections.map(section =>
        section.sectionId === sectionId ? { ...section, isCommon: !section.isCommon } : section
      )
    );
  };

  return (
    <>
      <BreadCrumbList />
      <Card>


        <div>
         
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
            <Box display="flex" alignItems="center">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.templateName}
                    label="Template Name *"
                    value={formData.templateName}
                    fullWidth
                    helperText={formErrors.templateName}
                    id="validation-error-helper-text"
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({ ...prevErrors, templateName: '' }));
                      setFormData({
                        ...formData,
                        templateName: e.target.value,
                        templateSlug: e.target.value
                          .replace(/[^\w\s]|_/g, "")
                          .replace(/\s+/g, "-")
                          .toLowerCase(),
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    disabled={open === sectionActions.EDIT}
                    error={!!formErrors.templateSlug}
                    helperText={formErrors.templateSlug}
                    label="templateSlug *"
                    fullWidth
                    value={formData.templateSlug}
                    onChange={(e) => {
                      setFormErrors((prevErrors) => ({ ...prevErrors, templateSlug: '' }));
                      setFormData((prevData) => ({ ...prevData, templateSlug: e.target.value }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.templateDescription}
                    helperText={formErrors.templateDescription}
                    value={formData.templateDescription}
                    fullWidth
                    label="Template Description *"
                    id="validation-error-helper-text"
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
                    size="medium"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomAutocomplete
                    multiple
                    disableCloseOnSelect
                    fullWidth
                    options={activeData}
                    id="autocomplete-custom"
                    getOptionLabel={(option: SectionType) => option.sectionName || ''}
                    value={selectedSections}
                    onChange={handleAddSection}
                    renderInput={(params) => <CustomTextField placeholder="Select Sections" {...params} label="Sections" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Selected Sections</Typography>
                  <div>
                    {selectedSections.map((section, index) => (
                      <Box
                        key={section.sectionId}
                        draggable
                        onDragStart={(event) => handleDragStart(event, index)}
                        onDrop={(event) => handleDrop(event, index)}
                        onDragOver={handleDragOver}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          cursor: 'move',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography>
                          <TablerBaselineDensityMedium />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={section.isCommon || false}
                                onChange={() => handleSectionIsCommonChange(section.sectionId)}
                              />
                            }
                            label={<Typography>{section.sectionName}</Typography>}
                            sx={{ ml: 2 }}
                          />
                        </Typography>
                      </Box>
                    ))}
                  </div>
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
        </div>
      </Card>
    </>
  );
};

export default TemplateForm;
