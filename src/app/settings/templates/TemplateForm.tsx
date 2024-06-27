import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Switch,
  Button,
  Checkbox,
  FormControlLabel,
  Card,
  IconButton,
} from '@mui/material';
import { toast } from 'react-toastify';
import { post } from '@/services/apiService';
import CustomTextField from '@/@core/components/mui/TextField';
import { TemplateType } from '@/types/apps/templateType';
import { template } from '@/services/endpoint/template';
import CustomAutocomplete from '@core/components/mui/Autocomplete';
import { section } from '@/services/endpoint/section';
import BreadCrumbList from '../content-blocks/BreadCrumbList';
import LoadingBackdrop from '@/components/LoadingBackdrop';
// import DeleteIcon from '@mui/icons-material/Delete';

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
  sectionIds: [],
  templateSection: [],
  createdAt: ''
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
  const [isSectionsValid, setIsSectionsValid] = useState(true); // State for validation

  useEffect(() => {
    const getActiveSection = async () => {
      setLoading(true);
      try {
        const result = await post(section.active, {});
        setActiveData(result.data.sections);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };
    getActiveSection();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (editingRow) {
      setFormData(editingRow);
      const sections = editingRow.templateSection.map((section: any) => ({
        sectionId: section.sectionId,
        sectionName: section.sectionName,
        isCommon: section.isCommon,
      }));
      setSelectedSections(sections);
      setLoading(false);
    } else {
      setFormData(initialData);
      setLoading(false);
    }
  }, [editingRow]);

  const validateFormData = (data: TemplateType) => {
    let isValid = true;
    let errors = { templateName: '', templateDescription: '', active: '', templateSlug: '' };

    if (data.templateName.trim().length < 5) {
      errors.templateName = 'Template Name should allow a minimum of 5 characters';
      isValid = false;

    }
    if (data.templateName.trim().length > 50) {
      errors.templateName = 'Template Name should allow a maximum of 50 character';
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
    setLoading(false);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (validateFormData(formData)) {
      if (selectedSections.length === 0) {
        setIsSectionsValid(false);
        setLoading(false);
        return;
      }

      setIsSectionsValid(true);
      try {
        const endpoint = editingRow ? template.update : template.create;

        const payload = {
          templateId: editingRow ? formData.templateId : undefined,
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
        toast.success(response.message);
        handleClose();
        setFormData(response.data);
        setEditingRow(null);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
        setLoading(false);
      }
    }
  };

  const handleAddSection = (event: any, newValue: SectionType[]) => {
    setSelectedSections([...selectedSections, ...newValue]);
  };

  const handleRemoveSection = (index: number) => {
    const updatedSections = [...selectedSections];
    updatedSections.splice(index, 1);
    setSelectedSections(updatedSections);
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

  // const handleSectionIsCommonChange = (sectionId: number) => {
  //   setSelectedSections(prevSections =>
  //     prevSections.map(section =>
  //       section.sectionId === sectionId ? { ...section, isCommon: !section.isCommon } : section
  //     )
  //   );
  // };
  const handleSectionIsCommonChange = (index: number) => {
    setSelectedSections(prevSections =>
      prevSections.map((section, i) =>
        i === index ? { ...section, isCommon: !section.isCommon } : section
      )
    );
  };
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false); 
  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormErrors({ ...formErrors, templateName: "" });
    setFormData((prevData) => ({
      ...prevData,
      templateName: newName,
      templateSlug: !isSlugManuallyEdited && open === sectionActions.ADD ? newName.replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-").toLowerCase() : prevData.templateSlug,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase();
    setFormErrors({ ...formErrors, templateSlug: "" });
    setFormData((prevData) => ({
      ...prevData,
      templateSlug: newSlug,
    }));
    setIsSlugManuallyEdited(true); 
  };

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Box display="flex" alignItems="center">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={11}>
            <BreadCrumbList />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color='info'
              onClick={() => {
              }}>
              <i className="tabler-external-link text-textSecondary"></i>
            </IconButton>
          </Grid>
        </Grid>
      </Box>
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
                    // onChange={(e) => {
                    //   setFormErrors(prevErrors => ({ ...prevErrors, templateName: '' }));
                    //   setFormData({
                    //     ...formData,
                    //     templateName: e.target.value,
                    //     templateSlug: open === sectionActions.ADD ? e.target.value.replace(/[^\w\s]|_/g, '').replace(/\s+/g, '-').toLowerCase() : formData.templateSlug,
                    //   });
                    // }}
                    onChange={handleSectionNameChange}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <CustomTextField
                    disabled={open === sectionActions.EDIT}
                    error={!!formErrors.templateSlug}
                    helperText={formErrors.templateSlug}
                    label="Template Slug *"
                    fullWidth
                    value={formData.templateSlug}
                    // onChange={(e) => {
                    //   setFormErrors(prevErrors => ({ ...prevErrors, templateSlug: '' }));
                    //   setFormData(prevData => ({ ...prevData, templateSlug: e.target.value }));
                    // }}
                    onChange={handleSlugChange}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Typography variant="body1">Status *</Typography>
                  <Switch
                    size="medium"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    error={!!formErrors.templateDescription}
                    helperText={formErrors.templateDescription}
                    value={formData.templateDescription}
                    fullWidth
                    label="Template Description *"
                    id="validation-error-helper-text"
                    onChange={(e) => {
                      setFormErrors(prevErrors => ({ ...prevErrors, templateDescription: '' }));
                      setFormData(prevData => ({ ...prevData, templateDescription: e.target.value }));
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <CustomAutocomplete
                    multiple
                    disableCloseOnSelect
                    fullWidth
                    options={activeData}
                    id="autocomplete-custom"
                    getOptionLabel={(option: SectionType) => option.sectionName || ''}
                    value={[]}
                    onChange={handleAddSection}
                    renderInput={params => <CustomTextField placeholder="" {...params} label="Content Block *" />}
                  />
                  {!isSectionsValid && (
                    <Typography color="error" variant="body2">
                      Please select at least one section.
                    </Typography>
                  )}
                </Grid>
                {selectedSections.length > 0 && (
                  <Grid item xs={6}>
                    <Typography variant="body1">Selected Sections</Typography>
                    <div>
                      {selectedSections.map((section, index) => (
                        <Box
                          key={`${section.sectionId}-${index}`}
                          draggable
                          onDragStart={event => handleDragStart(event, index)}
                          onDrop={event => handleDrop(event, index)}
                          onDragOver={handleDragOver}
                          sx={{
                            p: 2,
                            mb: 1,
                            border: '1px solid #d1d0d4',
                            borderRadius: 1,
                            cursor: 'move',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography>
                            <IconButton color='inherit'>
                              <i className="tabler-baseline-density-medium text-[18px]" />
                            </IconButton>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={section.isCommon || false}
                                  onChange={() => handleSectionIsCommonChange(index)}
                                />
                              }
                              label={<Typography>{section.sectionName}</Typography>}
                              sx={{ ml: 2 }}
                            />
                          </Typography>
                          <IconButton onClick={() => handleRemoveSection(index)} color='error'>
                            <i className="tabler-trash text-[18px] text-textDanger" />
                          </IconButton>
                        </Box>
                      ))}
                    </div>
                  </Grid>
                )}

                {/* <Grid item xs={12}>
                  <Box p={2} display="flex" gap={2} justifyContent="end" bgcolor="background.paper" position="sticky" bottom={0} zIndex={10}>
                    <Button variant="outlined" color="error" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit">
                      {open === -1 ? 'Add' : 'Edit'} Template
                    </Button>
                  </Box>
                </Grid> */}
              </Grid>
            </Box>
          </form>
        </div>
      </Card>
      <Grid item xs={12} style={{ position: 'sticky', bottom: 0, zIndex: 10, }} >
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
          <Button variant="contained" type="submit" onClick={handleSubmit}>
            {open === -1 ? 'Add' : 'Edit'} Template
          </Button>
        </Box>
      </Grid>
    </>
  );
};

export default TemplateForm;
