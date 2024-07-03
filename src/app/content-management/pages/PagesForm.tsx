import LoadingBackdrop from "@/components/LoadingBackdrop";
import {
  Button,
  Box,
  Card,
  Grid,
  MenuItem,
  Typography,
  TextField,
  Switch,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { get, post } from "@/services/apiService";
import { template } from "@/services/endpoint/template";
import CustomTextField from "@/@core/components/mui/TextField";
import { useRouter } from "next/navigation";
import { boolean } from "valibot";
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker";

type FileProp = {
  name: string;
  type: string;
  size: number;
};

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

const initialFormData = {
  templateId: -1,
  title: "",
  slug: "",
  content: "",
  categories: ["category1", "category2", "category3"] as string[],
  tags: ["tag1", "tag2", "tag3"] as string[],
  description: "",
  status: false,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const initialErrorData = {
  templateId: "",
  title: "",
  slug: "",
  content: "",
  categories: "",
  tags: "",
  description: "",
  status: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

function PagesForm({ open }: any) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<typeof initialFormData>(
    initialFormData
  );
  const [formErrors, setFormErrors] = useState<typeof initialErrorData>(
    initialErrorData
  );
  const [templateList, setTemplateList] = useState<
    { templateName: string; templateId: number }[]
  >([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<Date | null | undefined>(new Date());

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)));
    },
  });

  useEffect(() => {
    async function getTemplate() {
      await getActiveTemplateList();
    }
    getTemplate();
  }, []);

  const getActiveTemplateList = async () => {
    try {
      setLoading(true);
      const result = await post(`${template.active}`, {});
      const { data } = result;
      setTemplateList(data.templates);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getTemplateIdWiseForm = async (templateId: number) => {
    setLoading(true);
    try {
      const result = await get(
        `${template.getTemplateSectionsById}/${templateId}`
      );
      if (result.statusCode === 200) {
        setSections(result.data);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const validateField = (value: string, validation: any) => {
    if (validation.required && !value) {
      return "This field is required";
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `Maximum length is ${validation.maxLength}`;
    }
    if (validation.minLength && value.length < validation.minLength) {
      return `Minimum length is ${validation.minLength}`;
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return "Invalid format";
    }
    return "";
  };

  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };

    if (formData.templateId === -1) {
      errors.templateId = "Please select a template";
      valid = false;
    }

    if (!formData.title) {
      errors.title = "Title is required";
      valid = false;
    }

    if (!formData.slug) {
      errors.slug = "Slug is required";
      valid = false;
    }

    if (!formData.content) {
      errors.content = "Content is required";
      valid = false;
    }

    if (!formData.metaTitle) {
      errors.metaTitle = "Meta Title is required";
      valid = false;
    }

    if (!formData.metaDescription) {
      errors.metaDescription = "Meta Description is required";
      valid = false;
    }

    if (!formData.metaKeywords) {
      errors.metaKeywords = "Meta Keywords are required";
      valid = false;
    }

    const sectionErrors = sections.map((section) => {
      const sectionError: any = {};
      section.sectionTemplate.forEach(
        (
          field: {
            fieldLabel: string;
            fieldType: string;
            isRequired: boolean;
            validation: string;
          },
          fieldIndex: number
        ) => {
          const value = section.sectionTemplate[fieldIndex][field.fieldType];
          let validationObj = {};
          try {
            validationObj = JSON.parse(field.validation);
          } catch (error) {
            console.error(`Error parsing validation JSON: ${error}`);
          }
          const error = validateField(value, validationObj);
          if (error) {
            sectionError[field.fieldType] = error;
            valid = false;
          }
        }
      );
      return sectionError;
    });

    setFormErrors(errors);
    setSections((prevSections) =>
      prevSections.map((section, index) => ({
        ...section,
        errors: sectionErrors[index],
      }))
    );
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const result = await post("/api/blog/create", formData);
        setLoading(false);
        if (result.status === 200) {
          router.push("/blogs");
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    sectionId: number,
    fieldIndex: number
  ) => {
    const { name, value } = event.target;
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      updatedSections.forEach((section) => {
        if (section.sectionId === sectionId) {
          section.sectionTemplate[fieldIndex][name] = value;
        }
      });
      return updatedSections;
    });
  };

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(
    false
  );

  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormErrors({ ...formErrors, title: "" });
    setFormData((prevData) => ({
      ...prevData,
      title: newName,
      slug:
        !isSlugManuallyEdited && open === sectionActions.ADD
          ? newName
              .replace(/[^\w\s]|_/g, "")
              .replace(/\s+/g, "-")
              .toLowerCase()
          : prevData.slug,
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

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Card>
        <div>
          <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
            <Box display="flex" alignItems="center">
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                    label="Title *"
                    fullWidth
                    placeholder=""
                    value={formData.title}
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
                    size="medium"
                    checked={formData.status}
                    onChange={(e: any) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    disabled={open === sectionActions.EDIT}
                    error={!!formErrors.content}
                    helperText={formErrors.content}
                    label="Content *"
                    fullWidth
                    placeholder=""
                    value={formData.content}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={2}
                    minRows={2}
                    error={!!formErrors.metaTitle}
                    helperText={formErrors.metaTitle}
                    label="Meta Title* (maximum-character: 60 )"
                    fullWidth
                    placeholder=""
                    value={formData.metaTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({ ...formData, metaTitle: e.target.value });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaTitle: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={10}
                    minRows={7}
                    error={!!formErrors.metaDescription}
                    helperText={formErrors.metaDescription}
                    label="Meta Description* (maximum-character: 160 )"
                    fullWidth
                    placeholder=""
                    value={formData.metaDescription}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      });
                      if (e.target?.value?.length) {
                        setFormErrors({
                          ...formErrors,
                          metaDescription: "",
                        });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={4}
                    minRows={4}
                    error={!!formErrors.metaKeywords}
                    helperText={formErrors.metaKeywords}
                    label="Meta Keywords* (maximum-character: 160 )"
                    fullWidth
                    placeholder=""
                    value={formData.metaKeywords}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        metaKeywords: e.target.value,
                      });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaKeywords: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <AppReactDatepicker
                    selected={date}
                    id="basic-input"
                    onChange={(date: Date) => setDate(date)}
                    placeholderText="Click to select a date"
                    customInput={
                      <CustomTextField label="Schedule Date" fullWidth />
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <CustomTextField
                    error={!!formErrors.templateId}
                    helperText={formErrors.templateId}
                    select
                    fullWidth
                    defaultValue=""
                    value={formData.templateId}
                    label="Select Template"
                    id="custom-select"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const templateId = Number(e.target.value);
                      setFormData({ ...formData, templateId });
                      getTemplateIdWiseForm(templateId);
                    }}
                    inputProps={{}}
                  >
                    {!loading &&
                      !!templateList.length &&
                      templateList.map((template) => (
                        <MenuItem
                          key={template.templateId}
                          value={template.templateId}
                        >
                          {template.templateName}
                        </MenuItem>
                      ))}
                  </CustomTextField>
                </Grid>
                {sections.map((section) => (
                  <Grid item xs={6} key={section.sectionId}>
                    <Typography variant="h6">
                      {section.sectionName}
                    </Typography>
                    {section.sectionTemplate.map(
                      (
                        field: {
                          fieldLabel: string;
                          fieldType: string;
                          isRequired: boolean;
                          validation: string;
                        },
                        fieldIndex: number
                      ) => (
                        <div key={fieldIndex}>
                          <CustomTextField
                            label={field.fieldLabel}
                            type={field.fieldType}
                            required={field.isRequired}
                            name={field.fieldType}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleInputChange(
                                e,
                                section.sectionId,
                                fieldIndex
                              )
                            }
                            fullWidth
                            margin="normal"
                            error={
                              section.errors &&
                              section.errors[field.fieldType]
                            }
                            helperText={
                              section.errors &&
                              section.errors[field.fieldType]
                            }
                            inputProps={
                              field.validation
                                ? JSON.parse(field.validation)
                                : {}
                            }
                          />

                          {section.errors &&
                            section.errors[field.fieldType] && (
                              <Typography
                                variant="body2"
                                color="error"
                                style={{ marginTop: "0.5rem" }}
                              >
                                {section.errors[field.fieldType]}
                              </Typography>
                            )}
                        </div>
                      )
                    )}
                  </Grid>
                ))}
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
                    <Button variant="contained" color="error" type="reset">
                      Cancel
                    </Button>
                    <Button color="warning" variant="contained">
                      Save as Draft
                    </Button>
                    <Button variant="contained" type="submit">
                      Save & Publish
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
}

export default PagesForm;
