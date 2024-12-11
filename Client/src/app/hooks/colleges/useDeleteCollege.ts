import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/app/utils/constants";

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

  return useMutation({
    mutationFn: deleteCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
    },
  });
}
