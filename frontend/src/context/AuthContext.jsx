import React, { createContext, useContext, useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'

const AuthContext = createContext(null)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if(!context) { throw new Error('useAuth must be inside in a AuthContextProvider')}

  return context
}

const testUser = {
  name : 'Noemito John Lacanaria',
  id : 1,
  type : 'admin'
}

export function AuthContextProvider({children}) {

  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  
  const getUserLocalStorage = () => {
    // localStorage.setItem('user', JSON.stringify(testUser))
    const localUser = localStorage.getItem('user')
    
    if(!localUser) { return navigate('/auth/login') }

    setUser(JSON.parse(localUser))
    
    navigate('/')
  }

  useEffect(() => {
    getUserLocalStorage()
  }, [])
 
  return (
    <AuthContext.Provider value={{getUserLocalStorage, user }}>
      {children}
    </AuthContext.Provider>
  )
}
