import CustomTextField from "@/@core/components/mui/TextField";
import BreadCrumbList from "@/components/BreadCrumbList";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { post } from "@/services/apiService";
import { organization } from "@/services/endpoint/organization";
import { createUser, updateUser } from "@/services/endpoint/users/management";
import { getRoleList } from "@/services/endpoint/users/roles";
import { userDetailType } from "@/types/apps/userType";
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type UserFormPropsTypes = {
  open: number;
  editingRow: any | null;
  handleClose: Function;
};

const ADD_USER = -1;
const EDIT_USER = 1;

const initialData = {
  userId: 0,
  userName: "",
  userEmail: "",
  active: false,
};

const initialErrorData = {
  userName: "",
  userEmail: "",
};

interface LabelValue {
  id: number;
  name: string;
}

const UserForm = ({ open, handleClose, editingRow }: UserFormPropsTypes) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<typeof initialData>(initialData);
  const [formErrors, setFormErrors] =
    useState<typeof initialErrorData>(initialErrorData);
  const [company, setCompany] = useState([
    {
      id: 0,
      organizationId: -1,
      roleId: -1,
      roles: [] as LabelValue[],
    },
  ]);
  const [companyIdError, setCompanyIdError] = useState([false]);
  const [roleIdError, setRoleIdError] = useState([false]);
  const [deletedCompany, setDeletedCompany] = useState<number[] | []>([]);
  const [companyList, setCompanyList] = useState<LabelValue[]>([]);

  const setRolesInCompany = async (organizationId: number, index: number) => {
    const roles = (await fetchRoles(organizationId)) as LabelValue[];

    const newCompany = [...company];
    newCompany[index].roles = roles;
    setCompany(newCompany);
  };

  const fetchRoles = async (organizationId: number) => {
    try {
      const response = await post(getRoleList, {
        page: 1,
        limit: 1000,
        search: "",
        organizationId: organizationId,
        active: true,
      });

      return response.data.roles.map(
        (r: any) =>
          new Object({
            id: r.roleId,
            name: r.roleName,
          })
      ) as LabelValue[];
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await post(organization.active, {});
        const orgs = response.data.organizations as LabelValue[];
        setCompanyList(orgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchEditingRowData = async () => {
      if (open === EDIT_USER && editingRow) {
        setFormData({
          userId: editingRow.UserId,
          userName: editingRow.Username,
          userEmail: editingRow.Email,
          active: editingRow.Status,
        });

        const rolesOrganizations = await Promise.all(
          editingRow.RolesOrganizations.map(async (i: any) => {
            const roles = await fetchRoles(i.organizationId);
            return {
              id: 0,
              organizationId: i.organizationId,
              roleId: i.roleId,
              roles: roles,
            };
          })
        );
        setCompany(rolesOrganizations);
      }
      setLoading(false);
    };

    fetchEditingRowData();
  }, [open, editingRow]);

  console.log(company)

  const addCompany = () => {
    setCompany([
      ...company,
      {
        id: 0,
        organizationId: -1,
        roleId: -1,
        roles: [],
      },
    ]);
    setCompanyIdError([...companyIdError, false]);
    setRoleIdError([...roleIdError, false]);
  };

  const removeCompany = (index: number) => {
    setDeletedCompany(
      company[index].id !== 0
        ? [...deletedCompany, company[index].id]
        : [...deletedCompany]
    );

    const newFields = [...company];
    newFields.splice(index, 1);
    setCompany(newFields);

    const newCompanyErrors = [...companyIdError];
    newCompanyErrors.splice(index, 1);
    setCompanyIdError(newCompanyErrors);

    const newRoleErrors = [...roleIdError];
    newRoleErrors.splice(index, 1);
    setRoleIdError(newRoleErrors);

    company.length === 1 &&
      setCompany([
        {
          id: 0,
          organizationId: -1,
          roleId: -1,
          roles: [],
        },
      ]);
    company.length === 1 && setCompanyIdError([false]);
    company.length === 1 && setRoleIdError([false]);
  };

  const handleCompanyChange = (e: number, index: number) => {
    const newFields = [...company];
    newFields[index].organizationId = e;
    newFields[index].roleId = -1;
    setCompany(newFields);

    const newErrors = [...companyIdError];
    newErrors[index] = e <= 0;
    setCompanyIdError(newErrors);

    setRolesInCompany(e, index);
  };

  const handleRoleChange = (e: number, index: number) => {
    const newFields = [...company];
    newFields[index].roleId = e;
    setCompany(newFields);

    const newErrors = [...roleIdError];
    newErrors[index] = e <= 0;
    setRoleIdError(newErrors);
  };

  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!formData.userName) {
      errors.userName = "Please enter user name";
      valid = false;
    }

    if (!formData.userEmail) {
      errors.userEmail = "Please enter user email";
      valid = false;
    } else if (!regex.test(formData.userEmail)) {
      errors.userEmail = "Please enter valid email";
      valid = false;
    }

    const newTaskErrors = company.map((field) => field.organizationId <= 0);
    setCompanyIdError(newTaskErrors);
    const newSubTaskDescErrors = company.map((field) => field.roleId <= 0);
    setRoleIdError(newSubTaskDescErrors);

    if (newTaskErrors.some((error) => error)) {
      valid = false;
    }

    if (newSubTaskDescErrors.some((error) => error)) {
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);

        const param =
          open == EDIT_USER
            ? {
                userId: editingRow?.UserId,
                userName: formData.userName,
                email: formData.userEmail,
                active: formData.active,
                organizations: company.map(
                  (c) =>
                    new Object({
                      roleId: c.roleId,
                      organizationId: c.organizationId,
                    })
                ),
              }
            : {
                userName: formData.userName,
                email: formData.userEmail,
                active: formData.active,
                organizations: company.map(
                  (c) =>
                    new Object({
                      roleId: c.roleId,
                      organizationId: c.organizationId,
                    })
                ),
              };

        let result = null;
        if (open == EDIT_USER) {
          result = await post(updateUser, param);
        } else {
          result = await post(createUser, param);
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
              <div className="flex flex-col gap-2 pb-4">
                <Box display="flex" gap={4}>
                  <Grid container spacing={1} sm={12}>
                    <Grid item xs={10} sm={5} className="mb-4">
                      <CustomTextField
                        error={!!formErrors.userName}
                        helperText={formErrors.userName}
                        label="User Name *"
                        fullWidth
                        placeholder="Enter User Name"
                        value={formData.userName}
                        onChange={(e) => {
                          setFormErrors({ ...formErrors, userName: "" });
                          setFormData({
                            ...formData,
                            userName: e.target.value,
                          });
                        }}
                      />
                    </Grid>

                    <Grid item xs={10} sm={5}>
                      <CustomTextField
                        error={!!formErrors.userEmail}
                        helperText={formErrors.userEmail}
                        label="User Email *"
                        fullWidth
                        placeholder="Enter User Email"
                        value={formData.userEmail}
                        onChange={(e) => {
                          setFormErrors({ ...formErrors, userEmail: "" });
                          setFormData({
                            ...formData,
                            userEmail: e.target.value,
                          });
                        }}
                      />
                    </Grid>

                    <Grid item xs={4} sm={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.active}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                active: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Status"
                        className="mt-4 ml-2"
                      />
                    </Grid>

                    {company.map((field, index) => (
                      <Grid
                        container
                        spacing={1}
                        sm={12}
                        key={index}
                        className="mb-2"
                      >
                        <Grid item xs={12} sm={3}>
                          <CustomTextField
                            error={!!companyIdError[index]}
                            helperText={
                              companyIdError[index]
                                ? "Please select company"
                                : ""
                            }
                            select
                            fullWidth
                            defaultValue=""
                            value={field.organizationId}
                            label="Select Company"
                            id="custom-select"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleCompanyChange(Number(e.target.value), index)
                            }
                          >
                            <MenuItem value={-1}>
                              <em>Select Company</em>
                            </MenuItem>
                            {!loading &&
                              !!companyList.length &&
                              companyList.map((company: any) => {
                                return (
                                  <MenuItem value={company.id} key={company.id}>
                                    {company.name}
                                  </MenuItem>
                                );
                              })}
                          </CustomTextField>
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <CustomTextField
                            error={!!roleIdError[index]}
                            helperText={
                              roleIdError[index] ? "Please select role" : ""
                            }
                            select
                            fullWidth
                            defaultValue=""
                            value={field.roleId}
                            label="Select Role"
                            id="custom-select"
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleRoleChange(Number(e.target.value), index)
                            }
                          >
                            <MenuItem value={-1}>
                              <em>Select Role</em>
                            </MenuItem>
                            {field.roles.length > 0 &&
                              field.roles.map((role: any) => {
                                return (
                                  <MenuItem value={role.id} key={role.id}>
                                    {role.name}
                                  </MenuItem>
                                );
                              })}
                          </CustomTextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          {index === 0 &&
                          company[0].organizationId > 0 &&
                          company[0].roleId > 0 ? (
                            <>
                              <span
                                className="cursor-pointer"
                                onClick={() => removeCompany(index)}
                              >
                                <svg
                                  className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                  focusable="false"
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  data-testid="RemoveIcon"
                                >
                                  <path d="M19 13H5v-2h14v2z"></path>
                                </svg>
                              </span>
                              <span
                                className="cursor-pointer"
                                onClick={() => addCompany()}
                              >
                                <svg
                                  className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                  focusable="false"
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  data-testid="AddIcon"
                                >
                                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                                </svg>
                              </span>
                            </>
                          ) : index === 0 ? (
                            <span
                              className="cursor-pointer"
                              onClick={() => addCompany()}
                            >
                              <svg
                                className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                focusable="false"
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                data-testid="AddIcon"
                              >
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                              </svg>
                            </span>
                          ) : (
                            <span
                              className="cursor-pointer"
                              onClick={() => removeCompany(index)}
                            >
                              <svg
                                className="MuiSvgIcon-root !w-[24px] !h-[24px] !mt-[24px]  mx-[10px] MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root"
                                focusable="false"
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                data-testid="RemoveIcon"
                              >
                                <path d="M19 13H5v-2h14v2z"></path>
                              </svg>
                            </span>
                          )}
                        </Grid>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </div>
            </div>
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
                      variant="tonal"
                      color="error"
                      type="reset"
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      onClick={() => handleSubmit()}
                    >
                      {open === ADD_USER ? "Add" : "Edit"} User
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </div>
        </div>
      </Card>
    </>
  );
};

export default UserForm;
