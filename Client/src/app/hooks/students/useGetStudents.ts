import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BASE_URL } from '@/app/utils/constants';


interface RegistrationPayload {
  userId: string;
  eventId: string;
}

interface RegistrationResponse {
  message: string;
  eventId: string;
  userId: string;
  registeredStudentsCount: number;
}

const API_BASE_URL = `${BASE_URL}/api`;

export type Student = {
  id: string
  username: string
  program: string
  collegeName: string
  printDocuments: string[]
  internshipApplications: string[]
}

export function useGetStudents() {
  return useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
        },
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    },
    staleTime: 50000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  })
}
export function useRegisterStudentForEvent() {
  const queryClient = useQueryClient()

  return useMutation<RegistrationResponse, Error, RegistrationPayload>({
    mutationFn: async ({ userId, eventId }) => {
      const response = await fetch(`${API_BASE_URL}/events/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ userId, eventId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register for event');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.eventId] });
      queryClient.invalidateQueries({ queryKey: ['student', data.userId] });
    },
    onError: (error) => {
      console.error('Registration error:', error);
    }
  });
}
