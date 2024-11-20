import { DataGrid, GridActionsCell, GridActionsCellItem } from '@mui/x-data-grid'
import React, { useState } from 'react'
import Header from '../../components/Header'
import Popups from '../../components/Popups'
import { Box, Button } from '@mui/material'
import ExpensesParentForm from './components/ExpensesParentForm'
import ExpensesDetails from './components/ExpensesDetails'
import ExpensesVoucher from './components/ExpensesVoucher'
import useSwr from 'swr'
import axios from 'axios'
import ExpensesPrintVoucher from './components/ExpensesPrintVoucher'
import { CreateOutlined, PrintOutlined } from '@mui/icons-material'
import voucherTemplateHTML from '../../assets/voucher.html?raw'
import logo from '../../assets/c2g_logo_nb.png'
import useSWRMutation from 'swr/mutation'
import * as ejs from 'ejs'
import dayjs from 'dayjs'
import { toastErr, toastSucc } from '../../utils'
import * as yup from 'yup'

const initialValues = {
  voucherNumber : '',
  borrower : '',
  date: null,
  bank : '',
  check_number : '',
  check_date: '',
  prepared_by: '',
  checked_by: '',
  approved_by: '',
  voucher_details : [{ category: '', debit: '0', credit: '0'}] 
}

const validationSchema = yup.object({
  voucherNumber : yup.string().required(),
  borrower : yup.object({ name : yup.string().required() }),
  date: yup.date().required(),
  bank : yup.object({ name : yup.string().required() }),
  check_number : yup.string().required(),
  check_date: yup.date().required(),
  prepared_by: yup.string().required(),
  checked_by: yup.string().required(),
  approved_by: yup.string().required(),
})

const fetcher = (url) => {
  return axios.get(url).then(res => res.data)
}

const fetchDetails = (key, {arg}) => {
  const url = key + '/' +  arg
  return axios.get(url).then(res => res.data)
}

const saveExpenses = async (url, {arg}) => {
  return await axios.post(url, arg)
}

