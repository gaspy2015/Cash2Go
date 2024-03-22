import { Autocomplete, Box, Grid, TextField } from '@mui/material'
import { useContext, useRef, useState } from 'react'
import { ComboBox, LoanFormContext, TextInput } from './LoanForm1'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'


const CustomerComboBox = ({value, setter}) => {
  const ref = useRef()
  const [customers, setCustomers] = useState([])
  
  let searchTimeOut = null;

  const fetchData = async (value) => {
    try {
      const request = await fetch(`http://localhost:8000/customers/search?name=${value}`)
      return await request.json()
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = async (event, value) => {
    if(event && event.type === 'change'){
      if(value.length >= 2){
        clearTimeout(searchTimeOut)
        searchTimeOut = setTimeout(() => {
          const req = async () => {
            try {
              const customerData = await fetchData(value)
              setCustomers(customerData)              
            } catch (error) {
              console.log(error)
            }
          }
          req()
        }, 1000)
      }
    }

    if(event && event.type === 'click') {
      setter((old) => { 
        return {...old , customer_name : value, customer_id : Number(event.target.id)}
      })
    }

  }

  return(
    <Autocomplete
      fullWidth
      options={customers}
      ref={ref}
      onInputChange={handleInputChange}
      value={value}
      getOptionLabel={(option) => option.name || "" || option}
      renderInput={(params) => <TextField {...params} label='Borrower Name' />}
      renderOption={(props, option) => 
        <Box {...props} component='li' key={option.id} id={option.id}>
          {option.name}
        </Box>  
      }
    />

  )
}

export default function LoanRequirementsForm({banks, collaterals, categories, facilities}) {
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)
  
  const handleTextInputChange = (e, field) => {
    setValidationError(null)
    setFormValue((old) => ({...old , [field] : e.target.value}))
  }
  
  const handleComboBoxChange = (fields, values) => {
    setValidationError(null)
    setFormValue((old) => ({...old, [fields.name] : values.value , [fields.id] : values.id}))
  }

  return (
    <Grid container spacing={2} >
      <Grid item xs={2}>
        <TextInput
          value={formValue.voucher_number}
          label="Voucher"
          name="voucher_number"
          error={validationError}
          change={(e, field) => handleTextInputChange(e, field)}
        />
      </Grid>
      <Grid item xs={5}>
        <CustomerComboBox
          setter = {setFormValue}
          value = {formValue.customer_name}
        /> 
      </Grid>
      <Grid item xs={5}>
        <TextInput
          value={formValue.check_issued_name}
          label="Check Name"
          name="check_issued_name"
          error={validationError}
          change={(e, field) => handleTextInputChange(e, field)}
        />
      </Grid>
      <Grid item xs={2}>
        <ComboBox
            label='Bank'
            inputChange={(fields, values) => handleComboBoxChange(fields, values) } 
            value={formValue.bank_name}
            options={banks}
            idfield='bank_account_id'
            getOptionLabel={(option) => option.name || "" || option}
            renderOption={(props, option) => 
              <Box {...props} component='li' key={option.id} id={option.id}>
                {option.name}
              </Box>  
            }
            nameField="bank_name"
            err={validationError}
        />
      </Grid>
      <Grid item xs={7} >
        <TextInput
            value={formValue.check_number}
            label="Check Number"
            name="check_number"
            error={validationError}
            change={(e, field) => handleTextInputChange(e, field)}
          />
      </Grid>
      <Grid item xs={3}>
        <DatePicker
          label='Check Date'
          name='check_date'
          value={formValue.check_date ? dayjs(formValue.check_date) : formValue.check_date}
          onChange={(val) => { 
            setValidationError(null)
            setFormValue((old) => ({...old , check_date : val.$d}))
          }}
          slots={{
            textField : (params) => <TextField {...params} error={validationError && validationError.check_date} />
          }}/>
      </Grid>
      <Grid item xs={12}>
        <ComboBox 
          label='Collateral'
          inputChange={(fields, values) => handleComboBoxChange(fields, values)} 
          value={formValue.collateral}
          options={collaterals}
          idfield='collateral_id'
          getOptionLabel={(option) => option.name || "" || option}
          renderOption={(props, option) => 
            <Box {...props} component='li' key={option.id} id={option.id}>
              {option.name}
            </Box>  
          }
          nameField="collateral"
          err={validationError}/>
      </Grid>
      <Grid item xs={12}>
        <ComboBox 
          label='Category'
          inputChange={(fields, values) => handleComboBoxChange(fields, values)} 
          value={formValue.loan_category}
          options={categories} 
          nameField="loan_category"
          idfield='loan_category_id'
          getOptionLabel={(option) => option.name || "" || option}
          renderOption={(props, option) => 
            <Box {...props} component='li' key={option.id} id={option.id}>
              {option.name}
            </Box>  
          }
          err={validationError}
        />
      </Grid>
      <Grid item xs={12}>
        <ComboBox 
          label='Facility'
          inputChange={(fields, values) => handleComboBoxChange(fields, values)} 
          nameField="loan_facility"
          idfield='loan_facility_id'
          value={formValue.loan_facility}
          options={facilities} 
          getOptionLabel={(option) => option.name || "" || option}
          renderOption={(props, option) => 
            <Box {...props} component='li' key={option.id} id={option.id}>
              {option.name}
            </Box>  
          }
          err={validationError}
        />
      </Grid>
    </Grid>
  )
}
