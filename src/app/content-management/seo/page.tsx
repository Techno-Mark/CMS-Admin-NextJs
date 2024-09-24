"use client"

import LoadingBackdrop from "@/components/LoadingBackdrop"
import { Button, Box, Card, Grid, Tooltip } from "@mui/material"
import React, { useEffect, useState } from "react"
import { post, postDataToOrganizationAPIs } from "@/services/apiService"
import { toast } from "react-toastify"
import BreadCrumbList from "@/components/BreadCrumbList"
import CustomTextField from "@/@core/components/mui/TextField"
import { robotSEO } from "@/services/endpoint/robotSEO"

const initialFormData = {
  robotText: "",
  googleAnalytics: {
    beforeScript: "",
    afterScript: ""
  },
  facebookScript: ""
}

const initialErrorData = {
  robotText: "",
  googleAnalytics: {
    beforeScript: "",
    afterScript: ""
  },
  facebookScript: ""
}

function RobotSEO() {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState(initialErrorData)

  // Effects
  useEffect(() => {
    getRobotSEOData()
  }, [])

  async function getRobotSEOData() {
    try {
      setLoading(true)
      const data = {
        robotText: formData.robotText,
        googleAnalytics: formData.googleAnalytics ? {
          beforeScript: formData.googleAnalytics.beforeScript || "",
          afterScript: formData.googleAnalytics.afterScript || ""
        } : {},
        facebookScript: formData.facebookScript
      }
      const result = await post(robotSEO.getDetail, data)

      setLoading(false)
      if (result.status === "success") {
        setFormData(result?.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  function validateForm() {
    try {
      let isValid = true
      const errors = { ...formErrors }
      if (!formData.robotText) {
        errors.robotText = "robot text is required"
        isValid = false
      }
      if (!formData.googleAnalytics.beforeScript) {
        errors.googleAnalytics.beforeScript =
          "Head before script text is required"
        isValid = false
      }
      if (!formData.googleAnalytics.afterScript) {
        errors.googleAnalytics.afterScript =
          "Head after script text is required"
        isValid = false
      }
      if (!formData.facebookScript) {
        errors.facebookScript = "Facebook script text is required"
        isValid = false
      }
      setFormErrors(errors)
      return isValid
    } catch (error) {
      console.log("error at validation", error)
    }
  }

  const handleSitemapGenerate = async () => {
    try {
      setLoading(true)
      const result = await postDataToOrganizationAPIs(
        robotSEO.generateSitemap,
        {}
      )
      setLoading(false)

      if (result.status === "success") {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  // handle submit
  const handleSubmit = async (active: boolean) => {
    try {
      setFormErrors(initialErrorData)
      if (!validateForm()) {
        return
      }

      setLoading(true)
      const data = {
        robotText: formData.robotText,
        googleAnalytics: {
          beforeScript: formData.googleAnalytics.beforeScript,
          afterScript: formData.googleAnalytics.afterScript
        },
        facebookScript: formData.facebookScript
      }
      let result = null

      result = await postDataToOrganizationAPIs(robotSEO.saveAndUpdate, data)

      setLoading(false)

      if (result.status === "success") {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Box display="flex" alignItems="center">
        <Grid container spacing={3} display={"flex"} alignItems={"center"}>
          <Grid item flex={"1"}>
            <BreadCrumbList />
          </Grid>
          <Grid item>
            <Tooltip title="Generate Sitemap">
              <Button
                variant="contained"
                color="info"
                type="submit"
                size="medium"
                onClick={() => handleSitemapGenerate()}
              >
                Generate Sitemap
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
      <Card className="p-4">
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={12}>
            <Grid item xs={12}>
              <CustomTextField
                multiline
                minRows={10}
                maxRows={15}
                error={!!formErrors.robotText}
                helperText={formErrors.robotText}
                label="Robot Text*"
                fullWidth
                value={formData.robotText}
                onChange={(e) => {
                  const { value } = e.target
                  setFormData({ ...formData, robotText: value })
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box
          display="flex"
          marginTop={4}
          rowGap={4}
          columnGap={4}
          alignItems="flex-start"
        >
          <Grid container spacing={4} sm={12}>
            <Grid item xs={12}>
              <CustomTextField
                multiline
                minRows={10}
                maxRows={15}
                error={!!formErrors.googleAnalytics.beforeScript}
                helperText={formErrors.googleAnalytics.beforeScript}
                label="Head Before Script"
                fullWidth
                value={formData.googleAnalytics?.beforeScript}
                onChange={(e) => {
                  const { value } = e.target
                  setFormData({
                    ...formData,
                    googleAnalytics: {
                      ...formData.googleAnalytics,
                      beforeScript: value
                    }
                  })
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box
          display="flex"
          marginTop={4}
          rowGap={4}
          columnGap={4}
          alignItems="flex-start"
        >
          <Grid container spacing={4} sm={12}>
            <Grid item xs={12}>
              <CustomTextField
                multiline
                minRows={10}
                maxRows={15}
                error={!!formErrors.googleAnalytics.afterScript}
                helperText={formErrors.googleAnalytics.afterScript}
                label="Head After Script"
                fullWidth
                value={formData.googleAnalytics?.afterScript}
                onChange={(e) => {
                  const { value } = e.target
                  setFormData({
                    ...formData,
                    googleAnalytics: {
                      ...formData.googleAnalytics,
                      afterScript: value
                    }
                  })
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box
          display="flex"
          marginTop={4}
          rowGap={4}
          columnGap={4}
          alignItems="flex-start"
        >
          <Grid container spacing={4} sm={12}>
            <Grid item xs={12}>
              <CustomTextField
                multiline
                minRows={10}
                maxRows={15}
                error={!!formErrors.facebookScript}
                helperText={formErrors.facebookScript}
                label="Facebook Script"
                fullWidth
                value={formData.facebookScript}
                onChange={(e) => {
                  const { value } = e.target
                  setFormData({ ...formData, facebookScript: value })
                }}
              />
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

export default RobotSEO
