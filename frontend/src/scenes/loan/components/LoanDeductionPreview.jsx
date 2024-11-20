import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'
import { numberFormat } from './LoanForm1'
import { NumericFormat } from 'react-number-format'

export default function LoanDeductionPreview({details}) {
  const getTotal = (data) => {
    return data.reduce((acc, cur) => acc + cur.amount, 0)
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align='center' colSpan={2}>
              Deduction Details
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { details && details.map((v) => (
            <TableRow>
              <TableCell>{v.label}</TableCell>
              <TableCell><NumericFormat 
                value={v.amount}
                decimalScale={2} fixedDecimalScale
                thousandSeparator="," 
                displayType="text" 
                renderText={(v) => <p>{v}</p>}
              /></TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>
              <NumericFormat 
                value={getTotal(details)}
                decimalScale={2} fixedDecimalScale
                thousandSeparator="," 
                displayType="text" 
                renderText={(v) => <p>{v}</p>}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
