import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, AlertCircle } from "lucide-react";
import io, { Socket } from "socket.io-client";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useAppSelector } from "../../../store/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import apiClient from "../../../api/axios";

interface ChatMessage {
  id?: number;
  eventId: number;
  senderEmail: string;
  senderName: string;
  messageContent: string;
  timestamp?: string;
}

interface ChatDialogProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ eventId, eventName, isOpen, onOpenChange }: ChatDialogProps) {
  const { accessToken, email: currentUserEmail } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !accessToken) return;

    // Fetch history
    setIsLoadingHistory(true);
    apiClient.get<ChatMessage[]>(`/events/${eventId}/chat/history`)
      .then(res => {
        setMessages(res.data);
      })
      .catch(err => {
        console.error("Failed to load chat history", err);
        setError("Could not load previous messages.");
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });

    // We connect to the event-service socketio server (running on 9092)
    // Assuming backend runs on localhost:9092 for local dev, need a robust way if deploying.
    const newSocket = io("http://localhost:9092", {
      query: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setError(null);
      newSocket.emit("join_room", { eventId });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connect error", err);
      setError("Failed to connect to chat server.");
    });

    newSocket.on("receive_message", (message: ChatMessage) => {
      setMessages((prev) => {
        // Handle optimistic update replacements
        if (message.senderEmail === currentUserEmail) {
          const index = prev.findIndex(
            (m) => m.senderEmail === currentUserEmail && 
                   m.messageContent === message.messageContent && 
                   (!m.id || m.id < 0)
          );
          if (index !== -1) {
             const newMessages = [...prev];
             newMessages[index] = message;
             return newMessages;
          }
        }
        
        // Deduplicate real messages by ID just in case
        if (message.id && prev.some((m) => m.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [eventId, accessToken, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: -Math.floor(Math.random() * 1000000), // temp ID
      eventId,
      senderEmail: currentUserEmail || "",
      senderName: currentUserEmail?.split("@")[0] || "Me",
      messageContent: newMessage.trim(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    socket.emit("send_message", {
      eventId,
      messageContent: newMessage.trim(),
    });

    setNewMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-brand-300/20 bg-slate-900 shadow-2xl flex flex-col h-[500px]">
        <DialogHeader className="p-4 border-b border-slate-700/50 bg-slate-950/50">
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <span className="truncate">{eventName} Event Chat</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {error && (
            <div className="p-3 text-sm text-rose-300 bg-rose-500/10 rounded-xl flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {isLoadingHistory ? (
            <div className="flex justify-center p-4">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-10">No messages yet. Say hi!</p>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderEmail === currentUserEmail;
              return (
                <div key={msg.id || idx} className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
                  {!isMe && (
                    <span className="text-xs text-slate-400 mb-1 ml-1">{msg.senderName}</span>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? "bg-brand-600 text-white rounded-tr-sm" 
                        : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.messageContent}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/80 border-t border-slate-700/50 flex gap-2">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-900 border-slate-700 text-white rounded-xl focus:border-brand-500"
            disabled={!socket || !!error}
          />
          <Button 
            type="submit" 
            variant="gradient" 
            size="icon" 
            className="rounded-xl shrink-0"
            disabled={!newMessage.trim() || !socket || !!error}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
