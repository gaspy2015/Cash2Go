import React from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
export default function SuccessComponent() {
  return (
    <Box display='flex' justifyContent='center'>
       <CircularProgress  color="success" />
    </Box>
  )
}
