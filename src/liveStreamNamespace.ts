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
      await updateDeviceStatusInDB(deviceId, "Active", "Clear"); // עדכון ב-DB עם סטטוס אזור "Clear"
    
      // שליחה ללקוח על עדכון הסטטוס
      io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'Active', statusArea: 'Clear' });
    });
    
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected from /deviceStatus: ${socket.id}`);
      const deviceId = socketToDeviceMap.get(socket.id);
      if (deviceId) {
        deviceStatusMap.set(deviceId, false); // עדכון הסטטוס במפה
        socketToDeviceMap.delete(socket.id); // הסרת המיפוי
        await updateDeviceStatusInDB(deviceId, "InActive", "InActive"); // עדכון ב-DB עם סטטוס אזור "InActive"
        console.log(`Device ${deviceId} set to InActive`);
    
        // שליחה ללקוח על עדכון הסטטוס
        io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'InActive', statusArea: 'InActive' });
      }
    });
    
    // עדכון סטטוס אזור לפי תמונה
    socket.on('statusAreaUpdate', async (deviceId: string, statusArea: string) => {
      console.log(`Image received for device ${deviceId}, statusArea: ${statusArea}`);
      
      if (deviceStatusMap.get(deviceId)) { // אם המכשיר פעיל
        await updateDeviceStatusInDB(deviceId, "Active", statusArea); // עדכון ב-DB עם סטטוס האזור החדש
        io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'Active', statusArea });
      } else { // אם המכשיר לא פעיל
        await updateDeviceStatusInDB(deviceId, "InActive", "InActive"); // עדכון ב-DB עם סטטוס אזור לא פעיל
        io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'InActive', statusArea: "InActive" });
      }
    });
  });
};

async function updateDeviceStatusInDB(deviceId: string, status: string, statusArea: string): Promise<void> {
  const url = `https://api-service-hab9fmgne7dxa5ad.italynorth-01.azurewebsites.net/api/device/${deviceId}`;
  // const url = `http://localhost:8080/api/device/${deviceId}`;

  try {
    console.log(url);
    console.log(status);
    console.log(statusArea);
    const response = await axios.put(url, { status, statusArea });
    console.log(`Device ${deviceId} status updated to ${status}, statusArea: ${statusArea}`);
    console.log(response.data);
  } catch (error: unknown) { // הגדרת טיפוס של 'unknown' כדי לבדוק אותו
    if (error instanceof Error) { // בדיקה אם error הוא אובייקט מסוג Error
      console.error(`Failed to update device ${deviceId} status: ${error.message}`);
    } else {
      console.error(`Failed to update device ${deviceId} status: Unknown error`);
    }
  }
}
