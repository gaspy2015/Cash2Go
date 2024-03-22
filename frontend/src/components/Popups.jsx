import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTheme } from '@emotion/react'
import { tokens } from "../theme"
import { Link } from "react-router-dom";
import { green, grey } from "@mui/material/colors";



export default function Popups(props) {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const {title, children, openPopup, setOpenPopup, toURL} = props
    const dialogStyle = {
      padding: 2,
      position: 'absolute',
      top: 5,
  };

    
  return (
    <Box>
      <Dialog open={openPopup} maxWidth="xl" PaperProps={{style: dialogStyle}}>
        <DialogTitle sx={{backgroundColor: colors.greenAccent[800]}}>
          <div style={{display: 'flex', justifyContent: 'space-between', padding: 2}}>
            <Typography variant="h3" component="div" sx={{color: colors.primary[100]}}>
              {title}
            </Typography>
            <Button
                        component={Link}
                        to={toURL}
                        variant="text"
                        size="medium"
                        sx={{
                            
                            color: colors.grey[100],
                            fontWeight: "bold",
                            borderColor: colors.grey    [400],
                            "&:hover": {borderColor: colors.grey[200],
                                        backgroundColor: colors.greenAccent[900]        
                                }
                                
                        }}
                        onClick={() => setOpenPopup(false)}
                    >
                        X
                    </Button>
          </div>
        </DialogTitle>
        <DialogContent dividers sx={{backgroundColor: colors.greenAccent[900], color: grey[700]}}>
            {children}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

