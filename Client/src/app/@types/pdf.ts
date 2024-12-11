// File type representing each file in the files array
export interface File {
    fileName: string;
    fileData: Buffer;
}

// Interface for the academic year and semester
export interface AcademicYear {
    year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
    semester: '1st Semester' | '2nd Semester';
}

// Main interface representing the PDF upload model
export interface PdfUpload {
    id: number;
    academicYear: AcademicYear;
    regulation: ''
    course: string;
    subject: string;
    files: File[];
    uploadDate: Date;
    year: string; // Virtual field combining year and semester 
    units: string, // Initialize as empty
}