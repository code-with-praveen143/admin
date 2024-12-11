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

type PrintOrder = {
  id: number;
  studentName: string;
  documentName: string;
  status: "pending" | "approved" | "rejected";
  deliveryDate: string;
};

export default function PrintStationPage() {
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
  };

  const handleReject = (id: number) => {
    setPrintOrders(
      printOrders?.map((order) =>
        order.id === id ? { ...order, status: "rejected" } : order
      )
    );
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
      setSelectedOrder(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl md:text-2xl lg:text-3xl text-primary">
          Print Station Management
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-gray-500">
          Manage print requests, approve orders, and set delivery dates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Student Name</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Delivery Date
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.studentName}
                  </TableCell>
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
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.deliveryDate || "Not set"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {order.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleApprove(order.id)}
                          >
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleReject(order.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Calendar className="h-4 w-4 text-blue-400" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Set Delivery Date</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="deliveryDate"
                                className="text-right"
                              >
                                Delivery Date
                              </Label>
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
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={handleSetDeliveryDate}
                            className="w-full"
                          >
                            Set Delivery Date
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
