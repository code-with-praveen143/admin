"use client"

import React, { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  value?: Date
  onChange?: (date: Date | null) => void
  className?: string
}

export const Calendar = forwardRef<DatePicker, CalendarProps>(
  ({ value, onChange, className }, ref) => {
    return (
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="MMMM d, yyyy"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        wrapperClassName="w-full"
        ref={ref}
      />
    )
  }
)

Calendar.displayName = "Calendar"

