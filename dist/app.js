"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const liveStreamNamespace_1 = require("./liveStreamNamespace");
const FrontedNamespace_1 = require("./FrontedNamespace");
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "assets")));
app.get('/ping', (req, res) => {
    res.send('pong');
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
    path: "/ws",
});
exports.io = io;
(0, liveStreamNamespace_1.setupDeviceStatusNamespace)(io);
(0, FrontedNamespace_1.setupDeviceLiveStreamNamespace)(io);
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map