'use client'

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ChevronRight, Moon, Sun, Send, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BASE_URL } from "@/app/utils/constants"
import { ChatHistory, ChatResponse, Message } from "@/app/@types/chat"

export default function Chatbot() {
  const [step, setStep] = useState<'initial' | 'chat'>('initial')
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [subject, setSubject] = useState('')
  const [unit, setUnit] = useState('')
  const [chatId, setChatId] = useState('')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [regulation, setRegulation] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [userId, setUserId] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user_id = sessionStorage.getItem('user_id')
    if (user_id) {
      setUserId(user_id)
      fetchChatHistory(chatId)
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChatHistory = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/chat/${chatId}/history`);
      if (response.ok) {
        const data: ChatHistory = await response.json();
        setMessages(data.messages); 
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleStartChat = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
          semester,
          subject,
          units: unit,
          userId,
          regulation,
        }),
      })

      if (!response.ok) throw new Error('Failed to start chat')

      const data: ChatResponse = await response.json()
      setChatId(data.chatId)
      setStep('chat')
      fetchChatHistory(chatId)
    } catch (error) {
      console.error('Error starting chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    try {
      setLoading(true)
      setMessages(prev => [...prev, {
        role: 'user',
        content: question,
        subjectDetails: {
          year,
          semester,
          subject
        }
      }])

      const response = await fetch(`${BASE_URL}/api/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          question,
        }),
      })

      if (!response.ok) throw new Error('Failed to get answer')

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'system',
        content: data.response,
        subjectDetails: {
          year,
          semester,
          subject
        }
      }])
      fetchChatHistory(chatId)  
      setQuestion('')
    } catch (error) {
      console.error('Error asking question:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "flex flex-col h-screen",
      darkMode ? "dark bg-gray-900 text-white" : "bg-white"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-10 border-b p-4 flex justify-between items-center",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <h1 className="text-lg font-semibold">Chatbot</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            onClick={() => setStep('initial')}
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "hidden md:flex w-64 border-r p-4 flex-col",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        )}>
          <Button
            onClick={() => setStep('initial')}
            className="mb-4 w-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          <ScrollArea className="flex-grow">
            {messages.map((message, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start mb-1 text-left truncate"
                onClick={() => {
                  setChatId(chatId);
                  setMessages(messages);
                  setStep('chat');
                }}
              >
                {message.content}
              </Button>
            ))}
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4">
            {step === 'initial' ? (
              <div className="space-y-4 max-w-md mx-auto">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Semester">1st Semester</SelectItem>
                    <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JAVA">JAVA</SelectItem>
                    <SelectItem value="PYTHON">PYTHON</SelectItem>
                    <SelectItem value="JAVASCRIPT">JAVASCRIPT</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st unit">1st Unit</SelectItem>
                    <SelectItem value="2nd unit">2nd Unit</SelectItem>
                    <SelectItem value="3rd unit">3rd Unit</SelectItem>
                    <SelectItem value="4th unit">4th Unit</SelectItem>
                    <SelectItem value="5th unit">5th Unit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={regulation} onValueChange={setRegulation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Regulation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R20">R20</SelectItem>
                    <SelectItem value="R19">R19</SelectItem>
                    <SelectItem value="R18">R18</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleStartChat}
                  disabled={loading || !year || !semester || !subject || !unit || !regulation}
                >
                  {loading ? 'Starting...' : 'Start Chat'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg max-w-[80%]",
                      message.role === 'user'
                        ? "bg-blue-600 text-white ml-auto"
                        : darkMode
                          ? "bg-gray-700 mr-auto"
                          : "bg-gray-100 mr-auto"
                    )}
                  >
                    {message.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          {step === 'chat' && (
            <form onSubmit={handleAskQuestion} className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow"
                />
                <Button type="submit" size="icon" disabled={loading || !question.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

