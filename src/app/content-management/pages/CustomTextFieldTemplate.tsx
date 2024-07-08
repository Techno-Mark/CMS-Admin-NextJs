import React from 'react';
import { TextField, Typography } from '@mui/material';

type CustomTextFieldProps = {
  label: string;
  type: string;
  required: boolean;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth: boolean;
  margin: "none" | "dense" | "normal" | undefined;
  error: boolean;
}

const CustomTextFieldTM: React.FC<CustomTextFieldProps> = ({
  label,
  type,
  required,
  name,
  onChange,
  fullWidth,
  margin,
  error,
}) => {
  return (
    <div>
      <TextField
        label={label}
        type={type}
        required={required}
        name={name}
        onChange={onChange}
        fullWidth={fullWidth}
        margin={margin}
        error={error}
      />
      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </div>
  );
};

export default CustomTextFieldTM;
