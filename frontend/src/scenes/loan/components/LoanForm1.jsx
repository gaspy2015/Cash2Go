import * as yup from 'yup';
import {AddOutlined, CheckCircleOutlineRounded, DeleteOutline, RemoveCircleOutline, AttachFile } from "@mui/icons-material"
import { FormStep } from "../../../components/MultiStepForm1";
import { Autocomplete, Grid, TextField, Button, InputAdornment, IconButton, Box, styled, Typography, TableContainer, Paper } from "@mui/material";
import { createContext, useEffect, useRef, useState } from 'react';
import MultiStepForm1 from '../../../components/MultiStepForm1';
import * as ejs from 'ejs'
import { Bounce, toast } from 'react-toastify';
import voucherHTMLTemplate from '../../../assets/voucher.html?raw'
import c2gLogo from '../../../assets/c2g_logo_nb.png'
import dayjs from 'dayjs';
import { grey } from '@mui/material/colors';
import LoanRequirementsForm from './LoanRequirementsForm';
import LoanDetailsForm from './LoanDetailsForm';
import DeductionDetailsForm from './DeductionDetailsForm';
import SummaryForm from './SummaryForm';
import VoucherForm from './VoucherForm';
import VoucherPrint from './VoucherPrint';

export const LoanFormContext = createContext(null)

export const loanRequirementSchema = yup.object({
  voucher_number : yup.string().required('voucher_number is required'),
  check_date : yup.date().required(),
  customer_name : yup.string().required(),
  check_number : yup.string().required(),
  bank_name : yup.string().required(),
  check_issued_name : yup.string().required(),
  collateral : yup.string().required(),
  loan_category : yup.string().required(),
  loan_facility : yup.string().required('loan facilities is required'),
})

export const loanDetailsSchema = yup.object({
  principal_amount : yup.number().required().moreThan(0),
  interest_rate : yup.number().required().moreThan(0),
  loan_details : yup.array(
    yup.object({
      dueDate : yup.date().required(),
      bank_name : yup.string().required(),
      interest : yup.number().positive().moreThan(0),
      amortization : yup.number().positive().moreThan(0)
    })
  )
})

export const deductionSchema = yup.object({
  deduction : yup.array(
    yup.object({
      amount : yup.number().positive().moreThan(0)
    })
  )
})

export const voucherSchema = yup.object({
  prepared_by : yup.string().required(),
  checked_by : yup.string().required(),
  approved_by : yup.string().required(),
  voucher : yup.array(
    yup.object({
      name : yup.string().required()
    })
  )
})

export const numberFormat = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})

export function ComboBox (props){
  const {inputChange, nameField, idfield , err, label} = props
  const comboRef = useRef()

  return (
    <Autocomplete
    {...props}
    fullWidth
    ref={comboRef}
    onInputChange={(e, v) => 
    {
      if(e && e.type === 'click'){
        inputChange({name : comboRef.current.getAttribute('name'), id : idfield }, { id : e.target.id, value : v});
      } 
      
    }} 
    variant="standard" 
    name={nameField} 
    renderInput={(params) => <TextField {...params}  error={err && Boolean(err[nameField])} label={label} />}
    />
  )
}

export function TextInput(props) {
  const {name, change, error} = props
  return (
    <TextField fullWidth variant="outlined"
    {...props}
    onChange={(e) => change(e, name)}
    error={ error && Boolean(error[name])}
  />
  )
}

