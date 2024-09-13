"use client"

import {
  Button,
  Box,
  Card,
  Grid,
  Avatar,
  CardActions,
  Typography,
  ButtonGroup,
  Tooltip,
  CardContent
} from "@mui/material"
import CustomTextField from "@/@core/components/mui/TextField"
import React, { useEffect, useState } from "react"

import { useDropzone } from "react-dropzone"
import {
  post,
  postDataToOrganizationAPIs
} from "@/services/apiService"
import { template } from "@/services/endpoint/template"
import { category } from "@/services/endpoint/category"
import { tag } from "@/services/endpoint/tag"
import { blogDetailType } from "@/types/apps/blogsType"

type blogFormPropsTypes = {
  open: number;
  handleClose: Function;
  editingRow: blogDetailType | null;
  handleSubmit:Function
};

// const validImageType = ["image/png", "image/jpeg", "image/jpg", "image/gif"]

// const sectionActions = {
//   ADD: -1,
//   EDIT: 1
// }

const initialFormData = {
  id: -1,
  question: "",
  options: [] as string[],
  btnText: "",
  image: ""
}

const initialErrorData = {
  id: -1,
  question: "",
  options: "",
  btnText: "",
  image: ""
}

function SurveyPopupType({
  open,
  handleClose,
  editingRow,
  handleSubmit
}: blogFormPropsTypes) {
  // state management hook
  const [image, setImage] = useState<File | null>(null)
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData) // form data hooks
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData)

  // template list hooks & other list apis data
  const [setTemplateList] = useState<
    [{ templateName: string; templateId: number }] | []
  >([])
  const [setLoading] = useState<boolean>(true)

  // Custom Hooks
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
      multiple: false,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"]
      },
      onDrop: (acceptedFiles: File[]) => {
        setFormErrors({ ...formErrors, image: "" })
        setImage(acceptedFiles[0])
      }
    })

  // Effects
  useEffect(() => {
    async function getTemplate() {
      await getRequiredData()
      // if (editingRow && open == EDIT_BLOG) {
      // }
    }
    getTemplate()
  }, [])

  // Get Active Template List
  const getRequiredData = async () => {
    try {
      setLoading(true)
      const [templateResponse] =
        await Promise.all([
          post(`${template.active}`, {}),
          postDataToOrganizationAPIs(`${category.active}`, {}),
          postDataToOrganizationAPIs(`${tag.active}`, {})
        ])
      setTemplateList(templateResponse?.data?.templates)

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }

  // validation before submit
  // const validateForm = () => {
  //   const valid = true
  //   const errors = { ...initialErrorData }

  //   setFormErrors(errors)
  //   return valid
  // }

  return (
    <>
      <Card className="p-4">
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={7}>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                // disabled={true}
                error={!!formErrors.question}
                helperText={formErrors.question}
                label="Question*"
                fullWidth
                placeholder="Heading"
                value={formData.question}
                onChange={(e) => {
                  setFormData({ ...formData, question: e.target.value })
                }}
              />
            </Grid>

            <Grid item xs={12} style={{ marginBottom: "10px" }}>
              <Card variant="outlined">
                <CardActions>
                  <Grid item xs={2}>
                    <ButtonGroup variant="tonal" size="small">
                      <Tooltip title={`Add new at 1st position`}>
                        <Button
                          size="small"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              options: [...formData.options, ""]
                            })
                          }
                        >
                          <i className="tabler-plus" />
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </Grid>
                </CardActions>

                <CardContent>
                  {formData?.options.map(
                    (multipleSection: any, multipleSectionIndex: any) => (
                      <Card
                        key={`group-${multipleSectionIndex}`}
                        variant="outlined"
                        style={{ marginBottom: "16px" }}
                      >
                        <CardActions>
                          <Grid container xs={12} sm={12} spacing={2}>
                            <Grid item xs={10}></Grid>
                            <Grid item xs={2}>
                              <ButtonGroup variant="tonal" size="small">
                                <Tooltip title={`Add`}>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      const data = { ...formData }
                                      data.options.splice(
                                        multipleSectionIndex + 1,
                                        0,
                                        ""
                                      )

                                      setFormData(data)
                                    }}
                                  >
                                    <i className="tabler-plus" />
                                  </Button>
                                </Tooltip>

                                <Tooltip title={`Remove`}>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      const data = { ...formData }
                                      data.options.splice(
                                        multipleSectionIndex,
                                        1
                                      )

                                      setFormData(data)
                                    }}
                                  >
                                    <i className="tabler-minus" />
                                  </Button>
                                </Tooltip>
                              </ButtonGroup>
                            </Grid>
                          </Grid>
                        </CardActions>
                        <CardContent>
                          <Box key={`${formData}`} sx={{ mb: 2 }}>
                            <Grid container spacing={2} item xs={12} sm={12}>
                              <CustomTextField
                                multiline
                                type="text"
                                onChange={(e: any) => {
                                  const data = { ...formData }
                                  data.options[multipleSectionIndex] =
                                    e.target.value

                                  setFormData(data)
                                }}
                                fullWidth
                                margin="normal"
                                value={formData.options[multipleSectionIndex]}
                              />
                            </Grid>
                          </Box>
                        </CardContent>
                      </Card>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={12}>
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
          </Grid>

          <Grid container spacing={4} sm={5}>
            <Grid item xs={12} sm={12} className="mt-[-15px]">
              <p className="text-[#4e4b5a] my-2">Popup Image * </p>
              <div
                className={`flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md ${!!formErrors.image && "border-red-400"}`}
              >
                <Box
                  {...getImageRootProps({ className: "dropzone" })}
                  {...image}
                >
                  <input {...getImageInputProps()} />
                  <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                    {image ? (
                      <img
                        key={image.name}
                        alt={image.name}
                        className="object-contain w-full h-full"
                        // src={URL.createObjectURL(bannerImage)}
                        src={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/${image}`}
                      />
                    ) : (
                      <>
                        <Avatar variant="rounded" className="bs-12 is-12 mbe-9">
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
                  variant="contained"
                  color="error"
                  type="reset"
                  onClick={() => {
                    handleClose()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  onClick={() => handleSubmit(true)}
                >
                  Save & Update
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  )
}

export default SurveyPopupType
