
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
  IconButton,
  CardContent,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardActions,
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
import BreadCrumbList from "@/components/BreadCrumbList";

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
  sections: [
    {
      sectionName: 'Section 1',
      sectionTemplate: [
        {
          fieldLabel: 'Field 1',
          fieldType: 'multiple',
          isRequired: true,
          validation: '{}', // Example validation
          multipleData: [
            {
              fieldType: 'text',
              fieldLabel: 'Subfield 1',
              isRequired: true,
              validation: '{}',
            },
          ],
        }]
    }]



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
  const [expanded, setExpanded] = useState(true)
  const [expandedIndex, setExpandedIndex] = useState()
  const [expandedIndices, setExpandedIndices] = useState(sections.map(() => true));

  const handleChange = (index: any) => {
    setExpandedIndices((prev) => {
      const newExpandedIndices = [...prev];
      newExpandedIndices[index] = !prev[index];
      return newExpandedIndices;
    });
  };
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
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
  const validateField = (value: string, validation: any, field?: any) => {
    if (!value && field?.isRequired) {
      return `${field?.fieldLabel} is required`;
    }
    if (field?.fieldType == 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `Invalid email format`;
      }
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
    if (validation.pattern) {
      const patternRegex = new RegExp(validation.pattern);
      if (!patternRegex.test(value)) {
        return `Value does not match the required pattern`;
      }
    }
    return "";
  };

  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };
    let updatedSections = [...sections];

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

    updatedSections = updatedSections.map((section, secIndex) => {
      const updatedSectionTemplate = section.sectionTemplate.map((field: any, fieldIndex: any) => {
        let error = "";
        const value = formData.templateData[`${secIndex}+${fieldIndex}`]?.[field.fieldType] || '';
        const validation = JSON.parse(field.validation || "{}");

        if (field.fieldType === "multiple") {
          field.multipleData = field.multipleData.map((subField: any, subFieldIndex: any) => {
            const subValue = formData.templateData[`${secIndex}+${fieldIndex}+${subFieldIndex}`]?.[subField.fieldType] || '';
            const subValidation = JSON.parse(subField.validation || "{}");
            const subError = validateField(subValue, subValidation, subField);

            if (subError) {
              valid = false;
            }

            return {
              ...subField,
              error: subError,
            };
          });
        } else {
          error = validateField(value, validation, field);
          if (error) {
            valid = false;
          }
        }

        return {
          ...field,
          error,
        };
      });

      return {
        ...section,
        sectionTemplate: updatedSectionTemplate,
      };
    });

    setSections(updatedSections);
    setFormErrors(errors);

    return valid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);

        const formattedData: any[] = [];

        Object.keys(formData.templateData).forEach(key => {
          const content = formData.templateData[key];
          const mainKey = content.templateId;
          const sectionName = content.sectionName;
          const sectionId = content.templateSectionId;
          const sectionMultipleId = content.templateSectionMultipleId;
          console.log(content);


          // Find or create the corresponding content block
          let contentBlock = formattedData.find(block => block[`${sectionName}-${mainKey}`]);
          if (!contentBlock) {
            contentBlock = { [`${sectionName}-${mainKey}`]: [] };
            formattedData.push(contentBlock);
          }

          // Determine the content type and format accordingly
          let formattedContent;
          switch (content.fieldType) {
            case 'email':
              formattedContent = {
                Label: sectionMultipleId? content.subField :content.fieldLabel || "",
                Value: content.email || "",

              };
              break;
            case 'file':
              formattedContent = {
                Label: sectionMultipleId? content.subField :content.fieldLabel || "",
                Value: content.file || "",
                Preview: content.preview || "",

              };
              break;
            case 'url':
              formattedContent = {
                Label: sectionMultipleId? content.subField :content.fieldLabel || "",
                Value: content.url || "",

              };
              break;
            case 'date':
              formattedContent = {
                Label: sectionMultipleId? content.subField :content.fieldLabel || "",
                Value: content.date || "",

              };
              break;
            case 'number':
              formattedContent = {
                Label: sectionMultipleId? content.subField :content.fieldLabel || "",
                Value: content.number || "",

              };
              break;
            case 'textarea':
              formattedContent = {
                Label: sectionMultipleId? content.subField :content.fieldLabel || "",
                Value: content.textarea || "",

              };
              break;
            case 'text':
            default:
              formattedContent = {
                Label: content.fieldLabel || "",
                Value: content.text || "",

              };
              break;
          }

          // Check for templateSectionMultipleId to create nested structure
          if (sectionMultipleId) {
            let nestedSection = contentBlock[`${sectionName}-${mainKey}`].find((section: { [x: string]: any; }) => section[`${content.fieldLabel}`]);
            if (!nestedSection) {
              nestedSection = { [`${content.fieldLabel}`]: [] };
              contentBlock[`${sectionName}-${mainKey}`].push(nestedSection);
            }
            nestedSection[`${content.fieldLabel}`].push(formattedContent
            //   {
            //   Label: content.subField || "",
            //   Value: content.text || "",
            // }
          );
          } else {
            contentBlock[`${sectionName}-${mainKey}`].push(formattedContent);
          }
        });

        console.log(JSON.stringify(formattedData, null, 2));

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
    fieldIndex: number,
    subFieldIndex?: any,
    section?: any,
    fieldLabel?: string,
    subField?: string,
    fieldType?: string
  ) => {
    const { name, value, files } = event.target;
    console.log(section);

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setSections((prevSections) => {
          const updatedSections = prevSections.map((sec, mainIndex) => {
            if (mainIndex === index) {
              const updatedSectionTemplate = sec.sectionTemplate.map((secTemplate: any, temIndex: any) => {
                if (temIndex === fieldIndex) {
                  if (subFieldIndex !== undefined && secTemplate.fieldType === "multiple") {
                    secTemplate.multipleData[subFieldIndex][name] = value;
                    const validation = JSON.parse(secTemplate.multipleData[subFieldIndex].validation || "{}");
                    const error = validateField(value, validation, secTemplate.multipleData[subFieldIndex]);
                    setFormData((prevData) => ({
                      ...prevData,
                      templateData: {
                        ...prevData.templateData,
                        [`${index}+${fieldIndex}+${subFieldIndex}`]: {
                          file,
                          preview: reader.result as string,
                          error: error,
                          sectionName: section.sectionSlug,
                          orderId: section.sectionOrder,
                          templateId: index,
                          templateSectionId: temIndex,
                          templateSectionMultipleId: subFieldIndex.toString(),
                          fieldLabel: fieldLabel,
                          subField: subField,
                          fieldType: fieldType
                        },
                      },
                    }));
                  } else {
                    secTemplate[name] = value;
                    const validation = JSON.parse(secTemplate.validation || "{}");
                    const error = validateField(value, validation, secTemplate);
                    setFormData((prevData) => ({
                      ...prevData,
                      templateData: {
                        ...prevData.templateData,
                        [`${index}+${temIndex}`]: {
                          file,
                          preview: reader.result as string,
                          error: error,
                          sectionName: section.sectionSlug,
                          orderId: section.sectionOrder,
                          templateId: index,
                          templateSectionId: temIndex,
                          templateSectionMultipleId: "",
                          fieldLabel: fieldLabel,
                          subField: subField,
                          fieldType: fieldType
                        },
                      },
                    }));
                  }
                }
                return secTemplate;
              });
              return { ...sec, sectionTemplate: updatedSectionTemplate };
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
            const updatedSectionTemplate = sec.sectionTemplate.map((secTemplate: any, temIndex: any) => {
              if (temIndex === fieldIndex) {
                if (subFieldIndex !== undefined && secTemplate.fieldType === "multiple") {
                  secTemplate.multipleData[subFieldIndex][name] = value;
                  const validation = JSON.parse(secTemplate.multipleData[subFieldIndex].validation || "{}");
                  const error = validateField(value, validation, secTemplate.multipleData[subFieldIndex]);
                  setFormData((prevData) => ({
                    ...prevData,
                    templateData: {
                      ...prevData.templateData,
                      [`${index}+${fieldIndex}+${subFieldIndex}`]: {
                        ...prevData.templateData[`${index}+${fieldIndex}+${subFieldIndex}`],
                        [name]: value,
                        error: error,
                        sectionName: section.sectionSlug,
                        orderId: section.sectionOrder,
                        templateId: index,
                        templateSectionId: temIndex,
                        templateSectionMultipleId: subFieldIndex.toString(),
                        fieldLabel: fieldLabel,
                        subField: subField,
                        fieldType: fieldType
                      },
                    },
                  }));
                  return {
                    ...secTemplate,
                    multipleData: secTemplate.multipleData.map((data: any, idx: any) => {
                      if (idx === subFieldIndex) {
                        return { ...data, error };
                      }
                      return data;
                    }),
                  };
                } else {
                  secTemplate[name] = value;
                  const validation = JSON.parse(secTemplate.validation || "{}");
                  const error = validateField(value, validation, secTemplate);
                  setFormData((prevData) => ({
                    ...prevData,
                    templateData: {
                      ...prevData.templateData,
                      [`${index}+${temIndex}`]: {
                        ...prevData.templateData[`${index}+${temIndex}`],
                        [name]: value,
                        error: error,
                        sectionName: section.sectionSlug,
                        orderId: section.sectionOrder,
                        templateId: index,
                        templateSectionId: temIndex,
                        templateSectionMultipleId: "",
                        fieldLabel: fieldLabel,
                        subField: subField,
                        fieldType: fieldType
                      },
                    },
                  }));
                  return {
                    ...secTemplate,
                    error,
                  };
                }
              }
              return secTemplate;
            });
            return {
              ...sec,
              sectionTemplate: updatedSectionTemplate,
            };
          }
          return sec;
        });
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

  const handleRemoveFile = (sectionIndex: number, fieldIndex: number, subFieldIndex?: number) => {
    setFormData((prevData) => {
      const updatedTemplateData = { ...prevData.templateData };
      if (subFieldIndex) {
        delete updatedTemplateData[`${sectionIndex}+${fieldIndex}+${subFieldIndex}`];
      } else {
        delete updatedTemplateData[`${sectionIndex}+${fieldIndex}`];
      }


      return {
        ...prevData,
        templateData: updatedTemplateData,
      };
    });
  }



  const handleAddDuplicateForm = (index: number, fieldIndex: number) => {
    // Logic to duplicate the entire multiple form section
    // Example implementation:
    const newSectionTemplate = [...sections[index].sectionTemplate];
    const duplicateField = { ...newSectionTemplate[fieldIndex] };
    newSectionTemplate.push({ ...duplicateField });
    setSections((prevSections) => {
      const updatedSections = [...prevSections];
      updatedSections[index].sectionTemplate = newSectionTemplate;
      return updatedSections;
    });
  };

  const handleRemoveDuplicateForm = (index: number, fieldIndex: number) => {
    // Logic to remove the last duplicate multiple form section
    // Example implementation:
    const newSectionTemplate = [...sections[index].sectionTemplate];
    if (newSectionTemplate.length > 1) {
      newSectionTemplate.splice(fieldIndex, 1);
      setSections((prevSections) => {
        const updatedSections = [...prevSections];
        updatedSections[index].sectionTemplate = newSectionTemplate;
        return updatedSections;
      });
    }
  };

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
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
                    multiline
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
                    multiline
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
                <Grid item xs={12} sm={12}>
                  {sections.map((section, index) => (
                    <Card key={index} variant="outlined" style={{ marginBottom: '10px' }}>
                      <CardContent>
                        <Typography variant="h5">{section.sectionName}</Typography>
                        {section.sectionTemplate.map((field: any, fieldIndex: number) => (
                          <Grid container key={`${index}+${fieldIndex}`} spacing={2}>


                            {field.fieldType === "file" ? (
                              <>
                                <Grid item xs={12} sm={12}>
                                  <CustomTextField
                                    label={field.isRequired ? `${field.fieldLabel} *` : field.fieldLabel}
                                    name={field.fieldType}
                                    type="file"
                                    fullWidth
                                    margin="normal"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                      handleInputChange(
                                        e,
                                        section.sectionId,
                                        index,
                                        fieldIndex,
                                        null,
                                        section,
                                        field.fieldLabel, '', field.fieldType)
                                    }
                                    //@ts-ignore
                                    error={
                                      field.error && field.error
                                    }
                                    helperText={field.error && field.error}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  {formData.templateData && formData.templateData[`${index}+${fieldIndex}`]?.preview && (
                                    <Box mt={2} display="flex" flexDirection="column" alignItems="end">
                                      <IconButton
                                        size="large"
                                        onClick={() => handleRemoveFile(index, fieldIndex)}
                                        aria-label="minus"
                                        color="error"
                                        style={{ marginBottom: "8px" }}
                                      >
                                        <i className="tabler-minus" />
                                      </IconButton>
                                      <Box
                                        component="img"
                                        src={formData.templateData[`${index}+${fieldIndex}`]?.preview}
                                        alt="Preview"
                                        sx={{
                                          width: "100%",
                                          maxHeight: "200px",
                                          objectFit: "contain",
                                          borderRadius: "4px",
                                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Grid>
                              </>
                            ) :

                              field.fieldType === 'multiple' ? (
                                <Grid item xs={12} style={{ marginBottom: '10px' }}>
                                  <Card variant="outlined">
                                    <CardActions>
                                      <Grid container xs={12} sm={12} spacing={2}>
                                        <Grid item xs={10}>
                                          <Typography variant="h6" component="div">
                                            {field.fieldLabel}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={1}>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleAddDuplicateForm(index, fieldIndex)
                                            }
                                            aria-label="plus"
                                            color="success"
                                          >
                                            <i className="tabler-plus" />
                                          </IconButton>
                                        </Grid>
                                        <Grid item xs={1}>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleRemoveDuplicateForm(index, fieldIndex)
                                            }
                                            aria-label="minus"
                                            color="error"
                                          >
                                            <i className="tabler-minus" />
                                          </IconButton>
                                        </Grid>
                                      </Grid>
                                    </CardActions>
                                    <CardContent>
                                      {
                                        field.multipleData?.map(
                                          (subField: any, subFieldIndex: number) => (
                                            <Grid
                                              container
                                              key={`${index}+${fieldIndex}+${subFieldIndex}`}
                                              spacing={2}
                                              item
                                              xs={12}
                                              sm={12}
                                            >
                                              {subField.fieldType === 'file' ? (
                                                <>
                                                  <CustomTextField
                                                    label={
                                                      subField.isRequired
                                                        ? `${subField.fieldLabel} *`
                                                        : subField.fieldLabel
                                                    }
                                                    name={subField.fieldType}
                                                    type="file"
                                                    fullWidth
                                                    margin="normal"
                                                    onChange={(e: any) =>
                                                      handleInputChange(
                                                        e,
                                                        section.sectionId,
                                                        index,
                                                        fieldIndex,
                                                        subFieldIndex,
                                                        section,
                                                        field.fieldLabel,
                                                        subField.fieldLabel,
                                                        subField.fieldType
                                                      )
                                                    }
                                                    error={subField.error && subField.error}
                                                    helperText={subField.error && subField.error}
                                                    InputLabelProps={{ shrink: true }}
                                                  />
                                                  {formData.templateData &&
                                                    formData.templateData[
                                                      `${index}+${fieldIndex}+${subFieldIndex}`
                                                    ]?.preview && (
                                                      <Box
                                                        mt={2}
                                                        display="flex"
                                                        flexDirection="column"
                                                        alignItems="end"
                                                      >
                                                        <IconButton
                                                          size="large"
                                                          onClick={() =>
                                                            handleRemoveFile(
                                                              index,
                                                              fieldIndex,
                                                              subFieldIndex
                                                            )
                                                          }
                                                          aria-label="minus"
                                                          color="error"
                                                          style={{ marginBottom: '8px' }}
                                                        >
                                                          <i className="tabler-minus" />
                                                        </IconButton>
                                                        <Box
                                                          component="img"
                                                          src={
                                                            formData.templateData[
                                                              `${index}+${fieldIndex}+${subFieldIndex}`
                                                            ]?.preview
                                                          }
                                                          alt="Preview"
                                                          sx={{
                                                            width: '100%',
                                                            maxHeight: '200px',
                                                            objectFit: 'contain',
                                                            borderRadius: '4px',
                                                            boxShadow:
                                                              '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                          }}
                                                        />
                                                      </Box>
                                                    )}
                                                </>
                                              ) : (
                                                <CustomTextField
                                                  label={
                                                    subField.isRequired
                                                      ? `${subField.fieldLabel} *`
                                                      : subField.fieldLabel
                                                  }
                                                  type={subField.fieldType}
                                                  name={subField.fieldType}
                                                  onChange={(e: any) =>
                                                    handleInputChange(
                                                      e,
                                                      section.sectionId,
                                                      index,
                                                      fieldIndex,
                                                      subFieldIndex,
                                                      section,
                                                      field.fieldLabel,
                                                      subField.fieldLabel,
                                                      subField.fieldType
                                                    )
                                                  }
                                                  fullWidth
                                                  margin="normal"
                                                  error={subField.error && subField.error}
                                                  helperText={subField.error && subField.error}
                                                  inputProps={
                                                    subField.validation
                                                      ? JSON.parse(subField.validation)
                                                      : {}
                                                  }
                                                  value={
                                                    formData.templateData?.[
                                                    `${index}+${fieldIndex}+${subFieldIndex}`
                                                    ]?.[subField.fieldType] || ''
                                                  }
                                                />
                                              )}
                                            </Grid>
                                          )
                                        )
                                      }
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )
                                : (
                                  <Grid item xs={12} sm={12}>
                                    <CustomTextField
                                      label={field.isRequired ? `${field.fieldLabel} *` : field.fieldLabel}
                                      type={field.fieldType}
                                      name={field.fieldType}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleInputChange(e,
                                          section.sectionId,
                                          index,
                                          fieldIndex,
                                          null,
                                          section,
                                          field.fieldLabel, '', field.fieldType)
                                      }
                                      fullWidth
                                      margin="normal"
                                      //@ts-ignore
                                      error={field.error &&
                                        field.error}
                                      //@ts-ignore
                                      helperText={field.error &&
                                        field.error}
                                      inputProps={field.validation ? JSON.parse(field.validation) : {}}
                                      value={
                                        formData.templateData?.[`${index}+${fieldIndex}`]?.[field.fieldType] || ""
                                      }
                                    />
                                  </Grid>
                                )}
                          </Grid>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </Grid>
              </Grid>
            </Box>
          </form>
        </div>
      </Card>
      <Grid
        item
        xs={12}
        style={{ position: "sticky", bottom: 0, zIndex: 10 }}
      >
        <Box
          p={5}
          display="flex"
          gap={2}
          justifyContent="end"
          bgcolor="background.paper"
        >
          <Button variant="contained" size="small" color="error" type="reset" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="warning" variant="contained" size="small" type="submit" onClick={(event) => {
            setPDStatus(false);
            handleSubmit(event);
          }}>
            Save as Draft
          </Button>
          <Button variant="contained" type="submit" size="small" onClick={(event) => {
            setPDStatus(true);
            handleSubmit(event);
          }}>
            Save & Publish
          </Button>
        </Box>
      </Grid>
    </>
  );
}

export default PagesForm;