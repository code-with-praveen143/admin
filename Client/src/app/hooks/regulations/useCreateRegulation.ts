import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'
import { BASE_URL } from '@/app/utils/constants'
const formSchema = z.object({
  regulation_category: z.string().min(1, 'Category is required'),
  regulation_type: z.string().min(1, 'Type is required'),
  year_validation: z.number().int().min(1900).max(2100)
})

const createRegulation = async (data: z.infer<typeof formSchema>) => {
  const response = await fetch(`${BASE_URL}/api/regulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create regulation')
  return response.json()
}

export function useCreateRegulation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRegulation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] })
    }
  })
}