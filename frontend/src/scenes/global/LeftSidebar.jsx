import { useState } from "react"
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { Link } from "react-router-dom"
import { tokens } from "../../theme"
import { HomeOutlined, PeopleOutlined, MenuOutlined, ReceiptOutlined, PointOfSaleOutlined, AttachMoneyOutlined, Diversity3Outlined, CategoryOutlined, TrendingDownOutlined, EmojiTransportationOutlined, AccountBalanceOutlined, CompareArrowsOutlined, ClassOutlined, TitleOutlined, BadgeOutlined } from "@mui/icons-material"
import 'react-pro-sidebar/dist/css/styles.css';

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
      <MenuItem
        active={selected === title}
        style={{
          color: colors.grey[100],
        }}
        onClick={() => setSelected(title)}
        icon={icon}
      >
        <Typography>{title}</Typography>
        <Link to={to} />
      </MenuItem>
    );
  };

const LeftSidebar = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState('Dashboard');

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.greenAccent[900]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: `${colors.greenAccent[500]} !important`, //#868dfb
        },
        "& .pro-menu-item.active": {
          color: `${colors.greenAccent[500]} !important`, //#6870fa
        },
      }}
      height="100%"
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlined /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  CASH 2 GO
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlined />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`../../assets/c2g_logo.png`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Administrator
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Administrator
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            {!isCollapsed ? (
                <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Transactions
              </Typography>
            ) : (
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px", border: "1px"}}
              >
                
              </Typography>
            )}
            
            <Item
              title="Loan"
              to="/loans"
              icon={<AttachMoneyOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Payments"
              to="/payments"
              icon={<PointOfSaleOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Invoices Balances"
              to="/invoices"
              icon={<ReceiptOutlined />}
              selected={selected}
              setSelected={setSelected}
            />

            {!isCollapsed ? (
              <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Maintenance
            </Typography>
            ):(
              <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              
            </Typography>
            )}
            
            {/* <Item
              title="Borrowers"
              to="/borrowers"
              icon={<PeopleOutlined />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Item
              title="Customers"
              to="/customers"
              icon={<Diversity3Outlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Employee"
              to="/employee"
              icon={<BadgeOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Banks"
              to="/banks"
              icon={<AccountBalanceOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Loan Category"
              to="/category"
              icon={<CategoryOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Facility"
              to="/facility"
              icon={<EmojiTransportationOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Deduction Type"
              to="/deduction"
              icon={<TrendingDownOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Collateral"
              to="/collateral"
              icon={<CompareArrowsOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Account Category"
              to="/account-category"
              icon={<ClassOutlined />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Account Title"
              to="/account-title"
              icon={<TitleOutlined />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  )
}

export default LeftSidebar