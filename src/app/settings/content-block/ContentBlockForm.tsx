// React Imports
import { useEffect, useState } from "react";

// MUI Imports
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { Card, Switch } from "@mui/material";
import { UsersType } from "@/types/apps/userTypes";
import { useRouter } from "next/navigation";
import axios from "axios";
import BreadCrumbList from "./BreadCrumbList";
import { callAPIwithHeaders } from "@/app/api/common/commonAPI";
import { createSection } from "@/app/api/content-block";

type Props = {
  open: -1 | 1;
};

type FormDataType = {
  id: number;
  name: string;
  slug: string;
  jsonContent: string;
  status: boolean;
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
  const [formData, setFormData] = useState<FormDataType | UsersType>(
    initialData
  );
  const [formErrors, setFormErrors] = useState<{
    name: string;
    slug: string;
    jsonContent: string;
  }>(initialErrorData);

  // useEffect(() => {
  //   setFormData(!!editingRow ? editingRow : initialData);
  // }, [editingRow]);

  const validateFormData = (arg1: FormDataType) => {
    if (arg1.name.trim().length === 0) {
      setFormErrors({ ...formErrors, name: "This field is required" });
    } else if (arg1.slug.trim().length === 0) {
      setFormErrors({ ...formErrors, slug: "This field is required" });
    } else if (arg1.jsonContent.trim().length === 0) {
      setFormErrors({ ...formErrors, jsonContent: "This field is required" });
    } else if (!isValidJSON(arg1.jsonContent)) {
      setFormErrors({
        ...formErrors,
        jsonContent: "Given Input is not valid JSON String",
      });
    } else {
      return true;
    }

    return false;
  };

  const isValidJSON = (jsonContent: string) => {
    try {
      JSON.parse(jsonContent);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      validateFormData({
        id: formData.id,
        name: formData.name,
        slug: formData.slug,
        jsonContent: formData.jsonContent,
        status: formData.status,
      })
    ) {
      const callBack = (status: boolean, message: string, data: any) => {
        console.log(status, message, data);
      };

      callAPIwithHeaders(
        createSection.pathName,
        createSection.method,
        callBack,
        {
          sectionName: formData.name,
          sectionTemplate: formData.jsonContent,
          active: formData.status,
        }
      );

      // handleClose();
      setFormData(initialData);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setFormErrors(initialErrorData);
    router.push("/settings/content-block");
  };

  // const getSectionById = async () => {
  //   const response = await axios.post(`/api/section/getById/${editingRow?.id}`);
  // };

  return (
    <>
      <BreadCrumbList />
      <Card>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
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
            <CustomTextField
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
            <div>
              <label className="text-[0.8125rem] leading-[1.153]">Status</label>
              <Switch
                size="medium"
                checked={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked })
                }
              />
            </div>
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="tonal"
                color="error"
                type="reset"
                onClick={() => handleReset()}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                {open === -1 ? "Add" : "Edit"} Content Block
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </>
  );
};

export default ContentBlockForm;
