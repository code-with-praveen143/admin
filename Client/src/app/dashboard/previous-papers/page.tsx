"use client";
import { useState } from "react";
import { Pencil, Trash2, FileUp, Download, Calendar } from "lucide-react";
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
        toast.error("All fields are required");
        return;
      }

      if (selectedFiles.length === 0) {
        toast.error("Please select at least one PDF file");
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

      toast.success("Previous papers uploaded successfully");

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
      toast.error(error.message || "Failed to upload previous papers");
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
        toast.error("All fields are required");
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

      toast.success("Previous paper updated successfully");

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
      toast.error(error.message || "Failed to update previous paper");
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
      toast.success("Previous paper deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      console.error("Error deleting previous paper:", error);
      toast.error(error.message || "Failed to delete previous paper");
    }
  };

  const handleDownload = async (id: number, fileIndex: number) => {
    try {
      await downloadPreviousPaper(id, fileIndex);
      toast.success("Previous paper downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading previous paper:", error);
      toast.error(error.message || "Failed to download previous paper");
    }
  };

  return (
    <Card className="w-full max-w-[95vw] mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl md:text-2xl lg:text-3xl text-primary">
          Previous Paper Upload Manager
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground">
          Organize and manage previous paper uploads across different academic
          years, courses, and subjects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleNew}
          >
            <FileUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload New Previous Paper</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-primary">
                {editingId
                  ? "Edit Previous Paper Upload"
                  : "Upload New Previous Paper"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingId
                  ? "Modify the existing previous paper details"
                  : "Add new previous papers to the collection"}
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

              {/* Exam Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="examDate"
                  className="text-right text-sm font-medium"
                >
                  Exam Date
                </Label>
                <div className="col-span-3">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: any) => setSelectedDate(date)}
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    className="w-full p-2 border rounded"
                  />
                </div>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                        className="mt-2 text-red-500"
                      >
                        Clear Files
                      </Button>
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
                    createPreviousPaperMutation.isPending ||
                    updatePreviousPaperMutation.isPending ||
                    selectedFiles.length === 0
                  }
                >
                  {createPreviousPaperMutation.isPending ||
                  updatePreviousPaperMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : editingId ? (
                    `Update Previous Paper${
                      selectedFiles.length > 0
                        ? ` and Upload ${selectedFiles.length} New File${
                            selectedFiles.length !== 1 ? "s" : ""
                          }`
                        : ""
                    }`
                  ) : (
                    `Upload ${selectedFiles.length} Previous Paper${
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
                Are you sure you want to delete this previous paper? This action
                cannot be undone.
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
                {deletePreviousPaperMutation.isPending
                  ? "Deleting..."
                  : "Delete"}
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
                  <TableHead className="font-semibold">Exam Date</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Files
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previousPapers?.map((upload: any) => (
                  <TableRow key={upload.id}>
                    <TableCell>{upload.academicYear.year}</TableCell>
                    <TableCell>{upload.academicYear.semester}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {upload.regulation}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {upload.course}
                    </TableCell>
                    <TableCell>{upload.subject}</TableCell>
                    <TableCell>{`${upload.examDate.month}/${upload.examDate.year}`}</TableCell>
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
                      {upload.files?.map((file: any, index: number) => (
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
