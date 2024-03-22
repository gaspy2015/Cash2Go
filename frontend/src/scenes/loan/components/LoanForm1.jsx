import * as yup from 'yup';
import {AddOutlined, CheckCircleOutlineRounded, DeleteOutline, RemoveCircleOutline, AttachFile } from "@mui/icons-material"
import MultiStepForm, { FormStep } from "../../../components/MultiStepForm";
import { Autocomplete, Grid, TextField, Button, InputAdornment, IconButton, Box, styled, Typography, TableContainer, Paper } from "@mui/material";
import LoanDetailsTable from './LoanDetailsTable';
import { createContext, useEffect, useRef, useState } from 'react';
import MultiStepForm1 from '../../../components/MultiStepForm1';
import LoanTablePreview from './LoanTablePreview';
import LoanDeductionPreview from './LoanDeductionPreview';
import * as ejs from 'ejs'
import { Bounce, toast } from 'react-toastify';
import voucherHTMLTemplate from '../../../assets/voucher.html?raw'
import c2gLogo from '../../../assets/c2g_logo_nb.png'
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { grey } from '@mui/material/colors';
import { MuiFileInput } from 'mui-file-input'
import Papa, { parse } from 'papaparse';
import LoanRequirementsForm from './LoanRequirementsForm';

const LOAN_INITIAL_VALUES = {
    customer_id: '',
    customer_name: '',
    transaction_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    term_type : 'months',
    bank_name: '',
    collateral_id: '',
    check_date : null,
    check_number : '',
    collateral: '',
    loan_category_id: '',
    loan_category: '',
    loan_facility_id: '',
    loan_facility: '',
    principal_amount: '',
    interest_rate: '',
    total_interest: 0,
    term_month: 0,
    date_granted: new Date().toISOString().split('T')[0],
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
    loan_details : [],
    deduction : [],
    voucher : [{name : '', credit : '', debit : '' }],
    prepared_by : '',
    approved_by : '',
    checked_by : ''
}


export const LoanFormContext = createContext(null)


const loanRequrementSchema = yup.object({
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

const loanDetailsSchema = yup.object({
  principal_amount : yup.number().required().moreThan(0),
  interest_rate : yup.number().required().moreThan(0),
  loan_details : yup.array(
    yup.object({
      dueDate : yup.date().required(),
      bank : yup.string().required(),
      // principal : yup.number().positive().moreThan(0),
      interest : yup.number().positive().moreThan(0),
      amortization : yup.number().positive().moreThan(0)
    })
  )
})

const deductionSchema = yup.object({
  deduction : yup.array(
    yup.object({
      amount : yup.number().positive().moreThan(0)
    })
  )
})

const voucherSchema = yup.object({
  prepared_by : yup.string().required(),
  checked_by : yup.string().required(),
  approved_by : yup.string().required(),
  voucher : yup.array(
    yup.object({
      name : yup.string().required()
    })
  )
})

const numberFormat = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})

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

