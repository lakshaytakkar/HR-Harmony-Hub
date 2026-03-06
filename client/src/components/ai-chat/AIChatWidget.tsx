import { useState, useRef, useCallback, useEffect, useContext, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X, Maximize2, Minimize2, Plus, Send, Square, Trash2,
  MessageSquare, Sparkles, Clock, ChevronRight, Bot,
  Paperclip, Download, FileText, Menu, Pencil, Check,
  Database, Plug, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { VerticalContext } from "@/lib/vertical-store";
import aiIcon from "@assets/ai-chat-icon.png";

const _preload = new Image();
_preload.src = aiIcon;

interface AiConversation {
  id: string;
  title: string;
  vertical_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface AiAttachment {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

const SUGGESTIONS = [
  "Summarize active formations this week",
  "What tasks are overdue right now?",
  "Show me open escalations",
  "What's the compliance status?",
];

interface ActiveIntegration {
  name: string;
  icon: typeof Database;
  status: "connected" | "disconnected";
  description: string;
}

const ACTIVE_INTEGRATIONS: ActiveIntegration[] = [
  { name: "Supabase DB", icon: Database, status: "connected", description: "PostgreSQL — live query access" },
  { name: "OpenAI", icon: Zap, status: "connected", description: "GPT-4o with tool calling" },
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePreview({ attachment }: { attachment: AiAttachment }) {
  const isImage = attachment.mime_type.startsWith("image/");

  if (isImage) {
    return (
      <a
        href={`/api/ai/attachments/${attachment.id}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="block max-w-[200px] rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
        data-testid={`attachment-preview-${attachment.id}`}
      >
        <img
          src={`/api/ai/attachments/${attachment.id}/download`}
          alt={attachment.filename}
          className="w-full h-auto max-h-[160px] object-cover"
        />
        <div className="px-2 py-1 text-[10px] text-muted-foreground truncate bg-muted/50">
          {attachment.filename}
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/api/ai/attachments/${attachment.id}/download`}
      download={attachment.filename}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors max-w-[240px]"
      data-testid={`attachment-file-${attachment.id}`}
    >
      <FileText className="size-4 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{attachment.filename}</p>
        <p className="text-[10px] text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
      </div>
      <Download className="size-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

interface ChatWindowProps {
  conversationId: string;
  initialMessages: AiMessage[];
  verticalId: string;
  isExpanded: boolean;
}

function ChatWindow({
  conversationId,
  initialMessages,
  verticalId,
  isExpanded,
}: ChatWindowProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [input, setInput] = useState("");

  const mappedInitial = initialMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    parts: [{ type: "text" as const, text: m.content }],
  }));

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: { conversationId, verticalId },
      }),
    [conversationId, verticalId]
  );

  const { messages, status, stop, sendMessage } = useChat({
    transport,
    messages: mappedInitial.length > 0 ? mappedInitial : undefined,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const { data: attachments = [] } = useQuery<AiAttachment[]>({
    queryKey: ["/api/ai/conversations", conversationId, "attachments"],
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage({ text });
  }, [input, sendMessage]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInput("");
      sendMessage({ text: suggestion });
    },
    [sendMessage]
  );

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);

      const res = await fetch("/api/ai/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        queryClient.invalidateQueries({
          queryKey: ["/api/ai/conversations", conversationId, "attachments"],
        });
      }
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [conversationId, queryClient]);

  const getMessageText = useCallback((msg: typeof messages[0]) => {
    if (!msg.parts) return "";
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }, []);

  const handleDownloadConversation = useCallback(() => {
    const markdown = messages
      .map((m) => `**${m.role === "user" ? "You" : "TeamSync AI"}:**\n${getMessageText(m)}`)
      .join("\n\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "conversation.md";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className={cn("py-4", isExpanded ? "px-4 sm:px-8 max-w-3xl mx-auto w-full" : "px-4")}>
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2 mx-auto">
                <img src={aiIcon} alt="TeamSync AI" className="w-8 h-8" />
              </div>
              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-base">TeamSync AI</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Your intelligent co-pilot for business operations. Ask me anything.
                </p>
              </div>

              <div className={cn("grid gap-2 w-full mb-4", isExpanded ? "grid-cols-2 max-w-md mx-auto" : "grid-cols-2")}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-left text-xs px-3 py-2.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-colors text-foreground/80 leading-snug whitespace-normal"
                    data-testid={`suggestion-${s.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="w-full">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  <Plug className="size-3" />
                  Active Integrations
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIVE_INTEGRATIONS.map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px]"
                      data-testid={`integration-${integration.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      <integration.icon className="size-3 text-emerald-600" />
                      <span className="text-foreground/70 font-medium">{integration.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            <>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((att) => (
                    <FilePreview key={att.id} attachment={att} />
                  ))}
                </div>
              )}
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.role === "assistant" ? (
                      <MessageResponse>{getMessageText(message)}</MessageResponse>
                    ) : (
                      <span>{getMessageText(message)}</span>
                    )}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer className="text-sm" duration={1.5}>
                      TeamSync AI is thinking…
                    </Shimmer>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {messages.length > 0 && messages.length < 3 && (
        <div className={cn("px-4 pb-2", isExpanded && "px-4 sm:px-8 max-w-3xl mx-auto w-full")}>
          <div className="grid grid-cols-2 gap-1.5">
            {SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="text-left text-[11px] px-2.5 py-2 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-colors text-foreground/80 leading-snug whitespace-normal"
                data-testid={`followup-suggestion-${s.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("border-t p-3", isExpanded && "px-4 sm:px-8 pb-6")}>
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <div className={cn(
            "relative flex items-end gap-2 rounded-xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring px-3 py-2",
            isExpanded && "max-w-3xl mx-auto"
          )}>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.json"
              data-testid="ai-chat-file-input"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              title="Attach file"
              data-testid="ai-chat-attach"
            >
              <Paperclip className={cn("size-3.5", uploadingFile && "animate-spin")} />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TeamSync AI…"
              rows={1}
              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 text-sm min-h-[28px] max-h-32"
              data-testid="ai-chat-input"
            />
            {messages.length > 0 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleDownloadConversation}
                title="Download conversation"
                data-testid="ai-chat-download"
              >
                <Download className="size-3.5" />
              </Button>
            )}
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                data-testid="ai-chat-stop"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input?.trim()}
                className="h-8 w-8 shrink-0 rounded-lg"
                data-testid="ai-chat-send"
              >
                <Send className="size-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const { currentVertical } = useContext(VerticalContext);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery<AiConversation[]>({
    queryKey: ["/api/ai/conversations"],
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const { data: savedMessages = [] } = useQuery<AiMessage[]>({
    queryKey: ["/api/ai/conversations", activeConversationId, "messages"],
    enabled: !!activeConversationId,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verticalId: currentVertical?.id }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json() as Promise<AiConversation>;
    },
    onSuccess: (data) => {
      setActiveConversationId(data.id);
      setChatKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
        setChatKey((k) => k + 1);
      }
    },
  });

  const renameConversationMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to rename conversation");
      return res.json() as Promise<AiConversation>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setEditingId(null);
    },
    onError: () => {
      setEditingId(null);
    },
  });

  const startRenaming = useCallback((conv: AiConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, []);

  const renamePendingRef = useRef(false);
  const submitRename = useCallback(() => {
    if (renamePendingRef.current) return;
    if (!editingId || !editTitle.trim()) {
      setEditingId(null);
      return;
    }
    renamePendingRef.current = true;
    renameConversationMutation.mutate(
      { id: editingId, title: editTitle.trim() },
      { onSettled: () => { renamePendingRef.current = false; } }
    );
  }, [editingId, editTitle, renameConversationMutation]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    if (!activeConversationId) {
      await createConversationMutation.mutateAsync();
    }
  }, [activeConversationId, createConversationMutation]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
  }, []);

  const handleNewChat = useCallback(() => {
    createConversationMutation.mutate();
  }, [createConversationMutation]);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setChatKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isExpanded) setIsExpanded(false);
        else handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExpanded, handleClose]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center focus:outline-none"
            aria-label="Open TeamSync AI"
            data-testid="ai-chat-trigger"
          >
            <div className="relative w-14 h-14">
              <img
                src={aiIcon}
                alt="TeamSync AI"
                className="w-14 h-14 object-contain"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none ai-shimmer" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            key="fullpage"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex bg-background"
          >
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-[280px] flex flex-col border-r bg-muted/30 shrink-0 absolute sm:relative inset-y-0 left-0 z-10"
                >
                  <div className="flex items-center gap-2.5 px-4 py-4 border-b">
                    <img src={aiIcon} alt="" className="w-7 h-7 object-contain shrink-0" />
                    <span className="font-semibold text-sm">TeamSync AI</span>
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 sm:hidden"
                        onClick={() => setSidebarOpen(false)}
                        data-testid="ai-chat-close-sidebar"
                        title="Close sidebar"
                      >
                        <X className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setIsExpanded(false)}
                        data-testid="ai-chat-minimize"
                        title="Compact view"
                      >
                        <Minimize2 className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={handleClose}
                        data-testid="ai-chat-close-expanded"
                        title="Close"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 border-b">
                    <Button
                      className="w-full h-9 gap-2 justify-start text-sm font-medium"
                      onClick={handleNewChat}
                      disabled={createConversationMutation.isPending}
                      data-testid="ai-chat-new"
                    >
                      <Plus className="size-3.5" />
                      New Chat
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-0.5">
                      {conversations.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6 px-3">
                          Your conversations will appear here
                        </p>
                      )}
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={cn(
                            "group flex items-start gap-2 rounded-lg px-2.5 py-2 cursor-pointer text-sm transition-colors",
                            activeConversationId === conv.id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-foreground"
                          )}
                          onClick={() => editingId !== conv.id && handleSelectConversation(conv.id)}
                          data-testid={`ai-conversation-${conv.id}`}
                        >
                          <MessageSquare className="size-3.5 mt-0.5 shrink-0 opacity-60" />
                          <div className="flex-1 min-w-0">
                            {editingId === conv.id ? (
                              <input
                                ref={editInputRef}
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") submitRename();
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                onBlur={submitRename}
                                className="w-full text-xs font-medium bg-background border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
                                data-testid={`ai-rename-input-${conv.id}`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <p className="font-medium truncate leading-tight text-xs">
                                {conv.title}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="size-2.5 opacity-50" />
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeTime(conv.updated_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {editingId === conv.id ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  submitRename();
                                }}
                                data-testid={`ai-rename-save-${conv.id}`}
                              >
                                <Check className="size-3" />
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => startRenaming(conv, e)}
                                  data-testid={`ai-rename-conversation-${conv.id}`}
                                >
                                  <Pencil className="size-2.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConversationMutation.mutate(conv.id);
                                  }}
                                  data-testid={`ai-delete-conversation-${conv.id}`}
                                >
                                  <Trash2 className="size-2.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-3 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="size-3" />
                      <span>Powered by OpenAI</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-[5] sm:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b">
                {!sidebarOpen && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 mr-1"
                    onClick={() => setSidebarOpen(true)}
                    data-testid="ai-chat-open-sidebar"
                    title="Open sidebar"
                  >
                    <Menu className="size-4" />
                  </Button>
                )}
                <Bot className="size-4 text-primary" />
                <span className="font-semibold text-sm truncate">
                  {conversations.find((c) => c.id === activeConversationId)?.title ?? "New Chat"}
                </span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ChevronRight className="size-3.5" />
                  <span className="capitalize hidden sm:inline">{currentVertical?.id ?? "all"}</span>
                </div>
              </div>

              {activeConversationId && (
                <ChatWindow
                  key={`expanded-${activeConversationId}-${chatKey}`}
                  conversationId={activeConversationId}
                  initialMessages={savedMessages}
                  verticalId={currentVertical?.id ?? ""}
                  isExpanded
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isExpanded && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10"
              onClick={handleClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col bg-background border-l shadow-2xl"
            >
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b shrink-0">
                <img src={aiIcon} alt="" className="w-7 h-7 object-contain shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-none">TeamSync AI</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                    {currentVertical?.id ?? "All verticals"} assistant
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setIsExpanded(true)}
                    data-testid="ai-chat-expand"
                    title="Expand to full screen"
                  >
                    <Maximize2 className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleNewChat}
                    data-testid="ai-chat-new-drawer"
                    title="New chat"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={handleClose}
                    data-testid="ai-chat-close"
                    title="Close"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {activeConversationId ? (
                  <ChatWindow
                    key={`drawer-${activeConversationId}-${chatKey}`}
                    conversationId={activeConversationId}
                    initialMessages={savedMessages}
                    verticalId={currentVertical?.id ?? ""}
                    isExpanded={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Shimmer className="text-sm text-muted-foreground">
                      Starting a new conversation…
                    </Shimmer>
                  </div>
                )}
              </div>

              {conversations.length > 1 && (
                <div className="border-t shrink-0 max-h-[180px] overflow-y-auto">
                  <div className="px-3 pt-2 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Chats</p>
                  </div>
                  <div className="px-2 pb-2 space-y-0.5">
                    {conversations.slice(0, 8).map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-xs transition-colors",
                          activeConversationId === conv.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleSelectConversation(conv.id)}
                        data-testid={`ai-drawer-conversation-${conv.id}`}
                      >
                        <MessageSquare className="size-3 shrink-0 opacity-60" />
                        <span className="truncate flex-1">{conv.title}</span>
                        <span className="text-[9px] opacity-50 shrink-0">{formatRelativeTime(conv.updated_at)}</span>
                      </div>
                    ))}
                  </div>
                  {conversations.length > 8 && (
                    <div className="px-3 pb-2">
                      <button
                        onClick={() => setIsExpanded(true)}
                        className="text-[10px] text-primary hover:underline"
                        data-testid="ai-view-all-history"
                      >
                        View all ({conversations.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="px-4 py-2 border-t shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Sparkles className="size-3" />
                  <span>Powered by OpenAI</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
