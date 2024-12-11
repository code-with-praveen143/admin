"use client"
import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '@/app/utils/constants';

async function fetchPreviousPapers() {
  const token = sessionStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${BASE_URL}/api/previouspapers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch previous papers');
  }

  return response.json();
}

export function useGetAllPreviousPapers() {
  return useQuery({
    queryKey: ['previousPapers'],
    queryFn: fetchPreviousPapers,
    staleTime: 50000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000
  });
}

