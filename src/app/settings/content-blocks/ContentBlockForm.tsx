import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Card,
  Grid,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import { get, post } from "@/services/apiService";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { section } from "@/services/endpoint/section";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import BreadCrumbList from "@/components/BreadCrumbList";
import { SyntheticEvent } from "react-draft-wysiwyg";

const tooltipContent = {
  "pattern": "[A-Za-z]{3,10}",
  "maxlength": 10,
  "minlength": 3,
  "min": "01",
  "max": "100",
  "accept": ".jpg, .jpeg, .png",
};

const fieldTypeOptions = [
  { label: 'email', value: 'email' },
  { label: 'file', value: 'file' },
  { label: 'text', value: 'text' },
  { label: 'url', value: 'url' },
  { label: 'date', value: 'date' },
  { label: 'number', value: 'number' },
  { label: 'textarea', value: 'textarea' },
  { label: 'Multiple', value: 'multiple' }
];

const fieldTypeOptionsForMultiple = [
  { label: 'email', value: 'email' },
  { label: 'file', value: 'file' },
  { label: 'text', value: 'text' },
  { label: 'url', value: 'url' },
  { label: 'date', value: 'date' },
  { label: 'number', value: 'number' },
  { label: 'textarea', value: 'textarea' }
];

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

const initialData = {
  id: 0,
  name: "",
  slug: "",
  jsonContent: [{ fieldType: "", fieldLabel: "", isRequired: false, validation: "" }],
  status: false,
};

type Props = {
  open: number;
};

const initialErrorData = {
  name: "",
  slug: "",
  jsonContent: [],
};

type FormDataType = {
  id: number;
  name: string;
  slug: string;
  jsonContent: any[];
  status: boolean;
};

