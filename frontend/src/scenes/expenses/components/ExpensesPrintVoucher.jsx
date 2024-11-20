import { CheckCircle, CheckCircleOutlineRounded, HandymanOutlined } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import React from 'react'
import voucherTemplateHTML from '../../../assets/voucher.html?raw'
import logo from '../../../assets/c2g_logo_nb.png'
import * as ejs from "ejs";
import useSWRMutation from 'swr/mutation'
import axios from 'axios'
import { toastErr } from '../../../utils'

async function saveExpenses(url, {arg}) {
  return await axios.post(url, arg)
}


export default function ExpensesPrintVoucher({data, onPrevious, onSubmit}) {
  const {trigger} = useSWRMutation('/api/expenses', saveExpenses)
  
  const handlePrevious = () => {
    onPrevious(data)
  }

  const handlePrint = async () => {

    const v_details = data.voucher_details.map(v => {
      return {
        title : v.category.name,
        credit : Number(v.credit),
        debit: Number(v.debit)
      }
    })

    const input = {
      ...data,
      borrower : data.borrower.name,
      logo : logo,
      details: v_details,
      has_second_check : false,
      check_details : `${data.bank.name}-${data.check_number}` 
    }
    const template = ejs.render(voucherTemplateHTML, input)

    const voucherWindow = window.open("", "Print Voucher");
    voucherWindow.document.write(template);
  }
  
  const handleSubmit = async () => {
    return onSubmit(data)
    const v_details = data.voucher_details.map(v => {
      return {
        account_title_id : v.category.id,
        credit : Number(v.credit),
        debit: Number(v.debit)
      }
    })
    // return console.log(data)
    const input = {
      header : {
        payee : data.borrower,
        date: data.date,
        check_number : data.check_number,
        check_date : data.check_date,
        bank: {name : data.bank.name, id : data.bank.id},
        voucher_number : data.voucherNumber,
        prepared_by: data.prepared_by,
        checked_by: data.checked_by,
        approved_by: data.approved_by,
      },
      details: v_details
    }

    const response = await trigger(input)
    
    if(response.status === 200 ) {
      return onSuccess()
    }

    toastErr('Something went wrong!')
  }

  return (
    <Box mt={3}>
        <Typography display='flex' justifyContent='center'>
          <CheckCircleOutlineRounded color="success" sx={{fontSize : 70}}/>
        </Typography>
        <Typography display='flex' justifyContent='center'  sx={{fontSize : 20}} >All Setup?</Typography>
        <Typography display='flex' justifyContent='center' mt={2}>
          <Button variant='outlined' color='success'sx={{fontSize : 15}} onClick={handlePrint}
          >Print Voucher</Button>
        </Typography>
      <Box display='flex' justifyContent='space-between' mt={2}>
        <Button color='success' variant='outlined' onClick={handlePrevious}>Back</Button>
        <Button color='success' variant='outlined' onClick={handleSubmit}>Submit</Button>
      </Box>
    </Box>
  )
}
