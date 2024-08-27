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
import { ADD_BLOG, blogDetailType, EDIT_BLOG } from "@/types/apps/blogsType";
import EditorBasic from "@/components/EditorToolbar";
import EditorCustom from "./EditorCustom";
import dynamic from "next/dynamic";
// import MyCKEditor from "./EditorCustom";

// Dynamically import CKEditor to prevent SSR issues
const MyCKEditor = dynamic(() => import('./EditorCustom'), {
  ssr: false
})

type blogFormPropsTypes = {
  open: number;
  editingRow: blogDetailType | null;
  handleClose: Function;
};

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

function BlogForm({ open, editingRow, handleClose }: blogFormPropsTypes) {
  const router = useRouter();

  //state management hook
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [isImageBannerTouched, setIsImageBannerTouched] = useState({
    bannerImage: false,
    thumbnailImage: false,
  });
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
      setIsImageBannerTouched({ ...isImageBannerTouched, bannerImage: true });
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
      setIsImageBannerTouched({
        ...isImageBannerTouched,
        thumbnailImage: true,
      });
    },
  });

  //Effects
  useEffect(() => {
    async function getBlogPostRelatedData() {
      await getRequiredData();
      if (editingRow && open == EDIT_BLOG) {
        const formData = {
          templateId: editingRow.templateId,
          id: editingRow.blogId,
          authorName: editingRow.authorName,
          categories: editingRow.categories.split(","),
          tags: editingRow.tags.split(","),
          description: editingRow.description,
          metaDescription: editingRow.metaDescription,
          metaTitle: editingRow.metaTitle,
          metaKeywords: editingRow.metaKeywords,
          title: editingRow.title,
          slug: editingRow.slug,
        };
        setFormData({ ...formData, status: 0 });
      } else {
        setFormData({ ...initialFormData });
        setFormErrors({ ...initialErrorData });
      }
    }
    getBlogPostRelatedData();
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
    if (open == ADD_BLOG && !bannerImage) {
      errors.bannerImageError = "Banner Image is required";
      valid = false;
    }
    if (bannerImage && !validImageType.includes(bannerImage.type)) {
      errors.bannerImageError = `Invalid file type for Banner Image. Allowed types ${validImageType.join(",")}`;
      valid = false;
    }

    // Validate Thumbnail Image
    if (open == ADD_BLOG && !thumbnailImage) {
      errors.thumbnailImageError = "Thumbnail Image is required";
      valid = false;
    }
    if (thumbnailImage && !validImageType.includes(thumbnailImage.type)) {
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
        formDataToSend.set("active", String(active));
        formDataToSend.set("tags", formData.tags.join(","));
        formDataToSend.set("categories", formData.categories.join(","));
        if (bannerImage) {
          formDataToSend.append("bannerImage", bannerImage as Blob);
        }
        if (thumbnailImage) {
          formDataToSend.append("thumbnailImage", thumbnailImage as Blob);
        }

        let result = null;
        if (open == EDIT_BLOG) {
          formDataToSend.set("blogId", String(editingRow?.blogId));
          result = await postContentBlock(blogPost.update, formDataToSend);
        } else {
          result = await postContentBlock(blogPost.create, formDataToSend);
        }

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
  const handleEditorChange = (content: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: content,
    }));
    if (content?.length) {
      setFormErrors((prevFormErrors) => ({
        ...prevFormErrors,
        description: "",
      }));
    }
  };

  const handleContentChange = (content: any) => {
    setFormData((prevData) => ({
      ...prevData,
      description: content,
    }));
  };

  const [editorData, setEditorData] = useState<string>('')

  const handleEditorChangeCKEditor = (data: any) => {
    // setEditorData(data)
    setFormData((prevData) => ({
      ...prevData,
      description: data,
    }));
    console.log('Editor data:', data)
  }

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Box display="flex" alignItems="center">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={11}>
            <BreadCrumbList />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton color="info" onClick={() => { }}>
              <i className="tabler-external-link text-textSecondary"></i>
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      <Card className="p-4">
        <Box display="flex" rowGap={4} columnGap={4} alignItems="flex-start">
          <Grid container spacing={4} sm={7}>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                // disabled={true}
                error={!!formErrors.title}
                helperText={formErrors.title}
                label="Blog Title *"
                fullWidth
                value={formData.title}
                onChange={handleBlogTitleChange}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <CustomTextField
                // disabled={open === sectionActions.EDIT}
                // error={!!formErrors.slug}
                InputProps={{
                  startAdornment: (
                    '/blog/'
                  )
                }}
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
              <p className="text-[#4e4b5a]">Description *</p>

              <MyCKEditor
                onChange={handleEditorChangeCKEditor}
                initialValue={formData.description}
              />
              {/* <div>
                <div dangerouslySetInnerHTML={{ __html: formData.description }} />
              </div> */}

              {/* <EditorBasic
                content={formData.description}
                onContentChange={handleContentChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
              /> */}
            </Grid>
            <Grid item xs={12} sm={12}>
              <CustomTextField
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
          <Grid container spacing={6} sm={5}>
            <Grid item xs={12} sm={12}>
              <p className="text-[#4e4b5a] my-2"> Banner Image * </p>
              <div
                className={`flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md ${!!formErrors.bannerImageError && "border-red-400"}`}
              >
                <Box
                  {...getBannerRootProps({ className: "dropzone" })}
                  {...bannerImage}
                >
                  <input {...getBannerInputProps()} />
                  <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                    {open == EDIT_BLOG && !isImageBannerTouched.bannerImage && (
                      <img
                        className="object-contain w-full h-full"
                        src={
                          process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
                          "/" +
                          editingRow?.bannerImageUrl
                        }
                      />
                    )}
                    {bannerImage && isImageBannerTouched.bannerImage && (
                      <img
                        key={bannerImage.name}
                        alt={bannerImage.name}
                        className="object-contain w-full h-full"
                        src={URL.createObjectURL(bannerImage)}
                      />
                    )}
                    {!bannerImage &&
                      !isImageBannerTouched.bannerImage &&
                      open !== EDIT_BLOG && (
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
                  {!!formErrors.bannerImageError && (
                    <p className="text-[#ff5054]">
                      {formErrors.bannerImageError}
                    </p>
                  )}
                </Box>
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <p className="text-[#4e4b5a] my-2"> Thumbnail Image * </p>
              <div className="flex items-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md">
                <Box
                  {...getThumbnailRootProps({ className: "dropzone" })}
                  {...thumbnailImage}
                >
                  <input {...getThumbnailInputProps()} />
                  <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                    {open == EDIT_BLOG &&
                      !isImageBannerTouched.thumbnailImage && (
                        <img
                          className="object-contain w-full h-full"
                          src={
                            process.env.NEXT_PUBLIC_BACKEND_BASE_URL +
                            "/" +
                            editingRow?.thumbnailImageUrl
                          }
                        />
                      )}
                    {thumbnailImage && isImageBannerTouched.thumbnailImage && (
                      <img
                        key={thumbnailImage.name}
                        alt={thumbnailImage.name}
                        className="object-contain w-full h-full"
                        src={URL.createObjectURL(thumbnailImage)}
                      />
                    )}

                    {!thumbnailImage &&
                      !isImageBannerTouched.thumbnailImage &&
                      open !== EDIT_BLOG && (
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
                  {!!formErrors.thumbnailImageError && (
                    <p className="text-[#ff5054]">
                      {" "}
                      {formErrors.thumbnailImageError}
                    </p>
                  )}
                </Box>
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Grid item xs={12} sm={12}>
                <CustomTextField
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
