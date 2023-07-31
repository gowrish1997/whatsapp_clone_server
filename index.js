import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/AuthRoutes.js";
import messageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";
import getPrismaInstance from "./utils/PrismaClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/uploads/images", express.static("uploads/images"));
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000","https://whatsapp-topaz.vercel.app"],
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("signout", (id) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("send-msg", (msg) => {
    const senderSocketId = onlineUsers.get(msg.to);
    if (senderSocketId) {
      socket.to(senderSocketId).emit("msg-received", {
        from: msg.from,
        message: msg.message,
      });
    }
  });

  socket.on("update-msg", (id) => {
    const senderSocketId = onlineUsers.get(id);
    const updateDb = async () => {
      const prisma = getPrismaInstance();
      const data = await prisma.messages.updateMany({
        where: {
          messageStatus: {
            in: ["delivered", "sent"],
          },
        },
        data: {
          messageStatus: "read",
        },
      });
    };
    updateDb();

    if (senderSocketId) {
      socket.to(senderSocketId).emit("updating-to-read");
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const senderSocketId = onlineUsers.get(data.to);

    if (senderSocketId) {
      socket.to(senderSocketId).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("outgoing-video-call", (data) => {
    const senderSocketId = onlineUsers.get(data.to);

    if (senderSocketId) {
      socket.to(senderSocketId).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const senderSocketId = onlineUsers.get(data.from);
    if (senderSocketId) {
      socket.to(senderSocketId).emit("voice-call-rejected");
    }
  });
  socket.on("reject-video-call", (data) => {
    const senderSocketId = onlineUsers.get(data.from);
    if (senderSocketId) {
      socket.to(senderSocketId).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);

    socket.to(sendUserSocket).emit("accept-call");
  });

  // socket.on("disconnect", (id) => {
  //   console.log(id)
  //   console.log("iam disconnecting here");
  // });
});

// import express from "express";
// import cors from "cors";
// const app = express();
// const allowedOrigins = ["http://localhost:3000", "http://client.example.com"];
// app.use(cors({ origin: allowedOrigins, credentials: true }));

// app.get("/", (req, res) => {
//   res.cookie("sessionId", "abc123", {
//     httpOnly: true,
//     sameSite: "none",
//     secure: true,
//   });
//   // res.setHeader("Cache-Control", "no-cache, no-store");
//   res.status(200).json({ message: "Cookie has been set." });
// });

// app.post("/post", (req, res) => {
//   // res.setHeader("Cache-Control", "no-cache, no-store");
//   res
//     .status(200)
//     .json({ message: "just for checking purpose whether ir can push or not" });
// });
// app.listen(3005, () => {
//   console.log("Server running on http://localhost:3005");
// });
