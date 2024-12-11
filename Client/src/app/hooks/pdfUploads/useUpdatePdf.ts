import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BASE_URL } from '@/app/utils/constants'

type PDFUpload = {
  id: number
  academicYear: {
    year: string
    semester: string
  }
  regulation: string
  course: string
  subject: string
  files?: File[]
}

async function updatePdf(pdfData: PDFUpload): Promise<PDFUpload> {
  const formData = new FormData()
  formData.append('academicYear.year', pdfData.academicYear.year)
  formData.append('academicYear.semester', pdfData.academicYear.semester)
  formData.append('regulation', pdfData.regulation)
  formData.append('course', pdfData.course)
  formData.append('subject', pdfData.subject)

  if (pdfData.files && pdfData.files.length > 0) {
    pdfData.files.forEach((file) => {
      formData.append('files', file)
    })
  }

  const response = await fetch(`${BASE_URL}/api/pdfs/${pdfData.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update PDF')
  }

  return response.json()
}

export function useUpdatePdf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdfs'] })
    },
  })
}