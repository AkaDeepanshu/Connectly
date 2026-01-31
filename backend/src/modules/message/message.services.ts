import { MessageType } from "@prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors/http.error.js";
import prisma from "../../services/prisma.js";

export interface SendMessageDto {
  roomId: bigint;
  senderId: bigint;
  content?: string;
  type: MessageType;
  clientMsgId: string;
}

export interface UpdateMessageDto {
  messageId: bigint;
  userId: bigint;
  newContent: string;
}

export class MessageService {
  static async getRoomMessages({
    roomId,
    userId,
    cursor,
    limit,
  }: {
    roomId: bigint;
    userId: bigint;
    cursor?: bigint | undefined;
    limit: number;
  }) {
    // Implementation for fetching room messages
    const room = await prisma.$queryRaw<any[]>`
    select 1 from ChatRoomUsers
    where room_id = ${roomId} and user_id = ${userId}`;

    if (room.length === 0) {
      throw new ForbiddenError("User not in room");
    }

    const messages = cursor
      ? await prisma.$queryRaw<any[]>`
    select * from Message where room_id = ${roomId}
    and id< ${cursor} order by id desc limit ${limit}`
      : await prisma.$queryRaw<any[]>`
    select * from Message where room_id = ${roomId}
    order by id desc limit ${limit}`;

    return messages;
  }

  static async getMessageById(messageId: bigint, userId: bigint) {
    const message = await prisma.$queryRaw<any[]>`
    select m.* from Message m inner join ChatRoomUsers cru on cru.room_id = m.room_id where m.id = ${messageId} and cru.user_id = ${userId}`;

    if (message.length === 0) {
      throw new NotFoundError("Message not found");
    }

    return message[0];
  }

  static async deleteMessage(messageId: bigint, userId: bigint) {
    await prisma.$transaction(async (tx)=>{
      const message = await tx.$queryRaw<any[]>`
      select 1 from Message where id = ${messageId} and sender_id = ${userId}`;

      if(message.length === 0) {
        throw new NotFoundError("Message not found");
      }
      await tx.$executeRaw`
      delete from Message where id = ${messageId} and sender_id = ${userId}`;
    });
  }

  static async sendMessage(dto: SendMessageDto) {
    const membership = await prisma.$queryRaw<any[]>`
    select 1 from ChatRoomUsers
    where room_id = ${dto.roomId} and user_id = ${dto.senderId}`;

    if(membership.length === 0){
      throw new ForbiddenError("User is not a member of the room");
    }

    if(dto.type === MessageType.text && (!dto.content || dto.content.trim() === "")){
      throw new ForbiddenError("Text message content cannot be empty");
    }

    const [newMessage] = await prisma.$queryRaw<any[]>`
    insert into Message (room_id, sender_id, content, type, client_msg_id)
    values (${dto.roomId}, ${dto.senderId}, ${dto.content}, ${dto.type}, ${dto.clientMsgId})
    returning *`;

    return newMessage;
  }

  static async updateMessage(dto: UpdateMessageDto){
    const message = await prisma.$queryRaw<any[]>`
    select 1 from Message where id = ${dto.messageId} and sender_id = ${dto.userId}`;

    if(message.length === 0){
      throw new NotFoundError("Message not found or user not authorized");
    }

    if (!dto.newContent || dto.newContent.trim() === "") {
      throw new BadRequestError("Message content cannot be empty");
    }

    const [updatedMessage] = await prisma.$queryRaw<any[]>`
    update Message set content = ${dto.newContent}, updated_at = now()
    where id = ${dto.messageId} and sender_id = ${dto.userId}
    returning *`;

    return updatedMessage;
  }

}
