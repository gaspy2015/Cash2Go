import { Autocomplete, Grid, InputAdornment, TextField, Button, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { LoanFormContext, TextInput } from './LoanForm1'
import { Box } from '@mui/system'
import { MuiFileInput } from 'mui-file-input'
import dayjs from 'dayjs'
import LoanDetailsTable from './LoanDetailsTable'
import LoanDetailsDaysTable from './LoanDetailsDaysTable'
import { AttachFile } from '@mui/icons-material'
import Papa, { parse } from 'papaparse';
import CurrencyInput from './fields/CurrencyInput'

export default function LoanDetailsForm({banks, rows, setRows}) {

  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)
  const [file, setFile] = useState(null)
  const handleTextField = (event, field) => {
    setFormValue((old) => ({...old, [field] : event.target.value}))
  }
  return (
    <Grid container spacing={2} >
      <Grid item xs={9}>
        <CurrencyInput fullWidth name='principal_amount' label='Principal Amount' value={formValue.principal_amount} customInput={TextField}
          onValueChange ={(values, sourceInfo) => {
            const field = sourceInfo.event.target.name
              setFormValue((old) => ({...old, [field] : values.floatValue}))
          }}
          error={ validationError && Boolean(validationError['principal_amount'])}
          />
      </Grid>
      <Grid item xs={3}>
        <TextInput  
          name="interest_rate" 
          label="Interest Rate"
          value={formValue.interest_rate}
          change={(e, field) => handleTextField(e, field)}
          InputProps = {{
            endAdornment : <InputAdornment position='end'>%</InputAdornment>
          }}
          error={validationError}/>
      </Grid>
      <Grid item >
        <Box width='100%' display='flex' gap={1}>
          <MuiFileInput
            value={file}
            placeholder='Upload .csv file'
            hideSizeText 
            getInputText={(value) => value ? value.name : ''}
            size='small'
            sx={{ width : '200px' }}
            InputProps={{ startAdornment : <AttachFile /> }}
            inputProps={{ accept : '.csv'}}
            onChange={ async (file) => { setFile(file) }}/>
            
          <Button color='success' variant='outlined' 
            onClick={ async () => {
              if(file) {
                Papa.parse(file, {
                  header : true,
                  skipEmptyLines : true,
                  complete : (result, file) => {
                    const data = result.data.map((v, i) => ({
                      ...v, id : i + 1
                    }))
                    console.log(64, result)
                    setRows(data)
                  },
                  transform : (value, field) => {
                    if(field === 'dueDate') {
                      return dayjs(value)
                    }
                    if(field === 'check_date'){
                      return dayjs(value)
                    }

                    if(field === 'amortization' || field === 'interest' || field === 'principal') {
                      return Number(value.replace(/[^0-9.-]+/g,""))
                    }
                    return value.trim()
                  }
                })
              }
            }}
          >Generate</Button>
        </Box>
        <Box display='flex' alignItems='center' gap={3}>
          <Autocomplete sx={{mt : 2 , width : 150}} 
            options={['months', 'days']} 
            value={formValue.term_type}
            onInputChange={(event, value) => {
              setValidationError(null);
              setFormValue((old) => ({...old, term_type : value}))
            }}
            renderInput={(params) => <TextField {...params} label='Term Type' size='small'/>}
          />
          {formValue.term_type == 'months' && (
            
            <Typography mt={2}>{rows.length} month's</Typography>
          )}

        </Box>
      </Grid>
      { formValue.term_type == 'months' && (
        <Grid item xs={12}>
          <LoanDetailsTable banks={banks} rows={rows} setRows={setRows}/>
        </Grid>
      )} 
      { formValue.term_type == 'days' && (
        <Grid item xs={12}>
          <LoanDetailsDaysTable banks={banks} rows={rows} setRows={setRows} formValue={formValue} />
        </Grid>
      )}
    </Grid>
  )
}
