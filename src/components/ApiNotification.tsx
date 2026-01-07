import React from 'react'
import { useApiNotification } from '../contexts/ApiNotificationContext'
import { HiExclamationTriangle, HiXMark } from 'react-icons/hi2'
import { Link } from 'react-router-dom'

const ApiNotification: React.FC = () => {
  const { notification, hideNotification } = useApiNotification()

  if (!notification.visible) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50 flex items-center justify-between">
      <div className="flex items-center">
        <HiExclamationTriangle className="w-6 h-6 mr-3" />
        <div>
          <span>{notification.message}</span>
          <Link to="/settings" className="underline ml-2">Go to Settings</Link>
        </div>
      </div>
      <button onClick={hideNotification}>
        <HiXMark className="w-6 h-6" />
      </button>
    </div>
  )
}

export default ApiNotification
