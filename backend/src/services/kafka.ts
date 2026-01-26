import { Kafka, Partitioners, Producer } from 'kafkajs';
import fs from 'fs';
import dotenv from 'dotenv';
import prisma from './prisma.js';
dotenv.config();

const kafka = new Kafka({
    brokers:[process.env.KAFKA_BROKER as string],
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME as string,
        password: process.env.KAFKA_PASSWORD as string,
    },
    ssl: {
        ca:[fs.readFileSync('./certs/ca.pem','utf-8')],
    },
})

let producer: null | Producer = null;

export async function createProducer() {
    if(producer) return producer;
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message:string){
    const producer = await createProducer();
    await producer.send({
        topic:'MESSAGES',
        messages:[{
            key:`message-${Date.now()}`,
            value:message
        }]
    });
    return true;
}

export async function startMessageConsumer(){
    const consumer = kafka.consumer({groupId:"message-consumers"});
    await consumer.connect();
    await consumer.subscribe({topic:"MESSAGES", fromBeginning:true});

    await consumer.run({
        autoCommit:true,
        eachMessage: async ({message, pause})=>{
            if(!message.value) return;
            console.log("Consumed message from Kafka:", {
                key: message.key?.toString(),
                value: message.value?.toString()
            });
            try{
                await prisma.message.create({
                data:{
                    content:message.value.toString()
                }
            });
            } catch(err){
                console.error("Error saving message to DB:", err);
                console.log("Pausing consumer for 1 minute due to error.");
                pause();
                setTimeout(()=>{
                    consumer.resume([{topic:"MESSAGES"}]);
                    console.log("Resumed consumer after pause.");
                }, 60*1000);
            }
        }
    })
}

export default kafka;