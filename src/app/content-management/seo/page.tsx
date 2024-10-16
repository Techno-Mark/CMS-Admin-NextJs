"use client";

import LoadingBackdrop from "@/components/LoadingBackdrop";
import { Button, Box, Card, Grid, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { post, postDataToOrganizationAPIs } from "@/services/apiService";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";
import CustomTextField from "@/@core/components/mui/TextField";
import { robotSEO } from "@/services/endpoint/robotSEO";

interface GoogleAnalytics {
  beforeScript: string[];
  afterScript: string[];
}

interface FormData {
  robotText: string;
  googleAnalytics: GoogleAnalytics;
  facebookScript: string;
}

interface FormErrors {
  robotText: string;
  googleAnalytics: {
    beforeScript: string[];
    afterScript: string[];
  };
  facebookScript: string;
}

const initialFormData: FormData = {
  robotText: "",
  googleAnalytics: {
    beforeScript: [""],
    afterScript: [""],
  },
  facebookScript: "",
};

const initialErrorData: FormErrors = {
  robotText: "",
  googleAnalytics: {
    beforeScript: [""],
    afterScript: [""],
  },
  facebookScript: "",
};

function RobotSEO() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>(initialErrorData);

  // Effects
  useEffect(() => {
    getRobotSEOData();
  }, []);

  async function getRobotSEOData() {
    try {
      setLoading(true);
      const result = await post(robotSEO.getDetail, {});

      setLoading(false);
      if (result.status === "success") {
        // Ensure beforeScript and afterScript are arrays
        const beforeScripts = Array.isArray(
          result?.data.googleAnalytics?.beforeScript
        )
          ? result.data.googleAnalytics.beforeScript
          : [result.data.googleAnalytics?.beforeScript || ""];

        const afterScripts = Array.isArray(
          result?.data.googleAnalytics?.afterScript
        )
          ? result.data.googleAnalytics.afterScript
          : [result.data.googleAnalytics?.afterScript || ""];

        // Set the state with extracted values
        setFormData({
          ...result.data,
          googleAnalytics: {
            ...result.data.googleAnalytics,
            beforeScript: beforeScripts,
            afterScript: afterScripts,
          },
        });
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  function validateForm() {
    let isValid = true;
    const errors = { ...initialErrorData }; // Reset errors to initial state

    if (!formData.robotText.trim()) {
      errors.robotText = "Robot text is required";
      isValid = false;
    }

    // Validate beforeScript fields
    errors.googleAnalytics.beforeScript =
      formData.googleAnalytics.beforeScript.map((script) => {
        if (!script.trim()) {
          isValid = false;
          return "Before script is required";
        }
        return "";
      });

    // Validate afterScript fields
    errors.googleAnalytics.afterScript =
      formData.googleAnalytics.afterScript.map((script) => {
        if (!script.trim()) {
          isValid = false;
          return "After script is required";
        }
        return "";
      });

    if (!formData.facebookScript.trim()) {
      errors.facebookScript = "Facebook script text is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }

  const handleSitemapGenerate = async () => {
    try {
      setLoading(true);
      const result = await postDataToOrganizationAPIs(
        robotSEO.generateSitemap,
        {}
      );
      setLoading(false);

      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Add new script input fields
  const handleAddField = (type: keyof GoogleAnalytics) => {
    setFormData((prevData) => ({
      ...prevData,
      googleAnalytics: {
        ...prevData.googleAnalytics,
        [type]: [...prevData.googleAnalytics[type], ""], // Add empty field
      },
    }));
  };

  // Remove script input fields
  const handleRemoveField = (type: keyof GoogleAnalytics, index?: number) => {
    setFormData((prevData) => {
      const updatedFields = [...prevData.googleAnalytics[type]];

      // If index is provided, remove the specific index, otherwise remove the last one
      const removeIndex =
        index !== undefined ? index : updatedFields.length - 1;

      // Ensure at least one field remains
      if (updatedFields.length > 1) {
        updatedFields.splice(removeIndex, 1); // Remove the field
      }

      return {
        ...prevData,
        googleAnalytics: {
          ...prevData.googleAnalytics,
          [type]: updatedFields,
        },
      };
    });
  };

  const handleFieldChange = (
    type: keyof GoogleAnalytics,
    index: number,
    value: string
  ) => {
    const updatedFields = [...formData.googleAnalytics[type]];
    updatedFields[index] = value;

    setFormData({
      ...formData,
      googleAnalytics: {
        ...formData.googleAnalytics,
        [type]: updatedFields,
      },
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    setFormErrors(initialErrorData);
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await postDataToOrganizationAPIs(
      robotSEO.saveAndUpdate,
      formData
    );
    setLoading(false);

    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

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
                size="medium"
                onClick={handleSitemapGenerate}
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
                  const { value } = e.target;
                  setFormData({ ...formData, robotText: value });
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Google Analytics Before Script Section */}
        <div className="flex justify-end mt-3">
          <Box display="flex" justifyContent="center" marginTop={2}>
            {/* Add Button */}
            <Button size="small" onClick={() => handleAddField("beforeScript")}>
              <i className="tabler-plus" />
            </Button>

            {/* Remove Button */}
            <Button
              size="small"
              onClick={() => handleRemoveField("beforeScript")}
              disabled={formData.googleAnalytics.beforeScript.length <= 1}
            >
              <i className="tabler-minus" />
            </Button>
          </Box>
        </div>
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={12}>
            {formData.googleAnalytics.beforeScript.map((script, index) => (
              <Grid item xs={12} key={index} display="flex" alignItems="center">
                <CustomTextField
                  multiline
                  minRows={2}
                  maxRows={4}
                  error={!!formErrors.googleAnalytics.beforeScript[index]}
                  helperText={formErrors.googleAnalytics.beforeScript[index]}
                  label={`Head Before Script ${index + 1}`}
                  fullWidth
                  value={script}
                  onChange={(e) =>
                    handleFieldChange("beforeScript", index, e.target.value)
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Google Analytics After Script Section */}
        <div className="flex justify-end mt-3">
          <Box display="flex" justifyContent="center" marginTop={2}>
            {/* Add Button */}
            <Button size="small" onClick={() => handleAddField("afterScript")}>
              <i className="tabler-plus" />
            </Button>

            {/* Remove Button */}
            <Button
              size="small"
              onClick={() => handleRemoveField("afterScript")}
              disabled={formData.googleAnalytics.afterScript.length <= 1}
            >
              <i className="tabler-minus" />
            </Button>
          </Box>
        </div>
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={12}>
            {formData.googleAnalytics.afterScript.map((script, index) => (
              <Grid item xs={12} key={index} display="flex" alignItems="center">
                <CustomTextField
                  multiline
                  minRows={2}
                  maxRows={4}
                  error={!!formErrors.googleAnalytics.afterScript[index]}
                  helperText={formErrors.googleAnalytics.afterScript[index]}
                  label={`Head After Script ${index + 1}`}
                  fullWidth
                  value={script}
                  onChange={(e) =>
                    handleFieldChange("afterScript", index, e.target.value)
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid marginTop={5} item xs={12}>
          <CustomTextField
            multiline
            minRows={10}
            maxRows={15}
            error={!!formErrors.facebookScript}
            helperText={formErrors.facebookScript}
            label="Facebook Script*"
            fullWidth
            value={formData.facebookScript}
            onChange={(e) => {
              const { value } = e.target;
              setFormData({ ...formData, facebookScript: value });
            }}
          />
        </Grid>

        <Box display="flex" justifyContent="flex-end" marginTop={4}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Box>
      </Card>
    </>
  );
}

export default RobotSEO;
