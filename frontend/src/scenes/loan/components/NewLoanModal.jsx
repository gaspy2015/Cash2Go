import { AddOutlined, CheckBox, Margin, RemoveCircleOutlineOutlined } from "@mui/icons-material"
import { Autocomplete, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, MenuItem, TextField } from "@mui/material"
import { useState, useEffect, useReducer } from "react"
import { useTheme } from "@emotion/react"
import { tokens } from "../../../theme"
import { DataGrid } from '@mui/x-data-grid';
import LoanTable from "./LoanTable"
import LoanDetailsTable from "./LoanDetailsTable"


const initialLoanHeaderValues = {
    // id: 0,
    // pn_number: '',
    customer_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    // bank_account_pdc_id: '',
    collateral_id: 1,
    loan_category_id: '',
    loan_facility_id: '',
    principal_amount: 0,
    interest_rate: 0,
    total_interest: 0,
    term_month: 0,
    term_day: 0,
    date_granted: new Date().toISOString().split('T')[0],
    // status_code: '',
    check_issued_name: '',
    voucher_number: '',
    renewal_id: 0,
    renewal_amount: 0,
}

const loanInfoHeader = {
  loan_header_id : 0,
  pn_number : '',
  customername : '',
  bank_name : '',
  loancategory : '',
  loanfacility : '',
  principal_amount : 0, 
  total_interest : 0,
  date_granted : new Date().toISOString(),
  status_code : null,
}

