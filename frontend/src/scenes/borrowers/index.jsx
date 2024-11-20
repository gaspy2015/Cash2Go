import { Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Container, Button, Box, Typography, Modal, TextField, Grid, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import { useEffect, useReducer, useState } from "react"
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import BorrowersModal from "./Components/BorrowersModal";
// import faker from "../../data/faker";


// const useFakeData = true; // set to false to disable fakedata

function reducer(state, action){
  switch(action.type){
    // return state
    case 'INIT': return action.customers
    case 'ADD' : return [
      ...state, action.borrower
    ]
    case 'UPDATE' : return state.map((c) =>{
      if(c.id === action.borrower.id)
      { 
        return action.borrower 
      }
      else {return c}
    })

    default : throw Error('Unknown action.');
  }
}

const Borrowers = () => {

  const borrowersData = {
    borrower : {
      fName : '',
      mName : '',
      lName : '',
      phoneNum : '',
      birthdate : new Date().toISOString().split('T')[0],
      address : '',
      gender : '',
      civilStatus : '', 
    },
    spouse : {
      fName : '',
      mName : '',
      lName : '',
      birthdate : new Date().toISOString().split('T')[0],
      phoneNum : '',
      address : '',
      gender : ''
    }
  }

  // const fakerData = {
  //   borrower : {
  //     fName : faker.person.firstName(),
  //     mName : faker.person.middleName(),
  //     lName : faker.person.lastName() ,
  //     phoneNum : faker.phone.number(),
  //     birthdate : faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0],
  //     address : `${faker.location.streetAddress()} ${faker.location.city()}-${faker.location.zipCode()}`,
  //     gender : faker.person.sexType().toUpperCase(),
  //     civilStatus : 'MARRIED', 
  //   },
  //   spouse : {
  //     fName : faker.person.firstName(),
  //     mName : faker.person.middleName(),
  //     lName : faker.person.lastName(),
  //     birthdate : faker.date.birthdate({ min: 18, max: 50, mode: 'age' }).toISOString().split('T')[0],
  //     phoneNum : faker.phone.number(),
  //     address : `${faker.location.streetAddress()} ${faker.location.city()}-${faker.location.zipCode()}`,
  //     gender : faker.person.sexType().toUpperCase()
  //   }
  // }

  // const data = useFakeData ? fakerData : borrowersData

  const [open, setOpen] = useState(false)

  const [borrower, setBorrower] = useState({...data})
  const [customers, dispatch] = useReducer(reducer, null)
  
  async function edit(id){
    const req = await fetch(`/api/customers/info/${id}`)
    const bInfo = await req.json();
    // setIsUpdate(true)
    const bData = {...borrower}
    const b = bData.borrower
    const s = bData.spouse
    //borrowers
    b.fName = bInfo.cfname
    b.mName = bInfo.cmname
    b.lName = bInfo.clname
    b.address = bInfo.address
    b.phoneNum = bInfo.contactno
    b.birthdate = bInfo.birthdate
    b.gender = bInfo.gender
    b.civilStatus = bInfo.maritalstatus
    //spouse info
    s.fName = bInfo.spousefname
    s.mName = bInfo.spousemname
    s.lName = bInfo.spouselname
    s.address = bInfo.spouseaddress
    s.birthdate = bInfo.spousebirthdate
    s.phoneNum = bInfo.spousecontactno
    s.gender = bInfo.spousegender

    bData.id = id
    bData.borrower = b
    bData.spouse = s
    setBorrower({...bData})
    
    // console.log('edit', borrower)
    setOpen(true)
  }

  async function add (){
    setBorrower({...data})
    setOpen(true)
  }

  useEffect(()=>{
    
    const getCustomer = async() =>{
      const req = await fetch('/api/customers')
      const resJson = await req.json()
      dispatch({type : 'INIT', customers : resJson})
    }

    getCustomer()

  }, [])

  return (
    <>
      <Container sx={{display : 'flex', flexDirection : 'column', gap : '5px'}}>
        <Box sx={{display : 'flex', justifyContent : 'space-between', alignItems : 'center'}}>
          <Typography >Borrowers</Typography>
          <Button onClick={add} variant="contained">Add</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
              <TableCell>Name</TableCell>
                <TableCell>Contact No.</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers && customers.map((customer, i) => (
                <TableRow key={i}>
                  <TableCell>{customer.f_name} {customer.m_name} {customer.l_name}</TableCell>
                  <TableCell>{customer.contactNo}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.gender}</TableCell>
                  <TableCell><Button variant="contained" color="error" onClick={() => edit(customer.id)}>Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* SFSDFSFSFD */}
        
        <Modal open={open}>
            <BorrowersModal onOpen={setOpen} borrowerInfo={borrower} dispatcher={dispatch} />
        </Modal>
      </Container>
    </>
  )
}

export default Borrowers