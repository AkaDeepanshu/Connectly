'use client';

import { useSocket } from "@/context/SocketProvider";
import { useState } from "react";

export default function Home(){
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  function handleSendMessage(){
    sendMessage(message);
    setMessage("");
  }

  console.log("Messages:", messages);
  return (
    <div>
      <div>
        <h1>Welcome to Connectly</h1>
        <p>Your one-stop solution for seamless communication.</p>
      </div>
      <div>
        <input value={message} onChange={e=>setMessage(e.target.value)} type="text" placeholder="Message..." className="h-[50px] w-[200px] p-2 bg-white rounded-2xl text-black" />
        <button onClick={handleSendMessage} className="h-[50px] w-[50px] p-2 m-2 text-black bg-white border border-gray-300 rounded-2xl">Send</button>
      </div>
      <div>
        {messages.map((msg, index)=>(
          <li key={index} className="text-white">{msg}</li>
        ))}
      </div>
    </div>
  )
}