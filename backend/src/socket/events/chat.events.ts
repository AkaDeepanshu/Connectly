import { Server } from "socket.io";
import { SocketUser } from "../../types/socket.js";
import { isUserMemberOfRoom } from "../../modules/chat/chat.service.js";

export function registerChatEvents(io: Server){

    io.on('connection',(socketRaw)=>{
        const socket = socketRaw as SocketUser;
        const userId = socket.userId;
        if(!userId) {
            socket.disconnect(true);
            return;
        }

        // Join personal room for direct messages
        socket.join(`user:${userId}`);

        // Handle joining chat rooms: join_room
        socket.on('join_room', async (payload: {roomId: number}, ack?: (res: any) => void) => {
            try{
                const roomId = payload.roomId;
                if(!(await isUserMemberOfRoom(Number(userId), roomId))){
                    return ack?.({success: false, message: "Not a member of the room"});
                }

                socket.join(`room:${roomId}`);
                return ack?.({success: true});
            }
            catch(error){
                console.log("Error in join_room:", error);
                return ack?.({success: false, message: "Internal server error"});
            }
        })




    })
}