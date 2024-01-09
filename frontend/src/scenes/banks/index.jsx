import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'

export default function Banks() {
  const [banks, setBanks] = useState([])
  useEffect(()=>{
    const reqBanks = async () =>{
      const req = await fetch('http://localhost:8000/banks')
      const reqJSON = await req.json();
      console.log(reqJSON)
      setBanks(reqJSON)
    }
    reqBanks()
  }, [])

  return (
    <div style={{height : '75%', padding : 20}}>
      <Header title={'Banks'} subtitle={'List of bank'} showButton= {false}/>
    
        <DataGrid 
          columns={[
            // { field: 'id', headerName : 'Num.', },
            { field: 'name', flex : 1, headerName : 'Bank Name'},
            { field: 'check_location', flex : 1, headerName : 'Bank Location'},
          ]}
          rows={banks}
        />

      
    </div>
  )
}
