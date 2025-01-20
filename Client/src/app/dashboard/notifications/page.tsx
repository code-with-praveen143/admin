"use client";

import { Bell, Trash2, Upload, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/app/context/notifcation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { useCreateNotification } from "@/app/hooks/notification/useCreateNotification";
import { useGetNotifications } from "@/app/hooks/notification/useGetNotifications";
import { useDeleteNotification } from "@/app/hooks/notification/useDeleteNotification";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
export default function NotificationsPage() {
  const { toast } = useToast();
  const { data: notifications, isLoading } = useGetNotifications();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createNotification = useCreateNotification();
  const deleteNotification = useDeleteNotification();
  const { theme, setTheme } = useTheme();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNotification.mutateAsync({ title, description });
      toast({ title: "Success", description: "Notification created successfully", variant: "default" });
      setOpen(false);
      setTitle("");
      setDescription("");
    } catch {
      toast({ title: "Error", description: "Failed to create notification", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      toast({ title: "Success", description: "Notification deleted successfully", variant: "default" });
    } catch {
      toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
    }
  };

  const getNotificationIcon = (type: "info" | "success" | "warning") => {
    switch (type) {
      case "success":
        return <Upload className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <Toaster />
    <Card
       className={cn(
         "w-full shadow-lg rounded-lg",
         theme === "dark" ? "dark bg-black text-white" : "bg-white"
       )}
     >
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <CardTitle className="text-2xl font-bold text-primary ">
              Notifications
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                {notifications?.length} New
              </Badge>
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border border-primary text-primary">
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-medium">Create Notification</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Enter details to create a new notification.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-gray-700 sm:text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="sm:col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-gray-700 sm:text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="sm:col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createNotification.isPending}
                      className="bg-primary text-white"
                    >
                      {createNotification.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="text-gray-700">
            Manage your system notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications?.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-lg font-medium text-gray-700">No notifications</p>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications?.map((notification: any) => (
                <div
                  key={notification._id}
                  className="flex items-center justify-between   p-4 rounded-md shadow-sm   transition"
                >
                  <div>
                    <h3 className="text-lg font-medium">{notification.title}</h3>
                    <p className="text-sm ">{notification.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
