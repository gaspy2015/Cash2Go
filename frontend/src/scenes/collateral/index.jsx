import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
import NewCollateral from './components/NewCollateral'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { Bounce, toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css';
import CollateralForm from './components/CollateralForm'

function Collateral() {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const loc = useLocation();

    const [openPopup, setOpenPopup] = useState(false);
    const [collateral, setCollateral] = useState([])

    const loadCollateralData = async () => {
        try {
          const response = await axios.get('http://localhost:8000/collateral');
          setCollateral(response.data);
        } catch (error) {
          console.error('Error loading collateral data:', error);
        }
      };
  
      const columns = [
        { field: 'description', flex: 1, headerName: 'Collateral Name' },
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
                    to={`/collateral/${params.row.id}`}
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
  
      const handleCollateralAdded = () => {
        // Refresh deduction data after a new collateral is added
        loadCollateralData();
      };
  
      const handleDelete = async (id) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to delete this collateral?");
        if (!isConfirmed) {
          return;
        }
    
        try {
          const response = await axios.delete(`http://localhost:8000/collateral/delete/${id}`);
          console.log(response.data);
          loadCollateralData();
          toast.success('Collateral Successfully Deleted!', {
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
          console.error('Error deleting collateral:', error);
          toast.error('Error deleting collateral, Please try again!', {
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
        loadCollateralData();
      }, []);

  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header 
        title={'Collateral'} 
        showButton={true} 
        onAddButtonClick={()=> setOpenPopup(true)} 
        toURL={loc.pathname + '/new'}
        />
      <DataGrid 
        columns={columns}
        rows={collateral}
        
      />

        <Popups
            title="Collateral"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
            toURL={'/collateral'}
        >
            <CollateralForm 
              onCollateralAdded={handleCollateralAdded} 
              onClosePopup={handleClosePopup}
            />
        </Popups>
    </div>
  )
}

export default Collateral