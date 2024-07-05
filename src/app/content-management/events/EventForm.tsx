// React Imports
import { ChangeEvent, useEffect, useState } from "react";
// MUI Imports
import Button from "@mui/material/Button";
// Component Imports
import CustomTextField from "@core/components/mui/TextField";
import {
  Avatar,
  Box,
  Card,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import { ADD_SECTION, EDIT_SECTION } from "@/types/apps/userTypes";
import { post, postContentBlock } from "@/services/apiService";
import BreadCrumbList from "@/components/BreadCrumbList";
import { event } from "@/services/endpoint/event";
import { template } from "@/services/endpoint/template";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import AppReactDatepicker from "@/libs/styles/AppReactDatepicker";
import dayjs, { Dayjs } from "dayjs";
import { useDropzone } from "react-dropzone";
import Close from "@/@menu/svg/Close";
import EditorBasic from "@/components/EditorToolbar";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  open: ADD_SECTION | EDIT_SECTION;
  handleClose: Function;
};

type FormDataType = {
  id: number;
  name: string;
  // templateId: number;
  startDate: any;
  startTime: any;
  endDate: any;
  endTime: any;
  location: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  registrationLink: string;
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
  // templateId: -1,
  startDate: null,
  startTime: null,
  endDate: null,
  endTime: null,
  location: "",
  description: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: "",
  registrationLink: "",
  status: false,
};

const initialErrorData = {
  name: "",
  // templateId: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  location: "",
  description: "",
  organizerName: "",
  organizerEmail: "",
  organizerPhone: "",
};

