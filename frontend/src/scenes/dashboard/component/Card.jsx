import { useTheme } from '@emotion/react';
import { Box } from '@mui/material'
import React from 'react'
import { tokens } from '../../../theme';
import { LocalAtmOutlined } from '@mui/icons-material';

export default function Card({title, content, ...props}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <div style={{ 
      display : 'inline-block',
      border : `1px, solid, ${colors.greenAccent[700]}`,
      background : colors.greenAccent[800],
      boxShadow : '5px 5px 13px 1px rgba(0,0,0,0.16)',
      // borderRadius : 
    }}>
      <Box px={2} py={2} display='flex' flexDirection='column' gap={1}>
        {/* <Box display='flex' flexDirection='column' gap={1} > */}
          <Box display='flex' alignItems='center' gap={1}>

            <LocalAtmOutlined fontSize='large' />
            <p style={{ textTransform : "capitalize", fontWeight : "bold", fontSize: "larger" }}>{title}</p>
          </Box>
          <Box display='flex' flexDirection='column' >
            <p style={{textAlign : 'end', fontSize: "medium"  }}>{content}</p>
          </Box>

        {/* </Box> */}
      </Box>
      
    </div>
  )
}
