import {DataGrid} from '@mui/x-data-grid'
import { tokens } from '../../theme'
import {mockDataTeam} from '../../data/mockData'
import { useTheme } from '@emotion/react'
import { Box } from '@mui/material'
import Header from '../../components/Header'
import { useEffect, useState } from 'react'
import Popups from '../../components/Popups'
import DetailsModal from './components/DetailsModal'
import NewLoanModal from './components/NewLoanModal'

const Loan = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loans, setLoans] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [openNewLoanPopup, setOpenNewLoanPopup] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);

    const handleRowDoubleClick = (params) => {
        setSelectedLoanId(params.row.loan_header_id);
        setOpenPopup(true);
      };

    const columns = [
        {field: "loan_header_id", headerName: "ID" },
        {field: "pn_number", headerName: "PN Number", width: 150 },
        {field: "customername", headerName: "Customer", flex : 1, minWidth: 150, cellClassName:"name-column--cell"},
        {field: "bank_name_pdc", headerName: "PDC Bank", width: 150 },
        {field: "loancategory", headerName: "Category", width: 150},
        {field: "loanfacility", headerName: "Facility", width: 150},
        {field: "principal_amount", headerName: "Principal", width: 150},
        {field: "total_interest", headerName: "Interest", width: 150},
        {field: "date_granted", headerName: "Date Granted", width: 150},
        {field: "status_code", headerName: "Status", width: 150},
    ]

    useEffect(() => {
        const getLoan = async() => {
            const req = await fetch('http://localhost:8000/loans')
            const resJson = await req.json()
            setLoans(resJson)
        }
        getLoan()
    }, [])
  return (
    <div className='main p-5'>
        <Header title="LOANS" subtitle="List of loans with details" showButton={true} onAddButtonClick={() => setOpenNewLoanPopup(true)} />
        <Box
            m="20px 0 5px"
            
            // overflow="auto"
            // overflowx="auto"
        >
            <DataGrid 
                rows={loans}
                columns={columns}
                getRowId={(row) => row.loan_header_id}
                autoHeight
                onRowDoubleClick={handleRowDoubleClick}
                // autoPageSize
            />
        </Box>
        <Popups
            title="Loan Details"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
        >
            <DetailsModal selectedLoanId={selectedLoanId} />
        </Popups>

        <Popups
            title="New Loan"
            openPopup={openNewLoanPopup}
            setOpenPopup={setOpenNewLoanPopup}
        >
            <NewLoanModal />
        </Popups>
    </div>
  )
}

export default Loan