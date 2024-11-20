import { Paper, TableBody, Table, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'
import { NumericFormat } from 'react-number-format'

export default function LoanTableDaysPreview({details}) {
  return (
    <TableContainer component={Paper} >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={8}>
              Loan Details
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Cleared Date</TableCell>
            <TableCell>Check Date</TableCell>
            <TableCell>Check Amount</TableCell>
            <TableCell>Bank</TableCell>
            <TableCell>Check Number</TableCell>
            <TableCell>No. days</TableCell>
            <TableCell>Interest</TableCell>
            <TableCell>Net Proceeds</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{dayjs(row.dueDate).format('MM-DD-YYYY')}</TableCell>
              <TableCell>{dayjs(row.check_date).format('MM-DD-YYYY')}</TableCell>
              <TableCell>
                <NumericFormat 
                  value={row.principal}
                  decimalScale={2} fixedDecimalScale
                  thousandSeparator="," 
                  displayType="text" 
                  renderText={(v) => <p>{v}</p>}/>
              </TableCell>
              <TableCell>{row.bank_name}</TableCell>
              <TableCell>{row.checkNumber}</TableCell>
              <TableCell>{row.numberDays}</TableCell>
              <TableCell>
                <NumericFormat 
                  value={row.interest}
                  decimalScale={2} fixedDecimalScale
                  thousandSeparator="," 
                  displayType="text" 
                  renderText={(v) => <p>{v}</p>}/>
              </TableCell>
              <TableCell>
                <NumericFormat 
                  value={row.net_proceeds}
                  decimalScale={2} fixedDecimalScale
                  thousandSeparator="," 
                  displayType="text" 
                  renderText={(v) => <p>{v}</p>}/>
              </TableCell>
            </TableRow>
          ))

          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}
