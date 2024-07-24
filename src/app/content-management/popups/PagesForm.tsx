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
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { post, postContentBlock } from "@/services/apiService";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";

import { category } from "@/services/endpoint/category";
import { popups } from "@/services/endpoint/popup";
import { PopupTypes } from "./popupTypes";
import EditorCustom from "./RichEditor";

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: PopupTypes | null;
  setEditingRow: React.Dispatch<React.SetStateAction<PopupTypes | null>>;
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
  popupId: "",
  title: "",
  description: "",
  active: false,
  buttonText: "",
  buttonRedirectLink: "",
};

const initialErrorData = {
  title: "",
  popupFileError: "",
  thumbnailImageError: "",
  buttonRedirectLink: "",
  buttonText: "",
  description: "",
  active: null,
};

function PopupForm({ open, handleClose, setEditingRow, editingRow }: Props) {
  const router = useRouter();

  // State management hooks
  const [popupFile, setPopupFile] = useState<File | null>(null);
  const [formData, setFormData] =
    useState<typeof initialFormData>(initialFormData);

  // Error handler hooks
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    if (editingRow) {
      // setFormData(editingRow);

      if (editingRow.description) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          description: editingRow.description,
        }));
      }

      if (editingRow.popupFile) {
        const fileUrl =
          process.env.NEXT_PUBLIC_BACKEND_BASE_URL + "/" + editingRow.popupFile;
        fetch(fileUrl)
          .then(async (res) => {
            const blob = await res.blob();
            const file = new File([blob], editingRow.popupFile, {
              type: blob.type,
            });
            setPopupFile(file);
          })
          .catch((err) => console.error("Failed to fetch popup file:", err));
      }

      setLoading(false);
    } else {
      setFormData(initialFormData);
      setLoading(false);
    }
  }, [editingRow]);

  // Custom hooks
  const {
    getRootProps: getBannerRootProps,
    getInputProps: getBannerInputProps,
  } = useDropzone({
    multiple: false,
    accept: validFileTypes.reduce((acc: any, type) => {
      const [category] = type.split("/");
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(`.${type.split("/")[1]}`);
      return acc;
    }, {}),
    onDrop: (acceptedFiles: File[]) => {
      setFormErrors({ ...formErrors, popupFileError: "" });
      setPopupFile(acceptedFiles[0]);
    },
  });

  // Validation before submit
  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };

    if (!formData.title) {
      errors.title = "Please enter a blog title";
      valid = false;
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
      valid = false;
    } else if (formData.title.length > 255) {
      errors.title = "Title must be at most 255 characters long";
      valid = false;
    }

    if (!formData.buttonText) {
      errors.buttonText = "Please enter a Button Text";
      valid = false;
    }

    if (!formData.buttonRedirectLink) {
      errors.buttonRedirectLink = "Please enter a Button Redirect link";
      valid = false;
    }

    if (!formData.description) {
      errors.description = "Please enter a description";
      valid = false;
    }

    // Validate Banner File
    if (!popupFile) {
      errors.popupFileError = "Popup File is required";
      valid = false;
    } else if (!validFileTypes.includes(popupFile.type)) {
      errors.popupFileError = `Invalid file type for Popup File. Allowed types ${validFileTypes.join(
        ","
      )}`;
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);

        const formDataToSend = new FormData();
        if (formData.popupId && editingRow && editingRow.popupId) {
          formDataToSend.set("popupId", formData.popupId);
        }
        formDataToSend.set("title", formData.title);
        formDataToSend.set("buttonText", formData.buttonText);
        formDataToSend.set("buttonRedirectLink", formData.buttonRedirectLink);
        formDataToSend.set("description", formData.description);
        formDataToSend.set("active", formData.active.toString());
        if (popupFile) {
          formDataToSend.append("popupFile", popupFile as Blob);
          console.log(popupFile);
        }
        const result = await postContentBlock(
          editingRow?.popupId ? popups.update : popups.create,
          formDataToSend
        );
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
                  error={!!formErrors.buttonText}
                  helperText={formErrors.buttonText}
                  label="Popup Button text"
                  fullWidth
                  value={formData.buttonText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, buttonText: e.target.value });
                    if (e.target?.value?.length) {
                      setFormErrors({ ...formErrors, buttonText: "" });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  multiline
                  error={!!formErrors.buttonRedirectLink}
                  helperText={formErrors.buttonRedirectLink}
                  label="Popup Redirect Link"
                  fullWidth
                  value={formData.buttonRedirectLink}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setFormData({
                      ...formData,
                      buttonRedirectLink: e.target.value,
                    });
                    if (e.target?.value?.length) {
                      setFormErrors({ ...formErrors, buttonRedirectLink: "" });
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" sx={{ mr: 0 }}>
                  Status
                </Typography>
                <Switch
                  size="medium"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <p className="text-[#4e4b5a]">Description *</p>
                <EditorCustom
                  setContent={(content: any) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      description: content,
                    }))
                  }
                  content={formData.description}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4} sm={5}>
              <Grid item xs={12} sm={12}>
                <p className="text-[#4e4b5a]">Popup File * </p>
                <div
                  className={`flex items-center flex-col w-[400px] h-[400px] border border-dashed border-gray-300 rounded-md ${
                    !!formErrors.popupFileError && "border-red-400"
                  }`}
                >
                  <Box {...getBannerRootProps({ className: "dropzone" })}>
                    <input {...getBannerInputProps()} />
                    <div className="flex items-center justify-center flex-col w-[400px] h-[300px] border border-dashed border-gray-300 rounded-md p-2">
                      {popupFile ? (
                        popupFile.type.startsWith("image/") ? (
                          <img
                            key={popupFile.name}
                            alt={popupFile.name}
                            className="object-contain w-full h-full"
                            src={URL.createObjectURL(popupFile)}
                          />
                        ) : (
                          <video
                            key={popupFile.name}
                            className="object-contain w-full h-full"
                            controls
                          >
                            <source
                              src={URL.createObjectURL(popupFile)}
                              type={popupFile.type}
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
                    {!!formErrors.popupFileError && (
                      <p className="text-[#ff5054]">
                        {formErrors.popupFileError}
                      </p>
                    )}
                  </Box>
                </div>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
      <Grid item xs={12} style={{ position: "sticky", bottom: 0, zIndex: 10 }}>
        <Box
          p={7}
          display="flex"
          gap={2}
          justifyContent="end"
          bgcolor="background.paper"
        >
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            onClick={(event) => {
              handleSubmit(event);
            }}
          >
            {open === -1 ? "Add" : "Edit"} Popup
          </Button>
        </Box>
      </Grid>
    </>
  );
}

export default PopupForm;
