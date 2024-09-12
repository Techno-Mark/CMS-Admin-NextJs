"use client";

import LoadingBackdrop from "@/components/LoadingBackdrop";
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
} from "@mui/material";
import CustomTextField from "@/@core/components/mui/TextField";
import React, { ChangeEvent, useEffect, useState } from "react";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  post,
  postContentBlock,
  postDataToOrganizationAPIs,
} from "@/services/apiService";
import { template } from "@/services/endpoint/template";
import { blogPost } from "@/services/endpoint/blogpost";
import { category } from "@/services/endpoint/category";
import { tag } from "@/services/endpoint/tag";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";
import { blogDetailType, EDIT_BLOG } from "@/types/apps/blogsType";
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker";
import { Heading } from "lucide-react";

type blogFormPropsTypes = {
  open: number;
  handleClose: Function;
  editingRow: blogDetailType | null;
  handleSubmit: Function;
};

const validImageType = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

const initialFormData = {
  id: -1,
  date: new Date().toString(),
  title: "",
  heading: "",
  supportingLine: "",
  btnText: "",
  btnLink: "",
  image: "",
};

const initialErrorData = {
  id: -1,
  date: "",
  title: "",
  heading: "",
  supportingLine: "",
  btnText: "",
  btnLink: "",
  image: "",
};

function EventPopupForm({ open, handleClose, editingRow,handleSubmit }: blogFormPropsTypes) {
  const router = useRouter();

  const [allPages, setAllPages] = useState(false);

  //state management hook
  const [image, setImage] = useState<File | null>(null);
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData); // form data hooks
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);

  //template list hooks & other list apis data
  const [templateList, setTemplateList] = useState<
    [{ templateName: string; templateId: number }] | []
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  //Custom Hooks
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
      multiple: false,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      },
      onDrop: (acceptedFiles: File[]) => {
        setFormErrors({ ...formErrors, image: "" });
        setImage(acceptedFiles[0]);
      },
    });

  //Effects
  useEffect(() => {
    async function getTemplate() {
      await getRequiredData();
      if (editingRow && open == EDIT_BLOG) {
      }
    }
    getTemplate();
  }, []);

  // Get Active Template List
  const getRequiredData = async () => {
    try {
      setLoading(true);
      const [templateResponse, categoryResponse, tagResponse] =
        await Promise.all([
          post(`${template.active}`, {}),
          postDataToOrganizationAPIs(`${category.active}`, {}),
          postDataToOrganizationAPIs(`${tag.active}`, {}),
        ]);
      setTemplateList(templateResponse?.data?.templates);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  //validation before submit
  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };

    setFormErrors(errors);
    return valid;
  };


  return (
    <>
      <Card className="p-4">
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={7}>

          <Grid item xs={12} lg={12}>
              <FormControlLabel
                label="is Permenent ?"
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

            <Grid item xs={12} lg={6}>
        {/* <AppReactDatepicker
          id='min-date'
          selected={new Date()}
          // minDate={subDays(new Date(), 5)}
          // onChange={(date: Date) => setMinDate(date)}
          customInput={<CustomTextField label='Start Date' fullWidth />}
        /> */}
      </Grid>
      <Grid item xs={12} lg={6}>
        {/* <AppReactDatepicker
          id='max-date'
          selected={new Date()}
          // maxDate={addDays(new Date(), 5)}
          // onChange={(date: Date) => setMaxDate(date)}
          customInput={<CustomTextField label='End Date' fullWidth />}
        /> */}
      </Grid>

      

          {/* <Grid item xs={12} lg={12}>
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
            </Grid> */}


            
            <Grid item xs={12} lg={6}>
              <AppReactDatepicker
                id="min-date"
                selected={new Date(formData.date)}
                minDate={new Date()}
                onChange={(date: Date) => {
                  setFormData({ ...formData, date: date.toString() });
                }}
                customInput={<CustomTextField label="Event Date*" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                // disabled={true}
                error={!!formErrors.title}
                helperText={formErrors.title}
                label="Event Title*"
                fullWidth
                placeholder="Event"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                // disabled={true}
                error={!!formErrors.heading}
                helperText={formErrors.heading}
                label="Event Heading*"
                fullWidth
                placeholder="Heading"
                value={formData.heading}
                onChange={(e) => {
                  setFormData({ ...formData, heading: e.target.value });
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                // disabled={true}
                error={!!formErrors.supportingLine}
                helperText={formErrors.supportingLine}
                label="Event Supporting Line*"
                fullWidth
                placeholder="Supporting Line"
                value={formData.supportingLine}
                onChange={(e) => {
                  setFormData({ ...formData, supportingLine: e.target.value });
                }}
              />
            </Grid>
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
                  setFormData({ ...formData, btnText: e.target.value });
                }}
              />
            </Grid>
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
                  setFormData({ ...formData, btnLink: e.target.value });
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
                  color="error"
                  type="reset"
                  onClick={() => {
                    handleClose();
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
  );
}

export default EventPopupForm;
