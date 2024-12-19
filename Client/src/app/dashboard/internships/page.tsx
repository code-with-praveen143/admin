"use client";

import { useState } from "react";
import { Pencil, Trash2, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Internship = {
  id: number;
  company: string;
  position: string;
  description: string;
  applicants: string[];
};

export default function InternshipPage() {
  const [internships, setInternships] = useState<Internship[]>([
    {
      id: 1,
      company: "Tech Corp",
      position: "Software Engineer Intern",
      description: "Develop web applications",
      applicants: ["Alice Johnson", "Bob Smith"],
    },
    {
      id: 2,
      company: "Innovate Inc",
      position: "Data Science Intern",
      description: "Work on machine learning projects",
      applicants: ["Charlie Brown"],
    },
  ]);
  const [newInternship, setNewInternship] = useState<
    Omit<Internship, "id" | "applicants">
  >({ company: "", position: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  const handleAdd = () => {
    setInternships([
      ...internships,
      { ...newInternship, id: Date.now(), applicants: [] },
    ]);
    setNewInternship({ company: "", position: "", description: "" });
  };

  const handleEdit = (id: number) => {
    const internshipToEdit = internships.find((internship) => internship.id === id);
    if (internshipToEdit) {
      setNewInternship({
        company: internshipToEdit.company,
        position: internshipToEdit.position,
        description: internshipToEdit.description,
      });
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    setInternships(
      internships?.map((internship) =>
        internship.id === editingId
          ? { ...internship, ...newInternship }
          : internship
      )
    );
    setNewInternship({ company: "", position: "", description: "" });
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    setInternships(internships.filter((internship) => internship.id !== id));
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Company,Position,Description,Applicants\n" +
      internships
        ?.map(
          (internship) =>
            `${internship.id},${internship.company},${internship.position},${
              internship.description
            },"${internship.applicants.join(", ")}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "internships.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-2">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl text-primary">
            Internship Management
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage internship opportunities and track applicant progress
          </p>
        </div>
  
        {/* Main Content */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="space-y-1 px-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-xl font-semibold">Active Internships</CardTitle>
              <Button 
                onClick={handleExport}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" /> Export Report
              </Button>
            </div>
          </CardHeader>
  
          <CardContent className="px-6">
            {/* Table Section with improved responsive design */}
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px] font-semibold">Company</TableHead>
                      <TableHead className="hidden sm:table-cell font-semibold">Position</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">Description</TableHead>
                      <TableHead className="w-[100px] font-semibold">Applicants</TableHead>
                      <TableHead className="w-[140px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internships?.map((internship) => (
                      <TableRow 
                        key={internship.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div>{internship.company}</div>
                          <div className="text-sm text-muted-foreground sm:hidden">
                            {internship.position}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {internship.position}
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {internship.description}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                            {internship.applicants.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(internship.id)}
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(internship.id)}
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedInternship(internship)}
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                >
                                  <Users className="h-4 w-4" />
                                  <span className="sr-only">View applicants</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-semibold">
                                    Applicants for {selectedInternship?.position}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <h3 className="font-medium text-base mb-3">
                                    Current Applicants
                                  </h3>
                                  {selectedInternship?.applicants.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                      No applicants yet
                                    </p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {selectedInternship?.applicants?.map((applicant, index) => (
                                        <li
                                          key={index}
                                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
                                        >
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                          {applicant}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!internships || internships.length === 0) && (
                      <TableRow>
                        <TableCell 
                          colSpan={5} 
                          className="h-24 text-center text-muted-foreground"
                        >
                          No internships found
                        </TableCell>
                      </TableRow>
                    )}
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