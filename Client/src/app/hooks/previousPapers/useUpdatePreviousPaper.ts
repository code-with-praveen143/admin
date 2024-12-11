"use client"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/app/utils/constants';
import { toast } from 'sonner';

interface UpdatePreviousPaperPayload {
  id: number;
  formData: FormData;
}

async function updatePreviousPaper({ id, formData }: UpdatePreviousPaperPayload) {
  const token = sessionStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${BASE_URL}/api/previous-papers/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update previous paper');
  }

  return response.json();
}

export function useUpdatePreviousPaper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreviousPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['previousPapers'] });
      toast.success('Previous paper updated successfully');
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update previous paper');
    },
  });
}

