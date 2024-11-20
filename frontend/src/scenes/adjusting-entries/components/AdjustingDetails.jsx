import React from 'react'
import { useFormik } from 'formik'
import { Autocomplete, Box, Button, Grid, MenuItem, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import * as yup from 'yup'

const dateValue = (date) => {
  if(date) {
    return dayjs(date)
  }
  return null
}

const validationSchema = yup.object({
  borrower : yup.object({ name : yup.string().required() }),
  date: yup.date().required(),
  explaination : yup.string().required(),
  prepared_by: yup.string().required(),
  checked_by: yup.string().required(),
  approved_by: yup.string().required(),
})

export default function AdjustingDetails({onComplete, data,  employee, suppliers}) {
  
  const formik = useFormik({
    initialValues : data,
    validationSchema : validationSchema,
    onSubmit : (values) => {
      onComplete(values)
    }
  })
  
  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box display='flex' gap={1}>
            <Box flex={1} display='flex' flexDirection='column' gap={1.5}>
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
              <DatePicker label='DATE' slotProps={{ textField: { fullWidth: true } }} value={dateValue(formik.values.date)} onChange={(value) => formik.setFieldValue('date', value.format('YYYY-MM-DD'))} />
            </Box>
            <Box flex={1}>
              <TextField name='explaination' onChange={formik.handleChange}  value={formik.values.explaination} fullWidth multiline rows={4.2} label='Explaination'/>
              </Box>
          </Box>
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
