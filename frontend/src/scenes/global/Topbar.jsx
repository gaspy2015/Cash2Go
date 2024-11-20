import { Box, Grid, IconButton, Popper, Typography, useTheme } from "@mui/material"
import { useContext, useRef, useState } from "react"
import { ColorModeContext, tokens } from "../../theme"
import {InputBase} from "@mui/material"
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import useSWR from 'swr'
import axios from "axios";
import dayjs from "dayjs";
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear);

const fetcher = url => axios.get(url).then(res => res.data)

const Topbar = () => {
    // const {data, isLoading} = useSWR('api/customers/birthday', fetcher)
    const notificationRef = useRef(null)
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const colorMode = useContext(ColorModeContext);

    const [openNotification, setOpenNotification] = useState(false)

    // const noficationList  = () => {
    //     if(isLoading) return (
    //         <Box>
    //             <Typography align="center">Getting Notifications...</Typography>
    //         </Box>
    //     )

    //     if(data.data.length === 0) {
    //         return (
    //             <Box>
    //                 <Typography align="center">Notifaction Empty</Typography>
    //             </Box>
    //         )
    //     }

    //     const birthday = data.data.map((v) => { 
    //         if(dayjs(v.birthdate).isBefore(dayjs(), 'day')) return undefined;

    //         if(dayjs(v.birthdate).isSame(dayjs(), 'day')) 
    //             return {
    //                 label : `${v.full_name} birthday today`,
    //                 date: v.birthdate
    //             };
        
    //         if((dayjs().week() + 1) === dayjs(v.birthdate).week()) 
    //             return {
    //                 label : `${v.full_name} birthday next week`,
    //                 date: v.birthdate
    //             };
            
    //         if(dayjs(v.birthdate).isSame(dayjs(), 'week')) {

    //             const tomorrow = dayjs().add(1, 'day')
                
    //             if(dayjs(v.birthdate).isSame(tomorrow, 'day')) {
    //                 return {
    //                     label : `${v.full_name} birthday is tomorrow`,
    //                     date: v.birthdate
    //                 }
    //             }
    //             return {
    //                 label : `${v.full_name} birthday this week`,
    //                 date: v.birthdate
    //             }
    //         }
        
    //         if(dayjs(v.birthdate).isSame(dayjs(), 'month')) 
    //             return {
    //                 label : `${v.full_name} birthday this month`,
    //                 date: v.birthdate
    //             }
    //     }).filter(v => v != undefined).sort((a, b) => a.date - b.date)

    //     return (
    //         <Grid container spacing={2}>
    //             {birthday.map((v, i) => (
    //                 <>
    //                     <Grid xs={9} item key={ i}>
    //                         {v.label}
    //                     </Grid>
    //                     <Grid xs={3} item key={v.label + i}>
    //                         {dayjs(v.date).format('MM-DD-YYYY')}
    //                     </Grid>
    //                 </>
    //             ))}
    //         </Grid>
    //     )
        
    // }

    return ( 
        <Box display="flex" justifyContent="flex-end" paddingX={2} paddingY='5px'>
            <Box display="flex">
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === 'dark' ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>
                <IconButton ref={notificationRef} onClick={() => setOpenNotification((old) => !old)}>
                    <NotificationsOutlinedIcon />
                    {/* <Typography>{data ? data.data.length : 0}</Typography> */}
                    
                </IconButton>
                <IconButton>
                    <SettingsOutlinedIcon />
                </IconButton>
                <IconButton>
                    <PersonOutlineOutlinedIcon />
                </IconButton>
            </Box>
            <Popper open={openNotification} anchorEl={notificationRef.current}>
                <Box sx={{ border: 1, p: 2, width: 500, height: 350, borderRadius: 2, borderColor: colors.greenAccent[900], overflowY: 'scroll', bgcolor: colors.greenAccent[800] }}>
                    {/* {noficationList()} */}
                </Box>
            </Popper>
            {/* Icons End */}
        </Box> 
    )
}

export default Topbar