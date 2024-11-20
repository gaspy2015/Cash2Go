import {
  Box,
  IconButton,
  InputBase,
  ToggleButton,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import {
  SearchOutlined,
} from "@mui/icons-material";

import { Link, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import Popups from "../../components/Popups";
import PaymentForm from "./components/PaymentForm";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import PaymentDataGrid, { downloadFile } from "./components/PaymentDataGrid";
import DeductionDataGrid from "./components/DeductionDataGrid";
import deductionTemplate from "../../assets/deduction.html?raw"
import { toastErr, toastSucc } from "../../utils";
import SearchInputForm from "../report/component/SearchInputForm";

function paymentReducer(state, action) {
  switch(action.type){
    case 'INIT' :
      return action.payments
      // return []
    case 'ADD' :
      return [
        ...state, {...action.payment}
      ]
  }
}

export default function LoanPayment() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  // const [paymentRows, setPaymentRows] = useState([]);
  const [paymentRows, paymentRowDispatch] = useReducer(paymentReducer, []);
  const [deductionRows, setDeductionRows] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isDeductionView, setIsDeductionView] = useState(false)
  const [searchValue, setSearchValue] = useState("");
  const [dateView, setDateView] = useState(
    {
      from : dayjs(),
      to : dayjs()
    }
  )
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // Initial page
    pageSize: 5,
  });

  const loadPaymentHeaderData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/payments`, {
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          date : {
            from : dateView.from.format('YYYY-MM-DD'),
            to : dateView.to.format('YYYY-MM-DD')
          }
        },
      });

      // setPaymentRows(response.data.data);
      paymentRowDispatch({type : 'INIT', payments : response.data.data})
    } catch (error) {
      // console.error("Error loading customer data:", error);
      toastErr('Something went Wrong!', 5)
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeductionPayment = async () => {
    try {
      const deductions = await axios.get(`api/payments/deductions`, {
        params: {
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          // search : searchValue,
          date : {
            from : dateView.from.format('YYYY-MM-DD'),
            to : dateView.to.format('YYYY-MM-DD')
          }
        },
      })
      setDeductionRows(deductions.data)
      // paymentDispatch({type : 'INIT'})
    } catch (error) {
      toastErr('Something went Wrong!', 5)
    }
  }


  const formatNumber = (value) => {
    // const amount = value.split(".");
    const format = Number(value).toLocaleString("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return format;
  };
  
  const payment_col = [
    { field: "payment_date", width: 100, headerName: "Process Date", 
      valueFormatter : (params) => {
        return dayjs(params.value).format('MM-DD-YYYY')}
    },
    { field: "payment_receipt", width: 100, headerName: "PR Number" },
    { field: "fullName", width: 200, headerName: "Borrower Name" },
    { field: "pn_number", width: 200, headerName: "PN Number" },
    { field: "payment_type", width: 125, headerName: "Mode of Payment" },
    { field: "bank", width: 100, headerName: "Bank" },
    { field: "check_number", width: 150, headerName: "Check Number" },
    { field: "check_date", width: 100, headerName: "Check Date",
      valueFormatter : (params) => {
        // console.log(typeof params.value, params.value)
        if(params.value && params.value != '') 
          return dayjs(params.value).format('MM-DD-YYYY');
      }
    },
    { field: "payment_principal", width: 120, headerName: "Principal",
      valueFormatter : (params) => formatNumber(params.value)
    },
    { field: "payment_interest", width: 120, headerName: "Interest",
      valueFormatter : (params) => formatNumber(params.value)
    },
    { field: "payment_penalty", width: 120  , headerName: "Penalty",
      valueFormatter : (params) => formatNumber(params.value)
    },
    { field: "payment_amount", width: 120, headerName: "Total Payment",
      // valueFormatter : (params) => formatNumber(params.value)
      valueGetter: (params) => {
        const total = Number(params.row.payment_principal) + Number(params.row.payment_interest) + Number(params.row.payment_penalty)
        return formatNumber(total)
      },
    },
    { field: "remarks", width: 200, headerName: "Remarks" },
  ]

  const handleSearch = async (value, field) => {
    const params = new URLSearchParams({[field] : value , 
        from : dateView.from.format('YYYY-MM-DD'),
        to : dateView.to.format('YYYY-MM-DD')
    }).toString()

    const req = !isDeductionView ? 
      axios.get(`/api/payments?${params}`, 
      ) : 
      axios.get(`/api/payments/deductions?${params}`);
    try {
      const response = await req
      // setPaymentRows(response.data.data);
      if(!isDeductionView)
        paymentRowDispatch({type : 'INIT', payments : response.data.data});
      else
        setDeductionRows(response.data)
      
      // setRowCount(response.data.totalCount);
    } catch (error) {
      // console.error("Error loading customer data:", error);
      toastErr('Something went Wrong', 5)
    }
  };

  useEffect(() => {
      if(!isDeductionView)
        loadPaymentHeaderData();
      else
        loadDeductionPayment();

  }, [ paginationModel, dateView, isDeductionView]);
  // End useEffect

  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  return (
    <Box 
      // style={{ height: "75%", padding: 20 }}
      border={'solid red'}
      height={'100%'}
      display={'flex'}
      flexDirection={'column'}
      padding={2}
    >
      <Header title="LOAN PAYMENTS" onAddButtonClick={() => setOpenPopup(true)} />
      <Box
        display="flex"
        justifyContent='space-between'
        gap={2}
        mb={1.2}
      >
        <Box display='flex' gap={1}>
          <SearchInputForm name='customer_name' placeholder='Search Customer Name' submit={handleSearch} />
          <SearchInputForm name='pn_number' placeholder='Search PN Number' submit={handleSearch} />
          <SearchInputForm name='check_number' placeholder='Search Check Number' submit={handleSearch} />
        </Box>
        <Box display='flex' gap={1}>
          <DatePicker label='from' sx={{width : 150}} value={dateView.from} slotProps={{textField : {size : 'small'}}} 
            onChange={(val) => 
              setDateView((old) => ({...old, from : val}))
            } 
          />
          <DatePicker label='to' sx={{width : 150}} value={dateView.to} slotProps={{textField : {size : 'small'}}}
            onChange={(val) => 
              setDateView((old) => ({...old, to : val}))
            } 
          />
        </Box>
      </Box>
      {/*TODO Filter date UI */}
      {/* Toggle button UI */}
      <Box display='flex' justifyContent='space-between' >
        <ToggleButton 
          size="small"
          sx={{ paddingX : 2, marginBottom : 1}}
          selected={isDeductionView}
          onChange={() => {
            setIsDeductionView((old) => !old)
          }}
        >
          {isDeductionView ? (<span>View Payment</span>) : (<span>View Deduction</span>) }
        </ToggleButton>
        <Box display='flex' gap={2.5}>
          <Box display='flex' gap={1}>
            
          </Box>
          <Box display='flex' gap={1}>
            {/* <Typography margin='auto' >To:</Typography> */}
            
          </Box>

        </Box>
      </Box>
      <Box border='solid blue' flex={1} position='relative'>
        <Box sx={{position: 'absolute', inset : 0}} >
          { isDeductionView ? 
            (
              <DeductionDataGrid 
                // columns={deduction_col}
                rows={deductionRows}
                // handleCsv={handleCsvDeduction}
                // handlePrint={handlePrintDeduction}
              />
            )
          : 
            (
              <PaymentDataGrid 

                columns={payment_col}
                rows={paymentRows}
              />
            )
          }

        </Box>
      </Box>

      <Popups
        title="Loan Payment Details"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        toURL={`/payments`}
      >
          <PaymentForm popup={setOpenPopup} paymentDispacher={paymentRowDispatch}/>
      </Popups>
    </Box>
  );
}