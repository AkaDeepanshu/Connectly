import prisma from "../../services/prisma.js";

export class RoomRepository {
  static async findDirectRooms(userA: BigInt, userB: BigInt) {
    return prisma.$queryRaw`
            select cr.* from ChatRoom cr
            inner join ChatRoomUsers cru 
            on cr.id = cru.room_id
            where cr.is_group = false
            and cru.user_id in (${userA}, ${userB})
            group by cr.id
            having count(distinct cru.user_id) = 2
            `;
  }
}
