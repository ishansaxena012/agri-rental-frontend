"use client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Bot, User, Sparkles, Tractor } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";

interface RecommendedEquipment {
  id: string;
  name: string;
  reason: string;
}

interface AIResponse {
  answer: string;
  recommended_equipment: RecommendedEquipment[];
  is_farming_related: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: RecommendedEquipment[];
  timestamp: Date;
}

const SUGGESTIONS = [
  "What equipment do I need for wheat harvesting?",
  "Best tractor for 5 acres of land?",
  "How much does irrigation equipment cost to rent?",
  "Equipment for paddy farming season?",
];

export default function AIPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hello! I'm your AgriRent AI assistant. Ask me anything about farm equipment — I'll suggest the best options for your needs. 🌾",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Backend expects { message } — matches ai.validation.js
      const res = await api.post<{ success: boolean; data: AIResponse }>(
        "/ai/equipment-suggestions",
        { message: content.trim() }
      );

      const data = res.data.data;

      // ✅ Backend returns { answer, recommended_equipment[] }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          recommendations: data.recommended_equipment?.length
            ? data.recommended_equipment
            : undefined,
          timestamp: new Date(),
        },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "AI is unavailable. Try again later.";

      toast.error(msg);

      // ✅ Show the error as assistant message (e.g. non-farming query rejection)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: msg,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="flex flex-col h-[calc(100dvh-5rem)]">
          {/* Header */}
          <div className="px-5 pt-12 pb-4 border-b border-earth-100 bg-cream">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage-500 rounded-2xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-bark">AgriAI</h1>
                <p className="text-earth-400 text-xs">Powered by Gemini</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sage-400 rounded-full animate-pulse" />
                <span className="text-xs text-sage-600 font-medium">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                } animate-slide-up`}
              >
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-sage-100" : "bg-clay-100"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={16} className="text-sage-600" />
                  ) : (
                    <User size={16} className="text-clay-600" />
                  )}
                </div>

                <div
                  className={`max-w-[78%] flex flex-col gap-2 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Message bubble */}
                  <div
                    className={`px-4 py-3 rounded-3xl text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-white text-bark shadow-soft rounded-tl-sm"
                        : "bg-sage-500 text-white rounded-tr-sm"
                    }`}
                  >
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* ✅ Render recommended equipment cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full space-y-2">
                      <p className="text-xs text-earth-400 font-medium px-1">
                        Recommended equipment:
                      </p>
                      {msg.recommendations.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => router.push(`/listing/${rec.id}`)}
                          className="w-full text-left bg-sage-50 border border-sage-200 rounded-2xl px-4 py-3 hover:bg-sage-100 active:scale-[0.98] transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-sage-200 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              <Tractor size={14} className="text-sage-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-bark text-sm truncate">
                                {rec.name}
                              </p>
                              <p className="text-earth-500 text-xs mt-0.5 leading-snug">
                                {rec.reason}
                              </p>
                            </div>
                            <span className="text-sage-600 text-xs font-medium shrink-0">
                              View →
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-earth-400 px-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-2xl bg-sage-100 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-sage-600" />
                </div>
                <div className="bg-white px-4 py-3 rounded-3xl rounded-tl-sm shadow-soft">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-earth-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions — only on first load */}
            {messages.length === 1 && !loading && (
              <div className="space-y-2 mt-4">
                <p className="text-xs text-earth-400 font-medium px-1">
                  Try asking:
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left bg-white border border-earth-200 rounded-2xl px-4 py-3 text-sm text-earth-600 hover:border-sage-300 hover:text-sage-700 transition active:scale-[0.98]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-3 border-t border-earth-100 bg-cream">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about farming equipment..."
                rows={1}
                className="flex-1 px-4 py-3 bg-white border border-earth-200 rounded-2xl text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-sage-300 transition resize-none text-sm leading-snug max-h-32 overflow-y-auto"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-11 h-11 bg-sage-500 rounded-2xl flex items-center justify-center shrink-0 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sage-600"
              >
                <Send size={16} className="text-white translate-x-0.5" />
              </button>
            </div>
            <p className="text-center text-xs text-earth-300 mt-2">
              Only farming-related questions are supported
            </p>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}