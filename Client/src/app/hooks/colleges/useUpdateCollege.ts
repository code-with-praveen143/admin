import { CollegeData } from '@/app/@types/college';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/app/utils/constants';
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast({
        title: "College Updated",
        description: "The college details have been updated successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the college. Please try again.",
        variant: "destructive",
      });
    },
  });
}
