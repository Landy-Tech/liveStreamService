import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import cors from "cors";
import path from "path";
import { setupDeviceStatusNamespace } from "./liveStreamNamespace"; // Namespace למכשירים
import { setupDeviceLiveStreamNamespace } from "./FrontedNamespace"; // Namespace לפרונטנד

// משתני סביבה
const port = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// הגדרת סטטיקת קבצים
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get('/ping', (req, res) => {
  // logger.info('Ping call')
  res.send('pong')
})

// יצירת שרת HTTP
const server = http.createServer(app);

// הגדרת WebSocket
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
  },
  path: "/ws",
});

// הגדרת namespaces
setupDeviceStatusNamespace(io); // Namespace למכשירים
setupDeviceLiveStreamNamespace(io); // Namespace לפרונטנד

// ייצוא io לשימוש חיצוני
export { io };

// הפעלת השרת
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

