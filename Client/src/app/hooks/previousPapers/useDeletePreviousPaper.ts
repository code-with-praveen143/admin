"use client"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/app/utils/constants';
import { toast } from 'sonner';

async function deletePreviousPaper(id: number) {
  const token = sessionStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${BASE_URL}/api/previous-papers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete previous paper');
  }

  return response.json();
}

export function useDeletePreviousPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePreviousPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['previousPapers'] });
      toast.success('Previous paper deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete previous paper');
    },
  });
}

