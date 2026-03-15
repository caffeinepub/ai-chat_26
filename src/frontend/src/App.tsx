import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAddMessage,
  useCreateSession,
  useGetMessages,
  useGetSessions,
} from "@/hooks/useQueries";
import {
  Bot,
  Globe,
  MapPin,
  Menu,
  Plus,
  Send,
  Sparkles,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "./backend.d";

const CANNED_RESPONSES = [
  "That's a fascinating question! I've processed a vast amount of information on this topic — here's what I know: every idea has layers, and yours is worth exploring deeply. Keep asking.",
  "Interesting perspective! Let me think about that for a moment... The truth is, this touches on something many people wonder about. The answer might surprise you.",
  "I love that question. Here's what I know: knowledge is recursive — the more you understand, the more you realize how much there is to discover. Let's dig in.",
  "Great question! The short answer is: it depends. The long answer is far more interesting. Context shapes everything, and your curiosity is already leading you somewhere worth going.",
  "Ah, you've touched on something I find genuinely captivating. Here's my take: the best questions don't always have clean answers — they open doors to better questions.",
  "That's exactly the kind of thing I enjoy exploring. At its core, this is about understanding the tension between what we know and what we assume we know.",
];

const SUGGESTIONS = [
  {
    icon: Zap,
    title: "Explain quantum computing",
    sub: "In simple, everyday terms",
  },
  {
    icon: Wand2,
    title: "Write a poem about the sea",
    sub: "Something evocative and vivid",
  },
  {
    icon: MapPin,
    title: "Help me plan a trip to Japan",
    sub: "Best spots for first-time visitors",
  },
  {
    icon: Globe,
    title: "Tell me a fun science fact",
    sub: "Something mind-blowing",
  },
];

let responseIndex = 0;
function getNextResponse() {
  const r = CANNED_RESPONSES[responseIndex % CANNED_RESPONSES.length];
  responseIndex++;
  return r;
}

interface LocalMessage {
  role: string;
  content: string;
  timestamp: bigint;
}

// Scroll helper outside component to avoid deps issues
function scrollEl(el: HTMLDivElement | null) {
  el?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const [activeSessionId, setActiveSessionId] = useState<bigint | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: sessions = [] } = useGetSessions();
  const { data: remoteMessages = [] } = useGetMessages(activeSessionId);
  const createSession = useCreateSession();
  const addMessage = useAddMessage();

  // Sync remote messages when session changes
  useEffect(() => {
    if (remoteMessages.length > 0) {
      setLocalMessages(
        remoteMessages.map((m: Message) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
      );
      setTimeout(() => scrollEl(bottomRef.current), 50);
    } else if (activeSessionId !== null) {
      setLocalMessages([]);
    }
  }, [remoteMessages, activeSessionId]);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? inputValue).trim();
      if (!content || isTyping) return;

      setInputValue("");

      // Optimistically add user message
      const userMsg: LocalMessage = {
        role: "user",
        content,
        timestamp: BigInt(Date.now()),
      };
      setLocalMessages((prev) => [...prev, userMsg]);
      setTimeout(() => scrollEl(bottomRef.current), 50);

      // Create session if needed
      let sessionId = activeSessionId;
      if (sessionId === null) {
        const title = content.slice(0, 30);
        sessionId = await createSession.mutateAsync(title);
        setActiveSessionId(sessionId);
      }

      // Persist user message
      addMessage.mutate({ sessionId, role: "user", content });

      // Show typing indicator
      setIsTyping(true);
      setTimeout(() => scrollEl(bottomRef.current), 50);
      const delay = 1000 + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
      setIsTyping(false);

      // Generate and add assistant response
      const assistantContent = getNextResponse();
      const assistantMsg: LocalMessage = {
        role: "assistant",
        content: assistantContent,
        timestamp: BigInt(Date.now()),
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);
      setTimeout(() => scrollEl(bottomRef.current), 50);
      addMessage.mutate({
        sessionId,
        role: "assistant",
        content: assistantContent,
      });
    },
    [inputValue, isTyping, activeSessionId, createSession, addMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setLocalMessages([]);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const handleSessionClick = (id: bigint) => {
    setActiveSessionId(id);
    setLocalMessages([]);
    setSidebarOpen(false);
  };

  const handleSuggestion = (title: string) => {
    handleSend(title);
  };

  const showEmpty = activeSessionId === null && localMessages.length === 0;

  return (
    <div className="flex h-full bg-background font-body overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={[
          "fixed lg:relative z-30 lg:z-auto",
          "h-full w-72 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-sidebar-foreground tracking-tight">
              AskAI
            </span>
          </div>
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <Button
            data-ocid="sidebar.new_chat_button"
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all font-medium"
            variant="ghost"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Session list */}
        <ScrollArea className="flex-1 px-3 pb-3">
          {sessions.length === 0 ? (
            <div
              data-ocid="sidebar.empty_state"
              className="text-center py-8 text-muted-foreground text-sm"
            >
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session, i) => (
                <button
                  type="button"
                  key={session.id.toString()}
                  data-ocid={`sidebar.item.${i + 1}`}
                  onClick={() => handleSessionClick(session.id)}
                  className={[
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    activeSessionId === session.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70",
                  ].join(" ")}
                >
                  <span className="block truncate">{session.title}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <button
            type="button"
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shadow-glow">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight text-foreground">
              AskAI
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium border border-primary/20">
              Beta
            </span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
            {activeSessionId
              ? sessions.find((s) => s.id === activeSessionId)?.title
              : "New conversation"}
          </div>
        </header>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {showEmpty ? (
                <motion.div
                  key="empty"
                  data-ocid="chat.empty_state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center pt-12 pb-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-6 shadow-glow">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    What's on your mind?
                  </h2>
                  <p className="text-muted-foreground text-sm mb-10 max-w-sm">
                    Ask me anything — I'm here to think alongside you.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        type="button"
                        key={s.title}
                        data-ocid={`chat.suggestion.item.${i + 1}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        onClick={() => handleSuggestion(s.title)}
                        className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-card/80 text-left transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <s.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {s.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.sub}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {localMessages.map((msg, i) => (
                    <motion.div
                      key={`${msg.timestamp}-${i}`}
                      data-ocid={`chat.message.item.${i + 1}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={[
                        "flex gap-3",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row",
                      ].join(" ")}
                    >
                      {/* Avatar */}
                      <div
                        className={[
                          "w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm",
                          msg.role === "user"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={[
                          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary/20 text-foreground border border-primary/25 rounded-tr-sm"
                            : "bg-card text-foreground border border-border rounded-tl-sm",
                        ].join(" ")}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      data-ocid="chat.loading_state"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                        <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                        <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                        <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 py-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-primary/40 focus-within:shadow-glow transition-all">
              <textarea
                ref={inputRef}
                data-ocid="chat.input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-h-[24px] max-h-[160px] leading-6"
                style={{
                  height: "auto",
                  overflow:
                    inputValue.split("\n").length > 5 ? "auto" : "hidden",
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                }}
              />
              <Button
                data-ocid="chat.send_button"
                size="icon"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="shrink-0 w-8 h-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground/50 mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
