import { BASE_URL } from '@/app/utils/constants';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';


interface FetchUsersResponse {
    success: boolean;
    count: number;
    users: User[];
  }
// Define the expected data type for TypeScript
interface User {
  active: any;
  id: any | null | undefined;
  username: any | null ;
  name: string;
  email: string;
  role: 'Admin' | 'Uploader';
}

async function fetchUsers(): Promise<FetchUsersResponse> { 
  const response = await fetch(`${BASE_URL}/api/users`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json(); // Expected to return an array of users
}

// Custom hook to fetch users with types
export function useGetUsers(options?: UseQueryOptions<FetchUsersResponse, Error>) {
  return useQuery<FetchUsersResponse,  Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 10 * 60 * 1000,   // Data is considered fresh for 10 minutes
    retry: 2,                    // Retry fetching twice on failure
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false,       // Disable refetch on component mount
    select: (data) => data,      // Optionally transform data if needed
    ...options,                  // Spread options to allow external overrides
  });
}
