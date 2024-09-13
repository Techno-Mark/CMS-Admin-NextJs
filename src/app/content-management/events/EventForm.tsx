// React Imports
import React, { ChangeEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// MUI Imports
import Button from "@mui/material/Button"
// Component Imports
import CustomTextField from "@core/components/mui/TextField"
import {
  Avatar,
  Box,
  Card,
  Grid,
  Switch,
  Typography
} from "@mui/material"
import { postContentBlock } from "@/services/apiService"
import BreadCrumbList from "@/components/BreadCrumbList"
import { event } from "@/services/endpoint/event"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker"
import dayjs from "dayjs"
import { useDropzone } from "react-dropzone"
// import Close from "@/@menu/svg/Close"
import EditorBasic from "@/components/EditorToolbar"
import { toast } from "react-toastify"
import { ADD_EVENT, EDIT_EVENT, eventDetailType } from "@/types/apps/eventType"
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import dynamic from 'next/dynamic'
// Dynamic import for CKEditor
// const CKEditor = dynamic<{ editor: any, data: string, onChange: (event: any, editor: any) => void }>(() =>
//   import('@ckeditor/ckeditor5-react').then((mod: any) => mod.CKEditor), { ssr: false });

// const ClassicEditor = dynamic(() => import('@ckeditor/ckeditor5-build-classic').then((mod: any) => mod.default), {
//   ssr: false,
// });

type EventFormPropsTypes = {
  open: number;
  editingRow: eventDetailType | null;
  handleClose: Function;
  permissionUser: Boolean
};

const validImageType = ["image/png", "image/jpeg", "image/jpg", "image/gif"]

const initialData = {
  eventId: 0,
  title: "",
  slug: "",
  date: null as Date | null,
  startTime: "",
  endTime: "",
  location: "",
  description: "",
  featureImageUrl: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: "",
  registrationLink: "",
  active: false
}

const initialErrorData = {
  title: "",
  slug: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  description: "",
  featureImageUrl: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: ""
}

const EventForm = ({ open, handleClose, editingRow, permissionUser }: EventFormPropsTypes) => {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [formData, setFormData] = useState<typeof initialData>(initialData)
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false)
  const [featureImage, setFeatureImage] = useState<File | null>(null)
  const [isFeatureImageTouched, setIsFeatureImageTouched] = useState(false)
  // Custom Hooks
  const { getRootProps: getEventRootProps, getInputProps: getEventInputProps } =
    useDropzone({
      multiple: false,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"]
      },
      onDrop: (acceptedFiles: File[]) => {
        setIsFeatureImageTouched(true)
        setFeatureImage(acceptedFiles[0])
      }
    })

  // Hooks
  useEffect(() => {
    if (open === EDIT_EVENT && editingRow) {
      setFormData({ ...editingRow })
    }
    setLoading(false)
  }, [])

  // Methods
  const handleEventTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFormData((prevData) => ({
      ...prevData,
      title: newName,
      slug:
        !isSlugManuallyEdited && open === ADD_EVENT ? newName
          .replace(/[^\w\s]|_/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase() : prevData.slug
    }))
    if (newName?.length) {
      setFormErrors({ ...formErrors, title: "" })
    }
  }

  const validateForm = () => {
    let valid = true
    const errors = { ...initialErrorData }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if (!formData.title) {
      errors.title = "Please enter event name"
      valid = false
    }
    if (!formData.slug) {
      errors.slug = "Please add a slug"
      valid = false
    } else if (formData.slug.length < 5) {
      errors.slug = "slug must be at least 5 characters long"
      valid = false
    } else if (formData.slug.length > 255) {
      errors.slug = "slug must be at most 255 characters long"
      valid = false
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      errors.slug =
        "slug must be a valid slug (only lowercase letters, numbers, and hyphens are allowed)."
      valid = false
    }
    if (!formData.date) {
      errors.date = "Please select  date"
      valid = false
    }
    if (!formData.startTime) {
      errors.startTime = "Please select start time"
      valid = false
    }
    if (!formData.endTime) {
      errors.endTime = "Please select end time"
      valid = false
    }
    if (!formData.location) {
      errors.location = "Please enter location"
      valid = false
    }
    if (!formData.description) {
      errors.description = "Please enter description"
      valid = false
    }
    if (!formData.organizerName) {
      errors.organizerName = "Please enter organizer name"
      valid = false
    }
    if (!formData.organizerEmail) {
      errors.organizerEmail = "Please enter organizer email"
      valid = false
    } else if (!regex.test(formData.organizerEmail)) {
      errors.organizerEmail = "Please enter valid email"
      valid = false
    }
    if (!formData.organizerPhone) {
      errors.organizerPhone = "Please enter organizer phone number"
      valid = false
    } else if (
      formData.organizerPhone.length > 10 ||
      formData.organizerPhone.length < 10
    ) {
      errors.organizerPhone = "Please enter valid phone number"
      valid = false
    }

    // Validate Feature Image
    if (open == ADD_EVENT && !featureImage) {
      errors.featureImageUrl = "Feature Image is required"
      valid = false
    }
    if (featureImage && !validImageType.includes(featureImage.type)) {
      errors.featureImageUrl = `Invalid file type for Feature Image. Allowed types ${validImageType.join(",")}`
      valid = false
    }

    setFormErrors(errors)
    return valid
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true)

        const formDataToSend = new FormData()
        formDataToSend.set("title", formData.title)
        formDataToSend.set("slug", formData.slug)
        formDataToSend.set("date", String(formData.date))
        formDataToSend.set("startTime", formData.startTime)
        formDataToSend.set("endTime", formData.endTime)
        formDataToSend.set("location", formData.location)
        formDataToSend.set("description", formData.description)
        formDataToSend.set("organizerName", formData.organizerName)
        formDataToSend.set("organizerEmail", formData.organizerEmail)
        formDataToSend.set("organizerPhone", formData.organizerPhone)
        formDataToSend.set("registrationLink", formData.registrationLink)
        formDataToSend.set("active", String(formData.active))

        if (featureImage) {
          formDataToSend.append("featureImage", featureImage as Blob)
        }

        let result = null
        if (open == EDIT_EVENT) {
          formDataToSend.set("eventId", String(editingRow?.eventId))
          result = await postContentBlock(event.update, formDataToSend)
        } else {
          result = await postContentBlock(event.create, formDataToSend)
        }

        setLoading(false)

        if (result.status === "success") {
          toast.success(result.message)
          router.back()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }
  }
  // const handleEditorChange = (content: string) => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     description: content
  //   }))
  //   if (content?.length) {
  //     setFormErrors((prevFormErrors) => ({
  //       ...prevFormErrors,
  //       description: ""
  //     }))
  //   }
  // }
  const handleContentChange = (content: any) => {
    setFormData((prevData) => ({
      ...prevData,
      description: content
    }))
  }
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div>
          <div className="flex flex-col gap-6 p-6">
            <div>
              <div className="flex flex-col gap-2 pb-4">
                <Box display="flex" gap={4}>
                  <Grid container spacing={1} rowSpacing={5} sm={7}>
                    <Grid item xs={12} sm={12}>
                      <CustomTextField
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                        label="Event Name *"
                        fullWidth
                        placeholder="Enter Name"
                        value={formData.title}
                        onChange={handleEventTitleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <CustomTextField
                        // disabled={open === sectionActions.EDIT}
                        // error={!!formErrors.slug}
                        error={!!formErrors.slug}
                        helperText={formErrors.slug}
                        label="Slug *"
                        fullWidth
                        placeholder=""
                        value={formData.slug}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setFormData({ ...formData, slug: e.target.value })
                          setIsSlugManuallyEdited(true)
                          if (e.target?.value?.length) {
                            setFormErrors({ ...formErrors, slug: "" })
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <AppReactDatepicker
                        showTimeSelect
                        selected={
                          formData.startTime ? dayjs()
                            .hour(
                              parseInt(formData.startTime.split(":")[0])
                            )
                            .minute(
                              parseInt(formData.startTime.split(":")[1])
                            )
                            .toDate() : null
                        }
                        timeIntervals={15}
                        showTimeSelectOnly
                        dateFormat="h:mm aa"
                        id="time-only-picker"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              startTime: "please select start time"
                            })
                          } else {
                            setFormErrors({ ...formErrors, startTime: "" })
                          }

                          const formattedTime = dayjs(date).format("HH:mm")

                          setFormData({
                            ...formData,
                            startTime: formattedTime
                          })
                        }}
                        placeholderText="Enter Start Time"
                        customInput={
                          <CustomTextField
                            label="Event Start Time"
                            fullWidth
                            error={!!formErrors.startTime}
                            helperText={formErrors.startTime}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <AppReactDatepicker
                        showTimeSelect
                        selected={
                          formData.endTime ? dayjs()
                            .hour(parseInt(formData.endTime.split(":")[0]))
                            .minute(
                              parseInt(formData.endTime.split(":")[1])
                            )
                            .toDate() : null
                        }
                        timeIntervals={15}
                        showTimeSelectOnly
                        dateFormat="h:mm aa"
                        id="time-only-picker"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              endTime: "please select end time"
                            })
                          } else {
                            setFormErrors({ ...formErrors, endTime: "" })
                          }

                          const formattedTime = dayjs(date).format("HH:mm")

                          setFormData({
                            ...formData,
                            endTime: formattedTime
                          })
                        }}
                        placeholderText="Enter End Time"
                        customInput={
                          <CustomTextField
                            label="Event End Time"
                            fullWidth
                            error={!!formErrors.endTime}
                            helperText={formErrors.endTime}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={6} md={6}>
                      <AppReactDatepicker
                        selected={
                          formData.date && dayjs.isDayjs(formData.date) ? formData.date.toDate() : formData.date
                        }
                        id="basic-input"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              date: "please select start date"
                            })
                          } else {
                            setFormErrors({ ...formErrors, date: "" })
                          }
                          setFormData({
                            ...formData,
                            date: new Date(dayjs(date).format("MM/DD/YYYY"))
                          })
                        }}
                        placeholderText="Enter Start Date"
                        customInput={
                          <CustomTextField
                            label="Event Start Date"
                            fullWidth
                            error={!!formErrors.date}
                            helperText={formErrors.date}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={6} sm={6}>
                      <CustomTextField
                        error={!!formErrors.location}
                        helperText={formErrors.location}
                        label="Location *"
                        fullWidth
                        placeholder="Enter Location"
                        value={formData.location}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setFormData({
                            ...formData,
                            location: e.target.value
                          })
                          if (e.target?.value?.length) {
                            setFormErrors({ ...formErrors, location: "" })
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <label className="text-[0.8125rem] leading-[1.153]">
                        Description *
                      </label>

                      <EditorBasic
                        content={formData.description}
                        onContentChange={handleContentChange}

                        error={!!formErrors.description}
                        helperText={formErrors.description}
                      />

                      {/* <EditorCustom /> */}
                      {/* <EditorBasic
                        content={formData.description}
                        onContentChange={(content: string) => {
                          setFormData({
                            ...formData,
                            description: content,
                          });
                          if (content.length) {
                            setFormErrors({ ...formErrors, description: "" });
                          }
                        }}
                        error={!!formErrors.description}
                      /> */}
                      {/* <CKEditor
                        editor={ClassicEditor}
                        data={formData.description}
                        onChange={(event: any, editor: any) => {
                          if (editor) {
                            const data = editor.getData();
                            setFormData((prevFormData) => ({ ...prevFormData, description: data }));
                            if (data?.length) {
                              setFormErrors((prevFormErrors) => ({ ...prevFormErrors, description: "" }));
                            }
                          }
                        }}
                      /> */}

                      {formErrors.description && (
                        <p className="ml-[-2px] mt-2 MuiFormHelperText-root Mui-error MuiFormHelperText-sizeSmall MuiFormHelperText-contained mui-1ou7mfh-MuiFormHelperText-root">
                          {formErrors.description}
                        </p>
                      )}
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sm={5}>
                    <Grid item xs={12} sm={12}>
                      <p className="text-[#4e4b5a] my-2"> Thumbnail Image * </p>
                      <div className="flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md">
                        <Box
                          {...getEventRootProps({ className: "dropzone" })}
                          {...featureImage}
                        >
                          <input {...getEventInputProps()} />
                          <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                            {open == EDIT_EVENT && !isFeatureImageTouched && (
                              <img
                                className="object-contain w-full h-full"
                                src={
                                  process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
                                  "/" +
                                  editingRow?.featureImageUrl
                                }
                              />
                            )}
                            {featureImage && isFeatureImageTouched && (
                              <img
                                key={featureImage.name}
                                alt={featureImage.name}
                                className="object-contain w-full h-full"
                                src={URL.createObjectURL(featureImage)}
                              />
                            )}

                            {!featureImage &&
                              !isFeatureImageTouched &&
                              open !== EDIT_EVENT && (
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
                          {!!formErrors.featureImageUrl && (
                            <p className="text-[#ff5054]">
                              {" "}
                              {formErrors.featureImageUrl}
                            </p>
                          )}
                        </Box>
                      </div>
                    </Grid>
                  </Grid>
                </Box>
              </div>
              <Grid container spacing={2} rowSpacing={5} sm={12}>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.organizerName}
                    helperText={formErrors.organizerName}
                    label="Organizer Name *"
                    fullWidth
                    placeholder="Enter Organizer Name"
                    value={formData.organizerName}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, organizerName: "" })
                      setFormData({
                        ...formData,
                        organizerName: e.target.value
                      })
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.organizerEmail}
                    helperText={formErrors.organizerEmail}
                    label="Organizer Email *"
                    fullWidth
                    placeholder="Enter Organizer Email"
                    value={formData.organizerEmail}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, organizerEmail: "" })
                      setFormData({
                        ...formData,
                        organizerEmail: e.target.value
                      })
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.organizerPhone}
                    helperText={formErrors.organizerPhone}
                    label="Organizer Phone Number *"
                    fullWidth
                    placeholder="Enter Organizer Phone Number"
                    value={formData.organizerPhone}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, organizerPhone: "" })
                      setFormData({
                        ...formData,
                        organizerPhone: e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10)
                      })
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    label="Registration Link"
                    fullWidth
                    placeholder="Enter Registration Link"
                    value={formData.registrationLink}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        registrationLink: e.target.value
                      })
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <label className="text-[0.8125rem] leading-[1.153]">
                    Status
                  </label>
                  <Switch
                    size="medium"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                  />
                </Grid>
              </Grid>
            </div>
            <Box display="flex" gap={4}>
              <Grid container spacing={2} sm={12}>
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
                      variant="tonal"
                      color="error"
                      type="reset"
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </Button>
                    {permissionUser &&
                      <Button
                        variant="contained"
                        type="submit"
                        onClick={() => handleSubmit()}
                      >
                        {open === ADD_EVENT ? "Add" : "Edit"} Event
                      </Button>
                    }
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </div>
        </div>
      </Card>
    </>
  )
}

export default EventForm
