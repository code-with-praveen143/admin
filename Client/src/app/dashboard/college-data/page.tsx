"use client";
import React, { useState } from "react";
import { Edit, Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveAs } from "file-saver";
import { useCreateCollege } from "@/app/hooks/colleges/useCreateCollege";
import { useDeleteCollege } from "@/app/hooks/colleges/useDeleteCollege";
import { useGetColleges } from "@/app/hooks/colleges/useGetColleges";
import { useUpdateCollege } from "@/app/hooks/colleges/useUpdateCollege";
import { useGetRegulations } from "@/app/hooks/regulations/useGetRegulations";
import CollegeDataForm from "@/app/components/Forms/collegeForm";

// Interfaces (you may want to move these to a separate types file)
interface Regulation {
  type: string;
  regulation: string;
  validYears: number[];
}

interface Program {
  name: string;
  specializations: string[];
  years: number[];
  regulations: Regulation[];
}

interface CollegeDetails {
  address: string;
  contactNumber: string;
  email: string;
}

interface CollegeData {
  _id?: string;
  collegeName: string;
  regulatoryBody: string;
  domain: string;
  details: CollegeDetails;
  programs: Program[];
}

interface CollegeExportData {
  collegeName: string;
  regulatoryBody: string;
  domain: string;
}

export default function CollegeDataPage() {
  // Hooks
  const { data: collegeData, isLoading, error } = useGetColleges();
  const { data: regulationsData, isError } = useGetRegulations();
  const createCollegeMutation = useCreateCollege();
  const updateCollegeMutation = useUpdateCollege();
  const deleteCollegeMutation = useDeleteCollege();

  // State for editing
  const [editingCollege, setEditingCollege] = useState<CollegeData | null>(
    null
  );

  // Export to CSV function
  const exportToCSV = () => {
    const csvData = collegeData?.map(
      ({ collegeName, regulatoryBody, domain }: CollegeExportData) => ({
        collegeName,
        regulatoryBody,
        domain,
      })
    );

    const csvHeader = "College Name,Regulatory Body,Domain\n";
    const csvRows = csvData
      ?.map(
        (row: CollegeExportData) =>
          `${row.collegeName},${row.regulatoryBody},${row.domain}`
      )
      .join("\n");
    const csvContent = csvHeader + (csvRows || "");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "college_data.csv");
  };

  // Handle create/update submission
  const handleSubmit = (data: CollegeData) => {
    if (editingCollege) {
      // Update existing college
      updateCollegeMutation.mutate({
        id: editingCollege._id!,
        ...data,
      });
      setEditingCollege(null);
    } else {
      // Create new college
      createCollegeMutation.mutate(data);
    }
  };

  // Handle edit
  const handleEdit = (college: CollegeData) => {
    setEditingCollege(college);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteCollegeMutation.mutate(id);
  };

  // Loading and error states
  if (isLoading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }  if (error)
    return (
      <div>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
          <Card className="shadow-lg">
            <CardHeader className="p-4 md:p-6 space-y-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl text-green-600 md:text-3xl font-bold text-primary">
                    College Data Management
                  </CardTitle>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Manage and organize college information
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto order-2 sm:order-1"
                    onClick={exportToCSV}
                  >
                    Export CSV
                  </Button>
                  <div className="order-1 sm:order-2 w-full sm:w-auto">
                    <CollegeDataForm
                      onSubmit={handleSubmit}
                      initialData={editingCollege || undefined}
                      isEditMode={!!editingCollege}
                      regulationsData={regulationsData}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
  
            <CardContent className="p-4 md:p-6">
              <div className="rounded-lg border bg-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold whitespace-nowrap px-4 py-3">
                          College Name
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 py-3">
                          Regulatory Body
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 py-3">
                          Domain
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 py-3">
                          Programs
                        </TableHead>
                        <TableHead className="font-semibold whitespace-nowrap px-4 py-3 w-[100px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collegeData?.map((college: CollegeData) => (
                        <TableRow 
                          key={college._id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium px-4 py-3">
                            {college.collegeName}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {college.regulatoryBody}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {college.domain}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="max-w-[300px] truncate">
                              {college.programs?.map((p) => p.name).join(", ")}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(college)}
                                className="hover:bg-primary/10"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(college._id!)}
                                className="hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