const CustomerComboBox = ({value, setter}) => {
  const ref = useRef()
  const [customers, setCustomers] = useState([])
  let searchTimeOut = null;

  const fetchData = async (value) => {
    try {
      const request = await fetch(`/api/customers/search?name=${value}`)
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

function LoanForm1({loanInitialValue, collaterals, facilities, banks, categories, deductions , accountTitle, setModalOpen, dispatcher}) {

  const [formValue, setFormValue] = useState(loanInitialValue);
  const [rows, setRows] = useState([]);
  const [validationError,setValidationError] = useState(null);
  const [deductionsData, setDeductionsData] = useState([]);
  const [voucher, setVoucher ] = useState(formValue.voucher)
  const [voucherWindow, setVoucherWindow] = useState(null)
  const [employees, setEmployees] = useState([])
  const totalCredit = voucher.reduce((acc, cur) =>  acc + Number(cur.credit), 0)
  const totalDebit = voucher.reduce((acc, cur) =>  acc + Number(cur.debit), 0)


  const handleSubmit = async () => {
    let data

    if(formValue.check_date_2) {
      data  = {...formValue, check_date : dayjs(formValue.check_date).format(), date_granted : formValue.date_granted.format(), check_date_2 : formValue.check_date_2.format()}
    }else { 
      data  = {...formValue, check_date : dayjs(formValue.check_date).format(), date_granted : formValue.date_granted.format()}
    }

    
    const mapLoanDetails = data.loan_details.map((v) => {
      let item = {...v , dueDate : v.dueDate.format()}
      
      for (const b of banks) {
        if(item.bank_name === b.bank_branch) {
          item = {...item, bank_account_id : b.id }
        }
      }
      
      if(item.check_date)
        return {...item, check_date : item.check_date.format()};
      
      return {...item};
    })
    
    data = {...data , loan_details : mapLoanDetails} 
    console.log(JSON.stringify(data))
    console.log(data)
    fetch('/api/loans', {
      method : 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    .then((d) => d.json())
    .then((res) => {
      setModalOpen(false)
      dispatcher({type : 'ADD', loans : res })
      toast.success('Save Successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }  
    ).catch(err => console.log(err))
  }

  const handleLoanRequirement = async () => {
    try {
      loanRequirementSchema.validateSync(formValue, 
        {abortEarly : false}
      )
    } catch (err) {
      console.dir(err)
      const errors = err.inner
      const error = errors.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.path] : true
        }
      }, {})
      setValidationError(error)
    }
  }

  useEffect(() => {
    setFormValue({...formValue, loan_details : [...rows]})
  },[rows])

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
    // toast.error('Something went wrong!', {
    //   position: "top-right",
    //   autoClose: 3000,
    //   hideProgressBar: false,
    //   closeOnClick: true,
    //   pauseOnHover: true,
    //   draggable: true,
    //   progress: undefined,
    //   theme: "colored"
    // })
  },[])

  const handleLoanDetails = async () => {
    console.log(210, formValue)
    try {
      loanDetailsSchema.validateSync(formValue,
        {abortEarly : false}
      )
    } catch (err) {
      const errors = err.inner
      
      const error = errors.reduce((acc, cur) => {
        const path = cur.path
        if(!path.includes('.')){
          return {...acc , [path] : true}
        }
        return {...acc}
      }, {})
      console.dir(err)
      setValidationError(error)
    }
  }

  const handlNetProceed = () => {
    let total = formValue.principal_amount;
    if(formValue.deduction.length > 0) 
      total = formValue.deduction.reduce((acc, curr) => acc - curr.amount, formValue.principal_amount);
    
    return total
  }

  return (
    <LoanFormContext.Provider value={{formValue, setFormValue, validationError, setValidationError,}}>
      <div style={{width: 900, color: grey[600]}} >
        <MultiStepForm1
          initialFormValues={formValue}
          onSubmit={handleSubmit}
        >
          <FormStep
            stepName="Loan Requirements"
            onSubmit={handleLoanRequirement}
            values={formValue}
            schema={loanRequirementSchema}
          >
            <LoanRequirementsForm banks={banks} collaterals={collaterals} categories={categories} facilities={facilities}/>
          </FormStep>
          <FormStep
            stepName="Loan Details"
            onSubmit={handleLoanDetails}
            schema={loanDetailsSchema}
          >
            <LoanDetailsForm  banks={banks} rows={rows} setRows={setRows}/>
          </FormStep>
          <FormStep
            stepName="Deduction Details"
            schema={deductionSchema}
            onSubmit={() => {
              console.log(formValue)
              try {
                deductionSchema.validateSync(formValue, 
                  {abortEarly : false}
                )
              } catch (err) {
                const errors = err.inner
                const error = errors.reduce((acc, cur) =>  
                {
                  const data =  cur.path.split('.')
                  const index = data[0].charAt(data[0].length - 2)
                  return {...acc, [deductionsData[index].name] : true}
                }, 
                {})
                setValidationError(error)
              }
            }}
          >
            <DeductionDetailsForm deductions={deductions} deductionsData={deductionsData} setDeductionsData={setDeductionsData}/>
          </FormStep>
          <FormStep
            stepName="Summary"
            onSubmit={() => {
              console.log(formValue)
            }}
            schema={yup.object({})}
          >
            <SummaryForm netProceeds={handlNetProceed}/>
          </FormStep>
          <FormStep
            stepName="Voucher Details"
            schema={voucherSchema}
            onSubmit={() => {
              const nameFormat = voucher.map((v) => {
                const names = v.name.split('-')
                const format = names.filter((_, i) => i !== 0).join('-')
                return { ...v, title : format.trim() }
              })
              setVoucher(nameFormat)
              setFormValue({...formValue, voucher : nameFormat})
            }}
          >
            <VoucherForm accountTitle={accountTitle} voucher={voucher} setVoucher={setVoucher}/>
          </FormStep>
          <FormStep
            stepName='Print Voucher'
            schema={yup.object({})}
            onSubmit = {() => {
            }}
          >
            <VoucherPrint onClick={() => {
               const templateData = {
                borrower : formValue.customer_name,
                date : dayjs(new Date()).format('MM-DD-YYYY'), 
                details : formValue.voucher,
                voucherNumber : formValue.voucher_number,
                logo : c2gLogo,
                has_second_check: formValue.has_second_check,
                check_details_2: `${formValue.bank_name_2}-${formValue.check_number_2}`,
                check_date_2:  formValue.has_second_check ? dayjs(formValue.check_date_2).format('MM-DD-YYYY') : null,
                prepared_by : formValue.prepared_by,
                approved_by : formValue.approved_by,
                checked_by : formValue.checked_by,
                check_details : `${formValue.bank_name}-${formValue.check_number}`,
                check_date : dayjs(formValue.check_date).format('MM-DD-YYYY')
              }
              
              const voucherHTML = ejs.render(voucherHTMLTemplate, templateData)

              if(voucherWindow){
                voucherWindow.close()
                const voucherTab = window.open('voucher','Print Voucher')
                setVoucherWindow(voucherTab)
                if(voucherHTML) {
                  voucherTab.document.write(voucherHTML)
                }
              } else {
                const voucherTab = window.open('voucher','Print Voucher')
                setVoucherWindow(voucherTab)
                if(voucherHTML) {
                  voucherTab.document.write(voucherHTML)
                }
              }
            }} />
          </FormStep>
        </MultiStepForm1>
      </div>  
    </LoanFormContext.Provider>
  )
}

export function PreviewLabel({label, value}){
  return(
    
  <Box>
    <StyledLabel sx={{color : 'ghostwhite'}}>{value}</StyledLabel>
    <Typography style={{
      letterSpacing : '1px',
      textAlign : 'center',
      fontSize : 'smaller',
      fontStyle : 'italic',
      color : 'ghostwhite'
    }}>
    {label}
    </Typography>
  </Box>
  )
}

const StyledLabel = styled('div')({
  fontWeight : 'bold',
  letterSpacing : '1.5px',
  textAlign: 'center',

  borderBottomWidth:  1,
})

export default LoanForm1