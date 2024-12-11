import { BASE_URL } from '@/app/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Function to delete user by ID
async function deleteUser(userId: string): Promise<void> {
 
  const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}

// Custom hook to delete a user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
    },
  });
}
