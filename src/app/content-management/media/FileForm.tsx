
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
    ListItem,
    List,
} from "@mui/material";
import CustomTextField from "@/@core/components/mui/TextField";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";
import { useRouter } from "next/navigation";
import { ADD_BLOG, blogDetailType, EDIT_BLOG } from "@/types/apps/blogsType";
import { postContentBlock } from "@/services/apiService";
import { media } from "@/services/endpoint/media";

type blogFormPropsTypes = {
    open: number;
    editingRow: blogDetailType | null;
    handleClose: Function;
    permissionUser:Boolean
};

const validImageType = ["image/png","image/jpeg","image/jpg","image/gif","image/svg","image/svg+xml","video/mp4", "video/webm" ];  

const MAX_FILES = 10;

const initialFormData = {
    id: -1,
    templateId: -1,
    title: "",
};

const initialErrorData = {
    templateId: "",
    title: "",
    filesError: "",
};

type FileProp = {
    name: string;
    type: string;
    size: number;
};

function FileForm({ open, editingRow, handleClose ,permissionUser}: blogFormPropsTypes) {
    const router = useRouter();

    const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<typeof initialErrorData>(initialErrorData);
    const [loading, setLoading] = useState<boolean>(false);
    const [files, setFiles] = useState<File[]>([]);

    // Hooks
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            const newFiles = acceptedFiles.map((file: File) => Object.assign(file));
            if (files.length + newFiles.length > MAX_FILES) {
                setFormErrors({
                    ...formErrors,
                    filesError: `You can only upload up to ${MAX_FILES} files.`,
                });
                return;
            }
            setFiles([...files, ...newFiles]);
        }
    });

    const renderFilePreview = (file: FileProp) => {
        if (file.type.startsWith('image')) {
            return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />;
        } else {
            return <i className='tabler-file-description' />;
        }
    };

    const handleRemoveFile = (file: FileProp) => {
        const filtered = files.filter((i: FileProp) => i.name !== file.name);
        setFiles([...filtered]);
    };

    const fileList = files.map((file: FileProp) => (
        <ListItem key={file.name}>
            <div className='file-details'>
                <div className='file-preview'>{renderFilePreview(file)}</div>
                <div>
                    <Typography className='file-name'>{file.name}</Typography>
                    <Typography className='file-size' variant='body2'>
                        {Math.round(file.size / 100) / 10 > 1000
                            ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
                            : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
                    </Typography>
                </div>
            </div>
            <IconButton onClick={() => handleRemoveFile(file)}>
                <i className='tabler-x text-xl' />
            </IconButton>
        </ListItem>
    ));

    const handleRemoveAllFiles = () => {
        setFiles([]);
    };

    const validateForm = () => {
        let valid = true;
        let errors = { ...initialErrorData };

        if (open === ADD_BLOG && files.length === 0) {
            errors.filesError = "At least one file is required";
            valid = false;
        }

        if (files.some((file: any) => !validImageType.includes(file.type))) {
            errors.filesError = `Invalid file type. Allowed types are ${validImageType.join(", ")}.`;
            valid = false;
        }

        if (files.length > MAX_FILES) {
            errors.filesError = `You can only upload up to ${MAX_FILES} files.`;
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleSubmit = async (active: boolean) => {
        if (validateForm()) {
            try {
                setLoading(true);
                const formDataToSend = new FormData();
               
              

                files.forEach((file: any, index: any) => {
                    formDataToSend.append(`media`, file);
                });

                let result = null;
                // if (open === EDIT_BLOG) {
                //     formDataToSend.set("blogId", String(editingRow?.blogId));
                //     result = await postContentBlock(media.upload, formDataToSend);
                // } else {

                    result = await postContentBlock(media.upload, formDataToSend);
                // }

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
                        <IconButton color="info" onClick={() => { }}>
                            <i className="tabler-external-link text-textSecondary"></i>
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
            <Card className="p-4">
                <Box display="flex" alignItems="flex-start">
                    <Grid container spacing={12} sm={12}>
                      
                        <Grid item xs={12} sm={12}>
                            <p className="text-[#4e4b5a] my-2">Files *</p>
                            <div
                                className={`flex items-center flex-col border border-dashed border-gray-300 rounded-md ${!!formErrors.filesError && "border-red-400"
                                    }`}
                            >
                                <div {...getRootProps({ className: "dropzone" })}>
                                    <input {...getInputProps()} />
                                    <div className="flex items-center flex-col">
                                        <Avatar variant="rounded" className="bs-12 is-12 mbe-9">
                                            <i className="tabler-upload" />
                                        </Avatar>
                                        <Typography variant="h4" className="mbe-2.5">
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
                                            thorough your machine
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            {formErrors.filesError && (
                                <Typography color="error" variant="body2">
                                    {formErrors.filesError}
                                </Typography>
                            )}
                            {files.length ? (
                                <>
                                    <List>{fileList}</List>
                                    <div className="buttons">
                                        <Button color="error" variant="outlined" onClick={handleRemoveAllFiles}>
                                            Remove All
                                        </Button>
                                    </div>
                                </>
                            ) : null}
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
                                    variant="outlined"
                                    onClick={() => handleClose()}
                                    sx={{ minWidth: 150 }}
                                >
                                    Cancel
                                </Button>
                                {permissionUser && 
                                <Button
                                    variant="contained"
                                    onClick={() => handleSubmit(true)}
                                    sx={{ minWidth: 150 }}
                                >
                                    Save
                                </Button>
                                }
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Card>
        </>
    );
}

export default FileForm;
