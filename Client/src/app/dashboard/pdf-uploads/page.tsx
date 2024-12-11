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
        toast.error("All fields are required");
        return;
      }

      // Validate files
      if (selectedFiles.length === 0) {
        toast.error("Please select at least one PDF file");
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

      toast.success("PDFs uploaded successfully");

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
      toast.error(error.message || "Failed to upload PDFs");
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
        units: pdfToEdit.unit,
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
      toast.success("PDF updated successfully");

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
      toast.error(error.message || "Failed to update PDF");
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
      toast.success("PDF deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting PDF:", error);
      toast.error(error.message || "Failed to delete PDF");
    }
  };

  const handleDownload = async (id: number, fileIndex: number) => {
    try {
      await downloadPdf(id, fileIndex);
      toast.success("PDF downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast.error(error.message || "Failed to download PDF");
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
    <Card className="w-full max-w-[95vw] mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl md:text-2xl lg:text-3xl text-primary">
          PDF Upload Manager
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground">
          Organize and manage PDF uploads across different academic years,
          courses, and subjects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleNew}
          >
            <FileUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload New PDF</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-primary">
                {editingId ? "Edit PDF Upload" : "Upload New PDF"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingId
                  ? "Modify the existing PDF details"
                  : "Add new PDFs to the collection"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Academic Year */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="year"
                  className="text-right text-sm font-medium"
                >
                  Year
                </Label>
                <Select
                  value={newUpload.academicYear?.year || ""}
                  onValueChange={(value) =>
                    setNewUpload({
                      ...newUpload,
                      academicYear: { ...newUpload.academicYear, year: value },
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
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

              {/* Semester */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="semester"
                  className="text-right text-sm font-medium"
                >
                  Semester
                </Label>
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
                  <SelectTrigger className="col-span-3">
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

              {/* Regulation */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="regulation"
                  className="text-right text-sm font-medium"
                >
                  Regulation
                </Label>
                <Select
                  value={newUpload.regulation || ""}
                  onValueChange={(value) =>
                    setNewUpload({ ...newUpload, regulation: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
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

              {/* Course */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="course"
                  className="text-right text-sm font-medium"
                >
                  Course
                </Label>
                <Input
                  id="course"
                  value={newUpload.course || ""}
                  onChange={(e) =>
                    setNewUpload({ ...newUpload, course: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Subject */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="subject"
                  className="text-right text-sm font-medium"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={newUpload.subject || ""}
                  onChange={(e) =>
                    setNewUpload({ ...newUpload, subject: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Units */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="units"
                  className="text-right text-sm font-medium"
                >
                  Units
                </Label>
                <Select
                  value={newUpload.units || ""}
                  onValueChange={(value) =>
                    setNewUpload({ ...newUpload, units: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st unit">Unit 1</SelectItem>
                    <SelectItem value="2nd unit">Unit 2</SelectItem>
                    <SelectItem value="3rd unit">Unit 3</SelectItem>
                    <SelectItem value="4th unit">Unit 4</SelectItem>
                    <SelectItem value="5th unit">Unit 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Multiple PDF Files Upload */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="files"
                  className="text-right text-sm font-medium"
                >
                  PDF Files
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="files"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      const invalidFiles = newFiles.filter(
                        (file) => file.type !== "application/pdf"
                      );
                      if (invalidFiles.length > 0) {
                        toast.error("Only PDF files are allowed");
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

                  {/* Display Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p>Selected files:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        {editingId &&
                          pdfUploads
                            ?.find((pdf) => pdf.id === editingId)
                            ?.files.map((file, index) => (
                              <li
                                key={`existing-${index}`}
                                className="flex items-center justify-between"
                              >
                                <span>
                                  {file.fileName ||
                                    `Existing File ${index + 1}`}
                                </span>
                                <span className="text-muted-foreground">
                                  (Existing)
                                </span>
                              </li>
                            ))}
                        {selectedFiles.map((file, index) => (
                          <li
                            key={`new-${index}`}
                            className="flex items-center justify-between"
                          >
                            <span>{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedFiles((prevFiles) =>
                                  prevFiles.filter((_, i) => i !== index)
                                )
                              }
                              className="text-red-500"
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                      {selectedFiles.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFiles([])}
                          className="mt-2 text-red-500"
                        >
                          Clear New Files
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <DialogFooter>
                <Button
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={
                    createPdfMutation.isPending ||
                    updatePdfMutation.isPending ||
                    selectedFiles.length === 0
                  }
                >
                  {createPdfMutation.isPending ||
                  updatePdfMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : editingId ? (
                    `Update PDF${
                      selectedFiles.length > 0
                        ? ` and Upload ${selectedFiles.length} New File${
                            selectedFiles.length !== 1 ? "s" : ""
                          }`
                        : ""
                    }`
                  ) : (
                    `Upload ${selectedFiles.length} PDF${
                      selectedFiles.length !== 1 ? "s" : ""
                    }`
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

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
                {deletePdfMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="rounded-md border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Year</TableHead>
                  <TableHead className="font-semibold">Semester</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">
                    Regulation
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    Course
                  </TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Files
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdfUploads?.map((upload: any) => (
                  <TableRow key={upload.id}>
                    <TableCell>{upload.academicYear.year}</TableCell>
                    <TableCell>
                      {upload.academicYear.semester.join(", ")}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {upload.regulation}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {upload.course}
                    </TableCell>
                    <TableCell>{upload.subject}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {upload.files.length} file(s)
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        className="text-green-500"
                        onClick={() => handleEdit(upload.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDeleteConfirmation(upload.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {upload.files.map((file: any, index: any) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="text-blue-500"
                          onClick={() => handleDownload(upload.id, index)}
                          disabled={isDownloading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
