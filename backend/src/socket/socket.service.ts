import {Server} from 'socket.io';
import {Redis} from 'ioredis';

const pub = new Redis(process.env.REDIS_URI as string);
const sub = new Redis(process.env.REDIS_URI as string);


class SocketService {
    private _io : Server;

    constructor(){
        console.log("Init SocketService...");
        this._io = new Server({
            cors:{
                allowedHeaders:["*"],
                origin:"*"
            }
        });
        // Subscribe to Redis channel
        sub.subscribe('MESSAGES');
    }

    public InitListeners(){
        const io = this._io;
        console.log("Initializing Socket Listeners...");
        
        io.on('connect',(socket)=>{
            console.log("New socket connected:",socket.id);

            socket.on('event:message',async({message}:{message:string})=>{
                console.log("New message received:",message);
                // publish message to redis channel
                await pub.publish('MESSAGES',JSON.stringify({message}));
            })
        })

        sub.on('message',(channel,message)=>{
            if(channel === 'MESSAGES') io.emit('message',message);
        })
    }

    get io(){
        return this._io;
    }
}

export default SocketService;