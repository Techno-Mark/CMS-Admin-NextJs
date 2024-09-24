/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable multiline-ternary */
// React Imports
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// MUI Imports
import Button from "@mui/material/Button";
// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { Box, Card, Grid, Switch } from "@mui/material";
import { post } from "@/services/apiService";
import BreadCrumbList from "@/components/BreadCrumbList";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { toast } from "react-toastify";
import {
  ADD_CAREER,
  careerDetailType,
  EDIT_CAREER,
} from "@/types/apps/careerType";
import { career } from "@/services/endpoint/career";
import dynamic from "next/dynamic";
// Dynamically import CKEditor to prevent SSR issues
const MyCKEditor = dynamic(() => import("../blogs/EditorCustom"), {
  ssr: false,
});

type CareerFormPropsTypes = {
  open: number;
  editingRow: careerDetailType | null;
  handleClose: Function;
  permissionUser: Boolean;
};

const initialData = {
  careerId: 0,
  jobTitle: "",
  yearsOfExperience: 0,
  numberOfPosition: 0,
  mode: "",
  location: "",
  subTitle: "",
  description: "",
  slug: "",
  active: false,
};

const initialErrorData = {
  jobTitle: "",
  yearsOfExperience: "",
  numberOfPosition: "",
  mode: "",
  location: "",
  subTitle: "",
  description: "",
  slug: "",
};

