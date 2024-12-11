import { User } from '@/app/@types/user';
import { BASE_URL } from '@/app/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Function to update user details
async function updateUser(variables: { userId: string; userData: Partial<User> }): Promise<User> {
  const { userId, userData } = variables;
  const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
}

// Custom hook to update a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('User updated successfully:', data);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    },
  });
}
