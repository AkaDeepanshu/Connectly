import { Response } from "express";
import { AuthRequest } from "../../types/auth.js";
import { RoomService } from "./room.services.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/http.error.js";

export const getAllRoomsHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const rooms = await RoomService.getAllRoomsForUser(BigInt(userId));

  if (!rooms || rooms.length === 0) {
    throw new NotFoundError("No rooms found for the user");
  }

  return res.status(200).json({
    status: "success",
    rooms: rooms,
  });
};

export const getRoomByIdHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  const room = await RoomService.getRoomById(BigInt(roomId));

  if (!room) {
    throw new NotFoundError("Room not found");
  }
  return res.status(200).json({
    status: "success",
    room: room,
  });
};

export const createRoomHandler = async (req: AuthRequest, res: Response) => {
  const creatorId = req.userId;
  const { is_group, room_name, description, profile_pic, members_ids } =
    req.body;

  if (!creatorId) {
    throw new UnauthorizedError();
  }
  if (!Array.isArray(members_ids) || members_ids.length < 1) {
    throw new BadRequestError(
      "At least one member ID is required to create a room",
    );
  }
  if (!is_group && members_ids.length !== 1) {
    throw new BadRequestError(
      "Direct rooms must have exactly one member besides the creator",
    );
  }
  if (is_group && (!room_name || room_name.trim() === "")) {
    throw new BadRequestError("Group rooms must have a valid room name");
  }

  const room = await RoomService.createRoom({
    creatorId: BigInt(creatorId),
    isGroup: is_group,
    roomName: room_name,
    description,
    profilePic: profile_pic,
    memberIds: members_ids.map((id: string) => BigInt(id)),
  });
  return res.status(201).json({
    status: "success",
    room: room,
  });
};

export const updateRoomHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  const { room_name, description, profile_pic } = req.body;

  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  if (!room_name && !description && !profile_pic) {
    throw new BadRequestError("At least one field must be provided for update");
  }

  const updatedRoom = await RoomService.updateRoom({
    userId: BigInt(userId),
    roomId: BigInt(roomId),
    roomName: room_name,
    description,
    profilePic: profile_pic,
  });
  return res.status(200).json({
    status: "success",
    room: updatedRoom,
  });
};

export const deleteRoomHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  await RoomService.deleteRoom({
    roomId: BigInt(roomId),
    userId: BigInt(userId),
  });
  return res.status(200).json({
    status: "success",
    message: "Room deleted successfully",
  });
};

export const leaveRoomHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  await RoomService.leaveRoom({
    roomId: BigInt(roomId),
    userId: BigInt(userId),
  });
  return res.status(200).json({
    status: "success",
    message: "Left the room successfully",
  });
};

export const addMemberToRoomHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.userId;
  const { roomId } = req.params;
  const { member_id } = req.body;

  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  if (!member_id) {
    throw new BadRequestError("Member ID is required");
  }

  const newMember = await RoomService.addMember({
    roomId: BigInt(roomId),
    addedByUserId: BigInt(userId),
    memberId: BigInt(member_id),
  });

  return res.status(200).json({
    status: "success",
    member: newMember,
  });
};

export const removeMemberFromRoomHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.userId;
  const { roomId, memberId } = req.params;
  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  if (!memberId || Array.isArray(memberId)) {
    throw new BadRequestError("Member ID is required");
  }
  await RoomService.removeMember({
    roomId: BigInt(roomId),
    removedByUserId: BigInt(userId),
    memberId: BigInt(memberId),
  });
  return res.status(200).json({
    status: "success",
    message: "Member removed successfully",
  });
};

export const getRoomAllMembersHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  const { roomId } = req.params;
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  const members = await RoomService.getAllMembersInRoom(BigInt(roomId));

  return res.status(200).json({
    status: "success",
    members: members,
  });
};

export const changeMemberRoleHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.userId;
  const { roomId, memberId } = req.params;
  const { new_role } = req.body;
  if (!userId) {
    throw new UnauthorizedError();
  }
  if (!roomId || Array.isArray(roomId)) {
    throw new BadRequestError("Room ID is required");
  }
  if (!memberId || Array.isArray(memberId)) {
    throw new BadRequestError("Member ID is required");
  }
  if (!new_role || (new_role !== "admin" && new_role !== "member")) {
    throw new BadRequestError("New role must be either 'admin' or 'member'");
  }
  await RoomService.changeMemberRole({
    roomId: BigInt(roomId),
    changedByUserId: BigInt(userId),
    memberId: BigInt(memberId),
    newRole: new_role,
  });

  return res.status(200).json({
    status: "success",
    message: "Member role changed successfully",
  });
};