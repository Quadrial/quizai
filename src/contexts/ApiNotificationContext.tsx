import React, { createContext, useState, useContext } from 'react'
import type { ReactNode } from 'react'

interface ApiNotificationContextType {
  showNotification: (message: string) => void
  hideNotification: () => void
  notification: {
    message: string
    visible: boolean
  }
}

const ApiNotificationContext = createContext<ApiNotificationContextType | undefined>(undefined)

export const ApiNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', visible: false })

  const showNotification = (message: string) => {
    setNotification({ message, visible: true })
  }

  const hideNotification = () => {
    setNotification({ message: '', visible: false })
  }

  return (
    <ApiNotificationContext.Provider value={{ showNotification, hideNotification, notification }}>
      {children}
    </ApiNotificationContext.Provider>
  )
}

export const useApiNotification = () => {
  const context = useContext(ApiNotificationContext)
  if (context === undefined) {
    throw new Error('useApiNotification must be used within an ApiNotificationProvider')
  }
  return context
}