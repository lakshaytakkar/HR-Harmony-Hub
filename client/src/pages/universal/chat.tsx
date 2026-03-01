import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Search, 
  Hash, 
  Users, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Send 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  detectVerticalFromUrl 
} from "@/lib/verticals-config";
import { 
  chatChannels, 
  chatMessages, 
  verticalMembers,
  type ChatChannel,
  type ChatMessage
} from "@/lib/mock-data-shared";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { 
  PageTransition, 
  Fade 
} from "@/components/ui/animated";
import { 
  FilterPill 
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLoading } from "@/components/ui/page-loading";

export default function UniversalChat() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const loading = useSimulatedLoading(600);
  
  const [activeTab, setActiveTab] = useState<"channel" | "dm">("channel");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter channels/DMs by vertical
  const filteredChannels = useMemo(() => {
    if (!vertical) return [];
    return chatChannels.filter(c => c.verticalId === vertical.id && c.type === "channel");
  }, [vertical]);

  const filteredDMs = useMemo(() => {
    if (!vertical) return [];
    return chatChannels.filter(c => c.verticalId === vertical.id && c.type === "dm");
  }, [vertical]);

  // Set default active channel
  useEffect(() => {
    if (!activeChannelId) {
      const pinned = filteredChannels.find(c => c.isPinned);
      if (pinned) {
        setActiveChannelId(pinned.id);
      } else if (filteredChannels.length > 0) {
        setActiveChannelId(filteredChannels[0].id);
      }
    }
  }, [filteredChannels, activeChannelId]);

  const activeChannel = useMemo(() => {
    return chatChannels.find(c => c.id === activeChannelId);
  }, [activeChannelId]);

  const messages = useMemo(() => {
    if (!activeChannelId) return [];
    return chatMessages.filter(m => m.channelId === activeChannelId);
  }, [activeChannelId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // In a real app, this would be a mutation
    setMessageText("");
  };

  const filteredList = useMemo(() => {
    const list = activeTab === "channel" ? filteredChannels : filteredDMs;
    if (!searchQuery) return list;
    return list.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, filteredChannels, filteredDMs, searchQuery]);

  if (loading) return <PageLoading />;
  if (!vertical) return <div>Vertical not found</div>;

  return (
    <PageTransition className="flex h-full overflow-hidden">
      {/* Left Sidebar - Pattern I: aside.w-64 */}
      <aside 
        className="w-64 shrink-0 flex flex-col bg-card border-r overflow-hidden"
      >
        <div className="p-4 border-b space-y-4">
          <h2 className="text-base font-semibold">Team Chat</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-9 bg-muted/30 border-none focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-chats"
            />
          </div>
          
          <div className="flex gap-2">
            <FilterPill
              active={activeTab === "channel"}
              color={vertical.color}
              onClick={() => setActiveTab("channel")}
              testId="tab-channels"
            >
              Channels
            </FilterPill>
            <FilterPill
              active={activeTab === "dm"}
              color={vertical.color}
              onClick={() => setActiveTab("dm")}
              testId="tab-dms"
            >
              DMs
            </FilterPill>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-border/50">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveChannelId(item.id)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50",
                  activeChannelId === item.id ? "bg-muted" : ""
                )}
                style={activeChannelId === item.id ? { backgroundColor: `${vertical.color}15`, color: vertical.color } : {}}
                data-testid={item.type === "channel" ? `channel-item-${item.id}` : `dm-item-${item.id}`}
              >
                {item.type === "channel" ? (
                  <Hash className="h-4 w-4 shrink-0" />
                ) : (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={getPersonAvatar(item.name)} alt={item.name} />
                    <AvatarFallback>{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {item.type === "channel" ? item.name : item.name}
                    </span>
                  </div>
                </div>

                {item.unreadCount > 0 && (
                  <div 
                    className="h-4 min-w-4 flex items-center justify-center text-white rounded-full text-[10px] font-medium px-1"
                    style={{ backgroundColor: vertical.color }}
                  >
                    {item.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Right Content Panel - Pattern I: main.flex-1 */}
      <main 
        className="flex-1 flex flex-col min-w-0 bg-background"
      >
        {activeChannel ? (
          <>
            {/* Thread Header */}
            <div className="border-b px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                {activeChannel.type === "channel" ? (
                  <Hash className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={getPersonAvatar(activeChannel.name)} alt={activeChannel.name} />
                    <AvatarFallback>{activeChannel.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate">
                    {activeChannel.type === "channel" ? activeChannel.name : activeChannel.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeChannel.description || "Active now"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, idx) => {
                const showHeader = idx === 0 || messages[idx - 1].senderName !== msg.senderName;
                
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex gap-3",
                      msg.isMe ? "flex-row-reverse" : "flex-row"
                    )}
                    data-testid={`message-${msg.id}`}
                  >
                    {!msg.isMe && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1">
                        <AvatarImage src={getPersonAvatar(msg.senderName)} alt={msg.senderName} />
                        <AvatarFallback>{msg.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "flex flex-col gap-1 max-w-[70%]",
                      msg.isMe ? "items-end" : "items-start"
                    )}>
                      {showHeader && (
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs font-semibold">{msg.senderName}</span>
                          <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                        msg.isMe 
                          ? "text-white" 
                          : "bg-card border text-foreground"
                      )}
                      style={msg.isMe ? { backgroundColor: vertical.color } : {}}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t px-4 py-3 shrink-0 bg-background">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Type a message..."
                    className="h-10 bg-muted/30 border-none focus-visible:ring-1"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    data-testid="input-message"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  style={{ backgroundColor: vertical.color }}
                  data-testid="btn-send"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </main>
    </PageTransition>
  );
}

// Missing icon from lucide
import { MessageCircle } from "lucide-react";
