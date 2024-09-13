"use client"

import LoadingBackdrop from "@/components/LoadingBackdrop"
import {
  Button,
  Box,
  Card,
  Grid,
  MenuItem,
  Typography,
  Avatar,
  IconButton,
  FormControlLabel,
  Checkbox,
  Switch
} from "@mui/material"
import CustomTextField from "@/@core/components/mui/TextField"
import React, { useEffect, useState } from "react"
import CustomAutocomplete from "@/@core/components/mui/Autocomplete"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { post, postContentBlock } from "@/services/apiService"
import { toast } from "react-toastify"
import BreadCrumbList from "@/components/BreadCrumbList"
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker"
import { popups } from "@/services/endpoint/popup"
import { pages } from "@/services/endpoint/pages"

const popupActions = {
  ADD: -1,
  EDIT: 1
}

const initialFormData = {
  id: -1,
  active: false,
  eventDate: new Date().toString(),
  startDate: new Date().toString(),
  endDate: new Date().toString(),
  frequency: 0,
  delay: 0,
  eventTitle: "",
  title: "",
  heading: "",
  supportingLine: "",
  btnText: "",
  btnLink: "",
  image: ""
}

const initialErrorData = {
  id: -1,
  eventDate: "",
  startDate: "",
  endDate: "",
  frequency: "",
  delay: "",
  eventTitle: "",
  title: "",
  heading: "",
  supportingLine: "",
  btnText: "",
  btnLink: "",
  image: ""
}

