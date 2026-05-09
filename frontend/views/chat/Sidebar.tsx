'use client';

import { useState } from "react";
import { Search, SquarePen, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/views/chat/Avatar";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRooms } from "@/hooks/useRooms";
import { cn, formatRoomTime } from "@/lib/utils";
import { Room } from "@/services/chat/chat.types";

type SidebarProps = {
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
};

export default function Sidebar({ activeRoomId, onSelectRoom }: SidebarProps) {
  const [search, setSearch] = useState("");
  const rooms = useChatStore((s) => s.rooms);
  const { isLoading, isError } = useRooms();
  const { user } = useAuthStore();

  const filtered = rooms.filter((r) =>
    (r.displayName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-[320px] flex-shrink-0 flex flex-col border-r border-border bg-background">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="text-lg font-semibold">Connectly</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Bell size={17} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <SquarePen size={17} />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <RoomListSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-sm text-muted-foreground px-4 text-center">
            <p>Failed to load conversations.</p>
            <button className="text-primary text-xs hover:underline" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm px-4 text-center">
            {search ? "No conversations match your search." : "No conversations yet."}
          </div>
        ) : (
          <ul>
            {filtered.map((room) => (
              <RoomItem key={room.id} room={room} active={room.id === activeRoomId} onClick={() => onSelectRoom(room.id)} />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="relative">
          <Avatar initials={user?.name?.slice(0, 2) ?? "ME"} size="sm" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.name ?? "You"}</p>
          <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0">
          <Settings size={16} />
        </Button>
      </div>
    </aside>
  );
}

function RoomItem({ room, active, onClick }: { room: Room; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
          active ? "bg-accent" : "hover:bg-muted/60"
        )}
      >
        <div className="relative flex-shrink-0">
          <Avatar initials={room.displayAvatar ?? "??"} size="md" />
          {room.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-medium truncate">{room.displayName}</span>
            {room.lastMessageTime && (
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatRoomTime(room.lastMessageTime)}</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">
              {room.lastMessage ?? (room.is_group ? "Group chat" : "Direct message")}
            </span>
            {(room.unreadCount ?? 0) > 0 && (
              <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                {(room.unreadCount ?? 0) > 9 ? "9+" : room.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

function RoomListSkeleton() {
  return (
    <ul>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-muted animate-pulse rounded w-3/5" />
            <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}