export default function ExpensesPage() {
  const [openExpesesForm, setOpenExpensesForm] = useState(false)
  const [openEditExpensesForm, setOpenEditExpensesForm] = useState(false)

  const [activeStep, setActiveStep] = React.useState(0);
  const [details, setDetails] = useState(initialValues)
  
  const {data : banks, } = useSwr('/api/expenses/banks', fetcher)
  const {data : expenses_title, } = useSwr('/api/account-title/expenses', fetcher)
  const {data : employee, } = useSwr('/api/employee', fetcher,)
  const {data : suppliers} = useSwr('/api/expenses/suppliers', fetcher)
  const {data : expenses, isLoading, mutate } = useSwr('/api/expenses/', fetcher)
  
  const {trigger: createExpenses} = useSWRMutation('/api/expenses', saveExpenses)
  const { trigger: getExpensesVoucher  } = useSWRMutation('/api/expenses', fetchDetails)
  const { trigger: getEditExpensesVocher  } = useSWRMutation('/api/expenses/edit', fetchDetails)


  const handleEditVoucher = async (id) => {
    const response = await getEditExpensesVocher(id)
    // console.log(response)
    setDetails(response)
    setOpenEditExpensesForm(true)
  }

  const handleStepComplete = (data) => {
    setDetails((old) => ({...old, ...data}))
    setActiveStep((prev) => prev + 1)
  }

  const handlePrintVoucher = async (id) => {

    const response = await getExpensesVoucher(id)
    console.log(68, response)
    const input = {
      logo : logo,
      ...response,
      has_second_check: false,
      date: dayjs(response.date).format('MM-DD-YYYY'),
      check_details : `${response.bank}-${response.check_number}`
    }

    const template = ejs.render(voucherTemplateHTML, input)
    const voucherWindow = window.open("", "Print Voucher");
    voucherWindow.document.write(template);
  }

  const handlePrevious = (data) => {
    setDetails((old) => ({...old, ...data}))
    setActiveStep((prev) => prev - 1)
  }

  const column = [
    {
      field: 'actions',
      type: 'actions',
      width: 50,
      getActions: ({id}) => {
        return [
          <GridActionsCellItem 
            icon={<PrintOutlined />}
            label='Print Voucher'
            onClick={() => handlePrintVoucher(id)}
            showInMenu={true}
            />,
            <GridActionsCellItem 
            icon={<CreateOutlined />}
            label='Edit Voucher'
            showInMenu={true}
            onClick={() => handleEditVoucher(id)}
          />
        ]
      }
    },
    {
      field : 'date',
      headerName: "Date",
      width: 100
    },
    {
      field : 'voucher_number',
      headerName: "Voucher No.",
      // flex: 1
      width: 100
    },
    {
      field : 'payee',
      headerName: "Payee",
      flex: 1
      // width : 200
    },
    
    {
      field : 'check_details',
      headerName: "Check Details",
      flex: 1
    },
    {
      field : 'prepared_by',
      headerName: "Prepared By",
      width : 110
    },
    {
      field : 'checked_by',
      headerName: "Checked By",
      width : 110
    },
    {
      field : 'approved_by',
      headerName: "Approved By",
      width : 110
    },
  ] 

  const handleSuccess = () => {
    mutate()
    setOpenExpensesForm(false)
    setOpenEditExpensesForm(false)
    setActiveStep(0)
    setDetails(initialValues)
    toastSucc('Save Successfuly')
  }

  const handleSubmitVoucher = async (data) => {
    
    const v_details = data.voucher_details.map(v => {
      return {
        account_title_id : v.category.id,
        credit : Number(v.credit),
        debit: Number(v.debit)
      }
    })
    // return console.log(data)
    const input = {
      header : {
        payee : data.borrower,
        date: data.date,
        check_number : data.check_number,
        check_date : data.check_date,
        bank: {name : data.bank.name, id : data.bank.id},
        voucher_number : data.voucherNumber,
        prepared_by: data.prepared_by,
        checked_by: data.checked_by,
        approved_by: data.approved_by,
      },
      details: v_details
    }

    const response = await createExpenses(input)
    
    if(response.status === 200 ) {
      return handleSuccess()
    }

    toastErr('Something went wrong!')
  }

  const handleUpdateVoucher = async (data) => {
    const input = {
      header : {
        payee: data.borrower.name,
        approved_by : data.approved_by,
        bank: data.bank.name,
        bank_id: data.bank_id,
        check_date: data.check_date,
        check_number: data.check_number,
        checked_by: data.checked_by,
        date: data.date,
        prepared_by: data.prepared_by,
        supplier_id: data.supplier_id,
        voucher_number: data.voucherNumber,
      },
      voucher_details : data.voucher_details,
      map_to_delete : data.map_to_delete
    }
    try {
      const {status} = await axios.put(`/api/expenses/${data.id}`, input)
      
      if(status != 200) { return toastErr('Something went Wrong!') }
      
      handleSuccess()

    } catch (error) {
      return toastErr('Something went Wrong!')
    }
    
  }


  return (
    <Box padding={2} height='100%' display='flex' flexDirection='column'>
      <Header title='Expenses' onAddButtonClick={ () => setOpenExpensesForm(true)}/>
        <Box border='solid red' flex={1} position='relative'>
          <Box sx={{position : 'absolute', inset: 0}}>
            {!isLoading && 
              <DataGrid columns={column} rows={expenses} rowSelection={false}/>
            }
          </Box>
        </Box>
      <Popups
        title="Expenses Form"
        openPopup={openExpesesForm}
        setOpenPopup={(open) => {
          setOpenExpensesForm(open)
          setActiveStep(0)
          setDetails(initialValues)
        }}
      >
        <Box width={900}>
          <ExpensesParentForm activeStep={activeStep}>
            <FormStep label='Expenses Details'>
              <ExpensesDetails validationSchema={validationSchema} onComplete={handleStepComplete} suppliers={suppliers} data={details} banks={banks} employee={employee} />
            </FormStep>
            <FormStep label='Voucher'>
              <ExpensesVoucher titles={expenses_title} data={details.voucher_details} onComplete={handleStepComplete} onPrevious={handlePrevious}/>
            </FormStep>
            <FormStep label='Print And Save'>
              <ExpensesPrintVoucher data={details} onPrevious={handlePrevious} onSubmit={handleSubmitVoucher}/>
            </FormStep>
          </ExpensesParentForm>
        </Box>
      </Popups>
      
      <Popups
        title="Expenses Form"
        openPopup={openEditExpensesForm}
        setOpenPopup={(open) => {
          setOpenEditExpensesForm(open)
          setActiveStep(0)
          setDetails(initialValues)
        }}
      >
        <Box width={900}>
          <ExpensesParentForm activeStep={activeStep}>
            <FormStep label='Expenses Details'>
              <ExpensesDetails onComplete={handleStepComplete} suppliers={suppliers} data={details} banks={banks} employee={employee} />
            </FormStep>
            <FormStep label='Voucher'>
              <ExpensesVoucher titles={expenses_title} data={details.voucher_details} onComplete={handleStepComplete} onPrevious={handlePrevious}/>
            </FormStep>
            <FormStep label='Print And Save'>
              <ExpensesPrintVoucher data={details} onPrevious={handlePrevious} onSubmit={handleUpdateVoucher} />
            </FormStep>
          </ExpensesParentForm>
        </Box>
      </Popups>
      
    </Box>
  )
}

export function FormStep({ label='', children}) {
  return children
}