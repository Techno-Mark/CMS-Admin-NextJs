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

const initialFormData = {
  id: -1,
  templateId: -1,
  title: "",
  slug: "",
  authorName: "",
  categories: [] as string[],
  tags: [] as string[],
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

function BlogForm({ open }: any) {
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
  const [tagsList, setTagsList] = useState<[string] | []>([]);
  const [categoryList, setCategoryList] = useState<[string] | []>([]);
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
      className="border border-gray-200 object-contain w-full h-full"
      src={URL.createObjectURL(bannerImage)}
    />
  ) : null;

  const thumbnailImg = thumbnailImage ? (
    <img
      key={thumbnailImage.name}
      alt={thumbnailImage.name}
      className="border border-gray-200 object-contain w-full h-full"
      src={URL.createObjectURL(thumbnailImage)}
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

    if (formData.templateId <= 0) {
      errors.templateId = "Please select a template";
      valid = false;
    }
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
    if (!formData.slug) {
      errors.slug = "Please add a slug";
      valid = false;
    } else if (formData.slug.length < 5) {
      errors.slug = "slug must be at least 5 characters long";
      valid = false;
    } else if (formData.slug.length > 255) {
      errors.slug = "slug must be at most 255 characters long";
      valid = false;
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      errors.slug =
        "slug must be a valid slug (only lowercase letters, numbers, and hyphens are allowed).";
      valid = false;
    }
    if (!formData.authorName) {
      errors.authorName = "Please enter an author name";
      valid = false;
    } else if (formData.authorName.length < 3) {
      errors.authorName = "author name must be at least 3 characters long";
      valid = false;
    } else if (formData.authorName.length > 100) {
      errors.authorName = "author name must be at most 100 characters long";
      valid = false;
    }
    if (!formData.description) {
      errors.description = "Please enter a description";
      valid = false;
    }
    if (!formData.tags.length) {
      errors.tags = "Please select or create new tags";
      valid = false;
    }
    if (!formData.categories.length) {
      errors.categories = "Please select or create new categories";
      valid = false;
    }
    if (!formData.metaTitle) {
      errors.metaTitle = "Please enter a meta title";
      valid = false;
    } else if (formData.metaTitle.length > 160) {
      errors.metaTitle = "meta title must be less than 160 character";
      valid = false;
    }
    if (!formData.metaDescription) {
      errors.metaDescription = "Please enter a meta description";
      valid = false;
    } else if (formData.metaDescription.length > 160) {
      errors.metaDescription =
        "meta description must be less than 160 character";
      valid = false;
    }
    if (!formData.metaKeywords) {
      errors.metaKeywords = "Please enter meta keywords";
      valid = false;
    } else if (formData.metaKeywords.length > 160) {
      errors.metaKeywords = "meta keywords must be less than 160 character";
      valid = false;
    }

    // Validate Banner Image
    if (!bannerImage) {
      errors.bannerImageError = "Banner Image is required";
      valid = false;
    } else if (!validImageType.includes(bannerImage.type)) {
      errors.bannerImageError = `Invalid file type for Banner Image. Allowed types ${validImageType.join(",")}`;
      valid = false;
    }

    // Validate Thumbnail Image
    if (!thumbnailImage) {
      errors.thumbnailImageError = "Thumbnail Image is required";
      valid = false;
    } else if (!validImageType.includes(thumbnailImage.type)) {
      errors.thumbnailImageError = `Invalid file type for Thumbnail Image. Allowed types ${validImageType.join(",")}`;
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
          <div className="flex flex-col gap-2 p-4">
            <Box display="flex" gap={4}>
              <Grid container spacing={1} sm={7}>
                <Grid item xs={12} sm={12}>
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
                      setFormData({ ...formData, slug: e.target.value });
                      setIsSlugManuallyEdited(true);
                      if (e.target?.value?.length) {
                        setFormErrors({ ...formErrors, slug: "" });
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
                  {formData.metaTitle.length <= 60 ? (
                    <p className="text-yellow-500">
                      {60 - formData.metaTitle.length} character left
                    </p>
                  ) : (
                    <p className="text-red-500">
                      you exceeds maximum limit of characters**
                    </p>
                  )}
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
                  {formData.metaDescription.length <= 160 ? (
                    <p className="text-yellow-500">
                      {" "}
                      {160 - formData.metaDescription.length} character left
                    </p>
                  ) : (
                    <p className="text-red-500">
                      you exceeds maximum limit of characters**
                    </p>
                  )}
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
                  {formData.metaKeywords.length <= 160 ? (
                    <p className="text-yellow-500">
                      {" "}
                      {160 - formData.metaKeywords.length} character left
                    </p>
                  ) : (
                    <p className="text-red-500">
                      you exceeds maximum limit of characters**
                    </p>
                  )}
                </Grid>
              </Grid>
              <Grid container spacing={2} sm={5}>
                <Grid item xs={12} sm={12}>
                  <Box
                    {...getBannerRootProps({ className: "dropzone" })}
                    {...bannerImage}
                  >
                    <p className="text-[#4e4b5a]"> Banner Image * </p>
                    <input {...getBannerInputProps()} />
                    {bannerImage ? (
                      bannerImg
                    ) : (
                      <div
                        className={`flex items-center flex-col border-dashed border-2 p-16 ${!!formErrors.bannerImageError && "border-red-400"}`}
                      >
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
                <Grid item xs={12} sm={12}>
                  <Box
                    {...getThumbnailRootProps({ className: "dropzone" })}
                    {...thumbnailImage}
                  >
                    <p className="text-[#4e4b5a]"> Thumbnail Image * </p>
                    <input {...getThumbnailInputProps()} />
                    {thumbnailImage ? (
                      thumbnailImg
                    ) : (
                      <div
                        className={`flex items-center justify-center flex-col border-dashed border-2 p-16 ${!!formErrors.thumbnailImageError && "border-red-400"}`}
                      >
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
                  <Grid item xs={12} sm={12}>
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
                <Grid item xs={12} sm={12}>
                  <CustomAutocomplete
                    id="autocomplete-limit-tags"
                    freeSolo
                    multiple
                    limitTags={3}
                    options={tagsList}
                    value={formData.tags}
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <CustomTextField {...params} label="Tags" />
                    )}
                    onChange={(e: any, newVal: string[]) => {
                      setFormData({ ...formData, tags: [...newVal] });
                      if (newVal.length) {
                        setFormErrors({ ...formErrors, tags: "" });
                      }
                    }}
                  />
                  {!!formErrors.tags && (
                    <p className="text-[#ff5054]">{formErrors.tags}</p>
                  )}
                </Grid>
                <Grid item xs={12} sm={12}>
                  <CustomAutocomplete
                    id="autocomplete-limit-categories"
                    freeSolo
                    multiple
                    limitTags={3}
                    options={categoryList}
                    value={formData.categories}
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <CustomTextField {...params} label="Categories" />
                    )}
                    onChange={(e: any, newVal: string[]) => {
                      setFormData({ ...formData, categories: [...newVal] });
                      if (newVal.length) {
                        setFormErrors({ ...formErrors, categories: "" });
                      }
                    }}
                  />
                  {!!formErrors.categories && (
                    <p className="text-[#ff5054]">{formErrors.categories}</p>
                  )}
                </Grid>
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
                      if (Number(e.target.value) <= 0) {
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
              </Grid>
            </Box>
          </div>
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
      </Card>
    </>
  );
}

export default BlogForm;
