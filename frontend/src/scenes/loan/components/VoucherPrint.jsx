import { CheckCircleOutlineRounded } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import React from 'react'

export default function VoucherPrint({onClick}) {
  return (
    <>
      <Box>
        <Typography display='flex' justifyContent='center'>
          <CheckCircleOutlineRounded color="success" sx={{fontSize : 70}}/>
        </Typography>
        <Typography display='flex' justifyContent='center'  sx={{fontSize : 20}} >All Setup?</Typography>
        <Typography display='flex' justifyContent='center' mt={2}>
          <Button variant='outlined' color='success'sx={{fontSize : 15}}
            onClick={onClick}
          >Print Voucher</Button>
        </Typography>
      </Box>
    </>
  )
}
