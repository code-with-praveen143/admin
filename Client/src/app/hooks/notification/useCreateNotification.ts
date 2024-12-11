import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BASE_URL } from '@/app/utils/constants';

interface CreateNotificationData {
  title: string
  description: string
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()
  const token = sessionStorage.getItem("auth_token");

  return useMutation({
    mutationFn: async (data: CreateNotificationData) => {
      const response = await fetch(`${BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create notification')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

