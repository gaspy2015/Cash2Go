import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
import NewDeduction from './components/NewDeduction'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { Bounce, toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css';
import DeductionForm from './components/DeductionForm'

function DeductionType() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation();

    const [openPopup, setOpenPopup] = useState(false);
    const [deduction, setDeduction] = useState([])
  
    const loadDeductionData = async () => {
      try {
        const response = await axios.get('/api/deductions');
        setDeduction(response.data);
      } catch (error) {
        console.error('Error loading deduction data:', error);
      }
    };

    const columns = [
      { field: 'deductionType', flex: 1, headerName: 'Deduction Type' },
      {
        field: 'actions',
        headerName: '',
        sortable: false,
        width: 150,
        renderCell: (params) => (
          <div className='flex items-center justify-between'>
            <Tooltip title="Edit" placement="top" arrow>
                <Button
                  component={Link}
                  to={`/deduction/${params.row.id}`}
                  sx={{color: colors.greenAccent[400], cursor: 'auto'}}
                  onClick={() => setOpenPopup(true)} 
                >
                  <EditCalendarOutlined sx={{cursor: 'pointer'}} />
                </Button>
            </Tooltip>
            <Tooltip title="Delete" placement="top" arrow>
                <Button
                  sx={{color: colors.redAccent[500], cursor: 'auto'}}
                  onClick={() => handleDelete(params.row.id)} 
                >
                  <DeleteOutlined sx={{cursor: 'pointer'}} />
                </Button>
            </Tooltip>
            
          </div>
        ),
      },
    ];

    const handleDeductionAdded = () => {
      // Refresh deduction data after a new deduction is added
      loadDeductionData();
    };

    const handleDelete = async (id) => {
      // Show confirmation dialog
      const isConfirmed = window.confirm("Are you sure you want to delete this deduction?");
      if (!isConfirmed) {
        return;
      }
  
      try {
        const response = await axios.delete(`/api/deductions/delete/${id}`);
        console.log(response.data);
        loadDeductionData();
        toast.success('Deduction Successfully Deleted!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      } catch (error) {
        console.error('Error deleting deduction:', error);
        toast.error('Error deleting deduction, Please try again!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    };
  

    const handleClosePopup = () => {
      setOpenPopup(false);
    };
    
    useEffect(() => {
      loadDeductionData();
    }, []);

  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header 
        title={'Deduction Types'} 
        showButton={true} 
        onAddButtonClick={()=> setOpenPopup(true)} 
        toURL={loc.pathname + '/new'}
        />
      <DataGrid 
        columns={columns}
        rows={deduction}
        
      />

        <Popups
            title="Deduction"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
            toURL={'/deduction'}
        >
            <DeductionForm 
              onDeductionAdded={handleDeductionAdded} 
              onClosePopup={handleClosePopup}
            />
        </Popups>
    </div>
  )
}

export default DeductionType