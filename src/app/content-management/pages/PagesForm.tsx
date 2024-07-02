// React Imports
import { useEffect, useState } from "react";
// MUI Imports
import Button from "@mui/material/Button";
// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { Box, Card, Grid, Switch } from "@mui/material";
import { ADD_SECTION, EDIT_SECTION, UsersType } from "@/types/apps/userTypes";
import BreadCrumbList from "./BreadCrumbList";
import { get, post } from "@/services/apiService";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { pages } from "@/services/endpoint/pages";

type Props = {
  open: ADD_SECTION | EDIT_SECTION;
};

type FormDataType = {
  id: number;
  name: string;
  slug: string;
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

const PagesForm = ({ open }: Props) => {
  const router = useRouter();
  const query = usePathname().split("/");
  const [formData, setFormData] = useState<FormDataType | UsersType>(
    initialData
  );
  const [formErrors, setFormErrors] = useState<{
    name: string;
    slug: string;
  }>(initialErrorData);

  const [loading, setLoading] = useState<boolean>(true);

  const validateFormData = (arg1: FormDataType) => {
    if (arg1.name.trim().length === 0) {
      setFormErrors({ ...formErrors, name: "This field is required" });
    } else if (arg1.slug.trim().length === 0) {
      setFormErrors({ ...formErrors, slug: "This field is required" });
    } else if (false) {
    } else {
      return true;
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    if (
      validateFormData({
        id: formData.id,
        name: formData.name,
        slug: formData.slug,
        status: formData.status,
      })
    ) {
      const result = await post(
        open === sectionActions.EDIT ? pages.update : pages.create,
        open === sectionActions.EDIT
          ? {
              sectionId: formData.id,
              sectionName: formData.name,
              active: formData.status,
            }
          : {
              sectionName: formData.name,
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
    const org = localStorage.getItem("orgName");
    try {
      const result = await post(pages.getById, {
        organizationName: !!org ? org : "pabs",
        id: id,
      });
      const { data } = result;

      setFormData({
        ...formData,
        id: data.pageId,
        name: data.title,
        slug: data.slug,
        jsonContent: JSON.stringify(data.content),
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
                  <label className="text-[0.8125rem] leading-[1.153]">
                    Status
                  </label>
                  <Switch
                    size="medium"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={12}></Grid>

                <Grid item xs={12}>
                  <Box
                    p={2}
                    display="flex"
                    gap={2}
                    justifyContent="end"
                    bgcolor="background.paper"
                    position="sticky"
                    bottom={0}
                    zIndex={10}
                  >
                    <Button
                      variant="tonal"
                      color="error"
                      type="reset"
                      onClick={() => handleReset()}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit">
                      {open === sectionActions.ADD ? "Add" : "Edit"} Page
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

export default PagesForm;
