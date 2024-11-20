import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'

const numberFormat = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})

export default function LoanTablePreview({details}) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={6}>
              Loan Details
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Due Date</TableCell>
            <TableCell>Pricipal Amount</TableCell>
            <TableCell>Interest</TableCell>
            <TableCell>Amortization</TableCell>
            <TableCell>Bank</TableCell>
            <TableCell>Check Num.</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { details &&
            details.map((v, id) => (
              <TableRow key={id}>
                <TableCell>{dayjs(v.dueDate).format('MM-DD-YYYY')}</TableCell>
                <TableCell>{numberFormat.format(Number(v.principal))}</TableCell>
                <TableCell>{numberFormat.format(Number(v.interest))}</TableCell>
                <TableCell>{numberFormat.format(Number(v.amortization))}</TableCell>
                <TableCell>{v.bank_name}</TableCell>
                <TableCell>{v.checkNumber}</TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}
