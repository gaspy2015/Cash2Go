import React from 'react';
import TextField from '@mui/material/TextField';
import {NumericFormat} from 'react-number-format';
import { useField } from "formik";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      decimalScale={2}
    />
  );
}

const NumberfieldWrapper = ({ name, ...otherProps }) => {
  const [field, meta] = useField(name);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const configTextfield = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
    InputProps: {
      inputComponent: NumberFormatCustom,
      inputProps: {
        style: { textAlign: "right" },
    }
    },
    
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

export default NumberfieldWrapper;