const ContentBlockForm = ({ open }: Props) => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>(initialData);
  const [formErrors, setFormErrors] = useState<{
    name: string;
    slug: string;
    jsonContent: string[];
  }>(initialErrorData);
  const [loading, setLoading] = useState<boolean>(true);
  const query = usePathname().split("/");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (formData.jsonContent.length === 0) {
      handleAddRow();
    }
  }, []);

  const handleAddRow = () => {
    const newField = { fieldType: "", fieldLabel: "", isRequired: false, validation: "" };
    setFormData({ ...formData, jsonContent: [...formData.jsonContent, newField] });
  };
  const handleRemoveRow = (index: number) => {
    if (formData.jsonContent.length > 1) {
      const updatedFields = formData.jsonContent.filter((_, idx) => idx !== index);
      setFormData({ ...formData, jsonContent: updatedFields });
    }
  };

  const handleChangeField = (index: number, field: string, value: any, subIndex?: number) => {
    console.log(index, field, value);

    const updatedFields = [...formData.jsonContent];

    if (subIndex !== undefined) {
      updatedFields[index].multipleData[subIndex][field] = value;
    } else {
      updatedFields[index][field] = value;

      if (field === "validation") {
        try {
          JSON.parse(value);
          setFormErrors({
            ...formErrors,
            jsonContent: {
              ...formErrors.jsonContent,
              [index]: "",
            },
          });
        } catch (error) {
          setFormErrors({
            ...formErrors,
            jsonContent: {
              ...formErrors.jsonContent,
              [index]: "Validation should be a valid JSON object.",
            },
          });
        }
      }

      if (field === "fieldType" && value === "multiple") {
        updatedFields[index].multipleData = [{ fieldType: "", fieldLabel: "", isRequired: false, validation: "" }];
      }
    }

    setFormData({ ...formData, jsonContent: updatedFields });
  };
  const handleAddSubRow = (parentIndex: number) => {
    const newSubField = { fieldType: "", fieldLabel: "", isRequired: false, validation: "" };
    const updatedFields = [...formData.jsonContent];
    updatedFields[parentIndex].multipleData.push(newSubField);
    setFormData({ ...formData, jsonContent: updatedFields });
  };

  const handleRemoveSubRow = (parentIndex: number, subIndex: number) => {
    const updatedFields = [...formData.jsonContent];
    if (updatedFields[parentIndex].multipleData.length > 1) {
      updatedFields[parentIndex].multipleData = updatedFields[parentIndex].multipleData.filter((_: any, idx: any) => idx !== subIndex);
      setFormData({ ...formData, jsonContent: updatedFields });
    }
  };
  const validateFormData = (data: FormDataType) => {
    let isValid = true;
    let errors = {
      name: '',
      slug: '',
      jsonContent: data.jsonContent.map(() => ''),
    };

    if (data.name.trim().length === 0) {
      errors.name = 'Full Name is required';
      isValid = false;
    }

    if (data.slug.trim().length === 0) {
      errors.slug = 'Section Slug is required';
      isValid = false;
    }


    setFormErrors({ ...formErrors, ...errors });
    setLoading(false);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateFormData(formData)) {
      try {
        setLoading(true);
        const endpoint = open === sectionActions.EDIT ? section.update : section.create;

        const payload = {
          sectionId: open === sectionActions.EDIT ? formData.id : undefined,
          sectionName: formData.name,
          sectionSlug: formData.slug,
          sectionTemplate: formData.jsonContent,
          active: formData.status,
        };

        const response = await post(endpoint, payload);

        toast.success(response.message);
        handleReset();
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setFormErrors(initialErrorData);
    router.back();
  };

  const getSectionDataById = async (slug: string | number) => {
    try {
      const result = await get(`${section.getById}/${slug}`);
      const { data } = result;

      setFormData({
        ...formData,
        id: data.sectionId,
        name: data.sectionName,
        slug: data.sectionSlug,
        jsonContent: data.sectionTemplate,
        status: data.active,

      });
      setIsSlugManuallyEdited(false);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open === sectionActions.EDIT) {
      getSectionDataById(query[query.length - 1]);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormErrors({ ...formErrors, name: "" });
    setFormData((prevData) => ({
      ...prevData,
      name: newName,
      slug: !isSlugManuallyEdited && open === sectionActions.ADD ? newName.replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-").toLowerCase() : prevData.slug,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase();
    setFormErrors({ ...formErrors, slug: "" });
    setFormData((prevData) => ({
      ...prevData,
      slug: newSlug,
    }));
    setIsSlugManuallyEdited(true);
  };
  const handleChange = () => {
    setExpanded(!expanded)
  }
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
            <Box display="flex" alignItems="center">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    label="Full Name *"
                    fullWidth
                    placeholder=""
                    value={formData.name}
                    onChange={handleSectionNameChange}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <CustomTextField
                    disabled={open === sectionActions.EDIT}
                    error={!!formErrors.slug}
                    helperText={formErrors.slug}
                    label="Slug *"
                    fullWidth
                    placeholder=""
                    value={formData.slug}
                    onChange={handleSlugChange}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Typography variant="body2" sx={{ mr: 0 }}>
                    Status
                  </Typography>
                  <Switch
                    size='medium'
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <label className="text-[0.8125rem] leading-[1.153]">JSON Content *</label>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Field Type</TableCell>
                          <TableCell>Field Label</TableCell>
                          <TableCell>Is Required</TableCell>
                          <TableCell>Validation
                            <Tooltip placement="top" title={<pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(tooltipContent, null, 2)}</pre>}>
                              <IconButton>
                                <i className="tabler-alert-square-filled" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>Actions </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.jsonContent.map((field, index) => (
                          <React.Fragment key={index}>
                            <TableRow>
                              <TableCell>
                                <CustomAutocomplete
                                  fullWidth
                                  options={fieldTypeOptions}
                                  id={`autocomplete-custom-${index}`}
                                  getOptionLabel={(option) => option.label || ""}
                                  renderInput={(params) => <CustomTextField {...params} placeholder="" />}
                                  value={fieldTypeOptions.find((option) => option.value === field.fieldType) || null}
                                  onChange={(e, newValue) => handleChangeField(index, "fieldType", newValue ? newValue.value : "")}
                                />
                              </TableCell>
                              <TableCell>
                                <CustomTextField
                                  fullWidth
                                  value={field.fieldLabel}
                                  onChange={(e) => handleChangeField(index, "fieldLabel", e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={field.isRequired}
                                  onChange={(e) => handleChangeField(index, "isRequired", e.target.checked)}
                                />
                              </TableCell>
                              <TableCell>
                                <CustomTextField
                                  fullWidth
                                  value={field.validation}
                                  onChange={(e) => handleChangeField(index, "validation", e.target.value)}
                                  error={!!formErrors.jsonContent[index]}
                                  helperText={formErrors.jsonContent[index]}
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton size="small" onClick={() => handleRemoveRow(index)} aria-label="minus" color="error">
                                  <i className="tabler-minus" />
                                </IconButton>
                                {index === formData.jsonContent.length - 1 && (
                                  <IconButton
                                    size="small"
                                    onClick={handleAddRow}
                                    aria-label="plus"
                                    color="success"
                                    style={{ marginLeft: 8 }}
                                  >
                                    <i className="tabler-plus" />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>

                            {field.fieldType === "multiple" && (
                              <TableRow>
                                <TableCell colSpan={5}>
                                  <Accordion expanded={expanded} onChange={handleChange}
                                  >
                                    <AccordionSummary
                                      expandIcon={<IconButton
                                        size="small"
                                        aria-label="plus"
                                        color="info"
                                        style={{ marginLeft: 8 }}
                                      >
                                        <i className="tabler-chevron-down" />
                                      </IconButton>}>
                                      <Typography variant="subtitle1">Multiple Label: {field.fieldLabel ? field.fieldLabel : 'N/A'}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Field Type</TableCell>
                                            <TableCell>Field Label</TableCell>
                                            <TableCell>Is Required</TableCell>
                                            <TableCell>Validation
                                              <Tooltip placement="top" title={<pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(tooltipContent, null, 2)}</pre>}>
                                                <IconButton>
                                                  <i className="tabler-alert-square-filled" />
                                                </IconButton>
                                              </Tooltip>
                                            </TableCell>
                                            <TableCell>Actions </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {field.multipleData.map((subField: any, subIndex: any) => (
                                            <TableRow key={`${index}-${subIndex}`}>
                                              <TableCell>
                                                <CustomAutocomplete
                                                  fullWidth
                                                  options={fieldTypeOptionsForMultiple}
                                                  id={`autocomplete-custom-${index}-${subIndex}`}
                                                  getOptionLabel={(option) => option.label || ""}
                                                  renderInput={(params) => <CustomTextField {...params} placeholder="" />}
                                                  value={fieldTypeOptionsForMultiple.find((option) => option.value === subField.fieldType) || null}
                                                  onChange={(e, newValue) => handleChangeField(index, "fieldType", newValue ? newValue.value : "", subIndex)}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <CustomTextField
                                                  fullWidth
                                                  value={subField.fieldLabel}
                                                  onChange={(e) => handleChangeField(index, "fieldLabel", e.target.value, subIndex)}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <Switch
                                                  checked={subField.isRequired}
                                                  onChange={(e) => handleChangeField(index, "isRequired", e.target.checked, subIndex)}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <CustomTextField
                                                  fullWidth
                                                  value={subField.validation}
                                                  onChange={(e) => handleChangeField(index, "validation", e.target.value, subIndex)}
                                                  error={!!formErrors.jsonContent[index]?.[subIndex]}
                                                  helperText={formErrors.jsonContent[index]?.[subIndex]}
                                                />
                                              </TableCell>
                                              <TableCell>
                                                <IconButton
                                                  size="small"
                                                  onClick={() => handleRemoveSubRow(index, subIndex)}
                                                  aria-label="minus"
                                                  color="error"
                                                >
                                                  <i className="tabler-minus" />
                                                </IconButton>
                                                {subIndex === field.multipleData.length - 1 && (
                                                  <IconButton
                                                    size="small"
                                                    onClick={() => handleAddSubRow(index)}
                                                    aria-label="plus"
                                                    color="success"
                                                    style={{ marginLeft: 8 }}
                                                  >
                                                    <i className="tabler-plus" />
                                                  </IconButton>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </AccordionDetails>
                                  </Accordion>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                  <Box
                    p={7}
                    display="flex"
                    gap={2}
                    justifyContent="end"
                    bgcolor="background.paper"
                  >
                    <Button
                      variant="contained"
                      color="error"
                      type="reset"
                      onClick={() => handleReset()}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit">
                      {open === sectionActions.ADD ? "Add" : "Edit"} Content Block
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

export default ContentBlockForm;