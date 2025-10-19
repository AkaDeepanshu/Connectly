-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('pending', 'verified', 'suspended', 'deleted');

-- CreateTable
CREATE TABLE "public"."CallSessions" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT,
    "initiator_id" BIGINT,
    "call_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'ongoing',
    "started_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMP(6),

    CONSTRAINT "CallSessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatRoom" (
    "id" BIGSERIAL NOT NULL,
    "room_name" VARCHAR(255),
    "is_group" BOOLEAN NOT NULL,
    "profile_pic" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatRoomUsers" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT,
    "user_id" BIGINT,
    "role" VARCHAR(50) DEFAULT 'member',
    "joined_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRoomUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT,
    "sender_id" BIGINT,
    "content" TEXT,
    "type" VARCHAR(50) DEFAULT 'text',
    "is_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageAttachments" (
    "id" BIGSERIAL NOT NULL,
    "message_id" BIGINT,
    "file_url" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "uploaded_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageReactions" (
    "id" BIGSERIAL NOT NULL,
    "message_id" BIGINT,
    "user_id" BIGINT,
    "reaction" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageRead" (
    "id" BIGSERIAL NOT NULL,
    "message_id" BIGINT,
    "user_id" BIGINT,
    "read_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "type" VARCHAR(50) NOT NULL,
    "message_id" BIGINT,
    "room_id" BIGINT,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "profile_pic" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlockList" (
    "id" BIGSERIAL NOT NULL,
    "blocker_id" BIGINT,
    "blocked_id" BIGINT,
    "blocked_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlockList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "gender" VARCHAR(20),
    "dob" DATE,
    "bio" VARCHAR(500),
    "settings" JSONB DEFAULT '{}',

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_chatroomusers_room" ON "public"."ChatRoomUsers"("room_id");

-- CreateIndex
CREATE INDEX "idx_chatroomusers_user" ON "public"."ChatRoomUsers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoomUsers_room_id_user_id_key" ON "public"."ChatRoomUsers"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_message_room" ON "public"."Message"("room_id");

-- CreateIndex
CREATE INDEX "idx_message_sender" ON "public"."Message"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReactions_message_id_user_id_reaction_key" ON "public"."MessageReactions"("message_id", "user_id", "reaction");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_message_id_user_id_key" ON "public"."MessageRead"("message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlockList_blocker_id_blocked_id_key" ON "public"."UserBlockList"("blocker_id", "blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "public"."UserProfile"("user_id");

-- AddForeignKey
ALTER TABLE "public"."CallSessions" ADD CONSTRAINT "CallSessions_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CallSessions" ADD CONSTRAINT "CallSessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."ChatRoom"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ChatRoomUsers" ADD CONSTRAINT "ChatRoomUsers_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."ChatRoom"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ChatRoomUsers" ADD CONSTRAINT "ChatRoomUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."ChatRoom"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MessageAttachments" ADD CONSTRAINT "MessageAttachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MessageReactions" ADD CONSTRAINT "MessageReactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MessageReactions" ADD CONSTRAINT "MessageReactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MessageRead" ADD CONSTRAINT "MessageRead_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."MessageRead" ADD CONSTRAINT "MessageRead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Notifications" ADD CONSTRAINT "Notifications_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Notifications" ADD CONSTRAINT "Notifications_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."ChatRoom"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."UserBlockList" ADD CONSTRAINT "UserBlockList_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."UserBlockList" ADD CONSTRAINT "UserBlockList_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
