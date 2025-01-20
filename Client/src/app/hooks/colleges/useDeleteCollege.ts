import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/app/utils/constants";
import { useToast } from "@/components/ui/use-toast";

async function deleteCollege(id: string) {
  const response = await fetch(`${BASE_URL}/api/colleges/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete college");
  }
  return response.json();
}

export function useDeleteCollege() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast({
        title: "College Deleted",
        description: "The college has been deleted successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the college. Please try again.",
        variant: "destructive",
      });
    },
  });
}
