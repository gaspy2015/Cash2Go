import {
  DataGrid,
  GridActionsCell,
  GridActionsCellItem,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useTheme } from "@emotion/react";
import { Box, Button, IconButton, Input, InputBase, MenuItem, TextField } from "@mui/material";
import Header from "../../components/Header";
import { useEffect, useReducer, useRef, useState } from "react";
import Popups from "../../components/Popups";
import DetailsModal from "./components/DetailsModal";
import LoanForm1 from "./components/LoanForm1";
import { AccountTreeOutlined, AutorenewOutlined, PrintOutlined, RefreshOutlined, DeleteOutline, UploadFile, AttachFile, SearchOutlined } from "@mui/icons-material";
import voucherTemplateHTML from "../../assets/voucher.html?raw";
import c2gImage from "../../assets/c2g_logo_nb.png";
import * as ejs from "ejs";
import dayjs from "dayjs";
import LoanRenewForm from "./components/LoanRenewForm";
import LoanRestructureForm from "./components/LoanRestructureForm";
import { MuiFileInput } from "mui-file-input";
import { toastErr, toastSucc } from "../../utils";
import { useFormik } from "formik";

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.loans;
    case "ADD":
      return [action.loans, ...state];
    case "RENEW":
      const updateLoan = state.map((v) => {
        console.log(action)
        if(action.renewal_id === v.loan_header_id){
          return {...v, status_code : 'Renewed'}
        }
        return v
     })
      return [...updateLoan, action.loan];
    case "RECAL": 
      const recal = state.map((v) => {
        console.log(action)
        if(action.renewal_id === v.loan_header_id){
          return {...v, status_code : 'Restructured'}
        }
        return v
     })
      return [...recal, action.loan]
    case "DELETE": 
     return state.filter(v => v.loan_header_id != action.id)
     
  }
}

export const LOAN_INITIAL_VALUES = {
  customer_id: "",
  customer_name: "",
  transaction_date: new Date().toISOString().split("T")[0],
  co_maker_name : "",
  co_maker_id : "",
  bank_account_id: "",
  term_type: "months",
  bank_name: "",
  collateral_id: "",
  check_date: null,
  check_number: "",
  collateral: "",
  loan_category_id: "",
  loan_category: "",
  loan_facility_id: "",
  loan_facility: "",
  principal_amount: "",
  interest_rate: "",
  total_interest: 0,
  term_month: 0,
  date_granted: null,
  check_issued_name: "",
  voucher_number: "",
  renewal_id: 0,
  renewal_amount: 0,
  loan_details: [],
  deduction: [],
  voucher: [{ name: "", credit: "", debit: "" }],
  prepared_by: "",
  approved_by: "",
  checked_by: "",
  isCash : {
    value : false,
    pr_number : '',
  },

};

const searchType = [
  {
    label : 'Customer Name',
    value : 'customer_name'
  },
  {
    label : 'PN Number',
    value : 'pn_number'
  },
  {
    label : 'Loan Category',
    value : 'loan_category'
  },
  {
    label : 'Loan Facility',
    value : 'loan_facility'
  }
]

const formatNumber = (value) => {
  const format = Number(value).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return format;
};

const getVoucher = async (id) => {
  
  try {
    const fetchData = await fetch(`/api/loans/voucher/${id}`);
    const voucherJSON = await fetchData.json();
    console.log(voucherJSON)
    // return 
    const format = {
      ...voucherJSON,
      logo: c2gImage,
      date: dayjs(voucherJSON.date).format("MM-DD-YYYY"),
      check_date: dayjs(voucherJSON.check_date).format("MM-DD-YYYY"),
    };
    const render = ejs.render(voucherTemplateHTML, format);
    const voucherWindow = window.open("", "Print Voucher");
    voucherWindow.document.write(render);
  } catch (error) {
    console.log(error);
  }

};

const RefreshToolBar = ({refresh}) =>{
  return (
      <Box display='flex' justifyContent='end' onClick={refresh} >
        <Button color='success' size="large" sx={{py : 0.5}} endIcon={<RefreshOutlined />}> Refresh</Button>
      </Box>
  )
}

