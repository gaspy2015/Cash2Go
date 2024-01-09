import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'

export default function Category() {
  const [category, setCategory] = useState([])
  useEffect(() =>{
    const reqCategory = async () =>{
      const req = await fetch('http://localhost:8000/loans/category');
      const reqJSON = await req.json();
      console.log(reqJSON)
      setCategory(reqJSON);
    }
    reqCategory()
  }, [])

  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header title={'Loan Category'} />
      <DataGrid 
        columns={[
          { field: 'name', flex : 1, headerName : 'Name'},
          { field: 'code', flex : 1, headerName : 'Code'},
        ]}
        rows={category}
      />
    </div>
  )
}
