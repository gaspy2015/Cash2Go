import React, { useEffect, useState } from 'react'
import * as yup from 'yup';
import MultiStepForm1, { FormStep } from '../../../components/MultiStepForm1'
import { LoanFormContext, TextInput, loanDetailsSchema, loanRequirementSchema, voucherSchema } from './LoanForm1'
import LoanRequirementsForm from './LoanRequirementsForm'
import { grey } from '@mui/material/colors';
import LoanDetailsForm from './LoanDetailsForm';
import DeductionDetailsForm from './DeductionDetailsForm';
import c2gLogo from '../../../assets/c2g_logo_nb.png'
import { Box, TextField } from '@mui/material';
import SummaryForm from './SummaryForm';
import CurrencyInput from './fields/CurrencyInput';
import VoucherForm from './VoucherForm';
import VoucherPrint from './VoucherPrint';
import voucherHTMLTemplate from '../../../assets/voucher.html?raw'
import dayjs from 'dayjs';
import { Bounce, toast } from 'react-toastify';

export default function LoanRenewForm({dispatcher, popup, loanInitialValue, banks, collaterals, categories, deductions, facilities, accountTitle, renew = false, restructure = false}) {
  const [formValue, setFormValue] = useState(loanInitialValue)
  const [validationError, setValidationError] = useState(null);
  const [rows, setRows] = useState([])
  const [deductionsData, setDeductionsData] = useState([])
  const [voucher, setVoucher] = useState(formValue.voucher);

  const handleNetProceeds = () => {
    const newPrincipal = formValue.principal_amount - formValue.Balance
    return formValue.deduction.reduce((acc, curr) => acc - curr.amount, newPrincipal)
  }

  const handleLoanRequirement = async () => {
    try {
      loanRequirementSchema.validateSync(formValue, 
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
      setValidationError(error)
    }
  }
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
  useEffect(() => {
    setFormValue({...formValue, loan_details : [...rows]})
  },[rows])

  const handleFormSubmit = async () => {
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
    console.log(data)
    const request = await fetch('/api/loans/renew/', {
      method : 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify(data)
    })
    
    if(request.ok) {
      // dispatch
      const reqJSON = await request.json()
      dispatcher({ type: "RENEW", loan: reqJSON.loan, renewal_id :  reqJSON.renewal_id });
      popup(false)
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

  }


  return (
    <LoanFormContext.Provider value={{formValue, setFormValue, validationError, setValidationError}}>
      <div style={{width: 900, color: grey[600]}} >
      <MultiStepForm1 
        initialFormValues={formValue}
        onSubmit={handleFormSubmit}
      >
        <FormStep 
          stepName="Loan Requirements"
          onSubmit={handleLoanRequirement}
          values={formValue}
          schema={loanRequirementSchema}
        >
          <LoanRequirementsForm isRenew={renew} banks={banks} collaterals={collaterals} categories={categories} facilities={facilities}/>
        </FormStep>
        <FormStep 
          stepName="Loan Details"
          onSubmit={handleLoanDetails}
          values={formValue}
          schema={loanDetailsSchema}
        >
          <LoanDetailsForm banks={banks} rows={rows} setRows={setRows}/>
        </FormStep >
        <FormStep 
          stepName="Adjusting Entry"
          values={formValue}
          onSubmit={() => {}}
          schema = {yup.object()}
        > 
        <Box display='flex' gap={1.5}>
          <Box flex={1} display='flex' gap={1.5} flexDirection='column'>
            <CurrencyInput label='Outstanding Principal'value={formValue.PrincipalBalance} customInput={TextField}/>
            <CurrencyInput label='Delayed Charges' value={formValue.PenaltyBalance} customInput={TextField}/>
            <CurrencyInput label='Unpaid Interest' value={formValue.InterestBalance} customInput={TextField}/>
            <CurrencyInput sx={{mt : 2.5}} label='Standing Balance' value={formValue.Balance} customInput={TextField} />
          </Box>
          <Box flex={1}>
            <DeductionDetailsForm deductions={deductions} deductionsData={deductionsData} setDeductionsData={setDeductionsData} />
          </Box>
        </Box>
        </FormStep>
        <FormStep stepName='Summary'
          onSubmit={() => {}}
          schema={yup.object({})}
        >
          <SummaryForm netProceeds={handleNetProceeds} />
        </FormStep>
        <FormStep stepName='Voucher Details'
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
          <VoucherForm accountTitle={accountTitle} voucher={voucher} setVoucher={setVoucher} />
        </FormStep>
        <FormStep stepName='Print Voucher'
          schema={yup.object({})}
          onSubmit={() => {}}
        >
          <VoucherPrint onClick={() => {
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
            // console.log(voucherHTML)
            const voucherTab = window.open('voucher','Print Voucher')
            voucherTab.document.write(voucherHTML)
          }} />
        </FormStep>
      </MultiStepForm1>
      </div>
    </LoanFormContext.Provider>
  )
}
