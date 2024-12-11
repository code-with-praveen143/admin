"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useGetAllPdfs } from '../hooks/pdfUploads/useGetAllPdfs'
import { useGetUsers } from '../hooks/userMangementData/useGetUsers'

type Notification = {
  id: string
  message: string
  date: string
  type: "info" | "success" | "warning"
}

type NotificationContextType = {
  notifications: Notification[]
  deleteNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { data: pdfData } = useGetAllPdfs()
  const { data: userData } = useGetUsers()

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}