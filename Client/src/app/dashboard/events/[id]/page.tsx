"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, User, Mail, MapPin, Calendar, ArrowLeft } from "lucide-react";
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
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
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
    toast({
      title: "Loading",
      description: "Fetching event details, please wait...",
      variant: "default",
    });
  
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <Toaster />
      <div className="flex justify-end">
        <Link href="/dashboard/events" passHref>
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </span>
        </Link>
      </div>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Event Details Card */}
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl text-primary">
                {event?.title}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {event?.collegeName}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 space-y-8">
            {/* Event Information Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border bg-card">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Location
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event?.address.street}, {event?.address.city},{" "}
                          {event?.address.state} {event?.address.zip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Date & Time
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            event?.time.startDate || ""
                          ).toLocaleDateString()}{" "}
                          {event?.time.startTime} -
                          {new Date(
                            event?.time.endDate || ""
                          ).toLocaleDateString()}{" "}
                          {event?.time.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border bg-card">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {event?.modeOfEvent}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Speaker
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event?.eventSpeaker}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registered Students Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">
                  Registered Students
                </h2>
                <Badge variant="secondary" className="h-7 rounded-md px-3">
                  Total Students: {students?.length || 0}
                </Badge>
              </div>

              <Card className="border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Name
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </TableHead>
                        <TableHead className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Year
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students?.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell className="font-medium">
                            {student.username}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {student.yearOfJoining}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!students || students.length === 0) && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="h-32 text-center text-muted-foreground"
                          >
                            No students registered yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetails;
