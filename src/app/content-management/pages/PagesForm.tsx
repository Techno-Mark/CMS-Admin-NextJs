
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
import { PagesType } from "./pagesType";
import { pages } from "@/services/endpoint/pages";
import { toast } from "react-toastify";

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
  pageId: "",
  templateId: -1,
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  // scheduleDate: new Date().toISOString().split('T')[0],
  templateData: {} as Record<string, any>,
  // status: false
};

const initialErrorData = {
  templateId: "",
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  templateData: {} as Record<string, any>,
  // scheduleDate: ""
};
type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: PagesType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<PagesType | null>>;
};
function PagesForm({ open, handleClose, editingRow, setEditingRow }: Props) {
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
  const [PDStatus, setPDStatus] = useState<boolean>(false);
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
    setLoading(true);
    if (editingRow) {
      setFormData(editingRow);
      getTemplateIdWiseForm(editingRow.templateId);
      setLoading(false);
    } else {
      setFormData(initialFormData);
      setLoading(false);
    }
  }, [editingRow]);
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
      const result = await get(`${template.getTemplateSectionsById}/${templateId}`);
      if (result.statusCode === 200) {
        const sectionsWithErrors = result.data.map((section: any) => ({
          ...section,
          errors: section.sectionTemplate.reduce((acc: any, field: any) => {
            acc[field.fieldType] = "";
            return acc;
          }, {}),
        }));

        const result1 = {} as any;

        // result.data.forEach((section:any) => {
        for (let ind = 0; ind < result.data.length; ind++) {
          const sectionTemplate = result.data[ind].sectionTemplate;
          const emptyData = {} as any;
          for (let index = 0; index < sectionTemplate.length; index++) {
            emptyData[sectionTemplate[index].fieldLabel] = "";
          }

          result1[result.data[ind].sectionName] = emptyData;
        };


        setSections(sectionsWithErrors);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const resetSectionsAndData = () => {
    setSections([]);
    setFormData((prevData) => ({
      ...prevData,
      templateData: {},
    }));
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


    if (validation.min !== undefined && validation.max !== undefined) {
      if (parseFloat(value) > parseFloat(validation.max)) {
        return `Maximum value is ${validation.max}`;
      }
      if (parseFloat(value) < parseFloat(validation.min)) {
        return `Minimum value is ${validation.min}`;
      }
    } else {

      if (validation.min !== undefined && parseFloat(value) < parseFloat(validation.min)) {
        return `Minimum value is ${validation.min}`;
      }

      if (validation.max !== undefined && parseFloat(value) > parseFloat(validation.max)) {
        return `Maximum value is ${validation.max}`;
      }
    }


    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return "Invalid format";
    }


    // if (validation.accept) {
    //   const acceptedTypes = validation.accept.split(',').map((type: any) => type.trim());
    //   const fileExtension = value.split('.').pop();
    //   if (fileExtension && !acceptedTypes.includes(`.${fileExtension}`)) {
    //     return `Only accept ${validation.accept}`;
    //   }
    // }

    return "";
  };
  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };
  
    // Validate form-level fields
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
  
    // Validate section fields
    const sectionErrors = sections.map((section, index) => {
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
          const validation = JSON.parse(field.validation || "{}");
          const error = validateField(value, validation);
  
          // Update error messages for the field
          sectionError[field.fieldType] = error || ""; // Clear error if no validation issue
          if (error) {
            valid = false; // Set form validity to false if there's any error
          }
        }
      );
  
      return sectionError;
    });
  
    // Update templateData errors
    errors.templateData = { ...formData.templateData };
  
    // Update form and section errors in state
    setFormErrors(errors);
    setSections((prevSections) =>
      prevSections.map((section, index) => ({
        ...section,
        errors: sectionErrors[index], // Update errors for each section
      }))
    );
  console.log(formData);
  console.log(formErrors);
  
    return valid; // Return overall form validity
  };
  

//   const validateForm = () => {
//     let valid = true;
//     let errors = { ...initialErrorData };

//     // Validate form-level fields
//     if (formData.templateId === -1) {
//       errors.templateId = "Please select a template";
//       valid = false;
//     }

//     if (!formData.title) {
//       errors.title = "Title is required";
//       valid = false;
//     }

//     if (!formData.slug) {
//       errors.slug = "Slug is required";
//       valid = false;
//     }

//     if (!formData.content) {
//       errors.content = "Content is required";
//       valid = false;
//     }

//     if (!formData.metaTitle) {
//       errors.metaTitle = "Meta Title is required";
//       valid = false;
//     }

