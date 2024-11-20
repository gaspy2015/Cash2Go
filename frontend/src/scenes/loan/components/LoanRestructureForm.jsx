import React, { useContext, useEffect, useState } from 'react'
import { grey } from '@mui/material/colors';
import MultiStepForm1, { FormStep } from '../../../components/MultiStepForm1';
import LoanRequirementsForm from './LoanRequirementsForm';
import { LoanFormContext, loanDetailsSchema, loanRequirementSchema, voucherSchema } from './LoanForm1';
import { Box, TextField } from '@mui/material';
import LoanDetailsForm from './LoanDetailsForm';
import CurrencyInput from './fields/CurrencyInput';
import * as yup from 'yup';
import SummaryForm from './SummaryForm';
import VoucherForm from './VoucherForm';
import VoucherPrint from './VoucherPrint';
import dayjs from 'dayjs';
import voucherHTMLTemplate from '../../../assets/voucher.html?raw'
import c2gLogo from '../../../assets/c2g_logo_nb.png'
import { Bounce, toast } from 'react-toastify';


const formatRequest = (formValue, banks) => {
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
    return data
}


export default function LoanRestructureForm({popup, dispatcher, loanInitialValue, banks, collaterals, categories, facilities, accountTitle}) {
  const [rows, setRows] = useState([])
  const [formValue, setFormValue] = useState(loanInitialValue)
  const [validationError, setValidationError] = useState(null);
  const [outPrincipal, setOutPrincipal] = useState(formValue.PrincipalBalance)
  const [delayCharges, setDelayCharges] = useState(formValue.PenaltyBalance)
  const [interestBalance, setIntersetBalance] = useState(formValue.InterestBalance)
  const [voucher, setVoucher] = useState(formValue.voucher)
  const [balance, setBalance] = useState(formValue.Balance)

  const handleLoanRequirement = async () => {
    try {
      loanRequirementSchema.validateSync(formValue, 
        {abortEarly : false}
      )
    } catch (err) {
      // console.dir(err)
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

  const handleInputChange = (v, setter, source) => {
    const value = Number(v.value)
    setter(value)
    if(source.event){
      const field = source.event.target.name  
      setFormValue((old) => ({...old, [field] : value}))
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


  useEffect(()=> {
    const updatedBalance = Number(outPrincipal) + Number(delayCharges) + Number(interestBalance)
    setBalance(updatedBalance);    
  }, [outPrincipal, delayCharges, interestBalance])

  useEffect(() => {
    setFormValue((old) => ({...old, 'Balance': balance}))
  },[balance])

  useEffect(()=> {
    setFormValue((old) => ({...old, 'loan_details' : rows }))
  }, [rows])

  const handleSubmit = async () => {

    const data = formatRequest(formValue, banks)
    const request = await fetch(`/api/loans/recalculate/`,  {
      method : 'post',
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify(data)
    })
    
    if(request.ok) {
      const responseJSON = await request.json()
      dispatcher({ type: "RECAL", loan: responseJSON.loan, renewal_id :  responseJSON.renewal_id });
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
          onSubmit={handleSubmit}
        >
          <FormStep
            stepName="Loan Requirements"
            onSubmit={handleLoanRequirement}
            values={formValue}
            schema={loanRequirementSchema}

          >
            <LoanRequirementsForm 
              banks={banks}
              collaterals={collaterals}
              categories={categories}
              facilities={facilities}
              isRestructure={true}
            />
          </FormStep>
          <FormStep
            stepName='Adjusting Entry'
            schema={yup.object({})}
            onSubmit={() => setFormValue((old) => ({...old, 'principal_amount' : old.Balance })) }
          >
            <Box flex={1} display='flex' gap={1.5} flexDirection='column'>
              <CurrencyInput  label='Outstanding Principal' name='PrincipalBalance' 
                value={outPrincipal} 
                customInput={TextField} 
                onValueChange={(value, sourceInfo) => handleInputChange(value, setOutPrincipal, sourceInfo)} />
              <CurrencyInput label='Delayed Charges' name='PenaltyBalance' 
                value={delayCharges} 
                customInput={TextField}
                onValueChange={(value, sourceInfo) => handleInputChange(value, setDelayCharges, sourceInfo)} />
              <CurrencyInput label='Unpaid Interest' name='InterestBalance' 
                value={interestBalance} 
                customInput={TextField}
                onValueChange={(value, sourceInfo) => handleInputChange(value, setIntersetBalance, sourceInfo)} />
              <CurrencyInput sx={{mt : 2.5}} label='Standing Balance' name='Balance' 
                disabled
                value={balance} 
                customInput={TextField}
              />
            </Box>
          </FormStep>
          <FormStep
            stepName='Loan Details'
            schema={loanDetailsSchema}
            onSubmit={handleLoanDetails}
            >
            <LoanDetailsForm banks={banks} rows={rows} setRows={setRows} />
          </FormStep>
          <FormStep 
            stepName='Summary'
            >
            <SummaryForm />
          </FormStep>
          <FormStep
            stepName='Voucher Details'
            schema={voucherSchema}
            onSubmit={() => {
              const nameFormat = voucher.map((v) => {
                const names = v.name.split('-')
                const format = names.filter((_, i) => i !== 0).join('-')
                return { ...v, title : format.trim() }
              })
              setVoucher(nameFormat)
              setFormValue((old) => ({...old, voucher : nameFormat}))
            }}
          >
            <VoucherForm accountTitle={accountTitle} voucher={voucher} setVoucher={setVoucher} />
          </FormStep>
          <FormStep stepName='Print Voucher'>
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
              const voucherTab = window.open('voucher','Print Voucher')
              voucherTab.document.write(voucherHTML)
            }}/>
          </FormStep>
        </MultiStepForm1>
      </div>
    </LoanFormContext.Provider>
  )
}
