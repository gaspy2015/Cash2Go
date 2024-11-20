import { Route, RouterProvider, Routes, createBrowserRouter } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Dashboard from "./scenes/dashboard";
import Borrowers from "./scenes/borrowers/index"
import LeftSidebar from "./scenes/global/LeftSidebar";
import Loan from "./scenes/loan";
import Banks from "./scenes/banks";
import Category from "./scenes/category";
import Facility from "./scenes/facility";
import DeductionType from "./scenes/deduction";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Customers from "./scenes/customers";
import Collateral from "./scenes/collateral";
import AccountCategory from "./scenes/accountCategory";
import AccountTitle from "./scenes/accountTitle";
import Employee from "./scenes/employee";
import LoanPayment from "./scenes/payment";
import Report from "./scenes/report";
import ExpensesPage from "./scenes/expenses";
import AdjustingEntriesPage from "./scenes/adjusting-entries";
import Signin from "./scenes/auth/Signin";
import { AuthContextProvider } from "./context/AuthContext";
import RootLayout from "./components/layout/RootLayout";

function App() {

  const [theme, colorMode] = useMode();


  const router = createBrowserRouter([
    {
      path : '/',
      element : <RootLayout />,
      children:[
        {
          index : true,
          element : <Dashboard />
        },
        {
          path : 'loans',
          element : <Loan />
        },
        {
          path : 'payments',
          element : <LoanPayment />
        },
        {
          path : 'report',
          element : <Report /> 
        },
        {
          path : 'report',
          element : <Report /> 
        },
        
      ]
    },
    {
      path: '/auth/login',
      element: <Signin />
    }
  ])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <AuthContextProvider>
          <CssBaseline />
          {/* <RouterProvider router={router} /> */}

          
            {/* <LeftSidebar /> */}
            {/* <main className="content"> */}
              {/* <Topbar /> */}
              <Routes>
                {/* <Route path="/" element={<Dashboard />} /> */}
                <Route path="/auth/login" element={<Signin />} />

                <Route path="/" element={<RootLayout />}> 
                  <Route index element={<Dashboard />} /> 
                  <Route path='loans'element={<Loan />} />
                  

                  <Route path="report" element={<Report />} />
                  
                  <Route path="/payments" element={<LoanPayment />} />
                  {/* <Route path="/payments/:id" element={<LoanPayment />} /> */}
                  <Route path="/borrowers" element={<Borrowers />}/>

                  <Route path="/customers" element={<Customers />}/>
                  <Route path="/customers/new" element={<Customers />}/>
                  <Route path="/customers/:id" element={<Customers />}/>

                  <Route path="/banks/cash2go" element={<Banks />} />
                  <Route path="/banks/customers" element={<Banks />} />
                  <Route path="/banks/new" element={<Banks />} />
                  <Route path="/banks/:id" element={<Banks />} />

                  <Route path="/category" element={<Category />} />
                  <Route path="/category/new" element={<Category />} />
                  <Route path="/category/:id" element={<Category />} />

                  <Route path="/facility" element={<Facility />} />
                  <Route path="/facility/new" element={<Facility />} />
                  <Route path="/facility/:id" element={<Facility />} />

                  <Route path="/deduction" element={<DeductionType />} />
                  <Route path="/deduction/new" element={<DeductionType />} />
                  <Route path="/deduction/:id" element={<DeductionType />} />
                  
                  <Route path="/collateral" element={<Collateral />} />
                  <Route path="/collateral/new" element={<Collateral />} />
                  <Route path="/collateral/:id" element={<Collateral />} />

                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/adjusting-entries" element={<AdjustingEntriesPage />} />
                  
                  <Route path="/account-category" element={<AccountCategory />} />
                  <Route path="/account-category/new" element={<AccountCategory />} />
                  <Route path="/account-category/:id" element={<AccountCategory />} />

                  <Route path="/account-title" element={<AccountTitle />} />
                  <Route path="/account-title/new" element={<AccountTitle />} />
                  <Route path="/account-title/:id" element={<AccountTitle />} />

                  <Route path="/employee" element={<Employee />} />
                  <Route path="/employee/new" element={<Employee />} />
                  <Route path="/employee/:id" element={<Employee />} />
                </Route>
              </Routes>
              <ToastContainer />
            {/* </main> */}
          {/* </div> */}
        </AuthContextProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
    
  )
}

export default App
