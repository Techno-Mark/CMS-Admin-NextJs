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
  Switch,
} from "@mui/material";
import CustomTextField from "@/@core/components/mui/TextField";
import React, { ChangeEvent, useEffect, useState } from "react";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { post } from "@/services/apiService";
import { template } from "@/services/endpoint/template";
import { tag } from "@/services/endpoint/tag";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";
import EditorCustom from "./RichEditor";
import { category } from "@/services/endpoint/category";

type blogFormPropsTypes = {
  open: number;
  handleClose: Function;
  editingRow: null;
  setEditingRow: null;
  // editingRow: blogDetailType | null;
};

const validFileTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
];

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

const initialFormData = {
  id: -1,
  title: "",
  description: "",
  active: false,
  btnText: "",
  btnRedirect: "",
};

const initialErrorData = {
  title: "",
  bannerFileError: "",
  thumbnailImageError: "",
  btnRedirect: "",
  btnText: "",
  description: "",
  active: "",
};

// editingRow
function PopupForm({
  open,
  handleClose,
  editingRow,
  setEditingRow,
}: blogFormPropsTypes) {
  const router = useRouter();

  //state management hook
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<typeof initialFormData>(
    initialFormData
  ); // form data hooks

  //Error Handler Hooks
  const [formErrors, setFormErrors] = useState<typeof initialErrorData>(
    initialErrorData
  );
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false);

  //template list hooks & other list apis data
  const [templateList, setTemplateList] = useState<
    [{ templateName: string; templateId: number }] | []
  >([]);
  const [tagsList, setTagsList] = useState<[string] | []>([]);
  const [categoryList, setCategoryList] = useState<[string] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);

  //Custom Hooks
  const { getRootProps: getBannerRootProps, getInputProps: getBannerInputProps } =
    useDropzone({
      multiple: false,
      accept: validFileTypes.reduce((acc:any, type) => {
        const [category] = type.split("/");
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(`.${type.split("/")[1]}`);
        return acc;
      }, {}),
      onDrop: (acceptedFiles: File[]) => {
        setFormErrors({ ...formErrors, bannerFileError: "" });
        setBannerFile(acceptedFiles[0]);
      },
    });

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setFormErrors({ ...formErrors, thumbnailImageError: "" });
      setThumbnailImage(acceptedFiles[0]);
    },
  });

  //Effects
  // useEffect(() => {
  //   async function getTemplate() {

  //   }
  //   getTemplate();
  // }, []);

  // Methods

  //validation before submit
  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };

    if (!formData.title) {
      errors.title = "Please enter a blog title";
      valid = false;
    } else if (formData.title.length < 5) {
      errors.title = "title must be at least 5 characters long";
      valid = false;
    } else if (formData.title.length > 255) {
      errors.title = "title must be at most 255 characters long";
      valid = false;
    }

    if (!formData.btnText) {
      errors.btnText = "Please enter a Button Text";
      valid = false;
    }

    if (!formData.btnRedirect) {
      errors.btnRedirect = "Please enter a Button Redirect link";
      valid = false;
    }
    

    if (!formData.description) {
      errors.description = "Please enter a description";
      valid = false;
    }

    // Validate Banner File
    if (!bannerFile) {
      errors.bannerFileError = "Banner File is required";
      valid = false;
    } else if (!validFileTypes.includes(bannerFile.type)) {
      errors.bannerFileError = `Invalid file type for Banner File. Allowed types ${validFileTypes.join(
        ","
      )}`;
      valid = false;
    }

    // Validate Thumbnail Image
    if (!thumbnailImage) {
      errors.thumbnailImageError = "Thumbnail Image is required";
      valid = false;
    } else if (!validFileTypes.includes(thumbnailImage.type)) {
      errors.thumbnailImageError = `Invalid file type for Thumbnail Image. Allowed types ${validFileTypes.join(
        ","
      )}`;
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);

        // const formDataToSend = new FormData();
        // formDataToSend.set("templateId", String(formData.templateId));
        // formDataToSend.set("title", formData.title);
        // formDataToSend.set("slug", formData.slug);
        // formDataToSend.set("authorName", formData.authorName);
        // formDataToSend.set("description", formData.description);
        // formDataToSend.set("metaTitle", formData.metaTitle);
        // formDataToSend.set("metaDescription", formData.metaDescription);
        // formDataToSend.set("metaKeywords", formData.metaKeywords);
        // formDataToSend.append("bannerFile", bannerFile as Blob);
        // formDataToSend.append("thumbnailImage", thumbnailImage as Blob);
        // formDataToSend.set("active", String(active));
        // formDataToSend.set("tags", formData.tags.join(","));
        // formDataToSend.set("categories", formData.categories.join(","));
        // console.log(formDataToSend.get("bannerFile"));
        // const result = await postContentBlock(blogPost.create, formDataToSend);
        setLoading(false);
        // if (result.status === "success") {
        // toast.success(result.message);
        // router.back();
        // } else {
        // toast.error(result.message);
        // }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  return (
    <>
      {/* <LoadingBackdrop isLoading={loading} /> */}
      <Box display="flex" alignItems="center">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={11}>
            <BreadCrumbList />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="info" onClick={() => {}}>
              <i className="tabler-external-link text-textSecondary"></i>
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
            <Grid container spacing={4} sm={7}>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  // disabled={true}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  label="Popup Title*"
                  fullWidth
                  value={formData.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (e.target?.value?.length) {
                      setFormErrors({ ...formErrors, title: "" });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  // disabled={true}
                  error={!!formErrors.btnText}
                  helperText={formErrors.btnText}
                  label="Popup Button text"
                  fullWidth
                  value={formData.btnText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, btnText: e.target.value });
                    if (e.target?.value?.length) {
                      setFormErrors({ ...formErrors, btnText: "" });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                multiline
                  error={!!formErrors.btnRedirect}
                  helperText={formErrors.btnRedirect}
                  label="Popup Redirect Link"
                  fullWidth
                  value={formData.btnRedirect}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, btnRedirect: e.target.value });
                    if (e.target?.value?.length) {
                      setFormErrors({ ...formErrors, btnRedirect: "" });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                  <Typography variant="body2" sx={{ mr: 0 }}>
                    Status
                  </Typography>
                  <Switch
                    size='medium'
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                  />
                </Grid>
              <Grid item xs={12} sm={12}>
                <p className="text-[#4e4b5a]">Description *</p>

                <EditorCustom
                  setContent={setFormData}
                  content={formData.description}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4} sm={5}>
              <Grid item xs={12} sm={12}>
                <p className="text-[#4e4b5a] my-2">Popup File * </p>
                <div
                  className={`flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md ${
                    !!formErrors.bannerFileError && "border-red-400"
                  }`}
                >
                  <Box
                    {...getBannerRootProps({ className: "dropzone" })}
                    {...bannerFile}
                  >
                    <input {...getBannerInputProps()} />
                    <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                      {bannerFile ? (
                        bannerFile.type.startsWith("image/") ? (
                          <img
                            key={bannerFile.name}
                            alt={bannerFile.name}
                            className="object-contain w-full h-full"
                            src={URL.createObjectURL(bannerFile)}
                          />
                        ) : (
                          <video
                            key={bannerFile.name}
                            className="object-contain w-full h-full"
                            controls
                          >
                            <source
                              src={URL.createObjectURL(bannerFile)}
                              type={bannerFile.type}
                            />
                          </video>
                        )
                      ) : (
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
                    {!!formErrors.bannerFileError && (
                      <p className="text-[#ff5054]">{formErrors.bannerFileError}</p>
                    )}
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
                  <Button variant="outlined" color="error" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit">
                    {open === -1 ? "Add" : "Edit"} Popup
                  </Button>
                </Box>
              </Grid>
         
            </Grid>
          </Box>
        </form>
      </Card>
    </>
  );
}

export default PopupForm;
