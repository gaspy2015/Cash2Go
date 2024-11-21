import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import Popups from '../../components/Popups'
import NewAccountCategory from './components/NewAccountCategory'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Box, Button, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { Bounce, toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css';
import AccountCategoryForm from './components/AccountCategoryForm'

function AccountCategory() {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const loc = useLocation();

    const [openPopup, setOpenPopup] = useState(false);
    const [accountCategory, setAccountCategory] = useState([])

    const loadAccountCategoryData = async () => {
        try {
          const response = await axios.get('/api/account-category');
          setAccountCategory(response.data);
        } catch (error) {
          console.error('Error loading account category data:', error);
        }
    };

    const columns = [
        { field: 'account_name', flex: 1, headerName: 'Account Category Name' },
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
                    to={`/account-category/${params.row.id}`}
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

    const handleAccountCategoryAdded = () => {
        // Refresh deduction data after a new collateral is added
        loadAccountCategoryData();
    };

    const handleDelete = async (id) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to delete this account category?");
        if (!isConfirmed) {
          return;
        }
    
        try {
          const response = await axios.delete(`/api/account-category/delete/${id}`);
          console.log(response.data);
          loadAccountCategoryData();
          toast.success('Account category Successfully Deleted!', {
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
          console.error('Error deleting account category:', error);
          toast.error('Error deleting account category, Please try again!', {
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
        loadAccountCategoryData();
      }, []);

  return (
    <Box padding={2} display='flex' height='100%' flexDirection='column'>
      <Header 
        title={'Account Categories'} 
        showButton={true} 
        onAddButtonClick={()=> setOpenPopup(true)} 
        toURL={loc.pathname + '/new'}
        />
      <Box flex={1} position='relative' border='solid red'>
        <Box sx={{position : 'absolute', inset : 0}}>
          <DataGrid 
            columns={columns}
            rows={accountCategory}
          />
        </Box>
      </Box>

        <Popups
            title="Account Category"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
            toURL={'/account-category'}
        >
            <AccountCategoryForm 
              onAccountCategoryAdded={handleAccountCategoryAdded} 
              onClosePopup={handleClosePopup}
            />
        </Popups>
    </Box>
  )
}

export default AccountCategory