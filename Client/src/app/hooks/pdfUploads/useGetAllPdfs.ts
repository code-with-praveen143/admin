import { useQuery, useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/app/utils/constants";
type PDFUpload = {
  id: number
  academicYear: {
    year: string
    semester: string
  }
  regulation: string
  course: string
  subject: string
  files: { fileName: string }[]
  uploadDate: string,
  units: string, 
}

async function fetchPdfs(year?: string, semester?: string): Promise<PDFUpload[]> {
  const params = new URLSearchParams()
  if (year) params.append('year', year)
  if (semester) params.append('semester', semester)

  const response = await fetch(`${BASE_URL}/api/pdfs?`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });  
    if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export function useGetAllPdfs(year?: string, semester?: string) {
  return useQuery<PDFUpload[], Error>({
    queryKey: ['pdfs', year, semester],
    queryFn: () => fetchPdfs(year, semester),
    staleTime: 50000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  })
}