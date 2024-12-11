"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, User, Mail, MapPin, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/app/utils/constants";

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Time {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface Event {
  _id: string;
  title: string;
  collegeName: string;
  modeOfEvent: string;
  eventSpeaker: string;
  address: Address;
  time: Time;
  registeredStudents: string[];
}

interface Student {
  _id: string;
  yearOfJoining: string;
  username: string;
  email: string;
}

const fetchEventDetails = async (eventId: string): Promise<Event> => {
  const response = await fetch(`${BASE_URL}/api/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch event details");
  }
  const result = await response.json();
  return result.data;
};

const fetchStudentDetails = async (studentId: string): Promise<Student> => {
  const response = await fetch(`${BASE_URL}/api/students/${studentId}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch student details for ID: ${studentId}`);
  }
  return response.json();
};

const EventDetails = () => {
  const params = useParams();
  const eventId = params.id as string;

  const {
    data: event,
    isLoading: isEventLoading,
    error: eventError,
  } = useQuery<Event, Error>({
    queryKey: ["event", eventId],
    queryFn: () => fetchEventDetails(eventId),
  });

  const {
    data: students,
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useQuery<Student[], Error>({
    queryKey: ["students", event?.registeredStudents],
    queryFn: async () => {
      if (!event?.registeredStudents?.length) return [];
      const studentPromises = event.registeredStudents?.map((studentId) =>
        fetchStudentDetails(studentId)
      );
      return Promise.all(studentPromises);
    },
    enabled: !!event?.registeredStudents?.length,
  });

  const isLoading = isEventLoading || isStudentsLoading;
  const error = eventError || studentsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl md:text-3xl lg:text-4xl text-primary">
          {event?.title}
        </CardTitle>
        <CardDescription className="text-base md:text-lg text-gray-500">
          {event?.collegeName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <span>
              {event?.address.street}, {event?.address.city}, {event?.address.state} {event?.address.zip}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span>
              {new Date(event?.time.startDate || "").toLocaleDateString()} {event?.time.startTime} - 
              {new Date(event?.time.endDate || "").toLocaleDateString()} {event?.time.endTime}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{event?.modeOfEvent}</Badge>
          <Badge variant="outline">Speaker: {event?.eventSpeaker}</Badge>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Registered Students</h2>
            <Badge variant="secondary">
              Total Students: {students?.length || 0}
            </Badge>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Name</span>
                      Name
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Email</span>
                      Email
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="sr-only">Year</span>
                      Year
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.username}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.yearOfJoining}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!students || students.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-8"
                    >
                      No students registered yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDetails;

