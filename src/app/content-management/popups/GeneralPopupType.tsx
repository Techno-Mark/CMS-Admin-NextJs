"use client";

import LoadingBackdrop from "@/components/LoadingBackdrop";
import {
  Button,
  Box,
  Card,
  Grid,
  Typography,
  Avatar,
  IconButton,
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
  handleSubmit:Function
};

const validImageType = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

const initialFormData = {
  id: -1,
  heading: "",
  supportingLine: "",
  btnText: "",
  image: "",
};

const initialErrorData = {
  id: -1,
  heading: "",
  supportingLine: "",
  btnText: "",
  image: "",
};

function GeneralPopupType({
  open,
  handleClose,
  editingRow,
  handleSubmit
}: blogFormPropsTypes) {
  const router = useRouter();

  const [popupType, setPopupType] = useState("Event");

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

export default GeneralPopupType;
