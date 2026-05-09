import { useQuery } from "@tanstack/react-query";
import { useChatStore } from "@/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";
import { roomService } from "@/services/chat/chat.services";
import { Room } from "@/services/chat/chat.types";

// Derive a display name for the room.
// For DMs, room_name is null — ideally we'd show the other user's name,
// but without member data here we fall back to "Direct Message".
// This will improve once we load members per room.
export function getRoomDisplayName(room: Room, currentUserId?: string): string {
  if (room.room_name) return room.room_name;
  return "Direct Message";
}

export function getRoomInitials(room: Room): string {
  const name = room.room_name ?? "DM";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function useRooms() {
  const setRooms = useChatStore((s) => s.setRooms);
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await roomService.getRooms();
      return res.data.rooms;
    },
    enabled: !!user,
  });

  // Write to store when data arrives
  useEffect(() => {
    if (query.data) {
      // Enrich rooms with derived display fields
      const enriched: Room[] = query.data.map((room) => ({
        ...room,
        displayName: getRoomDisplayName(room, user?.id?.toString()),
        displayAvatar: getRoomInitials(room),
      }));
      setRooms(enriched);
    }
  }, [query.data, setRooms, user]);

  return query;
}