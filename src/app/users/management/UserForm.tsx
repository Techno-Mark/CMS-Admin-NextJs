import CustomTextField from "@/@core/components/mui/TextField";
import BreadCrumbList from "@/components/BreadCrumbList";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import { post } from "@/services/apiService";
import { organization } from "@/services/endpoint/organization";
import { createUser, updateUser } from "@/services/endpoint/users/management";
import { getRoleList } from "@/services/endpoint/users/roles";
import { userDetailType } from "@/types/apps/userType";
import { Box, Button, Card, Grid, MenuItem } from "@mui/material";
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
      companyId: -1,
      roleId: -1,
    },
  ]);
  const [companyIdError, setCompanyIdError] = useState([false]);
  const [roleIdError, setRoleIdError] = useState([false]);
  const [deletedCompany, setDeletedCompany] = useState<number[] | []>([]);
  const [companyList, setCompanyList] = useState<LabelValue[]>([]);
  const [roleList, setRoleList] = useState<LabelValue[]>([]);

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

    const fetchRoles = async () => {
      try {
        const response = await post(getRoleList, {});
        const roles = response.data.roles as LabelValue[];
        // setRoleList(roles);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrganizations();
    // fetchRoles();
    setRoleList([
      {
        id: 1,
        name: "Content Editor",
      },
      {
        id: 2,
        name: "Manage",
      },
    ]);
  }, []);

  useEffect(() => {
    if (open === EDIT_USER && editingRow) {
      setFormData({
        userId: editingRow.userId,
        userName: editingRow.userName,
        userEmail: editingRow.userEmail,
      });

      setCompany(JSON.parse(editingRow.company));
    }
    setLoading(false);
  }, []);

  const addCompany = () => {
    setCompany([
      ...company,
      {
        id: 0,
        companyId: -1,
        roleId: -1,
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
          companyId: -1,
          roleId: -1,
        },
      ]);
    company.length === 1 && setCompanyIdError([false]);
    company.length === 1 && setRoleIdError([false]);
  };

  const handleCompanyChange = (e: number, index: number) => {
    const newFields = [...company];
    newFields[index].companyId = e;
    setCompany(newFields);

    const newErrors = [...companyIdError];
    newErrors[index] = e <= 0;
    setCompanyIdError(newErrors);
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

    const newTaskErrors = company.map((field) => field.companyId <= 0);
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

  const getFormDataEntries = (formData: any) => {
    const entries: any = {};
    formData.forEach((value: any, key: any) => {
      entries[key] = value;
    });
    return entries;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.set("userName", formData.userName);
        formDataToSend.set("userEmail", formData.userEmail);
        formDataToSend.set("company", JSON.stringify(company));

        let result = null;
        if (open == EDIT_USER) {
          formDataToSend.set("eventId", String(editingRow?.userId));
          console.log("edit", getFormDataEntries(formDataToSend));
          // result = await post(updateUser, formDataToSend);
        } else {
          console.log("create", getFormDataEntries(formDataToSend));
          // result = await post(createUser, formDataToSend);
        }

        setLoading(false);

        // if (result.status === "success") {
        //   toast.success(result.message);
        //   router.back();
        // } else {
        //   toast.error(result.message);
        // }
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
                    <Grid item xs={12} sm={6} className="mb-4">
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

                    <Grid item xs={12} sm={6}>
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
                            value={field.companyId}
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
                            {!loading &&
                              !!roleList.length &&
                              roleList.map((role: any) => {
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
                          company[0].companyId > 0 &&
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