export default function Loan() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    // {field: "loan_header_id", headerName: "ID" },
    {
      field: "voucher",
      type: "actions",
      width: 100,
      getActions: ({ id }) => {
        const item = loans.filter((v) => id == v.loan_header_id)[0]
        let isLoanOnGoing = true;
        
        if(item.status_code == "On Going") {
          isLoanOnGoing = false
        } 
        
        return [
          <GridActionsCellItem
            icon={<PrintOutlined />}
            showInMenu
            color="success"
            label="Print Voucher"
            onClick={() => getVoucher(id)}
          />,
          <GridActionsCellItem
            icon={<AutorenewOutlined />}
            color="success"
            label="Renew"
            showInMenu
            disabled={isLoanOnGoing}
            onClick={() => renewLoan(id)}
          />,
          <GridActionsCellItem
            icon={<AccountTreeOutlined />}
            color="success"
            label="Restructure"
            disabled={isLoanOnGoing}
            showInMenu
            onClick={() => restructureLoan(id)}
          />,
          <GridActionsCellItem
            icon={<DeleteOutline />}
            color="success"
            label="Delete"
            disabled={isLoanOnGoing}
            showInMenu
            onClick={() => handleDeleteLoanHeader(id)}
          />,
          <GridActionsCellItem
            icon={<UploadFile />}
            color="success"
            label="Upload Attachment"
            disabled={isLoanOnGoing}
            showInMenu
            onClick={() => handleOpenPopup(id) }
          />,
        ];
      },
    },
    {
      field: "date_granted",
      headerName: "Date Granted",
      width: 150,
      valueFormatter: (params) => {
        return dayjs(params.value).format("MM-DD-YYYY");
      },
    },
    { field: "name", headerName: "Borrower", width: 250 },
    { field: "pn_number", headerName: "PN Number", width: 250 },
    {
      field: "principal_amount",
      headerName: "Loan Granted",
      align: "left",
      headerAlign: "left",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "total_interest",
      headerName: "Interest",
      align: "left",
      headerAlign: "left",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    { field: "loan_term", headerName: "Term", width: 100 },
    {
      field: "bank_name",
      headerName: "Bank",
      width: 150,
      align: "left",
      headerAlign: "left",
    },
    { field: "loancategory", headerName: "Category", width: 150 },
    { field: "loanfacility", headerName: "Facility", width: 150 },
    { field: "status_code", headerName: "Status", width: 150 },
  ];
  
  const [renewFormValue,setRenewFormValue] = useState(LOAN_INITIAL_VALUES)
  const [restructureFormValue, setRestructureFormValue] = useState(LOAN_INITIAL_VALUES)
  const [facilities, setFacilities] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [accountTitle, setAccountTitle] = useState([]);
  const [loanding, setLoading] = useState(false)
  const [openPopup, setOpenPopup] = useState(false);
  const [openAttachmentPopup, setOpenAttachmentPopup] = useState(false);
  const [openRenewPopup, setOpenRenewPopup] = useState(false);
  const [openRestructurePopup, setOpenRestructurePopup] = useState(false);
  const [openNewLoanPopup, setOpenNewLoanPopup] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [loans, dispatch] = useReducer(reducer, []);
  const [fileAttachment, setFileAttachment]  = useState(null)
  const attachmentId = useRef(null)


  const formik = useFormik({
    initialValues : {
      type : 'customer_name',
      value: ''
    },
    onSubmit : (data) => {
      handleSearch(data)
    }
  })


  const handleRowDoubleClick = (params) => {
    setSelectedLoanId(params.row.loan_header_id);
    setOpenPopup(true);
  };

  const renewLoan = async (id) =>{
    const request = await fetch(`/api/loans/renew/${id}`)
    const responseJSON = await request.json()
    setRenewFormValue((old) => ({...old , ...responseJSON}))
    setOpenRenewPopup(true)
  }

  const restructureLoan = async (id) => {
    try {
      const request = await fetch(`/api/loans/recalculate/${id}`)
      const responseJSON = await request.json()
      console.log(responseJSON)
      setRestructureFormValue((old) => ({...old, ...responseJSON}))
      
      setOpenRestructurePopup(true);
    } catch (error) {
      console.log(error)
    }
  }

  const handleDeleteLoanHeader = async (id) => {
    try {
      const request = await fetch('/api/loans', {
        method : 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id : id})
      })
      if(!request.ok) { return } // error handling

      const response  = await request.json()
      
      dispatch({ type: "DELETE", id: response.id })
      
    } catch (error) {
      console.log("Something went Wrong!")
    }
  }

  const handleSearch = async (data) => {

    const params = new URLSearchParams(data).toString()
    // console.log(params)
    setLoading(true)
    try {
    const request = await fetch('/api/loans?' + params)
    const loanSearchJSON = await request.json()
    
    dispatch({ type: "INIT", loans: loanSearchJSON })

    setLoading(false)
  } catch (error) {
    console.log(error)
    setLoading(false)
    }
  };

  const handleAttachmentSubmit = async () => {
    if(!fileAttachment) {
      return toastErr('Please Select a file')
    }
    const formData = new FormData()
    formData.set('loan_attachment', fileAttachment)
    
    try {
      if(!attachmentId.current) return toastErr('Something went wrong!');

      const request = await fetch(`/api/loans/attachment/${attachmentId.current}`, {
        method : 'POST',
        body : formData
      })
      
      if(!request.ok) {
        return toastErr('Something went wrong!')
      }
      
      const response = await request.json()
      if(!response.success) {
        return toastErr('Something went wrong!')
      }
      toastSucc('File Uploaded')
      attachmentId.current = null
      setOpenAttachmentPopup(false)
    } catch (error) {
      toastErr('Something went wrong!')
    }

  }

  const getData = async (signal) => {
    setLoading(true)
    const urls = [
      fetch("/api/loans"),
      fetch("/api/loans/collateral" ),
      fetch("/api/loans/facility" ),
      fetch("/api/banks"  ),
      fetch("/api/loans/category"  ),
      fetch("/api/deductions" ),
      fetch("/api/account-title"),
    ];

    try {
      const req = await Promise.all(urls);

      const loanData = await req[0].json();
      // const customerData = await req[1].json()
      const collateralData = await req[1].json();
      const facilityData = await req[2].json();
      const banksData = await req[3].json();
      const categoryData = await req[4].json();
      const deductionData = await req[5].json();
      const accountTitleData = await req[6].json();

      dispatch({ type: "INIT", loans: loanData });
      // console.log('173', banksData)
      setCollaterals(collateralData);

      setFacilities(facilityData);
      setBanks(banksData);
      setCategories(categoryData);
      setDeductions(deductionData);
      setAccountTitle(accountTitleData);
      setLoading(false)
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleOpenPopup = (id) => {
    attachmentId.current = id
    setOpenAttachmentPopup(true)
  }

  useEffect(() => {
    let active = true;
    try {
      if(active)  {
        getData();
      }
    } catch (error) {
      // console.dir(error)
    }
    return () => {
      active = false;
    }
  }, []);

  
  return (
    <Box height='100%' padding={2} display='flex' flexDirection='column'>
      <Header
        title="LOANS"
        showButton={true}
        onAddButtonClick={() => setOpenNewLoanPopup(true)}
      />
      <form onSubmit={formik.handleSubmit} >
        <Box display='flex' justifyContent='end' mb={1} gap={2} >
          <TextField select label="type" sx={{ width :180}} size="small" name='type' value={formik.values.type} onChange={formik.handleChange}>
            {searchType.map(v => (
              <MenuItem value={v.value} key={v.value}>{v.label}</MenuItem>
            ))}
          </TextField>
          <Box style={{
            display : 'inline-block',
            background : colors.greenAccent[800],
            borderRadius : 3
          }}>
            <InputBase placeholder="Search" sx={{paddingX : 1}} name='value' value={formik.values.value} onChange={formik.handleChange}/>
              <IconButton type='submit'>
              <SearchOutlined />
            </IconButton>
          </Box>
        </Box> 
      </form>
      <Box border='solid red' flex={1} position='relative' >
        <Box sx={{position: 'absolute', inset : 0}} >
          <DataGrid
            loading={loanding}
            rows={loans}
            columns={columns}
            getRowId={(row) => row.loan_header_id}
            slots={{
              toolbar : RefreshToolBar
            }}
            slotProps = {{
              toolbar : {
                refresh : getData
              }
            }}
            onRowDoubleClick={handleRowDoubleClick}
          />

        </Box>
      </Box>
      <Popups
        title="Loan Details"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <DetailsModal selectedLoanId={selectedLoanId} banks={banks} />
      </Popups>
      <Popups 
        title='Renew Loan' 
        openPopup={openRenewPopup}
        setOpenPopup={setOpenRenewPopup}
        >
          <LoanRenewForm popup={setOpenRenewPopup} dispatcher={dispatch} renew={true} deductions={deductions} loanInitialValue={renewFormValue}  banks={banks} collaterals={collaterals} categories={categories} facilities={facilities} accountTitle={accountTitle}/>
      </Popups>
      <Popups 
        title='Restructure Loan'
        openPopup={openRestructurePopup}
        setOpenPopup={setOpenRestructurePopup}
      >
        <LoanRestructureForm dispatcher={dispatch} popup={setOpenRestructurePopup} loanInitialValue={restructureFormValue} accountTitle={accountTitle}  banks={banks} collaterals={collaterals} categories={categories} facilities={facilities}/>
      </Popups>
      <Popups
        title='Upload Attachment'
        openPopup={openAttachmentPopup}
        setOpenPopup={setOpenAttachmentPopup}
      >
        <div style={{ display : "flex", gap : 10}}>
          <MuiFileInput 
            label='Attachment'
            placeholder="Upload Attachment"
            hideSizeText 
            value={fileAttachment}
            InputProps={{ startAdornment : <AttachFile /> }}
            getInputText={(value) => value ? value.name : ''}
            onChange={setFileAttachment}
          />
          <Button variant="outlined" color='success' onClick={handleAttachmentSubmit} >Save</Button>
        </div>
      </Popups>


      <Popups
        title="New Loan"
        openPopup={openNewLoanPopup}
        setOpenPopup={setOpenNewLoanPopup}
      >
        <LoanForm1
          loanInitialValue={LOAN_INITIAL_VALUES}
          setModalOpen={setOpenNewLoanPopup}
          collaterals={collaterals}
          facilities={facilities}
          banks={banks}
          categories={categories}
          deductions={deductions}
          accountTitle={accountTitle}
          dispatcher={dispatch}
        />
      </Popups>
    </Box>
  );
};
