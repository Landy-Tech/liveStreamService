import { Server as SocketIOServer, Socket } from 'socket.io';

const clientConnections = new Map<string, Array<Socket>>();

export const setupDeviceLiveStreamNamespace = (io: SocketIOServer) => {
  io.of('/deviceLiveStream').on('connection', (socket: Socket) => {
    console.log(`Socket connected to /deviceLiveStream: ${socket.id}`);

    socket.on('joinLiveStream', (deviceId: string) => {
      console.log(`Client ${socket.id} joined live stream for device ${deviceId}`);
      if (!clientConnections.has(deviceId)) {
        clientConnections.set(deviceId, []);
      }
      clientConnections.get(deviceId)?.push(socket);
    });

    socket.on('liveImage', ({ deviceId, image }) => {
      console.log(`Received image from device ${deviceId}, image size: ${image.length} bytes`);
      
      if (!image || typeof image !== 'string') {
        console.error("Error: Invalid image format received");
        return;
      }

      const clients = clientConnections.get(deviceId) || [];
      clients.forEach((client) => {
        client.emit('liveImage', { image, status: 'Active' });
      });

      console.log(`Forwarded image to ${clients.length} clients`);
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