function LoanForm1({ collaterals, facilities, banks, categories, deductions , accountTitle, setModalOpen, dispatcher}) {

  const [formValue, setFormValue] = useState(LOAN_INITIAL_VALUES);
  const [rows, setRows] = useState([]);
  const [validationError,setValidationError] = useState(null);
  const [deductionsData, setDeductionsData] = useState([]);
  const [deductionItem, setDeductionItem] = useState(null); 
  const [voucher, setVoucher ] = useState(formValue.voucher)
  const [voucherWindow, setVoucherWindow] = useState(null)
  const [employees, setEmployees] = useState([])
  const totalCredit = voucher.reduce((acc, cur) =>  acc + Number(cur.credit), 0)
  const totalDebit = voucher.reduce((acc, cur) =>  acc + Number(cur.debit), 0)
  const [file, setFile] = useState(null)
  const handleLoanRequirement = async () => {
    try {
      loanRequrementSchema.validateSync(formValue, 
        {abortEarly : false}
      )
    } catch (err) {
      console.dir(err)
      //TODO: display all error for all input 
      const errors = err.inner
      const error = errors.reduce((acc, cur) => {
        return {
          ...acc,
          [cur.path] : true
        }
      }, {})
      console.log('151', error)
      setValidationError(error)
    }
  }

  useEffect(() => {
    setFormValue({...formValue, loan_details : [...rows]})
  },[rows])
  useEffect(() => {
    const getEmployees = async () =>{
      try {
        const request = await fetch('http://localhost:8000/employee')
        const responseJSON = await request.json()
        setEmployees(responseJSON)
      } catch (error) {
        console.log(error)
      }
    }
    getEmployees()

  },[])

  const handleLoanDetails = async () => {
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
      setValidationError(error)
    }
  }

  const handleComboBox = (fields, v) => {
    setValidationError(null)
    console.log(fields, v)
    setFormValue({...formValue , [fields.name] : v.value, [fields.id] : v.id })
  }
  
  const handleTextField = (e) => {
    setValidationError(null)
    setFormValue({...formValue , [e.target.name] : e.target.value})
  }

  
  return (
    <LoanFormContext.Provider value={{formValue, setFormValue, validationError, setValidationError}}>
      <div style={{width: 900, color: grey[600]}} >
        <MultiStepForm1
        initialFormValues={formValue}
        onSubmit={() => {
          let data = {...formValue, check_date : dayjs(formValue.check_date).format()}
          
          const mapLoanDetails = data.loan_details.map((v) => {
            let item = {...v , dueDate : dayjs(v.dueDate).format()}
            
            for (const b of banks) {
              if(item.bank === b.name) {
                item = {...item, bank_account_id : b.id }
              }
            }
            return item
          })
          
          data = {...data , loan_details : mapLoanDetails} 
          console.log('fetch', data)
          fetch('http://localhost:8000/loans', {
            method : 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          })
          .then((d) => d.json())
          .then((res) => {
            console.log('response', res)
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
        }}
        >
          <FormStep
            stepName="Loan Requirements"
            onSubmit={handleLoanRequirement}
            values={formValue}
            schema={loanRequrementSchema}
          >
            <LoanRequirementsForm banks={banks} collaterals={collaterals} categories={categories} facilities={facilities}/>
          </FormStep>
          <FormStep
            stepName="Loan Details"
            onSubmit={handleLoanDetails}
            schema={loanDetailsSchema}
          >
            <Grid container spacing={2} >
              <Grid item xs={9}>
                <TextInput 
                  name="principal_amount" 
                  label="Principal Amount"
                  value={formValue.principal_amount}
                  change={(e) => handleTextField(e)}
                  error={validationError}
                />
              </Grid>
              <Grid item xs={3}>
                <TextInput 
                  name="interest_rate" 
                  label="Interest Rate"
                  value={formValue.interest_rate}
                  change={(e) => handleTextField(e)}
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
                      if(file){
                        Papa.parse(file, {
                          header : true,
                          skipEmptyLines : true,
                          complete : (result, file) => {
                            console.log(result)
                            const data = result.data.map((v, i) => ({
                              ...v, id : i + 1
                            }))
                            setRows(data)

                          },
                          transform : (value, field) => {
                            if(field === 'dueDate') {
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
                  <Autocomplete sx={{mt : 2 , width : 150}} 
                    options={['months', 'days']} 
                    value={formValue.term_type}
                    onInputChange={(event, value) => {
                      setValidationError(null);
                      setFormValue((old) => ({...old, term_type : value}))
                    }}
                    renderInput={(params) => <TextField {...params} label='Term Type' size='small'/>}
                  />
              </Grid>
              
              <Grid item xs={12}>
                <LoanDetailsTable banks={banks} rows={rows} setRows={setRows}/>
              </Grid>
            </Grid>
          </FormStep>
          <FormStep
            stepName="Deduction Details"
            schema={deductionSchema}
            onSubmit={() => {
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
            <Grid container >
              <Grid item xs={10}>
                <Autocomplete
                  options={deductions.map((v) => v.deductionType)}
                  value={deductionItem}
                  onInputChange={ (e,v) => {
                    setDeductionItem(v)
                  }}
                  renderInput= { (params) => <TextField {...params}  label='Deductions'/>}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  onClick={() => {
                    if(deductionItem){
                      let contains  = false;
                      for (const d of deductionsData) {
                        if(d.label === deductionItem){ contains = true }
                      }
                      if(!contains){
                        const format = deductionItem.toLowerCase().split(' ').join('_')
                        const d = [...deductionsData, {label : deductionItem, name : format, amount : ''}]
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
            <Grid container gap={1.5} marginTop={1.5}>
              { deductionsData && deductionsData.map((d, i) =>(
                <TextField 
                label={d.label} 
                value={d.amount}
                error={validationError && Boolean(validationError[d.name])}
                type='number'
                onChange= {(e) =>{
                  setValidationError(null)
                  const d = deductionsData.map((v, index) => {
                    return i === index ? {...v, amount : e.target.value} : v
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
              ))}
            </Grid>
          </FormStep>
          <FormStep
            stepName="Summary"
            onSubmit={() => {
              
            }}
            schema={yup.object({})}
          >
            <Box
              // make grid
              display='flex'
              justifyContent='center'
              gap={5}
              mt={5}
              mx='auto'
              width='70%'
            >
              <PreviewLabel
                label="Borrower's Name"
                value={formValue.customer_name}
              />
              <PreviewLabel
                label="Check Issued Name"
                value={formValue.check_issued_name}
              />
            </Box>
            <Box 
              display='flex'
              justifyContent='center'
              gap={5}
              mt={3}
            >
              <PreviewLabel label='Bank Name' value={formValue.bank_name}/>
              <PreviewLabel label='Check Number' value={formValue.check_number} />
              <PreviewLabel label='Check Date' value={dayjs(formValue.check_date).format('MM-DD-YYYY')}/>
            </Box>
            <Box 
              display='flex'
              justifyContent='center'
              gap={5}
              mt={3}
            >
              <PreviewLabel
                label='Loan Category'
                value={formValue.loan_category}
              />
              <PreviewLabel
                label='Loan Facility'
                value={formValue.loan_facility}
              />
              <PreviewLabel
                label='Loan Collateral'
                value={formValue.collateral}
              />
            </Box>
            <Box 
              display='flex'
              justifyContent='center'
              gap={5}
              mt={3}
            >
              <PreviewLabel
                label='Principal Amount'
                value={numberFormat.format(formValue.principal_amount)}
              />
              <PreviewLabel
                label='Interest Rate'
                value={`${Number(formValue.interest_rate).toFixed(2)}%`}
              />
              
            </Box>
            <Box mt={3}>
              <Grid container gap={1}>
                <Grid item xs={9}>
                  <LoanTablePreview 
                    details={formValue.loan_details}
                  />
                </Grid>
                <Grid item flex={1}>
                  <LoanDeductionPreview details={formValue.deduction}/>
                </Grid>
              </Grid>
            </Box>
          </FormStep>
          <FormStep
            stepName="Voucher Details"
            schema={voucherSchema}
            onSubmit={() => {
              const nameFormat =voucher.map((v) => {
                const names = v.name.split('-')
                const format = names.filter((_, i) => i !== 0).join('-')
                return { ...v, title : format.trim() }
              })
              console.log(formValue.check_date)
              setVoucher(nameFormat)
              setFormValue({...formValue, voucher : nameFormat})
            }}
          >
            <Box display='flex' gap={2} my={2}>
              {/* <TextField fullWidth label='Prepared by'/>
              */}
              <ComboBox 
                value={formValue.prepared_by}
                nameField='prepared_by'
                label='Prepared By'
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
                        console.log(field, d)
                        const newValue = voucher.map((val, index) => {
                          return i === index ? {...val,  name : d.value, id : d.id  } : val
                        })

                        console.log('newValue', newValue)
                        setVoucher(newValue)
                        setFormValue({...formValue, voucher : newValue})
                      }} />
                  </Grid>
                  <Grid item>
                    <TextField 
                      type='number'  
                      label="Credit"
                      sx={{width : 150}}
                      value={v.credit}
                      onChange={(e)=>{
                        const newValue = voucher.map((val, index) => {
                          return i === index ? {...val, credit : e.target.value} : val
                        })
                        setVoucher(newValue)
                        setFormValue({...formValue, voucher : newValue })
                      }}
                      />
                  </Grid>
                  <Grid item >
                    <TextField 
                      type='number'
                      label="Debit"
                      sx={{width : 150}}
                      value={v.debit}
                      onChange={(e)=>{
                        const newValue = voucher.map((val, index) => {
                          console.log(index)
                          return i === index ? {...val, debit : e.target.value} : val
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
                  <Typography fontStyle='italic' fontSize='14px' >{Math.abs(totalCredit - totalDebit)}</Typography>
                </Box>
              </Box>
            </Box>
          </FormStep>
          <FormStep
            stepName='Print Voucher'
            schema={yup.object({})}
            onSubmit = {() => {
              console.log(formValue)
            }}
          >
            <Box>
              <Typography display='flex' justifyContent='center'>
                <CheckCircleOutlineRounded color="success" sx={{fontSize : 70}}/>
              </Typography>
              <Typography display='flex' justifyContent='center'  sx={{fontSize : 20}} >All Setup?</Typography>
              <Typography display='flex' justifyContent='center' mt={2}>
                <Button variant='outlined' color='success'sx={{fontSize : 15}}
                onClick={() => {
                  console.log(formValue)
                  
                  const templateData = {
                    borrower : formValue.customer_name,
                    date : dayjs(new Date()).format('MM-DD-YYYY'), 
                    details : formValue.voucher,
                    voucherNumber : formValue.voucher_number,
                    logo : c2gLogo,
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

                }}
                >Print Voucher</Button>
              </Typography>
            </Box>
          </FormStep>
        </MultiStepForm1>
      </div>  
    </LoanFormContext.Provider>
  )
}

function PreviewLabel({label, value}){
  return(
    
  <Box>
    <StyledLabel>{value}</StyledLabel>
    <Typography style={{
      letterSpacing : '1px',
      textAlign : 'center',
      fontSize : 'smaller',
      fontStyle : 'italic'
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