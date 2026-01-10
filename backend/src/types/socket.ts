import { Socket } from "socket.io";

export interface SocketUser extends Socket {
    userId : string;
}

export type SendMessagePayload = {
    client_msg_id : string;
    room_id : string;
    content? : string;
    type? : 'text' | 'image' | 'file' | string;
    attachments? : Array<{url: string, file_type?: string }>;
}