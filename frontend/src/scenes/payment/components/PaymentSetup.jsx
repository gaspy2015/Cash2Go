import { Autocomplete, Box, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SelectWrapper from "../../../components/FormUI/Select";
import EditableDataGrid from "./EditableDataGrid";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import { useEffect, useState } from "react";
import { ComboBox } from "../../loan/components/LoanForm1";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { tokens } from "../../../theme";
import { useTheme } from "@emotion/react";
import { MuiFileInput } from "mui-file-input";
import { AttachFile } from "@mui/icons-material";

const fixedOptions = [
  { value: "CASH", label: "Cash" },
  { value: "CHECK", label: "Check" },
  { value: "ONLINE", label: "Online" },
];

const OptionSelect = ({options, onValueChange, ...props}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return(
    <TextField 
      {...props}
      select={true} 
      onChange={(e) => onValueChange(e.target.value , e)}
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
        <MenuItem key={option.value} value={option.value}
          sx={{
            backgroundColor: colors.greenAccent[800],
            "&:hover": { backgroundColor: colors.greenAccent[700] },
          }}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )

}

const TextInput = ({name, onValueChange, ...props }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const handleChange = (e) => {
    console.log(e.target.value, name )
    onValueChange(e.target.value, name, e)
  }
  return(
    <TextField {...props} 
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
      onChange={handleChange}
    />
  )
}

const PaymentSetup = ({cashRow, cashRowSetter, paymentData , paymentDataSetter, selectedBank, selectedBankSetter}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [banks, setBanks] = useState([]);
  const [showOrField, setShowOrField] = useState(false);
  const [total, setTotal] = useState(0)
  const [file, setFile] = useState(paymentData.attachment)


  const handleRowEdit = (newRow, oldRow) => {
    const updatedRow = cashRow.map((v) => {
      if(v.id == newRow.id) return newRow;
      return v
    })
    cashRowSetter(updatedRow)
    const calTotal = updatedRow.reduce((acc, cur) => acc + (cur.denomination * cur.count), 0)
    setTotal(calTotal)
    paymentDataSetter((old) => ({...old , cash_count : updatedRow}))
    return newRow
  };


  const handleTextFieldChange = (e) => {
    paymentDataSetter((old) => ({...old, [e.target.name] : e.target.value}))
  }
  const handleFileChange  = (file) => {
    paymentDataSetter((old) => ({...old, attachment : file}))
    setFile(file)
  }

  useEffect(() => {
    const getBanks = async () => {
      const req = await fetch(`/api/payments/bank`);
      const resJson = await req.json();
      setBanks(resJson);
    };
    getBanks();
    const calTotal = cashRow.reduce((acc, cur) => acc + (cur.denomination * cur.count), 0)
    setTotal(calTotal)
  }, []);

  useEffect(() => {
    // Check if the selected bank ID is for BDO to determine OR number field visibility
    // const selectedBankObject = banks.find(bank => bank.id === selectedBank);
    if (selectedBank === "BDO") {
      setShowOrField(true); // Show OR number field if selected bank is BDO
    } else {
      setShowOrField(false); // Hide OR number field for other banks
    }
  }, [selectedBank, banks]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Grid item xs={12} marginBottom={2}>
          <OptionSelect value={paymentData.payment_type} fullWidth label='Mode of Payment' options={fixedOptions} 
            onValueChange={(value) => paymentDataSetter((old) => ({...old, payment_type : value, or_number : '', check_number : '', bank : ''}))} 
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput fullWidth label='Provisional Receipt' name='pr_number' value={paymentData.pr_number} onValueChange={(value, field) => paymentDataSetter((old) => ({...old , [field] : value }))} />
          {/* <TextfieldWrapper value={paymentData.pr_number} onChange={(e) => paymentDataSetter((old) => ({...old, pr_number : e.target.value}))} name="myText" label="Provisional Receipt" /> */}
        </Grid>
      </Grid>
      <Grid item xs={8}>
        {paymentData.payment_type === "CASH" && (
          <Grid item xs={12} marginBottom={2}>
            <EditableDataGrid
              rowData={cashRow}
              onRowEdit={handleRowEdit}
              total={total}
            />
          </Grid>
        )}
        {paymentData.payment_type === "CHECK" && (
          <Grid container columnSpacing={1}  >
            <Grid item xs={4} marginBottom={2}>
              <Autocomplete options={banks}
                getOptionLabel={(option) => option.name || "" || option}
                value={paymentData.bank}
                onInputChange={(event, value) => {
                  selectedBankSetter(value)
                  paymentDataSetter((old) => ({...old, bank : value}))
                }}
                renderInput={(params) => <TextField {...params} label='Bank'/> }
                renderOption={(props, option) => 
                  <Box {...props} component='li' key={option.id} >
                    {option.name}
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={showOrField ? 4 : 8} marginBottom={2}>
              {/* <TextfieldWrapper name="myCheck" label="Check No." /> */}
              <TextField fullWidth label='Check No.' name="check_number" onChange={handleTextFieldChange} value={paymentData.check_number}/>
            </Grid>
            {showOrField && (
              <Grid item xs={4} marginBottom={2}>
                {/* <TextfieldWrapper name="myOr" label="OR Number" /> */}
                <TextField fullWidth label='OR No.' name="or_number" onChange={handleTextFieldChange} value={paymentData.or_number}/>
              </Grid>
            )}
            <Grid item>
              <DatePicker value={paymentData.check_date && dayjs(paymentData.check_date)} onChange={(value) => paymentDataSetter((old) => ({...old , check_date : dayjs(value)}))} label='Check Date' />
            </Grid>
          </Grid>
          
        )}
      </Grid>
      <Grid item xs={4}>
        <MuiFileInput 
          value={file}
          InputProps={{ startAdornment : <AttachFile /> }}
          placeholder="Upload Attachment"
          hideSizeText 
          label='Attachment' 
          getInputText={(value) => value ? value.name : ''}
          onChange={handleFileChange}
        />
      </Grid>
    </Grid>
  );
};

export default PaymentSetup;
