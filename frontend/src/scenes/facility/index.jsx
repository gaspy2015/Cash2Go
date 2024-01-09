import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'

export default function Facility() {
  const [facility, setFacility] = useState([])
  
  useEffect(() =>{ 
    const reqFacility = async () =>{
      const req = await fetch('http://localhost:8000/loans/facility')
      const reqJSON  = await req.json()
      setFacility(reqJSON)
    }

    reqFacility()
  }, [])
  return (
    <div style={{height : '75%', padding : 20}}>
      <Header title={'Facilities'} />
      <DataGrid 
        columns={[
          { field: 'name', flex : 1, headerName : 'Name'},
          { field: 'code', flex : 1, headerName : 'Code'},
        ]}
        rows={facility}
      />
    </div>
  )
}
