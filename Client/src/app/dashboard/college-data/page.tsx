"use client";
import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
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
  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <Card>
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl lg:text-3xl text-primary">
                College Data Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and organize college information
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={exportToCSV}
              >
                Export CSV
              </Button>

              <CollegeDataForm
                onSubmit={handleSubmit}
                initialData={editingCollege || undefined}
                isEditMode={!!editingCollege}
                regulationsData={regulationsData}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">College Name</TableHead>
                    <TableHead className="font-medium">
                      Regulatory Body
                    </TableHead>
                    <TableHead className="font-medium">Domain</TableHead>
                    <TableHead className="font-medium">Programs</TableHead>
                    <TableHead className="font-medium w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collegeData?.map((college: CollegeData) => (
                    <TableRow key={college._id}>
                      <TableCell className="font-medium">
                        {college.collegeName}
                      </TableCell>
                      <TableCell>{college.regulatoryBody}</TableCell>
                      <TableCell>{college.domain}</TableCell>
                      <TableCell>
                        {college.programs?.map((p) => p.name).join(", ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(college)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(college._id!)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
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
  );
}
