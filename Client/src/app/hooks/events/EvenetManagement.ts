import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "@/app/utils/constants";

// Types based on your Mongoose schema
export type EventTime = {
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
};

export type EventAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type Event = {
  _id: string;
  title: string;
  collegeName: string;
  address: EventAddress;
  time: EventTime;
  modeOfEvent: "online" | "offline" | "hybrid";
  thumbnail: string;
  eventSpeaker: string;
};

export type EventInput = Omit<Event, "_id">;

// API Functions
async function fetchEvents() {
  const response = await fetch(`${BASE_URL}/api/events`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const data = await response.json();
  return data.data;
}

async function fetchEventById(id: string) {
  const response = await fetch(`${BASE_URL}/api/events/${id}`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }
  const data = await response.json();
  return data.data;
}

async function createEvent(eventData: FormData) {
  const response = await fetch(`${BASE_URL}/api/events`, {
    method: "POST",
    body: eventData, // Using FormData for file upload
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to create event");
  }
  const data = await response.json();
  return data.data;
}

async function updateEvent(id: string, eventData: FormData) {
  const response = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: "PUT",
    body: eventData, // Using FormData for file upload
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to update event");
  }
  const data = await response.json();
  return data.data;
}

async function deleteEvent(id: string) {
  const response = await fetch(`${BASE_URL}/api/events/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete event");
  }
  const data = await response.json();
  return data.data;
}

// React Query Hooks
export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 50000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => fetchEventById(id),
    enabled: !!id, // Only fetch if ID is provided
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: FormData) => createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateEvent(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// Helper function to create FormData from event input
export function createEventFormData(
  event: Partial<EventInput>,
  thumbnail?: File
): FormData {
  const formData = new FormData();

  // Add all event fields to FormData
  if (event.title) formData.append("title", event.title);
  if (event.collegeName) formData.append("collegeName", event.collegeName);

  // Address fields
  if (event.address) {
    formData.append("street", event.address.street);
    formData.append("city", event.address.city);
    formData.append("state", event.address.state);
    formData.append("zip", event.address.zip);
  }

  // Time fields
  if (event.time) {
    formData.append(
      "startDate",
      new Date(event.time.startDate).toISOString().split("T")[0]
    );
    formData.append("startTime", event.time.startTime);
    formData.append(
      "endDate",
      new Date(event.time.endDate).toISOString().split("T")[0]
    );
    formData.append("endTime", event.time.endTime);
  }

  if (event.modeOfEvent) formData.append("modeOfEvent", event.modeOfEvent);
  if (event.eventSpeaker) formData.append("eventSpeaker", event.eventSpeaker);

  // Add thumbnail if provided
  if (thumbnail) formData.append("thumbnail", thumbnail);

  return formData;
}
