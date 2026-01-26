import { Server } from "socket.io";
import http from "http";
import { getPublisher, getSubscriber } from "../services/redis.js";
import prisma from "../services/prisma.js";
import { produceMessage } from "../services/kafka.js";

class SocketService {
  private _io: Server;
  private publisher: any;
  private subscriber: any;
  

  constructor(httpServer?: http.Server) {

    this._io = new Server(httpServer,{
      cors:{
        origin: "http://localhost:3000",
        methods: ["GET","POST"]
      }
    });

     console.log("SocketService initialized");

    // create redis publisher and subscriber
    this.publisher = getPublisher();
    this.subscriber = getSubscriber();

    this.subscriber.subscribe("MESSAGE");
  }

  public initListeners(){
    const io = this._io;
    console.log("Initializing socket listeners...");
    io.on("connect",(socket)=>{
      console.log('New socket connected:', socket.id);

      socket.on('event:msg', async ({message}:{message:string})=>{
        console.log('Received message:', message);
        await this.publisher.publish("MESSAGE",JSON.stringify({message}));
      })
    });

    this.subscriber.on("message", async (channel:any,message:string)=>{
      if(channel === "MESSAGE"){
        io.emit("message",message);
        await produceMessage(message);
        console.log("Message emitted to clients and produced to Kafka:", message);
      }
    })
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
