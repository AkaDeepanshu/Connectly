import { Socket } from "socket.io";

interface SocketUser extends Socket {
    userId : string;
}
export { SocketUser};