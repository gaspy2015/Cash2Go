import { Typography, Box, useTheme, Button } from "@mui/material"
import { tokens } from "../theme"
import { AddOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Header = ({title, subtitle, showButton = true, onAddButtonClick, toURL}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

  return (
    <Box 
    display="flex" justifyContent="space-between" p={2} 
        // sx={{ '& button': { m: 1 } }}
        >
        <div>
        <Typography 
            variant="h4" 
            color={colors.grey[100]} 
            fontWeight="bold" 
            sx={{ mb:"2px" }}
        > 
            {title} 
        </Typography>

        <Typography
            variant="h5"
            color={colors.greenAccent[400]}
        > 
            {subtitle} 
        </Typography>
        </div>
        <div>
        {showButton && (
                <div>
                    <Button
                        variant="outlined"
                        size="medium"
                        component={Link}
                        to={toURL}
                        sx={{
                            backgroundColor: colors.greenAccent[900],
                            color: colors.grey[100],
                            fontSize: "15px",
                            fontWeight: "bold",
                            // padding: "5px",
                            borderColor: colors.greenAccent[800],
                            "&:hover": {borderColor: colors.grey[400],
                                        backgroundColor: colors.greenAccent[100],
                                        color: colors.grey[900],        
                                }
                        }}
                        onClick={onAddButtonClick}
                    >
                        <AddOutlined sx={{ mr: "2px" }} />
                        Add
                    </Button>
                </div>
            )}
        </div>
    </Box>
  )
}

export default Header