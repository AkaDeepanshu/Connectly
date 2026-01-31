/*
  Warnings:

  - You are about to drop the column `delivery_status` on the `Message` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "delivery_status",
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_messageread_user_message" ON "MessageRead"("user_id", "message_id");
