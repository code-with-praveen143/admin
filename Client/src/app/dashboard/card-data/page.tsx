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
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Types remain the same
type Card = {
  _id?: string;
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
    <div className="w-full max-w-lg mx-auto">
         <Toaster />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Title</FormLabel>
                <FormControl>
                  <Input {...field} className="text-sm h-8" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="text-sm min-h-[60px] max-h-[100px]"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Image URL</FormLabel>
                <FormControl>
                  <Input {...field} className="text-sm h-8" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowAll"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Allow All</FormLabel>
                  <FormDescription className="text-xs">
                    Check this if the Card is for all colleges
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="specificCollege"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Specific College</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm h-8">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excludeCollege"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Exclude College</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm h-8">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10))
                    }
                    className="text-sm h-8"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            size="sm"
            className="w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
export default function TechUniversityTable() {
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
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
      toast({
        title: "Card Deleted",
        description: "The card has been successfully deleted.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (updatedCard: CardInput) => {
    try {
      if (editingCard) {
        const result = await updateCardMutation.mutateAsync({
          id: editingCard._id!,
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
        toast({
          title: "Card Updated",
          description: "The card has been successfully updated.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the card. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Card Added",
        description: "The new card has been successfully added.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the card. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }
  if (error) {
    toast({
      title: "Error",
      description: "An error occurred while loading the cards.",
      variant: "destructive",
    });
    return <div>An error occurred: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">
         <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl text-primary font-bold">
          Cards Management
        </h2>
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
                      onClick={() => card._id && handleDelete(card._id)}
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
