import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // --- Socket.io Relay Logic ---
  // Simple room-based relay for mesh messaging
  io.on("connection", (socket) => {
    console.log("Peer connected:", socket.id);

    socket.on("join-mesh", (meshId) => {
      socket.join(meshId);
      console.log(`Socket ${socket.id} joined mesh: ${meshId}`);
    });

    socket.on("mesh-message", ({ meshId, payload }) => {
      // payload should be encrypted on client
      socket.to(meshId).emit("mesh-incoming", payload);
    });

    socket.on("disconnect", () => {
      console.log("Peer disconnected:", socket.id);
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sahand] Mission Control active at http://localhost:${PORT}`);
  });
}

startServer();
