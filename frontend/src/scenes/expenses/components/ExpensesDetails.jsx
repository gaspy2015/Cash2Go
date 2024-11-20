import React from 'react'
import { useFormik } from 'formik'
import { Autocomplete, Box, Button, Grid, MenuItem, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';

const dateValue = (date) => {
  if(date) {
    return dayjs(date)
  }
  return null
}
export default function ExpensesDetails({onComplete, data, banks, employee, suppliers, validationSchema, hasTicketNumber=false}) {
  const formik = useFormik({
    initialValues : data,
    validationSchema : validationSchema,
    onSubmit : (values) => {
      onComplete(values)
    }
  })
  
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing='15px'>
        <Grid item xs={3}>
          <TextField disabled={hasTicketNumber} label='VOUCHER NUMBER' fullWidth name='voucherNumber' onChange={formik.handleChange} value={formik.values.voucherNumber} />
        </Grid>
        <Grid item xs={5}>
          <Autocomplete 
            onChange={(_, value) => formik.setFieldValue('borrower', value)}
            options={suppliers} 
            getOptionLabel={(item) => item.name}
            renderOption={(props, option) => {
              return (
              <Box {...props} component='li' key={option.id} id={option.id}>
                {option.name}
              </Box>  
              )
            }}
            value={formik.values.borrower || null}
            renderInput={(props) => {
              return <TextField {...props} label='PAYEE' />
            }}
            
            />
          {/* <TextField label='PAYEE' fullWidth name='borrower' onChange={formik.handleChange} value={formik.values.borrower} /> */}
        </Grid>
        <Grid item xs={4}> 
          {/* <TextField fullWidth type='date' label='DATE' name='date' onChange={formik.handleChange} value={formik.values.date}/> */}
          
          <DatePicker label='DATE' slotProps={{ textField: { fullWidth: true } }} value={dateValue(formik.values.date)} onChange={(value) => formik.setFieldValue('date', value.format('YYYY-MM-DD'))} />
        </Grid>
        <Grid item xs={3}> 
          <Autocomplete options={banks} getOptionLabel={(option) => option.name} 
            renderOption={(props, option) => {
              return (
              <Box {...props} component='li' key={option.id} id={option.id}>
                {option.name}
              </Box>  
              )
            }}
            value={formik.values.bank || null}
            renderInput={(props) => {
              return <TextField {...props} label='Bank' />
            }}  
            onChange={(e, value) => {
              formik.setFieldValue('bank', value)
            }}
            />

        </Grid>
        <Grid item xs={5}> 
          <TextField fullWidth  label='CHECK NUMBER' name='check_number' onChange={formik.handleChange} value={formik.values.check_number} />
        </Grid>
        <Grid item xs={4}> 
          {/* <TextField fullWidth type='date' label='CHECK DATE' name='check_date' onChange={formik.handleChange} value={formik.values.check_date}/> */}
          <DatePicker label='CHECK DATE' slotProps={{ textField: { fullWidth: true } }} value={dateValue(formik.values.check_date)} onChange={(value) => formik.setFieldValue('check_date', value.format('YYYY-MM-DD'))} />
        </Grid>
        <Grid item xs={4}> 
          <TextField fullWidth select label='PREPAIRED BY' name='prepared_by' onChange={formik.handleChange} value={formik.values.prepared_by}>
            {employee && employee.map((v)=> (
              <MenuItem value={v.name} key={v.name}>{v.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}> 
          <TextField fullWidth select label='CHECKED BY' name='checked_by' onChange={formik.handleChange} value={formik.values.checked_by}>
            {employee && employee.map((v)=> (
              <MenuItem value={v.name} key={v.name}>{v.name}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}> 
          <TextField fullWidth select label='APPROVED BY' name='approved_by' onChange={formik.handleChange} value={formik.values.approved_by}>
            {employee && employee.map((v)=> (
                <MenuItem value={v.name} key={v.name}>{v.name}</MenuItem>
              ))}
          </TextField>
        </Grid>
        <Grid item xs>
          <Box display='flex' justifyContent='end'>
            <Button color='success' type='submit' variant='outlined' >Next</Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}
