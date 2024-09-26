import React, { useEffect, useState } from "react"
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
  Avatar
} from "@mui/material"
import CustomTextField from "@/@core/components/mui/TextField"
import CustomAutocomplete from "@/@core/components/mui/Autocomplete"
import { get, postContentBlock } from "@/services/apiService"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { section } from "@/services/endpoint/section"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import BreadCrumbList from "@/components/BreadCrumbList"
import { useDropzone } from "react-dropzone"

const tooltipContent = {
  pattern: "[A-Za-z]{3,10}",
  maxLength: 10,
  minLength: 3
  // "min": "01",
  // "max": "100",
  // "accept": ".jpg, .jpeg, .png",
}

const fieldTypeOptions = [
  // { label: 'email', value: 'email' },
  // { label: 'file', value: 'file' },
  { label: "text", value: "text" },
  // { label: 'url', value: 'url' },
  // { label: 'date', value: 'date' },
  // { label: 'number', value: 'number' },
  // { label: 'textarea', value: 'textarea' },
  { label: "Multiple", value: "multiple" }
]

const fieldTypeOptionsForMultiple = [
  // { label: 'email', value: 'email' },
  // { label: 'file', value: 'file' },
  { label: "text", value: "text" }
  // { label: 'url', value: 'url' },
  // { label: 'date', value: 'date' },
  // { label: 'number', value: 'number' },
  // { label: 'textarea', value: 'textarea' }
]

const sectionActions = {
  ADD: -1,
  EDIT: 1
}

const initialData = {
  id: 0,
  name: "",
  slug: "",
  sectionImage: "",
  jsonContent: [
    {
      fieldType: "",
      fieldLabel: "",
      fekey: "",
      isRequired: false,
      validation: "{}"
    }
  ],
  status: false,
  isCommon: false
}

type Props = {
  open: number;
};

const initialErrorData = {
  name: "",
  slug: "",
  sectionImage: "",
  jsonContent: []
}

type FormDataType = {
  id: number;
  name: string;
  sectionImage: string;
  slug: string;
  jsonContent: any[];
  status: boolean;
  isCommon: boolean;
};

