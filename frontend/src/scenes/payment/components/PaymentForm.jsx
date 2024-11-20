import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { tokens } from "../../../theme";
import MultiStepForm1, { FormStep } from "../../../components/MultiStepForm1";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";
import MultiStepForm from "../../../components/MultiStepForm";
import TextfieldWrapper from "../../../components/FormUI/Textfield";
import { grey } from "@mui/material/colors";
import LoanLinePaymentDetail from "./LoanLinePaymentDetail";
import PaymentSetup from "./PaymentSetup";
import PaymentAmount from "./PaymentAmount";
import { SearchOutlined } from "@mui/icons-material";
import PaymentSearch from "./PaymentSearch";
import { Bounce, toast } from "react-toastify";

const formatNumber = (value) => {
  const format = Number(value).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return format;
};

const initialPaymentData = {
  loan_header_id : 0,
  loan_detail_id : 0,
  payment_type : '',
  principal_payment: "",
  interest_payment: "",
  check_date : null,
  penalty_amount: 0,
  pr_number : '',
  or_number : '',
  bank: "",
  check_number: "",
  remarks: "",
  attachment : null
};
const initialCashRowData = [
  { denomination: 1000, count: 0 },
  { denomination: 500, count: 0 },
  { denomination: 200, count: 0 },
  { denomination: 100, count: 0 },
  { denomination: 50, count: 0 },
  { denomination: 20, count: 0 },
  { denomination: 10, count: 0 },
  { denomination: 5, count: 0 },
  { denomination: 1, count: 0 },
  { denomination: .50, count: 0 },
  { denomination: .25, count: 0 },
];

export default function PaymentForm({paymentDispacher, popup}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // const { id } = useParams();

  // const { selectedLoanId, onClosePopup } = props;
  const [loanDetails, setLoanDetails] = useState([]);
  const [loanId, setLoanId] = useState(null)
  const [paymentData, setPaymentData] = useState(initialPaymentData)
  const [paymentRow, setPaymentRow] = useState([])
  const [cashRow, setCashRow] = useState(initialCashRowData.map((v, i) => ({...v, id : i})))
  const [selectedBank, setSelectedBank] = useState('')

  const columns = [
    {
      field: "due_date",
      headerName: "Due Date",
      width: 150,
      valueFormatter: (params) => {
        return dayjs(params.value).format("MM-DD-YYYY");
      },
    },
    {
      field: "monthly_principal",
      headerName: "Principal",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "monthly_interest",
      headerName: "Interest",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "monthly_amortization",
      headerName: "Amortization",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    { field: "payment_type", headerName: "Type", width: 150 },
    {
      field: "principal_payment",
      headerName: "Principal Paid",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "interest_payment",
      headerName: "Interest Paid",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "penalty_amount",
      headerName: "Penalty Paid",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "Balance",
      headerName: "Balance",
      width: 150,
      valueFormatter: (params) => {
        return formatNumber(params.value);
      },
    },
    { field: "description", headerName: "Status", width: 150 },
  ];

  useEffect(() => {
    const getLoanDetail = async () => {
      if(loanId){
        const req = await fetch(`/api/payments/read/${loanId}`);
        const resJson = await req.json();
        setLoanDetails(resJson);
      }
    };
    getLoanDetail();
  }, [loanId]);

  const handleSubmit = async () => {
    // set loading
    const formatData = {...paymentData , check_date : paymentData.check_date ? dayjs(paymentData.check_date).format('YYYY-MM-DD') : null}
    // return console.log(formatData)
    const fData = new FormData()
    const keys = Object.keys(formatData)

    for (const key in keys) {
      const k = keys[key]
      fData.append(k, formatData[k])
    }

    try {
      const req = await fetch('/api/payments', {
        method : 'post',
        body : fData,
        // headers : {
        //   "Content-Type": "multipart/form-data",
        // }
      })

      if(req.ok) {
        const paymentsJSON = await req.json()
        paymentDispacher({type : 'ADD', payment : paymentsJSON})
        popup(false)
        
        toast.success('Save Successfully!', {
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
    } catch (error) {
      throw new Error(error)
    }
  }
  
  return (
    <div style={{ width: 900 }}>
      <MultiStepForm1 initialValues={paymentData} onSubmit={handleSubmit}>
        <FormStep stepName="Search Payment" onSubmit={() => {}}>
          <PaymentSearch paymentDataSetter={setPaymentData} paymentRow={paymentRow} paymentRowSetter={setPaymentRow} loanIdSetter={setLoanId}/>
        </FormStep>
        <FormStep
          stepName="Loan Details"
          onSubmit={() =>{}}
        >
          <DataGrid
            rows={loanDetails}
            columns={columns}
            getRowId={(row) => row.loan_detail_id}
            sx={{ height: 370 }}
          />
        </FormStep>
        <FormStep
          stepName="Current Due"
          onSubmit={() => {}}
        >
          <LoanLinePaymentDetail id={loanId} paymentDataSetter={setPaymentData}/>
        </FormStep>
        <FormStep
          stepName="Payment Setup"
          onSubmit={() => {}}
        >
          <PaymentSetup selectedBank={selectedBank} selectedBankSetter={setSelectedBank} cashRow={cashRow} cashRowSetter={setCashRow} paymentData={paymentData} paymentDataSetter={setPaymentData} />
        </FormStep>
        <FormStep
          stepName="Payment"
          onSubmit={() => {}}
        >
          <PaymentAmount  id={loanId} paymentDataSetter={setPaymentData} paymentData={paymentData}/>
        </FormStep>
      </MultiStepForm1>
    </div>
  );
}
