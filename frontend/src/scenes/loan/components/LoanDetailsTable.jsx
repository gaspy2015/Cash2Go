import { useTheme } from '@emotion/react';
import { DeleteOutlined } from '@mui/icons-material';
import { Button, InputBase, TextField, Tooltip, styled, tooltipClasses } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridEditInputCell, GridRowEditStopReasons, GridRowModes, GridToolbarContainer, GRID_DATE_COL_DEF, useGridApiContext } from '@mui/x-data-grid';
import React, { useState } from 'react'
import { tokens } from '../../../theme';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

function EditToolbar(props) {
  const {setRows, rows, setRowModesModel} = props
  
  const handleClick = () =>{
    const id = rows.length + 1
    setRows((oldRows) => [...oldRows, {id , dueDate: null,  principal : '', interest : '', amortization : '', bank : null, checkNumber: '', isNew : true}])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id] : { mode: GridRowModes.Edit, fieldToFocus: 'dueDate' }
    }))
  }

  return (
    <GridToolbarContainer>
      <Button color='secondary' onClick={handleClick}>
        Add PDC
      </Button>
    </GridToolbarContainer>
  )
}

const formatNumber = (params) =>{
  const format = Number(params.value).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })
  return format
}

const StyledToolTip = styled(({className, ...props}) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));


const renderAmount = (props) => {
  const {error} = props
  return (
    <StyledToolTip open={!!error} title={error} >
      <GridEditInputCell {...props} />
    </StyledToolTip> 
  )
}

const handleAmountValidation = async (params) => {
  
  const error = new Promise((resolve) => {
    resolve(Number(params.props.value) <= 0 ? `Invalid Amount` : null)
  });
  return params.hasChanged ? {...params.props, error : await error} :  {...params.props}
}

const GridDatePicker = (params) => {
  const refApi = useGridApiContext()
  const {value, id, field} = params

  const handleChange = (newValue) => {
    refApi.current.setEditCellValue({ id, field, value: newValue })
  }

  return ( 
  <DatePicker
    value={value}
    onChange={handleChange}
    slots={{
      textField : (props) => {
        const {placeholder, value} = props
        return (
        <InputBase sx={{padding : '0 15px', fontSize : 'inherit'}}
          {...props.InputProps}
          placeholder={placeholder}
          value={value}
          {...props.other}
        />)
      }
    }} 
  />)
}


export default function LoanDetailsTable({banks, rows, setRows}) {

  const theme = useTheme()
  const colors =  tokens(theme.palette.mode)
  const [rowModesModel, setRowModesModel] = useState({})

  const handleDelete = (id) => {
    const filterRows = rows.filter((row) => row.id !== id).map((r,i) =>  ({...r, id : i + 1}) )
    setRows(filterRows)
  }

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowInputChange = (newRow) => {
    // console.log('row change', newRow)
    const updatedRow = { ...newRow, isNew : false}
    setRows(rows.map((row)=> (row.id === newRow.id ? updatedRow : row)))
    return updatedRow
  }

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const columns = [
    { field: 'id', headerName: 'Count', editable: false },
    { field: 'dueDate', headerName: 'Due Date', editable: true, width: 180,
      GRID_DATE_COL_DEF, 
      renderEditCell : GridDatePicker,
      valueFormatter : (params) => {
        if (typeof params.value === 'string') {
          return params.value;
        }
        if(params.value) {
          return dayjs(params.value).format('MM/DD/YYYY')
        }
        return ''
      }
      
    },
    { field: 'principal', headerName: 'Principal', width: 150, editable: true, type : 'number', 
      valueFormatter : (params) => {
        return formatNumber(params)
      },
      preProcessEditCellProps :  handleAmountValidation,
      renderEditCell : renderAmount
    },
    { field: 'interest', headerName: 'Interest', width: 150, editable: true, type : 'number',
      valueFormatter : (params) => {
        return formatNumber(params)
      },
      preProcessEditCellProps :  handleAmountValidation,
      renderEditCell : renderAmount
    },
    { field: 'amortization', headerName: 'Amortization', editable: true, width: 150, type : 'number',
      valueFormatter : (params) => {
        return formatNumber(params)
      },
      valueSetter : (params) => {
        // console.log(params)
        const principal = Number(params.row.principal)
        const interest = Number(params.row.interest)
        return {...params.row, amortization : (principal + interest)}
      }
    },
    { field: 'bank', headerName: 'Bank', width: 150, editable: true, type : 'singleSelect', valueOptions : banks.map(b => b.name),},
    { field: 'checkNumber', headerName: 'Check Number', width: 120, editable: true,   },
    { field: 'action', type : 'actions',
      getActions : ({id}) => {
        return [
          <GridActionsCellItem
            icon={<DeleteOutlined/>}
            color='inherit'
            label='edit'
            sx={{color: colors.redAccent[500], cursor: 'auto'}}
            onClick={(e) => handleDelete(id)}
          />
        ]
      }
    },
  ];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={handleRowInputChange}
      slots={{
        toolbar: EditToolbar,
      }}
      slotProps={{
        toolbar: {setRows, rows, setRowModesModel},
      }}
    />
  )
}
