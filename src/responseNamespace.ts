import { Server as SocketIOServer, Socket } from 'socket.io';

const clientConnections = new Map<string, Array<Socket>>();

export const setupDeviceLiveStreamNamespace = (io: SocketIOServer) => {
    io.of('/colorLiveStream').on('connection', (socket: Socket) => {
        console.log(`✅ Socket connected to /deviceLiveStream: ${socket.id}`);

        // הצטרפות לשידור חי
        socket.on('LiveStream', (deviceId: string) => {
            console.log(`📡 Device ${deviceId} has joined the live stream`);

            // שמירת חיבור המכשיר במפה
            if (!clientConnections.has(deviceId)) {
                clientConnections.set(deviceId, []);
            }
            clientConnections.get(deviceId)?.push(socket); // הוספת הסוקט למערך

            // שליחה חזרה של אישור
            socket.emit('status', { deviceId, status: 'Connected to live stream' });
        });

        // קבלת תוצאות ניתוח התמונות (נקי או לא נקי)
        socket.on('imageAnalysisResult', (deviceId: string, analysisResult: string) => {
            console.log(`📸 Image analysis result for Device ${deviceId}: ${analysisResult}`);

            // שליחה של התוצאה לכל המכשירים המחוברים
            const connections = clientConnections.get(deviceId);
            if (connections) {
                connections.forEach((clientSocket) => {
                    clientSocket.emit('imageStatusUpdate', {
                        deviceId,
                        status: analysisResult,
                        timestamp: new Date().toISOString(),
                    });
                });
            }
        });

        // ניתוק
        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected from /deviceLiveStream: ${socket.id}`);

            // הסרת הסוקט מהמפה
            clientConnections.forEach((sockets, deviceId) => {
                const index = sockets.indexOf(socket);
                if (index !== -1) {
                    sockets.splice(index, 1); // הסרה מהמערך
                }
                if (sockets.length === 0) {
                    clientConnections.delete(deviceId); // אם אין חיבורים נוספים, מחק את המכשיר מהמפה
                }
            });
        });
    });
};
