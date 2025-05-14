// src/socket/socket.ts
import { Server } from "socket.io";
import { ChatService } from "../services/chat.service";


export function initSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin:'https://nice-grass-01a8bd000.6.azurestaticapps.net',
      credentials: true,
      methods: ["GET" , "POST"]
    }
  });

  io.on("connection", (socket: { id: any; on: (event: string, callback: (...args: any[]) => void) => void; join: (room: string) => void; }) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId.toString());
    });

 socket.on("send_message", async (data, callback) => {
       const { senderId, receiverId, content } = data;

  if (!receiverId || !senderId || !content) {
    console.error("Invalid message data:", data);
    return;
  }

  try {
    const saved = await ChatService.createMessage(senderId, receiverId, content);
    io.to(receiverId.toString()).emit("receive_message", saved);

    if (callback) callback(saved);
  } catch (error) {
    console.error("Error saving message:", error);
  }
});
   
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  
  socket.on("seen_messages", async ({ senderId, receiverId }) => {


     if (!senderId || !receiverId || isNaN(senderId) || isNaN(receiverId)) {
    console.error('Invalid IDs in seen_messages:', { senderId, receiverId });
    return;
  }

  try {
    const updatedIds = await ChatService.markMessagesAsSeen(senderId, receiverId);
    io.to(senderId.toString()).emit("messages_seen", { messageIds: updatedIds });
    io.to(receiverId.toString()).emit("messages_updated", {messageIds : updatedIds});
  } catch (err) {
    console.error("Error updating message statuses to seen:", err);
  }


  });
});
}