import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { ComboBox, LoanFormContext, numberFormat } from './LoanForm1'
import { DeleteOutline } from '@mui/icons-material'
import CurrencyInput from './fields/CurrencyInput'

export default function VoucherForm({accountTitle, voucher, setVoucher }) {
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)
  const [employees, setEmployees] = useState([])
  const totalCredit = voucher.reduce((acc, cur) =>  acc + Number(cur.credit), 0)
  const totalDebit = voucher.reduce((acc, cur) =>  acc + Number(cur.debit), 0)
  
  useEffect(() => {
    const getEmployees = async () =>{
      try {
        const request = await fetch('/api/employee')
        const responseJSON = await request.json()
        setEmployees(responseJSON)
      } catch (error) {
        console.log(error)
      }
    }
    getEmployees()

  },[])

  return (
    <>
     <Box display='flex' gap={2} my={2}>
        {/* <TextField fullWidth label='Prepared by'/>
        */}
        <ComboBox
          value={formValue.prepared_by}
          nameField='prepared_by'
          label='Prepared By'
          options={employees}
          err= {validationError}
          getOptionLabel={(option) => option.name || option || "" }
          renderOption={(props, option) => 
            <Box {...props} component='li' key={option.employee_id} id={option.employee_id}>
              {option.name}
            </Box>  
          }
          inputChange= {(field, v) => {
            setFormValue({...formValue, [field.name] : v.value})
          }}
        />
        <ComboBox 
          value={formValue.checked_by}
          nameField='checked_by'
          label='Checked By'
          options={employees}
          err= {validationError}
          getOptionLabel={(option) => option.name || option ||"" }
          renderOption={(props, option) => 
            <Box {...props} component='li' key={option.employee_id} id={option.employee_id}>
              {option.name}
            </Box>  
          }
          inputChange= {(field, v) => {
            setFormValue({...formValue, [field.name] : v.value})
          }}
        />
        <ComboBox 
          value={formValue.approved_by}
          nameField='approved_by'
          label='Approved By'
          options={employees}
          err= {validationError}
          getOptionLabel={(option) => option.name || option ||"" }
          renderOption={(props, option) => 
            <Box {...props} component='li' key={option.employee_id} id={option.employee_id}>
              {option.name}
            </Box>  
          }
          inputChange= {(field, v) => {
            setFormValue({...formValue, [field.name] : v.value})
          }}
      />
      </Box>
      <Button variant='outlined' color='success'
        onClick={() => {
          const voucherItem = [...voucher, {name : '', credit : '', debit : '' }]
          setVoucher(voucherItem)
          setFormValue({...formValue, voucher : voucherItem})
        }}
      >
        Add Account Title
      </Button>
      <Box
        marginTop={2}
        display='flex'
        flexDirection='column'      
        gap={1.5}
      >
        { voucher && voucher.map((v, i)=> (
          <Grid container gap={1}>
            <Grid item flex={1}>
              <ComboBox fullWidth label='Account Title'
                value={v.name} 
                options={accountTitle} 
                // idfield='customer_id'
                getOptionLabel={(option) => option.name || "" || option}
                renderOption={(props, option) => 
                  <Box {...props} component='li' key={option.id} id={option.id}>
                    {option.name}
                  </Box>  
                }
                inputChange={(field, d) => {
                  const newValue = voucher.map((val, index) => {
                    return i === index ? {...val,  name : d.value, id : d.id  } : val
                  })
                  
                  setVoucher(newValue)
                  setFormValue({...formValue, voucher : newValue})
                }} />
            </Grid>
            <Grid item>
              <CurrencyInput
                label="Debit"
                sx={{width : 150}}
                value={v.debit}
                customInput={TextField}
                onValueChange={(value) => {
                  const newValue = voucher.map((val, index) => {
                    return i === index ? {...val, debit : value.value} : val
                  })
                  setVoucher(newValue)
                  setFormValue({...formValue, voucher : newValue })
                }}
                />
            </Grid>
            <Grid item >
              <CurrencyInput 
                label="Credit"
                sx={{width : 150}}
                value={v.credit}
                customInput={TextField}
                onValueChange={(value)=>{
                  const newValue = voucher.map((val, index) => {
                    return i === index ? {...val, credit : value.value} : val
                  })
                  setVoucher(newValue)
                  setFormValue({...formValue, voucher : newValue})
                }}
              />
            </Grid>
            <Grid item display='flex' >
              <Button variant='outlined' color='error'
                onClick={() => {
                  const filter = voucher.filter((v, index) => i !== index)
                  setVoucher(filter)
                  setFormValue({...formValue, voucher : filter})
                }}  
              >
                <DeleteOutline/>
              </Button>
            </Grid>
          </Grid>
        ))
        }
        <Box mt={1} ml={2}>
          <Box display='flex' gap={1}>
            <Typography fontWeight='bold' textTransform='uppercase' letterSpacing='1px' > Credit Total :</Typography> 
            <Typography fontStyle='italic' fontSize='14px' letterSpacing='1px'>{numberFormat.format(Number(totalCredit))}</Typography>
          </Box>
          <Box display='flex' gap={1}>
            <Typography fontWeight='bold' textTransform='uppercase' letterSpacing='1px' > Debit Total :</Typography> 
            <Typography fontStyle='italic' fontSize='14px' letterSpacing='1px' >{numberFormat.format(Number(totalDebit))}</Typography>
          </Box>
          <Box display='flex' gap={1}>
            <Typography fontWeight='bold' textTransform='uppercase' letterSpacing='1px' > Balance :</Typography> 
            <Typography fontStyle='italic' fontSize='14px' >{numberFormat.format(Math.abs(totalCredit - totalDebit))}</Typography>
          </Box>
        </Box>
      </Box>
    </>
    
  )
}
