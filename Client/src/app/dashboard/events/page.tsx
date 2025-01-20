"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Upload, Plus, Loader2, Share2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetStudents,
  useRegisterStudentForEvent,
} from "@/app/hooks/students/useGetStudents";
import { BASE_URL } from "@/app/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, MapPin, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useDeleteEvent,
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  createEventFormData,
  EventTime,
  Event,
  EventAddress,
} from "@/app/hooks/events/EvenetManagement";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

interface EventFormValues {
  title: string;
  collegeName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  modeOfEvent: "online" | "offline" | "hybrid";
  eventSpeaker: string;
}

const EventCard = ({
  event,
  onEdit,
  onDelete,
  onRegister,
  onClick,
}: {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onRegister: (eventId: string) => void;
  onClick: () => void;
}) => {
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent.mutateAsync(event._id);
        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
          variant: "default",
        });
        onDelete(event._id);
      } catch (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Error",
          description: "Failed to delete the event. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getImageUrl = (thumbnail: string | undefined) => {
    if (!thumbnail) return "/logo2.png";
    const cleanPath = thumbnail
      .replace(/\\/g, "/")
      .replace(/^uploads\/|^v1\/uploads\//, "");
    return `${BASE_URL}/uploads/${cleanPath}`;
  };

  return (
    <Card
      className="group h-full transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <Toaster />
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={getImageUrl(event.thumbnail)}
          alt={event.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold leading-none tracking-tight truncate">
              {event.title}
            </h3>
            <p className="text-sm text-pretty text-muted-foreground">
              {event.collegeName}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{event.time.startTime}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin
              className="mr-2 h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                const address = `${event.address.street}, ${event.address.city}, ${event.address.state}, ${event.address.zip}`;
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address
                )}`;
                window.open(googleMapsUrl, "_blank");
              }}
            />
            <span className="truncate">
              {event.address.street}, {event.address.city}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="mr-2 h-4 w-4 rounded-full bg-background flex items-center justify-center">
              <span className="text-[10px]">👤</span>
            </div>
            <span className="truncate">{event.eventSpeaker}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              event.modeOfEvent === "offline" && "bg-blue-100 text-blue-800",
              event.modeOfEvent === "online" && "bg-green-100 text-green-800",
              event.modeOfEvent === "hybrid" && "bg-purple-100 text-purple-800"
            )}
          >
            {event.modeOfEvent.charAt(0).toUpperCase() +
              event.modeOfEvent.slice(1)}
          </span>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRegister(event._id);
            }}
          >
            Register Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EventManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();
  const { data: events, isLoading, error } = useEvents();
  const { data: students = [], isLoading: isLoadingStudents } =
    useGetStudents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const registerStudentMutation = useRegisterStudentForEvent();
  const router = useRouter();

  const form = useForm<EventFormValues>({
    defaultValues: {
      title: selectedEvent?.title || "",
      collegeName: selectedEvent?.collegeName || "",
      street: selectedEvent?.address.street || "",
      city: selectedEvent?.address.city || "",
      state: selectedEvent?.address.state || "",
      zip: selectedEvent?.address.zip || "",
      startDate: selectedEvent?.time.startDate
        ? format(new Date(selectedEvent.time.startDate), "yyyy-MM-dd")
        : "",
      startTime: selectedEvent?.time.startTime || "",
      endDate: selectedEvent?.time.endDate
        ? format(new Date(selectedEvent.time.endDate), "yyyy-MM-dd")
        : "",
      endTime: selectedEvent?.time.endTime || "",
      modeOfEvent: selectedEvent?.modeOfEvent || "offline",
      eventSpeaker: selectedEvent?.eventSpeaker || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: EventFormValues) => {
    try {
      const formData = createEventFormData(
        {
          title: data.title,
          collegeName: data.collegeName,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
          },
          time: {
            startDate: new Date(data.startDate),
            startTime: data.startTime,
            endDate: new Date(data.endDate),
            endTime: data.endTime,
          },
          modeOfEvent: data.modeOfEvent,
          eventSpeaker: data.eventSpeaker,
        },
        thumbnail || undefined
      );

      if (selectedEvent) {
        await updateEvent.mutateAsync({
          id: selectedEvent._id,
          formData,
        });
        toast({
          title: "Event Updated",
          description: "The event has been successfully updated.",
          variant: "default",
        });
      } else {
        if (!thumbnail) {
          throw new Error("Thumbnail is required for new events");
        }
        await createEvent.mutateAsync(formData);
        toast({
          title: "Event Created",
          description: "The event has been successfully created.",
          variant: "default",
        });
      }

      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
    setThumbnail(null);
    setPreviewUrl("");
    form.reset();
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setPreviewUrl(event.thumbnail);
    form.reset({
      title: event.title,
      collegeName: event.collegeName,
      street: event.address.street,
      city: event.address.city,
      state: event.address.state,
      zip: event.address.zip,
      startDate: format(new Date(event.time.startDate), "yyyy-MM-dd"),
      startTime: event.time.startTime,
      endDate: format(new Date(event.time.endDate), "yyyy-MM-dd"),
      endTime: event.time.endTime,
      modeOfEvent: event.modeOfEvent,
      eventSpeaker: event.eventSpeaker,
    });
    setIsDialogOpen(true);
  };

  const handleRegisterClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsStudentDialogOpen(true);
  };

  const handleStudentSelect = async (studentId: string) => {
    if (selectedEventId) {
      try {
        await registerStudentMutation.mutateAsync({
          userId: studentId,
          eventId: selectedEventId,
        });
        setIsStudentDialogOpen(false);
        toast({
          title: "Registration Successful",
          description:
            "The student has been successfully registered for the event.",
          variant: "default",
        });
        // Optionally, show a success message or update the UI
      } catch (error) {
        console.error("Error registering student for event:", error);
        toast({
          title: "Error",
          description: "Failed to register the student. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/events/${eventId}`);
  };

  if (isLoading || isLoadingStudents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto px-4 py-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Event Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and manage event information
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              {/* Keep existing dialog content */}
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
                {/* Keep existing dialog header and content */}
                <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
                  <DialogTitle>
                    {selectedEvent ? "Edit Event" : "Create New Event"}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-8rem)] px-6 py-4">
                  {/* Keep existing form content */}
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Basic Information
                          </h3>
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter event title"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="collegeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>College Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter college name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Location Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Location</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Street address"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="City" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="State" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="zip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ZIP code" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Date and Time</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="startTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="endTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Event Details</h3>
                          <FormField
                            control={form.control}
                            name="modeOfEvent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mode of Event</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select mode of event" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="online">
                                      Online
                                    </SelectItem>
                                    <SelectItem value="offline">
                                      Offline
                                    </SelectItem>
                                    <SelectItem value="hybrid">
                                      Hybrid
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="eventSpeaker"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Event Speaker</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter speaker name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <FormLabel>Event Thumbnail</FormLabel>
                            <div className="mt-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </div>
                            {previewUrl && (
                              <div className="mt-2">
                                <Image
                                  src={previewUrl}
                                  alt="Preview"
                                  width={32}
                                  height={32}
                                  className="h-32 w-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className=" py-4 mt-6 border-t flex justify-end">
                        <Button
                          type="submit"
                          disabled={
                            createEvent.isPending || updateEvent.isPending
                          }
                          className="w-auto"
                        >
                          {createEvent.isPending || updateEvent.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {selectedEvent ? "Updating..." : "Creating..."}
                            </>
                          ) : selectedEvent ? (
                            "Update Event"
                          ) : (
                            "Create Event"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {events?.length === 0 ? (
            <div className="flex items-center justify-center col-span-full">
              <p className="text-muted-foreground">
                No events found. Click on the button above to create a new event.
              </p>
            </div>
          ) : (
            events?.map((event: Event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={(id) => console.log("Delete event:", id)}
                onRegister={handleRegisterClick}
                onClick={() => handleEventClick(event._id)}
              />
            ))
          )}
        </div>

        {/* Student Selection Dialog - Keep position fixed */}
        <Dialog
          open={isStudentDialogOpen}
          onOpenChange={setIsStudentDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select a Student to Register</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                {students?.map((student) => (
                  <Button
                    key={student.id}
                    variant="ghost"
                    className="w-full justify-start text-left mb-2"
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    {student.username}
                  </Button>
                ))}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading State */}
        {(isLoading || isLoadingStudents) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
