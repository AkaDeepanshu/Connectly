import { Response } from "express";
import { AuthRequest } from "../../types/auth.js";
import { RoomService } from "./room.services.js";

export const getAllRoomsHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const rooms = await RoomService.getAllRoomsForUser(BigInt(userId));

    if (!rooms || rooms.length === 0) {
      return res.status(404).json({
        message: "No rooms found for the user",
      });
    }

    return res.status(200).json({
      status: "success",
      rooms: rooms,
    });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRoomByIdHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!roomId || Array.isArray(roomId)) {
    return res.status(400).json({
      message: "Room ID is required",
    });
  }
  try {
    const room = await RoomService.getRoomById(BigInt(roomId));

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }
    return res.status(200).json({
      status: "success",
      room: room,
    });
  } catch (err) {
    console.error("Error fetching room by ID:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createRoomHandler = async (req: AuthRequest, res: Response) => {
  const creatorId = req.userId;
  const { is_group, room_name, description, profile_pic, members_ids } =
    req.body;

  if (!creatorId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!Array.isArray(members_ids) || members_ids.length < 1) {
    return res.status(400).json({
      message: "At least one member ID is required to create a room",
    });
  }
  if (!is_group && members_ids.length !== 1) {
    return res.status(400).json({
      message: "Direct rooms must have exactly one member besides the creator",
    });
  }
  if (is_group && (!room_name || room_name.trim() === "")) {
    return res.status(400).json({
      message: "Group rooms must have a valid room name",
    });
  }

  try {
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
  } catch (err: any) {
    console.error("Error creating room:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

export const updateRoomHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  const { room_name, description, profile_pic } = req.body;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!roomId || Array.isArray(roomId)) {
    return res.status(400).json({
      message: "Room ID is required",
    });
  }
  if (!room_name && !description && !profile_pic) {
    return res.status(400).json({
      message: "At least one field must be provided for update",
    });
  }
  try {
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
  } catch (err: any) {
    console.error("Error updating room:", err);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteRoomHandler = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!roomId || Array.isArray(roomId)) {
    return res.status(400).json({
      message: "Room ID is required",
    });
  }
  try {
    await RoomService.deleteRoom({
      roomId: BigInt(roomId),
      userId: BigInt(userId),
    });
    return res.status(200).json({
      status: "success",
      message: "Room deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting room:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const leaveRoomHandler = async (req: AuthRequest, res: Response) => {};

export const addMemberToRoomHandler = async (req: AuthRequest, res: Response) => {};

export const removeMemberFromRoomHandler = async (req: AuthRequest, res: Response) => {};

export const getRoomMembersHandler = async (req: AuthRequest, res: Response) => {};

export const changeMemberRoleHandler = async (req: AuthRequest, res: Response) => {};