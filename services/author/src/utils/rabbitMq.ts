import amqp from 'amqplib';
import TryCatch from './TryCatch.js';

let channel: amqp.Channel;

export const connectRabbitMQ = async()=>{
    try {
        const connection = await amqp.connect({
            protocol:"amqp",
            hostname:"localhost",
            port:5672,
            username:"admin",
            password:"admin123"
        });
        
        channel= await connection.createChannel();
        console.log("✅Connected to RabbitMq 🐰");

    } catch (error) {
        console.error("❌ Failed to Connect to RabbitMq",error);
    }
};

export const publishToQueue = async(queueName:string, message:any)=>{
    if(!channel){
        console.error("No RabbitMQ channel initialized");
        return;
    }

    await channel.assertQueue(queueName,{durable:true});

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)),{
        persistent:true,

    })
};

export const invalidateChacheJob = async(cacheKeys:string[])=>{
    try {
        const message = {
            action:"invalidateCache",
            keys: cacheKeys,

        };

        await publishToQueue("cache-invalidation",message);

        console.log("✅ Cache invalidation job published to RabbitMq")
    } catch (error) {
        console.error("❌ Failed to Publish cache on RabbitMq",error);
        
    }
}