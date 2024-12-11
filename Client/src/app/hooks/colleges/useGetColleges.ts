import { BASE_URL } from "@/app/utils/constants";
import { useQuery } from "@tanstack/react-query";

async function fetchColleges() {
  const response = await fetch(`${BASE_URL}/api/colleges`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export function useGetColleges() {
  return useQuery({
    queryKey: ["colleges"],
    queryFn: fetchColleges,
    staleTime: 50000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });
}
