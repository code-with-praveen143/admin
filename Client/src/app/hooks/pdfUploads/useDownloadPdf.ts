import { BASE_URL } from "@/app/utils/constants";
import { useState } from "react";

export function useDownloadPdf() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async (id:any, fileName:any) => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/pdfs/download/${id}/${fileName}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Get the file name from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let downloadedFileName = "download.pdf";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          downloadedFileName = fileNameMatch[1];
        }
      }

      // Trigger the download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = downloadedFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadPdf, isDownloading };
}
