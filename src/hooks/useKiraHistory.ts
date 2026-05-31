import { useState, useCallback } from "react";

export interface HistoryMessage {
  role: "user" | "kira";
  text: string;
  taskType?: string;
}

export interface HistorySession {
  id: string;
  startedAt: string; // ISO
  messages: HistoryMessage[];
  title: string; // первый запрос пользователя
}

const STORAGE_KEY = "kira_history";
const MAX_SESSIONS = 50;

function loadSessions(): HistorySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: HistorySession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {
    // localStorage недоступен
  }
}

export function useKiraHistory() {
  const [sessions, setSessions] = useState<HistorySession[]>(() => loadSessions());

  const saveMessage = useCallback(
    (sessionId: string, message: HistoryMessage) => {
      setSessions((prev) => {
        const existing = prev.find((s) => s.id === sessionId);
        let updated: HistorySession[];

        if (existing) {
          updated = prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message] }
              : s
          );
        } else {
          const newSession: HistorySession = {
            id: sessionId,
            startedAt: new Date().toISOString(),
            title:
              message.role === "user"
                ? message.text.slice(0, 60) + (message.text.length > 60 ? "..." : "")
                : "Новый диалог",
            messages: [message],
          };
          updated = [newSession, ...prev];
        }

        saveSessions(updated);
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessions([]);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      saveSessions(updated);
      return updated;
    });
  }, []);

  return { sessions, saveMessage, clearHistory, deleteSession };
}
