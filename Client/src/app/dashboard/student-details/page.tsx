"use client"

import { useState, useEffect } from "react"
import { Search, FileText, Briefcase, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select"
import { useGetStudents, useRegisterStudentForEvent, Student } from "@/app/hooks/students/useGetStudents"
import { useEvents } from "@/app/hooks/events/EvenetManagement"
import { useGetColleges } from "@/app/hooks/colleges/useGetColleges"

export default function StudentDetailsPage() {
  const { data: students = [], isLoading, error } = useGetStudents()
  const registerStudentMutation = useRegisterStudentForEvent()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null)
  const { data: events } = useEvents();
  const { data: collegeList } = useGetColleges();

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.program?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCollege = !selectedCollege || student.collegeName?.includes(selectedCollege)
    return matchesSearch && matchesCollege
  })

  const handleRegisterForEvent = (userId: string) => {
    setSelectedStudent(students.find(s => s.id === userId) || null)
    setSelectedEvent(null)
  }

  const handleConfirmRegistration = async () => {
    if (selectedStudent && selectedEvent) {
      try {
        await registerStudentMutation.mutateAsync({
          userId: selectedStudent.id,
          eventId: selectedEvent,
        })
        setToast({ message: "Student has been registered for the event.", type: 'success' })
      } catch (error: any) {
        if (error.response && error.response.data) {
          const { success, message } = error.response.data
          if (!success) {
            setToast({ message, type: 'error' })
          }
        } else {
          setToast({ message: "This student is already registered for this event.", type: 'error' })
        }
      }
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center justify-between`}>
          <span>{toast.message}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setToast(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl text-primary">
            Student Details
          </CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-400">
            View and manage student information, print documents, and internship applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-1/3">
              <Label htmlFor="college-select" className="text-sm font-medium mb-1.5 block text-secondary">
                Select College
              </Label>
              <Select onValueChange={(value) => setSelectedCollege(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a College" />
                </SelectTrigger>
                <SelectContent>
                  {collegeList?.map((college: any, index:any) => (
                    <SelectItem key={index} value={college}>
                      {college.collegeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-1.5 block text-secondary">
                Search Students
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by name, ID, or course"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" className="shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Registration ID</TableHead>
                  <TableHead className="hidden md:table-cell">Course</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      <div>{student.username}</div>
                      <div className="text-sm text-muted-foreground sm:hidden">{student.id}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{student.id}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.program}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedStudent(student)}
                              className="h-8 w-8"
                            >
                              <FileText className="h-4 w-4 text-secondary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-lg">Print Documents</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <h3 className="font-medium text-base mb-3">
                                Documents for {selectedStudent?.username}
                              </h3>
                              <ul className="space-y-2">
                                {selectedStudent?.printDocuments?.map((doc, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {doc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedStudent(student)}
                              className="h-8 w-8"
                            >
                              <Briefcase className="h-4 w-4 text-primary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-lg">Internship Applications</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <h3 className="font-medium text-base mb-3">
                                Applications for {selectedStudent?.username}
                              </h3>
                              <ul className="space-y-2">
                                {selectedStudent?.internshipApplications?.map((app, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {app}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegisterForEvent(student.id)}
                            >
                              Register for Event
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-lg">Select Event</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <h3 className="font-medium text-base mb-3">
                                Events for {selectedStudent?.username}
                              </h3>
                              <Select onValueChange={(value) => setSelectedEvent(value)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Choose an Event" />
                                </SelectTrigger>
                                <SelectContent>
                                  {events?.map((event: any) => (
                                    <SelectItem key={event._id} value={event._id}>
                                      {event.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                className="mt-4 w-full"
                                onClick={handleConfirmRegistration}
                                disabled={!selectedEvent || registerStudentMutation.isPending}
                              >
                                Confirm Registration
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