function NewPopupForm({ open, handleClose, editingRow, permissionUser }: any) {
  const router = useRouter()

  const [popupType, setPopupType] = useState("Event")
  const [allPages, setAllPages] = useState(false)
  const [selectedPages, setSelectedPages] = useState<
    Array<{ pageName: string; pageId: number }> | []
  >([])
  const [isParamanent, setIsParamanent] = useState(false)

  // state management hook
  const [image, setImage] = useState<File | null>(null)
  const [isImageTouched, setIsImageTouched] = useState(false)
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData)
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData)

  // page list hooks & other list apis data
  const [pageList, setPageList] = useState<
    Array<{ pageName: string; pageId: number }> | []
  >([])
  const [loading, setLoading] = useState<boolean>(true)

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
      multiple: false,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"]
      },
      onDrop: (acceptedFiles: File[]) => {
        setFormErrors({ ...formErrors, image: "" })
        setImage(acceptedFiles[0])
        setIsImageTouched(true)
      }
    })

  // Effects
  useEffect(() => {
    getRequiredData()
  }, [])

  const validateForm = () => {
    const errors = { ...initialErrorData }
    let isValid = true
    if (!formData.title) {
      errors.title = "title is required"
      isValid = false
    }

    if (popupType === "Event") {
      if (!formData.eventTitle) {
        errors.eventTitle = "event title is required"
        isValid = false
      }
      if (!formData.btnLink) {
        errors.btnLink = "button link is required"
        isValid = false
      }
    }
    if (!formData.heading) {
      errors.heading = "heading is required"
      isValid = false
    }
    if (!formData.supportingLine) {
      errors.supportingLine = "supporting line is required"
      isValid = false
    }
    if (!formData.btnText) {
      errors.btnText = "button text is required"
      isValid = false
    }

    if (!image && open == popupActions.ADD) {
      errors.image = "image is required"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Get Active Template List
  const getRequiredData = async () => {
    try {
      setLoading(true)
      const [pagesResponse] = await Promise.all([post(`${pages.active}`, {})])
      const pagesData = pagesResponse?.data?.pages
      setPageList(pagesResponse?.data?.pages)

      // Update edit form
      if (open === popupActions.EDIT) {
        const data = {
          ...editingRow?.data
        }
        data.id = editingRow.popupId
        data.title = editingRow.title
        data.active = editingRow.active
        setIsParamanent(editingRow?.data.isParamanent)
        setAllPages(editingRow?.data?.allPages)
        setSelectedPages(editingRow?.data?.selectedPages)

        // set all pages option
        const preSelectedOptions = pagesData.filter((option: any) =>
          editingRow?.data?.selectedPages?.includes(option.pageId)
        )

        setSelectedPages(preSelectedOptions)

        setFormData(data)
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (!validateForm()) {
        return
      }

      setLoading(true)

      const data = {
        ...formData,
        popupType,
        allPages,
        selectedPages,
        isParamanent
      }
      // selected pages
      // @ts-ignore
      data.selectedPages = selectedPages.map((item) => item.pageId)

      const finalData = new FormData()
      finalData.append("title", formData.title)
      finalData.append("data", JSON.stringify(data))
      finalData.append("active", String(formData.active))
      if (image) {
        finalData.append("image", image as unknown as Blob)
      }
      let result
      if (open === popupActions.EDIT) {
        finalData.append("popupId", formData.id.toString())
        result = await postContentBlock(popups.update, finalData)
      } else {
        result = await postContentBlock(popups.create, finalData)
      }
      if (result.status === "success") {
        toast.success(result.message)
        handleClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event: any, newValue: any[]) => {
    setSelectedPages(newValue)
  }

  return (
    <>
      <LoadingBackdrop isLoading={loading} />

      <Box display="flex" alignItems="center">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={11}>
            <BreadCrumbList />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="info" onClick={() => { }}>
              <i className="tabler-external-link text-textSecondary"></i>
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Card className="p-4">
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} xs={12}>
            <Grid item sm={6}>
              <CustomTextField
                // disabled={true}
                error={!!formErrors.title}
                helperText={formErrors.title}
                label="Title*"
                fullWidth
                placeholder=""
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                }}
              />
            </Grid>
            <Grid item sm={4}>
              <CustomTextField
                select
                fullWidth
                defaultValue="Event"
                label="Popup Type"
                id="custom-select"
                onChange={(e) => setPopupType(e.target.value)}
              >
                <MenuItem value={"Event"}>Event</MenuItem>
                <MenuItem value={"General"}>General</MenuItem>
                {/* <MenuItem value={"Content Recommendation"}>
                  Content Recommendation
                </MenuItem>
                <MenuItem value={"Downloadable"}>Downloadable</MenuItem>
                <MenuItem value={"Survey"}>Survey</MenuItem> */}
                <MenuItem value={"Exit Intent"}>Exit Intent</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid item sm={2}>
              <Typography variant="body2" sx={{ mr: 0 }}>
                Status
              </Typography>
              <Switch
                size="medium"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
            </Grid>

            <Grid item xs={12} lg={12}>
              <FormControlLabel
                label="is Permenent ?"
                control={
                  <Checkbox
                    defaultChecked
                    name="basic-checked"
                    onChange={(e) => setIsParamanent(e.target.checked)}
                    checked={isParamanent}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <AppReactDatepicker
                id="min-date"
                selected={new Date(formData.startDate)}
                // minDate={}
                onChange={(date: Date) =>
                  setFormData({ ...formData, startDate: date.toString() })
                }
                customInput={<CustomTextField label="Start Date" fullWidth />}
              />
            </Grid>
            {!isParamanent && (
              <Grid item xs={12} lg={6}>
                <AppReactDatepicker
                  id="max-date"
                  selected={new Date(formData.endDate)}
                  minDate={new Date(formData.startDate)}
                  onChange={(date: Date) =>
                    setFormData({ ...formData, endDate: date.toString() })
                  }
                  customInput={<CustomTextField label="End Date" fullWidth />}
                />
              </Grid>
            )}

            {popupType !== "Exit Intent" && (
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  // disabled={true}
                  error={!!formErrors.frequency}
                  helperText={formErrors.frequency}
                  label="Frequency*"
                  fullWidth
                  placeholder=""
                  type="number"
                  value={formData.frequency}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      frequency: Number(e.target.value)
                    })
                  }}
                />
              </Grid>
            )}
            {popupType !== "Exit Intent" && (
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  // disabled={true}
                  error={!!formErrors.delay}
                  helperText={formErrors.delay}
                  label="Delay*"
                  fullWidth
                  type="number"
                  placeholder=""
                  value={formData.delay}
                  onChange={(e) => {
                    setFormData({ ...formData, delay: Number(e.target.value) })
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} lg={12}>
              <FormControlLabel
                label="for All Pages ?"
                control={
                  <Checkbox
                    defaultChecked
                    name="basic-checked"
                    onChange={(e) => setAllPages(e.target.checked)}
                    checked={allPages}
                  />
                }
              />
            </Grid>
            {!allPages && (
              <Grid item xs={12} lg={12} className="mb-[20px]">
                <CustomAutocomplete
                  id="autocomplete-grouped"
                  multiple // Enable multiple selections
                  options={pageList}
                  value={selectedPages}
                  getOptionLabel={(option) => option.pageName || ""}
                  renderInput={(params) => (
                    <CustomTextField {...params} label="Select Page*" />
                  )}
                  onChange={handleChange}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} xs={12}>
            {popupType === "Event" && (
              <Grid item xs={12} lg={6}>
                <AppReactDatepicker
                  id="min-date"
                  selected={new Date(formData.eventDate)}
                  minDate={new Date()}
                  onChange={(date: Date) => {
                    setFormData({ ...formData, eventDate: date.toString() })
                  }}
                  customInput={
                    <CustomTextField label="Event Date*" fullWidth />
                  }
                />
              </Grid>
            )}
            {popupType === "Event" && (
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  // disabled={true}
                  error={!!formErrors.eventTitle}
                  helperText={formErrors.eventTitle}
                  label="Event Title*"
                  fullWidth
                  placeholder="Event"
                  value={formData.eventTitle}
                  onChange={(e) => {
                    setFormData({ ...formData, eventTitle: e.target.value })
                  }}
                />
              </Grid>
            )}
            {(popupType === "Event" ||
              popupType === "General" ||
              popupType === "Exit Intent") && (
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    error={!!formErrors.heading}
                    helperText={formErrors.heading}
                    label="Heading*"
                    fullWidth
                    placeholder="Heading"
                    value={formData.heading}
                    onChange={(e) => {
                      setFormData({ ...formData, heading: e.target.value })
                    }}
                  />
                </Grid>
            )}
            {(popupType === "Event" ||
              popupType === "General" ||
              popupType === "Exit Intent") && (
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    error={!!formErrors.supportingLine}
                    helperText={formErrors.supportingLine}
                    label="Supporting Line*"
                    fullWidth
                    placeholder="Supporting Line"
                    value={formData.supportingLine}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        supportingLine: e.target.value
                      })
                    }}
                  />
                </Grid>
            )}
            {(popupType === "Event" ||
              popupType === "General" ||
              popupType === "Exit Intent" ||
              popupType === "Survey") && (
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    // disabled={true}
                    error={!!formErrors.btnText}
                    helperText={formErrors.btnText}
                    label="Button Text*"
                    fullWidth
                    placeholder=""
                    value={formData.btnText}
                    onChange={(e) => {
                      setFormData({ ...formData, btnText: e.target.value })
                    }}
                  />
                </Grid>
            )}
            {popupType === "Event" && (
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  // disabled={true}
                  error={!!formErrors.btnLink}
                  helperText={formErrors.btnLink}
                  label="Button Link*"
                  fullWidth
                  placeholder=""
                  value={formData.btnLink}
                  onChange={(e) => {
                    setFormData({ ...formData, btnLink: e.target.value })
                  }}
                />
              </Grid>
            )}

            {/* {popupType === "Survey" && (
              <>
                <SurveyPopupType
                  open={0}
                  handleClose={handleClose}
                  handleSubmit={handleSubmit}
                  editingRow={null}
                />
              </>
            )} */}
          </Grid>

          <Grid container spacing={4} xs={4}>
            <Grid item xs={12} sm={12} className="mt-[-20px]">
              <p className="text-[#4e4b5a] my-2"> Image* </p>
              <div className="flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md">
                <Box
                  {...getImageRootProps({ className: "dropzone" })}
                  {...image}
                >
                  <input {...getImageInputProps()} />
                  <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                    {open == popupActions.EDIT && !isImageTouched && (
                      <img
                        className="object-contain w-full h-full"
                        src={
                          process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
                          "/" +
                          formData?.image
                        }
                      />
                    )}
                    {image && isImageTouched && (
                      <img
                        key={image.name}
                        alt={image.name}
                        className="object-contain w-full h-full"
                        src={URL.createObjectURL(image)}
                      />
                    )}

                    {!image &&
                      !isImageTouched &&
                      open !== popupActions.EDIT && (
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
                </Box>
              </div>
            </Grid>
          </Grid>
        </Box>

        <Box display="flex" gap={4}>
          <Grid container spacing={2} xs={12} sm={12}>
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
                <Button
                  variant="contained"
                  color="error"
                  type="reset"
                  onClick={() => {
                    handleClose()
                  }}
                >
                  Cancel
                </Button>
                {permissionUser &&
                  <Button
                    variant="contained"
                    type="submit"
                    onClick={() => handleSubmit(true)}
                  >
                    Save & Update
                  </Button>
                }
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  )
}

export default NewPopupForm