const EventForm = ({ open, handleClose }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormDataType>(initialData);
  const [formErrors, setFormErrors] = useState<{
    name: string;
    // templateId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    location: string;
    description: string;
    organizerName: string;
    organizerEmail: string;
    organizerPhone: string;
  }>(initialErrorData);

  // const [templateList, setTemplateList] = useState<
  //   [{ templateName: string; templateId: number }] | []
  // >([]);
  const [eventImage, setEventImage] = useState<File | null>(null);

  const { getRootProps: getEventRootProps, getInputProps: getEventInputProps } =
    useDropzone({
      multiple: false,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      },
      onDrop: (acceptedFiles: File[]) => {
        setEventImage(acceptedFiles[0]);
      },
    });

  const eventImg = eventImage ? (
    <span className="truncate w-full px-4 flex items-center justify-between gap-4">
      <img
        key={eventImage.name}
        alt={eventImage.name}
        className="border border-gray-200 object-contain w-[90%] h-full"
        src={URL.createObjectURL(eventImage)}
      />
      <IconButton
        onClick={() => {
          setEventImage(null);
        }}
      >
        <Close />
      </IconButton>
    </span>
  ) : null;

  // const getRequiredData = async () => {
  //   try {
  //     setLoading(true);
  //     const [templateResponse] = await Promise.all([
  //       post(`${template.active}`, {}),
  //     ]);
  //     setTemplateList(templateResponse?.data?.templates);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   async function getTemplate() {
  //     await getRequiredData();
  //   }
  //   getTemplate();
  // }, []);

  const validateForm = () => {
    let valid = true;
    let errors = { ...initialErrorData };
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // if (formData.templateId <= 0) {
    //   errors.templateId = "Please select a template";
    //   valid = false;
    // }
    if (!formData.name) {
      errors.name = "Please enter event name";
      valid = false;
    }
    if (!formData.startDate) {
      errors.startDate = "Please select start date";
      valid = false;
    }
    if (!formData.startTime) {
      errors.startTime = "Please select start time";
      valid = false;
    }
    if (!formData.endDate) {
      errors.endDate = "Please select end date";
      valid = false;
    }
    if (!formData.endTime) {
      errors.endTime = "Please select end time";
      valid = false;
    }
    if (!formData.location) {
      errors.location = "Please enter location";
      valid = false;
    }
    if (!formData.description) {
      errors.description = "Please enter description";
      valid = false;
    }
    if (!formData.organizerName) {
      errors.organizerName = "Please enter organizer name";
      valid = false;
    }
    if (!formData.organizerEmail) {
      errors.organizerEmail = "Please enter organizer email";
      valid = false;
    } else if (!regex.test(formData.organizerEmail)) {
      errors.organizerEmail = "Please enter valid email";
      valid = false;
    }
    if (!formData.organizerPhone) {
      errors.organizerPhone = "Please enter organizer phone number";
      valid = false;
    } else if (
      formData.organizerPhone.length > 10 ||
      formData.organizerPhone.length < 10
    ) {
      errors.organizerPhone = "Please enter valid phone number";
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);

        const formDataToSend = new FormData();
        // formDataToSend.set("templateId", String(formData.templateId));
        formDataToSend.set("title", formData.name);
        formDataToSend.set("startDate", formData.startDate);
        formDataToSend.set("startTime", formData.startTime);
        formDataToSend.set("endDate", formData.endDate);
        formDataToSend.set("endTime", formData.endTime);
        formDataToSend.set("location", formData.location);
        formDataToSend.set("description", formData.description);
        formDataToSend.append("bannerImage", eventImage as Blob);
        formDataToSend.set("organizerName", formData.organizerName);
        formDataToSend.set("organizerEmail", formData.organizerEmail);
        formDataToSend.set("organizerPhone", formData.organizerPhone);
        formDataToSend.set("registrationLink", formData.registrationLink);
        formDataToSend.set("status", String(formData.status));
        // formDataToSend.set("active", String(active));

        console.log(formDataToSend);
        setLoading(false);

        // const result = await postContentBlock(
        //   open === sectionActions.EDIT ? event.update : event.create,
        //   formDataToSend
        // );
        // setLoading(false);
        // if (result.status === "success") {
        //   toast.success(result.message);
        //   handleReset();
        //   setLoading(false);
        //   router.back();
        // } else {
        //   toast.error(result.message);
        //   setLoading(false);
        // }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setFormErrors(initialErrorData);
    handleClose();
  };

  const getSectionDataById = async (id: string | number) => {
    setLoading(true);
    try {
      const result = await postContentBlock(
        event.getById,
        JSON.stringify({
          eventId: id,
        })
      );
      const { data } = result;

      setFormData({
        ...formData,
        id: data.pageId,
        name: data.title,
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
      // getSectionDataById(query[query.length - 1]);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
            <div>
              <div className="flex flex-col gap-2 pb-4">
                <Box display="flex" gap={4}>
                  <Grid container spacing={1} rowSpacing={5} sm={8}>
                    {/* <Grid item xs={12} sm={6}>
                      <CustomTextField
                        error={!!formErrors.templateId}
                        helperText={formErrors.templateId}
                        select
                        fullWidth
                        defaultValue=""
                        value={formData.templateId}
                        label="Select Template *"
                        id="custom-select"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (Number(e.target.value) <= 0) {
                            setFormErrors({
                              ...formErrors,
                              templateId: "please select a template",
                            });
                          } else {
                            setFormErrors({ ...formErrors, templateId: "" });
                          }
                          setFormData({
                            ...formData,
                            templateId: Number(e.target.value),
                          });
                        }}
                      >
                        <MenuItem value={-1}>
                          <em>Select Template</em>
                        </MenuItem>
                        {templateList?.map((template) => (
                          <MenuItem
                            value={template.templateId}
                            key={template.templateName}
                          >
                            {template.templateName}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    </Grid> */}

                    <Grid item xs={12} sm={6}>
                      <CustomTextField
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        label="Event Name *"
                        fullWidth
                        placeholder="Enter Name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormErrors({ ...formErrors, name: "" });
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          });
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <AppReactDatepicker
                        selected={
                          formData.startDate &&
                          dayjs.isDayjs(formData.startDate)
                            ? formData.startDate.toDate()
                            : formData.startDate
                        }
                        id="basic-input"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              startDate: "please select start date",
                            });
                          } else {
                            setFormErrors({ ...formErrors, startDate: "" });
                          }
                          setFormData({
                            ...formData,
                            startDate: dayjs(date).format("MM/DD/YYYY"),
                          });
                        }}
                        placeholderText="Enter Start Date"
                        customInput={
                          <CustomTextField
                            label="Event Start Date"
                            fullWidth
                            error={!!formErrors.startDate}
                            helperText={formErrors.startDate}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <AppReactDatepicker
                        showTimeSelect
                        selected={
                          formData.startTime
                            ? dayjs()
                                .hour(
                                  parseInt(formData.startTime.split(":")[0])
                                )
                                .minute(
                                  parseInt(formData.startTime.split(":")[1])
                                )
                                .toDate()
                            : null
                        }
                        timeIntervals={15}
                        showTimeSelectOnly
                        dateFormat="h:mm aa"
                        id="time-only-picker"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              startTime: "please select start time",
                            });
                          } else {
                            setFormErrors({ ...formErrors, startTime: "" });
                          }

                          const formattedTime = dayjs(date).format("HH:mm");

                          setFormData({
                            ...formData,
                            startTime: formattedTime,
                          });
                        }}
                        placeholderText="Enter Start Time"
                        customInput={
                          <CustomTextField
                            label="Event Start Time"
                            fullWidth
                            error={!!formErrors.startTime}
                            helperText={formErrors.startTime}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <AppReactDatepicker
                        selected={
                          formData.endDate && dayjs.isDayjs(formData.endDate)
                            ? formData.endDate.toDate()
                            : formData.endDate
                        }
                        id="basic-input"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              endDate: "please select end date",
                            });
                          } else {
                            setFormErrors({ ...formErrors, endDate: "" });
                          }
                          setFormData({
                            ...formData,
                            endDate: dayjs(date).format("MM/DD/YYYY"),
                          });
                        }}
                        placeholderText="Enter End Date"
                        customInput={
                          <CustomTextField
                            label="Event End Date"
                            fullWidth
                            error={!!formErrors.endDate}
                            helperText={formErrors.endDate}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <AppReactDatepicker
                        showTimeSelect
                        selected={
                          formData.endTime
                            ? dayjs()
                                .hour(parseInt(formData.endTime.split(":")[0]))
                                .minute(
                                  parseInt(formData.endTime.split(":")[1])
                                )
                                .toDate()
                            : null
                        }
                        timeIntervals={15}
                        showTimeSelectOnly
                        dateFormat="h:mm aa"
                        id="time-only-picker"
                        onChange={(date: Date) => {
                          if (!date) {
                            setFormErrors({
                              ...formErrors,
                              endTime: "please select end time",
                            });
                          } else {
                            setFormErrors({ ...formErrors, endTime: "" });
                          }

                          const formattedTime = dayjs(date).format("HH:mm");

                          setFormData({
                            ...formData,
                            endTime: formattedTime,
                          });
                        }}
                        placeholderText="Enter End Time"
                        customInput={
                          <CustomTextField
                            label="Event End Time"
                            fullWidth
                            error={!!formErrors.endTime}
                            helperText={formErrors.endTime}
                          />
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <CustomTextField
                        multiline
                        maxRows={3}
                        minRows={7}
                        error={!!formErrors.location}
                        helperText={formErrors.location}
                        label="Location *"
                        fullWidth
                        placeholder="Enter Location"
                        value={formData.location}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          });
                          if (e.target?.value?.length) {
                            setFormErrors({ ...formErrors, location: "" });
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={12}>
                      <label className="text-[0.8125rem] leading-[1.153]">
                        Description *
                      </label>
                      <EditorBasic
                        content={formData.description}
                        onContentChange={(content: string) => {
                          setFormData({
                            ...formData,
                            description: content,
                          });
                          if (content.length) {
                            setFormErrors({ ...formErrors, description: "" });
                          }
                        }}
                        error={!!formErrors.description}
                      />
                      {formErrors.description && (
                        <p className="ml-[-2px] mt-2 MuiFormHelperText-root Mui-error MuiFormHelperText-sizeSmall MuiFormHelperText-contained mui-1ou7mfh-MuiFormHelperText-root">
                          {formErrors.description}
                        </p>
                      )}
                      {/* <CustomTextField
                        multiline
                        maxRows={10}
                        minRows={7}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                        label="Description *"
                        fullWidth
                        placeholder="Enter Detail About Event"
                        value={formData.description}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          });
                          if (e.target?.value?.length) {
                            setFormErrors({ ...formErrors, description: "" });
                          }
                        }}
                      /> */}
                    </Grid>
                  </Grid>
                  <Grid container spacing={2} sm={4}>
                    <Grid item xs={12} sm={12}>
                      <p className="text-[#4e4b5a] mb-1"> Event Image * </p>
                      <input {...getEventInputProps()} />
                      {eventImage ? (
                        eventImg
                      ) : (
                        <Box
                          {...getEventRootProps({ className: "dropzone" })}
                          // {...eventImage}
                        >
                          <div className="flex items-center flex-col border-dashed border-2 p-16">
                            <Typography variant="h4" className="mbe-2.5">
                              Event Image
                            </Typography>
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
                          </div>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </div>
              <Grid container spacing={2} rowSpacing={5} sm={12}>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.organizerName}
                    helperText={formErrors.organizerName}
                    label="Organizer Name *"
                    fullWidth
                    placeholder="Enter Organizer Name"
                    value={formData.organizerName}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, organizerName: "" });
                      setFormData({
                        ...formData,
                        organizerName: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.organizerEmail}
                    helperText={formErrors.organizerEmail}
                    label="Organizer Email *"
                    fullWidth
                    placeholder="Enter Organizer Email"
                    value={formData.organizerEmail}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, organizerEmail: "" });
                      setFormData({
                        ...formData,
                        organizerEmail: e.target.value,
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    error={!!formErrors.organizerPhone}
                    helperText={formErrors.organizerPhone}
                    label="Organizer Phone Number *"
                    fullWidth
                    placeholder="Enter Organizer Phone Number"
                    value={formData.organizerPhone}
                    onChange={(e) => {
                      setFormErrors({ ...formErrors, organizerPhone: "" });
                      setFormData({
                        ...formData,
                        organizerPhone: e.target.value
                          .replace(/[^0-9]/g, "")
                          .slice(0, 10),
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CustomTextField
                    label="Registration Link"
                    fullWidth
                    placeholder="Enter Registration Link"
                    value={formData.registrationLink}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        registrationLink: e.target.value,
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
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                  />
                </Grid>
              </Grid>
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
                      onClick={() => handleReset()}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" type="submit">
                      {open === sectionActions.ADD ? "Add" : "Edit"} Event
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

export default EventForm;
