import LoadingBackdrop from "@/components/LoadingBackdrop";
import {
  Button,
  Box,
  Card,
  Grid,
  MenuItem,
  Typography,
  CardContent,
  CardActions,
  ButtonGroup,
  Tooltip,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { get, post } from "@/services/apiService";
import { template } from "@/services/endpoint/template";
import CustomTextField from "@/@core/components/mui/TextField";
import { PagesType } from "./pagesType";
import { pages } from "@/services/endpoint/pages";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";

const initialFormData = {
  pageId: "",
  templateId: -1,
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  templateData: {} as Record<string, any>,
  sectionData: {} as Record<string, any>,
  sections: [
    {
      sectionName: "Section 1",
      sectionTemplate: [
        {
          fieldLabel: "Field 1",
          fieldType: "multiple",
          isRequired: true,
          validation: "{}",
          multipleData: [
            {
              fieldType: "text",
              fieldLabel: "Subfield 1",
              isRequired: true,
              validation: "{}",
            },
          ],
        },
      ],
    },
  ],
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
};
type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: PagesType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<PagesType | null>>;
};
function PagesForm({ open, handleClose, editingRow, setEditingRow }: Props) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false);

  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData);
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);
  const [templateList, setTemplateList] = useState<
    { templateName: string; templateId: number }[]
  >([]);
  const [sections, setSections] = useState<any[]>([]);
  const [templateValue, setTemplateValues] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (editingRow) {
      setLoading(true);
      setFormData(editingRow);
      getTemplateIdWiseForm(editingRow.templateId);
      setTemplateValues(editingRow?.templateData);
    } else {
      setFormData(initialFormData);
      setLoading(false);
    }
  }, [editingRow]);

  useEffect(() => {
    setLoading(true);
    async function getTemplate() {
      await getActiveTemplateList();
      setLoading(false);
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
      setSections(result.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const validateField = (value: string, validation: any, field?: any) => {
    if (!value && field?.isRequired) {
      return `${field?.fieldLabel} is required`;
    }
    if (field?.fieldType == "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `Invalid email format`;
      }
    }

    if (field?.fieldType === "file") {
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      const extendedUrlRegex = /^(https?|ftp):\/\/[^\s/$.?#].*[^\s]*\.[^\s]*$/i;
      if (!urlRegex.test(value) && !extendedUrlRegex.test(value)) {
        return `Invalid URL format`;
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
      if (
        validation.min !== undefined &&
        parseFloat(value) < parseFloat(validation.min)
      ) {
        return `Minimum value is ${validation.min}`;
      }
      if (
        validation.max !== undefined &&
        parseFloat(value) > parseFloat(validation.max)
      ) {
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
    const slugRegex = /^[a-zA-Z0-9/-]+$/;
    if (formData.templateId === -1) {
      errors.templateId = "Please select a template";
      valid = false;
    }
    if (!formData.title) {
      errors.title = "Title is required";
      valid = false;
    }

    if (formData.slug.trim().length === 0) {
      errors.slug = "Slug is required";
      valid = false;
    } else if (!slugRegex.test(formData.slug)) {
      errors.slug =
        "Slug must be alphanumeric with no spaces or special characters.";
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

    //validate template Values Data
    // let sectionsKeysList = new Set(Object.keys(sections).map(
    //   (key: any) => sections[key]?.uniqueSectionName
    // ));

    // sectionsKeysList.forEach((secKey:any)=>{

    // })

    setSections(updatedSections);
    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (event: React.FormEvent, pdStatus: boolean) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const formattedData: any[] = [];

        // for frontned api key
        Object.keys(sections).forEach((key: any) => {
          let uniqueSection = sections[key]?.uniqueSectionName;
          const lastUnderscoreIndex = uniqueSection.lastIndexOf("_");
          let secName = uniqueSection.slice(0, lastUnderscoreIndex);
          let templateSectionValue = {
            [secName]: templateValue[uniqueSection],
          };
          formattedData.push(templateSectionValue);
        });

        //remove unwanted data from templateData
        let sectionsKeysList = new Set(
          Object.keys(sections).map(
            (key: any) => sections[key]?.uniqueSectionName
          )
        );

        const filteredTemplateValueData = Object.keys(templateValue)
          .filter((key) => sectionsKeysList.has(key))
          .reduce((obj: any, key: any) => {
            obj[key] = templateValue[key];
            return obj;
          }, {});

        const endpoint = editingRow ? pages.update : pages.create;
        const result = await post(endpoint, {
          ...formData,
          pageId: editingRow ? formData.pageId : undefined,
          templateData: filteredTemplateValueData,
          formatData: formattedData,
          sectionData: sections,
          active: pdStatus,
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
    uniqueSectionName: string,
    fekey: string
  ) => {
    const { name, value, files } = event.target;

    // Handling non-file input changes
    setTemplateValues((prev: any) => {
      return {
        ...prev,
        [uniqueSectionName]: {
          ...(prev?.[uniqueSectionName] || {}), // Safely check if the section exists, create an empty object if not
          [fekey]: value, // Set the fekey inside the section
        },
      };
    });

    // setTemplateValues((prev: any) => {
    //   return {
    //     ...prev,
    //     [uniqueSectionName]: {
    //       ...(prev?.[uniqueSectionName] || {}), // Ensure the section exists
    //       [fekey]: {
    //         ...prev?.[uniqueSectionName]?.[fekey], // Ensure the fekey exists
    //         multiple: [
    //           ...(prev?.[uniqueSectionName]?.[fekey]?.multiple || []), // Safely handle the array
    //           { key: value }, // Insert the new object into the array
    //         ],
    //       },
    //     },
    //   };
    // });
  };

  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormErrors({ ...formErrors, title: "" });
    setFormData((prevData) => ({
      ...prevData,
      title: newName,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    const slugRegex = /^[a-zA-Z0-9/-]+$/;

    if (!slugRegex.test(newSlug)) {
      setFormErrors({
        ...formErrors,
        slug: "Slug must be alphanumeric with no spaces, or underscores.",
      });
    } else {
      setFormErrors({ ...formErrors, slug: "" });
    }

    setFormData((prevData) => ({
      ...prevData,
      slug: newSlug,
    }));
    setIsSlugManuallyEdited(true);
  };

  function handleAddDuplicateForm(
    sectionName: any,
    feKey: any,
    index: number,
    field: any
  ) {
    let duplicateData: any = {};
    field.multipleData?.forEach((value: any) => {
      duplicateData[value?.fekey] = "";
    });

    // Update the state
    setTemplateValues((prev: any) => {
      const currentMultiple = prev?.[sectionName]?.[feKey] || [];

      currentMultiple?.splice(index, 0, duplicateData);

      return {
        ...prev,
        [sectionName]: {
          ...(prev?.[sectionName] || {}),
          [feKey]: currentMultiple,
        },
      };
    });
  }



  function handleRemoveDuplicateForm(
    sectionName: any,
    feKey: any,
    index: number  ) {
      setTemplateValues((prev: any) => {
        const currentMultiple = prev?.[sectionName]?.[feKey] || [];
  
        currentMultiple?.splice(index, 1);
  
        return {
          ...prev,
          [sectionName]: {
            ...(prev?.[sectionName] || {}),
            [feKey]: currentMultiple,
          },
        };
      });
    }
    console.log("updaed value", templateValue);
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div>
          <form
            className="flex flex-col gap-6 p-6" // onSubmit={handleSubmit}
          >
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
                    // disabled={open === sectionActions.EDIT}
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
                    <Card
                      key={section.uniqueSectionName || index}
                      variant="outlined"
                      style={{ marginBottom: "10px" }}
                    >
                      <CardContent>
                        <Typography variant="h5">
                          {section.sectionName}
                        </Typography>
                        {section.sectionTemplate.map(
                          (field: any, fieldIndex: number) => (
                            <Grid
                              container
                              key={`${section.uniqueSectionName}+${field.fekey}`}
                              spacing={2}
                            >
                              {field.fieldType === "multiple" && (
                                <Grid
                                  item
                                  xs={12}
                                  style={{ marginBottom: "10px" }}
                                >
                                  <Card variant="outlined">
                                    <CardActions>
                                      <Grid
                                        container
                                        xs={12}
                                        sm={12}
                                        spacing={2}
                                      >
                                        <Grid item xs={10}>
                                          <Typography
                                            variant="h6"
                                            component="div"
                                          >
                                            {field.fieldLabel}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                          <ButtonGroup
                                            variant="tonal"
                                            size="small"
                                          >
                                            <Tooltip
                                              title={`Add ${field.fieldLabel}`}
                                            >
                                              <Button
                                                size="small"
                                                onClick={() =>
                                                  handleAddDuplicateForm(
                                                    section.uniqueSectionName,
                                                    field.fekey,
                                                    index,
                                                    field
                                                  )
                                                }
                                              >
                                                <i className="tabler-plus" />
                                              </Button>
                                            </Tooltip>

                                            <Tooltip
                                              title={`Remove ${field.fieldLabel}`}
                                            >
                                              <Button
                                                size="small"
                                                onClick={() =>
                                                  handleRemoveDuplicateForm(
                                                    section.uniqueSectionName,
                                                    field.fekey,
                                                    index
                                                  )
                                                }
                                              >
                                                <i className="tabler-minus" />
                                              </Button>
                                            </Tooltip>
                                          </ButtonGroup>
                                        </Grid>
                                      </Grid>
                                    </CardActions>
                                    <CardContent>
                                      {field.multipleData?.map(
                                        (
                                          subField: any,
                                          subFieldIndex: number
                                        ) => (
                                          <Grid
                                            container
                                            key={`${index}+${fieldIndex}+${subFieldIndex}`}
                                            spacing={2}
                                            item
                                            xs={12}
                                            sm={12}
                                          >
                                            {
                                              <CustomTextField
                                                multiline
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
                                                    index
                                                  )
                                                }
                                                fullWidth
                                                margin="normal"
                                                error={
                                                  subField.error &&
                                                  subField.error
                                                }
                                                helperText={
                                                  subField.error &&
                                                  subField.error
                                                }
                                                inputProps={
                                                  subField.validation
                                                    ? JSON.parse(
                                                        subField.validation
                                                      )
                                                    : {}
                                                }
                                                value={
                                                  formData.templateData?.[
                                                    `${index}+${fieldIndex}+${subFieldIndex}`
                                                  ]?.[subField.fieldType] || ""
                                                }
                                              />
                                            }
                                          </Grid>
                                        )
                                      )}
                                    </CardContent>
                                  </Card>
                                </Grid>
                              )}

                              {field.fieldType !== "multiple" && (
                                <Grid item xs={12} sm={12}>
                                  <CustomTextField
                                    multiline
                                    label={
                                      field.isRequired
                                        ? `${field.fieldLabel} *`
                                        : field.fieldLabel
                                    }
                                    type={field.fieldType}
                                    name={field.fieldType}
                                    onChange={(
                                      e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                      handleInputChange(
                                        e,
                                        section.uniqueSectionName,
                                        field.fekey
                                      )
                                    }
                                    fullWidth
                                    margin="normal"
                                    //@ts-ignore
                                    error={field.error && field.error}
                                    //@ts-ignore
                                    helperText={field.error && field.error}
                                    inputProps={
                                      field.validation
                                        ? JSON.parse(field.validation)
                                        : {}
                                    }
                                    value={
                                      templateValue?.[
                                        section.uniqueSectionName
                                      ]?.[field.fekey] || ""
                                    }
                                  />
                                </Grid>
                              )}
                            </Grid>
                          )
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Grid>
              </Grid>
            </Box>
          </form>
        </div>
      </Card>
      <Grid item xs={12} style={{ position: "sticky", bottom: 0, zIndex: 10 }}>
        <Box
          p={5}
          display="flex"
          gap={2}
          justifyContent="end"
          bgcolor="background.paper"
        >
          <Button
            variant="contained"
            size="small"
            color="error"
            type="reset"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            variant="contained"
            size="small"
            type="submit"
            onClick={(event) => {
              handleSubmit(event, false);
            }}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            type="submit"
            size="small"
            onClick={(event) => {
              handleSubmit(event, true);
            }}
          >
            Save & Publish
          </Button>
        </Box>
      </Grid>
    </>
  );
}
export default PagesForm;
