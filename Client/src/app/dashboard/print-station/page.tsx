"use client";

import { useState } from "react";
import { Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

type PrintOrder = {
  id: number;
  studentName: string;
  documentName: string;
  status: "pending" | "approved" | "rejected";
  deliveryDate: string;
};

export default function PrintStationPage() {
  const { toast } = useToast();
  const [printOrders, setPrintOrders] = useState<PrintOrder[]>([
    {
      id: 1,
      studentName: "Alice Johnson",
      documentName: "Thesis.pdf",
      status: "pending",
      deliveryDate: "",
    },
    {
      id: 2,
      studentName: "Bob Smith",
      documentName: "Assignment.pdf",
      status: "approved",
      deliveryDate: "2024-03-15",
    },
  ]);
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);

  const handleApprove = (id: number) => {
    setPrintOrders(
      printOrders?.map((order) =>
        order.id === id ? { ...order, status: "approved" } : order
      )
    );
    toast({
      title: "Order Approved",
      description: "The print order has been approved.",
      variant: "default",
    });
  };

  const handleReject = (id: number) => {
    setPrintOrders(
      printOrders?.map((order) =>
        order.id === id ? { ...order, status: "rejected" } : order
      )
    );
    toast({
      title: "Order Rejected",
      description: "The print order has been rejected.",
      variant: "destructive",
    });
  };

  const handleSetDeliveryDate = () => {
    if (selectedOrder) {
      setPrintOrders(
        printOrders?.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, deliveryDate: selectedOrder.deliveryDate }
            : order
        )
      );
      toast({
        title: "Delivery Date Set",
        description: `Delivery date set for ${selectedOrder.studentName}'s order.`,
        variant: "default",
      });
      setSelectedOrder(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <Toaster />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">Print Station Management</h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage print requests, approve orders, and set delivery dates
          </p>
        </div>
  
        {/* Main Content Card */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] font-semibold">Student Name</TableHead>
                  <TableHead className="font-semibold">Document</TableHead>
                  <TableHead className="w-[120px] font-semibold">Status</TableHead>
                  <TableHead className="w-[150px] hidden md:table-cell font-semibold">Delivery Date</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {printOrders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.studentName}</TableCell>
                    <TableCell>{order.documentName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "approved"
                            ? "secondary"
                            : order.status === "rejected"
                            ? "destructive"
                            : "default"
                        }
                        className={cn(
                          "capitalize",
                          order.status === "approved" && "bg-green-100 text-green-800",
                          order.status === "rejected" && "bg-red-100 text-red-800",
                          order.status === "pending" && "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {order.deliveryDate || "Not set"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(order.id)}
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-600"
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(order.id)}
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Calendar className="h-4 w-4" />
                              <span className="sr-only">Set delivery date</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold">Set Delivery Date</DialogTitle>
                              <p className="text-sm text-muted-foreground">
                                Choose a delivery date for {order.studentName}'s {order.documentName}
                              </p>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="deliveryDate">Delivery Date</Label>
                                <Input
                                  id="deliveryDate"
                                  type="date"
                                  value={selectedOrder?.deliveryDate}
                                  onChange={(e) =>
                                    setSelectedOrder((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            deliveryDate: e.target.value,
                                          }
                                        : null
                                    )
                                  }
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedOrder(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSetDeliveryDate}
                                className="bg-primary hover:bg-primary/90"
                              >
                                Save Date
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!printOrders || printOrders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No print orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
  
  
}
