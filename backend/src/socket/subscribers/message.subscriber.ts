import { produceMessage } from "../../services/kafka.js";
import { getSubscriber } from "../../services/redis.js";
import { messageEmitter } from "../emitters/message.emitter.js";

export const startMessageSubscriber = (io: any) => {
  const subscriber = getSubscriber();

  subscriber.subscribe("MESSAGE");

  subscriber.on("message", async (channel: string, message: string) => {
    if (channel !== "MESSAGE") return;

    messageEmitter.broadcast(io, message);

    await produceMessage(message);

    console.log("Message emitted to clients and produced to Kafka:", message);
  });
};
