import { Server } from "socket.io";
import { SendMessagePayload, SocketUser } from "../../types/socket.js";
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

        // Send message to room: send_message
        /**
         * basic validation and membership check 
         * optimistic broadcasting message:pending
         * persist message to DB
         * publish persisted message to redis channel MESSAGE_PERSISTED_CHANNEL
        */
        socket.on('send_message', async (payload : SendMessagePayload, ack?: (res:any)=>void)=>{
            try{
                const { client_msg_id, room_id, content="", type="text", attachments= []}= payload;

                if(! client_msg_id || !room_id){
                    return ack?.({
                        success:false,
                        message:"client_msg_id and room_id are required"
                    })
                }

                if(! (await isUserMemberOfRoom(Number(userId), Number(room_id)))){
                    return ack?.({success: false, message: "Not a member of the room"});
                }

                // optimistic broadcast
                const pending = {
                    client_msg_id,
                    room_id,
                    sender_id: Number(userId),
                    content,
                    type,
                    created_at: new Date().toISOString(),
                    delivery_status: 'pending',
                    attachments
                } 
            }catch(error){
                console.log("Error in sending message:", error);
                return ack?.({success: false, message: "Internal server error"});
            }
        });

        socket.on('typing',()=>{

        });

        socket.on('message_read',()=>{

        });

        socket.on('disconnect',()=>{

        });
    })
}