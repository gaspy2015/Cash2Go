import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Popups from "../../components/Popups";
import NewCustomer from "./components/NewCustomer";
import { DeleteOutlined, EditCalendarOutlined } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import { useTheme } from "@emotion/react";
import { tokens } from "../../theme";
import { Bounce, toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const SERVER_URL = 'http://localhost:8000/customerInfo';

function Customers() {
  
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // Initial page
    pageSize: 5,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation();
  const [openPopup, setOpenPopup] = useState(false);

  // Start of loadCategoryData - use to load the x-datagrid to view the changes
  // const loadCustomerData = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:8000/customerInfo');
  //     setCustomer(response.data);
  //   } catch (error) {
  //     console.error('Error loading category data:', error);
  //   }
  // };
  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(SERVER_URL, {
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
        },
      });
      setRows(response.data.data);
      setRowCount(response.data.totalCount);
    } catch (error) {
      console.error("Error loading customer data:", error);
    }finally {
      setIsLoading(false);

    }
  };
  // End of loadCategoryData - use to load the x-datagrid to view the changes

  // Start columns - this is for the x-datagrid
  const columns = [
    { field: "fullname", flex: 1, headerName: "Fullname" },
    { field: "contactNo", flex: 1, headerName: "Contact" },
    { field: "address", flex: 1, headerName: "Address" },
    { field: "gender", flex: 1, headerName: "Gender" },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center justify-between">
          <Tooltip title="Edit" placement="top" arrow>
            <Button
              component={Link}
              to={`/customers/${params.row.id}`}
              sx={{ color: colors.greenAccent[400], cursor: "auto" }}
              onClick={() => setOpenPopup(true)}
            >
              <EditCalendarOutlined sx={{ cursor: "pointer" }} />
            </Button>
          </Tooltip>
          <Tooltip title="Delete" placement="top" arrow>
            <Button
              sx={{ color: colors.redAccent[500], cursor: "auto" }}
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteOutlined sx={{ cursor: "pointer" }} />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
  // End columns - this is for the x-datagrid

  // Start Refresh - refresh the category data after a new category added
  const handleCustomerAdded = () => {
    loadCustomerData();
  };
  // End Refresh

  // Start Delete function
  const handleDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/customerInfo/delete/${id}`
      );
      console.log(response.data);
      loadCustomerData();
      toast.success("Customer Successfully Deleted!", {
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
      console.error("Error deleting customer:", error);
      toast.error("Error deleting customer, Please try again!", {
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
  // End Delete function

  // Start closing the popup
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  // End closing the popup
  

  // Start useEffect
  // useEffect(() =>{
  //   loadCustomerData();
  // }, [])
  useEffect(() => {
    loadCustomerData();
  }, [paginationModel]);
  // End useEffect

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  return (
    <div style={{ height: "75%", padding: 20 }}>
      <Header
        title={"Customer"}
        showButton={true}
        onAddButtonClick={() => setOpenPopup(true)}
        toURL={loc.pathname + "/new"}
      />
      <DataGrid
        columns={columns}
        rows={rows}
        loading={isLoading}
        rowCount={rowCount}
        pageSizeOptions={[5, 10, 20]}
        paginationMode="server"
        paginationModel={paginationModel}
        
        onPaginationModelChange={handlePaginationModelChange}
      />

      <Popups
        title="Customer"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        toURL={"/customers"}
      >
        <NewCustomer
          onCustomerAdded={handleCustomerAdded}
          onClosePopup={handleClosePopup}
        />
      </Popups>
    </div>
  );
}

export default Customers;
