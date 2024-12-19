'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from 'sonner'
import { useGetRegulations } from '@/app/hooks/regulations/useGetRegulations'
import { useCreateRegulation } from '@/app/hooks/regulations/useCreateRegulation'
import { useDeleteRegulation } from '@/app/hooks/regulations/useDeleteRegulation'
import { useUpdateRegulation } from '@/app/hooks/regulations/useUpdateRegulation'

interface Regulation {
  _id: string
  regulation_category: string
  regulation_type: string
  year_validation: number
}

const formSchema = z.object({
  regulation_category: z.string().min(1, 'Category is required'),
  regulation_type: z.string().min(1, 'Type is required'),
  year_validation: z.number().int().min(1900).max(2100)
})

export default function Component() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: regulations, isLoading } = useGetRegulations()
  const { mutate: createRegulation } = useCreateRegulation()
  const { mutate: updateRegulation } = useUpdateRegulation()
  const { mutate: deleteRegulation } = useDeleteRegulation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regulation_category: '',
      regulation_type: '',
      year_validation: new Date().getFullYear()
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingId) {
      updateRegulation({ id: editingId, data }, {
        onSuccess: () => {
          toast.success('Regulation updated successfully')
          setEditingId(null)
          setIsDialogOpen(false)
        },
        onError: () => toast.error('Failed to update regulation')
      })
    } else {
      createRegulation(data, {
        onSuccess: () => {
          toast.success('Regulation created successfully')
          setIsDialogOpen(false)
        },
        onError: () => toast.error('Failed to create regulation')
      })
    }
    form.reset()
  }

  const handleEdit = (regulation: Regulation) => {
    setEditingId(regulation._id)
    form.reset({
      regulation_category: regulation.regulation_category,
      regulation_type: regulation.regulation_type,
      year_validation: regulation.year_validation
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteRegulation(id, {
      onSuccess: () => toast.success('Regulation deleted successfully'),
      onError: () => toast.error('Failed to delete regulation')
    })
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4">
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
            <CardTitle className="text-2xl font-bold mb-4 sm:mb-0 text-primary">Regulations</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingId(null);
                    form.reset();
                  }}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Regulation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Regulation' : 'Create New Regulation'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="regulation_category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regulation Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter category" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="regulation_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regulation Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year_validation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Validation</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Enter a year between 1900 and 2100</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      {editingId ? 'Update' : 'Create'} Regulation
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full border rounded-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regulations?.map((regulation: Regulation) => (
                    <TableRow key={regulation._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableCell>{regulation.regulation_category}</TableCell>
                      <TableCell>{regulation.regulation_type}</TableCell>
                      <TableCell>{regulation.year_validation}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(regulation)}
                          className="mr-2 border-gray-300 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(regulation._id)}
                          className="border-gray-300 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="h-4 w-4" />
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