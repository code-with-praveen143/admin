"use client";
import { useState } from "react";
import { Pencil, Trash2, FileUp, Download, Calendar, Loader2 } from "lucide-react";
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
import { useGetAllPreviousPapers } from "@/app/hooks/previousPapers/useGetAllPreviousPapers";
import { useUpdatePreviousPaper } from "@/app/hooks/previousPapers/useUpdatePreviousPaper";
import { useDeletePreviousPaper } from "@/app/hooks/previousPapers/useDeletePreviousPaper";
import { useGetRegulations } from "@/app/hooks/regulations/useGetRegulations";
import { useCreatePreviousPaper } from "@/app/hooks/previousPapers/useCreatePreviousPapers";
import { useDownloadPreviousPaper } from "@/app/hooks/previousPapers/useDownloadPreviousPapers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

type PreviousPaperUpload = {
  id: number;
  academicYear: {
    year: string;
    semester: string;
  };
  regulation: string;
  course: string;
  subject: string;
  examDate: {
    year: number;
    month: number;
  };
  files: File[];
  uploadDate: string;
};

export default function PreviousPaperUploadPage() {
  const { toast } = useToast();
  const [newUpload, setNewUpload] = useState<
    Omit<PreviousPaperUpload, "id" | "files" | "uploadDate">
  >({
    academicYear: { year: "", semester: "" },
    regulation: "",
    course: "",
    subject: "",
    examDate: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesters = ["1st Semester", "2nd Semester"];

  const {
    data: previousPapers,
    isLoading,
    isError,
    error,
  } = useGetAllPreviousPapers();
  const createPreviousPaperMutation = useCreatePreviousPaper();
  const updatePreviousPaperMutation = useUpdatePreviousPaper();
  const deletePreviousPaperMutation = useDeletePreviousPaper();
  const { downloadPreviousPaper, isDownloading } = useDownloadPreviousPaper();
  const { data: regulations } = useGetRegulations();

  const handleNew = () => {
    setNewUpload({
      academicYear: { year: "", semester: "" },
      regulation: "",
      course: "",
      subject: "",
      examDate: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
    });
    setSelectedFiles([]);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const handleAdd = async () => {
    try {
      if (
        !newUpload.academicYear.year ||
        !newUpload.academicYear.semester ||
        !newUpload.regulation ||
        !newUpload.course ||
        !newUpload.subject ||
        !selectedDate
      ) {
        toast({ title: "Error", description: "All fields are required", variant: "destructive" });
        return;
      }

      if (selectedFiles.length === 0) {
        toast({ title: "Error", description: "Please select at least one PDF file", variant: "destructive" });
        return;
      }

      const formData = new FormData();

      formData.append(
        "metadata",
        JSON.stringify({
          academicYear: newUpload.academicYear,
          regulation: newUpload.regulation,
          course: newUpload.course,
          subject: newUpload.subject,
          examDate: {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1,
          },
        })
      );

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      await createPreviousPaperMutation.mutateAsync(formData);

      toast({ title: "Success", description: "Previous papers uploaded successfully", variant: "default" });

      setIsDialogOpen(false);
      setNewUpload({
        academicYear: { year: "", semester: "" },
        regulation: "",
        course: "",
        subject: "",
        examDate: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        },
      });
      setSelectedFiles([]);
      setSelectedDate(new Date());
    } catch (error: any) {
      console.error("Error uploading previous papers:", error);
      toast({ title: "Error", description: error.message || "Failed to upload previous papers", variant: "destructive" });
    }
  };

  const handleEdit = (id: number) => {
    const paperToEdit = previousPapers?.find((paper: any) => paper.id === id);
    if (paperToEdit) {
      setNewUpload({
        academicYear: {
          year: paperToEdit.academicYear.year,
          semester: paperToEdit.academicYear.semester,
        },
        regulation: paperToEdit.regulation,
        course: paperToEdit.course,
        subject: paperToEdit.subject,
        examDate: paperToEdit.examDate,
      });
      setEditingId(id);
      setSelectedDate(
        new Date(paperToEdit.examDate.year, paperToEdit.examDate.month - 1)
      );
      setSelectedFiles([]);
      setIsDialogOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;

    try {
      if (
        !newUpload.academicYear.year ||
        !newUpload.academicYear.semester ||
        !newUpload.regulation ||
        !newUpload.course ||
        !newUpload.subject ||
        !selectedDate
      ) {
        toast({ title: "Error", description: "All fields are required", variant: "destructive" });

        return;
      }

      const formData = new FormData();

      formData.append(
        "metadata",
        JSON.stringify({
          academicYear: newUpload.academicYear,
          regulation: newUpload.regulation,
          course: newUpload.course,
          subject: newUpload.subject,
          examDate: {
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth() + 1,
          },
        })
      );

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      await updatePreviousPaperMutation.mutateAsync({
        id: editingId,
        formData,
      });

      toast({ title: "Success", description: "Previous paper updated successfully", variant: "default" });

      setIsDialogOpen(false);
      setEditingId(null);
      setNewUpload({
        academicYear: { year: "", semester: "" },
        regulation: "",
        course: "",
        subject: "",
        examDate: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        },
      });
      setSelectedFiles([]);
      setSelectedDate(new Date());
    } catch (error: any) {
      console.error("Error updating previous paper:", error);
      toast({ title: "Error", description: "Failed to update previous paper", variant: "destructive" });
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;

    try {
      await deletePreviousPaperMutation.mutateAsync(deletingId);
      toast({ title: "Success", description: "Previous paper deleted successfully", variant: "default" });

      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting previous paper:", error);
      toast({ title: "Error", description: "Error deleting previous paper", variant: "destructive" });

    }
  };

  const handleDownload = async (id: number, fileIndex: number) => {
    try {
      await downloadPreviousPaper(id, fileIndex);
      toast({ title: "Success", description: "Previous paper downloaded successfully", variant: "default" });

    } catch (error: any) {
      console.error("Error downloading previous paper:", error);
      toast({ title: "Error", description: "Failed to download previous paper", variant: "destructive" });

    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <Toaster />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl text-green-600 font-bold tracking-tight md:text-3xl">Previous Paper Upload Manager</h2>
            <p className="text-sm text-muted-foreground md:text-base">
              Organize and manage previous paper uploads across different academic years, courses, and subjects
            </p>
          </div>
          <Button
            onClick={handleNew}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <FileUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload New Previous Paper</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>
  
        {/* Main Content Card */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] font-semibold">Year</TableHead>
                  <TableHead className="w-[140px] font-semibold">Semester</TableHead>
                  <TableHead className="w-[120px] hidden sm:table-cell font-semibold">Regulation</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">Course</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="w-[120px] font-semibold">Exam Date</TableHead>
                  <TableHead className="w-[100px] hidden lg:table-cell font-semibold">Files</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousPapers?.map((upload: any) => (
                  <TableRow key={upload.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{upload.academicYear.year}</TableCell>
                    <TableCell>{upload.academicYear.semester}</TableCell>
                    <TableCell className="hidden sm:table-cell">{upload.regulation}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {upload.course}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{upload.subject}</TableCell>
                    <TableCell>{`${upload.examDate.month}/${upload.examDate.year}`}</TableCell>
                    <TableCell className="hidden lg:table-cell">{upload.files.length} file(s)</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(upload.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirmation(upload.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        {upload.files?.map((file: any, index: number) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(upload.id, index)}
                            disabled={isDownloading}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Download className="h-4 w-4 text-blue-500" />
                            <span className="sr-only">Download file {index + 1}</span>
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!previousPapers || previousPapers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No previous papers uploaded yet
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
                {editingId ? "Edit Previous Paper" : "Upload New Previous Paper"}
              </DialogTitle>
              <DialogDescription>
                {editingId ? "Modify the existing previous paper details" : "Add new previous papers to the collection"}
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
                          academicYear: { ...newUpload.academicYear, year: value },
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
                          academicYear: { ...newUpload.academicYear, semester: value },
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
  
                {/* Course and Regulation Group */}
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
  
              {/* Subject and Exam Date */}
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
                  <Label htmlFor="examDate">Exam Date</Label>
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: any) => setSelectedDate(date)}
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      className="w-full p-2 rounded-md border border-input bg-transparent text-sm"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
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
                      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
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
                              <span className="sr-only">Remove {file.name}</span>
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
                  createPreviousPaperMutation.isPending ||
                  updatePreviousPaperMutation.isPending ||
                  (!editingId && selectedFiles.length === 0)
                }
              >
                {createPreviousPaperMutation.isPending || updatePreviousPaperMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <FileUp className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>
                    {editingId
                      ? `Update Previous Paper${
                          selectedFiles.length > 0
                            ? ` and Upload ${selectedFiles.length} New File${
                                selectedFiles.length !== 1 ? "s" : ""
                              }`
                            : ""
                        }`
                      : `Upload ${selectedFiles.length} Previous Paper${
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
                Are you sure you want to delete this previous paper? This action cannot be undone.
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
                disabled={deletePreviousPaperMutation.isPending}
              >
                {deletePreviousPaperMutation.isPending ? (
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
