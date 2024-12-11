"use client"
import { useState } from 'react';
import { BASE_URL } from '@/app/utils/constants';

export function useDownloadPreviousPaper() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPreviousPaper = async (id: number, fileIndex: number) => {
    setIsDownloading(true);
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${BASE_URL}/api/previous-papers/download/${id}/${fileIndex}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download previous paper');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `previous_paper_${id}_${fileIndex}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadPreviousPaper, isDownloading };
}