export default function NewLoanModal({customers, collaterals, facilities, banks, categories, dispatcher, popups }) {
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loanInfo, setloanInfo] = useState(loanInfoHeader)
    const [loanHeaderValues, setLoanHeaderValues] = useState(initialLoanHeaderValues)
    const [principalAmount, setPrincipalAmount] = useState('');

    const [showMoratorium, setShowMoratorium] = useState(false);
    const [deductionList, setDeductionList] = useState([]);
    const [selectedDeduction, setSelectedDeduction] = useState({name : '', amount : 0});

    const [rowCount, setRowCount] = useState(1);
    const [rows, setRows] = useState([]);

    const handleMoratoriumChange = (event) => {
      setShowMoratorium(event.target.checked);
    }; 


    const handleRowCountChange = (e) => {
      // const count = parseInt(e.target.value, 10);
      const count = Number(e.target.value);
      setRowCount(count);
      const newRows = Array.from({ length: count }, (_, index) => ({ ...loantemp,  id: index + 1 }));
      setLoanHeaderValues({...loanHeaderValues, term_month : count})
      setRows(newRows);
    };

    const handlePrincipalAmountChange = (event) => {
      let sanitizedInput = event.target.value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
    
      // Validate if the input is a valid numeric value
      if (/^\d*\.?\d*$/.test(sanitizedInput)) {
        const parts = sanitizedInput.split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const decimalPart = parts[1] ? `.${parts[1].slice(0, 2)}` : '';
    
        sanitizedInput = `${integerPart}${decimalPart}`;
      }
    
      setPrincipalAmount(sanitizedInput);
    };
        
    // Start for the deduction
    const handleDeductionChange = (event, value) => {
      const deductObj = {name : value, amount : 0};
      setSelectedDeduction(deductObj);
    };

    const handleAddDeduction = () => {        
      if(selectedDeduction){
        
        let isContains = false;

        for (const d of deductionList) {
          if(d.name === selectedDeduction.name){ isContains = true }
        }

        if(!isContains){
          setDeductionList([...deductionList, selectedDeduction]);
          setSelectedDeduction(null);
        }
      }
    };

    const handleDeleteDeduction = (index) => {
      const updatedDeductions = deductionList.filter((_, i) => i !== index);
      setDeductionList(updatedDeductions);
    };

    const handleDeductionInputChange = (event, name) => {
      
      const newDection = deductionList.map((d, i) => {
        if(d.name === name) { 
          return {...d, amount : Number(event.target.value)}
        }
        return d
      })
      
      setDeductionList(newDection)
    }
    
    const handleSubmit = async () => {
      //TODO convert row details bank name to id

      const details = rows.map((l) =>{
        for (const b of banks) {
          if(b.name === l.bank) { return {...l, bank : b.id}}
        }
      })

      const data = {
        header : loanHeaderValues,
        deduction : deductionList,
        details : details
      }

      const req = await fetch('/api/loans', {
        method : 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })

      const res = await req.json()
     
      console.log(res)
      // id : id[0], 
      // pnNumber : pnNumber,
      // totalInterest : totalInterest,
      // status_code : LoanStatus.ONGOING

      dispatcher({type : 'ADD', loans : {
        ...loanInfo,
        loan_header_id : res.id,
        pn_number : res.pnNumber, 
        status_code : res.status_code,
        total_interest : res.totalInterest
      }})
      popups(false)
      console.log(data)
    }
  return (
    <div>
      <form>
      <Grid container spacing={1} marginBottom={4}>
        
        {/* START FIRST COLUMN */}
        <Grid item xs={8} border={1} borderColor={colors.grey[500]}>
          <Grid container xs={12}>
            <Grid item xs={4}>
              <TextField
                variant="outlined"
                label="Voucher Number"
                type="number"
                name="voucher_number"
                fullWidth
                // value={loanHeaderValues.voucher_number}
                onChange={e => setLoanHeaderValues({...loanHeaderValues, voucher_number : Number(e.target.value)})}
                sx={{width: "95%", margin: 1}}
              />          
            </Grid>
            <Grid item xs={8}>
              <Autocomplete 
                disablePortal
                renderInput={(params) => <TextField {...params} label="Customer" name="customer"/>}
                id="customerName"
                options={ customers.map((c) => `${c.f_name} ${c.m_name} ${c.l_name}`)}
                onInputChange= {
                  (event, value) => {
                    setloanInfo({...loanInfo, customername : value })
                    for (const c of customers) {
                      if(`${c.f_name} ${c.m_name} ${c.l_name}`=== value){
                        setLoanHeaderValues({...loanHeaderValues, customer_id : c.id})
                      }
                    }
                  } 
                }
                sx={{width: "95%", margin: 1}}
              />
            </Grid>
          </Grid>
          <Grid container xs={12}>
            <Grid item xs={5}>
              <Autocomplete 
                disablePortal
                id="bank"
                options={banks.map((option) => option.name)}
                onInputChange={(event, value) => {
                  setloanInfo({...loanInfo,  bank_name : value })
                  for (const b of banks) {
                      if(b.name === value) {
                        setLoanHeaderValues({...loanHeaderValues, bank_account_id : b.id})
                      }
                    }
                  }
                }
                sx={{width: "95%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Bank" />}
              />
              
            </Grid>
            <Grid item xs={7}>
              <TextField
                variant="outlined"
                label="Check Issued Name"
                fullWidth
                // value={loanHeaderValues.voucher_number}
                onChange={(e) => setLoanHeaderValues({...loanHeaderValues , check_issued_name : e.target.value})}
                sx={{width: "95%", margin: 1}}
              />
            </Grid>
          </Grid>
          <Grid container xs={12}>
            <Grid item xs={12}>
              <Autocomplete 
                disablePortal
                id="collateral"
                options={collaterals.map((option) => option.name)}
                onInputChange= {
                  (event, value) => {
                    setloanInfo({...loanInfo,   loancategory: value})
                    for (const c of collaterals) {
                      if(c.name === value){
                        setLoanHeaderValues({...loanHeaderValues, collateral_id : c.id})
                      }
                    }
                  } 
                }
                sx={{width: "97%", margin: 1}}
                renderInput={(params) => <TextField {...params} label="Loan Collateral" />}
              />
              <Autocomplete 
                disablePortal
                id="facility"
                renderInput={(params) => <TextField {...params} label="Loan Category" />}
                options={categories.map((option) => option.name)}
                onInputChange= {
                  (event, value) =>{
                    setloanInfo({...loanInfo,  loancategory : value })
                    for (const c of categories) {
                      if(c.name === value){
                        setLoanHeaderValues({...loanHeaderValues, loan_category_id : c.id})
                      }
                    }
                  } 
                }
                sx={{width: "97%", margin: 1}}
              />
              <Autocomplete 
                disablePortal
                id="facility"
                renderInput={(params) => <TextField {...params} label="Loan Facility" />}
                options={facilities.map((option) => option.name)}
                onInputChange= {
                  (event, value) =>{
                    setloanInfo({...loanInfo,  loanfacility : value })
                    for (const f of facilities) {
                      if(f.name === value){
                        setLoanHeaderValues({...loanHeaderValues, loan_facility_id : f.id})
                      }
                    }
                  } 
                }
                sx={{width: "97%", margin: 1}}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* END FIRST COLUMN */}
        {/* START SECOND COLUMN */}       
        <Grid item xs={4} >
            <Grid container>
              <Grid item xs={8}>
                <TextField
                  variant="outlined"
                  label="Principal Amount"
                  type="number"  // Use type="text" to allow alphanumeric characters
                  fullWidth
                  // value={principalAmount}
                  // onChange={handlePrincipalAmountChange}
                  onChange={(e) => {
                    setloanInfo({...loanInfo,  principal_amount : Number(e.target.value) })
                    setLoanHeaderValues({...loanHeaderValues, principal_amount : Number(e.target.value)})}
                  }
                    
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    step: "0.1",
                    lang: "en-US"
                  }}
                  sx={{ width: '90%', margin: 1 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  variant="outlined"
                  label="Rate"
                  type="number"
                  fullWidth
                  onChange={(e) => setLoanHeaderValues({...loanHeaderValues, interest_rate : Number(e.target.value)})}
                  // value={loanHeaderValues.voucher_number}
                  sx={{width: "90%", margin: 1}}
                />
              </Grid>
            </Grid>
            <Grid container>
              {/* <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label="Monthly Term"
                  type="number"
                  fullWidth
                  sx={{width: "97%", margin: 1}}
                  // inputProps={{ min: 0 }}
                  // value={rowCount}
                  // onChange={handleRowCountChange}
                />
              </Grid> */}
              <Grid item xs={12}>
                  {/* Checkbox for showing additional fields */}
                  <FormControlLabel 
                    control={<Checkbox />} 
                    label="Moratorium" 
                    checked={showMoratorium}
                    onChange={handleMoratoriumChange}
                    sx={{
                      color: colors.greenAccent[500],
                      '&.Mui-checked': {
                        color: colors.greenAccent[500],
                      },
                      margin: 1
                    }}
                  />
                  
              </Grid>
            </Grid>
            {showMoratorium && (
            <Grid container>
              <Grid item xs={4}>
                <TextField
                  variant="outlined"
                  label="Rate"
                  type="number"
                  fullWidth
                  // value={loanHeaderValues.voucher_number}
                  sx={{width: "90%", margin: 1}}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  variant="outlined"
                  label="Monthly Term"
                  type="number"
                  fullWidth
                  sx={{width: "95%", margin: 1}}
                  inputProps={{ min: 0 }}
                  
                />
              </Grid>
            </Grid>
          )}
        </Grid>
        {/* END SECOND COLUMN */}
        {/* START THIRD COLUMN */}
        {/* <Grid item xs={3}>
          
        </Grid> */}
        {/* END THIRD COLUMN */}
      </Grid>
      {/* ----------------------------- */}
      <Grid container>
        <Grid item xs={2}>
        <Grid container>
            <Grid item xs={12}>
              <Autocomplete
              id="deduction"
              options={["Appraisal Fee", "Notarial Fee", "Documentary Stamp", "Service Charge"]}
              value={ selectedDeduction && selectedDeduction.name}
              onChange={handleDeductionChange}
              renderInput={(params) => <TextField {...params} label="Deduction" fullWidth />}
              sx={{width: "90%", margin: 1}}
              />
              <Button 
                variant="outlined" 
                size="large"
                onClick={handleAddDeduction} 
                sx={{ 
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  width: "90%", marginTop: 2, margin: 1,
                  borderColor: colors.grey    [400],
                  "&:hover": {borderColor: colors.grey[400],
                              backgroundColor: colors.grey[700]        
                      }
                 }}
              >
                <AddOutlined sx={{ mr: "2px" }} />
              </Button>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                {deductionList.map((deduction, index) => (
                   <TextField
                     key={index}
                     variant="outlined"
                     label={deduction.name}
                     fullWidth
                     onChange={(e) => handleDeductionInputChange(e, deduction.name)}
                     sx={{ width: "90%", margin: 1, textAlign: "end" }}
                     InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteDeduction(index)}
                          >
                            <RemoveCircleOutlineOutlined />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                   />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={10}>
          
          <LoanDetailsTable banks={banks} rows={rows} setRows={setRows}/>

        </Grid>  
        <Button onClick={handleSubmit}>Submit</Button>
      </Grid>
    </form>
    </div>
  )
}
