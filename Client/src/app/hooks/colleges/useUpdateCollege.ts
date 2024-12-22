import { CollegeData } from '@/app/@types/college';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/app/utils/constants';

async function updateCollege({ id, ...updateData }: { id: string } & Partial<CollegeData>) {
  const response = await fetch(`${BASE_URL}/api/colleges/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update college');
  }
  return response.json();
}

export function useUpdateCollege() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
    },
  });
}