import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react'
import { NumericFormat } from 'react-number-format';

const CustomFooter = (props) => {
  
  return(
    <Box display='flex' >
      <Typography padding={1} width={150}></Typography>
      <Typography padding={1} align='right' width={150}>Total:</Typography>
      <NumericFormat decimalScale={2} fixedDecimalScale thousandSeparator=","  value={props.total} displayType="text" renderText={(value) => <Typography width={150} padding={1} align='right'>{value}</Typography>}/>
      {/* <Typography padding={1} width={150} align='right'>{props.total}</Typography> */}
    </Box>
  )
}


const EditableDataGrid = ({ rowData, onRowEdit, total }) => {
    const handleEdit = (newRow, oldRow) => {
        return onRowEdit(newRow, oldRow);
      };

      const columns = [
        // { field: 'id', headerName: 'ID', hide: true },
        { field: 'denomination', headerName: 'Denomination', width: 150 },
        {
          field: 'count',
          headerName: 'Count',
          width: 150,
          editable: true,
          type: 'number',
          valueGetter: (params) => {
            if(params.value < 0 || !params.value)
              return 0;
            return params.value
          }, 
        },
        {
          field: 'total',
          headerName: 'Total',
          width: 150,
          valueGetter: (value) => {
            return value.row.denomination * value.row.count
          }, 
          type: 'number',
        },
      ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rowData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection={false}
        disableSelectionOnClick
        processRowUpdate={handleEdit}
        slots={{
          footer : CustomFooter
        }}
        slotProps={{
          footer: { 
            total : total
           },
        }}
        
      />
    </div>
  )
}

export default EditableDataGrid