// IDs come as strings from backend (BigInt.toJSON = toString)

export type RoomType = "direct" | "group";

export interface Room {
  id: string;
  is_group: boolean;
  room_name: string | null;       // null for DMs
  description: string | null;
  profile_pic: string | null;
  created_at: string;
  updated_at: string;
  role: "admin" | "member";       // current user's role
  joined_at: string;

  // Derived on frontend — not from API directly
  displayName?: string;           // computed from room_name or DM partner name
  displayAvatar?: string;         // initials for avatar
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  type: "text" | "image" | "file" | "audio" | "video";
  client_msg_id: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;

  // Derived
  sender?: RoomMember;
}

export interface RoomMember {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "admin" | "member";
  joined_at: string;
  profile_pic?: string | null;
}

export interface GetMessagesResponse {
  success: boolean;
  data: Message[];
}

export interface GetRoomsResponse {
  status: string;
  rooms: Room[];
}