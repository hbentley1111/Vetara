import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackToDashboard } from "@/components/BackToDashboard";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  Sparkles,
  Stethoscope,
  PawPrint,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

const suggestedQuestions = [
  { label: "Dog Vaccinations", prompt: "What vaccinations does my puppy need in the first year?" },
  { label: "Cat Dental Care", prompt: "How do I care for my cat's teeth and prevent dental disease?" },
  { label: "Pet Nutrition", prompt: "What should I look for in a high-quality dog food?" },
  { label: "Flea Prevention", prompt: "What's the best approach to flea and tick prevention for my pets?" },
  { label: "Senior Pet Care", prompt: "My dog is getting older. What health changes should I watch for?" },
  { label: "Pet Allergies", prompt: "My cat keeps scratching. Could it be allergies? What should I do?" },
];

function formatMarkdown(text: string): string {
  let html = text
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.*$)/gm, '<h4 class="text-sm font-semibold text-slate-200 mt-3 mb-1">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 class="text-base font-semibold text-slate-200 mt-3 mb-1">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 class="text-lg font-bold text-slate-100 mt-3 mb-1">$1</h2>')
    .replace(/^[\-\*] (.*$)/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-slate-300">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return html;
}

export default function MedicalSearch() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [streamingContent, scrollToBottom]);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: activeConversation, isLoading: conversationLoading } = useQuery<Conversation>({
    queryKey: ["/api/conversations", activeConversationId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${activeConversationId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!activeConversationId,
  });

  useEffect(() => {
    if (activeConversation?.messages?.length) {
      scrollToBottom();
    }
  }, [activeConversation, scrollToBottom]);

  const createConversation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/conversations", { title });
      return res.json();
    },
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(data.id);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
  });

  const sendMessage = async (content: string, conversationId: number) => {
    setIsStreaming(true);
    setStreamingContent("");

    const now = new Date().toISOString();
    const userMsg: Message = { id: Date.now(), conversationId, role: "user", content, createdAt: now };

    queryClient.setQueryData<Conversation>(
      ["/api/conversations", conversationId],
      (old) => ({
        id: conversationId,
        title: old?.title || content.slice(0, 40),
        createdAt: old?.createdAt || now,
        messages: [...(old?.messages || []), userMsg],
      })
    );

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.done) {
                  break;
                }
                if (data.content) {
                  accumulated += data.content;
                  setStreamingContent(accumulated);
                }
                if (data.error) {
                  console.error("Stream error:", data.error);
                }
              } catch {}
            }
          }
        }
      }

      const assistantMsg: Message = { id: Date.now() + 1, conversationId, role: "assistant", content: accumulated, createdAt: new Date().toISOString() };

      queryClient.setQueryData<Conversation>(
        ["/api/conversations", conversationId],
        (old) => ({
          id: conversationId,
          title: old?.title || content.slice(0, 40),
          createdAt: old?.createdAt || now,
          messages: [...(old?.messages || []), assistantMsg],
        })
      );

      setIsStreaming(false);
      setStreamingContent("");

      await queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = inputMessage.trim();
    if (!content || isStreaming) return;
    setInputMessage("");

    if (!activeConversationId) {
      const title = content.length > 40 ? content.slice(0, 40) + "..." : content;
      const res = await apiRequest("POST", "/api/conversations", { title });
      const conv: Conversation = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(conv.id);
      await sendMessage(content, conv.id);
    } else {
      await sendMessage(content, activeConversationId);
    }
  };

  const handleSuggestion = async (prompt: string) => {
    setInputMessage("");
    const title = prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt;
    const res = await apiRequest("POST", "/api/conversations", { title });
    const conv: Conversation = await res.json();
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    setActiveConversationId(conv.id);
    await sendMessage(prompt, conv.id);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950">
        <h1 className="text-2xl font-bold mb-4 text-slate-100">Please log in to access the AI Vet Assistant</h1>
        <Button onClick={() => window.location.href = "/api/login"} className="bg-gradient-to-r from-cyan-500 to-blue-500">Log In</Button>
      </div>
    );
  }

  const messages = activeConversation?.messages || [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative flex flex-col h-screen">
        <Navigation />

        <div className="flex flex-1 overflow-hidden">
          <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all duration-300 bg-slate-900/80 border-r border-slate-800 flex flex-col overflow-hidden`}>
            <div className="p-3 border-b border-slate-800">
              <Button
                onClick={() => {
                  setActiveConversationId(null);
                  inputRef.current?.focus();
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> New Chat
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation.mutate(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-4">No conversations yet</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-800 border border-slate-700 rounded-r-md p-1 text-slate-400 hover:text-slate-200 transition-colors"
            style={{ left: sidebarOpen ? "288px" : "0px" }}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-900/50">
              <BackToDashboard />
              <div className="h-4 w-px bg-slate-700 mx-1"></div>
              <Stethoscope className="h-5 w-5 text-cyan-400" />
              <h1 className="text-lg font-semibold text-slate-100">AI Vet Health Assistant</h1>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs ml-2">
                <Sparkles className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              {!activeConversationId && messages.length === 0 && !isStreaming ? (
                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                      <PawPrint className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100">Vetara Health AI Assistant</h2>
                    <p className="text-slate-400 max-w-md">
                      Ask me anything about your pet's health, nutrition, vaccinations, behavior, or wellness. I'm here to help!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => handleSuggestion(q.prompt)}
                        disabled={isStreaming}
                        className="text-left p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-sm group"
                      >
                        <span className="text-cyan-400 font-medium group-hover:text-cyan-300">{q.label}</span>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2">{q.prompt}</p>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 text-center max-w-sm">
                    This AI assistant provides general pet health information. Always consult a licensed veterinarian for medical advice.
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                            : "bg-slate-800/80 border border-slate-700 text-slate-200"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div
                            className="text-sm leading-relaxed prose-invert"
                            dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                          />
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isStreaming && streamingContent && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700 text-slate-200">
                        <div
                          className="text-sm leading-relaxed prose-invert"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(streamingContent) }}
                        />
                      </div>
                    </div>
                  )}

                  {isStreaming && !streamingContent && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-3">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3">
                <Input
                  ref={inputRef}
                  placeholder="Ask about your pet's health..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isStreaming}
                  className="flex-1 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isStreaming}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl px-4"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-center text-xs text-slate-600 mt-2">
                AI responses are informational only. Consult a veterinarian for medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}