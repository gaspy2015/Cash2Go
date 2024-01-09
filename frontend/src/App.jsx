import { Route, Routes } from "react-router-dom";
import Topbar from "./scenes/global/topbar";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Dashboard from "./scenes/dashboard";
import Borrowers from "./scenes/borrowers/index"
import LeftSidebar from "./scenes/global/LeftSidebar";
import Loan from "./scenes/loan";
import Banks from "./scenes/banks";
import Category from "./scenes/category";
import Facility from "./scenes/facility";


function App() {

  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className='app'>
          <LeftSidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/loans" element={<Loan />} />
              <Route path="/borrowers" element={<Borrowers />}/>
              <Route path="/banks" element={<Banks />} />
              <Route path="/category" element={<Category />} />
              <Route path="/facility" element={<Facility />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
    
  )
}

export default App
