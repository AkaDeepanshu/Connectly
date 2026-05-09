import api from "@/services/axios";
import { GetRoomsResponse, Room, GetMessagesResponse } from "./chat.types";

export const roomService = {
  getRooms: () =>
    api.get<GetRoomsResponse>("/rooms"),

  getRoomById: (roomId: string) =>
    api.get<{ status: string; room: Room }>(`/rooms/${roomId}`),

  createRoom: (payload: {
    is_group: boolean;
    room_name?: string;
    description?: string;
    members_ids: string[];
  }) => api.post("/rooms", payload),

  updateRoom: (roomId: string, payload: {
    room_name?: string;
    description?: string;
    profile_pic?: string;
  }) => api.put(`/rooms/${roomId}`, payload),

  deleteRoom: (roomId: string) =>
    api.delete(`/rooms/${roomId}`),

  leaveRoom: (roomId: string) =>
    api.post(`/rooms/${roomId}/leave`),

  getMembers: (roomId: string) =>
    api.get(`/rooms/${roomId}/members`),

  addMember: (roomId: string, memberId: string) =>
    api.post(`/rooms/${roomId}/members`, { member_id: memberId }),

  removeMember: (roomId: string, memberId: string) =>
    api.delete(`/rooms/${roomId}/members/${memberId}`),

  changeMemberRole: (roomId: string, memberId: string, role: "admin" | "member") =>
    api.patch(`/rooms/${roomId}/members/${memberId}/role`, { new_role: role }),
};

export const messageService = {
  getMessages: (roomId: string, cursor?: string, limit = 20) =>
    api.get<GetMessagesResponse>(`/rooms/${roomId}/messages`, {
      params: {
        ...(cursor && { cursor }),
        limit,
      },
    }),

  updateMessage: (messageId: string, newContent: string) =>
    api.put(`/messages/${messageId}`, { newContent }),

  deleteMessage: (messageId: string) =>
    api.delete(`/messages/${messageId}`),
};