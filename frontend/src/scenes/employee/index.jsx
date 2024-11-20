import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import Popups from "../../components/Popups";
import { DeleteOutlined, EditCalendarOutlined } from "@mui/icons-material";
import { Box, Button, Tooltip } from "@mui/material";
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme";
import { Bounce, toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import EmployeeForm from "./components/EmployeeForm";

function Employee() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation();

  const [openPopup, setOpenPopup] = useState(false);
  const [employee, setEmployee] = useState([]);

  const loadEmployeeData = async () => {
    try {
      const response = await axios.get('/api/employee');
      setEmployee(response.data);
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  const columns = [
    { field: 'name', flex: 1, headerName: 'FullName' },
    { field: 'role', flex: 1, headerName: 'Role' },
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
                to={`/employee/${params.row.id}`}
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

  const handleEmployeeAdded = () => {
    // Refresh employee data after a new employee is added
    loadEmployeeData();
  };

  const handleDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`/api/employee/delete/${id}`);
      console.log(response.data);
      loadEmployeeData();
      toast.success('Employee Successfully Deleted!', {
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
      console.error('Error deleting employee:', error);
      toast.error('Error deleting employee, Please try again!', {
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
    loadEmployeeData();
  }, []);

  return (
    <Box height='100%' padding={2} display='flex' flexDirection='column'>
    <Header 
      title={'Employee'} 
      showButton={true} 
      onAddButtonClick={()=> setOpenPopup(true)} 
      toURL={loc.pathname + '/new'}
      />
    <Box position='relative' flex={1} border='solid red'>
      <Box sx={{position: 'absolute', inset : 0}}>
        <DataGrid 
          sx={{
            display: 'grid',
            gridTemplateRows: 'auto 4rem',
          }}
          columns={columns}
          rows={employee}
        />
      </Box>
    </Box>

      <Popups
          title="Employee"
          openPopup={openPopup}
          setOpenPopup={setOpenPopup}
          toURL={'/employee'}
      >
          <EmployeeForm 
            onEmployeeAdded={handleEmployeeAdded} 
            onClosePopup={handleClosePopup}
          />
      </Popups>
  </Box>
  );
}

export default Employee;
