import { Server } from "socket.io";
import http from "http";

class SocketService {
  private _io: Server;

  constructor(httpServer?: http.Server) {
    this._io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });
    console.log("SocketService initialized");
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
