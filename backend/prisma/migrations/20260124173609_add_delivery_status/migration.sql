/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_msg_id,sender_id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "is_deleted",
ADD COLUMN     "client_msg_id" VARCHAR(255),
ADD COLUMN     "delivery_status" VARCHAR(50) DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "Message_client_msg_id_sender_id_key" ON "Message"("client_msg_id", "sender_id");
