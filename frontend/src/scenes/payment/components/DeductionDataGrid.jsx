import { Box, Button } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import React from 'react'
import Papa from 'papaparse';
import { downloadFile } from './PaymentDataGrid';
import deductionTemplate from '../../../assets/deduction.html?raw'
// ".deduction.html?raw"
import * as ejs from 'ejs'
const CustomFooter = ({print, getCsv}) =>{
  return (
    <Box mx={2} my={1} display='flex' gap={1} justifyContent='end'>
      <Button color='success' variant='outlined' 
      onClick={print}
      >Print</Button>
      <Button color='success' variant='outlined' 
      onClick={getCsv}
      >Get Csv</Button>
    </Box>
  )
}

const formatNumber = (value) => {
  // const amount = value.split(".");
  const format = Number(value).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return format;
};

const deduction_col = [
  { field: "process_date", width: 150, headerName: "Process Date", 
    valueFormatter : (params) => {
      return dayjs(params.value).format('MM-DD-YYYY')
    }
  },
  { field : 'pr_number', width : 120, headerName : 'PR Number'},
  { field: "full_name", width: 220, headerName: "Borrower Name"},
  { field: "pn_number", width: 200, headerName: "PN Number" },
  { field: "service_charge", width: 150, headerName: "Service Charge",
    valueFormatter : (params) => 
      params.value ? formatNumber(params.value) : ''
  },
  { field: "appraisal_fee", width: 150, headerName: "Appraisal Fee",
    valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
  },
  { field: "notarial_fee", width: 150, headerName: "Notarial Fee",
    valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
  },
  { field: "documentary_stamp", width: 150, headerName: "Doc. Stamp",
    valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
  },
  { field: "doc_stamp_bir", width: 150, headerName: "Doc. Stamp (BIR)",
    valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
  },
  { field: "hold_charge", width: 150, headerName: "Hold Charge",
    valueFormatter : (params) => params.value ? formatNumber(params.value) : ''
  },
];


const formatDedutionData = (deduction, placeholder) => {
  const formatDedution = deduction.map((v) => 
    {
      return {
        process_date : dayjs(v.process_date).format('MM-DD-YYYY'),
        pr_number : v.pr_number,
        full_name : v.full_name,
        pn_number : v.pn_number,
        service_charge : v.service_charge ? formatNumber(+v.service_charge) : placeholder,
        appraisal_fee : v.appraisal_fee ? formatNumber(+v.appraisal_fee) : placeholder,
        notarial_fee : v.notarial_fee ? formatNumber(+v.notarial_fee) : placeholder,
        documentary_stamp : v.documentary_stamp ? formatNumber(+v.documentary_stamp) : placeholder,
        doc_stamp_bir : v.doc_stamp_bir ? formatNumber(+v.doc_stamp_bir) : placeholder,
        hold_charge : v.hold_charge ? formatNumber(+v.hold_charge) : placeholder,
      }
    })
  return formatDedution
}

export default function DeductionDataGrid({ rows, ...props}) {

  const handlePrintDeduction = async () => {
    const formatDeductionPrint = formatDedutionData(rows, '-')
    const html = ejs.render(deductionTemplate, { deductions : formatDeductionPrint }) 
    const deductionWindow = window.open("", "Print");
    deductionWindow.document.write(html);
  }
  

  const handleCsvDeduction = async () => {
    
    const formatDeductionCSV = formatDedutionData(rows, '')
    
    const content =  Papa.unparse(formatDeductionCSV, {header : true})
    downloadFile(`(${dayjs().format('MM-DD-YYYY')})-deduction`, content)
  }
  
  return (
    <DataGrid {...props}
      columns={deduction_col}
      rows={rows}
      slots={{
        footer : CustomFooter
      }}
      slotProps={{
        footer : {
          print : handlePrintDeduction,
          getCsv : handleCsvDeduction
        }
      }}
    />
  )
}
