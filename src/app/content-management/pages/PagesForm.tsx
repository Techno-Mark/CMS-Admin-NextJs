import LoadingBackdrop from "@/components/LoadingBackdrop"
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
  IconButton
} from "@mui/material"
import React, { ChangeEvent, useEffect, useState } from "react"
import { get, post } from "@/services/apiService"
import { template } from "@/services/endpoint/template"
import CustomTextField from "@/@core/components/mui/TextField"
import { PagesType } from "./pagesType"
import { pages } from "@/services/endpoint/pages"
import { toast } from "react-toastify"
import BreadCrumbList from "@/components/BreadCrumbList"

const initialFormData = {
  pageId: "",
  templateId: -1,
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  robots: "",
  canonical: "",
  schema: "",
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
              validation: "{}"
            }
          ]
        }
      ]
    }
  ]
}
const initialErrorData = {
  templateId: "",
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  robots: "",
  canonical: "",
  schema: "",
  templateData: {} as Record<string, any>
}
type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: PagesType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<PagesType | null>>;
  permissionUser: Boolean
};
function PagesForm({ open, handleClose, editingRow, setEditingRow, permissionUser }: Props) {
  const [setIsSlugManuallyEdited] =
    useState<boolean>(false)

  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData)
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData)
  const [templateList, setTemplateList] = useState<
    { templateName: string; templateId: number }[]
  >([])
  const [sections, setSections] = useState<any[]>([])
  const [templateValue, setTemplateValues] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (editingRow) {
      setLoading(true)
      setFormData(editingRow)
      getTemplateIdWiseForm(editingRow.templateId)
      setTemplateValues(editingRow?.templateData)
    } else {
      setFormData(initialFormData)
      setLoading(false)
    }
  }, [editingRow])

  useEffect(() => {
    setLoading(true)
    async function getTemplate() {
      await getActiveTemplateList()
      setLoading(false)
    }
    getTemplate()
  }, [])
  const getActiveTemplateList = async () => {
    try {
      setLoading(true)
      const result = await post(`${template.active}`, {})
      const { data } = result
      setTemplateList(data.templates)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }
  const getTemplateIdWiseForm = async (templateId: number) => {
    setLoading(true)
    try {
      const result = await get(
        `${template.getTemplateSectionsById}/${templateId}`
      )
      setSections(result.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
    const slugRegex = /^[a-zA-Z0-9/-]+$/

    if (!slugRegex.test(newSlug)) {
      setFormErrors({
        ...formErrors,
        slug: "Slug must be alphanumeric with no spaces, or underscores."
      })
    } else {
      setFormErrors({ ...formErrors, slug: "" })
    }

    setFormData((prevData) => ({
      ...prevData,
      slug: newSlug
    }))
    setIsSlugManuallyEdited(true)
  }
  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFormErrors({ ...formErrors, title: "" })
    setFormData((prevData) => ({
      ...prevData,
      title: newName
    }))
  }

  // validate form and submit
  // const validateField = (value: string, validation: any, field?: any) => {
  //   if (!value && field?.isRequired) {
  //     return `${field?.fieldLabel} is required`
  //   }
  //   if (field?.fieldType == "email") {
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  //     if (!emailRegex.test(value)) {
  //       return `Invalid email format`
  //     }
  //   }

  //   if (field?.fieldType === "file") {
  //     const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
  //     const extendedUrlRegex = /^(https?|ftp):\/\/[^\s/$.?#].*[^\s]*\.[^\s]*$/i
  //     if (!urlRegex.test(value) && !extendedUrlRegex.test(value)) {
  //       return `Invalid URL format`
  //     }
  //   }

  //   if (validation.maxLength && value.length > validation.maxLength) {
  //     return `Maximum length is ${validation.maxLength}`
  //   }
  //   if (validation.minLength && value.length < validation.minLength) {
  //     return `Minimum length is ${validation.minLength}`
  //   }
  //   if (validation.min !== undefined && validation.max !== undefined) {
  //     if (parseFloat(value) > parseFloat(validation.max)) {
  //       return `Maximum value is ${validation.max}`
  //     }
  //     if (parseFloat(value) < parseFloat(validation.min)) {
  //       return `Minimum value is ${validation.min}`
  //     }
  //   } else {
  //     if (
  //       validation.min !== undefined &&
  //       parseFloat(value) < parseFloat(validation.min)
  //     ) {
  //       return `Minimum value is ${validation.min}`
  //     }
  //     if (
  //       validation.max !== undefined &&
  //       parseFloat(value) > parseFloat(validation.max)
  //     ) {
  //       return `Maximum value is ${validation.max}`
  //     }
  //   }
  //   if (validation.pattern) {
  //     const patternRegex = new RegExp(validation.pattern)
  //     if (!patternRegex.test(value)) {
  //       return `Value does not match the required pattern`
  //     }
  //   }
  //   return ""
  // }

  const validateForm = () => {
    let valid = true
    const errors = { ...initialErrorData }
    const updatedSections = [...sections]
    const slugRegex = /^[a-zA-Z0-9/-]+$/
    if (formData.templateId === -1) {
      errors.templateId = "Please select a template"
      valid = false
    }
    if (!formData.title) {
      errors.title = "Title is required"
      valid = false
    }

    if (formData.slug.trim().length === 0) {
      errors.slug = "Slug is required"
      valid = false
    } else if (!slugRegex.test(formData.slug)) {
      errors.slug =
        "Slug must be alphanumeric with no spaces or special characters."
      valid = false
    }
    if (!formData.content) {
      errors.content = "Content is required"
      valid = false
    }
    if (!formData.metaTitle) {
      errors.metaTitle = "Meta Title is required"
      valid = false
    }
    if (!formData.metaDescription) {
      errors.metaDescription = "Meta Description is required"
      valid = false
    }
    if (!formData.metaKeywords) {
      errors.metaKeywords = "Meta Keywords are required"
      valid = false
    }
    if (formData.canonical && formData.canonical.length > 2000) {
      errors.canonical =
        "canonical field exceeds the maximum length of 2000 characters."
      valid = false
    }
    if (formData.robots && formData.robots.length > 2000) {
      errors.robots =
        "robots field exceeds the maximum length of 2000 characters."
      valid = false
    }

    // Loop through sections to validate each field
    sections.forEach((section) => {
      section.sectionTemplate.forEach((field: any) => {
        const fieldKey = field.fekey
        const fieldLabel = field.fieldLabel

        // Handle validation for regular fields
        if (field.fieldType !== "multiple") {
          const value = templateValue?.[section.uniqueSectionName]?.[fieldKey]
          if (field.isRequired && (!value || value.trim() === "")) {
            valid = false
            // @ts-ignore
            errors[section.uniqueSectionName] = {
              // @ts-ignore
              ...(errors[section.uniqueSectionName] || {}),
              [fieldKey]: `${fieldLabel} is required.`
            }
          }
        }

        // Handle validation for multiple fields
        if (field.fieldType === "multiple") {
          const multipleEntries = templateValue?.[section.uniqueSectionName]?.[fieldKey]
          if (Array.isArray(multipleEntries)) {
            multipleEntries.forEach((entry: any, entryIndex: number) => {
              field.multipleData.forEach((subField: any) => {
                const subFieldKey = subField.fekey
                const subFieldLabel = subField.fieldLabel
                const subFieldValue = entry[subFieldKey]

                if (subField.isRequired && (!subFieldValue || subFieldValue.trim() === "")) {
                  valid = false
                  // @ts-ignore
                  errors[section.uniqueSectionName] = {
                    // @ts-ignore
                    ...(errors[section.uniqueSectionName] || {}),
                    [fieldKey]: {
                      // @ts-ignore
                      ...(errors[section.uniqueSectionName]?.[fieldKey] || {}),
                      [entryIndex]: {
                        // @ts-ignore
                        ...(errors[section.uniqueSectionName]?.[fieldKey]?.[entryIndex] || {}),
                        [subFieldKey]: `${subFieldLabel} is required.`
                      }
                    }
                  }
                }
              })
            })
          }
        }
      })
    })

    setSections(updatedSections)
    setFormErrors(errors)
    return valid
  }
  const handleSubmit = async (event: React.FormEvent, pdStatus: boolean) => {
    event.preventDefault()
    if (validateForm()) {
      try {
        setLoading(true)
        const formattedData: any[] = []

        Object.keys(sections).forEach((key: any) => {
          const uniqueSection = sections[key]?.uniqueSectionName
          const lastUnderscoreIndex = uniqueSection.lastIndexOf("_")

          if (lastUnderscoreIndex !== -1) {
            const secName = uniqueSection.slice(0, lastUnderscoreIndex)
            const templateSectionValue = {
              [secName]: templateValue[uniqueSection]
            }
            formattedData.push(templateSectionValue)
          }
        })

        // remove unwanted data from templateData
        const sectionsKeysList = new Set(
          Object.keys(sections).map(
            (key: any) => sections[key]?.uniqueSectionName
          )
        )

        const filteredTemplateValueData = Object.keys(templateValue)
          .filter((key) => sectionsKeysList.has(key))
          .reduce((obj: any, key: any) => {
            obj[key] = templateValue[key]
            return obj
          }, {})

        const endpoint = editingRow ? pages.update : pages.create
        const result = await post(endpoint, {
          ...formData,
          pageId: editingRow ? formData.pageId : undefined,
          templateData: filteredTemplateValueData,
          formatData: formattedData,
          sectionData: sections,
          active: pdStatus
        })
        toast.success(result.message)
        handleClose()
        setFormData(result)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }
  }
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    uniqueSectionName: string,
    fekey: string,
    multipleIndex = -1,
    multiFeKey = ""
  ) => {
    const { value } = event.target

    // Handle input change for multiple fields
    if (multipleIndex !== -1) {
      // Update template values for multiple fields
      setTemplateValues((prev: any) => {
        const currentMultiple = [...(prev?.[uniqueSectionName]?.[fekey] || [])]

        // Ensure the multiple field structure exists
        if (!currentMultiple[multipleIndex]) {
          currentMultiple[multipleIndex] = {}
        }

        currentMultiple[multipleIndex][multiFeKey] = value

        return {
          ...prev,
          [uniqueSectionName]: {
            ...(prev?.[uniqueSectionName] || {}),
            [fekey]: currentMultiple
          }
        }
      })
    } else {
      // Handle input change for single fields
      setTemplateValues((prev: any) => ({
        ...prev,
        [uniqueSectionName]: {
          ...(prev?.[uniqueSectionName] || {}),
          [fekey]: value
        }
      }))
    }

    // Validation logic
    const section = sections.find(
      (sec) => sec.uniqueSectionName === uniqueSectionName
    )
    const field = section?.sectionTemplate.find(
      (fld: any) => fld.fekey === fekey
    )

    if (multipleIndex !== -1) {
      const subField = field?.multipleData?.find(
        (sub: any) => sub.fekey === multiFeKey
      )

      if (subField?.isRequired && (!value || value.trim() === "")) {
        setFormErrors((prev) => ({
          ...prev,
          [uniqueSectionName]: {
            // @ts-ignore
            ...(prev[uniqueSectionName] || {}),
            [`${fekey}-${multipleIndex}-${multiFeKey}`]: `${subField.fieldLabel} is required`
          }
        }))
      } else {
        setFormErrors((prev) => {
          const updatedErrors = { ...prev }
          // @ts-ignore
          delete updatedErrors[uniqueSectionName]?.[
            `${fekey}-${multipleIndex}-${multiFeKey}`
          ]
          // @ts-ignore
          if (!Object.keys(updatedErrors[uniqueSectionName] || {}).length) {
            // @ts-ignore
            delete updatedErrors[uniqueSectionName]
          }

          return updatedErrors
        })
      }
    } else {
      if (field?.isRequired && (!value || value.trim() === "")) {
        setFormErrors((prev) => ({
          ...prev,
          // @ts-ignore
          [uniqueSectionName]: {
            // @ts-ignore
            ...(prev[uniqueSectionName] || {}),
            [fekey]: `${field.fieldLabel} is required`
          }
        }))
      } else {
        setFormErrors((prev) => {
          const updatedErrors = { ...prev } // @ts-ignore
          delete updatedErrors[uniqueSectionName]?.[fekey]
          // @ts-ignore
          if (!Object.keys(updatedErrors[uniqueSectionName] || {}).length) {
            // @ts-ignore
            delete updatedErrors[uniqueSectionName]
          }

          return updatedErrors
        })
      }
    }
  }
  // const handleInputChange = (
  //   event: ChangeEvent<HTMLInputElement>,
  //   uniqueSectionName: string,
  //   fekey: string,
  //   multipleIndex = -1,
  //   multiFeKey = ""
  // ) => {
  //   const { name, value, files } = event.target;

  //   if (multipleIndex !== -1) {
  //     setTemplateValues((prev: any) => {
  //       const currentMultiple = [...prev?.[uniqueSectionName]?.[fekey]];
  //       currentMultiple[multipleIndex][multiFeKey] = value;

  //       return {
  //         ...prev,
  //         [uniqueSectionName]: {
  //           ...(prev?.[uniqueSectionName] || {}),
  //           [fekey]: currentMultiple,
  //         },
  //       };
  //     });
  //     return;
  //   }
  //   // Handling non-file input changes
  //   setTemplateValues((prev: any) => {
  //     return {
  //       ...prev,
  //       [uniqueSectionName]: {
  //         ...(prev?.[uniqueSectionName] || {}),
  //         [fekey]: value,
  //       },
  //     };
  //   });
  // };
  function handleAddDuplicateForm(
    sectionName: any,
    feKey: any,
    index: number,
    field: any
  ) {
    const duplicateData: any = {}
    field.multipleData?.forEach((value: any) => {
      duplicateData[value?.fekey] = ""
    })

    setTemplateValues((prev: any) => {
      const currentMultiple = prev?.[sectionName]?.[feKey] || []
      currentMultiple?.splice(index, 0, duplicateData)
      return {
        ...prev,
        [sectionName]: {
          ...(prev?.[sectionName] || {}),
          [feKey]: currentMultiple
        }
      }
    })
  }
  function handleRemoveDuplicateForm(
    sectionName: any,
    feKey: any,
    index: number
  ) {
    setTemplateValues((prev: any) => {
      const currentMultiple = prev?.[sectionName]?.[feKey] || []

      currentMultiple?.splice(index, 1)

      return {
        ...prev,
        [sectionName]: {
          ...(prev?.[sectionName] || {}),
          [feKey]: currentMultiple
        }
      }
    })
  }

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
                      setFormData({ ...formData, content: e.target.value })
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, content: "" })
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
                      setFormData({ ...formData, metaTitle: e.target.value })
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaTitle: "" })
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
                        metaDescription: e.target.value
                      })
                      if (e.target?.value?.length) {
                        setFormErrors({
                          ...formErrors,
                          metaDescription: ""
                        })
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
                        metaKeywords: e.target.value
                      })
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaKeywords: "" })
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    multiline
                    minRows={3}
                    error={!!formErrors.robots}
                    helperText={formErrors.robots}
                    label="robots (maximum-character: 2000 )"
                    fullWidth
                    placeholder=""
                    value={formData.robots}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        robots: e.target.value
                      })
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, robots: "" })
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    multiline
                    minRows={3}
                    error={!!formErrors.canonical}
                    helperText={formErrors.canonical}
                    label="Canonical (maximum-character: 2000 )"
                    fullWidth
                    placeholder=""
                    value={formData.canonical}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        canonical: e.target.value
                      })
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, canonical: "" })
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    multiline
                    minRows={7}
                    maxRows={12}
                    error={!!formErrors.schema}
                    helperText={formErrors.schema}
                    label="Schema"
                    fullWidth
                    placeholder=""
                    value={formData.schema}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        schema: e.target.value
                      })
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, schema: "" })
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
                      const templateId = Number(e.target.value)
                      setFormData({ ...formData, templateId })
                      getTemplateIdWiseForm(templateId)
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
                  {sections.map((section, sectionIndex) => (
                    <Card
                      key={section.uniqueSectionName || sectionIndex}
                      variant="outlined"
                      style={{ marginBottom: "10px" }}
                    >
                      <CardContent>
                        <Typography variant="h5">
                          {section.sectionName}
                          {!section.uniqueSectionName?.includes("_") && (
                            <div className="flex items-center">
                              <Typography variant="h6">
                                Common Static Content Block
                              </Typography>
                              <Tooltip
                                title={`go to static content block data`}
                              >
                                <IconButton
                                  color="info"
                                  onClick={() => {
                                    const redirectURL = `/content-management/static-component/edit/${section.sectionId}`
                                    window.open(redirectURL, "_blank")
                                  }}
                                >
                                  <i className="tabler-external-link text-textSecondary"></i>
                                </IconButton>
                              </Tooltip>
                            </div>
                          )}
                        </Typography>
                        {section.uniqueSectionName?.includes("_") &&
                          section.sectionTemplate.map(
                            (sectionField: any, sectioFieldIndex: number) => (
                              <Grid
                                container
                                key={`${section.uniqueSectionName}+${sectionField.fekey}`}
                                spacing={2}
                              >
                                {sectionField.fieldType === "multiple" && (
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
                                              {sectionField.fieldLabel}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={2}>
                                            <ButtonGroup
                                              variant="tonal"
                                              size="small"
                                            >
                                              <Tooltip
                                                title={`Add new at 1st position`}
                                              >
                                                <Button
                                                  size="small"
                                                  onClick={() =>
                                                    handleAddDuplicateForm(
                                                      section.uniqueSectionName,
                                                      sectionField.fekey,
                                                      0,
                                                      sectionField
                                                    )
                                                  }
                                                >
                                                  <i className="tabler-plus" />
                                                </Button>
                                              </Tooltip>
                                            </ButtonGroup>
                                          </Grid>
                                        </Grid>
                                      </CardActions>

                                      <CardContent>
                                        {templateValue?.[
                                          section.uniqueSectionName
                                        ]?.[sectionField.fekey]?.map(
                                          (
                                            multipleSection: any,
                                            multipleSectionIndex: any
                                          ) => (
                                            <Card
                                              key={`group-${multipleSectionIndex}`}
                                              variant="outlined"
                                              style={{ marginBottom: "16px" }}
                                            >
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
                                                      <b className="text-lg">
                                                        {" "}
                                                        {multipleSectionIndex +
                                                          1}{" "}
                                                      </b>{" "}
                                                      Entry of (
                                                      {section.sectionName +
                                                        " -> " +
                                                        sectionField.fieldLabel}
                                                      )
                                                    </Typography>
                                                  </Grid>
                                                  <Grid item xs={2}>
                                                    <ButtonGroup
                                                      variant="tonal"
                                                      size="small"
                                                    >
                                                      <Tooltip title={`Add`}>
                                                        <Button
                                                          size="small"
                                                          onClick={() =>
                                                            handleAddDuplicateForm(
                                                              section.uniqueSectionName,
                                                              sectionField.fekey,
                                                              multipleSectionIndex +
                                                              1,
                                                              sectionField
                                                            )
                                                          }
                                                        >
                                                          <i className="tabler-plus" />
                                                        </Button>
                                                      </Tooltip>

                                                      <Tooltip title={`Remove`}>
                                                        <Button
                                                          size="small"
                                                          onClick={() =>
                                                            handleRemoveDuplicateForm(
                                                              section.uniqueSectionName,
                                                              sectionField.fekey,
                                                              multipleSectionIndex
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
                                                {sectionField.multipleData?.map(
                                                  (
                                                    subField: any,
                                                    subFieldIndex: number
                                                  ) => (
                                                    <Box
                                                      key={`${section.uniqueSectionName}+${section.fekey}+${subField.fekey}`}
                                                      sx={{ mb: 2 }}
                                                    >
                                                      <Grid
                                                        container
                                                        spacing={2}
                                                        item
                                                        xs={12}
                                                        sm={12}
                                                      >
                                                        <CustomTextField
                                                          multiline
                                                          label={
                                                            subField.isRequired ? `${subField.fieldLabel} *` : subField.fieldLabel
                                                          }
                                                          type={
                                                            subField.fieldType ===
                                                              "file" ? "text" : "text"
                                                          }
                                                          name={
                                                            subField.fieldType
                                                          }
                                                          onChange={(e: any) =>
                                                            handleInputChange(
                                                              e,
                                                              section?.uniqueSectionName,
                                                              sectionField.fekey,
                                                              multipleSectionIndex,
                                                              subField.fekey
                                                            )
                                                          }
                                                          fullWidth
                                                          margin="normal"
                                                          // error={
                                                          //   subField.error &&
                                                          //   subField.error
                                                          // }
                                                          // helperText={
                                                          //   subField.error &&
                                                          //   subField.error
                                                          // }
                                                          // inputProps={
                                                          //   subField.validation
                                                          //     ? JSON.parse(
                                                          //         subField.validation
                                                          //       )
                                                          //     : {}
                                                          // }
                                                          error={
                                                            // @ts-ignore
                                                            !!formErrors[
                                                              section
                                                                .uniqueSectionName
                                                            ]?.[
                                                            `${sectionField.fekey}-${multipleSectionIndex}-${subField.fekey}`
                                                            ]
                                                          }
                                                          helperText={
                                                            // @ts-ignore
                                                            formErrors[
                                                              section
                                                                .uniqueSectionName
                                                            ]?.[
                                                            `${sectionField.fekey}-${multipleSectionIndex}-${subField.fekey}`
                                                            ] || ""
                                                          }
                                                          inputProps={
                                                            subField.validation ? JSON.parse(
                                                              subField.validation
                                                            ) : {}
                                                          }
                                                          value={
                                                            templateValue?.[
                                                              section
                                                                .uniqueSectionName
                                                            ]?.[
                                                              sectionField.fekey
                                                            ]?.[
                                                              multipleSectionIndex
                                                            ]?.[
                                                              subField.fekey
                                                            ] || ""
                                                          }
                                                        />
                                                      </Grid>
                                                    </Box>
                                                  )
                                                )}
                                              </CardContent>
                                            </Card>
                                          )
                                        )}
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                )}

                                {sectionField.fieldType !== "multiple" && (
                                  <Grid item xs={12} sm={12}>
                                    <CustomTextField
                                      multiline
                                      label={
                                        sectionField.isRequired ? `${sectionField.fieldLabel} *` : sectionField.fieldLabel
                                      }
                                      type={
                                        sectionField.fieldType === "file" ? "text" : "text"
                                      }
                                      name={sectionField.fieldType}
                                      onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                      ) =>
                                        handleInputChange(
                                          e,
                                          section.uniqueSectionName,
                                          sectionField.fekey
                                        )
                                      }
                                      fullWidth
                                      margin="normal"
                                      // @ts-ignore
                                      // error={sectioFieldIndex.error && sectioFieldIndex.error}
                                      // @ts-ignore
                                      // helperText={field.error && field.error}
                                      // inputProps={
                                      //   sectionField.validation
                                      //     ? JSON.parse(sectionField.validation)
                                      //     : {}
                                      // }

                                      error={
                                        // @ts-ignore
                                        !!formErrors[section.uniqueSectionName]?.[
                                          sectionField.fekey
                                        ]
                                      }
                                      helperText={
                                        // @ts-ignore
                                        formErrors[section.uniqueSectionName]?.[
                                          sectionField.fekey
                                        ] || ""
                                      }
                                      //  inputProps={
                                      //    sectionField.validation ? JSON.parse(sectionField.validation) : {}
                                      //  }
                                      value={
                                        templateValue?.[
                                          section.uniqueSectionName
                                        ]?.[sectionField.fekey] || ""
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
          {permissionUser &&
            <><Button
              color="warning"
              variant="contained"
              size="small"
              type="submit"
              onClick={(event) => {
                handleSubmit(event, false)
              }}
            >
              Save as Draft
            </Button>
              <Button
                variant="contained"
                type="submit"
                size="small"
                onClick={(event) => {
                  handleSubmit(event, true)
                }}
              >
                Save & Publish
              </Button>
            </>}
        </Box>
      </Grid>
    </>
  )
}
export default PagesForm
