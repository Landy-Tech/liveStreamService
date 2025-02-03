import { Server as SocketIOServer, Socket } from 'socket.io';
import axios from 'axios'; // ספרייה לביצוע קריאות HTTP

// Maps לשמירת הסטטוס והמיפוי בין סוקט למכשיר
const deviceStatusMap = new Map<string, boolean>();
const socketToDeviceMap = new Map<string, string>();

// URL של ה-API לעדכון הסטטוס
const DEVICE_API_URL = "https://api-service-hab9fmgne7dxa5ad.italynorth-01.azurewebsites.net/api/device";
// const DEVICE_API_URL = "http://localhost:8080/api/device";

export const setupDeviceStatusNamespace = (io: SocketIOServer) => {
  io.of('/deviceStatus').on('connection', (socket: Socket) => {
    console.log(`Socket connected to /deviceStatus: ${socket.id}`);

    // כאשר סוקט מחובר, עדכון סטטוס המכשיר ל-Active
    socket.on('deviceConnected', async (deviceId: string) => {
      console.log(`Device ${deviceId} connected`);
      deviceStatusMap.set(deviceId, true); // עדכון הסטטוס במפה
      socketToDeviceMap.set(socket.id, deviceId); // שמירת מיפוי בין הסוקט ל-deviceId
      await updateDeviceStatusInDB(deviceId, "Active"); // עדכון ב-DB
    
      // שליחה ללקוח על עדכון הסטטוס
      io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'Active' });
    });
    
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected from /deviceStatus: ${socket.id}`);
      const deviceId = socketToDeviceMap.get(socket.id);
      if (deviceId) {
        deviceStatusMap.set(deviceId, false); // עדכון הסטטוס במפה
        socketToDeviceMap.delete(socket.id); // הסרת המיפוי
        await updateDeviceStatusInDB(deviceId, "InActive"); // עדכון ב-DB
        console.log(`Device ${deviceId} set to InActive`);
    
        // שליחה ללקוח על עדכון הסטטוס
        io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'InActive' });
      }
    });
    
  });
};

async function updateDeviceStatusInDB(deviceId: string, status: string): Promise<void> {
  // const url = `https://api-service-hab9fmgne7dxa5ad.italynorth-01.azurewebsites.net/api/device/${deviceId}`;
  const url = `http://localhost:8080/api/device/${deviceId}`;

  try {
    console.log(url);
    console.log(status);
    const response = await axios.put(url, { status });
    console.log(`Device ${deviceId} status updated to ${status}`);
    console.log(response.data);
  } catch (error: unknown) { // הגדרת טיפוס של 'unknown' כדי לבדוק אותו
    if (error instanceof Error) { // בדיקה אם error הוא אובייקט מסוג Error
      console.error(`Failed to update device ${deviceId} status: ${error.message}`);
    } else {
      console.error(`Failed to update device ${deviceId} status: Unknown error`);
    }
  }
}

