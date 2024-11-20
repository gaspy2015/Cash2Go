import { TextField } from '@mui/material'
import React from 'react'
import { NumericFormat } from 'react-number-format'

export default function CurrencyInput(props) {
  
  return (
    <NumericFormat
      
      {...props}
      
      decimalScale={2} fixedDecimalScale thousandSeparator="," 
      // customInput={TextField} 
    />
  )
}