const CareerForm = ({
  open,
  handleClose,
  editingRow,
  permissionUser,
}: CareerFormPropsTypes) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<typeof initialData>(initialData);
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);

  // Hooks
  useEffect(() => {
    if (open === EDIT_CAREER && editingRow) {
      setFormData({ ...editingRow });
    }
    setLoading(false);
  }, []);

  const handleEditorChangeCKEditor = (data: any) => {
    // setEditorData(data)
    setFormData((prevData) => ({
      ...prevData,
      description: data,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    const slugRegex = /^[a-zA-Z0-9/-]+$/;

    if (!slugRegex.test(newSlug)) {
      setFormErrors({
        ...formErrors,
        slug: "Slug must be alphanumeric with no spaces, or underscores",
      });
    } else {
      setFormErrors({ ...formErrors, slug: "" });
    }

    setFormData((prevData) => ({
      ...prevData,
      slug: newSlug,
    }));
  };

  const validateForm = () => {
    let valid = true;
    const errors = { ...initialErrorData };
    const slugRegex = /^[a-zA-Z0-9/-]+$/;

    if (!formData.jobTitle) {
      errors.jobTitle = "Please enter job title";
      valid = false;
    }
    if (!formData.yearsOfExperience) {
      errors.yearsOfExperience = "Please enter years of experience";
      valid = false;
    }
    if (!formData.numberOfPosition) {
      errors.numberOfPosition = "Please enter number of positions";
      valid = false;
    }
    if (!formData.mode) {
      errors.mode = "Please enter mode";
      valid = false;
    }
    if (!formData.location) {
      errors.location = "Please enter location";
      valid = false;
    }
    if (!formData.subTitle) {
      errors.subTitle = "Please enter sub title";
      valid = false;
    }
    if (!formData.description) {
      errors.description = "Please enter description";
      valid = false;
    }
    if (formData.slug.trim().length === 0) {
      errors.slug = "Slug is required";
      valid = false;
    } else if (!slugRegex.test(formData.slug)) {
      errors.slug =
        "Slug must be alphanumeric with no spaces or special characters.";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);

        const data = {
          jobTitle: formData.jobTitle,
          yearsOfExperience: formData.yearsOfExperience,
          numberOfPosition: formData.numberOfPosition,
          mode: formData.mode,
          location: formData.location,
          subTitle: formData.subTitle,
          description: formData.description,
          slug: formData.slug,
          active: formData.active,
        };

        let result = null;
        if (open == EDIT_CAREER) {
          result = await post(career.update, {
            ...data,
            careerId: editingRow?.careerId,
          });
        } else {
          result = await post(career.create, data);
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
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div>
          <div className="flex flex-col gap-6 p-6">
            <div>
              <Box display="flex" gap={4}>
                <Grid container spacing={2} rowSpacing={5}>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      error={!!formErrors.jobTitle}
                      helperText={formErrors.jobTitle}
                      label="Job Title *"
                      fullWidth
                      placeholder="Enter Job Title"
                      value={formData.jobTitle}
                      onChange={(e) => {
                        setFormErrors({ ...formErrors, jobTitle: "" });
                        setFormData({
                          ...formData,
                          jobTitle: e.target.value,
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      error={!!formErrors.subTitle}
                      helperText={formErrors.subTitle}
                      label="Sub Title *"
                      fullWidth
                      placeholder="Enter Sub Title"
                      value={formData.subTitle}
                      onChange={(e) => {
                        setFormErrors({ ...formErrors, subTitle: "" });
                        setFormData({
                          ...formData,
                          subTitle: e.target.value,
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <label className="text-[0.8125rem] leading-[1.153]">
                      Status
                    </label>
                    <Switch
                      size="medium"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      error={!!formErrors.yearsOfExperience}
                      helperText={formErrors.yearsOfExperience}
                      label="Years of Experience *"
                      fullWidth
                      placeholder="Enter Years of Experience"
                      value={formData.yearsOfExperience}
                      onChange={(e) => {
                        const value = e.target.value.trim();

                        if (
                          /^\d*$/.test(value) &&
                          value.toString().length <= 10
                        ) {
                          setFormErrors({
                            ...formErrors,
                            yearsOfExperience: "",
                          });
                          setFormData({
                            ...formData,
                            yearsOfExperience: value === "" ? 0 : Number(value),
                          });
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      error={!!formErrors.numberOfPosition}
                      helperText={formErrors.numberOfPosition}
                      label="Number of Position *"
                      fullWidth
                      placeholder="Enter Number of Position"
                      value={formData.numberOfPosition}
                      onChange={(e) => {
                        const value = e.target.value.trim();

                        if (
                          /^\d*$/.test(value) &&
                          value.toString().length <= 10
                        ) {
                          setFormErrors({
                            ...formErrors,
                            numberOfPosition: "",
                          });
                          setFormData({
                            ...formData,
                            numberOfPosition: value === "" ? 0 : Number(value),
                          });
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      error={!!formErrors.mode}
                      helperText={formErrors.mode}
                      label="Mode *"
                      fullWidth
                      placeholder="Enter Mode"
                      value={formData.mode}
                      onChange={(e) => {
                        setFormErrors({ ...formErrors, mode: "" });
                        setFormData({
                          ...formData,
                          mode: e.target.value,
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      error={!!formErrors.location}
                      helperText={formErrors.location}
                      label="Location *"
                      fullWidth
                      placeholder="Enter Location"
                      value={formData.location}
                      onChange={(e) => {
                        setFormErrors({ ...formErrors, location: "" });
                        setFormData({
                          ...formData,
                          location: e.target.value,
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      error={!!formErrors.slug}
                      helperText={formErrors.slug}
                      label="Slug *"
                      fullWidth
                      placeholder="Enter Slug"
                      value={formData.slug}
                      onChange={handleSlugChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <p
                      className={`${formErrors.description ? "text-[#ff5054] text-[13px]" : " text-[#4e4b5a] text-[13px]"}`}
                    >
                      Description *
                    </p>

                    <MyCKEditor
                      onChange={handleEditorChangeCKEditor}
                      initialValue={editingRow?.description}
                    />
                    {!!formErrors.description && (
                      <p className="text-[#ff5054] text-[13px]">{formErrors.description}</p>
                    )}
                    {/* <div>
                <div dangerouslySetInnerHTML={{ __html: formData.description }} />
              </div> */}
                  </Grid>
                </Grid>
              </Box>
            </div>
          </div>
        </div>
      </Card>

      <Grid item xs={12} style={{ position: "sticky", bottom: 0, zIndex: 10 }}>
        <Box
          p={5}
          display="flex"
          gap={2}
          justifyContent="end"
          bgcolor="background.paper"
        >
          <Button
            variant="tonal"
            color="error"
            type="reset"
            size="small"
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
          {permissionUser && (
            <Button
              variant="contained"
              type="submit"
              size="small"
              onClick={() => handleSubmit()}
            >
              {open === ADD_CAREER ? "Add" : "Edit"} Career
            </Button>
          )}
        </Box>
      </Grid>
    </>
  );
};

export default CareerForm;
