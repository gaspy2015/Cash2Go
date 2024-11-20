import { Autocomplete, Box, Checkbox, Grid, TextField } from '@mui/material'
import { useContext, useEffect, useRef, useState } from 'react'
import { ComboBox, LoanFormContext, TextInput } from './LoanForm1'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'


const CustomerComboBox = ({value, handleChange, disabled, name,}) => {
  const ref = useRef()
  const [customers, setCustomers] = useState([])
  
  const fetchData = async () => {
    try {
      const request = await fetch(`/api/customers/search?name=${value}`)
      const customerData = await request.json()
      setCustomers(customerData)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=> {
    const customerData = fetchData()
  }, [])

  const handleInputChange = async (event, value) => {
    
    if(customers.length <= 0){
      await fetchData()
    }

    if(event && event.type === 'click') {
      handleChange(value, Number(event.target.id))
    }

  }

  return(
    <Autocomplete
      fullWidth
      // onOpen={(e) => console.log(e)}
      disabled={disabled}
      options={customers}
      ref={ref}
      onInputChange={handleInputChange}
      value={value}
      getOptionLabel={(option) => option.name || "" || option}
      renderInput={(params) => <TextField {...params} label={name} />}
      renderOption={(props, option) => 
        <Box {...props} component='li' key={option.id} id={option.id}>
          {option.name}
        </Box>  
      }
    />

  )
}

export default function LoanRequirementsForm({banks, collaterals, categories, facilities, isRenew = false, isRestructure = false} ) {
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)
  const [hasSecondCheck, setHasSecondCheck] = useState(false)

  const handleTextInputChange = (e, field) => {
    console.log(field)
    setValidationError(null)
    setFormValue((old) => ({...old , [field] : e.target.value}))
  }
  
  const handleComboBoxChange = (fields, values) => {
    setValidationError(null)
    console.log(fields, values)
    setFormValue((old) => ({...old, [fields.name] : values.value , [fields.id] : values.id}))
  }

  return (
    <Grid container spacing={2} >
      <Grid item xs={1.5}>
        <TextInput
          // disabled={isRestructure}
          value={formValue.voucher_number}
          label="Voucher"
          name="voucher_number"
          error={validationError}
          change={(e, field) => handleTextInputChange(e, field)}
        />
      </Grid>
      <Grid item xs={3.5}>
        <CustomerComboBox
          disabled ={isRenew | isRestructure}
          name='Borrower Name'
          handleChange={(value, id) => setFormValue((old) => ({...old, customer_name : value, customer_id : id}))}
          value = {formValue.customer_name}
          /> 
      </Grid>
      <Grid item xs={3.5}>
        <CustomerComboBox
          name='Co-Maker Name'
          disabled ={isRenew | isRestructure}
          handleChange={(value, id) => setFormValue((old) => ({...old, co_maker_name : value, co_maker_id : id}))}
          value = {formValue.co_maker_name}
        /> 
      </Grid>
      <Grid item xs={3.5}>
        <TextInput
          disabled={isRestructure}
          value={formValue.check_issued_name}
          label="Check Name"
          name="check_issued_name"
          error={validationError}
          change={(e, field) => handleTextInputChange(e, field)}
        />
      </Grid>
      <Grid item xs={2}>
        <ComboBox
          disabled={isRestructure}
          label='Bank'
          inputChange={(fields, values) => handleComboBoxChange(fields, values) } 
          value={formValue.bank_name}
          options={banks}
          idfield='bank_account_id'
          getOptionLabel={(option) => option.name || "" || option}
          renderOption={(props, option) => {
            if(option.owner) {
              return <Box {...props} component='li' key={option.id} id={option.id}>
                {option.name}
              </Box>  
            }
          }
          }
          nameField="bank_name"
          err={validationError}
        />
      </Grid>
      <Grid item xs={4} >
        <TextInput
          disabled={isRestructure}
          value={formValue.check_number}
          label="Check Number"
          name="check_number"
          error={validationError}
          change={(e, field) => handleTextInputChange(e, field)}
          />
      </Grid>
      <Grid item xs={3}>
        <DatePicker
          disabled={isRestructure}
          label='Check Date'
          name='check_date'
          value={formValue.check_date ? dayjs(formValue.check_date) : formValue.check_date}
          onChange={(val) => { 
            setValidationError(null)
            if(val){
              setFormValue((old) => ({...old , check_date : val}))
            }
          }}
          />
      </Grid>
      <Grid item xs={3}>
        <DatePicker
          disabled={isRestructure}
          label='Release Date'
          name='date_granted'
          value={formValue.date_granted ? dayjs(formValue.date_granted) : formValue.date_granted}
          onChange={(val) => { 
            setValidationError(null)
            if(val){
              setFormValue((old) => ({...old , date_granted : val}))
            }
          }}
          // slots={{
          //   // textField : (params) => <TextField {...params}  />
          // }}
          />
      </Grid>
      <Grid item style={{ display : 'flex'}}>
        <Checkbox style={{ color : 'white'}} checked={formValue.has_second_check} onChange={(e, checked) => {
          setHasSecondCheck(checked)
          setFormValue((old) => ({...old, has_second_check : checked}))
        }} />
      </Grid>
      <Grid item xs={2}>
        <ComboBox
          disabled={!formValue.has_second_check}
          label='Bank'
          inputChange={(fields, values) => handleComboBoxChange(fields, values) } 
          value={formValue.bank_name_2}
          options={banks}
          idfield='bank_account_id_2'
          getOptionLabel={(option) => option.name || "" || option}
          renderOption={(props, option) => {
            if(option.owner) {
              return <Box {...props} component='li' key={option.id} id={option.id}>
                {option.name}
              </Box>  
            }
          }
          }
          nameField="bank_name_2"
        />
      </Grid>
      
      <Grid item xs={6} >
        <TextInput
          disabled={!formValue.has_second_check}
          value={formValue.check_number_2}
          label="Check Number"
          name="check_number_2"
          // error={validationError}
          change={(e, field) => handleTextInputChange(e, field)}
          />
      </Grid>
      
      <Grid item xs='auto'>
        <DatePicker
          disabled={!formValue.has_second_check}
          label='Check Date'
          name='check_date_2'
          value={formValue.check_date_2 ? dayjs(formValue.check_date_2) : formValue.check_date_2}
          onChange={(val) => { 
            setValidationError(null)
            if(val){
              setFormValue((old) => ({...old , check_date_2 : val}))
            }
          }}
          />
      </Grid>

      <Grid item xs={4}>
        <ComboBox 
          disabled={isRestructure}
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
      <Grid item xs={4}>
        <ComboBox 
          disabled={isRestructure}
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
      <Grid item xs={4}>
        <ComboBox 
          disabled={isRestructure}
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
