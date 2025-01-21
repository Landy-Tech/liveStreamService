"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDeviceStatusNamespace = void 0;
const axios_1 = __importDefault(require("axios"));
const deviceStatusMap = new Map();
const socketToDeviceMap = new Map();
const DEVICE_API_URL = "https://api-service-hab9fmgne7dxa5ad.italynorth-01.azurewebsites.net/api/device";
const setupDeviceStatusNamespace = (io) => {
    io.of('/deviceStatus').on('connection', (socket) => {
        console.log(`Socket connected to /deviceStatus: ${socket.id}`);
        socket.on('deviceConnected', (deviceId) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Device ${deviceId} connected`);
            deviceStatusMap.set(deviceId, true);
            socketToDeviceMap.set(socket.id, deviceId);
            yield updateDeviceStatusInDB(deviceId, "Active");
            io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'Active' });
        }));
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Socket disconnected from /deviceStatus: ${socket.id}`);
            const deviceId = socketToDeviceMap.get(socket.id);
            if (deviceId) {
                deviceStatusMap.set(deviceId, false);
                socketToDeviceMap.delete(socket.id);
                yield updateDeviceStatusInDB(deviceId, "InActive");
                console.log(`Device ${deviceId} set to InActive`);
                io.of('/deviceStatus').emit('statusUpdate', { _id: deviceId, status: 'InActive' });
            }
        }));
    });
};
exports.setupDeviceStatusNamespace = setupDeviceStatusNamespace;
function updateDeviceStatusInDB(deviceId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api-service-hab9fmgne7dxa5ad.italynorth-01.azurewebsites.net/api/device/${deviceId}`;
        try {
            console.log(url);
            console.log(status);
            const response = yield axios_1.default.put(url, { status });
            console.log(`Device ${deviceId} status updated to ${status}`);
            console.log(response.data);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Failed to update device ${deviceId} status: ${error.message}`);
            }
            else {
                console.error(`Failed to update device ${deviceId} status: Unknown error`);
            }
        }
    });
}
//# sourceMappingURL=liveStreamNamespace.js.map