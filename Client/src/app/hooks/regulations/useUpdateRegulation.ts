import { BASE_URL } from '@/app/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'

const formSchema = z.object({
  regulation_category: z.string().min(1, 'Category is required'),
  regulation_type: z.string().min(1, 'Type is required'),
  year_validation: z.number().int().min(1900).max(2100)
})

const updateRegulation = async ({ id, data }: { id: string, data: z.infer<typeof formSchema> }) => {
  const response = await fetch(`${BASE_URL}/api/regulations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update regulation')
  return response.json()
}

export function useUpdateRegulation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRegulation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] })
    }
  })
}