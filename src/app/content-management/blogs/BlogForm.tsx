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

const validImageType = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

const options = [
  "tag1",
  "tag2",
  "tag3",
  "category1",
  "category2",
  "category3",
  "Ralph Hubbard",
  "Omar Alexander",
  "Carlos Abbott",
  "Miriam Wagner",
  "Bradley Wilkerson",
  "Virginia Andrews",
  "Kelly Snyder",
];

const initialFormData = {
  id: -1,
  templateId: -1,
  title: "",
  slug: "",
  authorName: "",
  categories: ["category1", "category2", "category3"] as string[],
  tags: ["tag1", "tag2", "tag3"] as string[],
  description: "",
  status: 0,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const initialErrorData = {
  templateId: "",
  title: "",
  slug: "",
  authorName: "",
  bannerImageError: "",
  thumbnailImageError: "",
  categories: "",
  tags: "",
  description: "",
  status: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

function BlogForm({ action }: any) {
  const router = useRouter();

  //state management hook
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData); // form data hooks

  //Error Handler Hooks
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false);

  //template list hooks & other list apis data
  const [templateList, setTemplateList] = useState<
    [{ templateName: string; templateId: number }] | []
  >([]);
  const [tagsList, setTagsList] = useState<[{ tagName: string }] | []>([]);
  const [categoryList, setCategoryList] = useState<
    [{ categoryName: string }] | []
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  //Custom Hooks
  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
  } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setFormErrors({ ...formErrors, bannerImageError: "" });
      setBannerImage(acceptedFiles[0]);
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

  const bannerImg = bannerImage ? (
    <img
      key={bannerImage.name}
      alt={bannerImage.name}
      className="single-file-image"
      src={URL.createObjectURL(bannerImage)}
      width={"350px"}
      height={"350px"}
    />
  ) : null;

  const thumbnailImg = thumbnailImage ? (
    <img
      key={thumbnailImage.name}
      alt={thumbnailImage.name}
      className="single-file-image"
      src={URL.createObjectURL(thumbnailImage)}
      width={"350px"}
      height={"350px"}
    />
  ) : null;

  //Effects
  useEffect(() => {
    async function getTemplate() {
      await getRequiredData();
    }
    getTemplate();
  }, []);

  // Methods
  //handle title  change
  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      title: newName,
      slug:
        !isSlugManuallyEdited && open === sectionActions.ADD
          ? newName
              .replace(/[^\w\s]|_/g, "")
              .replace(/\s+/g, "-")
              .toLowerCase()
          : prevData.slug,
    }));
    if (newName?.length) {
      setFormErrors({ ...formErrors, title: "" });
    }
  };

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
      setCategoryList(categoryResponse?.data?.categories);
      setTagsList(tagResponse?.data?.tags);
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

    if (formData.templateId === -1) {
      errors.templateId = "Please select a template";
      valid = false;
    }
    if (!formData.title) {
      errors.title = "Please enter a blog title";
      valid = false;
    }
    if (!formData.slug) {
      errors.slug = "Please enter a slug";
      valid = false;
    }
    if (!formData.authorName) {
      errors.authorName = "Please enter an author name";
      valid = false;
    }
    if (!formData.description) {
      errors.description = "Please enter a description";
      valid = false;
    }
    if (!formData.metaTitle) {
      errors.metaTitle = "Please enter a meta title";
      valid = false;
    }
    if (formData.metaTitle && formData.metaTitle.length > 160) {
      errors.metaTitle = "meta title must be less than 160 character";
      valid = false;
    }
    if (!formData.metaDescription) {
      errors.metaDescription = "Please enter a meta description";
      valid = false;
    }
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.metaTitle = "meta description must be less than 160 character";
      valid = false;
    }
    if (!formData.metaKeywords) {
      errors.metaKeywords = "Please enter meta keywords";
      valid = false;
    }
    if (formData.metaKeywords && formData.metaKeywords.length > 160) {
      errors.metaKeywords = "meta keywords must be less than 160 character";
      valid = false;
    }

    // Validate Banner Image
    if (!bannerImage) {
      errors.bannerImageError = "Banner Image is required";
      valid = false;
    } else if (!validImageType.includes(bannerImage.type)) {
      errors.bannerImageError = "Invalid file type for Banner Image";
      valid = false;
    }

    // Validate Thumbnail Image
    if (!thumbnailImage) {
      errors.thumbnailImageError = "Thumbnail Image is required";
      valid = false;
    } else if (!validImageType.includes(thumbnailImage.type)) {
      errors.thumbnailImageError = "Invalid file type for Thumbnail Image";
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  // handle submit
  const handleSubmit = async (active: boolean) => {
    if (validateForm()) {
      try {
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.set("templateId", String(formData.templateId));
        formDataToSend.set("title", formData.title);
        formDataToSend.set("slug", formData.slug);
        formDataToSend.set("authorName", formData.authorName);
        formDataToSend.set("description", formData.description);
        formDataToSend.set("metaTitle", formData.metaTitle);
        formDataToSend.set("metaDescription", formData.metaDescription);
        formDataToSend.set("metaKeywords", formData.metaKeywords);
        formDataToSend.append("bannerImage", bannerImage as Blob);
        formDataToSend.append("thumbnailImage", thumbnailImage as Blob);
        formDataToSend.set("active", String(active));
        formDataToSend.set("tags", formData.tags.join(","));
        formDataToSend.set("categories", formData.categories.join(","));
        // console.log(formDataToSend.get("bannerImage"));
        const result = await postContentBlock(blogPost.create, formDataToSend);
        setLoading(false);
        if (result.status === "success") {
          toast.success(result.message);
          router.back();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Card>
        <div>
          <div className="flex flex-col gap-6 p-6">
            <Box display="flex" alignItems="center">
              <Grid container spacing={4}>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    error={!!formErrors.templateId}
                    helperText={formErrors.templateId}
                    select
                    fullWidth
                    defaultValue=""
                    value={formData.templateId}
                    label="Select Template"
                    id="custom-select"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (Number(e.target.value) === -1) {
                        setFormErrors({
                          ...formErrors,
                          templateId: "please select template",
                        });
                      } else {
                        setFormErrors({ ...formErrors, templateId: "" });
                      }
                      setFormData({
                        ...formData,
                        templateId: Number(e.target.value),
                      });
                    }}
                  >
                    <MenuItem value={-1}>
                      <em>Select Template</em>
                    </MenuItem>
                    {!loading &&
                      !!templateList.length &&
                      templateList.map((template) => {
                        return (
                          <MenuItem
                            value={template.templateId}
                            key={template.templateName}
                          >
                            {template.templateName}
                          </MenuItem>
                        );
                      })}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    // disabled={true}
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                    label="Blog Title *"
                    fullWidth
                    placeholder="Enter Blog Title"
                    value={formData.title}
                    onChange={handleBlogTitleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                      setFormData({ ...formData, slug: e.target.value });
                      setIsSlugManuallyEdited(true);
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, slug: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      // disabled={open === sectionActions.EDIT}
                      // error={!!formErrors.slug}
                      error={!!formErrors.authorName}
                      helperText={formErrors.authorName}
                      label="Author Name *"
                      fullWidth
                      placeholder=""
                      value={formData.authorName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setFormData({
                          ...formData,
                          authorName: e.target.value,
                        });
                        if (e.target?.value?.length) {
                          setFormErrors({ ...formErrors, authorName: "" });
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    {...getBannerRootProps({ className: "dropzone" })}
                    {...(bannerImage && { sx: { height: 400, width: 400 } })}
                  >
                    <input {...getBannerInputProps()} />
                    {bannerImage ? (
                      bannerImg
                    ) : (
                      <div className="flex items-center flex-col border-dashed border-2 p-16">
                        <Typography variant="h4" className="mbe-2.5">
                          Banner Image*
                        </Typography>
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
                      </div>
                    )}
                    {!!formErrors.bannerImageError && (
                      <p className="text-[#ff5054]">
                        {formErrors.bannerImageError}
                      </p>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    {...getThumbnailRootProps({ className: "dropzone" })}
                    {...(thumbnailImage && { sx: { height: 400, width: 400 } })}
                  >
                    <input {...getThumbnailInputProps()} />
                    {thumbnailImage ? (
                      thumbnailImg
                    ) : (
                      <div className="flex items-center justify-center flex-col border-dashed border-2 p-16">
                        <Typography variant="h4" className="mbe-2.5">
                          Thumbnail Image*
                        </Typography>
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
                      </div>
                    )}
                    {!!formErrors.thumbnailImageError && (
                      <p className="text-[#ff5054]">
                        {" "}
                        {formErrors.thumbnailImageError}
                      </p>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={10}
                    minRows={7}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    label="Description *"
                    fullWidth
                    placeholder="Enter Detail About Blog Post"
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, description: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    multiple
                    id="autocomplete-grouped"
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <CustomTextField {...params} label="Tags" />
                    )}
                    options={options}
                    value={formData.tags}
                    onChange={(e: any, newVal: string[]) => {
                      setFormData({ ...formData, tags: [...newVal] });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    multiple
                    id="autocomplete-grouped"
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <CustomTextField {...params} label="Categories" />
                    )}
                    options={options}
                    value={formData.categories}
                    onChange={(e: any, newVal: string[]) => {
                      setFormData({ ...formData, categories: [...newVal] });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={2}
                    minRows={2}
                    error={!!formErrors.metaTitle}
                    helperText={formErrors.metaTitle}
                    label="Meta Title* (maximum-character: 60 )"
                    fullWidth
                    placeholder=""
                    value={formData.metaTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({ ...formData, metaTitle: e.target.value });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaTitle: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={10}
                    minRows={7}
                    error={!!formErrors.metaDescription}
                    helperText={formErrors.metaDescription}
                    label="Meta Description* (maximum-character: 160 )"
                    fullWidth
                    placeholder=""
                    value={formData.metaDescription}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaDescription: "" });
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    // disabled={true}
                    multiline
                    maxRows={4}
                    minRows={4}
                    error={!!formErrors.metaKeywords}
                    helperText={formErrors.metaKeywords}
                    label="Meta Keywords* (maximum-character: 160 )"
                    fullWidth
                    placeholder=""
                    value={formData.metaKeywords}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData({
                        ...formData,
                        metaKeywords: e.target.value,
                      });
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, metaKeywords: "" });
                      }
                    }}
                  />
                </Grid>
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
                      // onClick={() => handleReset()}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="warning"
                      variant="contained"
                      onClick={() => handleSubmit(false)}
                    >
                      {/* {open === sectionActions.ADD ? "Add" : "Edit"} Content Block */}{" "}
                      Save as Draft
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      onClick={() => handleSubmit(true)}
                    >
                      {/* {open === sectionActions.ADD ? "Add" : "Edit"} Content Block */}{" "}
                      Save & Publish
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </div>
        </div>
      </Card>
    </>
  );
}

export default BlogForm;
