import React, { useRef, useState } from 'react'
import Header from '../../components/Header'
import { Box, Button , Grid, MenuItem, Skeleton, TextField, Typography } from '@mui/material'
import { useTheme } from '@emotion/react';
import * as yup from 'yup'
import { useFormik } from 'formik';
import { DataGrid, GridActionsCell, GridActionsCellItem, useGridApiRef, GRID_NUMERIC_COL_DEF } from '@mui/x-data-grid';
import { NumericFormat, numericFormatter } from 'react-number-format';
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

import { DeleteForeverOutlined, DeleteOutline, DeleteRounded } from '@mui/icons-material';

const fetcher = url => fetch(url).then(res => res.json())

const denomSchema = yup.object({
  type : yup.string().required(),
  denomination : yup.string().required(),
  quantity: yup.string().required(),
})

const denomRows = [
  {denomination : 1000, quantity: 0, total : 0},
  {denomination : 500, quantity: 0, total : 0},
  {denomination : 200, quantity: 0, total : 0},
  {denomination : 100, quantity: 0, total : 0},
  {denomination : 50, quantity: 0, total : 0},
  {denomination : 20, quantity: 0, total : 0},
  {denomination : 5, quantity: 0, total : 0},
  {denomination : 1, quantity: 0, total : 0},
  {denomination : 0.10, quantity: 0, total : 0},
  {denomination : 0.50, quantity: 0, total : 0},
]

export default function Report() {
  const [denoms, setDenoms] = useState(denomRows)
  const dataGridRef = useGridApiRef()

  const { data, isLoading} = useSWR('/api/reports', fetcher)
  const theme = useTheme();
  const subCash = denoms.reduce((acc, cur) => acc + cur.total, 0)
  
  const handleUpdateRow = (newRow, oldRow) => {

    const updateRow = {...newRow, quantity : Number(newRow.quantity), total : Number(newRow.quantity) * newRow.denomination}
    const updateDenom = denoms.map((v) => {
      if(v.denomination === updateRow.denomination) {
        return updateRow
      }
      return v
    })
    setDenoms(updateDenom)
    return newRow
  }
  
  const denom_column = [
    { field: "denomination", headerName: "Denomination",  flex : 1,
      valueFormatter : ({value}) => {
       const formatValue = numericFormatter(String(value), { thousandSeparator : ',', decimalScale : 2, fixedDecimalScale : true})
       return formatValue
      }
    },
    { field: "quantity", headerName: "No. of PCS",
      ...{...GRID_NUMERIC_COL_DEF, editable: true,  align : 'left', headerAlign : 'left', flex : 1},
      valueGetter : ({value}) => {
        if(!value) return 0
        return Number(value)
      }
    },
    { field: "total", headerName: "Amount" , flex : 1,
      valueGetter : ({row}) => {
        return row.denomination * Number(row.quantity)
      },
      valueFormatter : ({value}) => {
        const formatValue = numericFormatter(String(value), { thousandSeparator : ',', decimalScale : 2, fixedDecimalScale : true})
        return formatValue
      }
    },
  ]

  const payment_column = [
    { field: "payment_type", headerName: "Type", width : 80 },
    { field: "receipt_num",  headerName: "Receipt Num" },
    { field: "full_name", headerName: "Full Name", flex : 1 },
    { field: "total",  headerName: "Total" ,
      valueFormatter : ({value}) => 
        numericFormatter(String(value), { thousandSeparator : ',', decimalScale : 2, fixedDecimalScale : true})
    },
    
  ] 

  return (
    <div style={{ padding: 20 , height: "100%" }}>
      <Header title='Report' showButton={false} />
      <Box style={{display : 'flex', height: '90%', gap : '5px'}}>
        
        <Box border='solid red' flex={1} display='flex' gap={1}>
          <Box flex={1} border='solid blue' position='relative'>
            <Box sx={{position : 'absolute', inset : 0}}>
              <DataGrid 
                apiRef={dataGridRef}
                // sx={{ height: "100%" }} 
                editMode='row'
                columns={denom_column}
                rows={denoms}
                getRowId={(row) => row.denomination} 
                processRowUpdate={handleUpdateRow}
                onProcessRowUpdateError={(error) => console.log(error)}
                slots={{
                  footer : FooterSave
                }}
                slotProps={{
                  footer: { sub_total :  subCash}
                }}
              />
            </Box>
          </Box>
          <Box flex={1} border='solid orange' position='relative'>
          <Box sx={{position: 'absolute', inset : 0}}>
            {isLoading ? 
              (
                <Skeleton variant='rectangular' height='100%' />
              ) : (
              <DataGrid
                slots={{
                  footer : FooterTotal
                }}
                slotProps={{
                  footer: { total : data.total }
                }}
                loading={isLoading} columns={payment_column} rows={data.details} 
              />
              )
            } 

          </Box>
          </Box>
        </Box>
{/* 
        {!isLoading &&
          <DataGrid

          sx={{ height: "100%" }} 
          slots={{
            footer : FooterTotal
          }}
          slotProps={{
            footer: { total : data.total }
          }}
          loading={isLoading} columns={payment_column} rows={data.details} />
        } */}
      </Box>
    </div>
  )
}

