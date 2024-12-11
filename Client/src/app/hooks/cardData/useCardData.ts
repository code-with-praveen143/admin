import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/app/utils/constants";
type Card = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  allowAll: boolean;
  specificCollege: string | null;
  excludeCollege: string | null;
  order: number;
};

type CardInput = Omit<Card, "id">;
const API_BASE_URL = `${BASE_URL}/api`;

async function fetchCards() {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function createCard(newCard: CardInput) {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(newCard),
  });
  if (!response.ok) {
    throw new Error("Failed to create card");
  }
  return response.json();
}

// API call to update the card
async function updateCard(id: string, updatedCard: CardInput) {
  const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify({ cardDetails: updatedCard }), // Wrap in `cardDetails`
  });
  if (!response.ok) {
    throw new Error("Failed to update card");
  }
  return response.json();
}
async function deleteCard(id: string) {
  const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete card");
  }
  return response.json();
}

export function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
    staleTime: 50000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

// React Query Mutation Hook
export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Card) => updateCard(id, data),
    onSuccess: () => {
      // Invalidate 'cards' query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}
