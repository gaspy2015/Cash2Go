import { DeleteOutline } from '@mui/icons-material';
import {Autocomplete, Box, Button, Grid, IconButton, MenuItem, TextField } from '@mui/material'
import React, { useState } from 'react'
import { IMaskMixin } from 'react-imask';
import * as yup from 'yup'

const NumberInput = IMaskMixin(({inputRef, ...props}) => (
  <TextField {...props} fullWidth  inputRef={inputRef}/>
))

const validationSchema = yup.array(
  yup.object({
    category : yup.object( { id : yup.number().required(), name : yup.string().required() } ),
    debit : yup.number().required().transform((value) => Number(value)),
    credit : yup.number().required().transform((value) => Number(value))
  })
)

export default function ExpensesVoucher({onComplete, onPrevious, data, titles}) {
  const [details, setDetails] = useState(data)

  const handleChange = (index, name, value) => {
    const temp = details[index]
    const newValue = {...temp, [name] : value}
    const newList = details.map((v, i) => i === index ? newValue : v)
    setDetails(newList)
  } 

  const handlePrevious = () => {
    //save changes
    onPrevious({ voucher_details : details})
  }
  
  const handleComplete = async () => {
    try {
      const validate = await validationSchema.validate(details)
      onComplete({ voucher_details : validate})

    } catch(error) {
      return console.log(error)
    }
  }

  const handleDelete = (index) => {
    const filter = details.filter((val, i) => index != i)
    setDetails(filter)
  }

  const handleAddEntry = () => {
    setDetails((old) => [...old, {category: '', debit: 0, credit: 0,}])
  }
  
  return (
    <>
      <Grid container spacing='10px'>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='end'>
            <Button color='success' variant='outlined' onClick={handleAddEntry}>Add</Button>
          </Box>
        </Grid> 
        {details.map((v, index) => {
          return (
          <React.Fragment key={index}>
            <Grid item xs={5}>
              <Autocomplete options={titles} getOptionLabel={(option) => option.name} 
                renderOption={(props, option) => {
                  return (
                  <Box {...props} component='li' key={option.id} id={option.id}>
                    {option.name}
                  </Box>  
                  )
                }}
                value={v.category || null}
                renderInput={(props) => {
                  return <TextField {...props} label='Category' />
                }}  
                onChange={(e, value) => {
                  handleChange(index, 'category', value)
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <NumberInput mask={Number}  unmask='type' value={v.debit.toString()} thousandsSeparator=',' padFractionalZeros={true} radix="." label='Debit' 
                onAccept={(value, mask) =>  
                  handleChange(index, 'debit', value)
                }
              />
            </Grid>
            <Grid item xs={3}>
              <NumberInput mask={Number} unmask='type' value={v.credit.toString()} thousandsSeparator=',' padFractionalZeros={true} radix="." label='Credit' 
                onAccept={(value, mask) => 
                  handleChange(index, 'credit', value)
                }
              />
            </Grid>
            <Grid item xs={1}>
                <IconButton onClick={() => handleDelete(index)}> 
                  <DeleteOutline color='error' fontSize='large' />
                </IconButton>
            </Grid>
          </React.Fragment>
          )
        })}
      </Grid>
      <Box display='flex' justifyContent='space-between' mt='10px'>
        <Button color='success' variant='outlined' onClick={handlePrevious}>Back</Button>
        <Button color='success' variant='outlined' onClick={handleComplete}>Next</Button>
      </Box>
    </>
  )
}
