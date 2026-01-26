import { getPublisher } from "../../services/redis.js";

const publisher = getPublisher();

export const registerMessageEvents = (io: any, socket: any) => {
  socket.on("message:send", async ({ message }: { message: string }) => {
    console.log("Received message to send:", message);
    await publisher.publish("MESSAGE", JSON.stringify({ message }));
  });
};
