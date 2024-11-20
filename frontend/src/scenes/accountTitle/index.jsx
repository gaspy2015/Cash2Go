import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
import NewAccountTitle from './components/NewAccountTitle'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { Bounce, toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css';

function AccountTitle() {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const loc = useLocation();

    const [openPopup, setOpenPopup] = useState(false);
    const [accountTitle, setAccountTitle] = useState([])

    const loadAccountTitleData = async () => {
      try {
        const response = await axios.get('/api/account-title');
        setAccountTitle(response.data);
      } catch (error) {
        console.error('Error loading account title data:', error);
      }
  };

  const columns = [
      { field: 'account_name', flex: 1, headerName: 'Category Name' },
      { field: 'account_title', flex: 1, headerName: 'Title Name' },
      { field: 'account_code', flex: 1, headerName: 'Code' },
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
                  to={`/account-title/${params.row.id}`}
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

  const handleAccountTitleAdded = () => {
      // Refresh deduction data after a new collateral is added
      loadAccountTitleData();
  };

  const handleDelete = async (id) => {
      // Show confirmation dialog
      const isConfirmed = window.confirm("Are you sure you want to delete this account title?");
      if (!isConfirmed) {
        return;
      }
  
      try {
        const response = await axios.delete(`/api/account-title/delete/${id}`);
        console.log(response.data);
        loadAccountTitleData();
        toast.success('Account title Successfully Deleted!', {
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
        console.error('Error deleting account title:', error);
        toast.error('Error deleting account title, Please try again!', {
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
      loadAccountTitleData();
    }, []);

  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header 
        title={'Account Titles'}  
        showButton={true} 
        onAddButtonClick={()=> setOpenPopup(true)} 
        toURL={loc.pathname + '/new'}
        />
      <DataGrid 
        columns={columns}
        rows={accountTitle}
        
      />

        <Popups
            title="Account Title"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
            toURL={'/account-title'}
        >
            <NewAccountTitle 
              onAccountTitleAdded={handleAccountTitleAdded} 
              onClosePopup={handleClosePopup}
            />
        </Popups>
    </div>
  )
}

export default AccountTitle