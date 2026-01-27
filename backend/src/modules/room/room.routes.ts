import express from "express";
import {
  addMemberToRoomHandler,
  changeMemberRoleHandler,
  createRoomHandler,
  deleteRoomHandler,
  getAllRoomsHandler,
  getRoomAllMembersHandler,
  getRoomByIdHandler,
  leaveRoomHandler,
  removeMemberFromRoomHandler,
  updateRoomHandler ,
} from "./room.controller.js";
import { verifyToken } from "../auth/auth.middleware.js";

const router = express.Router();

router
  .get("/",verifyToken, getAllRoomsHandler)
  .post("/", verifyToken, createRoomHandler)
  .get("/:roomId", verifyToken, getRoomByIdHandler)
  .put("/:roomId", verifyToken, updateRoomHandler)
  .delete("/:roomId", verifyToken, deleteRoomHandler)
  .post("/:roomId/leave", verifyToken, leaveRoomHandler)
  .post("/:roomId/members", verifyToken, addMemberToRoomHandler)
  .delete("/:roomId/members/:memberId", verifyToken, removeMemberFromRoomHandler)
  .get("/:roomId/members", verifyToken, getRoomAllMembersHandler)
  .patch("/:roomId/members/:memberId/role", verifyToken, changeMemberRoleHandler);
export default router;
