import { TextField, MenuItem } from "@mui/material";
import { useField, useFormikContext } from "formik";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";

const SelectWrapper = ({ name, label, options, ...otherProps }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const handleChange = (evt) => {
    const { value } = evt.target;
    setFieldValue(name, value);
    // If you need to handle the onChange event in the parent component as well
    if (otherProps.onChange) {
      otherProps.onChange(evt);
    }
  };

  const configSelect = {
    ...field,
    ...otherProps,
    select: true,
    label: label,
    variant: "outlined",
    fullWidth: true,
    onChange: handleChange,
    MenuProps: {
      PaperProps: {
        sx: {
          backgroundColor: 'lightblue', // Change background color of the dropdown menu list
        },
      },
    },
  };

  if (meta && meta.touched && meta.error) {
    configSelect.error = true;
    configSelect.helperText = meta.error;
  }

  return (
    <TextField
      {...configSelect}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: colors.greenAccent[600], // Change border color when focused
          },
          "&:hover fieldset": {
            borderColor: colors.greenAccent[500], // Change border color on hover
          },
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "white", // Change label color when focused
        },
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={{
            backgroundColor: colors.greenAccent[800],
            "&:hover": { backgroundColor: colors.greenAccent[700] },
          }}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectWrapper;
