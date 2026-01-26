export const messageEmitter = {
  broadcast(io: any, message: string) {
    io.emit("message:new", message);
  },
};
