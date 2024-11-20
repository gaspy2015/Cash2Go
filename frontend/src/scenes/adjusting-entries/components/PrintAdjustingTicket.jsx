import { CheckCircleOutlineRounded } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import axios from 'axios'
import * as ejs from 'ejs'
import dayjs from 'dayjs'

export default function PrintAdjustingTicket({onSubmit, data, onPrevious, onPrintTicket}) {
  
  const handlePrint = async () => {
    const request  = await axios.get('/api/adjusting-entries/ticket-number')
    if(!request.status == 200) {
      return console.log(request.statusText)
    }
    const formatDetails = data.voucher_details.map(v => ({
      title: v.category.name,
      debit : v.debit,
      credit : v.credit
    }))

    const data_template = {
      ticket_number : request.data.ticket_number,
      borrower: data.borrower.name,
      date: dayjs(data.date).format('MM-DD-YYYY'),
      details : formatDetails,
      explaination: data.explaination.trim(),
      prepared_by: data.prepared_by,
      checked_by : data.checked_by,
      approved_by: data.approved_by
    }
    onPrintTicket(data_template)
  }
  return (
    <Box>
        <Typography display='flex' justifyContent='center'>
          <CheckCircleOutlineRounded color="success" sx={{fontSize : 70}}/>
        </Typography>
        <Typography display='flex' justifyContent='center'  sx={{fontSize : 20}} >All Setup?</Typography>
        <Typography display='flex' justifyContent='center' mt={2}>
          <Button variant='outlined' color='success'sx={{fontSize : 15}}
            onClick={handlePrint}
          >Print Voucher</Button>
        </Typography>
        <Box display='flex' justifyContent='space-between' mt={2}>
          <Button color='success' variant='outlined' onClick={() => onPrevious(data)}>Back</Button>
          <Button color='success' variant='outlined' onClick={onSubmit}>Submit</Button>
      </Box>
    </Box>
  )
}
