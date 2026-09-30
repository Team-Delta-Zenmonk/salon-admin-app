import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
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
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl text-xs sm:text-sm font-medium transition-all animate-in slide-in-from-bottom-5 fade-in-0 duration-200",
            m.type === "success" &&
              "bg-popover text-foreground border-emerald-500/40 shadow-emerald-500/5",
            m.type === "error" &&
              "bg-popover text-destructive border-destructive/40 shadow-destructive/5",
            m.type === "info" && "bg-popover text-foreground border-border shadow-md"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {m.type === "success" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
            {m.type === "error" && (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            )}
            {m.type === "info" && (
              <Info className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className="truncate">{m.message}</span>
          </div>
          <button
            type="button"
            onClick={() => removeMessage(m.id)}
            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-0.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
