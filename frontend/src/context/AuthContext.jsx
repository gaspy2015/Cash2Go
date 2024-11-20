import React, { createContext, useContext, useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'

const AuthContext = createContext([])

export const useAuth = () => {
  const context = useContext(AuthContext)
  if(!context) { throw new Error('useAuth must be inside in a AuthContextProvider')}

  return context
}

export function AuthContextProvider({children}) {

  const [user, setUser] = useState(null)
  // const navigate = useNavigate()
  const getUserLocalStorage = () => {

  }

  useEffect(() => {
    // navigate('/auth/login')
  }, [])


  return (
    <AuthContext.Provider value={{user}}>
      {children}
    </AuthContext.Provider>
  )
}
