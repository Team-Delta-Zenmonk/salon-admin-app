import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SnackbarMessage {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

type Listener = (msg: SnackbarMessage) => void;
const listeners: Set<Listener> = new Set();

export const showSnackbar = (
  message: string,
  type: "success" | "error" | "info" = "success",
  duration = 3500
) => {
  const id = Math.random().toString(36).substring(2, 9);
  listeners.forEach((l) => l({ id, message, type, duration }));
};

export const SnackbarContainer: React.FC = () => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  useEffect(() => {
    const handleNewMessage = (msg: SnackbarMessage) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }, msg.duration || 3500);
    };

    listeners.add(handleNewMessage);
    return () => {
      listeners.delete(handleNewMessage);
    };
  }, []);

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xl text-xs sm:text-sm font-medium transition-all animate-in slide-in-from-bottom-4 fade-in-0 duration-200 bg-card text-card-foreground border-border",
            m.type === "success" &&
              "border-emerald-500/30 dark:border-emerald-500/40 bg-card text-foreground shadow-emerald-500/5",
            m.type === "error" &&
              "border-destructive/30 bg-card text-foreground shadow-destructive/5",
            m.type === "info" && "border-primary/30 bg-card text-foreground shadow-primary/5"
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {m.type === "success" && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
            {m.type === "error" && (
              <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}
            {m.type === "info" && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <span className="truncate leading-snug font-semibold text-foreground">{m.message}</span>
          </div>
          <button
            type="button"
            onClick={() => removeMessage(m.id)}
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
