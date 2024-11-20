import { AddOutlined, RemoveCircleOutline } from '@mui/icons-material';
import { Autocomplete, Box, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useContext, useState } from 'react'
import { LoanFormContext } from './LoanForm1';
import CurrencyInput from './fields/CurrencyInput';
import { DatePicker } from '@mui/x-date-pickers';

export default function DeductionDetailsForm({deductions, deductionsData, setDeductionsData}) {
  const [deductionItem, setDeductionItem] = useState(null);
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)
  return (
    <>
      <Grid container>
        <Grid item xs={10}>
          <Autocomplete
            options={deductions}
            value={deductionItem && deductionItem.label}
            getOptionLabel={(option) => option.deductionType || "" || option}
            onInputChange={(e,v) => {
              console.log(v)
              if(e)
                setDeductionItem({id : e.target.id, label : v});
            }}
            renderOption={(props, option) => 
              <Box {...props} component='li' key={option.id} id={option.id}>
                {option.deductionType}
              </Box>  
            }
            renderInput= { (params) => <TextField {...params}  label='Deductions'/>}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            onClick={() => {
              if(deductionItem){
                let contains  = false;
                for (const d of deductionsData) {
                  if(d.label === deductionItem.label){ contains = true }
                }

                if(!contains){
                  const format = deductionItem.label.toLowerCase().split(' ').join('_')
                  const d = [...deductionsData, {...deductionItem, name : format, amount : ''}]
                  setDeductionsData(d)
                  setFormValue({...formValue, deduction : d})
                }
              }
            }}
            variant="outlined" 
            color='success'
            sx={{ 
              fontSize: "14px",
              fontWeight: "bold",
              width: "90%",
              marginLeft : 'auto', 
              marginRight : 'auto',
              height : '100%',
              mx : 1
            }}
          >
            <AddOutlined sx={{ mr: "2px" }} />
          </Button>
        </Grid>
      </Grid>
      <Grid container gap={1}  marginTop={1.5}>
        { deductionsData && deductionsData.map((d, i) => (
          <Grid item xs={2.9} >
            <CurrencyInput 
            size='small'
            label={d.label} 
            value={d.amount}
            customInput={TextField}
            error={validationError && Boolean(validationError[d.name])}
            onValueChange= {(value) =>{
              setValidationError(null)
              const d = deductionsData.map((v, index) => {
                return i === index ? {...v, amount : value.floatValue} : v
              })
              setDeductionsData(d)
              setFormValue({...formValue, deduction : d})
            }}
            InputProps={{
              endAdornment : 
                <InputAdornment position='end'>
                  <IconButton
                    onClick={(e) => {
                      const d = deductionsData.filter((v, index) => index !== i) 
                      setDeductionsData(d)
                      setFormValue({...formValue, deduction : d})
                    }}
                  >
                    <RemoveCircleOutline />
                  </IconButton>
                </InputAdornment>
            }}
            />
          </Grid>
        ))}
      </Grid>
      <Box display='flex' marginY={1.5} gap={1.5}>
        <FormControlLabel label='Cash' control={<Checkbox checked={formValue.isCash.value} onChange={(e, checked) => setFormValue((old) => ({...old, isCash : {...old.isCash, value : checked}}))}/>} />
        { formValue.isCash.value && ( <TextField label='Provisional Receipt' size='small' value={formValue.isCash.pr_number} onChange={(e) => setFormValue((old) => ({...old, isCash : {...old.isCash, pr_number : e.target.value}}))}/> )}
      </Box>
    </>
  )
}
