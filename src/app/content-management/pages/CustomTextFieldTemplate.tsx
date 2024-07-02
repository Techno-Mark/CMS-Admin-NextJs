import React from "react";
import { TextField } from "@mui/material";
import CustomTextField from "@/@core/components/mui/TextField";

const CustomTextFieldTemplate = ({
  label,
  type,
  required,
  name,
  onChange,
  fullWidth,
  margin,
  inputProps,
  ...props
}: any) => {
  return (
    <CustomTextField
      label={label}
      type={type}
      required={required}
      name={name}
      onChange={onChange}
      fullWidth={fullWidth}
      margin={margin}
      InputProps={{ inputProps }}
      {...props}
    />
  );
};

export default CustomTextFieldTemplate;
