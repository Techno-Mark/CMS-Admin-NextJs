// React Imports
import { useEffect, useState } from "react";

// MUI Imports
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import { Card, Switch } from "@mui/material";
import { UsersType } from "@/types/apps/userTypes";
import { useRouter } from "next/navigation";

type Props = {
  open: -1 | 0 | 1;
  handleClose: () => void;
  editingRow: UsersType | null;
  setEditingRow: React.Dispatch<React.SetStateAction<UsersType | null>>;
};

type FormDataType = {
  id: number;
  name: string;
  jsonContent: string;
  status: boolean;
};

// Vars
const initialData = {
  id: 0,
  name: "",
  jsonContent: "",
  status: false,
};

const initialErrorData = {
  name: "",
  jsonContent: "",
};

const ContentBlockForm = ({
  open,
  handleClose,
  editingRow,
  setEditingRow,
}: Props) => {
  const [formData, setFormData] = useState<FormDataType | UsersType>(
    initialData
  );
  const [formErrors, setFormErrors] = useState<{
    name: string;
    jsonContent: string;
  }>(initialErrorData);

  useEffect(() => {
    setFormData(!!editingRow ? editingRow : initialData);
  }, [editingRow]);

  const validateFormData = (arg1: FormDataType) => {
    if (arg1.name.trim().length === 0) {
      setFormErrors({ ...formErrors, name: "This field is required" });
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
        jsonContent: formData.jsonContent,
        status: formData.status,
      })
    ) {
      handleClose();
      setFormData(initialData);
    }
  };

  const handleReset = () => {
    handleClose();
    setFormData(initialData);
    setFormErrors(initialErrorData);
    setEditingRow(null);
    router.push("/settings/content-block");
  };

  const router = useRouter();
  return (
    <Card>
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4">
        <Typography variant="h5">
          {open === -1 ? "Add" : "Edit"} Content Block
        </Typography>
        <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
          <IconButton onClick={handleReset}>
            <i className="tabler-x text-[22px] text-textSecondary" />
          </IconButton>
        </div>
      </div>
      <Divider />
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
              setFormData({ ...formData, name: e.target.value });
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
  );
};

export default ContentBlockForm;
