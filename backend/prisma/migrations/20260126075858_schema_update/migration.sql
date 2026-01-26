/*
  Warnings:

  - The `role` column on the `ChatRoomUsers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `delivery_status` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `file_type` on the `MessageAttachments` table. All the data in the column will be lost.
  - The `type` column on the `Notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `room_id` on table `CallSessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `initiator_id` on table `CallSessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `started_at` on table `CallSessions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `ChatRoom` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `ChatRoom` required. This step will fail if there are existing NULL values in that column.
  - Made the column `room_id` on table `ChatRoomUsers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `ChatRoomUsers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joined_at` on table `ChatRoomUsers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `room_id` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sender_id` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `client_msg_id` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `file_size` to the `MessageAttachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `MessageAttachments` table without a default value. This is not possible if the table is not empty.
  - Made the column `message_id` on table `MessageAttachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uploaded_at` on table `MessageAttachments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message_id` on table `MessageReactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `MessageReactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `MessageReactions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message_id` on table `MessageRead` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `MessageRead` required. This step will fail if there are existing NULL values in that column.
  - Made the column `read_at` on table `MessageRead` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_read` on table `Notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_active` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `blocker_id` on table `UserBlockList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `blocked_id` on table `UserBlockList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `blocked_at` on table `UserBlockList` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ChatRoomUserRole" AS ENUM ('member', 'admin');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'video', 'file');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('pending', 'sent', 'delivered', 'read');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('message', 'mention', 'reaction', 'call', 'system');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- AlterTable
ALTER TABLE "CallSessions" ALTER COLUMN "room_id" SET NOT NULL,
ALTER COLUMN "initiator_id" SET NOT NULL,
ALTER COLUMN "started_at" SET NOT NULL,
ALTER COLUMN "started_at" SET DATA TYPE TIMESTAMP(6);

-- AlterTable
ALTER TABLE "ChatRoom" ALTER COLUMN "is_group" SET DEFAULT false,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ChatRoomUsers" ALTER COLUMN "room_id" SET NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "ChatRoomUserRole" NOT NULL DEFAULT 'member',
ALTER COLUMN "joined_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "room_id" SET NOT NULL,
ALTER COLUMN "sender_id" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'text',
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "client_msg_id" SET NOT NULL,
DROP COLUMN "delivery_status",
ADD COLUMN     "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "MessageAttachments" DROP COLUMN "file_type",
ADD COLUMN     "file_size" INTEGER NOT NULL,
ADD COLUMN     "mime_type" VARCHAR(100) NOT NULL,
ALTER COLUMN "message_id" SET NOT NULL,
ALTER COLUMN "uploaded_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "MessageReactions" ALTER COLUMN "message_id" SET NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "MessageRead" ALTER COLUMN "message_id" SET NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "read_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "Notifications" ALTER COLUMN "user_id" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'message',
ALTER COLUMN "is_read" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "is_active" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserBlockList" ALTER COLUMN "blocker_id" SET NOT NULL,
ALTER COLUMN "blocked_id" SET NOT NULL,
ALTER COLUMN "blocked_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "user_id" SET NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender";

-- CreateTable
CREATE TABLE "Heartbeat" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "last_seen" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Heartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_message_room_createdat" ON "Message"("room_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_messageattachments_message" ON "MessageAttachments"("message_id");

-- CreateIndex
CREATE INDEX "idx_messagereactions_message" ON "MessageReactions"("message_id");

-- CreateIndex
CREATE INDEX "idx_messageread_message" ON "MessageRead"("message_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_isread" ON "Notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_user_createdat" ON "Notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_userblocklist_blocker" ON "UserBlockList"("blocker_id");

-- CreateIndex
CREATE INDEX "idx_userblocklist_blocked" ON "UserBlockList"("blocked_id");
