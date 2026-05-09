'use client';
import { useChatStore } from "@/stores/chat.store";
import { useRooms } from "@/hooks/useRooms";
import ChatPanel from "@/views/chat/ChatPanel";
import WelcomePanel from "@/views/chat/WelcomePanel";
import Sidebar from "@/views/chat/Sidebar";

export default function ChatPage() {
  // Fetch rooms on mount, writes to store automatically
  useRooms();

  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeRoomId={activeRoomId}
        onSelectRoom={setActiveRoom}
      />
      <main className="flex-1 flex flex-col min-w-0">
        {activeRoom ? (
          <ChatPanel room={activeRoom} />
        ) : (
          <WelcomePanel />
        )}
      </main>
    </div>
  );
}