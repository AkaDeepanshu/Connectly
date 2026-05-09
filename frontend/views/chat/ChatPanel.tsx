'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { Phone, Video, Search, MoreVertical, Paperclip, Smile, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/views/chat/Avatar";
import { useChatStore } from "@/stores/chat.store";
import { useMessages } from "@/hooks/useMessages";
import { useAuthStore } from "@/stores/auth.store";
import { useSocket } from "@/context/SocketProvider";
import { cn, formatDateSeparator, formatMessageTime } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Room } from "@/services/chat/chat.types";

type ChatPanelProps = { room: Room };

export default function ChatPanel({ room }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const { user } = useAuthStore();
  const messages = useChatStore((s) => s.messages[room.id] ?? []);
  const addMessage = useChatStore((s) => s.addMessage);
  const { sendMessage } = useSocket();

  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useMessages(room.id);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (isFirstLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      isFirstLoad.current = false;
    } else if (!isFirstLoad.current) {
      // Only auto-scroll if user is near bottom
      const el = threadRef.current;
      if (el) {
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distFromBottom < 120) {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages.length]);

  // Reset on room switch
  useEffect(() => {
    isFirstLoad.current = true;
  }, [room.id]);

  // Load older messages when user scrolls to top
  const handleScroll = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      const prevHeight = el.scrollHeight;
      fetchNextPage().then(() => {
        // Maintain scroll position after prepend
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight;
        });
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || !user) return;

    const clientMsgId = uuidv4();

    // Optimistic update
    addMessage(room.id, {
      id: `optimistic-${clientMsgId}`,
      room_id: room.id,
      sender_id: String(user.id),
      content: trimmed,
      type: "text",
      client_msg_id: clientMsgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false,
    });

    // Emit via socket
    sendMessage: (payload: { roomId: string; content: string; clientMsgId: string }) => void
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date for separators
  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0">
        <div className="relative">
          <Avatar initials={room.displayAvatar ?? "??"} size="md" />
          {room.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{room.displayName}</p>
          <p className="text-xs text-muted-foreground">
            {room.isOnline ? "Online" : "Last seen recently"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Phone size={17} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Video size={17} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Search size={17} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreVertical size={17} />
          </Button>
        </div>
      </header>

      {/* Message Thread */}
      <div
        ref={threadRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4"
      >
        {/* Loading older messages spinner */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Initial loading skeleton */}
        {isLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground text-sm">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          grouped.map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              <DateSeparator label={formatDateSeparator(date)} />
              <div className="space-y-0.5">
                {dayMsgs.map((msg, i) => {
                  const isMe = String(msg.sender_id) === String(user?.id);
                  const prevSender = i > 0 ? dayMsgs[i - 1].sender_id : null;
                  const isFirstInGroup = prevSender !== msg.sender_id;
                  const isOptimistic = msg.id.startsWith("optimistic-");
                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMe={isMe}
                      isFirstInGroup={isFirstInGroup}
                      isOptimistic={isOptimistic}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <div className="flex items-end gap-2 bg-muted rounded-2xl px-3 py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground">
            <Paperclip size={17} />
          </Button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none py-1.5 max-h-32"
            style={{ lineHeight: "1.5" }}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground">
            <Smile size={17} />
          </Button>
          <Button onClick={handleSend} size="icon" disabled={!input.trim()} className="h-8 w-8 flex-shrink-0 rounded-xl">
            <Send size={15} />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function MessageBubble({ message, isMe, isFirstInGroup, isOptimistic }: {
  message: any;
  isMe: boolean;
  isFirstInGroup: boolean;
  isOptimistic: boolean;
}) {
  return (
    <div className={cn("flex", isMe ? "justify-end" : "justify-start", isFirstInGroup ? "mt-3" : "mt-0.5")}>
      <div
        className={cn(
          "max-w-[65%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
          isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm",
          isOptimistic && "opacity-60"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
          <span className={cn("text-[10px]", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
            {formatMessageTime(message.created_at)}
          </span>
          {isMe && !isOptimistic && <ReadTick />}
          {isOptimistic && (
            <Loader2 size={10} className={cn("animate-spin", isMe ? "text-primary-foreground/60" : "text-muted-foreground")} />
          )}
        </div>
      </div>
    </div>
  );
}

function ReadTick() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="text-primary-foreground/60 flex-shrink-0">
      <path d="M1 5L4.5 8.5L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5L8.5 8.5L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground px-2">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {[40, 60, 45, 70, 55].map((w, i) => (
        <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
          <div
            className="h-9 bg-muted animate-pulse rounded-2xl"
            style={{ width: `${w}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function groupMessagesByDate(messages: any[]) {
  const map: Record<string, any[]> = {};
  for (const msg of messages) {
    const date = msg.created_at.slice(0, 10); // "YYYY-MM-DD"
    if (!map[date]) map[date] = [];
    map[date].push(msg);
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, messages]) => ({ date, messages }));
}