const ContentBlockForm = ({ open }: Props) => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormDataType>(initialData)
  const [formErrors, setFormErrors] = useState<{
    name: string;
    slug: string;
    sectionImage: string;
    jsonContent: string[];
  }>(initialErrorData)
  const [initialJSONContent, setInitialJSONContent] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)
  const query = usePathname().split("/")
  const [, setIsSlugManuallyEdited] = useState<boolean>(false)
  const [expanded, setExpanded] = useState(true)
  const [editAllow, setEditAllow] = useState(false)
  const [initialIsCommon, setInitialIsCommon] = useState(false)

  const [sectionImage, setsectionImage] = useState<File | null>(null)
  const [issectionImageTouched, setIsSectionImageTouched] = useState(false)

  const {
    getRootProps: getSectionImageRootProps,
    getInputProps: getSectionImageInputProps
  } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    onDrop: (acceptedFiles: File[]) => {
      setFormErrors({ ...formErrors, sectionImage: "" })
      setsectionImage(acceptedFiles[0])
      setIsSectionImageTouched(true)
    }
  })

  useEffect(() => {
    if (formData.jsonContent.length === 0) {
      handleAddRow()
    }
  }, [])

  const handleAddRow = () => {
    const newField = {
      fieldType: "",
      fieldLabel: "",
      isRequired: false,
      validation: "{}"
    }
    setFormData({
      ...formData,
      jsonContent: [...formData.jsonContent, newField]
    })
  }
  const handleRemoveRow = (index: number) => {
    if (formData.jsonContent.length > 1) {
      const updatedFields = formData.jsonContent.filter(
        (_, idx) => idx !== index
      )
      setFormData({ ...formData, jsonContent: updatedFields })
    }
  }

  const handleChangeField = (
    index: number,
    field: string,
    value: any,
    subIndex?: number
  ) => {
    const updatedFields = [...formData.jsonContent]
    if (subIndex !== undefined) {
      updatedFields[index].multipleData[subIndex][field] = value
    } else {
      updatedFields[index][field] = value

      if (field === "validation") {
        try {
          JSON.parse(value)
          setFormErrors({
            ...formErrors,
            jsonContent: {
              ...formErrors.jsonContent,
              [index]: ""
            }
          })
        } catch (error) {
          setFormErrors({
            ...formErrors,
            jsonContent: {
              ...formErrors.jsonContent,
              [index]: "Validation should be a valid JSON object."
            }
          })
        }
      }

      if (field === "fieldType" && value === "multiple") {
        updatedFields[index].multipleData = [
          {
            fieldType: "",
            fieldLabel: "",
            fekey: "",
            isRequired: false,
            validation: "{}"
          }
        ]
      }
    }

    setFormData({ ...formData, jsonContent: updatedFields })
  }
  const handleAddSubRow = (parentIndex: number) => {
    const newSubField = {
      fieldType: "",
      fieldLabel: "",
      fekey: "",
      isRequired: false,
      validation: "{}"
    }
    // const updatedFields = [...formData.jsonContent];
    // updatedFields[parentIndex].multipleData.push(newSubField);
    const updatedFields = formData.jsonContent.map((item, index) => {
      if (index === parentIndex) {
        return {
          ...item,
          multipleData: [...item.multipleData, newSubField]
        }
      }
      return item
    })

    setFormData({ ...formData, jsonContent: updatedFields })
  }

  const handleRemoveSubRow = (parentIndex: number, subIndex: number) => {
    const updatedFields = [...formData.jsonContent]
    if (updatedFields[parentIndex].multipleData.length > 1) {
      updatedFields[parentIndex].multipleData = updatedFields[
        parentIndex
      ].multipleData.filter((_: any, idx: any) => idx !== subIndex)
      setFormData({ ...formData, jsonContent: updatedFields })
    }
  }
  const validateFormData = (data: FormDataType) => {
    let isValid = true
    const errors = {
      name: "",
      slug: "",
      jsonContent: data.jsonContent.map(() => "")
    }

    const slugRegex = /^[a-zA-Z0-9]+$/

    if (data.name.trim().length === 0) {
      errors.name = "Full Name is required"
      isValid = false
    }

    if (data.slug.trim().length === 0) {
      errors.slug = "Slug is required"
      isValid = false
    } else if (!slugRegex.test(data.slug)) {
      errors.slug =
        "Slug must be alphanumeric with no spaces or special characters."
      isValid = false
    }

    setFormErrors({ ...formErrors, ...errors })
    setLoading(false)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (validateFormData(formData)) {
      try {
        setLoading(true)
        const endpoint =
          open === sectionActions.EDIT ? section.update : section.create

        let sectionName = formData.name
        sectionName = sectionName?.split("_")?.join(" ")

        // const payload = {
        //   sectionId: open === sectionActions.EDIT ? formData.id : undefined,
        //   sectionName,
        //   sectionSlug: formData.slug,
        //   sectionTemplate: formData.jsonContent,
        //   active: formData.status,
        //   isCommon: formData.isCommon
        // }

        const data = new FormData()
        if (open === sectionActions.EDIT && formData.id !== undefined) {
          data.append("sectionId", formData.id.toString())
        }
        if (sectionImage) {
          data.append("sectionImage", sectionImage as Blob)
        }
        data.append("sectionName", sectionName)
        data.append("sectionSlug", formData.slug)
        data.append("sectionTemplate", JSON.stringify(formData.jsonContent))
        data.append("active", formData.status.toString())
        data.append("isCommon", formData.isCommon.toString())

        const response = await postContentBlock(endpoint, data)

        toast.success(response.message)
        handleReset()
        setLoading(false)
      } catch (error: any) {
        console.error("Error fetching data:", error.message)
        setLoading(false)
      }
    }
  }

  const handleReset = () => {
    setFormData(initialData)
    setFormErrors(initialErrorData)
    router.back()
  }

  const getSectionDataById = async (slug: string | number) => {
    try {
      const result = await get(`${section.getById}/${slug}`)
      const { data } = result
      setEditAllow(data.disableSection)
      setFormData({
        ...formData,
        id: data.sectionId,
        name: data.sectionName,
        sectionImage: data.sectionImage,
        slug: data.sectionSlug,
        jsonContent: data.sectionTemplate,
        status: data.active,
        isCommon: data.isCommon
      })
      setIsSlugManuallyEdited(false)
      setInitialIsCommon(data.isCommon)
      setInitialJSONContent([...data.sectionTemplate])
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (open === sectionActions.EDIT) {
      getSectionDataById(query[query.length - 1])
    } else {
      setEditAllow(false)
      setFormData(initialData)
      setFormErrors(initialErrorData)
      setLoading(false)
    }
  }, [])

  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFormErrors({ ...formErrors, name: "" })
    setFormData((prevData) => ({
      ...prevData,
      name: newName
      // slug: !isSlugManuallyEdited && open === sectionActions.ADD ? newName.replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-").toLowerCase() : prevData.slug,
    }))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
    const slugRegex = /^[a-zA-Z0-9]+$/

    if (!slugRegex.test(newSlug)) {
      setFormErrors({
        ...formErrors,
        slug: "Slug must be alphanumeric with no spaces, dashes, or underscores."
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

  // const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newSlug = e.target.value;
  //   setFormErrors({ ...formErrors, slug: "" });
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     slug: newSlug,
  //   }));
  //   setIsSlugManuallyEdited(true);
  // };
  const handleChange = () => {
    setExpanded(!expanded)
  }

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div>
          <form className="flex flex-col gap-6 p-6">
            <Box display="flex" alignItems="center">
              <Grid container spacing={3}>
                <Grid
                  container
                  display={"flex"}
                  columnGap={4}
                  margin={4}
                  xs={12}
                >
                  <Grid container xs={7} spacing={3} alignItems={"flex-start"}>
                    <Grid item xs={12} sm={6}>
                      <CustomTextField
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        label="Full Name *"
                        fullWidth
                        placeholder=""
                        value={formData.name}
                        onChange={handleSectionNameChange}
                        // disabled={open == sectionActions.EDIT}
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
                        disabled={!!editAllow || open == sectionActions.EDIT}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="body2" sx={{ mr: 0 }}>
                        Status
                      </Typography>
                      <Switch
                        size="medium"
                        checked={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.checked })
                        }
                        disabled={!!editAllow}
                      />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="body2" sx={{ mr: 0 }}>
                        is Common Content Block
                      </Typography>
                      <Switch
                        size="medium"
                        checked={formData.isCommon}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isCommon: e.target.checked
                          })
                        }
                        disabled={
                          !!(open == sectionActions.EDIT && !!initialIsCommon)
                        }
                      />
                    </Grid>
                  </Grid>
                  <Grid container xs={4} spacing={3}>
                    <Grid item xs={12} sm={12}>
                      <p
                        className={`${formErrors.sectionImage ? "text-[#ff5054]" : "text-[#4e4b5a]"} text-[13px]`}
                      >
                        {" "}
                        Section Image *{" "}
                      </p>
                      <div
                        className={`flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md`}
                        style={{
                          borderColor: formErrors.sectionImage ? "#ff5054" : "gray"
                        }}
                      >
                        <Box
                          {...getSectionImageRootProps({
                            className: "dropzone"
                          })}
                          {...sectionImage}
                        >
                          <input {...getSectionImageInputProps()} />
                          <div
                            className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2"
                            style={{
                              borderColor: formErrors.sectionImage ? "#ff5054" : "gray"
                            }}
                          >
                            {formData.sectionImage &&
                              !issectionImageTouched && (
                                // eslint-disable-next-line
                                <img
                                  className="object-contain w-full h-full"
                                  src={
                                    process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
                                    "/" +
                                    formData?.sectionImage
                                  }
                                  key={sectionImage?.name}
                                  alt={sectionImage?.name}
                                />
                            )}
                            {sectionImage && issectionImageTouched && (
                              // eslint-disable-next-line
                              <img
                                key={sectionImage.name}
                                alt={sectionImage.name}
                                className="object-contain w-full h-full"
                                src={URL.createObjectURL(sectionImage)}
                              />
                            )}
                            {!sectionImage &&
                              !issectionImageTouched &&
                              !formData.sectionImage && (
                                <>
                                  <Avatar
                                    variant="rounded"
                                    className="bs-12 is-12 mbe-9"
                                  >
                                    <i className="tabler-upload" />
                                  </Avatar>
                                  <Typography variant="h5" className="mbe-2.5">
                                    Drop files here or click to upload.
                                  </Typography>
                                  <Typography>
                                    Drop files here or click{" "}
                                    <a
                                      href="/"
                                      onClick={(e) => e.preventDefault()}
                                      className="text-textPrimary no-underline"
                                    >
                                      browse
                                    </a>{" "}
                                    through your machine
                                  </Typography>
                                </>
                            )}
                          </div>
                          {!!formErrors.sectionImage && (
                            <p className="text-[#ff5054] text-[13px]">
                              {formErrors.sectionImage}
                            </p>
                          )}
                        </Box>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <label className="text-[0.8125rem] leading-[1.153]">
                    JSON Content *
                  </label>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Field Type</TableCell>
                          <TableCell>Field Label</TableCell>
                          <TableCell>Frontend side Key</TableCell>
                          <TableCell>Is Required</TableCell>
                          <TableCell>
                            Validation
                            <Tooltip
                              placement="top"
                              title={
                                <pre style={{ whiteSpace: "pre-wrap" }}>
                                  {JSON.stringify(tooltipContent, null, 2)}
                                </pre>
                              }
                            >
                              <IconButton>
                                <i className="tabler-alert-square-filled" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          {!editAllow && <TableCell>Actions </TableCell>}
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
                                  getOptionLabel={(option) =>
                                    option.label || ""
                                  }
                                  renderInput={(params) => (
                                    <CustomTextField
                                      {...params}
                                      placeholder=""
                                    />
                                  )}
                                  value={
                                    fieldTypeOptions.find(
                                      (option) =>
                                        option.value === field.fieldType
                                    ) || null
                                  }
                                  onChange={(e, newValue) =>
                                    handleChangeField(
                                      index,
                                      "fieldType",
                                      newValue ? newValue.value : ""
                                    )
                                  }
                                  disabled={
                                    open == sectionActions.EDIT &&
                                    !!initialJSONContent?.[index]?.fieldType
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <CustomTextField
                                  fullWidth
                                  value={field.fieldLabel}
                                  onChange={(e) =>
                                    handleChangeField(
                                      index,
                                      "fieldLabel",
                                      e.target.value
                                    )
                                  }
                                  // disabled={editAllow ? true : false}
                                />
                              </TableCell>
                              {/* {field.fieldType !== "multiple" && (<> */}

                              <TableCell>
                                <CustomTextField
                                  fullWidth
                                  value={field.fekey}
                                  onChange={(e) =>
                                    handleChangeField(
                                      index,
                                      "fekey",
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    open == sectionActions.EDIT &&
                                    !!initialJSONContent?.[index]?.fekey
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Switch
                                  checked={field.isRequired}
                                  onChange={(e) =>
                                    handleChangeField(
                                      index,
                                      "isRequired",
                                      e.target.checked
                                    )
                                  }
                                  // disabled={open == sectionActions.EDIT && (!!initialJSONContent?.[index]?.isRequired)}
                                />
                              </TableCell>
                              <TableCell>
                                <CustomTextField
                                  fullWidth
                                  value={field.validation}
                                  onChange={(e) =>
                                    handleChangeField(
                                      index,
                                      "validation",
                                      e.target.value
                                    )
                                  }
                                  error={!!formErrors.jsonContent[index]}
                                  helperText={formErrors.jsonContent[index]}
                                  // disabled={
                                  //   open == sectionActions.EDIT &&
                                  //   !!initialJSONContent?.[index]?.validation
                                  // }
                                />
                              </TableCell>
                              {/* </>)} */}
                              {/* {field.fieldType === "multiple" ?? (<> */}
                              {/* <TableCell>&nbsp; s</TableCell>
                                <TableCell>&nbsp; s</TableCell>
                              </>)} */}
                              {!editAllow && (
                                <TableCell>
                                  {!initialJSONContent?.[index]?.fekey && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveRow(index)}
                                      aria-label="minus"
                                      color="error"
                                    >
                                      <i className="tabler-minus" />
                                    </IconButton>
                                  )}

                                  {index ===
                                    formData.jsonContent.length - 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={handleAddRow}
                                      aria-label="plus"
                                      color="success"
                                      style={{ marginLeft: 0 }}
                                    >
                                      <i className="tabler-plus" />
                                    </IconButton>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>

                            {field.fieldType === "multiple" && (
                              <TableRow>
                                <TableCell colSpan={5}>
                                  <Accordion
                                    expanded={expanded}
                                    onChange={handleChange}
                                  >
                                    <AccordionSummary
                                      expandIcon={
                                        <IconButton
                                          size="small"
                                          aria-label="plus"
                                          color="info"
                                          style={{ marginLeft: 8 }}
                                        >
                                          <i className="tabler-chevron-down" />
                                        </IconButton>
                                      }
                                    >
                                      <Typography variant="subtitle1">
                                        Multiple Label:{" "}
                                        {field.fieldLabel ? field.fieldLabel : "N/A"}
                                      </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Field Type</TableCell>
                                            <TableCell>Field Label</TableCell>
                                            <TableCell>
                                              Frontend side Key
                                            </TableCell>
                                            <TableCell>Is Required</TableCell>
                                            <TableCell>
                                              Validation
                                              <Tooltip
                                                placement="top"
                                                title={
                                                  <pre
                                                    style={{
                                                      whiteSpace: "pre-wrap"
                                                    }}
                                                  >
                                                    {JSON.stringify(
                                                      tooltipContent,
                                                      null,
                                                      2
                                                    )}
                                                  </pre>
                                                }
                                              >
                                                <IconButton>
                                                  <i className="tabler-alert-square-filled" />
                                                </IconButton>
                                              </Tooltip>
                                            </TableCell>
                                            {!editAllow && (
                                              <TableCell>Actions </TableCell>
                                            )}
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {field.multipleData.map(
                                            (subField: any, subIndex: any) => (
                                              <TableRow
                                                key={`${index}-${subIndex}`}
                                              >
                                                <TableCell>
                                                  <CustomAutocomplete
                                                    fullWidth
                                                    options={
                                                      fieldTypeOptionsForMultiple
                                                    }
                                                    id={`autocomplete-custom-${index}-${subIndex}`}
                                                    getOptionLabel={(option) =>
                                                      option.label || ""
                                                    }
                                                    renderInput={(params) => (
                                                      <CustomTextField
                                                        {...params}
                                                        placeholder=""
                                                      />
                                                    )}
                                                    value={
                                                      fieldTypeOptionsForMultiple.find(
                                                        (option) =>
                                                          option.value ===
                                                          subField.fieldType
                                                      ) || null
                                                    }
                                                    onChange={(e, newValue) =>
                                                      handleChangeField(
                                                        index,
                                                        "fieldType",
                                                        newValue ? newValue.value : "",
                                                        subIndex
                                                      )
                                                    }
                                                    disabled={
                                                      open ==
                                                        sectionActions.EDIT &&
                                                      !!initialJSONContent?.[
                                                        index
                                                      ]?.multipleData?.[
                                                        subIndex
                                                      ]?.fieldType
                                                    }
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <CustomTextField
                                                    fullWidth
                                                    value={subField.fieldLabel}
                                                    onChange={(e) =>
                                                      handleChangeField(
                                                        index,
                                                        "fieldLabel",
                                                        e.target.value,
                                                        subIndex
                                                      )
                                                    }
                                                    // disabled={editAllow ? true : false}
                                                  />
                                                </TableCell>
                                                {/* {field.fieldType !== "multiple" && (<> */}
                                                <TableCell>
                                                  <CustomTextField
                                                    fullWidth
                                                    value={subField.fekey}
                                                    onChange={(e) =>
                                                      handleChangeField(
                                                        index,
                                                        "fekey",
                                                        e.target.value,
                                                        subIndex
                                                      )
                                                    }
                                                    disabled={
                                                      open ==
                                                        sectionActions.EDIT &&
                                                      !!initialJSONContent?.[
                                                        index
                                                      ]?.multipleData?.[
                                                        subIndex
                                                      ]?.fekey
                                                    }
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <Switch
                                                    checked={
                                                      subField.isRequired
                                                    }
                                                    onChange={(e) =>
                                                      handleChangeField(
                                                        index,
                                                        "isRequired",
                                                        e.target.checked,
                                                        subIndex
                                                      )
                                                    }
                                                    // disabled={editAllow ? true : false}
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  <CustomTextField
                                                    fullWidth
                                                    value={subField.validation}
                                                    onChange={(e) =>
                                                      handleChangeField(
                                                        index,
                                                        "validation",
                                                        e.target.value,
                                                        subIndex
                                                      )
                                                    }
                                                    error={
                                                      !!formErrors.jsonContent[
                                                        index
                                                      ]?.[subIndex]
                                                    }
                                                    helperText={
                                                      formErrors.jsonContent[
                                                        index
                                                      ]?.[subIndex]
                                                    }
                                                    // disabled={
                                                    //   open ==
                                                    //     sectionActions.EDIT &&
                                                    //   !!initialJSONContent?.[
                                                    //     index
                                                    //   ]?.multipleData?.[
                                                    //     subIndex
                                                    //   ]?.validation
                                                    // }
                                                  />
                                                </TableCell>
                                                {/* </>)} */}
                                                {!editAllow && (
                                                  <TableCell>
                                                    {!initialJSONContent?.[
                                                      index
                                                    ]?.multipleData?.[subIndex]
                                                      ?.fekey && (
                                                      <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                          handleRemoveSubRow(
                                                            index,
                                                            subIndex
                                                          )
                                                        }
                                                        aria-label="minus"
                                                        color="error"
                                                      >
                                                        <i className="tabler-minus" />
                                                      </IconButton>
                                                    )}

                                                    {subIndex ===
                                                      field.multipleData
                                                        .length -
                                                        1 && (
                                                      <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                          handleAddSubRow(index)
                                                        }
                                                        aria-label="plus"
                                                        color="success"
                                                        style={{
                                                          marginLeft: 0
                                                        }}
                                                      >
                                                        <i className="tabler-plus" />
                                                      </IconButton>
                                                    )}
                                                  </TableCell>
                                                )}
                                              </TableRow>
                                            )
                                          )}
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
            variant="outlined"
            size="small"
            onClick={() => {
              handleReset()
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            size="small"
            onClick={(e) => handleSubmit(e)}
          >
            {open === sectionActions.ADD ? "Add" : "Update"} Content Block
          </Button>
        </Box>
      </Grid>
    </>
  )
}

export default ContentBlockForm
