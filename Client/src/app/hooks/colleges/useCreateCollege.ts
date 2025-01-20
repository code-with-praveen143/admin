import { CollegeData } from '@/app/@types/college';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/app/utils/constants';
import { useToast } from "@/components/ui/use-toast";

async function createCollege(newCollege: CollegeData) {
  const response = await fetch(`${BASE_URL}/api/colleges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(newCollege),
  });
  if (!response.ok) {
    throw new Error('Failed to create college');
  }
  return response.json();
}

export function useCreateCollege() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast({
        title: "College Created",
        description: "The college has been added successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the college. Please try again.",
        variant: "destructive",
      });
    },
  });
}
