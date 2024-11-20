import { TextField } from "@mui/material";
import { useField } from "formik";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";



const TextfieldWrapper = ({ name, ...otherProps }) => {
  const [field, meta] = useField(name);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  

  const configTextfield = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
    
  };

  if (meta && meta.touched && meta.error) {
    configTextfield.error = true;
    configTextfield.helperText = meta.error;
  }

  return (
    <TextField
      {...configTextfield}
      
      sx={{
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderColor: colors.greenAccent[600], // Change border color when focused
          },
          '&:hover fieldset': {
            borderColor: colors.greenAccent[500], // Change border color on hover
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: 'white', // Change label color when focused
        },
      }}
    />
  );
};

export default TextfieldWrapper;
