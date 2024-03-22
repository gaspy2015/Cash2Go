import {
  DataGrid,
  GridActionsCell,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import { useTheme } from "@emotion/react";
import { Box, IconButton, InputBase, TextField } from "@mui/material";
import Header from "../../components/Header";
import { useEffect, useReducer, useState } from "react";
import Popups from "../../components/Popups";
import DetailsModal from "./components/DetailsModal";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LoanForm1 from "./components/LoanForm1";
import { PrintOutlined } from "@mui/icons-material";
import voucherTemplateHTML from "../../assets/voucher.html?raw";
import c2gImage from "../../assets/c2g_logo_nb.png";
import * as ejs from "ejs";
import dayjs from "dayjs";

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.loans;
    case "ADD":
      return [...state, action.loans];
  }
}

const formatNumber = (value) => {
  // const amount = value.split('.');
  const format = Number(value).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return format;
};

const getVoucher = async (id) => {
  try {
    const fetchData = await fetch(`http://localhost:8000/loans/voucher/${id}`);
    const voucherJSON = await fetchData.json();
    // console.log(voucherJSON)

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

const Loan = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  let timeOut = null;

  const columns = [
    // {field: "loan_header_id", headerName: "ID" },
    {
      field: "voucher",
      headerName: "Voucher",
      type: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<PrintOutlined />}
            color="success"
            label="Print Voucher"
            onClick={() => getVoucher(id)}
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
    {field : 'loan_term', headerName : 'Term', width : 100}, 
    { field: "bank_name", headerName: "Bank", width: 150, align: "left", headerAlign: "left", },
    { field: "loancategory", headerName: "Category", width: 150,},
    { field: "loanfacility", headerName: "Facility", width: 150 },
    { field: "status_code", headerName: "Status", width: 150 },
  ];

  const [customers, setCustomers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [accountTitle, setAccountTitle] = useState([]);

  const [openPopup, setOpenPopup] = useState(false);
  const [openNewLoanPopup, setOpenNewLoanPopup] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [loans, dispatch] = useReducer(reducer, []);

  const handleRowDoubleClick = (params) => {
    setSelectedLoanId(params.row.loan_header_id);
    setOpenPopup(true);
  };

  // TODO: loan category

  const handleSearch = (e) => {
    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
      fetch(`http://localhost:8000/loans?search=${e.target.value}`)
        .then((res) => res.json())
        .then((val) => dispatch({ type: "INIT", loans: val }));
    }, 1000);
  };

  useEffect(() => {
    const getData = async () => {
      const urls = [
        fetch("http://localhost:8000/loans"),
        fetch("http://localhost:8000/loans/collateral"),
        fetch("http://localhost:8000/loans/facility"),
        fetch("http://localhost:8000/banks"),
        fetch("http://localhost:8000/loans/category"),
        fetch("http://localhost:8000/deductions"),
        fetch("http://localhost:8000/account-title"),
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

        setCollaterals(collateralData);

        setFacilities(facilityData);
        setBanks(banksData);
        setCategories(categoryData);
        setDeductions(deductionData);
        setAccountTitle(accountTitleData);
      } catch (error) {
        console.log("error", error);
      }
    };
    getData();
  }, []);

  return (
    <div style={{ height: "75%", padding: 20 }}>
      <Header
        title="LOANS"
        showButton={true}
        onAddButtonClick={() => setOpenNewLoanPopup(true)}
      />

      <Box
        display="flex"
        alignItems="flex-start"
        marginBottom={2}
        backgroundColor={colors.greenAccent[800]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, mt: 0.5, flex: 1 }} onChange={handleSearch} />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchOutlinedIcon />
        </IconButton>
      </Box>
      <DataGrid
        sx={{ height: "95%" }}
        rows={loans}
        columns={columns}
        getRowId={(row) => row.loan_header_id}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <Popups
        title="Loan Details"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <DetailsModal selectedLoanId={selectedLoanId} banks={banks} />
      </Popups>

      <Popups
        title="New Loan"
        openPopup={openNewLoanPopup}
        setOpenPopup={setOpenNewLoanPopup}
      >
        <LoanForm1
          setModalOpen={setOpenNewLoanPopup}
          customers={customers}
          collaterals={collaterals}
          facilities={facilities}
          banks={banks}
          categories={categories}
          deductions={deductions}
          accountTitle={accountTitle}
          dispatcher={dispatch}
        />
      </Popups>
    </div>
  );
};

export default Loan;