//     if (!formData.metaDescription) {
//       errors.metaDescription = "Meta Description is required";
//       valid = false;
//     }

//     if (!formData.metaKeywords) {
//       errors.metaKeywords = "Meta Keywords are required";
//       valid = false;
//     }

//     console.log(sections);

//     // Validate section fields
//   const sectionErrors = sections.map((section, index) => {
//     const sectionError: any = {};
//     section.sectionTemplate.forEach(
//       (
//         field: {
//           fieldLabel: string;
//           fieldType: string;
//           isRequired: boolean;
//           validation: string;
//         },
//         fieldIndex: number
//       ) => {
//         const value = section.sectionTemplate[fieldIndex][field.fieldType];
//         const validation = JSON.parse(field.validation || "{}");
//         const error = validateField(value, validation);

//         // Update error messages for the field
//         sectionError[field.fieldType] = error || ""; 
//         if (error) {
//           valid = false; 
//         }
//       }
//     );
//     return sectionError;
//   });

//   // Update form and section errors in state
//   setFormErrors(errors);
//   setSections((prevSections) =>
//     prevSections.map((section, index) => ({
//       ...section,
//       errors: sectionErrors[index], // Update errors for each section
//     }))
//   );
// console.log(errors);
// console.log(valid);

//   return valid; // Return overall form validity
//   };

  // const validateForm = () => {
  //   let valid = true;
  //   let errors = { ...initialErrorData };

  //   if (formData.templateId === -1) {
  //     errors.templateId = "Please select a template";
  //     valid = false;
  //   }

  //   if (!formData.title) {
  //     errors.title = "Title is required";
  //     valid = false;
  //   }

  //   if (!formData.slug) {
  //     errors.slug = "Slug is required";
  //     valid = false;
  //   }

  //   if (!formData.content) {
  //     errors.content = "Content is required";
  //     valid = false;
  //   }

  //   if (!formData.metaTitle) {
  //     errors.metaTitle = "Meta Title is required";
  //     valid = false;
  //   }

  //   if (!formData.metaDescription) {
  //     errors.metaDescription = "Meta Description is required";
  //     valid = false;
  //   }

  //   if (!formData.metaKeywords) {
  //     errors.metaKeywords = "Meta Keywords are required";
  //     valid = false;
  //   }

  //   const sectionErrors = sections.map((section) => {
  //     const sectionError: any = {};
  //     section.sectionTemplate.forEach(
  //       (
  //         field: {
  //           fieldLabel: string;
  //           fieldType: string;
  //           isRequired: boolean;
  //           validation: string;
  //         },
  //         fieldIndex: number
  //       ) => {
  //         const value = section.sectionTemplate[fieldIndex][field.fieldType];
  //         console.log(section);

  //         let validationObj = {};
  //         try {
  //           validationObj = JSON.parse(field.validation);
  //         } catch (error) {
  //           console.error(`Error parsing validation JSON: ${error}`);
  //         }
  //         const error = validateField(value, validationObj);
  //         if (error) {
  //           sectionError[field.fieldType] = error;
  //           valid = false;
  //         }
  //       }
  //     );
  //     return sectionError;
  //   });

  //   setFormErrors(errors);
  //   setSections((prevSections) =>
  //     prevSections.map((section, index) => ({
  //       ...section,
  //       errors: sectionErrors[index],
  //     }))
  //   );
  //   return valid;
  // };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const endpoint = editingRow ? pages.update : pages.create;
        const result = await post(endpoint, {
          ...formData,
          pageId: editingRow ? formData.pageId : undefined,
          templateData: formData.templateData,
          active: PDStatus
        });
        toast.success(result.message);
        handleClose();
        setFormData(result);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    sectionId: number,
    index: number,
    fieldIndex: number
  ) => {
    const { name, value, files } = event.target;

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setSections((prevSections) => {
          const updatedSections = prevSections.map((sec, mainIndex) => {
            if (mainIndex === index) {
              const sectionName = sec.sectionName;

              const updatedSectionsTemp = sec.sectionTemplate.map(
                (secTemplate: any, temIndex: any) => {
                  if (temIndex === fieldIndex) {
                    sec.sectionTemplate[temIndex][name] = value;
                    const validation = JSON.parse(secTemplate.validation || "{}");
                    const error = validateField(value, validation);
                    setFormData((prevData) => ({
                      ...prevData,
                      templateData: {
                        ...prevData.templateData,
                        [`${index}+${temIndex}`]: {
                          file,
                          preview: reader.result as string,
                          error: error,
                        },
                      },
                    }));
                  }
                }
              );
            }
            return sec;
          });
          return updatedSections;
        });



      };
      reader.readAsDataURL(file);
    } else {
      setSections((prevSections) => {
        const updatedSections = prevSections.map((sec, mainIndex) => {
          if (mainIndex === index) {
            const sectionName = sec.sectionName;

            const updatedSectionTemplate = sec.sectionTemplate.map(
              (secTemplate: any, temIndex: any) => {
                if (temIndex === fieldIndex) {
                  secTemplate[name] = value;
                  console.log(value);
                  
                  const validation = JSON.parse(secTemplate.validation || "{}");
                  const error = validateField(value, validation);

                  // Update formData with value and error
                  setFormData((prevData) => ({
                    ...prevData,
                    templateData: {
                      ...prevData.templateData,
                      [`${index}+${temIndex}`]: {
                        ...prevData.templateData[sectionName],
                        [name]: value,
                        error: error,
                      },

                    },
                  }));

                  return {
                    ...secTemplate,
                    error
                  };
                }
                return secTemplate;
              }
            );

            return {
              ...sec,
              sectionTemplate: updatedSectionTemplate,
            };
          }
          return sec;
        });
        console.log(updatedSections);
        return updatedSections;
      });

    }
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


  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTemplateId = parseInt(e.target.value);
    setFormErrors({ ...formErrors, templateId: "" });
    setFormData((prevData) => ({
      ...prevData,
      templateId: selectedTemplateId,
    }));
    resetSectionsAndData();
    getTemplateIdWiseForm(selectedTemplateId);
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
                <Grid item xs={12} sm={6}>
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


                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    error={!!formErrors.content}
                    helperText={formErrors.content}
                    label="Content *"
                    fullWidth
                    placeholder=""
                    value={formData.content}
                    multiline
                    // maxRows={2}
                    // minRows={2}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({ ...formData, content: e.target.value });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, content: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    multiline
                    // maxRows={2}
                    // minRows={2}
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
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    // maxRows={10}
                    // minRows={7}
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
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    // maxRows={4}
                    // minRows={4}
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

                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    error={!!formErrors.templateId}
                    helperText={formErrors.templateId}
                    select
                    fullWidth
                    defaultValue=""
                    value={formData.templateId}
                    label="Template"
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
                {sections.map((section, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography variant="h6">{section.sectionName}</Typography>
                    {section.sectionTemplate.map(
                      (
                        field: {
                          fieldLabel: string;
                          fieldType: string;
                          isRequired: boolean;
                          validation: string;
                          error: string
                        },
                        fieldIndex: number
                      ) => (
                        <div key={fieldIndex}>
                          {field.fieldType === "file" ? (
                            <>
                              <CustomTextField
                                label={field.fieldLabel}
                                name={field.fieldType}
                                // required={!editingRow == field.isRequired}
                                type="file"
                                fullWidth
                                margin="normal"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  handleInputChange(
                                    e,
                                    section.sectionId,
                                    index,
                                    fieldIndex
                                  )
                                }
                                error={
                                  field.error && field.error
                                }
                                helperText={field.error && field.error}
                                InputLabelProps={{ shrink: true }}
                              />
                              {formData.templateData &&
                                formData.templateData[`${index}+${fieldIndex}`]?.preview && (
                                  <Box mt={2}>
                                    <img
                                      src={
                                        formData.templateData[`${index}+${fieldIndex}`]?.preview
                                      }
                                      alt="Preview"
                                      style={{
                                        width: "100%",
                                        maxHeight: "200px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </Box>
                                )}
                            </>
                          ) : (
                            <CustomTextField
                              label={field.fieldLabel}
                              type={field.fieldType}
                              // required={field.isRequired}
                              name={field.fieldType}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                handleInputChange(
                                  e,
                                  section.sectionId,
                                  index,
                                  fieldIndex
                                )
                              }
                              fullWidth
                              margin="normal"
                              error={
                                field.error &&
                                field.error
                              }
                              helperText={
                                field.error &&
                                field.error
                              }
                              inputProps={
                                field.validation
                                  ? JSON.parse(field.validation)
                                  : {}
                              }
                              value={
                                (formData.templateData &&
                                  formData.templateData[
                                  `${index}+${fieldIndex}`
                                  ]?.[field.fieldType]) ||
                                ""
                              }
                            />
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
                    <Button variant="contained" color="error" type="reset" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button color="warning" variant="contained" type="submit" onClick={() => setPDStatus(false)}>
                      Save as Draft
                    </Button>
                    <Button variant="contained" type="submit" onClick={() => setPDStatus(true)}>
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