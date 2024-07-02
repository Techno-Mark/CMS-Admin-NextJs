"use client";

import LoadingBackdrop from "@/components/LoadingBackdrop";
import {
  Button,
  Box,
  Card,
  Grid,
  MenuItem,
  Typography,
  TextField,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { get, post } from "@/services/apiService";
import { template } from "@/services/endpoint/template";
import CustomTextField from "@/@core/components/mui/TextField";

type FileProp = {
  name: string;
  type: string;
  size: number;
};

const initialFormData = {
  templateId: -1,
  title: "",
  slug: "",
  authorName: "",
  categories: ["category1", "category2", "category3"] as string[],
  tags: ["tag1", "tag2", "tag3"] as string[],
  description: "",
  status: 0,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const initialErrorData = {
  templateId: "",
  title: "",
  slug: "",
  authorName: "",
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
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData);
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);
  const [templateList, setTemplateList] = useState<
    [{ templateName: string; templateId: number }] | []
  >([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)));
    },
  });

  const img = files.map((file: FileProp) => (
    <img
      key={file.name}
      alt={file.name}
      className="single-file-image"
      src={URL.createObjectURL(file as any)}
      width={"450px"}
      height={"400px"}
    />
  ));

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

    const sectionErrors = sections.map((section) => {
      const sectionError: any = {};
      section.sectionTemplate.forEach(
        (
          field: { fieldLabel: string; fieldType: string; validation: any },
          fieldIndex: number
        ) => {
          const value = section.sectionTemplate[fieldIndex][field.fieldType];
          const error = validateField(value, field.validation);
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

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Card>
        <div>
          <form className="flex flex-col gap-6 p-6" onSubmit={handleSubmit}>
            <Box display="flex" alignItems="center">
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12}>
                  <TextField
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
                  >
                    {!loading &&
                      !!templateList.length &&
                      templateList.map((template) => {
                        return (
                          <MenuItem
                            value={template.templateId}
                            key={template.templateName}
                          >
                            {template.templateName}
                          </MenuItem>
                        );
                      })}
                  </TextField>
                </Grid>
                {sections.map((section) => (
                  <Grid item xs={6} key={section.sectionId}>
                    <Typography variant="h6">{section.sectionName}</Typography>
                    {section.sectionTemplate.map(
                      (
                        field: {
                          fieldLabel: string;
                          fieldType: string;
                          isRequired: boolean;
                          validation: any;
                        },
                        fieldIndex: number
                      ) => (
                        <div key={fieldIndex}>
                          <CustomTextField
                            label={field.fieldLabel}
                            type={field.fieldType}
                            required={field.isRequired}
                            name={field.fieldType}
                            onChange={(e:any) =>
                              handleInputChange(
                                e,
                                section.sectionId,
                                fieldIndex
                              )
                            }
                            fullWidth
                            margin="normal"
                            inputProps={JSON.parse(field.validation)} // Add dynamic validation here
                          />
                          {section.errors && section.errors[field.fieldType] && (
                            <Typography color="error" variant="body2">
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
