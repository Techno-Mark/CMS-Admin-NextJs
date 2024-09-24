"use client";

import LoadingBackdrop from "@/components/LoadingBackdrop";
import { Button, Box, Card, Grid } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import React, { useEffect, useState } from "react";
import { post, postDataToOrganizationAPIs } from "@/services/apiService";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";
import { themeData } from "@/services/endpoint/themeData";

function SocialThemeSetting() {
  const [loading, setLoading] = useState(true);

  const [colors, setColors] = React.useState({
    fontColor: "#ffffff",
  });

  // Effects
  useEffect(() => {
    getThemeData();
  }, []);

  const handleColorChange = (newColor: any, colorType: any) => {
    setColors((prevColors) => ({
      ...prevColors,
      [colorType]: newColor,
    }));
  };

  async function getThemeData() {
    try {
      setLoading(true);
      const data = {
        fontColor: colors.fontColor,
      };
      const result = await post(themeData.getThemeDetail, data);

      setLoading(false);
      if (result.status === "success") {
        setColors((prevColors) => ({
          ...prevColors,
          fontColor: result.data.fontColor || colors.fontColor,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // handle submit
  const handleSubmit = async (active: boolean) => {
    try {
      setLoading(true);
      const data = {
        fontColor: colors.fontColor,
      };
      let result = null;

      result = await postDataToOrganizationAPIs(
        themeData.saveAndUpdateTheme,
        data
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

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Box display="flex" alignItems="center">
        <Grid container spacing={3} display={"flex"} alignItems={"center"}>
          <Grid item flex={"1"}>
            <BreadCrumbList />
          </Grid>
        </Grid>
      </Box>
      <Card className="p-4">
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={12}>
            <Grid item xs={12}>
              <MuiColorInput
                label="Font Color"
                format="hex"
                value={colors.fontColor}
                onChange={(newColor) =>
                  handleColorChange(newColor, "fontColor")
                }
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
  );
}

export default SocialThemeSetting;
