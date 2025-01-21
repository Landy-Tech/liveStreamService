"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDeviceLiveStreamNamespace = void 0;
const clientConnections = new Map();
const setupDeviceLiveStreamNamespace = (io) => {
    io.of('/deviceLiveStream').on('connection', (socket) => {
        console.log(`Socket connected to /deviceLiveStream: ${socket.id}`);
        socket.on('joinLiveStream', (deviceId) => {
            var _a;
            console.log(`Client ${socket.id} joined live stream for device ${deviceId}`);
            if (!clientConnections.has(deviceId)) {
                clientConnections.set(deviceId, []);
            }
            (_a = clientConnections.get(deviceId)) === null || _a === void 0 ? void 0 : _a.push(socket);
        });
        socket.on('liveImage', ({ deviceId, image }) => {
            const clients = clientConnections.get(deviceId) || [];
            clients.forEach((client) => {
                client.emit('liveImage', { image, status: 'Active' });
            });
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected from /deviceLiveStream: ${socket.id}`);
            clientConnections.forEach((clients, deviceId) => {
                const index = clients.findIndex((client) => client.id === socket.id);
                if (index !== -1) {
                    clients.splice(index, 1);
                    if (clients.length === 0) {
                        clientConnections.delete(deviceId);
                    }
                }
            });
        });
    });
};
exports.setupDeviceLiveStreamNamespace = setupDeviceLiveStreamNamespace;
//# sourceMappingURL=FrontedNamespace.js.map