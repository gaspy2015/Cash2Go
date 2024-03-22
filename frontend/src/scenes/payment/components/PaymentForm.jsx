import React from 'react'
import MultiStepForm1, { FormStep } from '../../../components/MultiStepForm1'
import { DataGrid } from '@mui/x-data-grid'

export default function PaymentForm() {
  return (
    <div style={{width: 900}}>
      <MultiStepForm1>
        <FormStep stepName='Loan Details'>
          {/* <DataGrid /> */}
        </FormStep>
      </MultiStepForm1>
    </div>
  )
}
