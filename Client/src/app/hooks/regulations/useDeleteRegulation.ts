import { BASE_URL } from '@/app/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const deleteRegulation = async (id: string) => {
 
  const response = await fetch(`${BASE_URL}/api/regulations/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete regulation')
}

export function useDeleteRegulation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRegulation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] })
    }
  })
}