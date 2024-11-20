import { useTheme } from "@emotion/react"
import { tokens } from "../../../theme"
import { DataGrid, GridActionsCellItem, GridRowModes, GRID_SINGLE_SELECT_COL_DEF, useGridApiContext} from "@mui/x-data-grid"
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, Box, TextField, } from "@mui/material"
import { useEffect, useState } from "react"
import dayjs from "dayjs";

const formatNumber = (value) => {
  const format = Number(value).toLocaleString('en', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
  });
  return format;

}

const ComboBox = (params) => {
  const refApi = useGridApiContext()

  const {value, id, field, banks} = params

  const handleInputChange = (event, newValue) => {
    if(event) {
      refApi.current.setEditCellValue({ id, field, value: newValue })
    }
  }

  return (
    <Autocomplete 
      options={banks}
      value={value}
      fullWidth
      getOptionKey={(option) => option.id}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => option.name || "" || option }
      renderInput={(params) => {  return <TextField {...params} />}}
      renderOption={(props, option) => {
        return <Box {...props} component='li' name={option.id} id={option.id}>
            {option.name}
            </Box>
      }}
    />
  ) 
}



export default function DetailsModal(props) {
  const theme = useTheme();
  const {banks} = props
  const colors = tokens(theme.palette.mode);

  const { selectedLoanId } = props;
  const [loanDetails, setLoanDetails] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({})
  const [cellItemDetails, setCellItemDetails] = useState({});
  
  const getBankId = (name) => {
    for (const bank of banks) {
        if(name === bank.name) return bank.id
    }
  }

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  }
 
  const handleEditClick = (id) => () => {
    
    // for (const details of loanDetails) { 
    //   if(details.loan_detail_id === id){
    //     const data = {
    //       loan_detail_id : details.loan_detail_id,
    //       check_number : details.check_number, 
    //       bank_id : getBankId(details.bank_name)
    //     }
    //     console.log('86', data)
    //     setCellItemDetails(data)
    //   }
    // }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  
  };

  const update = (newRow) => {

    return new Promise((resolve, reject) => {
      const {check_number, loan_detail_id, bank_name} = newRow
      
      const data = {
        loan_detail_id,
        check_number,
        bank_id : getBankId(bank_name)
      }
      
      fetch(`/api/loans/details/${selectedLoanId}`, {
        method : 'PUT',
        headers: { "Content-Type": "application/json" },
        body : JSON.stringify(data),
      }).then(response => { resolve(newRow) }
      ).catch(err => reject(err))
    })
  }

  useEffect(() => {
    const getLoanDetail = async() => {
        const req = await fetch(`/api/loans/${selectedLoanId}`)
        const resJson = await req.json()
        setLoanDetails(resJson)
    }
    getLoanDetail()
  }, [])
  
  const handleUpdate =  async (newRow, oldRow) => {
    if(newRow.bank_name === oldRow.bank_name && newRow.check_number === oldRow.check_number) {
      return oldRow
    }
    const row = await update(newRow)
    return row
  }

  const columns = [
    // {field: "loan_detail_id", headerName: "ID" },
    {field: "due_date", headerName: "Due Date", width: 150,
    valueFormatter : (params) => {
      return dayjs(params.value).format('MM-DD-YYYY');
    }
    },
    {field: "monthly_principal", headerName: "Principal",  width: 150,
    valueFormatter : (params) => {
      return formatNumber(params.value)
    } 
    },
    {field: "monthly_interest", headerName: "Interest", width: 150,
    valueFormatter : (params) => {
      return formatNumber(params.value)
    }
    },
    {field: "monthly_amortization", headerName: "Amortization", width: 150,
    valueFormatter : (params) => {
      return formatNumber(params.value)
    }
    },
    {field: "bank_name", headerName: "Bank", width: 150, editable: true, 
      GRID_SINGLE_SELECT_COL_DEF,
      renderEditCell :  (params) => <ComboBox {...params} banks={banks}/>,
    },
    {field: "check_number", headerName: "Check Number", width: 150,  editable: true},
    {field: "description", headerName: "Status", width: 150},
    {field: "actions", headerName: "Actions",  width : 100, type : 'actions',
      getActions : ({id}) => {
        const isEditMode = rowModesModel[id]?.mode === GridRowModes.Edit
        if(!isEditMode) {
          return [
            <GridActionsCellItem
              icon={<EditIcon/>}
              label="Edit"
              onClick={handleEditClick(id)}
            />
          ]
        }

        return [
          <GridActionsCellItem
            icon={<SaveIcon/>}
            label="Save"
            onClick={handleSaveClick(id)}
          />
        ]
      }
    },
  ]

  return (
   <Box>
      
      <DataGrid 
        rows={loanDetails}
        columns={columns}
        getRowId={(row) => row.loan_detail_id}
        autoHeight
        editMode="row"
        // onRowEditStart={(params) => console.log('202', params)}
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        processRowUpdate={handleUpdate}
        row
      />
   </Box>
  )
}
