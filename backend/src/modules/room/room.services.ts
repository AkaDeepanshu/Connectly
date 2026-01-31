import { ChatRoomUserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../../errors/http.error.js";
import prisma from "../../services/prisma.js";
import { RoomRepository } from "./room.repository.js";

export interface CreateRoomDto {
  creatorId: bigint;
  isGroup: boolean;
  roomName?: string;
  description?: string;
  profilePic?: string;
  memberIds: bigint[];
}

export interface UpdateRoomDto {
  roomId: bigint;
  userId: bigint;
  roomName?: string;
  description?: string;
  profilePic?: string;
}

export class RoomService {
  static async getAllRoomsForUser(userId: bigint) {
    const user: any[] =
      await prisma.$queryRaw`SELECT * FROM User WHERE id = ${userId}`;

    if (!user || user.length === 0) {
      throw new NotFoundError("User not found");
    }

    const rooms: any[] = await prisma.$queryRaw`
      select cr.*, cru.role, cru.joinedAt 
      from ChatRoom cr 
      inner join ChatRoomUsers cru 
      on cr.id = cru.roomId 
      where cru.userId = ${userId}`;

    return rooms;
  }

  static async getRoomById(roomId: bigint) {
    return await prisma.$queryRaw`
        select * from ChatRoom where id = ${roomId}`;
  }

  static async createRoom(dto: CreateRoomDto) {
    const { creatorId, isGroup, roomName, description, profilePic, memberIds } =
      dto;

    const participantsSet = new Set<bigint>([creatorId, ...memberIds]);
    const participants = Array.from(participantsSet);

    if (!isGroup && participants.length !== 2) {
      throw new ForbiddenError("Direct rooms must have exactly 2 participants");
    }

    if (isGroup && participants.length < 3) {
      throw new ForbiddenError("Group rooms must have at least 3 participants");
    }

    if (!isGroup) {
      const [userA, userB] = participants;
      const existingRoom: any = await RoomRepository.findDirectRooms(
        userA,
        userB,
      );
      if (existingRoom.length > 0) {
        return existingRoom[0];
      }
    }

    return prisma.$transaction(async (tx) => {
      const [room] = await tx.$queryRaw<any[]>`
                insert into ChatRoom (is_group, room_name, description, profile_pic)
                values (${isGroup}, ${isGroup ? roomName : null}, ${description ?? null}, ${profilePic ?? null})
                returning *;`;

      await tx.chatRoomUsers.createMany({
        data: participants.map((userId) => ({
          room_id: room.id,
          user_id: userId,
          role: isGroup && userId === creatorId ? ChatRoomUserRole.admin : ChatRoomUserRole.member,
        })),
      });

      return room;
    });
    return {};
  }

  static async updateRoom(dto: UpdateRoomDto) {
    const { roomId, userId, roomName, description, profilePic } = dto;

    return prisma.$transaction(async (tx) => {
      const room = await tx.$queryRaw<any[]>`
      SELECT cr.*, cru.role
      FROM "ChatRoom" cr
      INNER JOIN "ChatRoomUsers" cru
        ON cr.id = cru.room_id
      WHERE cr.id = ${roomId}
        AND cru.user_id = ${userId};
    `;

      if (room.length === 0) throw new NotFoundError("Room not found");
      if (!room[0].is_group)
        throw new ForbiddenError("Cannot update a direct room");
      if (room[0].role !== ChatRoomUserRole.admin)
        throw new ForbiddenError("Only admins can update the room");

      const [updatedRoom] = await tx.$queryRaw<any[]>`
      UPDATE "ChatRoom"
      SET
        room_name = COALESCE(${roomName}, room_name),
        description = COALESCE(${description}, description),
        profile_pic = COALESCE(${profilePic}, profile_pic)
      WHERE id = ${roomId}
      RETURNING *;
    `;

      return updatedRoom;
    });
  }

  static async deleteRoom({
    roomId,
    userId,
  }: {
    roomId: bigint;
    userId: bigint;
  }) {
    await prisma.$transaction(async (tx) => {
      const room = await tx.$queryRaw<any[]>`
    SELECT cr.*, cru.role
    FROM "ChatRoom" cr
    INNER JOIN "ChatRoomUsers" cru
      ON cr.id = cru.room_id
    WHERE cr.id = ${roomId}
      AND cru.user_id = ${userId};
  `;

      if (room.length === 0) throw new NotFoundError("Room not found");
      if (!room[0].is_group)
        throw new ForbiddenError("Cannot delete a direct room");
      if (room[0].role !== ChatRoomUserRole.admin)
        throw new ForbiddenError("Only admins can delete");

      await tx.$executeRaw`
    DELETE FROM "ChatRoom" WHERE id = ${roomId};
  `;
    });
  }

  static async leaveRoom({
    roomId,
    userId,
  }: {
    roomId: bigint;
    userId: bigint;
  }) {
    await prisma.$transaction(async (tx) => {
      const membership = await tx.$queryRaw<any[]>`
      select * from ChatRoomUsers where room_id = ${roomId} and user_id = ${userId}`;

      if (membership.length === 0)
        throw new NotFoundError("Membership not found");

      await tx.$executeRaw`
      delete from ChatRoomUsers where room_id = ${roomId} and user_id = ${userId}`;
    });
  }

  static async addMember({
    roomId,
    addedByUserId,
    memberId,
  }: {
    roomId: bigint;
    addedByUserId: bigint;
    memberId: bigint;
  }) {
    await prisma.$transaction(async (tx) => {
      const room = await tx.$queryRaw<any[]>`
      select cr.*, cru.role from "ChatRoom" cr inner join "ChatRoomUsers" cru
      on cr.id = cru.room_id where cr.id = ${roomId} and cru.user_id = ${addedByUserId}`;

      if (room.length === 0) throw new NotFoundError("Room not found");
      if (!room[0].is_group)
        throw new ForbiddenError("Cannot add members to a direct room");
      if (room[0].role !== ChatRoomUserRole.admin)
        throw new ForbiddenError("Only admins can add members");

      const existingMembership = await tx.$queryRaw<any[]>`
      select * from ChatRoomUsers where room_id = ${roomId} and user_id = ${memberId}`;

      if (existingMembership.length > 0)
        throw new ForbiddenError("User is already a member of the room");

      const [newMember] = await tx.$queryRaw<any[]>`
      insert into ChatRoomUsers (room_id, user_id, role)
      values (${roomId}, ${memberId}, ${ChatRoomUserRole.member})`;

      return newMember;
    });
  }
  static async removeMember({
    roomId,
    removedByUserId,
    memberId,
  }: {
    roomId: bigint;
    removedByUserId: bigint;
    memberId: bigint;
  }) {
    await prisma.$transaction(async (tx) => {
      const room = await tx.$queryRaw<any[]>`
      select cr.*, cru.role from "ChatRoom" cr inner join "ChatRoomUsers" cru
      on cr.id = cru.room_id where cr.id = ${roomId} and cru.user_id = ${removedByUserId}`;
      if (room.length === 0) throw new NotFoundError("Room not found");
      if (!room[0].is_group)
        throw new ForbiddenError("Cannot remove members from a direct room");
      if (room[0].role !== ChatRoomUserRole.admin)
        throw new ForbiddenError("Only admins can remove members");

      const existingMembership = await tx.$queryRaw<any[]>`
      select * from ChatRoomUsers where room_id = ${roomId} and user_id = ${memberId}`;

      if (existingMembership.length === 0)
        throw new ForbiddenError("User is not a member of the room");

      await tx.$queryRaw<any[]>`
      delete from ChatRoomUsers where room_id = ${roomId} and user_id = ${memberId}`;
    });
  }

  static async changeMemberRole({
    roomId,
    changedByUserId,
    memberId,
    newRole,
  }: {
    roomId: bigint;
    changedByUserId: bigint;
    memberId: bigint;
    newRole: ChatRoomUserRole;
  }) {
    await prisma.$transaction(async (tx) => {
      const room = await tx.$queryRaw<any[]>`
        select cr.*, cru.role from "ChatRoom" cr inner join "ChatRoomUsers" cru
        on cr.id = cru.room_id where cr.id = ${roomId} and cru.user_id = ${changedByUserId}`;

      if (room.length === 0) throw new NotFoundError("Room not found");
      if (!room[0].is_group)
        throw new ForbiddenError("Cannot change member roles in a direct room");
      if (room[0].role !== ChatRoomUserRole.admin)
        throw new ForbiddenError("Only admins can change member roles");

      const existingMembership = await tx.$queryRaw<any[]>`
      select * from "ChatRoomUsers" where room_id = ${roomId} and user_id = ${memberId}`;
      if (existingMembership.length === 0)
        throw new ForbiddenError("User is not a member of the room");
      await tx.$queryRaw<any[]>`
      update "ChatRoomUsers" set role = ${newRole} where room_id = ${roomId} and user_id = ${memberId}`;
    });
  }

  static async getAllMembersInRoom(roomId: bigint) {
    const members = await prisma.$queryRaw<any[]>`
    select u.id, u.username, u.email, cru.role, cru.joined_at
    from "ChatRoomUsers" cru inner join "User" u on cru.user_id = u.id
    where cru.room_id = ${roomId}`;
    return members;
  }
}
