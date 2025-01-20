"use client";
import { Key, useState } from "react";
import { Pencil, Trash2, FileUp, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreatePdf } from "@/app/hooks/pdfUploads/useCreatePdfUpload";
import { useGetAllPdfs } from "@/app/hooks/pdfUploads/useGetAllPdfs";
import { useUpdatePdf } from "@/app/hooks/pdfUploads/useUpdatePdf";
import { useDeletePdf } from "@/app/hooks/pdfUploads/useDeletePdf";
import { useDownloadPdf } from "@/app/hooks/pdfUploads/useDownloadPdf";
import { useGetRegulations } from "@/app/hooks/regulations/useGetRegulations";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

type PDFUpload = {
  id: number;
  academicYear: {
    year: string;
    semester: string;
  };
  regulation: string;
  course: string;
  subject: string;
  files: File[];
  uploadDate: string;
  units?: string; // Add this
};

export default function PDFUploadPage() {
  const { toast } = useToast();
  const [newUpload, setNewUpload] = useState<
    Omit<PDFUpload, "id" | "files" | "uploadDate">
  >({
    academicYear: { year: "", semester: "" },
    regulation: "",
    course: "",
    subject: "",
    units: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesters = ["1st Semester", "2nd Semester"];
  // const regulations = ["R24", "R20", "R19", "R16", "R13"];

  const { data: pdfUploads, isLoading, isError, error } = useGetAllPdfs();
  const createPdfMutation = useCreatePdf();
  const updatePdfMutation = useUpdatePdf();
  const deletePdfMutation = useDeletePdf();
  const { downloadPdf, isDownloading } = useDownloadPdf();
  const { data: regulations } = useGetRegulations();

  const handleNew = () => {
    setNewUpload({
      academicYear: { year: "", semester: "" },
      regulation: "",
      course: "",
      subject: "",
    });
    setSelectedFiles([]);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleAdd = async () => {
    try {
      // Validate form fields
      if (
        !newUpload.academicYear.year ||
        !newUpload.academicYear.semester ||
        !newUpload.regulation ||
        !newUpload.course ||
        !newUpload.subject
      ) {
        toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
        return;
      }

      // Validate files
      if (selectedFiles.length === 0) {
        toast({ title: "Error", description: "Please select at least one PDF", variant: "destructive" });
        return;
      }

      const formData = new FormData();

      // Append metadata as JSON string
      formData.append(
        "metadata",
        JSON.stringify({
          academicYear: newUpload.academicYear,
          regulation: newUpload.regulation,
          course: newUpload.course,
          subject: newUpload.subject,
          units: newUpload.units, // Add this line
        })
      );

      // Append all files with the same field name 'files'
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Submit the form using a mutation or API call
      await createPdfMutation.mutateAsync(formData);

      toast({ title: "Success", description: "PDF uploaded successfully", variant: "default" });

      // Reset form after successful upload
      setIsDialogOpen(false);
      setNewUpload({
        academicYear: { year: "", semester: "" },
        regulation: "",
        course: "",
        subject: "",
        units: "", // Add this line
      });
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Error uploading PDFs:", error);
      toast({ title: "Error", description: error.message || "Failed to upload PDF", variant: "destructive" });
    }
  };

  const handleEdit = (id: number) => {
    const pdfToEdit = pdfUploads?.find((pdf) => pdf.id === id);
    if (pdfToEdit) {
      setNewUpload({
        academicYear: {
          year: pdfToEdit.academicYear.year,
          semester: pdfToEdit.academicYear.semester,
        },
        regulation: pdfToEdit.regulation,
        course: pdfToEdit.course,
        subject: pdfToEdit.subject,
        units: pdfToEdit.units,
      });
      setEditingId(id);
      setSelectedFiles([]);
      setIsDialogOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;

    try {
      const updatedPdf = {
        id: editingId,
        ...newUpload,
        files: selectedFiles,
      };

      await updatePdfMutation.mutateAsync(updatedPdf);
      toast({ title: 'Success', description: 'Updated Pdf Successfully', variant: 'default' });

      setIsDialogOpen(false);
      setEditingId(null);
      setNewUpload({
        academicYear: { year: "", semester: "" },
        regulation: "",
        course: "",
        subject: "",
        units: "",
      });
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Error updating PDF:", error);
      toast({ title: 'Error', description: error.message || 'Failed to update PDF', variant: 'destructive' });
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;

    try {
      await deletePdfMutation.mutateAsync(deletingId);
      toast({ title: 'Success', description: 'PDF deleted successfully', variant: 'default' });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting PDF:", error);
      toast({ title: 'Error', description: error.message || 'Failed to delete PDF', variant : 'destructive' });
    }
  };

  const handleDownload = async (id: any, fileName: any) => {
    try {
      await downloadPdf(id, fileName);
      toast({  title: 'Success', description: 'PDF downloaded successfully', variant: 'default' });
    } catch (error:any) {
      console.error("Error downloading PDF:", error);
      toast({ title: 'Error', description: error.message || 'Failed to download PDF', variant: 'destructive' });
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <Toaster />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">
              PDF Upload Manager
            </h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Organize and manage PDF uploads across different academic years,
              courses, and subjects
            </p>
          </div>
          <Button
            onClick={handleNew}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <FileUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload New PDF</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>

        {/* Main Content Card */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] font-semibold">
                    Year
                  </TableHead>
                  <TableHead className="w-[140px] font-semibold">
                    Semester
                  </TableHead>
                  <TableHead className="w-[120px] hidden sm:table-cell font-semibold">
                    Regulation
                  </TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">
                    Course
                  </TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="w-[100px] hidden lg:table-cell font-semibold">
                    Files
                  </TableHead>
                  <TableHead className="w-[140px] text-center font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdfUploads?.map((upload: any) => (
                  <TableRow key={upload.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {upload.academicYear.year}
                    </TableCell>
                    <TableCell>{upload.academicYear.semester}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {upload.regulation}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {upload.course}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {upload.subject}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {upload.files.length} file(s)
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(upload.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4 text-green-500" />
                          <span className="sr-only text-green-500">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirmation(upload.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only text-red-500">Delete</span>
                        </Button>
                        {upload.files.map((file:any, index:any) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDownload(upload.id, file.fileName)
                            }
                            disabled={isDownloading}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Download className="h-4 w-4 text-blue-500" />
                            <span className="sr-only text-blue-500">
                              Download file {index + 1}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!pdfUploads || pdfUploads.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No PDFs uploaded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Upload/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingId ? "Edit PDF Upload" : "Upload New PDF"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modify the existing PDF details"
                  : "Add new PDFs to the collection"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Year and Semester Group */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Academic Year</Label>
                    <Select
                      value={newUpload.academicYear?.year || ""}
                      onValueChange={(value) =>
                        setNewUpload({
                          ...newUpload,
                          academicYear: {
                            ...newUpload.academicYear,
                            year: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years?.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={newUpload.academicYear?.semester || ""}
                      onValueChange={(value) =>
                        setNewUpload({
                          ...newUpload,
                          academicYear: {
                            ...newUpload.academicYear,
                            semester: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters?.map((semester) => (
                          <SelectItem key={semester} value={semester}>
                            {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Course and Subject Group */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regulation">Regulation</Label>
                    <Select
                      value={newUpload.regulation || ""}
                      onValueChange={(value) =>
                        setNewUpload({ ...newUpload, regulation: value })
                      }
                    >
                      <SelectTrigger id="regulation">
                        <SelectValue placeholder="Select regulation" />
                      </SelectTrigger>
                      <SelectContent>
                        {regulations?.map((regulation: any) => (
                          <SelectItem
                            key={regulation._id}
                            value={regulation.regulation_type}
                          >
                            {regulation.regulation_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      value={newUpload.course || ""}
                      onChange={(e) =>
                        setNewUpload({ ...newUpload, course: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Subject and Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newUpload.subject || ""}
                    onChange={(e) =>
                      setNewUpload({ ...newUpload, subject: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units</Label>
                  <Select
                    value={newUpload.units || ""}
                    onValueChange={(value) =>
                      setNewUpload({ ...newUpload, units: value })
                    }
                  >
                    <SelectTrigger id="units">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st unit">Unit 1</SelectItem>
                      <SelectItem value="2nd unit">Unit 2</SelectItem>
                      <SelectItem value="3rd unit">Unit 3</SelectItem>
                      <SelectItem value="4th unit">Unit 4</SelectItem>
                      <SelectItem value="5th unit">Unit 5</SelectItem>
                      <SelectItem value="6th unit">Unit 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="files">PDF Files</Label>
                  <Input
                    id="files"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="cursor-pointer"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      const invalidFiles = newFiles.filter(
                        (file) => file.type !== "application/pdf"
                      );
                      if (invalidFiles.length > 0) {
                        toast({ title: "Error", description: "Only PDF files are allowed", variant: "destructive" });
                        e.target.value = "";
                        return;
                      }
                      setSelectedFiles((prevFiles) => [
                        ...prevFiles,
                        ...newFiles,
                      ]);
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files</Label>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <li
                            key={`new-${index}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="truncate mr-2">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedFiles((prevFiles) =>
                                  prevFiles.filter((_, i) => i !== index)
                                )
                              }
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">
                                Remove {file.name}
                              </span>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={editingId ? handleUpdate : handleAdd}
                className="w-full sm:w-auto"
                disabled={
                  createPdfMutation.isPending ||
                  updatePdfMutation.isPending ||
                  (!editingId && selectedFiles.length === 0)
                }
              >
                {createPdfMutation.isPending || updatePdfMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>
                    {editingId
                      ? `Update PDF${
                          selectedFiles.length > 0
                            ? ` and Upload ${selectedFiles.length} New File${
                                selectedFiles.length !== 1 ? "s" : ""
                              }`
                            : ""
                        }`
                      : `Upload ${selectedFiles.length} PDF${
                          selectedFiles.length !== 1 ? "s" : ""
                        }`}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this PDF? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletePdfMutation.isPending}
              >
                {deletePdfMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
