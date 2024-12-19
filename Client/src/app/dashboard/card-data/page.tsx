"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCards,
  useCreateCard,
  useDeleteCard,
  useUpdateCard,
} from "@/app/hooks/cardData/useCardData";

// Types remain the same
type Card = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  allowAll: boolean;
  specificCollege: string | null;
  excludeCollege: string | null;
  order: number;
};

type CardInput = Omit<Card, "_id">;

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Invalid URL"),
  allowAll: z.boolean(),
  specificCollege: z.string().nullable(),
  excludeCollege: z.string().nullable(),
  order: z.number().int().positive("Order must be a positive integer"),
});

type FormValues = z.infer<typeof formSchema>;

const TechUniversityForm = ({
  initialData,
  onSubmit,
}: {
  initialData?: Card | null;
  onSubmit: (data: FormValues) => void;
}) => {
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      imageUrl: "",
      allowAll: true,
      specificCollege: null,
      excludeCollege: null,
      order: 1,
    },
  });
  const { data: cards, isLoading, error } = useCards();

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const handleSave = async (data: FormValues) => {
    // Not yet implemented
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-1 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Cards Management
                </CardTitle>
                <CardDescription>
                  Manage and organize card information for your platform
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" /> Add Card Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-lg">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg">Add New Card</DialogTitle>
                  </DialogHeader>
                  <TechUniversityForm onSubmit={handleSubmit} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-6">
            <div className="rounded-lg border bg-card">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">
                        Title
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">
                        Allow All
                      </TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">
                        Specific College
                      </TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">
                        Exclude College
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Order
                      </TableHead>
                      <TableHead className="text-xs font-semibold w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards?.map((card: Card) => (
                      <TableRow key={card._id} className="hover:bg-muted/50">
                        <TableCell className="text-xs font-medium">
                          {card.title}
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {card.description}
                        </TableCell>
                        <TableCell className="text-xs">
                          {card.allowAll ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {card.specificCollege || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {card.excludeCollege || "N/A"}
                        </TableCell>
                        <TableCell className="text-xs">{card.order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <Pencil className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <TechUniversityForm
              initialData={editingCard}
              onSubmit={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default function TechUniversityTable() {
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: cards, isLoading, error } = useCards();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();

  const handleEdit = (card: Card) => {
    setEditingCard({ ...card, imageUrl: card.imageUrl || "" });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCardMutation.mutateAsync(id);
      queryClient.setQueryData(["cards"], (oldData: Card[] | undefined) =>
        oldData ? oldData.filter((card) => card._id !== id) : []
      );
    } catch (error) {
      console.error("Error deleting Card:", error);
    }
  };

  const handleSave = async (updatedCard: CardInput) => {
    try {
      if (editingCard) {
        const result = await updateCardMutation.mutateAsync({
          id: editingCard._id,
          ...updatedCard,
        });
        queryClient.setQueryData(["cards"], (oldData: Card[] | undefined) =>
          oldData
            ? oldData?.map((card) =>
                card._id === editingCard._id ? result : card
              )
            : []
        );
        setEditingCard(null);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating Card:", error);
    }
  };

  const handleAdd = async (newCard: CardInput) => {
    try {
      const addedCard = await createCardMutation.mutateAsync({
        title: newCard.title,
        description: newCard.description,
        imageUrl: newCard.imageUrl,
        allowAll: newCard.allowAll,
        specificCollege: newCard.specificCollege,
        excludeCollege: newCard.excludeCollege,
        order: newCard.order,
      });
      queryClient.setQueryData(["cards"], (oldData: Card[] | undefined) =>
        oldData ? [...oldData, addedCard] : [addedCard]
      );
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding Card:", error);
    }
  };

  if (isLoading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl text-primary font-bold">Cards Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Card Data
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-lg">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg">Add New Card</DialogTitle>
            </DialogHeader>
            <TechUniversityForm onSubmit={handleAdd} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs whitespace-nowrap">Title</TableHead>
              <TableHead className="text-xs whitespace-nowrap">
                Description
              </TableHead>
              <TableHead className="text-xs whitespace-nowrap">
                Allow All
              </TableHead>
              <TableHead className="text-xs whitespace-nowrap">
                Specific College
              </TableHead>
              <TableHead className="text-xs whitespace-nowrap">
                Exclude College
              </TableHead>
              <TableHead className="text-xs whitespace-nowrap">Order</TableHead>
              <TableHead className="text-xs whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards?.map((card: Card) => (
              <TableRow key={card._id}>
                <TableCell className="text-xs font-medium">
                  {card.title}
                </TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">
                  {card.description}
                </TableCell>
                <TableCell className="text-xs">
                  {card.allowAll ? "Yes" : "No"}
                </TableCell>
                <TableCell className="text-xs">
                  {card.specificCollege || "N/A"}
                </TableCell>
                <TableCell className="text-xs">
                  {card.excludeCollege || "N/A"}
                </TableCell>
                <TableCell className="text-xs">{card.order}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(card)}
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(card._id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <TechUniversityForm
              initialData={editingCard}
              onSubmit={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
