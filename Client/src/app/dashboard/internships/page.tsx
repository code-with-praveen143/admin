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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl text-primary">
            Internship Management
          </CardTitle>
          <Button
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
        <CardDescription className="text-sm md:text-base text-gray-400">
          Manage internship opportunities and track applicant progress.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Add/Edit Form Section */}
        

        {/* Table Section */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="hidden sm:table-cell">Position</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internships?.map((internship) => (
                <TableRow key={internship.id}>
                  <TableCell className="font-medium">
                    <div>{internship.company}</div>
                    <div className="text-sm text-muted-foreground sm:hidden">
                      {internship.position}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {internship.position}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {internship.description}
                  </TableCell>
                  <TableCell>{internship.applicants.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(internship.id)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4 text-secondary" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(internship.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedInternship(internship)}
                            className="h-8 w-8"
                          >
                            <Users className="h-4 w-4 text-primary" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-lg">
                              Applicants for {selectedInternship?.position}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <h3 className="font-medium text-base mb-3">
                              Current Applicants
                            </h3>
                            <ul className="space-y-2">
                              {selectedInternship?.applicants?.map((applicant, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  {applicant}
                                </li>
                              ))}
                            </ul>
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
  );
}