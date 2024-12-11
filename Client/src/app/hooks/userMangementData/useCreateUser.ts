import { BASE_URL } from "@/app/utils/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
interface User {
    id: string
    username: string
    email: string
    role: "Admin" | "Uploader"
    active: boolean
  }
  
  interface UserFormData extends Omit<User, 'id'> {
    password: string
  }
async function createUser(user: UserFormData): Promise<UserFormData> {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Failed to create user');
    }
    const data = response.json();
    return data;


} 

export function useCreateUser(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: (data) => {
            console.log('User created successfully:', data);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}