import { Box, Button } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import React from 'react'
import Papa from 'papaparse';
import dayjs from 'dayjs';
import paymentTemplate from '../../../assets/payment.html?raw'
import * as ejs from 'ejs'

const CustomFooter = ({csvClick, printClick}) => {
  return (
    <Box mx={2} my={1} display='flex' gap={1} justifyContent='end'>
      <Button color='success' variant='outlined' onClick={printClick}>Print</Button>
      <Button color='success' variant='outlined' onClick={csvClick}>Get Csv</Button>
    </Box>
  )
}

const formatCurrency = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})

export const downloadFile = (file, content) => {
  
  const link = document.createElement('a')

  link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  link.setAttribute('download', file);

  link.style.display = 'none';

  document.body.appendChild(link);

  link.click()

  document.body.removeChild(link);

}


export default function PaymentDataGrid({rows, ...props}) {
  const handleCsvClick = () => {
    const payments = rows.map(v => {
      return {
        payment_date : v.payment_date ? dayjs(v.payment_date).format('MM-DD-YYYY') : '',
        payment_receipt : v.payment_receipt,
        full_name : v.fullName,
        pn_number : v.pn_number,
        payment_principal : formatCurrency.format(v.payment_principal),
        payment_interest : formatCurrency.format(v.payment_interest),
        payment_penalty : formatCurrency.format(v.payment_penalty),
        payment_amount : formatCurrency.format(v.payment_amount),
        payment_type : v.payment_type,
        bank : v.bank ? v.bank : '',
        check_date : v.check_date ? dayjs(v.check_date).format('MM-DD-YYYY') : '',
        check_number : v.check_number ? v.check_number : '',
      }  
    })
    const content = Papa.unparse(payments)
    downloadFile(`(${dayjs().format('MM-DD-YYYY')})-payment`, content)
  } 
  const handlePrint = () => {
    const data = rows.map(v => ({
      ...v,
      check_date : v.check_date ? dayjs(v.check_date).format('MM-DD-YYYY') : '-',
      bank : v.bank.trim() === '' ? '-' : v.bank,
      payment_principal : formatCurrency.format(v.payment_principal),
      payment_interest : formatCurrency.format(v.payment_interest),
      payment_penalty : formatCurrency.format(v.payment_penalty),
      payment_amount : formatCurrency.format(v.payment_amount),
      payment_date : dayjs(v.payment_date).format('MM-DD-YYYY'),
      check_number : v.check_number.trim() === '' ? '-' : v.check_number
      
    }))
    const html = ejs.render(paymentTemplate, { payments : data }) 
    const paymentWindow = window.open("", "Print");
    paymentWindow.document.write(html);
  }
  const NoPaymentOverLay = () =>{
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        height='100%'
      >
        No payment
      </Box>
    )
  }
  return (
    <DataGrid 
      rows={rows}
      {...props}
      slots={{
        footer : CustomFooter,
        noRowsOverlay : NoPaymentOverLay
      }}
      slotProps={{
        footer: { 
          csvClick : handleCsvClick,
          printClick : handlePrint
        },
      }}
    />
  )
}
