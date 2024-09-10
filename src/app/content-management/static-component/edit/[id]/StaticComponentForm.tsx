"use client";

import LoadingBackdrop from "@/components/LoadingBackdrop";
import {
  Button,
  Box,
  Card,
  Grid,
  CardActions,
  Typography,
  ButtonGroup,
  Tooltip,
  CardContent,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  postDataToOrganizationAPIs
} from "@/services/apiService";
import { toast } from "react-toastify";
import BreadCrumbList from "@/components/BreadCrumbList";
import CustomTextField from "@/@core/components/mui/TextField";
import { staticContentBlock } from "@/services/endpoint/staticContentBlock";

type staticContentBlockFormPropsTypes = {
  sectionSchema: any;
  editingRow: any | null;
  handleClose: Function;
  permissionUser: Boolean
};

const initialFormData = {
  id: -1,
  templateId: -1,
  title: "",
  subTitle: "",
  slug: "",
  authorName: "",
  categories: [] as string[],
  tags: [] as string[],
  description: "",
  status: 0,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

const initialErrorData = {
  templateId: "",
  title: "",
  subTitle: "",
  slug: "",
  authorName: "",
  bannerImageError: "",
  thumbnailImageError: "",
  authorImageUrl: "",
  categories: "",
  tags: "",
  description: "",
  status: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

function StaticComponentForm({
  sectionSchema: formData,
  editingRow,
  handleClose,
  permissionUser
}: staticContentBlockFormPropsTypes) {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [templateValue, setTemplateValues] = useState<any>();

  //Effects
  useEffect(() => {
    if(editingRow?.sectionValue?.data){
        setTemplateValues(editingRow.sectionValue);
    }
    setLoading(false);
  }, []);

  // handle submit
  const handleSubmit = async (active: boolean) => {
    
    if (true) {
      try {
        setLoading(true);

        let data = {
          contentBlockId: formData?.sectionId,
          contentBlockData: templateValue,
        };
        let result = null;

        result = await postDataToOrganizationAPIs(
          staticContentBlock.saveAndUpdate,
          data
        );

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
  
  //component data part
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    uniqueSectionName: string,
    fekey: string,
    multipleIndex = -1,
    multiFeKey = ""
  ) => {
    const { value } = event.target;

    uniqueSectionName = "data" // set data to section name,  fixed value

    if (multipleIndex !== -1) {
      setTemplateValues((prev: any) => {
        const currentMultiple = [...(prev?.[uniqueSectionName]?.[fekey] || [])];

        if (!currentMultiple[multipleIndex]) {
          currentMultiple[multipleIndex] = {};
        }

        currentMultiple[multipleIndex][multiFeKey] = value;

        return {
          ...prev,
          [uniqueSectionName]: {
            ...(prev?.[uniqueSectionName] || {}),
            [fekey]: currentMultiple,
          },
        };
      });
    } else {
      // Handle input change for single fields
      setTemplateValues((prev: any) => ({
        ...prev,
        [uniqueSectionName]: {
          ...(prev?.[uniqueSectionName] || {}),
          [fekey]: value,
        },
      }));
    }
  };

  function handleAddDuplicateForm(
    sectionName: any,
    feKey: any,
    index: number,
    field: any
  ) {
    let duplicateData: any = {};
    field.multipleData?.forEach((value: any) => {
      duplicateData[value?.fekey] = "";
    });

    setTemplateValues((prev: any) => {
      const currentMultiple = prev?.[sectionName]?.[feKey] || [];
      currentMultiple?.splice(index, 0, duplicateData);
      return {
        ...prev,
        [sectionName]: {
          ...(prev?.[sectionName] || {}),
          [feKey]: currentMultiple,
        },
      };
    });
  }

  function handleRemoveDuplicateForm(
    sectionName: any,
    feKey: any,
    index: number
  ) {
    setTemplateValues((prev: any) => {
      const currentMultiple = prev?.[sectionName]?.[feKey] || [];

      currentMultiple?.splice(index, 1);

      return {
        ...prev,
        [sectionName]: {
          ...(prev?.[sectionName] || {}),
          [feKey]: currentMultiple,
        },
      };
    });
  }

  const commonComponentData = () => {
    return (
      <Grid item xs={12} sm={12}>
        <Card variant="outlined" style={{ marginBottom: "10px" }}>
          <CardContent>
            <Typography variant="h5">{formData.name}</Typography>
            {formData.sectionTemplate?.map(
              (sectionField: any, sectioFieldIndex: number) => (
                <Grid container key={`${sectionField.fekey}`} spacing={2}>
                  {sectionField.fieldType === "multiple" && (
                    <Grid item xs={12} style={{ marginBottom: "10px" }}>
                      <Card variant="outlined">
                        <CardActions>
                          <Grid container xs={12} sm={12} spacing={2}>
                            <Grid item xs={10}>
                              <Typography variant="h6" component="div">
                                {sectionField.fieldLabel}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <ButtonGroup variant="tonal" size="small">
                                <Tooltip title={`Add new at 1st position`}>
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handleAddDuplicateForm(
                                        "data",
                                        sectionField.fekey,
                                        0,
                                        sectionField
                                      )
                                    }
                                  >
                                    <i className="tabler-plus" />
                                  </Button>
                                </Tooltip>
                              </ButtonGroup>
                            </Grid>
                          </Grid>
                        </CardActions>

                        <CardContent>
                          {templateValue?.data?.[
                            sectionField.fekey
                          ]?.map(
                            (
                              multipleSection: any,
                              multipleSectionIndex: any
                            ) => (
                              <Card
                                key={`group-${multipleSectionIndex}`}
                                variant="outlined"
                                style={{ marginBottom: "16px" }}
                              >
                                <CardActions>
                                  <Grid container xs={12} sm={12} spacing={2}>
                                    <Grid item xs={10}>
                                      <Typography variant="h6" component="div">
                                        <b className="text-lg">
                                          {" "}
                                          {multipleSectionIndex + 1}{" "}
                                        </b>{" "}
                                        Entry of (
                                        {formData.name +
                                          " -> " +
                                          sectionField.fieldLabel}
                                        )
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                      <ButtonGroup variant="tonal" size="small">
                                        <Tooltip title={`Add`}>
                                          <Button
                                            size="small"
                                            onClick={() =>
                                              handleAddDuplicateForm(
                                               "data",
                                                sectionField.fekey,
                                                multipleSectionIndex + 1,
                                                sectionField
                                              )
                                            }
                                          >
                                            <i className="tabler-plus" />
                                          </Button>
                                        </Tooltip>

                                        <Tooltip title={`Remove`}>
                                          <Button
                                            size="small"
                                            onClick={() =>
                                              handleRemoveDuplicateForm(
                                                "data",
                                                sectionField.fekey,
                                                multipleSectionIndex
                                              )
                                            }
                                          >
                                            <i className="tabler-minus" />
                                          </Button>
                                        </Tooltip>
                                      </ButtonGroup>
                                    </Grid>
                                  </Grid>
                                </CardActions>
                                <CardContent>
                                  {sectionField.multipleData?.map(
                                    (subField: any, subFieldIndex: number) => (
                                      <Box
                                        key={`${formData.name}+${subField.fekey}`}
                                        sx={{ mb: 2 }}
                                      >
                                        <Grid
                                          container
                                          spacing={2}
                                          item
                                          xs={12}
                                          sm={12}
                                        >
                                          <CustomTextField
                                            multiline
                                            label={
                                              subField.isRequired
                                                ? `${subField.fieldLabel} *`
                                                : subField.fieldLabel
                                            }
                                            type={
                                              subField.fieldType === "file"
                                                ? "text"
                                                : "text"
                                            }
                                            name={subField.fieldType}
                                            onChange={(e: any) =>
                                              handleInputChange(
                                                e,
                                               "data",
                                                sectionField.fekey,
                                                multipleSectionIndex,
                                                subField.fekey
                                              )
                                            }
                                            fullWidth
                                            margin="normal"
                                            inputProps={
                                              subField.validation
                                                ? JSON.parse(
                                                    subField.validation
                                                  )
                                                : {}
                                            }
                                            value={
                                              templateValue?.data?.[
                                                sectionField.fekey
                                              ]?.[multipleSectionIndex]?.[
                                                subField.fekey
                                              ] || ""
                                            }
                                          />
                                        </Grid>
                                      </Box>
                                    )
                                  )}
                                </CardContent>
                              </Card>
                            )
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {sectionField.fieldType !== "multiple" && (
                    <Grid item xs={12} sm={12}>
                      <CustomTextField
                        multiline
                        label={
                          sectionField.isRequired
                            ? `${sectionField.fieldLabel} *`
                            : sectionField.fieldLabel
                        }
                        type={
                          sectionField.fieldType === "file" ? "text" : "text"
                        }
                        name={sectionField.fieldType}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            e,
                            "data",
                            sectionField.fekey
                          )
                        }
                        fullWidth
                        margin="normal"
                        value={
                          templateValue?.data?.[
                            sectionField.fekey
                          ] || ""
                        }
                      />
                    </Grid>
                  )}
                </Grid>
              )
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <Box display="flex" alignItems="center">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={11}>
            <BreadCrumbList />
          </Grid>
        </Grid>
      </Box>
      {commonComponentData()}
      <Card className="p-4">
        <Box
          display="flex"
          rowGap={4}
          columnGap={4}
          alignItems="flex-start"
        ></Box>
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
                  variant="contained"
                  color="error"
                  type="reset"
                  onClick={() => {
                    handleClose();
                  }}
                >
                  Cancel
                </Button>
                {permissionUser &&
                <Button
                  variant="contained"
                  type="submit"
                  onClick={() => handleSubmit(true)}
                >
                  Save & Update
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

export default StaticComponentForm;
