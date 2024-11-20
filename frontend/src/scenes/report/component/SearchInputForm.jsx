import { useTheme } from '@emotion/react';
import { SearchOutlined } from '@mui/icons-material'
import { IconButton, InputBase } from '@mui/material'
import React, { useState } from 'react'
import { tokens } from '../../../theme';

export default function SearchInputForm({submit, name, ...props}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [search, setSearch] = useState('')
  return (
    <form onSubmit={(e) => { 
      e.preventDefault();

      submit(search, name, e)
      
      setSearch('')
    }}
      style={{
        display : 'inline-block',
        width: 'auto',
        background : colors.greenAccent[800],
        borderRadius : 3
      }}
    >
      <InputBase size='small' 
        sx={{px : 1}}
        name={name}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        {...props} />
      <IconButton type='submit'>
        <SearchOutlined />
      </IconButton>
    </form>
  )
}
