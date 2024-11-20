import { Box, Typography, Grid, TextField, FormControl, Select, InputLabel, MenuItem, Button } from "@mui/material"
import React, { useState } from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";

const style = { 
  width: '500px',
  height : '505px',
  border: '1px solid #000',
  borderRadius: '10px',  
  position : 'absolute', 
  top : 'calc(50% - (505px / 2))', 
  left : 'calc(50% - ( 500px / 2))',
  bgcolor: 'background.paper',
  p: 2,
}

export default function BorrowersModal ({onOpen, borrowerInfo, dispatcher}) {
  const [borrower, setBorrower] = useState(borrowerInfo.borrower)
  const [spouse, setSpouse] = useState(borrowerInfo.spouse)
  const [borrowersBirthday, setBorrowersBirthday] = useState(dayjs((borrowerInfo.borrower.birthdate)))
  const [spouseBirthday, setSpouseBirthday] = useState(dayjs((borrowerInfo.spouse.birthdate)))

  function borrowerInputChange(target){
    const {name, value} = target
    const temp = borrower
    temp[name] = value
    setBorrower({...borrower, ...temp})
  }
  
  function spouseInputChange(target){
    const {name, value} = target
    const temp = spouse
    temp[name] = value
    setSpouse({...spouse, ...temp})
  }

  async function submit(){
    const data = {
      borrower : {
        ...borrower, 
        birthdate : borrowersBirthday.toISOString().split('T')[0]
      },
      spouse : {
        ...spouse,
        birthdate : spouseBirthday.toISOString().split('T')[0]
      }
    }

    if(borrowerInfo.id) {
      //post
      data.id = borrowerInfo.id
      const req = await fetch('/api/customers/', {
        method : 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body : JSON.stringify(data)
      })
      if(req.ok) {
        dispatcher({type : 'UPDATE', borrower : {
          id : data.id,
          address :  borrower.address, 
          contactNo : borrower.phoneNum,
          gender: borrower.gender,
          f_name : borrower.fName,
          m_name : borrower.mName,
          l_name:  borrower.lName,
        }})
        onOpen(false)
      }
    }else{
      const req = await fetch('/api/customers/', {
        method : 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body : JSON.stringify(data)
      })

      if(req.ok){
        const {id} = await req.json()
        dispatcher({type : 'ADD', borrower : {
          id : id,
          address : borrower.address, 
          contactNo : borrower.phoneNum,
          gender: borrower.gender,
          f_name : borrower.fName,
          m_name : borrower.mName,
          l_name:  borrower.lName,
        }})
        onOpen(false)
      }
      // if status ok clear input
    }
  }

  return (
    <>
      <Box sx={style} autoComplete="off">
        <Typography>Borrower Info</Typography>
        <Grid container spacing={'10px'} sx={{ mt : '1px'}}>
          <Grid item xs={4}>
            <TextField name="fName" value={borrower.fName} onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="First Name" variant="outlined" />
          </Grid>
          <Grid item xs={4}>
            <TextField name="mName" value={borrower.mName} onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Middle Name" variant="outlined" />
          </Grid>
          <Grid item xs={4}>
            <TextField name="lName" value={borrower.lName} onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Last Name" variant="outlined" />
          </Grid>
          <Grid item xs={4}>
            <TextField name="phoneNum" value={borrower.phoneNum}  onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Phone Number" variant="outlined" />
          </Grid>
          <Grid item xs={8}>
            <TextField name="address" value={borrower.address} onChange={(e) => borrowerInputChange(e.target)} fullWidth id="outlined-basic" label="Address"  variant="outlined" />
          </Grid>
          <Grid item xs={4} >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker name="birthdate" value={borrowersBirthday} onChange={(e) => {setBorrowersBirthday(e)}} label='Birthday'/>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={4} >
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select label="Gender" name="gender" value={borrower.gender} onChange={(e) => borrowerInputChange(e.target)}>
                <MenuItem value={'MALE'}>Male</MenuItem>
                <MenuItem value={'FEMALE'}>Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} >
            <FormControl fullWidth>
              <InputLabel>Civil Status</InputLabel>
              <Select label="Civil Status" name="civilStatus"  value={borrower.civilStatus} onChange={(e) => borrowerInputChange(e.target)}>
                <MenuItem value='MARRIED'>Married</MenuItem>
                <MenuItem value='SINGLE'>Single</MenuItem>
                <MenuItem value='WIDOWED'>Widowed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{mt : 2}}>
          <Typography>Spouse Info</Typography>
          <Grid container spacing={'10px'} sx={{ mt : '1px'}}>
            <Grid item xs={4}>
              <TextField name="fName" value={spouse.fName} onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="First Name" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <TextField name="mName" value={spouse.mName} onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Middle Name" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <TextField name="lName" value={spouse.lName} onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Last Name" variant="outlined" />
            </Grid>
            <Grid item xs={4}>
              <TextField name="phoneNum" value={spouse.phoneNum} onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Phone Number" variant="outlined" />
            </Grid>
            <Grid item xs={8}>
              <TextField name="address" value={spouse.address} onChange={(e) => spouseInputChange(e.target)} fullWidth id="outlined-basic" label="Address" variant="outlined" />
            </Grid>
            <Grid item xs={4} >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker name="birthdate" label='Birthday' value={spouseBirthday} onChange={(e) => {setSpouseBirthday(e)}}/>
            </LocalizationProvider>
            </Grid>
            <Grid item xs={4} >
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select label="Gender" name="gender" value={spouse.gender} onChange={(e) => spouseInputChange(e.target)}>
                  <MenuItem value='MALE'>Male</MenuItem>
                  <MenuItem value='FEMALE'>Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
          <Box sx={{display : 'flex', gap: 1, justifyContent: 'flex-end', mt: 1}}>
            <Button onClick={() => onOpen(false)} variant="contained">Cancel</Button>
            <Button variant="contained" onClick={submit}>Save</Button>
          </Box>
      </Box>
    </>
  )
}
