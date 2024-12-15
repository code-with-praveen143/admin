"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BASE_URL } from "@/app/utils/constants";
import { ChatHistory, ChatResponse, Message } from "@/app/@types/chat";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useGetAllPdfs } from "@/app/hooks/pdfUploads/useGetAllPdfs";
import { useGetRegulations } from "@/app/hooks/regulations/useGetRegulations";

export default function Chatbot() {
  const [step, setStep] = useState<"initial" | "chat">("initial");
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [chatId, setChatId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [regulation, setRegulation] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [userId, setUserId] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  console.log("Chat history", chatHistory);
  // Fetch data using hooks
  const {
    data: pdfUploads,
    isLoading: pdfLoading,
    isError: pdfError,
  } = useGetAllPdfs();
  const { data: regulations } = useGetRegulations();

  useEffect(() => {
    const user_id = sessionStorage.getItem("user_id");
    if (user_id) {
      setUserId(user_id);
      fetchChatHistory(chatId, userId);
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async (chatId: string, userId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/chat/${chatId}/history?userId=${userId}`
      );
      if (response.ok) {
        const data = await response.json();

        // Ensure data is an array of chats
        const chats = Array.isArray(data) ? data : [data];

        const formattedChats = chats.map((chat) => ({
          chatId: chat.chatId,
          createdAt: chat.createdAt,
          messages: chat.messages,
          title: chat.messages[0]?.content || "Untitled Chat", // Use first message content as title
        }));

        setChatHistory(formattedChats);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const fetchUserChats = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/${userId}`);

      if (response.ok) {
        const data = await response.json();

        const formattedChats = data.map((chat: any) => ({
          chatId: chat._id,
          createdAt: chat.createdAt,
          messages: chat.messages,
          title: chat.messages[0]?.content || "Untitled Chat", // First message content as title
        }));

        setChatHistory(formattedChats);
      } else {
        console.error("Failed to fetch user chats:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching user chats:", error);
    }
  };

  useEffect(() => {
    const user_id = sessionStorage.getItem("user_id");
    if (user_id) {
      setUserId(user_id);
      fetchUserChats(user_id); // Fetch all chats for this user
    }
  }, []);

  const handleStartChat = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester,
          regulation,
          year,
          subject,
          units: unit,
          userId,
        }),
      });

      if (!response.ok) {
        toast.error("There is no relevant data.");
      } else {
        const data: ChatResponse = await response.json();
        setChatId(data.chatId);
        setStep("chat");
        fetchChatHistory(data.chatId, data.userId);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    try {
      setLoading(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: question,
          subjectDetails: {
            year,
            semester,
            subject,
          },
        },
        {
          role: "system",
          content: "Thinking...",
          subjectDetails: {
            year,
            semester,
            subject,
          },
        },
      ]);

      const response = await fetch(`${BASE_URL}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          question,
        }),
      });

      if (!response.ok) throw new Error("Failed to get answer");

      const data = await response.json();

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "system",
          content: data.response,
          subjectDetails: {
            year,
            semester,
            subject,
          },
        },
      ]);
      fetchChatHistory(chatId, userId);
      setQuestion("");
    } catch (error) {
      console.error("Error asking question:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "system",
          content:
            "Sorry, I encountered an error while processing your request.",
          subjectDetails: {
            year,
            semester,
            subject,
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Categorize chats
  const categorizeChats = (chats: any) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return [
      {
        title: "Today",
        chats: chats.filter((chat: any) =>
          isSameDay(new Date(chat.createdAt), today)
        ),
      },
      {
        title: "Yesterday",
        chats: chats.filter((chat: any) =>
          isSameDay(new Date(chat.createdAt), yesterday)
        ),
      },
      {
        title: "Previous 7 Days",
        chats: chats.filter(
          (chat: any) =>
            !isSameDay(new Date(chat.createdAt), today) &&
            !isSameDay(new Date(chat.createdAt), yesterday) &&
            isWithinLast7Days(new Date(chat.createdAt))
        ),
      },
    ].filter((category) => category.chats.length > 0); // Remove empty categories
  };

  const isSameDay = (date1: any, date2: any) =>
    date1.toDateString() === date2.toDateString();

  const isWithinLast7Days = (date: any) => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return date > sevenDaysAgo && date <= today;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen",
        theme === "dark" ? "dark bg-gray-900 text-white" : "bg-white"
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-10 border-b p-4 flex justify-between items-center",
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        )}
      >
        <h1 className="text-lg font-semibold">Chatbot</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setStep("initial")}
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "hidden md:flex w-64 border-r p-4 flex-col",
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          )}
        >
          <Button
            onClick={() => setStep("initial")}
            className="mb-4 w-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>

          <ScrollArea className="flex-grow">
            {categorizeChats(chatHistory).map(({ title, chats }) => (
              <div key={title}>
                <h2
                  className={cn(
                    "text-sm font-medium mt-4",
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {title}
                </h2>
                {chats?.map((chat: any) => (
                  <Button
                    key={chat.chatId}
                    variant="ghost"
                    className="w-full justify-start mb-2 text-left truncate"
                    onClick={() => {
                      setChatId(chat.chatId);
                      setMessages(chat.messages);
                      setStep("chat");
                    }}
                  >
                    {chat.title}
                  </Button>
                ))}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4">
            {step === "initial" ? (
              <div className="space-y-4 max-w-md mx-auto">
                {/* Dropdown Selectors */}
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set(pdfUploads?.map((pdf) => pdf.academicYear.year))
                    ).map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set(
                        pdfUploads
                          ?.filter((pdf) => pdf.academicYear.year === year)
                          ?.flatMap((pdf) => pdf.academicYear.semester)
                      )
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set(
                        pdfUploads
                          ?.filter(
                            (pdf) =>
                              pdf.academicYear.year === year &&
                              pdf.academicYear.semester.includes(semester)
                          )
                          ?.map((pdf) => pdf.subject)
                      )
                    ).map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {pdfUploads
                      ?.filter((pdf) => pdf.subject === subject)
                      ?.flatMap((pdf) => pdf.units)
                      .map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select value={regulation} onValueChange={setRegulation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Regulation" />
                  </SelectTrigger>
                  <SelectContent>
                    {regulations?.map((reg: any) => (
                      <SelectItem key={reg._id} value={reg.regulation_type}>
                        {reg.regulation_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleStartChat}
                  disabled={
                    !year ||
                    !semester ||
                    !subject ||
                    !unit ||
                    !regulation ||
                    loading
                  }
                >
                  {loading ? "Starting..." : "Start Chat"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg max-w-[80%]",
                      message.role === "user"
                        ? "bg-blue-600 text-white ml-auto"
                        : theme === "dark"
                        ? "bg-gray-700 mr-auto"
                        : "bg-gray-100 mr-auto"
                    )}
                  >
                    {message.content === "Thinking..." ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {message.content}
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            {/* Input Area */}
            {step === "chat" && (
              <form onSubmit={handleAskQuestion} className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={loading || !question.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
