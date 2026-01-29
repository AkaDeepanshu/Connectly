import { ForbiddenError, NotFoundError } from "../../errors/http.error.js";
import prisma from "../../services/prisma.js";

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
    and id< ${cursor} order by created_at desc limit ${limit}`
      : await prisma.$queryRaw<any[]>`
    select * from Message where room_id = ${roomId}
    order by created_at desc limit ${limit}`;

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

  static async sendMessage(){
  }

  static async updateMessage(){
  }

}
