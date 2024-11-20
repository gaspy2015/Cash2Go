import { Box, Grid, styled, TextField, MenuItem, Typography, Skeleton } from "@mui/material"
import { DataGrid } from '@mui/x-data-grid'
import Card from "./component/Card";
import { useEffect, useState } from "react";
import { toastErr, formatNumber } from '../../utils'
import LinearProgress from '@mui/material/LinearProgress';
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

const StlyedDataGrid = styled(DataGrid)({
  '& .status--4' : {
    backgroundColor : '#78350f',
    '&:hover': {
      backgroundColor : '#92400e'
    }
  },
  '& .status--1' : {
    backgroundColor : '#14532d',
    '&:hover': {
      backgroundColor : '#15803d'
    }
  },
})
const options = [
  {value : 'month', label : 'month'},
  {value : 'year', label : 'year'},
]

const fetcher = url => fetch(url).then(r => r.json())

const Dashboard = () => {
  const {data : weeklyCollectionData, isLoading : weeklyCollectionLoading} = useSWR('/api/loans/collections/week', fetcher)
  const {data : monthlyCollectionData, isLoading : monthlyCollectionLoading} = useSWR('/api/loans/collections/month', fetcher)
  const {data : yearlyCollectionData, isLoading : yearlyCollectionLoading} = useSWR('/api/loans/collections/year', fetcher)
  const {data : incomeData, isLoading : incomeLoading} = useSWR('/api/loans/collections/income', fetcher)
  const {data : birthdayData, isLoading: birthdayLoading} = useSWR('/api/customers/birthday', fetcher)
  
  const columns = [
    {field : 'due_date', headerName : 'Due Date' , width : 100},
    {field : 'pn_number', headerName : 'PN Number', width : 200},
    {field : 'full_name', headerName : 'Borrower Number', width : 200},
    {field : 'monthly_principal', headerName : 'Principal', width : 150},
    {field : 'monthly_interest', headerName : 'Interset', width : 150},
    {field : 'pr_number', headerName : 'PR Number', width : 150},
  ]

  const birthday_column = [
    {field : 'full_name', headerName : 'Name' , width : 250 },
    {field : 'label', headerName : 'Desc', width : 200 },
    {field : 'phone_number', headerName : 'Contact Number', width : 200 },
    {field : 'date', headerName : 'Date', width : 150},
  ]

  const [income, setIcome] = useState({})
  const [type, setType] = useState(options[0].value)

  return (
    <Box height='100%' overflow='auto' padding={2} >
      <Box display='flex' justifyContent='start' gap={2.5}>
        {incomeLoading ? (
          <>
            <Skeleton variant='rectangular' width={180} height={90}/>
            <Skeleton variant='rectangular' width={180} height={90}/>
            <Skeleton variant='rectangular' width={180} height={90}/>
          </>
        ) : (
          <>
            <Card title='Dialy Income' content={formatNumber.format(incomeData.data.daily)} />
            <Card title='Weekly Income' content={formatNumber.format(incomeData.data.weekly)} />
            <Card title='Monthly Income' content={formatNumber.format(incomeData.data.monthly)}/>
          
          </>
        )
        }
      </Box>
      <Box >
        <Box style={{height : '25rem'}} border='solid orange' display='flex' flexDirection='column'>
          <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Weekly Collection</p>
          {weeklyCollectionLoading ? (
            <Skeleton variant='rectangular' height='100%'/>
          ) : (
            <Box border='solid blue' height='100%'>
              <StlyedDataGrid
                sx={{
                  display: 'grid',
                  gridTemplateRows: 'auto',
                }}
              loading={weeklyCollectionLoading}  rows={weeklyCollectionData.data} columns={columns} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
            </Box>
          )}
        </Box>
        
        <Box border='solid orange'  style={{height : '25rem', marginTop : 75}} >
          <Box style={{ display : 'flex', justifyContent : 'space-between'}}>
            <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Monthly and Yearly Collections</p>
            <TextField sx={{py : 1.2}}  select size="small" defaultValue={type} value={type} 
              onChange={(e) => {
                setType(e.target.value)
              }}>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
           {type === 'month' ?
              (
              
                <Box border='solid blue' height='100%'>
                  <MonthlyCollectionsDataGrid columns={columns} isLoading={monthlyCollectionLoading} monthlyCollection={monthlyCollectionData} />
                </Box>
              
              ) : (
                <Box border='solid blue' height='100%'>
                  <YearlyCollectionsDataGrid columns={columns} isLoading={yearlyCollectionLoading} yearlyCollection={yearlyCollectionData} />
                </Box>
              )
            }
        </Box>
        
        <Box style={{height : '25rem', marginTop : 75}} border='solid orange' display='flex' flexDirection='column' >
          <p style={{ padding : 16 , textTransform : 'uppercase', fontSize : 'medium'}}>Birthday</p>
          <Box border='solid blue' height='100%'>
            <BirthdayDataGrid columns={birthday_column} birthdayData={birthdayData} isLoading={birthdayLoading} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function MonthlyCollectionsDataGrid ({columns, monthlyCollection, isLoading }) {
  return isLoading ? <Skeleton variant='rectangular' height='100%' /> :  <StlyedDataGrid columns={columns} rows={monthlyCollection.data} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
}
function YearlyCollectionsDataGrid ({columns, yearlyCollection, isLoading }) {
   return isLoading ? <Skeleton variant='rectangular' height='100%' /> : <StlyedDataGrid  columns={columns} rows={ yearlyCollection.data} getRowId={(r) => r.loan_detail_id } getRowClassName={(params) => `status--${params.row.payment_status_id}`}/>
}

function BirthdayDataGrid({columns, birthdayData, isLoading}) {
  return isLoading ? <Skeleton variant='rectangular' height='100%' /> : <StlyedDataGrid columns={columns} rows={birthdayData.data}/> 
}

export default Dashboard