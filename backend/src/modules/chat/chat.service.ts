import prisma from "../../config/prisma.js";

// Return existing 1:1 chat room between two users or create it
export const getOrCreateDirectRoom = async (userAId: number, userBId : number)=>{
    if(userAId === userBId) throw new Error("Cannot create direct room with oneself");

    // Search for existing direct room
    const row: Array<{id:bigint}> = await prisma.$queryRaw`
        SELECT cr.id 
        FROM "ChatRoom" cr
        JOIN "ChatRoomUsers" cru ON cr.id = cru.roomId
        WHERE cr.is_group = false AND cru.user_id IN (${userAId}, ${userBId})
        GROUP BY cr.id
        HAVING COUNT(cru.user_id) = 2
        LIMIT 1;
        `;

    if(row.length > 0){
        return { room_id : Number(row[0].id), is_new : false};
    }

    // create new direct room
    const room = await prisma.chatRoom.create({
        data:{
            is_group: false
        }
    });

    // create two ChatRoomUsers entries
    await prisma.chatRoomUsers.createMany({
        data:[
            {room_id: room.id, user_id: BigInt(userAId) as any},
            {room_id: room.id, user_id: BigInt(userBId) as any}
        ]
    });

    return { room_id: Number(room.id), is_new: true};
}

// check if a user is member of room
export const isUserMemberOfRoom = async (userId: number, roomId: number) =>{
    const membership = await prisma.chatRoomUsers.findUnique({
        where:{
            room_id_user_id:{
                room_id: BigInt(roomId) as any, user_id: BigInt(userId) as any
            }
        }
    })

    return !!membership;
}