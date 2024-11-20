import React, { useContext } from 'react'
import { LoanFormContext, PreviewLabel, numberFormat } from './LoanForm1'
import { Box } from '@mui/system'
import { Grid } from '@mui/material'
import LoanTablePreview from './LoanTablePreview'
import LoanDeductionPreview from './LoanDeductionPreview'
import dayjs from 'dayjs'
import LoanTableDaysPreview from './LoanTableDaysPreview'

export default function SummaryForm({netProceeds}) {
  const {formValue, setFormValue, validationError, setValidationError} = useContext(LoanFormContext)

  return (
    <>
      <Box
        display='flex'
        gap={5}
        mt={5}
      >
        <Box width='75%' display='flex' flexDirection='column' gap={3}>
          <Box display='flex' justifyContent='center' gap={5}>
            <PreviewLabel
              label="Borrower's Name"
              value={formValue.customer_name}
            />
            <PreviewLabel
              label="Check Issued Name"
              value={formValue.check_issued_name}
            />
            <PreviewLabel label='Bank Name' value={formValue.bank_name}/>

          </Box>
          <Box display='flex' justifyContent='center' gap={5}>
            <PreviewLabel label='Check Number' value={formValue.check_number} />
            <PreviewLabel label='Check Date' value={dayjs(formValue.check_date).format('MM-DD-YYYY')}/>

            <PreviewLabel
              label='Loan Category'
              value={formValue.loan_category}
            />
            <PreviewLabel
              label='Loan Facility'
              value={formValue.loan_facility}
            />

          </Box>
          <Box display='flex' justifyContent='center' gap={5}>
            <PreviewLabel
              label='Loan Collateral'
              value={formValue.collateral}
            />
            <PreviewLabel
              label='Principal Amount'
              value={numberFormat.format(formValue.principal_amount)}
            />
            <PreviewLabel
              label='Interest Rate'
              value={`${Number(formValue.interest_rate).toFixed(2)}%`}
            />

            {formValue.term_type === 'months' &&
              (
                <PreviewLabel
                  label='Net Proceeds'
                  value={numberFormat.format(netProceeds && netProceeds() || 0)}
                />
              )
            }

          </Box>
        </Box>
        <Box width='25%' overflow='auto' height={200}>
          <LoanDeductionPreview  details={formValue.deduction}/>
        </Box>
      </Box>
      <Box mt={3}>
        <Grid container gap={1}>
          <Grid item xs={12}>
            {formValue.term_type === 'months' ?
              (
                  <LoanTablePreview
                    details={formValue.loan_details}
                  />
              ) : (
                <LoanTableDaysPreview details={formValue.loan_details} />
              )
            }
          </Grid>
          <Grid item flex={1}>
            
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