function FooterTotal(props) {
  
  return (
    <Box display='flex' padding={2} justifyContent='end' borderTop={1}>
      <Typography>Total : {numericFormatter(String(props.total), { thousandSeparator : ',', decimalScale : 2, fixedDecimalScale : true})}</Typography>
    </Box>
  )
}


async function save(url, {arg}) {
  return await fetch(url, {
    method: 'POST',
    headers : {
      "Content-Type": "application/json",
    },
    body : JSON.stringify({ denoms : arg})
  })
}

function FooterSave(props) {

  const {trigger, isMutating} = useSWRMutation('api/reports', save )
  const [payable, setPayable] = useState(0)
  const formatCashTotal = numericFormatter(String(props.sub_total), { thousandSeparator : ',', decimalScale : 2, fixedDecimalScale : true})
  const changeShort = props.sub_total - payable
  const formatChangeShort = numericFormatter(String(changeShort), { thousandSeparator : ',', decimalScale : 2, fixedDecimalScale : true})
  
  const handleClickedSave = async () => {
    console.log(props.total)
    //   const request =  await trigger(props.data)
  //   if(!request.ok) {
  //     return toastErr('Something went wrong')
  //   }
    
  //   const response = await request.json()
    
  //   if(response.success) {
  //     return toastSucc('Save Successfully')
  //   }
    
  //   return toastErr('Something went wrong')
    
  // }
  }
  return (
    <Box padding={2} borderTop={1} display='flex' flexDirection='column' gap='2px'>
      <Box  display='flex' justifyContent='space-between' >
        <Typography sx={{textTransform : 'uppercase'}}>CASH TOTAL</Typography>
        <Typography sx={{textTransform : 'uppercase'}}>{formatCashTotal}</Typography>
      </Box>
      
      <Box  display='flex' justifyContent='space-between' alignItems='center' >
        <Typography sx={{textTransform : 'uppercase'}}>PAYABLE</Typography>
        <NumericFormat 
          variant='standard'
          customInput={TextField}
          placeholder='PAYABLE'
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          InputProps={{
            sx : {height: '30px', paddingY : '2px' }
          }}
          onValueChange={(value) => {
            const amount = value.floatValue ? value.floatValue : 0
            setPayable(amount)
          }}
          />
      </Box>
      <Box  display='flex' justifyContent='space-between' alignItems='center' >
        <Typography sx={{textTransform : 'uppercase'}}>CHANGE/SHORT</Typography>
        <Typography sx={{textTransform : 'uppercase'}}>{formatChangeShort}</Typography>
      </Box>
    </Box>
  )
}


function TollBar(props) {

  const formik = useFormik({
    initialValues : {
      type : '',
      denomination : '',
      quantity : ''
    },
    validationSchema : denomSchema,
    onSubmit : (value) => {
      addDenomination(value)
    }
  })


  const addDenomination = (value) => {
  
    const id = props.denoms.reduce((acc, curr) => acc = curr.id, 0)

    const denoms = [...props.denoms, {
      id : id + 1,
      type : value.type,
      denomination: value.denomination,
      quantity:  value.quantity,
      total : Number(value.denomination) * Number(value.quantity)
    }]

    props.setDenoms(denoms)
    formik.resetForm();
    
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box display='flex' padding='10px' gap='5px'>
      <TextField label='Type' style={{ width : 100}} name='type' id='type' value={formik.values?.type} select onChange={formik.handleChange}>
        <MenuItem value='coin'>Coin</MenuItem>
        <MenuItem value='bill'>Bill</MenuItem>
        <MenuItem value='check'>Check</MenuItem>
      </TextField>
      <TextField type='number' name='denomination' id='denomination' value={formik.values?.denomination} onChange={formik.handleChange} label='Denomination' />
      <TextField type='number' name='quantity' id='quantity' onChange={formik.handleChange} value={formik.values?.quantity} label='Quantity' />
      <Button sx={{flex : 1}} type='submit' color='success' variant='outlined'>ADD</Button>
      </Box>
    </form>
  )
}
