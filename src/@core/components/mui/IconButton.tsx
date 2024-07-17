// CustomIconButton.tsx
import React from "react";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/system";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  // Add your custom styles here
  margin: theme.spacing(0.5),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

interface CustomIconButtonProps {
  color?: "default" | "inherit" | "primary" | "secondary";
  variant?: "outlined" | "contained";
  size?: "small" | "medium" | "large";
  onClick: () => void;
  selected?: boolean;
  children: React.ReactNode;
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({
  color = "default",
  variant = "outlined",
  size = "medium",
  onClick,
  selected = false,
  children,
}) => {
  return (
    <StyledIconButton
      color={color}
      size={size}
      onClick={onClick}
      className={selected ? "Mui-selected" : ""}
    >
      {children}
    </StyledIconButton>
  );
};

export default CustomIconButton;
