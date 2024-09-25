// React Imports
import { useEffect, useState } from "react"
// MUI Imports
import Button from "@mui/material/Button"
// Component Imports
import { Card, Switch } from "@mui/material"
import BreadCrumbList from "@components/BreadCrumbList"
import CustomTextField from "@core/components/mui/TextField"

import { toast } from "react-toastify"
import { post, get } from "@/services/apiService"
import { usePathname, useRouter } from "next/navigation"
import { ADD_ROLE, EDIT_ROLE, RolesType } from "@/types/apps/rolesType"
import { createRole, updateRole } from "@/services/endpoint/users/roles"
import { getSectionById } from "@/services/endpoint/content-block"

type Props = {
  open: ADD_ROLE | EDIT_ROLE;

};

type FormDataType = {
  id: number;
  roleId: number;
  roleName: string;
  roleDescription: string;
  active: boolean;
};

// enum
const sectionActions = {
  ADD: -1,
  EDIT: 1
}

// Vars
const initialData = {
  id: 0,
  roleId: 0,
  roleName: "",
  roleDescription: "",
  active: false
}

const initialErrorData = {
  roleName: "",
  roleDescription: ""
}

const RolesForm = ({ open }: Props) => {
  const router = useRouter()
  const query = usePathname().split("/")
  const [formData, setFormData] = useState<FormDataType | RolesType>(
    initialData
  )
  const [formErrors, setFormErrors] = useState<{
    roleName: string;
    roleDescription: string;
  }>(initialErrorData)

  const orgId = localStorage.getItem('selectedOrgId')

  const validateFormData = (arg1: {
    roleName: string;
    roleDescription: string | null;
  }) => {
    if (arg1.roleName.trim().length === 0) {
      setFormErrors({ ...formErrors, roleName: "This field is required" })
    } else if (
      !arg1.roleDescription ||
      arg1.roleDescription.trim().length === 0
    ) {
      setFormErrors({
        ...formErrors,
        roleDescription: "This field is required"
      })
    } else {
      return true
    }

    return false
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (
      validateFormData({
        roleName: formData.roleName,
        roleDescription: formData.roleDescription
      })
    ) {
      const result = await post(
        open === sectionActions.EDIT ? updateRole : createRole,
        open === sectionActions.EDIT ? {
          organizationId: Number(orgId),
          roleId: formData.roleId,
          roleName: formData.roleName,
          roleDescription: formData.roleDescription,
          active: formData.active
        } : {
          organizationId: Number(orgId),
          roleName: formData.roleName,
          roleDescription: formData.roleDescription,
          active: formData.active
        }
      )

      if (result.status === "success") {
        toast.success(result.message)
        handleReset()
      } else {
        toast.error(result.message)
      }
    }
  }

  const handleReset = () => {
    setFormData(initialData)
    setFormErrors(initialErrorData)
    router.back()
  }

  const getSectionDataById = async (slug: string | number) => {
    try {
      await get(getSectionById(slug))

      setFormData({
        ...formData,
        id: 0,
        roleId: 0,
        roleName: "",
        roleDescription: "",
        active: false
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (open === sectionActions.EDIT) {
      getSectionDataById(query[query.length - 1])
    }
  }, [])

  return (
    <>
      <BreadCrumbList />
      <Card>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
            <CustomTextField
              error={!!formErrors.roleName}
              helperText={formErrors.roleName}
              label="Role Name *"
              fullWidth
              placeholder="Enter Name"
              value={formData.roleName}
              onChange={(e) => {
                setFormErrors({ ...formErrors, roleName: "" })
                setFormData({
                  ...formData,
                  roleName: e.target.value
                })
              }}
            />
            <CustomTextField
              fullWidth
              rows={9}
              multiline
              error={!!formErrors.roleDescription}
              helperText={formErrors.roleDescription}
              value={formData.roleDescription}
              onChange={(e) => {
                setFormErrors({ ...formErrors, roleDescription: "" })
                setFormData({ ...formData, roleDescription: e.target.value })
              }}
              label="Description *"
              placeholder="Enter here..."
              sx={{
                "& .MuiInputBase-root.MuiFilledInput-root": {
                  alignItems: "baseline"
                }
              }}
            />
            <div>
              <label className="text-[0.8125rem] leading-[1.153]">Status</label>
              <Switch
                size="medium"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
              />
            </div>
            <div className="flex items-center justify-end gap-4">
            <Button
            variant="outlined"
            size="small"
            onClick={() => {
              handleReset()
            }}
          >
            Cancel
          </Button>
              <Button variant="contained" type="submit">
                {open === sectionActions.ADD ? "Add" : "Edit"} Role
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </>
  )
}

export default RolesForm
