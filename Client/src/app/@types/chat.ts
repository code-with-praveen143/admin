export type ChatResponse = {
  chatId: string;
  subject: string;
  regulation: string;
  userId: string;
};

export interface Message {
  role: "user" | "system";
  content: string;
  subjectDetails: {
    year: string;
    semester: string;
    subject: string;
  };
  _id?: string;
}

export interface ChatHistory {
  chatId: string;
  messages: Message[];
}
