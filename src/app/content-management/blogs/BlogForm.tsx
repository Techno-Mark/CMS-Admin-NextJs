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
import { post } from "@/services/apiService";
import { template } from "@/services/endpoint/template";

const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

type FileProp = {
  name: string;
  type: string;
  size: number;
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
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData);
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);
  const [templateList, setTemplateList] = useState<
    [{ templateName: string; templateId: number }] | []
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  //Custom Hooks
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles.map((file: File) => Object.assign(file)));
    },
  });

  const img = files.map((file: FileProp) => (
    <img
      key={file.name}
      alt={file.name}
      className="single-file-image"
      src={URL.createObjectURL(file as any)}
      width={"450px"}
      height={"400px"}
    />
  ));

  //Effects
  useEffect(() => {
    async function getTemplate() {
      await getActiveTemplateList();
    }
    getTemplate();
  }, []);

  // Methods
  const getActiveTemplateList = async () => {
    try {
      setLoading(true);
      const result = await post(`${template.active}`, {});
      const { data } = result;
      setTemplateList(data.templates);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Card>
        <div>
          <form className="flex flex-col gap-6 p-6">
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, authorName: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    {...getRootProps({ className: "dropzone" })}
                    {...(files.length && { sx: { height: 400, width: 400 } })}
                  >
                    <input {...getInputProps()} />
                    {files.length ? (
                      img
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
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography> </Typography>
                  <Box
                    {...getRootProps({ className: "dropzone" })}
                    {...(files.length && { sx: { height: 400, width: 400 } })}
                  >
                    <input {...getInputProps()} />
                    {files.length ? (
                      img
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
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
                    onChange={(e: any, newVal: string[]) =>
                      setFormData({ ...formData, tags: [...newVal] })
                    }
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
                    onChange={(e: any, newVal: string[]) =>
                      setFormData({ ...formData, categories: [...newVal] })
                    }
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, metaKeywords: e.target.value })
                    }
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
                    <Button color="warning" variant="contained">
                      {/* {open === sectionActions.ADD ? "Add" : "Edit"} Content Block */}{" "}
                      Save as Draft
                    </Button>
                    <Button variant="contained" type="submit">
                      {/* {open === sectionActions.ADD ? "Add" : "Edit"} Content Block */}{" "}
                      Save & Publish
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </form>
        </div>
      </Card>
    </>
  );
}

export default BlogForm;
