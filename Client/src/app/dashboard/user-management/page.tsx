"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUsers } from "@/app/hooks/userMangementData/useGetUsers";
import { useUpdateUser } from "@/app/hooks/userMangementData/useUpdateUser";
import { useDeleteUser } from "@/app/hooks/userMangementData/useDeleteUser";
import { useCreateUser } from "@/app/hooks/userMangementData/useCreateUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "Uploader";
  active: boolean;
}

interface UserFormData {
  id?: string;
  username: string;
  email: string;
  password: any;
  role: "Admin" | "Uploader";
  active: boolean;
}

const defaultUser: UserFormData = {
  username: "",
  email: "",
  password: "",
  role: "Uploader",
  active: true,
};

function UserForm({
  user,
  isEditMode,
  isLoading,
  onSubmit,
  onCancel,
}: {
  user: UserFormData;
  isEditMode: boolean;
  isLoading: boolean;
  onSubmit: (userData: UserFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<UserFormData>(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      {!isEditMode && (
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password || ""}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required={!isEditMode}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: "Admin" | "Uploader") =>
            setFormData({ ...formData, role: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Uploader">Uploader</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Switch
          id="status"
          checked={formData.active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, active: checked })
          }
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isEditMode ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}

export default function Component() {
  const { toast } = useToast();
  const { data: fetchedUsers, isLoading: isLoadingUsers, error: error } = useGetUsers();
  const updateUserMutation = useUpdateUser();
  const createUserMutation = useCreateUser();
  const deleteUserMutation = useDeleteUser();

  const users = fetchedUsers?.users || [];
  const [selectedUser, setSelectedUser] = useState<UserFormData>(defaultUser);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (userId: string) => {
    const userToEdit = users.find((user) => user.id === userId);
    if (userToEdit) {
      setSelectedUser({ ...userToEdit, password: undefined });
      setIsEditMode(true);
      setIsDialogOpen(true);
    }
  };

  const handleUpdate = async (userData: UserFormData) => {
    try {
      if (!isEditMode || !userData.id)
        throw new Error("Invalid edit operation");
      await updateUserMutation.mutateAsync({
        userId: userData.id,
        userData: {
          email: userData.email,
          role: userData.role,
          active: userData.active,
          ...(userData.password ? { password: userData.password } : {}),
        },
      });
      toast({
        title: "User Updated",
        description: "The user has been updated successfully.",
        variant: "default",
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async (userData: UserFormData) => {
    try {
      await createUserMutation.mutateAsync(userData);
      toast({
        title: "User Created",
        description: "The user has been added successfully.",
        variant: "default",
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!userId) return;
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedUser(defaultUser);
    setIsEditMode(false);
  };

  if (isLoadingUsers) {
    toast({
      title: "Loading",
      description: "Fetching user details, please wait...",
      variant: "default",
    });

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });

    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      <div className="container mx-auto">
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">
                User Management
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-gray-400">
                Manage admin and uploader accounts with role-based access
                control.
              </CardDescription>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  onClick={resetForm}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-lg text-secondary">
                    {isEditMode ? "Edit User" : "Add New User"}
                  </DialogTitle>
                </DialogHeader>
                <UserForm
                  user={selectedUser}
                  isEditMode={isEditMode}
                  isLoading={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                  onSubmit={isEditMode ? handleUpdate : handleCreate}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <TableCell>{user.username}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.role}
                      </TableCell>
                      <TableCell>
                        {user.active ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(user.id)}
                          className="mr-2 border-none"
                        >
                          <Pencil className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                          className="border-none"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
