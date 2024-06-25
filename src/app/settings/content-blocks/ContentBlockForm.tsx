// React Imports
import { useEffect, useState } from "react";
// MUI Imports
import Button from "@mui/material/Button";
// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { Box, Card, Grid, Switch } from "@mui/material";
import { ADD_SECTION, EDIT_SECTION, UsersType } from "@/types/apps/userTypes";
import BreadCrumbList from "./BreadCrumbList";
import {
  createSection,
  getSectionById,
  updateSection,
} from "@/app/api/content-block";
import { get, post } from "@/services/apiService";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LoadingBackdrop from "@/components/LoadingBackdrop";

type Props = {
  open: ADD_SECTION | EDIT_SECTION;
};

type FormDataType = {
  id: number;
  name: string;
  slug: string;
  jsonContent: string;
  status: boolean;
};

//enum
const sectionActions = {
  ADD: -1,
  EDIT: 1,
};

// Vars
const initialData = {
  id: 0,
  name: "",
  slug: "",
  jsonContent: "",
  status: false,
};

const initialErrorData = {
  name: "",
  slug: "",
  jsonContent: "",
};

const ContentBlockForm = ({ open }: Props) => {
  const router = useRouter();
  const query = usePathname().split("/");
  const [formData, setFormData] = useState<FormDataType | UsersType>(
    initialData
  );
  const [formErrors, setFormErrors] = useState<{
    name: string;
    slug: string;
    jsonContent: string;
  }>(initialErrorData);
  
  const [loading, setLoading] = useState<boolean>(true);

  const validateFormData = (arg1: FormDataType) => {
    if (arg1.name.trim().length === 0) {
      setFormErrors({ ...formErrors, name: "This field is required" });
    } else if (arg1.slug.trim().length === 0) {
      setFormErrors({ ...formErrors, slug: "This field is required" });
    } else if (arg1.jsonContent.trim().length === 0) {
      setFormErrors({ ...formErrors, jsonContent: "This field is required" });
    } else if (!isValidJSON(arg1.jsonContent).isValid) {
      setFormErrors({
        ...formErrors,
        jsonContent: isValidJSON(arg1.jsonContent).errorText,
      });
    } else if (false) {
    } else {
      return true;
    }

    return false;
  };

  const isValidJSON = (jsonContent: string) => {
    const requiredKeys = [
      "fieldType",
      "fieldLabel",
      "isRequired",
      "validation",
      // 'value'
    ];

    let parsedInput;
    try {
      parsedInput = JSON.parse(jsonContent);
    } catch (error) {
      return {
        isValid: false,
        errorText: "Given Input is not valid JSON String",
      };
    }

    for (let obj of parsedInput) {
      for (let key of requiredKeys) {
        if (!(key in obj)) {
          return { isValid: false, errorText: `Key '${key}' is required` };
        }
      }
    }

    return {
      isValid: true,
      errorText: "",
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    if (
      validateFormData({
        id: formData.id,
        name: formData.name,
        slug: formData.slug,
        jsonContent: formData.jsonContent,
        status: formData.status,
      })
    ) {
      const result = await post(
        open === sectionActions.EDIT ? updateSection : createSection,
        open === sectionActions.EDIT
          ? {
            sectionId: formData.id,
            sectionName: formData.name,
            sectionTemplate: JSON.parse(formData.jsonContent),
            active: formData.status,
          }
          : {
            sectionName: formData.name,
            sectionTemplate: JSON.parse(formData.jsonContent),
            active: formData.status,
          }
      );

      if (result.status === "success") {
        toast.success(result.message);
        handleReset();
        setLoading(false);
      } else {
        toast.error(result.message);
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setFormErrors(initialErrorData);
    router.back();
  };

  const getSectionDataById = async (id: string | number) => {
    setLoading(true);
    try {

      const result = await get(getSectionById(id));
      const { data } = result;
      setFormData({
        ...formData,
        id: data.sectionId,
        name: data.sectionName,
        slug: data.sectionSlug,
        jsonContent: JSON.stringify(data.sectionTemplate),
        status: data.active,
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open === sectionActions.EDIT) {
      getSectionDataById(query[query.length - 1]);
    }
  }, []);

  return (
    <>
      {/* <LoadingBackdrop isLoading={loading} /> */}
      <BreadCrumbList />
      <Card>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
            <Box display="flex" alignItems="center">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>

                  <CustomTextField
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    label="Full Name *"
                    fullWidth
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, name: "" });
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: e.target.value
                          .replace(/[^\w\s]|_/g, "")
                          .replace(/\s+/g, "-")
                          .toLowerCase(),
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <CustomTextField
                    disabled={open === sectionActions.EDIT}
                    error={!!formErrors.slug}
                    helperText={formErrors.slug}
                    label="Slug *"
                    fullWidth
                    placeholder="Enter Slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, slug: "" });
                      if (/^[A-Za-z0-9-]*$/.test(e.target.value)) {
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase(),
                        });
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={1}>
                  <label className="text-[0.8125rem] leading-[1.153]">Status</label>
                  <Switch
                    size="medium"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                  />
                </Grid>


                <Grid item xs={12} sm={12}>
                  <CustomTextField
                    fullWidth
                    rows={9}
                    multiline
                    error={!!formErrors.jsonContent}
                    helperText={formErrors.jsonContent}
                    value={formData.jsonContent}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, jsonContent: "" });
                      setFormData({ ...formData, jsonContent: e.target.value });
                    }}
                    label="JSON Content"
                    placeholder="Enter here..."
                    sx={{
                      "& .MuiInputBase-root.MuiFilledInput-root": {
                        alignItems: "baseline",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box p={2} display="flex" gap={2} justifyContent="end" bgcolor="background.paper" position="sticky" bottom={0} zIndex={10}>

                    <Button
                      variant="tonal"
                      color="error"
                      type="reset"
                      onClick={() => handleReset()}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit">
                      {open === sectionActions.ADD ? "Add" : "Edit"} Content Block
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
};

export default ContentBlockForm;
